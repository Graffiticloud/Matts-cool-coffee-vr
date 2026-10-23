/* Shared geometry for the futures cone: the scene draws it, the card sort classifies against it.
   Units are model units. The cone opens along +x from the apex ("now"). Radii are at the far end (x = apex + length);
   at any distance t along the axis a shell's radius is r * t / length. depth squashes the cross-section front to back. */
export const CONE = {
  apex:[-7.5, 2.4, 0],
  length:15,
  depth:0.8,
  /* nested zones, innermost first: a point belongs to the first zone whose radius it falls within */
  zones:[
    { id:'projected', label:'Projected', r:0.45, color:0x35a7ff },
    { id:'probable', label:'Probable', r:1.6, color:0x2f80ed },
    { id:'plausible', label:'Plausible', r:3.1, color:0x9aa4b8 },
    { id:'possible', label:'Possible', r:4.4, color:0xf2f4f8 },
    { id:'preposterous', label:'Preposterous', r:5.7, color:0xff3b30 }
  ],
  beyond:{ id:'beyond', label:'Beyond imagining', color:0x8a8f9c },
  membrane:4.95,          // the Clarke–Dator edge, between possible and preposterous
  potential:6.8,          // everything beyond the present
  preferable:{ r:1.25, tilt:-0.1, color:0x2fbf5a },
  unpreferred:{ r:1.0, tilt:0.11, color:0xd83b6a },
  horizons:[
    { id:'now', label:'Now', to:0.25 },
    { id:'near', label:'Near', to:0.6 },
    { id:'next', label:'Next', to:1.0 }
  ]
};
