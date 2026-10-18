/* XR Diorama runtime: renderer, desktop camera, WebXR (VR + mixed reality), views, grab/zoom,
   build-in + static merge, hotspot pins, quiz with scoring, AI tutor, HTML UI and in-headset panels. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Kit, TAU, LOOP, clamp, easeOutBack, easeOutCubic } from './kit.js';
import { CONFIG } from './config.js';

const SID_RE = /^[A-Za-z]?\d{6,9}$/;

/* ================================================================ styles + DOM */
const CSS = `
:root{--ground:#eeeae2;--ink:#14204a;--ink-soft:#4b5679;--royal:#2b4fd8;--teal:#17a3a0;--green:#3c9e4f;--orange:#ff6a13;--yellow:#f6c42a;
--ok:#2f8a45;--bad:#c2410c;--glass:rgba(255,255,255,.56);--glass-edge:rgba(255,255,255,.85);--card:#fffdf9;--line:#e6e0d4;
--display:"Bricolage Grotesque","Avenir Next","Segoe UI",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;color-scheme:light}
[hidden]{display:none!important}
html,body{height:100%;margin:0;overflow:hidden;background:var(--ground);color:var(--ink);font-family:var(--display)}
canvas.xr-canvas{display:block;position:fixed;inset:0;width:100%;height:100%;touch-action:none}
.glass{background:var(--glass);-webkit-backdrop-filter:blur(22px) saturate(1.5);backdrop-filter:blur(22px) saturate(1.5);border:1px solid var(--glass-edge);box-shadow:0 24px 60px -30px rgba(20,32,74,.35),inset 0 1px 0 rgba(255,255,255,.9)}
.hud{position:fixed;top:max(16px,env(safe-area-inset-top,0px));left:max(16px,env(safe-area-inset-left,0px));width:min(420px,calc(100vw - 32px));box-sizing:border-box;padding:18px 20px 18px;border-radius:24px;display:flex;flex-direction:column;gap:10px;z-index:2}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:7px;padding:5px 11px 5px 9px;border-radius:999px;background:rgba(255,106,19,.12);color:#c94a05;font:700 12px/1 var(--display);letter-spacing:.13em;text-transform:uppercase}
.pill i{width:8px;height:8px;border-radius:50%;background:var(--orange)}
.pill.paused{background:rgba(43,79,216,.12);color:var(--royal)}.pill.paused i{background:var(--royal)}
.chip{font:500 13px/1 var(--mono);color:var(--ink-soft);background:rgba(255,255,255,.7);border:0;border-radius:999px;padding:7px 11px;cursor:pointer}
.chip:hover{background:#fff}
.hud h1{margin:0;font:800 clamp(22px,4vw,28px)/1.05 var(--display);letter-spacing:-.025em;text-wrap:balance}
.hud h1 span{font-weight:500;color:var(--royal)}
.module{margin:0;font:600 13px/1.35 var(--display);color:var(--ink-soft)}
.prog{height:8px;border-radius:8px;background:rgba(20,32,74,.1);overflow:hidden}
.prog b{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--royal),var(--teal));transition:width .4s}
.stats{font:500 13px/1.4 var(--display);color:var(--ink);font-variant-numeric:tabular-nums}
.stats strong{font-family:var(--mono);font-weight:600}
.btns{display:flex;flex-wrap:wrap;gap:8px}
button{appearance:none;border:0;cursor:pointer;font:700 14px/1 var(--display);padding:11px 16px;border-radius:999px;background:rgba(255,255,255,.75);color:var(--ink);transition:transform .15s,background .15s}
button:hover{background:#fff}button:active{transform:scale(.97)}
button:focus-visible,input:focus-visible,.opt:focus-visible{outline:3px solid var(--royal);outline-offset:2px}
button.primary{background:var(--royal);color:#fff}button.primary:hover{background:#2343b8}
button.mr{background:var(--orange);color:#fff}button.mr:hover{background:#e85d0c}
button[disabled]{opacity:.5;cursor:default}
.dock{position:fixed;left:50%;transform:translateX(-50%);bottom:max(16px,env(safe-area-inset-bottom,0px));width:max-content;max-width:calc(100vw - 32px);display:flex;flex-direction:column;align-items:center;gap:9px;z-index:2}
.dock .bar{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:8px;border-radius:999px}
.hint{font:500 13px/1.4 var(--display);color:var(--ink-soft);text-align:center;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.6)}
.scrim{position:fixed;inset:0;display:grid;place-items:center;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:16px;background:rgba(20,32,74,.18);z-index:5}
.card{width:min(560px,100%);max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box;background:var(--card);border-radius:26px;padding:26px 26px 22px;box-shadow:0 30px 80px -30px rgba(20,32,74,.5);display:flex;flex-direction:column;gap:14px}
.eyebrow{font:700 12px/1 var(--display);letter-spacing:.13em;text-transform:uppercase;color:var(--teal)}
.card h2{margin:0;font:700 clamp(19px,3.4vw,23px)/1.25 var(--display);letter-spacing:-.01em;text-wrap:balance}
.card p{margin:0;font:400 15px/1.55 var(--display);color:var(--ink-soft);max-width:65ch}
.opts{display:flex;flex-direction:column;gap:9px}
.opt{display:flex;gap:12px;align-items:flex-start;text-align:left;font:500 15px/1.4 var(--display);padding:13px 15px;border-radius:16px;background:#f3f0e9;border:2px solid transparent;color:var(--ink);cursor:pointer;width:100%}
.opt:hover:not([disabled]){border-color:var(--royal);background:#fff}
.opt .k{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#fff;font:700 12px/1 var(--mono);color:var(--royal)}
.opt.right{border-color:var(--ok);background:#ecf7ef}.opt.right .k{background:var(--ok);color:#fff}
.opt.wrong{border-color:var(--bad);background:#fdf0e8}.opt.wrong .k{background:var(--bad);color:#fff}
.opt[disabled]{cursor:default;opacity:1}
.fb{border-radius:16px;padding:14px 16px;background:#f3f0e9;display:flex;flex-direction:column;gap:7px}
.fb strong{font:700 15px/1 var(--display)}.fb.ok strong{color:var(--ok)}.fb.bad strong{color:var(--bad)}
.fb .ref{font:500 12.5px/1.45 var(--display);color:var(--ink-soft)}
.actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.actions button{background:#f3f0e9}.actions button.primary{background:var(--royal)}
label{font:700 13px/1 var(--display)}
input[type=text]{font:500 17px/1 var(--mono);padding:13px 14px;border-radius:14px;border:2px solid var(--line);background:#fff;color:var(--ink);width:100%;box-sizing:border-box;letter-spacing:.04em}
.err{font:600 13px/1.3 var(--display);color:var(--bad);min-height:1em}
.big{font:800 46px/1 var(--mono);color:var(--royal);font-variant-numeric:tabular-nums}
.tutor{position:fixed;top:max(16px,env(safe-area-inset-top,0px));right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));width:min(400px,calc(100vw - 32px));box-sizing:border-box;border-radius:24px;background:var(--card);box-shadow:0 30px 80px -30px rgba(20,32,74,.5);display:flex;flex-direction:column;z-index:4;overflow:hidden}
.tutor header{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 12px 20px;border-bottom:1px solid var(--line)}
.tutor header h3{margin:0;font:800 18px/1 var(--display)}
.msgs{flex:1;min-height:0;overflow:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:88%;padding:11px 14px;border-radius:16px;font:400 14.5px/1.5 var(--display);white-space:pre-wrap;overflow-wrap:anywhere}
.msg.user{align-self:flex-end;background:var(--royal);color:#fff;border-bottom-right-radius:6px}
.msg.assistant{align-self:flex-start;background:#f3f0e9;border-bottom-left-radius:6px}
.msg.note{align-self:center;background:transparent;color:var(--ink-soft);font-size:13px;text-align:center}
.sugg{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}
.sugg button{font:600 13px/1.2 var(--display);padding:8px 12px;background:#f3f0e9}
.tutor form{display:flex;gap:8px;padding:12px 14px 14px;border-top:1px solid var(--line)}
.tutor form input{font-family:var(--display);letter-spacing:0;font-size:15px}
.disclaim{padding:0 18px 12px;font:500 11.5px/1.4 var(--display);color:var(--ink-soft)}
@media (max-width:640px){.scrim{place-items:end center}.card{border-radius:24px 24px 18px 18px}.hud{padding:14px 16px}.hud .module{display:none}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;

function el(tag, attrs = {}, ...kids){
  const e = document.createElement(tag);
  for(const [k, v] of Object.entries(attrs)){
    if(k === 'class') e.className = v; else if(k === 'text') e.textContent = v;
    else if(k.startsWith('on')) e.addEventListener(k.slice(2), v); else if(v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for(const k of kids) if(k != null) e.append(k);
  return e;
}

/* ================================================================ in-headset canvas panels */
class Panel {
  constructor(wPx, hPx, wM){
    this.W = wPx; this.H = hPx;
    this.c = document.createElement('canvas'); this.c.width = wPx; this.c.height = hPx;
    this.ctx = this.c.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.c); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(wM, wM * hPx / wPx),
      new THREE.MeshBasicMaterial({ map:this.tex, transparent:true, depthTest:false, toneMapped:false }));
    this.mesh.renderOrder = 999; this.mesh.visible = false; this.mesh.userData.panel = this;
    this.buttons = []; this.hover = null; this.dirty = true; this.draw = () => {}; this.onClick = () => {};
  }
  rr(x, y, w, h, r){ this.ctx.beginPath(); this.ctx.roundRect(x, y, w, h, r); }
  bg(){ const c = this.ctx; c.clearRect(0, 0, this.W, this.H); this.rr(6, 6, this.W - 12, this.H - 12, 48); c.fillStyle = 'rgba(255,253,249,0.95)'; c.fill(); this.buttons = []; }
  text(t, x, y, { size = 30, weight = 500, color = '#14204a', font = 'display', align = 'left', base = 'alphabetic', max } = {}){
    const c = this.ctx; c.font = `${weight} ${size}px ${font === 'mono' ? '"IBM Plex Mono", monospace' : '"Bricolage Grotesque", system-ui, sans-serif'}`;
    c.fillStyle = color; c.textAlign = align; c.textBaseline = base; c.fillText(t, x, y, max);
  }
  wrap(t, maxW, size = 30, weight = 500){
    const c = this.ctx; c.font = `${weight} ${size}px "Bricolage Grotesque", system-ui, sans-serif`;
    const out = [];
    for(const para of String(t).split('\n')){
      let line = '';
      for(const w of para.split(/\s+/)){ const test = line ? line + ' ' + w : w; if(c.measureText(test).width > maxW && line){ out.push(line); line = w; } else line = test; }
      out.push(line);
    }
    return out;
  }
  para(t, x, y, maxW, { size = 30, weight = 500, color = '#14204a', lh = 1.35, maxLines = 99 } = {}){
    const lines = this.wrap(t, maxW, size, weight).slice(0, maxLines);
    lines.forEach((l, i) => this.text(l, x, y + i * size * lh, { size, weight, color }));
    return y + lines.length * size * lh;
  }
  button(id, x, y, w, h, label, { fill = '#f3f0e9', color = '#14204a', size = 28, weight = 700, stroke } = {}){
    this.rr(x, y, w, h, Math.min(28, h / 2));
    this.ctx.fillStyle = this.hover === id ? (fill === '#f3f0e9' ? '#ffffff' : fill) : fill; this.ctx.fill();
    if(this.hover === id || stroke){ this.ctx.lineWidth = 5; this.ctx.strokeStyle = stroke || '#2b4fd8'; this.ctx.stroke(); }
    const lines = this.wrap(label, w - 40, size, weight).slice(0, 3);
    const lh = size * 1.25, top = y + h / 2 - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => this.text(l, x + w / 2, top + i * lh, { size, weight, color, align:'center', base:'middle' }));
    this.buttons.push({ id, x, y, w, h });
  }
  hit(uv){ const x = uv.x * this.W, y = (1 - uv.y) * this.H; return this.buttons.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)?.id ?? null; }
  redraw(){ this.draw(this); this.tex.needsUpdate = true; this.dirty = false; }
}

/* ================================================================ the app */
export function createApp({ spec, build }){
  document.head.append(el('style', { text:CSS }));
  const BG = spec.background ?? 0xeeeae2;
  const H = spec.hotspots, Qs = spec.questions;
  const store = {
    get(k, d){ try{ const v = localStorage.getItem(spec.id + ':' + k); return v == null ? d : JSON.parse(v); }catch{ return d; } },
    set(k, v){ try{ localStorage.setItem(spec.id + ':' + k, JSON.stringify(v)); }catch{} }
  };

  /* ---------- renderer / scene ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
  const DPR = Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = spec.exposure ?? 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor');
  renderer.domElement.className = 'xr-canvas';
  document.body.prepend(renderer.domElement);

  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG);
  const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.5, 600);
  const target = new THREE.Vector3(...(spec.target || [0, 1.4, 0]));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cfbf, spec.hemi ?? 1.55));

  const model = new THREE.Group(); scene.add(model);
  const sun = new THREE.DirectionalLight(0xfff4e6, spec.sun ?? 3.1);
  sun.position.set(...(spec.sunPos || [-9, 22, 12])); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.radius = 4;
  model.add(sun); model.add(sun.target);
  const SH = spec.shadowHalf ?? 17;
  function syncShadow(){
    const s = model.scale.x, cam = sun.shadow.camera;
    cam.left = -SH * s; cam.right = SH * s; cam.top = SH * s; cam.bottom = -SH * s; cam.near = s; cam.far = 80 * s; cam.updateProjectionMatrix();
    sun.shadow.normalBias = 0.025 * s;
  }
  syncShadow();
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ color:0x5a4c38, opacity:0.16 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = spec.catcherY ?? -5.5; catcher.receiveShadow = true; model.add(catcher);

  const floor = new THREE.Group(); floor.visible = false; scene.add(floor);
  {
    const f = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color:0xe6e1d7, roughness:0.95 }));
    f.rotation.x = -Math.PI / 2; floor.add(f);
    for(const r of [1.5, 3.5, 6.5, 10]){
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.012, r + 0.012, 96), new THREE.MeshBasicMaterial({ color:0xd2cbbd }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; floor.add(ring);
    }
  }
  const world = new THREE.Group(); model.add(world);

  /* ---------- the model's own scene ---------- */
  const kit = new Kit(world, { palette:spec.palette, seed:spec.seed ?? 7, ground:spec.ground ?? 0.16 });
  build(kit, THREE);

  /* ---------- quiz state ---------- */
  let student = store.get('student', '');
  const newAttempt = n => ({ n, started:Date.now(), answers:{}, order:Object.fromEntries(Qs.map(q => [q.id, shuffle(q.options.map((_, i) => i))])) });
  function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  let attempt = store.get('attempt', null);
  if(!attempt || !attempt.order || Qs.some(q => !attempt.order[q.id])) attempt = newAttempt((attempt?.n || 0) + 1);
  let best = store.get('best', null);
  let open = null; // { qid } or { done:true }
  const saveAttempt = () => store.set('attempt', attempt);
  const qById = id => Qs.find(q => q.id === id);
  const hById = id => H.find(h => h.id === id);
  const answeredCount = () => Object.keys(attempt.answers).length;
  const correctCount = () => Object.values(attempt.answers).filter(a => a.correct).length;
  const hotspotDone = h => Qs.filter(q => q.hotspot === h).every(q => attempt.answers[q.id]);
  const complete = () => answeredCount() === Qs.length;

  function post(payload){
    if(!CONFIG.scoresUrl || !student) return;
    const body = JSON.stringify({ ...payload, student, model:spec.id, module:spec.moduleCode || spec.module, ts:new Date().toISOString() });
    try{ fetch(CONFIG.scoresUrl, { method:'POST', mode:'no-cors', keepalive:true, headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body }); }
    catch{ try{ navigator.sendBeacon?.(CONFIG.scoresUrl, new Blob([body], { type:'text/plain' })); }catch{} }
  }
  function openHotspot(hid){
    if(!student){ askStudent(() => openHotspot(hid)); return; }
    if(complete()){ open = { done:true }; refresh(); return; }
    const qs = Qs.filter(q => q.hotspot === hid);
    const next = qs.find(q => !attempt.answers[q.id]) || qs[qs.length - 1];
    open = { qid:next.id }; refresh();
  }
  function answer(displayIdx){
    const q = qById(open?.qid); if(!q || attempt.answers[q.id]) return;
    const orig = attempt.order[q.id][displayIdx], correct = orig === q.answer;
    attempt.answers[q.id] = { chosen:orig, correct };
    saveAttempt();
    post({ type:'answer', attempt:attempt.n, hotspot:q.hotspot, question:q.id, chosen:q.options[orig], correct, answered:answeredCount(), score:correctCount(), total:Qs.length });
    if(complete()){
      const score = correctCount(), pct = Math.round(score / Qs.length * 100);
      if(!best || pct > best.pct){ best = { pct, score, n:attempt.n }; store.set('best', best); }
      post({ type:'complete', attempt:attempt.n, score, total:Qs.length, percent:pct, seconds:Math.round((Date.now() - attempt.started) / 1000) });
    }
    refresh();
  }
  function nextQuestion(){
    const q = qById(open?.qid); if(!q){ closeQuiz(); return; }
    if(complete()){ open = { done:true }; refresh(); return; }
    const nq = Qs.find(x => x.hotspot === q.hotspot && !attempt.answers[x.id]);
    if(nq){ open = { qid:nq.id }; refresh(); return; }
    closeQuiz();
  }
  function closeQuiz(){ open = null; refresh(); }
  function restart(){ attempt = newAttempt(attempt.n + 1); saveAttempt(); open = null; refresh(); }

  /* ---------- tutor ---------- */
  const tutor = { msgs:[], busy:false, open:false, page:0 };
  let sidHash = '';
  async function hashSid(){
    if(!student || !crypto?.subtle){ sidHash = ''; return; }
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(student.toUpperCase() + '|' + spec.id));
    sidHash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  hashSid();
  function tutorContext(){
    const lines = [spec.tutor.brief];
    const q = qById(open?.qid) || qById(lastQid);
    if(q){
      const h = hById(q.hotspot), a = attempt.answers[q.id];
      lines.push(`The student is looking at hotspot "${h.title}": ${h.blurb}`);
      lines.push(`Current quiz question: ${q.q}`);
      lines.push('Options: ' + q.options.map((o, i) => `(${i + 1}) ${o}`).join(' '));
      if(a) lines.push(`The student chose "${q.options[a.chosen]}", which is ${a.correct ? 'correct' : 'incorrect'}. The correct answer is "${q.options[q.answer]}". Teaching note: ${q.explain}`);
      else lines.push('The student has NOT answered this question yet. Do not reveal or confirm the correct option; give a hint or ask a guiding question instead.');
    }
    return lines.join('\n').slice(0, 3500);
  }
  let lastQid = null;
  function suggestions(){
    const q = qById(open?.qid) || qById(lastQid), out = [];
    if(q){
      const a = attempt.answers[q.id], h = hById(q.hotspot);
      if(a && !a.correct) out.push('Why was my answer wrong?');
      else if(!a) out.push('Give me a hint for this question');
      out.push(`Explain ${h.concept} in simple terms`);
      out.push(`Give me a real-world example of ${h.concept}`);
    }
    for(const s of spec.tutor.suggestions || []) if(out.length < 4) out.push(s);
    return out.slice(0, 4);
  }
  async function askTutor(text){
    text = String(text || '').trim(); if(!text || tutor.busy) return;
    if(!student){ askStudent(() => askTutor(text)); return; }
    tutor.msgs.push({ role:'user', content:text }); tutor.busy = true; tutor.page = 0; refresh();
    if(!CONFIG.tutorUrl){
      tutor.msgs.push({ role:'note', content:'The tutor is not switched on yet. Your lecturer needs to add its address to the configuration.' });
      tutor.busy = false; refresh(); return;
    }
    try{
      const res = await fetch(CONFIG.tutorUrl, { method:'POST', headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ model:spec.id, sid:sidHash, context:tutorContext(),
          messages:tutor.msgs.filter(m => m.role !== 'note').slice(-8) }) });
      const data = await res.json().catch(() => ({}));
      if(!res.ok) throw new Error(data.error || `The tutor replied with an error (${res.status}).`);
      tutor.msgs.push({ role:'assistant', content:data.answer || 'No answer came back. Try asking again.' });
    }catch(err){
      tutor.msgs.push({ role:'note', content:(err.message || 'Could not reach the tutor.') + ' Check your connection and try again.' });
    }
    tutor.busy = false; tutor.page = 0; refresh();
  }

  /* ---------- HTML UI ---------- */
  const ui = {};
  ui.pill = el('span', { class:'pill' }, el('i'), el('b', { text:'Live' }));
  ui.sid = el('button', { class:'chip', type:'button', onclick:() => askStudent() });
  ui.bar = el('b'); ui.stats = el('div', { class:'stats' });
  ui.hud = el('div', { class:'hud glass', 'aria-live':'polite' },
    el('div', { class:'row' }, ui.pill, ui.sid),
    el('h1', {}, spec.title + ' ', el('span', { text:'· ' + spec.subtitle })),
    el('p', { class:'module', text:spec.module }),
    el('div', { class:'prog' }, ui.bar), ui.stats,
    el('div', { class:'btns' },
      el('button', { type:'button', class:'primary', onclick:() => toggleTutor(true) , text:'Ask the tutor' }),
      el('button', { type:'button', onclick:() => restart(), text:'Start again' })));
  ui.play = el('button', { type:'button', text:'Pause', onclick:() => setPlaying(!playing) });
  ui.auto = el('button', { type:'button', text:'Auto camera', hidden:true });
  ui.vr = el('button', { type:'button', class:'primary', text:'Enter VR', hidden:true, onclick:() => startXR('immersive-vr') });
  ui.ar = el('button', { type:'button', class:'mr', text:'Mixed reality', hidden:true, onclick:() => startXR('immersive-ar') });
  ui.hint = el('div', { class:'hint', text:'Click a numbered pin to answer its questions · drag to orbit · scroll to zoom' });
  ui.dock = el('div', { class:'dock' }, el('div', { class:'bar glass' }, ui.play, ui.auto, ui.vr, ui.ar), ui.hint);
  /* quiz modal */
  ui.quiz = el('div', { class:'scrim', hidden:true, onclick:e => { if(e.target === ui.quiz) closeQuiz(); } });
  ui.quizCard = el('div', { class:'card', role:'dialog', 'aria-modal':'true', 'aria-labelledby':'qtitle' });
  ui.quiz.append(ui.quizCard);
  /* student number gate */
  ui.gate = el('div', { class:'scrim', hidden:true });
  ui.sidInput = el('input', { type:'text', id:'sid', inputmode:'text', autocomplete:'off', autocapitalize:'characters', placeholder:'B00123456', maxlength:'10' });
  ui.sidErr = el('div', { class:'err', role:'alert' });
  ui.gateForm = el('form', { class:'card', onsubmit:e => { e.preventDefault(); submitStudent(ui.sidInput.value); } },
    el('div', { class:'eyebrow', text:spec.moduleCode || 'Before you start' }),
    el('h2', { text:'Enter your student number' }),
    el('p', { text:spec.privacy }),
    el('label', { for:'sid', text:'Student number' }), ui.sidInput, ui.sidErr,
    el('div', { class:'actions' }, el('button', { type:'submit', class:'primary', text:'Start' })));
  ui.gate.append(ui.gateForm);
  /* tutor drawer */
  ui.msgs = el('div', { class:'msgs', 'aria-live':'polite' });
  ui.sugg = el('div', { class:'sugg' });
  ui.tInput = el('input', { type:'text', id:'tutor-q', placeholder:'Ask about this case…', autocomplete:'off', maxlength:'500' });
  ui.tSend = el('button', { type:'submit', class:'primary', text:'Send' });
  ui.tutor = el('aside', { class:'tutor', hidden:true, 'aria-label':'Tutor' },
    el('header', {}, el('h3', { text:spec.tutor.name || 'Tutor' }), el('button', { type:'button', text:'Close', onclick:() => toggleTutor(false) })),
    ui.msgs, ui.sugg,
    el('div', { class:'disclaim', text:'Answers are AI-generated. Check them against your module reading. Your student number is not sent to the AI.' }),
    el('form', { onsubmit:e => { e.preventDefault(); const v = ui.tInput.value; ui.tInput.value = ''; askTutor(v); } }, ui.tInput, ui.tSend));
  document.body.append(ui.hud, ui.dock, ui.quiz, ui.gate, ui.tutor);

  let afterStudent = null;
  function askStudent(then){
    afterStudent = then || null;
    if(renderer.xr.isPresenting){ keypad.value = ''; keypad.mesh.visible = true; keypad.dirty = true; return; }
    ui.sidInput.value = student; ui.sidErr.textContent = ''; ui.gate.hidden = false; setTimeout(() => ui.sidInput.focus(), 30);
  }
  function submitStudent(v){
    v = String(v || '').trim().toUpperCase();
    if(!SID_RE.test(v)){ ui.sidErr.textContent = 'Use your student number, for example B00123456.'; keypad.error = true; keypad.dirty = true; return false; }
    student = v; store.set('student', v); hashSid();
    ui.gate.hidden = true; keypad.mesh.visible = false; keypad.error = false;
    refresh();
    const f = afterStudent; afterStudent = null; f?.();
    return true;
  }
  function toggleTutor(v){
    tutor.open = v ?? !tutor.open;
    if(tutor.open && !tutor.msgs.length) tutor.msgs.push({ role:'assistant', content:spec.tutor.greeting });
    refresh();
    if(tutor.open && !renderer.xr.isPresenting) setTimeout(() => ui.tInput.focus(), 30);
  }
  addEventListener('keydown', e => {
    if(e.key === 'Escape'){ if(!ui.quiz.hidden) closeQuiz(); else if(!ui.tutor.hidden) toggleTutor(false); }
    if(e.code === 'Space' && e.target === document.body){ e.preventDefault(); setPlaying(!playing); }
  });

  function renderQuizDom(){
    const card = ui.quizCard; card.replaceChildren();
    if(open?.done){
      const s = correctCount(), pct = Math.round(s / Qs.length * 100);
      card.append(el('div', { class:'eyebrow', text:`Attempt ${attempt.n} complete` }),
        el('h2', { id:'qtitle', text:'Your score' }), el('div', { class:'big', text:`${s} / ${Qs.length}` }),
        el('p', { text:`${pct}%. ${pct >= 80 ? 'Strong work. Try again to make it stick, or ask the tutor to push you further.' : pct >= 50 ? 'Good progress. Revisit the pins you missed, then try again.' : 'Use the tutor on the questions you missed, then try again.'}${best ? ` Your best so far is ${best.pct}%.` : ''}` }),
        el('div', { class:'actions' }, el('button', { type:'button', text:'Close', onclick:closeQuiz }), el('button', { type:'button', class:'primary', text:'Try again', onclick:restart })));
      return;
    }
    const q = qById(open.qid), h = hById(q.hotspot), a = attempt.answers[q.id], order = attempt.order[q.id];
    const inHot = Qs.filter(x => x.hotspot === q.hotspot), idx = inHot.indexOf(q) + 1;
    card.append(el('div', { class:'eyebrow', text:`${h.n} · ${h.title} · question ${idx} of ${inHot.length}` }), el('h2', { id:'qtitle', text:q.q }));
    const opts = el('div', { class:'opts' });
    order.forEach((orig, di) => {
      let cls = 'opt';
      if(a){ if(orig === q.answer) cls += ' right'; else if(orig === a.chosen) cls += ' wrong'; }
      opts.append(el('button', { type:'button', class:cls, disabled:!!a, onclick:() => answer(di) }, el('span', { class:'k', text:'ABCD'[di] }), el('span', { text:q.options[orig] })));
    });
    card.append(opts);
    if(a){
      card.append(el('div', { class:'fb ' + (a.correct ? 'ok' : 'bad') }, el('strong', { text:a.correct ? 'Correct' : 'Not quite' }), el('p', { text:q.explain }), el('div', { class:'ref', text:q.ref })));
      const more = Qs.some(x => x.hotspot === q.hotspot && !attempt.answers[x.id]) || complete();
      card.append(el('div', { class:'actions' },
        el('button', { type:'button', text:a.correct ? 'Ask the tutor more' : 'Ask the tutor why', onclick:() => { lastQid = q.id; const s = suggestions()[0]; toggleTutor(true); askTutor(s); } }),
        el('button', { type:'button', class:'primary', text:complete() ? 'See my score' : more ? 'Next question' : 'Done', onclick:nextQuestion })));
    } else {
      card.append(el('div', { class:'actions' }, el('button', { type:'button', text:'Ask for a hint', onclick:() => { lastQid = q.id; toggleTutor(true); askTutor('Give me a hint for this question'); } }), el('button', { type:'button', text:'Close', onclick:closeQuiz })));
    }
  }
  function renderTutorDom(){
    ui.msgs.replaceChildren(...tutor.msgs.map(m => el('div', { class:'msg ' + m.role, text:m.content })));
    if(tutor.busy) ui.msgs.append(el('div', { class:'msg note', text:'Thinking…' }));
    ui.msgs.scrollTop = ui.msgs.scrollHeight;
    ui.sugg.replaceChildren(...suggestions().map(s => el('button', { type:'button', text:s, disabled:tutor.busy, onclick:() => askTutor(s) })));
    ui.tSend.disabled = tutor.busy;
  }

  /* ---------- refresh everything after a state change ---------- */
  function refresh(){
    if(open?.qid) lastQid = open.qid;
    const n = answeredCount(), c = correctCount();
    ui.bar.style.width = (n / Qs.length * 100) + '%';
    ui.stats.replaceChildren(el('strong', { text:`${n} of ${Qs.length}` }), ' answered · ', el('strong', { text:String(c) }), ' correct' + (best ? ` · best ${best.pct}%` : ''));
    ui.sid.textContent = student ? `${student} · change` : 'Add student number';
    const xr = renderer.xr.isPresenting;
    ui.quiz.hidden = xr || !open;
    if(open && !xr) renderQuizDom();
    ui.tutor.hidden = xr || !tutor.open;
    if(tutor.open && !xr) renderTutorDom();
    quizPanel.mesh.visible = xr && !!open; tutorPanel.mesh.visible = xr && tutor.open;
    hud.dirty = quizPanel.dirty = tutorPanel.dirty = true;
    pins.forEach(p => p.setState());
  }

  /* ---------- hotspot pins: drawn after post-processing on desktop so ACES and AO don't dull them ---------- */
  const overlay = new THREE.Scene(), pinRoot = new THREE.Group();
  overlay.add(pinRoot); pinRoot.matrixAutoUpdate = false;
  const pins = H.map((h, i) => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, depthTest:false, transparent:true, toneMapped:false }));
    sp.renderOrder = 998; sp.scale.setScalar(spec.pinSize ?? 0.6); sp.position.set(...h.pos);
    sp.userData = { hotspot:h.id, base:h.pos[1], i, anim:true };
    sp.visible = false; pinRoot.add(sp);
    let last = '';
    sp.setState = () => {
      const done = hotspotDone(h.id), some = Qs.some(q => q.hotspot === h.id && attempt.answers[q.id]);
      const key = done + '|' + some; if(key === last) return; last = key;
      const x = c.getContext('2d'); x.clearRect(0, 0, 128, 128);
      x.beginPath(); x.arc(64, 64, 58, 0, TAU); x.fillStyle = '#ffffff'; x.fill();
      x.beginPath(); x.arc(64, 64, 48, 0, TAU); x.fillStyle = done ? '#2f8a45' : some ? '#17a3a0' : '#ff6a13'; x.fill();
      x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      if(done){ x.lineWidth = 12; x.strokeStyle = '#fff'; x.lineCap = 'round'; x.beginPath(); x.moveTo(40, 66); x.lineTo(57, 82); x.lineTo(88, 48); x.stroke(); }
      else { x.font = '800 56px "Bricolage Grotesque", system-ui, sans-serif'; x.fillText(String(h.n), 64, 68); }
      tex.needsUpdate = true;
    };
    sp.setState();
    return sp;
  });

  /* ---------- in-headset panels ---------- */
  const hud = new Panel(1024, 600, 0.62), quizPanel = new Panel(1024, 1000, 0.78), tutorPanel = new Panel(1024, 1000, 0.72), keypad = new Panel(1024, 900, 0.6);
  for(const p of [hud, quizPanel, tutorPanel, keypad]) scene.add(p.mesh);
  let viewIdx = 0;
  hud.draw = p => {
    p.bg();
    p.rr(44, 40, playing ? 140 : 186, 50, 25); p.ctx.fillStyle = playing ? 'rgba(255,106,19,0.14)' : 'rgba(43,79,216,0.14)'; p.ctx.fill();
    p.text(playing ? 'LIVE' : 'PAUSED', 70, 66, { size:24, weight:700, color:playing ? '#c94a05' : '#2b4fd8', base:'middle' });
    p.text(`${views[viewIdx].name}${student ? '  ·  ' + student : ''}`, 980, 66, { size:24, font:'mono', color:'#4b5679', align:'right', base:'middle' });
    p.text(spec.title, 44, 160, { size:56, weight:800 });
    p.text(spec.subtitle, 44, 214, { size:36, weight:500, color:'#2b4fd8' });
    const n = answeredCount(), c = correctCount();
    p.rr(44, 250, 936, 18, 9); p.ctx.fillStyle = 'rgba(20,32,74,0.1)'; p.ctx.fill();
    if(n){ p.rr(44, 250, 936 * n / Qs.length, 18, 9); p.ctx.fillStyle = '#2b4fd8'; p.ctx.fill(); }
    p.text(`${n} of ${Qs.length} answered · ${c} correct${best ? ` · best ${best.pct}%` : ''}`, 44, 314, { size:28, weight:600 });
    p.button('tutor', 44, 350, 300, 76, 'Ask the tutor', { fill:'#2b4fd8', color:'#ffffff' });
    p.button('restart', 362, 350, 260, 76, 'Start again');
    p.button('pause', 640, 350, 340, 76, playing ? 'Pause motion' : 'Resume motion');
    p.para('Point at a numbered pin and pull the trigger · A/X: change view · B/Y: pause · Grip: move · Right stick: zoom', 44, 480, 936, { size:24, color:'#4b5679' });
  };
  hud.onClick = id => { if(id === 'tutor') toggleTutor(); if(id === 'restart') restart(); if(id === 'pause') setPlaying(!playing); };
  quizPanel.draw = p => {
    p.bg();
    if(open?.done){
      const s = correctCount(), pct = Math.round(s / Qs.length * 100);
      p.text(`ATTEMPT ${attempt.n} COMPLETE`, 54, 100, { size:26, weight:700, color:'#17a3a0' });
      p.text(`${s} / ${Qs.length}`, 54, 260, { size:130, weight:600, font:'mono', color:'#2b4fd8' });
      p.para(`${pct}%.${best ? ` Your best so far is ${best.pct}%.` : ''} Revisit the pins you missed with the tutor, then try again.`, 54, 360, 916, { size:34 });
      p.button('close', 54, 820, 430, 110, 'Close'); p.button('restart', 540, 820, 430, 110, 'Try again', { fill:'#2b4fd8', color:'#fff' });
      return;
    }
    const q = qById(open?.qid); if(!q) return;
    const h = hById(q.hotspot), a = attempt.answers[q.id], order = attempt.order[q.id];
    p.text(`${h.n} · ${h.title.toUpperCase()}`, 54, 82, { size:24, weight:700, color:'#17a3a0', max:916 });
    let y = p.para(q.q, 54, 140, 916, { size:36, weight:700, lh:1.25, maxLines:4 }) + 10;
    if(a){
      order.forEach((orig, di) => {
        const right = orig === q.answer, chosen = orig === a.chosen;
        if(!right && !chosen) return;
        p.button('x' + di, 54, y, 916, 84, `${right ? '✓ ' : '✗ '}${q.options[orig]}`, { fill:right ? '#ecf7ef' : '#fdf0e8', size:25, weight:600, stroke:right ? '#2f8a45' : '#c2410c' });
        y += 98;
      });
      p.text(a.correct ? 'Correct' : 'Not quite', 54, y + 34, { size:32, weight:800, color:a.correct ? '#2f8a45' : '#c2410c' });
      p.para(q.explain, 54, y + 80, 916, { size:25, color:'#4b5679', lh:1.3, maxLines:7 });
      p.button('tutor', 54, 860, 440, 100, a.correct ? 'Ask the tutor more' : 'Ask the tutor why');
      p.button('next', 530, 860, 440, 100, complete() ? 'See my score' : 'Next', { fill:'#2b4fd8', color:'#fff' });
    } else {
      order.forEach((orig, di) => { p.button('o' + di, 54, y, 916, 118, `${'ABCD'[di]}.  ${q.options[orig]}`, { size:26, weight:600 }); y += 132; });
      p.button('hint', 54, 880, 440, 90, 'Hint from the tutor'); p.button('close', 530, 880, 440, 90, 'Close');
    }
  };
  quizPanel.onClick = id => {
    if(!id) return;
    if(id[0] === 'o') answer(+id.slice(1));
    else if(id === 'next') nextQuestion();
    else if(id === 'close') closeQuiz();
    else if(id === 'restart') restart();
    else if(id === 'tutor'){ tutor.open = true; askTutor(suggestions()[0]); }
    else if(id === 'hint'){ tutor.open = true; askTutor('Give me a hint for this question'); }
  };
  const TUTOR_LINES = 14;
  tutorPanel.draw = p => {
    p.bg();
    p.text(spec.tutor.name || 'Tutor', 54, 92, { size:40, weight:800 });
    p.button('close', 770, 44, 200, 70, 'Close', { size:24 });
    const lastA = [...tutor.msgs].reverse().find(m => m.role !== 'user');
    const lastU = [...tutor.msgs].reverse().find(m => m.role === 'user');
    let y = 150;
    if(lastU) y = p.para('You: ' + lastU.content, 54, y, 916, { size:24, color:'#2b4fd8', maxLines:2 }) + 14;
    const body = tutor.busy ? 'Thinking…' : (lastA?.content || spec.tutor.greeting);
    const lines = p.wrap(body, 916, 27, 500), pages = Math.max(1, Math.ceil(lines.length / TUTOR_LINES));
    tutor.page = Math.min(tutor.page, pages - 1);
    lines.slice(tutor.page * TUTOR_LINES, (tutor.page + 1) * TUTOR_LINES).forEach((l, i) => p.text(l, 54, y + 10 + i * 36, { size:27, color:lastA?.role === 'note' ? '#c2410c' : '#14204a' }));
    if(pages > 1){
      p.text(`${tutor.page + 1} / ${pages}`, 512, 712, { size:24, font:'mono', align:'center', color:'#4b5679' });
      if(tutor.page > 0) p.button('prev', 54, 680, 200, 64, '◀ Back', { size:22 });
      if(tutor.page < pages - 1) p.button('more', 770, 680, 200, 64, 'More ▶', { size:22 });
    }
    const s = suggestions();
    s.slice(0, 4).forEach((t, i) => p.button('s' + i, 54 + (i % 2) * 466, 770 + Math.floor(i / 2) * 106, 450, 94, t, { size:22, weight:600 }));
  };
  tutorPanel.onClick = id => {
    if(!id) return;
    if(id === 'close') toggleTutor(false);
    else if(id === 'more'){ tutor.page++; tutorPanel.dirty = true; }
    else if(id === 'prev'){ tutor.page = Math.max(0, tutor.page - 1); tutorPanel.dirty = true; }
    else if(id[0] === 's') askTutor(suggestions()[+id.slice(1)]);
  };
  keypad.value = ''; keypad.error = false;
  keypad.draw = p => {
    p.bg();
    p.text('Enter your student number', 54, 96, { size:40, weight:800 });
    p.para('So your lecturer can see your quiz results.', 54, 146, 916, { size:26, color:'#4b5679' });
    p.rr(54, 186, 916, 100, 22); p.ctx.fillStyle = '#f3f0e9'; p.ctx.fill();
    p.text(keypad.value || 'B00…', 512, 238, { size:52, font:'mono', weight:600, align:'center', base:'middle', color:keypad.value ? '#14204a' : '#9aa1b8' });
    if(keypad.error) p.text('Use your student number, e.g. B00123456', 512, 320, { size:24, weight:600, color:'#c2410c', align:'center' });
    const keys = ['1','2','3','4','5','6','7','8','9','B','0','⌫'];
    keys.forEach((k, i) => p.button('k' + k, 54 + (i % 3) * 312, 350 + Math.floor(i / 3) * 112, 292, 96, k, { size:40 }));
    p.button('ok', 54, 800, 916, 80, 'Start', { fill:'#2b4fd8', color:'#fff' });
  };
  keypad.onClick = id => {
    if(!id) return;
    if(id === 'ok'){ submitStudent(keypad.value); return; }
    const k = id.slice(1);
    if(k === '⌫') keypad.value = keypad.value.slice(0, -1);
    else if(keypad.value.length < 10 && !(k === 'B' && keypad.value.length)) keypad.value += k;
    keypad.error = false; keypad.dirty = true;
  };
  const panels = [keypad, quizPanel, tutorPanel, hud];
  document.fonts?.ready.then(() => { panels.forEach(p => p.dirty = true); });

  /* ---------- static merge after build-in ---------- */
  let merged = false;
  function mergeStatic(){
    model.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(world.matrixWorld).invert(), groups = new Map();
    world.traverse(o => {
      if(!o.isMesh || o.isInstancedMesh || o.material.transparent) return;
      for(let p = o; p && p !== world; p = p.parent) if(p.userData.anim) return;
      const key = o.material.uuid + (o.castShadow ? '|s' : '|n');
      if(!groups.has(key)) groups.set(key, { mat:o.material, cast:o.castShadow, list:[] });
      groups.get(key).list.push(o);
    });
    for(const g of groups.values()){
      if(g.list.length < 2) continue;
      const parts = g.list.map(o => {
        const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        for(const k of Object.keys(geo.attributes)) if(!['position','normal','uv'].includes(k)) geo.deleteAttribute(k);
        geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
        return geo;
      });
      const geo = mergeGeometries(parts, false); parts.forEach(p => p.dispose());
      if(!geo) continue;
      const m = new THREE.Mesh(geo, g.mat); m.castShadow = g.cast; m.receiveShadow = true; world.add(m);
      g.list.forEach(o => o.parent.remove(o));
    }
    merged = true;
  }

  /* ---------- desktop rendering + camera ---------- */
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth * DPR, innerHeight * DPR, { type:THREE.HalfFloatType, samples:4 }));
  composer.setPixelRatio(DPR); composer.setSize(innerWidth, innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const gtao = new GTAOPass(scene, camera, innerWidth * DPR, innerHeight * DPR);
  try{
    gtao.updateGtaoMaterial({ radius:0.55, distanceExponent:1.4, thickness:1.2, scale:1.0, samples:16, distanceFallOff:1, screenSpaceRadius:false });
    gtao.updatePdMaterial({ lumaPhi:10, depthPhi:2, normalPhi:3, radius:5, radiusExponent:1, rings:2, samples:16 });
  }catch(e){}
  gtao.blendIntensity = 0.9;
  composer.addPass(gtao); composer.addPass(new OutputPass());

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.minDistance = 4; controls.maxDistance = 160; controls.maxPolarAngle = Math.PI * 0.49; controls.target.copy(target);
  let autoCam = true;
  controls.addEventListener('start', () => { if(autoCam){ autoCam = false; ui.auto.hidden = false; } });
  ui.auto.addEventListener('click', () => { autoCam = true; ui.auto.hidden = true; controls.target.copy(target); });
  const FIT = spec.fit ?? 13.5;
  function fitDistance(){
    const v = THREE.MathUtils.degToRad(camera.fov) / 2, h = Math.atan(Math.tan(v) * camera.aspect);
    return FIT / Math.tan(Math.min(v, h));
  }
  addEventListener('resize', () => {
    if(renderer.xr.isPresenting) return;
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  });

  /* click a pin on desktop / touch */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY }; });
  function pinAt(x, y){
    overlay.updateMatrixWorld();
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(pins.filter(p => p.visible), false)[0]?.object;
  }
  renderer.domElement.addEventListener('pointerup', e => {
    if(!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const p = pinAt(e.clientX, e.clientY); if(p) openHotspot(p.userData.hotspot);
  });
  renderer.domElement.addEventListener('pointermove', e => {
    if(e.buttons) return;
    renderer.domElement.style.cursor = pinAt(e.clientX, e.clientY) ? 'pointer' : '';
  });

  /* ---------- play / pause ---------- */
  let playing = true;
  function setPlaying(v){
    playing = v; ui.play.textContent = v ? 'Pause' : 'Play';
    ui.pill.classList.toggle('paused', !v); ui.pill.lastChild.textContent = v ? 'Live' : 'Paused';
    hud.dirty = true;
  }

  /* ---------- XR views, controllers, grab and zoom ---------- */
  const views = (spec.views || []).map(v => ({ ...v, anchor:new THREE.Vector3(...v.anchor), at:new THREE.Vector3(...v.at) }));
  function placeView(i){
    viewIdx = (i + views.length) % views.length;
    const v = views[viewIdx];
    model.scale.setScalar(v.s); model.rotation.set(0, v.yaw, 0);
    const a = v.anchor.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), v.yaw).multiplyScalar(v.s);
    model.position.copy(v.at).sub(a); syncShadow(); hud.dirty = true;
  }
  const ctrlFactory = new XRControllerModelFactory(), handFactory = new XRHandModelFactory();
  const holders = new Set(); let stretch = null;
  const ctrls = [0, 1].map(i => {
    const c = renderer.xr.getController(i); scene.add(c);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineBasicMaterial({ color:0x2b4fd8 }));
    line.scale.z = 0.4; c.add(line);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), new THREE.MeshBasicMaterial({ color:0xff6a13, depthTest:false }));
    dot.renderOrder = 1000; dot.visible = false; scene.add(dot);
    c.userData = { line, dot };
    c.addEventListener('connected', e => { c.userData.src = e.data; });
    c.addEventListener('disconnected', () => { c.userData.src = null; holders.delete(c); });
    c.addEventListener('select', () => xrSelect(c));
    c.addEventListener('squeezestart', () => grabStart(c));
    c.addEventListener('squeezeend', () => grabEnd(c));
    const grip = renderer.xr.getControllerGrip(i); grip.add(ctrlFactory.createControllerModel(grip)); scene.add(grip);
    const hand = renderer.xr.getHand(i); hand.add(handFactory.createHandModel(hand, 'mesh')); scene.add(hand);
    return c;
  });
  const tmpM = new THREE.Matrix4();
  function xrHit(c){
    tmpM.identity().extractRotation(c.matrixWorld);
    ray.ray.origin.setFromMatrixPosition(c.matrixWorld); ray.ray.direction.set(0, 0, -1).applyMatrix4(tmpM);
    ray.camera = renderer.xr.getCamera();
    const vis = panels.filter(p => p.mesh.visible).map(p => p.mesh);
    const ph = keypad.mesh.visible ? ray.intersectObject(keypad.mesh, false)[0] : ray.intersectObjects(vis, false)[0];
    if(ph) return ph;
    if(keypad.mesh.visible) return null;
    return ray.intersectObjects(pins.filter(p => p.visible), false)[0] || null;
  }
  function xrSelect(c){
    const h = xrHit(c); if(!h) return;
    const panel = h.object.userData.panel;
    if(panel) panel.onClick(panel.hit(h.uv));
    else if(h.object.userData.hotspot) openHotspot(h.object.userData.hotspot);
  }
  function levelModel(){ const e = new THREE.Euler().setFromQuaternion(model.quaternion, 'YXZ'); model.rotation.set(0, e.y, 0); }
  function grabStart(c){
    holders.add(c);
    if(holders.size === 1) c.attach(model);
    else {
      scene.attach(model); levelModel();
      const [a, b] = [...holders];
      stretch = { a, b, d0:a.position.distanceTo(b.position) || 0.01, s0:model.scale.x, p0:model.position.clone(), m0:a.position.clone().add(b.position).multiplyScalar(0.5) };
    }
  }
  function grabEnd(c){
    holders.delete(c);
    if(stretch){ stretch = null; if(holders.size === 1) [...holders][0].attach(model); }
    if(holders.size === 0){ scene.attach(model); levelModel(); }
    syncShadow();
  }
  const prevButtons = new Map(), head = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  function pollXR(dt){
    let right = null, left = null;
    const hovers = new Map();
    for(const c of ctrls){
      const s = c.userData.src;
      /* pointer feedback: ray length, end dot, hovered button */
      const hit = s ? xrHit(c) : null;
      c.userData.line.visible = !!s && !s.hand;
      c.userData.line.scale.z = hit ? hit.distance : 0.4;
      c.userData.dot.visible = !!hit; if(hit) c.userData.dot.position.copy(hit.point);
      const panel = hit?.object.userData.panel;
      if(panel){ const id = panel.hit(hit.uv); if(id) hovers.set(panel, id); }
      if(!s || !s.gamepad) continue;
      if(s.handedness === 'right') right = c; else if(s.handedness === 'left') left = c;
    }
    for(const p of panels){ const want = hovers.get(p) ?? null; if(p.hover !== want){ p.hover = want; p.dirty = true; } }
    for(const c of [right, left]){
      if(!c) continue;
      const gp = c.userData.src.gamepad, hand = c.userData.src.handedness;
      const prev = prevButtons.get(hand) || [], pressed = gp.buttons.map(b => b.pressed), edge = i => pressed[i] && !prev[i];
      if(edge(4)) placeView(viewIdx + (hand === 'right' ? 1 : -1));
      if(edge(5)) setPlaying(!playing);
      prevButtons.set(hand, pressed);
      if(holders.size) continue;
      const sx = gp.axes[2] || 0, sy = gp.axes[3] || 0;
      if(hand === 'right' && Math.abs(sy) > 0.15){
        const s = clamp(model.scale.x * Math.exp(-sy * dt * 1.6), 0.015, 6), kk = s / model.scale.x;
        model.position.sub(c.position).multiplyScalar(kk).add(c.position); model.scale.setScalar(s); syncShadow();
      }
      if(hand === 'left' && Math.abs(sx) > 0.2){
        const ang = -sx * dt * 1.4;
        renderer.xr.getCamera().getWorldPosition(head); head.y = 0;
        model.position.sub(head).applyAxisAngle(UP, ang).add(head); model.rotation.y += ang;
      }
    }
    if(stretch){
      const d = stretch.a.position.distanceTo(stretch.b.position), s = clamp(stretch.s0 * d / stretch.d0, 0.015, 6);
      const mid = stretch.a.position.clone().add(stretch.b.position).multiplyScalar(0.5);
      model.position.copy(stretch.p0).sub(stretch.m0).multiplyScalar(s / stretch.s0).add(mid); model.scale.setScalar(s); syncShadow();
    }
  }
  function placePanel(p, x, y, z){ p.mesh.position.set(x, y, z); p.mesh.lookAt(0, y, 0.15); }
  async function startXR(mode){
    try{
      const session = await navigator.xr.requestSession(mode, { requiredFeatures:['local-floor'], optionalFeatures:['hand-tracking'] });
      await renderer.xr.setSession(session);
      camera.near = 0.02; camera.far = 300; camera.updateProjectionMatrix();
      const ar = mode === 'immersive-ar';
      scene.background = ar ? null : new THREE.Color(BG);
      floor.visible = !ar; catcher.visible = ar; catcher.position.y = spec.arCatcherY ?? -1.24;
      renderer.xr.setFoveation?.(0.6);
      placePanel(hud, -0.78, 1.48, -0.92);
      placePanel(quizPanel, 0.72, 1.32, -0.82);
      placePanel(tutorPanel, 1.12, 1.32, -0.12);
      placePanel(keypad, 0, 1.32, -0.75);
      hud.mesh.visible = true;
      world.add(pinRoot); pinRoot.matrixAutoUpdate = true; pinRoot.matrix.identity(); pinRoot.position.set(0, 0, 0);
      placeView(0); refresh();
      if(!student) askStudent();
      session.addEventListener('end', endXR);
    }catch(err){ ui.hint.textContent = 'Could not start ' + (mode === 'immersive-ar' ? 'mixed reality' : 'VR') + ': ' + err.message; }
  }
  function endXR(){
    overlay.add(pinRoot); pinRoot.matrixAutoUpdate = false;
    for(const c of [...holders]) grabEnd(c);
    scene.attach(model);
    model.scale.setScalar(1); model.position.set(0, 0, 0); model.rotation.set(0, 0, 0); syncShadow();
    scene.background = new THREE.Color(BG); floor.visible = false;
    panels.forEach(p => p.mesh.visible = false);
    ctrls.forEach(c => c.userData.dot.visible = false);
    catcher.visible = true; catcher.position.y = spec.catcherY ?? -5.5;
    camera.near = 0.5; camera.far = 600; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
    refresh();
    if(!student) askStudent();
  }
  if(navigator.xr){
    navigator.xr.isSessionSupported('immersive-vr').then(ok => { ui.vr.hidden = !ok; }).catch(() => {});
    navigator.xr.isSessionSupported('immersive-ar').then(ok => { ui.ar.hidden = !ok; }).catch(() => {});
  }

  /* ---------- main loop ---------- */
  let simT = 0, lastNow = performance.now(), pinsShown = false;
  const tickArgs = { t:0, lt:0, ph:0, dt:0, playing:true };
  renderer.setAnimationLoop(now => {
    const dt = clamp((now - lastNow) / 1000, 0, 0.1); lastNow = Math.max(lastNow, now);
    if(playing) simT += dt;
    const t = simT, lt = t % LOOP, ph = TAU * lt / LOOP;

    let allDone = true;
    for(const b of kit.builds){
      if(b.done) continue; allDone = false;
      const p = clamp((t - b.delay) / 0.5, 0, 1), s = Math.max(0.0001, easeOutBack(p)) * b.base;
      b.o.scale.setScalar(s); if(b.dyn) b.o.userData.pop = s;
      if(b.rise) b.o.position.y = b.y - (1 - easeOutCubic(p)) * 1.8;
      if(p >= 1){ b.o.scale.setScalar(b.base); if(b.dyn) b.o.userData.pop = 1; if(b.rise) b.o.position.y = b.y; b.done = true; }
    }
    if(allDone && !merged) mergeStatic();
    if(t > 1.1 && !pinsShown){ pinsShown = true; pins.forEach(p => p.visible = true); }

    if(!renderer.xr.isPresenting){
      if(autoCam){
        const az = (spec.camAz ?? Math.PI / 4) + 0.3 * Math.sin(ph), push = 0.5 - 0.5 * Math.cos(ph);
        const R = fitDistance() * (1 - 0.08 * push), el = spec.camEl ?? 0.57;
        camera.position.set(target.x + R * Math.cos(el) * Math.sin(az), target.y + R * Math.sin(el), target.z + R * Math.cos(el) * Math.cos(az));
        camera.lookAt(target);
      } else controls.update();
      world.position.y = 0.12 * Math.sin(ph);
    } else { world.position.y = 0; pollXR(dt); }

    tickArgs.t = t; tickArgs.lt = lt; tickArgs.ph = ph; tickArgs.dt = dt; tickArgs.playing = playing;
    for(const f of kit.ticks) f(tickArgs);
    for(const sp of kit.spinners) sp.o.rotation.y = ph * sp.k * 4;
    for(const s of kit.sways) s.o.rotation.z = 0.05 * Math.sin(ph * 2 + s.ph);
    for(const s of kit.steams){
      const p = ((lt / s.period) + s.i / s.count) % 1;
      s.m.position.set(s.x + Math.sin(p * 6 + s.i) * 0.06 * s.size, s.y + p * s.rise, s.z);
      s.m.scale.setScalar(0.6 + p * 1.6); s.m.material.opacity = Math.sin(p * Math.PI) * 0.75;
    }
    for(const p of pins) p.position.y = p.userData.base + 0.07 * Math.sin(now / 500 + p.userData.i);

    if(renderer.xr.isPresenting){
      for(const p of panels) if(p.mesh.visible && p.dirty) p.redraw();
      renderer.render(scene, camera);
    } else {
      composer.render();
      pinRoot.matrix.copy(world.matrixWorld); pinRoot.matrixWorldNeedsUpdate = true;
      renderer.autoClear = false; renderer.render(overlay, camera); renderer.autoClear = true;
    }
  });

  refresh();
  if(!student) askStudent();
  return { scene, kit, openHotspot, panels:{ hud, quizPanel, tutorPanel, keypad } };
}
