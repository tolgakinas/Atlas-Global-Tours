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
  responsibleTravelUrl?: string;
  tripadvisorUrl?: string;
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
  maxPaxStat: 'Max 10 Travellers per group',
  officeIstanbul: 'Sultanahmet Mah., Divanyolu Cad. No: 42, Fatih, Istanbul, Türkiye',
  officeUS: '1201 3rd Ave, Suite 2200, Seattle, WA 98101, United States',
  contactEmail: 'info@atlasglobaltours.com',
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
  responsibleTravelUrl: 'https://www.responsibletravel.com/',
  tripadvisorUrl: 'https://www.tripadvisor.com/',
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
  bookDepartureSeats: (
    tourIdOrSlug: string,
    departureIdOrStartDate: string,
    passengers: number
  ) => { remainingSeats: number; capacity: number; departureId: string } | null;
  releaseDepartureSeats: (
    tourIdOrSlug: string,
    departureIdOrStartDate: string,
    passengers: number
  ) => void;
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

const TOURS_OVERRIDES_KEY = 'agt_tours_overrides_v9';
const POSTS_OVERRIDES_KEY = 'agt_posts_overrides_v3';
const SEAT_BOOKINGS_KEY = 'agt_seat_bookings_v1';
const LEGACY_STORAGE_KEYS = [
  'agt_tours_data_v1',
  'agt_tours_data_v2',
  'agt_tours_data_v3',
  'agt_tours_data_v4',
  'agt_tours_data_v5',
  'agt_tours_data_v6',
  'agt_tours_data_v7',
  'agt_tours_data_v8',
  'agt_posts_data_v1',
  'agt_posts_data_v2',
];

interface EntityOverrides<T> {
  updated: Record<string, T>;
  deletedIds: string[];
}

function purgeLegacyStorageKeys() {
  try {
    LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage access errors in restricted frames
  }
}

export const ToursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultToursById = useMemo(() => new Map(TOURS_DATA.map((t) => [t.id, t])), []);
  const defaultPostsById = useMemo(() => new Map(POSTS_DATA.map((p) => [p.id, p])), []);

  // 1. Tours State (hydrated from static TOURS_DATA + tiny delta overrides + seat bookings)
  const [tours, setTours] = useState<Tour[]>(() => {
    purgeLegacyStorageKeys();
    try {
      const seatOverridesRaw = localStorage.getItem(SEAT_BOOKINGS_KEY);
      const seatOverrides: Record<string, Record<string, number>> = seatOverridesRaw
        ? JSON.parse(seatOverridesRaw)
        : {};

      const overridesRaw = localStorage.getItem(TOURS_OVERRIDES_KEY);
      const overrides: EntityOverrides<Tour> = overridesRaw
        ? JSON.parse(overridesRaw)
        : { updated: {}, deletedIds: [] };
      const deletedSet = new Set(overrides.deletedIds || []);

      const baseMap = new Map(TOURS_DATA.map((t) => [t.id, t]));
      const merged: Tour[] = [];

      // Include custom newly added tours first
      Object.values(overrides.updated || {}).forEach((customTour) => {
        if (!baseMap.has(customTour.id) && !deletedSet.has(customTour.id)) {
          merged.push(customTour);
        }
      });

      // Merge default tours with any saved overrides
      TOURS_DATA.forEach((defaultTour) => {
        if (deletedSet.has(defaultTour.id)) return;
        const override = overrides.updated?.[defaultTour.id];
        if (!override) {
          merged.push(defaultTour);
        } else {
          const departuresList =
            override.departuresList && override.departuresList.length > 0
              ? override.departuresList
              : defaultTour.departuresList;
          merged.push({ ...defaultTour, ...override, departuresList });
        }
      });

      // Apply live seat overrides
      return merged.map((t) => {
        const tourSeats = seatOverrides[t.id];
        if (!tourSeats || !t.departuresList || t.departuresList.length === 0) return t;
        return {
          ...t,
          departuresList: t.departuresList.map((dep) => {
            const booked = tourSeats[dep.id];
            if (typeof booked !== 'number') return dep;
            const clamped = Math.min(dep.capacity, Math.max(0, booked));
            const remaining = Math.max(0, dep.capacity - clamped);
            return {
              ...dep,
              seats_booked: clamped,
              status: remaining <= 0 ? 'sold_out' : remaining <= 3 ? 'filling_fast' : 'guaranteed',
            };
          }),
        };
      });
    } catch {
      return TOURS_DATA;
    }
  });

  // 2. Destination Regions State
  const [destinationRegions, setDestinationRegions] = useState<DestinationRegion[]>(() => {
    try {
      const saved = localStorage.getItem('agt_destinations_data_v4');
      if (saved) return JSON.parse(saved);
      return DESTINATION_REGIONS;
    } catch {
      return DESTINATION_REGIONS;
    }
  });

  // 3. Blog Posts State (hydrated from static POSTS_DATA + tiny delta overrides)
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const overridesRaw = localStorage.getItem(POSTS_OVERRIDES_KEY);
      if (!overridesRaw) return POSTS_DATA;
      const overrides: EntityOverrides<Post> = JSON.parse(overridesRaw);
      const deletedSet = new Set(overrides.deletedIds || []);
      const baseMap = new Map(POSTS_DATA.map((p) => [p.id, p]));
      const merged: Post[] = [];

      Object.values(overrides.updated || {}).forEach((customPost) => {
        if (!baseMap.has(customPost.id) && !deletedSet.has(customPost.id)) {
          merged.push(customPost);
        }
      });

      POSTS_DATA.forEach((defaultPost) => {
        if (deletedSet.has(defaultPost.id)) return;
        const override = overrides.updated?.[defaultPost.id];
        merged.push(override ? { ...defaultPost, ...override } : defaultPost);
      });

      return merged;
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

  // Sync only compact seat counts & modified tour deltas to localStorage (keeps footprint <10KB)
  useEffect(() => {
    try {
      const seatOverrides: Record<string, Record<string, number>> = {};
      const updatedTours: Record<string, Tour> = {};
      const currentIds = new Set<string>();

      tours.forEach((t) => {
        currentIds.add(t.id);
        const defaultTour = defaultToursById.get(t.id);
        const defaultDepSeats = new Map(
          (defaultTour?.departuresList || []).map((d) => [d.id, d.seats_booked])
        );

        const bookedMap: Record<string, number> = {};
        (t.departuresList || []).forEach((dep) => {
          const defaultSeats = defaultDepSeats.get(dep.id) ?? 0;
          if (dep.seats_booked !== defaultSeats) {
            bookedMap[dep.id] = dep.seats_booked;
          }
        });
        if (Object.keys(bookedMap).length > 0) {
          seatOverrides[t.id] = bookedMap;
        }

        if (!defaultTour) {
          // Newly created custom tour
          updatedTours[t.id] = t;
        } else {
          // Only persist if fields outside departuresList changed
          const { departuresList: _curDeps, ...curRest } = t;
          const { departuresList: _defDeps, ...defRest } = defaultTour;
          if (JSON.stringify(curRest) !== JSON.stringify(defRest)) {
            updatedTours[t.id] = { ...t, departuresList: [] };
          }
        }
      });

      const deletedIds = TOURS_DATA.filter((t) => !currentIds.has(t.id)).map((t) => t.id);

      if (Object.keys(seatOverrides).length > 0) {
        localStorage.setItem(SEAT_BOOKINGS_KEY, JSON.stringify(seatOverrides));
      } else {
        localStorage.removeItem(SEAT_BOOKINGS_KEY);
      }

      if (Object.keys(updatedTours).length > 0 || deletedIds.length > 0) {
        localStorage.setItem(
          TOURS_OVERRIDES_KEY,
          JSON.stringify({ updated: updatedTours, deletedIds })
        );
      } else {
        localStorage.removeItem(TOURS_OVERRIDES_KEY);
      }
    } catch (e) {
      console.warn('Could not persist tour overrides to localStorage:', e);
    }
  }, [tours, defaultToursById]);

  useEffect(() => {
    try {
      if (JSON.stringify(destinationRegions) !== JSON.stringify(DESTINATION_REGIONS)) {
        localStorage.setItem('agt_destinations_data_v4', JSON.stringify(destinationRegions));
      } else {
        localStorage.removeItem('agt_destinations_data_v4');
      }
    } catch (e) {
      console.warn('Could not persist destination regions to localStorage:', e);
    }
  }, [destinationRegions]);

  // Sync only modified/created/deleted blog posts (keeps footprint minimal)
  useEffect(() => {
    try {
      const updatedPosts: Record<string, Post> = {};
      const currentIds = new Set<string>();

      posts.forEach((p) => {
        currentIds.add(p.id);
        const defaultPost = defaultPostsById.get(p.id);
        if (!defaultPost || JSON.stringify(p) !== JSON.stringify(defaultPost)) {
          updatedPosts[p.id] = p;
        }
      });

      const deletedIds = POSTS_DATA.filter((p) => !currentIds.has(p.id)).map((p) => p.id);

      if (Object.keys(updatedPosts).length > 0 || deletedIds.length > 0) {
        localStorage.setItem(
          POSTS_OVERRIDES_KEY,
          JSON.stringify({ updated: updatedPosts, deletedIds })
        );
      } else {
        localStorage.removeItem(POSTS_OVERRIDES_KEY);
      }
    } catch (e) {
      console.warn('Could not persist post overrides to localStorage:', e);
    }
  }, [posts, defaultPostsById]);

  useEffect(() => {
    try {
      if (JSON.stringify(siteContent) !== JSON.stringify(DEFAULT_SITE_CONTENT)) {
        localStorage.setItem('agt_site_content_v2', JSON.stringify(siteContent));
      } else {
        localStorage.removeItem('agt_site_content_v2');
      }
    } catch (e) {
      console.warn('Could not persist site content to localStorage:', e);
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

  // Decrement available seats on a specific tour departure when a booking is completed
  const bookDepartureSeats = (
    tourIdOrSlug: string,
    departureIdOrStartDate: string,
    passengers: number
  ): { remainingSeats: number; capacity: number; departureId: string } | null => {
    const pax = Math.max(1, Math.floor(passengers));
    let result: { remainingSeats: number; capacity: number; departureId: string } | null = null;

    const currentTour = tours.find((t) => t.id === tourIdOrSlug || t.slug === tourIdOrSlug);
    const currentDep = currentTour?.departuresList?.find(
      (d) => d.id === departureIdOrStartDate || d.start_date === departureIdOrStartDate
    );
    if (currentDep) {
      const nextBooked = Math.min(currentDep.capacity, currentDep.seats_booked + pax);
      result = {
        remainingSeats: Math.max(0, currentDep.capacity - nextBooked),
        capacity: currentDep.capacity,
        departureId: currentDep.id,
      };
    }

    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourIdOrSlug && t.slug !== tourIdOrSlug) return t;
        if (!t.departuresList || t.departuresList.length === 0) return t;

        const updatedDepartures = t.departuresList.map((dep) => {
          if (dep.id !== departureIdOrStartDate && dep.start_date !== departureIdOrStartDate) {
            return dep;
          }
          const nextBooked = Math.min(dep.capacity, dep.seats_booked + pax);
          const remaining = Math.max(0, dep.capacity - nextBooked);
          const nextStatus =
            remaining <= 0 ? 'sold_out' : remaining <= 3 ? 'filling_fast' : dep.status;

          return {
            ...dep,
            seats_booked: nextBooked,
            status: nextStatus,
          };
        });

        return {
          ...t,
          departuresList: updatedDepartures,
          updated_at: new Date().toISOString(),
        };
      })
    );

    return result;
  };

  // Restore seats if a booking is cancelled
  const releaseDepartureSeats = (
    tourIdOrSlug: string,
    departureIdOrStartDate: string,
    passengers: number
  ) => {
    const pax = Math.max(1, Math.floor(passengers));
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tourIdOrSlug && t.slug !== tourIdOrSlug) return t;
        if (!t.departuresList || t.departuresList.length === 0) return t;

        const updatedDepartures = t.departuresList.map((dep) => {
          if (dep.id !== departureIdOrStartDate && dep.start_date !== departureIdOrStartDate) {
            return dep;
          }
          const nextBooked = Math.max(0, dep.seats_booked - pax);
          const remaining = Math.max(0, dep.capacity - nextBooked);
          const nextStatus =
            remaining <= 0 ? 'sold_out' : remaining <= 3 ? 'filling_fast' : 'guaranteed';

          return {
            ...dep,
            seats_booked: nextBooked,
            status: nextStatus,
          };
        });

        return {
          ...t,
          departuresList: updatedDepartures,
          updated_at: new Date().toISOString(),
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
      purgeLegacyStorageKeys();
      localStorage.removeItem(TOURS_OVERRIDES_KEY);
      localStorage.removeItem(POSTS_OVERRIDES_KEY);
      localStorage.removeItem(SEAT_BOOKINGS_KEY);
      localStorage.removeItem('agt_destinations_data_v4');
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
        bookDepartureSeats,
        releaseDepartureSeats,
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
