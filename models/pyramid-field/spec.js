/* The Pyramid Stage zone: events management teaching model. Stylised and representative, not a surveyed plan. */
const STILL = 'Still, G.K. (2014) Introduction to Crowd Science. Boca Raton, FL: CRC Press.';
const HSE = 'Health and Safety Executive (2000) Managing Crowds Safely: A Guide for Organisers at Events and Venues (HSG154). 2nd edn. Sudbury: HSE Books.';
const PURPLE = 'Event Industry Forum (2026) The Purple Guide to Health, Safety and Welfare at Music and Other Events. Available at: https://www.thepurpleguide.co.uk (Accessed: 18 October 2026).';
const AP = "Associated Press (2025) 'Count down to Glastonbury with all the numbers you need to know', 25 June. Available at: https://www.news4jax.com/entertainment/2025/06/25/count-down-to-glastonbury-with-all-the-numbers-you-need-to-know/ (Accessed: 18 October 2026).";

export const spec = {
  id:'pyramid-field',
  title:'The Pyramid Field',
  subtitle:'Main-stage operations',
  module:'Events management · festival main-stage case: health and safety, crowds, operations, servicescape and experience',
  moduleCode:'EVENTS',
  ground:0.16,
  seed:23,
  target:[0, 1.4, -0.5],
  fit:16,
  shadowHalf:20,
  catcherY:-5.5,
  arCatcherY:-1.24,
  pinSize:0.75,
  privacy:'Your student number and quiz answers are saved to a UWS Google Sheet so your lecturer can see how the cohort is doing and follow up with support. Questions you ask the AI tutor are sent to an AI service without your student number. You can retake the quiz as often as you like.',

  /* Synthetic Matt guide: a 30-second green-screen clip (HeyGen, pure green background) saved as intro.mp4 in this folder.
     Until the file exists the guide simply does not appear. */
  intro:{ src:'./intro.mp4', title:'Synthetic Matt', key:0x00ff00, similarity:0.16, smoothness:0.08, xr:{ pos:[-1.15, 1.32, -1.55], height:1.05 } },

  research:{
    consent:'This session is part of a UWS research study on learning in immersive environments. If you agree, the model records what you do in it: which points you open and for how long, your answers and decisions with their timings, the views you use and your questions to the tutor. Records carry a coded ID made from your student number, never your name, and are stored securely by the research team. Taking part is voluntary, has no effect on your marks, and you can stop at any time. Your lecturer has the participant information sheet.'
  },

  views:[
    { name:'Tabletop', s:0.045, yaw:-Math.PI / 4, anchor:[0, 0, 0], at:[0, 0.82, -0.9] },
    { name:'Room scale', s:0.14, yaw:-Math.PI / 4, anchor:[0, 0, 0], at:[0, 0.3, -2.8] },
    { name:'In the crowd', s:3.0, yaw:0, anchor:[1.6, 0.16, 4.2], at:[0, 0, 0] }
  ],

  hotspots:[
    { id:'intro', n:'▶', title:'Introduction', pos:[-0.2, 3.4, 10.4], concept:'the Pyramid Field case and how to use this model',
      blurb:'An introduction to the Pyramid Field case and this model.',
      card:{ sheet:'./intro-card.jpg', cols:4, rows:6, frames:24, fps:8, w:3.2, aspect:0.375, label:'Introduction' },
      video:{ src:'https://pub-deabebbc2a4743a28d1d32dd1c97e78d.r2.dev/Gifs/Video/BAA%20Intor%20hi.mp4', poster:'./intro-poster.jpg', title:'Introduction',
        note:'Watch the introduction, then explore the numbered pins and the live crowd-surge scenario.' } },
    { id:'surge-scenario', n:'!', title:'Live scenario: crowd surge', pos:[1.6, 2.7, -1.4], scenario:'surge', concept:'show-stop decision making',
      blurb:'A branching scenario. A surge builds at the barrier during the headline set. You make the calls; the field responds to each decision.' },
    { id:'stage', n:1, title:'The Pyramid Stage', pos:[0, 9.6, -7.2], concept:'place identity and the event experience',
      blurb:'A 30 m steel pyramid on a 40 m by 40 m footprint, built for 2000 and left standing on the farm all year. The first pyramid stage went up in 1971.' },
    { id:'barrier', n:2, title:'Front-of-stage barrier and pit', pos:[-3.6, 1.9, -3.6], concept:'front-of-stage crowd safety',
      blurb:'A purpose-built demountable barrier keeps the crowd back from the stage. Stewards and medics work in the pit behind it, facing the audience.' },
    { id:'crowd', n:3, title:'Crowd density', pos:[-4.6, 1.8, 5.4], concept:'crowd density and the DIM-ICE model',
      blurb:'The crowd packs tightly at the barrier and thins towards the back. The largest single Pyramid crowd reported is about 120,000, for Elton John in 2023.' },
    { id:'screens', n:4, title:'Delay towers and screens', pos:[5.6, 5.8, 0.4], concept:'information as a crowd management tool',
      blurb:'Delay towers re-time and re-amplify the sound halfway up the field, and carry screens for the people behind them. Big side screens flank the stage.' },
    { id:'foh', n:5, title:'Front of house and event control', pos:[0, 4.0, 2.9], concept:'licensing objectives and command and control',
      blurb:"The sound and lighting control position sits in the middle of the field behind a crowd fence. The site's safety decisions run through a separate event control room." },
    { id:'welfare', n:6, title:'Toilets and water', pos:[-11.2, 3.1, 6.4], concept:'welfare provision and sustainability',
      blurb:'A row of long-drop toilets with a queue, a women\'s urinal screen, hand-washing and a free water refill point. The festival has not sold single-use plastic bottles since 2019.' },
    { id:'food', n:7, title:'Food vans, bar and merchandise', pos:[12.3, 2.9, 1.2], concept:'the servicescape and traders\' safety',
      blurb:'Food vans with queues line the trackway, a bar marquee sits at the back of the field, and a merchandise stall faces the crowd from the other side.' },
    { id:'access', n:8, title:'Accessible viewing platform', pos:[-11.4, 3.5, -2.6], concept:'inclusive event design',
      blurb:'A raised, covered platform with a ramp, space for wheelchair users and companions, and an accessible toilet beside it.' },
    { id:'gate', n:9, title:'Perimeter, gate and campsite', pos:[-0.2, 3.1, 9.7], concept:'ingress, capacity and security',
      blurb:'A fenced boundary with a staffed gate separates the arena from the campsite beyond. The whole festival site sits inside an 8 km perimeter fence.' }
  ],

  questions:[
    { id:'p1', hotspot:'stage',
      q:'The Pyramid Stage stands on the farm all year and has been rebuilt on the same site since 1971. Why do event scholars treat iconic stages like this as more than infrastructure?',
      options:[
        'They carry meanings and memories that build place identity and attract audiences beyond any single line-up',
        'They reduce the licence fee the organiser pays',
        'They remove the need for screens and delay towers',
        'They are required by law for headline performers'
      ],
      answer:0,
      explain:'Getz and Page argue that planned events create meanings for attendees, and that settings become part of that meaning. A stage seen at every edition, in decades of broadcasts and photos, becomes a symbol of the event itself: part of why people want to be there.',
      ref:'Getz, D. and Page, S.J. (2016) Event Studies: Theory, Research and Policy for Planned Events. 3rd edn. London: Routledge.' },
    { id:'p2', hotspot:'stage',
      q:'When a field of strangers sings a headliner\'s chorus together, what would Turner (1969) call the shared feeling of equality and togetherness?',
      options:['Communitas', 'Anomie', 'Alienation', 'Cognitive dissonance'],
      answer:0,
      explain:"Turner describes communitas as an intense, shared bond that emerges in liminal spaces set apart from everyday structure. Festivals are classic liminal settings. Durkheim's idea of collective effervescence describes a similar charge of shared emotion in crowds.",
      ref:'Turner, V. (1969) The Ritual Process: Structure and Anti-Structure. Chicago: Aldine.' },

    { id:'p3', hotspot:'barrier',
      q:'Why is the front-of-stage barrier a strong, purpose-made demountable barrier with a staffed pit behind it, rather than simple fencing?',
      options:[
        'It must withstand crowd pressure, and the pit lets stewards and medics lift people out and treat them safely',
        'It stops performers from seeing the audience',
        'It creates extra space for VIP ticket holders',
        'It keeps broadcast cameras out of the rain'
      ],
      answer:0,
      explain:'Crowd loads at the front can be very high, so barriers are designed and installed to take them. The pit gives staff a safe working space to monitor the crowd, pass water, and extract anyone in distress over the barrier.',
      ref:HSE },
    { id:'p4', hotspot:'barrier',
      q:'As standing density rises towards 5 or more people per square metre, what becomes the main danger in a crowd?',
      options:[
        'People can no longer move independently, forces build through the crowd, and falls, collapses and compressive asphyxia become possible',
        'Dehydration, but nothing else',
        'Hearing damage from the speakers',
        'Pickpocketing'
      ],
      answer:0,
      explain:'Still explains that at high densities individuals lose control of their own movement. Pressure waves pass through the crowd and a single fall can trigger a progressive collapse. Monitoring density near the barrier is therefore a core safety task.',
      ref:STILL },

    { id:'p5', hotspot:'crowd',
      q:"Still's (2014) DIM-ICE model analyses crowd risk by combining three influences with three phases. Which is correct?",
      options:[
        'Design, Information and Management, across Ingress, Circulation and Egress',
        'Density, Intensity and Motion, across Indoors, Courtyards and Exits',
        'Duty, Insurance and Monitoring, across Incidents, Complaints and Evacuation',
        'Demand, Income and Marketing, across Interest, Conversion and Engagement'
      ],
      answer:0,
      explain:'DIM-ICE asks how the design of the space, the information people receive, and the way the crowd is managed affect each phase of an event: arriving, moving around, and leaving. It is a structured way to spot where risk concentrates.',
      ref:STILL },
    { id:'p6', hotspot:'crowd',
      q:'A field holds 100,000 people. If its exits can pass a combined flow of 2,500 people per minute, roughly how long does a full egress take?',
      options:['4 minutes', '25 minutes', '40 minutes', '400 minutes'],
      answer:2,
      explain:'Egress time is the number of people divided by the total flow rate: 100,000 ÷ 2,500 = 40 minutes. Planners size exit widths so that both the normal exit after a headliner and an emergency evacuation can be done within an acceptable time.',
      ref:STILL },

    { id:'p7', hotspot:'screens',
      q:'How do delay towers and the big screens help crowd safety as well as the experience?',
      options:[
        'They make the middle and back of the field worth standing in, which spreads people out and reduces the pull towards the front',
        'They count the number of people in the field',
        'They act as a windbreak for the stage',
        'They create extra bar space'
      ],
      answer:0,
      explain:'If people can only see and hear well at the front, they push forward. Good sound and sightlines further back distribute the audience across the field, which lowers density at the barrier. Information shapes behaviour.',
      ref:STILL },
    { id:'p8', hotspot:'screens',
      q:'If a set must be stopped because of a crowd problem, why do organisers show pre-agreed messages on the screens as well as making announcements over the PA?',
      options:[
        'In a loud, packed field many people cannot hear clearly, so the same message on several channels reaches more of the crowd',
        'Screen messages are cheaper than staff',
        'The law forbids spoken announcements',
        'It keeps sponsors visible during the pause'
      ],
      answer:0,
      explain:'Crowds respond better to clear, consistent information from a credible source. Planning scripted messages in advance, and using screens, PA and stewards together, avoids confusion when the show stops.',
      ref:HSE },

    { id:'p9', hotspot:'foh',
      q:'A festival licensed under the Licensing Act 2003 must promote four licensing objectives. Which list is correct?',
      options:[
        'Prevention of crime and disorder, public safety, prevention of public nuisance, and protection of children from harm',
        'Profit, public safety, sustainability, and customer satisfaction',
        'Crowd control, fire safety, food hygiene, and noise reduction',
        'Security, marketing, licensing, and ticketing'
      ],
      answer:0,
      explain:"These four objectives frame what the licensing authority can require through licence conditions, such as capacity limits, noise curfews and safety plans. Every major operational decision on site has to sit within them.",
      ref:'Licensing Act 2003, c. 17. London: The Stationery Office.' },
    { id:'p10', hotspot:'foh',
      q:'Large UK events often run event control with a Gold, Silver and Bronze command structure. What does the Silver level do?',
      options:[
        'Turns strategy into tactical plans and coordinates resources across the site',
        'Sets the overall strategy and has final authority',
        'Carries out tasks at the front line, such as stewarding a single gate',
        'Handles artist liaison and hospitality'
      ],
      answer:0,
      explain:'Gold is strategic, Silver is tactical and Bronze is operational. Using the same structure as the police and emergency services means everyone knows who decides what when an incident happens.',
      ref:PURPLE },

    { id:'p11', hotspot:'welfare',
      q:'The festival provides more than 4,000 toilets, including over 2,000 long drops, over 1,300 compost loos and women\'s urinals near the Pyramid stage. Why is this a safety issue and not just a comfort issue?',
      options:[
        'Long queues and poor sanitation lead to people urinating elsewhere, spread infection and create crowd pinch points, so provision is planned in the safety plan',
        'Toilets must legally be flushing at all outdoor events',
        'It only matters for VIP areas',
        'It is purely a matter of customer satisfaction scores'
      ],
      answer:0,
      explain:'Sanitary provision affects hygiene, pollution of watercourses on the farm, and crowd flow, because queues spill into walkways. Guidance sets out how to plan numbers, placement, cleaning and accessible units.',
      ref:"Glastonbury Festivals (2026) Toilets. Available at: https://www.glastonburyfestivals.co.uk/toilets (Accessed: 18 October 2026). " + PURPLE },
    { id:'p12', hotspot:'welfare',
      q:'Since 2019 the festival has not sold single-use plastic bottles and instead offers hundreds of free refill points. What operational risk must planners manage as a result?',
      options:[
        'Demand for free water peaks in hot weather, so refill points must be sized and spread to prevent queues and dehydration',
        'Plastic waste rises sharply',
        'Bars lose their alcohol licences',
        'There is no operational risk'
      ],
      answer:0,
      explain:'A sustainability decision moves the burden onto infrastructure. The water supplier reports demand rising up to six times during the event, so taps, pipework and placement must be planned, especially near busy fields.',
      ref:"Bristol Water (2024) 'Serving up fresh water to over 200,000 music lovers', 27 June. Available at: https://bristolwater.co.uk/our-blogs/serving-up-fresh-water-to-music-lovers (Accessed: 18 October 2026)." },

    { id:'p13', hotspot:'food',
      q:"Food vans, bars and merchandise line the edges of the field rather than the middle. In Bitner's (1992) servicescape terms, this is mainly a decision about:",
      options:['Ambient conditions', 'Spatial layout and functionality', 'Signs, symbols and artefacts', 'Price'],
      answer:1,
      explain:'Putting traders on the edges keeps sightlines clear, keeps queues off the main viewing area and puts service next to the trackway for deliveries. It shapes both the experience and the flow of people.',
      ref:"Bitner, M.J. (1992) 'Servicescapes: the impact of physical surroundings on customers and employees', Journal of Marketing, 56(2), pp. 57–71." },
    { id:'p14', hotspot:'food',
      q:'Most food vans cook with LPG. Which control matters most in the event fire safety plan for this trading area?',
      options:[
        'Separation distances between units, secure cylinder storage, gas safety certificates and fire extinguishers at every unit',
        'A sign asking customers not to smoke',
        'Selling only cold food after dark',
        'Moving all vans next to the stage'
      ],
      answer:0,
      explain:'Under the Regulatory Reform (Fire Safety) Order 2005 the responsible person must assess and control fire risks. For traders this means checking gas installations, controlling cylinder storage, spacing units to stop fire spreading, and keeping firefighting equipment at hand.',
      ref:'Regulatory Reform (Fire Safety) Order 2005, SI 2005/1541. London: The Stationery Office.' },

    { id:'p15', hotspot:'access',
      q:'An accessible viewing platform gives disabled visitors raised sightlines, space for a companion and an accessible toilet nearby. Which legal duty does this help an organiser meet?',
      options:[
        'The duty under the Equality Act 2010 to make reasonable adjustments for disabled people',
        'The enhanced tier of Martyn\'s Law',
        'The Licensing Act 2003 objective on public nuisance',
        'Food hygiene regulations'
      ],
      answer:0,
      explain:'Service providers must make reasonable adjustments so disabled people are not put at a substantial disadvantage. Platforms, accessible routes, accessible toilets and companion tickets are common adjustments at outdoor events.',
      ref:'Equality Act 2010, c. 15. London: The Stationery Office.' },
    { id:'p16', hotspot:'access',
      q:'Why does the emergency plan need specific arrangements for people on the accessible platform?',
      options:[
        'Some may need assistance to evacuate, so assisted routes, trained staff and personal emergency evacuation plans are needed',
        'They are exempt from evacuation',
        'They must always leave first, whatever the incident',
        'No special arrangements are needed outdoors'
      ],
      answer:0,
      explain:'Fire safety law covers everyone on site. Government guidance on means of escape for disabled people stresses planning in advance how each person will get out, rather than improvising during an incident.',
      ref:'HM Government (2007) Fire Safety Risk Assessment: Means of Escape for Disabled People. London: Department for Communities and Local Government.' },

    { id:'p17', hotspot:'gate',
      q:'Overcrowding from people climbing the fence led to the organiser being fined in 2000, and a much stronger perimeter fence went up in 2002. Which part of safety management did this most directly address?',
      options:[
        'Controlling ingress so the number on site stays within the licensed capacity (about 210,000 in 2025)',
        'Improving the sound quality at the back of the field',
        'Reducing the price of food',
        'Increasing merchandise sales'
      ],
      answer:0,
      explain:'Capacity is set by the licence and by safety planning; every design decision on site assumes it. An uncontrolled perimeter means the real crowd is unknown. After 2024, when some smaller stages became overcrowded, the festival also sold a few thousand fewer tickets for 2025.',
      ref:AP },
    { id:'p18', hotspot:'gate',
      q:"The Terrorism (Protection of Premises) Act 2025, known as Martyn's Law, puts events with 800 or more attendees in the enhanced tier. Which body regulates it?",
      options:['The Security Industry Authority', 'The Health and Safety Executive', 'Arts Council England', 'The local Safety Advisory Group'],
      answer:0,
      explain:'The Act received Royal Assent on 3 April 2025, with an implementation period of at least 24 months; statutory guidance followed in April 2026. Enhanced tier duty holders must put in place reasonably practicable public protection measures and keep documented records for the SIA. Penalties reach £18 million or 5% of worldwide revenue.',
      ref:'Terrorism (Protection of Premises) Act 2025. London: The Stationery Office.' }
  ],

  scenarios:[
    { id:'surge', title:'Crowd surge', start:'s1', steps:{
      s1:{ title:'Surge at the barrier', effect:'surge',
        text:'Headline set, third song. The pit supervisor radios event control: left of centre, the crowd is surging and swaying, people are being lifted over the barrier and density looks well above 5 people per square metre. You are the duty manager in event control.',
        choices:[
          { label:'Call a show stop through the agreed procedure: stage manager stops the artist, scripted message on PA and screens.', best:true, next:'s2',
            feedback:'Right call. A pre-agreed show-stop procedure with the artist team is the fastest way to take energy out of the front of the crowd while keeping communication open (HSE, 2000; Event Industry Forum, 2026).' },
          { label:'Keep the show going; the pit team can pull people out over the barrier.', next:'p1',
            feedback:'Extraction treats the symptom. The music and the artist keep pulling people forward, so pressure keeps building behind the people you lift out (Still, 2014).' },
          { label:'Tell the stage manager to cut stage power now.', next:'p2', effect:'blackout',
            feedback:'Stopping the stimulus is right, but a sudden blackout with no message removes the one channel you have to instruct the crowd. Uncertainty drives people to move, not to settle.' },
          { label:'Open a section of the barrier to relieve the pressure.', next:'p3', effect:'crush',
            feedback:'Opening the barrier creates a gap and a drop into the pit. The crowd flows towards it, people at the front fall, and you lose the line between crowd and working space.' }
        ] },
      p1:{ title:'Four minutes later', effect:'surge',
        text:'The pit team has lifted out a dozen people, two are being treated for crush injuries in the first aid tent, and the sway has grown. The artist has not noticed. The barrier load is visibly rising.',
        choices:[
          { label:'Call the show stop now, with the scripted message.', best:true, next:'s2',
            feedback:'Late, but right. Recognising that the situation has moved beyond what the pit team can manage, and escalating, is the core skill (Still, 2014).' },
          { label:'Hold on: the set ends in twenty minutes.', next:'end_bad',
            feedback:'Waiting for a natural end lets a manageable surge become a crowd collapse risk. Time is the one thing you cannot buy back at the front of a dense crowd.' }
        ] },
      p2:{ title:'Darkness and noise', effect:'blackout',
        text:'The stage is dark and the screens show nothing. Thousands of people at the front do not know why. Some push forward to see, others try to leave. Your stewards cannot be heard over the crowd.',
        choices:[
          { label:'Restore PA and screens immediately and run the scripted show-stop message with working light.', best:true, next:'s2', effect:'stop',
            feedback:'Restoring information first is right. A show stop is a communication act as much as a technical one: people need to know what is happening and what to do (HSE, 2000).' },
          { label:'Wait in the dark for the crowd to settle by itself.', next:'end_bad',
            feedback:'Without information the crowd fills the gap with rumour and movement. Silence is not neutral at the front of a dense crowd.' }
        ] },
      p3:{ title:'Barrier breach', end:true, outcome:'poor', effect:'crush',
        text:'People fell into the pit as the gap opened and others surged through behind them. Medics are treating injuries in the pit and the show has had to stop anyway, now with the barrier line lost. Front-of-stage barriers exist to hold the crowd back from the working space and the drop to it, not to act as a pressure valve.',
        ref:'HSE (2000) HSG154; Still (2014).' },
      s2:{ title:'Show paused', effect:'stop',
        text:'The artist has stopped and the house lights are on. The screens show amber. Pressure at the barrier has eased a little, but the zone left of centre is still packed and swaying. Event control asks for your next instruction.',
        choices:[
          { label:'Have the artist read the agreed script asking everyone to take two steps back, and repeat it on the screens. Stewards stay in the pit.', best:true, next:'s3',
            feedback:'Good. The artist is the most powerful voice in the field, and a simple, specific instruction ("two steps back") spread across PA and screens moves the crowd as a whole rather than individuals within it (Event Industry Forum, 2026).' },
          { label:'Restart straight away: the pressure is already easing.', next:'p4', effect:'resurge',
            feedback:'Easing is not the same as safe. Restarting before density has dropped brings the surge straight back.' },
          { label:'Send stewards into the crowd to push people back.', next:'p5', effect:'push',
            feedback:'Pushing into a dense crowd adds force where the pressure already is, and puts stewards inside the crush. Crowds are moved by information and space, not by bodies (Still, 2014).' },
          { label:'Cancel the rest of the set.', next:'p6', effect:'cancel',
            feedback:'Cancelling turns a front-of-stage problem into a whole-field egress problem with a frustrated audience, before the front has been cleared.' }
        ] },
      p4:{ title:'The surge returns', effect:'resurge',
        text:'Within two songs the sway is back, worse than before, and the pit team is lifting people out again.',
        choices:[
          { label:'Stop again and run the "two steps back" script before any restart.', best:true, next:'s3', effect:'message',
            feedback:'Right. A second stop costs time and goodwill, but restarting into the same density was the error.' },
          { label:'Carry on and let the pit team manage it.', next:'end_bad',
            feedback:'You have now seen the pattern twice. Continuing knowingly accepts the risk of collapse.' }
        ] },
      p5:{ title:'Stewards in the press', effect:'push',
        text:'Two stewards are now trapped in the crowd. The people they push against have nowhere to go, so the pressure transfers forward to the barrier.',
        choices:[
          { label:'Withdraw the stewards to the pit and use the scripted message from the stage.', best:true, next:'s3', effect:'message',
            feedback:'Right. Stewards work the barrier line and extract casualties; the crowd as a whole is moved by clear messaging.' },
          { label:'Send more stewards in to support them.', next:'end_bad',
            feedback:'More bodies in the press adds pressure and casualties, including your own staff.' }
        ] },
      p6:{ title:'Eighty thousand people turn round', effect:'cancel',
        text:'The announcement lands badly. Many people head for the exits at once while the front of the crowd is still packed, and the routes towards the gate start to fill.',
        choices:[
          { label:'Reframe it as a pause, run the "two steps back" script and hold egress messaging until the front has cleared.', best:true, next:'s3', effect:'message',
            feedback:'Recovering control of the message is right. Egress needs planning and phasing; a sudden cancellation is the worst time to start it.' },
          { label:'Stand by the cancellation and open all exits.', next:'end_cancel',
            feedback:'Defensible on safety grounds, but you have now created a mass egress with no phasing and a front of crowd that still needs clearing.' }
        ] },
      s3:{ title:'Ready to restart?', effect:'stepback',
        text:'The crowd has stepped back. The density patch has gone, the extra stewards are in place and medics have cleared the pit. The artist\'s manager is asking when they can go again because of the curfew.',
        choices:[
          { label:'Restart only when the Safety Officer in event control confirms the front is safe, with an agreed message from the artist before the first song.', best:true, next:'end_good',
            feedback:'Right. The restart decision belongs with event control on safety grounds, and the artist\'s first words set the tone for the rest of the set (Event Industry Forum, 2026).' },
          { label:'Restart now: the manager says the curfew makes it urgent.', next:'end_commercial',
            feedback:'Commercial pressure is real, but it is not a safety judgement. The licence curfew is negotiable with the authority; injuries are not reversible.' },
          { label:'Restart after a fixed ten minutes, whatever the front looks like.', next:'end_fixed',
            feedback:'A fixed timer replaces judgement with a clock. Restart on conditions, not on time.' }
        ] },
      end_good:{ title:'A controlled restart', end:true, outcome:'good', effect:'restart',
        text:'The set restarts with a message from the artist about looking after each other. Density stays manageable and the pit team is back to routine work. The stop cost twelve minutes and no one was seriously hurt.',
        ref:'HSE (2000) HSG154; Event Industry Forum (2026) The Purple Guide; Still (2014).' },
      end_bad:{ title:'Crowd collapse', end:true, outcome:'poor', effect:'crush',
        text:'The front of the crowd went down left of centre. Medics are working in the pit and the show has stopped anyway, now as a major incident. The pattern here, waiting or adding force instead of stopping and communicating, recurs in inquiries into front-of-stage disasters.',
        ref:'Still (2014); HSE (2000) HSG154.' },
      end_commercial:{ title:'Back to the surge', end:true, outcome:'poor', effect:'resurge',
        text:'The restart came before the front had settled and the surge began again within minutes. Event control has to stop the show a second time, with less goodwill from the crowd and the artist.',
        ref:'Event Industry Forum (2026) The Purple Guide.' },
      end_fixed:{ title:'Restart by the clock', end:true, outcome:'poor', effect:'resurge',
        text:'Ten minutes passed but the front had not fully cleared. The restart pulled people forward into a zone that was still dense.',
        ref:'Still (2014).' },
      end_cancel:{ title:'Unplanned mass egress', end:true, outcome:'poor', effect:'cancel',
        text:'The field emptied towards the gates all at once. No one was hurt at the front, but the routes and the campsite gate became the new pinch points, and you spent the next hour managing them.',
        ref:'HSE (2000) HSG154.' }
    } }
  ],

  tutor:{
    name:'Events tutor',
    greeting:"Hi. I'm the events tutor for this case. You're looking at a festival main-stage field. Ask me about crowd safety, operations, welfare, the servicescape or the audience experience, or about any quiz question.",
    suggestions:[
      'How would you plan the egress after the headliner?',
      'What could go wrong in this field on a very hot day?',
      'How do safety and experience pull against each other here?'
    ],
    brief:[
      'You are a tutor for events management students at the University of the West of Scotland.',
      "The case is a stylised 3D model of the Pyramid Stage field at Glastonbury Festival (Worthy Farm, Pilton, Somerset). It is a representative layout for teaching, not an official plan: stage, front-of-stage barrier and pit, crowd, delay towers with screens, front-of-house mix position, accessible viewing platform, merchandise stall, water refill point, long-drop toilets and urinal screen, food vans, bar marquee, first aid tent, backstage production, trackway service route, perimeter fence with gate, and a campsite.",
      'Facts you may use (as of October 2026): the first pyramid stage was built in 1971; a permanent stage from 1981 doubled as a cowshed and burned down shortly before the 1994 festival; the current stage was built for 2000, is 30 m tall on a 40 m by 40 m footprint and uses about 4 km of steel tubing; the largest single Pyramid crowd reported is about 120,000 (Elton John, 2023); the licence allows about 210,000 people on site; in 2024 some smaller areas (West Holts, Levels, IICON) had crowd problems and the festival sold a few thousand fewer tickets for 2025; there are more than 4,000 toilets including over 2,000 long drops and over 1,300 compost loos, and women\'s urinals near the Pyramid stage; single-use plastic bottles have not been sold since 2019 and there are hundreds of free refill points; there are more than 400 food stalls and over 100 bars; the perimeter fence is about 8 km long and a stronger fence was installed in 2002 after overcrowding and a fine in 2000; 2026 is a fallow year with no festival, to let the farm recover; Martyn\'s Law (Terrorism (Protection of Premises) Act 2025) received Royal Assent on 3 April 2025, the enhanced tier covers events of 800 or more, the regulator is the Security Industry Authority, and statutory guidance was published in April 2026.',
      'Core theory and guidance: Still (2014) crowd science and the DIM-ICE model; HSE (2000) Managing Crowds Safely (HSG154); the Purple Guide; Licensing Act 2003 and its four objectives; Regulatory Reform (Fire Safety) Order 2005; Equality Act 2010; Bitner (1992) servicescape; Pine and Gilmore (1999) experience economy; Turner (1969) liminality and communitas; Getz and Page (2016) event studies.',
      'How to answer: British English. Keep answers under 150 words unless the student asks for more. Be practical and rigorous; link theory to concrete operational decisions in this field. Use the facts above; if a student asks for a figure not listed, say you are not certain and suggest where to check. Cite sources as (Author, year) in Harvard style and only cite the works listed above or other well-known sources you are sure of; never invent references or statistics. End with one question that makes the student think.',
      'The model also contains a branching crowd-surge scenario (surge at the barrier, show stop, scripted "two steps back" message, restart only when the Safety Officer in event control confirms). If a student asks about it, discuss show-stop procedures, communication and decision authority, and help them reflect on their choices.',
      'Stay on this case and on events management. If asked about something unrelated, say briefly that you can only help with this case. Do not write assessed coursework for the student; help them think it through instead.'
    ].join(' ')
  }
};
