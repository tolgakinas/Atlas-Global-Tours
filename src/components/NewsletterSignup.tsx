import React, { useState } from 'react';
import {
  Mail,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Copy,
  Tag,
  Compass
} from 'lucide-react';

export interface NewsletterSignupProps {
  variant?: 'footer' | 'card' | 'inline' | 'modal';
  className?: string;
  hideHeader?: boolean;
  source?: string;
  onSuccess?: (email: string, voucherCode?: string) => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VOUCHER_CODE = 'ATLAS150';

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = 'footer',
  className = '',
  hideHeader = false,
  source = 'website',
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<'all' | 'multiday' | 'cultural' | 'nature'>('all');
  const [copiedCode, setCopiedCode] = useState(false);

  const validate = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your email address.';
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      if (!trimmed.includes('@')) {
        return 'Please include an "@" in your email address.';
      }
      const parts = trimmed.split('@');
      if (!parts[1] || !parts[1].includes('.')) {
        return 'Please include a valid domain (e.g. .com, .org, .co.uk).';
      }
      return 'Please enter a valid email address (e.g. traveler@example.com).';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      setError(validate(val));
    } else if (error) {
      setError(null);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (email.trim().length > 0) {
      setError(validate(email));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const validationError = validate(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate API call and store in localStorage
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('atlas_newsletter_subscribers');
        const subscribers = stored ? JSON.parse(stored) : [];
        const newSubscriber = {
          email: email.trim().toLowerCase(),
          topic: selectedTopic,
          source,
          voucherCode: VOUCHER_CODE,
          subscribedAt: new Date().toISOString(),
        };

        const existingIdx = subscribers.findIndex(
          (s: { email: string }) => s.email === newSubscriber.email
        );
        if (existingIdx >= 0) {
          subscribers[existingIdx] = newSubscriber;
        } else {
          subscribers.push(newSubscriber);
        }

        localStorage.setItem('atlas_newsletter_subscribers', JSON.stringify(subscribers));
        localStorage.setItem('atlas_newsletter_subscribed', 'true');
      } catch (err) {
        console.error('Failed to store newsletter subscriber', err);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(email.trim(), VOUCHER_CODE);
      }
    }, 550);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(VOUCHER_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleReset = () => {
    setEmail('');
    setError(null);
    setTouched(false);
    setIsSuccess(false);
    setCopiedCode(false);
  };

  const isFooter = variant === 'footer';
  const isModal = variant === 'modal';

  if (isSuccess) {
    return (
      <div
        className={`rounded-xl border transition-all duration-300 ${
          isFooter
            ? 'border-sidebar-primary/40 bg-sidebar-primary/10 p-4.5 text-sidebar-foreground'
            : isModal
            ? 'border-primary/30 bg-primary/5 p-6 text-foreground'
            : 'border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 p-5 text-foreground'
        } ${className}`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              isFooter
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <CheckCircle2 className="size-5" />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <h4 className="text-base font-display font-semibold tracking-tight text-foreground dark:text-foreground">
                You're in the Atlas Explorer Circle!
              </h4>
              <p
                className={`text-xs leading-relaxed mt-0.5 ${
                  isFooter ? 'text-sidebar-foreground/80' : 'text-muted-foreground'
                }`}
              >
                We have registered <strong className="font-semibold underline">{email}</strong>. Field dispatches and secret departure announcements will arrive in your inbox monthly.
              </p>
            </div>

            {/* Voucher Card Incentive */}
            <div className="rounded-lg border border-primary/20 bg-card p-3 shadow-xs">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Sparkles className="size-3.5" />
                    <span>$150 Welcome Expedition Credit</span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Valid toward any guaranteed multi-day departure booking.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-muted rounded border border-border tracking-wider text-foreground">
                    {VOUCHER_CODE}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    title="Copy coupon code"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="size-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleReset}
                className={`text-[0.72rem] font-medium transition-colors underline cursor-pointer ${
                  isFooter
                    ? 'text-sidebar-primary hover:text-sidebar-primary/80'
                    : 'text-primary hover:text-primary/80'
                }`}
              >
                Register another email
              </button>
              <span className="text-[0.7rem] text-muted-foreground">
                Check spam/promotions if not received within 5 minutes.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {!hideHeader && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold tracking-wider uppercase">
            <Compass className="size-3.5" />
            <span>Atlas Explorer Circle</span>
          </div>
          <h4
            className={`font-display text-lg font-bold tracking-tight ${
              isFooter ? 'text-sidebar-foreground' : 'text-foreground'
            }`}
          >
            Travel Dispatches & Private Offers
          </h4>
          <p
            className={`text-xs leading-relaxed ${
              isFooter ? 'text-sidebar-foreground/75' : 'text-muted-foreground'
            }`}
          >
            Curated small group departures, field dispatches from licensed guides, and an instant $150 credit for your next expedition.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Mail
                className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors ${
                  error
                    ? 'text-destructive'
                    : isFooter
                    ? 'text-sidebar-foreground/40'
                    : 'text-muted-foreground'
                }`}
              />
              <input
                id={`newsletter-email-${variant}`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!error}
                aria-describedby={error ? `newsletter-email-error-${variant}` : undefined}
                className={`h-10 w-full rounded-lg pl-9 pr-3 text-sm transition-all outline-none ${
                  isFooter
                    ? 'border bg-sidebar/80 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus:ring-1 ' +
                      (error
                        ? 'border-destructive/80 focus:border-destructive focus:ring-destructive/50'
                        : 'border-sidebar-border/80 focus:border-sidebar-primary focus:ring-sidebar-primary')
                    : 'border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 ' +
                      (error
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-primary/20')
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-5 text-sm font-semibold transition-all cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs ${
                isFooter
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 focus-visible:ring-2 focus-visible:ring-sidebar-primary'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <span>Subscribe & Get $150</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div
              id={`newsletter-email-error-${variant}`}
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive animate-in fade-in slide-in-from-top-1"
            >
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Travel Interest Preferences */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span
            className={`text-xs font-medium mr-1 ${
              isFooter ? 'text-sidebar-foreground/60' : 'text-muted-foreground'
            }`}
          >
            Interests:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTopic('all')}
            className={`h-6.5 rounded-md px-2.5 text-xs font-medium transition-colors cursor-pointer border flex items-center justify-center ${
              selectedTopic === 'all'
                ? isFooter
                  ? 'border-sidebar-primary bg-sidebar-primary/25 text-sidebar-primary'
                  : 'border-primary bg-primary/10 text-primary'
                : isFooter
                ? 'border-sidebar-border/70 text-sidebar-foreground/70 hover:text-sidebar-foreground bg-sidebar/50 hover:bg-sidebar'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All Journeys
          </button>
          <button
            type="button"
            onClick={() => setSelectedTopic('multiday')}
            className={`h-6.5 rounded-md px-2.5 text-xs font-medium transition-colors cursor-pointer border flex items-center justify-center ${
              selectedTopic === 'multiday'
                ? isFooter
                  ? 'border-sidebar-primary bg-sidebar-primary/25 text-sidebar-primary'
                  : 'border-primary bg-primary/10 text-primary'
                : isFooter
                ? 'border-sidebar-border/70 text-sidebar-foreground/70 hover:text-sidebar-foreground bg-sidebar/50 hover:bg-sidebar'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Small Group Expeditions
          </button>
          <button
            type="button"
            onClick={() => setSelectedTopic('cultural')}
            className={`h-6.5 rounded-md px-2.5 text-xs font-medium transition-colors cursor-pointer border flex items-center justify-center ${
              selectedTopic === 'cultural'
                ? isFooter
                  ? 'border-sidebar-primary bg-sidebar-primary/25 text-sidebar-primary'
                  : 'border-primary bg-primary/10 text-primary'
                : isFooter
                ? 'border-sidebar-border/70 text-sidebar-foreground/70 hover:text-sidebar-foreground bg-sidebar/50 hover:bg-sidebar'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Cultural Heritage
          </button>
          <button
            type="button"
            onClick={() => setSelectedTopic('nature')}
            className={`h-6.5 rounded-md px-2.5 text-xs font-medium transition-colors cursor-pointer border flex items-center justify-center ${
              selectedTopic === 'nature'
                ? isFooter
                  ? 'border-sidebar-primary bg-sidebar-primary/25 text-sidebar-primary'
                  : 'border-primary bg-primary/10 text-primary'
                : isFooter
                ? 'border-sidebar-border/70 text-sidebar-foreground/70 hover:text-sidebar-foreground bg-sidebar/50 hover:bg-sidebar'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Active & Nature
          </button>
        </div>

        {/* Privacy Note & Guarantee */}
        <div
          className={`flex items-center gap-1.5 text-xs ${
            isFooter ? 'text-sidebar-foreground/55' : 'text-muted-foreground/80'
          }`}
        >
          <ShieldCheck className="size-3.5 text-primary shrink-0" />
          <span>Strict privacy. No third-party sharing. One-click unsubscribe at any time.</span>
        </div>
      </form>
    </div>
  );
};
