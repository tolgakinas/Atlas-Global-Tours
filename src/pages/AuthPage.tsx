import React, { useState } from 'react';
import { User, Lock, Mail, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onNavigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, name || email.split('@')[0], 'traveller');
    onNavigate('/account');
  };

  const handleQuickDemoTraveller = () => {
    login('traveller@atlasglobaltours.com', 'Jane Cooper', 'traveller');
    onNavigate('/account');
  };

  const handleQuickDemoAdmin = () => {
    login('admin@atlasglobaltours.com', 'Atlas Operations Manager', 'admin');
    onNavigate('/admin');
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center bg-paper/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="text-center mb-6">
          <img
            src="/atlas-logo.png"
            alt="Atlas Türkiye Tours"
            className="h-8 w-auto mx-auto mb-3"
          />
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isSignUp ? 'Create your traveller account' : 'Traveller portal login'}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Access your booked itineraries, vouchers, and direct guides communication.
          </p>
        </div>

        {/* Quick Demo Logins Banner */}
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs space-y-2">
          <span className="font-bold text-primary block">Instant Demo Access:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoTraveller}
              className="rounded border border-primary/30 bg-card py-1.5 px-2.5 text-[0.7rem] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              Sign in as Traveller
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="rounded border border-border bg-card py-1.5 px-2.5 text-[0.7rem] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Shield className="size-3 text-primary" />
              Sign in as Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Cooper"
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

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
                placeholder="traveller@example.com"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <span>{isSignUp ? 'Create Account' : 'Sign in'}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Create one
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
