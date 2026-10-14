import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, MapPin, Compass, ArrowRight, Sparkles, Filter, Check } from 'lucide-react';
import { useTours, FilterCategory } from '../context/ToursContext';
import { useCurrency } from '../context/CurrencyContext';

interface HeaderSearchBarProps {
  onNavigate: (path: string) => void;
  className?: string;
}

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({ onNavigate, className = '' }) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDestinationFilter,
    setSelectedDestinationFilter,
    selectedActivityFilter,
    setSelectedActivityFilter,
    filterMode,
    setFilterMode,
    clearFilters,
    filteredTours,
  } = useTours();

  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Quick suggestions for one-click exploration
  const popularDestinations = [
    'Japan',
    'Kenya',
    'Italy',
    'Cappadocia',
    'Egypt',
    'Morocco',
    'Greece',
    'Balkans',
  ];

  const popularActivities = [
    'Cultural',
    'Culinary',
    'Wildlife & Safari',
    'Hiking & Walking',
    'Historic',
    'Archaeology',
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener: `/` or `Cmd+K` to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setMobileExpanded(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectTour = (slug: string) => {
    setIsOpen(false);
    setMobileExpanded(false);
    onNavigate(`/tours/${slug}`);
  };

  const handleViewAllResults = () => {
    setIsOpen(false);
    setMobileExpanded(false);
    onNavigate('/tours');
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleViewAllResults();
    }
  };

  const handleQuickFilterClick = (type: 'destination' | 'activity', value: string) => {
    if (type === 'destination') {
      setFilterMode('destination');
      setSearchQuery(value);
    } else {
      setFilterMode('activity');
      setSearchQuery(value);
    }
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedDestinationFilter !== 'All' ||
    selectedActivityFilter !== 'All';

  // Limit displayed results in dropdown to top 5 for optimal viewport fit
  const displayedTours = useMemo(() => {
    return filteredTours.slice(0, 5);
  }, [filteredTours]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Desktop Search Bar */}
      <div className="hidden md:flex items-center">
        <div
          className={`group flex items-center gap-2 rounded-full border bg-card/90 px-3 py-1.5 transition-all duration-200 ${
            isOpen
              ? 'border-primary/60 ring-2 ring-primary/20 shadow-md bg-card w-56 lg:w-72 xl:w-80'
              : 'border-border/80 hover:border-border hover:bg-card w-40 lg:w-56 xl:w-64'
          }`}
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDownInput}
            placeholder="Search tours, places..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
            aria-label="Search tours by name, destination, or activity type"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                clearFilters();
                inputRef.current?.focus();
              }}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
              title="Clear search"
            >
              <X className="size-3" />
            </button>
          ) : (
            <kbd className="hidden xl:inline-flex items-center rounded border border-border/70 bg-muted/50 px-1 py-0.2 text-[0.6rem] font-mono text-muted-foreground select-none shrink-0">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Mobile Search Trigger Icon */}
      <div className="flex md:hidden items-center">
        <button
          type="button"
          onClick={() => {
            setMobileExpanded(!mobileExpanded);
            setTimeout(() => mobileInputRef.current?.focus(), 100);
          }}
          className={`inline-flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
            hasActiveFilters
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border/80 hover:bg-muted'
          }`}
          aria-label="Open tour search"
          title="Search tours"
        >
          <Search className="size-4" />
        </button>
      </div>

      {/* Mobile Expanded Search Bar Overlay */}
      {mobileExpanded && (
        <div className="fixed inset-x-0 top-18 z-50 bg-background/98 backdrop-blur-md border-b border-border p-3 shadow-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 rounded-xl border border-primary/50 bg-card px-3 py-2 shadow-sm">
            <Search className="size-4 shrink-0 text-primary" />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDownInput}
              placeholder="Search tours by name, destination, activity..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  mobileInputRef.current?.focus();
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileExpanded(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-1"
            >
              Done
            </button>
          </div>

          {/* Filter Mode Selector on Mobile */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[0.68rem] text-muted-foreground shrink-0 flex items-center gap-1">
              <Filter className="size-3" /> Filter by:
            </span>
            {(['all', 'name', 'destination', 'activity'] as FilterCategory[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`rounded-full px-2.5 py-1 text-[0.7rem] font-medium capitalize shrink-0 transition-colors ${
                  filterMode === mode
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'all' ? 'All' : mode}
              </button>
            ))}
          </div>

          {/* Mobile Results Container */}
          <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-2">
            {searchQuery ? (
              filteredTours.length > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>{filteredTours.length} matching journey{filteredTours.length > 1 ? 's' : ''}</span>
                    <button
                      onClick={handleViewAllResults}
                      className="text-primary font-semibold hover:underline"
                    >
                      View all in catalog →
                    </button>
                  </div>
                  {filteredTours.slice(0, 6).map((tour) => (
                    <div
                      key={tour.id}
                      onClick={() => handleSelectTour(tour.slug)}
                      className="flex items-center gap-3 p-2 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <img
                        src={tour.hero_image}
                        alt={tour.title}
                        className="size-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{tour.title}</p>
                        <div className="flex items-center gap-2 text-[0.68rem] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="size-3 text-primary" />
                            {tour.place || tour.countries[0] || tour.continent}
                          </span>
                          <span>•</span>
                          <span>{tour.tour_type === 'day' ? 'Day Tour' : `${tour.days} days`}</span>
                        </div>
                        {tour.themes[0] && (
                          <span className="inline-block mt-1 text-[0.62rem] bg-sand/60 text-sand-dark px-1.5 py-0.2 rounded font-medium">
                            {tour.themes[0]}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground block">
                          {formatPrice(tour.price_cents)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <p>No tours matching "{searchQuery}"</p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-xs text-primary font-semibold hover:underline"
                  >
                    Clear search and show all
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <p className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Popular Destinations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularDestinations.map((dest) => (
                      <button
                        key={dest}
                        onClick={() => handleQuickFilterClick('destination', dest)}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Popular Activities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularActivities.map((act) => (
                      <button
                        key={act}
                        onClick={() => handleQuickFilterClick('activity', act)}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Search Dropdown Panel */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 sm:left-auto lg:right-0 top-full mt-2.5 w-[420px] lg:w-[480px] rounded-2xl border border-border bg-card p-3.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Filter Mode Selector Pills */}
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5 mb-2.5">
            <div className="flex items-center gap-1">
              <span className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Filter by:
              </span>
              {(['all', 'name', 'destination', 'activity'] as FilterCategory[]).map((mode) => {
                const isSelected = filterMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium capitalize transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {mode === 'all' ? 'All Fields' : mode}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[0.68rem] font-medium text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Results List or Quick Discovery */}
          {searchQuery.trim() ? (
            filteredTours.length > 0 ? (
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[0.72rem] font-medium text-muted-foreground">
                    Found {filteredTours.length} journey{filteredTours.length > 1 ? 's' : ''}{' '}
                    {filterMode !== 'all' && (
                      <span className="text-primary font-semibold">({filterMode})</span>
                    )}
                  </span>
                  <span className="text-[0.68rem] text-muted-foreground">
                    Press <kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> to view all
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                  {displayedTours.map((tour) => (
                    <div
                      key={tour.id}
                      onClick={() => handleSelectTour(tour.slug)}
                      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-muted/70 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                    >
                      <img
                        src={tour.hero_image}
                        alt={tour.title}
                        className="size-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {tour.title}
                        </p>
                        <div className="flex items-center gap-2 text-[0.68rem] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5 truncate max-w-[130px]">
                            <MapPin className="size-3 text-primary shrink-0" />
                            {tour.place || tour.countries[0] || tour.continent}
                          </span>
                          <span>•</span>
                          <span>
                            {tour.tour_type === 'day'
                              ? 'Day Tour'
                              : `${tour.days}D / ${tour.nights}N`}
                          </span>
                        </div>
                        {/* Activity badge */}
                        <div className="flex items-center gap-1 mt-1">
                          {tour.themes.slice(0, 2).map((th) => (
                            <span
                              key={th}
                              className="inline-flex items-center text-[0.62rem] bg-sand/60 text-sand-dark px-1.5 py-0.2 rounded font-medium"
                            >
                              {th}
                            </span>
                          ))}
                          {tour.activity_level && (
                            <span className="text-[0.62rem] text-muted-foreground font-mono">
                              {tour.activity_level}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground block">
                          {formatPrice(tour.price_cents)}
                        </span>
                        <span className="text-[0.62rem] text-muted-foreground">per person</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between">
                  <span className="text-[0.72rem] text-muted-foreground">
                    Showing top {displayedTours.length} of {filteredTours.length} results
                  </span>
                  <button
                    type="button"
                    onClick={handleViewAllResults}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <span>View all journeys in catalog</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Compass className="size-8 mx-auto text-muted-foreground/60 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-foreground">
                  No tours found matching "{searchQuery}"
                </p>
                <p className="text-[0.72rem] text-muted-foreground mt-1 max-w-xs mx-auto">
                  Try searching by destination (e.g. "Japan", "Cappadocia") or activity (e.g. "Culinary", "Hiking").
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            )
          ) : (
            /* Empty state: Quick filter discovery */
            <div className="space-y-3.5 py-1">
              <div>
                <div className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  <MapPin className="size-3 text-primary" />
                  <span>Filter by Destination</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularDestinations.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => handleQuickFilterClick('destination', dest)}
                      className="rounded-full border border-border/80 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 hover:text-primary px-2.5 py-1 text-xs text-foreground font-medium transition-colors cursor-pointer"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  <Sparkles className="size-3 text-primary" />
                  <span>Filter by Activity Type</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularActivities.map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleQuickFilterClick('activity', act)}
                      className="rounded-full border border-border/80 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 hover:text-primary px-2.5 py-1 text-xs text-foreground font-medium transition-colors cursor-pointer"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[0.68rem] text-muted-foreground">
                <span>Direct operator • Licensed local guides</span>
                <button
                  type="button"
                  onClick={handleViewAllResults}
                  className="font-medium text-primary hover:underline cursor-pointer"
                >
                  Browse all {filteredTours.length} journeys →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
