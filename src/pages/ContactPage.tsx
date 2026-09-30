import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ContactPage: React.FC = () => {
  const { addMessage, user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('All Türkiye');
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
                    <option value="All Türkiye">All Türkiye / Multi-Region</option>
                    <option value="Istanbul">Istanbul & Surrounds</option>
                    <option value="Cappadocia">Cappadocia & Central Anatolia</option>
                    <option value="Aegean">Aegean & Ephesus</option>
                    <option value="Southeast">Eastern & Southeastern Türkiye</option>
                    <option value="Mediterranean">Mediterranean & Lycian Way</option>
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
                  <span className="font-semibold block text-foreground">Operational Office</span>
                  <span className="text-muted-foreground">
                    Sultanahmet, Fatih, 34122 Istanbul, Türkiye
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
              We reply to every traveler inquiry personally from our local team in Türkiye within 12 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
