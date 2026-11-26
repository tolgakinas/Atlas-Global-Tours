/**
 * Route → SEO metadata resolver shared by the Express server (initial HTML for
 * crawlers and link-preview bots) and the React client (in-app navigation).
 * Pure module: no DOM, no Node APIs.
 */
import { DESTINATION_COUNTRIES, tourMatchesCountry } from '../data/toursData.ts';
import type { DestinationCountry, Tour } from '../data/toursData.ts';
import type { Post } from '../data/postsData.ts';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
} from './siteConfig.ts';

export interface RouteMeta {
  status: 200 | 404;
  title: string;
  description: string;
  /** Absolute canonical URL. Omitted for 404s. */
  canonical?: string;
  image: string;
  imageAlt: string;
  ogType: 'website' | 'article';
  noindex: boolean;
  jsonLd: object[];
}

interface StaticRoute {
  title: string;
  description: string;
  noindex?: boolean;
  /** Include in sitemap.xml */
  sitemap?: boolean;
}

/** Canonical static routes. Keys have no trailing slash. */
export const STATIC_ROUTES: Record<string, StaticRoute> = {
  '/': {
    title: 'Atlas Global Tours | Small Group Tours with Local Guides',
    description:
      'Small group multi-day tours and day tours across Türkiye, the Balkans, the Middle East, North Africa and Asia — led by licensed local guides, max 12–16 travelers.',
    sitemap: true,
  },
  '/tours': {
    title: 'Small Group Tours by Country | Atlas Global Tours',
    description:
      'Browse small group multi-day tours in Türkiye, Egypt, Jordan, Morocco, the Balkans, the Caucasus and more. Guaranteed departures, licensed local guides.',
    sitemap: true,
  },
  '/day-tours': {
    title: 'Istanbul & Cairo Day Tours with Local Guides | Atlas Global Tours',
    description:
      'Guided small group day tours in Istanbul, Cairo and Ephesus — Hagia Sophia, Topkapı Palace, the Grand Bazaar and more, with instant online booking.',
    sitemap: true,
  },
  '/blog': {
    title: 'Travel Journal: Guides, Itineraries & Tips | Atlas Global Tours',
    description:
      'Destination guides, sample itineraries, etiquette tips and small group travel advice from the Atlas Global Tours team and local guides.',
    sitemap: true,
  },
  '/about': {
    title: 'About Us: Licensed Local Guides | Atlas Global Tours',
    description:
      'Meet Atlas Global Tours — a small group tour operator built around licensed local guides, boutique stays and responsible, culturally immersive travel.',
    sitemap: true,
  },
  '/contact': {
    title: 'Contact Us | Atlas Global Tours',
    description:
      'Questions about a tour, a private departure or a group booking? Contact the Atlas Global Tours team by email, phone or WhatsApp.',
    sitemap: true,
  },
  '/advisor': {
    title: 'Travel Advisor & Agent Partner Program | Atlas Global Tours',
    description:
      'Earn commission booking small group tours for your clients. Atlas Global Tours partners with travel advisors and agencies worldwide.',
    sitemap: true,
  },
  '/terms': {
    title: 'Booking Terms & Conditions | Atlas Global Tours',
    description: 'Booking terms, payment schedule, cancellation and refund policy for Atlas Global Tours small group tours.',
    sitemap: true,
  },
  '/privacy': {
    title: 'Privacy Policy | Atlas Global Tours',
    description: 'How Atlas Global Tours (AGT Group LLC) collects, uses, stores and protects your personal information.',
    sitemap: true,
  },
  '/modern-slavery-act': {
    title: 'Modern Slavery Statement | Atlas Global Tours',
    description: 'Atlas Global Tours’ statement on preventing modern slavery and human trafficking in our supply chain.',
    sitemap: true,
  },
  '/sustainable-tourism': {
    title: 'Sustainable Tourism Policy | Atlas Global Tours',
    description: 'How Atlas Global Tours reduces the environmental impact of its small group tours and supports local communities.',
    sitemap: true,
  },
  '/responsible-travel': {
    title: 'Responsible & Fair Travel | Atlas Global Tours',
    description: 'Our responsible travel, fair travel and traveler safety commitments — fair wages for guides, small groups and local partners.',
    sitemap: true,
  },
  '/atlas-cares': {
    title: 'Atlas Cares: Community Giving | Atlas Global Tours',
    description: 'Atlas Cares — the community projects and causes supported by every Atlas Global Tours departure.',
    sitemap: true,
  },
  '/sitemap': {
    title: 'Site Directory | Atlas Global Tours',
    description: 'Every tour, destination and travel guide on Atlas Global Tours in one place.',
    sitemap: true,
  },
  // Utility pages: reachable but kept out of the index.
  '/login': { title: 'Traveler Login | Atlas Global Tours', description: 'Sign in to manage your Atlas Global Tours booking.', noindex: true },
  '/account': { title: 'My Account | Atlas Global Tours', description: 'Your Atlas Global Tours bookings.', noindex: true },
  '/compare': { title: 'Compare Tours | Atlas Global Tours', description: 'Compare Atlas Global Tours itineraries side by side.', noindex: true },
  '/operations': { title: 'Operations | Atlas Global Tours', description: 'Operations dashboard.', noindex: true },
  '/admin': { title: 'Admin | Atlas Global Tours', description: 'Admin dashboard.', noindex: true },
};

/**
 * Alternate spellings that render the same page. The server 301-redirects
 * these to the canonical path so only one URL gets indexed.
 */
export const ROUTE_ALIASES: Record<string, string> = {
  '/auth': '/login',
  '/consultant': '/advisor',
  '/bookingterms': '/terms',
  '/booking-terms': '/terms',
  '/terms-and-conditions': '/terms',
  '/policies': '/terms',
  '/privacypolicy': '/privacy',
  '/privacy-policy': '/privacy',
  '/modern-slavery': '/modern-slavery-act',
  '/sustainability': '/sustainable-tourism',
  '/responsibletravel': '/responsible-travel',
  '/fairtravels': '/responsible-travel',
  '/fair-travels': '/responsible-travel',
  '/cares': '/atlas-cares',
  '/sitemap.html': '/sitemap',
};

export function normalizePath(pathname: string): string {
  let p = (pathname || '/').split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

export function findTourBySlug(tours: Tour[], slug: string): Tour | undefined {
  return tours.find((t) => t.slug === slug && t.is_published !== false);
}

export function destinationCountriesWithTours(tours: Tour[]): DestinationCountry[] {
  return DESTINATION_COUNTRIES.filter((c) =>
    tours.some((t) => t.is_published !== false && tourMatchesCountry(t, c.name, c.continent))
  );
}

export function findDestinationCountry(tours: Tour[], id: string): DestinationCountry | undefined {
  return destinationCountriesWithTours(tours).find((c) => c.id === id);
}

function cleanText(raw: string): string {
  return (raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateDescription(raw: string, max = 158): string {
  const text = cleanText(raw);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:\s]+$/, '')}…`;
}

function breadcrumbs(items: Array<{ name: string; path: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function organizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    legalName: 'AGT Group LLC',
    url: `${SITE_ORIGIN}/`,
    logo: absoluteUrl('/atlas-logo.png'),
    image: DEFAULT_OG_IMAGE,
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
  };
}

function websiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

export function tourDescription(tour: Tour): string {
  const base = cleanText(tour.summary || tour.description || '');
  if (base.length >= 50) return truncateDescription(base);
  const kind = tour.tour_type === 'day' || tour.days <= 1 ? 'guided day tour' : `${tour.days}-day small group tour`;
  return truncateDescription(`${tour.title} — an authentic ${kind} led by licensed local guides. ${base}`);
}

export function tourImage(tour: Tour): string {
  return tour.hero_image || (tour.gallery && tour.gallery[0]) || DEFAULT_OG_IMAGE;
}

function tourAvailability(tour: Tour): string {
  const deps = tour.departuresList || [];
  if (deps.length === 0) return 'https://schema.org/InStock';
  const today = new Date().toISOString().slice(0, 10);
  const open = deps.some(
    (d) =>
      (!d.start_date || d.start_date >= today) &&
      d.status !== 'sold_out' &&
      (d.capacity == null || d.capacity - (d.seats_booked || 0) > 0)
  );
  return open ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut';
}

/**
 * TouristTrip structured data. `aggregateRating` is only emitted when real,
 * verifiable reviews exist — Google treats invented ratings as spam.
 */
export function tourJsonLd(
  tour: Tour,
  rating?: { averageRating: number; totalReviews: number }
): object {
  const url = absoluteUrl(`/tours/${tour.slug}`);
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tourDescription(tour),
    url,
    image: [tourImage(tour), ...(tour.gallery || []).slice(0, 3)].filter((v, i, a) => v && a.indexOf(v) === i),
    touristType: tour.tour_type === 'day' ? 'Day Tour' : 'Small Group Travel',
    provider: { '@id': `${SITE_ORIGIN}/#organization`, '@type': 'TravelAgency', name: SITE_NAME, url: `${SITE_ORIGIN}/` },
  };
  if (tour.days > 1) schema.touristTripDuration = `P${tour.days}D`;
  else if (tour.duration_hours) schema.touristTripDuration = `PT${tour.duration_hours}H`;
  if (tour.daysList && tour.daysList.length > 0) {
    schema.itinerary = {
      '@type': 'ItemList',
      itemListElement: tour.daysList.slice(0, 30).map((d: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: cleanText(d.title || `Day ${d.day_number ?? i + 1}`),
      })),
    };
  }
  if (tour.price_cents > 0) {
    schema.offers = {
      '@type': 'Offer',
      price: (tour.price_cents / 100).toFixed(2),
      priceCurrency: tour.currency || 'USD',
      availability: tourAvailability(tour),
      url,
    };
  }
  if (rating && rating.totalReviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.averageRating.toFixed(1),
      reviewCount: rating.totalReviews,
      bestRating: '5',
      worstRating: '1',
    };
  }
  return schema;
}

export function buildTourMeta(tour: Tour, rating?: { averageRating: number; totalReviews: number }): RouteMeta {
  const isDay = tour.tour_type === 'day' || tour.days <= 1;
  return {
    status: 200,
    title: `${tour.title} | ${SITE_NAME}`,
    description: tourDescription(tour),
    canonical: absoluteUrl(`/tours/${tour.slug}`),
    image: tourImage(tour),
    imageAlt: tour.title,
    ogType: 'website',
    noindex: false,
    jsonLd: [
      tourJsonLd(tour, rating),
      breadcrumbs([
        { name: 'Home', path: '/' },
        isDay ? { name: 'Day Tours', path: '/day-tours' } : { name: 'Tours', path: '/tours' },
        { name: tour.title, path: `/tours/${tour.slug}` },
      ]),
    ],
  };
}

export function buildBlogPostMeta(
  post: Post & { metaDescription?: string; authorName?: string }
): RouteMeta {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const description = truncateDescription(post.metaDescription || post.excerpt || post.body || post.title);
  const image = post.cover_image || DEFAULT_OG_IMAGE;
  return {
    status: 200,
    title: `${cleanText(post.title)} | ${SITE_NAME}`,
    description,
    canonical: url,
    image,
    imageAlt: cleanText(post.title),
    ogType: 'article',
    noindex: false,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: cleanText(post.title).slice(0, 110),
        description,
        image: [image],
        url,
        mainEntityOfPage: url,
        datePublished: post.published_at || post.created_at || undefined,
        dateModified: post.updated_at || post.published_at || undefined,
        author: { '@type': 'Organization', name: post.authorName || SITE_NAME, url: `${SITE_ORIGIN}/` },
        publisher: { '@id': `${SITE_ORIGIN}/#organization`, '@type': 'Organization', name: SITE_NAME },
      },
      breadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Journal', path: '/blog' },
        { name: cleanText(post.title), path: `/blog/${post.slug}` },
      ]),
    ],
  };
}

export function buildDestinationMeta(country: DestinationCountry, tours: Tour[]): RouteMeta {
  const path = `/destinations/${country.id}`;
  const matching = tours.filter((t) => t.is_published !== false && tourMatchesCountry(t, country.name, country.continent));
  return {
    status: 200,
    title: `${country.name} Small Group Tours | ${SITE_NAME}`,
    description: truncateDescription(
      `Small group tours in ${country.name} with licensed local guides: ${country.subtitle}. ${country.description}`
    ),
    canonical: absoluteUrl(path),
    image: country.heroImage ? absoluteUrl(country.heroImage) : DEFAULT_OG_IMAGE,
    imageAlt: `${country.name} small group tours`,
    ogType: 'website',
    noindex: false,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${country.name} tours`,
        itemListElement: matching.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: absoluteUrl(`/tours/${t.slug}`),
          name: t.title,
        })),
      },
      breadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Tours', path: '/tours' },
        { name: country.name, path },
      ]),
    ],
  };
}

export function notFoundMeta(): RouteMeta {
  return {
    status: 404,
    title: `Page Not Found | ${SITE_NAME}`,
    description: 'Sorry, this page could not be found. Browse our small group tours and day tours instead.',
    image: DEFAULT_OG_IMAGE,
    imageAlt: SITE_NAME,
    ogType: 'website',
    noindex: true,
    jsonLd: [],
  };
}

export interface ResolveContext {
  tours: Tour[];
  /** Blog posts known to the caller. */
  posts: Array<Post & { metaDescription?: string; authorName?: string }>;
  rating?: (tour: Tour) => { averageRating: number; totalReviews: number } | undefined;
}

/**
 * Resolve SEO metadata for a path. Returns `null` for a blog slug the caller
 * doesn't know about (the client fetches articles asynchronously and applies
 * their meta itself); the server passes the full post list, so it never gets
 * null back.
 */
export function resolveRouteMeta(pathname: string, ctx: ResolveContext): RouteMeta | null {
  const path = ROUTE_ALIASES[normalizePath(pathname)] || normalizePath(pathname);
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'tours' && segments.length >= 2) {
    const tour = findTourBySlug(ctx.tours, segments[1]);
    if (!tour) return notFoundMeta();
    if (segments.length === 2) return buildTourMeta(tour, ctx.rating?.(tour));
    if (segments.length === 3 && segments[2] === 'book') {
      return {
        ...buildTourMeta(tour),
        title: `Book ${tour.title} | ${SITE_NAME}`,
        noindex: true,
        jsonLd: [],
      };
    }
    return notFoundMeta();
  }

  if (segments[0] === 'blog' && segments.length === 2) {
    const post = ctx.posts.find((p) => p.slug.toLowerCase() === segments[1].toLowerCase());
    return post ? buildBlogPostMeta(post) : null;
  }

  if (segments[0] === 'destinations' && segments.length === 2) {
    const country = findDestinationCountry(ctx.tours, segments[1]);
    return country ? buildDestinationMeta(country, ctx.tours) : notFoundMeta();
  }

  const route = STATIC_ROUTES[path];
  if (!route) return notFoundMeta();

  return {
    status: 200,
    title: route.title,
    description: route.description,
    canonical: absoluteUrl(path),
    image: DEFAULT_OG_IMAGE,
    imageAlt: SITE_NAME,
    ogType: 'website',
    noindex: !!route.noindex,
    jsonLd: path === '/' ? [organizationSchema(), websiteSchema()] : [],
  };
}
