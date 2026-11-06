/* Shared layout for the AH Chemistry molecules model: scene.js builds the stations here, spec.js pins them. */
export const G = 0.03;      // floor top
export const MY = 1.5;      // height of each molecule's centre above the floor

/* Back row (z < 0) runs inorganic to organic, front row continues organic. ry (= spec.camAz) turns a station to face the default camera. */
export const STATIONS = [
  { id:'orbitals',    n:1, x:-5.4, z:-2.3, rim:'royal',  ry:0 },
  { id:'vsepr',       n:2, x:-1.8, z:-2.3, rim:'teal',   ry:0.32 },
  { id:'complex',     n:3, x: 1.8, z:-2.3, rim:'green',  ry:0.32 },
  { id:'ethene',      n:4, x: 5.4, z:-2.3, rim:'yellow', ry:0 },
  { id:'benzene',     n:5, x:-5.4, z: 2.3, rim:'teal',   ry:0 },
  { id:'geometric',   n:6, x:-1.8, z: 2.3, rim:'yellow', ry:0.32 },
  { id:'enantiomers', n:7, x: 1.8, z: 2.3, rim:'royal',  ry:0.32 },
  { id:'sn2',         n:8, x: 5.4, z: 2.3, rim:'green',  ry:0.32 }
];

/* where each station's pin sits: above the molecule, nudged towards the default camera */
export const pinPos = id => { const s = STATIONS.find(t => t.id === id); return [s.x + 0.55, G + MY + 1.55, s.z + 0.55]; };
