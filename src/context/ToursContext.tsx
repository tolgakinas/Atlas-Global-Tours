import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Tour, TOURS_DATA, DestinationRegion, DESTINATION_REGIONS, TourDay } from '../data/toursData';
import { Post, POSTS_DATA } from '../data/postsData';

export interface SiteContent {
  heroTagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  vimeoId: string;
  vimeoPoster: string;
  brandEthosTitle: string;
  brandEthosText1: string;
  brandEthosText2: string;
  licensedGuideStat: string;
  maxPaxStat: string;
  officeIstanbul: string;
  officeUS: string;
  contactEmail: string;
  contactPhone: string;
  emergencyPhone: string;
  defaultSingleSupplementPercent?: number;
  roomPolicyNoteDouble?: string;
  roomPolicyNoteTwin?: string;
  roomPolicyNoteSingle?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  astaLogoUrl?: string;
  irsLogoUrl?: string;
  tourRadarUrl?: string;
  tourhubUrl?: string;
  travelstrideUrl?: string;
  viatorUrl?: string;
  getYourGuideUrl?: string;
  trustpilotUrl?: string;
  trustedSiteUrl?: string;
  trustedSiteLogoUrl?: string;
}

const DEFAULT_SITE_CONTENT: SiteContent = {
  heroTagline: 'Türkiye specialists & Worldwide Journeys · Since 2012',
  heroHeadline: 'Small group immersive tours run by locals.',
  heroSubtitle: 'Multi-day journeys categorized regarding continents & places — spanning Europe (Istanbul, Aegean, Balkans), Asia (Cappadocia, Mesopotamia, Caucasus, Middle East, Vietnam), and Africa (Egypt, Morocco, Kenya).',
  vimeoId: '347747035',
  vimeoPoster: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1600&q=80',
  brandEthosTitle: 'Travel designed like you are visiting old friends.',
  brandEthosText1: 'We started Atlas Global Tours with one principle: skip the megaphone bus tours. Instead, we travel in groups of 8 to 12 with guides who grew up in the valleys they show you.',
  brandEthosText2: 'You will dine in village homes, sip çay in Ottoman caravanserai courtyards, and walk ancient trails long after the day-tripper coaches have departed.',
  licensedGuideStat: '100% Licensed Ministry Guides',
  maxPaxStat: 'Max 12 Travellers per group',
  officeIstanbul: 'Sultanahmet Mah., Divanyolu Cad. No: 42, Fatih, Istanbul, Türkiye',
  officeUS: '1201 3rd Ave, Suite 2200, Seattle, WA 98101, United States',
  contactEmail: 'contact@atlasglobaltours.com',
  contactPhone: '+90 (212) 518 84 92',
  emergencyPhone: '+90 (532) 745 19 82 (24/7 Operations Duty Manager)',
  defaultSingleSupplementPercent: 15,
  roomPolicyNoteDouble: 'Double room for couples (1 large bed).',
  roomPolicyNoteTwin: 'Twin share can be shared by two same-gender travellers or friends (2 single beds).',
  roomPolicyNoteSingle: 'Single room for solo travelers (subject to apply single supplement: trip price + 15% more).',
  tiktokUrl: 'https://www.tiktok.com/@atlasglobaltours',
  linkedinUrl: 'https://www.linkedin.com/company/atlasglobaltours',
  facebookUrl: 'https://facebook.com/atlasglobaltours',
  instagramUrl: 'https://instagram.com/atlasglobaltours',
  xUrl: 'https://x.com/atlasglobaltours',
  youtubeUrl: 'https://youtube.com/@atlasglobaltours',
  whatsappUrl: 'https://wa.me/905067088939',
  astaLogoUrl: 'https://www.astanyc.com/uploads/1/3/1/3/131383421/astalogonew_4.png',
  irsLogoUrl: 'https://1000logos.net/wp-content/uploads/2022/03/IRS-Logo-1862-500x281.png',
  tourRadarUrl: 'https://www.tourradar.com/o/atlas-global-tours',
  tourhubUrl: 'https://tourhub.co/search/operator/Atlas%20Global%20Tours',
  travelstrideUrl: 'https://www.travelstride.com/tour-operators/atlas-global-tours',
  viatorUrl: 'https://www.viator.com/operator/5592559',
  getYourGuideUrl: 'https://www.getyourguide.com/atlas-global-tours-s644611/',
  trustpilotUrl: 'https://www.trustpilot.com/review/atlasglobaltours.com',
  trustedSiteUrl: 'https://www.trustedsite.com/verify?host=atlasglobaltours.com',
  trustedSiteLogoUrl: '/logos/trustedsite-certified-secure.svg',
};

export type FilterCategory = 'all' | 'name' | 'destination' | 'activity';

interface ToursContextType {
  tours: Tour[];
  destinationRegions: DestinationRegion[];
  posts: Post[];
  siteContent: SiteContent;
  getTourBySlug: (slug: string) => Tour | undefined;
  addTour: (newTour: Tour) => void;
  updateTour: (id: string, updated: Partial<Tour>) => void;
  deleteTour: (id: string) => void;
  togglePublishTour: (id: string) => void;
  updateItineraryDay: (tourId: string, dayNumber: number, dayData: Partial<TourDay>) => void;
  addItineraryDay: (tourId: string, newDay: TourDay) => void;
  deleteItineraryDay: (tourId: string, dayNumber: number) => void;
  updateDestinationRegion: (id: string, updated: Partial<DestinationRegion>) => void;
  addDestinationRegion: (newRegion: DestinationRegion) => void;
  deleteDestinationRegion: (id: string) => void;
  updateSiteContent: (updated: Partial<SiteContent>) => void;
  addPost: (newPost: Post) => void;
  updatePost: (id: string, updated: Partial<Post>) => void;
  deletePost: (id: string) => void;
  resetAllToDefaults: () => void;
  // Search & Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDestinationFilter: string;
  setSelectedDestinationFilter: (destination: string) => void;
  selectedActivityFilter: string;
  setSelectedActivityFilter: (activity: string) => void;
  filterMode: FilterCategory;
  setFilterMode: (mode: FilterCategory) => void;
  clearFilters: () => void;
  filteredTours: Tour[];
}

const ToursContext = createContext<ToursContextType | undefined>(undefined);

export const ToursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Tours State
  const [tours, setTours] = useState<Tour[]>(() => {
    try {
      const saved = localStorage.getItem('agt_tours_data_v2');
      if (saved) return JSON.parse(saved);
      return TOURS_DATA;
    } catch {
      return TOURS_DATA;
    }
  });

  // 2. Destination Regions State
  const [destinationRegions, setDestinationRegions] = useState<DestinationRegion[]>(() => {
    try {
      const saved = localStorage.getItem('agt_destinations_data_v2');
      if (saved) return JSON.parse(saved);
      return DESTINATION_REGIONS;
    } catch {
      return DESTINATION_REGIONS;
    }
  });

  // 3. Blog Posts State
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('agt_posts_data_v2');
      if (saved) return JSON.parse(saved);
      return POSTS_DATA;
    } catch {
      return POSTS_DATA;
    }
  });

  // 4. Site Content State
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem('agt_site_content_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          !parsed.irsLogoUrl ||
          parsed.irsLogoUrl === 'https://logos-world.net/wp-content/uploads/2021/02/IRS-Logo-700x394.png'
        ) {
          parsed.irsLogoUrl = 'https://1000logos.net/wp-content/uploads/2022/03/IRS-Logo-1862-500x281.png';
        }
        return { ...DEFAULT_SITE_CONTENT, ...parsed };
      }
      return DEFAULT_SITE_CONTENT;
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('agt_tours_data_v2', JSON.stringify(tours));
    } catch (e) {
      console.error('Failed to save tours to localStorage', e);
    }
  }, [tours]);

  useEffect(() => {
    try {
      localStorage.setItem('agt_destinations_data_v2', JSON.stringify(destinationRegions));
    } catch (e) {
      console.error('Failed to save destination regions to localStorage', e);
    }
  }, [destinationRegions]);

  useEffect(() => {
    try {
      localStorage.setItem('agt_posts_data_v2', JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save posts to localStorage', e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('agt_site_content_v2', JSON.stringify(siteContent));
    } catch (e) {
      console.error('Failed to save site content to localStorage', e);
    }
  }, [siteContent]);

  // Helper
  const getTourBySlug = (slug: string) => {
    return tours.find((t) => t.slug === slug);
  };

  // Tour actions
  const addTour = (newTour: Tour) => {
    setTours((prev) => [newTour, ...prev]);
  };

  const updateTour = (id: string, updated: Partial<Tour>) => {
    setTours((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated, updated_at: new Date().toISOString() } : t))
    );
  };

  const deleteTour = (id: string) => {
    setTours((prev) => prev.filter((t) => t.id !== id));
  };

  const togglePublishTour = (id: string) => {
    setTours((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_published: !t.is_published } : t))
    );
  };

  // Itinerary actions
  const updateItineraryDay = (tourId: string, dayNumber: number, dayData: Partial<TourDay>) => {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourId) return t;
        const updatedDays = (t.daysList || []).map((d) =>
          d.day_number === dayNumber ? { ...d, ...dayData } : d
        );
        return { ...t, daysList: updatedDays };
      })
    );
  };

  const addItineraryDay = (tourId: string, newDay: TourDay) => {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourId) return t;
        const currentDays = t.daysList || [];
        return {
          ...t,
          days: currentDays.length + 1,
          daysList: [...currentDays, newDay],
        };
      })
    );
  };

  const deleteItineraryDay = (tourId: string, dayNumber: number) => {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourId) return t;
        const filtered = (t.daysList || [])
          .filter((d) => d.day_number !== dayNumber)
          .map((d, idx) => ({ ...d, day_number: idx + 1 }));
        return {
          ...t,
          days: filtered.length,
          daysList: filtered,
        };
      })
    );
  };

  // Destination Region actions
  const updateDestinationRegion = (id: string, updated: Partial<DestinationRegion>) => {
    setDestinationRegions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const addDestinationRegion = (newRegion: DestinationRegion) => {
    setDestinationRegions((prev) => [...prev, newRegion]);
  };

  const deleteDestinationRegion = (id: string) => {
    setDestinationRegions((prev) => prev.filter((r) => r.id !== id));
  };

  // Site content
  const updateSiteContent = (updated: Partial<SiteContent>) => {
    setSiteContent((prev) => ({ ...prev, ...updated }));
  };

  // Posts actions
  const addPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id: string, updated: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated, updated_at: new Date().toISOString() } : p))
    );
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // 5. Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('All');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<FilterCategory>('all');

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDestinationFilter('All');
    setSelectedActivityFilter('All');
    setFilterMode('all');
  };

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      if (!tour.is_published) return false;

      // 1. Text Search filtering (by name, destination, activity type, summary)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();

        const matchesName =
          tour.title.toLowerCase().includes(q) ||
          (tour.code && tour.code.toLowerCase().includes(q));

        const matchesDestination =
          (tour.place && tour.place.toLowerCase().includes(q)) ||
          (tour.region && tour.region.toLowerCase().includes(q)) ||
          (tour.continent && tour.continent.toLowerCase().includes(q)) ||
          tour.countries.some((c) => c.toLowerCase().includes(q));

        const matchesActivity =
          tour.themes.some((t) => t.toLowerCase().includes(q)) ||
          (tour.activity_level && tour.activity_level.toLowerCase().includes(q)) ||
          (tour.travel_style && tour.travel_style.toLowerCase().includes(q)) ||
          (tour.difficulty && tour.difficulty.toLowerCase().includes(q));

        const matchesSummary =
          (tour.summary && tour.summary.toLowerCase().includes(q)) ||
          (tour.description && tour.description.toLowerCase().includes(q));

        if (filterMode === 'name') {
          if (!matchesName) return false;
        } else if (filterMode === 'destination') {
          if (!matchesDestination) return false;
        } else if (filterMode === 'activity') {
          if (!matchesActivity) return false;
        } else {
          // 'all' mode: matches any of name, destination, activity, or summary
          if (!matchesName && !matchesDestination && !matchesActivity && !matchesSummary) {
            return false;
          }
        }
      }

      // 2. Destination filter
      if (selectedDestinationFilter && selectedDestinationFilter !== 'All') {
        const dest = selectedDestinationFilter.toLowerCase();
        const matchesDest =
          (tour.continent && tour.continent.toLowerCase() === dest) ||
          tour.countries.some((c) => c.toLowerCase() === dest) ||
          (tour.region && tour.region.toLowerCase().includes(dest)) ||
          (tour.place && tour.place.toLowerCase().includes(dest));
        if (!matchesDest) return false;
      }

      // 3. Activity type filter
      if (selectedActivityFilter && selectedActivityFilter !== 'All') {
        const act = selectedActivityFilter.toLowerCase();
        const matchesAct =
          tour.themes.some((t) => t.toLowerCase() === act) ||
          (tour.activity_level && tour.activity_level.toLowerCase() === act) ||
          (tour.travel_style && tour.travel_style.toLowerCase() === act);
        if (!matchesAct) return false;
      }

      return true;
    });
  }, [tours, searchQuery, selectedDestinationFilter, selectedActivityFilter, filterMode]);

  const resetAllToDefaults = () => {
    if (window.confirm('Reset all website tours, destinations, and settings to original defaults?')) {
      localStorage.removeItem('agt_tours_data_v2');
      localStorage.removeItem('agt_destinations_data_v2');
      localStorage.removeItem('agt_posts_data_v2');
      localStorage.removeItem('agt_site_content_v2');
      setTours(TOURS_DATA);
      setDestinationRegions(DESTINATION_REGIONS);
      setPosts(POSTS_DATA);
      setSiteContent(DEFAULT_SITE_CONTENT);
      clearFilters();
    }
  };

  return (
    <ToursContext.Provider
      value={{
        tours,
        destinationRegions,
        posts,
        siteContent,
        getTourBySlug,
        addTour,
        updateTour,
        deleteTour,
        togglePublishTour,
        updateItineraryDay,
        addItineraryDay,
        deleteItineraryDay,
        updateDestinationRegion,
        addDestinationRegion,
        deleteDestinationRegion,
        updateSiteContent,
        addPost,
        updatePost,
        deletePost,
        resetAllToDefaults,
        searchQuery,
        setSearchQuery,
        selectedDestinationFilter,
        setSelectedDestinationFilter,
        selectedActivityFilter,
        setSelectedActivityFilter,
        filterMode,
        setFilterMode,
        clearFilters,
        filteredTours,
      }}
    >
      {children}
    </ToursContext.Provider>
  );
};

export const useTours = () => {
  const context = useContext(ToursContext);
  if (!context) {
    throw new Error('useTours must be used within a ToursProvider');
  }
  return context;
};
