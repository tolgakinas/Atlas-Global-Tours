import React from 'react';
import { ShieldCheck, Compass, Heart, Users, MapPin } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[48vh] min-h-[320px] overflow-hidden bg-ink image-fade">
        <img
          src="https://atlasglobaltours.com/wp-content/uploads/2025/01/patient-woman-doing-pottery-1365x2048.jpg"
          alt="Local artisan doing pottery in Avanos"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="container-page absolute inset-0 z-10 flex items-end pb-12">
          <h1 className="text-4xl font-display font-bold text-background sm:text-5xl lg:text-6xl">
            About Us
          </h1>
        </div>
      </section>

      {/* Main Philosophy Section */}
      <section className="container-page py-16 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow text-primary">Who we are</p>
            <h2 className="mt-3 text-3xl font-display font-bold leading-tight md:text-4xl lg:text-5xl text-foreground">
              Immersive Travel Experiences with Us
            </h2>

            <div className="mt-6 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                A new journey begins here within. Find a destination that suits you and start travelling. We offer authentic travel packages crafted with intention.
              </p>
              <p>
                At Atlas Global Tours, we believe that travel is more than just visiting a place; it's about immersing yourself in a culture, experiencing its history, and connecting with its people. That's why we design small group tours in Türkiye, each created to provide you with an authentic and unforgettable experience.
              </p>
              <p>
                Our tours are led by licensed Turkish guides who are deeply passionate about their country and eager to share its hidden gems with fellow curious explorers.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => onNavigate('/tours')}
                className="rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Explore journeys
              </button>
              <button
                onClick={() => onNavigate('/contact')}
                className="rounded-md border border-input bg-card px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Contact our team
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Users className="size-5" />
                <h3 className="font-display text-lg font-bold text-foreground">Small Groups (Max 12)</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We strictly limit our departures to 12 travellers. This means we can stay in authentic boutique hotels, dine at family-run locantas, and avoid the impersonal rush of large tour buses.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Compass className="size-5" />
                <h3 className="font-display text-lg font-bold text-foreground">Local Guides, Real Stories</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All our guides are licensed by the Turkish Ministry of Culture and Tourism. They hold degrees in archaeology, history, and art, and are paid fair living wages.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Heart className="size-5" />
                <h3 className="font-display text-lg font-bold text-foreground">Direct Operator</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We operate our tours directly with our own operations team on the ground in Istanbul and Cappadocia. No third-party brokers or subcontracted white-label operators.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
