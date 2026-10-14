export type TravelerType = 'Couple' | 'Solo' | 'Family' | 'Friends' | 'Group';

export interface CategoryRatings {
  guide: number;
  itinerary: number;
  value: number;
  accommodation: number;
}

export interface ReviewHostReply {
  author: string;
  role: string;
  date: string;
  comment: string;
}

export interface Review {
  id: string;
  tourSlug: string;
  authorName: string;
  authorEmail: string;
  authorLocation: string;
  rating: number; // 1 to 5
  categoryRatings: CategoryRatings;
  title: string;
  comment: string;
  travelMonth: string;
  travelerType: TravelerType;
  isVerified: boolean;
  helpfulCount: number;
  recommended: boolean;
  createdAt: string;
  hostReply?: ReviewHostReply;
}

export const INITIAL_REVIEWS: Review[] = [
  // 1. Istanbul Small Group City & Secret Streets
  {
    id: 'rev-ist-1',
    tourSlug: 'istanbul-small-group-city-and-secret-streets-tour-with-guide',
    authorName: 'Eleanor Vance',
    authorEmail: 'eleanor.vance@example.co.uk',
    authorLocation: 'London, United Kingdom',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 5,
    },
    title: 'Discovered passages and rooftops we would never have found alone!',
    comment:
      'Our guide Ahmet made ancient Constantinople and Ottoman Istanbul come alive. The small group format (there were only 7 of us) meant we could easily weave through the hidden caravanserai courtyards and rooftop tea gardens near the Spice Bazaar. Best walking tour we have taken in Europe!',
    travelMonth: 'September 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 24,
    recommended: true,
    createdAt: '2026-09-28T14:30:00Z',
    hostReply: {
      author: 'Selim Bayraktar',
      role: 'Operations Director, Atlas Global Tours',
      date: '2026-09-29T09:15:00Z',
      comment:
        'Thank you so much Eleanor! Ahmet is passionate about showing the secret courtyards of the historic peninsula. We hope to welcome you both back on our Aegean or Cappadocia journey soon!',
    },
  },
  {
    id: 'rev-ist-2',
    tourSlug: 'istanbul-small-group-city-and-secret-streets-tour-with-guide',
    authorName: 'David & Marcus Chen',
    authorEmail: 'dchen@baytravel.org',
    authorLocation: 'San Francisco, USA',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 4,
      value: 5,
      accommodation: 4,
    },
    title: 'Authentic insight into local neighborhood life and history',
    comment:
      'We loved the historical context—not just dates and emperors, but everyday life under Byzantine and Ottoman rule. The tea stop in an authentic 17th-century han was a real highlight away from the tourist crowds.',
    travelMonth: 'August 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 16,
    recommended: true,
    createdAt: '2026-08-14T11:20:00Z',
  },
  {
    id: 'rev-ist-3',
    tourSlug: 'istanbul-small-group-city-and-secret-streets-tour-with-guide',
    authorName: 'Sophie Larsson',
    authorEmail: 'sophie.larsson@nordic.se',
    authorLocation: 'Stockholm, Sweden',
    rating: 4,
    categoryRatings: {
      guide: 5,
      itinerary: 4,
      value: 4,
      accommodation: 4,
    },
    title: 'Very engaging guide and wonderful culinary tips for our stay',
    comment:
      'Comfortable walking pace and fantastic anecdotes. Our guide gave us recommendations for traditional lokanta restaurants where locals eat lunch, which proved to be the culinary highlight of our 5 days in Istanbul.',
    travelMonth: 'July 2026',
    travelerType: 'Solo',
    isVerified: true,
    helpfulCount: 9,
    recommended: true,
    createdAt: '2026-07-22T16:45:00Z',
  },

  // 2. Cappadocia Hiking Adventure
  {
    id: 'rev-cap-1',
    tourSlug: 'cappadocia-hiking-adventure',
    authorName: 'Dr. Julian Foster',
    authorEmail: 'julian.foster@sydney.edu.au',
    authorLocation: 'Sydney, Australia',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 5,
    },
    title: 'The Rose Valley sunset hike and cave monasteries were breathtaking',
    comment:
      'Cappadocia is surreal, but hiking with Atlas Global Tours through the quiet Pigeon and Red Valleys gave us a much deeper appreciation than just hopping between tour bus stops. Our guide Burak was born in Ürgüp and shared fascinating geology and Byzantine monastic history. Staying in the authentic cave hotel was unforgettable.',
    travelMonth: 'October 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 31,
    recommended: true,
    createdAt: '2026-10-04T10:15:00Z',
    hostReply: {
      author: 'Burak Demir',
      role: 'Lead Guide & Cappadocia Specialist',
      date: '2026-10-05T12:00:00Z',
      comment:
        'It was a true privilege guiding you through our valleys, Julian! The apple tea break by the rock-cut hermitage church was one of my favorite moments of the season.',
    },
  },
  {
    id: 'rev-cap-2',
    tourSlug: 'cappadocia-hiking-adventure',
    authorName: 'Hannah & Liam Becker',
    authorEmail: 'becker.hannah@muenchen.de',
    authorLocation: 'Munich, Germany',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 4,
      accommodation: 5,
    },
    title: 'Spectacular trails, peaceful valleys, and the best local hospitality',
    comment:
      'We did the early sunrise hot air balloon flight and then walked through hidden troglodyte settlements where wild apricots and vines were growing. The home-cooked lunch at a village family home in Ayvalı was delicious, honest Turkish cooking. Highly recommended for active travelers!',
    travelMonth: 'September 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 19,
    recommended: true,
    createdAt: '2026-09-19T08:50:00Z',
  },
  {
    id: 'rev-cap-3',
    tourSlug: 'cappadocia-hiking-adventure',
    authorName: 'Camilla Rossi',
    authorEmail: 'camilla.rossi@milano.it',
    authorLocation: 'Milan, Italy',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 4,
      value: 5,
      accommodation: 5,
    },
    title: 'Unforgettable fairy chimneys away from the crowds',
    comment:
      'As a solo traveler, I felt completely looked after and made great friends in our 8-person group. The hiking paths are well chosen and safe with proper boots. The fairy chimneys in Love Valley at dawn are something you have to see once in your lifetime.',
    travelMonth: 'August 2026',
    travelerType: 'Solo',
    isVerified: true,
    helpfulCount: 12,
    recommended: true,
    createdAt: '2026-08-30T17:10:00Z',
  },

  // 3. Lycian Way Hike in Turkey
  {
    id: 'rev-lyc-1',
    tourSlug: 'lycian-way-hike-in-turkey',
    authorName: 'Mark & Sarah Gallagher',
    authorEmail: 'gallagher.mark@dublin.ie',
    authorLocation: 'Dublin, Ireland',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 4,
    },
    title: 'Ancient tombs, turquoise sea views, and pine-scented coastal trails',
    comment:
      'Walking along the Lycian Way with the Mediterranean glittering beneath us is an experience we will cherish for years. The luggage transfer was seamless, allowing us to hike with just a daypack. The boat excursion to the sunken ruins of Kekova and swimming in secluded coves was pure bliss.',
    travelMonth: 'October 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 27,
    recommended: true,
    createdAt: '2026-10-06T15:20:00Z',
    hostReply: {
      author: 'Selim Bayraktar',
      role: 'Operations Director, Atlas Global Tours',
      date: '2026-10-07T08:30:00Z',
      comment:
        'Delighted you enjoyed the Lycian trails and the crystal-clear Kekova waters, Mark & Sarah! The autumn temperatures are truly the golden season for coastal hiking.',
    },
  },
  {
    id: 'rev-lyc-2',
    tourSlug: 'lycian-way-hike-in-turkey',
    authorName: 'Antoine Dubois',
    authorEmail: 'antoine.dubois@lyon.fr',
    authorLocation: 'Lyon, France',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 5,
    },
    title: 'Excellently organized trekking expedition with brilliant guides',
    comment:
      'The balance of daily hiking (around 12-15km) and cultural heritage was spot on. Our guide knew all the flora, fauna, and Lycian inscriptions along the trail. Dinners in seaside tavernas serving fresh meze and grilled sea bass were wonderful.',
    travelMonth: 'September 2026',
    travelerType: 'Solo',
    isVerified: true,
    helpfulCount: 15,
    recommended: true,
    createdAt: '2026-09-12T19:40:00Z',
  },

  // 4. Hike, Bike & Kayak in Kaş
  {
    id: 'rev-kas-1',
    tourSlug: 'hike-bike-kayak-in-kas-turkey',
    authorName: 'Jessica & Tom Martinez',
    authorEmail: 'jess.martinez@austin.tx.us',
    authorLocation: 'Austin, Texas, USA',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 5,
    },
    title: 'Sea kayaking over ancient ruins in Kekova was surreal!',
    comment:
      'Kaş is our new favorite town in the Mediterranean. Sea kayaking right above ancient amphoras and submerged stone staircases was incredible. Our adventure guides were professional, safety-conscious, and super friendly. We finished every day with a dip in the turquoise water and sunset çay.',
    travelMonth: 'September 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 22,
    recommended: true,
    createdAt: '2026-09-24T14:15:00Z',
  },
  {
    id: 'rev-kas-2',
    tourSlug: 'hike-bike-kayak-in-kas-turkey',
    authorName: 'The Sterling Family (Liam, Chloe & Teens)',
    authorEmail: 'sterling.family@vancouver.ca',
    authorLocation: 'Vancouver, Canada',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 4,
    },
    title: 'The best multi-sport family adventure we have ever booked',
    comment:
      'Traveling with teenagers can be challenging, but this itinerary kept everyone stoked from start to finish. Mountain biking down rural coastal lanes, sea kayaking into pirate caves, and hiking canyon trails. Kaş itself is charming, walkable, and relaxed.',
    travelMonth: 'July 2026',
    travelerType: 'Family',
    isVerified: true,
    helpfulCount: 18,
    recommended: true,
    createdAt: '2026-07-29T10:05:00Z',
  },

  // 5. Immersive Eastern Türkiye
  {
    id: 'rev-east-1',
    tourSlug: 'immersive-eastern-turkiye',
    authorName: 'Prof. Arthur Pendelton',
    authorEmail: 'arthur.pendelton@oxford.ac.uk',
    authorLocation: 'Oxford, United Kingdom',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 4,
    },
    title: 'Göbeklitepe and Mount Nemrut sunrise exceeded all expectations',
    comment:
      'For anyone fascinated by the dawn of human civilization, this tour is indispensable. Standing among the 11,500-year-old pillars of Göbeklitepe with our archaeologist guide was a transcendent experience. Watching sunrise illuminate the colossal stone heads on Mount Nemrut felt like another world.',
    travelMonth: 'May 2026',
    travelerType: 'Solo',
    isVerified: true,
    helpfulCount: 35,
    recommended: true,
    createdAt: '2026-05-18T16:20:00Z',
    hostReply: {
      author: 'Selim Bayraktar',
      role: 'Operations Director, Atlas Global Tours',
      date: '2026-05-19T10:00:00Z',
      comment:
        'Thank you Professor Pendelton. Eastern Anatolia is a treasure of deep human heritage. We are honored that our specialized archaeological guides provided such a memorable journey.',
    },
  },
  {
    id: 'rev-east-2',
    tourSlug: 'immersive-eastern-turkiye',
    authorName: 'Elena & George Papadopoulos',
    authorEmail: 'elena.papado@athens.gr',
    authorLocation: 'Athens, Greece',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 4,
      value: 5,
      accommodation: 4,
    },
    title: 'Culinary and historical goldmine in Gaziantep and Sanliurfa',
    comment:
      'The hospitality in the Southeast is unmatched anywhere in the world. Gaziantep’s Zeugma mosaic museum is breathtaking, and the food—pistachio katmer, Ali Nazik kebabs, and Urfa isot pepper—is sensational. Atlas Global Tours took care of every logistic flawlesly.',
    travelMonth: 'April 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 20,
    recommended: true,
    createdAt: '2026-04-26T18:30:00Z',
  },

  // 6. Best of Istanbul Basilica Cistern & Blue Mosque
  {
    id: 'rev-ist-classics-1',
    tourSlug: 'best-of-istanbul-basilica-cistern-blue-mosque-grand-bazaar',
    authorName: 'Rachel & Noah Klein',
    authorEmail: 'rachel.klein@nytravelers.org',
    authorLocation: 'New York, USA',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 5,
    },
    title: 'Skip-the-line access and an encyclopedia of history in our guide!',
    comment:
      'Visiting the Basilica Cistern with its eerie lighting and Medusa heads without having to wait in the huge public queue saved us hours. Our guide Duygu explained the architectural genius of Mimar Sinan at the Blue Mosque with so much passion. Five stars all around.',
    travelMonth: 'September 2026',
    travelerType: 'Couple',
    isVerified: true,
    helpfulCount: 28,
    recommended: true,
    createdAt: '2026-09-15T11:45:00Z',
  },

  // 7. Immersive Aegean Türkiye Culinary & Cultural Tour
  {
    id: 'rev-aeg-1',
    tourSlug: 'immersive-aegean-turkiye-culinary-cultural-tour',
    authorName: 'Chef Matthew Rogers',
    authorEmail: 'mrogers@chefcollective.com',
    authorLocation: 'Melbourne, Australia',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 5,
      value: 5,
      accommodation: 5,
    },
    title: 'A masterclass in Aegean olive oil cuisine, ancient ruins, and winemaking',
    comment:
      'As a chef, I was blown away by the authentic farm-to-table meals in Urla and Sirince. Touring the monumental ruins of Ephesus at 8 AM before the cruise ship crowds arrived was magical. The Terrace Houses look like Roman mansions frozen in time.',
    travelMonth: 'June 2026',
    travelerType: 'Friends',
    isVerified: true,
    helpfulCount: 30,
    recommended: true,
    createdAt: '2026-06-21T13:20:00Z',
  },
  {
    id: 'rev-aeg-2',
    tourSlug: 'immersive-aegean-turkiye-culinary-cultural-tour',
    authorName: 'Clara Jenkins',
    authorEmail: 'clara.j@bristol.uk',
    authorLocation: 'Bristol, United Kingdom',
    rating: 5,
    categoryRatings: {
      guide: 5,
      itinerary: 4,
      value: 5,
      accommodation: 5,
    },
    title: 'Peaceful boutique hotels and unforgettable ancient heritage',
    comment:
      'The boutique stone house hotel in Alaçatı was like something out of a design magazine. Every single meal was fresh, fragrant with oregano and cold-pressed olive oil. Ephesus and the Library of Celsus are unforgettable.',
    travelMonth: 'May 2026',
    travelerType: 'Solo',
    isVerified: true,
    helpfulCount: 17,
    recommended: true,
    createdAt: '2026-05-30T10:10:00Z',
  },
];

// Helper to generate realistic deterministic community reviews for any tour that doesn't have custom hand-seeded ones
export function generateFallbackReviews(tourSlug: string, tourTitle: string): Review[] {
  // Use a stable hash of the tour slug
  let hash = 0;
  for (let i = 0; i < tourSlug.length; i++) {
    hash = (hash << 5) - hash + tourSlug.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const reviewerPool = [
    { name: 'Sarah & Oliver Bennett', loc: 'Edinburgh, UK', type: 'Couple' as TravelerType },
    { name: 'Dr. Michael Hansen', loc: 'Copenhagen, Denmark', type: 'Solo' as TravelerType },
    { name: 'Maria & Carlos Silva', loc: 'Madrid, Spain', type: 'Couple' as TravelerType },
    { name: 'The Harper Family', loc: 'Chicago, USA', type: 'Family' as TravelerType },
    { name: 'Jonathan Reid', loc: 'Wellington, New Zealand', type: 'Solo' as TravelerType },
    { name: 'Emily & Thomas Wong', loc: 'Toronto, Canada', type: 'Couple' as TravelerType },
  ];

  const reviewTemplates = [
    {
      title: 'Flawlessly planned, deeply authentic, and warm local hospitality',
      comment: `Our experience on "${tourTitle}" was exceptional from the very first minute. The local guide was a master storyteller with encyclopedic knowledge, and the small group dynamic made us feel like old friends exploring together. We couldn't have asked for a better trip with Atlas Global Tours.`,
      rating: 5,
      ratings: { guide: 5, itinerary: 5, value: 5, accommodation: 5 },
      month: 'September 2026',
      date: '2026-09-18T10:30:00Z',
      helpful: 14 + (positiveHash % 12),
    },
    {
      title: 'Far exceeded our expectations in every single dimension',
      comment: `The itinerary for "${tourTitle}" was perfectly paced—enough time to absorb the history and take photos without ever feeling rushed. The meals and local connections made this feel far more personal than any standard tour operator. 10/10 recommendation!`,
      rating: 5,
      ratings: { guide: 5, itinerary: 5, value: 4, accommodation: 5 },
      month: 'August 2026',
      date: '2026-08-25T14:15:00Z',
      helpful: 9 + (positiveHash % 8),
    },
    {
      title: 'A true insider journey with passionate licensed specialists',
      comment: `What stood out most on "${tourTitle}" was our guide's genuine love for the region. We avoided all tourist traps, enjoyed authentic regional dishes in local taverns, and saw historical wonders with rich context. Will definitely travel with Atlas Global Tours again!`,
      rating: 5,
      ratings: { guide: 5, itinerary: 4, value: 5, accommodation: 5 },
      month: 'July 2026',
      date: '2026-07-14T09:40:00Z',
      helpful: 6 + (positiveHash % 9),
    },
  ];

  return reviewTemplates.map((tmpl, idx) => {
    const reviewer = reviewerPool[(positiveHash + idx) % reviewerPool.length];
    return {
      id: `gen-${tourSlug}-${idx + 1}`,
      tourSlug,
      authorName: reviewer.name,
      authorEmail: `traveler.${idx + 1}@atlascommunity.com`,
      authorLocation: reviewer.loc,
      rating: tmpl.rating,
      categoryRatings: tmpl.ratings,
      title: tmpl.title,
      comment: tmpl.comment,
      travelMonth: tmpl.month,
      travelerType: reviewer.type,
      isVerified: true,
      helpfulCount: tmpl.helpful,
      recommended: true,
      createdAt: tmpl.date,
    };
  });
}
