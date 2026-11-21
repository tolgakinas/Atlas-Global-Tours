import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Users,
  Flame,
  Info,
} from 'lucide-react';
import { TourDeparture } from '../data/toursData';
import { useCurrency } from '../context/CurrencyContext';

interface DayTourCalendarPickerProps {
  departures: TourDeparture[];
  selectedDepartureId?: string;
  onSelectDeparture: (departureId: string) => void;
  currency?: string;
  className?: string;
  label?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Parse "YYYY-MM-DD" safely into local components without UTC timezone offset shift
function parseDateParts(dateString: string) {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  return { year, month, day };
}

function formatDateString(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export const DayTourCalendarPicker: React.FC<DayTourCalendarPickerProps> = ({
  departures,
  selectedDepartureId,
  onSelectDeparture,
  currency,
  className = '',
  label = 'Select Tour Date',
}) => {
  const { formatPrice } = useCurrency();

  // Map departures by YYYY-MM-DD for O(1) lookup
  const departuresByDate = useMemo(() => {
    const map = new Map<string, TourDeparture>();
    departures.forEach((dep) => {
      if (dep.start_date) {
        map.set(dep.start_date, dep);
      }
    });
    return map;
  }, [departures]);

  // List of all months that have at least one departure
  const availableMonths = useMemo(() => {
    const map = new Map<string, { year: number; month: number; label: string; count: number }>();
    departures.forEach((dep) => {
      const parsed = parseDateParts(dep.start_date);
      if (parsed) {
        const key = `${parsed.year}-${parsed.month}`;
        if (!map.has(key)) {
          map.set(key, {
            year: parsed.year,
            month: parsed.month,
            label: `${MONTH_NAMES[parsed.month].slice(0, 3)} ${parsed.year}`,
            count: 1,
          });
        } else {
          map.get(key)!.count += 1;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [departures]);

  // Find currently selected departure
  const selectedDeparture = useMemo(() => {
    return (
      departures.find((d) => d.id === selectedDepartureId) ||
      departures[0] ||
      null
    );
  }, [departures, selectedDepartureId]);

  // Month & year currently viewed on the calendar
  const [viewDate, setViewDate] = useState<{ year: number; month: number }>(() => {
    if (selectedDeparture?.start_date) {
      const parsed = parseDateParts(selectedDeparture.start_date);
      if (parsed) return { year: parsed.year, month: parsed.month };
    }
    if (availableMonths.length > 0) {
      return { year: availableMonths[0].year, month: availableMonths[0].month };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Keep view aligned if selectedDepartureId changes from outside
  useEffect(() => {
    if (selectedDeparture?.start_date) {
      const parsed = parseDateParts(selectedDeparture.start_date);
      if (parsed && (parsed.year !== viewDate.year || parsed.month !== viewDate.month)) {
        setViewDate({ year: parsed.year, month: parsed.month });
      }
    }
  }, [selectedDeparture?.id]);

  // Calendar days grid calculation
  const calendarDays = useMemo(() => {
    const year = viewDate.year;
    const month = viewDate.month;

    // First day of month (0 = Sun, 1 = Mon...)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // Number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      day: number;
      dateString: string;
      isCurrentMonth: boolean;
      departure: TourDeparture | null;
      isSelected: boolean;
      isAvailable: boolean;
    }> = [];

    // Blank cells before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: 0,
        dateString: '',
        isCurrentMonth: false,
        departure: null,
        isSelected: false,
        isAvailable: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = formatDateString(year, month, d);
      const departure = departuresByDate.get(dateString) || null;
      const isSelected = selectedDeparture?.start_date === dateString;
      const spotsLeft = departure ? Math.max(0, departure.capacity - departure.seats_booked) : 0;
      const isAvailable = !!departure && departure.status !== 'sold_out' && spotsLeft > 0;

      days.push({
        day: d,
        dateString,
        isCurrentMonth: true,
        departure,
        isSelected,
        isAvailable,
      });
    }

    return days;
  }, [viewDate, departuresByDate, selectedDeparture?.start_date]);

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleSelectDay = (dayItem: (typeof calendarDays)[0]) => {
    if (!dayItem.isAvailable || !dayItem.departure) return;
    onSelectDeparture(dayItem.departure.id);
  };

  const selectedDateFormatted = useMemo(() => {
    if (!selectedDeparture?.start_date) return 'No date selected';
    const parsed = parseDateParts(selectedDeparture.start_date);
    if (!parsed) return selectedDeparture.start_date;
    const dateObj = new Date(parsed.year, parsed.month, parsed.day);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDeparture?.start_date]);

  const monthDeparturesCount = useMemo(() => {
    return calendarDays.filter((d) => d.isAvailable).length;
  }, [calendarDays]);

  if (!departures || departures.length === 0) {
    return (
      <div className={`rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground ${className}`}>
        Flexible departures available upon inquiry. Contact our operations team for custom day tour scheduling.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CalendarIcon className="size-3.5 text-primary" />
          <span>{label}</span>
        </label>
        <span className="text-[0.68rem] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
          <Sparkles className="size-2.5" />
          <span>
            {departures.filter((d) => d.status !== 'sold_out' && d.capacity - d.seats_booked > 0).length} Dates Available
          </span>
        </span>
      </div>

      {/* Quick Month Filter Pills if multiple months */}
      {availableMonths.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[0.7rem]">
          {availableMonths.map((m) => {
            const isCurrent = viewDate.year === m.year && viewDate.month === m.month;
            return (
              <button
                key={`${m.year}-${m.month}`}
                type="button"
                onClick={() => setViewDate({ year: m.year, month: m.month })}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {m.label} ({m.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar Card */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs select-none">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="text-center">
            <h3 className="text-sm font-bold text-foreground">
              {MONTH_NAMES[viewDate.month]} {viewDate.year}
            </h3>
            <span className="text-[0.65rem] text-muted-foreground">
              {monthDeparturesCount} {monthDeparturesCount === 1 ? 'departure' : 'departures'} this month
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="text-[0.65rem] font-semibold text-muted-foreground/80 uppercase py-1"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return <div key={`empty-${idx}`} className="h-9 sm:h-10" />;
            }

            const spotsLeft = item.departure
              ? item.departure.capacity - item.departure.seats_booked
              : 0;

            if (item.isAvailable && item.departure) {
              return (
                <button
                  key={item.dateString}
                  type="button"
                  onClick={() => handleSelectDay(item)}
                  title={`${item.dateString}: ${formatPrice(item.departure.price_cents, currency)} (${spotsLeft} spots available)`}
                  className={`h-9 sm:h-10 w-full rounded-lg text-xs font-semibold flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${
                    item.isSelected
                      ? 'bg-primary text-primary-foreground font-bold shadow-md ring-2 ring-primary/30 z-10 scale-[1.04]'
                      : 'border border-border/80 bg-background text-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <span className="leading-none">{item.day}</span>
                  <span
                    className={`mt-0.5 size-1 rounded-full ${
                      item.isSelected
                        ? 'bg-primary-foreground'
                        : spotsLeft <= 4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </button>
              );
            }

            // Unavailable Day
            return (
              <div
                key={item.dateString}
                className="h-9 sm:h-10 w-full rounded-lg text-xs text-muted-foreground/35 flex items-center justify-center font-normal"
              >
                {item.day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[0.65rem] text-muted-foreground px-1">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-muted-foreground/30" />
            <span>No departure</span>
          </div>
        </div>
      </div>

      {/* Selected Departure Summary Banner */}
      {selectedDeparture && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-start justify-between gap-3 text-xs">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Check className="size-3" />
              <span>Selected Day Tour Date</span>
            </span>
            <div className="font-semibold text-foreground text-xs sm:text-sm truncate">
              {selectedDateFormatted}
            </div>
            <div className="text-[0.7rem] text-muted-foreground flex items-center gap-2">
              {Math.max(0, selectedDeparture.capacity - selectedDeparture.seats_booked) > 0 ? (
                <>
                  <span className="text-success font-medium">Guaranteed Departure</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Users className="size-3 text-primary" />
                    <span>
                      {Math.max(0, selectedDeparture.capacity - selectedDeparture.seats_booked)} spot
                      {Math.max(0, selectedDeparture.capacity - selectedDeparture.seats_booked) === 1 ? '' : 's'} remaining
                    </span>
                  </span>
                </>
              ) : (
                <span className="text-destructive font-semibold">Sold Out — please select another date</span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[0.65rem] uppercase text-muted-foreground">Adult Base</div>
            <div className="font-bold text-primary text-sm sm:text-base">
              {formatPrice(selectedDeparture.price_cents, currency)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
