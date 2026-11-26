import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  BookOpen,
  Shield,
  FileText,
  FileCode,
  Users,
  Search,
  ChevronRight,
  ExternalLink,
  Sparkles,
  HeartHandshake,
  Leaf,
  Layers,
  ArrowRight,
  Globe,
  Tag,
  Building,
} from 'lucide-react';
import { useTours } from '../context/ToursContext';
import { POSTS_DATA } from '../data/postsData';

interface SitemapPageProps {
  onNavigate: (path: string) => void;
  onSelectTour?: (slug: string) => void;
  onSelectPost?: (slug: string) => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({
  onNavigate,
  onSelectTour,
  onSelectPost,
}) => {
  const { tours } = useTours();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Split tours into Multi-Day and Day Tours
  const multiDayTours = useMemo(() => tours.filter((t) => t.days > 1), [tours]);
  const dayTours = useMemo(() => tours.filter((t) => t.days <= 1), [tours]);

  // Main static navigation pages
  const corePages = useMemo(
    () => [
      {
        title: 'Home / Expedition Portal',
        path: '/',
        description: 'Homepage featuring curated small-group departures, guides ethos, and continents overview.',
        category: 'core',
        priority: '1.0',
      },
      {
        title: 'Multi-Day Expeditions Directory',
        path: '/tours',
        description: 'All comprehensive multi-day journeys categorized across Europe, Asia, and Africa.',
        category: 'core',
        priority: '0.9',
      },
      {
        title: 'Day Tours & City Excursions',
        path: '/day-tours',
        description: 'Half-day and full-day immersive walking tours led by licensed local regional historians.',
        category: 'core',
        priority: '0.85',
      },
      {
        title: 'Side-by-Side Tour Comparison Matrix',
        path: '/compare',
        description: 'Evaluate multiple small-group tour packages side-by-side, comparing prices, durations, and key inclusions.',
        category: 'core',
        priority: '0.8',
      },
      {
        title: 'About Our Mission & Licensed Guides',
        path: '/about',
        description: 'Our founding principles, 100% licensed guide roster, small group philosophy, and safety standards.',
        category: 'core',
        priority: '0.7',
      },
      {
        title: 'Journal & Field Notes (Blog)',
        path: '/blog',
        description: 'Field dispatches, cultural notes, seasonal guides, and route insights from on-the-ground leaders.',
        category: 'core',
        priority: '0.8',
      },
      {
        title: 'Custom Trip Inquiry & Contact Desk',
        path: '/contact',
        description: 'Bespoke private journey planning, group coordination, and direct support desk.',
        category: 'core',
        priority: '0.7',
      },
      {
        title: 'Travel Advisor & Agent Portal (20% Comm)',
        path: '/advisor',
        description: 'Dedicated console for certified travel advisors, gross commission structures, and white-label client quotes.',
        category: 'portal',
        priority: '0.6',
      },
      {
        title: 'Traveler Account & Bookings',
        path: '/account',
        description: 'Traveler management portal for active booking vouchers, payment invoices, and departure notes.',
        category: 'portal',
        priority: '0.5',
      },
      {
        title: 'Traveler Login / Authentication',
        path: '/login',
        description: 'Secure sign-in gateway for registered travelers and account holders.',
        category: 'portal',
        priority: '0.5',
      },
      {
        title: 'Operations & Guide Console',
        path: '/operations',
        description: 'Internal operations dashboard for tour dispatchers, guide assignments, and manifests.',
        category: 'portal',
        priority: '0.4',
      },
      {
        title: 'Website Administration CMS',
        path: '/admin',
        description: 'Content management system for tours, pricing rules, reviews, and site configuration.',
        category: 'portal',
        priority: '0.4',
      },
    ],
    []
  );

  // Impact, Ethics & Responsibility
  const policyPages = useMemo(
    () => [
      {
        title: 'Sustainable Tourism Policy',
        path: '/sustainable-tourism',
        tag: 'Travelife Partner',
        description: 'Environmental stewardship, zero single-use plastics, carbon-conscious transport, and heritage site conservation.',
        category: 'ethics',
        priority: '0.75',
      },
      {
        title: 'Responsible Travel Charter',
        path: '/responsible-travel',
        tag: 'Ethical Guidelines',
        description: 'Fair wages for local guides, village micro-economies, respect for local customs, and wildlife welfare.',
        category: 'ethics',
        priority: '0.75',
      },
      {
        title: 'Atlas Cares Community Initiative',
        path: '/atlas-cares',
        tag: 'Community Impact',
        description: 'Direct philanthropic giveback: 1% of tour proceeds allocated to rural school supplies and historical preservation.',
        category: 'ethics',
        priority: '0.75',
      },
      {
        title: 'Modern Slavery & Human Trafficking Statement',
        path: '/modern-slavery-act',
        tag: 'Human Rights',
        description: 'Compliance with global anti-slavery legislation, ethical labor verification, and supply chain transparency.',
        category: 'ethics',
        priority: '0.6',
      },
      {
        title: 'Booking Terms & Conditions',
        path: '/terms',
        tag: 'Legal Contract',
        description: 'Deposit policies, cancellation terms, refund schedules, travel insurance obligations, and liability limits.',
        category: 'legal',
        priority: '0.5',
      },
      {
        title: 'Privacy & Cookie Policy',
        path: '/privacy',
        tag: 'Data Protection',
        description: 'GDPR / CCPA compliance, SSL encrypted transactions, data retention standards, and cookie controls.',
        category: 'legal',
        priority: '0.5',
      },
    ],
    []
  );

  // Filtered lists
  const query = searchQuery.toLowerCase().trim();

  const filteredCore = useMemo(() => {
    if (!query) return corePages;
    return corePages.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.path.toLowerCase().includes(query)
    );
  }, [corePages, query]);

  const filteredPolicies = useMemo(() => {
    if (!query) return policyPages;
    return policyPages.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tag.toLowerCase().includes(query)
    );
  }, [policyPages, query]);

  const filteredMultiDay = useMemo(() => {
    if (!query) return multiDayTours;
    return multiDayTours.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.summary?.toLowerCase().includes(query) ||
        t.continent?.toLowerCase().includes(query) ||
        t.region?.toLowerCase().includes(query)
    );
  }, [multiDayTours, query]);

  const filteredDayTours = useMemo(() => {
    if (!query) return dayTours;
    return dayTours.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.summary?.toLowerCase().includes(query) ||
        t.region?.toLowerCase().includes(query)
    );
  }, [dayTours, query]);

  const filteredPosts = useMemo(() => {
    if (!query) return POSTS_DATA;
    return POSTS_DATA.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt?.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }, [query]);

  const totalEntries =
    filteredCore.length +
    filteredPolicies.length +
    filteredMultiDay.length +
    filteredDayTours.length +
    filteredPosts.length;

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20 pt-6 sm:pt-8 text-neutral-900">
      <div className="container-page space-y-8">
        {/* Breadcrumb Header */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="size-3 text-neutral-400" />
          <span className="text-neutral-900 font-medium">Sitemap & Site Index</span>
        </nav>

        {/* Hero Section */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 size-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
              <Layers className="size-3.5" />
              Comprehensive Directory
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
              Atlas Global Tours Sitemap
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Complete index of all multi-day expeditions, guided day excursions, travel dispatches, sustainability initiatives, and traveler consoles across our worldwide direct boutique network.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <Compass className="size-4 text-primary" />
                {tours.length} Available Tours
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <BookOpen className="size-4 text-primary" />
                {POSTS_DATA.length} Field Articles
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <Leaf className="size-4 text-emerald-600" />
                6 Ethics & Care Charters
              </span>
              <span>•</span>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
              >
                <FileCode className="size-3.5" />
                XML Sitemap Feed
                <ExternalLink className="size-2.5" />
              </a>
            </div>
          </div>

          {/* Search Filter Box */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any destination, tour name, journal guide, or policy..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 px-1 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Sections' },
                { id: 'multiday', label: `Multi-Day (${filteredMultiDay.length})` },
                { id: 'day', label: `Day Tours (${filteredDayTours.length})` },
                { id: 'ethics', label: 'Ethics & Legal' },
                { id: 'blog', label: 'Journal' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 1: Core Navigation & Portals */}
        {(activeCategory === 'all' || activeCategory === 'core') && filteredCore.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Globe className="size-4" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-neutral-900">
                    Main Pages & Exploration Portals
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Essential company navigation, booking workflows, and account consoles
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-400">
                {filteredCore.length} pages
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCore.map((page) => (
                <button
                  key={page.path}
                  type="button"
                  onClick={() => onNavigate(page.path)}
                  className="flex flex-col justify-between text-left p-4 rounded-2xl border border-neutral-200/80 bg-white hover:border-primary hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                        {page.title}
                      </span>
                      <ArrowRight className="size-3.5 text-neutral-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {page.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[0.6875rem] text-neutral-400">
                    <code className="text-primary/80 font-mono">{page.path}</code>
                    <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                      Pri: {page.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Multi-Day Journeys */}
        {(activeCategory === 'all' || activeCategory === 'multiday') && filteredMultiDay.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Compass className="size-4" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-neutral-900">
                    Multi-Day Small Group Expeditions
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Deep cultural immersions, regional routes, and cross-border departures (8–14 days)
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-400">
                {filteredMultiDay.length} expeditions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMultiDay.map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    if (onSelectTour) onSelectTour(tour.slug);
                    else onNavigate(`/tours/${tour.slug}`);
                  }}
                  className="flex flex-col justify-between text-left p-4 rounded-2xl border border-neutral-200/80 bg-white hover:border-primary hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[0.6875rem] font-semibold">
                        <Calendar className="size-3" />
                        {tour.days} Days / {tour.nights} Nights
                      </span>
                      {tour.continent && (
                        <span className="text-[0.6875rem] text-neutral-500 font-medium bg-neutral-100 px-2 py-0.5 rounded-full">
                          {tour.continent}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors leading-snug">
                      {tour.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {tour.summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 text-[0.6875rem]">
                      Max {tour.max_pax || 10} travellers
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View itinerary <ArrowRight className="size-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Day Tours & Excursions */}
        {(activeCategory === 'all' || activeCategory === 'day') && filteredDayTours.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-neutral-900">
                    Day Tours & Guided Excursions
                  </h2>
                  <p className="text-xs text-neutral-500">
                    City immersions, palace tours, secret street walks, and half-day highlights
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-400">
                {filteredDayTours.length} excursions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDayTours.map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    if (onSelectTour) onSelectTour(tour.slug);
                    else onNavigate(`/tours/${tour.slug}`);
                  }}
                  className="flex flex-col justify-between text-left p-4 rounded-2xl border border-neutral-200/80 bg-white hover:border-primary hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[0.6875rem] font-semibold">
                        Day Tour
                      </span>
                      <span className="text-[0.6875rem] text-neutral-500">
                        {tour.region || tour.country || 'Istanbul & Regional'}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors leading-snug">
                      {tour.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {tour.summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 text-[0.6875rem]">
                      Skip-the-line guide
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View details <ArrowRight className="size-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Responsibility, Ethics & Legal Charters */}
        {(activeCategory === 'all' || activeCategory === 'ethics') && filteredPolicies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Leaf className="size-4" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-neutral-900">
                    Impact, Sustainability & Legal Charters
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Transparent operational policies, Modern Slavery statements, Travelife standards, and booking terms
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-400">
                {filteredPolicies.length} documents
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPolicies.map((policy) => (
                <button
                  key={policy.path}
                  type="button"
                  onClick={() => onNavigate(policy.path)}
                  className="flex flex-col justify-between text-left p-4 rounded-2xl border border-neutral-200/80 bg-white hover:border-emerald-600 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[0.6875rem] font-semibold">
                        {policy.tag}
                      </span>
                      <ArrowRight className="size-3.5 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {policy.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[0.6875rem] text-neutral-400">
                    <code className="text-emerald-700 font-mono">{policy.path}</code>
                    <span className="text-neutral-500">Official Charter</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Journal & Field Notes */}
        {(activeCategory === 'all' || activeCategory === 'blog') && filteredPosts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-neutral-900">
                    Journal & Field Notes
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Seasonal recommendations, hiking guides, and regional cultural insights
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-400">
                {filteredPosts.length} articles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => {
                    if (onSelectPost) onSelectPost(post.slug);
                    else onNavigate(`/blog/${post.slug}`);
                  }}
                  className="flex flex-col justify-between text-left p-4 rounded-2xl border border-neutral-200/80 bg-white hover:border-purple-600 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {post.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[0.6875rem] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-sm font-semibold text-neutral-900 group-hover:text-purple-700 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 text-[0.6875rem]">
                      Published guide
                    </span>
                    <span className="text-purple-700 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read article <ArrowRight className="size-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Sitemap Info Callout */}
        <div className="rounded-2xl border border-sidebar-border/30 bg-sidebar text-sidebar-foreground p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-sidebar-foreground">
              Looking for Automated Crawler Feeds?
            </h3>
            <p className="text-xs text-sidebar-foreground/75 max-w-xl">
              Our website provides an automated, standard-compliant XML sitemap formatted according to Sitemaps.org protocols for Google Search Console, Bing Webmaster Tools, and travel indexing bots.
            </p>
          </div>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <FileCode className="size-4" />
            Open sitemap.xml
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
