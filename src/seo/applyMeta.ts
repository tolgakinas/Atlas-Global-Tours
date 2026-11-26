import type { RouteMeta } from './routeMeta.ts';
import { SITE_NAME, TWITTER_HANDLE } from './siteConfig.ts';

function setMeta(attr: 'name' | 'property', key: string, content: string | null) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (content == null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string | undefined) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Applies route metadata to document.head during client-side navigation.
 * Mirrors the tags the server injects into the initial HTML (server/seo.ts).
 */
export function applyRouteMeta(meta: RouteMeta) {
  if (typeof document === 'undefined') return;

  document.title = meta.title;
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.noindex ? 'noindex, follow' : null);
  setCanonical(meta.canonical);

  setMeta('property', 'og:type', meta.ogType);
  setMeta('property', 'og:site_name', SITE_NAME);
  setMeta('property', 'og:locale', 'en_US');
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', meta.canonical ?? null);
  setMeta('property', 'og:image', meta.image);
  setMeta('property', 'og:image:alt', meta.imageAlt);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:site', TWITTER_HANDLE);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
  setMeta('name', 'twitter:image', meta.image);
  setMeta('name', 'twitter:image:alt', meta.imageAlt);

  document.head.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
  for (const schema of meta.jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', '');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
