export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  tags: string[];
  status: string;
  published_at: string;
  author_id?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const POSTS_DATA: Post[] = [
  {
    "id": "cdf2b5d6-fcc6-48a4-948f-f8ac1b6f5119",
    "slug": "best-time-to-visit-turkey",
    "title": "The best time to visit Türkiye",
    "excerpt": "Season-by-season guidance for Istanbul, Cappadocia and the coast.",
    "body": "Türkiye rewards travellers year round, but each season has its own character.\n\nSpring (April–June) brings mild days, wildflowers in Cappadocia and comfortable walking weather in Istanbul.\n\nAutumn (September–October) is our favourite window: warm sea, harvest season in the Aegean and thinner crowds at the major sites.\n\nWinter is quiet and atmospheric — snow over the fairy chimneys, empty palaces, and the lowest prices of the year.",
    "cover_image": null,
    "tags": [
      "planning",
      "seasons"
    ],
    "status": "published",
    "published_at": "2026-08-22T17:46:08.680225+00:00",
    "author_id": null,
    "created_at": "2026-08-22T17:46:08.680225+00:00",
    "updated_at": "2026-08-22T17:46:08.680225+00:00"
  },
  {
    "id": "post-cappadocia-valleys",
    "slug": "hidden-valleys-of-cappadocia",
    "title": "Walking the Secret Valleys of Cappadocia",
    "excerpt": "Beyond Göreme: Red Valley, Rose Valley, and the secluded troglodyte trails.",
    "body": "Most visitors only see Cappadocia from a hot air balloon basket or the paved paths of the Open Air Museum. But the true enchantment unfolds when you lace up your boots and head along the dusty rose-colored tracks of Rose and Pigeon Valleys.\n\nHere, ancient rock-cut hermitages hide vibrant Byzantine frescoes preserved in cave darkness. Apricot orchards line the canyon floors, and local farmers still tend to vineyards established during Roman times.\n\nTips for hiking Cappadocia:\n- Early mornings give cool breezes and soft golden light on the tufa formations\n- Bring a headlamp for exploring subterranean rooms\n- Stop at local cave tea stalls for freshly squeezed pomegranate juice.",
    "cover_image": "https://atlasglobaltours.com/wp-content/uploads/2026/01/cappadocia-national-park-2026-01-06-10-58-18-utc-scaled.jpg",
    "tags": [
      "cappadocia",
      "hiking",
      "valleys"
    ],
    "status": "published",
    "published_at": "2026-09-10T10:00:00.000Z"
  },
  {
    "id": "post-food-gaziantep",
    "slug": "culinary-journey-gaziantep-urfa",
    "title": "The Flavors of Mesopotamia: A Food Guide to Gaziantep and Urfa",
    "excerpt": "Why southeast Türkiye is UNESCO-designated gastronomy capital.",
    "body": "From copper workshops ringing through the old bazaar to the rich scent of clarified sheep butter (sade yağ) sizzling in trays of emerald pistachio baklava, Gaziantep is a feast for every sense.\n\nIn Urfa, the spices take on a fiery, smoky warmth. Urfa isot pepper is cured in the sun until dark purple and deeply aromatic, elevating raw çiğ köfte and charcoal-grilled lamb kebabs into world-class art.\n\nMust-try dishes:\n- Beyran çorbası (rich spiced lamb neck soup for breakfast)\n- Katmer (crispy phyllo with clotted cream and pistachios)\n- Haşhaş kebabı with roasted garlic and tomatoes.",
    "cover_image": "https://atlasglobaltours.com/wp-content/uploads/2022/03/2D8C3436_20180704160312891.jpg",
    "tags": [
      "food",
      "culinary",
      "southeast"
    ],
    "status": "published",
    "published_at": "2026-09-18T14:30:00.000Z"
  }
];
