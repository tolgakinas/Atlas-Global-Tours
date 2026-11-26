import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { POSTS_DATA } from '../data/postsData';
import {
  estimateReadingTimeMinutes,
  type JournalPostSummary,
} from '../utils/journalPosts';

interface BlogPageProps {
  onSelectPost: (slug: string) => void;
  onNavigate: (path: string) => void;
}

const PAGE_SIZE = 12;

const LOCAL_FALLBACK_SUMMARIES: JournalPostSummary[] = POSTS_DATA.map((p) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  cover_image: p.cover_image,
  tags: p.tags,
  status: p.status,
  published_at: p.published_at,
  source: 'local',
  readingTimeMinutes: estimateReadingTimeMinutes(p.body),
  authorName: 'Atlas Global Tours Editorial',
}));

function formatTagLabel(tag: string): string {
  if (tag === 'all') return 'All Dispatches';
  return tag
    .split(/[-_]/g)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

export const BlogPage: React.FC<BlogPageProps> = ({ onSelectPost }) => {
  const [posts, setPosts] = useState<JournalPostSummary[]>(LOCAL_FALLBACK_SUMMARIES);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/journal/posts');
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts as JournalPostSummary[]);
          if (data.tagCounts && typeof data.tagCounts === 'object') {
            setTagCounts(data.tagCounts as Record<string, number>);
          }
        }
      } catch {
        // Keep local fallback articles seamlessly
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build top filter tags ordered by frequency
  const topTags = useMemo(() => {
    const counts = { ...tagCounts };
    if (Object.keys(counts).length === 0) {
      for (const p of posts) {
        for (const t of p.tags) {
          counts[t] = (counts[t] || 0) + 1;
        }
      }
    }
    const sorted = Object.entries(counts)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
    return ['all', ...sorted];
  }, [posts, tagCounts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (selectedTag !== 'all' && !post.tags.some((t) => t.toLowerCase() === selectedTag)) {
        return false;
      }
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, selectedTag, searchQuery]);

  // Reset pagination whenever search or topic changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedTag, searchQuery]);

  const showFeaturedHero = selectedTag === 'all' && !searchQuery.trim() && filteredPosts.length > 1;
  const featuredPost = showFeaturedHero ? filteredPosts[0] : null;
  const gridSource = showFeaturedHero ? filteredPosts.slice(1) : filteredPosts;
  const visiblePosts = gridSource.slice(0, visibleCount);
  const hasMore = visibleCount < gridSource.length;

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container-page">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary">Travel Journal</p>
            <h1 className="mt-2 text-4xl font-display font-bold sm:text-5xl text-foreground">
              Notes from the road & global dispatches
            </h1>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
              Route ideas, seasonal timing, visas, local gastronomy, and practical travel guides curated by our field specialists worldwide.
            </p>
          </div>

          {/* Live Search */}
          <div className="w-full lg:w-80">
            <div className="relative">
              <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${posts.length} articles...`}
                aria-label="Search journal articles"
                className="w-full rounded-lg border border-input bg-card pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Topic Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {topTags.map((tag) => {
            const count = tag === 'all' ? posts.length : tagCounts[tag];
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'border border-border bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                <span>{formatTagLabel(tag)}</span>
                {typeof count === 'number' && (
                  <span className={`ml-1.5 text-[0.65rem] ${selectedTag === tag ? 'opacity-85' : 'opacity-65'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && posts.length <= LOCAL_FALLBACK_SUMMARIES.length && (
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span>Loading latest journal dispatches...</span>
          </div>
        )}

        {/* Featured Latest Dispatch */}
        {featuredPost && (
          <article
            onClick={() => onSelectPost(featuredPost.slug)}
            className="mt-10 group grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer lg:grid-cols-12"
          >
            <div className="relative aspect-16/10 lg:aspect-auto lg:col-span-7 overflow-hidden bg-muted">
              {featuredPost.cover_image ? (
                <img
                  src={featuredPost.cover_image}
                  alt={featuredPost.title}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="size-full min-h-[240px] bg-paper flex items-center justify-center">
                  <BookOpen className="size-12 text-primary/30" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-5">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="font-semibold uppercase tracking-wider text-primary">
                  Latest Dispatch
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {new Date(featuredPost.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {featuredPost.readingTimeMinutes} min read
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {featuredPost.title}
              </h2>

              <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <span>Read full article</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </article>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <BookOpen className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-foreground">
              No matching articles found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different keyword or switch back to all dispatches.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTag('all');
                setSearchQuery('');
              }}
              className="mt-5 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {/* Results Counter */}
            {(selectedTag !== 'all' || searchQuery.trim()) && (
              <p className="mt-8 text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{filteredPosts.length}</strong>{' '}
                {filteredPosts.length === 1 ? 'article' : 'articles'}
                {selectedTag !== 'all' ? ` in ${formatTagLabel(selectedTag)}` : ''}
                {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ''}.
              </p>
            )}

            {/* Post Grid */}
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onSelectPost(post.slug)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {post.cover_image ? (
                    <div className="relative aspect-16/10 overflow-hidden bg-muted">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-16/10 bg-paper flex items-center justify-center p-6 border-b border-border">
                      <Tag className="size-8 text-primary/40" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-2 text-[0.7rem] text-muted-foreground mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3" />
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readingTimeMinutes} min
                      </span>
                    </div>

                    <h2 className="font-display text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-border text-xs font-semibold text-primary">
                      <span>Read dispatch</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted transition-colors cursor-pointer shadow-xs"
                >
                  <span>
                    Load More Articles ({gridSource.length - visibleCount} remaining)
                  </span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
