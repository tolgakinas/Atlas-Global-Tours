/**
 * Server-side SEO: canonical host + legacy WordPress redirects, robots.txt,
 * a dynamic sitemap.xml, and per-route <head> injection with correct HTTP
 * status codes so crawlers and link-preview bots get real titles,
 * descriptions, canonicals and structured data without running JavaScript.
 */
import type { Express, NextFunction, Request, Response } from 'express';
import { TOURS_DATA } from '../src/data/toursData.ts';
import type { Tour } from '../src/data/toursData.ts';
import type { JournalPost } from '../src/utils/journalPosts.ts';
import {
  ROUTE_ALIASES,
  STATIC_ROUTES,
  destinationCountriesWithTours,
  findTourBySlug,
  normalizePath,
  notFoundMeta,
  resolveRouteMeta,
  type RouteMeta,
} from '../src/seo/routeMeta.ts';
import { SITE_NAME, SITE_ORIGIN, TWITTER_HANDLE, absoluteUrl } from '../src/seo/siteConfig.ts';
import { LEGACY_PATH_REDIRECTS, LEGACY_POST_SLUGS, LEGACY_PREFIX_REDIRECTS } from './legacyUrls.ts';

export interface SeoDeps {
  getPosts: () => JournalPost[];
  getTours?: () => Tour[];
}

const CANONICAL_HOST = new URL(SITE_ORIGIN).host;

/** Paths the redirect layer must never touch (APIs, Soro connector, Vite dev assets). */
function isExcludedPath(path: string): boolean {
  return (
    path.startsWith('/api/') ||
    path.startsWith('/wp-json/') ||
    path.startsWith('/@') ||
    path.startsWith('/src/') ||
    path.startsWith('/node_modules/') ||
    path.startsWith('/assets/')
  );
}

function hasFileExtension(path: string): boolean {
  return /\.[a-z0-9]{2,5}$/i.test(path);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON for a <script> block: neutralize `</script>` and HTML comment openers. */
function safeJsonForScript(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

/**
 * Resolve where a legacy or alias path should permanently redirect, or null.
 * `rawPath` is the request path as received (may have a trailing slash).
 */
export function resolveRedirect(rawPath: string, deps: SeoDeps): string | null {
  const path = normalizePath(rawPath).toLowerCase();

  if (ROUTE_ALIASES[path]) return ROUTE_ALIASES[path];
  if (LEGACY_PATH_REDIRECTS[path]) return LEGACY_PATH_REDIRECTS[path];

  // WP Travel Engine trips: /trip/<slug>/ → /tours/<slug>
  const trip = path.match(/^\/trip\/([^/]+)$/);
  if (trip) {
    const tours = deps.getTours?.() ?? TOURS_DATA;
    return findTourBySlug(tours, trip[1]) ? `/tours/${trip[1]}` : '/tours';
  }

  for (const [prefix, target] of LEGACY_PREFIX_REDIRECTS) {
    if (path.startsWith(prefix)) return target;
  }

  // WordPress posts lived at the site root: /<slug>/ → /blog/<slug>
  const single = path.match(/^\/([a-z0-9][a-z0-9-]*)$/);
  if (single && !STATIC_ROUTES[path]) {
    const slug = single[1];
    if (LEGACY_POST_SLUGS.has(slug) || deps.getPosts().some((p) => p.slug.toLowerCase() === slug)) {
      return `/blog/${slug}`;
    }
  }

  // Trailing-slash and uppercase variants of real routes → canonical spelling
  const canonical = normalizePath(rawPath);
  if (canonical !== rawPath && rawPath !== '/') return canonical;

  return null;
}

export function registerSeoRedirects(app: Express, deps: SeoDeps, opts: { isProd: boolean }) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';

    // www → bare domain (production only; dev/staging hosts are left alone)
    const host = (req.headers.host || '').toLowerCase();
    if (opts.isProd && host === `www.${CANONICAL_HOST}`) {
      res.redirect(301, `${SITE_ORIGIN}${req.path}${query}`);
      return;
    }

    if (isExcludedPath(req.path)) return next();
    // Files are left alone except known legacy/alias names (wp-sitemap.xml, sitemap.html).
    const lower = req.path.toLowerCase();
    if (hasFileExtension(req.path) && !LEGACY_PATH_REDIRECTS[lower] && !ROUTE_ALIASES[lower]) return next();

    const target = resolveRedirect(req.path, deps);
    if (target && target !== req.path) {
      res.redirect(301, `${target}${query}`);
      return;
    }
    next();
  });
}

export function buildRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /operations',
    'Disallow: /account',
    'Disallow: /api/',
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    '',
  ].join('\n');
}

function isoDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function buildSitemapXml(deps: SeoDeps): string {
  const tours = (deps.getTours?.() ?? TOURS_DATA).filter((t) => t.is_published !== false);
  const posts = deps.getPosts();
  const entries: Array<{ loc: string; lastmod?: string | null }> = [];

  for (const [path, route] of Object.entries(STATIC_ROUTES)) {
    if (route.sitemap && !route.noindex) entries.push({ loc: absoluteUrl(path) });
  }
  for (const country of destinationCountriesWithTours(tours)) {
    entries.push({ loc: absoluteUrl(`/destinations/${country.id}`) });
  }
  for (const tour of tours) {
    entries.push({ loc: absoluteUrl(`/tours/${tour.slug}`), lastmod: isoDate(tour.updated_at) });
  }
  for (const post of posts) {
    entries.push({
      loc: absoluteUrl(`/blog/${post.slug}`),
      lastmod: isoDate(post.updated_at || post.published_at),
    });
  }

  const seen = new Set<string>();
  const body = entries
    .filter((e) => (seen.has(e.loc) ? false : (seen.add(e.loc), true)))
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeHtml(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function registerSeoFileRoutes(app: Express, deps: SeoDeps) {
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(buildRobotsTxt());
  });
  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(buildSitemapXml(deps));
  });
}

export function getRouteMetaForRequest(pathname: string, deps: SeoDeps): RouteMeta {
  const meta = resolveRouteMeta(pathname, {
    tours: deps.getTours?.() ?? TOURS_DATA,
    posts: deps.getPosts(),
  });
  // The server has the full post list, so an unknown blog slug is a real 404.
  return meta ?? notFoundMeta();
}

/** Remove the template's default SEO tags so route-specific ones can replace them. */
function stripDefaultHeadTags(html: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<!--\s*(OpenGraph Social Cards|Twitter \/ X Social Cards)\s*-->\s*/gi, '');
}

export function renderHeadTags(meta: RouteMeta): string {
  const e = escapeHtml;
  const tags = [
    `<title>${e(meta.title)}</title>`,
    `<meta name="description" content="${e(meta.description)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, follow" />' : '',
    meta.canonical ? `<link rel="canonical" href="${e(meta.canonical)}" />` : '',
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="${e(SITE_NAME)}" />`,
    '<meta property="og:locale" content="en_US" />',
    `<meta property="og:title" content="${e(meta.title)}" />`,
    `<meta property="og:description" content="${e(meta.description)}" />`,
    meta.canonical ? `<meta property="og:url" content="${e(meta.canonical)}" />` : '',
    `<meta property="og:image" content="${e(meta.image)}" />`,
    `<meta property="og:image:alt" content="${e(meta.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:site" content="${e(TWITTER_HANDLE)}" />`,
    `<meta name="twitter:title" content="${e(meta.title)}" />`,
    `<meta name="twitter:description" content="${e(meta.description)}" />`,
    `<meta name="twitter:image" content="${e(meta.image)}" />`,
    `<meta name="twitter:image:alt" content="${e(meta.imageAlt)}" />`,
    ...meta.jsonLd.map((s) => `<script type="application/ld+json" data-seo-jsonld>${safeJsonForScript(s)}</script>`),
  ];
  return tags.filter(Boolean).map((t) => `    ${t}`).join('\n');
}

export function injectRouteMeta(templateHtml: string, meta: RouteMeta): string {
  const html = stripDefaultHeadTags(templateHtml);
  const tags = `\n${renderHeadTags(meta)}\n`;
  const viewport = html.match(/<meta\s+name="viewport"[^>]*>/i);
  if (viewport && viewport.index !== undefined) {
    const at = viewport.index + viewport[0].length;
    return html.slice(0, at) + tags + html.slice(at);
  }
  return html.replace(/<\/head>/i, `${tags}</head>`);
}
