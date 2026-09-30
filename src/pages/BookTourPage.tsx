import React, { useState, useMemo } from 'react';
import {
  Check,
  Calendar,
  Users,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  Download
} from 'lucide-react';
import { Tour, TOURS_DATA } from '../data/toursData';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

interface BookTourPageProps {
  slug: string;
  initialDepartureId?: string;
  initialGuests?: number;
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
}

export const BookTourPage: React.FC<BookTourPageProps> = ({
  slug,
  initialDepartureId,
  initialGuests = 2,
  onNavigate,
  onSelectTour,
}) => {
  const { formatPrice } = useCurrency();
  const { user, addBooking } = useAuth();

  const tour = useMemo(() => {
    return TOURS_DATA.find((t) => t.slug === slug) || TOURS_DATA[0];
  }, [slug]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [guests, setGuests] = useState(initialGuests);
  const [selectedDepartureId, setSelectedDepartureId] = useState(
    initialDepartureId || (tour.departuresList?.[0]?.id ?? '')
  );

  // Traveler form state
  const [leadName, setLeadName] = useState(user?.name || '');
  const [leadEmail, setLeadEmail] = useState(user?.email || '');
  const [leadPhone, setLeadPhone] = useState(user?.phone || '');
  const [leadNationality, setLeadNationality] = useState('United States');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire' | 'guarantee'>('card');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Confirmed booking state
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  const selectedDeparture = useMemo(() => {
    if (selectedDepartureId && tour.departuresList) {
      return tour.departuresList.find((d) => d.id === selectedDepartureId) || tour.departuresList[0];
    }
    return tour.departuresList?.[0];
  }, [tour, selectedDepartureId]);

  const pricePerPersonCents = selectedDeparture?.price_cents || tour.price_cents;
  const totalPriceCents = pricePerPersonCents * guests;
  const depositCents = Math.round(totalPriceCents * 0.2); // 20% deposit

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;

    const newBooking = addBooking({
      tourId: tour.id,
      tourSlug: tour.slug,
      tourTitle: tour.title,
      tourImage: tour.hero_image,
      departureDate: selectedDeparture ? selectedDeparture.start_date : 'Flexible',
      guests,
      totalPriceCents,
      currency: tour.currency,
      leadName,
      leadEmail,
      leadPhone,
      specialRequests,
    });

    setConfirmedBookingRef(newBooking.reference);
  };

  if (confirmedBookingRef) {
    return (
      <div className="min-h-screen py-16 bg-paper/40">
        <div className="container-page max-w-2xl">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/20 text-success mb-6">
              <CheckCircle2 className="size-10" />
            </div>

            <span className="eyebrow text-primary">Booking Confirmed</span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground">
              You're heading to Türkiye!
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Your reservation has been confirmed. A confirmation receipt and detailed packing & travel briefing has been sent to <strong className="text-foreground">{leadEmail}</strong>.
            </p>

            <div className="my-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Booking Reference
                </span>
                <span className="font-mono text-base font-bold text-primary">
                  {confirmedBookingRef}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Journey:</span>
                <span className="font-semibold text-foreground truncate max-w-[280px]">
                  {tour.title}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Departure:</span>
                <span className="font-semibold text-foreground">
                  {selectedDeparture?.start_date
                    ? new Date(selectedDeparture.start_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Flexible dates'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Travellers:</span>
                <span className="font-semibold text-foreground">{guests} guest{guests > 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-border/80">
                <span className="text-muted-foreground">Total Tour Fare:</span>
                <span className="font-display text-lg font-bold text-primary">
                  {formatPrice(totalPriceCents, tour.currency)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('/account')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
              >
                View in Traveller Portal
              </button>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Download className="size-3.5" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
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
              Review & Guarantee
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
                    1. Choose Departure & Party Size
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All departures are guaranteed once booked. Small group limit is 12 travellers.
                  </p>
                </div>

                {/* Departure selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Available Dates ({tour.departuresList?.length || 0})
                  </label>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {tour.departuresList?.slice(0, 12).map((dep) => {
                      const isSelected = selectedDeparture?.id === dep.id;
                      return (
                        <div
                          key={dep.id}
                          onClick={() => setSelectedDepartureId(dep.id)}
                          className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-border bg-background hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>
                              {new Date(dep.start_date).toLocaleDateString('en-US', {
                                weekday: 'short',
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
                            <span className="text-primary">
                              {formatPrice(dep.price_cents, tour.currency)} / person
                            </span>
                          </div>
                          <div className="mt-1 text-[0.7rem] text-muted-foreground flex justify-between">
                            <span className="text-success font-medium">Instant confirmation</span>
                            <span>{dep.capacity - dep.seats_booked} spots remaining</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Number of guests */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Number of Travellers
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuests(num)}
                        className={`size-10 rounded-lg border text-sm font-bold cursor-pointer transition-all ${
                          guests === num
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border bg-background hover:bg-muted text-foreground'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
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
                    We will send the official vouchers, airport transfer instructions, and guide contact details to this email.
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
                    disabled={!leadName || !leadEmail || !leadPhone}
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span>Next: Review & Guarantee</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleCompleteBooking} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    3. Payment Guarantee & Final Review
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lock in your small group seats with 0% risk. Free cancellation up to 30 days before departure.
                  </p>
                </div>

                {/* Payment Option Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Guarantee Method
                  </label>

                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="size-5 text-primary" />
                      <div>
                        <span className="font-semibold text-sm block text-foreground">Credit / Debit Card</span>
                        <span className="text-xs text-muted-foreground">Visa, Mastercard, American Express</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary">Instant</span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'wire'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="size-5 text-primary" />
                      <div>
                        <span className="font-semibold text-sm block text-foreground">Bank Wire Transfer</span>
                        <span className="text-xs text-muted-foreground">US or European bank account transfer</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Invoice within 24h</span>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="rounded-lg bg-paper p-4 text-xs space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-muted-foreground">
                      I have reviewed the tour itinerary, cancellation policy (free cancellation up to 30 days prior), and agree to Atlas Global Tours terms and conditions.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!agreeTerms}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-lg cursor-pointer"
                  >
                    <Lock className="size-3.5" />
                    <span>Confirm & Guarantee Booking</span>
                  </button>
                </div>
              </form>
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
                <span>Travellers:</span>
                <span className="font-semibold text-foreground">{guests} Guest{guests > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate per person:</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(pricePerPersonCents, tour.currency)}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Fare
                </span>
                <span className="font-display text-2xl font-bold text-primary">
                  {formatPrice(totalPriceCents, tour.currency)}
                </span>
              </div>
              <p className="mt-1 text-[0.65rem] text-muted-foreground">
                Includes all scheduled activities, licensed guide, transfers, and entrance fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
