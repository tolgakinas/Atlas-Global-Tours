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

interface GeoEntry {
  lat: number;
  lng: number;
  country: string;
  label: string;
  defaultActivity?: RouteStop['activityType'];
}

// Master country-scoped geo-coordinates registry for destinations, cities & monuments
export const GEO_COORDINATES: Record<string, GeoEntry> = {
  // === TÜRKIYE — Istanbul & Marmara ===
  'istanbul': { lat: 41.0082, lng: 28.9784, country: 'Türkiye', label: 'Istanbul', defaultActivity: 'monument' },
  'sultanahmet': { lat: 41.0054, lng: 28.9768, country: 'Türkiye', label: 'Sultanahmet', defaultActivity: 'monument' },
  'sultan ahmet': { lat: 41.0054, lng: 28.9768, country: 'Türkiye', label: 'Sultanahmet', defaultActivity: 'monument' },
  'binbirdirek': { lat: 41.0074, lng: 28.9746, country: 'Türkiye', label: 'Sultanahmet Square', defaultActivity: 'monument' },
  'hippodrome': { lat: 41.0066, lng: 28.9756, country: 'Türkiye', label: 'Roman Hippodrome', defaultActivity: 'monument' },
  'hagia sophia': { lat: 41.0086, lng: 28.9802, country: 'Türkiye', label: 'Hagia Sophia', defaultActivity: 'monument' },
  'ayasofya': { lat: 41.0086, lng: 28.9802, country: 'Türkiye', label: 'Hagia Sophia', defaultActivity: 'monument' },
  'blue mosque': { lat: 41.0054, lng: 28.9768, country: 'Türkiye', label: 'Blue Mosque', defaultActivity: 'monument' },
  'soğukçeşme': { lat: 41.0099, lng: 28.9818, country: 'Türkiye', label: 'Soğukçeşme Street', defaultActivity: 'culture' },
  'soğukçesme': { lat: 41.0099, lng: 28.9818, country: 'Türkiye', label: 'Soğukçeşme Street', defaultActivity: 'culture' },
  'topkapı': { lat: 41.0115, lng: 28.9833, country: 'Türkiye', label: 'Topkapı Palace', defaultActivity: 'monument' },
  'topkapi': { lat: 41.0115, lng: 28.9833, country: 'Türkiye', label: 'Topkapı Palace', defaultActivity: 'monument' },
  'harem': { lat: 41.0126, lng: 28.9826, country: 'Türkiye', label: 'Imperial Harem (Topkapı)', defaultActivity: 'monument' },
  'basilica cistern': { lat: 41.0084, lng: 28.9778, country: 'Türkiye', label: 'Basilica Cistern', defaultActivity: 'monument' },
  'yerebatan': { lat: 41.0084, lng: 28.9778, country: 'Türkiye', label: 'Basilica Cistern', defaultActivity: 'monument' },
  'chora': { lat: 41.0312, lng: 28.9392, country: 'Türkiye', label: 'Chora Church', defaultActivity: 'monument' },
  'grand bazaar': { lat: 41.0107, lng: 28.9680, country: 'Türkiye', label: 'Grand Bazaar', defaultActivity: 'culinary' },
  'spice bazaar': { lat: 41.0167, lng: 28.9706, country: 'Türkiye', label: 'Spice Bazaar', defaultActivity: 'culinary' },
  'egyptian bazaar': { lat: 41.0167, lng: 28.9706, country: 'Türkiye', label: 'Spice Bazaar', defaultActivity: 'culinary' },
  'rüstem paşa': { lat: 41.0176, lng: 28.9688, country: 'Türkiye', label: 'Rüstem Paşa Mosque', defaultActivity: 'monument' },
  'rustem pasha': { lat: 41.0176, lng: 28.9688, country: 'Türkiye', label: 'Rüstem Paşa Mosque', defaultActivity: 'monument' },
  'süleymaniye': { lat: 41.0161, lng: 28.9642, country: 'Türkiye', label: 'Süleymaniye Mosque', defaultActivity: 'monument' },
  'suleymaniye': { lat: 41.0161, lng: 28.9642, country: 'Türkiye', label: 'Süleymaniye Mosque', defaultActivity: 'monument' },
  'arap camii': { lat: 41.0235, lng: 28.9707, country: 'Türkiye', label: 'Arap Mosque (Galata)', defaultActivity: 'monument' },
  'galata': { lat: 41.0256, lng: 28.9741, country: 'Türkiye', label: 'Galata Tower', defaultActivity: 'hiking' },
  'beyoğlu': { lat: 41.0328, lng: 28.9776, country: 'Türkiye', label: 'Beyoğlu Historic Quarter', defaultActivity: 'culture' },
  'beyoglu': { lat: 41.0328, lng: 28.9776, country: 'Türkiye', label: 'Beyoğlu Historic Quarter', defaultActivity: 'culture' },
  'karaköy': { lat: 41.0225, lng: 28.9769, country: 'Türkiye', label: 'Karaköy', defaultActivity: 'culinary' },
  'karakoy': { lat: 41.0225, lng: 28.9769, country: 'Türkiye', label: 'Karaköy', defaultActivity: 'culinary' },
  'taksim': { lat: 41.0370, lng: 28.9850, country: 'Türkiye', label: 'Taksim Square', defaultActivity: 'culture' },
  'istiklal': { lat: 41.0335, lng: 28.9780, country: 'Türkiye', label: 'İstiklal Avenue', defaultActivity: 'culture' },
  'pera': { lat: 41.0318, lng: 28.9737, country: 'Türkiye', label: 'Pera District', defaultActivity: 'culture' },
  'fener': { lat: 41.0292, lng: 28.9517, country: 'Türkiye', label: 'Fener', defaultActivity: 'hiking' },
  'balat': { lat: 41.0322, lng: 28.9482, country: 'Türkiye', label: 'Balat', defaultActivity: 'hiking' },
  'golden horn': { lat: 41.0270, lng: 28.9620, country: 'Türkiye', label: 'Golden Horn', defaultActivity: 'boat' },
  'haliç': { lat: 41.0270, lng: 28.9620, country: 'Türkiye', label: 'Golden Horn (Haliç)', defaultActivity: 'boat' },
  'halic': { lat: 41.0270, lng: 28.9620, country: 'Türkiye', label: 'Golden Horn (Haliç)', defaultActivity: 'boat' },
  'bosphorus': { lat: 41.0477, lng: 29.0270, country: 'Türkiye', label: 'Bosphorus Strait', defaultActivity: 'boat' },
  'dolmabahçe': { lat: 41.0392, lng: 29.0005, country: 'Türkiye', label: 'Dolmabahçe Palace', defaultActivity: 'monument' },
  'dolmabahce': { lat: 41.0392, lng: 29.0005, country: 'Türkiye', label: 'Dolmabahçe Palace', defaultActivity: 'monument' },
  'ortaköy': { lat: 41.0477, lng: 29.0270, country: 'Türkiye', label: 'Ortaköy', defaultActivity: 'culinary' },
  'kadıköy': { lat: 40.9910, lng: 29.0275, country: 'Türkiye', label: 'Kadıköy', defaultActivity: 'culinary' },
  'kadikoy': { lat: 40.9910, lng: 29.0275, country: 'Türkiye', label: 'Kadıköy', defaultActivity: 'culinary' },
  'üsküdar': { lat: 41.0256, lng: 29.0156, country: 'Türkiye', label: 'Üsküdar', defaultActivity: 'culture' },
  'princes islands': { lat: 40.8744, lng: 29.1278, country: 'Türkiye', label: "Princes' Islands", defaultActivity: 'boat' },
  'büyükada': { lat: 40.8650, lng: 29.1250, country: 'Türkiye', label: 'Büyükada', defaultActivity: 'boat' },
  'belgrad forest': { lat: 41.1869, lng: 28.9875, country: 'Türkiye', label: 'Belgrad Forest', defaultActivity: 'hiking' },
  'şile': { lat: 41.1753, lng: 29.6133, country: 'Türkiye', label: 'Şile', defaultActivity: 'boat' },
  'bursa': { lat: 40.1885, lng: 29.0610, country: 'Türkiye', label: 'Bursa', defaultActivity: 'culture' },
  'nicaea': { lat: 40.4286, lng: 29.7211, country: 'Türkiye', label: 'Nicaea (İznik)', defaultActivity: 'monument' },
  'iznik': { lat: 40.4286, lng: 29.7211, country: 'Türkiye', label: 'İznik (Nicaea)', defaultActivity: 'monument' },
  'iznik (nicaea)': { lat: 40.4286, lng: 29.7211, country: 'Türkiye', label: 'İznik (Nicaea)', defaultActivity: 'monument' },
  'çanakkale': { lat: 40.1553, lng: 26.4142, country: 'Türkiye', label: 'Çanakkale', defaultActivity: 'monument' },
  'canakkale': { lat: 40.1553, lng: 26.4142, country: 'Türkiye', label: 'Çanakkale', defaultActivity: 'monument' },
  'troy': { lat: 39.9575, lng: 26.2389, country: 'Türkiye', label: 'Ancient Troy', defaultActivity: 'monument' },
  'gallipoli': { lat: 40.2472, lng: 26.3144, country: 'Türkiye', label: 'Gallipoli', defaultActivity: 'monument' },

  // === TÜRKIYE — Cappadocia & Central Anatolia ===
  'cappadocia': { lat: 38.6431, lng: 34.8289, country: 'Türkiye', label: 'Cappadocia', defaultActivity: 'balloon' },
  'göreme': { lat: 38.6431, lng: 34.8289, country: 'Türkiye', label: 'Göreme', defaultActivity: 'balloon' },
  'goreme': { lat: 38.6431, lng: 34.8289, country: 'Türkiye', label: 'Göreme', defaultActivity: 'balloon' },
  'rose valley': { lat: 38.6600, lng: 34.8500, country: 'Türkiye', label: 'Red & Rose Valley', defaultActivity: 'hiking' },
  'red valley': { lat: 38.6600, lng: 34.8500, country: 'Türkiye', label: 'Red & Rose Valley', defaultActivity: 'hiking' },
  'love valley': { lat: 38.6625, lng: 34.8195, country: 'Türkiye', label: 'Love Valley', defaultActivity: 'hiking' },
  'pigeon valley': { lat: 38.6345, lng: 34.8140, country: 'Türkiye', label: 'Pigeon Valley', defaultActivity: 'hiking' },
  'ihlara valley': { lat: 38.2536, lng: 34.3033, country: 'Türkiye', label: 'Ihlara Valley', defaultActivity: 'hiking' },
  'ortahisar': { lat: 38.6208, lng: 34.8644, country: 'Türkiye', label: 'Ortahisar', defaultActivity: 'hiking' },
  'uçhisar': { lat: 38.6300, lng: 34.8050, country: 'Türkiye', label: 'Uçhisar', defaultActivity: 'hiking' },
  'uchisar': { lat: 38.6300, lng: 34.8050, country: 'Türkiye', label: 'Uçhisar', defaultActivity: 'hiking' },
  'ürgüp': { lat: 38.6318, lng: 34.9126, country: 'Türkiye', label: 'Ürgüp', defaultActivity: 'culinary' },
  'urgup': { lat: 38.6318, lng: 34.9126, country: 'Türkiye', label: 'Ürgüp', defaultActivity: 'culinary' },
  'derinkuyu': { lat: 38.3736, lng: 34.7347, country: 'Türkiye', label: 'Derinkuyu Underground City', defaultActivity: 'monument' },
  'kaymakli': { lat: 38.4600, lng: 34.7500, country: 'Türkiye', label: 'Kaymaklı Underground City', defaultActivity: 'monument' },
  'avanos': { lat: 38.7150, lng: 34.8450, country: 'Türkiye', label: 'Avanos', defaultActivity: 'culture' },
  'konya': { lat: 37.8746, lng: 32.4932, country: 'Türkiye', label: 'Konya', defaultActivity: 'culture' },
  'ankara': { lat: 39.9208, lng: 32.8541, country: 'Türkiye', label: 'Ankara', defaultActivity: 'monument' },
  'hattusa': { lat: 40.0194, lng: 34.6156, country: 'Türkiye', label: 'Hattusa', defaultActivity: 'monument' },
  'divriği': { lat: 39.3706, lng: 38.1136, country: 'Türkiye', label: 'Divriği', defaultActivity: 'monument' },
  'divrigi': { lat: 39.3706, lng: 38.1136, country: 'Türkiye', label: 'Divriği', defaultActivity: 'monument' },

  // === TÜRKIYE — Aegean, Lycian Coast & Seven Churches ===
  'izmir': { lat: 38.4237, lng: 27.1428, country: 'Türkiye', label: 'İzmir (Smyrna)', defaultActivity: 'culture' },
  'smyrna': { lat: 38.4237, lng: 27.1428, country: 'Türkiye', label: 'Smyrna (İzmir)', defaultActivity: 'monument' },
  'pergamon': { lat: 39.1325, lng: 27.1842, country: 'Türkiye', label: 'Pergamon', defaultActivity: 'monument' },
  'pergamum': { lat: 39.1325, lng: 27.1842, country: 'Türkiye', label: 'Pergamon', defaultActivity: 'monument' },
  'bergama': { lat: 39.1200, lng: 27.1800, country: 'Türkiye', label: 'Bergama (Pergamon)', defaultActivity: 'monument' },
  'thyatira': { lat: 38.9186, lng: 27.8414, country: 'Türkiye', label: 'Thyatira (Akhisar)', defaultActivity: 'monument' },
  'sardis': { lat: 38.4883, lng: 28.0403, country: 'Türkiye', label: 'Sardis', defaultActivity: 'monument' },
  'philadelphia': { lat: 38.3508, lng: 28.5172, country: 'Türkiye', label: 'Philadelphia (Alaşehir)', defaultActivity: 'monument' },
  'laodicea': { lat: 37.8358, lng: 29.1075, country: 'Türkiye', label: 'Laodicea', defaultActivity: 'monument' },
  'ephesus': { lat: 37.9497, lng: 27.3685, country: 'Türkiye', label: 'Ephesus', defaultActivity: 'monument' },
  'selçuk': { lat: 37.9481, lng: 27.3681, country: 'Türkiye', label: 'Selçuk', defaultActivity: 'monument' },
  'selcuk': { lat: 37.9481, lng: 27.3681, country: 'Türkiye', label: 'Selçuk', defaultActivity: 'monument' },
  'kuşadası': { lat: 37.8579, lng: 27.2610, country: 'Türkiye', label: 'Kuşadası', defaultActivity: 'boat' },
  'kusadasi': { lat: 37.8579, lng: 27.2610, country: 'Türkiye', label: 'Kuşadası', defaultActivity: 'boat' },
  'şirince': { lat: 37.9439, lng: 27.4331, country: 'Türkiye', label: 'Şirince Village', defaultActivity: 'culinary' },
  'sirince': { lat: 37.9439, lng: 27.4331, country: 'Türkiye', label: 'Şirince Village', defaultActivity: 'culinary' },
  'pamukkale': { lat: 37.9254, lng: 29.1213, country: 'Türkiye', label: 'Pamukkale', defaultActivity: 'hiking' },
  'hierapolis': { lat: 37.9267, lng: 29.1261, country: 'Türkiye', label: 'Hierapolis', defaultActivity: 'monument' },
  'aphrodisias': { lat: 37.7089, lng: 28.7239, country: 'Türkiye', label: 'Aphrodisias', defaultActivity: 'monument' },
  'bodrum': { lat: 37.0344, lng: 27.4305, country: 'Türkiye', label: 'Bodrum', defaultActivity: 'boat' },
  'marmaris': { lat: 36.8550, lng: 28.2740, country: 'Türkiye', label: 'Marmaris', defaultActivity: 'boat' },
  'dalyan': { lat: 36.8342, lng: 28.6425, country: 'Türkiye', label: 'Dalyan', defaultActivity: 'boat' },
  'fethiye': { lat: 36.6217, lng: 29.1164, country: 'Türkiye', label: 'Fethiye', defaultActivity: 'hiking' },
  'ovacık': { lat: 36.5786, lng: 29.1469, country: 'Türkiye', label: 'Ovacık (Lycian Trailhead)', defaultActivity: 'hiking' },
  'ovacik': { lat: 36.5786, lng: 29.1469, country: 'Türkiye', label: 'Ovacık (Lycian Trailhead)', defaultActivity: 'hiking' },
  'ölüdeniz': { lat: 36.5492, lng: 29.1256, country: 'Türkiye', label: 'Ölüdeniz', defaultActivity: 'hiking' },
  'faralya': { lat: 36.4947, lng: 29.1319, country: 'Türkiye', label: 'Faralya', defaultActivity: 'hiking' },
  'kabak': { lat: 36.4633, lng: 29.1233, country: 'Türkiye', label: 'Kabak Valley', defaultActivity: 'hiking' },
  'alınca': { lat: 36.4475, lng: 29.1436, country: 'Türkiye', label: 'Alınca', defaultActivity: 'hiking' },
  'alinca': { lat: 36.4475, lng: 29.1436, country: 'Türkiye', label: 'Alınca', defaultActivity: 'hiking' },
  'sidyma': { lat: 36.4050, lng: 29.1883, country: 'Türkiye', label: 'Sidyma Ancient Ruins', defaultActivity: 'hiking' },
  'xanthos': { lat: 36.3561, lng: 29.3186, country: 'Türkiye', label: 'Xanthos & Letoon', defaultActivity: 'monument' },
  'letoon': { lat: 36.3322, lng: 29.2897, country: 'Türkiye', label: 'Letoon & Xanthos', defaultActivity: 'monument' },
  'saklıkent': { lat: 36.4753, lng: 29.4036, country: 'Türkiye', label: 'Saklıkent Gorge', defaultActivity: 'hiking' },
  'kaş': { lat: 36.1996, lng: 29.6377, country: 'Türkiye', label: 'Kaş', defaultActivity: 'boat' },
  'kas': { lat: 36.1996, lng: 29.6377, country: 'Türkiye', label: 'Kaş', defaultActivity: 'boat' },
  'aperlai': { lat: 36.1586, lng: 29.7825, country: 'Türkiye', label: 'Apollonia to Aperlai', defaultActivity: 'hiking' },
  'apollonia': { lat: 36.1783, lng: 29.7667, country: 'Türkiye', label: 'Apollonia & Aperlai', defaultActivity: 'hiking' },
  'kekova': { lat: 36.1833, lng: 29.8667, country: 'Türkiye', label: 'Kekova Sunken City', defaultActivity: 'boat' },
  'antalya': { lat: 36.8841, lng: 30.7056, country: 'Türkiye', label: 'Antalya', defaultActivity: 'culture' },

  // === TÜRKIYE — Eastern Anatolia, Black Sea & Mesopotamia ===
  'gaziantep': { lat: 37.0662, lng: 37.3833, country: 'Türkiye', label: 'Gaziantep', defaultActivity: 'culinary' },
  'mount nemrut': { lat: 37.9806, lng: 38.7408, country: 'Türkiye', label: 'Mount Nemrut', defaultActivity: 'monument' },
  'nemrut': { lat: 37.9806, lng: 38.7408, country: 'Türkiye', label: 'Mount Nemrut', defaultActivity: 'monument' },
  'göbeklitepe': { lat: 37.2231, lng: 38.9225, country: 'Türkiye', label: 'Göbeklitepe', defaultActivity: 'monument' },
  'gobeklitepe': { lat: 37.2231, lng: 38.9225, country: 'Türkiye', label: 'Göbeklitepe', defaultActivity: 'monument' },
  'şanlıurfa': { lat: 37.1674, lng: 38.7955, country: 'Türkiye', label: 'Şanlıurfa', defaultActivity: 'culture' },
  'sanliurfa': { lat: 37.1674, lng: 38.7955, country: 'Türkiye', label: 'Şanlıurfa', defaultActivity: 'culture' },
  'urfa': { lat: 37.1674, lng: 38.7955, country: 'Türkiye', label: 'Şanlıurfa', defaultActivity: 'culture' },
  'harran': { lat: 36.8639, lng: 39.0314, country: 'Türkiye', label: 'Harran', defaultActivity: 'monument' },
  'mardin': { lat: 37.3129, lng: 40.7339, country: 'Türkiye', label: 'Mardin', defaultActivity: 'culture' },
  'midyat': { lat: 37.4167, lng: 41.3667, country: 'Türkiye', label: 'Midyat', defaultActivity: 'culture' },
  'diyarbakır': { lat: 37.9144, lng: 40.2306, country: 'Türkiye', label: 'Diyarbakır', defaultActivity: 'monument' },
  'diyarbakir': { lat: 37.9144, lng: 40.2306, country: 'Türkiye', label: 'Diyarbakır', defaultActivity: 'monument' },
  'van': { lat: 38.4891, lng: 43.4089, country: 'Türkiye', label: 'Lake Van', defaultActivity: 'boat' },
  'erzurum': { lat: 39.9043, lng: 41.2679, country: 'Türkiye', label: 'Erzurum', defaultActivity: 'culture' },
  'kars': { lat: 40.6013, lng: 43.0975, country: 'Türkiye', label: 'Kars', defaultActivity: 'monument' },
  'ani': { lat: 40.5075, lng: 43.5728, country: 'Türkiye', label: 'Ancient City of Ani', defaultActivity: 'monument' },
  'trabzon': { lat: 41.0027, lng: 39.7168, country: 'Türkiye', label: 'Trabzon', defaultActivity: 'monument' },
  'sümela': { lat: 40.6903, lng: 39.6586, country: 'Türkiye', label: 'Sümela Monastery', defaultActivity: 'monument' },
  'sumela': { lat: 40.6903, lng: 39.6586, country: 'Türkiye', label: 'Sümela Monastery', defaultActivity: 'monument' },

  // === EGYPT ===
  'cairo': { lat: 30.0444, lng: 31.2357, country: 'Egypt', label: 'Cairo', defaultActivity: 'monument' },
  'grand egyptian museum': { lat: 29.9949, lng: 31.1195, country: 'Egypt', label: 'Grand Egyptian Museum', defaultActivity: 'culture' },
  'giza': { lat: 29.9792, lng: 31.1342, country: 'Egypt', label: 'Great Pyramids of Giza', defaultActivity: 'monument' },
  'sphinx': { lat: 29.9753, lng: 31.1376, country: 'Egypt', label: 'Great Sphinx of Giza', defaultActivity: 'monument' },
  'valley temple': { lat: 29.9742, lng: 31.1388, country: 'Egypt', label: 'Valley Temple of Khafre', defaultActivity: 'monument' },
  'panoramic photo': { lat: 29.9631, lng: 31.1235, country: 'Egypt', label: 'Giza Plateau Panorama', defaultActivity: 'hiking' },
  'aswan': { lat: 24.0889, lng: 32.8998, country: 'Egypt', label: 'Aswan', defaultActivity: 'boat' },
  'abu simbel': { lat: 22.3372, lng: 31.6258, country: 'Egypt', label: 'Abu Simbel Temples', defaultActivity: 'monument' },
  'kom ombo': { lat: 24.4521, lng: 32.9282, country: 'Egypt', label: 'Kom Ombo Temple', defaultActivity: 'monument' },
  'ob-kombo': { lat: 24.4521, lng: 32.9282, country: 'Egypt', label: 'Kom Ombo & Edfu', defaultActivity: 'monument' },
  'edfu': { lat: 24.9779, lng: 32.8734, country: 'Egypt', label: 'Edfu Temple', defaultActivity: 'monument' },
  'luxor': { lat: 25.6872, lng: 32.6396, country: 'Egypt', label: 'Luxor', defaultActivity: 'monument' },
  'karnak': { lat: 25.7188, lng: 32.6573, country: 'Egypt', label: 'Karnak Temple', defaultActivity: 'monument' },
  'valley of the kings': { lat: 25.7402, lng: 32.6014, country: 'Egypt', label: 'Valley of the Kings', defaultActivity: 'monument' },
  'valley the king': { lat: 25.7402, lng: 32.6014, country: 'Egypt', label: 'Valley of the Kings', defaultActivity: 'monument' },
  'hurghada': { lat: 27.2579, lng: 33.8116, country: 'Egypt', label: 'Hurghada (Red Sea)', defaultActivity: 'boat' },
  'nile': { lat: 25.2500, lng: 32.5500, country: 'Egypt', label: 'Nile River Cruise', defaultActivity: 'boat' },

  // === JORDAN ===
  'amman': { lat: 31.9454, lng: 35.9284, country: 'Jordan', label: 'Amman', defaultActivity: 'culture' },
  'jerash': { lat: 32.2808, lng: 35.8914, country: 'Jordan', label: 'Jerash & Ajloun', defaultActivity: 'monument' },
  'ajloun': { lat: 32.3326, lng: 35.7519, country: 'Jordan', label: 'Ajloun Castle', defaultActivity: 'monument' },
  'wadi rum': { lat: 29.5735, lng: 35.4208, country: 'Jordan', label: 'Wadi Rum Desert', defaultActivity: 'hiking' },
  'petra': { lat: 30.3285, lng: 35.4444, country: 'Jordan', label: 'Petra', defaultActivity: 'monument' },
  'shobak': { lat: 30.5317, lng: 35.5608, country: 'Jordan', label: 'Shobak Castle', defaultActivity: 'monument' },
  'dead sea': { lat: 31.5590, lng: 35.4732, country: 'Jordan', label: 'Dead Sea', defaultActivity: 'boat' },

  // === MOROCCO ===
  'casablanca': { lat: 33.5731, lng: -7.5898, country: 'Morocco', label: 'Casablanca', defaultActivity: 'culture' },
  'rabat': { lat: 34.0209, lng: -6.8416, country: 'Morocco', label: 'Rabat', defaultActivity: 'monument' },
  'chefchaouen': { lat: 35.1688, lng: -5.2684, country: 'Morocco', label: 'Chefchaouen', defaultActivity: 'hiking' },
  'fes': { lat: 34.0181, lng: -5.0078, country: 'Morocco', label: 'Fes', defaultActivity: 'culture' },
  'fez': { lat: 34.0181, lng: -5.0078, country: 'Morocco', label: 'Fes', defaultActivity: 'culture' },
  'midelt': { lat: 32.6852, lng: -4.7451, country: 'Morocco', label: 'Midelt (Atlas Mountains)', defaultActivity: 'hiking' },
  'merzouga': { lat: 31.0802, lng: -4.0134, country: 'Morocco', label: 'Merzouga & Sahara Dunes', defaultActivity: 'hiking' },
  'sahara': { lat: 31.0802, lng: -4.0134, country: 'Morocco', label: 'Sahara Desert', defaultActivity: 'hiking' },
  'todra gorge': { lat: 31.5889, lng: -5.5961, country: 'Morocco', label: 'Todra Gorge', defaultActivity: 'hiking' },
  'dades valley': { lat: 31.4517, lng: -5.9717, country: 'Morocco', label: 'Dades Valley', defaultActivity: 'hiking' },
  'ait benhaddou': { lat: 31.0472, lng: -7.1319, country: 'Morocco', label: 'Aït Benhaddou', defaultActivity: 'monument' },
  'aït benhaddou': { lat: 31.0472, lng: -7.1319, country: 'Morocco', label: 'Aït Benhaddou', defaultActivity: 'monument' },
  'ouarzazate': { lat: 30.9335, lng: -6.9370, country: 'Morocco', label: 'Ouarzazate', defaultActivity: 'monument' },
  'marrakech': { lat: 31.6295, lng: -7.9811, country: 'Morocco', label: 'Marrakech', defaultActivity: 'culinary' },
  'marrakesh': { lat: 31.6295, lng: -7.9811, country: 'Morocco', label: 'Marrakech', defaultActivity: 'culinary' },

  // === TUNISIA ===
  'tunis': { lat: 36.8065, lng: 10.1815, country: 'Tunisia', label: 'Tunis', defaultActivity: 'culture' },
  'hammamet': { lat: 36.4000, lng: 10.6167, country: 'Tunisia', label: 'Hammamet', defaultActivity: 'boat' },
  'carthage': { lat: 36.8528, lng: 10.3233, country: 'Tunisia', label: 'Carthage', defaultActivity: 'monument' },
  'sidi bou said': { lat: 36.8700, lng: 10.3414, country: 'Tunisia', label: 'Sidi Bou Said', defaultActivity: 'culture' },
  'dougga': { lat: 36.4225, lng: 9.2189, country: 'Tunisia', label: 'Dougga Roman Ruins', defaultActivity: 'monument' },
  'bulla regia': { lat: 36.5586, lng: 8.7556, country: 'Tunisia', label: 'Bulla Regia', defaultActivity: 'monument' },
  'matmata': { lat: 33.5444, lng: 9.9717, country: 'Tunisia', label: 'Matmata', defaultActivity: 'culture' },
  'ksar ghilane': { lat: 32.9833, lng: 9.6333, country: 'Tunisia', label: 'Ksar Ghilane Oasis', defaultActivity: 'hiking' },
  'douz': { lat: 33.4663, lng: 9.0203, country: 'Tunisia', label: 'Douz (Gateway to Sahara)', defaultActivity: 'hiking' },
  'chott el jerid': { lat: 33.7000, lng: 8.4333, country: 'Tunisia', label: 'Chott el Jerid', defaultActivity: 'hiking' },
  'tozeur': { lat: 33.9197, lng: 8.1335, country: 'Tunisia', label: 'Tozeur Oasis', defaultActivity: 'culture' },
  'sbeitla': { lat: 35.2297, lng: 9.1294, country: 'Tunisia', label: 'Sbeitla', defaultActivity: 'monument' },
  'kairouan': { lat: 35.6781, lng: 10.0963, country: 'Tunisia', label: 'Kairouan', defaultActivity: 'monument' },
  'el jem': { lat: 35.2964, lng: 10.7069, country: 'Tunisia', label: 'El Jem Amphitheatre', defaultActivity: 'monument' },
  'sousse': { lat: 35.8256, lng: 10.6369, country: 'Tunisia', label: 'Sousse', defaultActivity: 'boat' },

  // === KENYA ===
  'nairobi': { lat: -1.2921, lng: 36.8219, country: 'Kenya', label: 'Nairobi', defaultActivity: 'culture' },
  'amboseli': { lat: -2.6527, lng: 37.2606, country: 'Kenya', label: 'Amboseli National Park', defaultActivity: 'hiking' },
  'lake naivasha': { lat: -0.7667, lng: 36.3500, country: 'Kenya', label: 'Lake Naivasha', defaultActivity: 'boat' },
  'naivasha': { lat: -0.7667, lng: 36.3500, country: 'Kenya', label: 'Lake Naivasha', defaultActivity: 'boat' },
  'lake nakuru': { lat: -0.3667, lng: 36.0833, country: 'Kenya', label: 'Lake Nakuru National Park', defaultActivity: 'hiking' },
  'nakuru': { lat: -0.3667, lng: 36.0833, country: 'Kenya', label: 'Lake Nakuru National Park', defaultActivity: 'hiking' },
  'maasai mara': { lat: -1.4900, lng: 35.1439, country: 'Kenya', label: 'Maasai Mara National Reserve', defaultActivity: 'balloon' },
  'masai mara': { lat: -1.4900, lng: 35.1439, country: 'Kenya', label: 'Maasai Mara National Reserve', defaultActivity: 'balloon' },

  // === VIETNAM ===
  'hanoi': { lat: 21.0285, lng: 105.8542, country: 'Vietnam', label: 'Hanoi', defaultActivity: 'culinary' },
  'ha long': { lat: 20.9101, lng: 107.1839, country: 'Vietnam', label: 'Ha Long & Lan Ha Bay', defaultActivity: 'boat' },
  'ha long bay': { lat: 20.9101, lng: 107.1839, country: 'Vietnam', label: 'Ha Long Bay', defaultActivity: 'boat' },
  'lan ha bay': { lat: 20.7250, lng: 107.0650, country: 'Vietnam', label: 'Lan Ha Bay', defaultActivity: 'boat' },
  'hue': { lat: 16.4637, lng: 107.5909, country: 'Vietnam', label: 'Huế Imperial City', defaultActivity: 'monument' },
  'da nang': { lat: 16.0544, lng: 108.2022, country: 'Vietnam', label: 'Da Nang & Ba Na Hills', defaultActivity: 'boat' },
  'hoi an': { lat: 15.8801, lng: 108.3380, country: 'Vietnam', label: 'Hoi An Ancient Town', defaultActivity: 'culture' },
  'ho chi minh city': { lat: 10.8231, lng: 106.6297, country: 'Vietnam', label: 'Ho Chi Minh City', defaultActivity: 'culture' },
  'cu chi': { lat: 11.1424, lng: 106.4622, country: 'Vietnam', label: 'Cu Chi Tunnels', defaultActivity: 'monument' },
  'mekong delta': { lat: 10.0452, lng: 105.7469, country: 'Vietnam', label: 'Mekong Delta', defaultActivity: 'boat' },

  // === SRI LANKA ===
  'colombo': { lat: 6.9271, lng: 79.8612, country: 'Sri Lanka', label: 'Colombo', defaultActivity: 'culture' },
  'negombo': { lat: 7.2083, lng: 79.8358, country: 'Sri Lanka', label: 'Negombo', defaultActivity: 'boat' },
  'sigiriya': { lat: 7.9570, lng: 80.7603, country: 'Sri Lanka', label: 'Sigiriya Lion Rock', defaultActivity: 'monument' },
  'dambulla': { lat: 7.8567, lng: 80.6492, country: 'Sri Lanka', label: 'Dambulla Cave Temple', defaultActivity: 'monument' },
  'polonnaruwa': { lat: 7.9403, lng: 81.0188, country: 'Sri Lanka', label: 'Polonnaruwa Ancient City', defaultActivity: 'monument' },
  'kandy': { lat: 7.2906, lng: 80.6337, country: 'Sri Lanka', label: 'Kandy', defaultActivity: 'culture' },
  'nuwara eliya': { lat: 6.9497, lng: 80.7891, country: 'Sri Lanka', label: 'Nuwara Eliya Tea Hills', defaultActivity: 'hiking' },
  'ella': { lat: 6.8667, lng: 81.0466, country: 'Sri Lanka', label: 'Ella & Nine Arches Bridge', defaultActivity: 'hiking' },
  'nine arches': { lat: 6.8768, lng: 81.0608, country: 'Sri Lanka', label: 'Nine Arches Bridge, Ella', defaultActivity: 'hiking' },
  'ravana falls': { lat: 6.8408, lng: 81.0542, country: 'Sri Lanka', label: 'Ravana Falls & Little Adam’s Peak', defaultActivity: 'hiking' },
  'udawalawe': { lat: 6.4744, lng: 80.8986, country: 'Sri Lanka', label: 'Udawalawe Safari', defaultActivity: 'hiking' },
  'yala': { lat: 6.3728, lng: 81.5169, country: 'Sri Lanka', label: 'Yala National Park', defaultActivity: 'hiking' },
  'mirissa': { lat: 5.9483, lng: 80.4716, country: 'Sri Lanka', label: 'Mirissa Coast', defaultActivity: 'boat' },
  'galle': { lat: 6.0267, lng: 80.2170, country: 'Sri Lanka', label: 'Galle Dutch Fort', defaultActivity: 'monument' },
  'bentota': { lat: 6.4211, lng: 79.9989, country: 'Sri Lanka', label: 'Bentota Beach', defaultActivity: 'boat' },

  // === OMAN & UNITED ARAB EMIRATES ===
  'muscat': { lat: 23.5880, lng: 58.3829, country: 'Oman', label: 'Muscat', defaultActivity: 'culture' },
  'jebel akhdar': { lat: 23.0736, lng: 57.6611, country: 'Oman', label: 'Jebel Akhdar', defaultActivity: 'hiking' },
  'nizwa': { lat: 22.9333, lng: 57.5333, country: 'Oman', label: 'Nizwa Fort & Falaj Daris', defaultActivity: 'monument' },
  'wahiba sands': { lat: 22.4500, lng: 58.7500, country: 'Oman', label: 'Wahiba Sands Desert', defaultActivity: 'hiking' },
  'wadi bani khalid': { lat: 22.6186, lng: 59.0933, country: 'Oman', label: 'Wadi Bani Khalid', defaultActivity: 'boat' },
  'ras al jinz': { lat: 22.4267, lng: 59.8256, country: 'Oman', label: 'Ras Al Jinz Turtle Reserve', defaultActivity: 'boat' },
  'qalhat': { lat: 22.6975, lng: 59.3736, country: 'Oman', label: 'Qalhat & Bimmah Sinkhole', defaultActivity: 'monument' },
  'bimmah sinkhole': { lat: 23.0361, lng: 59.0719, country: 'Oman', label: 'Bimmah Sinkhole', defaultActivity: 'boat' },
  'sahar': { lat: 24.3619, lng: 56.7303, country: 'Oman', label: 'Sohar Old Town', defaultActivity: 'culture' },
  'sohar': { lat: 24.3619, lng: 56.7303, country: 'Oman', label: 'Sohar Old Town', defaultActivity: 'culture' },
  'dubai': { lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates', label: 'Dubai', defaultActivity: 'culture' },
  'abu dhabi': { lat: 24.4539, lng: 54.3773, country: 'United Arab Emirates', label: 'Abu Dhabi', defaultActivity: 'monument' },

  // === HUNGARY, ROMANIA & BULGARIA (Transylvania & Danube) ===
  'budapest': { lat: 47.4979, lng: 19.0402, country: 'Hungary', label: 'Budapest', defaultActivity: 'culture' },
  'pecs': { lat: 46.0727, lng: 18.2323, country: 'Hungary', label: 'Pécs', defaultActivity: 'culture' },
  'pécs': { lat: 46.0727, lng: 18.2323, country: 'Hungary', label: 'Pécs', defaultActivity: 'culture' },
  'maramureș': { lat: 47.7833, lng: 24.0000, country: 'Romania', label: 'Maramureș', defaultActivity: 'culture' },
  'maramures': { lat: 47.7833, lng: 24.0000, country: 'Romania', label: 'Maramureș', defaultActivity: 'culture' },
  'suceava': { lat: 47.6514, lng: 26.2556, country: 'Romania', label: 'Suceava Painted Monasteries', defaultActivity: 'monument' },
  'voroneț': { lat: 47.5172, lng: 25.8642, country: 'Romania', label: 'Voroneț Monastery', defaultActivity: 'monument' },
  'voronet': { lat: 47.5172, lng: 25.8642, country: 'Romania', label: 'Voroneț Monastery', defaultActivity: 'monument' },
  'sighișoara': { lat: 46.2197, lng: 24.7922, country: 'Romania', label: 'Sighișoara Citadel', defaultActivity: 'monument' },
  'sighisoara': { lat: 46.2197, lng: 24.7922, country: 'Romania', label: 'Sighișoara Citadel', defaultActivity: 'monument' },
  'biertan': { lat: 46.1353, lng: 24.5214, country: 'Romania', label: 'Biertan Fortified Church', defaultActivity: 'monument' },
  'brașov': { lat: 45.6427, lng: 25.5887, country: 'Romania', label: 'Brașov', defaultActivity: 'culture' },
  'brasov': { lat: 45.6427, lng: 25.5887, country: 'Romania', label: 'Brașov', defaultActivity: 'culture' },
  'bran': { lat: 45.5149, lng: 25.3672, country: 'Romania', label: 'Bran Castle', defaultActivity: 'monument' },
  'bucharest': { lat: 44.4268, lng: 26.1025, country: 'Romania', label: 'Bucharest', defaultActivity: 'culture' },
  'veliko tarnovo': { lat: 43.0757, lng: 25.6172, country: 'Bulgaria', label: 'Veliko Tarnovo & Arbanassi', defaultActivity: 'monument' },
  'ivanovo': { lat: 43.6947, lng: 25.9875, country: 'Bulgaria', label: 'Ivanovo Rock-Hewn Churches', defaultActivity: 'monument' },
  'sofia': { lat: 42.6977, lng: 23.3219, country: 'Bulgaria', label: 'Sofia & Boyana Church', defaultActivity: 'culture' },

  // === BALKANS (Serbia, Bosnia, Croatia, Montenegro) ===
  'belgrade': { lat: 44.8125, lng: 20.4612, country: 'Serbia', label: 'Belgrade', defaultActivity: 'culture' },
  'tara nat. park': { lat: 43.8936, lng: 19.4422, country: 'Serbia', label: 'Tara National Park', defaultActivity: 'hiking' },
  'tara national park': { lat: 43.8936, lng: 19.4422, country: 'Serbia', label: 'Tara National Park', defaultActivity: 'hiking' },
  'sarajevo': { lat: 43.8563, lng: 18.4131, country: 'Bosnia', label: 'Sarajevo', defaultActivity: 'culture' },
  'mostar': { lat: 43.3438, lng: 17.8078, country: 'Bosnia', label: 'Mostar Old Bridge', defaultActivity: 'monument' },
  'split': { lat: 43.5081, lng: 16.4402, country: 'Croatia', label: 'Split', defaultActivity: 'monument' },
  'dubrovnik': { lat: 42.6507, lng: 18.0944, country: 'Croatia', label: 'Dubrovnik', defaultActivity: 'monument' },
  'kotor': { lat: 42.4247, lng: 18.7712, country: 'Montenegro', label: 'Bay of Kotor', defaultActivity: 'boat' },
  'perast': { lat: 42.4867, lng: 18.6989, country: 'Montenegro', label: 'Perast', defaultActivity: 'boat' },

  // === CAUCASUS (Armenia, Georgia, Azerbaijan) ===
  'yerevan': { lat: 40.1792, lng: 44.4991, country: 'Armenia', label: 'Yerevan', defaultActivity: 'monument' },
  'geghard': { lat: 40.1404, lng: 44.8185, country: 'Armenia', label: 'Geghard & Garni', defaultActivity: 'monument' },
  'zvartnots': { lat: 40.1603, lng: 44.3364, country: 'Armenia', label: 'Zvartnots & Geghard', defaultActivity: 'monument' },
  'haghpat': { lat: 41.0936, lng: 44.7119, country: 'Armenia', label: 'Haghpat & Sanahin Monasteries', defaultActivity: 'monument' },
  'lake sevan': { lat: 40.5500, lng: 45.0167, country: 'Armenia', label: 'Lake Sevan', defaultActivity: 'boat' },
  'khor virap': { lat: 39.8783, lng: 44.5761, country: 'Armenia', label: 'Khor Virap', defaultActivity: 'monument' },
  'kakheti': { lat: 41.6482, lng: 45.6906, country: 'Georgia', label: 'Kakheti Wine Region', defaultActivity: 'culinary' },
  'kakheti̇': { lat: 41.6482, lng: 45.6906, country: 'Georgia', label: 'Kakheti Wine Region', defaultActivity: 'culinary' },
  'tbilisi': { lat: 41.7151, lng: 44.8271, country: 'Georgia', label: 'Tbilisi', defaultActivity: 'culture' },
  'kazbegi': { lat: 42.6628, lng: 44.6203, country: 'Georgia', label: 'Kazbegi (Mount Kazbek)', defaultActivity: 'hiking' },
  'gori': { lat: 41.9842, lng: 44.1158, country: 'Georgia', label: 'Gori & Uplistsikhe', defaultActivity: 'monument' },
  'baku': { lat: 40.4093, lng: 49.8671, country: 'Azerbaijan', label: 'Baku', defaultActivity: 'culture' },
  'gobustan': { lat: 40.1056, lng: 49.3811, country: 'Azerbaijan', label: 'Gobustan', defaultActivity: 'monument' },
};

const GENERIC_KEYS = new Set(['nile', 'sahara', 'istanbul']);

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

function normalizeCountry(c: string): string {
  const low = c.toLowerCase().trim();
  if (low === 'turkey' || low === 'türkiye' || low === 'turkiye') return 'Türkiye';
  if (low.includes('bosnia')) return 'Bosnia';
  if (low.includes('emirates') || low === 'uae') return 'United Arab Emirates';
  if (low === 'azarbaijan') return 'Azerbaijan';
  return c.trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Precompile Unicode-aware word-boundary regexes so "van" never matches "minivan" and "ani" never matches "animal"
const KEY_ENTRIES = Object.entries(GEO_COORDINATES)
  .map(([key, entry]) => ({
    key,
    entry,
    regex: new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegExp(key)}(?:$|[^\\p{L}\\p{N}])`, 'iu'),
  }))
  .sort((a, b) => b.key.length - a.key.length);

function findMatchesInText(text: string, allowedCountries: Set<string>): Array<{ key: string; entry: GeoEntry; index: number }> {
  const normalized = text.toLocaleLowerCase('en-US');
  const matches: Array<{ key: string; entry: GeoEntry; index: number }> = [];

  for (const item of KEY_ENTRIES) {
    if (allowedCountries.size > 0 && !allowedCountries.has(item.entry.country)) {
      continue;
    }
    const m = item.regex.exec(normalized);
    if (m) {
      matches.push({ key: item.key, entry: item.entry, index: m.index });
    }
  }
  // Sort by position in text (left to right), tie-break by longer key
  matches.sort((a, b) => a.index - b.index || b.key.length - a.key.length);

  // Drop generic broad keys (like 'nile' or 'istanbul') if a more specific site in the same country also matched
  const specific = matches.filter((m) => !GENERIC_KEYS.has(m.key));
  return specific.length > 0 ? specific : matches;
}

function inferActivityType(textLower: string, fallback?: RouteStop['activityType']): RouteStop['activityType'] {
  if (textLower.includes('balloon')) return 'balloon';
  if (textLower.includes('cruise') || textLower.includes('boat') || textLower.includes('ferry') || textLower.includes('kayak') || textLower.includes('diving')) return 'boat';
  if (textLower.includes('walk') || textLower.includes('hike') || textLower.includes('trail') || textLower.includes('safari') || textLower.includes('trek') || textLower.includes('biking')) return 'hiking';
  if (textLower.includes('food') || textLower.includes('wine') || textLower.includes('dine') || textLower.includes('tasting') || textLower.includes('market') || textLower.includes('bazaar') || textLower.includes('breakfast') || textLower.includes('cooking')) return 'culinary';
  if (textLower.includes('whirling') || textLower.includes('ceramic') || textLower.includes('weaving') || textLower.includes('artisan') || textLower.includes('museum')) return 'culture';
  return fallback || 'monument';
}

function formatStopDisplayName(rawTitle: string, fallbackLabel: string): string {
  const cleaned = rawTitle
    .replace(/^[\u2B50\u2728\u2022*\s]+/, '')
    .replace(/[*,\s]+$/, '')
    .trim();
  if (cleaned.length < 3 || cleaned.length > 72 || cleaned.toLowerCase().startsWith('stop')) {
    return fallbackLabel;
  }
  return cleaned;
}

/**
 * Extracts the sequential route stops and activity markers for any given tour.
 * Uses strict Unicode word-boundary and country-scoped matching so no tour ever
 * plots off-country false positives.
 */
export function extractTourRouteStops(tour: Tour): RouteStop[] {
  const stops: RouteStop[] = [];
  const allowedCountries = new Set<string>((tour.countries || []).map(normalizeCountry));

  // Transylvania & Danube itinerary crosses into Bulgaria (Veliko Tarnovo & Sofia) on Days 8-9
  const fullTextHint = `${tour.slug} ${tour.title} ${(tour.daysList || []).map((d) => d.title).join(' ')}`.toLowerCase();
  if (fullTextHint.includes('sofia') || fullTextHint.includes('veliko tarnovo') || fullTextHint.includes('bulgaria')) {
    allowedCountries.add('Bulgaria');
  }

  // Use finer proximity radius for single-city day tours so nearby monuments plot individually
  const proximityThreshold = tour.tour_type === 'day' || tour.days === 1 ? 0.0008 : 0.015;
  const isNearCoord = (aLat: number, aLng: number, bLat: number, bLng: number) =>
    Math.abs(aLat - bLat) < proximityThreshold && Math.abs(aLng - bLng) < proximityThreshold;

  // 1. Inspect each day in daysList — prioritize day.title over day.body
  if (tour.daysList && tour.daysList.length > 0) {
    tour.daysList.forEach((day: TourDay, index: number) => {
      const cleanTitle = decodeHtmlEntities(day.title || '');
      const cleanBody = decodeHtmlEntities(day.body || '');

      let candidates = findMatchesInText(cleanTitle, allowedCountries);
      if (candidates.length === 0) {
        candidates = findMatchesInText(cleanBody, allowedCountries);
      }

      if (candidates.length === 0) return;

      // If multiple places appear in a transit title (e.g. "Hanoi to Hue", "Kars to Erzurum", "Mirissa → Galle → Bentota"),
      // pick the first candidate not already plotted as the previous stop, or the last destination in a "to / →" title.
      let picked = candidates[0];
      if (candidates.length > 1) {
        const lastStop = stops[stops.length - 1];
        const hasTransitArrow = /\bto\b|→|->|\|/i.test(cleanTitle);
        const novelCandidates = candidates.filter(
          (c) => !stops.some((s) => isNearCoord(s.lat, s.lng, c.entry.lat, c.entry.lng))
        );
        if (novelCandidates.length > 0) {
          picked = hasTransitArrow ? novelCandidates[novelCandidates.length - 1] : novelCandidates[0];
        } else if (lastStop) {
          const differentFromLast = candidates.find(
            (c) => !isNearCoord(lastStop.lat, lastStop.lng, c.entry.lat, c.entry.lng)
          );
          if (differentFromLast) picked = differentFromLast;
        }
      }

      const coord = picked.entry;
      const existing = stops.find((s) => isNearCoord(s.lat, s.lng, coord.lat, coord.lng));

      if (existing) {
        if (!existing.dayNumbers.includes(day.day_number)) {
          existing.dayNumbers.push(day.day_number);
        }
      } else {
        const combinedDayLower = `${cleanTitle} ${cleanBody}`.toLowerCase();
        const activityType = inferActivityType(combinedDayLower, coord.defaultActivity);
        const displayName = formatStopDisplayName(cleanTitle, coord.label);

        stops.push({
          id: `stop-${index + 1}-${picked.key}`,
          name: displayName,
          lat: coord.lat,
          lng: coord.lng,
          dayNumbers: [day.day_number],
          type: stops.length === 0 ? 'city' : index % 2 === 0 ? 'city' : 'landmark',
          activityType,
          activityLabel: getActivityLabel(activityType),
          description: cleanBody.slice(0, 150) + (cleanBody.length > 150 ? '...' : ''),
        });
      }
    });
  }

  // 2. If fewer than 2 stops matched (e.g., short day tours with 0-1 itinerary entries), derive from tour metadata
  if (stops.length < 2) {
    const combinedText = `${tour.title} ${tour.summary} ${tour.description} ${tour.place || ''} ${tour.region || ''}`;
    const matches = findMatchesInText(combinedText, allowedCountries);
    for (const m of matches) {
      if (stops.some((s) => isNearCoord(s.lat, s.lng, m.entry.lat, m.entry.lng))) continue;
      stops.push({
        id: `stop-${stops.length + 1}-${m.key}`,
        name: m.entry.label,
        lat: m.entry.lat,
        lng: m.entry.lng,
        dayNumbers: [1],
        type: stops.length === 0 ? 'city' : 'landmark',
        activityType: m.entry.defaultActivity || 'monument',
        activityLabel: getActivityLabel(m.entry.defaultActivity || 'monument'),
        description: `Key destination highlight on ${tour.title}.`,
      });
      if (stops.length >= 6) break;
    }
  }

  // 3. Country-aware fallback if a tour still has fewer than 2 stops
  if (stops.length < 2) {
    const countries = Array.from(allowedCountries);
    if (countries.includes('Egypt')) {
      stops.push(
        { id: 'egy-1', name: 'Great Pyramids of Giza', lat: 29.9792, lng: 31.1342, dayNumbers: [1], type: 'city', activityType: 'monument', activityLabel: 'Historic Monument & Archaeological Site', description: 'Explore the Great Pyramids and Sphinx on the Giza Plateau.' },
        { id: 'egy-2', name: 'Historic Old Cairo', lat: 30.0444, lng: 31.2357, dayNumbers: [1], type: 'landmark', activityType: 'culture', activityLabel: 'Cultural Heritage & Living Traditions', description: 'Guided walking discovery through Cairo’s ancient quarters.' }
      );
    } else if (tour.slug.includes('sunrise-walking-tour-of-istanbul')) {
      stops.push(
        { id: 'sun-1', name: 'Sultanahmet & Blue Mosque', lat: 41.0054, lng: 28.9768, dayNumbers: [1], type: 'city', activityType: 'hiking', activityLabel: 'Sunrise Heritage Walk', description: 'Experience Istanbul’s Old City in peaceful golden-hour light.' },
        { id: 'sun-2', name: 'Hagia Sophia Square', lat: 41.0086, lng: 28.9802, dayNumbers: [1], type: 'landmark', activityType: 'monument', activityLabel: 'Historic Monument & Archaeological Site', description: 'Marvel at the illuminated dome before the crowds arrive.' },
        { id: 'sun-3', name: 'Galata & Traditional Turkish Breakfast', lat: 41.0225, lng: 28.9769, dayNumbers: [1], type: 'city', activityType: 'culinary', activityLabel: 'Local Food & Culinary Tasting', description: 'Settle in for a generous traditional Turkish breakfast spread.' }
      );
    } else if ((tour.region || '').toLowerCase().includes('cappadocia') || tour.title.toLowerCase().includes('cappadocia')) {
      stops.push(
        { id: 'cap-1', name: 'Göreme Valley', lat: 38.6431, lng: 34.8289, dayNumbers: [1], type: 'city', activityType: 'balloon', activityLabel: 'Hot Air Balloon Experience', description: 'Dawn flight above volcanic fairy chimneys.' },
        { id: 'cap-2', name: 'Uçhisar Castle', lat: 38.6300, lng: 34.8050, dayNumbers: [2], type: 'landmark', activityType: 'hiking', activityLabel: 'Guided Walking / Trail Exploration', description: 'Highest viewpoint across Central Anatolia.' }
      );
    } else if ((tour.region || '').toLowerCase().includes('aegean') || tour.title.toLowerCase().includes('ephesus')) {
      stops.push(
        { id: 'aeg-1', name: 'Kuşadası Port', lat: 37.8579, lng: 27.2610, dayNumbers: [1], type: 'city', activityType: 'boat', activityLabel: 'Scenic Cruise / Waterway Journey', description: 'Direct pickup from Kuşadası cruise terminal.' },
        { id: 'aeg-2', name: 'Ephesus Ancient City', lat: 37.9497, lng: 27.3685, dayNumbers: [1], type: 'landmark', activityType: 'monument', activityLabel: 'Historic Monument & Archaeological Site', description: 'Library of Celsus, Marble Way, and Great Theatre.' }
      );
    } else if (stops.length === 0) {
      stops.push(
        { id: 'ist-1', name: 'Sultanahmet & Blue Mosque', lat: 41.0054, lng: 28.9768, dayNumbers: [1], type: 'city', activityType: 'monument', activityLabel: 'Historic Monument & Archaeological Site', description: 'The historic Roman Hippodrome and Blue Mosque.' },
        { id: 'ist-2', name: 'Hagia Sophia & Topkapı', lat: 41.0086, lng: 28.9802, dayNumbers: [1], type: 'landmark', activityType: 'monument', activityLabel: 'Historic Monument & Archaeological Site', description: 'Magnificent 6th-century dome and Imperial Palace.' }
      );
    }
  }

  return stops;
}

function getActivityLabel(type: RouteStop['activityType']): string {
  switch (type) {
    case 'balloon':
      return 'Hot Air Balloon Experience';
    case 'boat':
      return 'Scenic Cruise / Waterway Journey';
    case 'hiking':
      return 'Guided Walking / Trail Exploration';
    case 'culinary':
      return 'Local Food & Culinary Tasting';
    case 'culture':
      return 'Cultural Heritage & Living Traditions';
    default:
      return 'Historic Monument & Archaeological Site';
  }
}
