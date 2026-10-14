import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, ChevronDown, LogOut, Check } from 'lucide-react';
import { useCurrency, Currency, CURRENCIES } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { HeaderSearchBar } from './HeaderSearchBar';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currency, setCurrency, detectedCountry, source } = useCurrency();
  const { user, logout } = useAuth();

  const currencyRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setUserDropdownOpen(false);
    setCurrencyDropdownOpen(false);
  };

  const currencyList: Currency[] = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'NZD'];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between gap-4 sm:gap-6 py-3">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
        >
          <img
            src="/atlas-logo.png"
            alt="Atlas Global Tours"
            className="h-8 w-auto object-contain"
          />
          <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:block">
            Global Tours
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 xl:gap-7 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              currentPath === link.path ||
              (link.path !== '/' && currentPath.startsWith(link.path));
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

        {/* Search Bar Component (Filters by name, destination, activity type) */}
        <HeaderSearchBar onNavigate={handleLinkClick} />

        {/* Right Actions: Minimal Currency & Traveler Account */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Minimal Currency Switcher */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg px-2 py-1.5 transition-colors cursor-pointer hover:bg-muted/70"
              title="Change Currency (OANDA FX rates)"
              aria-label="Select currency"
            >
              <span>{currency}</span>
              <span className="text-[0.68rem] text-muted-foreground/80 font-mono">
                {CURRENCIES[currency].symbol}
              </span>
              <ChevronDown className="size-3 text-muted-foreground transition-transform duration-150" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2.5 py-1.5 border-b border-border/70 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] font-bold text-foreground uppercase tracking-wider">
                      Currency
                    </span>
                    <a
                      href="https://www.oanda.com/currency-converter/en/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.62rem] font-medium text-primary hover:underline"
                    >
                      OANDA Rates
                    </a>
                  </div>
                  {detectedCountry && (
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                      Auto-detected location: {detectedCountry}
                    </p>
                  )}
                </div>

                <div className="space-y-0.5">
                  {currencyList.map((c) => {
                    const info = CURRENCIES[c];
                    const isSelected = currency === c;
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          setCurrency(c);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{info.flag}</span>
                          <span>
                            {info.code} <span className={isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}>({info.symbol})</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[0.7rem] ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                            {info.name}
                          </span>
                          {isSelected && <Check className="size-3.5 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-border/70 px-2 py-1 text-[0.63rem] text-muted-foreground leading-snug">
                  Rates converted using OANDA interbank benchmark FX feeds (oanda.com).
                </div>
              </div>
            )}
          </div>

          {/* Traveler Portal / Account Button / Dropdown */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer border border-primary/20"
              >
                <User className="size-3.5" />
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{user.name}</span>
                <ChevronDown className="size-3" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 text-[0.7rem] text-muted-foreground border-b border-border">
                    Traveler Account <br />
                    <span className="font-semibold text-foreground truncate block">{user.email}</span>
                  </div>
                  <button
                    onClick={() => handleLinkClick('/account')}
                    className="w-full text-left px-3 py-2 text-xs rounded-md font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <span>My Bookings & Vouchers</span>
                    <span className="text-[0.65rem] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono">
                      Portal
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-md font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors border-t border-border mt-1 flex items-center gap-1.5"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleLinkClick('/login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90 hover:text-foreground border border-border/80 hover:bg-muted/80 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              <User className="size-3.5 text-primary" />
              <span>My Bookings</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="inline-flex size-8 sm:size-9 items-center justify-center rounded-md border border-border lg:hidden text-foreground hover:bg-muted cursor-pointer ml-1"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Only public & traveler links; operation and admin toggles only on footer) */}
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

            <div className="pt-3 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => handleLinkClick('/account')}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-primary bg-primary/10 cursor-pointer flex items-center justify-between"
                  >
                    <span>My Bookings & Travel Vouchers</span>
                    <span className="text-xs bg-primary/20 px-2 py-0.5 rounded font-mono">
                      Portal
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-sm font-medium text-destructive cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out ({user.name})</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-foreground bg-muted hover:bg-muted/80 cursor-pointer flex items-center gap-2"
                >
                  <User className="size-4 text-primary" />
                  <span>Traveler Login & Booking Lookup</span>
                </button>
              )}
            </div>

            {/* Quick Impact & Care navigation */}
            <div className="pt-3 border-t border-border/60 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => handleLinkClick('/sustainable-tourism')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Sustainable Tourism
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleLinkClick('/responsible-travel')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Responsible Travel
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleLinkClick('/atlas-cares')}
                className="text-primary font-medium hover:underline cursor-pointer"
              >
                Atlas Cares
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
