import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ComparisonContextType {
  comparedSlugs: string[];
  addTourToCompare: (slug: string) => boolean;
  removeTourFromCompare: (slug: string) => void;
  toggleTourComparison: (slug: string) => void;
  isTourInComparison: (slug: string) => boolean;
  clearComparison: () => void;
  setComparedSlugs: (slugs: string[]) => void;
  isComparisonModalOpen: boolean;
  openComparisonModal: () => void;
  closeComparisonModal: () => void;
  maxTours: number;
  highlightDifferences: boolean;
  setHighlightDifferences: (highlight: boolean) => void;
}

const MAX_COMPARE_TOURS = 4;
const STORAGE_KEY = 'agt_compared_tour_slugs';

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedSlugs, setComparedSlugsState] = useState<string[]>(() => {
    // Check URL parameters first (e.g., ?compare=slug1,slug2)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCompare = urlParams.get('compare');
      if (urlCompare) {
        const parsed = urlCompare.split(',').filter(Boolean).slice(0, MAX_COMPARE_TOURS);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }

    // Check localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_COMPARE_TOURS);
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedSlugs));
    } catch {
      // fallback
    }
  }, [comparedSlugs]);

  const addTourToCompare = (slug: string): boolean => {
    if (comparedSlugs.includes(slug)) return true;
    if (comparedSlugs.length >= MAX_COMPARE_TOURS) {
      return false;
    }
    setComparedSlugsState((prev) => [...prev, slug]);
    return true;
  };

  const removeTourFromCompare = (slug: string) => {
    setComparedSlugsState((prev) => prev.filter((s) => s !== slug));
  };

  const toggleTourComparison = (slug: string) => {
    if (comparedSlugs.includes(slug)) {
      removeTourFromCompare(slug);
    } else {
      addTourToCompare(slug);
    }
  };

  const isTourInComparison = (slug: string): boolean => {
    return comparedSlugs.includes(slug);
  };

  const clearComparison = () => {
    setComparedSlugsState([]);
  };

  const setComparedSlugs = (slugs: string[]) => {
    setComparedSlugsState(slugs.slice(0, MAX_COMPARE_TOURS));
  };

  const openComparisonModal = () => {
    setIsComparisonModalOpen(true);
  };

  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparedSlugs,
        addTourToCompare,
        removeTourFromCompare,
        toggleTourComparison,
        isTourInComparison,
        clearComparison,
        setComparedSlugs,
        isComparisonModalOpen,
        openComparisonModal,
        closeComparisonModal,
        maxTours: MAX_COMPARE_TOURS,
        highlightDifferences,
        setHighlightDifferences,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
