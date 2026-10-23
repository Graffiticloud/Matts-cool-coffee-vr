/* The futures cone (after Hancock and Bezold, 1994; Voros, 2003, 2017) as a luminous object in dark space.
   Nested translucent shells open from the apex ("now") along the time axis, with the Clarke–Dator edge between the
   possible and the preposterous, Now–Near–Next gates, preferable and un-preferred lobes, and particles of time. */
import * as THREE from 'three';
import { TAU } from '../../engine/kit.js';
import { CONE } from './cone.js';

const RIM_VERT = `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const RIM_FRAG = `uniform vec3 uColor; uniform float uBase, uRim, uOpacity, uTime, uStripes; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
void main(){
  float rim = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  float a = uBase + uRim * pow(rim, 2.2);
  a *= smoothstep(0.0, 0.25, 1.0 - vUv.y);               // fade out towards the apex so "now" is a bright point, not a solid tip
  if(uStripes > 0.0) a *= 0.55 + 0.45 * sin(vUv.y * uStripes - uTime * 3.0);
  gl_FragColor = vec4(uColor, a * uOpacity);
}`;

export function build(kit){
  const L = CONE.length, A = new THREE.Vector3(...CONE.apex);
  const root = new THREE.Group(); root.position.copy(A); kit.anim(root); kit.world.add(root);
  const shaders = [];

  /* a cone shell from the apex (origin) to radius r at x = L, optionally tilted (rotation about z) */
  function shell(r, color, { base = 0.02, rim = 0.32, opacity = 1, stripes = 0, tilt = 0, len = L, seg = 72, parent = root } = {}){
    const geo = new THREE.ConeGeometry(r * len / L, len, seg, 1, true);
    geo.rotateZ(Math.PI / 2); geo.translate(len / 2, 0, 0); geo.scale(1, 1, CONE.depth);
    const mat = new THREE.ShaderMaterial({
      vertexShader:RIM_VERT, fragmentShader:RIM_FRAG, transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending,
      uniforms:{ uColor:{ value:new THREE.Color(color) }, uBase:{ value:base }, uRim:{ value:rim }, uOpacity:{ value:opacity }, uTime:{ value:0 }, uStripes:{ value:stripes } }
    });
    mat.userData.o = opacity;
    const m = new THREE.Mesh(geo, mat); m.rotation.z = tilt; m.renderOrder = 5; parent.add(m); shaders.push(mat);
    return m;
  }
  /* an ellipse at the far end of a shell, solid or dashed */
  function rimLine(r, color, { dashed = false, opacity = 0.9, x = L, tilt = 0, parent = root } = {}){
    const pts = new THREE.EllipseCurve(0, 0, r * x / L, r * x / L * CONE.depth, 0, TAU).getPoints(128).map(p => new THREE.Vector3(0, p.x, p.y));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize:0.25, gapSize:0.18, transparent:true, opacity, depthWrite:false })
      : new THREE.LineBasicMaterial({ color, transparent:true, opacity, depthWrite:false });
    const line = new THREE.Line(geo, mat); if(dashed) line.computeLineDistances();
    const g = new THREE.Group(); g.rotation.z = tilt; line.position.x = x; g.add(line); parent.add(g);
    return line;
  }
  /* dashed edges from the apex to the top and bottom of a shell's rim, as in the 2D diagram */
  function edges(r, color, { opacity = 0.75, tilt = 0, parent = root } = {}){
    for(const s of [1, -1]){
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(L, s * r, 0)]);
      const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize:0.3, gapSize:0.2, transparent:true, opacity, depthWrite:false }));
      line.computeLineDistances(); line.rotation.z = tilt; parent.add(line);
    }
  }

  /* ---------- the shells ---------- */
  shell(CONE.potential, 0x8a93a8, { base:0.004, rim:0.07, len:L * 1.12 });
  const zones = Object.fromEntries(CONE.zones.map(z => [z.id, z]));
  shell(zones.preposterous.r, 0xff3b30, { base:0.0, rim:0.09 }); rimLine(zones.preposterous.r, 0xff3b30, { dashed:true }); edges(zones.preposterous.r, 0xff3b30);
  const membrane = shell(CONE.membrane, 0xff5a3c, { base:0.012, rim:0.07, stripes:40 });
  shell(zones.possible.r, 0xf2f4f8, { base:0.004, rim:0.09 }); rimLine(zones.possible.r, 0xf2f4f8, { dashed:true, opacity:0.7 }); edges(zones.possible.r, 0xdfe3ea, { opacity:0.55 });
  shell(zones.plausible.r, 0x9aa4b8, { base:0.035, rim:0.14 }); rimLine(zones.plausible.r, 0xb8c0d0, { opacity:0.6 }); edges(zones.plausible.r, 0xb8c0d0, { opacity:0.5 });
  /* the beam (probable, projected, preferable lobes) sits in its own group so a wildcard can swing it to a new heading */
  const inner = new THREE.Group(); root.add(inner);
  const IN = { parent:inner };
  const probShell = shell(zones.probable.r, 0x2f80ed, { base:0.08, rim:0.3, ...IN }); rimLine(zones.probable.r, 0x4a95ff, { opacity:0.9, ...IN }); edges(zones.probable.r, 0x4a95ff, { opacity:0.7, ...IN });
  const pref = CONE.preferable, unp = CONE.unpreferred;
  shell(pref.r, pref.color, { base:0.07, rim:0.3, tilt:pref.tilt, ...IN }); rimLine(pref.r, pref.color, { tilt:pref.tilt, ...IN }); edges(pref.r, pref.color, { opacity:0.6, tilt:pref.tilt, ...IN });
  shell(unp.r, unp.color, { base:0.04, rim:0.22, tilt:unp.tilt, opacity:0.8, ...IN }); rimLine(unp.r, unp.color, { tilt:unp.tilt, dashed:true, opacity:0.7, ...IN });

  /* the projected future: a single bright dashed line, ending in a small light */
  let projected;
  {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(L * 1.08, 0, 0)]);
    const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color:0x6cc4ff, dashSize:0.4, gapSize:0.15, transparent:true })); line.computeLineDistances(); inner.add(line);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), new THREE.MeshBasicMaterial({ color:0x9fd8ff, toneMapped:false, transparent:true })); dot.position.x = L; inner.add(dot);
    projected = { line, dot };
  }
  /* the apex: "now", a bright point */
  const now = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), new THREE.MeshBasicMaterial({ color:0xffffff, toneMapped:false })); root.add(now);
  const halo = sprite(glowTex(), 1.3, 0xffffff); root.add(halo);
  /* the past: a vertical line through now, as in the diagram */
  {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -3.2, 0), new THREE.Vector3(0, 3.2, 0)]);
    const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color:0xc8cfdc, dashSize:0.15, gapSize:0.12, transparent:true, opacity:0.6 })); line.computeLineDistances(); root.add(line);
  }

  /* ---------- the Clarke–Dator edge: two-way arrows across the membrane, top and bottom ---------- */
  const arrowMat = new THREE.MeshBasicMaterial({ color:0xff3b30, toneMapped:false });
  for(const s of [1, -1]){
    const g = new THREE.Group(); g.position.set(L * 0.93, s * CONE.membrane * 0.93, 0); root.add(g);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 12), arrowMat); g.add(shaft);
    for(const d of [1, -1]){ const head = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 16), arrowMat); head.position.y = d * 0.62; head.rotation.z = d > 0 ? 0 : Math.PI; g.add(head); }
    g.userData.s = s;
    kit.onTick(({ t }) => { g.position.y = s * CONE.membrane * 0.93 + 0.08 * Math.sin(t * 2.5); });
  }

  /* ---------- Now, Near, Next gates ---------- */
  CONE.horizons.forEach((h, i) => {
    const x = h.to * L;
    if(i < CONE.horizons.length - 1){
      const rr = zones.preposterous.r * x / L;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color:0xc8d2e6, transparent:true, opacity:0.35, depthWrite:false, toneMapped:false }));
      ring.rotation.y = Math.PI / 2; ring.scale.set(1, 1, CONE.depth); ring.position.x = x; root.add(ring);
    }
    const from = i ? CONE.horizons[i - 1].to * L : 0;
    const lab = label(h.label.toUpperCase(), { size:46, color:'#c8d2e6', weight:800 }); lab.position.set((from + x) / 2, -zones.preposterous.r * ((from + x) / 2) / L - 0.7, 0); root.add(lab);
  });
  { const lab = label('TIME  →', { size:40, color:'#e8ecf4', weight:700 }); lab.position.set(L * 0.45, zones.preposterous.r * 0.45 + 1.4, 0); root.add(lab); }
  { const lab = label('THE PRESENT', { size:44, color:'#ffffff', weight:800 }); lab.position.set(-2.6, 1.0, 0); root.add(lab); }

  /* ---------- zone labels at the far end, as in the diagram ---------- */
  const labelSpec = [
    ['Preposterous!', '"impossible!" "won\'t ever happen!"', '#ff5a4f', zones.preposterous.r + 0.6],
    ['Possible', 'future knowledge · "might happen"', '#f2f4f8', zones.possible.r - 0.1],
    ['Plausible', 'current knowledge · "could happen"', '#b8c0d0', zones.plausible.r - 0.4],
    ['Projected', 'the "business as usual" baseline', '#6cc4ff', 0.75],
    ['Probable', 'current trends · "likely to happen"', '#4a95ff', -0.6],
    ['Preferable', 'value judgements · "should happen"', '#3fd06a', -zones.plausible.r + 0.3],
    ['Un-preferred', '"should not happen"', '#ff6b93', -zones.possible.r + 0.2],
    ['Potential', 'everything beyond the present', '#9aa3b6', -zones.preposterous.r - 0.7]
  ];
  for(const [t, sub, col, y] of labelSpec){
    const lab = label(t, { size:44, color:col, weight:800, sub, w:620 }); lab.position.set(L + 3.0, y, 0); root.add(lab);
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(L + 0.25, y * 0.82, 0), new THREE.Vector3(L + 1.0, y, 0)]);
    root.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color:new THREE.Color(col), transparent:true, opacity:0.6 })));
  }

  /* ---------- particles of time streaming from now ---------- */
  const N = 700, pos = new Float32Array(N * 3), seeds = [];
  for(let i = 0; i < N; i++) seeds.push({ a:Math.random() * TAU, r:Math.pow(Math.random(), 0.6), o:Math.random(), k:0.7 + Math.random() * 0.6 });
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pgeo, new THREE.PointsMaterial({ map:glowTex(), size:0.16, color:0xbfdcff, transparent:true, opacity:0.85, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false }));
  pts.frustumCulled = false; root.add(pts);
  const RP = zones.possible.r;
  kit.onTick(({ lt, t }) => {
    for(let i = 0; i < N; i++){
      const s = seeds[i], u = (lt / 10 * s.k + s.o) % 1, x = u * L, rr = s.r * RP * u;
      pos[i * 3] = x; pos[i * 3 + 1] = Math.cos(s.a + t * 0.05) * rr; pos[i * 3 + 2] = Math.sin(s.a + t * 0.05) * rr * CONE.depth;
    }
    pgeo.attributes.position.needsUpdate = true;
    for(const m of shaders) m.uniforms.uTime.value = t;
    halo.material.opacity = 0.75 + 0.25 * Math.sin(t * 2);
  });

  /* ---------- stars ---------- */
  {
    const M = 1400, sp = new Float32Array(M * 3);
    for(let i = 0; i < M; i++){ const v = new THREE.Vector3().randomDirection().multiplyScalar(45 + Math.random() * 20); sp.set([v.x, v.y, v.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(g, new THREE.PointsMaterial({ color:0x9fb0d0, size:0.09, transparent:true, opacity:0.7, depthWrite:false, toneMapped:false }));
    stars.userData.stars = true; kit.anim(stars); kit.world.add(stars);
  }

  /* ---------- helpers ---------- */
  function glowTex(){
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function sprite(tex, s, color){
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, color, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false }));
    m.scale.setScalar(s); return m;
  }
  function label(text, { size = 44, color = '#fff', weight = 700, sub = '', w = 520 } = {}){
    const H = sub ? 132 : 76, c = document.createElement('canvas'); c.width = w; c.height = H; const x = c.getContext('2d');
    x.font = `${weight} ${size}px "Bricolage Grotesque", system-ui, sans-serif`; x.fillStyle = color; x.textBaseline = 'top'; x.fillText(text, 8, 8, w - 16);
    if(sub){ x.font = `500 ${Math.round(size * 0.62)}px "Bricolage Grotesque", system-ui, sans-serif`; x.globalAlpha = 0.85; x.fillText(sub, 8, size + 22, w - 16); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map:t, transparent:true, depthWrite:false, toneMapped:false }));
    const sc = 0.012; m.scale.set(w * sc, H * sc, 1); m.center.set(0, 0.5); m.renderOrder = 20;
    document.fonts?.ready.then(() => { x.clearRect(0, 0, w, H); x.globalAlpha = 1; x.font = `${weight} ${size}px "Bricolage Grotesque", system-ui, sans-serif`; x.fillStyle = color; x.fillText(text, 8, 8, w - 16); if(sub){ x.font = `500 ${Math.round(size * 0.62)}px "Bricolage Grotesque", system-ui, sans-serif`; x.globalAlpha = 0.85; x.fillText(sub, 8, size + 22, w - 16); } t.needsUpdate = true; });
    return m;
  }

  /* gentle breathing of the membrane so the edge reads as alive */
  kit.onTick(({ t }) => { membrane.scale.set(1, 1 + 0.015 * Math.sin(t * 1.7), 1 + 0.015 * Math.sin(t * 1.7)); });

  /* ================= Drop B: time scrubber, wildcards, critique ================= */

  /* a sprite label whose text can change (the year at the apex) */
  function dynLabel(w, h, draw){
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map:t, transparent:true, depthWrite:false, toneMapped:false }));
    m.scale.set(w * 0.012, h * 0.012, 1); m.center.set(0, 0.5); m.renderOrder = 21;
    let last = null;
    m.set = v => { if(v === last) return; last = v; x.clearRect(0, 0, w, h); draw(x, v); t.needsUpdate = true; };
    return m;
  }
  const easeTo = (cur, want, k) => cur + (want - cur) * Math.min(1, k);

  /* ---------- time scrubber: ideas migrate between zones as the present moves ---------- */
  const tlG = new THREE.Group(); tlG.visible = false; root.add(tlG);
  const yearLab = dynLabel(560, 120, (x, v) => {
    x.font = '800 92px "Bricolage Grotesque", system-ui, sans-serif'; x.fillStyle = '#ffd34d'; x.textBaseline = 'middle'; x.fillText(String(v), 8, 62);
  });
  yearLab.position.set(-3.3, -0.25, 0); tlG.add(yearLab);
  let ideas = null;
  const zoneMid = id => { const i = CONE.zones.findIndex(z => z.id === id); if(i < 0) return CONE.zones[CONE.zones.length - 1].r * 1.12; return ((i ? CONE.zones[i - 1].r : 0) + CONE.zones[i].r) / 2; };
  const horizonMid = id => { const i = CONE.horizons.findIndex(h => h.id === id); return ((i > 0 ? CONE.horizons[i - 1].to : 0) + CONE.horizons[i].to) / 2; };
  function ideaPoint(state, d, k){
    if(state === 'past') return { p:new THREE.Vector3(-0.6, -2.3 - 0.6 * d.slot, 0), o:0.6 };
    if(state === 'now') return { p:new THREE.Vector3(0.7, d.side * 0.35, 0), o:1 };
    const [zid, hid] = state.split('/'), x = horizonMid(hid || 'next') * L * 0.62, R = zoneMid(zid) * x / L;
    return { p:new THREE.Vector3(x, Math.cos(d.a) * R * d.side, Math.sin(d.a) * R * CONE.depth), o:1 };
  }
  function buildIdeas(TL){
    const perSide = {};
    ideas = (TL.ideas || []).map((d0, slot) => {
      const d = { side:1, a:0.25, slot, ...d0 }, k = perSide[d.side] = (perSide[d.side] ?? -1) + 1;
      const col = new THREE.Color(d.color || 0xffd34d), g = new THREE.Group(); tlG.add(g);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshBasicMaterial({ color:col, toneMapped:false, transparent:true }));
      const glow = sprite(glowTex(), 1.4, col.getHex()); g.add(orb, glow);
      const lab = label(d.label, { size:42, color:'#' + col.getHexString(), weight:800, w:640 }); lab.position.set(0.35, 0.05, 0); g.add(lab);
      const pts = d.at.map(st => ideaPoint(st, d, k));
      /* the idea's whole journey as a faint dotted path, so students see the migration at a glance */
      const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(q => q.p)), new THREE.LineDashedMaterial({ color:col, dashSize:0.12, gapSize:0.12, transparent:true, opacity:0.35, depthWrite:false }));
      path.computeLineDistances(); tlG.add(path);
      return { d, g, orb, glow, lab, pts };
    });
  }
  function timeline(v, TL){
    if(v == null){ tlG.visible = false; return; }
    if(!ideas) buildIdeas(TL);
    tlG.visible = true;
    const n = TL.stops.length, i = Math.min(Math.floor(v), n - 2 < 0 ? 0 : n - 2), f = n > 1 ? v - i : 0;
    const a = TL.stops[i], b = TL.stops[Math.min(i + 1, n - 1)];
    yearLab.set(Math.round(a.year + (b.year - a.year) * f));
    for(const it of ideas){
      const A = it.pts[i], B = it.pts[Math.min(i + 1, n - 1)], s = f * f * (3 - 2 * f);
      it.g.position.lerpVectors(A.p, B.p, s);
      const o = A.o + (B.o - A.o) * s;
      it.orb.material.opacity = o; it.glow.material.opacity = 0.8 * o; it.lab.material.opacity = Math.max(0.35, o);
    }
  }

  /* ---------- wildcards: a flash, a shockwave, and the beam swings to a new heading ---------- */
  const flash = sprite(glowTex(), 1, 0xffffff); flash.visible = false; root.add(flash);
  const shock = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, depthWrite:false, toneMapped:false }));
  shock.rotation.y = Math.PI / 2; shock.visible = false; root.add(shock);
  const WILD = {
    'wc-pandemic':{ at:[3.2, -0.9, 0.3], color:0xff6b4a },
    'wc-storm':{ at:[2.6, 1.0, -0.2], color:0xffc24a },
    'wc-super':{ at:[3.6, 1.5, 0.2], color:0x5ef0ff }
  };
  const fx = { flashT:-1, pivot:0, pivotY:0, widen:1, dim:1, mode:null };
  const want = { pivot:0, pivotY:0, widen:1, dim:1 };
  function wildcard(w){
    flash.position.set(...w.at); shock.position.set(...w.at);
    flash.material.color.setHex(w.color); shock.material.color.setHex(w.color);
    flash.visible = shock.visible = true; fx.flashT = 0;
  }

  /* ---------- critique overlays ---------- */
  const crit = {};
  const AMBER = 0xffb347;
  { /* exponential change: the cone flares instead of opening steadily */
    const g = new THREE.Group(); g.visible = false; root.add(g); crit.exp = g;
    const pts = []; const k = 4.2, R = 6.6;
    for(let i = 0; i <= 60; i++){ const u = i / 60; pts.push(new THREE.Vector2(Math.max(0.001, R * (Math.exp(k * u) - 1) / (Math.exp(k) - 1)), u * L)); }
    const geo = new THREE.LatheGeometry(pts, 72); geo.rotateZ(-Math.PI / 2); geo.scale(1, 1, CONE.depth);
    const mat = new THREE.ShaderMaterial({ vertexShader:RIM_VERT, fragmentShader:RIM_FRAG, transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending,
      uniforms:{ uColor:{ value:new THREE.Color(AMBER) }, uBase:{ value:0.03 }, uRim:{ value:0.3 }, uOpacity:{ value:1 }, uTime:{ value:0 }, uStripes:{ value:0 } } });
    mat.userData.keep = true; shaders.push(mat);
    g.add(new THREE.Mesh(geo, mat));
    const lab = label('Exponential change', { size:46, color:'#ffb347', weight:800, sub:'little change for a long time, then a sudden flare', w:760 }); lab.position.set(3.0, 3.0, 0); g.add(lab);
  }
  { /* chaos: the projected line forks at phase transitions */
    const g = new THREE.Group(); g.visible = false; root.add(g); crit.chaos = g;
    const segs = [];
    const branch = (from, dir, len, depth) => {
      const to = from.clone().addScaledVector(dir, len); segs.push(from, to);
      if(depth >= 4) return;
      for(const s of [-1, 1]){ const d = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), s * (0.22 + 0.12 * depth)).applyAxisAngle(new THREE.Vector3(1, 0, 0), s * 0.6 * depth); branch(to, d.normalize(), len * 0.72, depth + 1); }
    };
    branch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), 4.6, 0);
    const ln = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), new THREE.LineBasicMaterial({ color:AMBER, transparent:true, opacity:0.95, toneMapped:false }));
    g.add(ln);
    const lab = label('Bifurcations', { size:46, color:'#ffb347', weight:800, sub:'phase transitions, not a smooth beam', w:700 }); lab.position.set(4.6, -2.2, 0); g.add(lab);
  }
  { /* whose present? other observers, other cones */
    const g = new THREE.Group(); g.visible = false; root.add(g); crit.obs = g;
    const other = (pos, rot, color, text) => {
      const og = new THREE.Group(); og.position.set(...pos); og.rotation.set(...rot); g.add(og);
      shell(3.4, color, { base:0.025, rim:0.22, len:L * 0.7, parent:og }).material.userData.keep = true;
      shell(1.1, color, { base:0.06, rim:0.3, len:L * 0.7, parent:og }).material.userData.keep = true;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshBasicMaterial({ color, toneMapped:false })); og.add(dot);
      const lab = label(text, { size:40, color:'#' + new THREE.Color(color).getHexString(), weight:800, w:620 }); lab.position.set(...pos); lab.position.y += 0.9; g.add(lab);
    };
    other([1.5, -3.6, 1.2], [0.2, 0.35, 0.22], 0x6ef0c2, 'Another present');
    other([3.2, 3.4, -1.0], [-0.1, -0.4, -0.3], 0xc69bff, 'Whose "now"?');
  }
  { /* probability: the bright beam dissolves into fog */
    const g = new THREE.Group(); g.visible = false; root.add(g); crit.fog = g;
    const M = 900, fp = new Float32Array(M * 3), seeds2 = [];
    for(let i = 0; i < M; i++) seeds2.push({ u:Math.random(), a:Math.random() * TAU, r:Math.random(), k:Math.random() });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map:glowTex(), size:0.7, color:0xc9d3e6, transparent:true, opacity:0.16, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false }));
    pts.frustumCulled = false; g.add(pts);
    g.userData.tick = t => {
      for(let i = 0; i < M; i++){ const s = seeds2[i], x = s.u * L, R = (0.3 + 2.6 * s.r) * x / L + 0.15 * Math.sin(t * 0.6 + s.k * 9);
        fp[i * 3] = x + 0.2 * Math.sin(t * 0.3 + s.k * 7); fp[i * 3 + 1] = Math.cos(s.a + t * 0.04) * R; fp[i * 3 + 2] = Math.sin(s.a + t * 0.04) * R * CONE.depth; }
      geo.attributes.position.needsUpdate = true;
    };
    const lab = label('Radical uncertainty', { size:46, color:'#e2e8f4', weight:800, sub:'the probable needs outcomes we can list', w:720 }); lab.position.set(4.0, 2.6, 0); g.add(lab);
  }
  function showCrit(id){ for(const [k, g] of Object.entries(crit)) g.visible = k === id; fx.mode = id; }

  /* ---------- per-frame easing of the effects ---------- */
  kit.onTick(({ t, dt }) => {
    const k = (dt || 0.016) * 2.2;
    fx.pivot = easeTo(fx.pivot, want.pivot, k); fx.pivotY = easeTo(fx.pivotY, want.pivotY, k);
    fx.widen = easeTo(fx.widen, want.widen, k); fx.dim = easeTo(fx.dim, want.dim, k);
    inner.rotation.z = fx.pivot; inner.rotation.y = fx.pivotY; inner.scale.set(1, fx.widen, fx.widen);
    for(const m of shaders) if(!m.userData.keep) m.uniforms.uOpacity.value = (m.userData.o ?? 1) * fx.dim;
    const beam = fx.mode === 'fog' ? 0.15 : fx.mode === 'chaos' ? 0.3 : 1;
    probShell.material.uniforms.uOpacity.value *= beam;
    projected.line.material.opacity = easeTo(projected.line.material.opacity, beam, k); projected.dot.material.opacity = projected.line.material.opacity;
    if(fx.flashT >= 0){
      fx.flashT += dt || 0.016; const p = fx.flashT / 2.2;
      if(p >= 1){ fx.flashT = -1; flash.visible = shock.visible = false; }
      else { flash.scale.setScalar(1 + 7 * Math.sin(Math.min(1, p * 3) * Math.PI / 2)); flash.material.opacity = 1 - p; shock.scale.setScalar(0.3 + 9 * p); shock.material.opacity = 1 - p; }
    }
    crit.fog.visible && crit.fog.userData.tick(t);
  });

  function effect(name){
    if(!name) return;
    if(WILD[name]){ wildcard(WILD[name]); return; }
    switch(name){
      case 'pivot-down': want.pivot = -0.26; want.pivotY = 0.16; break;
      case 'pivot-up': want.pivot = 0.24; want.pivotY = -0.14; break;
      case 'pivot-hard': want.pivot = -0.34; want.pivotY = 0.22; break;
      case 'widen': want.widen = 1.55; break;
      case 'narrow': want.widen = 1; break;
      case 'crit-exp': showCrit('exp'); want.dim = 0.35; break;
      case 'crit-chaos': showCrit('chaos'); want.dim = 0.6; break;
      case 'crit-obs': showCrit('obs'); want.dim = 0.55; break;
      case 'crit-fog': showCrit('fog'); want.dim = 0.7; break;
      case 'crit-off': showCrit(null); want.dim = 1; break;
      case 'reset': Object.assign(want, { pivot:0, pivotY:0, widen:1, dim:1 }); showCrit(null); fx.flashT = -1; flash.visible = shock.visible = false; break;
      default: break;   // 'calm' and unknown names leave the scene as it is
    }
  }

  return {
    /* the card sort calls this to show its markers in the cone's frame */
    root,
    effect,
    timeline
  };
}
