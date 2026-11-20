import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useTours } from '../context/ToursContext';
import { useCurrency } from '../context/CurrencyContext';

interface TourComparisonBarProps {
  onOpenModal?: () => void;
  onNavigateCompare?: () => void;
}

export const TourComparisonBar: React.FC<TourComparisonBarProps> = ({
  onOpenModal,
  onNavigateCompare,
}) => {
  const { comparedSlugs, removeTourFromCompare, clearComparison, openComparisonModal, maxTours } = useComparison();
  const { tours } = useTours();
  const { formatPrice } = useCurrency();
  const [isMinimized, setIsMinimized] = useState(false);

  if (comparedSlugs.length === 0) return null;

  const comparedTours = comparedSlugs
    .map((slug) => tours.find((t) => t.slug === slug))
    .filter(Boolean);

  const handleCompareClick = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      openComparisonModal();
    }
  };

  return (
    <aside
      aria-label="Tour comparison tray"
      className="fixed bottom-0 inset-x-0 z-40 p-2 sm:p-4 pointer-events-none transition-all duration-300"
    >
      <div className="container-page max-w-5xl mx-auto pointer-events-auto">
        <div className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
          {/* Bar Header / Mini Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <SlidersHorizontal className="size-3.5" />
              </div>
              <span className="text-xs font-display font-bold text-foreground">
                Tour Comparison Tray
              </span>
              <span className="rounded-full bg-primary/15 text-primary text-[0.65rem] font-bold px-2 py-0.5">
                {comparedTours.length}/{maxTours}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {comparedTours.length > 0 && (
                <button
                  type="button"
                  onClick={clearComparison}
                  className="text-[0.7rem] text-muted-foreground hover:text-destructive transition-colors cursor-pointer mr-1"
                >
                  Clear All
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex size-6 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                title={isMinimized ? 'Expand comparison bar' : 'Minimize comparison bar'}
              >
                {isMinimized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Content Tray */}
          {!isMinimized && (
            <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Tour Thumbnails / Slots */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
                {comparedTours.map((tour) => {
                  if (!tour) return null;
                  return (
                    <div
                      key={tour.id}
                      className="relative group flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pr-2.5 shrink-0 max-w-[210px] shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      <img
                        src={tour.hero_image}
                        alt={tour.title}
                        className="size-11 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate" title={tour.title}>
                          {tour.title}
                        </p>
                        <p className="text-[0.65rem] text-primary font-medium">
                          {formatPrice(tour.price_cents, tour.currency)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeTourFromCompare(tour.slug)}
                        className="flex size-5 items-center justify-center rounded-full bg-muted/80 hover:bg-destructive hover:text-white text-muted-foreground transition-colors cursor-pointer shrink-0"
                        title="Remove from comparison"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Empty Placeholder Slots */}
                {Array.from({ length: maxTours - comparedTours.length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="hidden sm:flex items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 h-14 shrink-0 text-[0.7rem] text-muted-foreground/70"
                  >
                    <span>+ Empty slot</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={handleCompareClick}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md transition-all cursor-pointer hover:shadow-lg hover:scale-102"
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span>Compare Side-by-Side</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
