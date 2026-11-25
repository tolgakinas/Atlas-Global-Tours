import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Check,
  Calendar,
  Users,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  Copy,
  CalendarClock,
  Tag,
  X,
} from 'lucide-react';
import { TOURS_DATA, RoomingSelection } from '../data/toursData';
import { useTours } from '../context/ToursContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth, Booking } from '../context/AuthContext';
import { DepartureDropdown } from '../components/DepartureDropdown';
import { RoomingSelector } from '../components/RoomingSelector';
import { DayTourCalendarPicker } from '../components/DayTourCalendarPicker';
import { DayTourPricingSelector } from '../components/DayTourPricingSelector';
import { AdvisorClientVoucher } from '../components/AdvisorClientVoucher';
import { StripePaymentForm } from '../components/StripePaymentForm';
import { calculateDayTourPricing } from '../utils/dayTourPricing';
import { sendAdminBookingNotification } from '../utils/bookingNotifications';
import { generateBookingReference, resolveTourCode } from '../utils/bookingReference';
import {
  calculatePaymentPlan,
  evaluateInstallmentEligibility,
  formatExactCurrency,
  formatShortUtcDate,
  type AppliedPromoInput,
  type InstallmentItem,
  type InstallmentTerms,
  type PaymentPlanType,
} from '../utils/paymentPlans';
import {
  formatPromoBenefitLabel,
  normalizePromoCode,
  type PublicPromoSummary,
} from '../utils/promoCodes';

interface BookTourPageProps {
  slug: string;
  initialDepartureId?: string;
  initialGuests?: number;
  initialRoomSelections?: RoomingSelection[];
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
}

interface PendingStripeDraft {
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  tourImage: string;
  tourCode: string;
  departureId?: string;
  departureDate: string;
  guests: number;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadNationality: string;
  specialRequests: string;
  roomSummary: string;
  paymentPlan: PaymentPlanType;
  installmentTerms: InstallmentTerms;
  grossTotalCents: number;
  currency: string;
}

const STRIPE_DRAFT_PREFIX = 'agt_stripe_draft_';

export const BookTourPage: React.FC<BookTourPageProps> = ({
  slug,
  initialDepartureId,
  initialGuests = 2,
  initialRoomSelections,
  onNavigate,
  onSelectTour,
}) => {
  const { tours, siteContent, bookDepartureSeats } = useTours();
  const { currency: displayCurrency, formatPrice } = useCurrency();
  const { user, addBooking } = useAuth();

  const tour = useMemo(() => {
    return tours.find((t) => t.slug === slug) || TOURS_DATA.find((t) => t.slug === slug) || TOURS_DATA[0];
  }, [tours, slug]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [guests, setGuests] = useState(initialGuests);
  const [selectedDepartureId, setSelectedDepartureId] = useState(() => {
    if (initialDepartureId) return initialDepartureId;
    const firstOpen = tour.departuresList?.find(
      (d) => d.status !== 'sold_out' && d.capacity - d.seats_booked > 0
    );
    return firstOpen?.id || tour.departuresList?.[0]?.id || '';
  });

  const [roomSelections, setRoomSelections] = useState<RoomingSelection[]>(() => {
    if (initialRoomSelections && initialRoomSelections.length > 0) {
      return initialRoomSelections;
    }
    const defaults: RoomingSelection[] = [];
    for (let i = 0; i < initialGuests; i++) {
      defaults.push({
        travelerIndex: i,
        roomType: initialGuests === 1 ? 'single' : (initialGuests === 2 ? 'double' : 'twin'),
      });
    }
    return defaults;
  });

  // Traveler form state
  const [leadName, setLeadName] = useState(user?.name || '');
  const [leadEmail, setLeadEmail] = useState(user?.email || '');
  const [leadPhone, setLeadPhone] = useState(user?.phone || '');
  const [leadNationality, setLeadNationality] = useState('United States');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment plan & method state
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanType>('deposit_installments');
  const [installmentTerms, setInstallmentTerms] = useState<InstallmentTerms>(3);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wire'>('stripe');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PublicPromoSummary | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Confirmed booking state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizingReturn, setIsFinalizingReturn] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [confirmedRemainingSeats, setConfirmedRemainingSeats] = useState<number | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);

  const finalizedPiRef = useRef<Set<string>>(new Set());

  const selectedDeparture = useMemo(() => {
    if (selectedDepartureId && tour.departuresList) {
      return tour.departuresList.find((d) => d.id === selectedDepartureId) || tour.departuresList[0];
    }
    return tour.departuresList?.[0];
  }, [tour, selectedDepartureId]);

  const availableSeats = useMemo(() => {
    if (!selectedDeparture) return tour.max_pax || 10;
    if (selectedDeparture.status === 'sold_out') return 0;
    return Math.max(0, selectedDeparture.capacity - selectedDeparture.seats_booked);
  }, [selectedDeparture, tour.max_pax]);

  useEffect(() => {
    if (availableSeats > 0 && guests > availableSeats) {
      setGuests(availableSeats);
    }
  }, [availableSeats, guests]);

  useEffect(() => {
    setAvailabilityError(null);
  }, [selectedDepartureId, guests]);

  const isDayTour = tour.tour_type === 'day' || tour.days === 1;
  const isMultiDay = !isDayTour;

  const pricePerPersonCents = selectedDeparture?.price_cents || tour.price_cents;

  const dayTourPricing = useMemo(() => {
    return calculateDayTourPricing(pricePerPersonCents, guests);
  }, [pricePerPersonCents, guests]);

  const singleSupplementPercent =
    tour.single_supplement_percent ?? siteContent.defaultSingleSupplementPercent ?? 15;

  const supplementPerPersonCents =
    typeof tour.single_supplement_cents === 'number' && tour.single_supplement_cents > 0
      ? tour.single_supplement_cents
      : Math.round(pricePerPersonCents * (singleSupplementPercent / 100));

  const singleRoomsCount = isDayTour
    ? 0
    : roomSelections
        .slice(0, guests)
        .filter((s) => s.roomType === 'single').length;

  const doubleCount = isDayTour
    ? 0
    : roomSelections.slice(0, guests).filter((s) => s.roomType === 'double').length;
  const twinCount = isDayTour
    ? 0
    : roomSelections.slice(0, guests).filter((s) => s.roomType === 'twin').length;

  const totalSupplementCents = isDayTour ? 0 : singleRoomsCount * supplementPerPersonCents;
  const grossTotalCents = isDayTour
    ? dayTourPricing.totalPriceCents
    : pricePerPersonCents * guests + totalSupplementCents;

  const resolvedDepartureDate = selectedDeparture ? selectedDeparture.start_date : 'Flexible';

  // Departure-date-based installment eligibility (<30 days -> full pay only; payoff due 14 days before trip)
  const installmentEligibility = useMemo(
    () => evaluateInstallmentEligibility(resolvedDepartureDate),
    [resolvedDepartureDate]
  );

  // Automatically enforce departure-date installment rules when departure changes
  useEffect(() => {
    if (!installmentEligibility.eligible) {
      if (paymentPlan !== 'full_pay') {
        setPaymentPlan('full_pay');
      }
      return;
    }
    if (installmentEligibility.maxAllowedTerms > 0 && installmentTerms > installmentEligibility.maxAllowedTerms) {
      setInstallmentTerms(installmentEligibility.maxAllowedTerms as InstallmentTerms);
    }
  }, [installmentEligibility.eligible, installmentEligibility.maxAllowedTerms, paymentPlan, installmentTerms]);

  const appliedPromoInput: AppliedPromoInput | null = useMemo(() => {
    if (!appliedPromo) return null;
    return {
      code: appliedPromo.code,
      discountType: appliedPromo.discountType,
      discountValue: appliedPromo.discountValue,
      currency: appliedPromo.currency,
      stackableWithFullPayDiscount: appliedPromo.stackableWithFullPayDiscount,
    };
  }, [appliedPromo]);

  // Authoritative plan calculations (exact match to server.ts)
  const activeBreakdown = useMemo(
    () =>
      calculatePaymentPlan({
        grossTotalCents,
        currency: tour.currency,
        isMultiDay,
        paymentPlan,
        installmentTerms,
        departureDate: resolvedDepartureDate,
        promo: appliedPromoInput,
      }),
    [grossTotalCents, tour.currency, isMultiDay, paymentPlan, installmentTerms, resolvedDepartureDate, appliedPromoInput]
  );

  const fullPayPreview = useMemo(
    () =>
      calculatePaymentPlan({
        grossTotalCents,
        currency: tour.currency,
        isMultiDay,
        paymentPlan: 'full_pay',
        installmentTerms: 1,
        departureDate: resolvedDepartureDate,
        promo: appliedPromoInput,
      }),
    [grossTotalCents, tour.currency, isMultiDay, resolvedDepartureDate, appliedPromoInput]
  );

  const depositPreview = useMemo(
    () =>
      calculatePaymentPlan({
        grossTotalCents,
        currency: tour.currency,
        isMultiDay,
        paymentPlan: 'deposit_installments',
        installmentTerms,
        departureDate: resolvedDepartureDate,
        promo: appliedPromoInput,
      }),
    [grossTotalCents, tour.currency, isMultiDay, installmentTerms, resolvedDepartureDate, appliedPromoInput]
  );

  const handleApplyPromoCode = async () => {
    const cleanCode = normalizePromoCode(promoInput);
    if (!cleanCode) {
      setPromoError('Please enter a promo code.');
      return;
    }
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          tourId: tour.id,
          tourSlug: tour.slug,
          departureId: selectedDeparture?.id,
          departureDate: resolvedDepartureDate,
          guests,
          singleRoomsCount,
          paymentPlan,
          installmentTerms,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.valid || !data.promo) {
        setAppliedPromo(null);
        setPromoError(typeof data.error === 'string' ? data.error : 'Invalid promo code.');
        return;
      }
      setAppliedPromo(data.promo as PublicPromoSummary);
      setPromoInput((data.promo as PublicPromoSummary).code);
      setPromoError(null);
    } catch {
      setPromoError('Unable to validate promo code right now. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  // Clear applied promo if cart subtotal drops below minimum order or tour scope changes
  useEffect(() => {
    if (!appliedPromo) return;
    if (appliedPromo.minOrderCents && grossTotalCents < appliedPromo.minOrderCents) {
      setAppliedPromo(null);
      setPromoError(
        `Promo code ${appliedPromo.code} requires a minimum booking total of ${formatExactCurrency(
          appliedPromo.minOrderCents,
          tour.currency
        )}.`
      );
      return;
    }
    if (appliedPromo.appliesTo === 'multi_day' && !isMultiDay) {
      setAppliedPromo(null);
      setPromoError(`Promo code ${appliedPromo.code} is only valid for multi-day tours.`);
      return;
    }
    if (appliedPromo.appliesTo === 'day_tour' && isMultiDay) {
      setAppliedPromo(null);
      setPromoError(`Promo code ${appliedPromo.code} is only valid for day tours.`);
    }
  }, [appliedPromo, grossTotalCents, isMultiDay, tour.currency]);

  const roomSummaryString = useMemo(() => {
    if (isDayTour) {
      return 'Day Excursion (No lodging required)';
    }
    const parts: string[] = [];
    if (doubleCount > 0) parts.push(`${Math.ceil(doubleCount / 2)} Double Room (Couples)`);
    if (twinCount > 0) parts.push(`${Math.ceil(twinCount / 2)} Twin Share (2 Beds)`);
    if (singleRoomsCount > 0) parts.push(`${singleRoomsCount} Single Room (+${singleSupplementPercent}% supplement)`);
    return parts.join(', ') || 'Standard rooming';
  }, [isDayTour, doubleCount, twinCount, singleRoomsCount, singleSupplementPercent]);

  const savePendingStripeDraft = useCallback(
    (paymentIntentId: string) => {
      const draft: PendingStripeDraft = {
        tourId: tour.id,
        tourSlug: tour.slug,
        tourTitle: tour.title,
        tourImage: tour.hero_image,
        tourCode: resolveTourCode(tour),
        departureId: selectedDeparture?.id,
        departureDate: resolvedDepartureDate,
        guests,
        leadName,
        leadEmail,
        leadPhone,
        leadNationality,
        specialRequests,
        roomSummary: roomSummaryString,
        paymentPlan,
        installmentTerms,
        grossTotalCents,
        currency: tour.currency,
      };
      try {
        sessionStorage.setItem(`${STRIPE_DRAFT_PREFIX}${paymentIntentId}`, JSON.stringify(draft));
      } catch {
        // Ignore storage errors in restricted contexts
      }
    },
    [
      tour,
      selectedDeparture,
      resolvedDepartureDate,
      guests,
      leadName,
      leadEmail,
      leadPhone,
      leadNationality,
      specialRequests,
      roomSummaryString,
      paymentPlan,
      installmentTerms,
      grossTotalCents,
    ]
  );

  const finalizeStripeBooking = useCallback(
    async (paymentIntentId: string, draftOverride?: PendingStripeDraft) => {
      if (finalizedPiRef.current.has(paymentIntentId)) return;
      finalizedPiRef.current.add(paymentIntentId);

      setIsSubmitting(true);
      setAvailabilityError(null);

      const activeTourCode = draftOverride?.tourCode || resolveTourCode(tour);
      const activeDepartureDate = draftOverride?.departureDate || resolvedDepartureDate;
      const activeGuests = draftOverride?.guests ?? guests;
      const activeLeadName = draftOverride?.leadName || leadName;
      const activeLeadEmail = draftOverride?.leadEmail || leadEmail;
      const activeLeadPhone = draftOverride?.leadPhone || leadPhone;
      const activeLeadNationality = draftOverride?.leadNationality || leadNationality;
      const activeRoomSummary = draftOverride?.roomSummary || roomSummaryString;
      const activeSpecialReq = draftOverride?.specialRequests ?? specialRequests;
      const activeDepartureId = draftOverride?.departureId || selectedDeparture?.id;

      const preGeneratedRef = generateBookingReference(activeTourCode, activeDepartureDate);

      try {
        const res = await fetch('/api/stripe/finalize-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            bookingReference: preGeneratedRef,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.verified) {
          finalizedPiRef.current.delete(paymentIntentId);
          setAvailabilityError(
            typeof data.error === 'string'
              ? data.error
              : 'Could not verify Stripe payment status. Please contact support with your payment receipt.'
          );
          setIsSubmitting(false);
          setIsFinalizingReturn(false);
          return;
        }

        const verifiedCurrency: string = data.currency || draftOverride?.currency || tour.currency;
        const verifiedPlan: PaymentPlanType =
          data.paymentPlan === 'full_pay' ? 'full_pay' : 'deposit_installments';
        const verifiedInstallments: InstallmentItem[] = Array.isArray(data.installments)
          ? data.installments
          : [];
        const verifiedNetTotalCents: number =
          typeof data.netTotalCents === 'number' ? data.netTotalCents : activeBreakdown.netTotalCents;
        const verifiedGrossTotalCents: number =
          typeof data.grossTotalCents === 'number' ? data.grossTotalCents : grossTotalCents;
        const verifiedPromoCode: string | undefined =
          typeof data.promoCode === 'string' && data.promoCode ? data.promoCode : undefined;
        const verifiedPromoDiscountCents: number =
          typeof data.promoDiscountCents === 'number' ? data.promoDiscountCents : 0;
        const verifiedDiscountCents: number =
          typeof data.fullPayDiscountCents === 'number' ? data.fullPayDiscountCents : 0;
        const verifiedAmountPaidCents: number =
          typeof data.amountPaidCents === 'number' ? data.amountPaidCents : activeBreakdown.chargeNowCents;
        const verifiedRemainingCents: number =
          typeof data.remainingBalanceCents === 'number' ? data.remainingBalanceCents : 0;

        const fullSpecialRequests = [
          `Room Configuration: ${activeRoomSummary}`,
          activeSpecialReq ? `Special Requests: ${activeSpecialReq}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        // 1. Reduce live seat availability on selected departure
        const seatUpdate =
          activeDepartureId || activeDepartureDate !== 'Flexible'
            ? bookDepartureSeats(
                draftOverride?.tourId || tour.id,
                activeDepartureId || activeDepartureDate,
                activeGuests
              )
            : null;

        // 2. Save confirmed booking with Stripe payment details & installment Payment Links
        const newBooking = addBooking({
          reference: preGeneratedRef,
          tourCode: activeTourCode,
          tourId: draftOverride?.tourId || tour.id,
          tourSlug: draftOverride?.tourSlug || tour.slug,
          tourTitle: draftOverride?.tourTitle || tour.title,
          tourImage: draftOverride?.tourImage || tour.hero_image,
          departureDate: activeDepartureDate,
          guests: activeGuests,
          totalPriceCents: verifiedNetTotalCents,
          grossTotalCents: verifiedGrossTotalCents,
          promoCode: verifiedPromoCode,
          promoDiscountCents: verifiedPromoDiscountCents,
          fullPayDiscountCents: verifiedDiscountCents,
          paidAmountCents: verifiedAmountPaidCents,
          remainingBalanceCents: verifiedRemainingCents,
          currency: verifiedCurrency,
          leadName: activeLeadName,
          leadEmail: activeLeadEmail,
          leadPhone: activeLeadPhone,
          specialRequests: fullSpecialRequests,
          paymentStatus: verifiedPlan === 'full_pay' ? 'paid' : 'deposit_paid',
          paymentPlan: verifiedPlan,
          installmentTerms: data.installmentTerms,
          stripePaymentIntentId: paymentIntentId,
          installments: verifiedInstallments,
        });

        const installmentSummaryLines =
          verifiedInstallments.length > 0
            ? verifiedInstallments
                .map(
                  (inst) =>
                    `Installment ${inst.installmentNumber}/${inst.totalInstallments}: ${formatExactCurrency(
                      inst.amountCents,
                      inst.currency
                    )} due ${inst.dueDate}${inst.paymentLinkUrl ? ` — Pay Link: ${inst.paymentLinkUrl}` : ''}`
                )
                .join('\n')
            : undefined;

        const paymentPlanLabel =
          verifiedPlan === 'full_pay'
            ? verifiedDiscountCents > 0
              ? 'Pay in Full (5% Multi-Day Discount)'
              : 'Pay in Full (100%)'
            : `10% Deposit + ${verifiedInstallments.length} Scheduled Installment${
                verifiedInstallments.length === 1 ? '' : 's'
              }`;

        // 3. Notify operations team with full Stripe payment + installment links
        await sendAdminBookingNotification({
          reference: newBooking.reference,
          tourCode: activeTourCode,
          tourTitle: draftOverride?.tourTitle || tour.title,
          tourSlug: draftOverride?.tourSlug || tour.slug,
          departureDate: activeDepartureDate,
          guests: activeGuests,
          remainingSeats: seatUpdate?.remainingSeats,
          capacity: seatUpdate?.capacity,
          totalPriceFormatted: formatExactCurrency(verifiedNetTotalCents, verifiedCurrency),
          amountPaidFormatted: formatExactCurrency(verifiedAmountPaidCents, verifiedCurrency),
          remainingBalanceFormatted:
            verifiedRemainingCents > 0
              ? formatExactCurrency(verifiedRemainingCents, verifiedCurrency)
              : undefined,
          discountFormatted:
            verifiedDiscountCents > 0
              ? `-${formatExactCurrency(verifiedDiscountCents, verifiedCurrency)}`
              : undefined,
          promoCode: verifiedPromoCode,
          promoDiscountFormatted:
            verifiedPromoCode && verifiedPromoDiscountCents > 0
              ? `-${formatExactCurrency(verifiedPromoDiscountCents, verifiedCurrency)}`
              : undefined,
          paymentPlanLabel,
          stripePaymentIntentId: paymentIntentId,
          installmentSummary: installmentSummaryLines,
          currency: verifiedCurrency,
          leadName: activeLeadName,
          leadEmail: activeLeadEmail,
          leadPhone: activeLeadPhone,
          leadNationality: activeLeadNationality,
          paymentMethod: 'Stripe (Card / Apple Pay / Google Pay / Klarna)',
          roomSummary: activeRoomSummary,
          specialRequests: fullSpecialRequests,
        });

        try {
          sessionStorage.removeItem(`${STRIPE_DRAFT_PREFIX}${paymentIntentId}`);
        } catch {
          // ignore
        }

        if (draftOverride) {
          setLeadName(draftOverride.leadName);
          setLeadEmail(draftOverride.leadEmail);
          setLeadPhone(draftOverride.leadPhone);
          setGuests(draftOverride.guests);
        }

        setConfirmedRemainingSeats(seatUpdate ? seatUpdate.remainingSeats : null);
        setConfirmedBooking(newBooking);
        setConfirmedBookingRef(newBooking.reference);
      } catch (err) {
        finalizedPiRef.current.delete(paymentIntentId);
        setAvailabilityError(
          err instanceof Error
            ? err.message
            : 'Unable to finalize booking after payment. Please contact support.'
        );
      } finally {
        setIsSubmitting(false);
        setIsFinalizingReturn(false);
      }
    },
    [
      tour,
      resolvedDepartureDate,
      guests,
      leadName,
      leadEmail,
      leadPhone,
      leadNationality,
      roomSummaryString,
      specialRequests,
      selectedDeparture,
      activeBreakdown,
      grossTotalCents,
      bookDepartureSeats,
      addBooking,
    ]
  );

  // Detect redirect return from Klarna / 3D Secure Stripe confirmation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const piId = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');
    const isStripeReturn = params.get('stripe_return') === '1';

    if (!isStripeReturn || !piId) return;

    // Clean query params from URL bar without reloading
    window.history.replaceState({}, '', window.location.pathname);

    if (redirectStatus && redirectStatus !== 'succeeded' && redirectStatus !== 'processing') {
      setStep(3);
      setAvailabilityError('Your payment was not completed. Please try again or choose another payment method.');
      return;
    }

    let draft: PendingStripeDraft | undefined;
    try {
      const raw = sessionStorage.getItem(`${STRIPE_DRAFT_PREFIX}${piId}`);
      if (raw) {
        draft = JSON.parse(raw) as PendingStripeDraft;
      }
    } catch {
      // fallback to current state
    }

    setIsFinalizingReturn(true);
    finalizeStripeBooking(piId, draft);
  }, [finalizeStripeBooking]);

  // Bank Wire Transfer booking handler
  const handleWireTransferBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || isSubmitting || paymentMethod !== 'wire') return;

    if (selectedDeparture && (availableSeats <= 0 || guests > availableSeats)) {
      setAvailabilityError(
        availableSeats <= 0
          ? 'This departure date is now sold out. Please select another available date.'
          : `Only ${availableSeats} spot${availableSeats === 1 ? '' : 's'} remaining on this departure. Please adjust your passenger count or choose another date.`
      );
      return;
    }

    setIsSubmitting(true);
    setAvailabilityError(null);

    const fullSpecialRequests = [
      `Room Configuration: ${roomSummaryString}`,
      specialRequests ? `Special Requests: ${specialRequests}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const seatUpdate = selectedDeparture
      ? bookDepartureSeats(tour.id, selectedDeparture.id || selectedDeparture.start_date, guests)
      : null;

    const tourCode = resolveTourCode(tour);
    const newBooking = addBooking({
      tourCode,
      tourId: tour.id,
      tourSlug: tour.slug,
      tourTitle: tour.title,
      tourImage: tour.hero_image,
      departureDate: resolvedDepartureDate,
      guests,
      totalPriceCents: activeBreakdown.netTotalCents,
      grossTotalCents: activeBreakdown.grossTotalCents,
      promoCode: activeBreakdown.promoCode || undefined,
      promoDiscountCents: activeBreakdown.promoDiscountCents,
      fullPayDiscountCents: activeBreakdown.fullPayDiscountCents,
      paidAmountCents: 0,
      remainingBalanceCents: activeBreakdown.netTotalCents,
      currency: tour.currency,
      leadName,
      leadEmail,
      leadPhone,
      specialRequests: fullSpecialRequests,
      paymentStatus: 'pending',
      paymentPlan: 'wire',
      installmentTerms: activeBreakdown.paymentPlan === 'deposit_installments' ? activeBreakdown.installmentTerms : undefined,
      installments: activeBreakdown.installmentSchedule,
    });

    await sendAdminBookingNotification({
      reference: newBooking.reference,
      tourCode,
      tourTitle: tour.title,
      tourSlug: tour.slug,
      departureDate: resolvedDepartureDate,
      guests,
      remainingSeats: seatUpdate?.remainingSeats,
      capacity: seatUpdate?.capacity,
      totalPriceFormatted: formatExactCurrency(activeBreakdown.netTotalCents, tour.currency),
      depositFormatted: formatExactCurrency(activeBreakdown.chargeNowCents, tour.currency),
      discountFormatted:
        activeBreakdown.fullPayDiscountCents > 0
          ? `-${formatExactCurrency(activeBreakdown.fullPayDiscountCents, tour.currency)}`
          : undefined,
      promoCode: activeBreakdown.promoCode || undefined,
      promoDiscountFormatted:
        activeBreakdown.promoCode && activeBreakdown.promoDiscountCents > 0
          ? `-${formatExactCurrency(activeBreakdown.promoDiscountCents, tour.currency)}`
          : undefined,
      paymentPlanLabel:
        activeBreakdown.paymentPlan === 'full_pay'
          ? `Bank Wire — Full Payment${activeBreakdown.fullPayDiscountPercent > 0 ? ' (5% Multi-Day Discount)' : ''}`
          : `Bank Wire — 10% Deposit + ${activeBreakdown.installmentTerms} Installment${activeBreakdown.installmentTerms > 1 ? 's' : ''}`,
      currency: tour.currency,
      leadName,
      leadEmail,
      leadPhone,
      leadNationality,
      paymentMethod: 'Bank Wire Transfer (Invoice Requested)',
      roomSummary: roomSummaryString,
      specialRequests: fullSpecialRequests,
    });

    setConfirmedRemainingSeats(seatUpdate ? seatUpdate.remainingSeats : null);
    setConfirmedBooking(newBooking);
    setConfirmedBookingRef(newBooking.reference);
    setIsSubmitting(false);
  };

  const handleCopyPaymentLink = async (url: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkIndex(idx);
      window.setTimeout(() => setCopiedLinkIndex(null), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  if (isFinalizingReturn) {
    return (
      <div className="min-h-screen py-20 bg-paper/40 flex items-center justify-center">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-xl text-center max-w-md mx-4 space-y-4">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            Confirming Your Payment
          </h2>
          <p className="text-xs text-muted-foreground">
            Verifying your Stripe transaction and preparing your booking voucher & installment links...
          </p>
        </div>
      </div>
    );
  }

  if (confirmedBookingRef && confirmedBooking) {
    const confirmedCurrency = confirmedBooking.currency || tour.currency;
    const confirmedInstallments = confirmedBooking.installments || [];
    const showInstallments =
      confirmedBooking.paymentPlan === 'deposit_installments' && confirmedInstallments.length > 0;

    return (
      <div className="min-h-screen py-16 bg-paper/40">
        <div className="container-page max-w-2xl">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/20 text-success mb-6">
              <CheckCircle2 className="size-10" />
            </div>

            <span className="eyebrow text-primary">
              {confirmedBooking.paymentStatus === 'pending'
                ? 'Reservation Held · Wire Invoice Sent'
                : confirmedBooking.paymentStatus === 'deposit_paid'
                ? '10% Deposit Confirmed'
                : 'Booking Paid & Confirmed'}
            </span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground">
              You're heading on your journey!
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Your reservation has been confirmed. A confirmation receipt and detailed travel briefing has been sent to{' '}
              <strong className="text-foreground">{confirmedBooking.leadEmail || leadEmail}</strong>.
            </p>

            <div className="my-7 rounded-xl border border-primary/20 bg-primary/5 p-6 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Booking / Voucher Code
                </span>
                <span className="font-mono text-base font-bold text-primary">
                  {confirmedBookingRef}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Tour Code:</span>
                <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                  {confirmedBooking.tourCode || resolveTourCode(tour)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Journey:</span>
                <span className="font-semibold text-foreground truncate max-w-[280px]">
                  {confirmedBooking.tourTitle}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Departure:</span>
                <span className="font-semibold text-foreground">
                  {confirmedBooking.departureDate && confirmedBooking.departureDate !== 'Flexible'
                    ? new Date(`${confirmedBooking.departureDate}T00:00:00Z`).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })
                    : 'Flexible dates'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Travellers:</span>
                <span className="font-semibold text-foreground">
                  {confirmedBooking.guests} guest{confirmedBooking.guests > 1 ? 's' : ''}
                </span>
              </div>

              {confirmedBooking.stripePaymentIntentId && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Stripe Receipt Ref:</span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {confirmedBooking.stripePaymentIntentId}
                  </span>
                </div>
              )}

              {confirmedRemainingSeats !== null && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Departure Availability:</span>
                  <span className="font-semibold text-foreground">
                    {confirmedRemainingSeats === 0
                      ? 'Now sold out (last seats reserved)'
                      : `${confirmedRemainingSeats} spot${confirmedRemainingSeats === 1 ? '' : 's'} remaining`}
                  </span>
                </div>
              )}

              {confirmedBooking.promoCode && (confirmedBooking.promoDiscountCents ?? 0) > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Promo Code ({confirmedBooking.promoCode}):</span>
                  <span>
                    -{formatExactCurrency(confirmedBooking.promoDiscountCents || 0, confirmedCurrency)}
                  </span>
                </div>
              )}

              {(confirmedBooking.fullPayDiscountCents ?? 0) > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Multi-Day Pay-in-Full Savings (5% OFF):</span>
                  <span>
                    -{formatExactCurrency(confirmedBooking.fullPayDiscountCents || 0, confirmedCurrency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-border/80">
                <span className="text-muted-foreground">Total Tour Fare:</span>
                <span className="font-display text-lg font-bold text-foreground">
                  {formatExactCurrency(confirmedBooking.totalPriceCents, confirmedCurrency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  {confirmedBooking.paymentStatus === 'pending' ? 'Amount Due via Wire:' : 'Paid Today via Stripe:'}
                </span>
                <span className="font-display text-base font-bold text-primary">
                  {confirmedBooking.paymentStatus === 'pending'
                    ? formatExactCurrency(activeBreakdown.chargeNowCents, confirmedCurrency)
                    : formatExactCurrency(confirmedBooking.paidAmountCents ?? confirmedBooking.totalPriceCents, confirmedCurrency)}
                </span>
              </div>

              {(confirmedBooking.remainingBalanceCents ?? 0) > 0 &&
                confirmedBooking.paymentStatus !== 'pending' && (
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Remaining Balance (90%):</span>
                    <span className="font-semibold text-foreground">
                      {formatExactCurrency(confirmedBooking.remainingBalanceCents || 0, confirmedCurrency)}
                    </span>
                  </div>
                )}
            </div>

            {/* Saved Installment Schedule & Direct Stripe Payment Links */}
            {showInstallments && (
              <div className="mb-7 rounded-xl border border-border bg-background p-5 text-left space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      Saved Installment Schedule ({confirmedInstallments.length} Terms)
                    </h3>
                  </div>
                  <span className="text-[0.68rem] font-medium text-muted-foreground">
                    Also saved in Traveller Portal
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the secure Stripe payment link next to any scheduled installment whenever you are ready to pay it.
                </p>

                <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {confirmedInstallments.map((inst, idx) => (
                    <div
                      key={inst.installmentNumber}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3.5 py-2.5 bg-card text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">
                          Installment {inst.installmentNumber} of {inst.totalInstallments}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          Due {formatShortUtcDate(inst.dueDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">
                          {formatExactCurrency(inst.amountCents, inst.currency)}
                        </span>
                        {inst.paymentLinkUrl ? (
                          <>
                            <a
                              href={inst.paymentLinkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[0.7rem] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <span>Pay Link</span>
                              <ExternalLink className="size-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyPaymentLink(inst.paymentLinkUrl!, idx)}
                              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[0.7rem] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Copy Stripe Payment Link"
                            >
                              {copiedLinkIndex === idx ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-[0.68rem] text-muted-foreground">Scheduled</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('/account')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
              >
                View in Traveller Portal
              </button>
              <button
                onClick={() => setShowVoucherModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Download className="size-3.5" />
                View & Print Voucher
              </button>
            </div>
          </div>
        </div>

        {showVoucherModal && (
          <AdvisorClientVoucher
            booking={confirmedBooking}
            onClose={() => setShowVoucherModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 lg:py-14 bg-background">
      <div className="container-page max-w-4xl">
        {/* Back Link */}
        <button
          onClick={() => onSelectTour(tour.slug)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          Back to tour details
        </button>

        {/* Stepper Progress */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-semibold ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Departure & Guests
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-border" />

          <div className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-semibold ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Traveller Details
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-border" />

          <div className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-semibold ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Payment & Checkout
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Form Steps */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    1. Choose Departure Date
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All departures are guaranteed once booked. Booking for{' '}
                    <span className="font-semibold text-foreground">
                      {guests} {guests === 1 ? (isDayTour ? 'adult' : 'traveller') : (isDayTour ? 'adults' : 'travellers')}
                    </span>
                    . Small group limit is {tour.max_pax || 10} travellers.
                  </p>
                </div>

                {isDayTour ? (
                  <>
                    <DayTourCalendarPicker
                      departures={tour.departuresList || []}
                      selectedDepartureId={selectedDeparture?.id}
                      onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
                      currency={tour.currency}
                      label="Choose Tour Date"
                    />

                    <DayTourPricingSelector
                      baseAdultPriceCents={pricePerPersonCents}
                      passengers={guests}
                      onChangePassengers={(count) => setGuests(Math.min(Math.max(1, availableSeats), count))}
                      currency={tour.currency}
                      maxPax={Math.max(1, availableSeats)}
                    />
                  </>
                ) : (
                  <>
                    <DepartureDropdown
                      departures={tour.departuresList || []}
                      selectedDepartureId={selectedDeparture?.id}
                      onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
                      currency={tour.currency}
                      label="Select Departure Date"
                      departureSchedule={tour.departure_days}
                    />

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Users className="size-3.5 text-primary" />
                          <span>Number of Travellers</span>
                        </label>
                        <span className={`text-xs font-semibold ${availableSeats <= 3 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
                          {availableSeats > 0
                            ? `${availableSeats} spot${availableSeats === 1 ? '' : 's'} remaining`
                            : 'Sold out'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2.5">
                        <span className="text-sm font-medium pl-1">
                          {guests} {guests === 1 ? 'Guest' : 'Guests'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            disabled={guests <= 1}
                            className="size-8 rounded-md border border-border bg-card text-foreground font-bold hover:bg-muted disabled:opacity-40 cursor-pointer flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{guests}</span>
                          <button
                            type="button"
                            onClick={() => setGuests(Math.min(availableSeats, guests + 1))}
                            disabled={guests >= availableSeats || availableSeats <= 0}
                            className="size-8 rounded-md border border-border bg-card text-foreground font-bold hover:bg-muted disabled:opacity-40 cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <RoomingSelector
                        passengers={guests}
                        basePricePerPersonCents={pricePerPersonCents}
                        currency={tour.currency}
                        singleSupplementPercent={singleSupplementPercent}
                        singleSupplementCents={tour.single_supplement_cents}
                        policyNotes={tour.room_policy_notes}
                        selections={roomSelections}
                        onChange={setRoomSelections}
                      />
                    </div>
                  </>
                )}

                {availableSeats <= 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>This departure date is sold out. Please select another available date to continue.</span>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    type="button"
                    disabled={availableSeats <= 0}
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <span>Next: Traveller Details</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    2. Lead Traveller Information
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We will send the official vouchers, payment links, airport transfer instructions, and guide contact details to this email.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Johnathan Smith"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Phone Number (with country code) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Nationality / Passport Country
                    </label>
                    <select
                      value={leadNationality}
                      onChange={(e) => setLeadNationality(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other Country</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Special Dietary, Medical or Room Requests
                  </label>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Vegetarian diet, twin beds preferred, arriving 1 day early in Istanbul"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()}
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span>Next: Payment & Checkout</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    3. Choose Payment Plan & Complete Checkout
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reserve your seats with a 10% deposit and flexible installments, or pay in full
                    {isMultiDay ? ' to unlock an automatic 5% multi-day discount.' : '.'} Free cancellation up to 30 days before departure.
                  </p>
                </div>

                {/* Payment Plan Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    1. Select Payment Plan
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Option A: 10% Deposit + Departure-Date-Aware Installments */}
                    <button
                      type="button"
                      disabled={!installmentEligibility.eligible}
                      onClick={() => {
                        if (installmentEligibility.eligible) {
                          setPaymentPlan('deposit_installments');
                        }
                      }}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        !installmentEligibility.eligible
                          ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                          : paymentPlan === 'deposit_installments'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary cursor-pointer'
                          : 'border-border bg-background hover:bg-muted/40 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          10% Deposit + Installments
                        </span>
                        {installmentEligibility.eligible ? (
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                            Up to {installmentEligibility.maxAllowedTerms}{' '}
                            {installmentEligibility.maxAllowedTerms === 1 ? 'Term' : 'Terms'}
                          </span>
                        ) : (
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {installmentEligibility.eligible ? (
                          <>
                            Pay{' '}
                            <strong className="text-foreground">
                              {formatExactCurrency(depositPreview.chargeNowCents, tour.currency)}
                            </strong>{' '}
                            today, then split the remaining 90% into up to {installmentEligibility.maxAllowedTerms}{' '}
                            Stripe payment {installmentEligibility.maxAllowedTerms === 1 ? 'link' : 'links'}
                            {installmentEligibility.finalDueDate
                              ? ` (full payment due ${formatShortUtcDate(installmentEligibility.finalDueDate)}, 14 days before trip).`
                              : ' (full payment due 14 days before trip).'}
                          </>
                        ) : (
                          installmentEligibility.reason
                        )}
                      </p>
                    </button>

                    {/* Option B: Full Payment (+ 5% Discount on Multi-Day Tours) */}
                    <button
                      type="button"
                      onClick={() => setPaymentPlan('full_pay')}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        activeBreakdown.paymentPlan === 'full_pay'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-background hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">Pay in Full</span>
                        {isMultiDay && fullPayPreview.fullPayDiscountPercent > 0 && (
                          <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                            <Sparkles className="size-3" />
                            Save 5%
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-xs text-muted-foreground">
                        {isMultiDay && fullPayPreview.fullPayDiscountCents > 0 ? (
                          <>
                            Pay{' '}
                            <strong className="text-foreground">
                              {formatExactCurrency(fullPayPreview.netTotalCents, tour.currency)}
                            </strong>{' '}
                            today{' '}
                            <span className="line-through opacity-70">
                              {formatExactCurrency(
                                grossTotalCents - fullPayPreview.promoDiscountCents,
                                tour.currency
                              )}
                            </span>{' '}
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              (Save {formatExactCurrency(fullPayPreview.fullPayDiscountCents, tour.currency)})
                            </span>
                          </>
                        ) : (
                          <>
                            Pay{' '}
                            <strong className="text-foreground">
                              {formatExactCurrency(fullPayPreview.netTotalCents, tour.currency)}
                            </strong>{' '}
                            in one seamless payment today.
                          </>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Notice when departure is < 30 days away */}
                  {!installmentEligibility.eligible && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300">
                      <CalendarClock className="size-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Installments disabled for this departure:</strong> {installmentEligibility.reason}{' '}
                        Full payment is selected automatically
                        {isMultiDay && fullPayPreview.fullPayDiscountCents > 0
                          ? ' (including your 5% multi-day pay-in-full savings).'
                          : '.'}
                      </span>
                    </div>
                  )}

                  {/* Installment Term Selector (dynamically capped by departure date; payoff 14 days prior) */}
                  {activeBreakdown.paymentPlan === 'deposit_installments' && installmentEligibility.eligible && (
                    <div className="rounded-xl border border-border bg-paper/50 p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-foreground block">
                            Split Remaining 90% Balance ({formatExactCurrency(depositPreview.remainingBalanceCents, tour.currency)})
                          </span>
                          <span className="text-[0.7rem] text-muted-foreground">
                            {installmentEligibility.reason}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {([1, 2, 3, 4] as InstallmentTerms[]).map((termCount) => {
                            const isAllowed = termCount <= installmentEligibility.maxAllowedTerms;
                            return (
                              <button
                                key={termCount}
                                type="button"
                                disabled={!isAllowed}
                                onClick={() => isAllowed && setInstallmentTerms(termCount)}
                                title={
                                  isAllowed
                                    ? `Split remaining balance into ${termCount} ${termCount === 1 ? 'payment' : 'payments'}`
                                    : `Requires an earlier departure date (max ${installmentEligibility.maxAllowedTerms} terms for this trip date)`
                                }
                                className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors ${
                                  !isAllowed
                                    ? 'bg-muted/50 text-muted-foreground/50 border-border/60 cursor-not-allowed line-through'
                                    : activeBreakdown.installmentTerms === termCount
                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs cursor-pointer'
                                    : 'bg-background text-foreground border-border hover:bg-muted cursor-pointer'
                                }`}
                              >
                                {termCount} {termCount === 1 ? 'Term' : 'Terms'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {depositPreview.installmentSchedule.map((inst, index) => {
                          const isFinalTerm = index === depositPreview.installmentSchedule.length - 1;
                          return (
                            <div
                              key={inst.installmentNumber}
                              className="flex items-center justify-between rounded-lg border border-border/80 bg-background px-3 py-2 text-xs"
                            >
                              <div>
                                <span className="font-semibold text-foreground">
                                  Installment {inst.installmentNumber}/{inst.totalInstallments}
                                </span>
                                <span className="block text-[0.68rem] text-muted-foreground">
                                  Due {formatShortUtcDate(inst.dueDate)}
                                  {isFinalTerm && installmentEligibility.finalDueDate ? ' (14d before trip)' : ''}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-foreground">
                                {formatExactCurrency(inst.amountCents, inst.currency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Promo Code Input */}
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Promo Code (Optional)
                  </label>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Tag className="size-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                              {appliedPromo.code}
                            </span>
                            <span className="rounded bg-emerald-600/15 px-1.5 py-0.5 text-[0.65rem] font-bold text-emerald-800 dark:text-emerald-300">
                              {formatPromoBenefitLabel(appliedPromo)}
                            </span>
                            {activeBreakdown.promoDiscountCents > 0 && (
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                (-{formatExactCurrency(activeBreakdown.promoDiscountCents, tour.currency)})
                              </span>
                            )}
                          </div>
                          <p className="text-[0.7rem] text-emerald-800/80 dark:text-emerald-300/80 truncate mt-0.5">
                            {appliedPromo.description}
                            {!appliedPromo.stackableWithFullPayDiscount && isMultiDay && activeBreakdown.paymentPlan === 'full_pay'
                              ? ' · Replaces 5% pay-in-full discount'
                              : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromoCode}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-600/30 bg-background px-2.5 py-1 text-[0.7rem] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                      >
                        <X className="size-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(normalizePromoCode(e.target.value));
                            if (promoError) setPromoError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyPromoCode();
                            }
                          }}
                          placeholder="Enter promo code (e.g. ATLAS10)"
                          className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromoCode}
                        disabled={promoLoading || !promoInput.trim()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                      >
                        {promoLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <span>Apply Code</span>
                        )}
                      </button>
                    </div>
                  )}

                  {promoError && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{promoError}</span>
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    2. Payment Method
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-all ${
                        paymentMethod === 'stripe'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-background hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="size-5 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold text-sm block text-foreground">
                            Stripe Instant Pay
                          </span>
                          <span className="text-[0.7rem] text-muted-foreground">
                            Cards, Apple Pay, Google Pay, Klarna
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wire')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-all ${
                        paymentMethod === 'wire'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-background hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building className="size-5 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold text-sm block text-foreground">
                            Bank Wire Transfer
                          </span>
                          <span className="text-[0.7rem] text-muted-foreground">
                            US / EU invoice within 24h
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="rounded-lg bg-paper p-4 text-xs space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-muted-foreground">
                      I have reviewed the tour itinerary, payment plan terms, and cancellation policy (free cancellation up to 30 days prior), and agree to Atlas Global Tours terms and conditions.
                    </span>
                  </label>
                  {!agreeTerms && (
                    <p className="text-[0.7rem] text-amber-700 dark:text-amber-400 pl-6">
                      Please accept the booking terms above to enable checkout.
                    </p>
                  )}
                </div>

                {availabilityError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{availabilityError}</span>
                  </div>
                )}

                {/* Embedded Stripe Payment Element OR Wire Transfer Submit */}
                {paymentMethod === 'stripe' ? (
                  <div className="space-y-4">
                    <StripePaymentForm
                      tourId={tour.id}
                      tourSlug={tour.slug}
                      departureId={selectedDeparture?.id}
                      departureDate={resolvedDepartureDate}
                      guests={guests}
                      singleRoomsCount={singleRoomsCount}
                      roomSummary={roomSummaryString}
                      paymentPlan={activeBreakdown.paymentPlan}
                      installmentTerms={activeBreakdown.installmentTerms}
                      promoCode={appliedPromo?.code || null}
                      leadName={leadName}
                      leadEmail={leadEmail}
                      leadPhone={leadPhone}
                      agreeTerms={agreeTerms}
                      disabled={availableSeats <= 0 || isSubmitting}
                      localBreakdown={activeBreakdown}
                      onBeforeRedirect={savePendingStripeDraft}
                      onPaymentSuccess={(piId) => finalizeStripeBooking(piId)}
                    />

                    <div className="pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={isSubmitting}
                        className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
                      >
                        Back to Traveller Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleWireTransferBooking} className="space-y-4">
                    <div className="rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">Bank Wire Reservation</p>
                      <p>
                        Your seats will be reserved immediately and our finance desk will email official US/EU wire instructions for{' '}
                        <strong className="text-foreground">
                          {formatExactCurrency(activeBreakdown.chargeNowCents, tour.currency)}
                        </strong>{' '}
                        within 24 hours.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={isSubmitting}
                        className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!agreeTerms || isSubmitting || availableSeats <= 0}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-lg cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Reserving Seats...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="size-3.5" />
                            <span>Confirm Wire Reservation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="h-fit rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-foreground border-b border-border pb-3">
              Journey Summary
            </h3>

            <div className="flex gap-3">
              <img
                src={tour.hero_image}
                alt={tour.title}
                className="size-16 rounded-md object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="eyebrow text-primary block text-[0.6rem]">
                  {tour.tour_type === 'day' ? 'Day Tour' : `${tour.days} Days / ${tour.nights} Nights`}
                </span>
                <h4 className="font-display text-xs font-bold text-foreground line-clamp-2 mt-0.5">
                  {tour.title}
                </h4>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-muted-foreground border-t border-border">
              <div className="flex items-center justify-between">
                <span>Date:</span>
                <span className="font-semibold text-foreground">
                  {selectedDeparture?.start_date || 'Flexible'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isDayTour ? 'Adults:' : 'Travellers:'}</span>
                <span className="font-semibold text-foreground">
                  {guests} {isDayTour ? (guests === 1 ? 'Adult' : 'Adults') : (guests === 1 ? 'Guest' : 'Guests')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isDayTour ? 'Lodging:' : 'Rooming:'}</span>
                <span
                  className={`font-semibold text-right max-w-[180px] truncate ${
                    isDayTour ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                  }`}
                  title={roomSummaryString}
                >
                  {isDayTour ? 'Not required (Day Excursion)' : roomSummaryString}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isDayTour ? 'Adult Rate:' : 'Base per person:'}</span>
                <span className="font-semibold text-foreground">
                  {isDayTour
                    ? `${formatExactCurrency(dayTourPricing.pricePerPersonCents, tour.currency)} / adult`
                    : formatExactCurrency(pricePerPersonCents, tour.currency)}
                </span>
              </div>
              {isDayTour && dayTourPricing.isGroupDiscountApplied && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Group Discount ({dayTourPricing.tierLabel}):</span>
                  <span>-{formatExactCurrency(dayTourPricing.totalSavingsCents, tour.currency)}</span>
                </div>
              )}
              {!isDayTour && totalSupplementCents > 0 && (
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-medium">
                  <span>Single Supplement (+{singleSupplementPercent}%):</span>
                  <span>+{formatExactCurrency(totalSupplementCents, tour.currency)}</span>
                </div>
              )}
              {activeBreakdown.promoCode && activeBreakdown.promoDiscountCents > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Promo ({activeBreakdown.promoCode}):</span>
                  <span>-{formatExactCurrency(activeBreakdown.promoDiscountCents, tour.currency)}</span>
                </div>
              )}
              {activeBreakdown.fullPayDiscountCents > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Pay-in-Full Discount (5%):</span>
                  <span>-{formatExactCurrency(activeBreakdown.fullPayDiscountCents, tour.currency)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Fare
                </span>
                <div className="text-right">
                  {(activeBreakdown.fullPayDiscountCents > 0 || activeBreakdown.promoDiscountCents > 0) && (
                    <span className="text-xs text-muted-foreground line-through block">
                      {formatExactCurrency(activeBreakdown.grossTotalCents, tour.currency)}
                    </span>
                  )}
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatExactCurrency(activeBreakdown.netTotalCents, tour.currency)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {activeBreakdown.paymentPlan === 'full_pay' ? 'Due Today (100%):' : 'Due Today (10% Deposit):'}
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {formatExactCurrency(activeBreakdown.chargeNowCents, tour.currency)}
                  </span>
                </div>

                {activeBreakdown.paymentPlan === 'deposit_installments' && activeBreakdown.remainingBalanceCents > 0 && (
                  <>
                    <div className="flex items-center justify-between text-[0.72rem] text-muted-foreground">
                      <span>
                        Remaining (90% · {activeBreakdown.installmentTerms}{' '}
                        {activeBreakdown.installmentTerms === 1 ? 'term' : 'terms'}):
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatExactCurrency(activeBreakdown.remainingBalanceCents, tour.currency)}
                      </span>
                    </div>
                    {installmentEligibility.finalDueDate && (
                      <p className="text-[0.65rem] text-muted-foreground">
                        Full balance due by {formatShortUtcDate(installmentEligibility.finalDueDate)} (14 days before trip).
                      </p>
                    )}
                  </>
                )}

                {displayCurrency !== tour.currency.toUpperCase() && (
                  <p className="text-[0.65rem] text-muted-foreground pt-1 border-t border-primary/10">
                    Approx. {formatPrice(activeBreakdown.chargeNowCents, tour.currency)} in {displayCurrency} · Settled in {tour.currency.toUpperCase()} via Stripe.
                  </p>
                )}
              </div>

              <p className="pt-1 text-[0.65rem] text-muted-foreground">
                {isDayTour
                  ? 'Includes licensed historian guide, skip-the-line admissions, audio headsets, and all taxes.'
                  : 'Includes all accommodations, licensed guide, transfers, and entrance fees.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
