import React, { useMemo } from 'react';
import { SlidersHorizontal, ArrowLeft, Plus, Compass, Sparkles, MapPin } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useTours } from '../context/ToursContext';
import { TourComparisonModal } from '../components/TourComparisonModal';

interface ComparePageProps {
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
  onBookTour?: (slug: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  onNavigate,
  onSelectTour,
  onBookTour,
}) => {
  const { comparedSlugs, setComparedSlugs, clearComparison } = useComparison();
  const { tours } = useTours();

  // Curated popular comparison pairs for instant discovery
  const popularComparisons = useMemo(() => {
    return [
      {
        title: 'Highlights vs Grand Odyssey',
        description: 'Compare our 7-day classic route with our in-depth 12-day cross-country expedition.',
        slugs: [
          '7-day-highlights-of-turkiye-small-group-tour',
          '12-day-grand-classical-turkiye-small-group-tour',
        ],
      },
      {
        title: 'Istanbul Walk vs Cappadocia Valleys',
        description: 'Explore the urban Ottoman heritage vs fairy-chimney volcanic trail discovery.',
        slugs: [
          'istanbul-small-group-city-and-secret-streets-tour-with-guide',
          'cappadocia-valleys-caves-and-underground-city-tour-with-guide',
        ],
      },
      {
        title: 'Mediterranean Coast vs Aegean Ancient Wonders',
        description: 'Compare Turquoise Coast gulet sailing with Ephesus and Pergamon classical antiquities.',
        slugs: [
          'turkey-western-wonders-and-aegean-coast-8-days',
          'ephesus-and-hierapolis-pamukkale-2-day-express',
        ],
      },
    ];
  }, []);

  const handleSelectPopularPair = (slugs: string[]) => {
    // Find valid slugs in tours
    const validSlugs = slugs.filter((s) => tours.some((t) => t.slug === s));
    if (validSlugs.length > 0) {
      setComparedSlugs(validSlugs);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container-page space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/tours')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Back to All Tours</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {comparedSlugs.length} tour{comparedSlugs.length !== 1 ? 's' : ''} in comparison
            </span>
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <SlidersHorizontal className="size-3.5" />
            <span>Side-by-Side Evaluation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Compare Small Group Expeditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Evaluate routes, daily pace, group size guarantees, and key inclusions side-by-side to choose the perfect departure for your travel style.
          </p>
        </div>

        {/* Comparison Matrix or Popular Pairings */}
        {comparedSlugs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 sm:p-12 text-center space-y-8">
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <Compass className="size-7" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">
                Select Tours to Begin Comparison
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                You currently have no tours in your comparison tray. Browse our journeys and click the "Compare" button on any tour card, or pick one of our recommended pairings below.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/tours')}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Browse All Journeys</span>
                </button>
              </div>
            </div>

            {/* Curated Popular Pairings */}
            <div className="border-t border-border/80 pt-8 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>Popular Comparison Pairings</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {popularComparisons.map((pair, idx) => (
                  <div
                    key={idx}
                    className="group rounded-xl border border-border bg-background p-4 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-1.5 mb-4">
                      <h4 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {pair.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {pair.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPopularPair(pair.slugs)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <span>Load this comparison</span>
                      <SlidersHorizontal className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <TourComparisonModal
            isOpen={true}
            onClose={() => {}}
            onSelectTour={onSelectTour}
            onBookTour={onBookTour}
            isStandalonePage={true}
          />
        )}
      </div>
    </div>
  );
};
