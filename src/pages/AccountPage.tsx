import React, { useState } from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Download,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Printer,
  X,
  Send,
  MessageSquare,
  Shield,
  Phone,
  Mail,
  Utensils,
  Clock,
  QrCode
} from 'lucide-react';
import { useAuth, Booking } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTours } from '../context/ToursContext';
import { resolveTourCode } from '../utils/bookingReference';

interface AccountPageProps {
  onNavigate: (path: string) => void;
  onSelectTour: (slug: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onSelectTour }) => {
  const { user, bookings, updateBooking, cancelBooking, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const { releaseDepartureSeats } = useTours();

  // Active modal state
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [messageBooking, setMessageBooking] = useState<Booking | null>(null);
  
  // Edit form state
  const [editDietary, setEditDietary] = useState('');
  const [editSpecial, setEditSpecial] = useState('');
  const [editEmergName, setEditEmergName] = useState('');
  const [editEmergPhone, setEditEmergPhone] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Message form state
  const [msgContent, setMsgContent] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen py-20 text-center container-page">
        <div className="max-w-md mx-auto rounded-xl border border-border bg-card p-8 shadow-sm">
          <AlertCircle className="size-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold text-foreground">Sign in required</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Please log in with your traveler credentials or booking reference to view and manage your reservations.
          </p>
          <button
            onClick={() => onNavigate('/login')}
            className="mt-6 rounded-md bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Go to Traveler Login
          </button>
        </div>
      </div>
    );
  }

  // Filter bookings for current logged in user (or show all if demo user)
  const userBookings = bookings.filter(
    (b) =>
      b.leadEmail.toLowerCase() === user.email.toLowerCase() ||
      user.role === 'admin' ||
      user.email === 'jane.cooper@example.com'
  );

  const openEditModal = (b: Booking) => {
    setEditingBooking(b);
    setEditDietary(b.dietaryNotes || '');
    setEditSpecial(b.specialRequests || '');
    setEditEmergName(b.emergencyContactName || '');
    setEditEmergPhone(b.emergencyContactPhone || '');
    setEditSuccessMsg('');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    updateBooking(editingBooking.reference, {
      dietaryNotes: editDietary,
      specialRequests: editSpecial,
      emergencyContactName: editEmergName,
      emergencyContactPhone: editEmergPhone,
    });

    setEditSuccessMsg('Your journey preferences and emergency details were updated successfully!');
    setTimeout(() => {
      setEditingBooking(null);
      setEditSuccessMsg('');
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent || !messageBooking) return;
    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setMessageBooking(null);
      setMsgContent('');
    }, 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-12 lg:py-16 bg-background">
      <div className="container-page max-w-5xl">
        {/* User Header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="eyebrow text-primary">Traveler Journey Portal</span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {user.name}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{user.email}</span>
              <span>·</span>
              <span className="capitalize text-primary font-semibold font-mono">
                {userBookings.length} Active Reservation{userBookings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('/tours')}
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Browse More Tours
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
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                My Bookings & Expeditions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your confirmed departures, print travel vouchers, and update dietary preferences.
              </p>
            </div>
          </div>

          {userBookings.length > 0 ? (
            <div className="space-y-6">
              {userBookings.map((booking) => {
                const isConfirmed = booking.status === 'confirmed';
                const isCancelled = booking.status === 'cancelled';

                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col lg:flex-row gap-6 items-start justify-between"
                  >
                    {/* Image and Basic Info */}
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <img
                        src={booking.tourImage}
                        alt={booking.tourTitle}
                        className="size-24 rounded-lg object-cover shrink-0 border border-border"
                      />
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                            {booking.reference}
                          </span>
                          <span className="font-mono text-[0.7rem] font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            Code: {booking.tourCode || resolveTourCode(booking)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? 'bg-success-soft text-success border border-success-border'
                                : 'bg-destructive/10 text-destructive border border-destructive/20'
                            }`}
                          >
                            {booking.status}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-foreground">
                            Payment: {booking.paymentStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <h3
                          onClick={() => onSelectTour(booking.tourSlug)}
                          className="font-display text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          {booking.tourTitle}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-primary" />
                            Departure: <strong className="text-foreground">{booking.departureDate}</strong>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-primary" />
                            Guests: <strong className="text-foreground">{booking.guests} Traveller{booking.guests > 1 ? 's' : ''}</strong>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Shield className="size-3.5 text-primary" />
                            Guide: <strong className="text-foreground">{booking.assignedGuide || 'Serkan Yılmaz (Licensed)'}</strong>
                          </span>
                        </div>

                        {/* Special Requests & Dietary preview */}
                        {(booking.dietaryNotes || booking.specialRequests) && (
                          <div className="mt-2 text-xs bg-muted/50 p-2.5 rounded-lg border border-border/70 space-y-1">
                            {booking.dietaryNotes && (
                              <div className="flex items-center gap-1.5 text-foreground/90">
                                <Utensils className="size-3 text-primary" />
                                <span>Dietary: {booking.dietaryNotes}</span>
                              </div>
                            )}
                            {booking.specialRequests && (
                              <div className="text-muted-foreground text-[0.7rem]">
                                Requests: {booking.specialRequests}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-48 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                      <div className="mb-1 text-right lg:text-right hidden sm:block lg:block">
                        <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground block">
                          Total Amount
                        </span>
                        <span className="font-display text-lg font-bold text-primary">
                          {formatPrice(booking.totalPriceCents, booking.currency)}
                        </span>
                      </div>

                      {/* Print Voucher Action */}
                      <button
                        onClick={() => setSelectedVoucher(booking)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                      >
                        <Printer className="size-3.5" />
                        Travel Voucher & Ticket
                      </button>

                      {/* Edit Preferences */}
                      <button
                        onClick={() => openEditModal(booking)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Utensils className="size-3.5 text-primary" />
                        Dietary & Requests
                      </button>

                      {/* Message Tour Manager */}
                      <button
                        onClick={() => setMessageBooking(booking)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <MessageSquare className="size-3.5 text-primary" />
                        Message Guide / Manager
                      </button>

                      {/* Cancel Booking Action */}
                      {!isCancelled && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel booking ${booking.reference}? Operations will be notified.`)) {
                              cancelBooking(booking.reference);
                              releaseDepartureSeats(booking.tourId, booking.departureDate, booking.guests);
                            }
                          }}
                          className="text-[0.7rem] text-muted-foreground hover:text-destructive transition-colors text-center py-1 cursor-pointer"
                        >
                          Cancel Reservation
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Calendar className="size-12 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-foreground">
                No reservations found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                You do not have any active bookings under {user.email}. Book a tour online or look up your reservation reference.
              </p>
              <button
                onClick={() => onNavigate('/tours')}
                className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Explore Destinations <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Traveler Help & Preparation Box */}
        <div className="mt-12 rounded-xl border border-border bg-paper/60 p-6">
          <h3 className="font-display text-base font-bold text-foreground mb-2 flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            Atlas Traveler Guarantee & Preparation Notes
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div>
              <strong className="text-foreground block mb-0.5">Meeting Point Protocol</strong>
              Licensed guides meet travelers with Atlas signage 30 minutes prior to scheduled departure time.
            </div>
            <div>
              <strong className="text-foreground block mb-0.5">Luggage Allowance</strong>
              1 standard check-in suitcase (23kg) plus 1 daypack per passenger on all multi-day transfers.
            </div>
            <div>
              <strong className="text-foreground block mb-0.5">24/7 Duty Manager Support</strong>
              Call +90 (532) 745 19 82 for urgent on-tour assistance or hotel arrival updates.
            </div>
          </div>
        </div>
      </div>

      {/* 1. Official Printable Travel Voucher Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Printable Voucher Sheet */}
            <div id="printable-voucher" className="border-2 border-primary/30 rounded-xl p-6 bg-paper/30 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-primary/20 pb-4">
                <div>
                  <img src="/atlas-logo.png" alt="Atlas Tours" className="h-7 w-auto mb-1.5" />
                  <span className="text-[0.65rem] uppercase font-bold tracking-widest text-primary block">
                    Official Travel Voucher & Confirmed Ticket
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-primary block bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
                    {selectedVoucher.reference}
                  </span>
                  <span className="font-mono text-[0.7rem] font-bold text-foreground mt-1 block">
                    Tour Code: {selectedVoucher.tourCode || resolveTourCode(selectedVoucher)}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground mt-0.5 block">
                    Issued: {new Date(selectedVoucher.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tour and Departure Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground block">
                    Expedition
                  </span>
                  <span className="font-display font-bold text-foreground block text-sm">
                    {selectedVoucher.tourTitle}
                  </span>
                </div>

                <div>
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground block">
                    Confirmed Departure
                  </span>
                  <span className="font-bold text-primary block text-sm">
                    {selectedVoucher.departureDate}
                  </span>
                </div>

                <div>
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground block">
                    Passengers
                  </span>
                  <span className="font-bold text-foreground block text-sm">
                    {selectedVoucher.guests} Person(s)
                  </span>
                </div>

                <div>
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground block">
                    Lead Traveler
                  </span>
                  <span className="font-bold text-foreground block">
                    {selectedVoucher.leadName}
                  </span>
                </div>

                <div>
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground block">
                    Lead Contact Phone
                  </span>
                  <span className="font-mono text-foreground block">
                    {selectedVoucher.leadPhone}
                  </span>
                </div>

                <div>
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground block">
                    Payment Status
                  </span>
                  <span className="font-bold text-success capitalize block">
                    {selectedVoucher.paymentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Guide and Meeting Instructions */}
              <div className="bg-card rounded-lg border border-border p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Shield className="size-3.5" /> Licensed Guide & Driver
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedVoucher.assignedGuide || 'Serkan Yılmaz'}
                  </span>
                </div>
                <p className="text-muted-foreground text-[0.75rem] leading-relaxed">
                  Meeting Point: Hotel lobby at 09:00 AM on departure date, or designated Atlas meeting terminal. Present this voucher (printed or on smartphone) to your lead guide.
                </p>
                {selectedVoucher.dietaryNotes && (
                  <div className="pt-2 border-t border-border/60 text-[0.7rem] text-foreground">
                    <strong>Confirmed Dietary/Requests:</strong> {selectedVoucher.dietaryNotes}
                  </div>
                )}
              </div>

              {/* QR Code and Emergency Contact Footer */}
              <div className="flex items-center justify-between border-t border-border pt-4 text-[0.7rem] text-muted-foreground">
                <div className="space-y-0.5">
                  <span className="block font-semibold text-foreground">24/7 Operations Hotline:</span>
                  <span className="font-mono text-primary font-bold">+90 (532) 745 19 82</span>
                  <span className="block text-[0.65rem]">TÜRSAB Licensed Operator No: 9482</span>
                </div>
                <div className="size-16 bg-card border border-border rounded flex flex-col items-center justify-center text-[0.6rem] font-mono text-muted-foreground">
                  <QrCode className="size-10 text-foreground" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="rounded-md border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-md bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="size-4" />
                Print Voucher / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Preferences & Dietary Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <button
              onClick={() => setEditingBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              Dietary & Journey Preferences
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Updating reservation <strong className="font-mono text-primary">{editingBooking.reference}</strong>
            </p>

            {editSuccessMsg && (
              <div className="mb-4 rounded-lg border border-success-border bg-success-soft p-3 text-xs text-success flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Dietary Restrictions / Food Allergies
                </label>
                <input
                  type="text"
                  value={editDietary}
                  onChange={(e) => setEditDietary(e.target.value)}
                  placeholder="e.g. Vegetarian, Nut allergy, Halal, Gluten-free"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Special Accommodation / Walking Requests
                </label>
                <textarea
                  rows={3}
                  value={editSpecial}
                  onChange={(e) => setEditSpecial(e.target.value)}
                  placeholder="e.g. Twin beds requested, extra walking stick needed, anniversary celebration"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-[0.65rem] uppercase font-bold text-muted-foreground block mb-2">
                  Emergency Contact on Tour
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[0.65rem] text-muted-foreground mb-0.5">Contact Name</label>
                    <input
                      type="text"
                      value={editEmergName}
                      onChange={(e) => setEditEmergName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] text-muted-foreground mb-0.5">Phone Number</label>
                    <input
                      type="text"
                      value={editEmergPhone}
                      onChange={(e) => setEditEmergPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="rounded-md border border-input px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Message Guide / Manager Modal */}
      {messageBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <button
              onClick={() => setMessageBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              Message Tour Manager
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Your inquiry will be directly routed to the lead guide for <strong className="text-foreground">{messageBooking.tourTitle}</strong> ({messageBooking.reference}).
            </p>

            {msgSent ? (
              <div className="rounded-lg border border-success-border bg-success-soft p-4 text-xs text-success flex items-center gap-2">
                <CheckCircle2 className="size-5 shrink-0" />
                <span>Message dispatched to Atlas Operations team! We will reply via email/WhatsApp shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    placeholder="Ask about meeting location, weather, recommended footwear, or flight arrival changes..."
                    className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageBooking(null)}
                    className="rounded-md border border-input px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="size-3.5" />
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
