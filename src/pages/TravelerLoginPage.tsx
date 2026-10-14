import React, { useState } from 'react';
import { User, Lock, Mail, Search, Shield, ArrowRight, CheckCircle2, AlertCircle, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TravelerLoginPageProps {
  onNavigate: (path: string) => void;
}

export const TravelerLoginPage: React.FC<TravelerLoginPageProps> = ({ onNavigate }) => {
  const { login, lookupBooking } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'lookup' | 'signup'>('signin');
  
  // Sign in / Sign up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Booking Lookup state
  const [lookupRef, setLookupRef] = useState('AGT-2026-8492');
  const [lookupEmail, setLookupEmail] = useState('jane.cooper@example.com');
  const [lookupError, setLookupError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, name || email.split('@')[0], 'traveller');
    onNavigate('/account');
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!lookupRef || !lookupEmail) {
      setLookupError('Please enter both your Booking Reference and Email address.');
      return;
    }

    const found = lookupBooking(lookupRef, lookupEmail);
    if (found) {
      onNavigate('/account');
    } else {
      setLookupError('No reservation found matching this reference and email. Please check your confirmation email or contact operations.');
    }
  };

  const handleQuickDemo = (demoEmail: string, demoName: string) => {
    login(demoEmail, demoName, 'traveller');
    onNavigate('/account');
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center bg-paper/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/atlas-logo.png"
            alt="Atlas Global Tours"
            className="h-8 w-auto mx-auto mb-3"
          />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Traveler Journey Portal
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Access your itinerary, download travel vouchers, customize dietary preferences, and manage departures.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-semibold mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`py-2 rounded-lg cursor-pointer transition-all ${
              authMode === 'signin'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign in to Account
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('lookup')}
            className={`py-2 rounded-lg cursor-pointer transition-all ${
              authMode === 'lookup'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Find by Booking Ref
          </button>
        </div>

        {/* Mode 1: Sign in with Email & Password */}
        {authMode === 'signin' && (
          <div>
            {/* Quick Demo Traveler Button */}
            <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-primary block">Test as Confirmed Traveler:</span>
                <span className="text-muted-foreground text-[0.7rem]">Jane Cooper (Confirmed Expedition Booking)</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemo('jane.cooper@example.com', 'Jane Cooper')}
                className="rounded-md bg-primary px-3 py-1.5 text-[0.7rem] font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                1-Click Demo Login
              </button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer mt-2"
              >
                Sign In to My Bookings <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mode 2: Instant Booking Reference Lookup */}
        {authMode === 'lookup' && (
          <div>
            <div className="mb-4 text-xs text-muted-foreground leading-relaxed">
              Don't have a password? Enter your unique reservation reference from your confirmation email along with the lead passenger's email address.
            </div>

            {lookupError && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Booking Reference Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                    placeholder="e.g. AGT-2026-8492"
                    className="w-full font-mono uppercase rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <span className="text-[0.65rem] text-muted-foreground mt-1 block">
                  Check confirmation email format: AGT-2026-XXXX
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Lead Passenger Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="jane.cooper@example.com"
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer mt-2"
              >
                Find & Manage Reservation <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer links for Operations and Admin */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <span>Are you an Atlas team member?</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/operations')}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Operations Portal →
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => onNavigate('/admin')}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Admin CMS →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
