/* XR Diorama kit: geometry helpers, props, people, buildings, cars and a looping queue.
   Every block is a RoundedBoxGeometry; materials are MeshStandardMaterial; no textures. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const TAU = Math.PI * 2;
export const LOOP = 10;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const easeOutBack = p => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
export const easeOutCubic = p => 1 - Math.pow(1 - p, 3);
export const lerpAngle = (a, b, t) => { const d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; };
export const yawOf = (dx, dz) => Math.atan2(-dz, dx);
export function rng(seed = 7){ let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export const PALETTE = {
  ground:0xf3f0e9, slabSide:0xdcd6ca, walk:0xebe7de, road:0xcfd4dc, line:0xffffff,
  royal:0x2b4fd8, royalDeep:0x1d389e, teal:0x17a3a0, tealDeep:0x0e7774,
  green:0x3c9e4f, greenDeep:0x2a7a3b, leaf:0x47ad59, orange:0xff6a13, yellow:0xf6c42a,
  cream:0xf8f5ee, ink:0x252a48, glass:0xcde6ef, trunk:0x7a6650, steel:0xd9dde4,
  skins:[0xf1c9a5,0xd9a27c,0xa8714f,0x7c4f35,0xf5d6bd],
  hairs:[0x2b2220,0x5a3b25,0xc99a52,0x1d1d2a,0x8a4b2a]
};

/* rounded-square loop path for traffic: s in [0,1) -> position + heading */
export function ringPoint(h, c, s, out = {}){
  const L = 2 * (h - c), A = Math.PI * c / 2;
  let d = (((s % 1) + 1) % 1) * 4 * (L + A), k = 0;
  while(d > L + A && k < 3){ d -= L + A; k++; }
  let x, z, dx, dz;
  if(d <= L){ x = h; z = -(h - c) + d; dx = 0; dz = 1; }
  else { const th = (d - L) / c; x = h - c + c * Math.cos(th); z = h - c + c * Math.sin(th); dx = -Math.sin(th); dz = Math.cos(th); }
  for(let i = 0; i < k; i++){ [x, z] = [-z, x]; [dx, dz] = [-dz, dx]; }
  out.x = x; out.z = z; out.dx = dx; out.dz = dz; out.P = 4 * (L + A);
  return out;
}

export class Kit {
  constructor(world, { palette = {}, seed = 7, ground = 0.16 } = {}){
    this.world = world;
    this.C = { ...PALETTE, ...palette };
    this.rand = rng(seed);
    this.G = ground;
    this.mats = new Map(); this.geos = new Map();
    this.builds = []; this.spinners = []; this.steams = []; this.sways = []; this.ticks = [];
    this.shirts = [this.C.royal, this.C.teal, this.C.green, this.C.yellow, this.C.cream, this.C.royalDeep, this.C.tealDeep];
  }
  pick(a){ return a[Math.floor(this.rand() * a.length)]; }

  /* ---------- primitives ---------- */
  mat(color, opts = {}){
    const k = color + JSON.stringify(opts);
    if(!this.mats.has(k)) this.mats.set(k, new THREE.MeshStandardMaterial({ color, roughness:0.6, metalness:0, ...opts }));
    return this.mats.get(k);
  }
  rbGeo(w, h, d, r){
    r = Math.min(r, Math.min(w, h, d) * 0.45);
    const k = [w, h, d, r].map(v => v.toFixed(3)).join('|');
    if(!this.geos.has(k)) this.geos.set(k, new RoundedBoxGeometry(w, h, d, 2, r));
    return this.geos.get(k);
  }
  box(w, h, d, color, { r = 0.06, x = 0, y = 0, z = 0, parent = null, opts, shadow = true, ry = 0, rx = 0, rz = 0 } = {}){
    const m = new THREE.Mesh(this.rbGeo(w, h, d, r), this.mat(color, opts));
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    m.castShadow = shadow; m.receiveShadow = true;
    if(parent) parent.add(m);
    return m;
  }
  cyl(rt, rb, h, color, { seg = 20, x = 0, y = 0, z = 0, parent = null, opts, shadow = true } = {}){
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), this.mat(color, opts));
    m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true;
    if(parent) parent.add(m);
    return m;
  }
  sph(r, color, { x = 0, y = 0, z = 0, parent = null, opts, shadow = true } = {}){
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), this.mat(color, opts));
    m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true;
    if(parent) parent.add(m);
    return m;
  }
  /* mark a node as animated so the static merge leaves it alone */
  anim(o){ o.userData.anim = true; return o; }

  /* ---------- build-in registry: rise and pop with overshoot ---------- */
  addStatic(g, extra = 0){
    this.world.add(g);
    const d = Math.hypot(g.position.x, g.position.z);
    this.builds.push({ o:g, delay:0.1 + d / 11.5 * 0.5 + this.rand() * 0.06 + extra, y:g.position.y, rise:true, base:g.scale.x });
    g.scale.setScalar(0.0001);
    return g;
  }
  addDynamic(g, delay = 0.75){
    this.world.add(g); this.anim(g);
    g.userData.pop = 0.0001;
    this.builds.push({ o:g, delay, rise:false, base:1, dyn:true });
    g.scale.setScalar(0.0001);
    return g;
  }
  addBase(g){ this.world.add(g); this.builds.push({ o:g, delay:0, y:g.position.y, rise:true, base:1 }); g.scale.setScalar(0.0001); return g; }
  onTick(fn){ this.ticks.push(fn); }

  /* ---------- small animated details ---------- */
  steam(parent, x, y, z, { count = 4, period = 2.5, rise = 0.9, size = 1 } = {}){
    for(let i = 0; i < count; i++){
      const m = this.anim(new THREE.Mesh(new THREE.SphereGeometry(0.09 * size, 14, 10),
        new THREE.MeshStandardMaterial({ color:0xffffff, roughness:1, transparent:true, opacity:0, depthWrite:false })));
      m.position.set(x, y, z); parent.add(m);
      this.steams.push({ m, x, y, z, i, count, period, rise, size });
    }
  }
  fan(parent, x, y, z, k = 3){
    const f = this.anim(new THREE.Group()); f.position.set(x, y, z); parent.add(f);
    this.box(0.36, 0.02, 0.07, this.C.ink, { r:0.01, parent:f }); this.box(0.07, 0.02, 0.36, this.C.ink, { r:0.01, parent:f });
    this.spinners.push({ o:f, k });
    return f;
  }
  cupMark(parent, x, y, z, sc = 1, color = this.C.yellow){
    const m = new THREE.Group(); m.position.set(x, y, z); m.scale.setScalar(sc); parent.add(m);
    const c = this.cyl(0.11, 0.085, 0.22, color, { parent:m }); c.rotation.x = Math.PI / 2;
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 20), this.mat(color)); h.position.set(0.12, 0, 0); m.add(h);
    return m;
  }

  /* ---------- people ---------- */
  person(shirt = this.pick(this.shirts), seated = false){
    const C = this.C, g = new THREE.Group();
    const skin = this.pick(C.skins), hair = this.pick(C.hairs), trousers = this.rand() < 0.5 ? C.ink : 0x5b6487;
    const legL = new THREE.Group(), legR = new THREE.Group();
    legL.position.set(0, 0.32, -0.06); legR.position.set(0, 0.32, 0.06);
    this.box(0.1, 0.33, 0.1, trousers, { r:0.045, y:-0.16, parent:legL });
    this.box(0.1, 0.33, 0.1, trousers, { r:0.045, y:-0.16, parent:legR });
    g.add(legL, legR);
    this.box(0.24, 0.34, 0.27, shirt, { r:0.08, y:0.5, parent:g });
    const armL = new THREE.Group(), armR = new THREE.Group();
    armL.position.set(0, 0.64, -0.165); armR.position.set(0, 0.64, 0.165);
    this.box(0.08, 0.28, 0.08, shirt, { r:0.035, y:-0.13, parent:armL });
    this.box(0.08, 0.28, 0.08, shirt, { r:0.035, y:-0.13, parent:armR });
    g.add(armL, armR);
    const head = new THREE.Group(); head.position.y = 0.8; g.add(head);
    this.sph(0.11, skin, { parent:head });
    const cap = this.sph(0.115, hair, { y:0.035, x:-0.012, parent:head }); cap.scale.set(1, 0.62, 1);
    if(seated){ legL.rotation.z = -Math.PI / 2; legR.rotation.z = -Math.PI / 2; armL.rotation.z = -0.9; }
    g.userData = { legL, legR, armL, armR, head };
    g.scale.setScalar(0.9);
    return g;
  }
  walkPose(p, t, amt){
    const s = Math.sin(t * 13) * 0.55 * amt;
    p.userData.legL.rotation.z = s; p.userData.legR.rotation.z = -s;
    p.userData.armL.rotation.z = -s * 0.8; p.userData.armR.rotation.z = s * 0.8;
  }
  /* seated person who sips and nods; add to any parent */
  seated(parent, x, y, z, ry = 0, shirt, scale = 0.9){
    const p = this.anim(this.person(shirt, true)); p.position.set(x, y, z); p.rotation.y = ry; p.scale.setScalar(scale); parent.add(p);
    const ph = this.rand() * TAU;
    this.onTick(({ ph:P }) => {
      p.userData.head.rotation.z = 0.12 * Math.sin(P * 2 + ph);
      p.userData.armR.rotation.z = -0.9 - 0.5 * Math.max(0, Math.sin(P * 5 + ph));
    });
    return p;
  }

  /* looping queue: count people step forward every `step` seconds; the front one walks to `exit` and pops away,
     a new one pops in at `spawn`. Needs (LOOP / step) to be a multiple of slots.length to loop seamlessly. */
  queue({ slots, exit, spawn, step = 2, delay = 0.72, shirts = this.shirts, scale = 0.9 }){
    const N = slots.length, G = this.G, people = [];
    for(let i = 0; i < N; i++){
      const p = this.person(shirts[i % shirts.length]);
      people.push({ p, i, last:{ x:0, z:0 }, yaw:0 });
      this.addDynamic(p, delay + i * 0.04);
    }
    const state = { f:0, people };
    this.onTick(({ lt, dt, playing }) => {
      const base = Math.floor(lt / step), f = (lt % step) / step;
      state.f = f;
      const moveP = smooth(0, 0.5, f);
      for(const q of people){
        const slot = ((q.i - base) % N + N) % N;
        let x, z, sc = 1;
        if(slot === 0){
          if(f < 0.3){
            const e = smooth(0, 0.3, f);
            x = slots[0].x + (exit.x - slots[0].x) * e; z = slots[0].z + (exit.z - slots[0].z) * e;
            sc = 1 - smooth(0.18, 0.3, f);
          } else {
            const e = smooth(0.3, 0.78, f);
            x = spawn.x + (slots[N - 1].x - spawn.x) * e; z = spawn.z + (slots[N - 1].z - spawn.z) * e;
            sc = smooth(0.3, 0.42, f);
          }
        } else {
          const a = slots[slot], b = slots[slot - 1];
          x = a.x + (b.x - a.x) * moveP; z = a.z + (b.z - a.z) * moveP;
        }
        const dx = x - q.last.x, dz = z - q.last.z, sp = Math.hypot(dx, dz);
        if(sp > 0.0005) q.yaw = lerpAngle(q.yaw, yawOf(dx, dz), 0.25);
        else if(playing) q.yaw = lerpAngle(q.yaw, yawOf(slots[0].x - x + (exit.x - slots[0].x) * 0.3, slots[0].z - z + (exit.z - slots[0].z) * 0.3), 0.08);
        q.last.x = x; q.last.z = z;
        const moving = playing ? clamp(sp / Math.max(dt, 1e-3) * 0.7, 0, 1) : 0;
        q.p.position.set(x, G + Math.abs(Math.sin(lt * 13)) * 0.03 * moving, z);
        q.p.rotation.y = q.yaw;
        this.walkPose(q.p, lt, moving);
        q.p.scale.setScalar(scale * (q.p.userData.pop ?? 1) * Math.max(0.0001, sc));
      }
    });
    return state;
  }
  /* pedestrian pacing back and forth along a line; side 'x' paces along x at z=off, 'z' along z at x=off */
  walker({ side = 'x', off = 0, center = 0, amp = 3, ph = 0, shirt, delay = 0.8, scale = 0.9 }){
    const p = this.person(shirt); this.addDynamic(p, delay);
    let yaw = 0;
    this.onTick(({ ph:P, lt, playing }) => {
      const u = center + Math.sin(P + ph) * amp, v = Math.cos(P + ph);
      if(side === 'x'){ p.position.set(u, this.G, off); if(playing) yaw = lerpAngle(yaw, v >= 0 ? 0 : Math.PI, 0.12); }
      else { p.position.set(off, this.G, u); if(playing) yaw = lerpAngle(yaw, v >= 0 ? -Math.PI / 2 : Math.PI / 2, 0.12); }
      p.rotation.y = yaw;
      this.walkPose(p, lt + ph, clamp(Math.abs(v) * 1.6, 0, 1));
      p.scale.setScalar(scale * (p.userData.pop ?? 1));
    });
    return p;
  }

  /* instanced crowd: one draw call for bodies, one for heads. spots: [{x, z, ...}]; motion(spot, i, args) returns { dy, yaw } */
  crowd(spots, { scale = 0.6, motion } = {}){
    const C = this.C, N = spots.length;
    const bodyGeo = this.rbGeo(0.26, 0.5, 0.24, 0.08), headGeo = new THREE.SphereGeometry(0.11, 12, 9);
    const bodies = this.anim(new THREE.InstancedMesh(bodyGeo, new THREE.MeshStandardMaterial({ roughness:0.7 }), N));
    const heads = this.anim(new THREE.InstancedMesh(headGeo, new THREE.MeshStandardMaterial({ roughness:0.6 }), N));
    bodies.castShadow = heads.castShadow = true; bodies.frustumCulled = heads.frustumCulled = false; bodies.receiveShadow = heads.receiveShadow = true;
    const col = new THREE.Color(), palette = [...this.shirts, C.orange, 0xd94f70, 0x8e6bd8, 0xffffff, 0x2a2f45];
    spots.forEach((s, i) => {
      bodies.setColorAt(i, col.set(this.pick(palette)));
      heads.setColorAt(i, col.set(this.pick(C.skins)));
      s.ph = this.rand() * TAU; s.k = 0.7 + this.rand() * 0.6;
    });
    const g = this.anim(new THREE.Group()); g.add(bodies, heads); this.world.add(g);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), sc = new THREE.Vector3();
    let pop = 0;
    const place = args => {
      pop = Math.min(1, Math.max(0, (args.t - 0.75) / 0.5));
      const ps = Math.max(0.0001, easeOutBack(pop)) * scale;
      sc.set(ps, ps, ps);
      for(let i = 0; i < N; i++){
        const s = spots[i], m = motion ? motion(s, i, args) : { dy:0, yaw:Math.PI / 2 };
        q.setFromAxisAngle(up, m.yaw);
        m4.compose(v.set(s.x, this.G + 0.25 * ps + m.dy, s.z), q, sc); bodies.setMatrixAt(i, m4);
        m4.compose(v.set(s.x, this.G + 0.6 * ps + m.dy, s.z), q, sc); heads.setMatrixAt(i, m4);
      }
      bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
    };
    place({ t:0, lt:0, ph:0, dt:0, playing:true });
    this.onTick(place);
    return { bodies, heads };
  }

  /* ---------- exterior kit ---------- */
  windows(g, w, d, h, floorH = 0.64, from = 0.62){
    const faces = [
      { len:w, place:(u, y) => [u, y, d / 2 + 0.012], ry:0 },
      { len:w, place:(u, y) => [u, y, -d / 2 - 0.012], ry:Math.PI },
      { len:d, place:(u, y) => [w / 2 + 0.012, y, -u], ry:Math.PI / 2 },
      { len:d, place:(u, y) => [-w / 2 - 0.012, y, u], ry:-Math.PI / 2 }
    ];
    const slots = [];
    for(const f of faces){
      const cols = Math.max(1, Math.floor((f.len - 0.3) / 0.42)), span = (cols - 1) * 0.42;
      for(let y = from; y < h - 0.3; y += floorH) for(let c = 0; c < cols; c++) slots.push({ p:f.place(-span / 2 + c * 0.42, y), ry:f.ry });
    }
    const im = new THREE.InstancedMesh(this.rbGeo(0.24, 0.32, 0.05, 0.03), new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.25, metalness:0.05 }), slots.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
    slots.forEach((s, i) => {
      q.setFromAxisAngle(up, s.ry); m4.compose(new THREE.Vector3(...s.p), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m4);
      const r = this.rand(); col.set(r < 0.18 ? 0xffe3a0 : r < 0.3 ? 0xa9c2f2 : 0xe4eef6); im.setColorAt(i, col);
    });
    im.receiveShadow = true; g.add(im);
    return im;
  }
  roofProps(g, h, kinds){
    const C = this.C;
    for(const k of kinds){
      if(k.t === 'ac'){
        const a = new THREE.Group(); a.position.set(k.x, h + 0.08, k.z); g.add(a);
        this.box(0.5, 0.3, 0.5, C.steel, { r:0.06, y:0.15, parent:a });
        this.fan(a, 0, 0.31, 0, k.k || 3);
      } else if(k.t === 'tank'){
        const a = new THREE.Group(); a.position.set(k.x, h + 0.08, k.z); g.add(a);
        for(const [lx, lz] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]]) this.cyl(0.025, 0.025, 0.36, C.ink, { x:lx, y:0.18, z:lz, parent:a });
        this.cyl(0.3, 0.3, 0.5, k.c || C.yellow, { y:0.6, parent:a });
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.33, 0.24, 20), this.mat(k.c2 || C.royalDeep)); cone.position.y = 0.97; cone.castShadow = true; a.add(cone);
      } else if(k.t === 'antenna'){
        this.cyl(0.025, 0.035, 1.2, C.ink, { x:k.x, y:h + 0.6, z:k.z, parent:g });
        this.sph(0.06, C.orange, { x:k.x, y:h + 1.22, z:k.z, parent:g, opts:{ emissive:C.orange, emissiveIntensity:0.6 } });
      } else if(k.t === 'box'){
        this.box(k.w, k.h, k.d, k.c || 0xe2e5ea, { r:0.05, x:k.x, y:h + k.h / 2 + 0.06, z:k.z, parent:g });
      }
    }
  }
  building({ x, z, w, d, h, color, trim, floorH = 0.64, roof = [] }){
    const g = new THREE.Group(); g.position.set(x, this.G, z);
    this.box(w, h, d, color, { r:0.08, y:h / 2, parent:g });
    this.box(w + 0.07, 0.3, d + 0.07, trim, { r:0.05, y:0.15, parent:g });
    this.box(w + 0.12, 0.16, d + 0.12, trim, { r:0.05, y:h + 0.02, parent:g });
    this.windows(g, w, d, h, floorH);
    this.roofProps(g, h, roof);
    return this.addStatic(g);
  }
  tree(x, z, sc = 1, col = this.C.green){
    const C = this.C, g = new THREE.Group(); g.position.set(x, this.G, z);
    this.box(0.4, 0.08, 0.4, 0xb9b2a4, { r:0.03, y:0.04, parent:g });
    this.cyl(0.055, 0.075, 0.7, C.trunk, { y:0.38, parent:g });
    const crown = this.anim(new THREE.Group()); crown.position.y = 0.72; g.add(crown);
    this.sph(0.42, col, { y:0.3, parent:crown });
    this.sph(0.28, col === C.green ? C.leaf : C.tealDeep, { x:0.22, y:0.5, z:0.1, parent:crown });
    this.sph(0.24, col, { x:-0.2, y:0.48, z:-0.12, parent:crown });
    g.scale.setScalar(sc);
    this.sways.push({ o:crown, ph:this.rand() * TAU });
    return this.addStatic(g);
  }
  lamp(x, z, ry = 0){
    const C = this.C, g = new THREE.Group(); g.position.set(x, this.G, z); g.rotation.y = ry;
    this.cyl(0.07, 0.09, 0.08, C.ink, { y:0.04, parent:g });
    this.cyl(0.028, 0.035, 1.5, C.royalDeep, { y:0.78, parent:g });
    this.box(0.42, 0.04, 0.04, C.royalDeep, { r:0.015, x:0.19, y:1.5, parent:g });
    this.box(0.2, 0.08, 0.14, C.royalDeep, { r:0.03, x:0.38, y:1.46, parent:g });
    this.box(0.14, 0.03, 0.1, C.yellow, { r:0.01, x:0.38, y:1.415, parent:g, opts:{ emissive:C.yellow, emissiveIntensity:1.1 }, shadow:false });
    return this.addStatic(g);
  }
  bench(x, z, ry = 0, color = this.C.teal){
    const g = new THREE.Group(); g.position.set(x, this.G, z); g.rotation.y = ry;
    this.box(0.7, 0.05, 0.22, color, { r:0.02, y:0.24, parent:g });
    this.box(0.7, 0.18, 0.04, color, { r:0.02, y:0.38, z:-0.11, parent:g });
    for(const lx of [-0.28, 0.28]) this.box(0.04, 0.24, 0.2, this.C.ink, { r:0.01, x:lx, y:0.12, parent:g });
    return this.addStatic(g);
  }
  car(color, taxi = false){
    const C = this.C, g = new THREE.Group(), b = new THREE.Group(); g.add(b);
    this.box(1.04, 0.26, 0.54, color, { r:0.09, y:0.25, parent:b });
    this.box(0.58, 0.22, 0.48, 0xdde8f2, { r:0.08, x:-0.06, y:0.46, parent:b, opts:{ roughness:0.15 } });
    this.box(0.5, 0.05, 0.47, color, { r:0.02, x:-0.06, y:0.585, parent:b });
    for(const lz of [-0.17, 0.17]){
      this.box(0.03, 0.06, 0.1, C.cream, { r:0.01, x:0.52, y:0.28, z:lz, parent:b, opts:{ emissive:0xfff3c8, emissiveIntensity:0.8 }, shadow:false });
      this.box(0.03, 0.05, 0.1, C.ink, { r:0.01, x:-0.52, y:0.28, z:lz, parent:b, shadow:false });
    }
    if(taxi) this.box(0.18, 0.08, 0.1, C.cream, { r:0.02, x:-0.06, y:0.65, parent:b });
    const wheels = [], wg = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16).rotateX(Math.PI / 2);
    for(const [lx, lz] of [[0.33,0.27],[-0.33,0.27],[0.33,-0.27],[-0.33,-0.27]]){
      const w = new THREE.Mesh(wg, this.mat(C.ink)); w.position.set(lx, 0.12, lz); w.castShadow = true; g.add(w); wheels.push(w);
    }
    return { g, b, wheels };
  }
  /* car looping a rounded-square ring once per LOOP */
  loopCar({ color, taxi = false, h, c, off = 0, reverse = false, y = 0.045, delay = 0.65 }){
    const car = this.car(color, taxi); car.g.position.y = y; this.addDynamic(car.g, delay);
    const tmp = {};
    this.onTick(({ lt }) => {
      const s = (lt / LOOP + off) % 1;
      if(reverse){ ringPoint(h, c, 1 - s, tmp); tmp.dx = -tmp.dx; tmp.dz = -tmp.dz; } else ringPoint(h, c, s, tmp);
      car.g.position.x = tmp.x; car.g.position.z = tmp.z; car.g.rotation.y = yawOf(tmp.dx, tmp.dz);
      car.b.position.y = 0.012 * Math.sin(lt * 22 + off * 10);
      const spin = -(lt / LOOP) * tmp.P / 0.12; for(const w of car.wheels) w.rotation.z = spin;
    });
    return car;
  }

  /* ---------- shared furniture ---------- */
  plant(x, z, sc = 1, pot = this.C.cream){
    const C = this.C, g = new THREE.Group(); g.position.set(x, this.G, z);
    this.cyl(0.2, 0.15, 0.36, pot, { y:0.18, parent:g });
    const crown = this.anim(new THREE.Group()); crown.position.y = 0.36; g.add(crown);
    for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; this.sph(0.15 + this.rand() * 0.05, i % 2 ? C.green : C.leaf, { x:Math.cos(a) * 0.12, y:0.18 + this.rand() * 0.28, z:Math.sin(a) * 0.12, parent:crown }); }
    this.sph(0.17, C.greenDeep, { y:0.48, parent:crown });
    g.scale.setScalar(sc); this.sways.push({ o:crown, ph:this.rand() * TAU });
    return this.addStatic(g);
  }
  cupBush(x, z, sc = 1, rot = 0){
    const C = this.C, g = new THREE.Group(); g.position.set(x, this.G, z); g.rotation.y = rot;
    this.box(0.66, 0.22, 0.66, C.cream, { r:0.06, y:0.11, parent:g });
    this.box(0.58, 0.04, 0.58, 0x8a7458, { r:0.02, y:0.23, parent:g, shadow:false });
    this.cyl(0.38, 0.38, 0.05, C.greenDeep, { seg:28, y:0.3, parent:g });
    this.cyl(0.3, 0.22, 0.48, C.green, { seg:28, y:0.57, parent:g });
    this.cyl(0.27, 0.27, 0.04, C.greenDeep, { seg:28, y:0.81, parent:g });
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 10, 24), this.mat(C.green)); h.position.set(0.3, 0.58, 0); h.castShadow = true; g.add(h);
    for(let i = 0; i < 10; i++){ const a = i / 10 * TAU + this.rand() * 0.3; this.sph(0.07 + this.rand() * 0.03, this.rand() < 0.5 ? C.green : C.leaf, { x:Math.cos(a) * 0.25, y:0.4 + this.rand() * 0.36, z:Math.sin(a) * 0.25, parent:g }); }
    this.steam(g, 0, 0.92, 0, { count:3, period:2.5, rise:0.6, size:0.9 });
    g.scale.setScalar(sc);
    return this.addStatic(g, 0.08);
  }
  chair(parent, x, z, ry, color){
    const ch = new THREE.Group(); ch.position.set(x, 0, z); ch.rotation.y = ry; parent.add(ch);
    this.box(0.26, 0.04, 0.26, color, { r:0.015, y:0.3, parent:ch });
    this.box(0.04, 0.3, 0.26, color, { r:0.015, x:-0.13, y:0.45, parent:ch });
    for(const [lx, lz] of [[-0.1,-0.1],[0.1,-0.1],[-0.1,0.1],[0.1,0.1]]) this.box(0.03, 0.3, 0.03, this.C.ink, { r:0.01, x:lx, y:0.15, z:lz, parent:ch });
    return ch;
  }
  /* round café table with up to four chairs; seats: array of {angle, sit:boolean} */
  table(x, z, { rot = 0, umbrella = false, seats = [{ a:0, sit:true }, { a:Math.PI, sit:true }], cup = true } = {}){
    const C = this.C, g = new THREE.Group(); g.position.set(x, this.G, z); g.rotation.y = rot;
    this.cyl(0.24, 0.24, 0.04, C.cream, { y:0.48, parent:g });
    this.cyl(0.025, 0.025, 0.46, C.ink, { y:0.24, parent:g });
    this.cyl(0.12, 0.14, 0.03, C.ink, { y:0.02, parent:g });
    if(umbrella){
      this.cyl(0.018, 0.018, 1.2, C.ink, { y:0.82, parent:g });
      const um = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.26, 10), this.mat(C.yellow)); um.position.y = 1.38; um.castShadow = true; g.add(um);
    }
    if(cup){ this.cyl(0.04, 0.032, 0.07, C.cream, { x:0.06, y:0.535, z:0.05, parent:g }); this.steam(g, 0.06, 0.6, 0.05, { count:3, period:2, rise:0.35, size:0.45 }); }
    const cols = [C.teal, C.royal, C.green, C.yellow];
    seats.forEach((s, i) => {
      const cx = Math.cos(s.a) * 0.42, cz = -Math.sin(s.a) * 0.42;
      const ch = this.chair(g, cx, cz, s.a + Math.PI, cols[i % cols.length]);
      if(s.sit) this.seated(ch, -0.04, 0, 0, 0);
    });
    return this.addStatic(g, 0.05);
  }
  /* pendant light hanging from a ceiling height `top` */
  pendant(x, z, { top = 4.2, drop = 1.1, color = this.C.yellow } = {}){
    const g = new THREE.Group(); g.position.set(x, this.G, z);
    this.cyl(0.008, 0.008, drop, this.C.ink, { y:top - drop / 2, parent:g, shadow:false });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.2, 18, 1, true), this.mat(color, { side:THREE.DoubleSide }));
    shade.position.y = top - drop - 0.05; g.add(shade);
    this.sph(0.07, 0xfff1c9, { y:top - drop - 0.12, parent:g, opts:{ emissive:0xffd98a, emissiveIntensity:1.6 }, shadow:false });
    return this.addStatic(g, 0.2);
  }
}
