import React from 'react';
import {
  Users,
  BedDouble,
  CalendarCheck2,
  Target,
  Eye,
  Sparkles,
  CheckCircle2,
  Star,
  Quote,
  Globe,
  Mountain,
  Smile,
  Map
} from 'lucide-react';
import { useTours } from '../context/ToursContext';
import { TikTokIcon, LinkedInIcon } from '../components/Footer';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const CORE_VALUES = [
  'Authenticity',
  'Immersive Exploration',
  'Responsible Travel',
  'Respect and Understanding',
  'Personal Growth',
  'Quality and Expertise',
];

const IMPACT_STATS = [
  { value: '500+', label: 'Trips and Tours', icon: Map },
  { value: '30+', label: 'Countries', icon: Globe },
  { value: '50+', label: 'Outdoor Activities', icon: Mountain },
  { value: '50K+', label: 'Happy Nomads', icon: Smile },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { siteContent } = useTours();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative h-[48vh] min-h-[340px] overflow-hidden bg-ink image-fade">
        <img
          src="https://atlasglobaltours.com/wp-content/uploads/2025/01/patient-woman-doing-pottery-1365x2048.jpg"
          alt="Local artisan crafting pottery in Cappadocia"
          className="size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/50 to-ink/30" />
        <div className="container-page absolute inset-0 z-10 flex flex-col justify-end pb-12">
          <p className="eyebrow text-sand">Boutique Small-Group Travel</p>
          <h1 className="mt-2 text-4xl font-display font-bold text-background sm:text-5xl lg:text-6xl">
            About Us
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-background/90 font-medium">
            Travel Deeper. Connect Better. Remember Forever.
          </p>
        </div>
      </section>

      {/* Main Story & Philosophy Section */}
      <section className="container-page py-16 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow text-primary">Who We Are</p>
            <h2 className="mt-3 text-3xl font-display font-bold leading-tight md:text-4xl lg:text-5xl text-foreground">
              Travel Deeper. Connect Better. Remember Forever.
            </h2>

            <div className="mt-6 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                At Atlas Global Tours, we believe travel is about much more than visiting famous landmarks or looking at ancient stones. It is about discovering the soul of a destination through its people, traditions, stories, and everyday life.
              </p>
              <p>
                We are a boutique travel company, carefully selecting destinations and experiences that create meaningful connections and unforgettable memories. Our small groups, with <strong className="text-foreground font-semibold">no more than 10 travellers</strong>, allow us to travel at a slower pace, connect more deeply, and experience places beyond the usual tourist routes.
              </p>
              <p>
                We believe the most memorable moments often happen away from the monuments. They happen when you sit around a local family&apos;s table, learn to cook a traditional dish, dance to local music, sing with new friends, paint with local artists, or listen to stories and myths passed down through generations.
              </p>
              <p>
                We want you to feel the difference, not just see it. Meet local people, understand their way of life, share their traditions, and become part of the places you visit, even if only for a little while.
              </p>
              <p className="text-foreground font-medium">
                But our journey doesn&apos;t end when the tour is over.
              </p>
              <p>
                Atlas Global Tours is more than a travel company. It is a community. We bring people together through shared experiences, lasting friendships, and a common love of discovery. We stay connected long after the journey ends, because the people we meet along the way become part of our extended travel family.
              </p>
              <p className="pt-2 font-display text-lg sm:text-xl font-bold text-foreground">
                This is our way of travelling. This is the Atlas Global way.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('/tours')}
                className="rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Explore All Journeys
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="rounded-md border border-input bg-card px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Contact Our Team
              </button>
            </div>
          </div>

          {/* 3 Signature Pillars + Social Card */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <BedDouble className="size-5 shrink-0" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Handpicked Accommodations
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Carefully selected lodging options known for their unique character, high quality, and exceptional guest experiences.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <CalendarCheck2 className="size-5 shrink-0" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Departures Guaranteed
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Minimum 2 number of guests is required for that trip to run — giving you confidence and peace of mind when planning your journey.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Users className="size-5 shrink-0" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Small Group Tours · 2 – 10 People
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Intimate groups capped at 10 travellers allow us to dine at family-run tables, travel at a relaxed pace, and venture far beyond crowded tourist buses.
              </p>
            </div>

            {/* Connect on TikTok and LinkedIn */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
              <span className="eyebrow text-primary text-[0.6875rem]">Follow Our Community</span>
              <h3 className="font-display text-base font-bold text-foreground">
                Connect on TikTok &amp; LinkedIn
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See real on-the-ground expedition videos from our local guides, behind-the-scenes cultural moments, and company updates.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href={siteContent.tiktokUrl || 'https://www.tiktok.com/@atlasglobaltours'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-black hover:border-[#25F4EE] hover:text-[#25F4EE] px-3.5 py-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
                  title="Follow Atlas Global Tours on TikTok"
                >
                  <TikTokIcon className="size-3.5 text-[#25F4EE]" />
                  <span>Follow on TikTok</span>
                </a>
                <a
                  href={siteContent.linkedinUrl || 'https://www.linkedin.com/company/atlasglobaltours'}
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
      </section>

      {/* Our Culture — Gathering Moments */}
      <section className="border-y border-border bg-paper py-16 lg:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="eyebrow text-primary">Our Culture</p>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
              Gathering Moments.
            </h2>
            <blockquote className="mt-6 border-l-2 border-primary pl-5 text-sm sm:text-base text-muted-foreground leading-relaxed italic">
              &ldquo;At Atlas Global Tours, we&apos;re driven by a set of core values that shape everything we do. We believe in <strong className="not-italic text-foreground">authenticity</strong>, bringing you face-to-face with the true heart of each destination. We&apos;re committed to <strong className="not-italic text-foreground">responsible travel</strong>, minimizing our footprint and supporting local communities. Our mission is to provide immersive experiences that connect you with diverse cultures, fostering personal growth and positive impact. Our vision is to be the leading provider of responsible travel worldwide, inspiring a global community of conscious explorers.&rdquo;
            </blockquote>
          </div>

          {/* Mission, Vision, Values Grid */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Mission */}
            <div className="rounded-xl border border-border bg-card p-7 shadow-xs flex flex-col">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <Target className="size-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Mission</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                To offer expertly crafted tours in diverse destinations, led by passionate local guides, ensuring enriching and transformative travel experiences.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-xl border border-border bg-card p-7 shadow-xs flex flex-col">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <Eye className="size-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Vision</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                To be the leading provider of immersive and responsible travel experiences worldwide, recognized for our commitment to authenticity, sustainability, and cultural exchange.
              </p>
            </div>

            {/* Core Values */}
            <div className="rounded-xl border border-border bg-card p-7 shadow-xs flex flex-col">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <Sparkles className="size-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Values</h3>
              <ul className="mt-3 grid grid-cols-1 gap-2">
                {CORE_VALUES.map((val) => (
                  <li key={val} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>{val}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact Counters */}
      <section className="bg-ink text-background py-14 lg:py-16">
        <div className="container-page">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {IMPACT_STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-4 rounded-xl border border-background/10 bg-background/5"
              >
                <Icon className="size-5 text-sand mb-2.5" />
                <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-background tracking-tight">
                  {value}
                </span>
                <span className="mt-1.5 text-[0.7rem] uppercase tracking-[0.2em] font-semibold text-sand">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials & Ethical Travel */}
      <section className="container-page py-16 lg:py-24 space-y-16">
        {/* Client Testimonials */}
        <div>
          <div className="max-w-2xl">
            <p className="eyebrow text-primary">Client Testimonials</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-foreground">
              Real travelers. Real stories.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Real opinions from our extended travel family to help you make the right choice.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-border/70">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary font-display font-bold text-lg">
                  K
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Katie Pngt</h3>
                  <p className="text-xs text-muted-foreground">Verified Traveler · 10-Day Immersive Tour of Egypt</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground ml-1">5.0</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Quote className="size-6 text-primary/40 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                I highly recommend traveling with Atlas Global Tours! I took a 10-day immersive tour of Egypt, and it was an incredible experience. Our guide, Bakari, was outstanding—knowledgeable, engaging, and attentive to everyone in the group. We were also fortunate to have a wonderful group of fellow travelers. January is the perfect time to visit Egypt, and the tour was exceptionally well-organized, covering all the must-see sights. A big thank you for an unforgettable journey!
              </p>
            </div>
          </div>
        </div>

        {/* Ethical Travel, Sustainability & Atlas Cares Banner */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">Ethical &amp; Responsible Tourism</span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-foreground">
              Atlas Cares &amp; Sustainable Journeys
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
