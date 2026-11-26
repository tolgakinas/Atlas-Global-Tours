import { Tour } from '../data/toursData';
import { SITE_NAME, absoluteUrl } from '../seo/siteConfig';
import { tourDescription, tourImage } from '../seo/routeMeta';

/**
 * Share-card data for a tour (used by the share modal). Page <head> tags are
 * handled centrally by src/seo (client) and server/seo.ts (initial HTML).
 */
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

export function getTourSeoData(
  tour: Tour,
  ratingStats?: { averageRating: number; totalReviews: number }
): TourSeoData {
  const hasReviews = !!ratingStats && ratingStats.totalReviews > 0;
  return {
    title: `${tour.title} | ${SITE_NAME}`,
    description: tourDescription(tour),
    imageUrl: tourImage(tour),
    pageUrl: absoluteUrl(`/tours/${tour.slug}`),
    siteName: SITE_NAME,
    priceFormatted: (tour.price_cents / 100).toFixed(0),
    currency: tour.currency || 'USD',
    ratingValue: hasReviews ? ratingStats!.averageRating : undefined,
    reviewCount: hasReviews ? ratingStats!.totalReviews : undefined,
  };
}
