import React, { useState, useMemo } from 'react';
import { ArrowRight, ShieldCheck, MapPin, Users, HeartHandshake, Compass, Globe, Sparkles, Mail } from 'lucide-react';
import { HeroVideo } from '../components/HeroVideo';
import { TourCard } from '../components/TourCard';
import { NewsletterModal } from '../components/NewsletterModal';
import { DestinationRegion, DESTINATION_COUNTRIES, DestinationCountry, tourMatchesCountry } from '../data/toursData';
import { useTours } from '../context/ToursContext';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
  onSelectRegion?: (region: string, continent?: string) => void;
  onSelectContinent?: (continent: string) => void;
  onSelectCountry?: (country: string, continent?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectTour,
  onSelectRegion,
  onSelectContinent,
  onSelectCountry,
}) => {
  const { tours, destinationRegions, siteContent } = useTours();
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState<boolean | undefined>(undefined);

  const multiDayTours = tours.filter((t) => t.tour_type === 'multi_day' && t.is_published);
  const dayTours = tours.filter((t) => t.tour_type === 'day' && t.is_published);

  const valueProps = [
    {
      title: 'Small groups',
      description: 'Never more than 10 travellers on a departure.',
      icon: Users,
    },
    {
      title: 'Local guides',
      description: 'Licensed local guides who live where they lead.',
      icon: Compass,
    },
    {
      title: 'Fair pace',
      description: 'Time for long lunches, tea stops and detours.',
      icon: HeartHandshake,
    },
    {
      title: 'Direct operator',
      description: 'We run the trips ourselves — no middlemen.',
      icon: ShieldCheck,
    },
  ];

  const continents = ['All', 'Europe', 'Asia', 'Africa'];

  const filteredCountries = useMemo(() => {
    if (selectedContinent === 'All') return DESTINATION_COUNTRIES;
    return DESTINATION_COUNTRIES.filter((c) => c.continent === selectedContinent);
  }, [selectedContinent]);

  const handleCountryClick = (country: DestinationCountry) => {
    if (onSelectCountry) {
      onSelectCountry(country.name, country.continent);
    } else if (onSelectContinent) {
      onSelectContinent(country.continent);
    } else {
      onNavigate('/tours');
    }
  };

  const handleContinentClick = (cont: string) => {
    setSelectedContinent(cont);
  };

  const handleViewAllContinentTrips = (cont: string) => {
    if (onSelectContinent) {
      onSelectContinent(cont);
    } else {
      onNavigate('/tours');
    }
  };

  const fallbackImages: Record<string, string> = {
    Europe: '/countries/turkiye-europe.jpg',
    Asia: '/countries/jordan.jpg',
    Africa: '/countries/egypt.jpg',
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Full Width Stretched Video Across All Devices */}
      <section className="relative w-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[90vh] overflow-hidden bg-ink flex items-end">
        <HeroVideo />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden="true" />
        
        <div className="container-page relative z-10 flex min-h-[75vh] flex-col justify-end pb-16 pt-32">
          <p className="eyebrow text-sand">{siteContent.heroTagline}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-display font-bold text-background sm:text-5xl md:text-6xl leading-[1.15]">
            {siteContent.heroHeadline}
          </h1>
          <p className="mt-4 max-w-2xl text-background/85 text-base sm:text-lg leading-relaxed">
            {siteContent.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <button
              onClick={() => onNavigate('/tours')}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Explore multi-day journeys ({multiDayTours.length})
            </button>
            <button
              onClick={() => onNavigate('/day-tours')}
              className="inline-flex items-center justify-center rounded-md bg-card/90 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-foreground shadow-md hover:bg-card transition-colors cursor-pointer"
            >
              Day tours ({dayTours.length})
            </button>
            <button
              type="button"
              onClick={() => setIsNewsletterModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-sand/20 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-sand hover:bg-sand/30 transition-colors cursor-pointer border border-sand/30"
            >
              <Sparkles className="size-4" />
              <span>Get $150 Welcome Voucher</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Value Propositions Bar */}
      <section className="border-b border-border bg-paper">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map(({ title, description, icon: Icon }) => (
            <div key={title} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5 text-primary">
                <Icon className="size-4 shrink-0" />
                <h2 className="font-display text-lg font-bold">{title}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations & Places by Continent (Categorized According to Countries) */}
      <section className="container-page py-16 lg:py-20 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-primary">Destinations & Places by Continent</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground">
              Explore places categorized by countries
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Curated small group journeys structured regarding continents — Europe, Asia, and Africa — and categorized by country. Multi-country and cross-border expeditions are featured under every country visited.
            </p>
          </div>

          {/* Continent Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto bg-card border border-border p-1.5 rounded-xl shadow-xs">
            {continents.map((cont) => {
              const countryCount = cont === 'All'
                ? DESTINATION_COUNTRIES.length
                : DESTINATION_COUNTRIES.filter((c) => c.continent === cont).length;

              return (
                <button
                  key={cont}
                  onClick={() => handleContinentClick(cont)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                    selectedContinent === cont
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Globe className="size-3.5" />
                  <span>{cont === 'All' ? 'All Continents' : cont}</span>
                  <span className={`text-[0.65rem] px-1.5 py-0.2 rounded-full ${
                    selectedContinent === cont
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {countryCount} countries
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Countries Grid (Multi-country tours are featured under each regarding country) */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCountries.map((country) => {
            // Find all tours visiting this country (single and multi-country)
            const matchingTours = tours.filter((t) => tourMatchesCountry(t, country.name, country.continent));
            const count = matchingTours.length;
            const multiCountryTours = matchingTours.filter((t) => (t.countries || []).length > 1);
            const fallback = fallbackImages[country.continent] || fallbackImages.Europe;

            return (
              <div
                key={country.id}
                onClick={() => handleCountryClick(country)}
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-5 h-80 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl"
              >
                {/* Background Image with Error Fallback */}
                <img
                  src={country.heroImage}
                  alt={country.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/20" />

                {/* Badges: Continent at Top Left & Multi-Country indicator at Top Right */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                  <span className="rounded-full border border-sand/30 bg-ink/80 backdrop-blur-xs px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-sand shadow-xs">
                    {country.continent}
                  </span>
                  {multiCountryTours.length > 0 && (
                    <span className="rounded-full border border-primary/40 bg-primary/90 text-primary-foreground backdrop-blur-xs px-2 py-0.5 text-[0.62rem] font-bold shadow-xs flex items-center gap-1">
                      <Sparkles className="size-3" />
                      Multi-Country Route
                    </span>
                  )}
                </div>

                {/* Country Details & Places */}
                <div className="relative z-10 text-background">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl leading-none">{country.flag}</span>
                    <h3 className="font-display text-2xl font-bold leading-tight group-hover:text-sand transition-colors">
                      {country.name}
                    </h3>
                  </div>

                  <span className="text-[0.68rem] font-medium text-sand/90 line-clamp-1 block mb-2">
                    {country.subtitle}
                  </span>

                  {/* Highlighted Places Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {country.places.slice(0, 3).map((place) => (
                      <span
                        key={place}
                        className="rounded-md bg-background/15 backdrop-blur-xs px-1.5 py-0.5 text-[0.62rem] text-background/90"
                      >
                        {place}
                      </span>
                    ))}
                  </div>

                  {/* Multi-country callout if present */}
                  {multiCountryTours.length > 0 && (
                    <p className="text-[0.62rem] text-sand/80 mb-2 italic line-clamp-1">
                      Includes {multiCountryTours.length} cross-border expedition{multiCountryTours.length > 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Bottom Stats & Navigation */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-background/20 text-xs font-semibold text-sand">
                    <span>
                      {count} {count === 1 ? 'journey' : 'journeys'}
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] uppercase tracking-wider text-sand font-bold">
                      View journeys <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Trips by Selected Continent Action */}
        {selectedContinent !== 'All' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => handleViewAllContinentTrips(selectedContinent)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-5 py-2.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
            >
              Browse all {selectedContinent} itineraries
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Featured Multi-day Journeys */}
      <section className="container-page py-16 lg:py-20 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Signature routes</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground">
              Small group multi-day journeys
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Slow-travel itineraries designed around UNESCO landmarks, local home dining, scenic railways, and boutique stays.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/tours')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline self-start md:self-auto cursor-pointer"
          >
            <span>View all journeys ({multiDayTours.length})</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {multiDayTours.slice(0, 6).map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onSelect={() => onSelectTour(tour.slug)}
            />
          ))}
        </div>
      </section>

      {/* Day Tours Section */}
      <section className="container-page py-16 lg:py-20 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Day itineraries</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground">
              Istanbul & regional day tours
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Single-day deep dives led by licensed guides — secret rooftop panoramas, culinary tasting walks, and private Bosphorus yacht charters.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/day-tours')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline self-start md:self-auto cursor-pointer"
          >
            <span>View all day tours ({dayTours.length})</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dayTours.slice(0, 4).map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onSelect={() => onSelectTour(tour.slug)}
            />
          ))}
        </div>
      </section>

      {/* About & Ethos Section */}
      <section className="bg-paper py-20 border-b border-border">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-primary">The Atlas way</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-foreground leading-tight">
              {siteContent.brandEthosTitle}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
              {siteContent.brandEthosText1}
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed text-sm sm:text-base">
              {siteContent.brandEthosText2}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
              <div>
                <span className="font-display text-2xl font-bold text-primary">
                  2 – 10
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">Small group size (Guaranteed from 2)</p>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-primary">
                  100%
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">Licensed local guides</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onNavigate('/about')}
                className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                Learn our story & meet our guides
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80"
              alt="Local guide in Istanbul with travellers"
              className="h-96 w-full object-cover sm:h-[450px]"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-ink/85 backdrop-blur-md p-4 text-xs text-background border border-background/10">
              <p className="font-semibold text-sand">Direct Boutique Operator</p>
              <p className="mt-1 text-background/80">
                Istanbul Operations Desk: Sultanahmet Mah., Divanyolu Cad. No: 42, Fatih.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-14 text-center sm:px-12 sm:py-18">
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="eyebrow text-sand">Custom & set departures</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-background">
              Ready to sketch your route?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-background/80 leading-relaxed">
              Whether you want to join a guaranteed set departure with a like-minded small group or request a bespoke route across Europe, Asia, Africa, the Mediterranean, or the Americas, our operations team is here to help.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigate('/tours')}
                className="rounded-md bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Browse all small group journeys
              </button>
              <button
                onClick={() => onNavigate('/contact')}
                className="rounded-md bg-background/15 backdrop-blur-sm px-6 py-3 text-xs font-semibold text-background hover:bg-background/25 transition-colors cursor-pointer border border-background/20"
              >
                Inquire about custom trip
              </button>
              <button
                type="button"
                onClick={() => setIsNewsletterModalOpen(true)}
                className="rounded-md bg-sand/20 backdrop-blur-sm px-6 py-3 text-xs font-semibold text-sand hover:bg-sand/30 transition-colors cursor-pointer border border-sand/30 inline-flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5" />
                <span>Join Explorer Circle ($150 Off)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Travel Inspiration & $150 Voucher Launcher */}
      <aside
        aria-label="Newsletter sign-up offer"
        className="fixed bottom-6 left-5 z-40"
      >
        <button
          type="button"
          onClick={() => setIsNewsletterModalOpen(true)}
          className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3.5 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-md transition-all hover:bg-card hover:border-primary/50 hover:shadow-lg cursor-pointer"
          title="Subscribe for field dispatches & get $150 welcome credit"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <Mail className="size-3.5 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-medium hidden sm:inline">Travel Dispatches</span>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary">
            $150 Off
          </span>
        </button>
      </aside>

      {/* Interactive Newsletter Modal */}
      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />
    </div>
  );
};
