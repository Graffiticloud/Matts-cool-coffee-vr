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

  questions:[
    { id:'q1', hotspot:'queue',
      q:'According to Maister (1985), which change would most likely make this queue feel shorter, without it moving any faster?',
      options:[
        'Give waiting customers things to look at and do, such as the menu board, the pastry case and the barista at work',
        'Hide the queue so passers-by cannot see how long it is',
        'Remove the floor markers so the line feels less formal',
        'Ask staff to avoid eye contact until each customer reaches the till'
      ],
      answer:0,
      explain:'Maister argues that occupied time feels shorter than unoccupied time. A queue that faces the menu, the pastries and the barista gives people something to do, so the same wait is perceived as shorter.',
      ref:"Maister, D.H. (1985) 'The psychology of waiting lines', in Czepiel, J.A., Solomon, M.R. and Surprenant, C.F. (eds) The Service Encounter. Lexington, MA: Lexington Books, pp. 113–123." },
    { id:'q2', hotspot:'queue',
      q:"In Bitner's (1992) servicescape framework, the stanchions, the floor markings and the route from the door to the till belong to which dimension?",
      options:['Ambient conditions', 'Spatial layout and functionality', 'Signs, symbols and artefacts', 'Employee responses'],
      answer:1,
      explain:'Spatial layout and functionality covers how furnishings and equipment are arranged and how well that arrangement helps people achieve their goals, such as ordering quickly.',
      ref:"Bitner, M.J. (1992) 'Servicescapes: the impact of physical surroundings on customers and employees', Journal of Marketing, 56(2), pp. 57–71." },

    { id:'q3', hotspot:'bar',
      q:"In Pine and Gilmore's (1998) terms, what does the visible 'theatre' at the espresso bar do for the café?",
      options:[
        'It stages an experience, so the café can charge far more than the commodity cost of the coffee',
        'It mainly lowers the cost of goods sold',
        'It turns the café into a pure manufacturing business',
        'It removes the need for a brand identity'
      ],
      answer:0,
      explain:'Pine and Gilmore describe a progression of economic value from commodities to goods, services and experiences. Staging the making of coffee as a memorable event is what lets a café charge an experience price for a commodity product.',
      ref:"Pine, B.J. and Gilmore, J.H. (1998) 'Welcome to the experience economy', Harvard Business Review, 76(4), pp. 97–105." },
    { id:'q4', hotspot:'bar',
      q:"A customer stops to watch latte art being poured but does not take part. Which of Pine and Gilmore's four realms of experience fits best?",
      options:['Escapist', 'Educational', 'Entertainment', 'Esthetic'],
      answer:2,
      explain:'Entertainment combines passive participation with absorption: the customer watches the performance and takes it in without acting on it. Educational would need active participation; esthetic and escapist involve immersion in the setting.',
      ref:'Pine, B.J. and Gilmore, J.H. (1999) The Experience Economy: Work Is Theatre and Every Business a Stage. Boston, MA: Harvard Business School Press.' },

    { id:'q5', hotspot:'menu',
      q:"The menu board, the cup logo and the branded merchandise shelf are examples of which dimension of Bitner's (1992) servicescape?",
      options:['Ambient conditions', 'Spatial layout and functionality', 'Signs, symbols and artefacts', 'Social density'],
      answer:2,
      explain:'Signs, symbols and artefacts are the explicit and implicit signals that communicate what a place is about: signage, logos, décor and objects that tell customers what to expect and how to behave.',
      ref:"Bitner, M.J. (1992) 'Servicescapes: the impact of physical surroundings on customers and employees', Journal of Marketing, 56(2), pp. 57–71." },
    { id:'q6', hotspot:'menu',
      q:"Schmitt (1999) proposes five strategic experiential modules. A branded mug that lets customers show they belong to the café's community mainly targets which module?",
      options:['SENSE', 'THINK', 'ACT', 'RELATE'],
      answer:3,
      explain:'RELATE experiences connect the individual to a wider social group or identity. Buying and displaying branded merchandise signals belonging to the brand community, beyond sensory pleasure or reflection.',
      ref:"Schmitt, B. (1999) 'Experiential marketing', Journal of Marketing Management, 15(1–3), pp. 53–67." },

    { id:'q7', hotspot:'atmos',
      q:'How did Kotler (1973) define atmospherics?',
      options:[
        'The conscious design of space to create specific emotional effects in buyers that make purchase more likely',
        'The effect of the weather on footfall',
        'The use of price promotions inside a store',
        'The emotional labour performed by front-line staff'
      ],
      answer:0,
      explain:"Kotler framed atmosphere as a marketing tool in its own right: music, lighting, colour and scent are designed to produce feelings in buyers that raise their likelihood of buying.",
      ref:"Kotler, P. (1973) 'Atmospherics as a marketing tool', Journal of Retailing, 49(4), pp. 48–64." },
    { id:'q8', hotspot:'atmos',
      q:"Atmospherics research often draws on Mehrabian and Russell's (1974) environmental psychology model. Which statement summarises it?",
      options:[
        'Environmental stimuli shape emotional states of pleasure, arousal and dominance, which drive approach or avoidance behaviour',
        'Customers compare prices rationally before deciding whether to enter',
        'Loyalty schemes are the main driver of repeat visits',
        'Staff training alone determines how long customers stay'
      ],
      answer:0,
      explain:'In the stimulus–organism–response logic of the model, the music, lighting and smell are stimuli; the emotional states they produce lead customers to approach (stay, spend, return) or avoid the place.',
      ref:'Mehrabian, A. and Russell, J.A. (1974) An Approach to Environmental Psychology. Cambridge, MA: MIT Press.' },

    { id:'q9', hotspot:'seating',
      q:"Oldenburg (1989) described cafés as 'third places'. What does the term mean?",
      options:[
        'Informal public gathering places that sit apart from home (the first place) and work (the second place)',
        'The third-ranked competitor in a local market',
        'A third-party delivery channel',
        'The third stage of a customer journey map'
      ],
      answer:0,
      explain:'Third places are neutral, accessible spaces where people gather regularly and informally, with conversation as a main activity. The seating zone, the sofa and the laptop worker show the café playing that role.',
      ref:'Oldenburg, R. (1989) The Great Good Place. New York: Paragon House.' },
    { id:'q10', hotspot:'seating',
      q:'The friends chatting and the student on a laptop make the café feel lively to everyone else. Which concept describes other customers forming part of the experience?',
      options:['Price elasticity', 'The social servicescape', 'Channel conflict', 'Brand dilution'],
      answer:1,
      explain:"Tombs and McColl-Kennedy extend the servicescape to include its social dimension: the presence, number and behaviour of other customers shape each person's emotions and purchase intentions.",
      ref:"Tombs, A. and McColl-Kennedy, J.R. (2003) 'Social-servicescape conceptual model', Marketing Theory, 3(4), pp. 447–475." },

    { id:'q11', hotspot:'pickup',
      q:'Many customers now order ahead in an app or through a delivery rider, so they never see the interior. From a customer-journey perspective (Lemon and Verhoef, 2016), what is the main marketing challenge?',
      options:[
        'Managing the experience across touchpoints the brand does not fully own, such as apps and partner delivery platforms',
        'Reducing the number of items on the menu',
        'Making the seating area larger',
        'Removing the queue altogether'
      ],
      answer:0,
      explain:'Lemon and Verhoef map touchpoints as brand-owned, partner-owned, customer-owned and social or external. Delivery platforms are partner-owned touchpoints: they shape the experience, but the café controls them only partly.',
      ref:"Lemon, K.N. and Verhoef, P.C. (2016) 'Understanding customer experience throughout the customer journey', Journal of Marketing, 80(6), pp. 69–96." },
    { id:'q12', hotspot:'pickup',
      q:'Rosa (2013) identifies three dimensions of social acceleration. Which list is correct?',
      options:[
        'Technological acceleration, acceleration of social change, and acceleration of the pace of life',
        'Faster production, faster consumption and faster profit',
        'Digital, physical and phygital acceleration',
        'Supply, demand and price acceleration'
      ],
      answer:0,
      explain:'Rosa distinguishes technological acceleration (faster transport, communication and production), the acceleration of social change, and the acceleration of the pace of life. Order-ahead apps and delivery riders speed up the café visit itself, compressing the experience the café was designed to stage.',
      ref:'Rosa, H. (2013) Social Acceleration: A New Theory of Modernity. New York: Columbia University Press.' }
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
