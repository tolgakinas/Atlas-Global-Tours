import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowRight,
  Compass,
  SlidersHorizontal
} from 'lucide-react';
import { Tour, TOURS_DATA, RoomingSelection } from '../data/toursData';
import { useTours } from '../context/ToursContext';
import { useCurrency } from '../context/CurrencyContext';
import { useReviews } from '../context/ReviewsContext';
import { useComparison } from '../context/ComparisonContext';
import { InquiryModal } from '../components/InquiryModal';
import { TourCard } from '../components/TourCard';
import { StarRating } from '../components/StarRating';
import { TourReviewsSection } from '../components/TourReviewsSection';
import { DepartureDropdown } from '../components/DepartureDropdown';
import { RoomingSelector } from '../components/RoomingSelector';
import { FAQAccordion, FAQItem } from '../components/FAQAccordion';
import { TourRouteMap } from '../components/TourRouteMap';
import { DayTourCalendarPicker } from '../components/DayTourCalendarPicker';
import { DayTourPricingSelector } from '../components/DayTourPricingSelector';
import { calculateDayTourPricing } from '../utils/dayTourPricing';
import { useTourSEO } from '../utils/tourSeo';
import { ShareTourModal } from '../components/ShareTourModal';
import { getTourFallbackImage } from '../utils/tourImageFallback';

interface TourDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
  onBookTour: (slug: string, departureId?: string, guests?: number, roomSelections?: RoomingSelection[]) => void;
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
  const [selectedMapDay, setSelectedMapDay] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [roomSelections, setRoomSelections] = useState<RoomingSelection[]>([
    { travelerIndex: 0, roomType: 'double' },
    { travelerIndex: 1, roomType: 'double' },
  ]);

  const { tours, siteContent } = useTours();
  const { getTourRatingStats } = useReviews();
  const { isTourInComparison, toggleTourComparison, openComparisonModal } = useComparison();

  const tour = useMemo(() => {
    return tours.find((t) => t.slug === slug) || TOURS_DATA.find((t) => t.slug === slug) || TOURS_DATA[0];
  }, [tours, slug]);

  const ratingStats = useMemo(() => {
    return getTourRatingStats(tour.slug, tour.title);
  }, [getTourRatingStats, tour.slug, tour.title]);

  // Synchronize Open Graph & Twitter card meta tags for this specific tour page
  useTourSEO(tour, ratingStats);

  // Set default selected departure
  const availableDepartures = useMemo(() => {
    return tour.departuresList || [];
  }, [tour]);

  const selectedDeparture = useMemo(() => {
    if (selectedDepartureId) {
      return availableDepartures.find((d) => d.id === selectedDepartureId) || availableDepartures[0];
    }
    return (
      availableDepartures.find((d) => d.status !== 'sold_out' && d.capacity - d.seats_booked > 0) ||
      availableDepartures[0]
    );
  }, [availableDepartures, selectedDepartureId]);

  const availableSeats = useMemo(() => {
    if (!selectedDeparture) return tour.max_pax || 12;
    if (selectedDeparture.status === 'sold_out') return 0;
    return Math.max(0, selectedDeparture.capacity - selectedDeparture.seats_booked);
  }, [selectedDeparture, tour.max_pax]);

  useEffect(() => {
    if (availableSeats > 0 && passengers > availableSeats) {
      setPassengers(availableSeats);
    }
  }, [availableSeats, passengers]);

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

  const handleSelectMapDay = (dayNum: number) => {
    setSelectedMapDay(dayNum);
    setExpandedDays((prev) => ({ ...prev, [dayNum]: true }));
    const el = document.getElementById(`itinerary-day-${dayNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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

  const isDayTour = tour.tour_type === 'day' || tour.days === 1;

  // Pricing calculation
  const basePricePerPersonCents = selectedDeparture
    ? selectedDeparture.price_cents
    : tour.price_cents;

  const dayTourPricing = useMemo(() => {
    return calculateDayTourPricing(basePricePerPersonCents, passengers);
  }, [basePricePerPersonCents, passengers]);

  const singleSupplementPercent =
    tour.single_supplement_percent ?? siteContent.defaultSingleSupplementPercent ?? 15;

  const supplementPerPersonCents =
    typeof tour.single_supplement_cents === 'number' && tour.single_supplement_cents > 0
      ? tour.single_supplement_cents
      : Math.round(basePricePerPersonCents * (singleSupplementPercent / 100));

  const singleRoomsCount = isDayTour
    ? 0
    : roomSelections
        .slice(0, passengers)
        .filter((s) => s.roomType === 'single').length;

  const totalSupplementCents = isDayTour ? 0 : singleRoomsCount * supplementPerPersonCents;
  const totalPriceCents = isDayTour
    ? dayTourPricing.totalPriceCents
    : basePricePerPersonCents * passengers + totalSupplementCents;

  const faqItems: FAQItem[] = useMemo(() => {
    const mealParts: string[] = [];
    if (tour.meals_breakfasts) mealParts.push(`${tour.meals_breakfasts} Breakfasts`);
    if (tour.meals_lunches) mealParts.push(`${tour.meals_lunches} Lunches`);
    if (tour.meals_dinners) mealParts.push(`${tour.meals_dinners} Dinners`);
    const mealSummary =
      mealParts.length > 0 ? mealParts.join(', ') : 'daily breakfast and curated regional lunches/dinners';

    const roomingFaq: FAQItem = isDayTour
      ? {
          question: 'Does this Day Tour include hotel accommodation, and how are group discounts calculated?',
          category: 'Booking & Pricing',
          answer: `This is a guided day city excursion and does NOT include overnight accommodation (you remain at your own hotel or apartment in Istanbul). Because there is no lodging required, rooming options and single supplement charges are completely removed. Adult tickets are charged per person, and our automated group pricing rewards parties of 4 to 12 guests with tiered savings up to 20% off per person!`
        }
      : {
          question: 'What are the rooming arrangements, and how does the single supplement work?',
          category: 'Rooming & Lodging',
          answer: `We provide three accommodation configurations on all departures:
• Double Room: 1 large queen/king bed designed for couples (${tour.room_policy_notes?.double || 'standard tour price, 0% supplement'}).
• Twin Share: 2 separate single beds for two friends or two matched same-gender travelers (${tour.room_policy_notes?.twin || 'share with a companion and pay $0 single supplement'}).
• Single Room: Guaranteed private room with en-suite bath for solo travelers, subject to a +${singleSupplementPercent}% single supplement (+${formatPrice(supplementPerPersonCents, tour.currency)}). All room preferences can be selected during checkout.`
        };

    return [
      roomingFaq,
      {
        question: 'What is the maximum group size and what can I expect from the travel pace?',
        category: 'Itinerary & Pace',
        answer: `All our departures are strictly small groups capped at a maximum of ${tour.max_pax || 12} travelers (averaging 8 to 10 guests). This intimate footprint allows us to access boutique hotels, charming family-run eateries, and narrow historic neighborhoods that coach buses cannot reach. The pace is designed to balance guided cultural highlights with leisurely free time.`
      },
      {
        question: 'Are departure dates guaranteed to operate, and what is your cancellation policy?',
        category: 'Booking & Pricing',
        answer: `Yes, all departures with bookings are 100% guaranteed — we never cancel a trip due to minimum group thresholds. You can reserve your journey today with a 20% deposit. If your plans change, enjoy 100% risk-free cancellation with a full refund up to 30 days prior to departure.`
      },
      {
        question: 'Where is the arrival meeting point, and are airport transfers included?',
        category: 'Arrival & Logistics',
        answer: `Complimentary airport arrival and departure transfers are included. On Day 1, our professional driver will greet you at the airport arrivals terminal holding an Atlas Global Tours greeting sign. Your official journey begins at ${tour.meeting_point || 'our starting boutique hotel'}, where you will meet your guide and fellow travelers for the welcome orientation.`
      },
      {
        question: 'What meals are included, and can you cater to dietary restrictions?',
        category: 'Itinerary & Pace',
        answer: `This ${tour.days}-day tour includes ${mealSummary}. We take culinary traditions seriously, showcasing authentic local cuisine at neighborhood venues. We happily cater to vegetarian, vegan, gluten-free, halal, diabetic, and allergy-sensitive dietary needs — simply indicate your requirements during booking.`
      },
      {
        question: 'What physical fitness level is required, and what should I pack?',
        category: 'Itinerary & Pace',
        answer: `This journey is rated as ${tour.difficulty || 'Moderate'} activity level. Travelers should be comfortable walking 3 to 6 km (2 to 4 miles) per day over ancient cobblestones, uneven paths, and gentle hills. We recommend sturdy walking shoes, layers for varying temperatures, and modest attire (covering shoulders and knees) for entering mosques and sacred heritage sites.`
      },
      {
        question: 'Who will guide this journey?',
        category: 'General',
        answer: `Your journey is led throughout by 100% licensed, university-educated Ministry of Culture and Tourism national guides who are native locals fluent in English. They bring history alive with engaging storytelling, personal anecdotes, and insider access to hidden culinary and artisan quarters.`
      },
      {
        question: 'Do I need a tourist visa or travel insurance?',
        category: 'Arrival & Logistics',
        answer: `Most travelers holding passports from the United States, Canada, the United Kingdom, and the European Union can enter Türkiye visa-free or by obtaining a rapid electronic visa (e-Visa) via the official government portal prior to travel. Comprehensive international travel medical insurance is strongly recommended for peace of mind.`
      }
    ];
  }, [tour, singleSupplementPercent, supplementPerPersonCents, formatPrice]);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="relative">
        <div className="relative h-[48vh] min-h-[320px] w-full overflow-hidden bg-ink image-fade sm:h-[58vh]">
          <img
            src={tour.hero_image || getTourFallbackImage(tour)}
            alt={tour.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = getTourFallbackImage(tour);
              if (!target.src.endsWith(fallback)) {
                target.src = fallback;
              }
            }}
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
            {/* Breadcrumb / Category & Share */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="eyebrow inline-flex items-center gap-1.5 text-primary">
                <MapPin className="size-3.5" />
                {tour.region ? `${tour.region} · ` : ''}{tour.place ? `${tour.place} · ` : ''}{tour.tour_type === 'day' ? 'Day Tour' : `${tour.days} Days Multi-day Journey`}
              </span>

              <div className="flex items-center gap-2">
                {tour.code && (
                  <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-mono">
                    Code: {tour.code}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleTourComparison(tour.slug)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    isTourInComparison(tour.slug)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
                  }`}
                  title={isTourInComparison(tour.slug) ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                >
                  <SlidersHorizontal className="size-3" />
                  <span>{isTourInComparison(tour.slug) ? 'In Comparison' : 'Compare'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer shadow-2xs group"
                  title="Share tour (Open Graph & Twitter card preview)"
                >
                  <Share2 className="size-3 text-primary group-hover:scale-110 transition-transform" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <h1 className="mt-3 text-2xl font-display font-bold sm:text-3xl md:text-4xl text-foreground">
              {tour.title}
            </h1>

            {/* Rating & Review Jump Link & Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('reviews-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer shadow-2xs"
              >
                <StarRating rating={ratingStats.averageRating} size="xs" />
                <span className="font-bold text-foreground group-hover:text-primary">
                  {ratingStats.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-[0.7rem]">
                  ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </button>

              <span className="text-xs text-muted-foreground hidden sm:inline">·</span>

              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <Check className="size-3.5" />
                <span>{ratingStats.percentRecommended}% of travelers recommend</span>
              </span>

              <span className="text-xs text-muted-foreground hidden sm:inline">·</span>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('tour-route-map');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-2xs group"
              >
                <Compass className="size-3.5 group-hover:rotate-45 transition-transform" />
                <span>View Route Map</span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer shadow-2xs group"
                title="Share journey & preview social cards"
              >
                <Share2 className="size-3 text-primary group-hover:rotate-12 transition-transform" />
                <span>Share Tour</span>
              </button>
            </div>

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

          {/* Quick-Jump Section Navigation */}
          <div className="sticky top-4 z-20 mt-6 flex items-center gap-2 overflow-x-auto rounded-xl border border-border/80 bg-card/95 p-1.5 backdrop-blur-md shadow-xs scrollbar-none">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('tour-route-map');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <Compass className="size-3.5 text-primary" />
              <span>Interactive Route Map</span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('tour-overview');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('itinerary-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              Day-by-Day Itinerary
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('inclusions-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              Inclusions
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('faq-accordion-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              FAQs
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('reviews-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              Reviews
            </button>
          </div>

          {/* Interactive Tour Route Map Visualization (Top Placement with Anchor) */}
          <TourRouteMap
            tour={tour}
            selectedDay={selectedMapDay}
            onSelectDay={handleSelectMapDay}
          />

          {/* Tour Overview Section */}
          <section id="tour-overview" className="mt-10">
            <h2 className="text-2xl font-display font-bold text-foreground">Tour overview</h2>
            <div className="mt-4 space-y-4 text-sm text-foreground/85 leading-relaxed bg-card p-6 rounded-xl border border-border">
              {tour.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* Day by Day Itinerary Section */}
          {tour.daysList && tour.daysList.length > 0 && (
            <section id="itinerary-section" className="mt-12">
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
                  const isMapHighlighted = selectedMapDay === day.day_number;
                  return (
                    <div
                      key={day.id}
                      id={`itinerary-day-${day.day_number}`}
                      className={`overflow-hidden rounded-lg border transition-colors ${
                        isMapHighlighted
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : isOpen
                          ? 'border-primary/40 bg-success-soft/30'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between p-3.5 sm:p-4 transition-colors gap-3 hover:bg-muted/30">
                        <button
                          type="button"
                          onClick={() => toggleDay(day.day_number)}
                          aria-expanded={isOpen}
                          aria-controls={`itinerary-day-${day.day_number}-body`}
                          className="flex flex-1 items-center gap-3 min-w-0 text-left cursor-pointer group"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground group-hover:scale-105 transition-transform">
                            {day.day_number}
                          </span>
                          <span className="font-display font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                            {day.title}
                          </span>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMapDay(day.day_number);
                              const mapEl = document.getElementById('tour-route-map');
                              if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-[0.68rem] text-primary hover:underline font-semibold flex items-center gap-1 hidden sm:inline-flex px-2 py-0.5 rounded bg-primary/10 cursor-pointer"
                          >
                            <MapPin className="size-3" />
                            <span>View on Map</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDay(day.day_number)}
                            aria-label={isOpen ? `Collapse Day ${day.day_number}` : `Expand Day ${day.day_number}`}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded"
                          >
                            {isOpen ? (
                              <ChevronUp className="size-4 shrink-0" />
                            ) : (
                              <ChevronDown className="size-4 shrink-0" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div
                          id={`itinerary-day-${day.day_number}-body`}
                          className="border-t border-border/60 p-4 pt-3 text-sm text-foreground/85 leading-relaxed bg-background/50 space-y-3"
                        >
                          {day.body.split('\n\n').map((line, idx) => (
                            <p key={idx} className="last:mb-0">
                              {line}
                            </p>
                          ))}

                          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground text-[0.7rem]">
                              Day {day.day_number} of {tour.daysList?.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMapDay(day.day_number);
                                const mapEl = document.getElementById('tour-route-map');
                                if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-[0.72rem] cursor-pointer"
                            >
                              <MapPin className="size-3.5" />
                              <span>Pinpoint Day {day.day_number} on Interactive Map</span>
                            </button>
                          </div>
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
                    key={`${img}-${i}`}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative aspect-4/3 overflow-hidden rounded-lg bg-muted cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={img}
                      alt={`${tour.title} photo ${i + 1}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getTourFallbackImage(tour);
                        if (!target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {i === 7 && tour.gallery.length > 8 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-ink/55 text-background font-semibold text-xs sm:text-sm backdrop-blur-[1px]">
                        +{tour.gallery.length - 8} more photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inclusions & Exclusions */}
          <section id="inclusions-section" className="mt-12 grid gap-6 sm:grid-cols-2">
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

          {/* Traveler Reviews & Rating System Section */}
          <TourReviewsSection
            tourSlug={tour.slug}
            tourTitle={tour.title}
            tourHeroImage={tour.hero_image}
          />

          {/* Frequently Asked Questions Accordion */}
          <div id="faq-accordion-section">
            <FAQAccordion
              items={faqItems}
              title="Frequently Asked Questions"
              subtitle={`Everything you need to know about ${tour.title}, accommodation options, group dynamics, and planning your arrival.`}
              badge="Traveler Inquiries"
              onOpenInquiry={() => setInquiryOpen(true)}
            />
          </div>
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

              {/* Rating Reassurance in booking card */}
              <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <StarRating rating={ratingStats.averageRating} size="xs" />
                  <span className="font-bold text-foreground text-[0.7rem]">
                    {ratingStats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground underline decoration-dotted">
                    ({ratingStats.totalReviews} reviews)
                  </span>
                </button>
                <span className="text-[0.65rem] font-medium text-success">
                  {ratingStats.percentRecommended}% recommended
                </span>
              </div>
            </div>

            {/* Departure Date Selector: Interactive Calendar for Day Tours, Dropdown for Multi-day */}
            {isDayTour ? (
              <DayTourCalendarPicker
                departures={availableDepartures}
                selectedDepartureId={selectedDeparture?.id}
                onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
                currency={tour.currency}
                label="Choose Tour Date"
              />
            ) : (
              <DepartureDropdown
                departures={availableDepartures}
                selectedDepartureId={selectedDeparture?.id}
                onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
                currency={tour.currency}
                label="Select Departure Date"
              />
            )}

            {/* Passenger & Ticket Selection: Adults & Tiered Group Pricing for Day Tours, Rooming Selector for Multi-day */}
            {isDayTour ? (
              <DayTourPricingSelector
                baseAdultPriceCents={basePricePerPersonCents}
                passengers={passengers}
                onChangePassengers={(count) => setPassengers(Math.min(Math.max(1, availableSeats), count))}
                currency={tour.currency}
                maxPax={Math.max(1, availableSeats)}
              />
            ) : (
              <>
                {/* Number of Passengers Counter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Number of Travellers
                    </label>
                    <span className={`text-[0.68rem] font-semibold ${availableSeats <= 3 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
                      {availableSeats > 0 ? `${availableSeats} spot${availableSeats === 1 ? '' : 's'} left` : 'Sold out'}
                    </span>
                  </div>
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
                        onClick={() => setPassengers(Math.min(availableSeats, passengers + 1))}
                        disabled={passengers >= availableSeats || availableSeats <= 0}
                        className="size-7 rounded border border-border bg-card text-foreground font-bold hover:bg-muted disabled:opacity-40 cursor-pointer flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rooming Type Selector (Chosen after travellers count) */}
                <RoomingSelector
                  passengers={passengers}
                  basePricePerPersonCents={basePricePerPersonCents}
                  currency={tour.currency}
                  singleSupplementPercent={singleSupplementPercent}
                  singleSupplementCents={tour.single_supplement_cents}
                  policyNotes={tour.room_policy_notes}
                  selections={roomSelections}
                  onChange={setRoomSelections}
                />
              </>
            )}

            {/* Total Summary */}
            <div className="border-t border-border pt-4">
              {isDayTour ? (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {passengers} {passengers === 1 ? 'Adult' : 'Adults'} @ {formatPrice(dayTourPricing.pricePerPersonCents, tour.currency)}
                    </span>
                    <span>
                      {dayTourPricing.isGroupDiscountApplied
                        ? `${dayTourPricing.discountPercent}% Group Rate`
                        : 'Adult Base Fare'}
                    </span>
                  </div>
                  {dayTourPricing.isGroupDiscountApplied && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                      <span>Group Discount ({dayTourPricing.tierLabel})</span>
                      <span>-{formatPrice(dayTourPricing.totalSavingsCents, tour.currency)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-baseline justify-between border-t border-border/50 pt-2">
                    <span className="text-sm font-semibold text-foreground">Estimated Total</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {formatPrice(dayTourPricing.totalPriceCents, tour.currency)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{passengers} x {formatPrice(basePricePerPersonCents, tour.currency)}</span>
                    <span>Base Tour</span>
                  </div>
                  {totalSupplementCents > 0 && (
                    <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
                      <span>Single Supplement ({singleRoomsCount} room{singleRoomsCount > 1 ? 's' : ''} @ +{singleSupplementPercent}%)</span>
                      <span>+{formatPrice(totalSupplementCents, tour.currency)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-baseline justify-between border-t border-border/50 pt-2">
                    <span className="text-sm font-semibold text-foreground">Estimated Total</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {formatPrice(totalPriceCents, tour.currency)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Booking & Inquiry Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={availableSeats <= 0}
                onClick={() =>
                  onBookTour(
                    tour.slug,
                    selectedDeparture?.id,
                    Math.min(passengers, availableSeats),
                    isDayTour ? [] : roomSelections.slice(0, Math.min(passengers, availableSeats))
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>{availableSeats <= 0 ? 'Departure Sold Out' : 'Book this tour'}</span>
                {availableSeats > 0 && <ArrowRight className="size-4" />}
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
            alt={`${tour.title} gallery preview ${lightboxIndex + 1}`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = getTourFallbackImage(tour);
              if (!target.src.endsWith(fallback)) {
                target.src = fallback;
              }
            }}
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

      {/* Social Card & Share Modal */}
      <ShareTourModal
        tour={tour}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        ratingStats={ratingStats}
      />
    </div>
  );
};
