/* Cannes from Le Suquet: a 360° photo case for BAA (BUSN10060) on heritage, the port and cruise tourism.
   Hotspot positions are pixel coordinates on the 2576 × 1288 equirectangular photo. Bystanders' faces are blurred. */
const MAREX = "Maritime Executive (2025) 'Cannes moves to limit cruise ships following similar efforts in Nice', 30 June. Available at: https://www.maritime-executive.com/article/cannes-moves-to-limit-cruise-ships-following-similar-efforts-in-nice (Accessed: 21 October 2026).";
const TOURMAG = "TourMaG (2025) 'Cannes limite les paquebots : la filière monte au front', 30 June. Available at: https://www.tourmag.com/Cannes-limite-les-paquebots-la-filiere-monte-au-front_a127691.html (Accessed: 21 October 2026).";
const CMAP = "Stansfield, J. (2025) 'Cannes (France) limits daily cruise ship passengers to 6,000', CruiseMapper, 30 June. Available at: https://www.cruisemapper.com/news/14975-cannes-caps-daily-cruise-passenger-landings (Accessed: 21 October 2026).";
const MUSEE = 'Ville de Cannes (n.d.) About the museum: musée des explorations du monde. Available at: https://cannes.com/en/museums-arts/musee-des-explorations-du-monde/about-the-museum.html (Accessed: 21 October 2026).';
const BUTLER = "Butler, R.W. (1980) 'The concept of a tourist area cycle of evolution: implications for management of resources', Canadian Geographer, 24(1), pp. 5–12.";
const DOXEY = "Doxey, G.V. (1975) 'A causation theory of visitor–resident irritants: methodology and research inferences', in Travel and Tourism Research Association Sixth Annual Conference Proceedings. San Diego, CA: TTRA, pp. 195–198.";
const DWYER = "Dwyer, L. and Forsyth, P. (1998) 'Economic significance of cruise tourism', Annals of Tourism Research, 25(2), pp. 393–415.";
const MACC = "MacCannell, D. (1973) 'Staged authenticity: arrangements of social space in tourist settings', American Journal of Sociology, 79(3), pp. 589–603.";
const URRY = 'Urry, J. and Larsen, J. (2011) The Tourist Gaze 3.0. London: Sage.';
const MILANO = 'Milano, C., Cheer, J.M. and Novelli, M. (eds) (2019) Overtourism: Excesses, Discontents and Measures in Travel and Tourism. Wallingford: CABI.';
const KOTLER = 'Kotler, P., Haider, D.H. and Rein, I. (1993) Marketing Places: Attracting Investment, Industry, and Tourism to Cities, States, and Nations. New York: Free Press.';

export const spec = {
  id:'cannes-360',
  type:'pano',
  title:'Cannes',
  subtitle:'From Le Suquet',
  module:'BAA · Business in an Age of Acceleration (BUSN10060) · heritage, port and cruise tourism case',
  moduleCode:'BUSN10060',
  pinSize:0.55,
  pano:{ src:'./pano.jpg', width:2576, height:1288, start:[1288, 600], fov:75, pinRadius:8 },
  privacy:'Your student number and quiz answers are saved to a UWS Google Sheet so your lecturer can see how the cohort is doing and follow up with support. Questions you ask the AI tutor are sent to an AI service without your student number. You can retake the quiz as often as you like.',

  hotspots:[
    { id:'castle', n:1, title:'The castle on Le Suquet', px:[440, 330], concept:'heritage as a tourism asset',
      blurb:'The crenellated walls of the old castle on Le Suquet hill, built on the ruins of a medieval monastery of the monks of Lérins. A square watchtower of 109 steps stands in its courtyard.' },
    { id:'museum', n:2, title:'From castle to museum', px:[980, 522], concept:'adaptive reuse and cultural attractions',
      blurb:'The castle buildings house the city museum. Cannes bought them in 1919; the Musée de la Castre was renamed the musée des explorations du monde in 2021.' },
    { id:'terrace', n:3, title:'The terrace and the view', px:[930, 905], concept:'the tourist gaze',
      blurb:'Benches in the shade of umbrella pines, a coin telescope and a panorama over the bay: a free viewpoint that most visitors to the old town climb to.' },
    { id:'port', n:4, title:'The old port', px:[2420, 690], concept:'the port as a working and leisure economy',
      blurb:'The Vieux Port below Le Suquet: fishing boats, charter yachts, superyachts in festival season, and the quay where cruise tenders land their passengers.' },
    { id:'city', n:5, title:'The Croisette and festival city', px:[2060, 625], concept:'place branding and event-led destinations',
      blurb:'Beyond the port lie the Palais des Festivals and the Croisette, the hotel seafront that the film festival and business events have made world famous.' },
    { id:'cruise', n:6, title:'Cruise ships in the bay', px:[95, 660], concept:'cruise tourism economics',
      blurb:'Cruise ships cannot berth in Cannes: they anchor in the bay and tender passengers ashore. In 2024 the roadstead saw 175 calls and about 460,000 cruise passengers.' },
    { id:'limits', n:7, title:'Cannes sets limits', px:[2290, 545], concept:'overtourism and destination governance',
      blurb:'In June 2025 the city council voted to cap cruise passengers at 6,000 a day from 2026 and to cut calls by large ships, with only ships under 1,300 passengers welcome from 2030.' },
    { id:'promo', n:'▶', title:'Cannes on screen', px:[1930, 320], concept:'destination image and visual marketing',
      blurb:'A 4K promotional-style film of Cannes and the French Riviera. Watch it, then ask what image of the destination it sells, and to whom.',
      video:{ youtube:'UvKjixnH_-A', title:'Beauty of Cannes, French Riviera (4K)', credit:'Video: World in 4K, YouTube.',
        note:'Watch for what the film shows, and what it leaves out.' } }
  ],

  questions:[
    { id:'c1', hotspot:'castle',
      q:'The castle on Le Suquet was built on land held by the monks of the Lérins islands. Why does that origin story matter to Cannes as a destination today?',
      options:[
        'It gives a glamour resort a deep, authentic past that differentiates it from newer beach destinations',
        'It means the castle is owned by the Church and cannot be used for tourism',
        'It is legally required content on all French tourism signage',
        'It has no relevance; visitors only come for the beaches'],
      answer:0,
      explain:'Heritage provides depth and authenticity to a brand otherwise built on film-star glamour. The medieval hill town and the monastic story let Cannes sell layered experiences (history plus Riviera lifestyle), which widens its appeal beyond the beach and the festival fortnight.',
      ref:MUSEE },
    { id:'c2', hotspot:'castle',
      q:'MacCannell (1973) argued that tourists seek authenticity but are often shown a "staged" version. Which visitor experience here best fits the idea of staged authenticity?',
      options:[
        'A curated museum route through the castle that presents the past as a story for visitors',
        'A resident buying bread in the old town',
        'A fishing boat landing its catch at dawn',
        'Council workers repairing the road'],
      answer:0,
      explain:'MacCannell describes front and back regions: tourists are let into an arranged "back" that feels authentic but is presented for them. A curated heritage route is that arranged space; the resident and the fishing boat are everyday life, not staged for the visitor.',
      ref:MACC },
    { id:'c3', hotspot:'museum',
      q:'The castle buildings became the city museum (bought by Cannes in 1919, renamed the musée des explorations du monde in 2021). What business logic does renaming a museum serve?',
      options:[
        'Repositioning: a clearer, more global proposition that is easier to market to international visitors',
        'Avoiding paying for new signage',
        'Meeting a French rule that every museum must change name every century',
        'Hiding the building\'s medieval history from visitors'],
      answer:0,
      explain:'A new name is a repositioning tool. "Explorations of the world" tells an international visitor in a few words what the collections are (objects and art from Oceania, the Himalayas, the Arctic and beyond), where "de la Castre" only makes sense to locals.',
      ref:MUSEE },
    { id:'c4', hotspot:'museum',
      q:'Using a medieval castle as a museum is an example of adaptive reuse. What is its main advantage for a destination like Cannes?',
      options:[
        'The historic building is itself part of the attraction, so the asset earns income while being conserved',
        'It removes the need for any public funding',
        'It guarantees more visitors than the beach',
        'It allows the building to be demolished later'],
      answer:0,
      explain:'Adaptive reuse turns a heritage liability (an old building that must be maintained) into a productive asset. The building adds value to the visit and generates footfall and ticket income that support conservation, though most such museums still rely on public money.',
      ref:KOTLER },
    { id:'c5', hotspot:'terrace',
      q:'Visitors on this terrace photograph the view and share it. According to Urry and Larsen (2011), what does this do to the destination?',
      options:[
        'It reproduces a collective "gaze" that shapes how Cannes is expected to look and what later visitors seek out',
        'It has no effect, because photos are private',
        'It reduces visitor numbers by satisfying people online',
        'It legally transfers image rights to the photographer'],
      answer:0,
      explain:'Urry and Larsen argue that the tourist gaze is socially organised: images circulate, set expectations and direct future visitors to the same viewpoints. Free viewpoints like this one become "must-see" spots, which concentrates crowds.',
      ref:URRY },
    { id:'c6', hotspot:'terrace',
      q:'The viewpoint is free to enter. How can a free attraction still create value for the local economy?',
      options:[
        'It draws visitors up through the old town, where they spend in cafés, shops and the museum',
        'It cannot; only paid attractions create value',
        'Through a hidden entry charge added to hotel bills',
        'By selling the view to film companies only'],
      answer:0,
      explain:'Free public goods often act as anchors: they generate footfall that is monetised by surrounding businesses. The route up Le Suquet passes restaurants and shops, and the museum sits at the top. The flip side is congestion costs borne by residents.',
      ref:KOTLER },
    { id:'c7', hotspot:'port',
      q:'The old port hosts fishing boats, yacht charters, superyachts in festival season and cruise tenders. What tension does this mix create?',
      options:[
        'Competing users for limited quay space, with leisure uses often outbidding traditional working uses',
        'None; every user wants exactly the same facilities',
        'Fishing boats always take priority by law, so leisure use is banned',
        'Cruise tenders are not allowed in old ports'],
      answer:0,
      explain:'Ports are contested spaces. Higher-yield leisure and luxury uses can squeeze out traditional activities that are part of the town\'s character, which in turn weakens the authenticity tourists come for. Managing that balance is a governance choice.',
      ref:BUTLER },
    { id:'c8', hotspot:'port',
      q:'Cruise passengers in Cannes are tendered ashore by small boats rather than walking off a berth. What does this mean operationally?',
      options:[
        'Arrivals are throttled by tender capacity and the weather, which shapes when and how many passengers reach town',
        'Passengers arrive faster than from a berth',
        'No port staff or facilities are needed',
        'Passengers cannot visit the town at all'],
      answer:0,
      explain:'Tendering adds a capacity constraint and weather risk: it limits the flow of passengers, concentrates arrivals at the quay at set times and needs landing facilities and staff. That constraint is one lever the city now uses to manage numbers.',
      ref:MAREX },
    { id:'c9', hotspot:'city',
      q:'Cannes is known worldwide for its film festival and business events. In place-marketing terms, what does a flagship event do for the destination?',
      options:[
        'It creates global media exposure and an image that markets the city all year, beyond the event itself',
        'It only matters during the two weeks it runs',
        'It replaces the need for any other tourism',
        'It reduces hotel prices for the rest of the year'],
      answer:0,
      explain:'Kotler, Haider and Rein (1993) treat images and events as tools of place marketing. A flagship event gives a city a story the media repeats; Cannes\'s festival glamour is used to sell the Riviera to leisure, business and cruise visitors alike.',
      ref:KOTLER },
    { id:'c10', hotspot:'city',
      q:'Which risk comes with building a destination brand on glamour and celebrity?',
      options:[
        'Visitor expectations and prices rise, and the town can feel exclusive or staged for the event rather than lived in',
        'There are no risks; glamour is always positive',
        'Glamour brands cannot attract business events',
        'It stops all cruise ships from visiting'],
      answer:0,
      explain:'Strong, narrow brands raise expectations and costs and can crowd out residents and everyday life. They also make a destination dependent on a few events. Good destination management balances the flagship image with broader, year-round offers.',
      ref:MILANO },
    { id:'c11', hotspot:'cruise',
      q:'In 2024 Cannes received about 175 cruise calls and 460,000 cruise passengers. Why do economists argue that day-visiting cruise passengers add less local value per head than staying visitors?',
      options:[
        'They sleep and eat mostly on board, so most of their spending goes to the cruise line, not local businesses',
        'They are not allowed to spend money ashore',
        'They pay a higher tax than hotel guests',
        'They always stay for a week'],
      answer:0,
      explain:'Dwyer and Forsyth (1998) show that cruise visitors\' local spending is concentrated on short visits, while accommodation and most meals are captured on board. Local benefit depends on passenger spending, crew spending and port charges, set against congestion and environmental costs.',
      ref:DWYER },
    { id:'c12', hotspot:'cruise',
      q:'Several thousand cruise passengers arriving within a few hours can crowd the old town. Which model best explains why residents\' attitudes may harden over time?',
      options:[
        'Doxey\'s Irridex: residents move from euphoria to apathy, annoyance and antagonism as visitor pressure grows',
        'Maslow\'s hierarchy of needs',
        'Porter\'s five forces',
        'The product life cycle of a single cruise ship'],
      answer:0,
      explain:'Doxey (1975) describes resident attitudes souring as tourism grows and its costs become visible. Cruise peaks are especially irritating because they concentrate large numbers in a short window, in the same narrow streets.',
      ref:DOXEY },
    { id:'c13', hotspot:'limits',
      q:'In June 2025 Cannes voted to cap disembarking cruise passengers at 6,000 a day from 2026, cut large-ship calls and, from 2030, welcome only ships under 1,300 passengers. How did the cruise industry respond?',
      options:[
        'CLIA and local maritime businesses criticised it as unilateral and warned of lost jobs and income',
        'The industry welcomed it unanimously',
        'Cruise lines immediately cancelled all Mediterranean sailings',
        'The national government overturned it the next day'],
      answer:0,
      explain:'CLIA called the restrictions unjustified, and the local maritime union warned that hundreds of jobs were at risk and that it had been decided without an impact study. The mayor framed it as protecting the environment and quality of life, "not being against cruises".',
      ref:TOURMAG },
    { id:'c14', hotspot:'limits',
      q:'Butler\'s (1980) tourist area life cycle predicts that destinations can stagnate or decline if they exceed carrying capacity. Where would you place Cannes\'s cruise limits in that model?',
      options:[
        'An intervention at the consolidation/stagnation stage, aimed at rejuvenation by shifting to fewer, higher-value visitors',
        'The exploration stage, when no tourists yet visit',
        'The involvement stage, when locals first open guesthouses',
        'Proof that Cannes has already declined'],
      answer:0,
      explain:'Butler argues that mature destinations face stagnation as capacity is reached and must manage or reinvent themselves. Limiting mass cruise calls in favour of smaller ships is a deliberate repositioning: fewer visitors, higher yield, less pressure. Whether it works depends on what replaces the lost spending.',
      ref:BUTLER },
    { id:'c15', hotspot:'promo',
      q:'Promotional destination films rarely show crowds, queues or cruise ships at anchor. What concept explains the gap between the image and the visit?',
      options:[
        'Projected versus perceived destination image: marketing projects an idealised image that visitors then compare with reality',
        'Price elasticity of demand',
        'Economies of scale',
        'The tourist area life cycle'],
      answer:0,
      explain:'Destination marketing projects a selective image. If the experience on the ground (crowds, prices, congestion) differs too much, satisfaction and word of mouth suffer. The gap is sharpest at peak cruise and festival times.',
      ref:URRY },
    { id:'c16', hotspot:'promo',
      q:'If Cannes wants fewer cruise day-trippers but more higher-spending staying visitors, how should its visual marketing change?',
      options:[
        'Show slower, overnight experiences (old town evenings, museums, the islands, events) aimed at staying segments',
        'Show more cruise ships in the bay',
        'Stop all marketing so nobody comes',
        'Advertise only the cheapest day trips'],
      answer:0,
      explain:'Marketing should match the policy: targeting segments that stay longer and spend locally (cultural, business, events, island trips) supports the cruise limits rather than undermining them. This is demarketing of one segment combined with positioning for another.',
      ref:MILANO }
  ],

  tutor:{
    name:'BAA tutor',
    greeting:"Hi. I'm the BAA tutor for this case. You're standing on Le Suquet in Cannes, beside the old castle, looking over the port and the bay. Ask me about heritage, the port, cruise tourism or the city's new limits, or about any quiz question.",
    suggestions:[
      'Are Cannes\'s cruise limits good for local businesses?',
      'How does heritage fit with Cannes\'s glamour brand?',
      'What would you measure to judge if the limits work?'
    ],
    brief:[
      'You are a tutor for BAA, Business in an Age of Acceleration (BUSN10060, SCQF level 10), at the University of the West of Scotland, delivered to Graduate Apprentices.',
      'The case is a 360° photo taken on the terrace beside the castle on Le Suquet hill in Cannes, France, looking over the old port (Vieux Port), the city towards the Croisette and Palais des Festivals, and the bay where cruise ships anchor.',
      'Facts you may use (as of October 2026): the castle on Le Suquet stands on the ruins of a medieval monastery of the monks of Lérins and has a square medieval watchtower of 109 steps; Saint-Anne\'s Chapel dates from the 11th century; the City of Cannes bought the buildings in 1919; the Musée de la Castre was renamed the musée des explorations du monde in early 2021; its collections include art and objects from Oceania, the Himalayas and the Arctic, Mediterranean antiquities, Pre-Columbian ceramics and musical instruments. Cruise ships cannot berth in Cannes and tender passengers ashore. In 2024 the roadstead had 175 calls and about 460,000 cruise passengers (TourMaG, 2025). On 27 June 2025 the city council unanimously adopted new rules: from 1 January 2026, at most 6,000 cruise passengers may disembark per day, large-ship calls fall (reported as 70 to 34 in 2026, with only one ship over 3,000 passengers per day), and from 2030 only ships under 1,300 passengers are welcome; some reports describe the threshold as ships over 1,000 passengers. Mayor David Lisnard said it is not about being against cruises. CLIA called the restrictions unjustified and the local maritime union (UM06) warned of hundreds of jobs at risk and said there had been no impact study. Nice and Villefranche introduced related limits in 2025.',
      'Core theory: Butler (1980) tourist area life cycle; Doxey (1975) Irridex; Dwyer and Forsyth (1998) economics of cruise tourism; MacCannell (1973) staged authenticity; Urry and Larsen (2011) the tourist gaze; Milano, Cheer and Novelli (2019) overtourism; Kotler, Haider and Rein (1993) place marketing; projected versus perceived destination image.',
      'The model also has a video pin with a 4K promotional-style film of Cannes from the YouTube channel World in 4K; it is not an official city film. Help students analyse the destination image it projects.',
      'How to answer: British English. Under 150 words unless asked for more. Be Socratic: probe the student\'s reasoning and give both sides of contested issues (the cruise limits have clear supporters and critics). Use only the facts above; if a student asks for a figure not listed, say you are not certain and suggest where to check. Cite as (Author, year) in Harvard style using only the works above or well-known sources you are sure of. Never invent references or statistics. End with one question that makes the student think.',
      'Stay on this module and case. If asked about something unrelated, say briefly that you can only help with this case. Do not write assessed coursework for the student; help them think it through instead.'
    ].join(' ')
  }
};
