import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw, Compass, LayoutGrid, Layers, Globe, Sparkles } from 'lucide-react';
import { DESTINATION_COUNTRIES, DestinationCountry, tourMatchesCountry, Tour } from '../data/toursData';
import { useTours } from '../context/ToursContext';
import { useComparison } from '../context/ComparisonContext';
import { TourCard } from '../components/TourCard';

interface ToursPageProps {
  onSelectTour: (slug: string) => void;
  initialContinent?: string;
  initialRegion?: string;
  initialCountry?: string;
}

export const ToursPage: React.FC<ToursPageProps> = ({
  onSelectTour,
  initialContinent,
  initialRegion,
  initialCountry,
}) => {
  const {
    tours,
    searchQuery,
    setSearchQuery,
    selectedActivityFilter,
    setSelectedActivityFilter,
    clearFilters,
  } = useTours();
  const { comparedSlugs, openComparisonModal } = useComparison();
  const [selectedContinent, setSelectedContinent] = useState<string>(initialContinent || 'All');
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry || 'All');
  const [search, setSearch] = useState(searchQuery || '');
  const [selectedTheme, setSelectedTheme] = useState(
    selectedActivityFilter !== 'All' ? selectedActivityFilter : 'All'
  );
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState<'grouped' | 'grid'>('grouped');

  // Sync when ToursContext search query changes (e.g. from header search bar)
  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedActivityFilter && selectedActivityFilter !== 'All') {
      setSelectedTheme(selectedActivityFilter);
    }
  }, [selectedActivityFilter]);

  useEffect(() => {
    if (initialContinent) {
      setSelectedContinent(initialContinent);
    }
  }, [initialContinent]);

  useEffect(() => {
    if (initialCountry) {
      setSelectedCountry(initialCountry);
      // Auto-set matching continent if known
      const match = DESTINATION_COUNTRIES.find(
        (c) => c.name.toLowerCase() === initialCountry.toLowerCase()
      );
      if (match) {
        setSelectedContinent(match.continent);
      }
    }
  }, [initialCountry]);

  const multiDayTours = useMemo(() => {
    return tours.filter((t) => t.tour_type === 'multi_day' && t.is_published);
  }, [tours]);

  const continents = ['All', 'Europe', 'Asia', 'Africa'];

  // Countries belonging to the active continent
  const availableCountries = useMemo(() => {
    if (selectedContinent === 'All') return DESTINATION_COUNTRIES;
    return DESTINATION_COUNTRIES.filter((c) => c.continent === selectedContinent);
  }, [selectedContinent]);

  // Available themes
  const themes = useMemo(() => {
    const set = new Set<string>();
    multiDayTours.forEach((t) => {
      t.themes.forEach((th) => set.add(th));
    });
    return ['All', ...Array.from(set).sort()];
  }, [multiDayTours]);

  // Counts by continent
  const continentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    multiDayTours.forEach((t) => {
      const cont = t.continent || 'Europe';
      counts[cont] = (counts[cont] || 0) + 1;
    });
    return counts;
  }, [multiDayTours]);

  // Filtered tours for search/theme/duration/country
  const filteredTours = useMemo(() => {
    return multiDayTours.filter((tour) => {
      const matchSearch =
        tour.title.toLowerCase().includes(search.toLowerCase()) ||
        tour.summary?.toLowerCase().includes(search.toLowerCase()) ||
        tour.description?.toLowerCase().includes(search.toLowerCase()) ||
        tour.place?.toLowerCase().includes(search.toLowerCase()) ||
        tour.region?.toLowerCase().includes(search.toLowerCase()) ||
        (tour.continent && tour.continent.toLowerCase().includes(search.toLowerCase())) ||
        tour.countries.some((c) => c.toLowerCase().includes(search.toLowerCase()));

      const matchContinent =
        selectedContinent === 'All' || tour.continent === selectedContinent;

      const matchCountry =
        selectedCountry === 'All' || tourMatchesCountry(tour, selectedCountry, tour.continent);

      const matchTheme =
        selectedTheme === 'All' || tour.themes.includes(selectedTheme);

      const matchDifficulty =
        selectedDifficulty === 'All' ||
        tour.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      let matchDuration = true;
      if (selectedDuration === 'short') matchDuration = tour.days <= 6;
      else if (selectedDuration === 'medium') matchDuration = tour.days >= 7 && tour.days <= 10;
      else if (selectedDuration === 'long') matchDuration = tour.days > 10;

      return (
        matchSearch &&
        matchContinent &&
        matchCountry &&
        matchTheme &&
        matchDifficulty &&
        matchDuration
      );
    });
  }, [
    multiDayTours,
    search,
    selectedContinent,
    selectedCountry,
    selectedTheme,
    selectedDifficulty,
    selectedDuration,
  ]);

  // Categorize by Continent -> then categorize according to Countries.
  // Rule: If any tour has multiple countries, show the same tour under every regarding country!
  const toursByContinentAndCountry = useMemo(() => {
    const activeContinents =
      selectedContinent === 'All' ? ['Europe', 'Asia', 'Africa'] : [selectedContinent];

    const result: Array<{
      continent: string;
      countries: Array<{ countryDef: DestinationCountry; tours: Tour[] }>;
    }> = [];

    activeContinents.forEach((cont) => {
      const countriesInCont = DESTINATION_COUNTRIES.filter((c) => c.continent === cont);
      const countryGroups: Array<{ countryDef: DestinationCountry; tours: Tour[] }> = [];

      countriesInCont.forEach((countryDef: DestinationCountry) => {
        if (selectedCountry !== 'All' && selectedCountry.toLowerCase() !== countryDef.name.toLowerCase()) {
          return;
        }

        // Multi-country rule: Any tour that includes this country will be present under this country!
        const matchingTours = filteredTours.filter((t) =>
          tourMatchesCountry(t, countryDef.name, cont)
        );

        if (matchingTours.length > 0) {
          countryGroups.push({ countryDef, tours: matchingTours });
        }
      });

      if (countryGroups.length > 0) {
        result.push({ continent: cont, countries: countryGroups });
      }
    });

    return result;
  }, [filteredTours, selectedContinent, selectedCountry]);

  const resetFilters = () => {
    setSearch('');
    clearFilters();
    setSelectedContinent('All');
    setSelectedCountry('All');
    setSelectedTheme('All');
    setSelectedDuration('All');
    setSelectedDifficulty('All');
  };

  const fallbackImages: Record<string, string> = {
    Europe: '/countries/turkiye-europe.jpg',
    Asia: '/countries/jordan.jpg',
    Africa: '/countries/egypt.jpg',
  };

  return (
    <div className="min-h-screen py-10 lg:py-14">
      <div className="container-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow text-primary">Destinations & Places by Continent</span>
            <h1 className="mt-2 text-4xl font-display font-bold sm:text-5xl text-foreground">
              Small group journeys by country
            </h1>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
              Curated small group journeys categorized regarding continents and their respective countries. Cross-border expeditions and multi-country itineraries are featured under every country visited.
            </p>
          </div>

          {/* View Mode Switch */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 self-start md:self-auto shrink-0 shadow-xs">
            <button
              onClick={() => setViewMode('grouped')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'grouped'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="View trips organized regarding continents & countries"
            >
              <Layers className="size-3.5" />
              By Continent & Country
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
            {comparedSlugs.length > 0 && (
              <button
                type="button"
                onClick={openComparisonModal}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                title="Open side-by-side comparison"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Compare ({comparedSlugs.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Continents Navigation Tabs */}
        <div className="mt-8 border-b border-border pb-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary" /> Filter by Continent:
            </span>
            <span className="text-xs text-muted-foreground">
              Showing {filteredTours.length} trip{filteredTours.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {continents.map((cont) => {
              const count =
                cont === 'All' ? multiDayTours.length : continentCounts[cont] || 0;
              const isSelected = selectedContinent === cont;

              return (
                <button
                  key={cont}
                  onClick={() => {
                    setSelectedContinent(cont);
                    setSelectedCountry('All'); // Reset country when changing continent
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Globe className="size-3.5" />
                  <span>{cont === 'All' ? 'All Continents' : cont}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[0.65rem] ${
                      isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Countries Selector under selected continent */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[0.7rem] uppercase font-bold text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
            <MapPin className="size-3 text-primary" /> Country:
          </span>

          <button
            onClick={() => setSelectedCountry('All')}
            className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              selectedCountry === 'All'
                ? 'bg-ink text-background shadow-xs'
                : 'border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All {selectedContinent !== 'All' ? selectedContinent : ''} Countries
          </button>

          {availableCountries.map((country) => {
            const count = multiDayTours.filter((t) =>
              tourMatchesCountry(t, country.name, country.continent)
            ).length;
            if (count === 0) return null;
            const isSelected = selectedCountry.toLowerCase() === country.name.toLowerCase();

            return (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country.name)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-ink text-background shadow-xs'
                    : 'border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-[0.65rem] opacity-75">({count})</span>
              </button>
            );
          })}
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search places, countries, tours (e.g. Jordan, Transylvania, Cappadocia)..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Reset button if filtered */}
            {(search ||
              selectedContinent !== 'All' ||
              selectedCountry !== 'All' ||
              selectedTheme !== 'All' ||
              selectedDuration !== 'All' ||
              selectedDifficulty !== 'All') && (
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
              We couldn't find any trips matching your criteria. Try resetting your search filters or select a different continent or country.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Content Presentation: Grouped by Continent & Country vs Standard Grid */}
        {viewMode === 'grouped' ? (
          <div className="mt-14 space-y-20">
            {toursByContinentAndCountry.map(({ continent, countries }) => (
              <section key={continent} className="space-y-12">
                {/* Continent Section Header */}
                <div className="flex items-center gap-3 border-b-2 border-primary/20 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-primary">
                      Continent
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                      {continent}
                    </h2>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-muted-foreground">
                    {countries.length} {countries.length === 1 ? 'country' : 'countries'}
                  </span>
                </div>

                {/* Countries in this Continent */}
                <div className="space-y-16">
                  {countries.map(({ countryDef, tours: countryTours }) => {
                    const fallback =
                      fallbackImages[countryDef.continent] || fallbackImages.Europe;
                    const multiCountryList = countryTours.filter(
                      (t) => (t.countries || []).length > 1
                    );

                    return (
                      <div key={countryDef.id} className="scroll-mt-20">
                        {/* Country Banner Card */}
                        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm mb-7">
                          <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-muted">
                            <img
                              src={countryDef.heroImage}
                              alt={countryDef.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== fallback) {
                                  target.src = fallback;
                                }
                              }}
                              className="size-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                                  {countryDef.continent}
                                </span>
                                {multiCountryList.length > 0 && (
                                  <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 text-[0.65rem] font-bold flex items-center gap-1">
                                    <Sparkles className="size-3" />
                                    Multi-Country Routes Included
                                  </span>
                                )}
                                <span className="text-xs uppercase tracking-widest font-semibold text-sand">
                                  {countryDef.subtitle}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <span className="text-3xl leading-none">{countryDef.flag}</span>
                                <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                                  {countryDef.name}
                                </h3>
                                <span className="text-xs font-semibold text-muted-foreground ml-2">
                                  ({countryTours.length} {countryTours.length === 1 ? 'journey' : 'journeys'})
                                </span>
                              </div>

                              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl line-clamp-2">
                                {countryDef.description}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {countryDef.places.map((placeName) => (
                                  <span
                                    key={placeName}
                                    className="rounded-full border border-border/80 bg-background/80 backdrop-blur-xs px-2.5 py-0.5 text-[0.65rem] font-medium text-foreground/85"
                                  >
                                    {placeName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tour Cards Grid (Featuring both single-country and multi-country tours visiting this country) */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {countryTours.map((tour) => {
                            const isMultiCountry = (tour.countries || []).length > 1;

                            return (
                              <div key={`${countryDef.id}-${tour.id}`} className="relative flex flex-col">
                                {isMultiCountry && (
                                  <div className="mb-1 flex items-center gap-1 text-[0.65rem] font-semibold text-primary">
                                    <Sparkles className="size-3 shrink-0" />
                                    <span>
                                      Cross-Border Itinerary: {tour.countries.join(' · ')}
                                    </span>
                                  </div>
                                )}
                                <TourCard tour={tour} onSelect={onSelectTour} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Standard Catalog Grid View */
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
