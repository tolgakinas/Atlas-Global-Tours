import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

export interface NewsletterSignupProps {
  variant?: 'footer' | 'card' | 'inline';
  className?: string;
  hideHeader?: boolean;
  onSuccess?: (email: string) => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = 'footer',
  className = '',
  hideHeader = false,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<'all' | 'multiday' | 'daytours'>('all');

  const validate = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your email address.';
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      if (!trimmed.includes('@')) {
        return 'Please include an "@" in your email address.';
      }
      if (!trimmed.split('@')[1] || !trimmed.split('@')[1].includes('.')) {
        return 'Please include a valid domain (e.g. .com, .org).';
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
          subscribedAt: new Date().toISOString(),
        };
        // avoid duplicate entries
        const existingIdx = subscribers.findIndex(
          (s: { email: string }) => s.email === newSubscriber.email
        );
        if (existingIdx >= 0) {
          subscribers[existingIdx] = newSubscriber;
        } else {
          subscribers.push(newSubscriber);
        }
        localStorage.setItem('atlas_newsletter_subscribers', JSON.stringify(subscribers));
      } catch (err) {
        console.error('Failed to store newsletter subscriber', err);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(email.trim());
      }
    }, 600);
  };

  const handleReset = () => {
    setEmail('');
    setError(null);
    setTouched(false);
    setIsSuccess(false);
  };

  const isFooter = variant === 'footer';

  if (isSuccess) {
    return (
      <div
        className={`rounded-xl border transition-all duration-300 ${
          isFooter
            ? 'border-sidebar-primary/40 bg-sidebar-primary/10 p-4 text-sidebar-foreground'
            : 'border-success-border bg-success-soft/50 p-5 text-foreground'
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
              isFooter ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'bg-success text-white'
            }`}
          >
            <CheckCircle2 className="size-4" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold tracking-tight">
              Welcome aboard the travel dispatches!
            </h4>
            <p
              className={`text-xs leading-relaxed ${
                isFooter ? 'text-sidebar-foreground/80' : 'text-muted-foreground'
              }`}
            >
              We've registered <span className="font-medium underline">{email}</span>. You'll receive our monthly curated itineraries, seasonal insider tips, and early access to small group departures.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className={`text-[0.7rem] font-medium transition-colors underline cursor-pointer ${
                  isFooter
                    ? 'text-sidebar-primary hover:text-sidebar-primary/80'
                    : 'text-primary hover:text-primary/80'
                }`}
              >
                Sign up another email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {!hideHeader && (
        <div className="space-y-1">
          <h4
            className={`text-sm font-semibold tracking-tight ${
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
            Get curated guides, licensed guide perspectives, and early access to newly released departure dates.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        <div className="relative">
          <div className="flex items-center gap-2">
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
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!error}
                aria-describedby={error ? 'newsletter-email-error' : undefined}
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
              className={`h-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-5 text-sm font-medium transition-all cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                isFooter
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 focus-visible:ring-2 focus-visible:ring-sidebar-primary shadow-xs'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary shadow-xs'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div
              id="newsletter-email-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive animate-in fade-in slide-in-from-top-1"
            >
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Optional interest tag segmented buttons on an even line */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span
            className={`text-xs mr-0.5 font-medium ${
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
            Multi-Day Small Group
          </button>
          <button
            type="button"
            onClick={() => setSelectedTopic('daytours')}
            className={`h-6.5 rounded-md px-2.5 text-xs font-medium transition-colors cursor-pointer border flex items-center justify-center ${
              selectedTopic === 'daytours'
                ? isFooter
                  ? 'border-sidebar-primary bg-sidebar-primary/25 text-sidebar-primary'
                  : 'border-primary bg-primary/10 text-primary'
                : isFooter
                ? 'border-sidebar-border/70 text-sidebar-foreground/70 hover:text-sidebar-foreground bg-sidebar/50 hover:bg-sidebar'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Day Excursions
          </button>
        </div>

        {/* Privacy Note on an even line */}
        <div
          className={`flex items-center gap-1.5 text-xs ${
            isFooter ? 'text-sidebar-foreground/50' : 'text-muted-foreground/80'
          }`}
        >
          <ShieldCheck className="size-3.5 text-sidebar-primary/80 shrink-0" />
          <span>Strict privacy. No spam. One-click unsubscribe at any time.</span>
        </div>
      </form>
    </div>
  );
};
