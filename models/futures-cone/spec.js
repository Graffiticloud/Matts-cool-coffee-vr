/* The Futures Cone: a generic futures-studies primer (after Henchey, 1978; Hancock and Bezold, 1994; Voros, 2003, 2017).
   Pins sit beside each zone's label at the open end of the cone. The card sort uses the cone geometry in cone.js. */
import { CONE } from './cone.js';

const VOROS_BLOG = "Voros, J. (2017) 'The futures cone, use and history', The Voroscope, 24 February. Available at: https://thevoroscope.com/2017/02/24/the-futures-cone-use-and-history/ (Accessed: 23 October 2026).";
const VOROS03 = "Voros, J. (2003) 'A generic foresight process framework', Foresight, 5(3), pp. 10–21.";
const HENCHEY = "Henchey, N. (1978) 'Making sense of futures studies', Alternatives, 7(2), pp. 24–28.";
const HB = "Hancock, T. and Bezold, C. (1994) 'Possible futures, preferable futures', Healthcare Forum Journal, 37(2), pp. 23–29.";
const DATOR = "Dator, J.A. (2005) 'Foreword', in Slaughter, R.A., Inayatullah, S. and Ramos, J.M. (eds) The Knowledge Base of Futures Studies. Professional CD-ROM edn. Brisbane: Foresight International.";
const TAYLOR = 'Taylor, C.W. (1990) Creating Strategic Visions. Carlisle Barracks, PA: Strategic Studies Institute, US Army War College.';
const AMARA = "Amara, R. (1981) 'The futures field: searching for definitions and boundaries', The Futurist, 15(1), pp. 25–29.";

const X = 9.3, Y = CONE.apex[1];

export const spec = {
  id:'futures-cone',
  title:'The Futures Cone',
  subtitle:'Possible, plausible, probable',
  module:'Futures studies primer · thinking about alternative futures with the futures cone',
  moduleCode:'FUTURES',
  background:0x060912,
  post:false,   // no ambient occlusion or post-processing: the glow shaders and labels need untouched colour
  exposure:1.0,
  hemi:0.6,
  sun:0.4,
  catcherY:-40,
  ground:0,
  target:[1.2, 2.4, 0],
  fit:12.5,
  camAz:0.0,
  camEl:0.18,
  shadowHalf:24,
  pinSize:0.62,
  privacy:'Your student number, quiz answers and card-sort judgements are saved to a UWS Google Sheet so your lecturer can see how the cohort is doing. Questions you ask the AI tutor are sent to an AI service without your student number. You can retake the quiz and re-sort the cards as often as you like.',

  /* Synthetic Matt guide: a 30-second green-screen clip saved as intro.mp4 in this folder. Until the file exists, no guide appears. */
  intro:{ src:'./intro.mp4', title:'Synthetic Matt', key:0x00ff00, similarity:0.16, smoothness:0.08, xr:{ pos:[-1.15, 1.32, -1.55], height:1.05 } },

  views:[
    { name:'Tabletop', s:0.045, yaw:0, anchor:[1.2, 2.4, 0], at:[0, 1.15, -0.8] },
    { name:'Room scale', s:0.13, yaw:0, anchor:[1.2, 2.4, 0], at:[0, 1.45, -2.4] },
    { name:'Stand at now', s:1.0, yaw:Math.PI / 2, anchor:[CONE.apex[0], CONE.apex[1], 0], at:[0, 1.55, -0.6] }
  ],

  sorter:{
    title:'Sort the futures',
    button:'Sort the futures',
    instructions:'Click inside the cone where you judge this future sits. The further from the bright centre line, the less likely you think it is; the further from now, the later. Then say whether you would want it.',
    closing:'Voros reminds us these are judgements made from the present: ideas migrate between zones as knowledge, trends and values change.',
    cone:CONE,
    cards:[
      { id:'k1', text:'Most UK university students use generative AI in their studies.', reading:{ zone:'projected', horizon:'now', why:'Use is already widespread, so this is business as usual continuing: the default, extrapolated future.' } },
      { id:'k2', text:'Smartphones remain most people\'s main personal device.', reading:{ zone:'projected', horizon:'near', why:'Nothing in current trends displaces them in the next few years, so the baseline simply carries on.' } },
      { id:'k3', text:'Holograms or avatars of dead artists headline major concert tours.', reading:{ zone:'probable', horizon:'near', why:'Avatar and hologram shows already tour; scaling them up is a trend, not a leap.' } },
      { id:'k4', text:'Global warming passes 1.5°C above pre-industrial levels as a long-term average.', reading:{ zone:'probable', horizon:'near', why:'Current emissions trends make this likely; it is an un-preferred future for most people, which is a separate judgement.' } },
      { id:'k5', text:'The Bank of England issues a digital pound.', reading:{ zone:'plausible', horizon:'near', why:'The design work and consultations exist, but no decision has been made, so it could happen rather than is likely.' } },
      { id:'k6', text:'The UK reaches net zero emissions by 2050.', reading:{ zone:'plausible', horizon:'next', why:'It is a legal target with feasible pathways, but current trends fall short, so many would not yet call it probable.' } },
      { id:'k7', text:'Scotland introduces a universal basic income.', reading:{ zone:'plausible', horizon:'next', why:'Pilots and studies show it is workable with current knowledge; whether it happens is a political and value question.' } },
      { id:'k8', text:'Artificial general intelligence matches humans at most cognitive work.', reading:{ zone:'plausible', horizon:'next', why:'Deeply contested: some place it as probable within a decade, others as merely possible. Where you put it shows whose trends you trust.' } },
      { id:'k9', text:'Quantum computers break today\'s RSA-2048 encryption.', reading:{ zone:'plausible', horizon:'next', why:'Known physics allows it, but the engineering does not yet exist and estimates of when vary widely.' } },
      { id:'k10', text:'Brain–computer interfaces become as common as smartwatches.', reading:{ zone:'plausible', horizon:'next', why:'Implants and headsets exist, but mass adoption depends on safety, regulation and demand that are far from settled.' } },
      { id:'k11', text:'Mixed-reality glasses replace smartphones for most people.', reading:{ zone:'plausible', horizon:'next', why:'The technology works; whether people want to wear it all day is the open question.' } },
      { id:'k12', text:'People live permanently on Mars.', reading:{ zone:'plausible', horizon:'next', why:'Known engineering could get people there; permanent settlement is far beyond current trends and raises huge questions of cost and survival.' } },
      { id:'k13', text:'Human lifespans routinely exceed 150 years.', reading:{ zone:'possible', horizon:'next', why:'It would need biological knowledge we do not yet have, so it might happen rather than could.' } },
      { id:'k14', text:'A spacecraft travels faster than light.', reading:{ zone:'possible', horizon:'next', why:'Voros\'s own example of a possible future: it needs physics we do not have yet.' } },
      { id:'k15', text:'People teleport from city to city, as in Star Trek.', reading:{ zone:'preposterous', horizon:'next', why:'Most scientists would say it breaks what we know about matter and information. Clarke and Dator would warn against dismissing it too quickly.' } },
      { id:'k16', text:'Time travel into the past becomes possible.', reading:{ zone:'preposterous', horizon:'next', why:'For most people this is the definition of "won\'t ever happen". The Moon landing once sat here too.' } }
    ]
  },

  hotspots:[
    { id:'sort', n:'✦', title:'Sort the futures', pos:[CONE.apex[0], Y + 2.1, 0], sorter:true, concept:'applying the cone to real claims about the future',
      blurb:'Place sixteen future statements in the cone yourself, say whether you would want each one, then compare your map with a futurist reading and with your cohort.' },
    { id:'potential', n:1, title:'Potential futures', pos:[X, Y - 6.4, 0.3], concept:'the open future',
      blurb:'Everything beyond the present moment: the whole space of futures, including ones nobody has imagined yet. It rests on the axiom that the future is open, not fixed.' },
    { id:'preposterous', n:2, title:'Preposterous futures', pos:[X, Y + 6.3, 0.3], concept:'the preposterous and the limits of imagination',
      blurb:'Futures we judge ridiculous or impossible: "won\'t ever happen!" Voros added this class to capture the strength of people\'s rejection of some ideas.' },
    { id:'edge', n:3, title:'The Clarke–Dator edge', pos:[6.45, Y + 5.5, 0.4], concept:'the boundary between possible and preposterous',
      blurb:'The shimmering membrane and two-way arrows mark the boundary between what we accept as possible and what we dismiss as preposterous. Ideas cross it in both directions over time.' },
    { id:'possible', n:4, title:'Possible futures', pos:[X, Y + 4.3, 0.3], concept:'possible futures and future knowledge',
      blurb:'Futures that "might" happen, based on knowledge we do not yet have, such as a warp drive.' },
    { id:'plausible', n:5, title:'Plausible futures', pos:[X, Y + 2.7, 0.3], concept:'plausible futures and current knowledge',
      blurb:'Futures that "could" happen, based on our current understanding of how the physical and social world works. Scenario planning mostly lives here.' },
    { id:'probable', n:6, title:'Probable futures', pos:[X, Y - 0.6, 0.3], concept:'probable futures and trend extrapolation',
      blurb:'Futures that are "likely to" happen, usually based on current trends and often expressed as numbers. The bright inner beam.' },
    { id:'projected', n:7, title:'The projected future', pos:[X, Y + 0.75, 0.3], concept:'the business-as-usual baseline',
      blurb:'The single default future: current dynamics extrapolated, "business as usual". Voros calls it the most probable of the probable.' },
    { id:'preferable', n:8, title:'Preferable and un-preferred', pos:[X, Y - 2.8, 0.3], concept:'normative futures and value judgements',
      blurb:'Futures that "should" or "should not" happen. These are value judgements, not knowledge claims, so the green and red lobes cut across the other zones.' }
  ],

  /* Answers, explanations and references are not published: the Worker marks answers against the private key. */
  questions:[
    {"id":"f1","hotspot":"potential","q":"Voros's broadest class, \"potential\" futures, rests on which foundational assumption of futures studies?","options":["The future is open rather than fixed or predetermined","The future can be calculated from present trends with enough data","The future is set by the preferences of today's decision-makers","The future repeats the past in long and predictable historical cycles"]},
    {"id":"f2","hotspot":"potential","q":"Why do some futures lie outside even the outer edge of the cone?","options":["Nobody has imagined them yet, so they cannot be classified","Science has proven them impossible, so they are excluded","Only accredited experts are allowed to consider them seriously","They are past events that have already moved into history"]},
    {"id":"f3","hotspot":"preposterous","q":"Why did Voros add the class of \"preposterous\" futures to the cone?","options":["The old outer edge did not capture people's strong rejection of some ideas as impossible","Futurists needed a separate category for predictions that later turned out to be false","Policy makers asked for a class of futures that they could safely ignore","Probability models could not assign numbers to very distant futures"]},
    {"id":"f4","hotspot":"preposterous","q":"The preposterous class honours a \"law\" attributed to the futurist Jim Dator. Which one?","options":["Any useful idea about the future should appear to be ridiculous","The future cannot be predicted, but futures can be studied","The best way to predict the future is to invent it yourself","Sufficiently advanced technology is indistinguishable from magic"]},
    {"id":"f5","hotspot":"edge","q":"What does the Clarke–Dator discontinuity mark on the cone?","options":["The boundary between what we judge possible and what we dismiss as preposterous","The point at which a forecast's probability falls to exactly zero","The line that separates the futures that we want from the futures that we fear most","The moment when a projected future finally becomes part of the past"]},
    {"id":"f6","hotspot":"edge","q":"Voros notes that the Moon landing moved from \"preposterous\" to \"projected\" and then into history. What does this show?","options":["The categories are judgements made from a present moment, so ideas migrate","The categories are fixed properties of events, discovered by careful research","The categories only apply to space technology, not to social change","Every preposterous idea is shown to come true if we wait long enough"]},
    {"id":"f7","hotspot":"possible","q":"Possible futures \"might\" happen. What are they based on?","options":["Future knowledge we do not yet have","Current scientific knowledge of the world","Present trends extended by statistical models","The values of the people imagining them"]},
    {"id":"f8","hotspot":"possible","q":"Which of these is best described as possible but not plausible?","options":["Faster-than-light travel, if new physics shows a way","UK electric car sales overtaking petrol cars by 2030","A four-day working week adopted by many large UK employers","Smartphone ownership rising slowly in every country"]},
    {"id":"f9","hotspot":"plausible","q":"What distinguishes plausible futures from possible ones?","options":["They fit our current understanding of how the world works","They have a calculated probability of more than fifty per cent","They are the futures most people say they would prefer","They rely on breakthroughs science has not yet made"]},
    {"id":"f10","hotspot":"plausible","q":"Taylor (1990) drew a \"cone of plausibility\" before Hancock and Bezold's futures cone. What did his version include?","options":["An explicit timeframe and a back-cone extending into the past","A category for preposterous futures beyond the merely possible","Separate lobes for preferable and un-preferred futures","A single projected line marking business as usual"]},
    {"id":"f11","hotspot":"probable","q":"Probable futures are \"likely to happen\". On what are they usually based?","options":["Current trends, often expressed in quantitative forecasts","Expert intuitions about technological breakthroughs not yet achieved","Shared values about the kind of world people want","Analogies with the rise and fall of past civilisations"]},
    {"id":"f12","hotspot":"probable","q":"A critic in the comments on Voros's article argues that probabilities need all outcomes known in advance. What risk does he identify?","options":["Managers treat consultants' probability estimates as fact and gain false confidence","Forecasters refuse to give any numbers at all, so their plans cannot be costed properly","Probable futures always turn out more pessimistic than preferable ones","Organisations spend too much time imagining preposterous futures"]},
    {"id":"f13","hotspot":"projected","q":"What is the projected future in Voros's cone?","options":["The single default extrapolation of current dynamics","The future an organisation commits to in its strategy","The most desirable outcome agreed by stakeholders","Any future shown on a screen or in a model"]},
    {"id":"f14","hotspot":"projected","q":"Voros briefly used a class of \"predicted\" futures, then dropped it. Why?","options":["Claiming what \"will\" happen narrows the openness futures thinking tries to keep","Prediction markets showed that predicted futures were rarely accurate","Predicted futures turned out to be identical to probable futures in every single case","Students found the word \"predicted\" too technical to use in class"]},
    {"id":"f15","hotspot":"preferable","q":"How do preferable futures differ from the other classes in the cone?","options":["They rest on value judgements about what should happen","They rest on the most reliable data about what will happen","They always sit close to the business-as-usual line","They are limited to futures that experts consider feasible"]},
    {"id":"f16","hotspot":"preferable","q":"In Voros's account, where in the cone can preferred futures sit?","options":["Anywhere from projected to preposterous, because values differ","Only inside the probable zone, because they must be realistic","Only outside the cone, because ideals lie beyond knowledge","Only on the projected line, because that is where public policy aims"]}
  ],

  tutor:{
    name:'Futures tutor',
    greeting:"Hi. I'm the futures tutor. You're looking at the futures cone: possible, plausible, probable, projected, preferable and preposterous futures opening out from now. Ask me about any zone, the history of the cone, how to use it, or why you placed a card where you did.",
    suggestions:[
      'What is the difference between possible and plausible?',
      'Why is the preferable not a knowledge claim?',
      'What are the limits of the futures cone?'
    ],
    brief:[
      'You are a futures-studies tutor at the University of the West of Scotland. The model is a 3D futures cone used as a primer across modules (marketing, AI for business, Business in an Age of Acceleration).',
      'The cone: potential futures (everything beyond the present, the open future); preposterous ("impossible", "won\'t ever happen"); possible (might happen; future knowledge); plausible (could happen; current knowledge); probable (likely to happen; current trends); projected (the single business-as-usual baseline, the most probable of the probable); preferable and un-preferred (should / should not happen; value judgements, which cut across the other zones). The Clarke–Dator discontinuity is the boundary between possible and preposterous (Clarke\'s second law; Dator\'s second law that useful ideas about the future should appear ridiculous). Wildcards (Petersen, 1997) are low-probability, high-impact events. Voros dropped a "predicted" class because it narrows openness. The time axis is labelled Now, Near and Next.',
      'History: Henchey (1978) gave possible, plausible, probable and preferable; Taylor (1990) drew a cone of plausibility with an explicit timeframe, a back-cone into the past and wildcards; Hancock and Bezold (1994) drew the futures cone; Amara (1981) and Bell (1997) set out the possible, probable and preferable; Voros used the cone from 2000 and extended it (Voros, 2003, 2017). Voros uses it in the prospection phase of his generic foresight process and introduces it from projected outwards to preposterous, to open thinking up.',
      'Critiques to raise when relevant: the categories are subjective judgements made from a present (the Moon landing moved from preposterous to projected to history); the "headlight" image implies linear time and a single observer, while change can be exponential, chaotic or full of phase transitions; probabilities assume all outcomes are known; and whose present, whose projected future and whose preferences get to define the cone.',
      'The card sort has no right answers. When a student asks about a placement, help them name the knowledge, trends and values behind it, compare it with the futurist reading shown, and consider how someone with different knowledge or values would place it.',
      'How to answer: British English. Under 150 words unless asked for more. Be Socratic and give both sides of contested claims about the future. Cite as (Author, year) in Harvard style, using only the works above or well-known sources you are sure of. Never invent references or statistics. End with one question that makes the student think.',
      'Stay on futures thinking and this model. Do not write assessed coursework for the student; help them think it through instead.'
    ].join(' ')
  }
};
