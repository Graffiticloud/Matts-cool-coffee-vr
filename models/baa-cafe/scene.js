/* Matt's Cool Coffee, inside: a cut-away café interior built from the shared kit. Units: 1 ≈ 0.8 m. */
import * as THREE from 'three';
import { TAU, smooth } from '../../engine/kit.js';

export function build(kit){
  const C = kit.C, G = kit.G, CT = G + 1.08; // floor top, counter top

  /* ---------- shell: slab, floor seams, two cut-away walls ---------- */
  {
    const base = new THREE.Group();
    kit.box(14.4, 1.1, 11.4, C.slabSide, { r:0.45, y:-0.67, parent:base });
    kit.box(14.2, 0.15, 11.2, 0xead9bf, { r:0.08, y:-0.045, parent:base });
    const seams = new THREE.InstancedMesh(kit.rbGeo(14.0, 0.006, 0.025, 0.002), kit.mat(0xd6c19f), 19);
    const m4 = new THREE.Matrix4();
    for(let i = 0; i < 19; i++){ m4.makeTranslation(0, G + 0.002, -5.0 + i * 0.56); seams.setMatrixAt(i, m4); }
    seams.receiveShadow = true; base.add(seams);
    kit.addBase(base);
  }
  {
    const walls = new THREE.Group();
    kit.box(14.2, 4.2, 0.3, C.cream, { r:0.06, y:G + 2.1, z:-5.45, parent:walls });
    kit.box(0.3, 4.2, 11.2, C.cream, { r:0.06, x:-6.95, y:G + 2.1, parent:walls });
    kit.box(14.24, 1.1, 0.34, C.royal, { r:0.05, y:G + 0.55, z:-5.43, parent:walls });
    kit.box(0.34, 1.1, 11.24, C.royal, { r:0.05, x:-6.93, y:G + 0.55, parent:walls });
    kit.box(14.3, 0.12, 0.4, C.yellow, { r:0.04, y:G + 4.22, z:-5.45, parent:walls });
    kit.box(0.4, 0.12, 11.3, C.yellow, { r:0.04, x:-6.95, y:G + 4.22, parent:walls });
    /* left-wall windows with a bright outdoor glow */
    for(const wz of [-1.9, 2.2]){
      kit.box(0.36, 1.7, 2.7, 0xcfe6f2, { r:0.04, x:-6.95, y:G + 2.55, z:wz, parent:walls, opts:{ emissive:0xbfe0f5, emissiveIntensity:0.55, roughness:0.15 }, shadow:false });
      kit.box(0.42, 0.1, 2.85, C.royalDeep, { r:0.03, x:-6.92, y:G + 1.67, z:wz, parent:walls });
      kit.box(0.42, 0.1, 2.85, C.royalDeep, { r:0.03, x:-6.92, y:G + 3.43, z:wz, parent:walls });
      for(const dz of [-1.38, 0, 1.38]) kit.box(0.42, 1.8, 0.08, C.royalDeep, { r:0.02, x:-6.92, y:G + 2.55, z:wz + dz, parent:walls });
      kit.box(0.5, 0.06, 2.9, C.cream, { r:0.02, x:-6.72, y:G + 1.6, z:wz, parent:walls });
    }
    /* framed prints */
    kit.box(1.0, 1.3, 0.06, C.teal, { r:0.03, x:-5.2, y:G + 2.6, z:-5.27, parent:walls });
    kit.box(0.8, 1.1, 0.07, C.cream, { r:0.02, x:-5.2, y:G + 2.6, z:-5.25, parent:walls });
    kit.cupMark(walls, -5.2, G + 2.6, -5.19, 1.6, C.orange);
    kit.addBase(walls);
  }

  /* ---------- menu board (hotspot: signs, symbols, artefacts) ---------- */
  {
    const g = new THREE.Group(); g.position.set(2.9, G, -5.24);
    kit.box(3.4, 1.45, 0.1, C.royalDeep, { r:0.05, y:3.05, parent:g });
    kit.box(3.26, 1.31, 0.04, C.ink, { r:0.03, y:3.05, z:0.04, parent:g });
    for(let c = 0; c < 3; c++){
      const x0 = -1.42 + c * 1.04;
      kit.box(0.62, 0.09, 0.02, C.yellow, { r:0.02, x:x0 + 0.31, y:3.52, z:0.07, parent:g, shadow:false });
      for(let r = 0; r < 4; r++){
        kit.box(0.5 - (r % 2) * 0.12, 0.05, 0.02, C.cream, { r:0.015, x:x0 + 0.25 - (r % 2) * 0.06, y:3.3 - r * 0.2, z:0.07, parent:g, shadow:false });
        kit.box(0.12, 0.05, 0.02, C.yellow, { r:0.015, x:x0 + 0.8, y:3.3 - r * 0.2, z:0.07, parent:g, shadow:false });
      }
    }
    kit.cupMark(g, 1.4, 2.5, 0.09, 0.8);
    kit.addStatic(g);
  }

  /* ---------- merchandise wall ---------- */
  {
    const g = new THREE.Group(); g.position.set(-2.4, G, -5.12);
    for(const y of [1.5, 2.2, 2.9]){
      kit.box(2.8, 0.06, 0.42, C.cream, { r:0.02, y, parent:g });
      for(let i = 0; i < 6; i++){
        const x = -1.15 + i * 0.46, k = (i + Math.round(y * 3)) % 3;
        if(k === 0) kit.box(0.26, 0.36, 0.18, [C.teal, C.orange, C.yellow][i % 3], { r:0.04, x, y:y + 0.21, parent:g });
        else if(k === 1) kit.cyl(0.1, 0.1, 0.3, [C.royal, C.green][i % 2], { x, y:y + 0.18, parent:g });
        else { kit.cyl(0.09, 0.08, 0.2, C.cream, { x, y:y + 0.13, parent:g }); kit.cupMark(g, x + 0.12, y + 0.13, 0, 0.5, C.cream); }
      }
    }
    for(const x of [-1.38, 1.38]) kit.box(0.06, 1.7, 0.06, C.ink, { r:0.02, x, y:2.15, z:0.18, parent:g });
    kit.addStatic(g);
  }

  /* ---------- speaker with sound waves (hotspot: atmospherics) ---------- */
  {
    const g = new THREE.Group(); g.position.set(-5.9, G, -5.15);
    kit.box(0.56, 0.78, 0.36, C.ink, { r:0.08, y:3.55, parent:g });
    kit.cyl(0.17, 0.17, 0.04, 0x3a4066, { x:0, y:3.43, z:0.19, parent:g }).rotation.x = Math.PI / 2;
    kit.cyl(0.08, 0.08, 0.04, 0x3a4066, { x:0, y:3.78, z:0.19, parent:g }).rotation.x = Math.PI / 2;
    kit.box(0.08, 0.3, 0.3, C.ink, { r:0.02, y:3.1, z:-0.05, parent:g });
    const rings = [];
    for(let i = 0; i < 3; i++){
      const m = kit.anim(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 40),
        new THREE.MeshBasicMaterial({ color:C.orange, transparent:true, opacity:0, depthWrite:false })));
      m.position.set(0, 3.5, 0.3); g.add(m); rings.push(m);
    }
    kit.onTick(({ lt }) => rings.forEach((m, i) => {
      const p = ((lt / 2) + i / 3) % 1;
      m.scale.setScalar(0.4 + p * 1.6); m.position.z = 0.3 + p * 0.5; m.material.opacity = Math.sin(p * Math.PI) * 0.6;
    }));
    kit.addStatic(g);
  }

  /* ---------- counter, back bar, espresso machine, grinder, till, pastry case ---------- */
  {
    const g = new THREE.Group(); g.position.set(0, G, 0);
    kit.box(6.2, 1.0, 1.0, C.royal, { r:0.06, x:3.3, y:0.5, z:-3.8, parent:g });
    kit.box(6.2, 0.12, 1.02, C.ink, { r:0.03, x:3.3, y:0.06, z:-3.8, parent:g });
    kit.box(6.36, 0.08, 1.12, C.cream, { r:0.03, x:3.3, y:1.04, z:-3.8, parent:g });
    for(let i = 0; i < 6; i++) kit.box(0.9, 0.6, 0.03, C.royalDeep, { r:0.02, x:0.75 + i * 1.02, y:0.52, z:-3.29, parent:g });
    /* back bar */
    kit.box(6.2, 0.95, 0.5, C.teal, { r:0.05, x:3.3, y:0.475, z:-5.02, parent:g });
    kit.box(6.3, 0.06, 0.56, C.cream, { r:0.02, x:3.3, y:0.98, z:-5.02, parent:g });
    for(let i = 0; i < 7; i++) kit.cyl(0.05, 0.05, 0.36 + (i % 3) * 0.06, [C.orange, C.yellow, C.green, 0x8a4b2a][i % 4], { x:0.6 + i * 0.22, y:1.18, z:-5.05, parent:g });
    for(let i = 0; i < 4; i++) for(let j = 0; j < 3; j++) kit.cyl(0.08, 0.07, 0.16, C.cream, { x:3.0 + i * 0.22, y:1.09 + j * 0.16, z:-5.05, parent:g });
    kit.addStatic(g);
  }
  let wandSteam;
  {
    const g = new THREE.Group(); g.position.set(4.9, CT, -3.8);
    kit.box(1.15, 0.58, 0.58, C.orange, { r:0.07, y:0.29, parent:g });
    kit.box(1.17, 0.06, 0.6, C.steel, { r:0.02, y:0.6, parent:g, opts:{ metalness:0.6, roughness:0.3 } });
    for(const x of [-0.3, 0.3]){
      kit.cyl(0.08, 0.08, 0.12, C.steel, { x, y:0.3, z:-0.34, parent:g, opts:{ metalness:0.6, roughness:0.3 } });
      kit.box(0.06, 0.04, 0.24, C.ink, { r:0.015, x, y:0.24, z:-0.48, parent:g });
      kit.cyl(0.05, 0.04, 0.08, C.cream, { x, y:0.07, z:-0.4, parent:g });
    }
    kit.box(1.0, 0.04, 0.22, C.steel, { r:0.01, y:0.02, z:-0.4, parent:g, opts:{ metalness:0.6, roughness:0.3 } });
    for(const x of [-0.25, 0.25]) kit.cyl(0.07, 0.07, 0.02, C.cream, { x, y:0.4, z:0.3, parent:g }).rotation.x = Math.PI / 2;
    kit.cyl(0.012, 0.012, 0.3, C.steel, { x:0.52, y:0.2, z:-0.32, parent:g });
    for(let i = 0; i < 4; i++) kit.cyl(0.055, 0.045, 0.1, C.cream, { x:-0.4 + i * 0.26, y:0.68, z:0, parent:g });
    kit.steam(g, 0.52, 0.06, -0.35, { count:4, period:2, rise:0.5, size:0.7 });
    kit.steam(g, 0, 0.7, 0, { count:3, period:2.5, rise:0.6, size:0.6 });
    kit.addStatic(g);
    /* grinder */
    const gr = new THREE.Group(); gr.position.set(5.9, CT, -3.75);
    kit.box(0.36, 0.5, 0.36, C.teal, { r:0.05, y:0.25, parent:gr });
    kit.cyl(0.18, 0.08, 0.32, 0x6b4a2f, { y:0.66, parent:gr });
    kit.cyl(0.19, 0.19, 0.04, C.ink, { y:0.83, parent:gr });
    kit.addStatic(gr);
  }
  {
    /* till and card reader */
    const g = new THREE.Group(); g.position.set(1.3, CT, -3.55);
    kit.box(0.12, 0.22, 0.12, C.ink, { r:0.03, y:0.11, parent:g });
    const screen = kit.box(0.5, 0.34, 0.05, C.ink, { r:0.03, y:0.32, z:0.02, parent:g }); screen.rotation.x = -0.45;
    const face = kit.box(0.44, 0.28, 0.02, 0x9fb4f5, { r:0.02, y:0.33, z:0.05, parent:g, opts:{ emissive:0x6f8de8, emissiveIntensity:0.6 }, shadow:false }); face.rotation.x = -0.45;
    kit.box(0.12, 0.04, 0.2, C.ink, { r:0.02, x:0.4, y:0.03, z:0.15, parent:g });
    kit.cyl(0.09, 0.09, 0.18, 0xd8e6ee, { x:0.55, y:0.09, z:0.1, parent:g, opts:{ roughness:0.1, transparent:true, opacity:0.55 } });
    kit.addStatic(g);
    /* pastry case */
    const pc = new THREE.Group(); pc.position.set(2.75, CT, -3.75);
    kit.box(1.5, 0.08, 0.8, C.steel, { r:0.02, y:0.04, parent:pc });
    kit.box(1.44, 0.03, 0.74, C.cream, { r:0.01, y:0.3, parent:pc });
    for(let i = 0; i < 5; i++){
      const d = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.04, 10, 18), kit.mat(i % 2 ? C.yellow : 0xd99a4e));
      d.rotation.x = Math.PI / 2; d.position.set(-0.55 + i * 0.27, 0.13, 0.05); d.castShadow = true; pc.add(d);
      const m = kit.sph(0.08, i % 2 ? 0x8a4b2a : 0xd99a4e, { x:-0.55 + i * 0.27, y:0.4, z:0, parent:pc }); m.scale.set(1.3, 0.8, 0.9);
    }
    kit.box(1.5, 0.6, 0.8, 0xd8e6ee, { r:0.04, y:0.36, parent:pc, opts:{ roughness:0.08, transparent:true, opacity:0.3, depthWrite:false } });
    kit.addStatic(pc);
  }

  /* ---------- baristas ---------- */
  const barista = (x, shirt, task) => {
    const p = kit.person(shirt); p.position.set(x, G, -4.5); p.rotation.y = -Math.PI / 2;
    kit.box(0.04, 0.4, 0.26, C.green, { r:0.02, x:0.135, y:0.42, parent:p });
    kit.addDynamic(p, 0.7);
    kit.onTick(({ ph, lt }) => {
      p.scale.setScalar(0.9 * (p.userData.pop ?? 1));
      if(task === 'brew'){
        p.userData.armR.rotation.z = -1.1 - 0.35 * Math.max(0, Math.sin(ph * 5));
        p.userData.armL.rotation.z = -0.8 - 0.2 * Math.sin(ph * 5 + 1);
        p.position.x = x + 0.25 * Math.sin(ph);
      } else {
        p.userData.armR.rotation.z = -0.9 - 0.3 * Math.max(0, Math.sin(ph * 5 + 2));
        p.userData.head.rotation.z = 0.1 * Math.sin(ph * 5);
      }
    });
    return p;
  };
  barista(4.9, C.cream, 'brew');
  barista(1.3, C.royalDeep, 'till');

  /* ---------- queue with stanchions (hotspot: waiting line) ---------- */
  {
    const g = new THREE.Group(); g.position.set(0.72, G, 0);
    const posts = [-2.85, -2.05, -1.25, -0.45, 0.3];
    posts.forEach(z => { kit.cyl(0.13, 0.15, 0.05, C.ink, { y:0.025, z, parent:g }); kit.cyl(0.035, 0.035, 0.95, C.steel, { y:0.5, z, parent:g, opts:{ metalness:0.6, roughness:0.3 } }); kit.sph(0.05, C.steel, { y:0.98, z, parent:g }); });
    for(let i = 0; i < posts.length - 1; i++) kit.box(0.04, 0.06, posts[i + 1] - posts[i] - 0.08, C.teal, { r:0.02, y:0.9, z:(posts[i] + posts[i + 1]) / 2, parent:g });
    kit.box(0.5, 0.012, 0.18, C.yellow, { r:0.005, x:0.55, y:0.006, z:-2.3, parent:g, shadow:false });
    kit.addStatic(g);
  }
  kit.queue({
    slots:[{ x:1.3, z:-2.75 }, { x:1.3, z:-2.15 }, { x:1.3, z:-1.55 }, { x:1.35, z:-0.95 }, { x:1.5, z:-0.35 }],
    exit:{ x:2.45, z:-2.6 }, spawn:{ x:2.4, z:0.85 }
  });

  /* ---------- pickup shelf, order screen, delivery rider (hotspot: digital touchpoints) ---------- */
  {
    const g = new THREE.Group(); g.position.set(6.6, G, -1.8);
    kit.box(0.55, 1.15, 1.3, C.teal, { r:0.05, y:0.575, parent:g });
    for(const y of [0.5, 0.85, 1.17]) kit.box(0.6, 0.04, 1.36, C.cream, { r:0.015, y, parent:g });
    for(let i = 0; i < 4; i++){
      kit.cyl(0.07, 0.055, 0.2, C.cream, { x:-0.05, y:1.29, z:-0.45 + i * 0.3, parent:g });
      kit.cyl(0.075, 0.075, 0.03, C.yellow, { x:-0.05, y:1.405, z:-0.45 + i * 0.3, parent:g });
    }
    for(let i = 0; i < 3; i++) kit.box(0.3, 0.26, 0.24, 0xcbb38e, { r:0.03, x:-0.05, y:0.66, z:-0.4 + i * 0.4, parent:g });
    kit.cyl(0.04, 0.04, 1.0, C.ink, { y:1.7, parent:g });
    kit.box(0.08, 0.8, 1.25, C.ink, { r:0.04, y:2.5, parent:g });
    kit.box(0.02, 0.7, 1.15, 0x1e2650, { r:0.02, x:-0.05, y:2.5, parent:g, shadow:false });
    const rows = [];
    for(let i = 0; i < 4; i++){
      const row = kit.anim(new THREE.Group()); row.position.set(-0.07, 0, 0); g.add(row);
      kit.box(0.01, 0.1, 0.5, [C.yellow, C.teal, C.green, C.orange][i], { r:0.01, z:-0.25, parent:row, shadow:false, opts:{ emissive:[C.yellow, C.teal, C.green, C.orange][i], emissiveIntensity:0.5 } });
      kit.box(0.01, 0.1, 0.3, C.cream, { r:0.01, z:0.25, parent:row, shadow:false, opts:{ emissive:C.cream, emissiveIntensity:0.4 } });
      rows.push(row);
    }
    kit.onTick(({ lt }) => rows.forEach((r, i) => {
      const p = ((i + lt * 0.4) % 4) / 4; r.position.y = 2.2 + p * 0.6;
      r.scale.setScalar(Math.max(0.0001, smooth(0, 0.08, p) * (1 - smooth(0.92, 1, p))));
    }));
    kit.addStatic(g);
    /* rider waiting for an app order */
    const rider = kit.person(C.teal); rider.position.set(5.8, G, -0.9);
    kit.box(0.3, 0.36, 0.34, C.yellow, { r:0.05, x:-0.2, y:0.56, parent:rider });
    const helm = kit.sph(0.13, C.yellow, { y:0.04, parent:rider.userData.head }); helm.scale.set(1, 0.78, 1);
    kit.addDynamic(rider, 0.8);
    kit.onTick(({ ph }) => {
      rider.scale.setScalar(0.9 * (rider.userData.pop ?? 1));
      rider.rotation.y = Math.PI * 0.85 + 0.3 * Math.sin(ph);
      rider.userData.armR.rotation.z = -1.5; rider.userData.head.rotation.z = -0.25 + 0.08 * Math.sin(ph * 3);
      rider.position.y = G + 0.015 * Math.abs(Math.sin(ph * 4));
    });
  }

  /* ---------- seating zone (hotspot: third place) ---------- */
  kit.table(-4.4, -2.3, { rot:0.2 });
  kit.table(-4.5, 0.7, { rot:-0.3, seats:[{ a:0, sit:true }, { a:Math.PI, sit:true }, { a:Math.PI / 2, sit:false }] });
  kit.table(-2.0, -1.0, { rot:0.6, seats:[{ a:0, sit:true }, { a:Math.PI, sit:false }] });
  {
    /* sofa corner with a laptop worker */
    const g = new THREE.Group(); g.position.set(-6.25, G, 3.5);
    kit.box(2.4, 0.03, 3.0, 0xd9ccb2, { r:0.01, x:0.9, y:0.015, parent:g, shadow:false });
    kit.box(1.0, 0.42, 2.3, C.green, { r:0.12, y:0.21, parent:g });
    kit.box(0.3, 0.6, 2.3, C.greenDeep, { r:0.1, x:-0.4, y:0.5, parent:g });
    for(const z of [-1.1, 1.1]) kit.box(1.0, 0.56, 0.24, C.greenDeep, { r:0.1, y:0.28, z, parent:g });
    kit.box(0.8, 0.36, 1.2, C.cream, { r:0.06, x:1.35, y:0.18, parent:g });
    kit.box(0.34, 0.02, 0.44, C.ink, { r:0.01, x:1.3, y:0.37, z:0.2, parent:g });
    const lid = kit.box(0.02, 0.3, 0.44, C.steel, { r:0.01, x:1.12, y:0.51, z:0.2, parent:g }); lid.rotation.z = 0.25;
    kit.seated(g, 0.05, 0.12, 0.2, 0, C.yellow);
    kit.seated(g, 0.05, 0.12, -0.7, 0, C.royal);
    kit.addStatic(g);
  }
  for(const [x, z] of [[-4.4, -2.3], [-4.5, 0.7], [-2.0, -1.0], [2.0, -3.8], [3.7, -3.8], [5.4, -3.8]]) kit.pendant(x, z, { top:4.2, drop:x > 0 ? 1.7 : 1.4 });

  /* ---------- entrance, brand topiary, plants ---------- */
  {
    const g = new THREE.Group(); g.position.set(5.0, G, 5.3);
    for(const x of [-0.75, 0.75]) kit.box(0.14, 2.7, 0.16, C.royalDeep, { r:0.04, x, y:1.35, parent:g });
    kit.box(1.64, 0.18, 0.18, C.royalDeep, { r:0.04, y:2.72, parent:g });
    kit.box(0.9, 0.24, 0.06, C.orange, { r:0.04, y:3.0, parent:g });
    kit.cupMark(g, -0.25, 3.0, 0.05, 0.6);
    kit.box(1.4, 0.02, 0.9, C.royal, { r:0.01, y:0.01, z:-0.6, parent:g, shadow:false });
    kit.addStatic(g);
    const sign = new THREE.Group(); sign.position.set(6.3, G, 4.4); sign.rotation.y = -0.6;
    for(const s of [-1, 1]){ const b = kit.box(0.6, 0.9, 0.04, C.ink, { r:0.03, y:0.45, z:s * 0.12, parent:sign }); b.rotation.x = s * 0.22; }
    kit.addStatic(sign);
  }
  kit.cupBush(6.2, 3.2, 1.05, -Math.PI / 2);
  kit.plant(-6.3, -4.8, 1.3); kit.plant(-6.3, 5.0, 1.1); kit.plant(0.0, -4.95, 1.0);
  kit.walker({ side:'z', off:4.9, center:3.4, amp:1.4, ph:0.6, shirt:C.orange });
}
