/* The Pyramid Stage zone: a stylised, representative layout of a large festival main-stage field.
   Generic structures only: no festival logos, artwork or branded stage dressing. Units: crowd figures are about 0.55 tall. */
import * as THREE from 'three';
import { TAU, smooth, clamp } from '../../engine/kit.js';

export function build(kit){
  const C = kit.C, G = kit.G;
  const GRASS = 0xb7cf9f, GRASS_DARK = 0x9dbb84, TRACK = 0xe6e1d6, HIVIS = 0xf2e51b, STEEL = 0xbfc6cf, WOOD = 0x9a7b56, CANVAS = 0xf4f1ea;
  const P = 0.6; // person scale

  /* ---------- scenario state: the crowd-surge branching scenario drives these (see effect() at the end) ---------- */
  const FX = {
    reset:   { surge:0,    lights:1, screen:0, stewards:0, push:0, medics:0 },
    calm:    { surge:0,    lights:1, screen:0, stewards:0, push:0, medics:0 },
    surge:   { surge:1,    lights:1, screen:0, stewards:0, push:0, medics:0 },
    stop:    { surge:0.75, lights:0, screen:1, stewards:0, push:0, medics:0 },
    message: { surge:0.35, lights:0, screen:2, stewards:1, push:0, medics:0 },
    stepback:{ surge:0,    lights:0, screen:1, stewards:1, push:0, medics:0 },
    stewards:{ surge:0.2,  lights:0, screen:1, stewards:1, push:0, medics:0 },
    push:    { surge:1,    lights:0, screen:1, stewards:1, push:1, medics:0 },
    blackout:{ surge:1,    lights:0, screen:3, stewards:0, push:0, medics:0 },
    crush:   { surge:1.35, lights:0, screen:3, stewards:1, push:0, medics:1 },
    cancel:  { surge:0.5,  lights:0, screen:1, stewards:1, push:0, medics:0 },
    restart: { surge:0.05, lights:1, screen:0, stewards:1, push:0, medics:0 },
    resurge: { surge:0.9,  lights:1, screen:0, stewards:1, push:0, medics:0 }
  };
  const fx = { ...FX.reset }, fxTarget = { ...FX.reset };
  kit.onTick(({ dt }) => { const k = 1 - Math.exp(-dt * 1.6); for(const key in fx) fx[key] += (fxTarget[key] - fx[key]) * k; });

  /* ---------- the field ---------- */
  {
    const g = new THREE.Group();
    kit.box(28.4, 1.1, 24.4, C.slabSide, { r:0.5, y:-0.67, parent:g });
    kit.box(28.2, 0.3, 24.2, GRASS, { r:0.14, y:0.01, parent:g });
    /* worn grass in front of the stage and along the desire lines */
    kit.box(17, 0.02, 9, GRASS_DARK, { r:0.01, x:0, y:G - 0.005, z:-0.5, parent:g, shadow:false });
    /* metal trackway: service and emergency route round the field */
    kit.box(1.4, 0.04, 22, TRACK, { r:0.02, x:9.6, y:G + 0.01, z:-0.5, parent:g, shadow:false });
    kit.box(1.4, 0.04, 22, TRACK, { r:0.02, x:-9.6, y:G + 0.01, z:-0.5, parent:g, shadow:false });
    kit.box(20.6, 0.04, 1.2, TRACK, { r:0.02, x:0, y:G + 0.01, z:8.8, parent:g, shadow:false });
    kit.addBase(g);
  }

  /* ---------- the Pyramid Stage (generic steel pyramid, no dressing) ---------- */
  const lights = [], beams = [], screens = [];
  {
    const g = new THREE.Group(); g.position.set(0, G, -7.6);
    /* stage deck and wings */
    kit.box(10, 1.3, 4.6, C.ink, { r:0.06, y:0.65, z:1.0, parent:g });
    kit.box(10.2, 0.08, 4.8, 0x3a3f5c, { r:0.03, y:1.32, z:1.0, parent:g });
    /* pyramid: a four-sided cone turned 45 degrees */
    const pyr = new THREE.Mesh(new THREE.ConeGeometry(5.2, 7.2, 4, 1), kit.mat(0xd3d8e0, { metalness:0.45, roughness:0.35, flatShading:true }));
    pyr.rotation.y = Math.PI / 4; pyr.position.set(0, 1.3 + 3.6, -0.6); pyr.castShadow = pyr.receiveShadow = true; g.add(pyr);
    /* steel edges */
    const apex = new THREE.Vector3(0, 1.3 + 7.2, -0.6), r = 5.2;
    for(const a of [0, 1, 2, 3]){
      const ang = Math.PI / 4 + a * Math.PI / 2;
      const base = new THREE.Vector3(Math.cos(ang) * r, 1.3, -0.6 + Math.sin(ang) * r);
      const len = base.distanceTo(apex), mid = base.clone().add(apex).multiplyScalar(0.5);
      const e = kit.cyl(0.07, 0.07, len, 0x8d95a3, { seg:8, parent:g, opts:{ metalness:0.6, roughness:0.3 } });
      e.position.copy(mid); e.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), apex.clone().sub(base).normalize());
    }
    /* stage opening: dark proscenium with a lighting truss */
    kit.box(6.4, 3.6, 0.4, 0x15172a, { r:0.05, y:1.3 + 1.8, z:2.1, parent:g });
    kit.box(6.8, 0.22, 0.3, STEEL, { r:0.04, y:1.3 + 3.5, z:2.45, parent:g, opts:{ metalness:0.5, roughness:0.35 } });
    for(let i = 0; i < 7; i++){
      const head = kit.anim(new THREE.Group()); head.position.set(-3 + i, 1.3 + 3.3, 2.5); g.add(head);
      kit.box(0.2, 0.2, 0.2, C.ink, { r:0.05, parent:head });
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0xffffff, emissiveIntensity:2 }));
      lens.position.set(0, -0.08, 0.1); head.add(lens);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.12, depthWrite:false, side:THREE.DoubleSide }));
      beam.position.set(0, -3, 0); beam.rotation.x = Math.PI; head.add(beam);
      lights.push({ head, lens, beam, i });
    }
    /* band riser and backline */
    kit.box(4, 0.4, 1.4, 0x2a2f4a, { r:0.04, y:1.5, z:0.6, parent:g });
    for(const x of [-1.2, 0, 1.2]) kit.box(0.5, 0.6, 0.4, C.ink, { r:0.04, x, y:2.0, z:0.6, parent:g });
    /* PA hangs and subs */
    for(const s of [-1, 1]){
      for(let k = 0; k < 6; k++) kit.box(0.7, 0.36, 0.6, C.ink, { r:0.04, x:s * 4.4, y:1.3 + 3.9 - k * 0.4, z:2.4, parent:g });
      kit.cyl(0.02, 0.02, 1.2, STEEL, { x:s * 4.4, y:1.3 + 4.7, z:2.4, parent:g });
    }
    /* side screens on scaffold frames */
    for(const s of [-1, 1]){
      const fr = new THREE.Group(); fr.position.set(s * 7.4, 0, 1.6); fr.rotation.y = -s * 0.25; g.add(fr);
      for(const dx of [-1.9, 1.9]) kit.box(0.18, 5.2, 0.18, STEEL, { r:0.04, x:dx, y:2.6, parent:fr, opts:{ metalness:0.5, roughness:0.35 } });
      kit.box(4.1, 2.5, 0.25, C.ink, { r:0.05, y:3.9, parent:fr });
      const scr = new THREE.Mesh(kit.rbGeo(3.8, 2.2, 0.06, 0.03), new THREE.MeshStandardMaterial({ color:0x111111, emissive:0x2b4fd8, emissiveIntensity:1.0, roughness:0.4 }));
      scr.position.set(0, 3.9, 0.14); fr.add(kit.anim(scr)); screens.push(scr);
    }
    kit.addStatic(g);
  }

  /* ---------- front-of-stage barrier, pit, stewards and medics ---------- */
  {
    const g = new THREE.Group(); g.position.set(0, G, -3.5);
    for(let i = 0; i < 13; i++){
      const x = -6 + i;
      kit.box(0.96, 0.62, 0.08, 0x9aa3b0, { r:0.02, x, y:0.42, parent:g, opts:{ metalness:0.5, roughness:0.35 } });
      kit.box(0.96, 0.04, 0.7, 0x7d8694, { r:0.01, x, y:0.03, z:0.3, parent:g });
    }
    kit.box(0.08, 0.62, 2.2, 0x9aa3b0, { r:0.02, x:-6.5, y:0.42, z:-0.8, parent:g });
    kit.box(0.08, 0.62, 2.2, 0x9aa3b0, { r:0.02, x:6.5, y:0.42, z:-0.8, parent:g });
    kit.addStatic(g);
  }
  const pitStaff = [];
  for(let i = 0; i < 7; i++){
    const p = kit.person(i === 3 ? 0x2f8a45 : HIVIS); p.position.set(-4.8 + i * 1.6, G, -3.95); p.rotation.y = -Math.PI / 2;
    kit.addDynamic(p, 0.7); pitStaff.push({ p, i, x:p.position.x });
  }
  kit.onTick(({ ph, lt }) => pitStaff.forEach(s => {
    s.p.scale.setScalar(P * (s.p.userData.pop ?? 1));
    s.p.position.x = s.x + 0.25 * Math.sin(ph * 2 + s.i);
    s.p.userData.head.rotation.y = 0.3 * Math.sin(ph * 4 + s.i);
  }));

  /* ---------- the crowd: dense at the barrier, thinning towards the back ---------- */
  const spots = [];
  const blocked = (x, z) =>
    (Math.abs(x) < 2.0 && Math.abs(z - 2.9) < 1.6) ||            // FOH
    (Math.hypot(x - 5.6, z - 0.4) < 1.1) || (Math.hypot(x + 5.6, z - 0.4) < 1.1); // delay towers
  for(let tries = 0; spots.length < 760 && tries < 20000; tries++){
    const x = (kit.rand() * 2 - 1) * 8.4, z = -3.3 + kit.rand() * 11.4;
    const zFront = z + 3.3;
    const keep = Math.exp(-zFront / 3.6) * (1 - Math.abs(x) / 11);
    if(kit.rand() > keep * 1.25 + 0.05 || blocked(x, z)) continue;
    if(spots.some(s => (s.x - x) ** 2 + (s.z - z) ** 2 < 0.06)) continue;
    spots.push({ x, z, front:zFront < 3 });
  }
  /* surge zone: left of centre at the barrier, where density builds first */
  const SURGE = { x:-1.2, z:-2.4, r:3.8 };
  spots.forEach(s => { s.w = clamp(1 - Math.hypot(s.x - SURGE.x, (s.z - SURGE.z) * 0.8) / SURGE.r, 0, 1); });
  kit.crowd(spots, { scale:P, motion:(s, i, { lt, t }) => {
    const beat = Math.abs(Math.sin(lt * TAU * 2 + s.ph));          // two beats a second, loops every 10 s
    const calm = clamp(1 - fx.surge, 0, 1);
    let dy = (s.front ? beat * 0.09 * s.k : beat * 0.025) * (fx.lights > 0.5 ? 1 : 0.35);
    let dx = 0, dz = 0;
    if(s.w > 0 && fx.surge > 0.01){
      const w = s.w * fx.surge;
      dz = -w * (s.z + 3.3) * 0.42;                                  // compressed towards the barrier
      dx = w * (0.22 * Math.sin(t * 1.7 + s.x * 0.8) + (SURGE.x - s.x) * 0.12); // crowd sway and pull to the centre
      dy *= calm; dy += w * 0.03 * Math.abs(Math.sin(t * 5 + s.ph));
    }
    if(fx.push > 0.01 && s.w > 0.3) dz += fx.push * 0.25 * s.w;      // stewards pushing in: people shoved back into the press
    return { dx, dy, dz, yaw:Math.PI / 2 + 0.25 * Math.sin(lt * TAU * 0.1 + s.ph) * calm };
  } });

  /* density warning patch on the ground, extra stewards, medics */
  const patch = kit.anim(new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color:0xd11f1f, transparent:true, opacity:0, depthWrite:false })));
  patch.rotation.x = -Math.PI / 2; patch.position.set(SURGE.x, G + 0.03, SURGE.z); patch.renderOrder = 2; kit.world.add(patch);
  const extra = [];
  [[-6.1, -4.2, -Math.PI / 2], [6.1, -4.2, Math.PI / 2], [-2.2, -4.1, -Math.PI / 2], [-0.4, -4.1, -Math.PI / 2], [-3.0, -3.0, Math.PI], [0.6, -3.0, Math.PI]].forEach(([x, z, ry], i) => {
    const p = kit.person(HIVIS); p.position.set(x, G, z); p.rotation.y = ry; kit.addDynamic(p, 0.9); extra.push({ p, x, z, i, kind:'steward' });
  });
  [[-1.6, -4.0], [-0.9, -4.3], [-1.9, -4.5]].forEach(([x, z], i) => {
    const p = kit.person(0x2f8a45); p.position.set(x, G, z); p.rotation.y = Math.PI; kit.addDynamic(p, 0.9); extra.push({ p, x, z, i, kind:'medic' });
  });
  kit.onTick(({ t }) => {
    const sv = clamp(fx.surge, 0, 1.4);
    patch.material.opacity = sv * (0.22 + 0.16 * Math.abs(Math.sin(t * 3)));
    patch.scale.setScalar(1.6 + sv * 1.6);
    extra.forEach(e => {
      const v = e.kind === 'medic' ? fx.medics : fx.stewards;
      e.p.scale.setScalar(P * Math.max(0.0001, v) * (e.p.userData.pop ?? 1));
      e.p.visible = v > 0.02;
      if(e.kind === 'steward' && e.z > -3.3) e.p.position.z = e.z + fx.push * 0.6;  // the two in the crowd only when pushing
      if(e.kind === 'steward' && e.z > -3.3) e.p.visible = fx.push > 0.05;
    });
  });

  /* flags held up in the crowd (plain colours, no text) */
  const flags = [];
  [[-3.5, 1.2, C.orange], [2.6, 3.8, C.teal], [-1.0, 5.6, C.yellow], [4.2, 5.2, 0xd94f70], [-6.0, 4.6, C.green], [6.6, -1.6, C.royal]].forEach(([x, z, col], i) => {
    const g = new THREE.Group(); g.position.set(x, G, z);
    kit.cyl(0.02, 0.02, 2.6, C.ink, { seg:6, y:1.3, parent:g });
    const cloth = kit.anim(new THREE.Group()); cloth.position.set(0, 2.35, 0); g.add(cloth);
    kit.box(0.7, 0.45, 0.02, col, { r:0.01, x:0.36, parent:cloth });
    kit.addStatic(g); flags.push({ cloth, i });
  });

  /* ---------- FOH mix position ---------- */
  {
    const g = new THREE.Group(); g.position.set(0, G, 2.9);
    kit.box(3.4, 0.5, 2.4, 0x5b6487, { r:0.05, y:0.25, parent:g });
    for(const [x, z] of [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]]) kit.cyl(0.04, 0.04, 2.1, STEEL, { seg:8, x, y:1.5, z, parent:g });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.9, 4), kit.mat(CANVAS)); roof.rotation.y = Math.PI / 4; roof.position.y = 3.0; roof.castShadow = true; g.add(roof);
    kit.box(2.6, 0.5, 0.7, C.ink, { r:0.04, y:0.85, z:-0.3, parent:g });
    kit.box(2.4, 0.05, 0.6, 0x6f8de8, { r:0.01, y:1.12, z:-0.3, parent:g, opts:{ emissive:0x3a5ad8, emissiveIntensity:0.4 }, shadow:false });
    /* crowd fence round the mix position */
    for(const [x, z, w, d] of [[0, -1.6, 4.0, 0.06], [0, 1.6, 4.0, 0.06], [-2.0, 0, 0.06, 3.2], [2.0, 0, 0.06, 3.2]]) kit.box(w, 0.5, d, 0x9aa3b0, { r:0.01, x, y:0.3, z, parent:g });
    kit.seated(g, -0.6, 0.5, 0.25, -Math.PI / 2, C.ink, P);
    kit.seated(g, 0.6, 0.5, 0.25, -Math.PI / 2, C.teal, P);
    kit.addStatic(g);
  }

  /* ---------- delay towers with rear screens ---------- */
  for(const s of [-1, 1]){
    const g = new THREE.Group(); g.position.set(s * 5.6, G, 0.4);
    for(const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) kit.cyl(0.05, 0.05, 4.8, STEEL, { seg:8, x, y:2.4, z, parent:g, opts:{ metalness:0.5, roughness:0.35 } });
    for(const y of [1.2, 2.4, 3.6]) kit.box(1.1, 0.05, 1.1, STEEL, { r:0.01, y, parent:g });
    for(let k = 0; k < 4; k++) kit.box(0.6, 0.32, 0.5, C.ink, { r:0.04, y:4.5 - k * 0.36, z:-0.35, parent:g });
    kit.box(1.4, 0.9, 0.1, C.ink, { r:0.03, y:3.3, z:0.62, parent:g });
    const scr = new THREE.Mesh(kit.rbGeo(1.25, 0.75, 0.03, 0.02), new THREE.MeshStandardMaterial({ color:0x111111, emissive:0x17a3a0, emissiveIntensity:1.0 }));
    scr.position.set(0, 3.3, 0.68); g.add(kit.anim(scr)); screens.push(scr);
    kit.box(1.4, 0.5, 1.4, 0x9aa3b0, { r:0.02, y:0.25, parent:g });
    kit.addStatic(g);
  }

  /* ---------- left edge: accessible platform, merchandise, water, toilets ---------- */
  {
    const g = new THREE.Group(); g.position.set(-11.4, G, -2.6);
    kit.box(3.4, 1.1, 2.8, 0x5b6487, { r:0.05, y:0.55, parent:g });
    kit.box(3.5, 0.06, 2.9, 0xd8d2c4, { r:0.02, y:1.12, parent:g });
    for(const [x, z, w, d] of [[0, -1.42, 3.4, 0.05], [1.68, 0, 0.05, 2.8], [-1.68, 0, 0.05, 2.8]]) kit.box(w, 0.45, d, STEEL, { r:0.01, x, y:1.38, z, parent:g });
    const ramp = kit.box(1.0, 0.08, 3.4, 0xd8d2c4, { r:0.02, x:1.2, y:0.55, z:2.9, parent:g }); ramp.rotation.x = 0.33;
    const roof = kit.box(3.6, 0.08, 3.0, CANVAS, { r:0.02, y:2.6, parent:g });
    for(const [x, z] of [[-1.6, -1.3], [1.6, -1.3], [-1.6, 1.3], [1.6, 1.3]]) kit.cyl(0.035, 0.035, 1.5, STEEL, { seg:8, x, y:1.85, z, parent:g });
    /* wheelchair users and companions */
    for(const [x, z] of [[-0.8, -0.6], [0.6, -0.6]]){
      const ch = new THREE.Group(); ch.position.set(x, 1.15, z); ch.rotation.y = Math.PI / 2 + 0.6; g.add(ch);
      kit.box(0.24, 0.04, 0.24, C.ink, { r:0.01, y:0.18, parent:ch });
      kit.box(0.04, 0.22, 0.24, C.ink, { r:0.01, x:-0.12, y:0.3, parent:ch });
      for(const s of [-1, 1]){ const w = kit.cyl(0.12, 0.12, 0.03, C.ink, { seg:14, z:s * 0.14, y:0.12, parent:ch }); w.rotation.x = Math.PI / 2; }
      kit.seated(ch, -0.03, -0.02, 0, 0, kit.pick(kit.shirts), P);
    }
    kit.seated(g, 1.2, 1.15, 0.2, Math.PI / 2 + 0.6, C.yellow, P);
    /* accessible toilet cabin */
    kit.box(1.0, 1.3, 1.0, C.royal, { r:0.05, x:-0.9, y:0.65, z:2.2, parent:g });
    kit.box(0.5, 0.9, 0.04, C.cream, { r:0.02, x:-0.9, y:0.55, z:2.72, parent:g });
    kit.addStatic(g);
  }
  {
    /* merchandise stall */
    const g = new THREE.Group(); g.position.set(-11.6, G, 1.6); g.rotation.y = -Math.PI / 2;
    kit.box(2.6, 0.9, 0.7, C.cream, { r:0.04, y:0.45, z:0.5, parent:g });
    for(const x of [-1.25, 1.25]) for(const z of [-0.7, 0.85]) kit.cyl(0.03, 0.03, 2.1, STEEL, { seg:8, x, y:1.05, z, parent:g });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.95, 0.7, 4), kit.mat(C.teal)); roof.rotation.y = Math.PI / 4; roof.position.y = 2.45; roof.scale.set(1, 1, 0.75); roof.castShadow = true; g.add(roof);
    kit.box(2.3, 0.04, 0.04, C.ink, { r:0.01, y:1.85, z:-0.5, parent:g });
    for(let i = 0; i < 7; i++) kit.box(0.26, 0.36, 0.04, [C.ink, C.cream, C.royal, C.green, 0xd94f70, C.yellow, C.ink][i], { r:0.02, x:-0.95 + i * 0.32, y:1.62, z:-0.5, parent:g });
    for(let i = 0; i < 4; i++) kit.box(0.4, 0.1, 0.3, [C.ink, C.royal, C.cream, C.green][i], { r:0.02, x:-0.9 + i * 0.6, y:0.95, z:0.5, parent:g });
    kit.addStatic(g);
    for(let i = 0; i < 3; i++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(-10.2, G, 0.9 + i * 0.55); p.rotation.y = Math.PI; kit.addStatic(p); }
  }
  {
    /* free water refill point */
    const g = new THREE.Group(); g.position.set(-9.9, G, 4.6);
    kit.box(2.6, 0.9, 0.5, 0x2b8fd8, { r:0.06, y:0.45, parent:g });
    for(let i = 0; i < 4; i++){ kit.cyl(0.03, 0.03, 0.4, STEEL, { seg:8, x:-0.9 + i * 0.6, y:1.1, z:0.1, parent:g }); kit.box(0.12, 0.05, 0.06, STEEL, { r:0.01, x:-0.9 + i * 0.6, y:1.28, z:0.18, parent:g }); }
    kit.box(2.8, 0.04, 0.9, 0x9aa3b0, { r:0.01, y:0.02, z:0.4, parent:g });
    kit.addStatic(g);
    for(let i = 0; i < 4; i++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(-10.8 + i * 0.6, G, 5.15); p.rotation.y = Math.PI / 2; p.userData.armR.rotation.z = -1.2; kit.addStatic(p); }
  }
  {
    /* long-drop toilet row, urinal screen and hand-wash */
    const g = new THREE.Group(); g.position.set(-12.4, G, 7.6);
    kit.box(1.4, 0.5, 6.6, 0x6b5a46, { r:0.04, y:0.25, parent:g });
    for(let i = 0; i < 8; i++){
      const z = -2.8 + i * 0.8;
      kit.box(1.0, 1.5, 0.74, WOOD, { r:0.04, y:1.25, z, parent:g });
      kit.box(0.04, 1.1, 0.5, i % 3 === 1 ? 0xc2410c : 0x2f8a45, { r:0.01, x:0.52, y:1.15, z, parent:g });
    }
    kit.box(1.1, 0.08, 6.7, 0x5b4c3b, { r:0.02, y:2.04, parent:g });
    kit.addStatic(g);
    const u = new THREE.Group(); u.position.set(-10.6, G, 10.6);
    kit.box(2.4, 1.2, 0.08, C.royal, { r:0.02, y:0.6, parent:u }); kit.box(0.08, 1.2, 1.4, C.royal, { r:0.02, x:-1.2, y:0.6, z:0.7, parent:u });
    kit.addStatic(u);
    const hw = new THREE.Group(); hw.position.set(-10.3, G, 3.3);
    kit.box(1.4, 0.8, 0.5, C.cream, { r:0.05, y:0.4, parent:hw });
    for(const x of [-0.4, 0.4]) kit.cyl(0.02, 0.02, 0.3, STEEL, { seg:6, x, y:0.95, parent:hw });
    kit.addStatic(hw);
  }
  kit.queue({
    slots:[{ x:-11.2, z:5.0 }, { x:-10.85, z:5.55 }, { x:-10.6, z:6.15 }, { x:-10.45, z:6.75 }, { x:-10.35, z:7.35 }],
    exit:{ x:-11.9, z:4.5 }, spawn:{ x:-9.6, z:8.0 }, scale:P
  });

  /* ---------- right edge: first aid, food vans, bar ---------- */
  {
    const g = new THREE.Group(); g.position.set(11.6, G, -6.6);
    kit.box(3.0, 1.6, 2.6, CANVAS, { r:0.06, y:0.8, parent:g });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 0.8, 4), kit.mat(CANVAS)); roof.rotation.y = Math.PI / 4; roof.position.y = 2.0; roof.scale.set(1, 1, 0.9); roof.castShadow = true; g.add(roof);
    kit.box(0.04, 0.7, 0.24, 0x2f8a45, { r:0.01, x:-1.52, y:1.0, parent:g, shadow:false }); kit.box(0.04, 0.24, 0.7, 0x2f8a45, { r:0.01, x:-1.52, y:1.0, parent:g, shadow:false });
    kit.box(0.04, 0.22, 0.06, CANVAS, { r:0.01, x:-1.55, y:1.0, parent:g, shadow:false }); kit.box(0.04, 0.06, 0.22, CANVAS, { r:0.01, x:-1.55, y:1.0, parent:g, shadow:false });
    kit.addStatic(g);
  }
  const vanCols = [C.orange, C.teal, C.yellow, 0xd94f70];
  [-3.0, -0.2, 2.6, 5.4].forEach((z, i) => {
    const g = new THREE.Group(); g.position.set(12.3, G, z);
    kit.box(1.5, 1.4, 2.3, vanCols[i], { r:0.12, y:0.85, parent:g });
    kit.box(1.4, 0.18, 2.2, C.cream, { r:0.06, y:1.62, parent:g });
    kit.box(0.06, 0.6, 1.5, 0x2a2f45, { r:0.02, x:-0.76, y:1.0, parent:g });
    const aw = kit.box(0.7, 0.05, 1.7, C.cream, { r:0.02, x:-1.05, y:1.42, parent:g }); aw.rotation.z = 0.35;
    kit.box(0.35, 0.06, 1.5, C.cream, { r:0.02, x:-0.92, y:0.72, parent:g });
    for(const s of [-1, 1]){ const w = kit.cyl(0.18, 0.18, 0.12, C.ink, { seg:14, x:s * 0.4, y:0.18, z:s * 0.75, parent:g }); w.rotation.x = Math.PI / 2; }
    kit.cyl(0.1, 0.1, 0.45, 0xc2410c, { x:0.55, y:0.38, z:1.25, parent:g });
    kit.steam(g, 0.2, 1.75, 0.3, { count:3, period:2.5, rise:0.9, size:1 });
    kit.addStatic(g);
    if(i !== 1) for(let k = 0; k < 3; k++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(11.0 - k * 0.45, G, z + (k - 1) * 0.3); p.rotation.y = 0; kit.addStatic(p); }
  });
  kit.queue({
    slots:[{ x:11.1, z:-0.2 }, { x:10.6, z:-0.35 }, { x:10.1, z:-0.5 }, { x:9.6, z:-0.6 }, { x:9.1, z:-0.7 }],
    exit:{ x:11.0, z:0.8 }, spawn:{ x:8.4, z:-1.6 }, scale:P
  });
  {
    /* bar marquee */
    const g = new THREE.Group(); g.position.set(11.6, G, 8.8);
    kit.box(3.6, 1.0, 1.0, C.royal, { r:0.05, y:0.5, z:-0.8, parent:g });
    kit.box(3.7, 0.06, 1.1, C.cream, { r:0.02, y:1.03, z:-0.8, parent:g });
    for(const x of [-1.7, 1.7]) for(const z of [-1.4, 1.4]) kit.cyl(0.04, 0.04, 2.0, STEEL, { seg:8, x, y:1.0, z, parent:g });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.7, 1.0, 4), kit.mat(CANVAS)); roof.rotation.y = Math.PI / 4; roof.position.y = 2.5; roof.castShadow = true; g.add(roof);
    for(let i = 0; i < 5; i++) kit.cyl(0.06, 0.05, 0.16, i % 2 ? C.yellow : 0xd99a4e, { x:-1.2 + i * 0.6, y:1.14, z:-0.8, parent:g });
    kit.addStatic(g);
    for(let k = 0; k < 5; k++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(10.2 + k * 0.6, G, 7.4); p.rotation.y = Math.PI / 2; kit.addStatic(p); }
  }

  /* ---------- backstage: production, generators, artist area ---------- */
  for(const [x, col] of [[-8.6, C.cream], [8.4, C.cream], [-6.2, 0x9aa3b0]]){
    const g = new THREE.Group(); g.position.set(x, G, -11.0);
    kit.box(3.0, 1.4, 1.2, col, { r:0.08, y:0.8, parent:g });
    kit.box(1.0, 1.1, 1.1, C.royal, { r:0.08, x:1.9, y:0.65, parent:g });
    for(const sx of [-1, 0.3, 1.9]) for(const s of [-1, 1]){ const w = kit.cyl(0.18, 0.18, 0.1, C.ink, { seg:12, x:sx, y:0.18, z:s * 0.55, parent:g }); w.rotation.x = Math.PI / 2; }
    kit.addStatic(g);
  }
  {
    const g = new THREE.Group(); g.position.set(6.0, G, -10.9);
    kit.box(1.6, 0.9, 0.9, C.green, { r:0.06, y:0.45, parent:g });
    kit.cyl(0.06, 0.06, 0.5, C.ink, { x:0.5, y:1.1, parent:g });
    kit.steam(g, 0.5, 1.4, 0, { count:3, period:2.5, rise:0.8, size:0.8 });
    kit.addStatic(g);
  }

  /* ---------- perimeter fence, gate, campsite beyond ---------- */
  {
    const g = new THREE.Group(); g.position.set(0, G, 9.7);
    for(let i = 0; i < 18; i++){
      const x = -13.2 + i * 1.5;
      if(Math.abs(x + 0.2) < 1.2) continue;
      kit.box(1.44, 1.3, 0.05, 0x7d8694, { r:0.01, x, y:0.65, parent:g, opts:{ transparent:false, metalness:0.4, roughness:0.4 } });
    }
    kit.box(0.12, 2.0, 0.12, C.royal, { r:0.03, x:-1.4, y:1.0, parent:g });
    kit.box(0.12, 2.0, 0.12, C.royal, { r:0.03, x:1.0, y:1.0, parent:g });
    kit.box(2.6, 0.18, 0.18, C.royal, { r:0.03, x:-0.2, y:2.0, parent:g });
    kit.addStatic(g);
    for(const x of [-1.8, 1.4]){ const p = kit.person(HIVIS); p.scale.setScalar(P); p.position.set(x, G, 9.2); p.rotation.y = x < 0 ? 0 : Math.PI; kit.addStatic(p); }
  }
  {
    const g = new THREE.Group(); g.position.set(0, G, 11.0);
    const tentCols = [C.orange, C.teal, C.green, C.yellow, C.royal, 0xd94f70, C.cream];
    for(let i = 0; i < 26; i++){
      const x = -12.8 + (i % 13) * 2.0 + (Math.floor(i / 13) ? 1.0 : 0) + (kit.rand() - 0.5) * 0.4;
      const z = Math.floor(i / 13) ? 0.7 : -0.45;
      if(Math.abs(x + 0.2) < 1.3) continue;
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 3), kit.mat(tentCols[i % tentCols.length]));
      t.rotation.set(0, 0, Math.PI / 2); t.rotation.y = (kit.rand() - 0.5) * 0.5; t.position.set(x, 0.25, z); t.scale.set(1, 1, 0.7);
      t.castShadow = true; t.receiveShadow = true; g.add(t);
    }
    kit.addStatic(g);
  }
  /* people walking through the gate, and one leaving */
  kit.walker({ side:'z', off:-0.2, center:9.4, amp:1.6, ph:0.0, scale:P, delay:0.8 });
  kit.walker({ side:'z', off:0.3, center:9.0, amp:1.4, ph:2.4, scale:P, delay:0.85 });
  kit.walker({ side:'z', off:-9.3, center:-0.5, amp:6.0, ph:1.3, scale:P, shirt:HIVIS, delay:0.9 });

  /* ---------- service buggy patrolling the trackway ---------- */
  {
    const bug = new THREE.Group();
    kit.box(1.1, 0.4, 0.7, C.cream, { r:0.1, y:0.35, parent:bug });
    kit.box(0.5, 0.06, 0.7, C.cream, { r:0.03, x:-0.15, y:0.95, parent:bug });
    for(const [x, z] of [[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]]) kit.cyl(0.02, 0.02, 0.45, C.ink, { seg:6, x:x * 0.6 - 0.15, y:0.72, z, parent:bug });
    kit.box(0.2, 0.08, 0.5, 0x2f8a45, { r:0.02, x:-0.15, y:1.0, parent:bug, shadow:false, opts:{ emissive:0x2f8a45, emissiveIntensity:0.7 } });
    for(const [x, z] of [[-0.35, -0.38], [0.35, -0.38], [-0.35, 0.38], [0.35, 0.38]]){ const w = kit.cyl(0.14, 0.14, 0.08, C.ink, { seg:12, x, y:0.14, z, parent:bug }); w.rotation.x = Math.PI / 2; }
    kit.addDynamic(bug, 0.8);
    kit.onTick(({ ph }) => {
      const u = Math.sin(ph), v = Math.cos(ph);
      bug.position.set(9.6, G + 0.02, -0.5 + u * 8.5);
      bug.rotation.y = v >= 0 ? -Math.PI / 2 : Math.PI / 2;
      bug.scale.setScalar(0.8 * (bug.userData.pop ?? 1));
    });
  }

  /* ---------- trees round the field edge ---------- */
  for(const [x, z, s] of [[-13.2, -9.5, 1.4], [13.2, -9.2, 1.5], [-13.4, -6.0, 1.2], [13.4, 2.0, 1.1], [-13.5, 11.2, 1.0], [13.3, 11.3, 1.2], [6.5, 11.6, 0.9]]) kit.tree(x, z, s);

  /* ---------- show lighting, screens and flags ---------- */
  /* screen modes: 0 show content, 1 steady amber (show stopped), 2 flashing white (scripted message), 3 dark/red (no information) */
  const tmpCol = new THREE.Color(), AMBER = new THREE.Color(0xffb020), WHITE = new THREE.Color(0xffffff), RED = new THREE.Color(0x8a1010);
  kit.onTick(({ lt, ph, t }) => {
    const on = clamp(fx.lights, 0, 1);
    lights.forEach(l => {
      const hue = ((lt / 5) + l.i / 7) % 1;
      tmpCol.setHSL(hue, 0.85, 0.6);
      l.lens.material.emissive.copy(tmpCol); l.lens.material.emissiveIntensity = 2 * on;
      l.beam.material.color.copy(tmpCol); l.beam.material.opacity = 0.12 * on; l.beam.visible = on > 0.03;
      l.head.rotation.x = 0.55 + 0.35 * Math.sin(ph * 2 + l.i) * on;
      l.head.rotation.z = 0.4 * Math.sin(ph * 3 + l.i * 0.7) * on;
    });
    const mode = Math.round(fxTarget.screen);
    screens.forEach((s, i) => {
      if(mode === 0){ tmpCol.setHSL(((lt / 10) + i * 0.15) % 1, 0.7, 0.5); s.material.emissiveIntensity = 0.8 + 0.3 * Math.abs(Math.sin(lt * TAU * 2 + i)); }
      else if(mode === 1){ tmpCol.copy(AMBER); s.material.emissiveIntensity = 1.1; }
      else if(mode === 2){ tmpCol.copy(Math.sin(t * 5) > 0 ? WHITE : AMBER); s.material.emissiveIntensity = 1.4; }
      else { tmpCol.copy(RED); s.material.emissiveIntensity = 0.35 + 0.2 * Math.abs(Math.sin(t * 2)); }
      s.material.emissive.copy(tmpCol);
    });
    flags.forEach(f => { f.cloth.rotation.y = 0.5 * Math.sin(ph * 4 + f.i); });
  });

  return {
    effect(name){
      const target = FX[name] || FX.calm;
      Object.assign(fxTarget, target);
    }
  };
}
