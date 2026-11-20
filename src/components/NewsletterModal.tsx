import React, { useState, useEffect } from 'react';
import { X, Sparkles, Compass, ShieldCheck, Gift, ArrowRight } from 'lucide-react';
import { NewsletterSignup } from './NewsletterSignup';

export interface NewsletterModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  autoOpenDelay?: number; // ms, default 7000ms. Set to 0 or null to disable
  disableAutoOpen?: boolean;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  autoOpenDelay = 7000,
  disableAutoOpen = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isVisible = isControlled ? controlledIsOpen : internalIsOpen;

  // Handle auto-open for first-time visitors
  useEffect(() => {
    if (isControlled || disableAutoOpen || !autoOpenDelay) return;

    // Check if already subscribed or dismissed in this session
    try {
      const isSubscribed = localStorage.getItem('atlas_newsletter_subscribed') === 'true';
      const isDismissed = sessionStorage.getItem('atlas_newsletter_modal_dismissed') === 'true';

      if (isSubscribed || isDismissed) {
        return;
      }

      const timer = setTimeout(() => {
        setInternalIsOpen(true);
      }, autoOpenDelay);

      return () => clearTimeout(timer);
    } catch {
      // safe fallback
    }
  }, [isControlled, disableAutoOpen, autoOpenDelay]);

  // Handle Escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('atlas_newsletter_modal_dismissed', 'true');
    } catch {
      // safe fallback
    }

    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Dimmed backdrop with subtle blur */}
      <div
        className="fixed inset-0 bg-ink/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-card border border-border shadow-2xl z-10 transition-all animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 z-20 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground/70 hover:text-foreground hover:bg-background transition-colors cursor-pointer border border-border/60 shadow-xs"
          aria-label="Close newsletter modal"
        >
          <X className="size-4" />
        </button>

        {/* Modal Banner Visual / Accent Header */}
        <div className="relative bg-ink text-background px-6 pt-7 pb-6 sm:px-8 border-b border-white/10 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-sand/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-sand border border-primary/30">
              <Sparkles className="size-3.5 text-primary" />
              <span>Exclusive Traveler Invitation</span>
            </div>

            <h2
              id="newsletter-modal-title"
              className="text-2xl sm:text-3xl font-display font-bold text-background leading-tight"
            >
              Unlock $150 Off Your Next Expedition
            </h2>

            <p className="text-xs sm:text-sm text-background/80 max-w-lg leading-relaxed">
              Join the Atlas Explorer Circle for early access to guaranteed small-group departures (max 12), field notes from licensed local guides, and an instant $150 welcome credit voucher.
            </p>
          </div>
        </div>

        {/* Modal Body / Signup Form */}
        <div className="p-6 sm:p-8 bg-card space-y-5">
          <NewsletterSignup
            variant="modal"
            hideHeader={true}
            source="homepage_modal"
            onSuccess={() => {
              try {
                localStorage.setItem('atlas_newsletter_subscribed', 'true');
              } catch {
                // safe fallback
              }
            }}
          />

          {/* Value Perks Mini Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gift className="size-4 text-primary shrink-0" />
              <span>$150 Welcome Credit</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-primary shrink-0" />
              <span>Secret Departure Dates</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>No spam & instant opt-out</span>
            </div>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              No thanks, I'll continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
