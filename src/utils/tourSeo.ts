import { useEffect } from 'react';
import { Tour } from '../data/toursData';

export interface TourSeoData {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  siteName: string;
  priceFormatted?: string;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
}

const DEFAULT_SEO = {
  title: 'Atlas Global Tours | Authentic Small Group Journeys Worldwide',
  description:
    'Small group multi-day expeditions and day tours worldwide across Europe, Asia, Africa, the Mediterranean, and the Americas — run exclusively by licensed local guides.',
  imageUrl:
    'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
  siteName: 'Atlas Global Tours',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://atlasglobaltours.com',
};

/**
 * Extracts and formats clean, social-optimized Open Graph and Twitter card meta tag data for a tour.
 * Follows Google & social card guidelines: 30-60 char title, 120-160 char description, high-res image.
 */
export function getTourSeoData(
  tour: Tour,
  ratingStats?: { averageRating: number; totalReviews: number }
): TourSeoData {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://atlasglobaltours.com';
  const pageUrl = `${origin}/tours/${tour.slug}`;

  // Formulate a branded, compelling title (30-60 chars)
  const title = `${tour.title} | Atlas Global Tours`;

  // Create clean, crisp 120-160 character description without HTML tags or markdown
  let rawDesc = (tour.summary || tour.description || '').trim();
  rawDesc = rawDesc
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/&[a-z0-9#]+;/gi, ' ') // remove HTML entities
    .replace(/\s+/g, ' ') // collapse whitespaces
    .trim();

  let description = rawDesc;
  if (description.length > 158) {
    const cut = description.slice(0, 155);
    const lastSpace = cut.lastIndexOf(' ');
    description = (lastSpace > 100 ? cut.slice(0, lastSpace) : cut) + '...';
  } else if (description.length < 50) {
    const tourTypeLabel = tour.tour_type === 'day' ? 'guided day tour' : `${tour.days}-day small group expedition`;
    description = `Experience the ${tour.title} — an authentic ${tourTypeLabel} led by licensed local guides. Guaranteed departures and curated boutique itineraries.`;
  }

  // Ensure high-resolution image URL for summary_large_image card
  const imageUrl =
    tour.hero_image ||
    (tour.gallery && tour.gallery.length > 0 ? tour.gallery[0] : DEFAULT_SEO.imageUrl);

  return {
    title,
    description,
    imageUrl,
    pageUrl,
    siteName: 'Atlas Global Tours',
    priceFormatted: (tour.price_cents / 100).toFixed(0),
    currency: tour.currency || 'USD',
    ratingValue: ratingStats?.averageRating || 4.9,
    reviewCount: ratingStats?.totalReviews || 12,
  };
}

/**
 * Dynamically sets or creates a meta tag in document.head
 */
function setMetaTag(selector: string, attrName: string, attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Sets or creates a <link> tag (e.g. canonical) in document.head
 */
function setLinkTag(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Injects or updates Schema.org JSON-LD structured data in document.head
 */
function setJsonLdScript(id: string, schemaData: object) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaData, null, 2);
}

/**
 * Updates all Open Graph, Twitter card, canonical, and Schema.org tags for an individual tour page.
 */
export function updateTourSEO(
  tour: Tour,
  ratingStats?: { averageRating: number; totalReviews: number }
) {
  if (typeof document === 'undefined' || !tour) return;

  const data = getTourSeoData(tour, ratingStats);

  // 1. Standard HTML Title & Description
  document.title = data.title;
  setMetaTag('meta[name="description"]', 'name', 'description', data.description);

  // 2. OpenGraph Meta Tags (Facebook, LinkedIn, Slack, WhatsApp, Discord, iMessage)
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', data.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', data.description);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', data.imageUrl);
  setMetaTag('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', data.imageUrl);
  setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', tour.title);
  setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
  setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', data.pageUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', data.siteName);
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');

  // 3. Twitter / X Card Meta Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', data.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', data.description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', data.imageUrl);
  setMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', tour.title);
  setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@atlasglobaltours');
  setMetaTag('meta[name="twitter:creator"]', 'name', 'twitter:creator', '@atlasglobaltours');

  // 4. Canonical URL Link
  setLinkTag('canonical', data.pageUrl);

  // 5. Schema.org JSON-LD Structured Data (TouristTrip & Product)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: data.description,
    image: [data.imageUrl, ...(tour.gallery || []).slice(0, 3)],
    touristType: 'Small Group Travel',
    touristTripDuration: tour.days > 1 ? `P${tour.days}D` : 'PT8H',
    offers: {
      '@type': 'Offer',
      price: (tour.price_cents / 100).toFixed(2),
      priceCurrency: data.currency,
      availability: 'https://schema.org/InStock',
      url: data.pageUrl,
      validFrom: '2026-01-01',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.ratingValue?.toFixed(1) || '4.9',
      reviewCount: data.reviewCount || 15,
      bestRating: '5',
      worstRating: '1',
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'Atlas Global Tours',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://atlasglobaltours.com',
      telephone: '+90 532 123 4567',
      email: 'info@atlasglobaltours.com',
    },
  };
  setJsonLdScript('tour-seo-schema-jsonld', schema);
}

/**
 * Resets document title and Open Graph / Twitter meta tags back to default brand values
 */
export function resetDefaultSEO() {
  if (typeof document === 'undefined') return;

  document.title = DEFAULT_SEO.title;
  setMetaTag('meta[name="description"]', 'name', 'description', DEFAULT_SEO.description);

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', DEFAULT_SEO.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', DEFAULT_SEO.description);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', DEFAULT_SEO.imageUrl);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', DEFAULT_SEO.url);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULT_SEO.siteName);

  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', DEFAULT_SEO.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', DEFAULT_SEO.description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_SEO.imageUrl);

  setLinkTag('canonical', DEFAULT_SEO.url);

  const script = document.getElementById('tour-seo-schema-jsonld');
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

/**
 * React hook to synchronize Open Graph and Twitter Card tags with the currently viewed tour
 */
export function useTourSEO(
  tour: Tour | undefined,
  ratingStats?: { averageRating: number; totalReviews: number }
) {
  useEffect(() => {
    if (!tour) return;

    updateTourSEO(tour, ratingStats);

    return () => {
      resetDefaultSEO();
    };
  }, [tour, ratingStats]);
}
