import React, { useState, useMemo } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Check,
  MapPin,
  Calendar,
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  ChevronDown,
  Building2,
  Users,
  Compass,
  HeartHandshake,
  DollarSign,
  BedDouble,
} from 'lucide-react';
import { StarRating } from './StarRating';
import { WriteReviewModal } from './WriteReviewModal';
import { useReviews } from '../context/ReviewsContext';
import { Review, TravelerType } from '../data/reviewsData';

interface TourReviewsSectionProps {
  tourSlug: string;
  tourTitle: string;
  tourHeroImage?: string;
}

export const TourReviewsSection: React.FC<TourReviewsSectionProps> = ({
  tourSlug,
  tourTitle,
  tourHeroImage,
}) => {
  const { getReviewsForTour, getTourRatingStats, voteHelpful, hasVotedHelpful } = useReviews();

  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TravelerType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [visibleCount, setVisibleCount] = useState(6);

  const stats = useMemo(() => {
    return getTourRatingStats(tourSlug, tourTitle);
  }, [getTourRatingStats, tourSlug, tourTitle]);

  const allReviews = useMemo(() => {
    return getReviewsForTour(tourSlug, tourTitle);
  }, [getReviewsForTour, tourSlug, tourTitle]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...allReviews];

    // Star filter
    if (starFilter !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === starFilter);
    }

    // Traveler type filter
    if (typeFilter !== 'all') {
      list = list.filter((r) => r.travelerType === typeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          r.authorLocation.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      if (sortBy === 'helpful') {
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      }
      return 0;
    });

    return list;
  }, [allReviews, starFilter, typeFilter, searchQuery, sortBy]);

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  return (
    <section id="reviews-section" className="mt-14 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="size-3.5" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Traveler Reviews & Ratings
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Authentic experiences shared by guests who traveled on this journey with Atlas Global Tours.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setWriteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer shrink-0"
        >
          <Star className="size-4 fill-primary-foreground" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Main Score & Breakdown Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Overall Rating Box */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-background/60 border border-border/80">
            <div className="text-5xl font-display font-bold text-foreground">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="mt-2">
              <StarRating rating={stats.averageRating} size="lg" />
            </div>
            <span className="mt-2 block text-xs font-semibold text-muted-foreground">
              Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </span>

            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[0.7rem] font-bold text-success border border-success-border">
              <Check className="size-3 shrink-0" />
              <span>{stats.percentRecommended}% of travelers recommend this tour</span>
            </div>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="lg:col-span-4 space-y-2 text-xs">
            <span className="block font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Rating Breakdown
            </span>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars] || 0;
              const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              const isActiveFilter = starFilter === stars;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setStarFilter(isActiveFilter ? 'all' : stars)}
                  className={`w-full flex items-center gap-2.5 py-1 px-1.5 rounded text-left transition-colors cursor-pointer group ${
                    isActiveFilter ? 'bg-primary/10 font-bold' : 'hover:bg-muted/50'
                  }`}
                >
                  <span className="w-12 shrink-0 font-medium text-foreground flex items-center gap-1">
                    {stars} <Star className="size-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-muted-foreground group-hover:text-foreground">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Averages */}
          <div className="lg:col-span-4 rounded-xl border border-border/80 bg-background/50 p-4 space-y-3">
            <span className="block font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Journey Category Ratings
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <Compass className="size-3.5 text-primary" />
                  <span>Licensed Guide & Knowledge</span>
                </span>
                <span className="font-bold text-foreground">
                  {stats.categoryAverages.guide.toFixed(1)} / 5
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <Calendar className="size-3.5 text-primary" />
                  <span>Itinerary & Pacing</span>
                </span>
                <span className="font-bold text-foreground">
                  {stats.categoryAverages.itinerary.toFixed(1)} / 5
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <DollarSign className="size-3.5 text-primary" />
                  <span>Value for Money</span>
                </span>
                <span className="font-bold text-foreground">
                  {stats.categoryAverages.value.toFixed(1)} / 5
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <BedDouble className="size-3.5 text-primary" />
                  <span>Accommodation & Comfort</span>
                </span>
                <span className="font-bold text-foreground">
                  {stats.categoryAverages.accommodation.toFixed(1)} / 5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews by keyword (e.g. guide, breakfast, sunrise)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-[0.7rem] uppercase font-bold tracking-wider text-muted-foreground mr-1">
            Filter:
          </span>

          {/* Star Filter Pills */}
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setStarFilter('all')}
              className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition-colors cursor-pointer ${
                starFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Stars
            </button>
            {[5, 4, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStarFilter(s)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition-colors cursor-pointer ${
                  starFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span>{s}</span>
                <Star className={`size-3 ${starFilter === s ? 'fill-primary-foreground text-primary-foreground' : 'fill-amber-400 text-amber-400'}`} />
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Traveler Type Pills */}
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-secondary text-secondary-foreground font-bold'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Types
            </button>
            {(['Couple', 'Solo', 'Family', 'Friends'] as TravelerType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-secondary text-secondary-foreground font-bold'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {(starFilter !== 'all' || typeFilter !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setStarFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              className="ml-auto text-[0.7rem] font-bold text-primary hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {displayedReviews.length > 0 ? (
        <div className="space-y-4">
          {displayedReviews.map((review) => {
            const hasVoted = hasVotedHelpful(review.id);
            const authorInitials = review.authorName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all hover:border-border/80"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border/60">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                      {authorInitials}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {review.authorName}
                        </span>
                        {review.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[0.65rem] font-bold text-success border border-success-border">
                            <ShieldCheck className="size-3" />
                            <span>Verified Traveler</span>
                          </span>
                        )}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                          {review.travelerType}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {review.authorLocation && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            <span>{review.authorLocation}</span>
                          </span>
                        )}
                        {review.travelMonth && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>Traveled {review.travelMonth}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1">
                    <StarRating rating={review.rating} size="sm" showValue />
                    <span className="text-[0.7rem] text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="py-4 space-y-2">
                  <h4 className="font-display font-bold text-base text-foreground leading-snug">
                    {review.title}
                  </h4>
                  <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>
                </div>

                {/* Category Sub-Ratings Pills */}
                {review.categoryRatings && (
                  <div className="pt-2 pb-3 flex flex-wrap gap-2 text-[0.7rem]">
                    <span className="rounded bg-muted/60 px-2 py-1 text-muted-foreground">
                      Guide: <strong className="text-foreground">{review.categoryRatings.guide}/5</strong>
                    </span>
                    <span className="rounded bg-muted/60 px-2 py-1 text-muted-foreground">
                      Itinerary: <strong className="text-foreground">{review.categoryRatings.itinerary}/5</strong>
                    </span>
                    <span className="rounded bg-muted/60 px-2 py-1 text-muted-foreground">
                      Value: <strong className="text-foreground">{review.categoryRatings.value}/5</strong>
                    </span>
                    <span className="rounded bg-muted/60 px-2 py-1 text-muted-foreground">
                      Comfort: <strong className="text-foreground">{review.categoryRatings.accommodation}/5</strong>
                    </span>
                  </div>
                )}

                {/* Operator Response if present */}
                {review.hostReply && (
                  <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-primary font-bold">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        <span>Response from Atlas Global Tours ({review.hostReply.author})</span>
                      </div>
                      <span className="text-[0.7rem] text-muted-foreground font-normal">
                        {new Date(review.hostReply.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-foreground/85 leading-relaxed italic pl-5">
                      "{review.hostReply.comment}"
                    </p>
                  </div>
                )}

                {/* Review Footer / Helpful Vote */}
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-[0.7rem] text-muted-foreground">
                    Did you find this review helpful?
                  </span>

                  <button
                    type="button"
                    onClick={() => voteHelpful(review.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                      hasVoted
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <ThumbsUp className={`size-3.5 ${hasVoted ? 'fill-primary' : ''}`} />
                    <span>Helpful ({review.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Show More Button */}
          {visibleCount < filteredReviews.length && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <span>Load More Reviews ({filteredReviews.length - visibleCount} remaining)</span>
                <ChevronDown className="size-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center space-y-3">
          <MessageSquare className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="text-lg font-display font-bold text-foreground">
            No matching reviews found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || starFilter !== 'all' || typeFilter !== 'all'
              ? 'Try relaxing your filter criteria to see all community reviews.'
              : 'Be the first traveler to share feedback and rating for this tour!'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setStarFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
                setWriteModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer"
            >
              <Star className="size-3.5 fill-primary-foreground" />
              <span>Write the First Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      <WriteReviewModal
        isOpen={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        tourSlug={tourSlug}
        tourTitle={tourTitle}
        tourImage={tourHeroImage}
      />
    </section>
  );
};
