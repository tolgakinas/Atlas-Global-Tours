import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTours } from '../context/ToursContext';
import { TikTokIcon, LinkedInIcon, InstagramIcon, FacebookIcon } from '../components/Footer';

export const ContactPage: React.FC = () => {
  const { addMessage, user } = useAuth();
  const { siteContent } = useTours();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('Worldwide / Multi-Continent');
  const [travelDate, setTravelDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage({
      name,
      email,
      phone,
      destination,
      travelDate,
      message,
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-16 lg:py-20">
      <div className="container-page grid gap-14 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Form */}
        <div>
          <p className="eyebrow text-primary">Get in touch</p>
          <h1 className="mt-2 text-4xl font-display font-bold md:text-5xl text-foreground">
            Tell us where you're thinking of going.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
            Whether it's a set departure, a private group, or a route you've been sketching for years, we'll come back with honest advice — not a sales pitch.
          </p>

          {submitted ? (
            <div className="mt-10 max-w-2xl rounded-xl border border-success-border bg-success-soft/50 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/20 text-success mb-4">
                <Check className="size-6" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Message Sent Successfully</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for reaching out, {name}. A member of our Istanbul travel team will reply within 12 business hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="mt-6 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Phone or WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Region of Interest
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Worldwide / Multi-Continent">Worldwide / Multi-Continent Expeditions</option>
                    <option value="Europe & Balkans">Europe & The Balkans</option>
                    <option value="Asia & Silk Road">Asia & The Silk Road</option>
                    <option value="Africa & Safaris">Africa & Kenya Wildlife Safaris</option>
                    <option value="Caucasus">Caucasus (Armenia & Georgia)</option>
                    <option value="Mediterranean & Türkiye">Mediterranean & Aegean</option>
                    <option value="Middle East">Middle East (Jordan & Oman)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Approximate Travel Dates
                </label>
                <input
                  type="text"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  placeholder="e.g. October 2026 or Spring 2027"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  How can we help? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your trip: who is travelling, what kind of pace you like, and any must-see places."
                  className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Office Info & Direct Channels */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground border-b border-border pb-3">
              Direct Contact
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Mail className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-foreground">Email Inquiries</span>
                  <a href="mailto:info@atlasglobaltours.com" className="text-muted-foreground hover:text-primary">
                    info@atlasglobaltours.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-foreground">Phone & WhatsApp</span>
                  <a href="tel:+905321234567" className="text-muted-foreground hover:text-primary">
                    +90 532 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-foreground">Global Operations & Hubs</span>
                  <span className="text-muted-foreground">
                    Divanyolu Cad. No: 42, Sultanahmet, Istanbul (Headquarters) & Field Bases in Nairobi, Colombo & Europe
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-paper p-6 text-xs text-muted-foreground space-y-2">
            <span className="font-bold uppercase tracking-wider text-foreground block">
              Response Guarantee
            </span>
            <p>
              We reply to every traveler inquiry personally from our global expedition specialists within 12 hours.
            </p>
          </div>

          {/* Social Channels regarding expeditions and updates */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <span className="eyebrow text-primary text-[0.6875rem]">Follow & Connect</span>
              <h3 className="font-display text-base font-bold text-foreground mt-0.5">
                Official Channels
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Watch real expedition clips, guide field stories, and company updates regarding upcoming tour departures.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* TikTok */}
              <a
                href={siteContent.tiktokUrl || "https://www.tiktok.com/@atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/40 hover:bg-black hover:border-[#25F4EE] hover:text-[#25F4EE] transition-all group text-foreground cursor-pointer"
                title="Follow Atlas Global Tours on TikTok"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-black text-white flex items-center justify-center shrink-0">
                    <TikTokIcon className="size-4 text-[#25F4EE]" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block group-hover:text-white">TikTok</span>
                    <span className="text-[0.68rem] text-muted-foreground group-hover:text-[#25F4EE]">@atlasglobaltours · Field clips</span>
                  </div>
                </div>
                <span className="text-[0.7rem] font-semibold text-primary group-hover:text-white">Follow →</span>
              </a>

              {/* LinkedIn */}
              <a
                href={siteContent.linkedinUrl || "https://www.linkedin.com/company/atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/40 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white transition-all group text-foreground cursor-pointer"
                title="Connect with Atlas Global Tours on LinkedIn"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-[#0A66C2] text-white flex items-center justify-center shrink-0">
                    <LinkedInIcon className="size-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block group-hover:text-white">LinkedIn</span>
                    <span className="text-[0.68rem] text-muted-foreground group-hover:text-white/80">Atlas Global Tours · Corporate & Press</span>
                  </div>
                </div>
                <span className="text-[0.7rem] font-semibold text-primary group-hover:text-white">Connect →</span>
              </a>

              {/* Instagram */}
              <a
                href={siteContent.instagramUrl || "https://instagram.com/atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/40 hover:border-pink-500/50 hover:bg-muted/80 transition-all group text-foreground cursor-pointer"
                title="Follow Atlas Global Tours on Instagram"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0">
                    <InstagramIcon className="size-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block">Instagram</span>
                    <span className="text-[0.68rem] text-muted-foreground">@atlasglobaltours · Photography</span>
                  </div>
                </div>
                <span className="text-[0.7rem] font-semibold text-primary">View →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
