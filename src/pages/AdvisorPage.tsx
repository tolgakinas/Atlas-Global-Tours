import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  User,
  Shield,
  CreditCard,
  Percent,
  Calendar,
  Users,
  Printer,
  CheckCircle,
  FileText,
  Search,
  Sparkles,
  Phone,
  Mail,
  Building2,
  Lock,
  ArrowRight,
  LogOut,
  ChevronRight,
  Info,
  DollarSign,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useAuth, RegisteredAdvisor, ClientPassengerInfo, Booking } from '../context/AuthContext';
import { useTours } from '../context/ToursContext';
import { useCurrency } from '../context/CurrencyContext';
import { AdvisorClientVoucher } from '../components/AdvisorClientVoucher';
import { DepartureDropdown } from '../components/DepartureDropdown';
import { calculateDayTourPricing } from '../utils/dayTourPricing';
import { sendAdminBookingNotification } from '../utils/bookingNotifications';
import { resolveTourCode } from '../utils/bookingReference';

interface AdvisorPageProps {
  onNavigate: (path: string) => void;
  onSelectTour?: (slug: string) => void;
}

export const AdvisorPage: React.FC<AdvisorPageProps> = ({ onNavigate, onSelectTour }) => {
  const {
    currentAdvisor,
    registeredAdvisors,
    advisorLogin,
    advisorRegister,
    advisorLogout,
    bookings,
    createAdvisorBooking,
  } = useAuth();

  const { tours, bookDepartureSeats } = useTours();
  const { formatPrice, currency } = useCurrency();

  // Login & Registration state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('advisor@atlasglobaltours.com');
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAgency, setRegAgency] = useState('');
  const [regIata, setRegIata] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('United States');

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<'book' | 'bookings' | 'terms'>('book');

  // Booking Flow State
  const [selectedTourSlug, setSelectedTourSlug] = useState<string>(tours[0]?.slug || '');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [commissionRate, setCommissionRate] = useState<number>(20); // 0 to 20%
  const [commissionAgreed, setCommissionAgreed] = useState<boolean>(true);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Clients / Passenger Manifest (Array of length guestCount)
  const [clients, setClients] = useState<ClientPassengerInfo[]>([
    {
      id: 'pax-1',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'Female',
      dob: '1985-06-12',
      passportNumber: '',
      passportExpiry: '2031-10-15',
      passportCountry: 'United States',
      phone: '',
      email: '',
      dietaryRequirements: 'None',
      medicalConditions: 'None',
      emergencyContactName: '',
      emergencyContactPhone: '',
      roomPreference: 'Double',
    },
    {
      id: 'pax-2',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'Male',
      dob: '1982-03-24',
      passportNumber: '',
      passportExpiry: '2030-05-20',
      passportCountry: 'United States',
      phone: '',
      email: '',
      dietaryRequirements: 'None',
      medicalConditions: 'None',
      emergencyContactName: '',
      emergencyContactPhone: '',
      roomPreference: 'Double',
    },
  ]);

  // Agency Credit / Debit Card State
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('382');
  const [cardType, setCardType] = useState<'credit_card' | 'debit_card'>('credit_card');

  // Newly Created Booking for Voucher Modal
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [viewingVoucherBooking, setViewingVoucherBooking] = useState<Booking | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(false);

  // Sync clients array when guestCount changes
  const handleGuestCountChange = (newCount: number) => {
    setGuestCount(newCount);
    setClients((prev) => {
      const updated = [...prev];
      if (newCount > prev.length) {
        for (let i = prev.length; i < newCount; i++) {
          updated.push({
            id: `pax-${Date.now()}-${i + 1}`,
            firstName: '',
            middleName: '',
            lastName: '',
            gender: 'Female',
            dob: '1988-01-01',
            passportNumber: '',
            passportExpiry: '2030-01-01',
            passportCountry: currentAdvisor?.country || 'United States',
            phone: '',
            email: '',
            dietaryRequirements: 'None',
            medicalConditions: 'None',
            roomPreference: 'Twin',
          });
        }
      } else if (newCount < prev.length) {
        return updated.slice(0, newCount);
      }
      return updated;
    });
  };

  const selectedTour = useMemo(() => {
    return tours.find((t) => t.slug === selectedTourSlug) || tours[0];
  }, [tours, selectedTourSlug]);

  const availableDepartures = useMemo(() => {
    return selectedTour?.departuresList || [];
  }, [selectedTour]);

  // Set default date when tour changes
  React.useEffect(() => {
    if (availableDepartures.length > 0) {
      setSelectedDate(availableDepartures[0].start_date);
    } else {
      setSelectedDate('2026-10-25');
    }
  }, [availableDepartures]);

  // Financial calculations
  const isDayTour = selectedTour?.tour_type === 'day' || selectedTour?.days === 1;
  const pricePerPersonCents = selectedTour?.price_cents || 210000;
  const dayTourPricing = useMemo(() => {
    return isDayTour ? calculateDayTourPricing(pricePerPersonCents, guestCount) : null;
  }, [isDayTour, pricePerPersonCents, guestCount]);

  const singleSupplementPercent = selectedTour?.single_supplement_percent ?? 15;
  const singleSupplementAmountPerPersonCents =
    typeof selectedTour?.single_supplement_cents === 'number' && selectedTour.single_supplement_cents > 0
      ? selectedTour.single_supplement_cents
      : Math.round(pricePerPersonCents * (singleSupplementPercent / 100));
  const singlePaxCount = isDayTour ? 0 : clients.filter((c) => c.roomPreference === 'Single').length;
  const totalSingleSupplementCents = isDayTour ? 0 : singlePaxCount * singleSupplementAmountPerPersonCents;
  const grossTotalCents = isDayTour && dayTourPricing
    ? dayTourPricing.totalCents
    : pricePerPersonCents * guestCount + totalSingleSupplementCents;
  const commissionPercent = Math.min(20, Math.max(0, commissionRate));
  const commissionAmountCents = Math.round(grossTotalCents * (commissionPercent / 100));
  const netOperatorPayableCents = grossTotalCents - commissionAmountCents;

  // Filter bookings created by current advisor
  const advisorBookings = useMemo(() => {
    if (!currentAdvisor) return [];
    return bookings.filter(
      (b) =>
        b.isAdvisorBooking &&
        (b.advisorDetails?.advisorEmail.toLowerCase() === currentAdvisor.email.toLowerCase() ||
          b.advisorDetails?.advisorId === currentAdvisor.id)
    );
  }, [bookings, currentAdvisor]);

  // Overall Advisor Statistics
  const advisorStats = useMemo(() => {
    const totalBookings = advisorBookings.length;
    const grossVolume = advisorBookings.reduce((sum, b) => sum + b.totalPriceCents, 0);
    const earnedCommission = advisorBookings.reduce(
      (sum, b) => sum + (b.advisorDetails?.commissionAmountCents || 0),
      0
    );
    const paxCount = advisorBookings.reduce((sum, b) => sum + b.guests, 0);

    return { totalBookings, grossVolume, earnedCommission, paxCount };
  }, [advisorBookings]);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const advisor = advisorLogin(loginEmail);
    if (!advisor) {
      setLoginError(
        'Email not found in registered advisor roster. Please check spelling or register your agency below.'
      );
    } else {
      setCardholderName(`${advisor.name} (${advisor.agencyName})`);
    }
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regAgency) return;

    const newAdvisor = advisorRegister({
      name: regName,
      email: regEmail,
      agencyName: regAgency,
      iataClia: regIata || 'IATA-APPLIED',
      phone: regPhone,
      country: regCountry,
      defaultCommissionRate: 20,
    });

    setCardholderName(`${newAdvisor.name} (${newAdvisor.agencyName})`);
  };

  // Handle Booking Submission
  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionAgreed) {
      return;
    }

    // Validate that passenger 1 has a name
    if (!clients[0]?.firstName || !clients[0]?.lastName) {
      return;
    }

    const departureDateStr = selectedDate || '2026-10-25';
    const cardLast4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';

    // Decrement live tour departure availability by number of passengers
    const seatUpdate = bookDepartureSeats(selectedTour.id, departureDateStr, guestCount);

    const tourCode = resolveTourCode(selectedTour);
    const newBooking = createAdvisorBooking({
      tourCode,
      tourId: selectedTour.id,
      tourSlug: selectedTour.slug,
      tourTitle: selectedTour.title,
      tourImage: selectedTour.hero_image,
      departureDate: departureDateStr,
      guests: guestCount,
      totalPriceCents: grossTotalCents,
      currency: selectedTour.currency || 'USD',
      commissionRatePercent: commissionPercent,
      clients,
      paymentMethod: cardType,
      cardLast4,
      cardholderName: cardholderName || currentAdvisor?.name || 'Authorized Advisor',
      specialRequests,
    });

    // Notify admin email (bookings@atlasglobaltours.com)
    void sendAdminBookingNotification({
      reference: newBooking.reference,
      tourCode,
      tourTitle: selectedTour.title,
      tourSlug: selectedTour.slug,
      departureDate: departureDateStr,
      guests: guestCount,
      remainingSeats: seatUpdate?.remainingSeats,
      capacity: seatUpdate?.capacity,
      totalPriceFormatted: formatPrice(grossTotalCents, selectedTour.currency || 'USD'),
      currency: selectedTour.currency || 'USD',
      leadName: `${clients[0].firstName} ${clients[0].lastName}`.trim(),
      leadEmail: clients[0].email || currentAdvisor?.email || 'bookings@atlasglobaltours.com',
      leadPhone: clients[0].phone || currentAdvisor?.phone || '',
      paymentMethod: cardType === 'debit_card' ? 'Debit Card' : 'Credit Card',
      specialRequests,
      isAdvisorBooking: true,
      advisorName: currentAdvisor?.name || cardholderName,
      agencyName: currentAdvisor?.agencyName,
      commissionRatePercent: commissionPercent,
    });

    setCreatedBooking(newBooking);
    setViewingVoucherBooking(newBooking);
    setBookingSuccessMsg(true);
  };

  // =========================================================================
  // VIEW 1: AUTHENTICATION (AUTHORIZED OR REGISTERED ADVISOR LOGIN)
  // =========================================================================
  if (!currentAdvisor) {
    return (
      <div className="min-h-screen py-16 lg:py-24 bg-paper/60">
        <div className="container-page max-w-2xl">
          {/* Header */}
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary mb-2 shadow-xs border border-primary/20">
              <Briefcase className="size-7" />
            </div>
            <span className="eyebrow text-primary">B2B Trade Portal</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Travel Consultant & Advisor Panel
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Direct access for authorized travel advisors and retail consultants. Earn up to 20% flexible commission, customize client pricing, and generate white-label price-free traveler vouchers.
            </p>
          </div>

          {/* Login / Register Card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
            {/* Tab switch */}
            <div className="flex border-b border-border pb-4 mb-6 gap-3">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                }}
                className={`text-sm font-bold pb-2 transition-colors cursor-pointer border-b-2 ${
                  authMode === 'login'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Advisor Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setLoginError('');
                }}
                className={`text-sm font-bold pb-2 transition-colors cursor-pointer border-b-2 ${
                  authMode === 'register'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Register New Agency / Advisor
              </button>
            </div>

            {authMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                    Authorized Consultant Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. advisor@atlasglobaltours.com"
                      className="w-full rounded-lg border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Enter the authorized email address registered with your IATA/CLIA travel agency.
                  </p>
                </div>

                {loginError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Pre-Registered Quick Demo Credentials */}
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-2">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground block">
                    Quick Sign-In with Registered Partner Accounts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {registeredAdvisors.slice(0, 3).map((adv) => (
                      <button
                        key={adv.id}
                        type="button"
                        onClick={() => {
                          setLoginEmail(adv.email);
                          advisorLogin(adv.email);
                        }}
                        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer text-left"
                      >
                        <span className="font-bold block">{adv.name}</span>
                        <span className="text-[0.65rem] text-muted-foreground">{adv.agencyName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Lock className="size-4" />
                  <span>Access Advisor Panel</span>
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Consultant Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Advisor Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. sarah@luxetravel.com"
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Travel Agency / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regAgency}
                      onChange={(e) => setRegAgency(e.target.value)}
                      placeholder="e.g. Virtuoso Member Agency"
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      IATA / CLIA / ARC / True ID
                    </label>
                    <input
                      type="text"
                      value={regIata}
                      onChange={(e) => setRegIata(e.target.value)}
                      placeholder="e.g. IATA-0928419"
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. +1 (212) 849-2041"
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Operating Country
                    </label>
                    <select
                      value={regCountry}
                      onChange={(e) => setRegCountry(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other International</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs text-primary leading-relaxed">
                  ✓ Instant activation: Registered consultants receive up to <strong>20% flexible commission</strong>, direct operator rate access, and white-label voucher issuance.
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Briefcase className="size-4" />
                  <span>Register & Open Advisor Panel</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOGGED-IN TRAVEL ADVISOR DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen py-10 lg:py-14 bg-background">
      <div className="container-page space-y-8">
        {/* Top Profile Banner */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Building2 className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                  Verified Travel Advisor
                </span>
                {currentAdvisor.iataClia && (
                  <span className="text-[0.65rem] font-mono text-muted-foreground">
                    {currentAdvisor.iataClia}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-1">
                {currentAdvisor.agencyName}
              </h1>
              <p className="text-xs text-muted-foreground">
                Consultant: <strong className="text-foreground">{currentAdvisor.name}</strong> · {currentAdvisor.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => advisorLogout()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground block">
              Client Bookings
            </span>
            <span className="text-2xl font-display font-bold text-foreground mt-1 block">
              {advisorStats.totalBookings}
            </span>
            <span className="text-[0.7rem] text-muted-foreground">
              {advisorStats.paxCount} travelers hosted
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground block">
              Gross Client Volume
            </span>
            <span className="text-2xl font-display font-bold text-foreground mt-1 block">
              {formatPrice(advisorStats.grossVolume)}
            </span>
            <span className="text-[0.7rem] text-muted-foreground">Retail booking value</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs bg-primary/5 border-primary/20">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-primary block">
              Commissions Earned
            </span>
            <span className="text-2xl font-display font-bold text-primary mt-1 block">
              {formatPrice(advisorStats.earnedCommission)}
            </span>
            <span className="text-[0.7rem] text-muted-foreground">Retained by agency</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground block">
              Standard B2B Tier
            </span>
            <span className="text-2xl font-display font-bold text-foreground mt-1 block">
              20% Max
            </span>
            <span className="text-[0.7rem] text-muted-foreground">0% – 20% adjustable</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab('book')}
            className={`pb-3 text-sm font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'book'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Compass className="size-4" />
            <span>Book for Clients & Set Commission</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-sm font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="size-4" />
            <span>My Bookings & Price-Free Vouchers ({advisorBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 text-sm font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Percent className="size-4" />
            <span>Commission Rules & Payout</span>
          </button>
        </div>

        {/* Success Alert if booking created */}
        {bookingSuccessMsg && createdBooking && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-6 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-emerald-900 dark:text-emerald-200 text-sm block">
                  Booking Confirmed! Ref: {createdBooking.reference}
                </strong>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Payment processed via agency card. Client voucher generated without any financial amounts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewingVoucherBooking(createdBooking)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              <Printer className="size-3.5" />
              <span>View & Print Client Voucher</span>
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 1: BOOK FOR CLIENTS (WITH COMMISSION ADJUSTER & CLIENT SPECS) */}
        {/* ================================================================= */}
        {activeTab === 'book' && (
          <form onSubmit={handleBookSubmit} className="space-y-8">
            {/* Step 1: Tour & Departure Selection */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Select Tour Expedition & Departure Date
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                    Tour Itinerary
                  </label>
                  <select
                    value={selectedTourSlug}
                    onChange={(e) => setSelectedTourSlug(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {tours
                      .filter((t) => t.is_published)
                      .map((t) => (
                        <option key={t.id} value={t.slug}>
                          {t.title} ({t.days} Days · {t.continent || 'Europe'})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                    Number of Guests
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => handleGuestCountChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} Guest{num !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                {availableDepartures.length > 0 ? (
                  <DepartureDropdown
                    departures={availableDepartures}
                    selectedDepartureId={
                      availableDepartures.find((d) => d.start_date === selectedDate)?.id ||
                      availableDepartures[0]?.id
                    }
                    onSelectDeparture={(depId) => {
                      const dep = availableDepartures.find((d) => d.id === depId);
                      if (dep) {
                        setSelectedDate(dep.start_date);
                      }
                    }}
                    currency={selectedTour?.currency}
                    label="Select Departure Date"
                    departureSchedule={selectedTour?.departure_days}
                  />
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                      Select Departure Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm font-mono text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: COMMISSION ADJUSTMENT SLIDER (0% – 20%) */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </span>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Advisor Commission Rate (0% – 20% Flexible Slider)
                  </h2>
                </div>
                <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-sm font-bold">
                  {commissionPercent}% Commission
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As an authorized travel consultant, you earn up to <strong>20% standard commission</strong>. You may adjust your retained rate between 0% and 20% to pass savings to preferred clients or retain full earnings.
                </p>

                {/* Slider Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>0% (Net Only)</span>
                    <span className="text-primary font-mono text-base font-extrabold">{commissionPercent}%</span>
                    <span>20% (Full B2B Partner Rate)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full h-2.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {[0, 5, 10, 12, 15, 18, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCommissionRate(preset)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                          commissionRate === preset
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-Time Transparent Pricing Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border bg-card p-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[0.7rem] uppercase font-bold">
                      Gross Retail Price
                    </span>
                    <span className="font-display text-xl font-bold text-foreground mt-0.5 block">
                      {formatPrice(grossTotalCents)}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      {isDayTour && dayTourPricing
                        ? `${guestCount} pax · ${dayTourPricing.tier.label} (${formatPrice(dayTourPricing.effectivePricePerPersonCents)}/pax, No Rooming)`
                        : `${guestCount} pax @ ${formatPrice(pricePerPersonCents)}`}
                    </span>
                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-border sm:pl-4 pt-2 sm:pt-0">
                    <span className="text-primary block text-[0.7rem] uppercase font-bold">
                      Your Advisor Commission ({commissionPercent}%)
                    </span>
                    <span className="font-display text-xl font-bold text-primary mt-0.5 block">
                      {formatPrice(commissionAmountCents)}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      Retained / earned by {currentAdvisor.agencyName}
                    </span>
                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-border sm:pl-4 pt-2 sm:pt-0">
                    <span className="text-muted-foreground block text-[0.7rem] uppercase font-bold">
                      Net Operator Amount to Pay
                    </span>
                    <span className="font-display text-xl font-bold text-foreground mt-0.5 block">
                      {formatPrice(netOperatorPayableCents)}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      Charged to agency card today
                    </span>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-start gap-2 text-xs text-foreground cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    required
                    checked={commissionAgreed}
                    onChange={(e) => setCommissionAgreed(e.target.checked)}
                    className="rounded border-input text-primary mt-0.5 size-4"
                  />
                  <span>
                    I confirm and agree with the commission rate of <strong>{commissionPercent}%</strong> ({formatPrice(commissionAmountCents)} retained). The operator net remittance of <strong>{formatPrice(netOperatorPayableCents)}</strong> will be charged to the agency payment method below.
                  </span>
                </label>
              </div>
            </div>

            {/* Step 3: CLIENT PASSENGER INFORMATION ENTRY */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Client & Traveler Manifest ({guestCount} Passenger{guestCount !== 1 ? 's' : ''})
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  Required for permits, room allocations & flight vouchers
                </span>
              </div>

              {clients.map((client, idx) => (
                <div
                  key={client.id || idx}
                  className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                      <User className="size-4 text-primary" />
                      Passenger {idx + 1} {idx === 0 ? '(Lead Client)' : ''}
                    </span>
                    <span className="text-[0.65rem] uppercase font-bold text-muted-foreground">
                      Passenger #{idx + 1}
                    </span>
                  </div>

                  {/* Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={client.firstName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, firstName: val } : c))
                          );
                        }}
                        placeholder="e.g. Alistair"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={client.middleName || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, middleName: val } : c))
                          );
                        }}
                        placeholder="e.g. James"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={client.lastName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, lastName: val } : c))
                          );
                        }}
                        placeholder="e.g. Harrington"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* DOB, Gender & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Date of Birth (DOB) *
                      </label>
                      <input
                        type="date"
                        required
                        value={client.dob}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, dob: val } : c))
                          );
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Gender *
                      </label>
                      <select
                        value={client.gender}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, gender: val } : c))
                          );
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Non-binary / Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Client Phone Number
                      </label>
                      <input
                        type="tel"
                        value={client.phone || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, phone: val } : c))
                          );
                        }}
                        placeholder="+1 555-0199"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Client Email Address
                      </label>
                      <input
                        type="email"
                        value={client.email || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, email: val } : c))
                          );
                        }}
                        placeholder="client@email.com"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>
                  </div>

                  {/* Passport Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Passport Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={client.passportNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, passportNumber: val } : c))
                          );
                        }}
                        placeholder="e.g. US94820194"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Passport Expiry Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={client.passportExpiry}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, passportExpiry: val } : c))
                          );
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Issuing Country / Nationality
                      </label>
                      <input
                        type="text"
                        value={client.passportCountry}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, passportCountry: val } : c))
                          );
                        }}
                        placeholder="e.g. United States"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>
                  </div>

                  {/* Food & Dietary Requirements + Medical Requirements */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Food & Dietary Requirements *
                      </label>
                      <input
                        type="text"
                        value={client.dietaryRequirements}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, dietaryRequirements: val } : c))
                          );
                        }}
                        placeholder="e.g. Strict Vegetarian, Gluten-Free, Halal, Nut Allergy"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        Medical & Health Notes *
                      </label>
                      <input
                        type="text"
                        value={client.medicalConditions}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, medicalConditions: val } : c))
                          );
                        }}
                        placeholder="e.g. Mild asthma (inhaler), knee mobility, none"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.7rem] uppercase font-bold text-muted-foreground mb-1">
                        {isDayTour ? 'Excursion Type' : 'Bedding / Room Preference'}
                      </label>
                      {isDayTour ? (
                        <div className="p-2 rounded border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                          Day Excursion · No rooming required
                        </div>
                      ) : (
                        <select
                          value={client.roomPreference || 'Double'}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setClients((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, roomPreference: val } : c))
                            );
                          }}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                        >
                          <option value="Double">Double Room (Couples - 1 Bed)</option>
                          <option value="Twin">Twin Share (Friends / Companions - 2 Beds)</option>
                          <option value="Single">Single Room (Solo - +{singleSupplementPercent}% Supplement)</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 4: AGENCY PAYMENT WITH OWN CREDIT/DEBIT CARD */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    4
                  </span>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Agency Card Payment (Net Remittance: {formatPrice(netOperatorPayableCents)})
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CreditCard className="size-4 text-primary" />
                  <span className="font-semibold text-muted-foreground">PCI Compliant B2B Gateway</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Agency Cardholder Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (Virtuoso Travel LLC)"
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Card Type
                  </label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground"
                  >
                    <option value="credit_card">Agency Credit Card</option>
                    <option value="debit_card">Agency Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm font-mono text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Expiry Date (MM/YY) *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm font-mono text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Security Code (CVC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="3-digit CVC"
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Total Amount Being Charged to Agency Card:
                  </span>
                  <span className="font-display text-2xl font-bold text-foreground">
                    {formatPrice(netOperatorPayableCents)}
                  </span>
                  <span className="text-[0.7rem] text-primary block mt-0.5 font-medium">
                    (Gross {formatPrice(grossTotalCents)} minus {commissionPercent}% Retained Commission: {formatPrice(commissionAmountCents)})
                  </span>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 self-start sm:self-auto"
                >
                  <CheckCircle className="size-4" />
                  <span>Authorize Payment & Generate Price-Free Voucher</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MY ADVISOR BOOKINGS & WHITE-LABEL PRICE-FREE VOUCHERS     */}
        {/* ================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-foreground">
                Agency Client Manifest & Price-Free Vouchers
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                All trips booked through your travel advisor account. Generate, view, and print white-label expedition vouchers without prices on them for your clients.
              </p>
            </div>

            {advisorBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
                <FileText className="size-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-display text-base font-bold text-foreground">No bookings recorded yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Create your first client booking above to take advantage of up to 20% commission and download official traveler vouchers.
                </p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Create New Client Booking
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {advisorBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-primary text-sm">
                          {b.reference}
                        </span>
                        <span className="font-mono text-[0.68rem] font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          {b.tourCode || resolveTourCode(b)}
                        </span>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                          Confirmed & Paid
                        </span>
                        <span className="text-[0.7rem] text-muted-foreground">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-foreground">
                        {b.tourTitle}
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted-foreground">
                        <div>
                          <span className="block text-[0.68rem] uppercase font-bold text-muted-foreground/80">Lead Client</span>
                          <span className="font-semibold text-foreground">{b.leadName}</span>
                        </div>
                        <div>
                          <span className="block text-[0.68rem] uppercase font-bold text-muted-foreground/80">Departure</span>
                          <span className="font-semibold font-mono text-foreground">{b.departureDate}</span>
                        </div>
                        <div>
                          <span className="block text-[0.68rem] uppercase font-bold text-muted-foreground/80">Commission Retained</span>
                          <span className="font-semibold text-primary font-mono">
                            {b.advisorDetails?.commissionRatePercent || 20}% ({formatPrice(b.advisorDetails?.commissionAmountCents || 0)})
                          </span>
                        </div>
                        <div>
                          <span className="block text-[0.68rem] uppercase font-bold text-muted-foreground/80">Finance Status</span>
                          <span className={b.advisorDetails?.financeNotified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-medium'}>
                            {b.advisorDetails?.financeNotified ? '✓ Finance Audited' : 'Pending Operations Audit'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                      <button
                        onClick={() => setViewingVoucherBooking(b)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                      >
                        <Printer className="size-3.5" />
                        <span>View Client Voucher (No Prices)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: COMMISSION POLICIES & B2B RULES                            */}
        {/* ================================================================= */}
        {activeTab === 'terms' && (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="eyebrow text-primary">Official Terms of Representation</span>
              <h2 className="font-display text-2xl font-bold text-foreground mt-1">
                Travel Consultant Commission Structure
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground leading-relaxed">
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-2">
                <strong className="text-foreground text-sm block">1. Commission Scale (0% – 20%)</strong>
                <p>
                  Travel consultants are entitled to up to 20% standard trade commission across all multi-day and day tour journeys.
                </p>
                <p>
                  You hold full discretion to dial down commission (e.g. 10%, 5%, or 0% net) when creating quotes for VIP travelers or corporate incentives.
                </p>
              </div>

              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-2">
                <strong className="text-foreground text-sm block">2. White-Label Price-Free Vouchers</strong>
                <p>
                  Client vouchers generated through this portal strictly omit wholesale costs, net amounts, and advisor commissions.
                </p>
                <p>
                  You can print or download the PDF voucher directly to hand over to clients with your own agency retail markup.
                </p>
              </div>

              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-2">
                <strong className="text-foreground text-sm block">3. Finance Auditing & Direct Remittance</strong>
                <p>
                  When you settle net operator amounts via agency credit or debit card, the Operations and Admin desks automatically audit the dispatch notice.
                </p>
                <p>
                  The finance department is formally notified with transaction receipts and client manifest verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRICE-FREE CLIENT VOUCHER MODAL */}
        {viewingVoucherBooking && (
          <AdvisorClientVoucher
            booking={viewingVoucherBooking}
            onClose={() => setViewingVoucherBooking(null)}
          />
        )}
      </div>
    </div>
  );
};
