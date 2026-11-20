import { Tour } from '../data/toursData';

const COUNTRY_FALLBACK_MAP: Record<string, string> = {
  'türkiye': '/countries/turkiye-europe.jpg',
  'turkiye': '/countries/turkiye-europe.jpg',
  'turkey': '/countries/turkiye-europe.jpg',
  'egypt': '/countries/egypt.jpg',
  'jordan': '/countries/jordan.jpg',
  'morocco': '/countries/morocco.jpg',
  'tunisia': '/countries/tunisia.jpg',
  'kenya': '/countries/kenya.jpg',
  'vietnam': '/countries/vietnam.jpg',
  'sri lanka': '/countries/sri-lanka.jpg',
  'oman': '/countries/oman.jpg',
  'united arab emirates': '/countries/uae.jpg',
  'uae': '/countries/uae.jpg',
  'hungary': '/countries/hungary.jpg',
  'romania': '/countries/romania.jpg',
  'serbia': '/countries/serbia.jpg',
  'bosnia': '/countries/bosnia.jpg',
  'bosnia and herzegovina': '/countries/bosnia.jpg',
  'montenegro': '/countries/montenegro.jpg',
  'croatia': '/countries/croatia.jpg',
  'georgia': '/countries/georgia.jpg',
  'armenia': '/countries/armenia.jpg',
  'azerbaijan': '/countries/azerbaijan.jpg',
  'azarbaijan': '/countries/azerbaijan.jpg',
};

/**
 * Returns a guaranteed local landmark photograph matching the tour's destination
 * in case a remote image fails to load.
 */
export function getTourFallbackImage(tour: Pick<Tour, 'countries' | 'region' | 'place'>): string {
  const regionLower = `${tour.region || ''} ${tour.place || ''}`.toLowerCase();
  if (regionLower.includes('cappadocia') || regionLower.includes('anatolia') || regionLower.includes('mesopotamia')) {
    return '/countries/turkiye-asia.jpg';
  }
  for (const country of tour.countries || []) {
    const mapped = COUNTRY_FALLBACK_MAP[country.toLowerCase().trim()];
    if (mapped) return mapped;
  }
  return '/countries/turkiye-europe.jpg';
}
