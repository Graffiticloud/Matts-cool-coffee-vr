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
const PETERSEN = 'Petersen, J.L. (1997) Out of the Blue: Wild Cards and Other Big Future Surprises. Arlington, VA: The Arlington Institute.';
const TALEB = 'Taleb, N.N. (2007) The Black Swan: The Impact of the Highly Improbable. New York: Random House.';
const KNIGHT = 'Knight, F.H. (1921) Risk, Uncertainty and Profit. Boston: Houghton Mifflin.';
const KURZWEIL = 'Kurzweil, R. (2005) The Singularity Is Near. New York: Viking.';
const INAYATULLAH = "Inayatullah, S. (1998) 'Causal layered analysis: poststructuralism as method', Futures, 30(8), pp. 815–829.";
const SARDAR = "Sardar, Z. (2010) 'Welcome to postnormal times', Futures, 42(5), pp. 435–444.";
const TETLOCK = 'Tetlock, P.E. and Gardner, D. (2015) Superforecasting: The Art and Science of Prediction. New York: Crown.';

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

  /* Time scrubber: the cone always opens from "now", so as now moves, ideas migrate between zones.
     Each idea's "at" has one entry per stop: "zone/horizon", "now" (it happens) or "past". These are illustrative readings. */
  timeline:{
    title:'Scrub through time',
    button:'Scrub through time',
    secondsPerStop:3.4,
    note:'The positions are illustrative judgements, not facts. The point: the cone is always drawn from a present, so ideas migrate as knowledge, trends and politics change, outwards as well as in (Voros, 2017).',
    suggestions:['Why did Mars move back outwards after 1969?', 'What moves an idea inwards in the cone?'],
    stops:[
      { year:1900, title:'Before flight', text:'No one has flown a powered aircraft: the Wright brothers are three years away. Going to the Moon belongs to Jules Verne. For most people every idea here is preposterous, out at the edge of the cone.' },
      { year:1945, title:'Rockets and computers', text:'The war ends. German V-2 rockets have already crossed into space and the first electronic computers are running. Spaceflight and thinking machines move from preposterous to possible: they still need knowledge we do not have.' },
      { year:1957, title:'Sputnik', text:'Sputnik 1 orbits the Earth in October and satellites stop being science fiction overnight. A year earlier the Dartmouth workshop named "artificial intelligence". Ideas jump inwards when the knowledge arrives.' },
      { year:1961, title:'A political commitment', text:'Yuri Gagarin orbits the Earth in April. In May, President Kennedy commits the US to a Moon landing before the decade is out. Politics and money, not physics, pull the Moon into the probable. AI pioneers promise human-level machines within a generation.' },
      { year:1969, title:'Apollo 11', text:'The Moon landing passes through "now" and into history. NASA plans a crewed Mars landing for the 1980s, so Mars looks probable. Early chatbots such as ELIZA look clever but shallow, and AI starts to drift outwards.' },
      { year:1990, title:'Ideas move outwards too', text:'Mars has slipped back to plausible: budgets and priorities changed, not physics. AI is in a funding "winter" and looks merely possible again. Mobile phones are bricks, but the pocket computer-phone is now a trend.' },
      { year:2007, title:'The iPhone', text:'The pocket computer-phone passes through "now" and becomes everyday life. Machine learning revives, so conversational machines move back to plausible. Humans on Mars stay plausible, as they have for decades.' },
      { year:2026, title:'Your present', text:'Generative AI chatbots are used by hundreds of millions of people: the conversational machine has passed through "now". Humans on Mars remain plausible and "twenty years away". Where would you put them, and what would move them?' }
    ],
    ideas:[
      { id:'moon', label:'Moon landing', color:0xffd34d, side:1, a:0.15, at:['preposterous/next', 'possible/next', 'plausible/next', 'probable/near', 'now', 'past', 'past', 'past'] },
      { id:'phone', label:'Pocket computer-phone', color:0x6ef0c2, side:-1, a:0.2, at:['preposterous/next', 'possible/next', 'possible/next', 'possible/next', 'plausible/next', 'probable/near', 'now', 'past'] },
      { id:'ai', label:'A machine you can talk to', color:0xc69bff, side:1, a:-0.45, at:['preposterous/next', 'possible/next', 'plausible/next', 'probable/next', 'plausible/next', 'possible/next', 'plausible/next', 'now'] },
      { id:'mars', label:'Humans on Mars', color:0xff8a5c, side:-1, a:-0.5, at:['preposterous/next', 'preposterous/next', 'possible/next', 'possible/next', 'probable/next', 'plausible/next', 'plausible/next', 'plausible/next'] }
    ]
  },

  /* Wildcards (Petersen, 1997) and critique mode are reflective scenarios: positions to take rather than right answers. */
  scenarios:[
    { id:'wildcards', title:'Wildcards', mode:'reflect', stepWord:'question', start:'w0',
      summary:'{best} of {n} of your readings matched the futurist reading. Wildcards are why the cone is drawn wide.',
      steps:{
        w0:{ title:'Trigger a wildcard', effect:'reset',
          text:'Wildcards are low-probability, high-impact events that change the direction of the future (Petersen, 1997). Choose one to trigger, then watch the bright beam of probable futures.',
          choices:[
            { label:'A new respiratory virus spreads around the world', next:'p1', effect:'wc-pandemic', tag:'Wildcard triggered',
              feedback:'A pandemic: a biological event that spreads through travel networks faster than institutions can respond.' },
            { label:'A Carrington-scale solar storm hits the power grids', next:'s1', effect:'wc-storm', tag:'Wildcard triggered',
              feedback:'A geomagnetic storm on the scale of the 1859 Carrington Event: a natural event that strikes the infrastructure everything else depends on.' },
            { label:'A room-temperature superconductor is confirmed', next:'u1', effect:'wc-super', tag:'Wildcard triggered',
              feedback:'A scientific breakthrough. Not every wildcard is a disaster: some open futures up.' }
          ] },
        p1:{ title:'The day before', effect:'pivot-down',
          text:'Within weeks, lockdowns close offices, campuses and borders, and the beam of probable futures swings to a new heading. The day before it hit, where did a global pandemic sit in the cone for most organisations?',
          choices:[
            { label:'Plausible: known, on risk registers, but treated as unlikely', best:true, next:'p2',
              feedback:'The strongest reading. Pandemics sat on national risk registers and in planning exercises for years: plausible, low-probability and high-impact. A textbook wildcard, or a "grey swan": foreseeable, but not prepared for (Taleb, 2007).' },
            { label:'Probable: everyone expected it', next:'p2',
              feedback:'Experts did warn for years, but organisations did not plan as if it were likely. The gap between expert warnings and everyday expectation is itself a futures problem.' },
            { label:'Preposterous: no one could have imagined it', next:'p2',
              feedback:'This is the hindsight story, and the evidence does not support it: pandemics were widely imagined and modelled. Calling one unimaginable lets organisations off the hook for not preparing.' }
          ] },
        p2:{ title:'After the shock', effect:'widen',
          text:'Months later, remote work, online teaching and vaccine development have moved years ahead. The cone now opens from a different present. What happened to the projected future of early 2020?',
          choices:[
            { label:'It became a counterfactual: the cone re-formed from the new present', best:true, next:'wend',
              feedback:'Yes. The projected future is always drawn from now, so a wildcard does not just shift one forecast; it moves the apex. Old projections become a "what would have happened".' },
            { label:'It was delayed by a year or two', next:'wend',
              feedback:'Some trends did resume, but others, such as remote work and digital learning, jumped years ahead and never went back. Treating a wildcard as a pause underestimates it.' },
            { label:'Nothing changed in the long run', next:'wend',
              feedback:'Long-run drivers such as ageing and climate did carry on. But uncertainty rose sharply, which is why the beam is now wider: the cone itself changed shape.' }
          ] },
        s1:{ title:'The day before', effect:'pivot-hard',
          text:'Transformers fail, satellites drop out and GPS timing errors ripple through payments and logistics. The day before, where did a storm like this sit for most businesses?',
          choices:[
            { label:'Plausible: well documented and on national risk registers, but ignored by most firms', best:true, next:'s2',
              feedback:'The strongest reading. Severe space weather is on the UK National Risk Register, and a smaller storm blacked out Quebec in 1989. Known physics, low probability, huge impact: a wildcard.' },
            { label:'Possible: it needs knowledge we do not have', next:'s2',
              feedback:'We already know the physics: the Carrington Event happened in 1859. Nothing new is needed for it to happen again, so it is plausible rather than merely possible.' },
            { label:'Preposterous: the sun is too stable to worry about', next:'s2',
              feedback:'The record says otherwise. Dismissing a documented hazard as preposterous is exactly the judgement the Clarke–Dator edge asks us to question.' }
          ] },
        s2:{ title:'Which futures move?', effect:'widen',
          text:'After weeks of repairs, supply chains, satellite services and insurance markets are shaken. Which part of the cone moves most?',
          choices:[
            { label:'The preferable: resilience suddenly matters more than efficiency', best:true, next:'wend',
              feedback:'A strong reading. Wildcards move values as well as probabilities: redundancy, local energy and backups become what people want, and that reshapes the green lobe.' },
            { label:'The probable: trends in digital dependence bend', next:'wend',
              feedback:'Also defensible. But trends tend to resume once systems are repaired; what lasts is a change in what people are willing to pay for.' },
            { label:'Nothing: once repaired, things return to normal', next:'wend',
              feedback:'Infrastructure can be repaired in weeks; trust and insurance pricing take years. "Back to normal" is usually a new normal.' }
          ] },
        u1:{ title:'The day before', effect:'pivot-up',
          text:'Labs on three continents confirm a material that superconducts at room temperature and normal pressure. (A 2023 claim, LK-99, collapsed within weeks, so this is hypothetical.) Where did it sit the day before?',
          choices:[
            { label:'Possible: it needed knowledge we did not have', best:true, next:'u2',
              feedback:'The strongest reading. No known material did this and no theory showed how to make one, so it needed new knowledge. A positive wildcard.' },
            { label:'Plausible: current physics already showed how', next:'u2',
              feedback:'Physics did not rule it out, but no one knew how to make it. That is the line between plausible (current knowledge) and possible (future knowledge).' },
            { label:'Preposterous: it breaks the laws of physics', next:'u2',
              feedback:'Some physicists said so. This is where Dator\'s law bites: useful ideas about the future often look ridiculous at first.' }
          ] },
        u2:{ title:'The edge moves', effect:'widen',
          text:'Within a decade, lossless power lines and cheap, powerful magnets are on the drawing board. What happens at the Clarke–Dator edge?',
          choices:[
            { label:'Ideas cross inwards: things once dismissed now look plausible', best:true, next:'wend',
              feedback:'Yes. One breakthrough drags others across the edge: maglev transport, compact fusion, new kinds of computer. The two-way arrows on the membrane show this traffic.' },
            { label:'The edge stays put: only engineering changed', next:'wend',
              feedback:'Engineering is knowledge too. When what we know changes, the line between possible and preposterous moves with it.' },
            { label:'Everything becomes probable', next:'wend',
              feedback:'Knowledge makes things plausible; trends, money and politics make them probable. The Moon landing needed Kennedy, not just rockets.' }
          ] },
        wend:{ title:'Wildcards keep the cone wide', end:true, effect:'calm',
          text:'Petersen (1997) argued that organisations should scan for wildcards precisely because they sit outside the probable beam. Planning only for the bright centre is planning for the one future least likely to arrive intact. Run it again with another wildcard.',
          ref:'Petersen (1997); Taleb (2007); Voros (2017).' }
      } },

    { id:'critique', title:'Critique the cone', mode:'reflect', stepWord:'critique', start:'c1',
      steps:{
        c1:{ title:'Change is not steady', effect:'crit-exp',
          text:'The cone opens steadily, like a headlight beam. But computing, genomics and AI often look slow for decades and then sudden. If change is exponential, the cone flares (amber). How serious is this for the cone?',
          choices:[
            { label:'Fatal: a linear picture misleads us about fast technologies', next:'c2', tag:'Your position, tested',
              feedback:'Strong if you study AI or synthetic media: Kurzweil (2005) makes the exponential case. But the cone maps our judgements, not the rate of change, and it can be drawn at any width. Is the flaw in the diagram, or in how we use it?' },
            { label:'Serious but fixable: redraw the cone often, from each new present', next:'c2', tag:'Your position, tested',
              feedback:'This is close to Voros\'s own defence: a thinking tool to redraw, not a forecast. The counter: if you must redraw it constantly, what does the diagram add beyond "expect surprise"?' },
            { label:'Overstated: most social change is slow and incremental', next:'c2', tag:'Your position, tested',
              feedback:'Institutions, habits and laws often do change slowly, and hype inflates exponential curves. The counter: the cases that matter most for strategy are often precisely the fast ones.' }
          ] },
        c2:{ title:'Chaos and tipping points', effect:'crit-chaos',
          text:'The projected line implies one smooth path. Complex systems instead hit tipping points, where small differences produce very different futures. The line forks into branches. What follows?',
          choices:[
            { label:'Use several scenarios, not a single projected line', next:'c3', tag:'Your position, tested',
              feedback:'Scenario planning lives in the plausible zone for exactly this reason. The counter: scenarios still select a handful of branches. Who chooses which forks count, and which get pruned?' },
            { label:'Keep the projected line, but only as a baseline to argue against', next:'c3', tag:'Your position, tested',
              feedback:'Voros introduces the cone from the projected outwards for this reason. The counter: baselines become anchors, and organisations quietly plan for business as usual anyway.' },
            { label:'Forecasting is pointless: only adaptability matters', next:'c3', tag:'Your position, tested',
              feedback:'A Taleb-style position (Taleb, 2007). The counter: adapting still means anticipating something, and futures studies already separates foresight from prediction.' }
          ] },
        c3:{ title:'Whose present?', effect:'crit-obs',
          text:'The cone has one apex: one "now" and one observer. A refugee, a venture capitalist and an Indigenous elder do not share a present, let alone a projected future. Two other cones appear. What does this expose?',
          choices:[
            { label:'Power: whoever draws the cone defines what counts as realistic', next:'c4', tag:'Your position, tested',
              feedback:'A poststructuralist reading: futures are contested, and "probable" can naturalise one group\'s interests (Inayatullah, 1998). The counter: if every cone is partial, can we still compare futures and act?' },
            { label:'Plurality: draw many cones and compare them', next:'c4', tag:'Your position, tested',
              feedback:'The case for participatory foresight. The counter: someone still aggregates the cones, and averaging them can erase the very conflicts that matter.' },
            { label:'Overstated: the cone is a neutral tool anyone can use', next:'c4', tag:'Your position, tested',
              feedback:'Anyone can draw one, true. The counter: tools carry assumptions (linear time, a single observer, a stable present) that Sardar (2010) argues break down in "postnormal times".' }
          ] },
        c4:{ title:'The limits of probability', effect:'crit-fog',
          text:'To call a future probable you need a list of outcomes to assign odds to. In open systems we often have no such list: Knight (1921) called this uncertainty rather than risk. The beam dissolves into fog. What should we do with the probable zone?',
          choices:[
            { label:'Keep it, but label it as judgement, not measurement', next:'cend', tag:'Your position, tested',
              feedback:'A pragmatic middle way that keeps the cone usable. The counter: labels fade, and a number on a slide still reads as fact in a boardroom.' },
            { label:'Drop the numbers and work with plausibility instead', next:'cend', tag:'Your position, tested',
              feedback:'Many scenario planners take this line. The counter: decision-makers must still rank options, and refusing numbers can hide judgement rather than expose it.' },
            { label:'Keep the numbers: forecasting can be trained', next:'cend', tag:'Your position, tested',
              feedback:'Tetlock and Gardner (2015) show calibrated forecasters beat chance on questions a year or so ahead. The counter: accuracy falls away over longer horizons, which is where the cone matters most.' }
          ] },
        cend:{ title:'Your critique', end:true, effect:'crit-off',
          text:'You have stress-tested the cone from four angles. Voros\'s defence is that it is a thinking tool drawn from a present, not a map of time. Decide whether that defence holds for the technologies you study, and bring your answer to the seminar.',
          ref:'Knight (1921); Inayatullah (1998); Kurzweil (2005); Taleb (2007); Sardar (2010); Tetlock and Gardner (2015); Voros (2017).' }
      } }
  ],

  hotspots:[
    { id:'sort', n:'✦', title:'Sort the futures', pos:[CONE.apex[0], Y + 2.1, 0], sorter:true, concept:'applying the cone to real claims about the future',
      blurb:'Place sixteen future statements in the cone yourself, say whether you would want each one, then compare your map with a futurist reading and with your cohort.' },
    { id:'time', n:'⟳', title:'Scrub through time', pos:[CONE.apex[0] - 1.8, Y - 1.6, 0.3], timeline:true, concept:'how ideas migrate between zones over time',
      blurb:'Move the present from 1900 to today and watch the Moon landing, the smartphone, talking machines and Mars migrate through the cone, outwards as well as in.' },
    { id:'wild', n:'!', title:'Wildcards', pos:[-2.6, Y + 3.9, 0.4], scenario:'wildcards', concept:'wildcards: low-probability, high-impact events',
      blurb:'Trigger a pandemic, a solar storm or a scientific breakthrough and watch the beam of probable futures swing.' },
    { id:'crit', n:'!', title:'Critique the cone', pos:[-2.6, Y - 3.9, 0.4], scenario:'critique', concept:'critiques of the futures cone',
      blurb:'Four critiques, each shown as a deformation of the cone. Take a position on each and meet the strongest counter-argument.' },
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
      'Drop B features: a time scrubber (1900, 1945, 1957, 1961, 1969, 1990, 2007, 2026) showing the Moon landing, the pocket computer-phone, a machine you can talk to and humans on Mars migrating between zones, outwards as well as in; a Wildcards scenario (pandemic, Carrington-scale solar storm, room-temperature superconductor; Petersen, 1997; Taleb, 2007); and a Critique scenario with no right answers (exponential change, Kurzweil, 2005; chaos and tipping points; whose present, Inayatullah, 1998, Sardar, 2010; risk versus uncertainty, Knight, 1921, and calibrated forecasting, Tetlock and Gardner, 2015).',
      'The card sort has no right answers. When a student asks about a placement, help them name the knowledge, trends and values behind it, compare it with the futurist reading shown, and consider how someone with different knowledge or values would place it.',
      'How to answer: British English. Under 150 words unless asked for more. Be Socratic and give both sides of contested claims about the future. Cite as (Author, year) in Harvard style, using only the works above or well-known sources you are sure of. Never invent references or statistics. End with one question that makes the student think.',
      'Stay on futures thinking and this model. Do not write assessed coursework for the student; help them think it through instead.'
    ].join(' ')
  }
};
