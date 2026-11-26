import React, { useState, useMemo } from 'react';
import {
  Shield,
  Layers,
  Calendar,
  Users,
  MessageSquare,
  Search,
  CheckCircle,
  Eye,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Globe,
  Image as ImageIcon,
  FileText,
  Settings,
  Sparkles,
  RotateCcw,
  Check,
  X,
  MapPin,
  ExternalLink,
  Sliders,
  DollarSign,
  Briefcase,
  Percent,
  CreditCard,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  Clock,
  Send,
  Printer,
  Bell,
  Award,
  Star,
  Bed,
  Tag,
} from 'lucide-react';
import { Tour, DestinationRegion, TourDay } from '../data/toursData';
import { Post } from '../data/postsData';
import { useTours, SiteContent } from '../context/ToursContext';
import { calculateDayTourPricing, DAY_TOUR_GROUP_TIERS } from '../utils/dayTourPricing';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth, Booking, ClientPassengerInfo, RegisteredAdvisor } from '../context/AuthContext';
import { TikTokIcon, LinkedInIcon, FacebookIcon, InstagramIcon } from '../components/Footer';
import { useReviews } from '../context/ReviewsContext';
import { Review } from '../data/reviewsData';
import { AdvisorClientVoucher } from '../components/AdvisorClientVoucher';
import { StarRating } from '../components/StarRating';
import { AdminPromoCodesTab } from '../components/AdminPromoCodesTab';
import { AdminSoroJournalPanel } from '../components/AdminSoroJournalPanel';
import { resolveTourCode } from '../utils/bookingReference';

interface AdminPageProps {
  onSelectTour: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onSelectTour, onNavigate }) => {
  const {
    tours,
    destinationRegions,
    posts,
    siteContent,
    addTour,
    updateTour,
    deleteTour,
    togglePublishTour,
    updateDestinationRegion,
    addDestinationRegion,
    deleteDestinationRegion,
    updateSiteContent,
    addPost,
    updatePost,
    deletePost,
    resetAllToDefaults,
  } = useTours();

  const { formatPrice } = useCurrency();
  const {
    bookings,
    registeredAdvisors,
    notifyFinanceForBooking,
    advisorRegister,
  } = useAuth();

  const { reviews, deleteReview, addHostReply } = useReviews();

  // Admin Sub-tabs
  const [activeTab, setActiveTab] = useState<'tours' | 'destinations' | 'promo_codes' | 'advisor_bookings' | 'reviews' | 'site_content' | 'blog' | 'settings'>('tours');

  // Reviews State
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | 'all'>('all');
  const [replyModalReview, setReplyModalReview] = useState<Review | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('Selim Bayraktar');
  const [replyRole, setReplyRole] = useState('Operations Director, Atlas Global Tours');
  const [replyComment, setReplyComment] = useState('');

  // Advisor & B2B Bookings State
  const [advisorSearch, setAdvisorSearch] = useState('');
  const [advisorFinanceFilter, setAdvisorFinanceFilter] = useState<'All' | 'pending' | 'notified'>('All');
  const [advisorStatusFilter, setAdvisorStatusFilter] = useState('All');
  const [financeModalBooking, setFinanceModalBooking] = useState<Booking | null>(null);
  const [financeNotes, setFinanceNotes] = useState('');
  const [manifestModalBooking, setManifestModalBooking] = useState<Booking | null>(null);
  const [voucherModalBooking, setVoucherModalBooking] = useState<Booking | null>(null);
  const [showAddAdvisorModal, setShowAddAdvisorModal] = useState(false);

  // New Advisor Form State
  const [newAdvName, setNewAdvName] = useState('');
  const [newAdvEmail, setNewAdvEmail] = useState('');
  const [newAdvAgency, setNewAdvAgency] = useState('');
  const [newAdvIata, setNewAdvIata] = useState('');
  const [newAdvPhone, setNewAdvPhone] = useState('');
  const [newAdvCountry, setNewAdvCountry] = useState('United States');
  const [newAdvCommission, setNewAdvCommission] = useState(20);

  // Filtered Advisor Bookings & Statistics
  const advisorBookings = useMemo(() => {
    return bookings.filter((b) => b.isAdvisorBooking);
  }, [bookings]);

  const filteredAdvisorBookings = useMemo(() => {
    const q = advisorSearch.toLowerCase();
    return advisorBookings.filter((b) => {
      const code = (b.tourCode || resolveTourCode(b)).toLowerCase();
      const matchSearch =
        b.reference.toLowerCase().includes(q) ||
        code.includes(q) ||
        b.leadName.toLowerCase().includes(q) ||
        b.tourTitle.toLowerCase().includes(q) ||
        (b.advisorDetails?.agencyName && b.advisorDetails.agencyName.toLowerCase().includes(q)) ||
        (b.advisorDetails?.advisorName && b.advisorDetails.advisorName.toLowerCase().includes(q)) ||
        (b.advisorDetails?.advisorEmail && b.advisorDetails.advisorEmail.toLowerCase().includes(q));

      const matchFinance =
        advisorFinanceFilter === 'All' ||
        (advisorFinanceFilter === 'pending' && !b.advisorDetails?.financeNotified) ||
        (advisorFinanceFilter === 'notified' && b.advisorDetails?.financeNotified);

      const matchStatus =
        advisorStatusFilter === 'All' || b.status === advisorStatusFilter;

      return matchSearch && matchFinance && matchStatus;
    });
  }, [advisorBookings, advisorSearch, advisorFinanceFilter, advisorStatusFilter]);

  const advisorStats = useMemo(() => {
    const totalCount = advisorBookings.length;
    const grossTotalCents = advisorBookings.reduce((sum, b) => sum + b.totalPriceCents, 0);
    const commissionTotalCents = advisorBookings.reduce(
      (sum, b) => sum + (b.advisorDetails?.commissionAmountCents || 0),
      0
    );
    const netOperatorTotalCents = advisorBookings.reduce(
      (sum, b) => sum + (b.advisorDetails?.netOperatorAmountCents || 0),
      0
    );
    const pendingFinanceCount = advisorBookings.filter(
      (b) => !b.advisorDetails?.financeNotified
    ).length;

    return {
      totalCount,
      grossTotalCents,
      commissionTotalCents,
      netOperatorTotalCents,
      pendingFinanceCount,
    };
  }, [advisorBookings]);

  // Handle Authorizing New Consultant
  const handleCreateAdvisorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvName || !newAdvEmail || !newAdvAgency) return;

    advisorRegister({
      name: newAdvName,
      email: newAdvEmail,
      agencyName: newAdvAgency,
      iataClia: newAdvIata || 'IATA-VERIFIED',
      phone: newAdvPhone,
      country: newAdvCountry,
      defaultCommissionRate: newAdvCommission,
    });

    triggerBanner(`Authorized Travel Consultant "${newAdvName}" (${newAdvAgency}) registered successfully!`);
    setShowAddAdvisorModal(false);
    setNewAdvName('');
    setNewAdvEmail('');
    setNewAdvAgency('');
    setNewAdvIata('');
    setNewAdvPhone('');
  };

  // Handle Dispatching Finance Notification
  const handleSendFinanceNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financeModalBooking) return;

    notifyFinanceForBooking(financeModalBooking.reference, financeNotes);
    triggerBanner(`Finance Department successfully notified for booking ref: ${financeModalBooking.reference}`);
    setFinanceModalBooking(null);
    setFinanceNotes('');
  };

  // Reviews Tab Calculations & Handling
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        !reviewSearch ||
        r.authorName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.tourSlug.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.authorLocation.toLowerCase().includes(reviewSearch.toLowerCase());

      const matchStar = reviewStarFilter === 'all' || Math.round(r.rating) === reviewStarFilter;

      return matchSearch && matchStar;
    });
  }, [reviews, reviewSearch, reviewStarFilter]);

  const reviewStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { avg: 5.0, count5: 0, count4: 0, helpful: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / total) * 10) / 10;
    const count5 = reviews.filter((r) => Math.round(r.rating) === 5).length;
    const count4 = reviews.filter((r) => Math.round(r.rating) === 4).length;
    const helpful = reviews.reduce((acc, r) => acc + (r.helpfulCount || 0), 0);
    return { avg, count5, count4, helpful };
  }, [reviews]);

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalReview || !replyComment.trim()) return;

    addHostReply(replyModalReview.id, {
      author: replyAuthor,
      role: replyRole,
      comment: replyComment.trim(),
    });

    triggerBanner(`Official operator response published for review "${replyModalReview.title}"!`);
    setReplyModalReview(null);
    setReplyComment('');
  };

  // Tour search & filters
  const [tourSearch, setTourSearch] = useState('');
  const [tourContinentFilter, setTourContinentFilter] = useState('All');
  const [tourTypeFilter, setTourTypeFilter] = useState('All');

  // Modals state
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isNewTourModal, setIsNewTourModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<DestinationRegion | null>(null);
  const [isNewRegionModal, setIsNewRegionModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isNewPostModal, setIsNewPostModal] = useState(false);

  // Success Notification banner
  const [saveBanner, setSaveBanner] = useState('');

  const triggerBanner = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(''), 3000);
  };

  // Filtered tours
  const filteredTours = tours.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(tourSearch.toLowerCase()) ||
      t.slug.toLowerCase().includes(tourSearch.toLowerCase()) ||
      (t.place && t.place.toLowerCase().includes(tourSearch.toLowerCase())) ||
      (t.region && t.region.toLowerCase().includes(tourSearch.toLowerCase()));

    const matchContinent =
      tourContinentFilter === 'All' || t.continent === tourContinentFilter;

    const matchType =
      tourTypeFilter === 'All' || t.tour_type === tourTypeFilter;

    return matchSearch && matchContinent && matchType;
  });

  // Tour Edit Handlers
  const handleSaveTourForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;

    if (isNewTourModal) {
      addTour(editingTour);
      triggerBanner(`New tour "${editingTour.title}" created successfully!`);
    } else {
      updateTour(editingTour.id, editingTour);
      triggerBanner(`Tour "${editingTour.title}" updated successfully!`);
    }

    setEditingTour(null);
    setIsNewTourModal(false);
  };

  const handleDuplicateTour = (tour: Tour) => {
    const randomSlug = `${tour.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
    const duplicated: Tour = {
      ...tour,
      id: 'tour-' + Math.random().toString(36).substring(2, 9),
      slug: randomSlug,
      title: `${tour.title} (Copy)`,
      created_at: new Date().toISOString(),
    };
    addTour(duplicated);
    triggerBanner(`Duplicated tour created as "${duplicated.title}"`);
  };

  const startNewTour = () => {
    const blankTour: Tour = {
      id: 'tour-' + Math.random().toString(36).substring(2, 9),
      slug: 'new-journey-' + Math.floor(100 + Math.random() * 900),
      title: 'New Signature Journey',
      code: 'AGT-NEW',
      summary: 'Authentic small group itinerary led by local guides.',
      description: 'Full trip overview detailing places visited, cultural highlights, and culinary experiences.',
      hero_image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80'
      ],
      days: 7,
      nights: 6,
      price_cents: 175000,
      deposit_cents: 35000,
      currency: 'EUR',
      min_pax: 2,
      max_pax: 12,
      difficulty: 'Moderate',
      continent: 'Europe',
      region: 'Istanbul & Marmara',
      place: 'Istanbul & Marmara',
      themes: ['Culture', 'Heritage'],
      countries: ['Türkiye'],
      includes: ['Licensed English Speaking Guide', 'Boutique Hotel Accommodation', 'Daily Breakfast'],
      excludes: ['International Flights', 'Travel Insurance', 'Personal Expenses'],
      adventure_level: 3,
      culture_level: 5,
      relaxation_level: 3,
      is_featured: false,
      is_published: true,
      tour_type: 'multi_day',
      duration_hours: null,
      meeting_point: 'Hotel lobby in Istanbul',
      activity_level: 'Moderate',
      travel_style: 'Small Group',
      best_time: 'April - October',
      meals_breakfasts: 6,
      meals_lunches: 3,
      meals_dinners: 2,
      single_supplement_percent: 15,
      single_supplement_cents: null,
      double_room_supplement_percent: 0,
      twin_room_supplement_percent: 0,
      room_policy_notes: {
        double: 'Double room for couples (1 large bed).',
        twin: 'Twin share can be shared by two same-gender travellers or friends (2 single beds).',
        single: 'Single room for solo travelers (subject to apply single supplement: trip price + 15% more).',
      },
      daysList: [
        {
          id: 'day-1',
          tour_id: '',
          day_number: 1,
          title: 'Arrival & Welcome Orientation Walk',
          body: 'Arrive at the airport and transfer to your boutique hotel. Meet your local guide at 1:00 PM for an orientation walk and welcome dinner.',
        },
        {
          id: 'day-2',
          tour_id: '',
          day_number: 2,
          title: 'Heritage Explorations',
          body: 'Full day in-depth exploration of ancient landmarks and hidden historic courtyards.',
        }
      ],
      departuresList: []
    };

    setEditingTour(blankTour);
    setIsNewTourModal(true);
  };

  return (
    <div className="min-h-screen py-10 lg:py-14 bg-background">
      <div className="container-page">
        {/* Banner Alert */}
        {saveBanner && (
          <div className="mb-6 rounded-xl border border-success-border bg-success-soft p-4 text-xs font-semibold text-success flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <CheckCircle className="size-4 shrink-0" />
              {saveBanner}
            </span>
            <button onClick={() => setSaveBanner('')} className="cursor-pointer">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="size-5" />
              <span className="eyebrow">Content Management Suite</span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
              Atlas Website Master Admin
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Edit all tours, itineraries, destinations, homepage banners, journal dispatches, and global website content in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('/operations')}
              className="rounded-md border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="size-3.5" />
              Operations Dashboard
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              View Live Website
            </button>
          </div>
        </div>

        {/* Admin Top Navigation */}
        <div className="mt-8 flex border-b border-border overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('tours')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'tours'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="size-4" />
            Tours & Trips ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'destinations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="size-4" />
            Destinations & Continents ({destinationRegions.length})
          </button>
          <button
            onClick={() => setActiveTab('promo_codes')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'promo_codes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Tag className="size-4" />
            Promo Codes
          </button>
          <button
            onClick={() => setActiveTab('advisor_bookings')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'advisor_bookings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="size-4" />
            <span>Consultant Bookings & Finance ({advisorBookings.length})</span>
            {advisorStats.pendingFinanceCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[0.6rem] font-bold">
                {advisorStats.pendingFinanceCount} pending
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span>Traveler Reviews ({reviews.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('site_content')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'site_content'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="size-4" />
            Homepage & Brand Content
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'blog'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="size-4" />
            Journal & Dispatches ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="size-4" />
            System & Reset
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB: PROMO CODES MANAGEMENT & GENERATOR                        */}
        {/* ============================================================== */}
        {activeTab === 'promo_codes' && (
          <AdminPromoCodesTab onBanner={triggerBanner} />
        )}

        {/* ============================================================== */}
        {/* TAB 1: TOURS & TRIPS CMS                                      */}
        {/* ============================================================== */}
        {activeTab === 'tours' && (
          <div className="mt-6 space-y-6">
            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={tourSearch}
                  onChange={(e) => setTourSearch(e.target.value)}
                  placeholder="Search tours by title, slug, place, region..."
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={tourContinentFilter}
                  onChange={(e) => setTourContinentFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground"
                >
                  <option value="All">All Continents</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Africa">Africa</option>
                </select>

                <select
                  value={tourTypeFilter}
                  onChange={(e) => setTourTypeFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground"
                >
                  <option value="All">All Types</option>
                  <option value="multi_day">Multi-day</option>
                  <option value="day">Day Tours</option>
                </select>

                <button
                  onClick={startNewTour}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  Add New Tour
                </button>
              </div>
            </div>

            {/* Tours Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Tour Details</th>
                      <th className="px-4 py-3">Continent & Place</th>
                      <th className="px-4 py-3">Duration & Type</th>
                      <th className="px-4 py-3">Pricing & Rooming / Rates</th>
                      <th className="px-4 py-3">Itinerary Days</th>
                      <th className="px-4 py-3">Published</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {filteredTours.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={t.hero_image}
                              alt={t.title}
                              className="size-11 rounded-md object-cover shrink-0 border border-border"
                            />
                            <div>
                              <span
                                onClick={() => onSelectTour(t.slug)}
                                className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1 block"
                              >
                                {t.title}
                              </span>
                              <span className="font-mono text-[0.65rem] text-muted-foreground">
                                /{t.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-foreground block">
                            {t.continent} · {t.region}
                          </span>
                          <span className="text-[0.65rem] text-muted-foreground">
                            {t.place}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="block font-semibold text-foreground">
                            {t.tour_type === 'day' ? `${t.duration_hours || 4} Hours` : `${t.days} Days / ${t.nights} Nights`}
                          </span>
                          <span className="text-[0.65rem] text-muted-foreground uppercase">
                            {t.tour_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-primary block">
                            {formatPrice(t.price_cents, t.currency)}
                          </span>
                          {t.tour_type === 'day' || t.days === 1 ? (
                            <span className="text-[0.65rem] text-emerald-700 dark:text-emerald-400 font-semibold block">
                              Day Excursion · Group Tiers (No Rooming)
                            </span>
                          ) : (
                            <span className="text-[0.65rem] text-amber-700 dark:text-amber-400 font-semibold block">
                              Single: +{t.single_supplement_percent ?? 15}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-foreground">
                            {t.daysList?.length || t.days} Days
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => togglePublishTour(t.id)}
                            className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                              t.is_published
                                ? 'bg-success-soft text-success border border-success-border'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {t.is_published ? 'Live' : 'Draft'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingTour(JSON.parse(JSON.stringify(t)));
                                setIsNewTourModal(false);
                              }}
                              className="rounded bg-primary/10 text-primary px-2.5 py-1 text-[0.7rem] font-bold hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                            >
                              Edit Full Tour
                            </button>

                            {/* Duplicate Button */}
                            <button
                              onClick={() => handleDuplicateTour(t)}
                              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Duplicate Tour"
                            >
                              <Copy className="size-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete tour "${t.title}" permanently?`)) {
                                  deleteTour(t.id);
                                  triggerBanner(`Deleted tour "${t.title}"`);
                                }
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Delete Tour"
                            >
                              <Trash2 className="size-3.5" />
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
        {/* TAB 2: DESTINATIONS & REGIONS CMS                              */}
        {/* ============================================================== */}
        {activeTab === 'destinations' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Destination Regions (Categorized by Continent)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manage the 11 destination region cards displayed on the homepage and destination filters.
                </p>
              </div>
              <button
                onClick={() => {
                  const newReg: DestinationRegion = {
                    id: 'custom-' + Math.random().toString(36).substring(2, 7),
                    name: 'New Destination Region',
                    continent: 'Europe',
                    subtitle: 'Scenic Discoveries',
                    description: 'Detailed description of this region and travel highlights.',
                    heroImage: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
                    places: ['Highlights & Towns']
                  };
                  addDestinationRegion(newReg);
                  triggerBanner('New destination region added');
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5" />
                Add Destination Region
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destinationRegions.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="relative h-36 rounded-lg overflow-hidden bg-muted mb-3 border border-border">
                      <img src={reg.heroImage} alt={reg.name} className="size-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="rounded-full bg-ink/80 text-sand px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                          {reg.continent}
                        </span>
                      </div>
                    </div>

                    <span className="text-[0.65rem] uppercase font-bold text-primary block">
                      {reg.subtitle}
                    </span>
                    <h4 className="font-display text-base font-bold text-foreground">
                      {reg.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {reg.description}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {reg.places.map((p) => (
                        <span key={p} className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium text-foreground">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[0.65rem] text-muted-foreground font-mono">
                      ID: {reg.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRegion(JSON.parse(JSON.stringify(reg)))}
                        className="rounded bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                      >
                        Edit Region
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete destination region "${reg.name}"?`)) {
                            deleteDestinationRegion(reg.id);
                            triggerBanner(`Deleted region "${reg.name}"`);
                          }
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: HOMEPAGE & BRAND CONTENT CMS                            */}
        {/* ============================================================== */}
        {activeTab === 'site_content' && (
          <div className="mt-6 space-y-8 max-w-4xl">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
              <h3 className="font-display text-lg font-bold text-foreground border-b border-border pb-3">
                Hero Section Copy & Video
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Announcement / Eyebrow Tagline
                  </label>
                  <input
                    type="text"
                    value={siteContent.heroTagline}
                    onChange={(e) => updateSiteContent({ heroTagline: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Main Hero Headline
                  </label>
                  <input
                    type="text"
                    value={siteContent.heroHeadline}
                    onChange={(e) => updateSiteContent({ heroHeadline: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-foreground font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={siteContent.heroSubtitle}
                    onChange={(e) => updateSiteContent({ heroSubtitle: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-foreground leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase font-bold text-muted-foreground mb-1">
                      Background Vimeo Video ID
                    </label>
                    <input
                      type="text"
                      value={siteContent.vimeoId}
                      onChange={(e) => updateSiteContent({ vimeoId: e.target.value })}
                      placeholder="e.g. 347747035"
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-muted-foreground mb-1">
                      Video Poster Fallback Image URL
                    </label>
                    <input
                      type="text"
                      value={siteContent.vimeoPoster}
                      onChange={(e) => updateSiteContent({ vimeoPoster: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Ethos & Stats */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
              <h3 className="font-display text-lg font-bold text-foreground border-b border-border pb-3">
                Brand Ethos & Value Propositions
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Ethos Headline
                  </label>
                  <input
                    type="text"
                    value={siteContent.brandEthosTitle}
                    onChange={(e) => updateSiteContent({ brandEthosTitle: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-foreground font-bold"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Ethos Body Paragraph 1
                  </label>
                  <textarea
                    rows={2}
                    value={siteContent.brandEthosText1}
                    onChange={(e) => updateSiteContent({ brandEthosText1: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Ethos Body Paragraph 2
                  </label>
                  <textarea
                    rows={2}
                    value={siteContent.brandEthosText2}
                    onChange={(e) => updateSiteContent({ brandEthosText2: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase font-bold text-muted-foreground mb-1">
                      Stat Label 1
                    </label>
                    <input
                      type="text"
                      value={siteContent.licensedGuideStat}
                      onChange={(e) => updateSiteContent({ licensedGuideStat: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-muted-foreground mb-1">
                      Stat Label 2
                    </label>
                    <input
                      type="text"
                      value={siteContent.maxPaxStat}
                      onChange={(e) => updateSiteContent({ maxPaxStat: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Offices and Contact Channels */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
              <h3 className="font-display text-lg font-bold text-foreground border-b border-border pb-3">
                Company Details & Official Contact Information
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Istanbul Operations Office Address
                  </label>
                  <input
                    type="text"
                    value={siteContent.officeIstanbul}
                    onChange={(e) => updateSiteContent({ officeIstanbul: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    United States Operations Office Address
                  </label>
                  <input
                    type="text"
                    value={siteContent.officeUS}
                    onChange={(e) => updateSiteContent({ officeUS: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block uppercase font-bold text-muted-foreground mb-1">
                      Support Email
                    </label>
                    <input
                      type="text"
                      value={siteContent.contactEmail}
                      onChange={(e) => updateSiteContent({ contactEmail: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-muted-foreground mb-1">
                      Main Phone
                    </label>
                    <input
                      type="text"
                      value={siteContent.contactPhone}
                      onChange={(e) => updateSiteContent({ contactPhone: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-muted-foreground mb-1">
                      24/7 Duty Emergency Phone
                    </label>
                    <input
                      type="text"
                      value={siteContent.emergencyPhone}
                      onChange={(e) => updateSiteContent({ emergencyPhone: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media & Regarding Channels */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    Social Media & Channels (Regarding Brand, TikTok & LinkedIn)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Configure official links for TikTok, LinkedIn, Instagram, and Facebook shown across the site footer, contact page, and expedition dispatches.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                    Live Synced
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* TikTok */}
                <div className="space-y-1 rounded-lg border border-border/80 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 font-bold uppercase text-foreground">
                      <TikTokIcon className="size-3.5 text-[#25F4EE]" />
                      <span>TikTok Channel Link</span>
                    </label>
                    {siteContent.tiktokUrl && (
                      <a
                        href={siteContent.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Preview <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={siteContent.tiktokUrl ?? ''}
                    placeholder="https://www.tiktok.com/@atlasglobaltours"
                    onChange={(e) => updateSiteContent({ tiktokUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <p className="text-[0.65rem] text-muted-foreground">
                    Official company handle for guide field clips & short video journeys.
                  </p>
                </div>

                {/* LinkedIn */}
                <div className="space-y-1 rounded-lg border border-border/80 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 font-bold uppercase text-foreground">
                      <LinkedInIcon className="size-3.5 text-[#0A66C2]" />
                      <span>LinkedIn Company Page Link</span>
                    </label>
                    {siteContent.linkedinUrl && (
                      <a
                        href={siteContent.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Preview <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={siteContent.linkedinUrl ?? ''}
                    placeholder="https://www.linkedin.com/company/atlasglobaltours"
                    onChange={(e) => updateSiteContent({ linkedinUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <p className="text-[0.65rem] text-muted-foreground">
                    Corporate presence, guide partnership announcements & B2B advisor relations.
                  </p>
                </div>

                {/* Instagram */}
                <div className="space-y-1 rounded-lg border border-border/80 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 font-bold uppercase text-foreground">
                      <InstagramIcon className="size-3.5 text-[#dc2743]" />
                      <span>Instagram Profile Link</span>
                    </label>
                    {siteContent.instagramUrl && (
                      <a
                        href={siteContent.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Preview <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={siteContent.instagramUrl ?? ''}
                    placeholder="https://instagram.com/atlasglobaltours"
                    onChange={(e) => updateSiteContent({ instagramUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-1 rounded-lg border border-border/80 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 font-bold uppercase text-foreground">
                      <FacebookIcon className="size-3.5 text-[#1877F2]" />
                      <span>Facebook Page Link</span>
                    </label>
                    {siteContent.facebookUrl && (
                      <a
                        href={siteContent.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Preview <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={siteContent.facebookUrl ?? ''}
                    placeholder="https://facebook.com/atlasglobaltours"
                    onChange={(e) => updateSiteContent({ facebookUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Accreditations & Regulatory Compliance Logos (ASTA & IRS) */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    Accreditations & Regulatory Compliance Logos (Footer Badges)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Manage the official ASTA (American Society of Travel Advisors), IRS (Internal Revenue Service), and TrustedSite Certified SECURE compliance badges displayed prominently on the website footer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                    Live Synced
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* ASTA Logo */}
                <div className="space-y-2 rounded-lg border border-border/80 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase text-foreground">
                      ASTA Member Logo Image URL
                    </label>
                    <a
                      href="https://www.asta.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ASTA Website <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.astaLogoUrl ?? ''}
                    placeholder="https://www.astanyc.com/uploads/1/3/1/3/131383421/astalogonew_4.png"
                    onChange={(e) => updateSiteContent({ astaLogoUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-12 w-28 shrink-0">
                      <img
                        src={siteContent.astaLogoUrl || "https://www.astanyc.com/uploads/1/3/1/3/131383421/astalogonew_4.png"}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logos/asta-logo.png';
                        }}
                        alt="ASTA Preview"
                        className="max-h-8 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      American Society of Travel Advisors credential verified on the footer banner & brand column.
                    </p>
                  </div>
                </div>

                {/* IRS Logo */}
                <div className="space-y-2 rounded-lg border border-border/80 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase text-foreground">
                      IRS Entity Logo Image URL
                    </label>
                    <a
                      href="https://www.irs.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      IRS.gov <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.irsLogoUrl ?? ''}
                    placeholder="https://1000logos.net/wp-content/uploads/2022/03/IRS-Logo-1862-500x281.png"
                    onChange={(e) => updateSiteContent({ irsLogoUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-12 w-28 shrink-0">
                      <img
                        src={siteContent.irsLogoUrl || "https://1000logos.net/wp-content/uploads/2022/03/IRS-Logo-1862-500x281.png"}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logos/irs-logo.png';
                        }}
                        alt="IRS Preview"
                        className="max-h-8 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      Internal Revenue Service regulatory registered business entity verification.
                    </p>
                  </div>
                </div>

                {/* TrustedSite Security Seal */}
                <div className="space-y-2 rounded-lg border border-border/80 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase text-foreground">
                      TrustedSite Verification URL
                    </label>
                    <a
                      href={siteContent.trustedSiteUrl || "https://www.trustedsite.com/verify?host=atlasglobaltours.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Verify Site <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.trustedSiteUrl ?? ''}
                    placeholder="https://www.trustedsite.com/verify?host=atlasglobaltours.com"
                    onChange={(e) => updateSiteContent({ trustedSiteUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-12 w-28 shrink-0">
                      <img
                        src={siteContent.trustedSiteLogoUrl || "/logos/trustedsite-certified-secure.svg"}
                        alt="TrustedSite Preview"
                        className="max-h-8 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      TrustedSite / McAfee SECURE verified badge loaded via <code className="text-primary font-mono text-[0.6rem]">cdn.ywxi.net/js/1.js</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* "As Seen On" Partner Marketplaces (TourRadar, tourhub, Travelstride, Viator, GetYourGuide) */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  "As Seen On" Partner Marketplaces
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage external profile & booking partner links displayed in the footer "As seen on" banner.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* TourRadar */}
                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#177FA4]"></span>
                      TourRadar Profile URL
                    </label>
                    <a
                      href={siteContent.tourRadarUrl || "https://www.tourradar.com/o/atlas-global-tours"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Test Link <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.tourRadarUrl ?? ''}
                    placeholder="https://www.tourradar.com/o/atlas-global-tours"
                    onChange={(e) => updateSiteContent({ tourRadarUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-10 w-28 shrink-0">
                      <img
                        src="/logos/tourradar-logo.svg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logos/tourradar-logo.png';
                        }}
                        alt="TourRadar Preview"
                        className="max-h-6 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      TourRadar verified operator listing & customer departure reviews.
                    </p>
                  </div>
                </div>

                {/* tourhub */}
                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#00bcb5]"></span>
                      tourhub Profile URL
                    </label>
                    <a
                      href={siteContent.tourhubUrl || "https://tourhub.co/search/operator/Atlas%20Global%20Tours"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Test Link <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.tourhubUrl ?? ''}
                    placeholder="https://tourhub.co/search/operator/Atlas%20Global%20Tours"
                    onChange={(e) => updateSiteContent({ tourhubUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-10 w-28 shrink-0">
                      <img
                        src="/logos/tourhub-logo.svg"
                        alt="tourhub Preview"
                        className="max-h-6 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      tourhub multi-day adventure tours marketplace catalog.
                    </p>
                  </div>
                </div>

                {/* Travelstride */}
                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#10b981]"></span>
                      Travelstride Profile URL
                    </label>
                    <a
                      href={siteContent.travelstrideUrl || "https://www.travelstride.com/tour-operators/atlas-global-tours"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Test Link <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.travelstrideUrl ?? ''}
                    placeholder="https://www.travelstride.com/tour-operators/atlas-global-tours"
                    onChange={(e) => updateSiteContent({ travelstrideUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-10 w-28 shrink-0">
                      <img
                        src="/logos/travelstride-logo.svg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logos/travelstride-icon.png';
                        }}
                        alt="Travelstride Preview"
                        className="max-h-6 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      Travelstride premier operator ratings, verified traveler feedback.
                    </p>
                  </div>
                </div>

                {/* Viator */}
                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#004F32]"></span>
                      Viator Profile URL
                    </label>
                    <a
                      href={siteContent.viatorUrl || "https://www.viator.com/operator/5592559"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Test Link <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.viatorUrl ?? ''}
                    placeholder="https://www.viator.com/operator/5592559"
                    onChange={(e) => updateSiteContent({ viatorUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-10 w-28 shrink-0">
                      <img
                        src="/logos/viator-logo.png"
                        alt="Viator Preview"
                        className="max-h-6 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      Viator (a Tripadvisor company) verified tour operator listing.
                    </p>
                  </div>
                </div>

                {/* GetYourGuide */}
                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#FF5533]"></span>
                      GetYourGuide Profile URL
                    </label>
                    <a
                      href={siteContent.getYourGuideUrl || "https://www.getyourguide.com/atlas-global-tours-s644611/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Test Link <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.getYourGuideUrl ?? ''}
                    placeholder="https://www.getyourguide.com/atlas-global-tours-s644611/"
                    onChange={(e) => updateSiteContent({ getYourGuideUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-10 w-28 shrink-0">
                      <img
                        src="/logos/getyourguide-logo.svg"
                        alt="GetYourGuide Preview"
                        className="max-h-7 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      GetYourGuide certified supplier experiences & activity offerings.
                    </p>
                  </div>
                </div>

                {/* Trustpilot */}
                <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#00b67a]"></span>
                      Trustpilot Profile URL
                    </label>
                    <a
                      href={siteContent.trustpilotUrl || "https://www.trustpilot.com/review/atlasglobaltours.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.68rem] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Test Link <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={siteContent.trustpilotUrl ?? ''}
                    placeholder="https://www.trustpilot.com/review/atlasglobaltours.com"
                    onChange={(e) => updateSiteContent({ trustpilotUrl: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono text-xs"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <div className="rounded-md bg-white border border-border p-2 flex items-center justify-center h-10 w-28 shrink-0">
                      <img
                        src="/logos/trustpilot-logo.svg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logos/trustpilot-logo.png';
                        }}
                        alt="Trustpilot Preview"
                        className="max-h-5 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      Trustpilot verified consumer reviews, ratings, and traveler trust score.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Corporate Governance, Legal Policies & Sustainability Center */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Corporate Governance, Legal Policies & Sustainability Center
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Published legal policies, compliance statements, and sustainability protocols for AGT Group LLC & Atlas Global Tours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/terms')}
                  className="rounded-lg border border-border/70 bg-muted/20 p-3 hover:bg-muted/50 hover:border-primary/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary">
                    <span>Terms & Conditions</span>
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">
                    Booking terms, payment milestones, cancellation schedule & New Mexico legal jurisdiction.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/privacy')}
                  className="rounded-lg border border-border/70 bg-muted/20 p-3 hover:bg-muted/50 hover:border-primary/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary">
                    <span>Privacy Policy</span>
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">
                    GDPR & UK DPA data compliance, retention periods, zero raw card storage & rights management.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/modern-slavery-act')}
                  className="rounded-lg border border-border/70 bg-muted/20 p-3 hover:bg-muted/50 hover:border-primary/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary">
                    <span>Modern Slavery Act</span>
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">
                    Zero-tolerance statement, supply chain vetting, fair wages & confidential whistleblowing.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/sustainable-tourism')}
                  className="rounded-lg border border-border/70 bg-muted/20 p-3 hover:bg-muted/50 hover:border-primary/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary">
                    <span>Sustainable Tourism</span>
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">
                    The 7 Core Sustainability Pillars: heritage protection, small groups, waste reduction & eco suppliers.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/responsible-travel')}
                  className="rounded-lg border border-border/70 bg-muted/20 p-3 hover:bg-muted/50 hover:border-primary/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary">
                    <span>Responsible Travel</span>
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">
                    Fair Travels protocols: fair to communities, fair wages, transparent pricing & mutual respect.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/atlas-cares')}
                  className="rounded-lg border border-primary/30 bg-primary/5 p-3 hover:bg-primary/10 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Atlas Cares Initiative</span>
                    <ExternalLink className="size-3 text-primary" />
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">
                    Direct community giveback: women's artisan co-ops, trail restoration, animal welfare & relief funds.
                  </p>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => triggerBanner('Homepage & Brand Content changes saved!')}
                className="rounded-md bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                Save Site Content
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: BLOG & DISPATCHES CMS                                   */}
        {/* ============================================================== */}
        {activeTab === 'blog' && (
          <div className="mt-6 space-y-6">
            <AdminSoroJournalPanel
              onBanner={triggerBanner}
              onPreviewPost={(slug) => onNavigate(`/blog/${slug}`)}
            />

            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Local Editorial Dispatches
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create, edit, and publish custom field guides alongside your synced Soro & WordPress articles.
                </p>
              </div>
              <button
                onClick={() => {
                  const newPost: Post = {
                    id: 'post-' + Math.random().toString(36).substring(2, 8),
                    slug: 'new-dispatch-' + Math.floor(100 + Math.random() * 900),
                    title: 'New Dispatch Title',
                    excerpt: 'Brief teaser excerpt explaining the route or cultural tradition.',
                    body: 'Full editorial content for the travel journal article.',
                    cover_image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
                    tags: ['culture', 'planning'],
                    status: 'published',
                    published_at: new Date().toISOString(),
                  };
                  addPost(newPost);
                  triggerBanner('New article created');
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5" />
                Add Article
              </button>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {post.cover_image && (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="size-16 rounded-lg object-cover shrink-0 border border-border"
                      />
                    )}
                    <div>
                      <h4 className="font-display text-base font-bold text-foreground">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {post.excerpt}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                        <span className="font-mono">/{post.slug}</span>
                        <span>·</span>
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="rounded bg-muted px-1.5 py-0.2 capitalize text-foreground font-semibold">
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPost(JSON.parse(JSON.stringify(post)))}
                      className="rounded bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                    >
                      Edit Article
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete article "${post.title}"?`)) {
                          deletePost(post.id);
                          triggerBanner(`Deleted article "${post.title}"`);
                        }
                      }}
                      className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CONSULTANT / ADVISOR BOOKINGS & FINANCE RECONCILIATION */}
        {/* ============================================================== */}
        {activeTab === 'advisor_bookings' && (
          <div className="mt-6 space-y-8">
            {/* 1. Header Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[0.68rem] uppercase font-bold tracking-wider text-muted-foreground block">
                  Advisor Bookings
                </span>
                <span className="font-display text-2xl font-bold text-foreground mt-1 block">
                  {advisorStats.totalCount}
                </span>
                <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                  From {registeredAdvisors.length} registered agencies
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[0.68rem] uppercase font-bold tracking-wider text-muted-foreground block">
                  Gross B2B Volume
                </span>
                <span className="font-display text-2xl font-bold text-foreground mt-1 block">
                  {formatPrice(advisorStats.grossTotalCents)}
                </span>
                <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                  Retail client value
                </span>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-xs">
                <span className="text-[0.68rem] uppercase font-bold tracking-wider text-primary block">
                  Advisor Commission (0-20%)
                </span>
                <span className="font-display text-2xl font-bold text-primary mt-1 block">
                  {formatPrice(advisorStats.commissionTotalCents)}
                </span>
                <span className="text-[0.65rem] text-primary/80 mt-0.5 block">
                  Retained by travel agencies
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <span className="text-[0.68rem] uppercase font-bold tracking-wider text-muted-foreground block">
                  Net Operator Collections
                </span>
                <span className="font-display text-2xl font-bold text-foreground mt-1 block">
                  {formatPrice(advisorStats.netOperatorTotalCents)}
                </span>
                <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                  Collected via agency card
                </span>
              </div>

              <div className={`rounded-xl border p-4 shadow-xs ${
                advisorStats.pendingFinanceCount > 0
                  ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                  : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              }`}>
                <span className="text-[0.68rem] uppercase font-bold tracking-wider block">
                  Finance Notice Status
                </span>
                <span className="font-display text-2xl font-bold mt-1 block">
                  {advisorStats.pendingFinanceCount === 0 ? 'All Reconciled' : `${advisorStats.pendingFinanceCount} Pending`}
                </span>
                <span className="text-[0.65rem] mt-0.5 block opacity-90">
                  {advisorStats.pendingFinanceCount === 0
                    ? 'All notified to finance desk'
                    : 'Requires notice to finance@'}
                </span>
              </div>
            </div>

            {/* 2. Filter & Action Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={advisorSearch}
                  onChange={(e) => setAdvisorSearch(e.target.value)}
                  placeholder="Search by reference, agency, advisor, client or tour..."
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={advisorFinanceFilter}
                  onChange={(e) => setAdvisorFinanceFilter(e.target.value as any)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground"
                >
                  <option value="All">All Finance Statuses</option>
                  <option value="pending">Pending Finance Notice (Action Needed)</option>
                  <option value="notified">Finance Department Notified</option>
                </select>

                <select
                  value={advisorStatusFilter}
                  onChange={(e) => setAdvisorStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground"
                >
                  <option value="All">All Booking Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => setShowAddAdvisorModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Authorize New Consultant</span>
                </button>
              </div>
            </div>

            {/* 3. Consultant Bookings Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              <div className="border-b border-border bg-muted/40 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                    <Briefcase className="size-4 text-primary" />
                    <span>Travel Consultant Bookings & Financial Remittances</span>
                  </h3>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Observe commissions (0-20% flexible), agency credit/debit card collections, traveler manifests & finance notices.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Showing {filteredAdvisorBookings.length} of {advisorBookings.length}
                </span>
              </div>

              {filteredAdvisorBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No travel consultant bookings match your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Reference & Date</th>
                        <th className="px-4 py-3">Travel Consultant & Agency</th>
                        <th className="px-4 py-3">Tour Expedition & Departure</th>
                        <th className="px-4 py-3">Pax & Clients</th>
                        <th className="px-4 py-3">Commercial Breakdown</th>
                        <th className="px-4 py-3">Payment Remittance</th>
                        <th className="px-4 py-3">Finance Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {filteredAdvisorBookings.map((b) => {
                        const details = b.advisorDetails;
                        const isNotified = details?.financeNotified;

                        return (
                          <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                            {/* Reference */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono font-bold text-primary block">
                                {b.reference}
                              </span>
                              <span className="inline-flex items-center rounded bg-muted text-foreground border border-border font-mono text-[0.62rem] font-bold px-1.5 py-0.2 my-0.5 mr-1">
                                {b.tourCode || resolveTourCode(b)}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded bg-primary/10 text-primary border border-primary/20 text-[0.6rem] font-bold px-1.5 py-0.2 my-0.5">
                                <Briefcase className="size-2.5" /> B2B Partner
                              </span>
                              <span className="text-[0.65rem] text-muted-foreground block">
                                {new Date(b.createdAt).toLocaleDateString()}
                              </span>
                            </td>

                            {/* Consultant & Agency */}
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <span className="font-bold text-foreground block">
                                  {details?.advisorName || 'Authorized Consultant'}
                                </span>
                                <span className="text-[0.7rem] text-primary font-semibold flex items-center gap-1">
                                  <Building2 className="size-3" />
                                  {details?.agencyName}
                                </span>
                                <span className="text-[0.65rem] text-muted-foreground block font-mono">
                                  {details?.advisorEmail}
                                </span>
                                {details?.iataCliaNumber && (
                                  <span className="text-[0.62rem] text-muted-foreground block">
                                    ID: {details.iataCliaNumber}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Tour & Date */}
                            <td className="px-4 py-3">
                              <span className="font-semibold text-foreground line-clamp-1">
                                {b.tourTitle}
                              </span>
                              <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                                <Calendar className="size-3 text-primary" />
                                <span className="font-mono font-bold text-foreground">{b.departureDate}</span>
                              </div>
                            </td>

                            {/* Pax & Clients */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-bold text-foreground block">
                                {b.guests} Pax ({b.leadName})
                              </span>
                              <button
                                onClick={() => setManifestModalBooking(b)}
                                className="mt-1 text-[0.65rem] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Users className="size-3" />
                                View Full Manifest
                              </button>
                            </td>

                            {/* Financials & Commission */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span className="text-muted-foreground text-[0.68rem] block">
                                  Gross: <strong className="text-foreground">{formatPrice(b.totalPriceCents, b.currency)}</strong>
                                </span>
                                <span className="text-primary font-bold block text-[0.7rem]">
                                  {details?.commissionRatePercent}% Comm: {formatPrice(details?.commissionAmountCents || 0, b.currency)}
                                </span>
                                <span className="text-foreground font-mono text-[0.7rem] block">
                                  Net Remitted: <strong>{formatPrice(details?.netOperatorAmountCents || 0, b.currency)}</strong>
                                </span>
                              </div>
                            </td>

                            {/* Payment */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span className="capitalize text-[0.68rem] font-semibold text-foreground flex items-center gap-1">
                                  <CreditCard className="size-3 text-emerald-600" />
                                  {details?.paymentMethod?.replace('_', ' ') || 'Credit Card'}
                                </span>
                                <span className="text-[0.65rem] font-mono text-muted-foreground block">
                                  •••• {details?.cardLast4 || '4242'}
                                </span>
                                <span className="text-[0.62rem] text-muted-foreground block truncate max-w-[120px]">
                                  {details?.cardholderName || 'Agency Card'}
                                </span>
                              </div>
                            </td>

                            {/* Finance Status */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isNotified ? (
                                <div className="space-y-1">
                                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[0.65rem] font-bold inline-flex items-center gap-1 border border-emerald-300">
                                    <Check className="size-3" /> Finance Notified
                                  </span>
                                  {details?.financeNotifiedAt && (
                                    <span className="text-[0.62rem] text-muted-foreground block">
                                      {new Date(details.financeNotifiedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-[0.65rem] font-bold inline-flex items-center gap-1 border border-amber-300">
                                    <Clock className="size-3" /> Pending Notice
                                  </span>
                                  <button
                                    onClick={() => {
                                      setFinanceModalBooking(b);
                                      setFinanceNotes(
                                        `Booking ${b.reference}: Net payment of ${formatPrice(details?.netOperatorAmountCents || 0, b.currency)} received from ${details?.agencyName} (${details?.commissionRatePercent}% commission retained). Please reconcile ledger.`
                                      );
                                    }}
                                    className="text-[0.65rem] text-primary font-bold hover:underline block cursor-pointer"
                                  >
                                    Notify Finance Now
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Notify Finance Button */}
                                <button
                                  onClick={() => {
                                    setFinanceModalBooking(b);
                                    setFinanceNotes(
                                      `Booking ${b.reference}: Net payment of ${formatPrice(details?.netOperatorAmountCents || 0, b.currency)} received from ${details?.agencyName} (${details?.commissionRatePercent}% commission retained). Please reconcile ledger.`
                                    );
                                  }}
                                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[0.7rem] font-semibold transition-colors cursor-pointer border ${
                                    isNotified
                                      ? 'bg-muted text-foreground hover:bg-muted/80 border-border'
                                      : 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-xs'
                                  }`}
                                  title="Send or update Finance Department reconciliation notice"
                                >
                                  <Send className="size-3" />
                                  <span>{isNotified ? 'Re-notify' : 'Notify Finance'}</span>
                                </button>

                                {/* Price-Free Client Voucher */}
                                <button
                                  onClick={() => setVoucherModalBooking(b)}
                                  className="inline-flex items-center gap-1 rounded bg-card border border-border px-2.5 py-1 text-[0.7rem] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                                  title="Generate Price-Free Client Voucher"
                                >
                                  <Printer className="size-3 text-emerald-600" />
                                  <span>Voucher</span>
                                </button>

                                {/* Full Manifest */}
                                <button
                                  onClick={() => setManifestModalBooking(b)}
                                  className="inline-flex items-center gap-1 rounded bg-card border border-border px-2.5 py-1 text-[0.7rem] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                                  title="View Passenger & Client Manifest"
                                >
                                  <FileText className="size-3 text-primary" />
                                  <span>Manifest</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. Registered Travel Consultants & Agencies Roster */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                    <Award className="size-4 text-primary" />
                    <span>Authorized Travel Consultants & Registered Agencies</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Authorized consultant accounts permitted to access the B2B portal with flexible 0-20% commission rates.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddAdvisorModal(true)}
                  className="rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="size-3.5" />
                  <span>Register Consultant</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {registeredAdvisors.map((adv) => (
                  <div
                    key={adv.id}
                    className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-sm font-bold text-foreground block">
                          {adv.name}
                        </strong>
                        <span className="text-xs text-primary font-semibold flex items-center gap-1">
                          <Building2 className="size-3" />
                          {adv.agencyName}
                        </span>
                      </div>
                      <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[0.62rem] font-bold">
                        {adv.defaultCommissionRate}% Comm
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-muted-foreground pt-1 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3 text-muted-foreground" />
                        <span className="font-mono text-[0.7rem] text-foreground">{adv.email}</span>
                      </div>
                      {adv.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3 text-muted-foreground" />
                          <span className="text-[0.7rem]">{adv.phone}</span>
                        </div>
                      )}
                      {adv.iataClia && (
                        <div className="text-[0.68rem] text-muted-foreground">
                          ID: <span className="font-mono font-semibold text-foreground">{adv.iataClia}</span> · {adv.country || 'Global'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: TRAVELER REVIEWS & RATINGS FEEDBACK CMS                */}
        {/* ============================================================== */}
        {activeTab === 'reviews' && (
          <div className="mt-6 space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Total Reviews</span>
                  <MessageSquare className="size-4 text-primary" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-foreground">
                  {reviews.length}
                </div>
                <span className="text-[0.65rem] text-muted-foreground">
                  Across all active journeys
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Platform Average</span>
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-primary flex items-baseline gap-1">
                  <span>{reviewStats.avg.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground font-normal">/ 5.0</span>
                </div>
                <span className="text-[0.65rem] text-success font-semibold">
                  Excellent guest sentiment
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>5-Star Ratings</span>
                  <Award className="size-4 text-amber-500" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-foreground">
                  {reviewStats.count5}
                </div>
                <span className="text-[0.65rem] text-muted-foreground">
                  {reviews.length > 0 ? Math.round((reviewStats.count5 / reviews.length) * 100) : 0}% top-tier reviews
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Helpful Upvotes</span>
                  <CheckCircle className="size-4 text-success" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-foreground">
                  {reviewStats.helpful}
                </div>
                <span className="text-[0.65rem] text-muted-foreground">
                  Community engagement
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reviews by traveler name, tour, title, comment, or country..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[0.7rem] uppercase font-bold text-muted-foreground mr-1">
                  Stars:
                </span>
                <button
                  type="button"
                  onClick={() => setReviewStarFilter('all')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    reviewStarFilter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewStarFilter(s)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer ${
                      reviewStarFilter === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>{s}</span>
                    <Star className={`size-3 ${reviewStarFilter === s ? 'fill-primary-foreground text-primary-foreground' : 'fill-amber-400 text-amber-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews Roster Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-[0.65rem] text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-4 py-3">Tour Expedition</th>
                      <th className="px-4 py-3">Traveler Details</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Review Feedback</th>
                      <th className="px-4 py-3">Official Response</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No reviews match the search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground max-w-[200px]">
                            <button
                              type="button"
                              onClick={() => onSelectTour(rev.tourSlug)}
                              className="text-left text-xs text-primary hover:underline font-bold block truncate cursor-pointer"
                            >
                              {rev.tourSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </button>
                            <span className="text-[0.65rem] text-muted-foreground font-mono">
                              Slug: {rev.tourSlug}
                            </span>
                          </td>
                          <td className="px-4 py-3 min-w-[150px]">
                            <div className="font-bold text-foreground">{rev.authorName}</div>
                            <div className="text-[0.7rem] text-muted-foreground flex items-center gap-1">
                              <MapPin className="size-3" />
                              <span>{rev.authorLocation}</span>
                            </div>
                            <span className="inline-block mt-0.5 rounded bg-muted px-1.5 py-0.2 text-[0.62rem] text-muted-foreground">
                              {rev.travelerType}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StarRating rating={rev.rating} size="xs" showValue />
                            <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                              {new Date(rev.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-[280px]">
                            <div className="font-bold text-foreground truncate">{rev.title}</div>
                            <p className="text-[0.7rem] text-muted-foreground line-clamp-2 mt-0.5">
                              {rev.comment}
                            </p>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            {rev.hostReply ? (
                              <div className="rounded bg-primary/10 border border-primary/20 p-1.5 text-[0.68rem] text-primary">
                                <span className="font-bold block">Replied by {rev.hostReply.author}</span>
                                <span className="line-clamp-1 italic">"{rev.hostReply.comment}"</span>
                              </div>
                            ) : (
                              <span className="text-[0.7rem] text-muted-foreground italic">
                                Pending response
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyModalReview(rev);
                                  setReplyComment(rev.hostReply ? rev.hostReply.comment : '');
                                }}
                                className="rounded px-2 py-1 text-[0.7rem] font-bold bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer transition-colors"
                              >
                                {rev.hostReply ? 'Edit Reply' : 'Reply'}
                              </button>
                              <button
                                type="button"
                                onClick={() => onSelectTour(rev.tourSlug)}
                                className="rounded p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="View Tour Details"
                              >
                                <ExternalLink className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete review from "${rev.authorName}"?`)) {
                                    deleteReview(rev.id);
                                    triggerBanner(`Deleted review from ${rev.authorName}`);
                                  }
                                }}
                                className="rounded p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                                title="Delete Review"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SYSTEM & FACTORY RESET                                 */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="mt-6 max-w-2xl space-y-6">
            {/* Global Rooming Policy Settings */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Bed className="size-5 text-primary" />
                  Global Rooming & Single Supplement Policies
                </h3>
                <span className="text-[0.7rem] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                  System Rates
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configure default rooming rates and policy descriptions used across multi-day trip pages when individual tour overrides are not specified. Note: Day Tours are single-day excursions with no lodging; rooming policies do not apply to Day Tours.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Default Single Supplement Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={siteContent.defaultSingleSupplementPercent ?? 15}
                      onChange={(e) =>
                        updateSiteContent({
                          defaultSingleSupplementPercent: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-md border border-input bg-background p-2 pr-7 text-sm font-mono font-bold text-foreground focus:ring-1 focus:ring-primary"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-muted-foreground">%</span>
                  </div>
                  <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                    Applies trip price + 15% (or set %) for solo travellers choosing single rooms.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Couples / Double Bed Policy
                  </label>
                  <input
                    type="text"
                    value={siteContent.roomPolicyNoteDouble ?? ''}
                    placeholder="Double room for couples (1 large bed)"
                    onChange={(e) =>
                      updateSiteContent({ roomPolicyNoteDouble: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[0.65rem] text-emerald-600 mt-0.5 block">
                    Standard base price (0% surcharge)
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Twin Share (Friends / Companions) Policy
                  </label>
                  <input
                    type="text"
                    value={siteContent.roomPolicyNoteTwin ?? ''}
                    placeholder="Twin share can be shared by two same-gender travellers or friends (2 single beds)"
                    onChange={(e) =>
                      updateSiteContent({ roomPolicyNoteTwin: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[0.65rem] text-emerald-600 mt-0.5 block">
                    Standard base price (0% surcharge)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Single Room (Solo Traveller) Policy
                  </label>
                  <input
                    type="text"
                    value={siteContent.roomPolicyNoteSingle ?? ''}
                    placeholder="Single room for solo travelers (subject to apply single supplement: +15% more)"
                    onChange={(e) =>
                      updateSiteContent({ roomPolicyNoteSingle: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[0.65rem] text-amber-700 dark:text-amber-400 mt-0.5 block">
                    Subject to +{siteContent.defaultSingleSupplementPercent ?? 15}% single supplement
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => triggerBanner('Global Rooming policies updated successfully!')}
                  className="rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  Save Rooming Policy Settings
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">
                Data Persistence & Factory Reset
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All custom edits made across tours, destinations, day-by-day itineraries, and site texts are saved live to the browser's storage and immediately reflected across the website.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAllToDefaults}
                  className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="size-3.5" />
                  Reset Entire Website to Original Factory Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: FULL TOUR EDITOR (EVERY SINGLE FIELD + ITINERARY DAYS)  */}
      {/* ============================================================== */}
      {editingTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingTour(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer z-10"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-4 mb-6">
              <span className="eyebrow text-primary">Master Tour Editor</span>
              <h2 className="text-2xl font-display font-bold text-foreground mt-1">
                {isNewTourModal ? 'Create New Tour' : `Editing: ${editingTour.title}`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                All modifications will be updated across the homepage, tour catalog, and booking engine.
              </p>
            </div>

            <form onSubmit={handleSaveTourForm} className="space-y-6 text-xs">
              {/* 1. Basic Info */}
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                <h4 className="font-display text-sm font-bold text-foreground">1. Core Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Tour Title</label>
                    <input
                      type="text"
                      required
                      value={editingTour.title}
                      onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={editingTour.slug}
                      onChange={(e) => setEditingTour({ ...editingTour, slug: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Continent</label>
                    <select
                      value={editingTour.continent || 'Europe'}
                      onChange={(e) => setEditingTour({ ...editingTour, continent: e.target.value as any })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                    >
                      <option value="Europe">Europe</option>
                      <option value="Asia">Asia</option>
                      <option value="Africa">Africa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Destination Region</label>
                    <select
                      value={editingTour.region || 'Istanbul & Marmara'}
                      onChange={(e) => setEditingTour({ ...editingTour, region: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                    >
                      {destinationRegions.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Place / Sub-location</label>
                    <input
                      type="text"
                      value={editingTour.place || ''}
                      onChange={(e) => setEditingTour({ ...editingTour, place: e.target.value })}
                      placeholder="e.g. Göbeklitepe & Urfa"
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Tour Type</label>
                    <select
                      value={editingTour.tour_type}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        setEditingTour({
                          ...editingTour,
                          tour_type: newType,
                          nights: newType === 'day' ? 0 : (editingTour.nights || 1),
                          days: newType === 'day' ? 1 : Math.max(1, editingTour.days),
                          max_pax: newType === 'day' ? Math.min(12, editingTour.max_pax || 12) : (editingTour.max_pax || 12),
                        });
                      }}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                    >
                      <option value="multi_day">Multi-day Expedition</option>
                      <option value="day">Day Tour</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Duration & Commercial Pricing */}
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                <h4 className="font-display text-sm font-bold text-foreground">2. Duration, Pricing & Group Sizes</h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Days</label>
                    <input
                      type="number"
                      min={1}
                      disabled={editingTour.tour_type === 'day'}
                      value={editingTour.tour_type === 'day' ? 1 : editingTour.days}
                      onChange={(e) => setEditingTour({ ...editingTour, days: Number(e.target.value) })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Nights</label>
                    <input
                      type="number"
                      min={0}
                      disabled={editingTour.tour_type === 'day'}
                      value={editingTour.tour_type === 'day' ? 0 : editingTour.nights}
                      onChange={(e) => setEditingTour({ ...editingTour, nights: Number(e.target.value) })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono disabled:opacity-60"
                    />
                    {editingTour.tour_type === 'day' && (
                      <span className="text-[0.62rem] text-muted-foreground mt-0.5 block">0 Nights (Day Tour)</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Price (€ / Pax)</label>
                    <input
                      type="number"
                      min={10}
                      value={Math.round(editingTour.price_cents / 100)}
                      onChange={(e) => setEditingTour({ ...editingTour, price_cents: Number(e.target.value) * 100 })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">
                      Max Group {editingTour.tour_type === 'day' ? '(Max 12)' : ''}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={editingTour.tour_type === 'day' ? 12 : 24}
                      value={editingTour.max_pax || 12}
                      onChange={(e) => setEditingTour({ ...editingTour, max_pax: Number(e.target.value) })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                    />
                    {editingTour.tour_type === 'day' && (
                      <span className="text-[0.62rem] text-primary mt-0.5 block font-semibold">Capped at 12 pax</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-muted-foreground mb-1 uppercase">Difficulty</label>
                    <select
                      value={editingTour.difficulty || 'Moderate'}
                      onChange={(e) => setEditingTour({ ...editingTour, difficulty: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Challenging">Challenging</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2.5 Pricing & Policy: Group Tiers for Day Tours vs Rooming Types for Multi-Day */}
              {editingTour.tour_type === 'day' || editingTour.days === 1 ? (
                <div className="rounded-xl border border-emerald-500/30 p-4 bg-emerald-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                      <Users className="size-4 text-emerald-600" />
                      2.5 Day Tour Group Pricing Tiers (No Accommodation / Rooming)
                    </h4>
                    <span className="text-[0.7rem] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold px-2 py-0.5 rounded">
                      Rooming Options Removed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Day Tours do NOT include overnight hotel accommodation (guests remain at their own hotel or apartment in the city). Rooming options, twin/double configurations, and single supplements are completely disabled. Pricing is based on Adult fares and automatic tiered group discounts for parties up to 12 guests.
                  </p>

                  <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1 border-b border-border">
                      <span>Group Discount Tiers (Calculated from Adult Base Fare)</span>
                      <span className="text-primary font-mono">Adult Fare: €{Math.round(editingTour.price_cents / 100)} / pax</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      {DAY_TOUR_GROUP_TIERS.map((tier: (typeof DAY_TOUR_GROUP_TIERS)[number]) => {
                        const calculated = calculateDayTourPricing(editingTour.price_cents, tier.minGuests);
                        return (
                          <div key={tier.label} className="p-2.5 rounded-lg border border-border bg-muted/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground text-[0.75rem]">{tier.label}</span>
                              {tier.discountPercent > 0 ? (
                                <span className="text-[0.65rem] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                  -{tier.discountPercent}% OFF
                                </span>
                              ) : (
                                <span className="text-[0.65rem] font-semibold text-muted-foreground">Standard</span>
                              )}
                            </div>
                            <span className="text-[0.65rem] text-muted-foreground block">
                              {tier.minGuests}–{tier.maxGuests} Guests
                            </span>
                            <span className="font-mono font-bold text-foreground text-sm block">
                              €{Math.round(calculated.effectivePricePerPersonCents / 100)}
                              <span className="text-[0.65rem] font-normal text-muted-foreground"> / pax</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs flex items-start gap-2.5">
                    <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-foreground block">Day Tour Rules:</span>
                      <span className="text-muted-foreground text-[0.72rem] leading-relaxed block mt-0.5">
                        • Interactive calendar view replaces the date dropdown for direct date selection.
                        • Only Adult & Group tickets are booked (up to 12 people per booking).
                        • No room selection or lodging supplement is collected or transmitted to field operations.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                      <Bed className="size-4 text-primary" />
                      2.5 Rooming Types & Single Supplement Rates
                    </h4>
                    <span className="text-[0.7rem] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                      Editable Room Rates
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Configure room types and rates for this tour. Double rooms for couples and Twin share for friends/same-gender travellers use the standard base price. Solo travellers in single rooms are subject to the single supplement (+15% standard).
                  </p>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block font-bold text-muted-foreground mb-1 uppercase text-xs">
                        Single Supplement (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={editingTour.single_supplement_percent ?? 15}
                          onChange={(e) =>
                            setEditingTour({
                              ...editingTour,
                              single_supplement_percent: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-md border border-input bg-background p-2 pr-7 text-foreground font-mono font-bold"
                        />
                        <span className="absolute right-2.5 top-2 text-xs font-bold text-muted-foreground">%</span>
                      </div>
                      <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                        Default: +15% of trip price
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-muted-foreground mb-1 uppercase text-xs">
                        Single Room Surcharge (€)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder={`Auto: €${Math.round((editingTour.price_cents / 100) * ((editingTour.single_supplement_percent ?? 15) / 100))}`}
                        value={
                          editingTour.single_supplement_cents != null
                            ? Math.round(editingTour.single_supplement_cents / 100)
                            : ''
                        }
                        onChange={(e) =>
                          setEditingTour({
                            ...editingTour,
                            single_supplement_cents:
                              e.target.value === '' ? null : Number(e.target.value) * 100,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                      />
                      <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                        Optional flat override (leave empty for %)
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-muted-foreground mb-1 uppercase text-xs">
                        Double & Twin Share Rate
                      </label>
                      <div className="p-2 rounded-md border border-border bg-background text-xs font-mono font-bold text-emerald-600 flex items-center justify-between">
                        <span>Standard Base</span>
                        <span>€{Math.round(editingTour.price_cents / 100)} / Pax</span>
                      </div>
                      <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                        Included (0% supplement)
                      </span>
                    </div>
                  </div>

                  {/* Live Preview Card */}
                  <div className="p-3 rounded-lg border border-border bg-card text-xs space-y-1.5">
                    <span className="font-bold text-foreground block">Customer Pricing Preview:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[0.72rem]">
                      <div className="p-2 rounded bg-muted/40">
                        <span className="font-semibold block text-foreground">Double Room (Couples):</span>
                        <span className="text-muted-foreground">€{Math.round(editingTour.price_cents / 100)} / person (1 bed)</span>
                      </div>
                      <div className="p-2 rounded bg-muted/40">
                        <span className="font-semibold block text-foreground">Twin Share (Friends):</span>
                        <span className="text-muted-foreground">€{Math.round(editingTour.price_cents / 100)} / person (2 beds)</span>
                      </div>
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                        <span className="font-semibold block text-amber-800 dark:text-amber-300">
                          Single Room (Solo):
                        </span>
                        <span className="text-amber-900 dark:text-amber-200 font-bold">
                          €{
                            Math.round(editingTour.price_cents / 100) +
                            (editingTour.single_supplement_cents != null
                              ? Math.round(editingTour.single_supplement_cents / 100)
                              : Math.round(
                                  (editingTour.price_cents / 100) *
                                    ((editingTour.single_supplement_percent ?? 15) / 100)
                                ))
                          }{' '}
                          (+€{
                            editingTour.single_supplement_cents != null
                              ? Math.round(editingTour.single_supplement_cents / 100)
                              : Math.round(
                                  (editingTour.price_cents / 100) *
                                    ((editingTour.single_supplement_percent ?? 15) / 100)
                                )
                          })
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom room policy notes */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Custom Rooming Descriptions & Policy Notes
                    </span>
                    <div className="grid gap-2 sm:grid-cols-3 text-xs">
                      <div>
                        <label className="block text-[0.7rem] text-muted-foreground mb-1">Double Room Note</label>
                        <input
                          type="text"
                          value={editingTour.room_policy_notes?.double ?? ''}
                          placeholder="Double room for couples (1 large bed)"
                          onChange={(e) =>
                            setEditingTour({
                              ...editingTour,
                              room_policy_notes: {
                                ...editingTour.room_policy_notes,
                                double: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded border border-input bg-background p-1.5 text-xs text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.7rem] text-muted-foreground mb-1">Twin Share Note</label>
                        <input
                          type="text"
                          value={editingTour.room_policy_notes?.twin ?? ''}
                          placeholder="Twin share for 2 same-gender or friends"
                          onChange={(e) =>
                            setEditingTour({
                              ...editingTour,
                              room_policy_notes: {
                                ...editingTour.room_policy_notes,
                                twin: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded border border-input bg-background p-1.5 text-xs text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.7rem] text-muted-foreground mb-1">Single Room Note</label>
                        <input
                          type="text"
                          value={editingTour.room_policy_notes?.single ?? ''}
                          placeholder="Single room for solo travelers (+15%)"
                          onChange={(e) =>
                            setEditingTour({
                              ...editingTour,
                              room_policy_notes: {
                                ...editingTour.room_policy_notes,
                                single: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded border border-input bg-background p-1.5 text-xs text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Hero Image & Descriptions */}
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                <h4 className="font-display text-sm font-bold text-foreground">3. Imagery & Story</h4>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1 uppercase">Hero Image URL</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      required
                      value={editingTour.hero_image}
                      onChange={(e) => setEditingTour({ ...editingTour, hero_image: e.target.value })}
                      className="flex-1 rounded-md border border-input bg-background p-2 text-foreground font-mono"
                    />
                    <img
                      src={editingTour.hero_image}
                      alt="Preview"
                      className="size-10 rounded object-cover border border-border shrink-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1 uppercase">Short Summary (2-3 sentences)</label>
                  <textarea
                    rows={2}
                    value={editingTour.summary || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, summary: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1 uppercase">Complete Trip Description</label>
                  <textarea
                    rows={4}
                    value={editingTour.description || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>
              </div>

              {/* 4. Day-by-Day Itineraries Editor */}
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-display text-sm font-bold text-foreground">
                    4. Day-by-Day Itinerary ({editingTour.daysList?.length || 0} Days)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDays = editingTour.daysList || [];
                      const nextNum = currentDays.length + 1;
                      const newDayItem: TourDay = {
                        id: `day-${nextNum}-${Math.random().toString(36).substring(2, 6)}`,
                        tour_id: editingTour.id,
                        day_number: nextNum,
                        title: `Day ${nextNum} Highlights`,
                        body: 'Description of the route, visits, and cultural experiences.'
                      };
                      setEditingTour({
                        ...editingTour,
                        days: nextNum,
                        daysList: [...currentDays, newDayItem]
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded bg-primary/10 text-primary px-2.5 py-1 text-xs font-bold hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    <Plus className="size-3" />
                    Add Itinerary Day
                  </button>
                </div>

                <div className="space-y-4">
                  {(editingTour.daysList || []).map((day, idx) => (
                    <div key={day.id || idx} className="rounded-lg border border-border bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">Day {day.day_number}:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = (editingTour.daysList || []).filter((_, i) => i !== idx).map((d, i) => ({ ...d, day_number: i + 1 }));
                            setEditingTour({
                              ...editingTour,
                              days: filtered.length,
                              daysList: filtered
                            });
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                          title="Remove Day"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const updated = [...(editingTour.daysList || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setEditingTour({ ...editingTour, daysList: updated });
                          }}
                          placeholder="Day Title (e.g. Istanbul | Old Town Heritage)"
                          className="w-full rounded border border-input bg-background p-1.5 text-xs font-semibold text-foreground"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          value={day.body}
                          onChange={(e) => {
                            const updated = [...(editingTour.daysList || [])];
                            updated[idx] = { ...updated[idx], body: e.target.value };
                            setEditingTour({ ...editingTour, daysList: updated });
                          }}
                          placeholder="Day description..."
                          className="w-full rounded border border-input bg-background p-1.5 text-xs text-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
                  className="rounded-md border border-input px-4 py-2 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-6 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
                >
                  {isNewTourModal ? 'Create Tour' : 'Save All Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DESTINATION REGION EDITOR                               */}
      {/* ============================================================== */}
      {editingRegion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <button
              onClick={() => setEditingRegion(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              Edit Destination Region
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Changes reflect on the destination showcase cards and continent filtering.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateDestinationRegion(editingRegion.id, editingRegion);
                triggerBanner(`Updated region "${editingRegion.name}"`);
                setEditingRegion(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Region Name</label>
                <input
                  type="text"
                  required
                  value={editingRegion.name}
                  onChange={(e) => setEditingRegion({ ...editingRegion, name: e.target.value })}
                  className="w-full rounded border border-input bg-background p-2 text-foreground font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Continent</label>
                  <select
                    value={editingRegion.continent}
                    onChange={(e) => setEditingRegion({ ...editingRegion, continent: e.target.value as any })}
                    className="w-full rounded border border-input bg-background p-2 text-foreground font-semibold"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Africa">Africa</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={editingRegion.subtitle}
                    onChange={(e) => setEditingRegion({ ...editingRegion, subtitle: e.target.value })}
                    className="w-full rounded border border-input bg-background p-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Hero Image URL</label>
                <input
                  type="text"
                  required
                  value={editingRegion.heroImage}
                  onChange={(e) => setEditingRegion({ ...editingRegion, heroImage: e.target.value })}
                  className="w-full rounded border border-input bg-background p-2 text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingRegion.description}
                  onChange={(e) => setEditingRegion({ ...editingRegion, description: e.target.value })}
                  className="w-full rounded border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRegion(null)}
                  className="rounded border border-input px-3.5 py-1.5 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-5 py-1.5 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Save Region
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: POST EDITOR                                             */}
      {/* ============================================================== */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <button
              onClick={() => setEditingPost(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              Edit Journal Article
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updatePost(editingPost.id, editingPost);
                triggerBanner(`Updated article "${editingPost.title}"`);
                setEditingPost(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full rounded border border-input bg-background p-2 text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Excerpt</label>
                <input
                  type="text"
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full rounded border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">Body Text</label>
                <textarea
                  rows={5}
                  value={editingPost.body}
                  onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })}
                  className="w-full rounded border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded border border-input px-3.5 py-1.5 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-5 py-1.5 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOTIFY FINANCE DEPARTMENT                               */}
      {/* ============================================================== */}
      {financeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl my-8">
            <button
              onClick={() => setFinanceModalBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 text-primary mb-2">
              <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                <Send className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Notify Finance Department
                </h3>
                <span className="text-[0.7rem] text-muted-foreground">
                  Booking Ref: <strong className="font-mono text-primary">{financeModalBooking.reference}</strong>
                </span>
              </div>
            </div>

            {/* Financial Reconciliation Summary */}
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Agency & Consultant:</span>
                <span className="font-bold text-foreground">
                  {financeModalBooking.advisorDetails?.agencyName} ({financeModalBooking.advisorDetails?.advisorName})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tour Expedition:</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {financeModalBooking.tourTitle}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Departure Date:</span>
                <span className="font-mono font-bold text-foreground">
                  {financeModalBooking.departureDate} ({financeModalBooking.guests} pax)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gross Retail Price:</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(financeModalBooking.totalPriceCents, financeModalBooking.currency)}
                </span>
              </div>

              <div className="flex justify-between items-center text-primary font-bold">
                <span>Advisor Retained Comm ({financeModalBooking.advisorDetails?.commissionRatePercent}%):</span>
                <span>
                  {formatPrice(financeModalBooking.advisorDetails?.commissionAmountCents || 0, financeModalBooking.currency)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/60 text-sm font-bold text-foreground">
                <span>Net Operator Collected:</span>
                <span className="font-mono text-emerald-600">
                  {formatPrice(financeModalBooking.advisorDetails?.netOperatorAmountCents || 0, financeModalBooking.currency)}
                </span>
              </div>

              <div className="text-[0.68rem] text-muted-foreground flex items-center gap-1.5 pt-1">
                <CreditCard className="size-3 text-emerald-600" />
                <span>
                  Paid via agency {financeModalBooking.advisorDetails?.paymentMethod === 'debit_card' ? 'Debit Card' : 'Credit Card'} (•••• {financeModalBooking.advisorDetails?.cardLast4 || '4242'})
                </span>
              </div>
            </div>

            <form onSubmit={handleSendFinanceNotification} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">
                  Recipient Dispatch Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    readOnly
                    value="finance@atlasglobaltours.com"
                    className="w-full rounded-md border border-input bg-muted pl-9 pr-3 py-2 text-foreground font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-muted-foreground mb-1">
                  Reconciliation Notes & Memo for Finance Desk
                </label>
                <textarea
                  rows={4}
                  required
                  value={financeNotes}
                  onChange={(e) => setFinanceNotes(e.target.value)}
                  placeholder="Enter invoice reference, ledger code, or specific accounting reconciliation instructions..."
                  className="w-full rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFinanceModalBooking(null)}
                  className="rounded-md border border-input px-3.5 py-2 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Transmit to Finance Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PASSENGER & CLIENT MANIFEST                             */}
      {/* ============================================================== */}
      {manifestModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setManifestModalBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer z-10"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-border pb-3 mb-4">
              <span className="eyebrow text-primary">Traveler Manifest</span>
              <h3 className="font-display text-lg font-bold text-foreground mt-0.5">
                Client Manifest — Booking {manifestModalBooking.reference}
              </h3>
              <p className="text-xs text-muted-foreground">
                {manifestModalBooking.tourTitle} · {manifestModalBooking.departureDate} ({manifestModalBooking.guests} Passengers)
              </p>
            </div>

            {/* Clients List */}
            <div className="space-y-4 text-xs">
              {(manifestModalBooking.advisorDetails?.clients || []).length > 0 ? (
                manifestModalBooking.advisorDetails!.clients.map((pax, idx) => (
                  <div
                    key={pax.id || idx}
                    className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Users className="size-4 text-primary" />
                        Passenger {idx + 1}: {pax.firstName} {pax.middleName ? `${pax.middleName} ` : ''}{pax.lastName}
                      </span>
                      {(() => {
                        const isDayTourBooking =
                          tours.find((t) => t.slug === manifestModalBooking.tourSlug || t.id === manifestModalBooking.tourId)?.tour_type === 'day' ||
                          manifestModalBooking.tourTitle.toLowerCase().includes('day') ||
                          manifestModalBooking.tourSlug.includes('day');
                        return isDayTourBooking ? (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-semibold text-[0.68rem] text-emerald-700 dark:text-emerald-300">
                            Day Excursion (No Rooming)
                          </span>
                        ) : (
                          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[0.68rem] text-muted-foreground">
                            {pax.roomPreference || 'Double'} Room
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">DOB</span>
                        <span className="font-mono text-foreground font-semibold">{pax.dob || 'On file'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">Gender</span>
                        <span className="text-foreground">{pax.gender || 'Specified'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">Passport Number</span>
                        <span className="font-mono font-bold text-foreground">{pax.passportNumber || 'On file'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">Passport Expiry</span>
                        <span className="font-mono text-foreground">
                          {pax.passportExpiry || 'Valid'} ({pax.passportCountry || 'Intl'})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-border/40">
                      <div>
                        <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">Food & Dietary Requirements</span>
                        <span className="text-primary font-semibold">{pax.dietaryRequirements || 'Standard Dining'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[0.65rem] uppercase font-bold">Medical & Health Notes</span>
                        <span className="text-foreground">{pax.medicalConditions || 'No medical alerts'}</span>
                      </div>
                    </div>

                    {(pax.phone || pax.email) && (
                      <div className="flex flex-wrap gap-4 text-[0.7rem] text-muted-foreground pt-1">
                        {pax.phone && <span>Phone: <strong className="text-foreground">{pax.phone}</strong></span>}
                        {pax.email && <span>Email: <strong className="text-foreground">{pax.email}</strong></span>}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <span className="font-bold text-foreground block">Lead Traveler: {manifestModalBooking.leadName}</span>
                  <div className="text-muted-foreground">
                    Email: {manifestModalBooking.leadEmail} · Phone: {manifestModalBooking.leadPhone}
                  </div>
                  {manifestModalBooking.dietaryNotes && (
                    <div className="text-primary font-semibold">
                      Dietary: {manifestModalBooking.dietaryNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setManifestModalBooking(null)}
                className="rounded-md bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 cursor-pointer"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PRICE-FREE CLIENT VOUCHER (FOR TRAVEL CONSULTANTS)      */}
      {/* ============================================================== */}
      {voucherModalBooking && (
        <AdvisorClientVoucher
          booking={voucherModalBooking}
          onClose={() => setVoucherModalBooking(null)}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL: AUTHORIZE NEW TRAVEL CONSULTANT                         */}
      {/* ============================================================== */}
      {showAddAdvisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl my-8">
            <button
              onClick={() => setShowAddAdvisorModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 text-primary mb-3">
              <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                <Briefcase className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Authorize Travel Consultant
                </h3>
                <span className="text-[0.7rem] text-muted-foreground">
                  Grant B2B partner access with 0-20% flexible commission privileges
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateAdvisorSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Consultant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdvName}
                    onChange={(e) => setNewAdvName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Authorized Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdvEmail}
                    onChange={(e) => setNewAdvEmail(e.target.value)}
                    placeholder="e.g. advisor@luxetravel.com"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Travel Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdvAgency}
                    onChange={(e) => setNewAdvAgency(e.target.value)}
                    placeholder="e.g. Virtuoso Member Agency"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    IATA / CLIA / ARC / True ID
                  </label>
                  <input
                    type="text"
                    value={newAdvIata}
                    onChange={(e) => setNewAdvIata(e.target.value)}
                    placeholder="e.g. IATA-0928419"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Agency Phone
                  </label>
                  <input
                    type="tel"
                    value={newAdvPhone}
                    onChange={(e) => setNewAdvPhone(e.target.value)}
                    placeholder="+1 (212) 555-0199"
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newAdvCountry}
                    onChange={(e) => setNewAdvCountry(e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-muted-foreground mb-1">
                    Default Commission (%)
                  </label>
                  <select
                    value={newAdvCommission}
                    onChange={(e) => setNewAdvCommission(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background p-2 text-foreground font-bold"
                  >
                    <option value={20}>20% (Full Standard)</option>
                    <option value={15}>15%</option>
                    <option value={12}>12%</option>
                    <option value={10}>10%</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAdvisorModal(false)}
                  className="rounded-md border border-input px-3.5 py-2 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Authorize Consultant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: OFFICIAL OPERATOR HOST REPLY TO TRAVELER REVIEW         */}
      {/* ============================================================== */}
      {replyModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <button
              onClick={() => setReplyModalReview(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-lg bg-primary/10 p-2 border border-primary/20 text-primary">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Official Operator Response
                </h3>
                <span className="text-[0.7rem] text-muted-foreground">
                  Replying to review by <strong className="text-foreground">{replyModalReview.authorName}</strong>
                </span>
              </div>
            </div>

            {/* Review summary excerpt */}
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1.5 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground truncate max-w-[280px]">
                  "{replyModalReview.title}"
                </span>
                <StarRating rating={replyModalReview.rating} size="xs" />
              </div>
              <p className="text-[0.7rem] text-muted-foreground italic line-clamp-2">
                "{replyModalReview.comment}"
              </p>
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4 text-xs">
              <div>
                <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Representative Name
                </label>
                <input
                  type="text"
                  required
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  required
                  value={replyRole}
                  onChange={(e) => setReplyRole(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Official Response Comment
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Thank you for traveling with us! We are thrilled to hear your feedback regarding our guide and itinerary..."
                  value={replyComment}
                  onChange={(e) => setReplyComment(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-2.5 text-foreground leading-relaxed"
                />
                <span className="text-[0.65rem] text-muted-foreground block mt-1">
                  This response will be displayed publicly on the Tour Details page under the traveler's review.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setReplyModalReview(null)}
                  className="rounded-md border border-input px-3.5 py-2 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
