/* Content and settings for the BAA café model. The runtime reads this; the scene lives in scene.js. */
const G = 0.03;

export const spec = {
  id:'baa-cafe',
  title:"Matt's Cool Coffee",
  subtitle:'Inside the café',
  module:'BAA · Business in an Age of Acceleration (BUSN10060) · experiential marketing case',
  moduleCode:'BUSN10060',
  ground:G,
  seed:11,
  target:[0, 1.5, -0.6],
  fit:10.5,
  shadowHalf:12,
  catcherY:-5.5,
  arCatcherY:-1.24,
  pinSize:0.62,
  privacy:'Your student number and quiz answers are saved to a UWS Google Sheet so your lecturer can see how the cohort is doing and follow up with support. Questions you ask the AI tutor are sent to an AI service without your student number. You can retake the quiz as often as you like.',

  views:[
    { name:'Tabletop', s:0.075, yaw:-Math.PI / 4, anchor:[0, 0, 0], at:[0, 0.82, -0.85] },
    { name:'Room scale', s:0.24, yaw:-Math.PI / 4, anchor:[0, 0, 0], at:[0, 0.3, -2.4] },
    { name:'Inside the café', s:2.1, yaw:0, anchor:[3.0, G, 1.5], at:[0, 0, 0] }
  ],

  hotspots:[
    { id:'queue', n:1, title:'The queue', pos:[1.3, 2.1, -1.5], concept:'the psychology of waiting lines',
      blurb:'Customers queue between stanchions from the door towards the till, facing the menu board and the pastry case.' },
    { id:'bar', n:2, title:'The espresso bar', pos:[4.9, 2.7, -3.8], concept:'the experience economy',
      blurb:'A barista works a bright orange espresso machine in full view of the queue: grinding, tamping, steaming and pouring latte art.' },
    { id:'menu', n:3, title:'Menu board and merchandise', pos:[2.9, 4.15, -4.9], concept:'signs, symbols and artefacts',
      blurb:'A branded menu board with the cup logo, plus a shelf of branded bags, tins and mugs for sale.' },
    { id:'atmos', n:4, title:'Sound, light and smell', pos:[-5.9, 4.35, -4.8], concept:'atmospherics',
      blurb:'A speaker plays background music, warm pendant lights hang over the tables, and the smell of coffee fills the room.' },
    { id:'seating', n:5, title:'The seating area', pos:[-3.6, 2.4, -0.6], concept:'the café as a third place',
      blurb:'Tables, a sofa corner and a student working on a laptop: people stay, meet and work here.' },
    { id:'pickup', n:6, title:'Pickup shelf and order screen', pos:[6.5, 3.15, -1.8], concept:'digital touchpoints and social acceleration',
      blurb:'App orders appear on a screen and wait on a pickup shelf; a delivery rider collects bags for customers who never come in.' }
  ],

  /* Answers, explanations and references are not published: the Worker marks answers against the private key. */
  questions:[
    {"id":"q1","hotspot":"queue","q":"According to Maister (1985), which change would most likely make this queue feel shorter, without it moving any faster?","options":["Give waiting customers things to look at, such as the menu, pastry case and barista","Move the queue outside so the interior looks calmer to the customers who are seated","Remove the floor markers so the line feels more relaxed and less like a system","Ask staff to avoid eye contact until each customer finally reaches the till"]},
    {"id":"q2","hotspot":"queue","q":"In Bitner's (1992) servicescape framework, the stanchions, the floor markings and the route from the door to the till belong to which dimension?","options":["Ambient conditions","Spatial layout and functionality","Signs, symbols and artefacts","Employee responses"]},
    {"id":"q3","hotspot":"bar","q":"In Pine and Gilmore's (1998) terms, what does the visible 'theatre' at the espresso bar do for the café?","options":["It stages an experience, so the café can charge far more than the coffee's commodity cost","It speeds up service, so the café can serve far more customers in every busy hour of the day","It cuts the cost of goods sold by showing staff exactly how much coffee to use","It builds awareness mainly by being photographed for paid advertising campaigns"]},
    {"id":"q4","hotspot":"bar","q":"A customer stops to watch latte art being poured but does not take part. Which of Pine and Gilmore's four realms of experience fits best?","options":["Escapist","Educational","Entertainment","Esthetic"]},
    {"id":"q5","hotspot":"menu","q":"The menu board, the cup logo and the branded merchandise shelf are examples of which dimension of Bitner's (1992) servicescape?","options":["Ambient conditions","Spatial layout and functionality","Signs, symbols and artefacts","Social density"]},
    {"id":"q6","hotspot":"menu","q":"Schmitt (1999) proposes five strategic experiential modules. A branded mug that lets customers show they belong to the café's community mainly targets which module?","options":["SENSE","THINK","ACT","RELATE"]},
    {"id":"q7","hotspot":"atmos","q":"How did Kotler (1973) define atmospherics?","options":["The deliberate design of space to create emotional effects in buyers that make purchase more likely","The study of how weather and the seasons shift footfall and spending in physical stores","The use of in-store price promotions and displays to trigger unplanned purchases","The emotional labour that front-line staff perform to keep every customer feeling welcome and valued"]},
    {"id":"q8","hotspot":"atmos","q":"Atmospherics research often draws on Mehrabian and Russell's (1974) environmental psychology model. Which statement summarises it?","options":["Stimuli shape pleasure, arousal and dominance, driving approach or avoidance","Stimuli are judged on price, quality and convenience, which drive rational store choice","Stimuli build trust, commitment and loyalty, which drive long-term repeat visiting","Stimuli trigger attention, interest and desire, which drive action at the point of sale"]},
    {"id":"q9","hotspot":"seating","q":"Oldenburg (1989) described cafés as 'third places'. What does the term mean?","options":["Informal gathering places apart from home (the first place) and work (the second place)","Commercial spaces ranked third after home and online as places where people spend money","Online communities that sit between personal life (the first place) and working life (the second)","Neutral meeting places ranked third in importance after family and religious life"]},
    {"id":"q10","hotspot":"seating","q":"The friends chatting and the student on a laptop make the café feel lively to everyone else. Which concept describes other customers forming part of the experience?","options":["Price elasticity of demand","The social servicescape","Co-branding with customers","Ambient conditions"]},
    {"id":"q11","hotspot":"pickup","q":"Many customers now order ahead in an app or through a delivery rider, so they never see the interior. From a customer-journey perspective (Lemon and Verhoef, 2016), what is the main marketing challenge?","options":["Managing the experience across touchpoints the brand does not own, such as delivery apps","Redesigning the interior so it photographs well enough on social media to win back walk-in visits","Cutting the menu so that every item travels well enough for delivery riders","Moving the pickup point outside so order-ahead customers never enter the café"]},
    {"id":"q12","hotspot":"pickup","q":"Rosa (2013) identifies three dimensions of social acceleration. Which list is correct?","options":["Technological acceleration, acceleration of social change, and of the pace of life","Acceleration of production, of consumption and of the turnover of capital","Digital, physical and phygital acceleration across everyday consumer experience","Technological acceleration, acceleration of mobility, and of the flow of information"]}
  ],

  tutor:{
    name:'BAA tutor',
    greeting:"Hi. I'm the BAA tutor for this case. Ask me about anything in the café, or about any quiz question. I'll explain the theory, give examples, and help you work answers out for yourself.",
    suggestions:[
      'How does this café link to an age of acceleration?',
      'What is the difference between the servicescape and atmospherics?',
      'How could the café use XR or AI to stage its experience?'
    ],
    brief:[
      'You are a tutor for BAA: Business in an Age of Acceleration (BUSN10060, SCQF Level 10) at the University of the West of Scotland, a Graduate Apprenticeship module for working students.',
      "The case is 'Matt's Cool Coffee', a fictional café explored as a 3D model, used to teach experiential marketing.",
      'Core theory for this case: Pine and Gilmore (1998; 1999) experience economy and the four realms; Bitner (1992) servicescape; Tombs and McColl-Kennedy (2003) social servicescape; Kotler (1973) atmospherics; Mehrabian and Russell (1974); Schmitt (1999) strategic experiential modules; Maister (1985) psychology of waiting lines; Oldenburg (1989) third place; Lemon and Verhoef (2016) customer journey; Rosa (2013) social acceleration.',
      'How to answer: British English. Keep answers under 150 words unless the student asks for more. Be encouraging but rigorous. Prefer a short explanation, a concrete example from the café or from real UK businesses, and one question back that makes the student think. Cite sources as (Author, year) in Harvard style and only cite the works listed above or other well-known sources you are sure of; never invent references.',
      "Stay on this module and case. If asked about something unrelated, say briefly that you can only help with the BAA café case and suggest a related question. Do not write assessed coursework for the student; help them think it through instead."
    ].join(' ')
  }
};
