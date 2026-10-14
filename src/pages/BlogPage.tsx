import React, { useState } from 'react';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { POSTS_DATA, Post } from '../data/postsData';

interface BlogPageProps {
  onSelectPost: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onSelectPost }) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = ['all', 'planning', 'seasons', 'cappadocia', 'hiking', 'food'];

  const filteredPosts = selectedTag === 'all'
    ? POSTS_DATA
    : POSTS_DATA.filter((p) => p.tags.includes(selectedTag));

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container-page">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="eyebrow text-primary">Journal</p>
          <h1 className="mt-2 text-4xl font-display font-bold sm:text-5xl text-foreground">
            Notes from the road & global dispatches
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Route ideas, seasons, food and the practical details we get asked most often by travellers before visiting destinations worldwide.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card hover:bg-muted text-muted-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
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
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-16/10 bg-paper flex items-center justify-center p-6 border-b border-border">
                  <Tag className="size-8 text-primary/40" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground mb-2">
                  <Calendar className="size-3" />
                  <span>
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h2 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
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
      </div>
    </div>
  );
};
