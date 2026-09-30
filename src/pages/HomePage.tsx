import React from 'react';
import { ArrowRight, ShieldCheck, MapPin, Users, HeartHandshake, Compass, Globe } from 'lucide-react';
import { HeroVideo } from '../components/HeroVideo';
import { TourCard } from '../components/TourCard';
import { TOURS_DATA, DESTINATION_REGIONS } from '../data/toursData';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
  onSelectRegion?: (region: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectTour, onSelectRegion }) => {
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

  const handleRegionClick = (regionName: string) => {
    if (onSelectRegion) {
      onSelectRegion(regionName);
    } else {
      onNavigate('/tours');
    }
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
            Multi-day journeys organized regarding places — through Istanbul, Cappadocia, the Aegean, Eastern Anatolia, and signature expeditions across the Middle East, Balkans & Africa.
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

      {/* Explore by Place / Destination Showcase */}
      <section className="container-page py-16 lg:py-20 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Destinations & Places</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground">
              Explore journeys regarding places
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Choose your destination to view curated routes, small group departures, and authentic local experiences.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/tours')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Browse all places
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DESTINATION_REGIONS.map((region) => {
            const count = TOURS_DATA.filter((t) => t.region === region.name).length;
            return (
              <div
                key={region.id}
                onClick={() => handleRegionClick(region.name)}
                className="group relative flex flex-col justify-end overflow-hidden rounded-xl border border-border bg-card p-5 h-64 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                {/* Background Image */}
                <img
                  src={region.heroImage}
                  alt={region.name}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent" />

                {/* Region Details */}
                <div className="relative z-10 text-background">
                  <span className="text-[0.65rem] uppercase tracking-widest font-bold text-sand block mb-1">
                    {region.subtitle}
                  </span>
                  <h3 className="font-display text-xl font-bold leading-snug group-hover:text-sand transition-colors">
                    {region.name}
                  </h3>
                  <p className="mt-1 text-xs text-background/80 line-clamp-1">
                    {region.places.slice(0, 3).join(' · ')}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-background/20 text-xs font-semibold text-sand">
                    <span>{count} journey{count !== 1 ? 's' : ''}</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] uppercase tracking-wider">
                      View trips <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
