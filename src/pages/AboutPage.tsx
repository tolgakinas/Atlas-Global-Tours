import React from 'react';
import { ShieldCheck, Compass, Heart, Users, MapPin } from 'lucide-react';
import { useTours } from '../context/ToursContext';
import { TikTokIcon, LinkedInIcon } from '../components/Footer';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { siteContent } = useTours();
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
                At Atlas Global Tours, we believe that travel is more than just visiting a place; it's about immersing yourself in a culture, experiencing its history, and connecting with its people. That's why we design small group tours worldwide across Europe, Asia, Africa, the Mediterranean, and beyond, each created to provide you with an authentic and unforgettable experience.
              </p>
              <p>
                Our journeys are led by licensed local guides who are deeply passionate about their homelands and eager to share hidden gems with fellow curious explorers.
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
                All our guides are officially licensed regional experts and cultural insiders. They hold degrees in archaeology, history, or conservation, and are paid fair living wages.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Heart className="size-5" />
                <h3 className="font-display text-lg font-bold text-foreground">Direct Operator</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We operate our tours directly with dedicated operations specialists and trusted local partners across destinations worldwide. No third-party brokers or mass-market tour aggregators.
              </p>
            </div>

            {/* Connect on TikTok and LinkedIn */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
              <span className="eyebrow text-primary text-[0.6875rem]">Follow Our Journeys</span>
              <h3 className="font-display text-base font-bold text-foreground">
                Connect on TikTok & LinkedIn
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See real on-the-ground expedition videos from our licensed guides, behind-the-scenes travel dispatches, and corporate partnership news.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href={siteContent.tiktokUrl || "https://www.tiktok.com/@atlasglobaltours"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-black hover:border-[#25F4EE] hover:text-[#25F4EE] px-3.5 py-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
                  title="Follow Atlas Global Tours on TikTok"
                >
                  <TikTokIcon className="size-3.5 text-[#25F4EE]" />
                  <span>Follow on TikTok</span>
                </a>
                <a
                  href={siteContent.linkedinUrl || "https://www.linkedin.com/company/atlasglobaltours"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white px-3.5 py-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
                  title="Connect with Atlas Global Tours on LinkedIn"
                >
                  <LinkedInIcon className="size-3.5" />
                  <span>Connect on LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Ethical Travel, Sustainability & Atlas Cares Banner */}
        <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">Ethical & Responsible Tourism</span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-foreground">
              Atlas Cares & Sustainable Journeys
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We operate on the conviction that travel must empower local communities and safeguard fragile cultural heritage. Through <strong>Atlas Cares</strong>, our <strong>7 Core Sustainability Pillars</strong>, and strict compliance with the <strong>Modern Slavery Act</strong>, we ensure our small-group departures create lasting positive impact rather than exploitation.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/sustainable-tourism')}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                Sustainable Tourism
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/responsible-travel')}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-xs"
              >
                Fair Travels Protocol
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/atlas-cares')}
                className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer shadow-xs"
              >
                Atlas Cares Initiative
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/modern-slavery-act')}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Modern Slavery Act Statement
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
