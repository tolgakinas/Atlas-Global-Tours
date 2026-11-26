import type { Post } from '../data/postsData';

export type JournalPostSource = 'soro' | 'wordpress' | 'local';
export type JournalContentFormat = 'html' | 'plain';

export interface JournalPost extends Post {
  source: JournalPostSource;
  contentFormat: JournalContentFormat;
  category?: string;
  metaDescription?: string;
  focusKeyword?: string;
  soroArticleId?: string;
  wpId?: number;
  readingTimeMinutes: number;
  authorName?: string;
}

export interface JournalPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  tags: string[];
  category?: string;
  status: string;
  published_at: string;
  source: JournalPostSource;
  readingTimeMinutes: number;
  authorName?: string;
}

export function isSafeHttpUrl(rawUrl: unknown): rawUrl is string {
  if (typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
};

export function decodeHtmlEntities(input: string): string {
  if (!input) return '';
  return input
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&([a-zA-Z]+);/g, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(
    html
      .replace(/<(script|style|noscript|iframe|object|embed)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function estimateReadingTimeMinutes(content: string): number {
  const plain = stripHtmlTags(content);
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugifyTitle(value: string): string {
  return decodeHtmlEntities(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

/**
 * Server-side HTML sanitizer removing active/executable elements, inline event handlers,
 * styles, and unsafe URL schemes before persisting articles to storage.
 */
export function sanitizeJournalHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let cleaned = rawHtml
    // Remove dangerous container elements and their contents completely
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|noscript|svg|math|meta|link|base)[\s\S]*?<\/\1>/gi, '')
    // Remove self-closing / unclosed dangerous tags
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|noscript|svg|math|meta|link|base)\b[^>]*\/?>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '');

  // Strip inline event handlers (on*) and style/srcdoc attributes
  cleaned = cleaned
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(?:style|srcdoc|formaction)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Neutralize javascript:, data:, vbscript: schemes in href/src attributes
  cleaned = cleaned.replace(
    /\b(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (_match, attr: string, dq?: string, sq?: string, bare?: string) => {
      const rawVal = (dq ?? sq ?? bare ?? '').trim();
      const lower = rawVal.replace(/[\u0000-\u001F\s]+/g, '').toLowerCase();
      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:')
      ) {
        return '';
      }
      const escaped = rawVal.replace(/"/g, '&quot;');
      return `${attr.toLowerCase()}="${escaped}"`;
    }
  );

  return cleaned.trim();
}

const TOPIC_RULES: Array<{ tag: string; pattern: RegExp }> = [
  { tag: 'turkey', pattern: /\b(turkey|türkiye|turkiye|istanbul|cappadocia|ephesus|pamukkale|antalya|gaziantep|ankara|izmir|gallipoli|troy|bosphorus)\b/i },
  { tag: 'morocco', pattern: /\b(morocco|marrakech|marrakesh|fez|fes|casablanca|sahara|chefchaouen|atlas mountains|essaouira|rabat)\b/i },
  { tag: 'egypt', pattern: /\b(egypt|cairo|nile|luxor|aswan|giza|pyramids|alexandria|abu simbel)\b/i },
  { tag: 'jordan', pattern: /\b(jordan|petra|wadi rum|amman|dead sea|jerash|aqaba)\b/i },
  { tag: 'japan', pattern: /\b(japan|tokyo|kyoto|osaka|hiroshima|hokkaido|nara|mount fuji|ryokan|shinkansen)\b/i },
  { tag: 'europe', pattern: /\b(greece|athens|santorini|italy|rome|spain|portugal|croatia|balkans|scotland|iceland|europe|mediterranean)\b/i },
  { tag: 'asia', pattern: /\b(vietnam|thailand|cambodia|india|uzbekistan|silk road|bali|indonesia|asia|korea|seoul)\b/i },
  { tag: 'americas', pattern: /\b(peru|machu picchu|patagonia|argentina|chile|mexico|costa rica|colombia|brazil|south america|latin america)\b/i },
  { tag: 'planning', pattern: /\b(visa|insurance|packing|pack|budget|tipping|tip|airport|flight|safety|safe|solo|dietary|currency|best time|season|weather|itinerary|booking|passport|health|vaccine)\b/i },
  { tag: 'culture', pattern: /\b(culture|cultural|history|ancient|unesco|architecture|museum|tradition|local|guide|heritage|festival|art)\b/i },
  { tag: 'food', pattern: /\b(food|culinary|cuisine|wine|street food|restaurant|dining|dish|tea|coffee|gastronomy|baklava|spices)\b/i },
  { tag: 'adventure', pattern: /\b(hike|hiking|trek|trekking|desert|cruise|balloon|safari|mountain|wildlife|island|valley|coast)\b/i },
];

export function inferJournalTags(title: string, excerpt: string, rawTags: string[] = []): string[] {
  const result = new Set<string>();
  for (const t of rawTags) {
    const clean = decodeHtmlEntities(t).toLowerCase().trim();
    if (clean && clean !== 'blog' && clean !== 'uncategorized' && clean.length <= 30) {
      result.add(clean);
    }
  }
  const haystack = `${title} ${excerpt}`;
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(haystack)) {
      result.add(rule.tag);
    }
  }
  if (result.size === 0) {
    result.add('planning');
  }
  return Array.from(result).slice(0, 6);
}

export function toJournalSummary(post: JournalPost): JournalPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    tags: post.tags,
    category: post.category,
    status: post.status,
    published_at: post.published_at,
    source: post.source,
    readingTimeMinutes: post.readingTimeMinutes || estimateReadingTimeMinutes(post.body),
    authorName: post.authorName,
  };
}
