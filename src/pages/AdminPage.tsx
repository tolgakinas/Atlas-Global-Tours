import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Calendar,
  Users,
  MessageSquare,
  Search,
  CheckCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { TOURS_DATA, Tour } from '../data/toursData';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

interface AdminPageProps {
  onSelectTour: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onSelectTour, onNavigate }) => {
  const { bookings, messages } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'tours' | 'bookings' | 'messages'>('tours');
  const [tourSearch, setTourSearch] = useState('');
  const [toursList, setToursList] = useState(TOURS_DATA);

  const togglePublish = (tourId: string) => {
    setToursList((prev) =>
      prev.map((t) => (t.id === tourId ? { ...t, is_published: !t.is_published } : t))
    );
  };

  const filteredTours = toursList.filter((t) =>
    t.title.toLowerCase().includes(tourSearch.toLowerCase()) ||
    t.slug.toLowerCase().includes(tourSearch.toLowerCase())
  );

  const totalDeparturesCount = toursList.reduce((acc, t) => acc + (t.departuresList?.length || 0), 0);

  return (
    <div className="min-h-screen py-10 lg:py-14 bg-background">
      <div className="container-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="size-5" />
              <span className="eyebrow">Atlas Global Operations</span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
              Admin & Operations Console
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/')}
              className="rounded-md border border-input bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Exit to Live Site
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Live Tours
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {toursList.length}
              </span>
              <span className="text-xs text-primary font-semibold">21 Active</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Guaranteed Departures
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {totalDeparturesCount}
              </span>
              <span className="text-xs text-success font-semibold">All synced</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Confirmed Bookings
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {bookings.length}
              </span>
              <span className="text-xs text-primary font-semibold">Active guest load</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Inquiries / Messages
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-foreground">
                {messages.length}
              </span>
              <span className="text-xs text-primary font-semibold">Pending response</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-border flex gap-6">
          <button
            onClick={() => setActiveTab('tours')}
            className={`pb-3 text-sm font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'tours'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Tours Catalog ({toursList.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-sm font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Bookings Log ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-3 text-sm font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'messages'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Inquiries ({messages.length})
          </button>
        </div>

        {/* Tab 1: Tours Table */}
        {activeTab === 'tours' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={tourSearch}
                  onChange={(e) => setTourSearch(e.target.value)}
                  placeholder="Filter tours by title or slug..."
                  className="w-full rounded-md border border-input bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-paper/60 uppercase tracking-wider text-muted-foreground text-[0.65rem]">
                  <tr>
                    <th className="py-3 px-4">Tour</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Starting Price</th>
                    <th className="py-3 px-4">Itinerary Days</th>
                    <th className="py-3 px-4">Departures</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTours.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={t.hero_image}
                            alt={t.title}
                            className="size-9 rounded object-cover shrink-0"
                          />
                          <span className="font-semibold text-foreground truncate max-w-xs block">
                            {t.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium uppercase text-[0.65rem]">
                        {t.tour_type === 'day' ? 'Day Tour' : 'Multi-day'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {t.tour_type === 'day' ? `${t.duration_hours || 3}H` : `${t.days}D / ${t.nights}N`}
                      </td>
                      <td className="py-3 px-4 font-bold text-primary">
                        {formatPrice(t.price_cents, t.currency)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {t.daysList?.length || 0} days
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {t.departuresList?.length || 0} dates
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                            t.is_published
                              ? 'bg-success-soft text-success border border-success-border'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {t.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => onSelectTour(t.slug)}
                          className="text-primary hover:underline font-semibold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => togglePublish(t.id)}
                          className="text-muted-foreground hover:text-foreground text-[0.7rem]"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="mt-6">
            {bookings.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-paper/60 uppercase tracking-wider text-muted-foreground text-[0.65rem]">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Lead Guest</th>
                      <th className="py-3 px-4">Tour</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Guests</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/40">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {b.reference}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold block text-foreground">{b.leadName}</span>
                          <span className="text-[0.7rem] text-muted-foreground">{b.leadEmail}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground max-w-xs truncate">
                          {b.tourTitle}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{b.departureDate}</td>
                        <td className="py-3 px-4">{b.guests}</td>
                        <td className="py-3 px-4 font-bold text-primary">
                          {formatPrice(b.totalPriceCents, b.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                              b.status === 'confirmed'
                                ? 'bg-success-soft text-success border border-success-border'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
                <p className="text-xs text-muted-foreground">No bookings recorded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Messages Table */}
        {activeTab === 'messages' && (
          <div className="mt-6 space-y-3">
            {messages.length > 0 ? (
              messages.map((m) => (
                <div key={m.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-foreground">{m.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({m.email} · {m.phone || 'No phone'})</span>
                    </div>
                    <span className="text-[0.7rem] text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-primary font-semibold">
                    Destination: {m.destination || 'General'} · Date: {m.travelDate || 'Flexible'} · Guests: {m.guests || '1-2'}
                  </div>
                  <p className="text-xs text-foreground/80 bg-paper/50 p-3 rounded-md">
                    {m.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
                <p className="text-xs text-muted-foreground">No customer inquiries submitted yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
