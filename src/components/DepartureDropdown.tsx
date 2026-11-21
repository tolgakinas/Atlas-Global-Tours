import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, Clock, Users, Sparkles, Flame, AlertCircle } from 'lucide-react';
import { TourDeparture } from '../data/toursData';
import { useCurrency } from '../context/CurrencyContext';

interface DepartureDropdownProps {
  departures: TourDeparture[];
  selectedDepartureId?: string;
  onSelectDeparture: (departureId: string) => void;
  currency?: string;
  className?: string;
  label?: string;
  showSpotCount?: boolean;
}

export const DepartureDropdown: React.FC<DepartureDropdownProps> = ({
  departures,
  selectedDepartureId,
  onSelectDeparture,
  currency,
  className = '',
  label = 'Select Departure Date',
  showSpotCount = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  const selectedDeparture =
    departures.find((d) => d.id === selectedDepartureId) || departures[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateRange = (dep: TourDeparture) => {
    const start = new Date(dep.start_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (dep.end_date && dep.end_date !== dep.start_date) {
      const end = new Date(dep.end_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${start} – ${end}`;
    }
    return start;
  };

  if (!departures || departures.length === 0) {
    return (
      <div className={`rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground ${className}`}>
        Flexible departures upon request. Contact us for custom dates.
      </div>
    );
  }

  const openDeparturesCount = departures.filter(
    (d) => d.status !== 'sold_out' && Math.max(0, d.capacity - d.seats_booked) > 0
  ).length;
  const selectedSpotsLeft = selectedDeparture
    ? Math.max(0, selectedDeparture.capacity - selectedDeparture.seats_booked)
    : 0;
  const isSelectedSoldOut =
    !selectedDeparture || selectedDeparture.status === 'sold_out' || selectedSpotsLeft <= 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            <span>{label}</span>
          </label>
          <span className="text-[0.7rem] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            {openDeparturesCount} available
          </span>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 rounded-xl border bg-card px-3.5 py-3 text-left transition-all duration-150 cursor-pointer shadow-xs ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-card'
            : 'border-border hover:border-primary/50 hover:bg-card/90'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground truncate">
                {selectedDeparture ? formatDateRange(selectedDeparture) : 'Choose departure date'}
              </span>
              {isSelectedSoldOut ? (
                <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold text-destructive bg-destructive/10 border border-destructive/30 px-1.5 py-0.2 rounded">
                  <AlertCircle className="size-2.5" /> Sold Out
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-0.5 text-[0.62rem] font-semibold text-success bg-success/10 px-1.5 py-0.2 rounded">
                    <Sparkles className="size-2.5" /> Guaranteed
                  </span>
                  {selectedSpotsLeft < 4 && (
                    <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded animate-pulse">
                      <Flame className="size-2.5 text-amber-600 dark:text-amber-400" /> Filling fast ({selectedSpotsLeft} left)
                    </span>
                  )}
                </>
              )}
            </div>
            {selectedDeparture && (
              <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground mt-0.5">
                <span className="font-semibold text-primary">
                  {formatPrice(selectedDeparture.price_cents, currency)}
                </span>
                {showSpotCount && (
                  <>
                    <span>•</span>
                    <span className={`flex items-center gap-1 ${isSelectedSoldOut ? 'text-destructive font-semibold' : ''}`}>
                      <Users className="size-3" />
                      {isSelectedSoldOut
                        ? '0 spots remaining'
                        : `${selectedSpotsLeft} spot${selectedSpotsLeft === 1 ? '' : 's'} remaining`}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
          <div className="px-2.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/70 mb-1 flex items-center justify-between">
            <span>Guaranteed Departures</span>
            <span>All 2026/2027 Dates</span>
          </div>

          <div className="space-y-1">
            {departures.map((dep) => {
              const isSelected = selectedDeparture?.id === dep.id;
              const spotsLeft = Math.max(0, dep.capacity - dep.seats_booked);
              const isSoldOut = dep.status === 'sold_out' || spotsLeft <= 0;
              const isFillingFast = !isSoldOut && spotsLeft < 4;

              return (
                <button
                  key={dep.id}
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => {
                    if (isSoldOut) return;
                    onSelectDeparture(dep.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left rounded-lg p-2.5 transition-all flex items-center justify-between gap-3 ${
                    isSoldOut
                      ? 'opacity-50 cursor-not-allowed bg-muted/40 border border-transparent'
                      : isSelected
                      ? 'bg-primary/10 border border-primary/30 text-foreground font-semibold shadow-xs cursor-pointer'
                      : 'hover:bg-muted text-foreground border border-transparent cursor-pointer'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
                        isSoldOut
                          ? 'bg-destructive/10 text-destructive'
                          : isSelected
                          ? 'bg-primary text-primary-foreground font-bold'
                          : isFillingFast
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isSoldOut ? (
                        <AlertCircle className="size-3.5" />
                      ) : isSelected ? (
                        <Check className="size-3.5" />
                      ) : isFillingFast ? (
                        <Flame className="size-3.5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Calendar className="size-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-xs truncate ${isSoldOut ? 'line-through text-muted-foreground' : isSelected ? 'font-bold text-primary' : 'font-medium'}`}>
                          {formatDateRange(dep)}
                        </p>
                        {isSoldOut && (
                          <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider text-destructive bg-destructive/10 border border-destructive/20 px-1.5 py-0.2 rounded">
                            Sold Out
                          </span>
                        )}
                        {isFillingFast && (
                          <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded">
                            <Flame className="size-2.5 text-amber-600 dark:text-amber-400" /> Filling fast
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[0.68rem] text-muted-foreground mt-0.5">
                        {isSoldOut ? (
                          <span className="text-destructive font-medium">No spots remaining</span>
                        ) : (
                          <>
                            <span className="text-success font-medium">Guaranteed</span>
                            <span>•</span>
                            <span className={isFillingFast ? 'font-semibold text-amber-700 dark:text-amber-300' : ''}>
                              {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} remaining
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold block ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {formatPrice(dep.price_cents, currency)}
                    </span>
                    <span className="text-[0.62rem] text-muted-foreground block">per traveler</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
