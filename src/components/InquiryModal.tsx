import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { Tour } from '../data/toursData';
import { useAuth } from '../context/AuthContext';

interface InquiryModalProps {
  tour?: Tour | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ tour, isOpen, onClose }) => {
  const { addMessage, user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage({
      name,
      email,
      phone,
      destination: tour ? tour.title : 'General Türkiye Inquiry',
      travelDate,
      guests,
      message,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/20 text-success mb-4">
              <Check className="size-6" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Message Received!</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Thank you {name}. Our local Türkiye tour specialist will review your request and get back to you within 12 hours.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className="eyebrow text-primary">Personalized Service</span>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground">
                {tour ? `Inquire about ${tour.title}` : 'Plan Your Türkiye Journey'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask about custom dates, private groups, or personalized route adjustments.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Miller"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 019 2834"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Number of Travellers
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Traveller' : 'Travellers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Estimated Travel Dates / Season
                </label>
                <input
                  type="text"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  placeholder="e.g. October 2026 or Spring 2027"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Notes, Questions, or Special Requests *
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you are looking for (dietary requirements, hotel preferences, private driver, etc.)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
