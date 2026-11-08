/* The Pyramid Stage (realistic): the Pyramid Field layout with every structure built and lit in Blender.
   assets/pyramid-stage.glb holds the field, stage, PA, towers, traders, welfare, backstage, perimeter, campsite and trees as two
   baked meshes (source script: Drive VR/MR folder, 2026-11-08-pyramid-stage-blender-source.zip). This file keeps everything that
   moves or reacts to the crowd-surge scenario: crowd, staff, show lights, screens, flags, queues, walkers, buggy and steam.
   Generic structures only: no festival logos, artwork or branded stage dressing. Units: crowd figures are about 0.55 tall. */
import * as THREE from 'three';
import { TAU, clamp } from '../../engine/kit.js';

export function build(kit){
  const C = kit.C, G = kit.G;
  const HIVIS = 0xf2e51b;
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

  /* ---------- the baked Blender scene, plus a shadow-only layer so the crowd and moving parts still cast shadows on it ---------- */
  const site = kit.glb('./assets/pyramid-stage.glb');
  {
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(28, 24), new THREE.ShadowMaterial({ color:0x2a2418, opacity:0.32 }));
    catcher.rotation.x = -Math.PI / 2; catcher.position.y = G + 0.008; catcher.receiveShadow = true; catcher.renderOrder = 1;
    site.add(catcher);
  }

  /* ---------- show lights on the front truss and the stage screens (structures are in the GLB) ---------- */
  const lights = [], screens = [];
  {
    const g = new THREE.Group(); g.position.set(0, G, -7.6);
    for(let i = 0; i < 7; i++){
      const head = kit.anim(new THREE.Group()); head.position.set(-3 + i, 1.3 + 3.3, 2.5); g.add(head);
      kit.box(0.2, 0.2, 0.2, C.ink, { r:0.05, parent:head });
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0xffffff, emissiveIntensity:2 }));
      lens.position.set(0, -0.08, 0.1); head.add(lens);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.12, depthWrite:false, side:THREE.DoubleSide }));
      beam.position.set(0, -3, 0); beam.rotation.x = Math.PI; head.add(beam);
      lights.push({ head, lens, beam, i });
    }
    for(const s of [-1, 1]){
      const fr = new THREE.Group(); fr.position.set(s * 7.4, 0, 1.6); fr.rotation.y = -s * 0.25; g.add(fr);
      const scr = new THREE.Mesh(kit.rbGeo(3.8, 2.2, 0.06, 0.03), new THREE.MeshStandardMaterial({ color:0x111111, emissive:0x2b4fd8, emissiveIntensity:1.0, roughness:0.4 }));
      scr.position.set(0, 3.9, 0.14); fr.add(kit.anim(scr)); screens.push(scr);
    }
    kit.addStatic(g);
  }
  for(const s of [-1, 1]){
    const g = new THREE.Group(); g.position.set(s * 5.6, G, 0.4);
    const scr = new THREE.Mesh(kit.rbGeo(1.25, 0.75, 0.03, 0.02), new THREE.MeshStandardMaterial({ color:0x111111, emissive:0x17a3a0, emissiveIntensity:1.0 }));
    scr.position.set(0, 3.3, 0.68); g.add(kit.anim(scr)); screens.push(scr);
    kit.addStatic(g);
  }

  /* ---------- pit staff behind the barrier ---------- */
  const pitStaff = [];
  for(let i = 0; i < 7; i++){
    const p = kit.person(i === 3 ? 0x2f8a45 : HIVIS); p.position.set(-4.8 + i * 1.6, G, -3.95); p.rotation.y = -Math.PI / 2;
    kit.addDynamic(p, 0.7); pitStaff.push({ p, i, x:p.position.x });
  }
  kit.onTick(({ ph }) => pitStaff.forEach(s => {
    s.p.scale.setScalar(P * (s.p.userData.pop ?? 1));
    s.p.position.x = s.x + 0.25 * Math.sin(ph * 2 + s.i);
    s.p.userData.head.rotation.y = 0.3 * Math.sin(ph * 4 + s.i);
  }));

  /* ---------- the crowd: dense at the barrier, thinning towards the back ---------- */
  const spots = [];
  const blocked = (x, z) =>
    (Math.abs(x) < 2.1 && Math.abs(z - 2.9) < 1.7) ||            // FOH
    (Math.hypot(x - 5.6, z - 0.4) < 1.1) || (Math.hypot(x + 5.6, z - 0.4) < 1.1); // delay towers
  for(let tries = 0; spots.length < 760 && tries < 20000; tries++){
    const x = (kit.rand() * 2 - 1) * 8.4, z = -3.3 + kit.rand() * 11.4;
    const zFront = z + 3.3;
    const keep = Math.exp(-zFront / 3.6) * (1 - Math.abs(x) / 11);
    if(kit.rand() > keep * 1.25 + 0.05 || blocked(x, z)) continue;
    if(spots.some(s => (s.x - x) ** 2 + (s.z - z) ** 2 < 0.06)) continue;
    spots.push({ x, z, front:zFront < 3 });
  }
  const SURGE = { x:-1.2, z:-2.4, r:3.8 };
  spots.forEach(s => { s.w = clamp(1 - Math.hypot(s.x - SURGE.x, (s.z - SURGE.z) * 0.8) / SURGE.r, 0, 1); });
  kit.crowd(spots, { scale:P, motion:(s, i, { lt, t }) => {
    const beat = Math.abs(Math.sin(lt * TAU * 2 + s.ph));
    const calm = clamp(1 - fx.surge, 0, 1);
    let dy = (s.front ? beat * 0.09 * s.k : beat * 0.025) * (fx.lights > 0.5 ? 1 : 0.35);
    let dx = 0, dz = 0;
    if(s.w > 0 && fx.surge > 0.01){
      const w = s.w * fx.surge;
      dz = -w * (s.z + 3.3) * 0.42;
      dx = w * (0.22 * Math.sin(t * 1.7 + s.x * 0.8) + (SURGE.x - s.x) * 0.12);
      dy *= calm; dy += w * 0.03 * Math.abs(Math.sin(t * 5 + s.ph));
    }
    if(fx.push > 0.01 && s.w > 0.3) dz += fx.push * 0.25 * s.w;
    return { dx, dy, dz, yaw:Math.PI / 2 + 0.25 * Math.sin(lt * TAU * 0.1 + s.ph) * calm };
  } });

  /* density warning patch, extra stewards, medics */
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
      if(e.kind === 'steward' && e.z > -3.3) e.p.position.z = e.z + fx.push * 0.6;
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

  /* ---------- people at the fixed points (structures are in the GLB) ---------- */
  { const g = new THREE.Group(); g.position.set(0, G, 2.9);                       // FOH engineers
    kit.seated(g, -0.6, 0.5, 0.25, -Math.PI / 2, C.ink, P); kit.seated(g, 0.6, 0.5, 0.25, -Math.PI / 2, C.teal, P); kit.addStatic(g); }
  { const g = new THREE.Group(); g.position.set(-11.4, G, -2.6);                   // accessible platform
    for(const [x, z] of [[-0.8, -0.6], [0.6, -0.6]]){
      const ch = new THREE.Group(); ch.position.set(x, 1.1, z); ch.rotation.y = Math.PI / 2 + 0.6; g.add(ch);
      kit.box(0.24, 0.04, 0.24, C.ink, { r:0.01, y:0.18, parent:ch });
      kit.box(0.04, 0.22, 0.24, C.ink, { r:0.01, x:-0.12, y:0.3, parent:ch });
      for(const s of [-1, 1]){ const w = kit.cyl(0.12, 0.12, 0.03, C.ink, { seg:14, z:s * 0.14, y:0.12, parent:ch }); w.rotation.x = Math.PI / 2; }
      kit.seated(ch, -0.03, -0.02, 0, 0, kit.pick(kit.shirts), P);
    }
    kit.seated(g, 1.2, 1.1, 0.2, Math.PI / 2 + 0.6, C.yellow, P);
    kit.addStatic(g); }
  for(let i = 0; i < 3; i++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(-10.2, G, 0.9 + i * 0.55); p.rotation.y = Math.PI; kit.addStatic(p); }
  for(let i = 0; i < 4; i++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(-10.8 + i * 0.6, G, 5.15); p.rotation.y = Math.PI / 2; p.userData.armR.rotation.z = -1.2; kit.addStatic(p); }
  kit.queue({
    slots:[{ x:-11.2, z:5.0 }, { x:-10.85, z:5.55 }, { x:-10.6, z:6.15 }, { x:-10.45, z:6.75 }, { x:-10.35, z:7.35 }],
    exit:{ x:-11.9, z:4.5 }, spawn:{ x:-9.6, z:8.0 }, scale:P
  });
  [-3.0, -0.2, 2.6, 5.4].forEach((z, i) => {                                        // food vans: steam and queues
    const g = new THREE.Group(); g.position.set(12.3, G, z);
    kit.steam(g, 0.2, 1.85, 0.3, { count:3, period:2.5, rise:0.9, size:1 });
    kit.addStatic(g);
    if(i !== 1) for(let k = 0; k < 3; k++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(11.0 - k * 0.45, G, z + (k - 1) * 0.3); p.rotation.y = 0; kit.addStatic(p); }
  });
  kit.queue({
    slots:[{ x:11.1, z:-0.2 }, { x:10.6, z:-0.35 }, { x:10.1, z:-0.5 }, { x:9.6, z:-0.6 }, { x:9.1, z:-0.7 }],
    exit:{ x:11.0, z:0.8 }, spawn:{ x:8.4, z:-1.6 }, scale:P
  });
  for(let k = 0; k < 5; k++){ const p = kit.person(); p.scale.setScalar(P); p.position.set(10.2 + k * 0.6, G, 7.4); p.rotation.y = Math.PI / 2; kit.addStatic(p); }
  { const g = new THREE.Group(); g.position.set(6.0, G, -10.9);                   // generator exhaust
    kit.steam(g, 0.5, 1.4, 0, { count:3, period:2.5, rise:0.8, size:0.8 }); kit.addStatic(g); }
  for(const x of [-1.8, 1.4]){ const p = kit.person(HIVIS); p.scale.setScalar(P); p.position.set(x, G, 9.2); p.rotation.y = x < 0 ? 0 : Math.PI; kit.addStatic(p); }
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
      bug.position.set(9.6, G + 0.04, -0.5 + u * 8.5);
      bug.rotation.y = v >= 0 ? -Math.PI / 2 : Math.PI / 2;
      bug.scale.setScalar(0.8 * (bug.userData.pop ?? 1));
    });
  }

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
