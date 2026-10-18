/* La Sagrada Família from the towers: a 360° photo case for BAA (BUSN10060).
   Hotspot positions are pixel coordinates on the 2576 × 1288 equirectangular photo. */
const ARA = "Grau del Cerro, X. (2026) 'The Sagrada Família's finances: €135M turnover and 1,600 jobs', Ara, 5 June. Available at: https://en.ara.cat/economy/the-sagrada-familia-s-finances-135m-turnover-and-1-600-jobs_1_5759214.html (Accessed: 18 October 2026).";
const DOMUS = "Bonvicini, I. (2026) 'The Sagrada Família seems finished. But the project to complete it involves new demolitions in Barcelona', Domus, 18 July. Available at: https://www.domusweb.it/en/news/2026/07/15/sagrada-familia-completion-demolitions-barcelona.html (Accessed: 18 October 2026).";
const TRAVEL = "Travel Extra (2026) 'Sagrada Familia records nearly 4.9m visitors in 2025'. Available at: https://www.travelextra.ie/sagrada-familia-records-nearly-4-9m-visitors-in-2025/ (Accessed: 18 October 2026).";
const UNESCO = 'UNESCO World Heritage Centre (2005) Works of Antoni Gaudí. Available at: https://whc.unesco.org/en/list/320 (Accessed: 18 October 2026).';

export const spec = {
  id:'sagrada-360',
  type:'pano',
  title:'La Sagrada Família',
  subtitle:'From the towers',
  module:'BAA · Business in an Age of Acceleration (BUSN10060) · heritage, tourism and commerce case',
  moduleCode:'BUSN10060',
  pinSize:0.55,
  pano:{ src:'./pano.jpg', width:2576, height:1288, start:[1481, 541], fov:75, pinRadius:8 },
  privacy:'Your student number and quiz answers are saved to a UWS Google Sheet so your lecturer can see how the cohort is doing and follow up with support. Questions you ask the AI tutor are sent to an AI service without your student number. You can retake the quiz as often as you like.',

  hotspots:[
    { id:'history', n:1, title:'A building begun in 1882', px:[1288, 300], concept:'heritage and the Gaudí legacy',
      blurb:'A stone bell tower with louvred openings, one of the towers visitors climb. Work began in 1882; Gaudí took over in 1883 and worked on the basilica until his death in 1926.' },
    { id:'tower', n:2, title:'Still under construction', px:[1958, 300], concept:'event-led marketing of a mature attraction',
      blurb:'The central towers, still surrounded by cranes and scaffolding. In 2026 the Tower of Jesus Christ was topped out at 172.5 metres, but the Glory façade and four towers remain to be built.' },
    { id:'fruit', n:3, title:'The fruit pinnacles', px:[1687, 600], concept:'authenticity and commodification',
      blurb:'Colourful mosaic fruit pinnacles crown the nave: a signature motif that now appears on posters, souvenirs and millions of social media posts.' },
    { id:'city', n:4, title:'The view over Barcelona', px:[670, 640], concept:'overtourism and resident attitudes',
      blurb:"The Eixample grid stretches to the sea. Barcelona received about 15.7 million tourists in 2025 and has said 16 million is its limit." },
    { id:'gaze', n:5, title:'Everyone is taking photos', px:[2200, 560], concept:'the tourist gaze',
      blurb:'Visitors on the tower walkway photograph the view, the towers and themselves, then share the images across social media.' },
    { id:'access', n:6, title:'The tower doorway', px:[1314, 715], concept:'capacity and yield management',
      blurb:'A narrow doorway and spiral stairs lead back down. Tower access is sold as a timed add-on to a timed entry ticket, under safety netting overhead.' },
    { id:'money', n:7, title:'Who pays, who gains?', px:[2434, 390], concept:'business model and stakeholders',
      blurb:'A visitor route sign marks the way out. Ticket income now pays for the construction itself, while the neighbourhood around the basilica lives with the crowds.' }
  ],

  questions:[
    { id:'s1', hotspot:'history',
      q:'Construction began in 1882 under another architect. Why is Gaudí so closely identified with a building he neither started nor finished?',
      options:[
        'He took over in 1883, redesigned it far more ambitiously and devoted the rest of his life to it, so the vision is his',
        'He laid the first stone and completed the whole Nativity façade before 1900',
        'He drew the original Neo-Gothic plans in 1882',
        'He paid for the entire project from his own fortune'
      ],
      answer:0,
      explain:"Work began in 1882 to a Neo-Gothic design by Francisco de Paula del Villar. Gaudí took over in 1883, transformed the project and worked on it until his death in 1926, when only a fraction was built. His name, life story and style are now the core of the basilica's identity and its appeal to visitors.",
      ref:UNESCO },
    { id:'s2', hotspot:'history',
      q:"In 1936, during the Spanish Civil War, Gaudí's workshop was set on fire and many plans and plaster models were destroyed. Why does this matter for the basilica as heritage?",
      options:[
        'Later architects had to rebuild his intentions from fragments and interpretation, so critics debate how much of the finished building is truly Gaudí',
        'It made no difference, because Gaudí had left complete drawings for every part',
        'It forced the basilica to be redesigned in a fully Neo-Gothic style',
        'It led UNESCO to remove the basilica from the World Heritage List'
      ],
      answer:0,
      explain:"Much of what stands today was built decades after Gaudí's death, from surviving fragments, photographs and interpretation. That is why UNESCO's 2005 inscription covers only the Nativity façade and the crypt, the parts built in his lifetime, and why the rest is sometimes debated as 'authentic Gaudí'.",
      ref:UNESCO },

    { id:'s3', hotspot:'tower',
      q:'In February 2026 the cross was placed on the Tower of Jesus Christ, taking the basilica to 172.5 metres. What did this make the Sagrada Família?',
      options:[
        "The tallest church in the world, overtaking Germany's Ulm Minster",
        'The tallest building of any kind in Spain',
        "Fully complete, with every tower in Gaudí's plan built",
        'Taller than any building permitted in Barcelona since 1882'
      ],
      answer:0,
      explain:'The topping out made it the tallest church in the world. It is not finished: the Glory façade is still at an early stage, four of the eighteen planned towers remain to be built, and recent forecasts put completion of the structures around 2034.',
      ref:TRAVEL },
    { id:'s4', hotspot:'tower',
      q:"The Tower of Jesus Christ was blessed on 10 June 2026, exactly 100 years after Gaudí's death. Using Butler's (1980) tourism area life cycle, what does timing a milestone like this help a mature attraction to do?",
      options:[
        'Rejuvenate interest and media coverage, so the attraction avoids stagnation and decline',
        'Move back to the exploration stage with very few visitors',
        'Reduce visitor numbers to the level of the involvement stage',
        'Remove the need for any further investment'
      ],
      answer:0,
      explain:'Butler argues destinations move through exploration, involvement, development, consolidation and stagnation, after which they either decline or rejuvenate. A centenary and a record-breaking tower give a nearly 5-million-visitor attraction fresh reasons to come, and to come back.',
      ref:"Butler, R.W. (1980) 'The concept of a tourist area cycle of evolution: implications for management of resources', Canadian Geographer, 24(1), pp. 5–12." },

    { id:'s5', hotspot:'fruit',
      q:"MacCannell (1973) argued that tourists seek authenticity but are often shown a 'staged' version of it. Which part of a Sagrada Família visit best fits his idea of a staged back region?",
      options:[
        'Watching the model-making workshop and construction displays, presented as a behind-the-scenes look at how the basilica is made',
        'Paying for a ticket online',
        'Passing through the security check',
        'Reading the city tourist tax notice in a hotel'
      ],
      answer:0,
      explain:"MacCannell builds on Goffman's front and back regions. Tourists want to see 'real' backstage life, so attractions stage access to it. Displaying working models and construction as part of the visit turns the work itself into a spectacle.",
      ref:"MacCannell, D. (1973) 'Staged authenticity: arrangements of social space in tourist settings', American Journal of Sociology, 79(3), pp. 589–603." },
    { id:'s6', hotspot:'fruit',
      q:'The fruit pinnacles and towers are reproduced on fridge magnets, posters and phone cases sold all over the city. Which concept best describes heritage turned into products for sale?',
      options:['Disintermediation', 'Commoditisation', 'Gentrification', 'Vertical integration'],
      answer:1,
      explain:"Cohen examines how tourism turns cultural products into commodities valued for exchange. He argues commoditisation does not simply destroy meaning: new meanings can emerge for both hosts and visitors.",
      ref:"Cohen, E. (1988) 'Authenticity and commoditization in tourism', Annals of Tourism Research, 15(3), pp. 371–386." },

    { id:'s7', hotspot:'city',
      q:"Doxey's (1975) Irridex suggests residents' attitudes change as tourism grows. In what order do the stages run?",
      options:[
        'Euphoria, apathy, annoyance, antagonism',
        'Apathy, euphoria, antagonism, annoyance',
        'Annoyance, euphoria, apathy, antagonism',
        'Euphoria, annoyance, apathy, antagonism'
      ],
      answer:0,
      explain:"Residents move from welcoming visitors, to taking them for granted, to irritation, to open hostility. Barcelona's 2024 protests, with banners saying 'Tourists go home' and water pistols aimed at visitors, are often read as the antagonism stage.",
      ref:"Doxey, G.V. (1975) 'A causation theory of visitor-resident irritants: methodology and research inferences', in The Impact of Tourism: Sixth Annual Conference Proceedings of the Travel Research Association. San Diego, CA: Travel Research Association, pp. 195–198." },
    { id:'s8', hotspot:'city',
      q:'In April 2026 Barcelona nearly doubled its hotel tourist tax and moved towards much higher charges on short-stay cruise passengers. In economic terms, what is a tax like this mainly designed to do?',
      options:[
        'Make visitors pay for external costs they impose on residents, such as crowding and pressure on public services',
        'Increase the basilica’s own ticket income',
        'Attract more day-trippers into the city',
        'Pay for a new national airport'
      ],
      answer:0,
      explain:"This follows Pigou's logic of taxing negative externalities: costs that fall on third parties rather than on the buyer. Short-stay cruise visitors add crowds at sites like the Sagrada Família while spending little locally, which is why they are targeted.",
      ref:'Pigou, A.C. (1920) The Economics of Welfare. London: Macmillan.' },

    { id:'s9', hotspot:'gaze',
      q:'Nearly everyone on this walkway is photographing the view. How do Urry and Larsen (2011) describe the tourist gaze?',
      options:[
        'As socially organised: shaped by images circulating in media and social networks, which visitors then set out to reproduce',
        'As a purely individual and spontaneous way of looking',
        'As a legal right to photograph heritage sites',
        "As the attraction's security and surveillance system"
      ],
      answer:0,
      explain:"The gaze is learned. Visitors arrive knowing what the Sagrada Família 'should' look like from images they have already seen, photograph those same views, and feed them back into the circle of images that draws the next visitors.",
      ref:'Urry, J. and Larsen, J. (2011) The Tourist Gaze 3.0. London: Sage.' },
    { id:'s10', hotspot:'gaze',
      q:"Visitors' photos and posts reach millions of people at no cost to the basilica. Which term fits best?",
      options:['Paid media', 'Owned media', 'User-generated content acting as earned media', 'Below-the-line sales promotion'],
      answer:2,
      explain:'Mangold and Faulds describe social media as a hybrid part of the promotion mix, in which customers talk to one another about a brand. Here the visitors do the promotion, and the basilica neither pays for it nor fully controls it.',
      ref:"Mangold, W.G. and Faulds, D.J. (2009) 'Social media: the new hybrid element of the promotion mix', Business Horizons, 52(4), pp. 357–365." },

    { id:'s11', hotspot:'access',
      q:'Tickets cost roughly €26 to €40, are sold for timed entry slots, and tower access is an add-on. What would Kimes (1989) call this approach?',
      options:[
        'Yield management for a capacity-constrained service',
        'Cost-plus pricing',
        'Penetration pricing',
        'Loss-leader pricing'
      ],
      answer:0,
      explain:'Kimes shows yield management suits services with fixed capacity, perishable inventory and demand that can be segmented. A time slot on a narrow tower walkway cannot be stored, so selling slots in advance at different prices maximises revenue and controls crowding.',
      ref:"Kimes, S.E. (1989) 'Yield management: a tool for capacity-constrained service firms', Journal of Operations Management, 8(4), pp. 348–363." },
    { id:'s12', hotspot:'access',
      q:"Timed slots, audio guides and fast lifts let a visitor 'do' the basilica in a couple of hours before moving on. Which dimension of Rosa's (2013) social acceleration does this best show?",
      options:[
        'The acceleration of the pace of life: more experiences packed into less time',
        'The acceleration of social change',
        'Only technological acceleration, with no social effect',
        'A deceleration of tourism'
      ],
      answer:0,
      explain:'Rosa defines the pace of life by the number of actions or experiences per unit of time. Short city breaks that tick off icons in timed slots are a clear example, and the technology (online booking, lifts) is what makes that compression possible.',
      ref:'Rosa, H. (2013) Social Acceleration: A New Theory of Modernity. New York: Columbia University Press.' },

    { id:'s13', hotspot:'money',
      q:'In 2025 the basilica took about €134.5 million, around 97% of it from visitors, and spent just over half of its costs on construction. What kind of business model is this?',
      options:[
        'A visitor-funded model, in which tourism revenue pays for building the attraction itself',
        'A state-funded model paid for through national taxes',
        'A franchise model licensed to tour operators',
        'An advertising-funded model'
      ],
      answer:0,
      explain:"Once funded mainly by donations, the 'expiatory temple' is now financed almost entirely by its visitors. About 51.7% of its spending went on construction and 2.3% to an agreement with Barcelona City Council to offset the effects of tourism on the area.",
      ref:ARA },
    { id:'s14', hotspot:'money',
      q:"The planned monumental staircase could mean demolishing just over 200 homes, down from earlier estimates of about 1,000. Using Freeman's (1984) stakeholder approach, what is the core management problem?",
      options:[
        'Balancing the legitimate claims of groups with very different stakes, such as the temple, the City Council, residents and visitors',
        'Finding the cheapest building contractor',
        'Maximising ticket revenue whatever residents think',
        'Choosing a stone for the steps'
      ],
      answer:0,
      explain:'Freeman defines stakeholders as any group that can affect or is affected by an organisation. Here the temple wants to complete Gaudí’s design, residents want to keep their homes in the area, and the council must weigh housing rights against a global icon. No agreement had been reached by mid-2026.',
      ref:'Freeman, R.E. (1984) Strategic Management: A Stakeholder Approach. Boston, MA: Pitman.' }
  ],

  tutor:{
    name:'BAA tutor',
    greeting:"Hi. I'm the BAA tutor for this case. You're standing on one of the Sagrada Família's towers. Ask me about the basilica's history, tourism in Barcelona, or the business that has grown up around it, or about any quiz question.",
    suggestions:[
      'Is the Sagrada Família a victim or a cause of overtourism?',
      'How does this case link to an age of acceleration?',
      'Who are the main stakeholders and what does each want?'
    ],
    brief:[
      'You are a tutor for BAA: Business in an Age of Acceleration (BUSN10060, SCQF Level 10) at the University of the West of Scotland, a Graduate Apprenticeship module for working students.',
      "The case is a 360-degree photo taken by the lecturer on a tower walkway of La Sagrada Família, Barcelona, looking at the bell towers, the central towers under construction, the fruit pinnacles, the city view, tourists taking photos and the tower doorway.",
      'Facts you may use (as of October 2026): work began on 19 March 1882 under Francisco de Paula del Villar; Gaudí took over in 1883 and died on 10 June 1926; his workshop, plans and models were badly damaged by fire in 1936; UNESCO inscribed the Nativity façade and crypt in 2005 as part of the Works of Antoni Gaudí; Pope Benedict XVI consecrated it as a basilica in 2010; in February 2026 the cross was placed on the Tower of Jesus Christ at 172.5 m, making it the tallest church in the world; the tower was blessed on 10 June 2026, the centenary of Gaudí\'s death; the Glory façade and four towers remain, with structural completion forecast around 2034; visitors numbered about 4.7 million in 2023, 4.8 million in 2024 and almost 4.9 million in 2025; 2025 income was about €134.5 million, about 97% from visitors, with 51.7% of spending on construction and 2.3% on an agreement with the City Council; about 1,600 people work across the temple and its workshops; tickets cost roughly €26 to €40; the planned staircase over Carrer de Mallorca could affect just over 200 homes (earlier estimates were about 1,000) and no agreement had been reached by mid-2026; Barcelona had about 15.7 million tourists in 2025 and set 16 million as its limit; it nearly doubled its hotel tourist tax in April 2026 and is pursuing higher taxes on short-stay cruise passengers; residents protested against overtourism in 2024; the city has restricted new hotels since 2017.',
      "Core theory: Butler (1980) tourism area life cycle; Doxey (1975) Irridex; MacCannell (1973) staged authenticity; Cohen (1988) commoditisation; Urry and Larsen (2011) tourist gaze; Pine and Gilmore (1999) experience economy; Kimes (1989) yield management; Pigou (1920) externalities; Freeman (1984) stakeholders; Mangold and Faulds (2009) social media; Rosa (2013) social acceleration.",
      'How to answer: British English. Keep answers under 150 words unless the student asks for more. Be encouraging but rigorous, and present both sides of contested issues such as overtourism and the staircase. Use the facts above; if a student asks for a figure not listed, say you are not certain and suggest where to check. Cite sources as (Author, year) in Harvard style and only cite the works listed above or other well-known sources you are sure of; never invent references. End with one question that makes the student think.',
      "Stay on this module and case. If asked about something unrelated, say briefly that you can only help with this case and suggest a related question. Do not write assessed coursework for the student; help them think it through instead."
    ].join(' ')
  }
};
