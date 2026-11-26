/**
 * Single source of truth for the public site identity used in canonical URLs,
 * sitemaps, Open Graph tags and structured data.
 *
 * The canonical host is the bare domain (no `www.`) because that is the host
 * Google has indexed for atlasglobaltours.com. The server 301-redirects
 * `www.` traffic here. Override with SITE_URL / VITE_SITE_URL for staging.
 */
const envOrigin =
  (typeof process !== 'undefined' && process.env && process.env.SITE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SITE_URL) ||
  '';

export const SITE_ORIGIN = (envOrigin || 'https://atlasglobaltours.com').replace(/\/+$/, '');
export const SITE_NAME = 'Atlas Global Tours';
export const TWITTER_HANDLE = '@atlasglobaltours';
export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80';
export const CONTACT_PHONE = '+90 532 123 4567';
export const CONTACT_EMAIL = 'info@atlasglobaltours.com';

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_ORIGIN}${path === '/' ? '/' : path}`;
}
