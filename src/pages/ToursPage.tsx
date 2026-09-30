import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw, Compass, LayoutGrid, Layers, Globe } from 'lucide-react';
import { TOURS_DATA, DESTINATION_REGIONS, Tour } from '../data/toursData';
import { TourCard } from '../components/TourCard';

interface ToursPageProps {
  onSelectTour: (slug: string) => void;
  initialRegion?: string;
}

export const ToursPage: React.FC<ToursPageProps> = ({ onSelectTour, initialRegion }) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(initialRegion || 'All');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grouped');

  useEffect(() => {
    if (initialRegion) {
      setSelectedRegion(initialRegion);
    }
  }, [initialRegion]);

  const multiDayTours = useMemo(() => {
    return TOURS_DATA.filter((t) => t.tour_type === 'multi_day');
  }, []);

  // Defined regions list
  const regionsList = useMemo(() => {
    const definedNames = DESTINATION_REGIONS.map((r) => r.name);
    return ['All', ...definedNames];
  }, []);

  // Themes list
  const themes = useMemo(() => {
    const set = new Set<string>();
    multiDayTours.forEach((t) => {
      t.themes.forEach((th) => set.add(th));
    });
    return ['All', ...Array.from(set).sort()];
  }, [multiDayTours]);

  // Counts by region
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    multiDayTours.forEach((t) => {
      const reg = t.region || 'Other Destinations';
      counts[reg] = (counts[reg] || 0) + 1;
    });
    return counts;
  }, [multiDayTours]);

  const filteredTours = useMemo(() => {
    return multiDayTours.filter((tour) => {
      const matchSearch =
        tour.title.toLowerCase().includes(search.toLowerCase()) ||
        tour.summary?.toLowerCase().includes(search.toLowerCase()) ||
        tour.description?.toLowerCase().includes(search.toLowerCase()) ||
        tour.place?.toLowerCase().includes(search.toLowerCase()) ||
        tour.region?.toLowerCase().includes(search.toLowerCase()) ||
        tour.countries.some((c) => c.toLowerCase().includes(search.toLowerCase()));

      const matchRegion =
        selectedRegion === 'All' || tour.region === selectedRegion;

      const matchTheme =
        selectedTheme === 'All' || tour.themes.includes(selectedTheme);

      const matchDifficulty =
        selectedDifficulty === 'All' ||
        tour.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      let matchDuration = true;
      if (selectedDuration === 'short') matchDuration = tour.days <= 6;
      else if (selectedDuration === 'medium') matchDuration = tour.days >= 7 && tour.days <= 10;
      else if (selectedDuration === 'long') matchDuration = tour.days > 10;

      return matchSearch && matchRegion && matchTheme && matchDifficulty && matchDuration;
    });
  }, [multiDayTours, search, selectedRegion, selectedTheme, selectedDifficulty, selectedDuration]);

  // Group filtered tours by destination region for grouped view
  const groupedToursByRegion = useMemo(() => {
    const map = new Map<string, Tour[]>();

    DESTINATION_REGIONS.forEach((regionDef) => {
      const toursInRegion = filteredTours.filter((t) => t.region === regionDef.name);
      if (toursInRegion.length > 0) {
        map.set(regionDef.name, toursInRegion);
      }
    });

    // Handle any tours that might belong to other regions
    const remaining = filteredTours.filter(
      (t) => !DESTINATION_REGIONS.some((rd) => rd.name === t.region)
    );
    if (remaining.length > 0) {
      map.set('Other Journeys', remaining);
    }

    return map;
  }, [filteredTours]);

  const resetFilters = () => {
    setSearch('');
    setSelectedRegion('All');
    setSelectedTheme('All');
    setSelectedDuration('All');
    setSelectedDifficulty('All');
  };

  return (
    <div className="min-h-screen py-10 lg:py-14">
      <div className="container-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow text-primary">Worldwide Journeys Regarding Places</span>
            <h1 className="mt-2 text-4xl font-display font-bold sm:text-5xl text-foreground">
              Small group journeys by destination
            </h1>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
              Explore authentic expeditions organized regarding places and regions — from Türkiye's hidden corners (Istanbul, Cappadocia, the Lycian Coast, Göbeklitepe & Eastern express trains) to Jordan, Egypt, Morocco, the Balkans, Transylvania, Kenya, and beyond.
            </p>
          </div>

          {/* View Mode Switch */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 self-start md:self-auto shrink-0 shadow-sm">
            <button
              onClick={() => setViewMode('grouped')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'grouped'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="View trips grouped by Destination & Place"
            >
              <Layers className="size-3.5" />
              By Place
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="View all trips in a standard catalog grid"
            >
              <LayoutGrid className="size-3.5" />
              All Trips Grid
            </button>
          </div>
        </div>

        {/* Place / Region Quick Tabs */}
        <div className="mt-8 border-b border-border pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" /> Filter by Place / Region:
            </span>
            <span className="text-xs text-muted-foreground">
              {filteredTours.length} trip{filteredTours.length !== 1 ? 's' : ''} available
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedRegion('All')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedRegion === 'All'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All Places ({multiDayTours.length})
            </button>

            {regionsList
              .filter((r) => r !== 'All')
              .map((regionName) => {
                const count = regionCounts[regionName] || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={regionName}
                    onClick={() => setSelectedRegion(regionName)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      selectedRegion === regionName
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {regionName} ({count})
                  </button>
                );
              })}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by place, country, town (e.g. Göbeklitepe, Petra, Cappadocia, Kars)..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Reset button if filtered */}
            {(search || selectedRegion !== 'All' || selectedTheme !== 'All' || selectedDuration !== 'All' || selectedDifficulty !== 'All') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Reset all filters
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                Theme / Travel Style
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {themes.map((th) => (
                  <option key={th} value={th}>
                    {th}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">Any Duration</option>
                <option value="short">Short (1–6 Days)</option>
                <option value="medium">Standard (7–10 Days)</option>
                <option value="long">Grand Expeditions (11+ Days)</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                Activity Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy / Leisurely</option>
                <option value="Moderate">Moderate</option>
                <option value="Challenging">Challenging / Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && (
          <div className="mt-16 text-center rounded-xl border border-dashed border-border p-12 bg-card">
            <Compass className="mx-auto size-12 text-muted-foreground/60 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground">No journeys found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
              We couldn't find any trips matching your criteria. Try resetting your search filters or select a different place.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Content Presentation: Grouped by Place vs Grid */}
        {viewMode === 'grouped' ? (
          <div className="mt-12 space-y-16">
            {Array.from(groupedToursByRegion.entries()).map(([regionName, tours]) => {
              const regionDef = DESTINATION_REGIONS.find((r) => r.name === regionName);

              return (
                <section key={regionName} className="scroll-mt-20">
                  {/* Region Editorial Banner */}
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm mb-8">
                    {regionDef && (
                      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-muted">
                        <img
                          src={regionDef.heroImage}
                          alt={regionDef.name}
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
                          <span className="text-xs uppercase tracking-widest font-bold text-primary">
                            {regionDef.subtitle}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-1">
                            {regionName}
                          </h2>
                          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl line-clamp-2">
                            {regionDef.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {regionDef.places.map((placeName) => (
                              <span
                                key={placeName}
                                className="rounded-full border border-border/80 bg-background/80 backdrop-blur-xs px-2.5 py-0.5 text-[0.65rem] font-medium text-foreground/80"
                              >
                                {placeName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {!regionDef && (
                      <div className="p-6 border-b border-border bg-paper/60">
                        <h2 className="text-2xl font-display font-bold text-foreground">
                          {regionName}
                        </h2>
                      </div>
                    )}
                  </div>

                  {/* Tours in this Place / Region */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tours.map((tour) => (
                      <TourCard key={tour.id} tour={tour} onSelect={onSelectTour} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} onSelect={onSelectTour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
