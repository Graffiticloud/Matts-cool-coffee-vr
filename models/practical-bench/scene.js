/* Practical bench: a school chemistry lab with six practical stations, each driven by a branching scenario in spec.js.
   Back bench: A titration, E reflux and distillation (in the fume cupboard), C heating to constant mass.
   Front bench: B standard solution, D solvent extraction, F collecting a gas.
   Scenario steps call effect(name); each name eases its station towards a preset (FX). Units: 1 ≈ 0.5 m. */
import * as THREE from 'three';
import { TAU } from '../../engine/kit.js';
import { G, BT, ST } from './layout.js';

const DEF = { bLevel:0.25, drip:0, pink:0, deep:0, vf:0, over:0, stir:0, invert:0, flame:0, spit:0, desic:0,
  shake:0, mix:0, pop:0, drain:0, mantle:0, boil:0, green:0, distil:0, react:0, gas:0, leak:0, open:0, warn:0 };
/* each preset: the station it belongs to (for the warning lamp) and the values it sets */
export const FX = {
  calm:null, reset:null,
  burette:['A', { bLevel:1 }], burette_bad:['A', { bLevel:1, warn:1 }], pipette:['A', { bLevel:1 }],
  indicator:['A', { bLevel:1 }], titrate:['A', { bLevel:0.6, drip:1, pink:0.35 }], endpoint:['A', { bLevel:0.55, pink:1 }],
  overshoot:['A', { bLevel:0.35, drip:1, pink:1, deep:1, warn:1 }], titre_bad:['A', { bLevel:0.55, pink:1, warn:1 }],
  weigh:['B', {}], weigh_bad:['B', { warn:1 }], dissolve:['B', { stir:1 }], transfer:['B', { vf:0.55 }], transfer_bad:['B', { vf:0.5, warn:1 }],
  fill:['B', { vf:0.92 }], mark:['B', { vf:1 }], overfill:['B', { vf:1, over:1, warn:1 }], invert:['B', { vf:1, invert:1 }], mix_bad:['B', { vf:1, warn:1 }],
  crucible:['C', {}], crucible_bad:['C', { warn:1 }], heat:['C', { flame:1 }], spit:['C', { flame:1.3, spit:1, warn:1 }], heat_bad:['C', { flame:0.35, warn:1 }],
  cool:['C', { desic:1 }], cool_bad:['C', { warn:1 }], weighc:['C', {}],
  solvent:['D', {}], solvent_bad:['D', { mix:1, warn:1 }], tap_bad:['D', { drain:0.4, warn:1 }], shake:['D', { shake:1, mix:1 }], pressure:['D', { shake:1, mix:1, pop:1, warn:1 }],
  settle:['D', {}], drain:['D', { drain:1 }], drain_bad:['D', { drain:1, mix:1, warn:1 }],
  assemble:['E', {}], assemble_bad:['E', { warn:1 }], reflux:['E', { mantle:1, boil:1, green:0.6 }], sealed:['E', { mantle:1, boil:1, warn:1 }],
  bunsen_bad:['E', { warn:1 }], distil:['E', { mantle:1, boil:1, green:1, distil:1 }], distil_bad:['E', { mantle:1, boil:1, green:1, distil:1, warn:1 }],
  gas:['F', { react:1, gas:1 }], gas_bad:['F', { react:1, open:1, warn:1 }], leak:['F', { react:1, gas:0.12, leak:1, warn:1 }], gas_lost:['F', { react:1, gas:0.55, warn:1 }], fair:['F', {}]
};

export function build(kit){
  const C = kit.C;
  const fx = { ...DEF }, target = { ...DEF };
  let warnAt = null;
  kit.onTick(({ dt }) => { const k = 1 - Math.exp(-dt * 1.8); for(const key in fx) fx[key] += (target[key] - fx[key]) * k; });

  const glass = kit.mat(C.glass, { transparent:true, opacity:0.4, roughness:0.06, depthWrite:false });
  const liquid = (color, opacity = 0.78) => new THREE.MeshStandardMaterial({ color, transparent:true, opacity, roughness:0.2, depthWrite:false });
  const STEEL = 0xaab2bd, BENCH = 0x3b4359, TOP = 0x30364a, WHITE = 0xfbfbf8, RUBBER = 0x2d2f36;
  const UP = new THREE.Vector3(0, 1, 0);

  /* ---------- helpers ---------- */
  const station = id => { const g = kit.anim(new THREE.Group()); g.position.set(ST[id][0], BT, ST[id][1]); return g; };
  const glassMesh = (geo, parent, x, y, z) => { const m = new THREE.Mesh(geo, glass); m.position.set(x, y, z); m.renderOrder = 2; parent.add(m); return m; };
  const rod = (parent, a, b, r, color, opts) => {
    const d = new THREE.Vector3().subVectors(b, a), L = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 12), color === 'glass' ? glass : kit.mat(color, opts));
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize());
    if(color === 'glass') m.renderOrder = 2; else m.castShadow = true;
    parent.add(m); return m;
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function stand(parent, x, z, h = 2.2){
    kit.box(0.9, 0.06, 0.62, STEEL, { r:0.02, x, y:0.03, z, parent });
    kit.cyl(0.03, 0.03, h, STEEL, { x, y:h / 2, z:z - 0.22, parent, opts:{ metalness:0.5, roughness:0.35 } });
  }
  function clampAt(parent, x, y, z, reach = 0.22){ kit.box(0.06, 0.06, reach, STEEL, { r:0.015, x, y, z:z - 0.22 + reach / 2, parent }); }
  /* conical flask with a liquid whose colour we can change */
  function conical(parent, x, z, liqColor, s = 1){
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
    glassMesh(new THREE.CylinderGeometry(0.1, 0.32, 0.46, 24, 1, true), g, 0, 0.23, 0);
    glassMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 16, 1, true), g, 0, 0.56, 0);
    const mat = liquid(liqColor, 0.7);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.16, 24), mat); liq.position.y = 0.085; liq.renderOrder = 1; g.add(liq);
    return { g, mat, liq };
  }
  function beaker(parent, x, z, r = 0.2, h = 0.36, liqColor = 0xdff1f7, fill = 0.4){
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    glassMesh(new THREE.CylinderGeometry(r, r * 0.96, h, 24, 1, true), g, 0, h / 2, 0);
    const mat = liquid(liqColor, 0.6);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.9, h, 24), mat); liq.scale.y = fill; liq.position.y = h * fill / 2; liq.renderOrder = 1; g.add(liq);
    return { g, mat, liq, h };
  }
  function bottle(parent, x, z, color = WHITE){   // wash bottle
    kit.cyl(0.12, 0.13, 0.42, color, { x, y:0.21, z, parent });
    kit.cyl(0.04, 0.06, 0.08, color, { x, y:0.46, z, parent });
    rod(parent, V(x, 0.5, z), V(x + 0.18, 0.58, z), 0.012, color);
  }
  function lamp(id){   // warning lamp on each station
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 12), new THREE.MeshStandardMaterial({ color:C.orange, emissive:C.orange, emissiveIntensity:0.0, roughness:0.4 }));
    m.position.set(1.15, 0.12, 0.55); m.scale.setScalar(0.0001); return m;
  }

  /* ---------- room: slab, floor, two walls (the walls nearest the camera are cut away) ---------- */
  {
    const g = new THREE.Group();
    kit.box(16.6, 1.1, 11.2, C.slabSide, { r:0.45, y:-0.67, parent:g });
    kit.box(16.4, 0.15, 11.0, 0xe9ecef, { r:0.08, y:-0.045, parent:g });
    for(let i = -7; i <= 7; i++) kit.box(0.02, 0.005, 10.6, 0xd7dce2, { r:0.002, x:i * 1.1, y:G + 0.003, parent:g, shadow:false });
    kit.addBase(g);
    const w = new THREE.Group();
    kit.box(16.4, 4.6, 0.25, C.cream, { r:0.08, y:2.3 + G, z:-5.38, parent:w });
    kit.box(0.25, 4.6, 11.0, C.cream, { r:0.08, x:-8.08, y:2.3 + G, parent:w });
    for(const x of [-5.6, 5.6]){ kit.box(3.0, 1.7, 0.1, C.glass, { r:0.04, x, y:3.05, z:-5.22, parent:w, opts:{ roughness:0.1 } }); kit.box(3.2, 0.12, 0.2, C.royal, { r:0.03, x, y:2.15, z:-5.2, parent:w }); }
    /* eyewash station and a safety-equipment rack on the side wall: no text, just the colours pupils know */
    kit.box(0.5, 0.7, 0.18, C.green, { r:0.06, x:-7.86, y:2.2, z:-1.2, parent:w });
    kit.box(0.5, 0.5, 0.18, C.yellow, { r:0.06, x:-7.86, y:2.2, z:0.4, parent:w });
    kit.box(0.5, 0.5, 0.18, 0xd93a2f, { r:0.06, x:-7.86, y:2.2, z:1.6, parent:w });
    kit.addStatic(w, 0.15);
  }

  /* ---------- benches ---------- */
  {
    const g = new THREE.Group();
    for(const z of [-2.7, 1.9]){
      kit.box(14.6, 0.92, 2.1, BENCH, { r:0.06, y:G + 0.46, z, parent:g });
      kit.box(14.8, 0.1, 2.3, TOP, { r:0.04, y:BT - 0.05, z, parent:g });
      for(let i = 0; i < 5; i++) kit.box(2.4, 0.6, 0.04, 0x4a536b, { r:0.02, x:-5.8 + i * 2.9, y:G + 0.5, z:z + (z < 0 ? 1.06 : -1.06), parent:g });
    }
    /* stools along the front bench */
    for(const x of [-6, -3, 3, 6]){ kit.cyl(0.32, 0.32, 0.08, C.royal, { x, y:G + 0.78, z:3.6, parent:g }); kit.cyl(0.04, 0.04, 0.74, STEEL, { x, y:G + 0.38, z:3.6, parent:g }); kit.cyl(0.24, 0.28, 0.04, STEEL, { x, y:G + 0.02, z:3.6, parent:g }); }
    /* sink with a swan-neck tap at the end of the back bench */
    kit.box(1.2, 0.08, 0.9, STEEL, { r:0.04, x:6.6, y:BT + 0.01, z:-2.7, parent:g, opts:{ metalness:0.4, roughness:0.3 } });
    kit.cyl(0.03, 0.03, 0.7, STEEL, { x:6.6, y:BT + 0.35, z:-3.2, parent:g });
    kit.box(0.06, 0.06, 0.32, STEEL, { r:0.02, x:6.6, y:BT + 0.7, z:-3.05, parent:g });
    kit.addStatic(g, 0.3);
  }

  /* ---------- fume cupboard around station E ---------- */
  {
    const g = new THREE.Group(); g.position.set(ST.E[0], BT, ST.E[1]);
    kit.box(3.4, 0.12, 1.9, C.cream, { r:0.04, y:2.9, z:-0.05, parent:g });
    kit.box(0.12, 2.9, 1.9, C.cream, { r:0.04, x:-1.7, y:1.45, z:-0.05, parent:g });
    kit.box(0.12, 2.9, 1.9, C.cream, { r:0.04, x:1.7, y:1.45, z:-0.05, parent:g });
    kit.box(3.4, 2.9, 0.1, 0xdfe3e8, { r:0.03, y:1.45, z:-1.0, parent:g });
    kit.box(3.3, 0.9, 0.04, C.glass, { r:0.02, y:2.35, z:0.88, parent:g, opts:{ transparent:true, opacity:0.35, roughness:0.05, depthWrite:false } });
    kit.box(3.4, 0.08, 0.1, C.teal, { r:0.02, y:1.88, z:0.9, parent:g });
    kit.cyl(0.25, 0.25, 1.5, STEEL, { y:3.7, z:-0.6, parent:g });
    kit.addStatic(g, 0.35);
  }

  const lamps = {};
  const parts = {};

  /* ---------- A: titration ---------- */
  {
    const g = station('A');
    kit.box(0.8, 0.03, 0.8, WHITE, { r:0.01, y:0.015, z:0.05, parent:g });
    stand(g, 0, 0);
    clampAt(g, 0, 1.55, 0);
    glassMesh(new THREE.CylinderGeometry(0.055, 0.055, 1.5, 16, 1, true), g, 0, 1.55, 0);
    const bm = liquid(0xe6f3fb, 0.85), bl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.4, 14), bm);
    bl.renderOrder = 1; g.add(bl);
    kit.box(0.14, 0.05, 0.05, RUBBER, { r:0.01, y:0.78, parent:g });
    kit.cyl(0.012, 0.03, 0.12, C.glass, { y:0.7, parent:g, opts:{ transparent:true, opacity:0.5 } });
    kit.cyl(0.12, 0.04, 0.12, C.glass, { y:2.36, parent:g, opts:{ transparent:true, opacity:0.5 } });     // funnel, left in by the careless
    const fl = conical(g, 0, 0.05, 0xf6f7fa);
    const drop = kit.sph(0.025, 0xe6f3fb, { y:0.66, parent:g, opts:{ transparent:true, opacity:0.9 } });
    /* pipette with filler, lying on the bench, and a bottle of indicator */
    rod(g, V(-0.95, 0.06, 0.55), V(-0.95, 0.06, -0.45), 0.02, 'glass');
    kit.sph(0.07, C.glass, { x:-0.95, y:0.07, z:0.05, parent:g, opts:{ transparent:true, opacity:0.5 } });
    kit.sph(0.08, 0xd93a2f, { x:-0.95, y:0.08, z:-0.52, parent:g });
    kit.cyl(0.07, 0.07, 0.22, 0x7a4b2a, { x:0.75, y:0.11, z:-0.35, parent:g });
    kit.cyl(0.03, 0.03, 0.07, RUBBER, { x:0.75, y:0.26, z:-0.35, parent:g });
    bottle(g, 0.85, 0.35);
    lamps.A = lamp(); g.add(lamps.A);
    kit.addDynamic(g, 0.6);
    parts.A = { bl, bm, fl, drop };
  }

  /* ---------- B: standard solution ---------- */
  {
    const g = station('B');
    /* balance */
    kit.box(0.7, 0.18, 0.6, C.cream, { r:0.05, x:-0.85, y:0.09, z:0, parent:g });
    kit.cyl(0.2, 0.2, 0.03, STEEL, { x:-0.85, y:0.2, z:-0.05, parent:g });
    kit.box(0.3, 0.06, 0.04, C.teal, { r:0.01, x:-0.85, y:0.12, z:0.31, parent:g, opts:{ emissive:C.teal, emissiveIntensity:0.5 } });
    kit.cyl(0.08, 0.06, 0.08, C.glass, { x:-0.85, y:0.26, z:-0.05, parent:g, opts:{ transparent:true, opacity:0.55 } });   // sample tube
    /* beaker with stirring rod */
    const bk = beaker(g, -0.1, 0.25, 0.18, 0.32, 0xdff1f7, 0.45);
    const stirG = new THREE.Group(); stirG.position.set(-0.1, 0.02, 0.25); g.add(stirG);
    rod(stirG, V(0.05, 0.02, 0), V(-0.05, 0.5, 0), 0.012, 'glass');
    /* volumetric flask with funnel */
    const vfG = new THREE.Group(); vfG.position.set(0.65, 0, -0.1); g.add(vfG);
    glassMesh(new THREE.SphereGeometry(0.28, 26, 18), vfG, 0, 0.28, 0);
    glassMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.75, 14, 1, true), vfG, 0, 0.88, 0);
    const mark = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.006, 6, 24), kit.mat(C.ink)); mark.rotation.x = Math.PI / 2; mark.position.y = 1.05; vfG.add(mark);
    const vm = liquid(0xdff1f7, 0.7);
    const vBulb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), vm); vBulb.position.y = 0.28; vBulb.renderOrder = 1; vfG.add(vBulb);
    const vNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1, 12), vm); vNeck.renderOrder = 1; vfG.add(vNeck);
    kit.cyl(0.05, 0.05, 0.08, C.ink, { y:1.3, parent:vfG });   // stopper
    bottle(g, 0.2, -0.55);
    lamps.B = lamp(); g.add(lamps.B);
    kit.addDynamic(g, 0.65);
    parts.B = { stirG, vfG, vBulb, vNeck, vm, bk };
  }

  /* ---------- C: heating to constant mass ---------- */
  {
    const g = station('C');
    /* tripod, pipeclay triangle, crucible and lid, Bunsen */
    for(let i = 0; i < 3; i++){ const a = i / 3 * TAU + 0.3; rod(g, V(-0.3 + 0.34 * Math.cos(a), 0, 0.34 * Math.sin(a)), V(-0.3 + 0.22 * Math.cos(a), 0.78, 0.22 * Math.sin(a)), 0.018, STEEL); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 8, 30), kit.mat(STEEL)); ring.rotation.x = Math.PI / 2; ring.position.set(-0.3, 0.78, 0); g.add(ring);
    const tri = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 6, 3), kit.mat(0xe8e2d6)); tri.rotation.x = Math.PI / 2; tri.position.set(-0.3, 0.8, 0); g.add(tri);
    const cru = new THREE.Group(); cru.position.set(-0.3, 0.8, 0); g.add(cru);
    kit.cyl(0.13, 0.09, 0.17, 0xf1ece2, { y:0.07, parent:cru });
    kit.cyl(0.11, 0.08, 0.02, 0xdcd4c2, { y:0.14, parent:cru });
    const lid = kit.cyl(0.15, 0.15, 0.025, 0xf1ece2, { y:0.17, parent:cru }); lid.position.x = 0.06; lid.rotation.z = 0.12;
    kit.cyl(0.08, 0.13, 0.05, STEEL, { x:-0.3, y:0.025, parent:g });
    kit.cyl(0.04, 0.04, 0.38, STEEL, { x:-0.3, y:0.24, parent:g, opts:{ metalness:0.5, roughness:0.35 } });
    rod(g, V(-0.3, 0.06, 0), V(-0.3, 0.06, -0.8), 0.025, 0xe9a62f);   // gas tubing
    const flameM = new THREE.MeshStandardMaterial({ color:0x4f8cff, emissive:0x3a6cff, emissiveIntensity:0.8, transparent:true, opacity:0.55, depthWrite:false });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 16), flameM); flame.position.set(-0.3, 0.58, 0); flame.renderOrder = 3; g.add(flame);
    const sparks = [0, 1, 2, 3].map(() => kit.sph(0.018, 0xffffff, { x:-0.3, y:1.0, parent:g }));
    /* desiccator */
    const dg = new THREE.Group(); dg.position.set(0.55, 0, 0.1); g.add(dg);
    glassMesh(new THREE.CylinderGeometry(0.34, 0.3, 0.42, 26, 1, true), dg, 0, 0.21, 0);
    kit.cyl(0.29, 0.27, 0.1, 0x4b7ad9, { y:0.06, parent:dg });   // blue silica gel
    const dome = glassMesh(new THREE.SphereGeometry(0.35, 26, 12, 0, TAU, 0, Math.PI / 2), dg, 0, 0.42, 0);
    kit.sph(0.06, C.glass, { y:0.78, parent:dg, opts:{ transparent:true, opacity:0.6 } });
    const ghost = new THREE.Group(); ghost.position.set(0, 0.3, 0); dg.add(ghost);   // crucible shown inside when cooling
    kit.cyl(0.11, 0.08, 0.15, 0xf1ece2, { y:0, parent:ghost });
    /* tongs */
    rod(g, V(0.3, 0.03, 0.6), V(0.9, 0.03, 0.45), 0.012, STEEL); rod(g, V(0.3, 0.03, 0.6), V(0.9, 0.03, 0.55), 0.012, STEEL);
    lamps.C = lamp(); g.add(lamps.C);
    kit.addDynamic(g, 0.7);
    parts.C = { flame, flameM, sparks, ghost, cru };
  }

  /* ---------- D: solvent extraction ---------- */
  {
    const g = station('D');
    stand(g, 0, 0, 2.0);
    const ringD = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 8, 26), kit.mat(STEEL)); ringD.rotation.x = Math.PI / 2; ringD.position.set(0, 1.05, 0); g.add(ringD);
    kit.box(0.04, 0.04, 0.22, STEEL, { r:0.01, y:1.05, z:-0.11, parent:g });
    const fun = new THREE.Group(); fun.position.set(0, 1.05, 0); g.add(fun);
    glassMesh(new THREE.SphereGeometry(0.26, 24, 18), fun, 0, 0.35, 0).scale.set(1, 1.35, 1);
    glassMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12, 1, true), fun, 0, -0.1, 0);
    kit.box(0.14, 0.04, 0.04, 0x3b6bd9, { r:0.01, y:-0.02, parent:fun });   // tap
    const stopper = kit.cyl(0.05, 0.04, 0.09, RUBBER, { y:0.74, parent:fun });
    const upM = liquid(0x7d3c98, 0.8), loM = liquid(0xd9b066, 0.65);
    const upper = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 12, 0, TAU, 0, Math.PI / 2), upM); upper.position.y = 0.36; upper.renderOrder = 1; upper.scale.set(1, 0.9, 1); fun.add(upper);
    const lower = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 12, 0, TAU, Math.PI / 2, Math.PI / 2), loM); lower.position.y = 0.34; lower.renderOrder = 1; lower.scale.set(1, 1.2, 1); fun.add(lower);
    const bk = beaker(g, 0, 0.05, 0.2, 0.36, 0xe8d6a3, 0.05);
    const conicalD = conical(g, 0.8, 0.25, 0x7d3c98, 0.8); conicalD.liq.scale.y = 0.6;
    bottle(g, -0.8, 0.3, 0xfff2c7);
    lamps.D = lamp(); g.add(lamps.D);
    kit.addDynamic(g, 0.75);
    parts.D = { fun, stopper, upM, loM, lower, upper, bk };
  }

  /* ---------- E: reflux (left) and distillation (right) in the fume cupboard ---------- */
  {
    const g = station('E');
    /* reflux */
    const mantleM = new THREE.MeshStandardMaterial({ color:0x3b3f4c, emissive:0xff6a13, emissiveIntensity:0, roughness:0.6 });
    const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.28, 24), mantleM); mantle.position.set(-0.7, 0.14, 0); mantle.castShadow = true; g.add(mantle);
    stand(g, -0.7, 0.05, 2.4);
    glassMesh(new THREE.SphereGeometry(0.22, 24, 18), g, -0.7, 0.45, 0);
    glassMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12, 1, true), g, -0.7, 0.72, 0);
    const rM = liquid(0xe8811c, 0.8);
    const rLiq = new THREE.Mesh(new THREE.SphereGeometry(0.19, 22, 12, 0, TAU, Math.PI / 2, Math.PI / 2), rM); rLiq.position.set(-0.7, 0.45, 0); rLiq.renderOrder = 1; g.add(rLiq);
    glassMesh(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 18, 1, true), g, -0.7, 1.4, 0);
    rod(g, V(-0.7, 0.85, 0), V(-0.7, 1.98, 0), 0.03, 'glass');
    clampAt(g, -0.7, 1.4, 0.05);
    const waterM = new THREE.MeshStandardMaterial({ color:0x8fd2ef, transparent:true, opacity:0.5, depthWrite:false });
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 1.05, 18), waterM); jacket.position.set(-0.7, 1.4, 0); jacket.renderOrder = 1; g.add(jacket);
    rod(g, V(-0.61, 0.95, 0), V(-0.3, 0.95, 0.35), 0.022, C.teal);   // water in at the bottom
    rod(g, V(-0.61, 1.85, 0), V(-0.3, 1.95, 0.35), 0.022, C.teal);   // out at the top
    kit.sph(0.02, 0xffffff, { x:-0.62, y:0.42, z:0.08, parent:g });  // anti-bumping granules
    kit.sph(0.02, 0xffffff, { x:-0.76, y:0.4, z:-0.05, parent:g });
    const bubbles = [0, 1, 2, 3, 4].map(i => kit.sph(0.025, 0xffffff, { x:-0.7 + (i - 2) * 0.05, y:0.4, parent:g, opts:{ transparent:true, opacity:0.8 } }));
    const ringV = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 20), new THREE.MeshStandardMaterial({ color:0xffffff, transparent:true, opacity:0.0, depthWrite:false }));
    ringV.rotation.x = Math.PI / 2; ringV.position.set(-0.7, 1.2, 0); g.add(ringV);
    /* distillation: flask, still head with thermometer, sloping condenser, receiver */
    const m2 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.22, 24), mantleM); m2.position.set(0.25, 0.11, 0); g.add(m2);
    glassMesh(new THREE.SphereGeometry(0.18, 22, 16), g, 0.25, 0.38, 0);
    glassMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.45, 12, 1, true), g, 0.25, 0.72, 0);
    rod(g, V(0.25, 0.98, 0), V(0.25, 0.68, 0), 0.012, 0xe0453a);  // thermometer, bulb at the side arm
    kit.sph(0.025, 0xe0453a, { x:0.25, y:0.82, parent:g });
    rod(g, V(0.25, 0.85, 0), V(1.15, 0.45, 0), 0.07, 'glass');
    rod(g, V(0.3, 0.83, 0), V(1.2, 0.43, 0), 0.025, 'glass');
    const rec = conical(g, 1.25, 0, 0xdff1f7, 0.6); rec.liq.scale.y = 0.2;
    const dDrop = kit.sph(0.022, 0xdff1f7, { x:1.25, y:0.4, parent:g, opts:{ transparent:true, opacity:0.9 } });
    lamps.E = lamp(); lamps.E.position.set(1.35, 0.12, 0.65); g.add(lamps.E);
    kit.addDynamic(g, 0.8);
    parts.E = { mantleM, rM, bubbles, ringV, rec, dDrop };
  }

  /* ---------- F: collecting a gas in a gas syringe ---------- */
  {
    const g = station('F');
    const fl = conical(g, -0.75, 0.05, 0xe7f2f7);
    for(let i = 0; i < 6; i++) kit.box(0.08, 0.06, 0.08, 0xf5f5f0, { r:0.02, x:-0.75 + Math.cos(i * 1.7) * 0.15, y:0.04, z:0.05 + Math.sin(i * 1.7) * 0.15, parent:g });
    const bung = kit.cyl(0.08, 0.065, 0.1, RUBBER, { x:-0.75, y:0.67, z:0.05, parent:g });
    rod(g, V(-0.75, 0.7, 0.05), V(-0.75, 0.95, 0.05), 0.018, 'glass');
    rod(g, V(-0.75, 0.95, 0.05), V(-0.25, 0.95, 0.05), 0.018, 'glass');
    stand(g, 0.3, 0.05, 1.3);
    clampAt(g, 0.3, 0.95, 0.05, 0.25);
    rod(g, V(-0.25, 0.95, 0.05), V(0.75, 0.95, 0.05), 0.075, 'glass');            // syringe barrel
    const plunger = new THREE.Group(); plunger.position.set(-0.15, 0.95, 0.05); g.add(plunger);
    rod(plunger, V(0, 0, 0), V(0.95, 0, 0), 0.02, C.cream);
    kit.cyl(0.068, 0.068, 0.04, C.cream, { parent:plunger }).rotation.z = Math.PI / 2;
    kit.cyl(0.1, 0.1, 0.03, C.cream, { x:0.95, parent:plunger }).rotation.z = Math.PI / 2;
    for(let i = 0; i < 9; i++) kit.box(0.006, 0.03, 0.002, C.ink, { r:0.001, x:-0.15 + i * 0.1, y:0.95 + 0.07, z:0.12, parent:g, shadow:false });
    const fb = [0, 1, 2, 3].map(() => kit.sph(0.022, 0xffffff, { x:-0.75, y:0.1, z:0.05, parent:g, opts:{ transparent:true, opacity:0.85 } }));
    const puffM = new THREE.MeshStandardMaterial({ color:0xffffff, transparent:true, opacity:0, depthWrite:false });
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), puffM); puff.position.set(-0.75, 0.75, 0.05); g.add(puff);
    const open = beaker(g, 0.95, 0.45, 0.16, 0.3, 0xe7f2f7, 0.5);
    kit.cyl(0.07, 0.07, 0.12, C.ink, { x:-0.15, y:0.06, z:0.55, parent:g });   // stopclock
    kit.cyl(0.05, 0.05, 0.02, WHITE, { x:-0.15, y:0.125, z:0.55, parent:g });
    lamps.F = lamp(); g.add(lamps.F);
    kit.addDynamic(g, 0.85);
    parts.F = { plunger, fb, puff, puffM, fl };
  }

  /* ---------- motion ---------- */
  const cClear = new THREE.Color(0xf6f7fa), cPale = new THREE.Color(0xf7c8de), cPink = new THREE.Color(0xe2569a), cDeep = new THREE.Color(0xb3126b);
  const cOrange = new THREE.Color(0xe8811c), cGreen = new THREE.Color(0x3f9a5a), tmp = new THREE.Color();
  const cIodAq = new THREE.Color(0xd9b066), cAqDone = new THREE.Color(0xf0ead8), cMix = new THREE.Color(0xa77a7a), cPurple = new THREE.Color(0x7d3c98);
  kit.onTick(({ t, dt }) => {
    /* A titration */
    const A = parts.A, lv = fx.bLevel;
    A.bl.scale.y = Math.max(0.02, lv); A.bl.position.y = 0.85 + 0.7 * lv;
    const dp = (t * 2.2) % 1; A.drop.visible = fx.drip > 0.3; A.drop.position.y = 0.7 - dp * 0.55;
    tmp.copy(cClear).lerp(cPale, Math.min(1, fx.pink * 1.6)).lerp(cPink, Math.max(0, fx.pink - 0.6) * 2).lerp(cDeep, fx.deep);
    A.fl.mat.color.copy(tmp);
    if(fx.drip > 0.3 && fx.pink < 0.8) A.fl.mat.color.lerp(cPale, 0.5 + 0.5 * Math.sin(t * 6));   // pink flashes that vanish on swirling
    A.fl.g.rotation.y = fx.drip * 0.25 * Math.sin(t * 4);

    /* B standard solution */
    const B = parts.B;
    B.stirG.rotation.y = fx.stir * t * 3;
    const v = Math.min(1, fx.vf);
    B.vBulb.scale.setScalar(Math.max(0.001, Math.min(1, v * 1.6)));
    const neck = Math.max(0, (v - 0.6) / 0.4) * 0.53 + fx.over * 0.12;
    B.vNeck.scale.y = Math.max(0.001, neck); B.vNeck.position.y = 0.5 + neck / 2;
    B.vfG.rotation.z = fx.invert * Math.PI * (0.5 + 0.5 * Math.sin(t * 2.5));

    /* C constant mass */
    const Cc = parts.C;
    Cc.flame.scale.set(1, Math.max(0.001, fx.flame), 1); Cc.flame.position.y = 0.43 + 0.15 * fx.flame; Cc.flame.visible = fx.flame > 0.02;
    Cc.flameM.emissiveIntensity = 0.5 + 0.3 * Math.sin(t * 20);
    Cc.sparks.forEach((s, i) => { const p = (t * 1.3 + i / 4) % 1; s.visible = fx.spit > 0.3; s.position.set(-0.3 + Math.cos(i * 1.9) * p * 0.4, 1.0 + p * 0.5 - p * p * 0.6, Math.sin(i * 1.9) * p * 0.4); });
    Cc.ghost.visible = fx.desic > 0.5; Cc.cru.visible = fx.desic < 0.5;

    /* D solvent extraction */
    const D = parts.D;
    D.fun.rotation.z = fx.shake * 0.5 * Math.sin(t * 9);
    D.stopper.position.y = 0.74 + fx.pop * (0.25 + 0.05 * Math.sin(t * 7));
    D.upM.color.copy(cPurple).lerp(cMix, fx.mix * 0.8);
    D.loM.color.copy(cIodAq).lerp(cAqDone, Math.min(1, fx.drain + 0.4)).lerp(cMix, fx.mix * 0.8);
    D.lower.scale.y = Math.max(0.001, 1.2 * (1 - fx.drain));
    D.bk.liq.scale.y = 0.05 + 0.4 * fx.drain; D.bk.liq.position.y = D.bk.h * D.bk.liq.scale.y / 2;

    /* E reflux and distillation */
    const E = parts.E;
    E.mantleM.emissiveIntensity = 0.35 * fx.mantle;
    E.rM.color.copy(cOrange).lerp(cGreen, fx.green);
    E.bubbles.forEach((b, i) => { const p = (t * 1.5 + i / 5) % 1; b.visible = fx.boil > 0.3; b.position.y = 0.32 + p * 0.25; });
    E.ringV.material.opacity = 0.55 * fx.boil; E.ringV.position.y = 1.15 + 0.08 * Math.sin(t * 1.5);
    const dd = (t * 1.6) % 1; E.dDrop.visible = fx.distil > 0.3; E.dDrop.position.y = 0.42 - dd * 0.2;
    E.rec.liq.scale.y = 0.2 + 0.5 * fx.distil;

    /* F gas syringe */
    const F = parts.F;
    F.plunger.position.x = -0.15 + 0.75 * fx.gas;
    F.fb.forEach((b, i) => { const p = (t * 1.8 + i / 4) % 1; b.visible = fx.react > 0.3; b.position.set(-0.75 + Math.cos(i * 2.1) * 0.12, 0.05 + p * 0.12, 0.05 + Math.sin(i * 2.1) * 0.12); });
    const pp = (t * 0.9) % 1; F.puffM.opacity = fx.leak * 0.5 * (1 - pp); F.puff.scale.setScalar(0.4 + pp);

    /* the warning lamp on the station in use */
    for(const id in lamps){
      const on = warnAt === id ? fx.warn : 0;
      lamps[id].scale.setScalar(Math.max(0.0001, on));
      lamps[id].material.emissiveIntensity = on * (0.45 + 0.4 * Math.abs(Math.sin(t * 4)));
    }
  });

  return {
    effect(name){
      const p = FX[name];
      Object.assign(target, DEF);
      if(p){ warnAt = p[0]; Object.assign(target, p[1]); }
      else warnAt = null;
    }
  };
}
