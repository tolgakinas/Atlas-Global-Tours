import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, MapPin, Clock } from 'lucide-react';
import { TOURS_DATA } from '../data/toursData';
import { TourCard } from '../components/TourCard';

interface DayToursPageProps {
  onSelectTour: (slug: string) => void;
}

export const DayToursPage: React.FC<DayToursPageProps> = ({ onSelectTour }) => {
  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState('All');

  const dayTours = useMemo(() => {
    return TOURS_DATA.filter((t) => t.tour_type === 'day');
  }, []);

  const places = useMemo(() => {
    const list = [
      'All',
      'Sultanahmet & Old Town',
      'Topkapı Palace',
      'Galata, Fener & Balat',
      'Taksim & Pera',
      'Bosphorus & Sunrise'
    ];
    return list;
  }, []);

  const filteredTours = useMemo(() => {
    return dayTours.filter((tour) => {
      const matchSearch =
        tour.title.toLowerCase().includes(search.toLowerCase()) ||
        tour.summary?.toLowerCase().includes(search.toLowerCase()) ||
        tour.place?.toLowerCase().includes(search.toLowerCase());

      const matchDuration =
        durationFilter === 'All' ||
        (tour.duration_hours && tour.duration_hours.toString() === durationFilter);

      let matchPlace = true;
      if (selectedPlace !== 'All') {
        const pLower = selectedPlace.toLowerCase();
        if (pLower.includes('sultanahmet')) {
          matchPlace = (tour.place || '').toLowerCase().includes('sultanahmet') || tour.title.toLowerCase().includes('sultanahmet') || tour.title.toLowerCase().includes('secret streets');
        } else if (pLower.includes('topkapı') || pLower.includes('topkapi')) {
          matchPlace = (tour.place || '').toLowerCase().includes('topkap') || tour.title.toLowerCase().includes('topkapi') || tour.title.toLowerCase().includes('topkapı');
        } else if (pLower.includes('galata')) {
          matchPlace = (tour.place || '').toLowerCase().includes('galata') || tour.title.toLowerCase().includes('galata') || tour.title.toLowerCase().includes('balat');
        } else if (pLower.includes('taksim')) {
          matchPlace = (tour.place || '').toLowerCase().includes('taksim') || tour.title.toLowerCase().includes('taksim') || tour.title.toLowerCase().includes('passages');
        } else if (pLower.includes('sunrise') || pLower.includes('bosphorus')) {
          matchPlace = (tour.place || '').toLowerCase().includes('sunrise') || tour.title.toLowerCase().includes('sunrise') || tour.title.toLowerCase().includes('breakfast');
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
          <span className="eyebrow text-primary">City Walk Excursions Regarding Places</span>
          <h1 className="mt-2 text-4xl font-display font-bold sm:text-5xl text-foreground">
            Istanbul day tours by neighborhood
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Curated 2 to 6-hour immersive walking tours led by licensed historian guides. Skip the lines, explore secret passages from Taksim to Galata, savor traditional sunrise breakfasts, and uncover hidden Byzantine and Ottoman courtyards.
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
              {pl === 'All' ? `All Istanbul (${dayTours.length})` : pl}
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
                placeholder="Search day tours (e.g. Topkapi, Galata, Basilica, Sunrise)..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="size-3.5" /> Duration:
              </span>
              <div className="flex items-center gap-1.5">
                {['All', '2', '3', '4', '6'].map((d) => (
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
