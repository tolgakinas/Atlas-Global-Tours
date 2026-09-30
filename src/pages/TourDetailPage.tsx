import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Gauge,
  Clock,
  Utensils,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plane,
  ShieldCheck,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Tour, TOURS_DATA } from '../data/toursData';
import { useCurrency } from '../context/CurrencyContext';
import { InquiryModal } from '../components/InquiryModal';
import { TourCard } from '../components/TourCard';

interface TourDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
  onBookTour: (slug: string, departureId?: string, guests?: number) => void;
}

export const TourDetailPage: React.FC<TourDetailPageProps> = ({
  slug,
  onNavigate,
  onSelectTour,
  onBookTour,
}) => {
  const { formatPrice, formatAmount } = useCurrency();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });
  const [passengers, setPassengers] = useState(2);
  const [selectedDepartureId, setSelectedDepartureId] = useState<string>('');

  const tour = useMemo(() => {
    return TOURS_DATA.find((t) => t.slug === slug) || TOURS_DATA[0];
  }, [slug]);

  // Set default selected departure
  const availableDepartures = useMemo(() => {
    return tour.departuresList || [];
  }, [tour]);

  const selectedDeparture = useMemo(() => {
    if (selectedDepartureId) {
      return availableDepartures.find((d) => d.id === selectedDepartureId) || availableDepartures[0];
    }
    return availableDepartures[0];
  }, [availableDepartures, selectedDepartureId]);

  const allExpanded = useMemo(() => {
    return (
      tour.daysList &&
      tour.daysList.length > 0 &&
      tour.daysList.every((d) => expandedDays[d.day_number])
    );
  }, [tour.daysList, expandedDays]);

  const toggleAllDays = () => {
    if (allExpanded) {
      setExpandedDays({});
    } else {
      const all: Record<number, boolean> = {};
      tour.daysList?.forEach((d) => {
        all[d.day_number] = true;
      });
      setExpandedDays(all);
    }
  };

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const relatedTours = useMemo(() => {
    const inSamePlace = TOURS_DATA.filter(
      (t) => t.slug !== tour.slug && (t.region === tour.region || t.place === tour.place)
    );
    if (inSamePlace.length >= 3) return inSamePlace.slice(0, 3);
    const others = TOURS_DATA.filter(
      (t) => t.slug !== tour.slug && !inSamePlace.includes(t) && t.tour_type === tour.tour_type
    );
    return [...inSamePlace, ...others].slice(0, 3);
  }, [tour]);

  // Pricing calculation
  const basePricePerPersonCents = selectedDeparture
    ? selectedDeparture.price_cents
    : tour.price_cents;
  const totalPriceCents = basePricePerPersonCents * passengers;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="relative">
        <div className="relative h-[48vh] min-h-[320px] w-full overflow-hidden bg-ink image-fade sm:h-[58vh]">
          <img
            src={tour.hero_image}
            alt={tour.title}
            className="absolute inset-0 size-full object-cover object-center"
          />
        </div>
      </section>

      {/* Main Content & Floating Summary Box */}
      <div className="container-page relative z-10 -mt-24 grid gap-8 pb-14 sm:-mt-32 lg:-mt-36 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Overview, Itinerary, Gallery, Inclusions */}
        <div className="min-w-0">
          {/* Header Card */}
          <div className="rounded-xl border-t-4 border-primary bg-background p-6 shadow-xl sm:p-8 border-x border-b border-border">
            {/* Breadcrumb / Category */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="eyebrow inline-flex items-center gap-1.5 text-primary">
                <MapPin className="size-3.5" />
                {tour.region ? `${tour.region} · ` : ''}{tour.place ? `${tour.place} · ` : ''}{tour.tour_type === 'day' ? 'Day Tour' : `${tour.days} Days Multi-day Journey`}
              </span>

              {tour.code && (
                <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-mono">
                  Code: {tour.code}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-display font-bold sm:text-3xl md:text-4xl text-foreground">
              {tour.title}
            </h1>

            {tour.summary && (
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {tour.summary}
              </p>
            )}

            {/* 5-Stats Ribbon */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="size-4" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                    Duration
                  </span>
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {tour.tour_type === 'day'
                      ? `${tour.duration_hours || 3} Hours`
                      : `${tour.days} Days / ${tour.nights} Nights`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="size-4" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                    Group Size
                  </span>
                  <span className="block truncate text-xs font-semibold text-foreground">
                    Max {tour.max_pax || 12} travellers
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Gauge className="size-4" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                    Activity
                  </span>
                  <span className="block truncate text-xs font-semibold capitalize text-foreground">
                    {tour.difficulty}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Utensils className="size-4" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                    Meals
                  </span>
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {tour.meals_breakfasts || tour.meals_lunches || tour.meals_dinners
                      ? `${tour.meals_breakfasts || 0}B, ${tour.meals_lunches || 0}L, ${tour.meals_dinners || 0}D`
                      : 'Local meals incl.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Overview Section */}
          <section className="mt-10">
            <h2 className="text-2xl font-display font-bold text-foreground">Tour overview</h2>
            <div className="mt-4 space-y-4 text-sm text-foreground/85 leading-relaxed bg-card p-6 rounded-xl border border-border">
              {tour.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* Day by Day Itinerary Section */}
          {tour.daysList && tour.daysList.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Day by day itinerary
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {tour.daysList.length} days of curated experiences
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleAllDays}
                  className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition-colors cursor-pointer"
                >
                  {allExpanded ? 'Collapse all' : 'Expand all'}
                </button>
              </div>

              <div className="space-y-3">
                {tour.daysList.map((day) => {
                  const isOpen = !!expandedDays[day.day_number];
                  return (
                    <div
                      key={day.id}
                      className={`overflow-hidden rounded-lg border transition-colors ${
                        isOpen
                          ? 'border-primary/40 bg-success-soft/30'
                          : 'border-border bg-card'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDay(day.day_number)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors cursor-pointer gap-3 hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {day.day_number}
                          </span>
                          <span className="font-display font-bold text-base text-foreground truncate">
                            {day.title}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="border-t border-border/60 p-4 pt-3 text-sm text-foreground/85 leading-relaxed bg-background/50">
                          {day.body.split('\n\n').map((line, idx) => (
                            <p key={idx} className="mb-2 last:mb-0">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Photo Gallery Grid */}
          {tour.gallery && tour.gallery.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Tour gallery
                </h2>
                <span className="text-xs text-muted-foreground">
                  {tour.gallery.length} authentic photos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {tour.gallery.slice(0, 8).map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative aspect-4/3 overflow-hidden rounded-lg bg-muted cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={img}
                      alt={`${tour.title} photo ${i + 1}`}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inclusions & Exclusions */}
          <section className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* What's Included */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <ShieldCheck className="size-5" />
                <h3 className="font-display text-lg font-bold text-foreground">What's included</h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/85">
                {tour.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success/20 text-success mt-0.5">
                      <Check className="size-3" />
                    </span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Included */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <HelpCircle className="size-5" />
                <h3 className="font-display text-lg font-bold text-foreground">Not included</h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                {tour.excludes.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5">
                      <X className="size-3" />
                    </span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Right Column: Floating Booking & Departure Selector Card */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div>
              <span className="eyebrow text-primary">Guaranteed Departures</span>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">From</span>
                  <div className="font-display text-3xl font-bold text-primary">
                    {formatPrice(basePricePerPersonCents, tour.currency)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">/ person</span>
                  </div>
                </div>
                <span className="rounded-full bg-success-soft text-success text-[0.65rem] font-bold px-2.5 py-1 uppercase tracking-wider border border-success-border">
                  Instant Confirmation
                </span>
              </div>
            </div>

            {/* Departure Date Selector */}
            {availableDepartures.length > 0 ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Select Departure Date ({availableDepartures.length} dates)
                </label>
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {availableDepartures.slice(0, 10).map((dep) => {
                    const isSelected = selectedDeparture?.id === dep.id;
                    const seatsLeft = dep.capacity - dep.seats_booked;
                    return (
                      <div
                        key={dep.id}
                        onClick={() => setSelectedDepartureId(dep.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border bg-background hover:bg-muted/60'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>
                            {new Date(dep.start_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {dep.end_date !== dep.start_date && (
                              <>
                                {' – '}
                                {new Date(dep.end_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </>
                            )}
                          </span>
                          <span className="text-primary font-bold">
                            {formatPrice(dep.price_cents, tour.currency)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                          <span className="text-success font-medium">Guaranteed departure</span>
                          <span>{seatsLeft} spots left</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-paper p-3 text-xs text-muted-foreground">
                Flexible departures upon request. Contact us for custom dates.
              </div>
            )}

            {/* Number of Passengers Counter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Number of Travellers
              </label>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                <span className="text-sm font-medium pl-2">
                  {passengers} {passengers === 1 ? 'Guest' : 'Guests'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    disabled={passengers <= 1}
                    className="size-7 rounded border border-border bg-card text-foreground font-bold hover:bg-muted disabled:opacity-40 cursor-pointer flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{passengers}</span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(tour.max_pax || 12, passengers + 1))}
                    disabled={passengers >= (tour.max_pax || 12)}
                    className="size-7 rounded border border-border bg-card text-foreground font-bold hover:bg-muted disabled:opacity-40 cursor-pointer flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{passengers} x {formatPrice(basePricePerPersonCents, tour.currency)}</span>
                <span>Total amount</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-foreground">Estimated Total</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {formatPrice(totalPriceCents, tour.currency)}
                </span>
              </div>
            </div>

            {/* Booking & Inquiry Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onBookTour(tour.slug, selectedDeparture?.id, passengers)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <span>Book this tour</span>
                <ArrowRight className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => setInquiryOpen(true)}
                className="w-full rounded-md border border-input bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Inquire or request custom dates
              </button>
            </div>

            {/* Highlights guarantee */}
            <div className="border-t border-border pt-4 space-y-2 text-[0.7rem] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-success shrink-0" />
                <span>Small group guarantee (max 12 guests)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-success shrink-0" />
                <span>100% licensed local Turkish guide</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-success shrink-0" />
                <span>Free cancellation up to 30 days before departure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-6 top-6 text-background/80 hover:text-background p-2 rounded-full cursor-pointer"
          >
            <X className="size-6" />
          </button>

          <button
            onClick={() =>
              setLightboxIndex(
                (lightboxIndex - 1 + tour.gallery.length) % tour.gallery.length
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 text-background/80 hover:text-background p-2 rounded-full bg-ink/50 cursor-pointer"
          >
            <ChevronLeft className="size-8" />
          </button>

          <img
            src={tour.gallery[lightboxIndex]}
            alt="Gallery preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />

          <button
            onClick={() =>
              setLightboxIndex((lightboxIndex + 1) % tour.gallery.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-background/80 hover:text-background p-2 rounded-full bg-ink/50 cursor-pointer"
          >
            <ChevronRight className="size-8" />
          </button>
        </div>
      )}

      {/* Related Tours */}
      <section className="container-page mt-16 pt-16 border-t border-border">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow text-primary">Discover More</p>
            <h2 className="text-3xl font-display font-bold text-foreground">
              You might also like
            </h2>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedTours.map((rt) => (
            <TourCard key={rt.id} tour={rt} onSelect={onSelectTour} />
          ))}
        </div>
      </section>

      {/* Inquiry Dialog */}
      <InquiryModal
        tour={tour}
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />
    </div>
  );
};
