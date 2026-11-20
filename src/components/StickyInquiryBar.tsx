import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Mail,
  Send,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StickyInquiryBarProps {
  onSuccess?: (inquiryId: string) => void;
}

const DESTINATION_OPTIONS = [
  'Any Destination / Flexible',
  'Türkiye (Istanbul, Cappadocia, Aegean)',
  'Greece & Aegean Islands',
  'Egypt & Nile Valley',
  'Morocco & Sahara Expeditions',
  'Vietnam & Southeast Asia',
  'Italy & Western Mediterranean',
  'Balkans & Adriatic Coast',
  'Multi-Country Bespoke Route',
];

const DURATION_OPTIONS = [
  '7–10 Days (Recommended)',
  '3–5 Days (Short Break)',
  '10–14 Days (Grand Journey)',
  '14+ Days (In-Depth Odyssey)',
  'Flexible Duration',
];

const PAX_OPTIONS = [
  '2 Travelers (Couple / Friends)',
  '1 Solo Traveler',
  '3–4 Travelers (Small Group / Family)',
  '5–8 Travelers (Private Pod)',
  '9–12 Travelers (Max Boutique Group)',
];

const DATE_OPTIONS = [
  'Flexible Dates / Next 3–6 Months',
  'Spring 2026 (Apr – Jun)',
  'Autumn 2026 (Sep – Nov)',
  'Summer 2026 (Jul – Aug)',
  'Winter 2026 / 2027',
  'Specific Dates (I will specify)',
];

export const StickyInquiryBar: React.FC<StickyInquiryBarProps> = ({ onSuccess }) => {
  const { user, addMessage } = useAuth();

  // Form states
  const [destination, setDestination] = useState<string>('Türkiye (Istanbul, Cappadocia, Aegean)');
  const [dates, setDates] = useState<string>('Spring 2026 (Apr – Jun)');
  const [duration, setDuration] = useState<string>('7–10 Days (Recommended)');
  const [pax, setPax] = useState<string>('2 Travelers (Couple / Friends)');
  const [email, setEmail] = useState<string>(user?.email || '');

  // UI Dropdown controls
  const [activeDropdown, setActiveDropdown] = useState<'destination' | 'dates' | 'duration' | 'pax' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Visibility / minimize controls
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('atlas_inquiry_bar_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Monitor scroll to increase transparency and soften visual weight when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key: 'destination' | 'dates' | 'duration' | 'pax') => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const handleMinimizeToggle = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem('atlas_inquiry_bar_minimized', String(next));
      } catch {
        // safe fallback
      }
      return next;
    });
  };

  const validateEmail = (val: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!val.trim()) {
      setEmailError('Email required');
      return false;
    }
    if (!regex.test(val.trim())) {
      setEmailError('Invalid email');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    const ref = `AGT-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      // Dispatch to AuthContext messages
      try {
        addMessage({
          name: user?.name || email.split('@')[0],
          email: email.trim(),
          destination,
          travelDate: dates,
          guests: pax,
          message: `General Inquiry [${ref}]: Duration: ${duration}. Requested bespoke route & guaranteed departure pricing.`,
        });
      } catch (err) {
        console.error('Failed to dispatch inquiry message', err);
      }

      // Persist in localStorage backup
      try {
        const stored = localStorage.getItem('atlas_general_inquiries');
        const list = stored ? JSON.parse(stored) : [];
        list.push({
          id: ref,
          email: email.trim(),
          destination,
          dates,
          duration,
          pax,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('atlas_general_inquiries', JSON.stringify(list));
      } catch (err) {
        console.error('Failed to store inquiry', err);
      }

      setReferenceId(ref);
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccess) onSuccess(ref);
    }, 550);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setReferenceId('');
    setEmailError(null);
  };

  return (
    <div
      ref={barRef}
      className={`sticky top-[72px] z-40 w-full transition-all duration-300 pointer-events-auto ${
        isScrolled ? 'opacity-95' : 'opacity-100'
      }`}
    >
      {/* Minimized Pill Bar */}
      {isMinimized ? (
        <div
          className={`border-b backdrop-blur-md transition-all duration-300 py-1.5 px-4 ${
            isScrolled
              ? 'bg-background/60 hover:bg-background/85 border-border/30 shadow-none'
              : 'bg-background/75 hover:bg-background/90 border-border/40 shadow-2xs'
          }`}
        >
          <div className="container-page flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleMinimizeToggle}
              className="inline-flex items-center gap-2 font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer group"
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Compass className="size-3" />
              </div>
              <span className="font-semibold text-foreground">General Expedition Inquiry:</span>
              <span className="hidden sm:inline text-muted-foreground truncate max-w-xs md:max-w-md">
                {destination} · {dates} · {pax}
              </span>
              <span className="text-[0.7rem] text-primary underline underline-offset-2 ml-1">
                Expand Bar
              </span>
            </button>

            <button
              type="button"
              onClick={handleMinimizeToggle}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.7rem] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              title="Expand inquiry bar"
            >
              <span>Show</span>
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded Sticky Bar */
        <div
          className={`border-b backdrop-blur-md transition-all duration-300 ${
            isScrolled
              ? 'bg-background/65 hover:bg-background/85 border-border/40 shadow-none'
              : 'bg-background/75 hover:bg-background/90 border-border/50 shadow-2xs'
          }`}
        >
          <div className="container-page py-1.5 sm:py-2">
            {isSuccess ? (
              /* Success State Banner */
              <div className="flex items-center justify-between gap-3 py-1 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-foreground">
                      Inquiry Sent Successfully! (Ref: {referenceId})
                    </span>
                    <span className="hidden sm:inline text-muted-foreground ml-1.5">
                      Our Istanbul operations desk will prepare your tailored route proposal for {email} within 12 hours.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-primary hover:underline font-medium text-xs cursor-pointer"
                  >
                    Send another inquiry
                  </button>
                  <button
                    type="button"
                    onClick={handleMinimizeToggle}
                    className="flex size-6 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    title="Minimize bar"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive General Inquiry Bar Form */
              <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-1.5">
                {/* Micro Label / Badge on Left (Desktop) */}
                <div className="hidden xl:flex items-center gap-1.5 pr-2.5 border-r border-border/40 text-xs text-muted-foreground shrink-0">
                  <Sparkles className="size-3 text-primary/80" />
                  <span className="font-medium text-foreground/80 tracking-tight whitespace-nowrap text-[0.72rem]">
                    Plan Journey:
                  </span>
                </div>

                {/* 5 Input Segments Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-1 items-center gap-1.5 min-w-0">
                  {/* 1. Destination Field */}
                  <div className="relative col-span-2 sm:col-span-1 lg:flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('destination')}
                      className={`w-full h-8.5 px-2.5 rounded-lg border text-left flex items-center justify-between gap-1.5 text-xs transition-all cursor-pointer backdrop-blur-xs ${
                        activeDropdown === 'destination'
                          ? 'border-primary/60 ring-1 ring-primary/20 bg-background/85'
                          : 'border-border/40 bg-background/40 hover:bg-background/70 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <div className="min-w-0 truncate">
                          <span className="block text-[0.6rem] uppercase tracking-wider text-muted-foreground leading-none">
                            Destination
                          </span>
                          <span className="block font-semibold text-foreground truncate text-[0.75rem]">
                            {destination.split('(')[0].trim()}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="size-3 text-muted-foreground/80 shrink-0" />
                    </button>

                    {/* Destination Popover Menu */}
                    {activeDropdown === 'destination' && (
                      <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                        <div className="px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                          Select Region or Country
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-0.5">
                          {DESTINATION_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDestination(opt);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                                destination === opt
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <span className="truncate">{opt}</span>
                              {destination === opt && <Check className="size-3 text-primary shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Dates Field */}
                  <div className="relative col-span-1 lg:flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('dates')}
                      className={`w-full h-8.5 px-2.5 rounded-lg border text-left flex items-center justify-between gap-1.5 text-xs transition-all cursor-pointer backdrop-blur-xs ${
                        activeDropdown === 'dates'
                          ? 'border-primary/60 ring-1 ring-primary/20 bg-background/85'
                          : 'border-border/40 bg-background/40 hover:bg-background/70 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <div className="min-w-0 truncate">
                          <span className="block text-[0.6rem] uppercase tracking-wider text-muted-foreground leading-none">
                            Dates
                          </span>
                          <span className="block font-semibold text-foreground truncate text-[0.75rem]">
                            {dates.split('(')[0].trim()}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="size-3 text-muted-foreground/80 shrink-0" />
                    </button>

                    {/* Dates Popover Menu */}
                    {activeDropdown === 'dates' && (
                      <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                        <div className="px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                          Approximate Travel Season
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-0.5">
                          {DATE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDates(opt);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                                dates === opt
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <span className="truncate">{opt}</span>
                              {dates === opt && <Check className="size-3 text-primary shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Duration Field */}
                  <div className="relative col-span-1 lg:flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('duration')}
                      className={`w-full h-8.5 px-2.5 rounded-lg border text-left flex items-center justify-between gap-1.5 text-xs transition-all cursor-pointer backdrop-blur-xs ${
                        activeDropdown === 'duration'
                          ? 'border-primary/60 ring-1 ring-primary/20 bg-background/85'
                          : 'border-border/40 bg-background/40 hover:bg-background/70 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Clock className="size-3.5 text-primary shrink-0" />
                        <div className="min-w-0 truncate">
                          <span className="block text-[0.6rem] uppercase tracking-wider text-muted-foreground leading-none">
                            Duration
                          </span>
                          <span className="block font-semibold text-foreground truncate text-[0.75rem]">
                            {duration.split('(')[0].trim()}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="size-3 text-muted-foreground/80 shrink-0" />
                    </button>

                    {/* Duration Popover Menu */}
                    {activeDropdown === 'duration' && (
                      <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                        <div className="px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                          Target Journey Length
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-0.5">
                          {DURATION_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDuration(opt);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                                duration === opt
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <span className="truncate">{opt}</span>
                              {duration === opt && <Check className="size-3 text-primary shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Pax Number Field */}
                  <div className="relative col-span-1 lg:flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('pax')}
                      className={`w-full h-8.5 px-2.5 rounded-lg border text-left flex items-center justify-between gap-1.5 text-xs transition-all cursor-pointer backdrop-blur-xs ${
                        activeDropdown === 'pax'
                          ? 'border-primary/60 ring-1 ring-primary/20 bg-background/85'
                          : 'border-border/40 bg-background/40 hover:bg-background/70 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Users className="size-3.5 text-primary shrink-0" />
                        <div className="min-w-0 truncate">
                          <span className="block text-[0.6rem] uppercase tracking-wider text-muted-foreground leading-none">
                            Pax
                          </span>
                          <span className="block font-semibold text-foreground truncate text-[0.75rem]">
                            {pax.split('(')[0].trim()}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="size-3 text-muted-foreground/80 shrink-0" />
                    </button>

                    {/* Pax Popover Menu */}
                    {activeDropdown === 'pax' && (
                      <div className="absolute right-0 sm:left-0 top-full mt-1 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                        <div className="px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                          Group Size / Travelers
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-0.5">
                          {PAX_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setPax(opt);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                                pax === opt
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <span className="truncate">{opt}</span>
                              {pax === opt && <Check className="size-3 text-primary shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Email Input Field */}
                  <div className="relative col-span-2 sm:col-span-1 lg:flex-1 min-w-0">
                    <div
                      className={`relative flex items-center h-8.5 rounded-lg border px-2.5 text-xs transition-all backdrop-blur-xs ${
                        emailError
                          ? 'border-destructive ring-1 ring-destructive/20 bg-background/60'
                          : 'border-border/40 bg-background/40 hover:bg-background/70 focus-within:bg-background/85 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20'
                      }`}
                    >
                      <Mail className="size-3.5 text-muted-foreground shrink-0 mr-1.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError(null);
                        }}
                        onBlur={() => {
                          if (email.trim()) validateEmail(email);
                        }}
                        placeholder="Your email address"
                        className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/75 outline-none font-medium truncate"
                        required
                      />
                    </div>
                    {emailError && (
                      <span className="absolute -bottom-4 left-1 text-[0.65rem] text-destructive font-medium flex items-center gap-0.5">
                        <AlertCircle className="size-2.5" />
                        {emailError}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit & Minimize Controls */}
                <div className="flex items-center gap-1.5 shrink-0 pt-1 lg:pt-0">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 h-8.5 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground px-3.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 flex-1 lg:flex-initial"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span>Inquire</span>
                      </>
                    )}
                  </button>

                  {/* Minimize Bar Button */}
                  <button
                    type="button"
                    onClick={handleMinimizeToggle}
                    className="flex size-8.5 items-center justify-center rounded-lg border border-border/40 hover:bg-background/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title="Minimize sticky inquiry bar"
                    aria-label="Minimize inquiry bar"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
