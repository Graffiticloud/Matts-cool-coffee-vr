/* Quiz scores receiver (Google Apps Script, bound to a Google Sheet in your UWS Drive).
   Every answer and every completed attempt from any model is appended as a row.
   Deploy: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone. */

const ANSWERS = 'Answers', ATTEMPTS = 'Attempts', SUMMARY = 'Summary';
const SID_RE = /^[A-Z]?\d{6,9}$/;

function doPost(e){
  const lock = LockService.getScriptLock();
  try{
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    const sid = String(d.student || '').toUpperCase().trim();
    if(!SID_RE.test(sid)) return text_('ignored');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ts = new Date();
    if(d.type === 'answer'){
      sheet_(ss, ANSWERS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Hotspot', 'Question', 'Chosen answer', 'Correct', 'Answered so far', 'Score so far', 'Total'])
        .appendRow([ts, sid, clip_(d.model), clip_(d.module), num_(d.attempt), clip_(d.hotspot), clip_(d.question), clip_(d.chosen, 300), d.correct === true, num_(d.answered), num_(d.score), num_(d.total)]);
    } else if(d.type === 'complete'){
      sheet_(ss, ATTEMPTS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Score', 'Total', 'Percent', 'Time taken (s)'])
        .appendRow([ts, sid, clip_(d.model), clip_(d.module), num_(d.attempt), num_(d.score), num_(d.total), num_(d.percent), num_(d.seconds)]);
    }
    return text_('ok');
  }catch(err){
    return text_('error');
  }finally{
    lock.releaseLock();
  }
}

function doGet(){ return text_('Scores endpoint is running.'); }

/* Run once from the editor (select setup, press Run) to create the tabs and the summary. */
function setup(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet_(ss, ANSWERS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Hotspot', 'Question', 'Chosen answer', 'Correct', 'Answered so far', 'Score so far', 'Total']);
  sheet_(ss, ATTEMPTS, ['Received', 'Student number', 'Model', 'Module', 'Attempt', 'Score', 'Total', 'Percent', 'Time taken (s)']);
  const s = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  s.clear();
  s.getRange('A1').setFormula("=IFERROR(QUERY(Attempts!B:H,\"select B, C, max(H), count(H), avg(H) where B is not null group by B, C order by B label B 'Student number', C 'Model', max(H) 'Best %', count(H) 'Attempts', avg(H) 'Average %'\",1),\"No completed attempts yet\")");
  s.setFrozenRows(1);
}

function sheet_(ss, name, header){
  let s = ss.getSheetByName(name);
  if(!s){ s = ss.insertSheet(name); s.appendRow(header); s.setFrozenRows(1); s.getRange(1, 1, 1, header.length).setFontWeight('bold'); }
  return s;
}
function clip_(v, n){ return String(v == null ? '' : v).slice(0, n || 120); }
function num_(v){ const n = Number(v); return isFinite(n) ? n : ''; }
function text_(t){ return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }
