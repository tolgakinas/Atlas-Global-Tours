import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 2000);
  };

  return (
    <footer className="mt-24 bg-sidebar text-sidebar-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        {/* Brand Column */}
        <div className="md:col-span-2">
          <img
            src="/atlas-logo.png"
            alt="Atlas Türkiye Tours"
            className="h-8 w-auto brightness-0 invert"
          />
          <p className="mt-4 max-w-sm text-sm text-sidebar-foreground/75 leading-relaxed">
            US based tour operator running small group multi-day trips and day tours with licensed local guides.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex max-w-sm gap-2">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-9 w-full rounded-md border border-sidebar-border bg-sidebar/50 px-3 py-1 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-9 px-4 shrink-0"
            >
              {subscribed ? (
                <>
                  <Check className="size-3.5" />
                  <span>Joined!</span>
                </>
              ) : (
                'Join'
              )}
            </button>
          </form>
          {subscribed && (
            <p className="mt-2 text-xs text-sidebar-primary">
              Thank you for subscribing to our travel dispatches.
            </p>
          )}
        </div>

        {/* Travel Column */}
        <div>
          <h3 className="eyebrow text-sidebar-primary">Travel</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-sidebar-foreground/80">
            <li>
              <button
                onClick={() => onNavigate('/tours')}
                className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Multi-day tours
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/day-tours')}
                className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Day tours
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/blog')}
                className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Journal & Guides
              </button>
            </li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h3 className="eyebrow text-sidebar-primary">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-sidebar-foreground/80">
            <li>
              <button
                onClick={() => onNavigate('/about')}
                className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                About us
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/contact')}
                className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Contact
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/auth')}
                className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Traveller login
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/admin')}
                className="hover:text-sidebar-primary transition-colors cursor-pointer text-left text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
              >
                Admin portal
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sidebar-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-sidebar-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Atlas Türkiye Tours. All rights reserved.</p>
          <p className="tracking-wide">Small Groups · Licensed Local Guides · Worldwide</p>
        </div>
      </div>
    </footer>
  );
};
