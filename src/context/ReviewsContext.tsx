import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Review, INITIAL_REVIEWS, generateFallbackReviews, CategoryRatings } from '../data/reviewsData';

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  categoryAverages: {
    guide: number;
    itinerary: number;
    value: number;
    accommodation: number;
  };
  percentRecommended: number;
}

interface ReviewsContextType {
  reviews: Review[];
  getReviewsForTour: (slug: string, tourTitle?: string) => Review[];
  getTourRatingStats: (slug: string, tourTitle?: string) => RatingStats;
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => Review;
  voteHelpful: (reviewId: string) => void;
  hasVotedHelpful: (reviewId: string) => boolean;
  deleteReview: (reviewId: string) => void;
  addHostReply: (reviewId: string, reply: { author: string; role: string; comment: string }) => void;
}

const STORAGE_KEY = 'agt_tour_reviews_v1';
const VOTED_KEY = 'agt_reviews_voted_helpful';

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with INITIAL_REVIEWS to ensure initial high-quality reviews are present
          const existingIds = new Set(parsed.map((r: Review) => r.id));
          const missingInitial = INITIAL_REVIEWS.filter((r) => !existingIds.has(r.id));
          return [...parsed, ...missingInitial];
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved reviews:', e);
    }
    return INITIAL_REVIEWS;
  });

  const [votedIds, setVotedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(VOTED_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set<string>();
  });

  // Persist reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Failed to save reviews:', e);
    }
  }, [reviews]);

  // Persist voted helpful to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(VOTED_KEY, JSON.stringify(Array.from(votedIds)));
    } catch {}
  }, [votedIds]);

  const getReviewsForTour = useCallback(
    (slug: string, tourTitle?: string): Review[] => {
      const tourReviews = reviews.filter((r) => r.tourSlug === slug);
      if (tourReviews.length > 0) {
        return tourReviews;
      }
      // If no explicit reviews exist yet, generate realistic seed reviews for this tour
      return generateFallbackReviews(slug, tourTitle || 'Atlas Global Tour');
    },
    [reviews]
  );

  const getTourRatingStats = useCallback(
    (slug: string, tourTitle?: string): RatingStats => {
      const tourReviews = getReviewsForTour(slug, tourTitle);

      if (tourReviews.length === 0) {
        return {
          averageRating: 5.0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          categoryAverages: { guide: 5.0, itinerary: 5.0, value: 5.0, accommodation: 5.0 },
          percentRecommended: 100,
        };
      }

      const total = tourReviews.length;
      const sum = tourReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Math.round((sum / total) * 10) / 10;

      const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let guideSum = 0;
      let itinSum = 0;
      let valSum = 0;
      let accomSum = 0;
      let recCount = 0;

      tourReviews.forEach((r) => {
        const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
        distribution[rounded] = (distribution[rounded] || 0) + 1;

        if (r.categoryRatings) {
          guideSum += r.categoryRatings.guide || r.rating;
          itinSum += r.categoryRatings.itinerary || r.rating;
          valSum += r.categoryRatings.value || r.rating;
          accomSum += r.categoryRatings.accommodation || r.rating;
        } else {
          guideSum += r.rating;
          itinSum += r.rating;
          valSum += r.rating;
          accomSum += r.rating;
        }

        if (r.recommended) recCount++;
      });

      return {
        averageRating: avg,
        totalReviews: total,
        distribution,
        categoryAverages: {
          guide: Math.round((guideSum / total) * 10) / 10,
          itinerary: Math.round((itinSum / total) * 10) / 10,
          value: Math.round((valSum / total) * 10) / 10,
          accommodation: Math.round((accomSum / total) * 10) / 10,
        },
        percentRecommended: Math.round((recCount / total) * 100),
      };
    },
    [getReviewsForTour]
  );

  const addReview = useCallback(
    (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): Review => {
      const newReview: Review = {
        ...reviewData,
        id: `rev-user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        helpfulCount: 0,
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => {
        // Check if there are generated fallback reviews for this tour in view;
        // If user is adding the first custom review, also keep the initial fallback so it doesn't suddenly drop to 1 review unless intended, or prepend cleanly.
        const hasExistingReal = prev.some((r) => r.tourSlug === reviewData.tourSlug);
        if (!hasExistingReal) {
          const fallbacks = generateFallbackReviews(reviewData.tourSlug, 'Atlas Global Tour');
          return [newReview, ...fallbacks, ...prev];
        }
        return [newReview, ...prev];
      });

      return newReview;
    },
    []
  );

  const voteHelpful = useCallback((reviewId: string) => {
    setVotedIds((prev) => {
      const next = new Set(prev);
      const isAlreadyVoted = next.has(reviewId);

      if (isAlreadyVoted) {
        next.delete(reviewId);
        // decrement helpful count
        setReviews((revList) =>
          revList.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: Math.max(0, r.helpfulCount - 1) } : r
          )
        );
      } else {
        next.add(reviewId);
        // increment helpful count
        setReviews((revList) =>
          revList.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
          )
        );
      }

      return next;
    });
  }, []);

  const hasVotedHelpful = useCallback(
    (reviewId: string) => {
      return votedIds.has(reviewId);
    },
    [votedIds]
  );

  const deleteReview = useCallback((reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }, []);

  const addHostReply = useCallback(
    (reviewId: string, reply: { author: string; role: string; comment: string }) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                hostReply: {
                  author: reply.author,
                  role: reply.role,
                  date: new Date().toISOString(),
                  comment: reply.comment,
                },
              }
            : r
        )
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      reviews,
      getReviewsForTour,
      getTourRatingStats,
      addReview,
      voteHelpful,
      hasVotedHelpful,
      deleteReview,
      addHostReply,
    }),
    [
      reviews,
      getReviewsForTour,
      getTourRatingStats,
      addReview,
      voteHelpful,
      hasVotedHelpful,
      deleteReview,
      addHostReply,
    ]
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
};

export const useReviews = (): ReviewsContextType => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
