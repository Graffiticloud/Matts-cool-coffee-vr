/* Quiz scores receiver and research exporter (Google Apps Script for the "XR diorama scores" Sheet).
   Every answer, completed attempt and branching-scenario decision from any model is appended as a row.
   Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.

   Research export (optional): Project Settings → Script properties, add
     WORKER_URL        https://xr-diorama.matthew-frew.workers.dev
     EXPORT_TOKEN      the same phrase you saved as the Worker's EXPORT_TOKEN secret
     EXPORT_FOLDER_ID  the Drive folder that receives the daily files
   then run setupResearchExport once. Each night it copies the previous day's research files from
   Cloudflare into a dated subfolder: events.jsonl, transcripts.jsonl and the audio segments. */

/* The score sheet. Works whether this script is bound to the Sheet or stands alone. */
const SHEET_ID = '1f8t2lvh2U-FaR6K2pvGdkbYqXa0ztMIdNieCxXRAxbc';
const book_ = () => SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SHEET_ID);

const ANSWERS = 'Answers', ATTEMPTS = 'Attempts', DECISIONS = 'Decisions', SUMMARY = 'Summary', KEYS = 'Keys';
const DECISION_HEAD = ['Received', 'Student number', 'Model', 'Module', 'Scenario', 'Step', 'Choice', 'Best choice', 'Seconds to decide', 'Path so far'];
const SID_RE = /^[A-Z]?\d{6,9}$/;

function doPost(e){
  const lock = LockService.getScriptLock();
  try{
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    const sid = String(d.student || '').toUpperCase().trim();
    if(!SID_RE.test(sid)) return text_('ignored');
    const ss = book_();
    const ts = new Date();
    if(d.type === 'answer'){
      sheet_(ss, ANSWERS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Hotspot', 'Question', 'Chosen answer', 'Correct', 'Answered so far', 'Score so far', 'Total'])
        .appendRow([ts, sid, clip_(d.model), clip_(d.module), num_(d.attempt), clip_(d.hotspot), clip_(d.question), clip_(d.chosen, 300), d.correct === true, num_(d.answered), num_(d.score), num_(d.total)]);
    } else if(d.type === 'complete'){
      sheet_(ss, ATTEMPTS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Score', 'Total', 'Percent', 'Time taken (s)'])
        .appendRow([ts, sid, clip_(d.model), clip_(d.module), num_(d.attempt), num_(d.score), num_(d.total), num_(d.percent), num_(d.seconds)]);
    } else if(d.type === 'decision'){
      sheet_(ss, DECISIONS, DECISION_HEAD)
        .appendRow([ts, sid, clip_(d.model), clip_(d.module), clip_(d.scenario), clip_(d.step), clip_(d.choice, 300), d.best === true, num_(d.seconds), clip_(d.path, 300)]);
    }
    return text_('ok');
  }catch(err){
    return text_('error');
  }finally{
    lock.releaseLock();
  }
}

/* GET ?keys=1&token=<EXPORT_TOKEN>: the answer keys for the Worker's marking (from the Keys tab). Anything else: a status line. */
function doGet(e){
  const p = (e && e.parameter) || {};
  if(!p.keys) return text_('Scores endpoint is running.');
  const token = PropertiesService.getScriptProperties().getProperty('EXPORT_TOKEN');
  if(!token || p.token !== token) return json_({ error:'forbidden' });
  const s = book_().getSheetByName(KEYS);
  if(!s) return json_({ error:'no keys tab' });
  const out = {};
  s.getDataRange().getValues().slice(1).forEach(r => {
    const [model, question, answer, explain, ref] = r;
    if(!model || !question || answer === '') return;
    (out[model] = out[model] || {})[question] = { answer:Number(answer), explain:String(explain || ''), ref:String(ref || '') };
  });
  return json_(out);
}
function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* Run once from the editor (select setup, press Run) to create the tabs and the summary. */
function setup(){
  const ss = book_();
  sheet_(ss, ANSWERS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Hotspot', 'Question', 'Chosen answer', 'Correct', 'Answered so far', 'Score so far', 'Total']);
  sheet_(ss, ATTEMPTS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Score', 'Total', 'Percent', 'Time taken (s)']);
  sheet_(ss, DECISIONS, DECISION_HEAD);
  const s = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  s.clear();
  s.getRange('A1').setFormula("=IFERROR(QUERY(Attempts!B:H,\"select B, C, max(H), count(H), avg(H) where B is not null group by B, C order by B label B 'Student number', C 'Model', max(H) 'Best %', count(H) 'Attempts', avg(H) 'Average %'\",1),\"No completed attempts yet\")");
  s.setFrozenRows(1);
}

/* ---------- research export ---------- */

/* Run once after setting the script properties: installs a nightly trigger (about 02:00). */
function setupResearchExport(){
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'exportResearch').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('exportResearch').timeBased().everyDays(1).atHour(2).create();
  exportResearch();
}

/* Copies one day's research files (default: yesterday, UTC) from the Worker into Drive. */
function exportResearch(dateStr){
  const p = PropertiesService.getScriptProperties();
  const base = (p.getProperty('WORKER_URL') || '').replace(/\/$/, ''), token = p.getProperty('EXPORT_TOKEN'), folderId = p.getProperty('EXPORT_FOLDER_ID');
  if(!base || !token || !folderId) throw new Error('Set WORKER_URL, EXPORT_TOKEN and EXPORT_FOLDER_ID in Script properties first.');
  const date = (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) ? dateStr
    : Utilities.formatDate(new Date(Date.now() - 864e5), 'UTC', 'yyyy-MM-dd');
  const head = { 'X-Export-Token': token };
  const list = JSON.parse(UrlFetchApp.fetch(base + '/export?date=' + date, { headers:head, muteHttpExceptions:false }).getContentText());
  if(!list.files || !list.files.length) return 'No research files for ' + date;
  const root = DriveApp.getFolderById(folderId);
  const it = root.getFoldersByName(date);
  if(it.hasNext()) return 'Already exported ' + date;
  const day = root.createFolder(date);
  const events = [], transcripts = [];
  list.files.forEach(f => {
    const r = UrlFetchApp.fetch(base + '/export/file?key=' + encodeURIComponent(f.key), { headers:head, muteHttpExceptions:true });
    if(r.getResponseCode() !== 200) return;
    const name = f.key.split('/').slice(2).join('_');
    if(/\/events-[^/]+\.json$/.test(f.key)){
      const o = JSON.parse(r.getContentText());
      (o.events || []).forEach(ev => events.push(JSON.stringify(Object.assign({ session:o.session, manifest:undefined }, ev))));
      if(o.manifest) events.push(JSON.stringify({ session:o.session, type:'manifest', manifest:o.manifest, received:o.received }));
    } else if(/\/audio-[^/]+\.json$/.test(f.key)){
      transcripts.push(r.getContentText());
    } else {
      day.createFile(r.getBlob().setName(name));
    }
  });
  if(events.length) day.createFile('events.jsonl', events.join('\n') + '\n', 'application/x-ndjson');
  if(transcripts.length) day.createFile('transcripts.jsonl', transcripts.join('\n') + '\n', 'application/x-ndjson');
  return 'Exported ' + list.files.length + ' files for ' + date;
}

function sheet_(ss, name, header){
  let s = ss.getSheetByName(name);
  if(!s){ s = ss.insertSheet(name); s.appendRow(header); s.setFrozenRows(1); s.getRange(1, 1, 1, header.length).setFontWeight('bold'); }
  return s;
}
function clip_(v, n){ return String(v == null ? '' : v).slice(0, n || 120); }
function num_(v){ const n = Number(v); return isFinite(n) ? n : ''; }
function text_(t){ return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }
