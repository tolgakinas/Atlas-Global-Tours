import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Check,
  Minus,
  Sparkles,
  ArrowRight,
  Share2,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Utensils,
  Gauge,
  ShieldCheck,
  Star,
  Layers,
  ChevronDown,
  Info,
  Copy,
  Printer,
  SlidersHorizontal,
  Compass,
  Search
} from 'lucide-react';
import { Tour } from '../data/toursData';
import { useTours } from '../context/ToursContext';
import { useCurrency } from '../context/CurrencyContext';
import { useReviews } from '../context/ReviewsContext';
import { useComparison } from '../context/ComparisonContext';

interface TourComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTour: (slug: string) => void;
  onBookTour?: (slug: string) => void;
  isStandalonePage?: boolean;
}

export const TourComparisonModal: React.FC<TourComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectTour,
  onBookTour,
  isStandalonePage = false,
}) => {
  const { tours } = useTours();
  const { formatPrice } = useCurrency();
  const { getTourRatingStats } = useReviews();
  const {
    comparedSlugs,
    removeTourFromCompare,
    addTourToCompare,
    clearComparison,
    maxTours,
    highlightDifferences,
    setHighlightDifferences,
  } = useComparison();

  const [addTourDropdownOpen, setAddTourDropdownOpen] = useState(false);
  const [searchTourQuery, setSearchTourQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'pricing' | 'inclusions' | 'pace' | 'itinerary'>('all');

  // Selected tour objects
  const selectedTours = useMemo(() => {
    return comparedSlugs
      .map((slug) => tours.find((t) => t.slug === slug))
      .filter((t): t is Tour => Boolean(t));
  }, [comparedSlugs, tours]);

  // Available tours to add
  const availableToAdd = useMemo(() => {
    return tours.filter(
      (t) =>
        t.is_published &&
        !comparedSlugs.includes(t.slug) &&
        (searchTourQuery === '' ||
          t.title.toLowerCase().includes(searchTourQuery.toLowerCase()) ||
          (t.countries || []).some((c) => c.toLowerCase().includes(searchTourQuery.toLowerCase())) ||
          (t.region || '').toLowerCase().includes(searchTourQuery.toLowerCase()))
    );
  }, [tours, comparedSlugs, searchTourQuery]);

  // Share comparison link
  const handleCopyShareLink = async () => {
    try {
      const url = `${window.location.origin}/compare?compare=${comparedSlugs.join(',')}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen && !isStandalonePage) return null;

  // Helper to determine if an attribute differs across selected tours
  const doesDiffer = (extractor: (tour: Tour) => any): boolean => {
    if (selectedTours.length <= 1) return false;
    const firstVal = JSON.stringify(extractor(selectedTours[0]));
    return selectedTours.some((t) => JSON.stringify(extractor(t)) !== firstVal);
  };

  // Pre-calculate difference states for smart row highlighting
  const diffs = {
    price: doesDiffer((t) => t.price_cents),
    duration: doesDiffer((t) => (t.tour_type === 'day' ? t.duration_hours : t.days)),
    groupSize: doesDiffer((t) => t.max_pax || 12),
    difficulty: doesDiffer((t) => t.difficulty || 'Moderate'),
    breakfasts: doesDiffer((t) => t.meals_breakfasts || 0),
    lunches: doesDiffer((t) => t.meals_lunches || 0),
    dinners: doesDiffer((t) => t.meals_dinners || 0),
    countries: doesDiffer((t) => (t.countries || []).sort().join(',')),
    cultureLevel: doesDiffer((t) => t.culture_level || 3),
    adventureLevel: doesDiffer((t) => t.adventure_level || 3),
    relaxationLevel: doesDiffer((t) => t.relaxation_level || 3),
    singleSupplement: doesDiffer((t) => t.single_supplement_percent || 15),
  };

  return (
    <div
      role={isStandalonePage ? 'region' : 'dialog'}
      aria-modal={!isStandalonePage}
      aria-labelledby="comparison-title"
      className={
        isStandalonePage
          ? 'w-full'
          : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden'
      }
    >
      {/* Backdrop for Modal Mode */}
      {!isStandalonePage && (
        <div
          className="fixed inset-0 bg-ink/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Container */}
      <div
        className={`relative flex flex-col bg-card border border-border shadow-2xl z-10 w-full overflow-hidden ${
          isStandalonePage
            ? 'rounded-2xl min-h-[600px]'
            : 'max-w-7xl max-h-[92vh] rounded-2xl animate-in zoom-in-95 duration-200'
        }`}
      >
        {/* Top Control Header */}
        <div className="shrink-0 border-b border-border bg-card px-4 py-3.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="comparison-title" className="text-base sm:text-lg font-display font-bold text-foreground">
                  Side-by-Side Tour Comparison
                </h2>
                <span className="rounded-full bg-primary/15 text-primary text-xs font-semibold px-2 py-0.5">
                  {selectedTours.length} of {maxTours} Selected
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Compare price, duration, daily pace, and key boutique inclusions.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2">
            {/* Highlight Differences Toggle */}
            <button
              type="button"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer border transition-all ${
                highlightDifferences
                  ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                  : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Highlight rows where packages have differences"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span className="hidden sm:inline">Highlight</span> Differences
              {highlightDifferences && <Check className="size-3 text-amber-600" />}
            </button>

            {/* Copy Share Link */}
            {selectedTours.length > 0 && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                title="Copy shareable comparison link"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-3.5 text-muted-foreground" />
                    <span className="hidden md:inline">Share</span>
                  </>
                )}
              </button>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Print comparison table"
            >
              <Printer className="size-3.5 text-muted-foreground" />
            </button>

            {/* Clear All */}
            {selectedTours.length > 0 && (
              <button
                type="button"
                onClick={clearComparison}
                className="inline-flex items-center gap-1 rounded-lg border border-destructive/20 hover:bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors cursor-pointer"
                title="Clear all compared tours"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            {/* Close Button (Modal Mode) */}
            {!isStandalonePage && (
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full bg-background border border-border text-foreground hover:bg-muted transition-colors cursor-pointer ml-1"
                aria-label="Close comparison modal"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="shrink-0 border-b border-border/70 bg-muted/30 px-4 py-2 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[0.68rem] uppercase font-bold text-muted-foreground mr-1">Jump to:</span>
          {[
            { id: 'all', label: 'All Attributes' },
            { id: 'pricing', label: 'Pricing & Group Size' },
            { id: 'inclusions', label: 'Key Inclusions & Meals' },
            { id: 'pace', label: 'Difficulty & Demands' },
            { id: 'itinerary', label: 'Destinations & Route' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`rounded-md px-2.5 py-1 font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                activeSection === sec.id
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Table Content / Scrollable Matrix */}
        <div className="flex-1 overflow-auto bg-card text-foreground">
          {selectedTours.length === 0 ? (
            /* Empty State */
            <div className="py-20 px-6 text-center max-w-lg mx-auto space-y-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <SlidersHorizontal className="size-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">
                No Tours Selected for Comparison
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select 2 or more journeys from our catalog to compare their routes, pricing, group limits, and comprehensive inclusions side-by-side.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAddTourDropdownOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Choose Tours to Compare</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="min-w-[700px] w-full">
              {/* STICKY HEADER ROW: Tour Cards Side-by-Side */}
              <div className="sticky top-0 z-20 grid border-b border-border bg-card/95 backdrop-blur-md shadow-xs grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                {/* Top-Left Corner Cell */}
                <div className="p-4 border-r border-border flex flex-col justify-between bg-muted/40">
                  <div className="space-y-1">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                      Comparing
                    </span>
                    <p className="font-display font-bold text-sm text-foreground">
                      {selectedTours.length} {selectedTours.length === 1 ? 'Package' : 'Packages'}
                    </p>
                  </div>

                  {/* Add Tour Slot in Top-Left or Columns */}
                  {selectedTours.length < maxTours && (
                    <div className="relative mt-2">
                      <button
                        type="button"
                        onClick={() => setAddTourDropdownOpen(!addTourDropdownOpen)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Add Package ({selectedTours.length}/{maxTours})</span>
                      </button>

                      {/* Dropdown Tour Picker */}
                      {addTourDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1">
                          <div className="relative mb-2">
                            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              value={searchTourQuery}
                              onChange={(e) => setSearchTourQuery(e.target.value)}
                              placeholder="Search tour or country..."
                              className="w-full h-8 pl-8 pr-2 text-xs rounded-md bg-background border border-border outline-none focus:border-primary"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-56 overflow-y-auto space-y-1 text-xs">
                            {availableToAdd.length === 0 ? (
                              <p className="p-3 text-center text-muted-foreground text-xs">
                                No available tours found
                              </p>
                            ) : (
                              availableToAdd.slice(0, 15).map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    addTourToCompare(t.slug);
                                    setAddTourDropdownOpen(false);
                                    setSearchTourQuery('');
                                  }}
                                  className="w-full text-left p-2 rounded-md hover:bg-muted flex items-start gap-2 transition-colors cursor-pointer"
                                >
                                  <img
                                    src={t.hero_image}
                                    alt={t.title}
                                    className="size-8 rounded object-cover shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground truncate">{t.title}</p>
                                    <p className="text-[0.65rem] text-muted-foreground">
                                      {t.tour_type === 'day' ? 'Day Tour' : `${t.days} Days`} · {formatPrice(t.price_cents, t.currency)}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tour Column Headers */}
                {selectedTours.map((tour) => {
                  const ratingStats = getTourRatingStats(tour.slug, tour.title);

                  return (
                    <div
                      key={tour.id}
                      className="relative p-4 border-r border-border last:border-r-0 flex flex-col justify-between bg-card group"
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeTourFromCompare(tour.slug)}
                        className="absolute top-2.5 right-2.5 z-10 flex size-6 items-center justify-center rounded-full bg-background/90 border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="size-3" />
                      </button>

                      {/* Thumbnail & Basic Info */}
                      <div>
                        <div className="relative aspect-16/9 w-full rounded-lg overflow-hidden bg-muted mb-2.5 border border-border/60">
                          <img
                            src={tour.hero_image}
                            alt={tour.title}
                            className="size-full object-cover"
                          />
                          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/80 backdrop-blur-xs text-sand px-2 py-0.5 text-[0.65rem] font-bold">
                            {tour.tour_type === 'day' ? 'Day Tour' : `${tour.days} Days`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[0.68rem] text-primary font-semibold mb-1">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{tour.countries ? tour.countries.join(' · ') : tour.region}</span>
                        </div>

                        <h3
                          onClick={() => onSelectTour(tour.slug)}
                          className="font-display text-sm font-bold leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                          title={tour.title}
                        >
                          {tour.title}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="size-3 fill-amber-400 text-amber-400 mr-0.5" />
                            <span>{ratingStats.averageRating.toFixed(1)}</span>
                          </div>
                          <span>·</span>
                          <span className="text-[0.68rem]">({ratingStats.totalReviews} reviews)</span>
                        </div>
                      </div>

                      {/* Header Bottom Price & Quick CTA */}
                      <div className="mt-3 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground block">
                            From
                          </span>
                          <span className="font-display text-base font-bold text-primary">
                            {formatPrice(tour.price_cents, tour.currency)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectTour(tour.slug)}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-background hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                          >
                            <span>Details</span>
                            <ArrowRight className="size-3" />
                          </button>
                          {onBookTour && (
                            <button
                              type="button"
                              onClick={() => onBookTour(tour.slug)}
                              className="inline-flex items-center gap-1 rounded-md bg-primary hover:bg-primary/90 px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-2xs transition-colors cursor-pointer"
                            >
                              <span>Book</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* COMPARISON DATA ROWS */}
              <div className="divide-y divide-border">
                {/* SECTION 1: PRICING & GROUP SIZE */}
                {(activeSection === 'all' || activeSection === 'pricing') && (
                  <>
                    <div className="bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <SlidersHorizontal className="size-3.5 text-primary" />
                      <span>Pricing & Group Specifications</span>
                    </div>

                    {/* Price Row */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && diffs.price ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Starting Price
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-sm">
                          <span className="font-display font-bold text-base text-foreground">
                            {formatPrice(tour.price_cents, tour.currency)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            {tour.tour_type === 'day' ? '/ adult' : 'per person'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Cost Per Day Row */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Average Daily Value
                      </div>
                      {selectedTours.map((tour) => {
                        const days = tour.days || 1;
                        const dailyCents = Math.round(tour.price_cents / days);
                        return (
                          <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                            <span className="font-semibold text-foreground">
                              {formatPrice(dailyCents, tour.currency)}
                            </span>
                            <span className="text-muted-foreground ml-1">/ day</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Group Size Row */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && diffs.groupSize ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Group Capacity
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs flex items-center gap-1.5">
                          <Users className="size-3.5 text-primary shrink-0" />
                          <span className="font-semibold text-foreground">
                            Max {tour.max_pax || 12} guests
                          </span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[0.65rem] font-medium text-primary">
                            Boutique guaranteed
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Deposit Required */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Deposit Required
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                          {tour.deposit_cents > 0 ? (
                            <span className="font-semibold text-foreground">
                              {formatPrice(tour.deposit_cents, tour.currency)} to secure seat
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-600">
                              Instant reservation · Flexible balance
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Single Room Supplement */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && diffs.singleSupplement ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Solo / Single Supplement
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs text-muted-foreground">
                          {tour.tour_type === 'day' ? (
                            <span>No single supplement on day tours</span>
                          ) : (
                            <span>+{tour.single_supplement_percent || 15}% for private single room; free twin-share match available</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* SECTION 2: KEY INCLUSIONS & MEALS */}
                {(activeSection === 'all' || activeSection === 'inclusions') && (
                  <>
                    <div className="bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="size-3.5 text-primary" />
                      <span>Key Inclusions & Dining Breakdown</span>
                    </div>

                    {/* Licensed Local Guide */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Licensed Guide
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="size-4 shrink-0 text-emerald-600" />
                          <span>100% Licensed Ministry Guide</span>
                        </div>
                      ))}
                    </div>

                    {/* Accommodation Category */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Accommodation
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                          {tour.tour_type === 'day' ? (
                            <span className="text-muted-foreground">Day excursion (hotels not included)</span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-foreground">
                                {tour.nights} Nights Boutique Hotels
                              </span>
                              <p className="text-[0.7rem] text-muted-foreground">
                                Character cave hotels, historic mansions & hand-picked lodgings
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Meals Breakdown */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && (diffs.breakfasts || diffs.lunches || diffs.dinners)
                          ? 'bg-amber-500/10 dark:bg-amber-950/20'
                          : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Meals Included
                      </div>
                      {selectedTours.map((tour) => {
                        const b = tour.meals_breakfasts ?? (tour.tour_type === 'multi_day' ? tour.days - 1 : 0);
                        const l = tour.meals_lunches ?? (tour.tour_type === 'day' ? 1 : Math.round(tour.days * 0.4));
                        const d = tour.meals_dinners ?? (tour.tour_type === 'multi_day' ? 2 : 0);

                        return (
                          <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <Utensils className="size-3.5 text-primary shrink-0" />
                              <span className="font-semibold text-foreground">
                                {b + l + d} Total Meals
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[0.68rem] text-muted-foreground font-medium">
                              <span className="bg-background/80 rounded px-1.5 py-0.5 border border-border/60">
                                {b} Breakfasts
                              </span>
                              <span className="bg-background/80 rounded px-1.5 py-0.5 border border-border/60">
                                {l} Lunches
                              </span>
                              <span className="bg-background/80 rounded px-1.5 py-0.5 border border-border/60">
                                {d} Dinners
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Transport & Vehicles */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Transport & Transfers
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Check className="size-3.5 text-emerald-600 shrink-0" />
                            <span>Private A/C Mercedes Sprinter</span>
                          </div>
                          <p className="text-[0.7rem] text-muted-foreground">
                            {tour.tour_type === 'multi_day'
                              ? 'Includes airport meet & greet transfers, ferry passages & in-country domestic flights where indicated.'
                              : 'Hotel pickup & drop-off included in central operational zones.'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Entrance Tickets & Admissions */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Monument Admissions
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs flex items-center gap-1.5 text-foreground">
                          <Check className="size-3.5 text-emerald-600 shrink-0" />
                          <span>All museum and archaeological site entries included with skip-the-line guide access</span>
                        </div>
                      ))}
                    </div>

                    {/* Full Inclusions Summary */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Full Inclusions List
                      </div>
                      {selectedTours.map((tour) => {
                        const inclusionsList = (tour.includes && tour.includes.length > 0)
                          ? tour.includes
                          : [
                              'All accommodations in boutique properties',
                              'Licensed expert English-speaking guide',
                              'Air-conditioned private minivan transport',
                              'All entrance fees according to itinerary',
                              'Daily breakfasts and selected regional lunches',
                              '24/7 Operations Desk support',
                            ];

                        return (
                          <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {inclusionsList.map((inc, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-foreground/90 text-[0.72rem]">
                                  <Check className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{inc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* SECTION 3: DIFFICULTY, PACE & DEMANDS */}
                {(activeSection === 'all' || activeSection === 'pace') && (
                  <>
                    <div className="bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Gauge className="size-3.5 text-primary" />
                      <span>Physical Demands & Travel Experience</span>
                    </div>

                    {/* Difficulty Level */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && diffs.difficulty ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Difficulty Rating
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs flex items-center gap-2">
                          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
                            {tour.difficulty || 'Moderate'}
                          </span>
                          <span className="text-muted-foreground text-[0.7rem]">
                            {tour.activity_level || 'Moderate walking on cobblestones & trails'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Cultural Immersion Score */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && diffs.cultureLevel ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Culture Immersion
                      </div>
                      {selectedTours.map((tour) => {
                        const level = tour.culture_level || 4;
                        return (
                          <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((idx) => (
                                <div
                                  key={idx}
                                  className={`h-2 w-5 rounded-xs ${
                                    idx <= level ? 'bg-primary' : 'bg-muted border border-border'
                                  }`}
                                />
                              ))}
                              <span className="text-[0.68rem] text-muted-foreground ml-1.5 font-semibold">
                                {level}/5
                              </span>
                            </div>
                            <span className="text-[0.68rem] text-muted-foreground">Deep local community engagement</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Adventure Score */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && diffs.adventureLevel ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Adventure Rating
                      </div>
                      {selectedTours.map((tour) => {
                        const level = tour.adventure_level || 3;
                        return (
                          <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((idx) => (
                                <div
                                  key={idx}
                                  className={`h-2 w-5 rounded-xs ${
                                    idx <= level ? 'bg-amber-500' : 'bg-muted border border-border'
                                  }`}
                                />
                              ))}
                              <span className="text-[0.68rem] text-muted-foreground ml-1.5 font-semibold">
                                {level}/5
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* SECTION 4: DESTINATIONS & ROUTE */}
                {(activeSection === 'all' || activeSection === 'itinerary') && (
                  <>
                    <div className="bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Compass className="size-3.5 text-primary" />
                      <span>Destinations, Stops & Route Summary</span>
                    </div>

                    {/* Countries Covered */}
                    <div
                      className={`grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] ${
                        highlightDifferences && diffs.countries ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Countries Visited
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {(tour.countries || [tour.continent || 'Europe']).map((c) => (
                              <span
                                key={c}
                                className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Route Stops / Days Summary */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Route Highlights & Stops
                      </div>
                      {selectedTours.map((tour) => {
                        const dayTitles = (tour.daysList && tour.daysList.length > 0)
                          ? tour.daysList.map((d) => d.title)
                          : (tour.summary ? [tour.summary] : ['Comprehensive guided daily exploration']);

                        return (
                          <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                            <ol className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {dayTitles.map((title, i) => (
                                <li key={i} className="text-[0.72rem] text-foreground/85 flex items-start gap-1.5">
                                  <span className="font-mono text-[0.65rem] font-bold text-primary shrink-0">
                                    D{i + 1}:
                                  </span>
                                  <span className="truncate">{title}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        );
                      })}
                    </div>

                    {/* Key Themes */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Themes & Style
                      </div>
                      {selectedTours.map((tour) => (
                        <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {(tour.themes || []).map((theme) => (
                              <span
                                key={theme}
                                className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Exclusions */}
                    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))]">
                      <div className="p-3.5 sm:p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                        Not Included
                      </div>
                      {selectedTours.map((tour) => {
                        const excludes = (tour.excludes && tour.excludes.length > 0)
                          ? tour.excludes
                          : ['International flights', 'Personal travel insurance', 'Discretionary tips for guides & drivers'];

                        return (
                          <div key={tour.id} className="p-3.5 sm:p-4 border-r border-border last:border-r-0 text-xs">
                            <ul className="space-y-1">
                              {excludes.map((exc, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-muted-foreground text-[0.7rem]">
                                  <Minus className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                                  <span>{exc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* BOTTOM ACTION ROW */}
                <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(240px,1fr))] bg-muted/20">
                  <div className="p-4 border-r border-border font-medium text-xs text-muted-foreground flex items-center">
                    Reserve & Learn More
                  </div>
                  {selectedTours.map((tour) => (
                    <div key={tour.id} className="p-4 border-r border-border last:border-r-0 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectTour(tour.slug)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                      >
                        <span>View Full Itinerary</span>
                        <ArrowRight className="size-3.5" />
                      </button>

                      {onBookTour && (
                        <button
                          type="button"
                          onClick={() => onBookTour(tour.slug)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors cursor-pointer"
                        >
                          <span>Book Guaranteed Departure</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
