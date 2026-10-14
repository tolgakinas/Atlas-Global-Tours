import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  Mail,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { StarRating } from './StarRating';
import { useReviews } from '../context/ReviewsContext';
import { useAuth } from '../context/AuthContext';
import { TravelerType } from '../data/reviewsData';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourSlug: string;
  tourTitle: string;
  tourImage?: string;
  onReviewSubmitted?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor — Did not meet expectations',
  2: 'Fair — Several issues occurred',
  3: 'Average — Met expectations',
  4: 'Very Good — Thoroughly enjoyed',
  5: 'Exceptional — Truly extraordinary journey!',
};

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  tourSlug,
  tourTitle,
  tourImage,
  onReviewSubmitted,
}) => {
  const { addReview } = useReviews();
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [guideRating, setGuideRating] = useState<number>(5);
  const [itineraryRating, setItineraryRating] = useState<number>(5);
  const [valueRating, setValueRating] = useState<number>(5);
  const [accommodationRating, setAccommodationRating] = useState<number>(5);

  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorLocation, setAuthorLocation] = useState('');
  const [travelMonth, setTravelMonth] = useState('October 2026');
  const [travelerType, setTravelerType] = useState<TravelerType>('Couple');
  const [recommended, setRecommended] = useState<boolean>(true);
  const [certified, setCertified] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.name) setAuthorName(user.name);
      if (user.email) setAuthorEmail(user.email);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rating || rating < 1) {
      setError('Please select an overall star rating.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a headline or summary for your review.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 20) {
      setError('Please provide at least 20 characters describing your experience.');
      return;
    }

    if (!authorName.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!authorEmail.trim() || !authorEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!certified) {
      setError('Please check the box confirming this is an authentic review.');
      return;
    }

    addReview({
      tourSlug,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      authorLocation: authorLocation.trim() || 'Global Traveler',
      rating,
      categoryRatings: {
        guide: guideRating,
        itinerary: itineraryRating,
        value: valueRating,
        accommodation: accommodationRating,
      },
      title: title.trim(),
      comment: comment.trim(),
      travelMonth,
      travelerType,
      isVerified: true,
      recommended,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
      if (onReviewSubmitted) onReviewSubmitted();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8 custom-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          aria-label="Close review modal"
        >
          <X className="size-5" />
        </button>

        {submittedSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckCircle2 className="size-10" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground">
              Thank You for Your Feedback!
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your review for <span className="font-semibold text-foreground">{tourTitle}</span> has
              been published. Your genuine insights help future travelers make confident journey
              choices.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold">
              <Sparkles className="size-4" />
              <span>Updating tour rating and traveler feedback...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header / Tour Preview */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="size-4" />
                <span>Verified Traveler Review</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                Leave Feedback & Rating
              </h2>
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-border/80 bg-background/50 p-2.5">
                {tourImage && (
                  <img
                    src={tourImage}
                    alt={tourTitle}
                    className="size-12 rounded object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                    Reviewing Tour
                  </span>
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {tourTitle}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Overall Star Rating */}
            <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                1. Overall Tour Rating <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <StarRating
                  rating={rating}
                  interactive
                  size="xl"
                  onChange={(val) => setRating(val)}
                />
                <span className="text-sm font-semibold text-primary">
                  {RATING_LABELS[rating] || `${rating} Stars`}
                </span>
              </div>
            </div>

            {/* 2. Detailed Category Ratings */}
            <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                2. Rate Specific Journey Elements (1 to 5 Stars)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Guide Rating */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-card">
                  <span className="font-medium text-foreground">Local Guide & Expertise</span>
                  <StarRating
                    rating={guideRating}
                    interactive
                    size="sm"
                    onChange={(val) => setGuideRating(val)}
                  />
                </div>

                {/* Itinerary Rating */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-card">
                  <span className="font-medium text-foreground">Itinerary & Pacing</span>
                  <StarRating
                    rating={itineraryRating}
                    interactive
                    size="sm"
                    onChange={(val) => setItineraryRating(val)}
                  />
                </div>

                {/* Value Rating */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-card">
                  <span className="font-medium text-foreground">Value for Money</span>
                  <StarRating
                    rating={valueRating}
                    interactive
                    size="sm"
                    onChange={(val) => setValueRating(val)}
                  />
                </div>

                {/* Accommodation Rating */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-card">
                  <span className="font-medium text-foreground">Accommodation / Comfort</span>
                  <StarRating
                    rating={accommodationRating}
                    interactive
                    size="sm"
                    onChange={(val) => setAccommodationRating(val)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Review Title & Text */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Review Headline / Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unforgettable hot air balloon sunrise and authentic cave hotel experience!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Detailed Feedback & Traveler Advice <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="What were the memorable highlights? How was the local guide and meal experience? Any packing or practical tips for future travelers?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
                <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                  Minimum 20 characters ({comment.trim().length} entered)
                </span>
              </div>
            </div>

            {/* 4. Traveler Profile & Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Your Full Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. eleanor@example.com"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Your Home City & Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. Melbourne, Australia"
                    value={authorLocation}
                    onChange={(e) => setAuthorLocation(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  When Did You Travel?
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <select
                    value={travelMonth}
                    onChange={(e) => setTravelMonth(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="October 2026">October 2026</option>
                    <option value="September 2026">September 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                    <option value="June 2026">June 2026</option>
                    <option value="May 2026">May 2026</option>
                    <option value="April 2026">April 2026</option>
                    <option value="Earlier Season">Earlier Season</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Traveler Type
                </label>
                <select
                  value={travelerType}
                  onChange={(e) => setTravelerType(e.target.value as TravelerType)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="Couple">Couple</option>
                  <option value="Solo">Solo Traveler</option>
                  <option value="Family">Family with Children</option>
                  <option value="Friends">Group of Friends</option>
                  <option value="Group">Organized Group</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Would you recommend this tour?
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRecommended(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      recommended
                        ? 'border-success bg-success/15 text-success'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <ThumbsUp className="size-3.5" />
                    <span>Yes, Highly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecommended(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      !recommended
                        ? 'border-destructive bg-destructive/15 text-destructive'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span>No</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Certification Checkbox */}
            <div className="rounded-lg border border-border/80 bg-background/50 p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certified}
                  onChange={(e) => setCertified(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I certify that this review is based on my genuine travel experience with Atlas
                  Global Tours and represents my honest opinion. I have not received any inducement
                  or incentive to leave this review.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow hover:bg-primary/90 cursor-pointer transition-colors"
              >
                <Star className="size-4 fill-primary-foreground" />
                <span>Submit Review</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
