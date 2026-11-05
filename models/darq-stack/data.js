// DARQ STACK model data, shared by the 2D animated page and the VR/MR editor.
// Coordinates are 2D model units: hub at (0,0), x to the right, y downward
// (in 3D, y becomes depth). Edit here or inside the editor and export JSON.
export const DARQ_STACK = {
  version: 3,
  title: 'DARQ STACK',
  analytics: {
    label: 'METRICS & ANALYTICS',
    sub: 'decision-making · reporting · strategic foresight',
    blurb: 'The data layer under everything: metrics and analytics captured from every node, turned into insight that informs resource allocation, reporting and strategic foresight.'
  },
  colours: {
    hub: '#111111', tl: '#185FA5', research: '#534AB7', comm: '#854F0B', ee: '#0F6E56',
    flow: '#C8102E', cross: '#D85A30', data: '#888780'
  },
  nodes: [
    { id: 'resources', label: 'RESOURCES', tier: 0, group: 'hub', x: 0, y: 0,
      blurb: 'The resource base (people, time, infrastructure, funding) that powers every activity in the stack and receives the returns from it.' },

    { id: 'tl', label: 'TEACHING & LEARNING', tier: 1, group: 'tl', x: 0, y: -150,
      blurb: 'DARQ+-enabled pedagogy and curriculum: how the technologies are taught, and how they change teaching itself.' },
    { id: 'research', label: 'RESEARCH', tier: 1, group: 'research', x: 150, y: 0,
      blurb: 'The DARQ+ research programme: methods, outputs and theory-building on synthetic society.' },
    { id: 'comm', label: 'COMMERCIALISATION', tier: 1, group: 'comm', x: 0, y: 150,
      blurb: 'Turning DARQ+ expertise into income and partnerships, which flows back into Resources.' },
    { id: 'ee', label: 'EXTERNAL ENGAGEMENT', tier: 1, group: 'ee', x: -150, y: 0,
      blurb: 'Visibility, voice and reach: how the work meets publics and partners, returning profile and opportunity to Resources.' },

    { id: 'aie', label: 'AIE', tier: 2, group: 'tl', parent: 'tl', x: -127, y: -238,
      blurb: 'AI in Education: AI-integrated learning design, tools and literacies.' },
    { id: 'syned', label: 'Synthetic Education', tier: 2, group: 'tl', parent: 'tl', x: 0, y: -270,
      blurb: 'Education designed for and through synthetic society: synthetic selves, agents and environments as sites of learning.' },
    { id: 'edxr', label: 'EdXR', tier: 2, group: 'tl', parent: 'tl', x: 127, y: -238,
      blurb: 'Extended reality for education: VR, MR and immersive dioramas as learning spaces.' },

    { id: 'metno', label: 'Metnography', tier: 2, group: 'research', parent: 'research', x: 238, y: -127,
      blurb: 'Ethnography of and in metaversal and immersive spaces; feeds EdXR and Synthetic Education.' },
    { id: 'liquid', label: 'Liquid Learning', tier: 2, group: 'research', parent: 'research', x: 270, y: 0,
      blurb: 'Research strand on fluid, accelerated and technologically mediated learning.' },
    { id: 'portfolio', label: 'DARQ portfolio', tier: 2, group: 'research', parent: 'research', x: 238, y: 127,
      blurb: 'The body of DARQ+ outputs and projects: track record that underpins bids and content.' },

    { id: 'bids', label: 'DARQ Bids', tier: 2, group: 'comm', parent: 'comm', x: 127, y: 238,
      blurb: 'Competitive funding and tender bids built on the DARQ portfolio.' },
    { id: 'cpd', label: 'DARQ CPD', tier: 2, group: 'comm', parent: 'comm', x: 0, y: 270,
      blurb: 'Continuing professional development offers in DARQ+ for industry and the public sector.' },
    { id: 'ktp', label: 'KTP', tier: 2, group: 'comm', parent: 'comm', x: -127, y: 238,
      blurb: 'Knowledge Transfer Partnerships: embedded, co-funded innovation projects with partners.' },

    { id: 'owned', label: 'Owned media', sub: 'dynamic website / experience', tier: 2, group: 'ee', parent: 'ee', x: -229, y: -143, r: 42,
      blurb: 'Channels we own and control: the dynamic website and immersive experience.' },
    { id: 'mindcast', label: 'Mindcast media', sub: 'social · blog · podcasts · vodcasts', tier: 2, group: 'ee', parent: 'ee', x: -270, y: 0, r: 42,
      blurb: 'Thought-leadership broadcast: social media campaigns, blog, podcasts and vodcasts.' },
    { id: 'partner', label: 'Partner media', tier: 2, group: 'ee', parent: 'ee', x: -218, y: 159,
      blurb: 'Showcasing our core partners and co-branded work; linked both ways with KTP.' }
  ],
  // type: resource | sub | return | cross | data ; core: shown on the static/default layer
  flows: [
    { from: 'resources', to: 'tl', type: 'resource' },
    { from: 'resources', to: 'research', type: 'resource' },
    { from: 'resources', to: 'comm', type: 'resource' },
    { from: 'resources', to: 'ee', type: 'resource' },

    { from: 'tl', to: 'aie', type: 'sub' }, { from: 'tl', to: 'syned', type: 'sub' }, { from: 'tl', to: 'edxr', type: 'sub' },
    { from: 'research', to: 'metno', type: 'sub' }, { from: 'research', to: 'liquid', type: 'sub' }, { from: 'research', to: 'portfolio', type: 'sub' },
    { from: 'comm', to: 'bids', type: 'sub' }, { from: 'comm', to: 'cpd', type: 'sub' }, { from: 'comm', to: 'ktp', type: 'sub' },
    { from: 'ee', to: 'owned', type: 'sub' }, { from: 'ee', to: 'mindcast', type: 'sub' }, { from: 'ee', to: 'partner', type: 'sub' },

    { from: 'comm', to: 'resources', type: 'return' },
    { from: 'ee', to: 'resources', type: 'return' },

    { from: 'metno', to: 'edxr', type: 'cross', core: true },
    { from: 'metno', to: 'syned', type: 'cross', core: true },
    { from: 'portfolio', to: 'bids', type: 'cross', core: true },
    { from: 'ktp', to: 'partner', type: 'cross', core: true, both: true },
    { from: 'liquid', to: 'cpd', type: 'cross' },
    { from: 'aie', to: 'cpd', type: 'cross' },
    { from: 'portfolio', to: 'mindcast', type: 'cross' },

    { from: 'analytics', to: 'resources', type: 'data' }
  ]
};
