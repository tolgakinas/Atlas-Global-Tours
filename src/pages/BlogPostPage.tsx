import React from 'react';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';
import { POSTS_DATA } from '../data/postsData';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectPost: (slug: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onNavigate }) => {
  const post = POSTS_DATA.find((p) => p.slug === slug) || POSTS_DATA[0];

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container-page max-w-3xl">
        <button
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          Back to journal
        </button>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="eyebrow text-primary">Dispatch</span>
            <span>·</span>
            <Calendar className="size-3" />
            <span>
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl font-display font-bold sm:text-4xl md:text-5xl text-foreground leading-tight">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary pl-4">
            {post.excerpt}
          </p>
        </header>

        {post.cover_image && (
          <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-muted mb-10 shadow-md">
            <img src={post.cover_image} alt={post.title} className="size-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <div className="prose prose-stone max-w-none text-base text-foreground/90 leading-relaxed space-y-5">
          {post.body.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n- ');
              return (
                <ul key={index} className="list-disc pl-5 space-y-2">
                  {items.map((item, idx) => (
                    <li key={idx}>{item.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />
            <div className="flex gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-muted-foreground font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.href }).catch(() => {});
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <Share2 className="size-3.5" />
            Share article
          </button>
        </div>
      </div>
    </div>
  );
};
