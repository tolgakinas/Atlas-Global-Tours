import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Loader2,
  Share2,
  Tag,
} from 'lucide-react';
import { POSTS_DATA } from '../data/postsData';
import { SafeArticleContent } from '../components/SafeArticleContent';
import {
  estimateReadingTimeMinutes,
  type JournalPost,
  type JournalPostSummary,
} from '../utils/journalPosts';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectPost: (slug: string) => void;
}

function findLocalPost(slug: string): JournalPost | null {
  const match = POSTS_DATA.find((p) => p.slug === slug);
  if (!match) return null;
  return {
    ...match,
    source: 'local',
    contentFormat: 'plain',
    readingTimeMinutes: estimateReadingTimeMinutes(match.body),
    authorName: 'Atlas Global Tours Editorial',
  };
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  slug,
  onNavigate,
  onSelectPost,
}) => {
  const [post, setPost] = useState<JournalPost | null>(() => findLocalPost(slug));
  const [related, setRelated] = useState<JournalPostSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !findLocalPost(slug));
  const [notFound, setNotFound] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const localMatch = findLocalPost(slug);
    setPost(localMatch);
    setNotFound(false);
    setLoading(!localMatch);

    (async () => {
      try {
        const res = await fetch(`/api/journal/posts/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.post) {
            setPost(data.post as JournalPost);
            setRelated(Array.isArray(data.related) ? (data.related as JournalPostSummary[]) : []);
            setNotFound(false);
          }
        } else if (!cancelled && !localMatch) {
          setNotFound(true);
        }
      } catch {
        if (!cancelled && !localMatch) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const prevTitle = document.title;
    document.title = `${post.title} | Atlas Global Tours Journal`;
    const metaEl = document.querySelector('meta[name="description"]');
    const prevDesc = metaEl?.getAttribute('content') || '';
    if (metaEl && (post.metaDescription || post.excerpt)) {
      metaEl.setAttribute('content', post.metaDescription || post.excerpt);
    }
    return () => {
      document.title = prevTitle;
      if (metaEl && prevDesc) {
        metaEl.setAttribute('content', prevDesc);
      }
    };
  }, [post]);

  const handleShare = async () => {
    if (!post) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: shareUrl });
        return;
      } catch {
        // User cancelled or share unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen py-20">
        <div className="container-page max-w-xl text-center">
          <p className="eyebrow text-primary">Travel Journal</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
            Article not found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The dispatch you are looking for may have moved or been unpublished.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/blog')}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Back to all dispatches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container-page max-w-3xl">
        <button
          type="button"
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          Back to journal
        </button>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mb-3">
            <span className="eyebrow text-primary">{post.category || 'Dispatch'}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {post.readingTimeMinutes || estimateReadingTimeMinutes(post.body)} min read
            </span>
          </div>

          <h1 className="text-3xl font-display font-bold sm:text-4xl md:text-5xl text-foreground leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary pl-4">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.cover_image && (
          <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-muted mb-10 shadow-md border border-border">
            <img src={post.cover_image} alt={post.title} className="size-full object-cover" />
          </div>
        )}

        {/* Sanitized Rich Article Body (Zero dangerouslySetInnerHTML) */}
        <article>
          <SafeArticleContent
            content={post.body}
            format={post.contentFormat}
            onNavigate={onNavigate}
          />
        </article>

        {/* Tags & Share */}
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-paper border border-border px-2.5 py-0.5 text-xs text-muted-foreground font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Link copied</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5" />
                <span>Share article</span>
              </>
            )}
          </button>
        </div>

        {/* Related Dispatches */}
        {related.length > 0 && (
          <section className="mt-14 pt-10 border-t border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              More from the Journal
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((item) => (
                <article
                  key={item.id}
                  onClick={() => onSelectPost(item.slug)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  {item.cover_image && (
                    <div className="aspect-16/10 overflow-hidden bg-muted">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[0.68rem] text-muted-foreground">
                      {new Date(item.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-foreground group-hover:text-primary line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <span className="mt-auto pt-3 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-primary">
                      Read <ArrowRight className="size-3" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
