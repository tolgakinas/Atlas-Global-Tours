import React, { useState, useMemo } from 'react';
import { ArrowRight, ShieldCheck, MapPin, Users, HeartHandshake, Compass, Globe } from 'lucide-react';
import { HeroVideo } from '../components/HeroVideo';
import { TourCard } from '../components/TourCard';
import { TOURS_DATA, DESTINATION_REGIONS, DestinationRegion } from '../data/toursData';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
  onSelectRegion?: (region: string, continent?: string) => void;
  onSelectContinent?: (continent: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectTour,
  onSelectRegion,
  onSelectContinent,
}) => {
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  const multiDayTours = TOURS_DATA.filter((t) => t.tour_type === 'multi_day');
  const dayTours = TOURS_DATA.filter((t) => t.tour_type === 'day');

  const valueProps = [
    {
      title: 'Small groups',
      description: 'Never more than 12 travellers on a departure.',
      icon: Users,
    },
    {
      title: 'Local guides',
      description: 'Licensed Türkiye guides who live where they lead.',
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

  const filteredRegions = useMemo(() => {
    if (selectedContinent === 'All') return DESTINATION_REGIONS;
    return DESTINATION_REGIONS.filter((r) => r.continent === selectedContinent);
  }, [selectedContinent]);

  const handleRegionClick = (region: DestinationRegion) => {
    if (onSelectRegion) {
      onSelectRegion(region.name, region.continent);
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
    Europe: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
    Asia: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=1200&q=80',
    Africa: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] overflow-hidden bg-ink flex items-end">
        <HeroVideo />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden="true" />
        
        <div className="container-page relative z-10 flex min-h-[75vh] flex-col justify-end pb-16 pt-32">
          <p className="eyebrow text-sand">Türkiye specialists & Worldwide Journeys · Since 2012</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-display font-bold text-background sm:text-5xl md:text-6xl leading-[1.15]">
            Small group immersive tours run by locals.
          </h1>
          <p className="mt-4 max-w-2xl text-background/85 text-base sm:text-lg leading-relaxed">
            Multi-day journeys categorized regarding continents & places — spanning Europe (Istanbul, Aegean, Balkans), Asia (Cappadocia, Mesopotamia, Caucasus, Middle East, Vietnam), and Africa (Egypt, Morocco, Kenya).
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

      {/* Destinations & Places (Categorized by Continent) */}
      <section className="container-page py-16 lg:py-20 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-primary">Destinations & Places by Continent</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground">
              Explore places by continent
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Curated small group journeys structured regarding continents — Europe, Asia, and Africa. Select a continent or place to view complete itineraries and dates.
            </p>
          </div>

          {/* Continent Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto bg-card border border-border p-1.5 rounded-xl shadow-xs">
            {continents.map((cont) => {
              const count = cont === 'All'
                ? DESTINATION_REGIONS.length
                : DESTINATION_REGIONS.filter((r) => r.continent === cont).length;
              const tripsCount = cont === 'All'
                ? TOURS_DATA.length
                : TOURS_DATA.filter((t) => t.continent === cont).length;

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
                    {tripsCount} trips
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Cards Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRegions.map((region) => {
            const count = TOURS_DATA.filter((t) => t.region === region.name).length;
            const fallback = fallbackImages[region.continent] || fallbackImages.Europe;

            return (
              <div
                key={region.id}
                onClick={() => handleRegionClick(region)}
                className="group relative flex flex-col justify-end overflow-hidden rounded-xl border border-border bg-card p-5 h-72 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                {/* Background Image with Error Fallback */}
                <img
                  src={region.heroImage}
                  alt={region.name}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/55 to-ink/20" />

                {/* Continent Badge at Top Left */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="rounded-full border border-sand/30 bg-ink/75 backdrop-blur-xs px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-sand shadow-xs">
                    {region.continent}
                  </span>
                </div>

                {/* Region Details */}
                <div className="relative z-10 text-background">
                  <span className="text-[0.65rem] uppercase tracking-widest font-semibold text-sand/90 block mb-1">
                    {region.subtitle}
                  </span>
                  <h3 className="font-display text-xl font-bold leading-snug group-hover:text-sand transition-colors">
                    {region.name}
                  </h3>
                  <p className="mt-1 text-xs text-background/80 line-clamp-1">
                    {region.places.slice(0, 3).join(' · ')}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-background/20 text-xs font-semibold text-sand">
                    <span>{count} journey{count !== 1 ? 's' : ''}</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] uppercase tracking-wider text-sand font-bold">
                      View trips <ArrowRight className="size-3" />
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
      <section className="container-page py-16 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Signature Expeditions</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground">
              Multi-day journeys
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/tours')}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition-colors cursor-pointer"
          >
            See all ({multiDayTours.length})
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {multiDayTours.slice(0, 6).map((tour) => (
            <TourCard key={tour.id} tour={tour} onSelect={onSelectTour} />
          ))}
        </div>
      </section>

      {/* Brand Ethos Banner */}
      <section className="border-y border-border bg-paper/60 py-16">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-4/3 overflow-hidden rounded-xl shadow-lg">
            <img
              src="https://atlasglobaltours.com/wp-content/uploads/2025/01/patient-woman-doing-pottery-1365x2048.jpg"
              alt="Anatolian pottery craft artisan"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-background">
              <span className="text-xs uppercase tracking-widest text-sand font-bold block mb-1">
                Authentic Encounters
              </span>
              <p className="text-sm font-medium">
                Centuries-old pottery traditions in Avanos, Cappadocia
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="eyebrow text-primary">The Atlas Difference</p>
            <h2 className="text-3xl font-display font-bold text-foreground">
              Travel designed like you are visiting old friends.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We started Atlas Global Tours with one principle: skip the megaphone bus tours. 
              Instead, we travel in groups of 8 to 12 with guides who grew up in the valleys they show you.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You will dine in village homes, sip çay in Ottoman caravanserai courtyards, and walk ancient trails long after the day-tripper coaches have departed.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 border-t border-border">
              <div>
                <span className="font-display text-2xl font-bold text-primary block">100%</span>
                <span className="text-xs text-muted-foreground">Licensed Ministry Guides</span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-primary block">Max 12</span>
                <span className="text-xs text-muted-foreground">Travellers per group</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Day Tours */}
      <section className="container-page py-16 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Short Adventures</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground">
              Day tours & excursions
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/day-tours')}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition-colors cursor-pointer"
          >
            See all ({dayTours.length})
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dayTours.slice(0, 6).map((tour) => (
            <TourCard key={tour.id} tour={tour} onSelect={onSelectTour} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-paper py-16">
        <div className="container-page">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="eyebrow text-primary">Traveller Reflections</p>
            <h2 className="text-3xl font-display font-bold mt-1 text-foreground">
              Memories from our guests
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <p className="text-sm italic text-foreground/85 leading-relaxed">
                "Our guide Serkan did not just take us to Göbeklitepe; he unlocked 12,000 years of civilization for us. The dinner in Urfa with local musicians was the absolute highlight of our year."
              </p>
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  DL
                </div>
                <div>
                  <span className="text-xs font-semibold block text-foreground">David & Laura M.</span>
                  <span className="text-[0.65rem] text-muted-foreground">San Francisco, CA · Eastern Türkiye Tour</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <p className="text-sm italic text-foreground/85 leading-relaxed">
                "The small group size made all the difference. Walking through the Grand Bazaar secret rooftops and eating authentic katmer in Gaziantep was an experience you could never get on a big commercial tour."
              </p>
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  EH
                </div>
                <div>
                  <span className="text-xs font-semibold block text-foreground">Elena H.</span>
                  <span className="text-[0.65rem] text-muted-foreground">London, UK · Aegean & Istanbul Tour</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <p className="text-sm italic text-foreground/85 leading-relaxed">
                "Flawless organization from airport transfers to boutique cave suites in Cappadocia. The private hike through Rose Valley felt like being in another world. Atlas is the only company we will use in Türkiye."
              </p>
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  MK
                </div>
                <div>
                  <span className="text-xs font-semibold block text-foreground">Marcus & Karin T.</span>
                  <span className="text-[0.65rem] text-muted-foreground">Sydney, Australia · Cappadocia Hiking Adventure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
