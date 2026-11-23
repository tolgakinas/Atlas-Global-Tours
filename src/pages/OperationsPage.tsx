import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  Compass,
  MessageSquare,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  FileText,
  Shield,
  Truck,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  ArrowRight,
  TrendingUp,
  MapPin,
  Check,
  Briefcase,
  Building2,
  Bell,
  Send,
  DollarSign,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth, Booking, Departure, Inquiry, Guide } from '../context/AuthContext';
import { useTours } from '../context/ToursContext';
import { useCurrency } from '../context/CurrencyContext';
import { AdvisorClientVoucher } from '../components/AdvisorClientVoucher';
import { calculateDayTourPricing, DAY_TOUR_GROUP_TIERS } from '../utils/dayTourPricing';
import { resolveTourCode } from '../utils/bookingReference';

interface OperationsPageProps {
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({ onNavigate, onSelectTour }) => {
  const {
    departures,
    addDeparture,
    updateDeparture,
    deleteDeparture,
    bookings,
    updateBooking,
    cancelBooking,
    addBooking,
    inquiries,
    updateInquiry,
    deleteInquiry,
    addInquiry,
    guides,
    addGuide,
    updateGuide,
    notifyFinanceForBooking,
  } = useAuth();
  const { tours } = useTours();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<'departures' | 'bookings' | 'inquiries' | 'guides'>('departures');

  // Search & Filters
  const [depSearch, setDepSearch] = useState('');
  const [depStatusFilter, setDepStatusFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [bookingChannelFilter, setBookingChannelFilter] = useState<'All' | 'advisor' | 'direct'>('All');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('All');

  // Modals
  const [selectedManifestDep, setSelectedManifestDep] = useState<Departure | null>(null);
  const [showAddDepModal, setShowAddDepModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showAddInquiryModal, setShowAddInquiryModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [financeModalBooking, setFinanceModalBooking] = useState<Booking | null>(null);
  const [financeNotes, setFinanceNotes] = useState('');
  const [manifestModalBooking, setManifestModalBooking] = useState<Booking | null>(null);
  const [voucherModalBooking, setVoucherModalBooking] = useState<Booking | null>(null);
  const [financeToast, setFinanceToast] = useState('');

  // Form states for Add Departure
  const [newDepTourId, setNewDepTourId] = useState(tours[0]?.id || '');
  const [newDepStartDate, setNewDepStartDate] = useState('');
  const [newDepEndDate, setNewDepEndDate] = useState('');
  const [newDepCapacity, setNewDepCapacity] = useState(12);
  const [newDepPrice, setNewDepPrice] = useState(1800);
  const [newDepStatus, setNewDepStatus] = useState<Departure['status']>('guaranteed');
  const [newDepGuide, setNewDepGuide] = useState('Serkan Yılmaz');
  const [newDepVehicle, setNewDepVehicle] = useState('Mercedes Sprinter VIP');
  const [newDepNotes, setNewDepNotes] = useState('');

  // Form states for Add Manual Booking
  const [newBkTourSlug, setNewBkTourSlug] = useState(tours[0]?.slug || '');
  const [newBkDate, setNewBkDate] = useState('');
  const [newBkGuests, setNewBkGuests] = useState(2);
  const [newBkName, setNewBkName] = useState('');
  const [newBkEmail, setNewBkEmail] = useState('');
  const [newBkPhone, setNewBkPhone] = useState('');
  const [newBkDietary, setNewBkDietary] = useState('');
  const [newBkSpecial, setNewBkSpecial] = useState('');

  // Form states for Add Inquiry
  const [newInqName, setNewInqName] = useState('');
  const [newInqEmail, setNewInqEmail] = useState('');
  const [newInqPhone, setNewInqPhone] = useState('');
  const [newInqDest, setNewInqDest] = useState('Worldwide Expeditions');
  const [newInqMsg, setNewInqMsg] = useState('');

  // Filtered Departures
  const filteredDepartures = useMemo(() => {
    const q = depSearch.toLowerCase();
    return departures.filter((d) => {
      const code = (d.tourCode || resolveTourCode(d)).toLowerCase();
      const matchSearch =
        d.tourTitle.toLowerCase().includes(q) ||
        code.includes(q) ||
        d.startDate.includes(depSearch) ||
        (d.assignedGuide && d.assignedGuide.toLowerCase().includes(q));
      const matchStatus = depStatusFilter === 'All' || d.status === depStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [departures, depSearch, depStatusFilter]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    const q = bookingSearch.toLowerCase();
    return bookings.filter((b) => {
      const code = (b.tourCode || resolveTourCode(b)).toLowerCase();
      const matchSearch =
        b.reference.toLowerCase().includes(q) ||
        code.includes(q) ||
        b.leadName.toLowerCase().includes(q) ||
        b.leadEmail.toLowerCase().includes(q) ||
        b.tourTitle.toLowerCase().includes(q) ||
        (b.advisorDetails?.agencyName && b.advisorDetails.agencyName.toLowerCase().includes(q)) ||
        (b.advisorDetails?.advisorName && b.advisorDetails.advisorName.toLowerCase().includes(q));
      const matchStatus = bookingStatusFilter === 'All' || b.status === bookingStatusFilter;
      const matchChannel =
        bookingChannelFilter === 'All' ||
        (bookingChannelFilter === 'advisor' && b.isAdvisorBooking) ||
        (bookingChannelFilter === 'direct' && !b.isAdvisorBooking);
      return matchSearch && matchStatus && matchChannel;
    });
  }, [bookings, bookingSearch, bookingStatusFilter, bookingChannelFilter]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchSearch =
        i.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        i.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        (i.destination && i.destination.toLowerCase().includes(inquirySearch.toLowerCase())) ||
        i.message.toLowerCase().includes(inquirySearch.toLowerCase());
      const matchStatus = inquiryStatusFilter === 'All' || i.status === inquiryStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [inquiries, inquirySearch, inquiryStatusFilter]);

  // KPIs
  const guaranteedCount = departures.filter((d) => d.status === 'guaranteed').length;
  const totalBookedTravelers = departures.reduce((sum, d) => sum + d.bookedSeats, 0);
  const openInquiriesCount = inquiries.filter((i) => i.status === 'new' || i.status === 'contacted').length;

  const handleCreateDeparture = (e: React.FormEvent) => {
    e.preventDefault();
    const tour = tours.find((t) => t.id === newDepTourId) || tours[0];
    const newDep: Departure = {
      id: 'dep-' + Math.random().toString(36).substring(2, 9),
      tourCode: resolveTourCode(tour),
      tourId: tour.id,
      tourTitle: tour.title,
      tourSlug: tour.slug,
      startDate: newDepStartDate,
      endDate: newDepEndDate,
      capacity: newDepCapacity,
      bookedSeats: 0,
      priceCents: newDepPrice * 100,
      depositCents: Math.round(newDepPrice * 0.2) * 100,
      status: newDepStatus,
      assignedGuide: newDepGuide || null,
      driverVehicle: newDepVehicle || null,
      notes: newDepNotes,
    };
    addDeparture(newDep);
    setShowAddDepModal(false);
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const tour = tours.find((t) => t.slug === newBkTourSlug) || tours[0];
    const isDayTour = tour.tour_type === 'day' || tour.days === 1;
    const priceCents = isDayTour
      ? calculateDayTourPricing(tour.price_cents, newBkGuests).totalCents
      : tour.price_cents * newBkGuests;

    addBooking({
      tourCode: resolveTourCode(tour),
      tourId: tour.id,
      tourSlug: tour.slug,
      tourTitle: tour.title,
      tourImage: tour.hero_image,
      departureDate: newBkDate,
      guests: newBkGuests,
      totalPriceCents: priceCents,
      currency: tour.currency,
      leadName: newBkName,
      leadEmail: newBkEmail,
      leadPhone: newBkPhone,
      dietaryNotes: newBkDietary,
      specialRequests: isDayTour
        ? (newBkSpecial ? `[Day Excursion · No Lodging] ${newBkSpecial}` : '[Day Excursion · No Lodging]')
        : newBkSpecial,
    });

    setShowAddBookingModal(false);
    // Reset
    setNewBkName('');
    setNewBkEmail('');
    setNewBkPhone('');
    setNewBkDietary('');
    setNewBkSpecial('');
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    addInquiry({
      name: newInqName,
      email: newInqEmail,
      phone: newInqPhone,
      destination: newInqDest,
      message: newInqMsg,
    });
    setShowAddInquiryModal(false);
    setNewInqName('');
    setNewInqEmail('');
    setNewInqPhone('');
    setNewInqMsg('');
  };

  // Travelers booked on selected manifest departure
  const manifestTravelers = useMemo(() => {
    if (!selectedManifestDep) return [];
    return bookings.filter(
      (b) =>
        b.tourSlug === selectedManifestDep.tourSlug &&
        b.departureDate === selectedManifestDep.startDate &&
        b.status === 'confirmed'
    );
  }, [selectedManifestDep, bookings]);

  return (
    <div className="min-h-screen py-10 lg:py-14 bg-background">
      <div className="container-page">
        {/* Operations Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Compass className="size-5" />
              <span className="eyebrow">Atlas Dispatch & Operations Center</span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
              Operations Control Panel
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Follow scheduled departures, live bookings, traveler manifests, guide allocations, and incoming custom requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/admin')}
              className="rounded-md border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="size-3.5 text-primary" />
              Admin CMS
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Live Website
            </button>
          </div>
        </div>

        {/* 4 Operations KPI Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Total Departures</span>
              <Calendar className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {departures.length}
              </span>
              <span className="text-xs text-success font-semibold">
                {guaranteedCount} Guaranteed
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Travelers In Field</span>
              <Users className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {totalBookedTravelers}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">Across departures</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Confirmed Bookings</span>
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {bookings.filter((b) => b.status === 'confirmed').length}
              </span>
              <span className="text-xs text-primary font-semibold">
                {bookings.length} Total
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Open Inquiries</span>
              <MessageSquare className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {openInquiriesCount}
              </span>
              <span className="text-xs text-warning font-semibold">Action Required</span>
            </div>
          </div>
        </div>

        {/* Operations Navigation Tabs */}
        <div className="mt-8 flex border-b border-border overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('departures')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'departures'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="size-4" />
            Departures Schedule ({departures.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'bookings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="size-4" />
            Bookings Tracker ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'inquiries'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="size-4" />
            Inquiries & Quotes ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'guides'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="size-4" />
            Guides & Dispatch ({guides.length})
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: DEPARTURES SCHEDULE & TRACKER                           */}
        {/* ============================================================== */}
        {activeTab === 'departures' && (
          <div className="mt-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={depSearch}
                  onChange={(e) => setDepSearch(e.target.value)}
                  placeholder="Filter departures by tour, guide, or date..."
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <select
                  value={depStatusFilter}
                  onChange={(e) => setDepStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground"
                >
                  <option value="All">All Statuses</option>
                  <option value="guaranteed">Guaranteed</option>
                  <option value="filling_fast">Filling Fast</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => setShowAddDepModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  Add Departure
                </button>
              </div>
            </div>

            {/* Departures Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Tour Expedition</th>
                      <th className="px-4 py-3">Seats & Capacity</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Guide & Driver</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {filteredDepartures.map((dep) => {
                      const fillPct = Math.round((dep.bookedSeats / dep.capacity) * 100);

                      return (
                        <tr key={dep.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-foreground block">
                              {dep.startDate}
                            </span>
                            <span className="text-[0.65rem] text-muted-foreground">
                              until {dep.endDate}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[0.65rem] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded shrink-0">
                                {dep.tourCode || resolveTourCode(dep)}
                              </span>
                              <span
                                onClick={() => onSelectTour(dep.tourSlug)}
                                className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1"
                              >
                                {dep.tourTitle}
                              </span>
                            </div>
                            {dep.notes && (
                              <span className="text-[0.65rem] text-muted-foreground block line-clamp-1 mt-0.5">
                                {dep.notes}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 min-w-[140px]">
                            <div className="flex items-center justify-between text-[0.7rem] mb-1">
                              <span className="font-bold text-foreground">
                                {dep.bookedSeats} / {dep.capacity} seats
                              </span>
                              <span className="text-muted-foreground">{fillPct}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  fillPct >= 100
                                    ? 'bg-destructive'
                                    : fillPct >= 75
                                    ? 'bg-warning'
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(100, fillPct)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                                dep.status === 'guaranteed'
                                  ? 'bg-success-soft text-success border border-success-border'
                                  : dep.status === 'filling_fast'
                                  ? 'bg-warning-soft text-warning border border-warning-border'
                                  : dep.status === 'sold_out'
                                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {dep.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-[0.75rem]">
                            <span className="font-semibold text-foreground block">
                              {dep.assignedGuide || 'Unassigned'}
                            </span>
                            <span className="text-muted-foreground text-[0.65rem]">
                              {dep.driverVehicle || 'No vehicle'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Manifest Button */}
                              <button
                                onClick={() => setSelectedManifestDep(dep)}
                                className="inline-flex items-center gap-1 rounded bg-card border border-border px-2.5 py-1 text-[0.7rem] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="View Passenger Manifest"
                              >
                                <FileText className="size-3 text-primary" />
                                Manifest
                              </button>

                              {/* Toggle Status */}
                              <button
                                onClick={() => {
                                  const nextStatus: Record<Departure['status'], Departure['status']> = {
                                    confirmed: 'guaranteed',
                                    guaranteed: 'filling_fast',
                                    filling_fast: 'sold_out',
                                    sold_out: 'confirmed',
                                    cancelled: 'confirmed',
                                  };
                                  updateDeparture(dep.id, { status: nextStatus[dep.status] });
                                }}
                                className="rounded bg-muted px-2 py-1 text-[0.65rem] font-semibold hover:bg-muted/80 cursor-pointer"
                                title="Cycle Status"
                              >
                                Status
                              </button>

                              {/* Delete Departure */}
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete this departure date?')) {
                                    deleteDeparture(dep.id);
                                  }
                                }}
                                className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BOOKINGS TRACKER                                        */}
        {/* ============================================================== */}
        {activeTab === 'bookings' && (
          <div className="mt-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search by reference, traveler name, email, or tour..."
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={bookingChannelFilter}
                  onChange={(e) => setBookingChannelFilter(e.target.value as any)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground"
                >
                  <option value="All">All Channels</option>
                  <option value="advisor">Travel Advisor / B2B Only</option>
                  <option value="direct">Direct Consumer Only</option>
                </select>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground"
                >
                  <option value="All">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => setShowAddBookingModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  Manual Booking
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Reference & Channel</th>
                      <th className="px-4 py-3">Client & Agency</th>
                      <th className="px-4 py-3">Tour Expedition</th>
                      <th className="px-4 py-3">Departure Date</th>
                      <th className="px-4 py-3">Guests & Financials</th>
                      <th className="px-4 py-3">Payment & Finance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-primary block">
                            {b.reference}
                          </span>
                          <span className="inline-flex items-center rounded bg-muted text-foreground border border-border font-mono text-[0.62rem] font-bold px-1.5 py-0.2 my-0.5 mr-1">
                            {b.tourCode || resolveTourCode(b)}
                          </span>
                          {b.isAdvisorBooking && (
                            <span className="inline-flex items-center gap-1 rounded bg-primary/10 text-primary border border-primary/25 text-[0.6rem] font-bold px-1.5 py-0.2 my-0.5">
                              <Briefcase className="size-2.5" /> Travel Advisor
                            </span>
                          )}
                          <span className="text-[0.65rem] text-muted-foreground block">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground block">
                            {b.leadName}
                          </span>
                          {b.isAdvisorBooking ? (
                            <div className="mt-0.5 space-y-0.5">
                              <span className="text-[0.68rem] text-primary font-bold flex items-center gap-1">
                                <Building2 className="size-3" /> {b.advisorDetails?.agencyName}
                              </span>
                              <span className="text-[0.62rem] text-muted-foreground block">
                                Advisor: {b.advisorDetails?.advisorName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[0.65rem] text-muted-foreground block">
                              {b.leadEmail} · {b.leadPhone}
                            </span>
                          )}
                          {b.dietaryNotes && (
                            <span className="text-[0.65rem] text-primary font-medium block mt-0.5">
                              Dietary: {b.dietaryNotes}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground line-clamp-1">
                            {b.tourTitle}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-foreground">
                          {b.departureDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="block font-bold text-foreground">
                            {b.guests} pax
                          </span>
                          {(() => {
                            const isDay =
                              tours.find((t) => t.slug === b.tourSlug || t.id === b.tourId)?.tour_type === 'day' ||
                              b.tourTitle.toLowerCase().includes('day') ||
                              b.tourSlug.includes('day');
                            return isDay ? (
                              <span className="inline-block text-[0.62rem] font-bold text-emerald-700 dark:text-emerald-400">
                                Day Excursion (No Rooming)
                              </span>
                            ) : null;
                          })()}
                          <span className="text-[0.65rem] text-muted-foreground block">
                            Gross: {formatPrice(b.totalPriceCents, b.currency)}
                          </span>
                          {b.isAdvisorBooking && (
                            <div className="text-[0.62rem]">
                              <span className="text-primary font-bold block">
                                {b.advisorDetails?.commissionRatePercent}% Comm: {formatPrice(b.advisorDetails?.commissionAmountCents || 0, b.currency)}
                              </span>
                              <span className="text-muted-foreground font-mono block">
                                Net Paid: {formatPrice(b.advisorDetails?.netOperatorAmountCents || 0, b.currency)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider block text-center ${
                              b.paymentStatus === 'paid'
                                ? 'bg-success-soft text-success'
                                : 'bg-warning-soft text-warning'
                            }`}
                          >
                            {b.paymentStatus.replace('_', ' ')}
                          </span>

                          {/* Advisor Finance Notification Status */}
                          {b.isAdvisorBooking && (
                            <div className="mt-1">
                              {b.advisorDetails?.financeNotified ? (
                                <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[0.6rem] font-bold flex items-center justify-center gap-1 border border-emerald-300">
                                  <Check className="size-2.5" /> Finance Notified
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setFinanceModalBooking(b);
                                    setFinanceNotes('');
                                  }}
                                  className="w-full rounded bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 text-[0.6rem] font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1 animate-pulse"
                                  title="Dispatch notification to finance department"
                                >
                                  <Bell className="size-2.5" /> Notify Finance
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                              b.status === 'confirmed'
                                ? 'bg-success-soft text-success border border-success-border'
                                : 'bg-destructive/10 text-destructive border border-destructive/20'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Advisor Special Actions */}
                            {b.isAdvisorBooking && (
                              <>
                                <button
                                  onClick={() => setManifestModalBooking(b)}
                                  className="rounded bg-primary/10 text-primary px-2 py-1 text-[0.65rem] font-semibold hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-1"
                                  title="View Passenger Manifest (Passports, DOBs, Medical)"
                                >
                                  <Users className="size-3" />
                                  <span>Manifest</span>
                                </button>

                                <button
                                  onClick={() => setVoucherModalBooking(b)}
                                  className="rounded bg-zinc-800 text-white px-2 py-1 text-[0.65rem] font-semibold hover:bg-zinc-700 cursor-pointer flex items-center gap-1"
                                  title="View Official Price-Free Client Voucher"
                                >
                                  <Printer className="size-3" />
                                  <span>Voucher</span>
                                </button>

                                {!b.advisorDetails?.financeNotified && (
                                  <button
                                    onClick={() => {
                                      setFinanceModalBooking(b);
                                      setFinanceNotes('');
                                    }}
                                    className="p-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                                    title="Notify Finance Department"
                                  >
                                    <Bell className="size-3 text-amber-700" />
                                  </button>
                                )}
                              </>
                            )}

                            {/* Toggle Confirm / Cancel */}
                            <button
                              onClick={() => {
                                const newStatus = b.status === 'confirmed' ? 'cancelled' : 'confirmed';
                                updateBooking(b.reference, { status: newStatus });
                              }}
                              className="rounded bg-muted px-2 py-1 text-[0.65rem] font-semibold hover:bg-muted/80 cursor-pointer"
                            >
                              {b.status === 'confirmed' ? 'Cancel' : 'Confirm'}
                            </button>

                            {/* Mark Paid */}
                            <button
                              onClick={() => {
                                const newPay = b.paymentStatus === 'paid' ? 'deposit_paid' : 'paid';
                                updateBooking(b.reference, { paymentStatus: newPay });
                              }}
                              className="rounded bg-muted px-2 py-1 text-[0.65rem] font-semibold hover:bg-muted/80 cursor-pointer"
                            >
                              Toggle Paid
                            </button>

                            {/* Edit Notes */}
                            <button
                              onClick={() => setEditingBooking(b)}
                              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INQUIRIES & CUSTOM REQUESTS PIPELINE                   */}
        {/* ============================================================== */}
        {activeTab === 'inquiries' && (
          <div className="mt-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  placeholder="Filter inquiries by name, email, destination..."
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground"
                >
                  <option value="All">All Inquiries</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="booked">Booked</option>
                  <option value="archived">Archived</option>
                </select>

                <button
                  onClick={() => setShowAddInquiryModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  New Request
                </button>
              </div>
            </div>

            {/* Inquiries Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                          inq.status === 'new'
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : inq.status === 'quoted'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : inq.status === 'booked'
                            ? 'bg-success-soft text-success border border-success-border'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {inq.status}
                      </span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-foreground">
                      {inq.name}
                    </h3>
                    <div className="text-xs text-muted-foreground mb-2">
                      <span>{inq.email}</span> · <span>{inq.phone || 'No phone'}</span>
                    </div>

                    {inq.destination && (
                      <div className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1">
                        <MapPin className="size-3" />
                        <span>{inq.destination} {inq.travelDate ? `(${inq.travelDate})` : ''}</span>
                      </div>
                    )}

                    <p className="text-xs text-foreground/85 bg-muted/40 p-3 rounded-lg border border-border/60 leading-relaxed">
                      "{inq.message}"
                    </p>

                    {inq.internalNotes && (
                      <div className="mt-2 text-[0.7rem] text-muted-foreground bg-paper p-2 rounded border border-border/80">
                        <strong>Internal Dispatch Note:</strong> {inq.internalNotes}
                      </div>
                    )}
                  </div>

                  {/* Inquiry Status Actions */}
                  <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[0.7rem] text-muted-foreground">
                      Assigned: <strong className="text-foreground">{inq.assignedStaff || 'Unassigned'}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={inq.status}
                        onChange={(e) => updateInquiry(inq.id, { status: e.target.value as Inquiry['status'] })}
                        className="rounded border border-input bg-background px-2 py-1 text-[0.65rem] font-semibold text-foreground"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="booked">Booked</option>
                        <option value="archived">Archived</option>
                      </select>

                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="rounded bg-primary/10 text-primary px-2.5 py-1 text-[0.65rem] font-semibold hover:bg-primary hover:text-primary-foreground cursor-pointer"
                      >
                        Add Note
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this inquiry?')) {
                            deleteInquiry(inq.id);
                          }
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: GUIDES & DISPATCH ROSTER                                */}
        {/* ============================================================== */}
        {activeTab === 'guides' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Licensed Ministry Guides Roster
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct operator team — licensed professional guides certified by the Ministry of Culture & Tourism.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {guides.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-lg border border-border bg-paper/40 p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[0.65rem] font-bold text-primary">
                          {g.licenseNo}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[0.6rem] font-bold uppercase tracking-wider ${
                            g.status === 'available'
                              ? 'bg-success-soft text-success'
                              : g.status === 'on_tour'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {g.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-display text-base font-bold text-foreground">
                        {g.name}
                      </h4>
                      <p className="text-[0.7rem] text-muted-foreground line-clamp-2 mt-1">
                        {g.speciality}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {g.languages.map((l) => (
                          <span
                            key={l}
                            className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium text-foreground"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/80 text-[0.65rem] text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Phone className="size-2.5 text-primary" />
                        <span className="font-mono">{g.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="size-2.5 text-primary" />
                        <span>{g.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: PASSENGER MANIFEST                                    */}
      {/* ============================================================== */}
      {selectedManifestDep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setSelectedManifestDep(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-4 mb-4">
              <span className="eyebrow text-primary">Official Operations Dispatch</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mt-1">
                Departure Passenger Manifest
              </h2>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[0.65rem] uppercase text-muted-foreground block">Tour</span>
                  <strong className="text-foreground">{selectedManifestDep.tourTitle}</strong>
                </div>
                <div>
                  <span className="text-[0.65rem] uppercase text-muted-foreground block">Departure Date</span>
                  <strong className="text-primary">{selectedManifestDep.startDate}</strong>
                </div>
                <div>
                  <span className="text-[0.65rem] uppercase text-muted-foreground block">Lead Guide</span>
                  <strong className="text-foreground">{selectedManifestDep.assignedGuide || 'TBA'}</strong>
                </div>
                <div>
                  <span className="text-[0.65rem] uppercase text-muted-foreground block">Vehicle</span>
                  <strong className="text-foreground">{selectedManifestDep.driverVehicle || 'TBA'}</strong>
                </div>
              </div>

              {(() => {
                const depTour = tours.find(
                  (t) => t.slug === selectedManifestDep.tourSlug || t.id === selectedManifestDep.tourId
                );
                const isDayTour =
                  depTour?.tour_type === 'day' ||
                  depTour?.days === 1 ||
                  selectedManifestDep.tourTitle.toLowerCase().includes('day') ||
                  selectedManifestDep.tourSlug.includes('day');
                return (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span
                      className={`text-[0.68rem] font-bold px-2 py-0.5 rounded border ${
                        isDayTour
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25'
                          : 'bg-primary/10 text-primary border-primary/25'
                      }`}
                    >
                      {isDayTour
                        ? 'Day City Excursion · No Overnight Lodging / Rooming Required'
                        : 'Multi-Day Expedition · Boutique Hotel Lodging Active'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Confirmed Travelers List */}
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-foreground">
                Confirmed Passengers on this Departure ({manifestTravelers.reduce((s, b) => s + b.guests, 0)} pax / {selectedManifestDep.capacity} max)
              </h3>

              {manifestTravelers.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted font-semibold text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-3 py-2">Ref</th>
                        <th className="px-3 py-2">Lead Traveler</th>
                        <th className="px-3 py-2">Phone</th>
                        <th className="px-3 py-2">Guests</th>
                        <th className="px-3 py-2">Dietary & Requests</th>
                        <th className="px-3 py-2">Emergency Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {manifestTravelers.map((t) => (
                        <tr key={t.id}>
                          <td className="px-3 py-2 font-mono font-bold text-primary">{t.reference}</td>
                          <td className="px-3 py-2 font-bold text-foreground">{t.leadName}</td>
                          <td className="px-3 py-2 font-mono">{t.leadPhone}</td>
                          <td className="px-3 py-2">{t.guests} pax</td>
                          <td className="px-3 py-2 text-foreground/80">
                            {t.dietaryNotes || t.specialRequests || 'Standard'}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground text-[0.7rem]">
                            {t.emergencyContactName ? `${t.emergencyContactName} (${t.emergencyContactPhone})` : 'On file'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center rounded-lg border border-dashed border-border bg-paper/40 text-xs text-muted-foreground">
                  No confirmed bookings on this departure yet. Scheduled seats available: {selectedManifestDep.capacity}.
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[0.7rem] text-muted-foreground">
                Manifest generated for field operations.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedManifestDep(null)}
                  className="rounded-md border border-input px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-md bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="size-3.5" />
                  Print Manifest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD NEW DEPARTURE                                     */}
      {/* ============================================================== */}
      {showAddDepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowAddDepModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              Schedule New Tour Departure
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Add a confirmed or guaranteed departure date to the live reservation system.
            </p>

            <form onSubmit={handleCreateDeparture} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Select Tour</label>
                <select
                  required
                  value={newDepTourId}
                  onChange={(e) => {
                    setNewDepTourId(e.target.value);
                    const chosen = tours.find((t) => t.id === e.target.value);
                    if (chosen && (chosen.tour_type === 'day' || chosen.days === 1)) {
                      setNewDepCapacity(Math.min(12, newDepCapacity));
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                >
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.tour_type === 'day' ? 'Day Tour' : `${t.days} Days`})
                    </option>
                  ))}
                </select>
                {(() => {
                  const chosen = tours.find((t) => t.id === newDepTourId);
                  const isDay = chosen?.tour_type === 'day' || chosen?.days === 1;
                  return isDay ? (
                    <div className="mt-1.5 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[0.68rem] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Users className="size-3.5 shrink-0" />
                      Day Tour Excursion · No hotel lodging or rooming options needed (Capacity up to 12 pax).
                    </div>
                  ) : null;
                })()}
              </div>

              {(() => {
                const chosen = tours.find((t) => t.id === newDepTourId);
                const isDay = chosen?.tour_type === 'day' || chosen?.days === 1;
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block uppercase font-bold text-muted-foreground mb-1">
                        {isDay ? 'Excursion Date' : 'Start Date'}
                      </label>
                      <input
                        type="date"
                        required
                        value={newDepStartDate}
                        onChange={(e) => {
                          setNewDepStartDate(e.target.value);
                          if (isDay) setNewDepEndDate(e.target.value);
                        }}
                        className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                      />
                    </div>
                    <div>
                      <label className="block uppercase font-bold text-muted-foreground mb-1">
                        {isDay ? 'End Date (Same Day)' : 'End Date'}
                      </label>
                      <input
                        type="date"
                        required
                        disabled={isDay}
                        value={isDay ? newDepStartDate : newDepEndDate}
                        onChange={(e) => setNewDepEndDate(e.target.value)}
                        className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono disabled:opacity-60"
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Max Capacity {(() => {
                      const chosen = tours.find((t) => t.id === newDepTourId);
                      return chosen?.tour_type === 'day' || chosen?.days === 1 ? '(Max 12)' : '';
                    })()}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={(() => {
                      const chosen = tours.find((t) => t.id === newDepTourId);
                      return chosen?.tour_type === 'day' || chosen?.days === 1 ? 12 : 24;
                    })()}
                    value={newDepCapacity}
                    onChange={(e) => setNewDepCapacity(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Price (€ / Pax)</label>
                  <input
                    type="number"
                    min={10}
                    value={newDepPrice}
                    onChange={(e) => setNewDepPrice(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Status</label>
                  <select
                    value={newDepStatus}
                    onChange={(e) => setNewDepStatus(e.target.value as Departure['status'])}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                  >
                    <option value="guaranteed">Guaranteed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="filling_fast">Filling Fast</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Lead Guide</label>
                  <select
                    value={newDepGuide}
                    onChange={(e) => setNewDepGuide(e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  >
                    {guides.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Vehicle / Transport</label>
                  <input
                    type="text"
                    value={newDepVehicle}
                    onChange={(e) => setNewDepVehicle(e.target.value)}
                    placeholder="e.g. Mercedes Sprinter VIP"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Operations Notes</label>
                <input
                  type="text"
                  value={newDepNotes}
                  onChange={(e) => setNewDepNotes(e.target.value)}
                  placeholder={
                    (() => {
                      const chosen = tours.find((t) => t.id === newDepTourId);
                      return chosen?.tour_type === 'day' || chosen?.days === 1
                        ? 'e.g. Audio headsets reserved, museum skip-the-line passes secured...'
                        : 'e.g. Balloon slot reserved, special hotel arrangements...';
                    })()
                  }
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDepModal(false)}
                  className="rounded-md border border-input px-4 py-2 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Schedule Departure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: MANUAL BOOKING ENTRY                                  */}
      {/* ============================================================== */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowAddBookingModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              Add Manual Booking (Phone / Walk-in)
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Enter traveler and tour details to generate a confirmed reference and booking record.
            </p>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Tour</label>
                <select
                  required
                  value={newBkTourSlug}
                  onChange={(e) => {
                    setNewBkTourSlug(e.target.value);
                    const chosen = tours.find((t) => t.slug === e.target.value);
                    if (chosen && (chosen.tour_type === 'day' || chosen.days === 1)) {
                      setNewBkGuests((g) => Math.min(12, g));
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                >
                  {tours.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.title} ({t.tour_type === 'day' ? 'Day Tour' : `${t.days} Days`})
                    </option>
                  ))}
                </select>

                {(() => {
                  const chosen = tours.find((t) => t.slug === newBkTourSlug);
                  const isDay = chosen?.tour_type === 'day' || chosen?.days === 1;
                  const pricing = isDay && chosen ? calculateDayTourPricing(chosen.price_cents, newBkGuests) : null;

                  return isDay ? (
                    <div className="mt-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          Day Tour: No Accommodation / Rooming Required
                        </span>
                        <span className="text-[0.65rem] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded">
                          Up to 12 Passengers
                        </span>
                      </div>
                      <p className="text-[0.68rem] text-muted-foreground leading-normal">
                        This is a guided city excursion. Lodging and rooming options are completely removed. Adult and group prices (up to 12 people) are calculated from adult base fare with tiered group discounts.
                      </p>
                      {pricing && (
                        <div className="pt-2 mt-1 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-muted-foreground text-[0.68rem] block">Tier: {pricing.tier.label}</span>
                            <span className="font-bold text-foreground font-mono">
                              €{Math.round(pricing.effectivePricePerPersonCents / 100)} / person
                            </span>
                            {pricing.tier.discountPercent > 0 && (
                              <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                Group Savings: €{Math.round(pricing.savingsCents / 100)} total (-{pricing.tier.discountPercent}%)
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[0.68rem] text-muted-foreground block">Total ({newBkGuests} pax)</span>
                            <span className="font-bold text-primary font-mono text-sm">
                              €{Math.round(pricing.totalCents / 100)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 p-2 rounded border border-border bg-muted/20 text-[0.68rem] text-muted-foreground flex items-center justify-between">
                      <span>Multi-Day Expedition: Boutique hotel lodging & rooming arrangements apply.</span>
                      <span className="font-mono font-bold text-foreground">
                        €{Math.round(((chosen?.price_cents || 0) * newBkGuests) / 100)} Total
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={newBkDate}
                    onChange={(e) => setNewBkDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    {(() => {
                      const chosen = tours.find((t) => t.slug === newBkTourSlug);
                      return chosen?.tour_type === 'day' || chosen?.days === 1
                        ? 'Adult Passengers (Max 12)'
                        : 'Guests Count';
                    })()}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={(() => {
                      const chosen = tours.find((t) => t.slug === newBkTourSlug);
                      return chosen?.tour_type === 'day' || chosen?.days === 1 ? 12 : 24;
                    })()}
                    value={newBkGuests}
                    onChange={(e) => setNewBkGuests(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-bold"
                  />
                  {(() => {
                    const chosen = tours.find((t) => t.slug === newBkTourSlug);
                    return chosen?.tour_type === 'day' || chosen?.days === 1 ? (
                      <span className="text-[0.65rem] text-primary mt-0.5 block font-semibold">
                        Group discounts for parties of 4–12 guests
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Lead Passenger Name</label>
                <input
                  type="text"
                  required
                  value={newBkName}
                  onChange={(e) => setNewBkName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newBkEmail}
                    onChange={(e) => setNewBkEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newBkPhone}
                    onChange={(e) => setNewBkPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Dietary Notes</label>
                  <input
                    type="text"
                    value={newBkDietary}
                    onChange={(e) => setNewBkDietary(e.target.value)}
                    placeholder="e.g. Vegetarian, Halal"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Special Requests</label>
                  <input
                    type="text"
                    value={newBkSpecial}
                    onChange={(e) => setNewBkSpecial(e.target.value)}
                    placeholder="e.g. Airport pickup"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookingModal(false)}
                  className="rounded-md border border-input px-4 py-2 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: INQUIRY NOTE / DISPATCH                               */}
      {/* ============================================================== */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-display text-base font-bold text-foreground mb-1">
              Add Dispatch Note to Inquiry
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Inquiry from {selectedInquiry.name} ({selectedInquiry.email})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Assigned Staff</label>
                <input
                  type="text"
                  defaultValue={selectedInquiry.assignedStaff || 'Atlas Dispatch'}
                  id="inq-staff-input"
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Internal Operations Note</label>
                <textarea
                  rows={3}
                  defaultValue={selectedInquiry.internalNotes || ''}
                  id="inq-notes-input"
                  placeholder="Notes on client requirements, quotation status, guide suggestions..."
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="rounded border border-input px-3 py-1.5 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const staff = (document.getElementById('inq-staff-input') as HTMLInputElement)?.value;
                    const notes = (document.getElementById('inq-notes-input') as HTMLTextAreaElement)?.value;
                    updateInquiry(selectedInquiry.id, {
                      assignedStaff: staff,
                      internalNotes: notes,
                    });
                    setSelectedInquiry(null);
                  }}
                  className="rounded bg-primary px-4 py-1.5 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: ADD INQUIRY MANUAL                                    */}
      {/* ============================================================== */}
      {showAddInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <button
              onClick={() => setShowAddInquiryModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-display text-base font-bold text-foreground mb-1">
              Record Custom Tour Inquiry
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter inquiry details from phone call, email, or agent partner.
            </p>

            <form onSubmit={handleCreateInquiry} className="space-y-3 text-xs">
              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-0.5">Client Name</label>
                <input
                  type="text"
                  required
                  value={newInqName}
                  onChange={(e) => setNewInqName(e.target.value)}
                  className="w-full rounded border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-0.5">Email</label>
                  <input
                    type="email"
                    required
                    value={newInqEmail}
                    onChange={(e) => setNewInqEmail(e.target.value)}
                    className="w-full rounded border border-input bg-background p-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-0.5">Phone</label>
                  <input
                    type="text"
                    value={newInqPhone}
                    onChange={(e) => setNewInqPhone(e.target.value)}
                    className="w-full rounded border border-input bg-background p-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-0.5">Requested Destination / Route</label>
                <input
                  type="text"
                  value={newInqDest}
                  onChange={(e) => setNewInqDest(e.target.value)}
                  className="w-full rounded border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-0.5">Requirements / Inquiry</label>
                <textarea
                  rows={3}
                  required
                  value={newInqMsg}
                  onChange={(e) => setNewInqMsg(e.target.value)}
                  className="w-full rounded border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInquiryModal(false)}
                  className="rounded border border-input px-3 py-1.5 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-1.5 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: NOTIFY FINANCE DEPARTMENT (ADVISOR COMMISSION AUDIT)  */}
      {/* ============================================================== */}
      {financeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            <button
              onClick={() => setFinanceModalBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Bell className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Notify Finance Department
                </h3>
                <span className="text-[0.7rem] text-muted-foreground">
                  Automated B2B Advisor Commission & Net Remittance Notice
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Dispatch Notice Card */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-mono font-bold text-primary text-sm">
                    Ref: {financeModalBooking.reference}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground">
                    To: <strong>finance@atlasglobaltours.com</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-foreground">
                  <div>
                    <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">Agency Partner</span>
                    <strong className="block">{financeModalBooking.advisorDetails?.agencyName || 'Travel Partner'}</strong>
                    <span className="text-[0.65rem] text-muted-foreground">
                      Advisor: {financeModalBooking.advisorDetails?.advisorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">Tour & Departure</span>
                    <strong className="block line-clamp-1">{financeModalBooking.tourTitle}</strong>
                    <span className="text-[0.65rem] text-muted-foreground font-mono">
                      {financeModalBooking.departureDate} ({financeModalBooking.guests} pax)
                    </span>
                  </div>
                </div>

                {/* Financial Ledger Breakdown */}
                <div className="rounded-lg border border-border bg-card p-3 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted-foreground text-[0.65rem] block uppercase font-bold">Gross Retail</span>
                    <strong className="text-sm block">{formatPrice(financeModalBooking.totalPriceCents, financeModalBooking.currency)}</strong>
                  </div>
                  <div>
                    <span className="text-primary text-[0.65rem] block uppercase font-bold">
                      Advisor Comm ({financeModalBooking.advisorDetails?.commissionRatePercent}%)
                    </span>
                    <strong className="text-sm text-primary block">
                      {formatPrice(financeModalBooking.advisorDetails?.commissionAmountCents || 0, financeModalBooking.currency)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[0.65rem] block uppercase font-bold">Net Remitted</span>
                    <strong className="text-sm text-emerald-600 block">
                      {formatPrice(financeModalBooking.advisorDetails?.netOperatorAmountCents || 0, financeModalBooking.currency)}
                    </strong>
                  </div>
                </div>

                <div className="text-[0.65rem] text-muted-foreground flex items-center justify-between">
                  <span>Card Settle: Card ending in •••• {financeModalBooking.advisorDetails?.cardLast4 || '4242'}</span>
                  <span>Lead Client: {financeModalBooking.leadName}</span>
                </div>
              </div>

              {/* Custom Finance Audit Remark */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                  Audit Remarks / Accounting Instructions
                </label>
                <textarea
                  rows={3}
                  value={financeNotes}
                  onChange={(e) => setFinanceNotes(e.target.value)}
                  placeholder="e.g. Settle Net Remittance into Bank Account A; verify 15% commission ledger with Virtuoso partner contract."
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setFinanceModalBooking(null)}
                  className="rounded-lg border border-input px-3.5 py-2 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    notifyFinanceForBooking(financeModalBooking.reference, financeNotes);
                    setFinanceModalBooking(null);
                  }}
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-2 font-bold text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Transmit Notice to Finance & Mark Audited</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: PASSENGER MANIFEST & TRAVEL CREDENTIALS               */}
      {/* ============================================================== */}
      {manifestModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto space-y-4">
            <button
              onClick={() => setManifestModalBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Passenger Manifest & Credentials — Ref #{manifestModalBooking.reference}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {manifestModalBooking.tourTitle} · {manifestModalBooking.departureDate} ({manifestModalBooking.guests} pax)
                  </span>
                  {(() => {
                    const bTour = tours.find(
                      (t) => t.slug === manifestModalBooking.tourSlug || t.id === manifestModalBooking.tourId
                    );
                    const isDay =
                      bTour?.tour_type === 'day' ||
                      bTour?.days === 1 ||
                      manifestModalBooking.tourTitle.toLowerCase().includes('day') ||
                      manifestModalBooking.tourSlug.includes('day');
                    return isDay ? (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 font-bold text-[0.65rem] text-emerald-800 dark:text-emerald-300">
                        Day Excursion · No Lodging / Rooming Required
                      </span>
                    ) : (
                      <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-semibold text-[0.65rem] text-primary">
                        Multi-Day Hotel Lodging
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {manifestModalBooking.advisorDetails?.clients && manifestModalBooking.advisorDetails.clients.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-3.5 py-2.5">Passenger Name</th>
                      <th className="px-3.5 py-2.5">DOB & Gender</th>
                      <th className="px-3.5 py-2.5">Passport & Expiry</th>
                      <th className="px-3.5 py-2.5">Dietary Notes</th>
                      <th className="px-3.5 py-2.5">Medical Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {manifestModalBooking.advisorDetails.clients.map((c, idx) => (
                      <tr key={c.id || idx}>
                        <td className="px-3.5 py-2.5 font-bold text-foreground">
                          {idx + 1}. {c.firstName} {c.middleName ? `${c.middleName} ` : ''}{c.lastName}
                          {c.phone && <span className="block text-[0.65rem] text-muted-foreground">{c.phone}</span>}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-mono">{c.dob}</span>
                          <span className="block text-[0.65rem] text-muted-foreground">{c.gender}</span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-mono font-bold text-primary">{c.passportNumber}</span>
                          <span className="block text-[0.65rem] text-muted-foreground">Exp: {c.passportExpiry}</span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            {c.dietaryRequirements || 'Standard'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-muted-foreground">
                          {c.medicalConditions || 'None reported'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs">
                <strong className="block text-foreground">{manifestModalBooking.leadName}</strong>
                <span>Contact: {manifestModalBooking.leadEmail} · {manifestModalBooking.leadPhone}</span>
                <span className="block mt-1">Dietary: {manifestModalBooking.dietaryNotes || 'Standard'}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setManifestModalBooking(null)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: PRICE-FREE OFFICIAL CLIENT VOUCHER                    */}
      {/* ============================================================== */}
      {voucherModalBooking && (
        <AdvisorClientVoucher
          booking={voucherModalBooking}
          onClose={() => setVoucherModalBooking(null)}
        />
      )}
    </div>
  );
};
