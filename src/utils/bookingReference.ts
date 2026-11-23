import { TOURS_DATA } from '../data/toursData';

// Official Supplier Tour Codes from AGT_Tours_Departures CSV (23 multi-day tours)
// plus clean 3-letter codes for the remaining catalog tours
export const OFFICIAL_TOUR_CODES_BY_SLUG: Record<string, string> = {
  // 23 Official CSV Supplier Tour Codes
  'cappadocia-hiking-adventure': 'CAT',
  'seven-churches-turkey': '7CR',
  'turkiye-by-rail': 'DTR',
  'immersive-aegean-turkiye-culinary-cultural-tour': 'IAT',
  'immersive-all-turkiye-culinary-cultural-tour': 'IAlT',
  'immersive-balkans': 'IBT',
  'immersive-classic-vietnam': 'ICV',
  'immersive-eastern-turkiye': 'IET',
  'immersive-egypt-jordan': 'IEJ',
  'immersive-egypt': 'IEG',
  'immersive-jordan': 'IJT',
  'immersive-kenya-safari': 'IKS',
  'immersive-morocco': 'IMO',
  'immersive-oman-emirates': 'IOE',
  'shortbreak-eastern-turkiye': 'ISET',
  'immersive-sri-lanka-tour': 'ISLK',
  'immersive-transylvania': 'ITR',
  'immersive-tunisia': 'ITU',
  'immersive-eastern-western-turkey': 'IEW',
  'immersive-western-turkiye-tour-gallipoli-dalyan-aphrodisias': 'IWT',
  'hike-bike-kayak-in-kas-turkey': 'KAS',
  'lycian-way-hike-in-turkey': 'LWT',
  'immersive-western-turkiye': 'PJT',

  // Remaining catalog tours (day tours & additional multi-day journeys)
  'istanbul-small-group-city-and-secret-streets-tour-with-guide': 'ISS',
  'istanbul-topkapi-palace-and-harem-guided-tour': 'TKP',
  'istanbul-kick-start-tour-first-time-visitor-essentials': 'KST',
  'topkapi-palace-with-harem-blue-mosque-guided-tour': 'TBM',
  'multi-cultural-istanbul-galata-tower-fener-and-balat-golden-horn-by-ferry': 'MCI',
  'best-of-istanbul-basilica-cistern-blue-mosque-grand-bazaar': 'BOI',
  'istanbul-modern-city-walking-taksim-to-galata-with-secret-passages': 'IMW',
  'byzantium-hagia-sophia-and-basilica-cistern-shared-tour': 'BHS',
  'istanbul-short-break-tour': 'ISB',
  '6-day-istanbul-adventure-culture-nature-sea': 'IAK',
  'sunrise-walking-tour-of-istanbul-with-traditional-breakfast': 'SWT',
  'immersive-georgia-armenia-azarbaijan': 'GAA',
  'cairo-old-town-walking-tour-with-local-guide': 'COT',
  'pure-ephesus-shore-excursion-avoid-the-carpet-leather-factory-stops': 'PES',
};

export interface TourCodeLookupInput {
  code?: string | null;
  tourCode?: string | null;
  id?: string;
  tourId?: string;
  slug?: string;
  tourSlug?: string;
}

/**
 * Resolves the unified tour code used across customers, operations, and vouchers.
 */
export function resolveTourCode(input?: TourCodeLookupInput | null): string {
  if (!input) return 'AGT';

  const slug = input.tourSlug || input.slug;
  if (slug && OFFICIAL_TOUR_CODES_BY_SLUG[slug]) {
    return OFFICIAL_TOUR_CODES_BY_SLUG[slug];
  }

  const direct = (input.tourCode || input.code || '').trim();
  if (direct && !direct.startsWith('WTE-') && !direct.startsWith('AGT-')) {
    return direct.replace(/[^A-Za-z0-9]/g, '');
  }

  const id = input.tourId || input.id;
  if (id || slug) {
    const matched = TOURS_DATA.find((t) => (id && t.id === id) || (slug && t.slug === slug));
    if (matched) {
      if (OFFICIAL_TOUR_CODES_BY_SLUG[matched.slug]) {
        return OFFICIAL_TOUR_CODES_BY_SLUG[matched.slug];
      }
      if (matched.code) {
        return matched.code.trim().replace(/[^A-Za-z0-9]/g, '');
      }
    }
  }

  if (direct) {
    return direct.replace(/[^A-Za-z0-9]/g, '').slice(0, 6) || 'AGT';
  }

  return 'AGT';
}

/**
 * Generates a unified booking / voucher reference in the exact format:
 * XXX(Tour Code)XX(Year)XX(Month)XX(Day)-XXX(Random 3-digit number)
 * Example: CAT261129-482, ISET261130-849, 7CR270418-615
 */
export function generateBookingReference(tourCode: string, departureDate?: string): string {
  const cleanCode = (tourCode || 'AGT').trim().replace(/[^A-Za-z0-9]/g, '') || 'AGT';

  let yy: string;
  let mm: string;
  let dd: string;

  const isoMatch = typeof departureDate === 'string'
    ? departureDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
    : null;

  if (isoMatch) {
    yy = isoMatch[1].slice(-2);
    mm = isoMatch[2];
    dd = isoMatch[3];
  } else {
    const now = new Date();
    yy = String(now.getUTCFullYear()).slice(-2);
    mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    dd = String(now.getUTCDate()).padStart(2, '0');
  }

  const randomThreeDigits = Math.floor(100 + Math.random() * 900);
  return `${cleanCode}${yy}${mm}${dd}-${randomThreeDigits}`;
}
