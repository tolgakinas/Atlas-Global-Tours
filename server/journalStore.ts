import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Express, NextFunction, Request, Response } from 'express';
import { POSTS_DATA } from '../src/data/postsData.ts';
import {
  decodeHtmlEntities,
  estimateReadingTimeMinutes,
  inferJournalTags,
  isSafeHttpUrl,
  sanitizeJournalHtml,
  slugifyTitle,
  stripHtmlTags,
  toJournalSummary,
  type JournalPost,
} from '../src/utils/journalPosts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '..', '.data');
const JOURNAL_STORE_FILE = path.join(DATA_DIR, 'journal-posts.json');
const INDEXNOW_STORE_FILE = path.join(DATA_DIR, 'soro-indexnow.json');

// Strictly allowlisted WordPress origin for importing already-published Soro posts
const WORDPRESS_POSTS_ENDPOINT = 'https://atlasglobaltours.com/wp-json/wp/v2/posts';
const SORO_CONNECTOR_VERSION = '1.5.0';

interface JournalStoreData {
  lastSyncedAt: string | null;
  posts: JournalPost[];
}

interface IndexNowStoreData {
  key: string;
  createdAt: string;
}

interface WpRawPost {
  id: number;
  slug: string;
  date?: string;
  date_gmt?: string;
  modified?: string;
  status?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  yoast_head_json?: { description?: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
    'wp:term'?: Array<Array<{ taxonomy?: string; name?: string; slug?: string }>>;
    author?: Array<{ name?: string }>;
  };
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function localFallbackPosts(): JournalPost[] {
  return POSTS_DATA.map((p) => ({
    ...p,
    source: 'local',
    contentFormat: 'plain',
    readingTimeMinutes: estimateReadingTimeMinutes(p.body),
    authorName: 'Atlas Global Tours Editorial',
  }));
}

function readJournalStore(): JournalStoreData {
  try {
    if (fs.existsSync(JOURNAL_STORE_FILE)) {
      const raw = fs.readFileSync(JOURNAL_STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<JournalStoreData>;
      if (Array.isArray(parsed.posts)) {
        return {
          lastSyncedAt: typeof parsed.lastSyncedAt === 'string' ? parsed.lastSyncedAt : null,
          posts: parsed.posts,
        };
      }
    }
  } catch (err) {
    console.warn('[Journal] Failed to read journal store:', err instanceof Error ? err.message : 'Unknown error');
  }
  return { lastSyncedAt: null, posts: [] };
}

function writeJournalStore(store: JournalStoreData): void {
  ensureDataDir();
  const sorted = [...store.posts].sort((a, b) => {
    const tA = new Date(a.published_at || 0).getTime();
    const tB = new Date(b.published_at || 0).getTime();
    return tB - tA;
  });
  fs.writeFileSync(
    JOURNAL_STORE_FILE,
    JSON.stringify({ lastSyncedAt: store.lastSyncedAt, posts: sorted }, null, 2),
    'utf8'
  );
}

function readIndexNowKey(): IndexNowStoreData | null {
  try {
    if (fs.existsSync(INDEXNOW_STORE_FILE)) {
      const raw = fs.readFileSync(INDEXNOW_STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<IndexNowStoreData>;
      if (typeof parsed.key === 'string' && /^[a-f0-9]{32}$/.test(parsed.key)) {
        return { key: parsed.key, createdAt: parsed.createdAt || new Date().toISOString() };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function writeIndexNowKey(key: string): IndexNowStoreData {
  ensureDataDir();
  const record: IndexNowStoreData = { key, createdAt: new Date().toISOString() };
  fs.writeFileSync(INDEXNOW_STORE_FILE, JSON.stringify(record, null, 2), 'utf8');
  return record;
}

function mapWpPostToJournal(wp: WpRawPost): JournalPost {
  const title = decodeHtmlEntities(wp.title?.rendered || 'Untitled Article').trim();
  const rawHtml = wp.content?.rendered || '';
  const safeHtml = sanitizeJournalHtml(rawHtml);
  const rawExcerpt = stripHtmlTags(wp.excerpt?.rendered || '');
  const metaDesc = wp.yoast_head_json?.description
    ? decodeHtmlEntities(wp.yoast_head_json.description).trim()
    : undefined;
  const fallbackExcerpt = stripHtmlTags(safeHtml).slice(0, 200);
  const excerpt = (rawExcerpt || metaDesc || fallbackExcerpt).slice(0, 320);

  const featuredCandidate = wp._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
  const coverImage = isSafeHttpUrl(featuredCandidate) ? featuredCandidate : null;

  const termGroups = wp._embedded?.['wp:term'] || [];
  const rawCategoryNames: string[] = [];
  const rawTagNames: string[] = [];
  for (const group of termGroups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      if (!term?.name) continue;
      if (term.taxonomy === 'category') {
        rawCategoryNames.push(term.name);
      } else {
        rawTagNames.push(term.name);
      }
    }
  }

  const category =
    rawCategoryNames.find((c) => c.toLowerCase() !== 'uncategorized') || 'Travel Journal';
  const tags = inferJournalTags(title, excerpt, [...rawCategoryNames, ...rawTagNames]);
  const publishedIso = wp.date_gmt
    ? `${wp.date_gmt.replace(' ', 'T')}Z`
    : wp.date
    ? new Date(wp.date).toISOString()
    : new Date().toISOString();

  const slug = slugifyTitle(wp.slug || title) || `article-${wp.id}`;
  const authorName = wp._embedded?.author?.[0]?.name || 'Atlas Global Tours Editorial';

  return {
    id: `wp-${wp.id}`,
    wpId: wp.id,
    slug,
    title,
    excerpt,
    body: safeHtml,
    cover_image: coverImage,
    tags,
    category,
    metaDescription: metaDesc || excerpt,
    status: wp.status === 'publish' ? 'published' : wp.status || 'published',
    published_at: publishedIso,
    updated_at: wp.modified ? new Date(wp.modified).toISOString() : publishedIso,
    source: 'wordpress',
    contentFormat: 'html',
    readingTimeMinutes: estimateReadingTimeMinutes(safeHtml),
    authorName,
  };
}

let inFlightSync: Promise<{ imported: number; updated: number; total: number; syncedAt: string }> | null = null;

export async function syncWordPressJournalPosts(): Promise<{
  imported: number;
  updated: number;
  total: number;
  syncedAt: string;
}> {
  if (inFlightSync) return inFlightSync;

  inFlightSync = (async () => {
    const fetchedWpPosts: WpRawPost[] = [];
    const perPage = 100;
    const maxPages = 10; // Safety ceiling: up to 1,000 posts

    for (let page = 1; page <= maxPages; page++) {
      const url = `${WORDPRESS_POSTS_ENDPOINT}?per_page=${perPage}&page=${page}&status=publish&_embed`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'AtlasGlobalTours-JournalSync/1.0' },
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 400 && page > 1) {
        // WordPress returns 400 rest_post_invalid_page_number past the last page
        break;
      }
      if (!res.ok) {
        throw new Error(`WordPress feed responded with HTTP ${res.status}`);
      }

      const batch = (await res.json()) as WpRawPost[];
      if (!Array.isArray(batch) || batch.length === 0) break;

      fetchedWpPosts.push(...batch);
      const totalPages = Number(res.headers.get('x-wp-totalpages') || '1');
      if (page >= totalPages || batch.length < perPage) break;
    }

    const existingStore = readJournalStore();
    const bySlug = new Map<string, JournalPost>();
    for (const post of existingStore.posts) {
      bySlug.set(post.slug, post);
    }

    let imported = 0;
    let updated = 0;

    for (const rawWp of fetchedWpPosts) {
      const mapped = mapWpPostToJournal(rawWp);
      const existing = bySlug.get(mapped.slug);
      if (!existing) {
        bySlug.set(mapped.slug, mapped);
        imported += 1;
      } else if (existing.source === 'wordpress') {
        bySlug.set(mapped.slug, mapped);
        updated += 1;
      }
      // If existing.source === 'soro', keep the newer direct Soro-pushed version intact
    }

    const syncedAt = new Date().toISOString();
    const mergedPosts = Array.from(bySlug.values());
    writeJournalStore({ lastSyncedAt: syncedAt, posts: mergedPosts });

    return { imported, updated, total: mergedPosts.length, syncedAt };
  })();

  try {
    return await inFlightSync;
  } finally {
    inFlightSync = null;
  }
}

/**
 * Published journal posts for SEO (meta tags, sitemap, legacy redirects).
 * Reads the local store only — never triggers a network sync — so HTML
 * responses stay fast.
 */
export function getPublishedJournalPostsForSeo(): JournalPost[] {
  const store = readJournalStore();
  const posts = store.posts.length > 0 ? store.posts : localFallbackPosts();
  return posts.filter((p) => p.status === 'published' || p.status === 'publish');
}

async function getPopulatedJournalStore(): Promise<JournalStoreData> {
  const current = readJournalStore();
  if (current.posts.length > 0) {
    return current;
  }

  // First-run automatic import of existing published articles from atlasglobaltours.com
  try {
    await syncWordPressJournalPosts();
    return readJournalStore();
  } catch (err) {
    console.warn(
      '[Journal] Initial WordPress sync failed, falling back to local posts:',
      err instanceof Error ? err.message : 'Unknown error'
    );
    return { lastSyncedAt: null, posts: localFallbackPosts() };
  }
}

function getConfiguredSoroApiKey(): string {
  return (process.env.SORO_API_KEY || '').trim();
}

function verifySoroRequest(req: Request): boolean {
  const configuredKey = getConfiguredSoroApiKey();
  if (!configuredKey) return false;

  const headerKey =
    (typeof req.headers['x-soro-key'] === 'string' ? req.headers['x-soro-key'].trim() : '') ||
    (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : '');

  if (!headerKey) return false;

  const expectedBuf = Buffer.from(configuredKey, 'utf8');
  const providedBuf = Buffer.from(headerKey, 'utf8');
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

// Separate rate limiter for Soro webhook routes (60 requests / 15 min per IP)
const SORO_RATE_WINDOW_MS = 15 * 60 * 1000;
const SORO_RATE_MAX = 60;
const soroRateBuckets = new Map<string, { count: number; resetAt: number }>();

function isSoroRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = soroRateBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    soroRateBuckets.set(ip, { count: 1, resetAt: now + SORO_RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > SORO_RATE_MAX;
}

function requireSoroAuth(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (isSoroRateLimited(clientIp)) {
    res.status(429).json({ success: false, error: 'Too many requests.' });
    return;
  }

  if (!getConfiguredSoroApiKey()) {
    res.status(503).json({
      success: false,
      error: 'SORO_API_KEY is not configured in server environment secrets.',
    });
    return;
  }

  if (!verifySoroRequest(req)) {
    res.status(401).json({ success: false, error: 'Invalid or missing Soro API key.' });
    return;
  }

  next();
}

export function registerJournalAndSoroRoutes(
  app: Express,
  requireAdminAuth: (req: Request, res: Response, next: NextFunction) => void,
  getSafeAppBaseUrl: (req: Request) => string
): void {
  // ============================================================================
  // PUBLIC JOURNAL API (Listing summaries + full single article)
  // ============================================================================
  app.get('/api/journal/posts', async (req: Request, res: Response) => {
    try {
      const store = await getPopulatedJournalStore();
      const publishedPosts = store.posts.filter((p) => p.status === 'published' || p.status === 'publish');

      const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
      const tag = typeof req.query.tag === 'string' ? req.query.tag.trim().toLowerCase() : '';

      let filtered = publishedPosts;
      if (tag && tag !== 'all') {
        filtered = filtered.filter((p) => p.tags.some((t) => t.toLowerCase() === tag));
      }
      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            p.excerpt.toLowerCase().includes(search) ||
            p.tags.some((t) => t.toLowerCase().includes(search))
        );
      }

      // Compute tag frequency map from all published posts so filter pills stay stable
      const tagCounts: Record<string, number> = {};
      for (const p of publishedPosts) {
        for (const t of p.tags) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      }

      res.status(200).json({
        ok: true,
        total: filtered.length,
        totalPublished: publishedPosts.length,
        lastSyncedAt: store.lastSyncedAt,
        tagCounts,
        posts: filtered.map(toJournalSummary),
      });
    } catch (err) {
      console.error('[Journal] Failed to load posts:', err instanceof Error ? err.message : 'Unknown error');
      const fallback = localFallbackPosts();
      res.status(200).json({
        ok: true,
        total: fallback.length,
        totalPublished: fallback.length,
        lastSyncedAt: null,
        tagCounts: {},
        posts: fallback.map(toJournalSummary),
      });
    }
  });

  app.get('/api/journal/posts/:slug', async (req: Request, res: Response) => {
    try {
      const rawSlug = typeof req.params.slug === 'string' ? req.params.slug.trim().toLowerCase() : '';
      if (!rawSlug || rawSlug.length > 180) {
        res.status(400).json({ ok: false, error: 'Invalid article slug.' });
        return;
      }

      const store = await getPopulatedJournalStore();
      const post =
        store.posts.find((p) => p.slug.toLowerCase() === rawSlug) ||
        localFallbackPosts().find((p) => p.slug.toLowerCase() === rawSlug);

      if (!post) {
        res.status(404).json({ ok: false, error: 'Article not found.' });
        return;
      }

      // Pick up to 3 related articles sharing at least one tag
      const related = store.posts
        .filter((p) => p.slug !== post.slug && (p.status === 'published' || p.status === 'publish'))
        .map((candidate) => {
          const overlap = candidate.tags.filter((t) => post.tags.includes(t)).length;
          return { candidate, overlap };
        })
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, 3)
        .map((entry) => toJournalSummary(entry.candidate));

      res.status(200).json({ ok: true, post, related });
    } catch (err) {
      console.error('[Journal] Failed to load article:', err instanceof Error ? err.message : 'Unknown error');
      res.status(500).json({ ok: false, error: 'Unable to load article.' });
    }
  });

  // ============================================================================
  // ADMIN JOURNAL MANAGEMENT & WORDPRESS SYNC (Protected by Admin Passcode Auth)
  // ============================================================================
  app.get('/api/admin/journal/status', requireAdminAuth, async (req: Request, res: Response) => {
    const store = readJournalStore();
    const baseUrl = getSafeAppBaseUrl(req);
    const soroCount = store.posts.filter((p) => p.source === 'soro').length;
    const wpCount = store.posts.filter((p) => p.source === 'wordpress').length;
    const draftCount = store.posts.filter((p) => p.status !== 'published' && p.status !== 'publish').length;

    res.status(200).json({
      ok: true,
      soroConfigured: Boolean(getConfiguredSoroApiKey()),
      siteUrl: baseUrl,
      verifyEndpoint: `${baseUrl}/wp-json/soro/v1/verify`,
      publishEndpoint: `${baseUrl}/wp-json/soro/v1/publish`,
      totalPosts: store.posts.length,
      soroCount,
      wordpressCount: wpCount,
      draftCount,
      lastSyncedAt: store.lastSyncedAt,
      posts: store.posts.map(toJournalSummary),
    });
  });

  app.post('/api/admin/journal/sync', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const result = await syncWordPressJournalPosts();
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      res.status(502).json({
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to sync posts from WordPress.',
      });
    }
  });

  app.delete('/api/admin/journal/posts/:id', requireAdminAuth, (req: Request, res: Response) => {
    const targetId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!targetId) {
      res.status(400).json({ ok: false, error: 'Article ID is required.' });
      return;
    }

    const store = readJournalStore();
    const nextPosts = store.posts.filter((p) => p.id !== targetId && p.slug !== targetId);
    if (nextPosts.length === store.posts.length) {
      res.status(404).json({ ok: false, error: 'Article not found.' });
      return;
    }

    writeJournalStore({ lastSyncedAt: store.lastSyncedAt, posts: nextPosts });
    res.status(200).json({ ok: true, total: nextPosts.length });
  });

  // ============================================================================
  // SORO AUTO-PUBLISH CONNECTOR ENDPOINTS (100% compatible with Soro WordPress protocol)
  // ============================================================================
  const handleSoroVerify = (req: Request, res: Response) => {
    const baseUrl = getSafeAppBaseUrl(req);
    res.status(200).json({
      success: true,
      site_name: 'Atlas Global Tours',
      site_url: baseUrl,
      version: SORO_CONNECTOR_VERSION,
    });
  };

  const handleSoroPublish = (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const rawTitle = typeof body.title === 'string' ? decodeHtmlEntities(body.title).trim() : '';
    const rawContent = typeof body.content === 'string' ? body.content.trim() : '';

    if (!rawTitle || !rawContent) {
      res.status(400).json({
        success: false,
        error: 'Title and content are required',
      });
      return;
    }

    if (rawContent.length > 500_000) {
      res.status(413).json({
        success: false,
        error: 'Article content exceeds maximum allowed size.',
      });
      return;
    }

    const baseUrl = getSafeAppBaseUrl(req);
    const store = readJournalStore();
    const soroArticleId =
      typeof body.soro_article_id === 'string' ? body.soro_article_id.trim().slice(0, 120) : '';

    // Idempotency: if this exact soro_article_id was already published, return existing record
    if (soroArticleId) {
      const existingBySoroId = store.posts.find((p) => p.soroArticleId === soroArticleId);
      if (existingBySoroId) {
        res.status(200).json({
          success: true,
          post_id: existingBySoroId.id,
          post_url: `${baseUrl}/blog/${existingBySoroId.slug}`,
          edit_url: `${baseUrl}/admin`,
          duplicate: true,
        });
        return;
      }
    }

    const requestedSlug =
      typeof body.slug === 'string' && body.slug.trim()
        ? slugifyTitle(body.slug)
        : slugifyTitle(rawTitle);
    const baseSlug = requestedSlug || `dispatch-${Date.now()}`;

    let slug = baseSlug;
    let slugConflict = false;
    if (store.posts.some((p) => p.slug === slug)) {
      slugConflict = true;
      slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const allowedStatuses = new Set(['draft', 'publish', 'published', 'pending', 'private']);
    const requestedStatus =
      typeof body.status === 'string' ? body.status.trim().toLowerCase() : 'publish';
    let normalizedStatus = allowedStatuses.has(requestedStatus)
      ? requestedStatus === 'publish'
        ? 'published'
        : requestedStatus
      : 'published';

    if (slugConflict) {
      normalizedStatus = 'draft';
    }

    const sanitizedHtml = sanitizeJournalHtml(rawContent);
    const rawExcerpt =
      typeof body.excerpt === 'string' && body.excerpt.trim()
        ? stripHtmlTags(body.excerpt)
        : typeof body.meta_description === 'string' && body.meta_description.trim()
        ? stripHtmlTags(body.meta_description)
        : stripHtmlTags(sanitizedHtml).slice(0, 220);

    const featuredUrlCandidate =
      body.featured_image_url ?? body.featured_image ?? body.image_url ?? body.cover_image;
    const coverImage = isSafeHttpUrl(featuredUrlCandidate) ? featuredUrlCandidate : null;

    const category =
      typeof body.category === 'string' && body.category.trim()
        ? decodeHtmlEntities(body.category).trim().slice(0, 60)
        : 'Travel Journal';

    const rawTags: string[] = [];
    if (Array.isArray(body.tags)) {
      for (const t of body.tags) {
        if (typeof t === 'string' && t.trim()) rawTags.push(t.trim());
      }
    } else if (typeof body.tags === 'string' && body.tags.trim()) {
      rawTags.push(...body.tags.split(',').map((s) => s.trim()).filter(Boolean));
    }
    if (category) rawTags.push(category);

    const focusKeyword =
      typeof body.focus_keyword === 'string' ? body.focus_keyword.trim().slice(0, 120) : undefined;
    const metaDescription =
      typeof body.meta_description === 'string'
        ? stripHtmlTags(body.meta_description).slice(0, 320)
        : rawExcerpt.slice(0, 320);

    const nowIso = new Date().toISOString();
    const postId = `soro-${crypto.randomBytes(6).toString('hex')}`;

    const newPost: JournalPost = {
      id: postId,
      slug,
      title: rawTitle.slice(0, 220),
      excerpt: rawExcerpt.slice(0, 320),
      body: sanitizedHtml,
      cover_image: coverImage,
      tags: inferJournalTags(rawTitle, rawExcerpt, rawTags),
      category,
      metaDescription,
      focusKeyword,
      soroArticleId: soroArticleId || undefined,
      status: normalizedStatus,
      published_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
      source: 'soro',
      contentFormat: 'html',
      readingTimeMinutes: estimateReadingTimeMinutes(sanitizedHtml),
      authorName: 'Atlas Global Tours Editorial',
    };

    writeJournalStore({
      lastSyncedAt: store.lastSyncedAt || nowIso,
      posts: [newPost, ...store.posts],
    });

    const responseData: Record<string, unknown> = {
      success: true,
      post_id: postId,
      post_url: `${baseUrl}/blog/${slug}`,
      edit_url: `${baseUrl}/admin`,
      featured_image_id: coverImage ? postId : null,
    };
    if (slugConflict) {
      responseData.slug_conflict = true;
      responseData.saved_as_draft = true;
    }

    res.status(201).json(responseData);
  };

  const handleIndexNowStatus = (req: Request, res: Response) => {
    const baseUrl = getSafeAppBaseUrl(req);
    const existing = readIndexNowKey();
    if (!existing) {
      res.status(200).json({ success: true, configured: false });
      return;
    }
    res.status(200).json({
      success: true,
      configured: true,
      key: existing.key,
      key_location: `${baseUrl}/${existing.key}.txt`,
      host: new URL(baseUrl).host,
    });
  };

  const handleIndexNowSetup = (req: Request, res: Response) => {
    const baseUrl = getSafeAppBaseUrl(req);
    const key = crypto.randomBytes(16).toString('hex');
    writeIndexNowKey(key);
    res.status(200).json({
      success: true,
      key,
      key_location: `${baseUrl}/${key}.txt`,
      host: new URL(baseUrl).host,
    });
  };

  // Register official Soro WordPress REST namespace (/wp-json/soro/v1/*) + /api/soro/v1/* aliases
  app.get('/wp-json/soro/v1/verify', requireSoroAuth, handleSoroVerify);
  app.get('/api/soro/v1/verify', requireSoroAuth, handleSoroVerify);

  app.post('/wp-json/soro/v1/publish', requireSoroAuth, handleSoroPublish);
  app.post('/api/soro/v1/publish', requireSoroAuth, handleSoroPublish);

  app.get('/wp-json/soro/v1/indexnow-status', requireSoroAuth, handleIndexNowStatus);
  app.post('/wp-json/soro/v1/setup-indexnow', requireSoroAuth, handleIndexNowSetup);

  // Serve Soro IndexNow verification key file if configured (strict 32-char hex only)
  app.get('/:key.txt', (req: Request, res: Response, next: NextFunction) => {
    const requestedKey = typeof req.params.key === 'string' ? req.params.key : '';
    if (!/^[a-f0-9]{32}$/.test(requestedKey)) {
      next();
      return;
    }
    const existing = readIndexNowKey();
    if (!existing || existing.key !== requestedKey) {
      next();
      return;
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(existing.key);
  });
}
