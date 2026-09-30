import React, { useState } from 'react';
import { Menu, X, User, ChevronDown, Globe, Shield } from 'lucide-react';
import { useCurrency, Currency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: 'Multi-day tours', path: '/tours' },
    { label: 'Day tours', path: '/day-tours' },
    { label: 'Journal', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
        >
          <img
            src="/atlas-logo.png"
            alt="Atlas Türkiye Tours"
            className="h-8 w-auto object-contain"
          />
          <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:block">
            Global Tours
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-primary font-semibold border-b-2 border-primary pb-0.5'
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Currency, Auth, Browse CTA */}
        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border/80 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer"
              title="Select Currency"
            >
              <Globe className="size-3.5" />
              <span>{currency}</span>
              <ChevronDown className="size-3" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-md border border-border bg-card p-1 shadow-lg z-50">
                {(['EUR', 'USD', 'GBP', 'TRY'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded font-medium cursor-pointer transition-colors ${
                      currency === c
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {c} {c === 'EUR' ? '(€)' : c === 'USD' ? '($)' : c === 'GBP' ? '(£)' : '(₺)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Traveler Account Button / Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-md px-3 py-1.5 transition-colors cursor-pointer"
              >
                <User className="size-3.5" />
                <span className="truncate max-w-[120px]">{user.name}</span>
                <ChevronDown className="size-3" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-card p-1.5 shadow-lg z-50">
                  <div className="px-3 py-1.5 text-[0.7rem] text-muted-foreground border-b border-border">
                    Signed in as <br />
                    <span className="font-semibold text-foreground truncate block">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLinkClick('/account');
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLinkClick('/admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded font-medium text-foreground hover:bg-muted cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="size-3.5 text-primary" />
                    Admin Console
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors border-t border-border mt-1"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleLinkClick('/auth')}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-foreground/85 hover:text-foreground hover:bg-muted/80 rounded-md px-3 py-1.5 transition-colors cursor-pointer"
            >
              <User className="size-3.5" />
              <span>Sign in</span>
            </button>
          )}

          {/* Browse Tours Primary CTA */}
          <button
            onClick={() => handleLinkClick('/tours')}
            className="hidden sm:inline-flex items-center justify-center font-medium cursor-pointer transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3.5 text-xs"
          >
            Browse tours
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border lg:hidden text-foreground hover:bg-muted cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="container-page flex flex-col py-3">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`border-b border-border/60 py-3 text-left text-sm font-medium cursor-pointer ${
                  currentPath === link.path ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => handleLinkClick('/account')}
                  className="border-b border-border/60 py-3 text-left text-sm font-medium text-foreground/80 cursor-pointer"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => handleLinkClick('/admin')}
                  className="border-b border-border/60 py-3 text-left text-sm font-medium text-primary cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="size-3.5" />
                  Admin Console
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="py-3 text-left text-sm font-medium text-destructive cursor-pointer"
                >
                  Sign out ({user.name})
                </button>
              </>
            ) : (
              <button
                onClick={() => handleLinkClick('/auth')}
                className="py-3 text-left text-sm font-medium text-primary cursor-pointer"
              >
                Traveller Sign in
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
