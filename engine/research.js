/* Metnography research capture (opt-in).
   Switched on only when the page is opened with ?study=CODE and CONFIG.researchUrl is set, and only after
   the participant ticks the consent box. Captures what the space contained (a manifest) and what people did
   in it: hotspots, questions and response times, decisions, tutor use, views, XR sessions, video, and,
   with a separate tick, audio of the group's discussion in one-minute segments (transcribed by the Worker).
   No look tracking. The participant is identified only by a one-way hash of their student number and the study code. */

const FLUSH_MS = 15000, FLUSH_N = 25, SEGMENT_MS = 60000;

export function createResearch({ spec, config }){
  const params = new URLSearchParams(location.search);
  const study = (params.get('study') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  const base = (config.researchUrl || '').replace(/\/$/, '');
  const r = {
    requested:!!study && !!base, active:false, audio:false, study,
    session:(crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2)).replace(/-/g, ''),
    pid:'', t0:performance.now(), queue:[], seq:0, recorder:null, stream:null, onAudio:null
  };

  r.log = (type, data = {}) => {
    if(!r.active) return;
    r.queue.push({ type, t:Math.round(performance.now() - r.t0), at:new Date().toISOString(), ...data });
    if(r.queue.length >= FLUSH_N) r.flush();
  };

  r.flush = (beacon = false) => {
    if(!r.active || !r.queue.length) return;
    const body = JSON.stringify({ session:r.session, study:r.study, pid:r.pid, model:spec.id, events:r.queue.splice(0) });
    const blob = new Blob([body], { type:'text/plain;charset=utf-8' });
    if(beacon && navigator.sendBeacon?.(base + '/log', blob)) return;
    fetch(base + '/log', { method:'POST', body:blob, keepalive:body.length < 60000, headers:{ 'Content-Type':'text/plain;charset=utf-8' } }).catch(() => {});
  };

  r.setParticipant = async student => {
    if(!student || !crypto?.subtle) return;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(student.toUpperCase() + '|study|' + r.study));
    r.pid = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
    r.log('participant', { pid:r.pid });
  };

  /* what the environment contained, so later analysis can read events against the space */
  function manifest(){
    return {
      model:spec.id, title:spec.title, subtitle:spec.subtitle, module:spec.moduleCode || spec.module, type:spec.type || 'diorama',
      hotspots:(spec.hotspots || []).map(h => ({ id:h.id, n:h.n, title:h.title, concept:h.concept, pos:h.pos, px:h.px, video:!!h.video, scenario:h.scenario || null })),
      questions:(spec.questions || []).map(q => ({ id:q.id, hotspot:q.hotspot, q:q.q, options:q.options, answer:q.answer })),
      scenarios:(spec.scenarios || []).map(s => ({ id:s.id, title:s.title, steps:Object.keys(s.steps || {}) })),
      views:(spec.views || []).map(v => v.name), intro:!!spec.intro, panoVideo:!!spec.pano?.video,
      client:{ ua:navigator.userAgent, lang:navigator.language, w:innerWidth, h:innerHeight, dpr:devicePixelRatio, xr:!!navigator.xr },
      url:location.origin + location.pathname, study:r.study
    };
  }

  r.start = ({ audio }) => {
    r.active = true; r.audio = !!audio;
    r.log('manifest', { manifest:manifest(), consent:{ participate:true, audio:r.audio } });
    r.flush();
    setInterval(() => r.flush(), FLUSH_MS);
    addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden'){ r.log('page_hidden'); r.flush(true); } else r.log('page_visible'); });
    addEventListener('pagehide', () => { r.log('page_exit'); r.flush(true); });
    if(r.audio) r.startAudio();
  };

  /* audio: separate one-minute files, each playable on its own, uploaded as they finish */
  r.startAudio = async () => {
    if(!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia){ r.log('audio_unavailable'); return false; }
    try{
      r.stream = await navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true, channelCount:1 } });
    }catch(err){ r.log('audio_denied', { error:String(err.name || err) }); r.audio = false; r.onAudio?.(false); return false; }
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(m => MediaRecorder.isTypeSupported?.(m)) || '';
    const segment = () => {
      if(!r.stream) return;
      const rec = new MediaRecorder(r.stream, mime ? { mimeType:mime, audioBitsPerSecond:32000 } : {});
      const chunks = [], seq = ++r.seq, started = Math.round(performance.now() - r.t0);
      rec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type:rec.mimeType || 'audio/webm' });
        if(blob.size > 1000){
          fetch(`${base}/audio?session=${r.session}&seq=${String(seq).padStart(4, '0')}`, { method:'POST', body:blob, headers:{ 'Content-Type':blob.type } }).catch(() => {});
          r.log('audio_segment', { seq, start:started, end:Math.round(performance.now() - r.t0), bytes:blob.size });
        }
        if(r.recorder === rec) segment();
      };
      r.recorder = rec; rec.start();
      setTimeout(() => { if(rec.state === 'recording') rec.stop(); }, SEGMENT_MS);
    };
    r.log('audio_start', { mime });
    segment(); r.onAudio?.(true);
    return true;
  };
  r.stopAudio = () => {
    const rec = r.recorder; r.recorder = null;
    if(rec?.state === 'recording') rec.stop();
    r.stream?.getTracks().forEach(t => t.stop()); r.stream = null;
    r.audio = false; r.log('audio_stop'); r.onAudio?.(false);
  };

  return r;
}
