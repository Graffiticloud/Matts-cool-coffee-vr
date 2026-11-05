// DARQ STACK · 3D, VR and MR editor (three.js r165, WebXR).
// Self-contained: does not use the shared diorama engine.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { DARQ_STACK } from './data.js';

const SAVE_KEY = 'darq-stack-model';
const S = 0.0022;                       // model units to metres
const TIER_H = [0.10, 0.20, 0.30, 0.38];
const BASE_R = [46, 50, 35, 30];
const R_FACT = 0.7;
const PLINTH_R = 0.76;
const SHAPES = [['sphere', '●'], ['cube', '■'], ['cylinder', '▮'], ['cone', '▲'], ['crystal', '◆'], ['torus', '◯']];
const SWATCHES = ['#111111', '#185FA5', '#534AB7', '#854F0B', '#0F6E56', '#C8102E', '#D85A30', '#D4537E', '#3B6D11', '#E9B22E', '#5F5E5A', '#F3F1EA'];
const FLOW_TYPES = ['resource', 'sub', 'return', 'cross', 'data'];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- state ----------
let M = loadInitial();
let sel = null;            // node id
let selFlow = -1;          // flow index
let mode = null;           // 'link'
let flowType = 'cross';
let twoWay = false;
const layers = { cross: 'core', returns: true, analytics: true, streams: true, labels: true, motion: !reduceMotion };
const undo = [];
let buildStart = performance.now();

function loadInitial(){
  try { const s = localStorage.getItem(SAVE_KEY); if (s) { const j = JSON.parse(s); if (j.nodes && j.flows) { j._fromSave = true; return normalise(j); } } } catch {}
  return normalise(structuredClone(DARQ_STACK));
}
function normalise(m){
  m.colours = { ...DARQ_STACK.colours, ...(m.colours || {}) };
  m.analytics = m.analytics || structuredClone(DARQ_STACK.analytics);
  for (const n of m.nodes) { n.tier ??= 2; }
  return m;
}
function snapshot(){ undo.push(JSON.stringify(M)); if (undo.length > 40) undo.shift(); }
const byId = id => M.nodes.find(n => n.id === id);
const nodeColour = n => n.colour || M.colours[n.group] || '#D85A30';
const SUBCOL = { tl: '#378ADD', research: '#7F77DD', comm: '#BA7517', ee: '#1D9E75' };
const nodeRadius = n => (n.r || BASE_R[Math.min(n.tier, 3)]) * S * R_FACT * (n.scale || 1);
const nodeHeight = n => n.h ?? TIER_H[Math.min(n.tier, 3)];
const nodeLocal = n => new THREE.Vector3(n.x * S, nodeHeight(n), n.y * S);

// ---------- renderer and scene ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');

const scene = new THREE.Scene();
const BG = new THREE.Color('#0f1422');
scene.background = BG;
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.02, 60);
camera.position.set(0, 1.45, 1.55);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.14, 0);
controls.enableDamping = true;
controls.minDistance = 0.5; controls.maxDistance = 4;
controls.maxPolarAngle = Math.PI * 0.49;

scene.add(new THREE.HemisphereLight('#f4f1ea', '#20263a', 1.1));
const sun = new THREE.DirectionalLight('#ffffff', 2.0);
sun.position.set(0.8, 2.2, 1.2);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 0.5, far: 5 });
scene.add(sun);

// VR-only surroundings
const world = new THREE.Group();
const grid = new THREE.GridHelper(12, 48, '#3a4157', '#252b3d');
grid.material.transparent = true; grid.material.opacity = 0.5;
world.add(grid);
world.visible = false;
scene.add(world);

const root = new THREE.Group();          // the whole model
scene.add(root);
const plinthG = new THREE.Group(), nodeG = new THREE.Group(), flowG = new THREE.Group(), labelG = new THREE.Group();
root.add(plinthG, flowG, nodeG, labelG);

// ---------- helpers ----------
function textCanvas(lines, { w = 512, h = 128, bg = 'rgba(251,250,246,0.94)', fg = '#1d1d1b', sub = '#6b6a64', size = 44, pill = true, fit = false } = {}){
  const c = document.createElement('canvas');
  let g = c.getContext('2d');
  if (fit){
    let mw = 0; lines.forEach((l, i) => { g.font = `${i && lines._sub ? 'italic ' : ''}${i && lines._sub ? size * 0.62 : size}px Georgia, serif`; mw = Math.max(mw, g.measureText(l).width); });
    w = Math.min(1024, Math.ceil(mw + h * 0.7));
  }
  c.width = w; c.height = h; g = c.getContext('2d');
  if (pill){ g.fillStyle = bg; roundRect(g, 4, 4, w - 8, h - 8, (h - 8) / 2); g.fill(); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const n = lines.length;
  lines.forEach((l, i) => {
    const isSub = i > 0 && lines._sub;
    g.font = `${isSub ? 'italic ' : ''}${isSub ? size * 0.62 : size}px Georgia, 'Times New Roman', serif`;
    g.fillStyle = isSub ? sub : fg;
    let fs = isSub ? size * 0.62 : size;
    while (g.measureText(l).width > w - 40 && fs > 14){ fs -= 2; g.font = `${isSub ? 'italic ' : ''}${fs}px Georgia, serif`; }
    const y = n === 1 ? h / 2 : h / 2 + (i - (n - 1) / 2) * (h / (n + 0.6));
    g.fillText(l, w / 2, y);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function roundRect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function labelSprite(n){
  const ls = [n.label]; if (n.sub) { ls.push(n.sub); ls._sub = true; }
  const tex = textCanvas(ls, { h: n.sub ? 150 : 100, size: 54, fit: true });
  const m = new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true, toneMapped: false });
  const s = new THREE.Sprite(m);
  const px = (n.tier <= 1 ? 0.00045 : 0.00039);
  s.scale.set(tex.image.width * px, tex.image.height * px, 1);
  s.renderOrder = 5;
  return s;
}
const shapeGeo = {};
function geoFor(shape){
  if (shapeGeo[shape]) return shapeGeo[shape];
  const g = {
    sphere: () => new THREE.SphereGeometry(1, 40, 24),
    cube: () => new RoundedBoxGeometry(1.6, 1.6, 1.6, 4, 0.25),
    cylinder: () => new THREE.CylinderGeometry(1, 1, 1.4, 40),
    cone: () => new THREE.ConeGeometry(1.05, 1.8, 40),
    crystal: () => new THREE.OctahedronGeometry(1.25),
    torus: () => new THREE.TorusGeometry(0.8, 0.34, 20, 48)
  }[shape] || (() => new THREE.SphereGeometry(1, 40, 24));
  return (shapeGeo[shape] = g());
}
function lighten(hex, k){ return new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), k); }

// ---------- plinth (metrics and analytics layer) ----------
function buildPlinth(){
  plinthG.clear();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(PLINTH_R, PLINTH_R + 0.02, 0.045, 96),
    new THREE.MeshStandardMaterial({ color: '#26272b', roughness: 0.7, metalness: 0.1, envMapIntensity: 0.5 }));
  body.position.y = -0.0225; body.receiveShadow = true; body.userData.plinth = true;
  plinthG.add(body);
  // top decal: dotted data ring, grid of data points, label
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d'); const C = 512;
  g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = 'rgba(200,198,190,0.18)';
  for (let x = 24; x < 1024; x += 32) for (let y = 24; y < 1024; y += 32) if (Math.hypot(x - C, y - C) < 460) { g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); }
  g.fillStyle = '#c9c6bc';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 90) { g.beginPath(); g.arc(C + Math.cos(a) * 480, C + Math.sin(a) * 480, 3.6, 0, 7); g.fill(); }
  g.font = '34px Georgia, serif'; g.textAlign = 'center'; g.fillStyle = '#f3f1ea';
  g.save(); g.translate(C, C);
  const txt = M.analytics.label.split('').join(String.fromCharCode(8202));
  const span = 1.05, n = txt.length;
  for (let i = 0; i < n; i++){ const a = Math.PI / 2 + span / 2 - (i / (n - 1)) * span; g.save(); g.rotate(a - Math.PI / 2); g.translate(0, 432); g.fillText(txt[i], 0, 0); g.restore(); }
  g.restore();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const top = new THREE.Mesh(new THREE.CircleGeometry(PLINTH_R, 96), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.0015; top.userData.plinth = true;
  plinthG.add(top);
  const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: textCanvas(Object.assign([M.analytics.label, M.analytics.sub], { _sub: true }), { w: 768, h: 150, size: 40, bg: 'rgba(38,39,43,0.92)', fg: '#f3f1ea', sub: '#c9c6bc' }), depthWrite: false, toneMapped: false }));
  lab.scale.set(0.34, 0.34 * 150 / 768, 1);
  lab.position.set(0, 0.04, PLINTH_R + 0.06);
  lab.userData.analytics = true;
  plinthG.add(lab);
  plinthG.visible = true;
}

// ---------- nodes ----------
const nodeObjs = new Map(); // id -> { mesh, label, group }
const selRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 10, 64), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
selRing.rotation.x = Math.PI / 2; selRing.visible = false;
root.add(selRing);
const hoverRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 8, 48), new THREE.MeshBasicMaterial({ color: '#E9B22E', transparent: true, opacity: 0.8 }));
hoverRing.rotation.x = Math.PI / 2; hoverRing.visible = false;
root.add(hoverRing);

function buildNodes(){
  nodeG.clear(); labelG.clear(); nodeObjs.clear();
  const order = { tl: 0, research: 1, comm: 2, ee: 3 };
  for (const n of M.nodes){
    const col = nodeColour(n);
    const mat = new THREE.MeshStandardMaterial({
      color: n.tier === 0 ? '#111111' : n.tier === 1 || n.colour ? col : lighten(SUBCOL[n.group] || col, 0.12),
      roughness: n.tier === 0 ? 0.25 : 0.45, metalness: n.tier === 0 ? 0.35 : 0.05, envMapIntensity: 0.5,
      emissive: new THREE.Color(col), emissiveIntensity: n.tier === 0 ? 0 : 0.08
    });
    const mesh = new THREE.Mesh(geoFor(n.shape || 'sphere'), mat);
    mesh.castShadow = true; mesh.userData.nodeId = n.id;
    const r = nodeRadius(n); mesh.userData.r = r;
    mesh.scale.setScalar(r);
    mesh.position.copy(nodeLocal(n));
    const q = order[n.parent] ?? order[n.id] ?? 0;
    mesh.userData.appear = n.tier === 0 ? 0.2 : n.tier === 1 ? 0.7 + q * 0.25 : 1.9 + q * 0.35 + (Math.abs(n.x + n.y) % 7) * 0.04;
    nodeG.add(mesh);
    const lab = labelSprite(n);
    lab.userData.nodeId = n.id;
    labelG.add(lab);
    nodeObjs.set(n.id, { mesh, lab });
    placeLabel(n);
  }
}
function placeLabel(n){
  const o = nodeObjs.get(n.id); if (!o) return;
  const p = nodeLocal(n); const r = nodeRadius(n);
  o.mesh.position.copy(p);
  o.lab.position.set(p.x, p.y + r + o.lab.scale.y * 0.5 + 0.012, p.z);
}

// ---------- flows ----------
let flowObjs = [];   // { f, idx, curve, tube, hit, heads[], particles:{count, colour, back, speed} }
const partGeo = new THREE.SphereGeometry(1, 10, 8);
const MAXP = 600;
const parts = new THREE.InstancedMesh(partGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), MAXP);
parts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
parts.frustumCulled = false;
root.add(parts);
const tmpM = new THREE.Matrix4(), tmpC = new THREE.Color(), tmpV = new THREE.Vector3();

function flowEnds(f){
  const B = byId(f.to); if (!B) return null;
  const pb = nodeLocal(B), rb = nodeRadius(B);
  let pa, ra;
  if (f.from === 'analytics'){ pa = new THREE.Vector3(-PLINTH_R * 0.68, 0.004, -PLINTH_R * 0.68); ra = 0; }
  else { const A = byId(f.from); if (!A) return null; pa = nodeLocal(A); ra = nodeRadius(A); }
  return { pa, ra, pb, rb };
}
function curveFor(f){
  const e = flowEnds(f); if (!e) return null;
  const { pa, ra, pb, rb } = e;
  const d = pb.clone().sub(pa); const L = d.length();
  const plan = new THREE.Vector3(d.x, 0, d.z).normalize();
  const perp = new THREE.Vector3(-plan.z, 0, plan.x);
  const mid = pa.clone().add(pb).multiplyScalar(0.5);
  let ctrl;
  if (f.type === 'return') ctrl = mid.clone().add(perp.multiplyScalar(0.07)).add(new THREE.Vector3(0, -0.05, 0));
  else if (f.type === 'cross') ctrl = mid.clone().add(new THREE.Vector3(0, 0.06 + L * 0.16, 0));
  else if (f.type === 'data') ctrl = mid.clone().add(new THREE.Vector3(0, 0.16, 0));
  else ctrl = mid.clone().add(new THREE.Vector3(0, 0.02, 0));
  const s = pa.clone().add(ctrl.clone().sub(pa).normalize().multiplyScalar(ra + 0.008));
  const t = pb.clone().add(ctrl.clone().sub(pb).normalize().multiplyScalar(rb + 0.012));
  return new THREE.QuadraticBezierCurve3(s, ctrl, t);
}
function flowStyle(f){
  const A = byId(f.from);
  switch (f.type){
    case 'resource': return { col: M.colours.flow, rad: 0.0055, op: 0.95, pc: 4, ps: 0.32, pr: 0.007 };
    case 'sub': return { col: A ? nodeColour(A) : '#888', rad: 0.0028, op: 0.8, pc: 2, ps: 0.3, pr: 0.0045, lighten: 0.25 };
    case 'return': return { col: M.colours.flow, rad: 0.0025, op: 0.45, pc: 3, ps: 0.26, pr: 0.005 };
    case 'cross': return { col: M.colours.cross, rad: 0.0025, op: 0.45, pc: 3, ps: 0.22, pr: 0.005 };
    case 'data': return { col: '#c9c6bc', rad: 0.003, op: 0.4, pc: 5, ps: 0.25, pr: 0.005 };
    case 'stream': return { col: '#9c9a92', rad: 0.0012, op: 0.18, pc: 1, ps: 0.18, pr: 0.0032 };
  }
  return { col: '#999', rad: 0.003, op: 0.6, pc: 2, ps: 0.3, pr: 0.005 };
}
function flowVisible(f){
  if (f.type === 'cross') return layers.cross === 'all' || (layers.cross === 'core' && f.core);
  if (f.type === 'return') return layers.returns;
  if (f.type === 'data') return layers.analytics;
  if (f.type === 'stream') return layers.analytics && layers.streams;
  return true;
}
const headGeo = new THREE.ConeGeometry(1, 2.6, 16);
function buildFlowObj(f, idx){
  const curve = curveFor(f); if (!curve) return null;
  const st = flowStyle(f);
  const col = st.lighten ? lighten(st.col, st.lighten) : new THREE.Color(st.col);
  const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, transparent: st.op < 1, opacity: st.op, roughness: 0.5, depthWrite: st.op > 0.6 });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, st.rad, 8), mat);
  const o = { f, idx, curve, tube, st, col, heads: [] };
  flowG.add(tube);
  if (f.type !== 'stream'){
    const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.014, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.flowIdx = idx; o.hit = hit; flowG.add(hit);
    const hm = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.5 });
    const addHead = (u, rev) => {
      const h = new THREE.Mesh(headGeo, hm); const r = st.rad * 2.6;
      h.scale.set(r, r, r);
      const p = curve.getPointAt(u), tg = curve.getTangentAt(u); if (rev) tg.negate();
      h.position.copy(p); h.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg.normalize());
      o.heads.push(h); flowG.add(h);
    };
    addHead(1, false); if (f.both) addHead(0, true);
  }
  return o;
}
function buildFlows(){
  flowG.clear(); flowObjs = [];
  M.flows.forEach((f, i) => { const o = buildFlowObj(f, i); if (o) flowObjs.push(o); });
  // data streams: every node feeds the analytics layer
  for (const n of M.nodes){
    if (n.tier === 0) continue;
    const p = nodeLocal(n); const r = nodeRadius(n);
    const f = { type: 'stream', node: n.id };
    const curve = new THREE.LineCurve3(new THREE.Vector3(p.x, p.y - r - 0.004, p.z), new THREE.Vector3(p.x, 0.003, p.z));
    const st = flowStyle(f);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 2, st.rad, 6), new THREE.MeshBasicMaterial({ color: st.col, transparent: true, opacity: st.op, depthWrite: false }));
    flowG.add(tube);
    flowObjs.push({ f, idx: -1, curve, tube, st, col: new THREE.Color(st.col), heads: [] });
  }
  applyFlowVisibility();
}
function applyFlowVisibility(){
  for (const o of flowObjs){
    const v = flowVisible(o.f);
    o.tube.visible = v; o.heads.forEach(h => h.visible = v); if (o.hit) o.hit.visible = false;
    o.on = v;
    o.tube.material.emissiveIntensity !== undefined && (o.tube.material.emissiveIntensity = o.idx === selFlow ? 1.2 : 0.35);
  }
  plinthG.visible = layers.analytics;
  labelG.visible = layers.labels;
}
function refreshNodeFlows(id){
  // cheap rebuild of flows touching a node (used while dragging)
  for (const o of flowObjs){
    if (o.f.from !== id && o.f.to !== id && o.f.node !== id) continue;
    let curve;
    if (o.f.type === 'stream'){ const n = byId(id); const p = nodeLocal(n); const r = nodeRadius(n); curve = new THREE.LineCurve3(new THREE.Vector3(p.x, p.y - r - 0.004, p.z), new THREE.Vector3(p.x, 0.003, p.z)); }
    else curve = curveFor(o.f);
    if (!curve) continue;
    o.curve = curve;
    o.tube.geometry.dispose(); o.tube.geometry = new THREE.TubeGeometry(curve, o.f.type === 'stream' ? 2 : 40, o.st.rad, o.f.type === 'stream' ? 6 : 8);
    if (o.hit){ o.hit.geometry.dispose(); o.hit.geometry = new THREE.TubeGeometry(curve, 20, 0.014, 6); }
    o.heads.forEach((h, k) => { const u = k === 0 ? 1 : 0; const p = curve.getPointAt(u), tg = curve.getTangentAt(u); if (k) tg.negate(); h.position.copy(p); h.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg.normalize()); });
  }
}
function rebuild(){ buildPlinth(); buildNodes(); buildFlows(); updateSelectionVisuals(); refreshUI(); }

// ---------- selection and editing actions ----------
function updateSelectionVisuals(){
  const n = sel && byId(sel);
  if (n){ const r = nodeRadius(n); selRing.visible = true; selRing.scale.setScalar(r * 1.35); selRing.position.copy(nodeLocal(n)); }
  else selRing.visible = false;
  for (const o of flowObjs) if (o.idx >= 0) o.tube.material.emissiveIntensity = o.idx === selFlow ? 1.4 : 0.35;
}
function setStatus(s){ statusText = s; const el = document.getElementById('status'); if (el) el.textContent = s; panelDirty = true; }
let statusText = M._fromSave ? 'Loaded your saved version. Use Reset to v3 to return to the original.' : 'Select a node or flow to edit it.';

function select(id){
  if (mode === 'link' && sel && id && id !== sel){
    snapshot();
    const f = { from: sel, to: id, type: flowType };
    if (flowType === 'cross') f.core = true;
    if (twoWay) f.both = true;
    M.flows.push(f);
    mode = null; selFlow = M.flows.length - 1;
    setStatus(`Linked ${byId(f.from).label} → ${byId(id).label} (${flowType}).`);
    buildFlows(); sel = id; updateSelectionVisuals(); refreshUI(); return;
  }
  sel = id; selFlow = -1; if (!id) mode = null;
  updateSelectionVisuals(); refreshUI();
  if (id){ const n = byId(id); setStatus(n.blurb ? `${n.label}: ${n.blurb}` : n.label); }
}
function selectFlow(idx){
  sel = null; selFlow = idx; mode = null; updateSelectionVisuals();
  const f = M.flows[idx]; const name = x => x === 'analytics' ? 'Metrics & analytics' : byId(x)?.label;
  if (f){ flowType = f.type; twoWay = !!f.both; setStatus(`Flow: ${name(f.from)} → ${name(f.to)} (${f.type}).`); }
  refreshUI();
}
function uid(base){ let s = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'node'; let id = s, k = 2; while (byId(id)) id = s + '-' + k++; return id; }
function freeSpot(near, dist){
  const ang0 = Math.atan2(near.y, near.x), r0 = Math.hypot(near.x, near.y);
  for (const dr of [dist, dist + 60, dist + 120, dist + 180]){
    for (let k = 0; k < 15; k++){
      const r = r0 + dr; const a = ang0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (70 / r);
      const p = { x: Math.cos(a) * r, y: Math.sin(a) * r };
      if (M.nodes.every(n => Math.hypot(n.x - p.x, n.y - p.y) > 78)) return p;
    }
  }
  return { x: near.x * 1.4 + 40, y: near.y * 1.4 };
}
const ACTIONS = {
  addChild(){
    const p = sel && byId(sel); if (!p){ setStatus('Select a parent node first.'); return; }
    snapshot();
    const spot = p.tier === 0 ? freeSpot({ x: 0.1, y: -1 }, 150) : freeSpot(p, 110);
    const n = { id: uid('new-node'), label: 'New node', tier: Math.min((p.tier ?? 1) + 1, 3), group: p.group === 'hub' ? 'custom' : p.group, parent: p.id, x: Math.round(spot.x), y: Math.round(spot.y), blurb: '' };
    if (n.group === 'custom') n.colour = '#D85A30';
    M.nodes.push(n);
    M.flows.push({ from: p.id, to: n.id, type: p.tier === 0 ? 'resource' : 'sub' });
    rebuild(); select(n.id); setStatus('Added a child node. Rename it with the Text tools.');
  },
  addNode(){
    snapshot();
    const spot = freeSpot({ x: 0.1, y: 1 }, 200);
    const n = { id: uid('new-node'), label: 'New node', tier: 2, group: 'custom', colour: '#D85A30', x: Math.round(spot.x), y: Math.round(spot.y), blurb: '' };
    M.nodes.push(n); rebuild(); select(n.id); setStatus('Added a free node. Drag it into place, then Link it.');
  },
  link(){
    if (!sel){ setStatus('Select the node the flow starts from, then press Link.'); return; }
    mode = mode === 'link' ? null : 'link';
    setStatus(mode ? `Link from ${byId(sel).label}: now select the target node (type: ${flowType}${twoWay ? ', two-way' : ''}).` : 'Link cancelled.');
    refreshUI();
  },
  del(){
    if (selFlow >= 0){ snapshot(); M.flows.splice(selFlow, 1); selFlow = -1; rebuild(); setStatus('Flow deleted.'); return; }
    const n = sel && byId(sel); if (!n) { setStatus('Select a node or flow to delete.'); return; }
    if (n.tier === 0){ setStatus('Resources is the hub of the model and cannot be deleted.'); return; }
    snapshot();
    M.nodes = M.nodes.filter(x => x.id !== n.id);
    M.nodes.forEach(x => { if (x.parent === n.id) delete x.parent; });
    M.flows = M.flows.filter(f => f.from !== n.id && f.to !== n.id);
    sel = null; rebuild(); setStatus(`Deleted ${n.label}.`);
  },
  undo(){ const s = undo.pop(); if (!s){ setStatus('Nothing to undo.'); return; } M = normalise(JSON.parse(s)); sel = null; selFlow = -1; rebuild(); setStatus('Undone.'); },
  save(){ try { const out = structuredClone(M); delete out._fromSave; localStorage.setItem(SAVE_KEY, JSON.stringify(out)); setStatus('Saved in this browser. The 2D view on this site can load it too.'); } catch { setStatus('Could not save in this browser.'); } },
  reset(){ snapshot(); M = normalise(structuredClone(DARQ_STACK)); sel = null; selFlow = -1; buildStart = performance.now(); rebuild(); setStatus('Reset to draft v3. Press Save to keep this, or Undo to go back.'); },
  exportJson(){
    const out = structuredClone(M); delete out._fromSave;
    const d = new Date(); const stamp = d.toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${stamp}-darq-stack-model.json`; a.click();
    setStatus('Exported JSON. Import it into the 2D view or back into this editor.');
  },
  importJson(){ document.getElementById('importFile').click(); },
  sizeUp(){ editNode(n => n.scale = Math.min(3, (n.scale || 1) * 1.15)); },
  sizeDown(){ editNode(n => n.scale = Math.max(0.4, (n.scale || 1) / 1.15)); },
  raise(){ editNode(n => n.h = Math.min(0.9, nodeHeight(n) + 0.03)); },
  lower(){ editNode(n => n.h = Math.max(0.03, nodeHeight(n) - 0.03)); },
  twoWay(){ twoWay = !twoWay; if (selFlow >= 0){ snapshot(); M.flows[selFlow].both = twoWay || undefined; buildFlows(); updateSelectionVisuals(); } refreshUI(); },
  coreLayer(){ if (selFlow < 0) { setStatus('Select a cross-flow first.'); return; } snapshot(); const f = M.flows[selFlow]; f.core = !f.core; buildFlows(); updateSelectionVisuals(); setStatus(f.core ? 'Flow shown on the core layer.' : 'Flow moved to the full layer only.'); refreshUI(); },
  rename(){ startText('label'); }, subtitle(){ startText('sub'); }, blurb(){ startText('blurb'); },
  'm:left'(){ root.rotation.y += Math.PI / 12; }, 'm:right'(){ root.rotation.y -= Math.PI / 12; },
  'm:smaller'(){ root.scale.setScalar(Math.max(0.35, root.scale.x / 1.15)); }, 'm:bigger'(){ root.scale.setScalar(Math.min(3, root.scale.x * 1.15)); },
  'm:centre'(){ root.position.set(0, 0.85, -0.85); root.rotation.set(0, 0, 0); root.scale.setScalar(1); placePanelDefault(); },
  'lay:returns'(){ layers.returns = !layers.returns; applyFlowVisibility(); refreshUI(); },
  'lay:analytics'(){ layers.analytics = !layers.analytics; applyFlowVisibility(); refreshUI(); },
  'lay:streams'(){ layers.streams = !layers.streams; applyFlowVisibility(); refreshUI(); },
  'lay:labels'(){ layers.labels = !layers.labels; applyFlowVisibility(); refreshUI(); },
  'lay:motion'(){ layers.motion = !layers.motion; refreshUI(); }
};
for (const [s] of SHAPES) ACTIONS['shape:' + s] = () => editNode(n => n.shape = s);
for (const c of SWATCHES) ACTIONS['col:' + c] = () => editNode(n => n.colour = c);
for (const t of FLOW_TYPES) ACTIONS['ft:' + t] = () => {
  flowType = t;
  if (selFlow >= 0){ snapshot(); M.flows[selFlow].type = t; if (t === 'cross' && M.flows[selFlow].core === undefined) M.flows[selFlow].core = true; buildFlows(); updateSelectionVisuals(); }
  refreshUI();
};
for (const v of ['off', 'core', 'all']) ACTIONS['cross:' + v] = () => { layers.cross = v; applyFlowVisibility(); refreshUI(); };
function editNode(fn){
  const n = sel && byId(sel); if (!n){ setStatus('Select a node first.'); return; }
  snapshot(); fn(n); rebuild();
}
function doAction(id){ const f = ACTIONS[id]; if (f) f(); panelDirty = true; }

// tool definitions shared by the desktop panel and the in-headset panel
function toolRows(){
  const n = sel && byId(sel);
  const f = selFlow >= 0 ? M.flows[selFlow] : null;
  return [
    { k: 'Build', items: [['addChild', 'Add child', { dis: !n }], ['addNode', 'Add node'], ['link', 'Link to…', { on: mode === 'link', dis: !n }], ['del', 'Delete', { dis: !n && !f }]] },
    { k: 'Text', items: [['rename', 'Rename', { dis: !n }], ['subtitle', 'Subtitle', { dis: !n }], ['blurb', 'Description', { dis: !n }]] },
    { k: 'Shape', items: SHAPES.map(([s, g]) => ['shape:' + s, g, { on: n && (n.shape || 'sphere') === s, dis: !n }]) },
    { k: 'Colour', items: SWATCHES.map(c => ['col:' + c, '', { sw: c, on: n && nodeColour(n).toLowerCase() === c.toLowerCase(), dis: !n }]) },
    { k: 'Size and height', items: [['sizeDown', 'Size −', { dis: !n }], ['sizeUp', 'Size +', { dis: !n }], ['lower', 'Lower', { dis: !n }], ['raise', 'Raise', { dis: !n }]] },
    { k: f ? 'Selected flow type' : 'New link type', items: [...FLOW_TYPES.map(t => ['ft:' + t, t, { on: flowType === t }]), ['twoWay', 'Two-way', { on: twoWay }], ['coreLayer', 'Core', { on: f && f.core, dis: !f || f.type !== 'cross' }]] },
    { k: 'Layers', items: [['cross:off', 'Cross off', { on: layers.cross === 'off' }], ['cross:core', 'Cross core', { on: layers.cross === 'core' }], ['cross:all', 'Cross all', { on: layers.cross === 'all' }], ['lay:returns', 'Returns', { on: layers.returns }], ['lay:analytics', 'Analytics', { on: layers.analytics }], ['lay:streams', 'Data streams', { on: layers.streams }], ['lay:labels', 'Labels', { on: layers.labels }], ['lay:motion', 'Motion', { on: layers.motion }]] },
    ...(renderer.xr.isPresenting ? [{ k: 'Model', items: [['m:left', 'Turn ⟲'], ['m:right', 'Turn ⟳'], ['m:smaller', 'Smaller'], ['m:bigger', 'Bigger'], ['m:centre', 'Recentre']] }] : []),
    { k: 'File', items: [['undo', 'Undo', { dis: !undo.length }], ['save', 'Save'], ['reset', 'Reset to v3'], ['exportJson', 'Export JSON'], ...(renderer.xr.isPresenting ? [] : [['importJson', 'Import JSON']])] }
  ];
}

// ---------- desktop panel ----------
const toolsEl = document.getElementById('tools'), selBox = document.getElementById('selBox');
function refreshUI(){
  panelDirty = true;
  const n = sel && byId(sel);
  if (n){
    selBox.innerHTML = `<div class="k">Label</div><input id="fLabel" value="${esc(n.label)}">
      <div class="k">Subtitle</div><input id="fSub" value="${esc(n.sub || '')}" placeholder="optional">
      <div class="k">Description</div><textarea id="fBlurb">${esc(n.blurb || '')}</textarea>`;
    const bind = (id, key) => { const e = document.getElementById(id); e.addEventListener('focus', () => snapshot(), { once: true }); e.addEventListener('input', () => { n[key] = e.value || (key === 'label' ? 'Untitled' : ''); if (key !== 'blurb') relabel(n); panelDirty = true; }); };
    bind('fLabel', 'label'); bind('fSub', 'sub'); bind('fBlurb', 'blurb');
  } else if (selFlow >= 0){
    const f = M.flows[selFlow]; const nm = x => x === 'analytics' ? 'Metrics & analytics' : byId(x)?.label;
    selBox.innerHTML = `<div class="k">Selected flow</div><div style="font-size:14px">${esc(nm(f.from))} → ${esc(nm(f.to))}</div><div class="k">Type: ${f.type}${f.both ? ' · two-way' : ''}${f.type === 'cross' ? (f.core ? ' · core layer' : ' · full layer') : ''}</div>`;
  } else selBox.innerHTML = `<div style="font-size:13px;line-height:1.55;color:#6b6a64">Nothing selected. Click a node or a flow in the model.</div>`;
  toolsEl.innerHTML = toolRows().map(r => `<div class="row"><div class="k">${r.k}</div><div class="b">${r.items.map(([id, label, o = {}]) =>
    `<button data-a="${id}" class="${o.on ? 'on' : ''} ${o.sw ? 'sw' : ''}" ${o.dis ? 'disabled' : ''} ${o.sw ? `style="background:${o.sw}" aria-label="Colour ${o.sw}"` : ''} title="${label || id}">${label}</button>`).join('')}</div></div>`).join('');
  toolsEl.querySelectorAll('button').forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'rename' || a === 'subtitle' || a === 'blurb'){ document.getElementById({ rename: 'fLabel', subtitle: 'fSub', blurb: 'fBlurb' }[a])?.focus(); return; }
    doAction(a);
  });
  document.getElementById('status').textContent = statusText;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function relabel(n){
  const o = nodeObjs.get(n.id); if (!o) return;
  const fresh = labelSprite(n); o.lab.material.map.dispose(); o.lab.material.map = fresh.material.map; o.lab.scale.copy(fresh.scale); placeLabel(n);
}
document.getElementById('collapse').onclick = e => { const p = document.getElementById('panel'); p.classList.toggle('collapsed'); e.target.textContent = p.classList.contains('collapsed') ? 'Show' : 'Hide'; fitView(); };
document.getElementById('importFile').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  try { const j = JSON.parse(await file.text()); if (!j.nodes || !j.flows) throw 0; snapshot(); M = normalise(j); sel = null; selFlow = -1; rebuild(); setStatus('Imported. Press Save to keep it in this browser.'); }
  catch { setStatus('That file is not a DARQ STACK export.'); }
  e.target.value = '';
};

// ---------- desktop pointer interaction ----------
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let drag = null, downAt = null;
function pick(r){
  const hits = r.intersectObjects([...nodeG.children, ...flowObjs.filter(o => o.on && o.hit).map(o => (o.hit.visible = true, o.hit))], false);
  flowObjs.forEach(o => o.hit && (o.hit.visible = false));
  return hits[0] || null;
}
canvas.addEventListener('pointerdown', e => {
  if (renderer.xr.isPresenting) return;
  downAt = { x: e.clientX, y: e.clientY };
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const h = pick(ray);
  if (h && h.object.userData.nodeId){
    const n = byId(h.object.userData.nodeId);
    controls.enabled = false;
    const wp = root.localToWorld(nodeLocal(n));
    drag = { id: n.id, moved: false, plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -wp.y), vplane: new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize().negate(), wp), startY: e.clientY, startH: nodeHeight(n), off: null };
    const ip = new THREE.Vector3(); ray.ray.intersectPlane(drag.plane, ip); drag.off = wp.clone().sub(ip);
    canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener('pointermove', e => {
  if (renderer.xr.isPresenting) return;
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (!drag){
    const h = pick(ray); const id = h?.object.userData.nodeId;
    setHover(id); canvas.style.cursor = h ? 'pointer' : 'grab';
    return;
  }
  const n = byId(drag.id);
  if (!drag.moved && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 4) return;
  if (!drag.moved){ snapshot(); drag.moved = true; if (sel !== n.id) select(n.id); }
  if (e.shiftKey){
    n.h = Math.max(0.03, Math.min(0.9, drag.startH + (drag.startY - e.clientY) * 0.0025));
  } else {
    const ip = new THREE.Vector3();
    drag.plane.constant = -root.localToWorld(nodeLocal(n)).y;
    if (ray.ray.intersectPlane(drag.plane, ip)){ ip.add(drag.off); const lp = root.worldToLocal(ip); n.x = Math.round(lp.x / S); n.y = Math.round(lp.z / S); }
    drag.startY = e.clientY; drag.startH = nodeHeight(n);
  }
  placeLabel(n); refreshNodeFlows(n.id); updateSelectionVisuals();
});
canvas.addEventListener('pointerup', e => {
  if (renderer.xr.isPresenting) return;
  const click = downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 4;
  if (drag){
    if (!drag.moved) select(drag.id); else { buildFlows(); updateSelectionVisuals(); setStatus(`Moved ${byId(drag.id).label}.`); }
    drag = null; controls.enabled = true;
  } else if (click){
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = pick(ray);
    if (h && h.object.userData.flowIdx !== undefined) selectFlow(h.object.userData.flowIdx);
    else select(null);
  }
  downAt = null;
});
addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input,textarea')) return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && (sel || selFlow >= 0)) { e.preventDefault(); doAction('del'); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z'){ e.preventDefault(); doAction('undo'); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's'){ e.preventDefault(); doAction('save'); }
  if (e.key === 'Escape'){ mode = null; select(null); }
});
let hoverId = null;
function setHover(id){
  hoverId = id || null;
  const n = id && byId(id);
  if (n && id !== sel){ hoverRing.visible = true; hoverRing.scale.setScalar(nodeRadius(n) * 1.25); hoverRing.position.copy(nodeLocal(n)); }
  else hoverRing.visible = false;
}

// ---------- in-headset panel and keyboard ----------
const PW = 1024, PH = 1408;
const pCanvas = document.createElement('canvas'); pCanvas.width = PW; pCanvas.height = PH;
const pCtx = pCanvas.getContext('2d');
const pTex = new THREE.CanvasTexture(pCanvas); pTex.colorSpace = THREE.SRGBColorSpace;
const panel3d = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46 * PH / PW), new THREE.MeshBasicMaterial({ map: pTex, transparent: true, toneMapped: false }));
panel3d.visible = false; panel3d.userData.ui = 'panel'; panel3d.renderOrder = 10;
scene.add(panel3d);
let panelRects = [], panelHover = null, panelDirty = true;

function drawPanel(){
  const g = pCtx; g.clearRect(0, 0, PW, PH);
  g.fillStyle = 'rgba(251,250,246,0.97)'; roundRect(g, 0, 0, PW, PH, 36); g.fill();
  g.fillStyle = '#1d1d1b'; roundRect(g, 0, 0, PW, 92, 36); g.fill(); g.fillRect(0, 50, PW, 42);
  g.fillStyle = '#f3f1ea'; g.font = '40px Georgia, serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillText('DARQ STACK · editor', 34, 48);
  g.textAlign = 'right'; g.font = '26px Georgia, serif'; g.fillStyle = '#aeb3c2'; g.fillText('drag this bar to move', PW - 34, 48);
  panelRects = [{ id: '__header', x: 0, y: 0, w: PW, h: 92 }];
  // selection
  let y = 120;
  const n = sel && byId(sel), f = selFlow >= 0 ? M.flows[selFlow] : null;
  g.textAlign = 'left'; g.fillStyle = '#1d1d1b'; g.font = '36px Georgia, serif';
  const nm = x => x === 'analytics' ? 'Metrics & analytics' : byId(x)?.label;
  g.fillText(n ? n.label : f ? `${nm(f.from)} → ${nm(f.to)}` : 'Nothing selected', 34, y + 18);
  g.font = 'italic 26px Georgia, serif'; g.fillStyle = '#6b6a64';
  const msg = mode === 'link' ? 'Link mode: select the target node.' : n ? (n.sub || n.blurb || '') : f ? `${f.type}${f.both ? ' · two-way' : ''}` : 'Point at a node or flow and pull the trigger.';
  wrapText(g, msg, 34, y + 62, PW - 68, 32, 2);
  y = 230;
  for (const r of toolRows()){
    g.font = '22px Georgia, serif'; g.fillStyle = '#6b6a64'; g.textAlign = 'left'; g.fillText(r.k.toUpperCase(), 34, y + 10);
    y += 30;
    let x = 34; const bh = 62;
    for (const [id, label, o = {}] of r.items){
      g.font = '28px Georgia, serif';
      const bw = o.sw ? 62 : Math.max(76, g.measureText(label).width + 36);
      if (x + bw > PW - 34){ x = 34; y += bh + 12; }
      const hov = panelHover === id && !o.dis;
      g.globalAlpha = o.dis ? 0.35 : 1;
      if (o.sw){
        g.fillStyle = o.sw; g.beginPath(); g.arc(x + 31, y + 31, 27, 0, 7); g.fill();
        g.lineWidth = o.on ? 6 : hov ? 4 : 1.5; g.strokeStyle = o.on ? '#1d1d1b' : hov ? '#E9B22E' : '#d9d6cc'; g.stroke();
      } else {
        g.fillStyle = o.on ? '#1d1d1b' : hov ? '#fff4d6' : '#ffffff'; roundRect(g, x, y, bw, bh, 14); g.fill();
        g.lineWidth = hov ? 3 : 1.5; g.strokeStyle = hov ? '#E9B22E' : '#d9d6cc'; g.stroke();
        g.fillStyle = o.on ? '#ffffff' : '#1d1d1b'; g.textAlign = 'center'; g.fillText(label, x + bw / 2, y + bh / 2 + 1);
      }
      g.globalAlpha = 1;
      if (!o.dis) panelRects.push({ id, x, y, w: bw, h: bh });
      x += bw + 12;
    }
    y += bh + 22;
  }
  g.textAlign = 'left'; g.font = '24px Georgia, serif'; g.fillStyle = '#6b6a64';
  wrapText(g, statusText, 34, Math.min(y + 14, PH - 90), PW - 68, 30, 3);
  pTex.needsUpdate = true; panelDirty = false;
}
function wrapText(g, s, x, y, w, lh, max){
  const words = String(s || '').split(' '); let line = '', k = 0;
  for (const wd of words){ const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w && line){ g.fillText(line, x, y + k * lh); k++; line = wd; if (k >= max) return; } else line = t; }
  if (line && k < max) g.fillText(k === max - 1 && words.length ? line : line, x, y + k * lh);
}

// keyboard
const KW = 1024, KH = 470;
const kCanvas = document.createElement('canvas'); kCanvas.width = KW; kCanvas.height = KH;
const kCtx = kCanvas.getContext('2d');
const kTex = new THREE.CanvasTexture(kCanvas); kTex.colorSpace = THREE.SRGBColorSpace;
const kb3d = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.56 * KH / KW), new THREE.MeshBasicMaterial({ map: kTex, transparent: true, toneMapped: false }));
kb3d.visible = false; kb3d.userData.ui = 'kb'; kb3d.renderOrder = 11;
scene.add(kb3d);
let kb = null; // { key, buf, shift }
let kbRects = [], kbHover = null;
const KROWS = [['1','2','3','4','5','6','7','8','9','0','⌫'], ['q','w','e','r','t','y','u','i','o','p','&'], ['a','s','d','f','g','h','j','k','l','-','·'], ['⇧','z','x','c','v','b','n','m',',','.','/'], ['Cancel','space','Done']];
function startText(key){
  const n = sel && byId(sel); if (!n) { setStatus('Select a node first.'); return; }
  if (!renderer.xr.isPresenting) return;
  kb = { key, buf: n[key] || '', shift: false };
  kb3d.visible = true; placeKeyboard(); drawKb();
}
function drawKb(){
  const g = kCtx; g.clearRect(0, 0, KW, KH);
  g.fillStyle = 'rgba(29,29,27,0.96)'; roundRect(g, 0, 0, KW, KH, 30); g.fill();
  g.fillStyle = '#fbfaf6'; roundRect(g, 20, 16, KW - 40, 70, 14); g.fill();
  g.fillStyle = '#1d1d1b'; g.font = '32px Georgia, serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
  const label = { label: 'Label', sub: 'Subtitle', blurb: 'Description' }[kb.key];
  let shown = kb.buf + '|'; g.font = '30px Georgia, serif';
  while (g.measureText(label + ': ' + shown).width > KW - 80 && shown.length > 4) shown = '…' + shown.slice(2);
  g.fillText(label + ': ' + shown, 38, 52);
  kbRects = [];
  let y = 100; const kh = 66;
  KROWS.forEach((row, ri) => {
    const wide = { space: 420, Done: 200, Cancel: 200 };
    const total = row.reduce((s, k) => s + (wide[k] || 82), 0) + (row.length - 1) * 8;
    let x = (KW - total) / 2;
    for (const k of row){
      const w = wide[k] || 82; const hov = kbHover === k;
      g.fillStyle = k === 'Done' ? '#C8102E' : hov ? '#4a5170' : (k === '⇧' && kb.shift) ? '#E9B22E' : '#33394f';
      roundRect(g, x, y, w, kh, 12); g.fill();
      g.fillStyle = '#f3f1ea'; g.textAlign = 'center'; g.font = '30px Georgia, serif';
      const cap = k.length === 1 && kb.shift ? k.toUpperCase() : k;
      g.fillText(cap === 'space' ? '' : cap, x + w / 2, y + kh / 2 + 1);
      kbRects.push({ id: k, x, y, w, h: kh });
      x += w + 8;
    }
    y += kh + 8;
  });
  kTex.needsUpdate = true;
}
function pressKey(k){
  const n = sel && byId(sel); if (!kb || !n) return;
  if (k === 'Done'){ snapshot(); n[kb.key] = kb.buf.trim() || (kb.key === 'label' ? 'Untitled' : ''); if (!n[kb.key]) delete n[kb.key]; kb = null; kb3d.visible = false; relabel(n); refreshUI(); setStatus('Text updated.'); return; }
  if (k === 'Cancel'){ kb = null; kb3d.visible = false; return; }
  if (k === '⌫') kb.buf = kb.buf.slice(0, -1);
  else if (k === '⇧') kb.shift = !kb.shift;
  else if (k === 'space') kb.buf += ' ';
  else if (k === '·') kb.buf += ' · ';
  else { kb.buf += kb.shift ? k.toUpperCase() : k; if (kb.shift && /[a-z]/.test(k)) kb.shift = false; }
  drawKb();
}
function placePanelDefault(){
  panel3d.position.set(-0.68, 1.22, -0.62);
  panel3d.lookAt(0, 1.4, 0.3);
  placeKeyboard();
}
function placeKeyboard(){
  kb3d.position.copy(panel3d.position).add(new THREE.Vector3(0.34, -0.36, 0.14));
  kb3d.lookAt(0, 1.55, 0.35);
}
function uiHit(obj, uv, rects, W, H){
  const x = uv.x * W, y = (1 - uv.y) * H;
  return rects.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)?.id || null;
}

// ---------- XR controllers ----------
const ctrlModelFactory = new XRControllerModelFactory();
const handModelFactory = new XRHandModelFactory();
const ctrls = [];
for (let i = 0; i < 2; i++){
  const c = renderer.xr.getController(i);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineBasicMaterial({ color: '#f3f1ea', transparent: true, opacity: 0.7 }));
  line.scale.z = 2; c.add(line);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), new THREE.MeshBasicMaterial({ color: '#E9B22E' }));
  dot.visible = false; scene.add(dot);
  const st = { c, line, dot, src: null, grab: null, press: null };
  c.addEventListener('connected', e => { st.src = e.data; line.visible = e.data.targetRayMode === 'tracked-pointer'; });
  c.addEventListener('disconnected', () => { st.src = null; });
  c.addEventListener('selectstart', () => onSelectStart(st));
  c.addEventListener('selectend', () => onSelectEnd(st));
  c.addEventListener('squeezestart', () => onSqueezeStart(st));
  c.addEventListener('squeezeend', () => onRelease(st));
  scene.add(c);
  const grip = renderer.xr.getControllerGrip(i); grip.add(ctrlModelFactory.createControllerModel(grip)); scene.add(grip);
  const hand = renderer.xr.getHand(i); hand.add(handModelFactory.createHandModel(hand, 'mesh')); scene.add(hand);
  ctrls.push(st);
}
const xrRay = new THREE.Raycaster();
const tmpMat = new THREE.Matrix4();
function controllerRay(st){
  tmpMat.identity().extractRotation(st.c.matrixWorld);
  xrRay.ray.origin.setFromMatrixPosition(st.c.matrixWorld);
  xrRay.ray.direction.set(0, 0, -1).applyMatrix4(tmpMat);
  xrRay.far = 6;
  return xrRay;
}
function xrPick(st){
  const r = controllerRay(st);
  const ui = r.intersectObjects([kb3d, panel3d].filter(o => o.visible), false)[0];
  const h = pick(r);
  if (ui && (!h || ui.distance <= h.distance)) return { ui: ui.object.userData.ui, uv: ui.uv, point: ui.point, distance: ui.distance };
  if (h) return { node: h.object.userData.nodeId, flow: h.object.userData.flowIdx, point: h.point, distance: h.distance };
  const p = r.intersectObjects(plinthG.children, false)[0];
  if (p) return { plinth: true, point: p.point, distance: p.distance };
  return null;
}
function beginGrab(st, kind, obj, id){
  st.c.updateMatrixWorld();
  const inv = st.c.matrixWorld.clone().invert();
  const target = kind === 'node' ? nodeObjs.get(id).mesh : obj;
  target.updateMatrixWorld();
  st.grab = { kind, id, obj, rel: inv.multiply(target.matrixWorld.clone()), start: new THREE.Vector3().setFromMatrixPosition(st.c.matrixWorld), moved: false };
}
function onSelectStart(st){
  const h = xrPick(st); if (!h) { st.press = { empty: true }; return; }
  if (h.ui === 'kb'){ const k = uiHit(kb3d, h.uv, kbRects, KW, KH); if (k) pressKey(k); return; }
  if (h.ui === 'panel'){
    const id = uiHit(panel3d, h.uv, panelRects, PW, PH);
    if (id === '__header') beginGrab(st, 'panel', panel3d);
    else if (id) doAction(id);
    return;
  }
  if (h.node){ beginGrab(st, 'node', null, h.node); st.press = { node: h.node }; return; }
  if (h.flow !== undefined){ selectFlow(h.flow); return; }
  st.press = { empty: true };
}
function onSelectEnd(st){
  const g = st.grab;
  if (g && g.kind === 'node'){
    if (!g.moved) select(g.id); else { buildFlows(); updateSelectionVisuals(); setStatus(`Moved ${byId(g.id).label}.`); }
  } else if (st.press?.empty && !g) { select(null); }
  st.grab = null; st.press = null;
}
function onSqueezeStart(st){
  const h = xrPick(st);
  if (h?.node){ beginGrab(st, 'node', null, h.node); return; }
  beginGrab(st, 'model', root);
}
function onRelease(st){ onSelectEnd(st); }
const tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();
function updateGrab(st){
  const g = st.grab; if (!g) return;
  const now = new THREE.Vector3().setFromMatrixPosition(st.c.matrixWorld);
  if (!g.moved && now.distanceTo(g.start) < 0.012) return;
  if (!g.moved){ g.moved = true; if (g.kind === 'node'){ snapshot(); if (sel !== g.id) { sel = g.id; selFlow = -1; refreshUI(); } } }
  const m = st.c.matrixWorld.clone().multiply(g.rel);
  m.decompose(tmpP, tmpQ, tmpS);
  if (g.kind === 'node'){
    const n = byId(g.id); const lp = root.worldToLocal(tmpP.clone());
    n.x = Math.round(lp.x / S); n.y = Math.round(lp.z / S); n.h = Math.max(0.02, Math.min(1.2, +lp.y.toFixed(3)));
    placeLabel(n); refreshNodeFlows(n.id); updateSelectionVisuals();
  } else if (g.kind === 'model'){
    const e = new THREE.Euler().setFromQuaternion(tmpQ, 'YXZ');
    root.position.copy(tmpP); root.rotation.set(0, e.y, 0);
  } else if (g.kind === 'panel'){
    panel3d.position.copy(tmpP); panel3d.quaternion.copy(tmpQ); placeKeyboard();
  }
}
function updateXRHover(){
  let pHover = null, kHover = null, nHover = null;
  for (const st of ctrls){
    if (!st.src) { st.dot.visible = false; continue; }
    updateGrab(st);
    const h = xrPick(st);
    st.line.scale.z = h ? h.distance : 2;
    st.dot.visible = !!h; if (h) st.dot.position.copy(h.point);
    if (h?.ui === 'panel') pHover = uiHit(panel3d, h.uv, panelRects, PW, PH);
    if (h?.ui === 'kb') kHover = uiHit(kb3d, h.uv, kbRects, KW, KH);
    if (h?.node) nHover = h.node;
    // thumbstick: scale and rotate the model
    const gp = st.src.gamepad;
    if (gp && gp.axes.length >= 4 && st.src.handedness === 'right'){
      const ax = gp.axes[2], ay = gp.axes[3];
      if (Math.abs(ax) > 0.2) root.rotation.y -= ax * 0.025;
      if (Math.abs(ay) > 0.2) root.scale.setScalar(THREE.MathUtils.clamp(root.scale.x * (1 - ay * 0.012), 0.35, 3));
    }
  }
  if (pHover !== panelHover){ panelHover = pHover; panelDirty = true; }
  if (kHover !== kbHover){ kbHover = kHover; if (kb) drawKb(); }
  setHover(nHover);
}

// ---------- entering VR and MR ----------
const btnVR = document.getElementById('enterVR'), btnMR = document.getElementById('enterMR');
let xrMode = null;
async function startXR(kind){
  const opts = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] };
  try {
    const session = await navigator.xr.requestSession(kind === 'mr' ? 'immersive-ar' : 'immersive-vr', opts);
    xrMode = kind;
    session.addEventListener('end', onXREnd);
    await renderer.xr.setSession(session);
    onXRStart();
  } catch (err){ setStatus(`Could not start ${kind.toUpperCase()}: ${err.message || err}`); }
}
function onXRStart(){
  controls.enabled = false;
  const mr = xrMode === 'mr';
  scene.background = mr ? null : BG;
  renderer.setClearColor(0x000000, mr ? 0 : 1);
  world.visible = !mr;
  root.position.set(0, 0.85, -0.85); root.rotation.set(0, 0, 0); root.scale.setScalar(1);
  placePanelDefault(); panel3d.visible = true; panelDirty = true;
  refreshUI();
}
function onXREnd(){
  xrMode = null; kb = null; kb3d.visible = false; panel3d.visible = false;
  scene.background = BG; world.visible = false; renderer.setClearColor(0x000000, 1);
  root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.scale.setScalar(1);
  controls.enabled = true; refreshUI();
}
if ('xr' in navigator){
  navigator.xr.isSessionSupported('immersive-vr').then(ok => { btnVR.disabled = !ok; if (!ok) btnVR.title = 'VR is not available in this browser'; }).catch(() => {});
  navigator.xr.isSessionSupported('immersive-ar').then(ok => { btnMR.disabled = !ok; if (!ok) btnMR.title = 'Mixed reality is not available in this browser'; }).catch(() => {});
} else { btnVR.title = btnMR.title = 'WebXR is not available in this browser'; }
btnVR.onclick = () => startXR('vr');
btnMR.onclick = () => startXR('mr');

// ---------- animation loop ----------
const clock = new THREE.Clock();
let tAcc = 0;
function animate(){
  const dt = Math.min(clock.getDelta(), 0.05);
  if (layers.motion) tAcc += dt;
  const since = (performance.now() - buildStart) / 1000;
  // build-in and hub pulse
  for (const m of nodeG.children){
    const k = reduceMotion ? 1 : THREE.MathUtils.clamp((since - m.userData.appear) / 0.6, 0, 1);
    const e = 1 - Math.pow(1 - k, 3);
    const n = byId(m.userData.nodeId); const r = m.userData.r;
    const pulse = n && n.tier === 0 && layers.motion ? 1 + 0.035 * Math.sin(tAcc * 2.6) : 1;
    m.scale.setScalar(Math.max(0.0001, r * e * pulse));
    if (n && n.shape === 'torus') m.rotation.x = Math.PI / 2;
    if (n && (n.shape === 'crystal' || n.shape === 'cube') && layers.motion) m.rotation.y = tAcc * 0.3;
  }
  const flowsOn = reduceMotion || since > 2.4;
  flowG.visible = flowsOn;
  selRing.rotation.z = tAcc * 0.8;
  // particles
  let i = 0;
  if (flowsOn){
    for (const o of flowObjs){
      if (!o.on) continue;
      const { pc, ps, pr } = o.st;
      const len = o.curve.getLength() || 0.1;
      for (let k = 0; k < pc && i < MAXP; k++){
        let u = ((tAcc * ps / Math.max(len, 0.12)) * 0.25 + k / pc) % 1;
        if (o.f.both && k % 2) u = 1 - u;
        o.curve.getPointAt(u, tmpV);
        const fade = Math.min(1, u * 8, (1 - u) * 8);
        const sc = pr * (layers.motion ? fade : 0);
        tmpM.makeScale(sc, sc, sc).setPosition(tmpV);
        parts.setMatrixAt(i, tmpM);
        parts.setColorAt(i, tmpC.copy(o.col).multiplyScalar(1.25));
        i++;
      }
    }
  }
  parts.count = i;
  parts.instanceMatrix.needsUpdate = true; if (parts.instanceColor) parts.instanceColor.needsUpdate = true;
  if (renderer.xr.isPresenting){ updateXRHover(); if (panelDirty) drawPanel(); }
  else controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
function fitView(){
  camera.aspect = innerWidth / innerHeight; renderer.setSize(innerWidth, innerHeight);
  const open = !document.getElementById('panel').classList.contains('collapsed') && innerWidth > 760;
  if (open) camera.setViewOffset(innerWidth, innerHeight, 180, 0, innerWidth, innerHeight); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
addEventListener('resize', fitView); fitView();

rebuild();
setStatus(statusText);
window.__darq = { get model(){ return M; }, doAction, select, selectFlow, layers, rebuild, drawPanel: () => { drawPanel(); return pCanvas.toDataURL(); }, startTextTest: key => { kb = { key, buf: byId(sel)?.[key] || '', shift: false }; drawKb(); return kCanvas.toDataURL(); } };
