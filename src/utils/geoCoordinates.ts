import { Tour, TourDay } from '../data/toursData';

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dayNumbers: number[];
  type: 'city' | 'landmark' | 'activity';
  activityType?: 'balloon' | 'boat' | 'monument' | 'hiking' | 'culinary' | 'culture';
  activityLabel?: string;
  description?: string;
  image?: string;
}

// Master geo-coordinates registry for destinations, cities & monuments
export const GEO_COORDINATES: Record<string, { lat: number; lng: number; defaultActivity?: RouteStop['activityType'] }> = {
  // Istanbul & Marmara
  'istanbul': { lat: 41.0082, lng: 28.9784, defaultActivity: 'monument' },
  'sultanahmet': { lat: 41.0054, lng: 28.9768, defaultActivity: 'monument' },
  'hagia sophia': { lat: 41.0086, lng: 28.9802, defaultActivity: 'monument' },
  'blue mosque': { lat: 41.0054, lng: 28.9768, defaultActivity: 'monument' },
  'topkapı': { lat: 41.0115, lng: 28.9833, defaultActivity: 'monument' },
  'topkapi': { lat: 41.0115, lng: 28.9833, defaultActivity: 'monument' },
  'basilica cistern': { lat: 41.0084, lng: 28.9778, defaultActivity: 'monument' },
  'grand bazaar': { lat: 41.0107, lng: 28.9680, defaultActivity: 'culinary' },
  'spice bazaar': { lat: 41.0167, lng: 28.9706, defaultActivity: 'culinary' },
  'galata': { lat: 41.0256, lng: 28.9741, defaultActivity: 'hiking' },
  'taksim': { lat: 41.0370, lng: 28.9850, defaultActivity: 'culture' },
  'pera': { lat: 41.0330, lng: 28.9760, defaultActivity: 'culture' },
  'fener': { lat: 41.0310, lng: 28.9490, defaultActivity: 'hiking' },
  'balat': { lat: 41.0330, lng: 28.9460, defaultActivity: 'hiking' },
  'bosphorus': { lat: 41.0477, lng: 29.0270, defaultActivity: 'boat' },
  'ortaköy': { lat: 41.0477, lng: 29.0270, defaultActivity: 'culinary' },
  'princes islands': { lat: 40.8744, lng: 29.1278, defaultActivity: 'boat' },
  'büyükada': { lat: 40.8650, lng: 29.1250, defaultActivity: 'boat' },
  'bursa': { lat: 40.1885, lng: 29.0610, defaultActivity: 'culture' },
  'çanakkale': { lat: 40.1553, lng: 26.4142, defaultActivity: 'monument' },
  'troy': { lat: 39.9575, lng: 26.2389, defaultActivity: 'monument' },
  'gallipoli': { lat: 40.2472, lng: 26.3144, defaultActivity: 'monument' },

  // Cappadocia & Central Anatolia
  'cappadocia': { lat: 38.6431, lng: 34.8289, defaultActivity: 'balloon' },
  'göreme': { lat: 38.6431, lng: 34.8289, defaultActivity: 'balloon' },
  'goreme': { lat: 38.6431, lng: 34.8289, defaultActivity: 'balloon' },
  'rose valley': { lat: 38.6600, lng: 34.8500, defaultActivity: 'hiking' },
  'pigeon valley': { lat: 38.6250, lng: 34.8100, defaultActivity: 'hiking' },
  'uçhisar': { lat: 38.6300, lng: 34.8050, defaultActivity: 'hiking' },
  'uchisar': { lat: 38.6300, lng: 34.8050, defaultActivity: 'hiking' },
  'ürgüp': { lat: 38.6318, lng: 34.9126, defaultActivity: 'culinary' },
  'urgup': { lat: 38.6318, lng: 34.9126, defaultActivity: 'culinary' },
  'derinkuyu': { lat: 38.3736, lng: 34.7347, defaultActivity: 'monument' },
  'kaymakli': { lat: 38.4600, lng: 34.7500, defaultActivity: 'monument' },
  'avanos': { lat: 38.7150, lng: 34.8450, defaultActivity: 'culture' },
  'konya': { lat: 37.8746, lng: 32.4932, defaultActivity: 'culture' },
  'ankara': { lat: 39.9208, lng: 32.8541, defaultActivity: 'monument' },
  'hattusa': { lat: 40.0194, lng: 34.6156, defaultActivity: 'monument' },

  // Aegean & Turquoise Coast & Mediterranean
  'ephesus': { lat: 37.9497, lng: 27.3685, defaultActivity: 'monument' },
  'selçuk': { lat: 37.9481, lng: 27.3681, defaultActivity: 'monument' },
  'selcuk': { lat: 37.9481, lng: 27.3681, defaultActivity: 'monument' },
  'kuşadası': { lat: 37.8579, lng: 27.2610, defaultActivity: 'boat' },
  'kusadasi': { lat: 37.8579, lng: 27.2610, defaultActivity: 'boat' },
  'şirince': { lat: 37.9439, lng: 27.4331, defaultActivity: 'culinary' },
  'sirince': { lat: 37.9439, lng: 27.4331, defaultActivity: 'culinary' },
  'pamukkale': { lat: 37.9254, lng: 29.1213, defaultActivity: 'hiking' },
  'hierapolis': { lat: 37.9267, lng: 29.1261, defaultActivity: 'monument' },
  'bodrum': { lat: 37.0344, lng: 27.4305, defaultActivity: 'boat' },
  'marmaris': { lat: 36.8550, lng: 28.2740, defaultActivity: 'boat' },
  'fethiye': { lat: 36.6217, lng: 29.1164, defaultActivity: 'hiking' },
  'ölüdeniz': { lat: 36.5492, lng: 29.1256, defaultActivity: 'hiking' },
  'kaş': { lat: 36.1996, lng: 29.6377, defaultActivity: 'boat' },
  'kas': { lat: 36.1996, lng: 29.6377, defaultActivity: 'boat' },
  'kekova': { lat: 36.1833, lng: 29.8667, defaultActivity: 'boat' },
  'antalya': { lat: 36.8841, lng: 30.7056, defaultActivity: 'culture' },
  'pergamum': { lat: 39.1325, lng: 27.1842, defaultActivity: 'monument' },
  'bergama': { lat: 39.1200, lng: 27.1800, defaultActivity: 'monument' },
  'aphrodisias': { lat: 37.7089, lng: 28.7239, defaultActivity: 'monument' },

  // Eastern Anatolia & Mesopotamia
  'şanlıurfa': { lat: 37.1674, lng: 38.7955, defaultActivity: 'culture' },
  'sanliurfa': { lat: 37.1674, lng: 38.7955, defaultActivity: 'culture' },
  'urfa': { lat: 37.1674, lng: 38.7955, defaultActivity: 'culture' },
  'göbeklitepe': { lat: 37.2231, lng: 38.9225, defaultActivity: 'monument' },
  'gobeklitepe': { lat: 37.2231, lng: 38.9225, defaultActivity: 'monument' },
  'mardin': { lat: 37.3129, lng: 40.7339, defaultActivity: 'culture' },
  'nemrut': { lat: 37.9806, lng: 38.7408, defaultActivity: 'monument' },
  'mount nemrut': { lat: 37.9806, lng: 38.7408, defaultActivity: 'monument' },
  'gaziantep': { lat: 37.0662, lng: 37.3833, defaultActivity: 'culinary' },
  'diyarbakır': { lat: 37.9144, lng: 40.2306, defaultActivity: 'monument' },
  'van': { lat: 38.4891, lng: 43.4089, defaultActivity: 'boat' },
  'kars': { lat: 40.6013, lng: 43.0975, defaultActivity: 'monument' },
  'ani': { lat: 40.5075, lng: 43.5728, defaultActivity: 'monument' },
  'trabzon': { lat: 41.0027, lng: 39.7168, defaultActivity: 'monument' },
  'sumela': { lat: 40.6903, lng: 39.6586, defaultActivity: 'monument' },

  // Worldwide Regions (Silk Road, Middle East, Egypt, Morocco, Vietnam, Kenya, Balkans)
  'cairo': { lat: 30.0444, lng: 31.2357, defaultActivity: 'monument' },
  'giza': { lat: 29.9792, lng: 31.1342, defaultActivity: 'monument' },
  'luxor': { lat: 25.6872, lng: 32.6396, defaultActivity: 'monument' },
  'aswan': { lat: 24.0889, lng: 32.8998, defaultActivity: 'boat' },
  'nile': { lat: 25.6872, lng: 32.6396, defaultActivity: 'boat' },
  'marrakech': { lat: 31.6295, lng: -7.9811, defaultActivity: 'culture' },
  'fes': { lat: 34.0181, lng: -5.0078, defaultActivity: 'culture' },
  'chefchaouen': { lat: 35.1688, lng: -5.2684, defaultActivity: 'hiking' },
  'petra': { lat: 30.3285, lng: 35.4444, defaultActivity: 'monument' },
  'wadi rum': { lat: 29.5735, lng: 35.4208, defaultActivity: 'balloon' },
  'amman': { lat: 31.9454, lng: 35.9284, defaultActivity: 'culture' },
  'hanoi': { lat: 21.0285, lng: 105.8542, defaultActivity: 'culinary' },
  'ha long bay': { lat: 20.9101, lng: 107.1839, defaultActivity: 'boat' },
  'hoi an': { lat: 15.8801, lng: 108.3380, defaultActivity: 'culture' },
  'nairobi': { lat: -1.2921, lng: 36.8219, defaultActivity: 'hiking' },
  'masai mara': { lat: -1.4900, lng: 35.1439, defaultActivity: 'balloon' },
  'sarajevo': { lat: 43.8563, lng: 18.4131, defaultActivity: 'culture' },
  'mostar': { lat: 43.3438, lng: 17.8078, defaultActivity: 'monument' },
  'kotor': { lat: 42.4247, lng: 18.7712, defaultActivity: 'boat' },
  'dubrovnik': { lat: 42.6507, lng: 18.0944, defaultActivity: 'monument' },
  'budapest': { lat: 47.4979, lng: 19.0402, defaultActivity: 'culture' },
  'tbilisi': { lat: 41.7151, lng: 44.8271, defaultActivity: 'culture' },
  'yerevan': { lat: 40.1792, lng: 44.4991, defaultActivity: 'monument' },
  'baku': { lat: 40.4093, lng: 49.8671, defaultActivity: 'culture' },
};

/**
 * Extracts the sequential route stops and activity markers for any given tour
 */
export function extractTourRouteStops(tour: Tour): RouteStop[] {
  const stops: RouteStop[] = [];
  const foundNames = new Set<string>();

  // 1. If tour has daysList, inspect each day's title and body
  if (tour.daysList && tour.daysList.length > 0) {
    tour.daysList.forEach((day: TourDay, index: number) => {
      const textToSearch = `${day.title} ${day.body}`.toLowerCase();
      let matchedKey: string | null = null;

      // Check against known coordinates
      for (const key of Object.keys(GEO_COORDINATES)) {
        if (textToSearch.includes(key)) {
          // Prefer longer specific matches
          if (!matchedKey || key.length > matchedKey.length) {
            matchedKey = key;
          }
        }
      }

      if (matchedKey) {
        const coord = GEO_COORDINATES[matchedKey];
        // Clean display name
        const displayName = day.title.length > 3 && !day.title.toLowerCase().startsWith('stop')
          ? day.title
          : matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1);

        // Check if we already have this city/location to group day numbers
        const existing = stops.find(
          (s) => Math.abs(s.lat - coord.lat) < 0.02 && Math.abs(s.lng - coord.lng) < 0.02
        );

        if (existing) {
          if (!existing.dayNumbers.includes(day.day_number)) {
            existing.dayNumbers.push(day.day_number);
          }
        } else {
          // Identify activity type from text keywords
          let activityType = coord.defaultActivity || 'monument';
          if (textToSearch.includes('balloon')) activityType = 'balloon';
          else if (textToSearch.includes('cruise') || textToSearch.includes('boat') || textToSearch.includes('ferry') || textToSearch.includes('kayak')) activityType = 'boat';
          else if (textToSearch.includes('walk') || textToSearch.includes('hike') || textToSearch.includes('trail')) activityType = 'hiking';
          else if (textToSearch.includes('food') || textToSearch.includes('wine') || textToSearch.includes('dine') || textToSearch.includes('tasting') || textToSearch.includes('market') || textToSearch.includes('bazaar')) activityType = 'culinary';
          else if (textToSearch.includes('whirling') || textToSearch.includes('ceramic') || textToSearch.includes('weaving') || textToSearch.includes('artisan') || textToSearch.includes('museum')) activityType = 'culture';

          stops.push({
            id: `stop-${index + 1}-${matchedKey}`,
            name: displayName,
            lat: coord.lat,
            lng: coord.lng,
            dayNumbers: [day.day_number],
            type: stops.length === 0 ? 'city' : (index % 2 === 0 ? 'city' : 'landmark'),
            activityType,
            activityLabel: getActivityLabel(activityType),
            description: day.body.slice(0, 140) + (day.body.length > 140 ? '...' : ''),
          });
          foundNames.add(matchedKey);
        }
      }
    });
  }

  // 2. If no day-by-day stops matched or only 1 stop was found, derive from tour title, region, place, and themes
  if (stops.length < 2) {
    const combinedText = `${tour.title} ${tour.summary} ${tour.description} ${tour.place || ''} ${tour.region || ''}`.toLowerCase();

    // Check all keys in dictionary
    for (const [key, coord] of Object.entries(GEO_COORDINATES)) {
      if (combinedText.includes(key) && !foundNames.has(key)) {
        stops.push({
          id: `stop-${stops.length + 1}-${key}`,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          lat: coord.lat,
          lng: coord.lng,
          dayNumbers: [stops.length + 1],
          type: 'city',
          activityType: coord.defaultActivity || 'monument',
          activityLabel: getActivityLabel(coord.defaultActivity || 'monument'),
          description: `Key destination highlight on the ${tour.title} route.`,
        });
        foundNames.add(key);
        if (stops.length >= 7) break; // Keep reasonable route size
      }
    }
  }

  // 3. Fallback for specific regional defaults if still fewer than 2 stops
  if (stops.length < 2) {
    const regionLower = (tour.region || tour.place || '').toLowerCase();
    if (regionLower.includes('cappadocia') || tour.title.toLowerCase().includes('cappadocia')) {
      stops.push(
        { id: 'cap-1', name: 'Göreme Valley', lat: 38.6431, lng: 34.8289, dayNumbers: [1], type: 'city', activityType: 'balloon', activityLabel: 'Hot Air Balloon Flight', description: 'Dawn flight above volcanic fairy chimneys.' },
        { id: 'cap-2', name: 'Uçhisar Castle', lat: 38.6300, lng: 34.8050, dayNumbers: [2], type: 'landmark', activityType: 'hiking', activityLabel: 'Rock Fortress Panoramic Walk', description: 'Highest viewpoint across Central Anatolia.' },
        { id: 'cap-3', name: 'Derinkuyu Underground City', lat: 38.3736, lng: 34.7347, dayNumbers: [3], type: 'landmark', activityType: 'monument', activityLabel: 'Subterranean Labyrinth Exploration', description: 'Multi-level ancient subterranean refuge.' }
      );
    } else if (regionLower.includes('aegean') || tour.title.toLowerCase().includes('ephesus')) {
      stops.push(
        { id: 'aeg-1', name: 'Ephesus Ancient City', lat: 37.9497, lng: 27.3685, dayNumbers: [1], type: 'city', activityType: 'monument', activityLabel: 'Celsus Library & Marble Way', description: 'Greatest Greco-Roman metropolis of the Mediterranean.' },
        { id: 'aeg-2', name: 'Şirince Village', lat: 37.9439, lng: 27.4331, dayNumbers: [2], type: 'landmark', activityType: 'culinary', activityLabel: 'Artisan Olive Oil & Fruit Wine', description: 'Historic Greek village hillside tasting.' },
        { id: 'aeg-3', name: 'Pamukkale Travertines', lat: 37.9254, lng: 29.1213, dayNumbers: [3], type: 'city', activityType: 'hiking', activityLabel: 'Thermal Calcium Terraces', description: 'Mineral-rich thermal pools & Hierapolis necropolis.' }
      );
    } else {
      // Default to Istanbul heritage circuit
      stops.push(
        { id: 'ist-1', name: 'Sultanahmet & Blue Mosque', lat: 41.0054, lng: 28.9768, dayNumbers: [1], type: 'city', activityType: 'monument', activityLabel: 'Historic Byzantine & Ottoman Heart', description: 'The historic Roman Hippodrome and Blue Mosque.' },
        { id: 'ist-2', name: 'Hagia Sophia & Topkapı', lat: 41.0086, lng: 28.9802, dayNumbers: [1], type: 'landmark', activityType: 'monument', activityLabel: 'Imperial Cathedral & Sultans Palace', description: 'Magnificent 6th-century dome and Treasury.' },
        { id: 'ist-3', name: 'Grand Bazaar & Bosphorus', lat: 41.0167, lng: 28.9706, dayNumbers: [2], type: 'city', activityType: 'culinary', activityLabel: 'Spice Caravanserai & Waterfront Ferry', description: 'Historic trading alleys and continental waterway.' }
      );
    }
  }

  return stops;
}

function getActivityLabel(type: RouteStop['activityType']): string {
  switch (type) {
    case 'balloon': return 'Hot Air Balloon Experience';
    case 'boat': return 'Scenic Cruise / Waterway Journey';
    case 'hiking': return 'Guided Walking / Trail Exploration';
    case 'culinary': return 'Local Food & Culinary Tasting';
    case 'culture': return 'Cultural Heritage & Living Traditions';
    default: return 'Historic Monument & Archaeological Site';
  }
}
