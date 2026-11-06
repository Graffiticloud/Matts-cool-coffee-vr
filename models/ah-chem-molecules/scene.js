/* AH Chemistry molecules: eight ball-and-stick stations on a floating slab, with a periodic table wall behind.
   Built for Advanced Higher Chemistry (Qualifications Scotland, C813 77). Atom colours follow the usual CPK
   convention (C dark grey, H white, O red, N blue, S yellow, F pale green, Br brown-red, Cu copper) so pupils
   read them as they do in class. Electron clouds: π teal, non-bonding pairs yellow. Orange marks energy and charge.
   Every motion loops on the shared 10-second LOOP. Units: 1 ≈ 0.8 m. */
import * as THREE from 'three';
import { TAU, smooth } from '../../engine/kit.js';
import { G, MY, STATIONS } from './layout.js';

const EL = {
  H:{ c:0xf4f2ec, r:0.16 }, C:{ c:0x3b4050, r:0.26 }, O:{ c:0xe0453a, r:0.25 }, N:{ c:0x3b63e0, r:0.25 },
  F:{ c:0x8fd16a, r:0.22 }, S:{ c:0xf2cf3a, r:0.31 }, Br:{ c:0x9c3b2c, r:0.33 }, Cu:{ c:0xc8783e, r:0.32 }
};
const BOND = 0xb6bac6, PI = 0x17a3a0, LONE = 0xf6c42a, ACCENT = 0xff6a13;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const BOND_GEO = new THREE.CylinderGeometry(1, 1, 1, 14);
const BALL_GEO = new THREE.SphereGeometry(1, 24, 16);
const LOBE_GEO = new THREE.SphereGeometry(1, 32, 20);
const COS_T = Math.cos(109.5 * Math.PI / 180), SIN_T = Math.sin(109.5 * Math.PI / 180);

export function build(kit){
  const C = kit.C;
  const atomMat = el => kit.mat(EL[el].c, { roughness:0.32 });
  const bondMat = kit.mat(BOND, { roughness:0.4 });
  const cloudMat = (color, opacity = 0.32) => kit.mat(color, { transparent:true, opacity, depthWrite:false, roughness:0.25 });
  const spinners = [], rockers = [];

  /* ---------- drawing helpers ---------- */
  function atom(parent, el, p){
    const m = new THREE.Mesh(BALL_GEO, atomMat(el)); m.position.copy(p); m.scale.setScalar(EL[el].r);
    m.castShadow = true; parent.add(m); return m;
  }
  function setBond(m, a, b, r){
    const d = V(0, 0, 0).subVectors(b, a), L = d.length();
    m.visible = r > 0.004 && L > 1e-4; if(!m.visible) return;
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.divideScalar(L)); m.scale.set(r, L, r);
  }
  function stick(parent, a, b, r = 0.06){ const m = new THREE.Mesh(BOND_GEO, bondMat); m.castShadow = true; parent.add(m); setBond(m, a, b, r); return m; }
  /* single or double bond; a double bond is two sticks offset along `perp` */
  function bond(parent, a, b, { order = 1, perp = V(0, 0, 1) } = {}){
    if(order === 1) return stick(parent, a, b);
    const o = perp.clone().normalize().multiplyScalar(0.075);
    stick(parent, a.clone().add(o), b.clone().add(o), 0.045); stick(parent, a.clone().sub(o), b.clone().sub(o), 0.045);
  }
  /* translucent ellipsoid: scale.y is its long axis, turned to point along `dir` */
  function lobe(parent, color, center, scale, { dir = null, opacity = 0.32 } = {}){
    const m = new THREE.Mesh(LOBE_GEO, cloudMat(color, opacity)); m.position.copy(center); m.scale.copy(scale);
    if(dir) m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    m.renderOrder = 2; parent.add(m); return m;
  }
  /* three hydrogens on a tetrahedral carbon at M, whose remaining bond points along u (towards its neighbour) */
  function tetraH(M, u, len = 0.55){
    u = u.clone().normalize();
    const a = Math.abs(u.y) < 0.9 ? UP : V(1, 0, 0), v = V(0, 0, 0).crossVectors(u, a).normalize(), w = V(0, 0, 0).crossVectors(u, v);
    return [0, 1, 2].map(i => { const f = i / 3 * TAU + 0.5; return M.clone().add(u.clone().multiplyScalar(COS_T).add(v.clone().multiplyScalar(SIN_T * Math.cos(f))).add(w.clone().multiplyScalar(SIN_T * Math.sin(f))).multiplyScalar(len)); });
  }
  function methyl(parent, M, towards){
    atom(parent, 'C', M);
    for(const h of tetraH(M, V(0, 0, 0).subVectors(towards, M))){ atom(parent, 'H', h); bond(parent, M, h); }
  }
  const group = (parent, x = 0, y = 0, z = 0, s = 1) => { const g = kit.anim(new THREE.Group()); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g); return g; };

  /* ---------- slab ---------- */
  {
    const base = new THREE.Group();
    kit.box(16.6, 1.1, 10.6, C.slabSide, { r:0.45, y:-0.67, parent:base });
    kit.box(16.4, 0.15, 10.4, C.ground, { r:0.08, y:-0.045, parent:base });
    kit.box(15.0, 0.02, 1.1, C.walk, { r:0.01, y:G + 0.006, parent:base });
    kit.addBase(base);
  }

  /* ---------- periodic table wall: s block royal, p teal, d green, f yellow ---------- */
  {
    const wall = new THREE.Group(); wall.position.set(0, G, -4.8);
    kit.box(9.7, 4.95, 0.22, C.cream, { r:0.1, y:2.48, parent:wall });
    kit.box(9.8, 0.12, 0.3, C.royal, { r:0.04, y:4.98, parent:wall });
    kit.box(9.8, 0.12, 0.3, C.royal, { r:0.04, y:0.06, parent:wall });
    const tiles = [];
    for(let row = 1; row <= 7; row++) for(let col = 1; col <= 18; col++){
      const on = row === 1 ? (col === 1 || col === 18) : row <= 3 ? (col <= 2 || col >= 13) : true;
      if(!on) continue;
      const block = (col <= 2 || (row === 1 && col === 18)) ? 's' : col <= 12 ? 'd' : 'p';
      tiles.push({ x:(col - 9.5) * 0.47, y:4.5 - (row - 1) * 0.47, block });
    }
    for(const r of [0, 1]) for(let i = 0; i < 14; i++) tiles.push({ x:(i + 3 - 8.5) * 0.47, y:4.5 - (7.6 + r) * 0.47, block:'f' });
    const col = { s:C.royal, p:C.teal, d:C.green, f:C.yellow };
    const im = new THREE.InstancedMesh(kit.rbGeo(0.4, 0.4, 0.08, 0.05), new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.5 }), tiles.length);
    const m4 = new THREE.Matrix4(), c = new THREE.Color();
    tiles.forEach((t, i) => { m4.makeTranslation(t.x, t.y, 0.14); im.setMatrixAt(i, m4); im.setColorAt(i, c.set(col[t.block])); });
    im.castShadow = true; im.receiveShadow = true; wall.add(im);
    kit.addStatic(wall);
  }

  /* ---------- plinths ---------- */
  for(const s of STATIONS){
    const g = new THREE.Group(); g.position.set(s.x, G, s.z);
    kit.box(2.9, 0.34, 2.9, C.cream, { r:0.12, y:0.17, parent:g });
    kit.box(3.0, 0.08, 3.0, C[s.rim], { r:0.04, y:0.36, parent:g });
    kit.box(2.72, 0.05, 2.72, 0xfbfaf6, { r:0.02, y:0.41, parent:g });
    kit.cyl(0.5, 0.58, 0.05, C[s.rim], { y:0.46, parent:g, opts:{ emissive:C[s.rim], emissiveIntensity:0.3 } });
    kit.addStatic(g);
  }
  const holders = {};
  STATIONS.forEach((s, i) => {
    const h = new THREE.Group(); h.position.set(s.x, G + MY, s.z); h.rotation.y = s.ry;
    kit.addDynamic(h, 0.75 + i * 0.06);
    const inner = new THREE.Group(); inner.scale.setScalar(1.15); h.add(inner); holders[s.id] = inner;
  });

  /* ---------- 1. atomic orbitals: 1s, the 2p set, one 3d (xy-type) ---------- */
  {
    const h = holders.orbitals;
    const nucleus = g => { const m = new THREE.Mesh(BALL_GEO, kit.mat(C.ink)); m.scale.setScalar(0.05); g.add(m); };
    const sG = group(h, -1.05); nucleus(sG); lobe(sG, C.royal, V(0, 0, 0), V(0.32, 0.32, 0.32), { opacity:0.42 });
    const pOuter = group(h, 0, 0.05), pG = group(pOuter); pG.rotation.set(0.35, 0, 0.2); nucleus(pG);
    [[V(1, 0, 0), C.royal], [V(0, 1, 0), C.teal], [V(0, 0, 1), C.green]].forEach(([ax, col]) => {
      for(const sg of [1, -1]) lobe(pG, col, ax.clone().multiplyScalar(0.34 * sg), V(0.15, 0.32, 0.15), { dir:ax, opacity:0.5 });
    });
    const dOuter = group(h, 1.08), dG = group(dOuter); dG.rotation.set(0.5, 0, 0); nucleus(dG);
    for(let k = 0; k < 4; k++){ const a = TAU * (k + 0.5) / 4, d = V(Math.cos(a), 0, Math.sin(a)); lobe(dG, C.yellow, d.clone().multiplyScalar(0.27), V(0.12, 0.25, 0.12), { dir:d, opacity:0.55 }); }
    spinners.push(sG, pOuter, dOuter);
  }

  /* ---------- 2. VSEPR: ammonia (trigonal pyramidal, one non-bonding pair) and sulfur hexafluoride (octahedral) ---------- */
  {
    const h = holders.vsepr;
    const nh3 = group(h, -0.78, 0.1);
    const N = V(0, 0, 0); atom(nh3, 'N', N);
    for(const f of [90, 210, 330]){ const a = f * Math.PI / 180, p = V(0.943 * Math.cos(a), -0.333, 0.943 * Math.sin(a)).multiplyScalar(0.72); atom(nh3, 'H', p); bond(nh3, N, p); }
    lobe(nh3, LONE, V(0, 0.44, 0), V(0.17, 0.3, 0.17), { opacity:0.55 });
    const sf6 = group(h, 0.82, 0, 0, 0.8);
    const S = V(0, 0, 0); atom(sf6, 'S', S);
    for(const d of [V(1, 0, 0), V(-1, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)]){ const p = d.multiplyScalar(0.74); atom(sf6, 'F', p); bond(sf6, S, p); }
    spinners.push(nh3, sf6);
  }

  /* ---------- 3. octahedral complex [Cu(H2O)6]2+ with its d-orbital splitting and a d–d transition ---------- */
  let dd;
  {
    const h = holders.complex;
    const cx = group(h, -0.62, 0, 0, 0.7);
    const Cu = V(0, 0, 0); atom(cx, 'Cu', Cu);
    const axes = [[V(1, 0, 0), V(0, 1, 0)], [V(-1, 0, 0), V(0, 0, 1)], [V(0, 1, 0), V(0, 0, 1)], [V(0, -1, 0), V(1, 0, 0)], [V(0, 0, 1), V(1, 0, 0)], [V(0, 0, -1), V(0, 1, 0)]];
    for(const [u, w] of axes){
      const O = u.clone().multiplyScalar(0.86); atom(cx, 'O', O); stick(cx, Cu, O, 0.05);
      for(const sg of [1, -1]){ const H = O.clone().add(u.clone().multiplyScalar(0.612).add(w.clone().multiplyScalar(0.791 * sg)).multiplyScalar(0.42)); atom(cx, 'H', H); bond(cx, O, H); }
    }
    spinners.push(cx);
    /* energy-level diagram: three lower d orbitals, two upper; Cu2+ is 3d9 */
    const dg = group(h, 0, 0);
    kit.box(0.04, 1.35, 0.04, C.ink, { r:0.015, x:0.6, y:-0.05, parent:dg });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 14), kit.mat(C.ink)); tip.position.set(0.6, 0.68, 0); dg.add(tip);
    const lowX = [0.82, 1.14, 1.46], highX = [0.98, 1.3], yL = -0.4, yH = 0.4;
    for(const x of lowX) kit.box(0.27, 0.04, 0.08, C.ink, { r:0.014, x, y:yL, parent:dg });
    for(const x of highX) kit.box(0.27, 0.04, 0.08, C.ink, { r:0.014, x, y:yH, parent:dg });
    const eMat = kit.mat(C.royal, { roughness:0.3 });
    const electron = (x, y) => { const m = new THREE.Mesh(BALL_GEO, eMat); m.scale.setScalar(0.05); m.position.set(x, y, 0.02); dg.add(m); return m; };
    lowX.forEach((x, i) => { electron(x - 0.06, yL + 0.075); if(i < 2) electron(x + 0.06, yL + 0.075); });
    electron(highX[0] - 0.06, yH + 0.075); electron(highX[0] + 0.06, yH + 0.075); electron(highX[1] - 0.06, yH + 0.075);
    const jumper = electron(lowX[2] + 0.06, yL + 0.075);
    const photon = new THREE.Mesh(BALL_GEO, kit.mat(ACCENT, { emissive:ACCENT, emissiveIntensity:0.6 })); photon.scale.setScalar(0.06); dg.add(photon);
    dd = { jumper, photon, from:V(lowX[2] + 0.06, yL + 0.075, 0.02), to:V(highX[1] + 0.06, yH + 0.075, 0.02) };
  }

  /* ---------- 4. ethene: σ framework from sp2 hybrids, π bond from side-on 2p overlap ---------- */
  {
    const h = holders.ethene, g = group(h);
    const C1 = V(-0.4, 0, 0), C2 = V(0.4, 0, 0); atom(g, 'C', C1); atom(g, 'C', C2); bond(g, C1, C2);
    for(const [Cx, sx] of [[C1, -1], [C2, 1]]) for(const sz of [1, -1]){ const p = Cx.clone().add(V(0.5 * sx, 0, 0.866 * sz).multiplyScalar(0.86)); atom(g, 'H', p); bond(g, Cx, p); }
    for(const sy of [1, -1]) lobe(g, PI, V(0, 0.36 * sy, 0), V(0.3, 0.78, 0.17), { dir:V(1, 0, 0), opacity:0.36 });
    spinners.push(g);
  }

  /* ---------- 5. benzene: σ ring of sp2 carbons with a delocalised π system above and below ---------- */
  {
    const h = holders.benzene, g = group(h);
    const ring = [];
    for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; ring.push(V(0.72 * Math.cos(a), 0, 0.72 * Math.sin(a))); }
    ring.forEach((p, i) => { atom(g, 'C', p); bond(g, p, ring[(i + 1) % 6]); const hp = p.clone().multiplyScalar(1.28 / 0.72); atom(g, 'H', hp); bond(g, p, hp); });
    for(const sy of [1, -1]){ const t = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.15, 16, 56), cloudMat(PI, 0.36)); t.rotation.x = Math.PI / 2; t.position.y = 0.3 * sy; t.renderOrder = 2; g.add(t); }
    spinners.push(g);
  }

  /* ---------- 6. geometric isomers: cis- and trans-but-2-ene ---------- */
  {
    const h = holders.geometric;
    const butene = (x, cis) => {
      const g = group(h, x, 0, 0, 0.58);
      const C2 = V(-0.38, 0, 0), C3 = V(0.38, 0, 0); atom(g, 'C', C2); atom(g, 'C', C3); bond(g, C2, C3, { order:2 });
      const UL = V(-0.5, 0.866, 0), DL = V(-0.5, -0.866, 0), UR = V(0.5, 0.866, 0), DR = V(0.5, -0.866, 0);
      const subs = [[C2, UL, 'Me'], [C2, DL, 'H'], [C3, cis ? UR : DR, 'Me'], [C3, cis ? DR : UR, 'H']];
      for(const [Cx, d, k] of subs){
        if(k === 'Me'){ const M = Cx.clone().add(d.clone().multiplyScalar(0.8)); methyl(g, M, Cx); bond(g, Cx, M); }
        else { const p = Cx.clone().add(d.clone().multiplyScalar(0.62)); atom(g, 'H', p); bond(g, Cx, p); }
      }
      rockers.push({ g, k:1 });
    };
    butene(-0.8, true); butene(0.8, false);
  }

  /* ---------- 7. optical isomers: the two enantiomers of 2-hydroxypropanoic (lactic) acid across a mirror ---------- */
  {
    const h = holders.enantiomers;
    const pane = new THREE.Mesh(kit.rbGeo(0.03, 1.6, 1.5, 0.012), kit.mat(C.glass, { transparent:true, opacity:0.5, roughness:0.08, depthWrite:false })); pane.renderOrder = 1; h.add(pane);
    for(const y of [-0.83, 0.83]) kit.box(0.06, 0.06, 1.56, C.ink, { r:0.02, y, parent:h });
    const lactic = (x, mirror) => {
      const g = group(h, x, 0.05, 0, 0.6), m = mirror ? -1 : 1, P = (a, b, c) => V(a * m, b, c);
      const dC = P(0, 1, 0), dOH = P(0.816, -0.333, 0.471), dMe = P(-0.816, -0.333, 0.471), dH = P(0, -0.333, -0.943);
      const Cs = V(0, 0, 0); atom(g, 'C', Cs);
      const Cc = dC.clone().multiplyScalar(0.8); atom(g, 'C', Cc); bond(g, Cs, Cc);
      const Od = Cc.clone().add(P(0.866, 0.5, 0).multiplyScalar(0.6)); atom(g, 'O', Od); bond(g, Cc, Od, { order:2 });
      const Oa = Cc.clone().add(P(-0.866, 0.5, 0).multiplyScalar(0.65)); atom(g, 'O', Oa); bond(g, Cc, Oa);
      const Ha = Oa.clone().add(P(0.25, 0.97, 0).multiplyScalar(0.45)); atom(g, 'H', Ha); bond(g, Oa, Ha);
      const Oh = dOH.clone().multiplyScalar(0.76); atom(g, 'O', Oh); bond(g, Cs, Oh);
      const Hh = Oh.clone().add(P(0.3, 0.9, 0.3).normalize().multiplyScalar(0.45)); atom(g, 'H', Hh); bond(g, Oh, Hh);
      const M = dMe.clone().multiplyScalar(0.8); methyl(g, M, Cs); bond(g, Cs, M);
      const Hc = dH.clone().multiplyScalar(0.58); atom(g, 'H', Hc); bond(g, Cs, Hc);
      rockers.push({ g, k:mirror ? -1 : 1 });
    };
    lactic(-0.84, false); lactic(0.84, true);
  }

  /* ---------- 8. SN2: hydroxide attacks bromomethane from the back, through a trigonal bipyramidal transition state ---------- */
  let sn;
  {
    const h = holders.sn2, g = group(h, 0, 0, 0, 0.55);
    const Cp = V(0, 0, 0); atom(g, 'C', Cp);
    const O = atom(g, 'O', V(-2.3, 0, 0)), Ho = atom(g, 'H', V(-2.6, 0.25, 0)), Br = atom(g, 'Br', V(0.86, 0, 0));
    const Hs = [0, 1, 2].map(() => atom(g, 'H', V(0, 0, 0)));
    const bCBr = stick(g, Cp, Br.position), bCO = stick(g, Cp, O.position, 0), bOH = stick(g, O.position, Ho.position);
    const bCH = Hs.map(H => stick(g, Cp, H.position));
    const halo = () => { const m = new THREE.Mesh(LOBE_GEO, new THREE.MeshStandardMaterial({ color:ACCENT, emissive:ACCENT, emissiveIntensity:0.35, transparent:true, opacity:0.3, depthWrite:false })); m.scale.setScalar(0.46); m.renderOrder = 3; g.add(m); return m; };
    sn = { g, Cp, O, Ho, Br, Hs, bCBr, bCO, bOH, bCH, haloO:halo(), haloBr:halo() };
  }

  /* ---------- motion: one turn per LOOP; rockers swing; the d–d transition and the SN2 reaction run on the loop ---------- */
  kit.onTick(({ lt, ph }) => {
    for(const g of spinners) g.rotation.y = ph;
    for(const r of rockers) r.g.rotation.y = 0.55 * Math.sin(ph) * r.k;

    /* photon in (2.0–3.2 s), electron up (3.2–4.2 s), back down (7.0–8.0 s) */
    const pIn = smooth(2.0, 3.2, lt), up = smooth(3.2, 4.2, lt) * (1 - smooth(7.0, 8.0, lt));
    dd.photon.visible = lt > 2.0 && lt < 3.25;
    dd.photon.position.set(-1.7 + 1.2 * pIn, 0.12 * Math.sin(lt * 26), 0.3);
    dd.jumper.position.lerpVectors(dd.from, dd.to, up);

    /* SN2 */
    const s = sn, pA = smooth(0.6, 3.6, lt), pB = smooth(4.4, 7.2, lt);
    const xO = -2.3 + 1.18 * pA + 0.3 * pB, xBr = 0.86 + 0.26 * smooth(2.2, 3.6, lt) + 1.25 * pB;
    const a = -0.333 + 0.333 * smooth(2.4, 3.8, lt) + 0.333 * smooth(4.4, 6.0, lt), rr = Math.sqrt(1 - a * a);
    s.O.position.set(xO, 0, 0); s.Br.position.set(xBr, 0, 0);
    s.Ho.position.set(xO - 0.37, 0.26, 0);
    s.Hs.forEach((H, i) => { const f = (90 + 120 * i) * Math.PI / 180; H.position.set(0.62 * a, 0.62 * rr * Math.cos(f), 0.62 * rr * Math.sin(f)); setBond(s.bCH[i], s.Cp, H.position, 0.06); });
    setBond(s.bCBr, s.Cp, s.Br.position, 0.06 * (1 - 0.55 * smooth(2.4, 3.8, lt)) * (1 - smooth(4.6, 6.2, lt)));
    setBond(s.bCO, s.Cp, s.O.position, 0.06 * (0.45 * smooth(2.4, 3.8, lt) + 0.55 * smooth(4.4, 5.8, lt)));
    setBond(s.bOH, s.O.position, s.Ho.position, 0.06);
    s.haloO.position.copy(s.O.position); s.haloO.material.opacity = 0.3 * (1 - smooth(3.6, 5.2, lt));
    s.haloBr.position.copy(s.Br.position); s.haloBr.material.opacity = 0.3 * smooth(3.6, 5.2, lt);
    s.g.scale.setScalar(0.55 * Math.max(0.0001, smooth(0, 0.5, lt) * (1 - smooth(9.4, 10, lt))));
  });
}
