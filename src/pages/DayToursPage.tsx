import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Clock } from 'lucide-react';
import { useTours } from '../context/ToursContext';
import { TourCard } from '../components/TourCard';

interface DayToursPageProps {
  onSelectTour: (slug: string) => void;
}

export const DayToursPage: React.FC<DayToursPageProps> = ({ onSelectTour }) => {
  const { tours } = useTours();
  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState('All');

  const dayTours = useMemo(() => {
    return tours.filter((t) => t.tour_type === 'day' && t.is_published);
  }, [tours]);

  const places = useMemo(() => {
    return [
      'All',
      'Sultanahmet & Old Town',
      'Topkapı Palace',
      'Galata, Fener & Balat',
      'Taksim & Pera',
      'Bosphorus & Sunrise',
      'Ephesus & Kuşadası',
      'Cairo & Giza',
    ];
  }, []);

  const filteredTours = useMemo(() => {
    return dayTours.filter((tour) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        tour.title.toLowerCase().includes(q) ||
        tour.summary?.toLowerCase().includes(q) ||
        tour.place?.toLowerCase().includes(q) ||
        (tour.countries || []).some((c) => c.toLowerCase().includes(q));

      const matchDuration =
        durationFilter === 'All' ||
        (tour.duration_hours && tour.duration_hours.toString() === durationFilter);

      let matchPlace = true;
      if (selectedPlace !== 'All') {
        const pLower = selectedPlace.toLowerCase();
        const placeStr = (tour.place || '').toLowerCase();
        const titleStr = tour.title.toLowerCase();
        if (pLower.includes('sultanahmet')) {
          matchPlace = placeStr.includes('sultanahmet') || titleStr.includes('sultanahmet') || titleStr.includes('secret streets');
        } else if (pLower.includes('topkapı') || pLower.includes('topkapi')) {
          matchPlace = placeStr.includes('topkap') || titleStr.includes('topkapi') || titleStr.includes('topkapı');
        } else if (pLower.includes('galata')) {
          matchPlace = placeStr.includes('galata') || titleStr.includes('galata') || titleStr.includes('balat');
        } else if (pLower.includes('taksim')) {
          matchPlace = placeStr.includes('taksim') || titleStr.includes('taksim') || titleStr.includes('passages');
        } else if (pLower.includes('sunrise') || pLower.includes('bosphorus')) {
          matchPlace = placeStr.includes('sunrise') || titleStr.includes('sunrise') || titleStr.includes('breakfast');
        } else if (pLower.includes('ephesus')) {
          matchPlace = placeStr.includes('ephesus') || titleStr.includes('ephesus') || placeStr.includes('kuşadası');
        } else if (pLower.includes('cairo')) {
          matchPlace = placeStr.includes('cairo') || titleStr.includes('cairo') || placeStr.includes('giza');
        }
      }

      return matchSearch && matchDuration && matchPlace;
    });
  }, [dayTours, search, durationFilter, selectedPlace]);

  return (
    <div className="min-h-screen py-10 lg:py-14">
      <div className="container-page">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="eyebrow text-primary">Day Walks &amp; Private Shore Excursions</span>
          <h1 className="mt-2 text-4xl font-display font-bold sm:text-5xl text-foreground">
            Day tours &amp; shore excursions
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Curated 2 to 6-hour immersive walking tours and zero-shopping shore excursions led by licensed historian guides across Istanbul, Ephesus (Kuşadası Port), and Cairo.
          </p>
        </div>

        {/* Place Quick Pills */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {places.map((pl) => (
            <button
              key={pl}
              onClick={() => setSelectedPlace(pl)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedPlace === pl
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {pl === 'All' ? `All Day Tours (${dayTours.length})` : pl}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search day tours (e.g. Topkapi, Ephesus, Cairo, Galata, Sunrise)..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="size-3.5" /> Duration:
              </span>
              <div className="flex items-center gap-1.5">
                {['All', '2', '3', '4', '5', '6'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDurationFilter(d)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                      durationFilter === d
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'border border-input bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    {d === 'All' ? 'All' : `${d}h`}
                  </button>
                ))}
              </div>

              {(search || durationFilter !== 'All' || selectedPlace !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setDurationFilter('All');
                    setSelectedPlace('All');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold cursor-pointer ml-2"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredTours.length}</strong> day tours
            {selectedPlace !== 'All' ? ` in ${selectedPlace}` : ''}
          </span>
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} onSelect={onSelectTour} />
          ))}
        </div>
      </div>
    </div>
  );
};
