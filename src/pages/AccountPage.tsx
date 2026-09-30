import React from 'react';
import { Calendar, Users, MapPin, Download, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

interface AccountPageProps {
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onSelectTour }) => {
  const { user, bookings, cancelBooking, logout } = useAuth();
  const { formatPrice } = useCurrency();

  if (!user) {
    return (
      <div className="min-h-screen py-20 text-center container-page">
        <div className="max-w-md mx-auto rounded-xl border border-border bg-card p-8 shadow-sm">
          <AlertCircle className="size-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold text-foreground">Sign in required</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Please log in with your traveller credentials to view your bookings and travel documents.
          </p>
          <button
            onClick={() => onNavigate('/auth')}
            className="mt-6 rounded-md bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Sign in to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container-page max-w-5xl">
        {/* User Header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="eyebrow text-primary">Traveller Dashboard</span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {user.name}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/tours')}
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Book New Tour
            </button>
            <button
              onClick={logout}
              className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              My Reservations ({bookings.length})
            </h2>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={booking.tourImage}
                      alt={booking.tourTitle}
                      className="size-20 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {booking.reference}
                        </span>
                        <span
                          className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-success-soft text-success border border-success-border'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectTour(booking.tourSlug)}
                        className="font-display text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {booking.tourTitle}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-primary" />
                          {booking.departureDate}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3 text-primary" />
                          {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-foreground">
                          {formatPrice(booking.totalPriceCents, booking.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Download className="size-3" />
                      Voucher
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel booking ${booking.reference}?`)) {
                            cancelBooking(booking.reference);
                          }
                        }}
                        className="rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
              <Calendar className="size-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-foreground">No bookings yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                When you reserve a spot on one of our small group journeys, it will appear here.
              </p>
              <button
                onClick={() => onNavigate('/tours')}
                className="mt-4 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Browse Journeys
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
