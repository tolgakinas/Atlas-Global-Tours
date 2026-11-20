import React from 'react';
import { Clock, Users, Gauge, ArrowRight, MapPin, Star, SlidersHorizontal, Check } from 'lucide-react';
import { Tour } from '../data/toursData';
import { useCurrency } from '../context/CurrencyContext';
import { useReviews } from '../context/ReviewsContext';
import { useComparison } from '../context/ComparisonContext';
import { getTourFallbackImage } from '../utils/tourImageFallback';

interface TourCardProps {
  tour: Tour;
  onSelect: (slug: string) => void;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onSelect }) => {
  const { formatPrice } = useCurrency();
  const { getTourRatingStats } = useReviews();
  const { isTourInComparison, toggleTourComparison } = useComparison();

  const isCompared = isTourInComparison(tour.slug);
  const ratingStats = getTourRatingStats(tour.slug, tour.title);

  const durationLabel = tour.tour_type === 'day'
    ? (tour.duration_hours ? `${tour.duration_hours}H` : 'Half / full day')
    : `${tour.days}D / ${tour.nights}N`;

  const paceLabel = tour.tour_type === 'day'
    ? 'Half / full day'
    : `${tour.nights} night${tour.nights > 1 ? 's' : ''}`;

  return (
    <div
      onClick={() => onSelect(tour.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:ring-primary/20 cursor-pointer"
    >
      {/* Tour Image */}
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-muted">
        <img
          src={tour.hero_image || getTourFallbackImage(tour)}
          alt={tour.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = getTourFallbackImage(tour);
            if (!target.src.endsWith(fallback)) {
              target.src = fallback;
            }
          }}
          className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/75 to-transparent pointer-events-none" />

        {/* Badge / Category */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          <span className="rounded-full border border-primary/30 bg-background/95 backdrop-blur-sm px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary shadow-sm">
            {tour.tour_type === 'day' ? 'Day Tour' : `${tour.days} Days`}
          </span>
          {tour.countries && tour.countries[0] && (
            <span className="rounded-full border border-border bg-ink/75 backdrop-blur-sm px-2 py-0.5 text-[0.65rem] font-semibold text-sand shadow-sm">
              {tour.countries.join(' · ')}
            </span>
          )}
        </div>

        {/* Compare Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTourComparison(tour.slug);
          }}
          className={`absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold backdrop-blur-md shadow-xs transition-all cursor-pointer ${
            isCompared
              ? 'border border-primary bg-primary text-primary-foreground shadow-sm scale-102'
              : 'border border-border/80 bg-background/85 text-foreground/80 hover:bg-background hover:text-primary hover:border-primary/40'
          }`}
          title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
        >
          {isCompared ? (
            <>
              <Check className="size-3" />
              <span>Comparing</span>
            </>
          ) : (
            <>
              <SlidersHorizontal className="size-3" />
              <span>Compare</span>
            </>
          )}
        </button>
      </div>

      {/* Tour Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Place / Destination & Rating */}
        <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
          {(tour.place || tour.region) ? (
            <div className="flex items-center gap-1.5 text-primary font-medium min-w-0">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{tour.place || tour.region}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 shrink-0 font-bold text-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-xs">{ratingStats.averageRating.toFixed(1)}</span>
            <span className="text-[0.65rem] text-muted-foreground font-normal">
              ({ratingStats.totalReviews})
            </span>
          </div>
        </div>

        <h3 className="font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {tour.title}
        </h3>

        {tour.summary && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {tour.summary}
          </p>
        )}

        {/* 4-Stat Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-md border border-border/80 bg-background/60 px-2.5 py-2">
            <Clock className="size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                Duration
              </span>
              <span className="block truncate text-xs font-semibold text-foreground">
                {durationLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border/80 bg-background/60 px-2.5 py-2">
            <Users className="size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                Group
              </span>
              <span className="block truncate text-xs font-semibold text-foreground">
                Max {tour.max_pax || 12} pax
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border/80 bg-background/60 px-2.5 py-2">
            <Gauge className="size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                Difficulty
              </span>
              <span className="block truncate text-xs font-semibold capitalize text-foreground">
                {tour.difficulty || 'Moderate'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border/80 bg-background/60 px-2.5 py-2">
            <Clock className="size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                Pace
              </span>
              <span className="block truncate text-xs font-semibold text-foreground">
                {paceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Theme Pills */}
        {tour.themes && tour.themes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tour.themes.slice(0, 3).map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-success-border bg-success-soft px-2 py-0.5 text-[0.65rem] font-medium text-success"
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Pricing & CTA */}
        <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
          <div>
            <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
              {tour.tour_type === 'day' ? 'Adult Fare from' : 'Starting from'}
            </span>
            <span className="font-display text-lg font-bold text-primary">
              {formatPrice(tour.price_cents, tour.currency)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {tour.tour_type === 'day' ? '/ adult' : 'per person'}
              </span>
            </span>
            {tour.tour_type === 'day' && (
              <span className="block text-[0.62rem] font-medium text-emerald-600 dark:text-emerald-400">
                Group discount up to 12
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            View <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
