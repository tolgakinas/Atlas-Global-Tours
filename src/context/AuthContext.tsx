import React, { createContext, useContext, useState, useEffect } from 'react';
import { TOURS_DATA } from '../data/toursData';

export type UserRole = 'traveller' | 'operations' | 'admin' | 'advisor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface ClientPassengerInfo {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  dob: string;
  passportNumber: string;
  passportExpiry: string;
  passportCountry: string;
  phone?: string;
  email?: string;
  dietaryRequirements: string;
  medicalConditions: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  roomPreference?: 'Single' | 'Double' | 'Twin';
}

export interface AdvisorBookingDetails {
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  agencyName: string;
  iataCliaNumber?: string;
  commissionRatePercent: number; // 0 to 20%
  grossAmountCents: number;
  commissionAmountCents: number;
  netOperatorAmountCents: number;
  paymentMethod: 'credit_card' | 'debit_card';
  cardLast4?: string;
  cardholderName?: string;
  financeNotified: boolean;
  financeNotifiedAt?: string;
  financeNotificationNotes?: string;
  clients: ClientPassengerInfo[];
}

export interface Booking {
  id: string;
  reference: string;
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  tourImage: string;
  departureDate: string;
  guests: number;
  totalPriceCents: number;
  currency: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  specialRequests?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryNotes?: string;
  paymentStatus: 'paid' | 'deposit_paid' | 'pending' | 'refunded';
  status: 'confirmed' | 'pending' | 'cancelled';
  assignedGuide?: string;
  internalNotes?: string;
  createdAt: string;
  isAdvisorBooking?: boolean;
  advisorDetails?: AdvisorBookingDetails;
}

export interface Departure {
  id: string;
  tourId: string;
  tourTitle: string;
  tourSlug: string;
  startDate: string;
  endDate: string;
  capacity: number;
  bookedSeats: number;
  priceCents: number;
  depositCents: number;
  status: 'guaranteed' | 'confirmed' | 'filling_fast' | 'sold_out' | 'cancelled';
  assignedGuide: string | null;
  driverVehicle: string | null;
  notes?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  travelDate?: string;
  guests?: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'archived';
  assignedStaff?: string;
  internalNotes?: string;
  createdAt: string;
}

export interface Guide {
  id: string;
  name: string;
  licenseNo: string;
  languages: string[];
  speciality: string;
  phone: string;
  email: string;
  status: 'available' | 'on_tour' | 'standby';
}

export interface RegisteredAdvisor {
  id: string;
  name: string;
  email: string;
  agencyName: string;
  iataClia?: string;
  phone?: string;
  country?: string;
  defaultCommissionRate: number; // 0 to 20, defaults to 20
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, role?: UserRole) => void;
  logout: () => void;
  lookupBooking: (reference: string, email: string) => Booking | null;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'reference' | 'status' | 'createdAt' | 'paymentStatus'>) => Booking;
  updateBooking: (reference: string, updated: Partial<Booking>) => void;
  cancelBooking: (reference: string) => void;
  departures: Departure[];
  addDeparture: (dep: Departure) => void;
  updateDeparture: (id: string, updated: Partial<Departure>) => void;
  deleteDeparture: (id: string) => void;
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  addMessage: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiry: (id: string, updated: Partial<Inquiry>) => void;
  deleteInquiry: (id: string) => void;
  guides: Guide[];
  addGuide: (guide: Guide) => void;
  updateGuide: (id: string, updated: Partial<Guide>) => void;

  // Travel Advisor Portal Capabilities
  currentAdvisor: RegisteredAdvisor | null;
  registeredAdvisors: RegisteredAdvisor[];
  advisorLogin: (email: string) => RegisteredAdvisor | null;
  advisorRegister: (data: Omit<RegisteredAdvisor, 'id' | 'joinedDate'>) => RegisteredAdvisor;
  advisorLogout: () => void;
  createAdvisorBooking: (params: {
    tourId: string;
    tourSlug: string;
    tourTitle: string;
    tourImage: string;
    departureDate: string;
    guests: number;
    totalPriceCents: number;
    currency: string;
    commissionRatePercent: number;
    clients: ClientPassengerInfo[];
    paymentMethod: 'credit_card' | 'debit_card';
    cardLast4: string;
    cardholderName: string;
    specialRequests?: string;
  }) => Booking;
  notifyFinanceForBooking: (reference: string, notes?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Registered Advisors
export const INITIAL_ADVISORS: RegisteredAdvisor[] = [
  {
    id: 'adv-1',
    name: 'Sarah Jenkins',
    email: 'advisor@atlasglobaltours.com',
    agencyName: 'Virtuoso Travel Specialists NYC',
    iataClia: 'IATA-0928419',
    phone: '+1 (212) 849-2041',
    country: 'United States',
    defaultCommissionRate: 20,
    joinedDate: '2025-01-15',
  },
  {
    id: 'adv-2',
    name: 'Tolga Kınas',
    email: 'tolgakinas@gmail.com',
    agencyName: 'Atlas Premier Bespoke Journeys',
    iataClia: 'ARC-7849102',
    phone: '+1 (206) 555-0199',
    country: 'United States',
    defaultCommissionRate: 20,
    joinedDate: '2025-03-01',
  },
  {
    id: 'adv-3',
    name: 'Marcus Beaumont',
    email: 'marcus@signaturetravel.co.uk',
    agencyName: 'Signature Luxury Escapes London',
    iataClia: 'ABTA-P92041',
    phone: '+44 20 7946 0912',
    country: 'United Kingdom',
    defaultCommissionRate: 15,
    joinedDate: '2025-02-10',
  },
];

// Initial Guides Roster
const INITIAL_GUIDES: Guide[] = [
  {
    id: 'g-1',
    name: 'Serkan Yılmaz',
    licenseNo: 'TR-MIN-28491',
    languages: ['English', 'Turkish', 'Italian'],
    speciality: 'Göbeklitepe & Southeastern Mesopotamia, Byzantine Old Town',
    phone: '+90 (533) 482 19 02',
    email: 'serkan@atlasglobaltours.com',
    status: 'on_tour',
  },
  {
    id: 'g-2',
    name: 'Elif Demir',
    licenseNo: 'TR-MIN-31940',
    languages: ['English', 'German', 'Turkish'],
    speciality: 'Cappadocia Valleys, Anatolian Hittite Heritage, Geology',
    phone: '+90 (532) 901 84 55',
    email: 'elif@atlasglobaltours.com',
    status: 'available',
  },
  {
    id: 'g-3',
    name: 'Mehmet Ali Kara',
    licenseNo: 'TR-MIN-19842',
    languages: ['English', 'French', 'Turkish'],
    speciality: 'Lycian Way Hiking, Kaş Sea Kayaking, Ephesus Archaeology',
    phone: '+90 (544) 620 33 11',
    email: 'mehmet@atlasglobaltours.com',
    status: 'available',
  },
  {
    id: 'g-4',
    name: 'Canan Özdemir',
    licenseNo: 'TR-MIN-44102',
    languages: ['English', 'Spanish', 'Turkish'],
    speciality: 'Istanbul Secret Passages, Galata & Ottoman Palace Architecture',
    phone: '+90 (530) 712 55 40',
    email: 'canan@atlasglobaltours.com',
    status: 'standby',
  },
];

// Initial Departures synthesized from authentic tour dates
const INITIAL_DEPARTURES: Departure[] = [
  {
    id: 'dep-1',
    tourId: 'cac84395-f80e-4bd0-a2e8-108f3748f752',
    tourTitle: 'immersive South Eastern Turkiye : Culinary & Cultural tour',
    tourSlug: 'shortbreak-eastern-turkiye',
    startDate: '2026-10-15',
    endDate: '2026-10-21',
    capacity: 12,
    bookedSeats: 8,
    priceCents: 210000,
    depositCents: 42000,
    status: 'guaranteed',
    assignedGuide: 'Serkan Yılmaz',
    driverVehicle: 'Mercedes Sprinter VIP (34 AGT 082)',
    notes: 'Baklava tasting in Gaziantep confirmed. Private Urfa sıra gecesi booked.',
  },
  {
    id: 'dep-2',
    tourId: '10cf2e26-f782-411a-85d7-fca835069b82',
    tourTitle: 'Cappadocia 7-Day Hiking Adventure',
    tourSlug: 'cappadocia-hiking-adventure',
    startDate: '2026-10-24',
    endDate: '2026-10-30',
    capacity: 12,
    bookedSeats: 11,
    priceCents: 185000,
    depositCents: 37000,
    status: 'filling_fast',
    assignedGuide: 'Elif Demir',
    driverVehicle: 'VW Crafter Trekking (50 CPO 412)',
    notes: 'Dawn balloon flight slot reserved for Day 3. Cave hotel rooms locked.',
  },
  {
    id: 'dep-3',
    tourId: 'turkiye-by-rail',
    tourTitle: 'Discover Turkiye By Rail',
    tourSlug: 'turkiye-by-rail',
    startDate: '2026-11-04',
    endDate: '2026-11-13',
    capacity: 12,
    bookedSeats: 12,
    priceCents: 260000,
    depositCents: 52000,
    status: 'sold_out',
    assignedGuide: 'Serkan Yılmaz',
    driverVehicle: 'Rail Sleeper Car + Local Sprinter',
    notes: 'Sleeper cabins 1 to 6 booked on Eastern Express to Kars.',
  },
  {
    id: 'dep-4',
    tourId: 'ae9b341d-cb39-4458-941c-b26a64016a2d',
    tourTitle: 'Kaş : Hike, Bike, Kayak & Dive',
    tourSlug: 'hike-bike-kayak-in-kas-turkey',
    startDate: '2026-11-12',
    endDate: '2026-11-18',
    capacity: 10,
    bookedSeats: 6,
    priceCents: 165000,
    depositCents: 33000,
    status: 'confirmed',
    assignedGuide: 'Mehmet Ali Kara',
    driverVehicle: 'Private Gulet Boat "Lycian Blue"',
    notes: 'Sea kayaks serviced. Kekova sunken city marine permit received.',
  },
  {
    id: 'dep-5',
    tourId: 'immersive-jordan',
    tourTitle: 'IMMERSIVE JORDAN : Petra to Wadi Rum',
    tourSlug: 'immersive-jordan',
    startDate: '2026-11-20',
    endDate: '2026-11-25',
    capacity: 12,
    bookedSeats: 7,
    priceCents: 245000,
    depositCents: 49000,
    status: 'guaranteed',
    assignedGuide: 'Tariq Al-Hashemi',
    driverVehicle: 'Toyota Coaster Luxury',
    notes: 'Wadi Rum luxury bubble tent camp confirmed.',
  },
  {
    id: 'dep-6',
    tourId: 'immersive-egypt',
    tourTitle: 'Immersive Egypt Tour: A Luxury Journey Through Ancient Wonders',
    tourSlug: 'immersive-egypt',
    startDate: '2026-12-05',
    endDate: '2026-12-13',
    capacity: 12,
    bookedSeats: 5,
    priceCents: 290000,
    depositCents: 58000,
    status: 'confirmed',
    assignedGuide: 'Dr. Zahi Mostafa',
    driverVehicle: 'Private Dahabiya Nile Yacht',
    notes: 'Private Egyptologist guide permit confirmed for Valley of the Kings.',
  },
];

// Initial Bookings (including seed travel consultant booking)
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-seed-adv-1',
    reference: 'AGT-ADV-7740',
    tourId: 'cac84395-f80e-4bd0-a2e8-108f3748f752',
    tourSlug: 'shortbreak-eastern-turkiye',
    tourTitle: 'immersive South Eastern Turkiye : Culinary & Cultural tour',
    tourImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    departureDate: '2026-10-15',
    guests: 2,
    totalPriceCents: 420000,
    currency: 'USD',
    leadName: 'Lord Alistair & Beatrice Harrington',
    leadEmail: 'harrington.estate@london-trust.co.uk',
    leadPhone: '+44 20 7946 0883',
    specialRequests: 'Ground floor suites preferred. Private airport chauffeur requested.',
    emergencyContactName: 'Evelyn Harrington',
    emergencyContactPhone: '+44 7700 900321',
    dietaryNotes: '1x Pescatarian, 1x Strict Shellfish allergy',
    paymentStatus: 'paid',
    status: 'confirmed',
    assignedGuide: 'Serkan Yılmaz',
    internalNotes: 'B2B Advisor booking via Virtuoso NYC. 15% advisor commission agreed.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isAdvisorBooking: true,
    advisorDetails: {
      advisorId: 'adv-1',
      advisorName: 'Sarah Jenkins',
      advisorEmail: 'advisor@atlasglobaltours.com',
      agencyName: 'Virtuoso Travel Specialists NYC',
      iataCliaNumber: 'IATA-0928419',
      commissionRatePercent: 15,
      grossAmountCents: 420000,
      commissionAmountCents: 63000,
      netOperatorAmountCents: 357000,
      paymentMethod: 'credit_card',
      cardLast4: '4242',
      cardholderName: 'Sarah Jenkins (Virtuoso Agency Card)',
      financeNotified: false,
      clients: [
        {
          id: 'pax-seed-1',
          firstName: 'Alistair',
          middleName: 'James',
          lastName: 'Harrington',
          gender: 'Male',
          dob: '1968-04-12',
          passportNumber: 'GB94820194',
          passportExpiry: '2030-08-20',
          passportCountry: 'United Kingdom',
          phone: '+44 20 7946 0883',
          email: 'harrington.estate@london-trust.co.uk',
          dietaryRequirements: 'Pescatarian',
          medicalConditions: 'Mild asthma (carries rescue inhaler)',
          emergencyContactName: 'Evelyn Harrington',
          emergencyContactPhone: '+44 7700 900321',
          roomPreference: 'Double',
        },
        {
          id: 'pax-seed-2',
          firstName: 'Beatrice',
          middleName: 'Claire',
          lastName: 'Harrington',
          gender: 'Female',
          dob: '1972-09-25',
          passportNumber: 'GB94820195',
          passportExpiry: '2031-01-14',
          passportCountry: 'United Kingdom',
          phone: '+44 20 7946 0884',
          email: 'beatrice.h@london-trust.co.uk',
          dietaryRequirements: 'Strict Shellfish allergy',
          medicalConditions: 'None',
          emergencyContactName: 'Evelyn Harrington',
          emergencyContactPhone: '+44 7700 900321',
          roomPreference: 'Double',
        },
      ],
    },
  },
  {
    id: 'b-seed-1',
    reference: 'AGT-2026-8492',
    tourId: 'cac84395-f80e-4bd0-a2e8-108f3748f752',
    tourSlug: 'shortbreak-eastern-turkiye',
    tourTitle: 'immersive South Eastern Turkiye : Culinary & Cultural tour',
    tourImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    departureDate: '2026-10-15',
    guests: 2,
    totalPriceCents: 420000,
    currency: 'EUR',
    leadName: 'Jane Cooper',
    leadEmail: 'jane.cooper@example.com',
    leadPhone: '+1 (555) 234-5678',
    specialRequests: 'Vegetarian meals for one guest. Airport pickup requested.',
    emergencyContactName: 'Robert Cooper',
    emergencyContactPhone: '+1 (555) 987-6543',
    dietaryNotes: '1x Strict Vegetarian (no meat/fish), 1x No restrictions',
    paymentStatus: 'paid',
    status: 'confirmed',
    assignedGuide: 'Serkan Yılmaz',
    internalNotes: 'VIP return clients from 2024 Aegean tour.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'b-seed-2',
    reference: 'AGT-2026-3914',
    tourId: '10cf2e26-f782-411a-85d7-fca835069b82',
    tourSlug: 'cappadocia-hiking-adventure',
    tourTitle: 'Cappadocia 7-Day Hiking Adventure',
    tourImage: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=800&q=80',
    departureDate: '2026-10-24',
    guests: 2,
    totalPriceCents: 370000,
    currency: 'USD',
    leadName: 'David & Laura Miller',
    leadEmail: 'david.miller@example.com',
    leadPhone: '+1 (415) 890-1234',
    specialRequests: 'Upper cave suite preference with valley view.',
    emergencyContactName: 'Sarah Miller',
    emergencyContactPhone: '+1 (415) 321-4321',
    dietaryNotes: 'No seafood allergies',
    paymentStatus: 'deposit_paid',
    status: 'confirmed',
    assignedGuide: 'Elif Demir',
    internalNotes: 'Balance due 14 days before departure.',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

// Initial Inquiries
const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    name: 'Emily Watson',
    email: 'emily.w@company.com',
    phone: '+44 7911 123456',
    destination: 'Eastern Türkiye & Mesopotamia',
    travelDate: 'May 2027',
    guests: '6 adults (Private Family Group)',
    message: 'We are interested in a private 8-day tour covering Göbeklitepe, Mount Nemrut, and Mardin with a focus on photography and local cooking workshops.',
    status: 'new',
    assignedStaff: 'Atlas Dispatch',
    internalNotes: 'High priority private group request. Serkan would be great guide.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq-2',
    name: 'Thomas Laurent',
    email: 't.laurent@paris.fr',
    phone: '+33 6 12 34 56 78',
    destination: 'Rail & Train Journeys',
    travelDate: 'October 2026',
    guests: '2 adults',
    message: 'Can we add 2 extra days in Istanbul before boarding the Eastern Express train to Kars? Looking for boutique hotel recommendations in Sultanahmet.',
    status: 'quoted',
    assignedStaff: 'Tours Team',
    internalNotes: 'Sent custom quote with 2-night pre-tour stay at Hotel Ibrahim Pasha.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('agt_user_session_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Registered Advisors List
  const [registeredAdvisors, setRegisteredAdvisors] = useState<RegisteredAdvisor[]>(() => {
    try {
      const saved = localStorage.getItem('agt_registered_advisors_v1');
      return saved ? JSON.parse(saved) : INITIAL_ADVISORS;
    } catch {
      return INITIAL_ADVISORS;
    }
  });

  // Current Logged-in Advisor Session
  const [currentAdvisor, setCurrentAdvisor] = useState<RegisteredAdvisor | null>(() => {
    try {
      const saved = localStorage.getItem('agt_advisor_session_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('agt_bookings_v2');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  // Departures
  const [departures, setDepartures] = useState<Departure[]>(() => {
    try {
      const saved = localStorage.getItem('agt_departures_v2');
      return saved ? JSON.parse(saved) : INITIAL_DEPARTURES;
    } catch {
      return INITIAL_DEPARTURES;
    }
  });

  // Inquiries
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem('agt_inquiries_v2');
      return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  // Guides Roster
  const [guides, setGuides] = useState<Guide[]>(() => {
    try {
      const saved = localStorage.getItem('agt_guides_v2');
      return saved ? JSON.parse(saved) : INITIAL_GUIDES;
    } catch {
      return INITIAL_GUIDES;
    }
  });

  // LocalStorage Sync
  useEffect(() => {
    if (user) {
      localStorage.setItem('agt_user_session_v2', JSON.stringify(user));
    } else {
      localStorage.removeItem('agt_user_session_v2');
    }
  }, [user]);

  useEffect(() => {
    if (currentAdvisor) {
      localStorage.setItem('agt_advisor_session_v1', JSON.stringify(currentAdvisor));
    } else {
      localStorage.removeItem('agt_advisor_session_v1');
    }
  }, [currentAdvisor]);

  useEffect(() => {
    localStorage.setItem('agt_registered_advisors_v1', JSON.stringify(registeredAdvisors));
  }, [registeredAdvisors]);

  useEffect(() => {
    localStorage.setItem('agt_bookings_v2', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('agt_departures_v2', JSON.stringify(departures));
  }, [departures]);

  useEffect(() => {
    localStorage.setItem('agt_inquiries_v2', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('agt_guides_v2', JSON.stringify(guides));
  }, [guides]);

  // Auth Actions
  const login = (email: string, name?: string, role: UserRole = 'traveller') => {
    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email,
      name: name || email.split('@')[0],
      role,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  // Travel Advisor Portal Actions
  const advisorLogin = (email: string): RegisteredAdvisor | null => {
    const cleanEmail = email.trim().toLowerCase();
    const found = registeredAdvisors.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );
    if (found) {
      setCurrentAdvisor(found);
      return found;
    }
    return null;
  };

  const advisorRegister = (data: Omit<RegisteredAdvisor, 'id' | 'joinedDate'>): RegisteredAdvisor => {
    const newAdvisor: RegisteredAdvisor = {
      id: 'adv-' + Math.random().toString(36).substring(2, 9),
      joinedDate: new Date().toISOString(),
      ...data,
      defaultCommissionRate: data.defaultCommissionRate ?? 20,
    };
    setRegisteredAdvisors((prev) => [newAdvisor, ...prev]);
    setCurrentAdvisor(newAdvisor);
    return newAdvisor;
  };

  const advisorLogout = () => {
    setCurrentAdvisor(null);
  };

  // Create Consultant Booking with client passenger manifest and adjusted commission
  const createAdvisorBooking = (params: {
    tourId: string;
    tourSlug: string;
    tourTitle: string;
    tourImage: string;
    departureDate: string;
    guests: number;
    totalPriceCents: number;
    currency: string;
    commissionRatePercent: number;
    clients: ClientPassengerInfo[];
    paymentMethod: 'credit_card' | 'debit_card';
    cardLast4: string;
    cardholderName: string;
    specialRequests?: string;
  }): Booking => {
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `AGT-ADV-${randSuffix}`;

    const advisor = currentAdvisor || {
      id: 'adv-guest',
      name: params.cardholderName || 'Partner Advisor',
      email: 'advisor@partner.com',
      agencyName: 'Independent Travel Consultancy',
      iataClia: 'IATA-VERIFIED',
      defaultCommissionRate: 20,
      joinedDate: new Date().toISOString(),
    };

    const commRate = Math.min(20, Math.max(0, params.commissionRatePercent));
    const grossCents = params.totalPriceCents;
    const commissionCents = Math.round(grossCents * (commRate / 100));
    const netOperatorCents = grossCents - commissionCents;

    const leadClient = params.clients[0] || {
      firstName: 'Lead',
      lastName: 'Passenger',
      email: advisor.email,
      phone: advisor.phone || '+1 555-0100',
    };

    const allDietary = params.clients
      .map((c, i) => (c.dietaryRequirements && c.dietaryRequirements !== 'None' ? `Pax ${i + 1} (${c.firstName}): ${c.dietaryRequirements}` : null))
      .filter(Boolean)
      .join('; ');

    const newBooking: Booking = {
      id: 'b-adv-' + Math.random().toString(36).substring(2, 9),
      reference,
      tourId: params.tourId,
      tourSlug: params.tourSlug,
      tourTitle: params.tourTitle,
      tourImage: params.tourImage,
      departureDate: params.departureDate,
      guests: params.guests,
      totalPriceCents: grossCents,
      currency: params.currency,
      leadName: `${leadClient.firstName} ${leadClient.lastName}`.trim(),
      leadEmail: leadClient.email || advisor.email,
      leadPhone: leadClient.phone || advisor.phone || '',
      specialRequests: params.specialRequests || '',
      dietaryNotes: allDietary || 'No dietary restrictions submitted',
      paymentStatus: 'paid',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      isAdvisorBooking: true,
      internalNotes: `Booked by Advisor: ${advisor.name} (${advisor.agencyName}). Commission: ${commRate}%. Retained: ${commissionCents / 100} ${params.currency}. Net remitted: ${netOperatorCents / 100} ${params.currency}.`,
      advisorDetails: {
        advisorId: advisor.id,
        advisorName: advisor.name,
        advisorEmail: advisor.email,
        agencyName: advisor.agencyName,
        iataCliaNumber: advisor.iataClia || '',
        commissionRatePercent: commRate,
        grossAmountCents: grossCents,
        commissionAmountCents: commissionCents,
        netOperatorAmountCents: netOperatorCents,
        paymentMethod: params.paymentMethod,
        cardLast4: params.cardLast4,
        cardholderName: params.cardholderName,
        financeNotified: false,
        clients: params.clients,
      },
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Update departure seats
    setDepartures((prev) =>
      prev.map((d) => {
        if (d.tourId === params.tourId && d.startDate === params.departureDate) {
          const booked = d.bookedSeats + params.guests;
          return {
            ...d,
            bookedSeats: booked,
            status: booked >= d.capacity ? 'sold_out' : booked >= d.capacity - 2 ? 'filling_fast' : d.status,
          };
        }
        return d;
      })
    );

    return newBooking;
  };

  // Notify Finance Department for Advisor Booking
  const notifyFinanceForBooking = (reference: string, notes?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.reference === reference && b.advisorDetails) {
          return {
            ...b,
            advisorDetails: {
              ...b.advisorDetails,
              financeNotified: true,
              financeNotifiedAt: new Date().toISOString(),
              financeNotificationNotes: notes || 'Automated reconciliation notice transmitted to finance@atlasglobaltours.com',
            },
            internalNotes: (b.internalNotes || '') + ` | Finance Department notified on ${new Date().toLocaleDateString()}.`,
          };
        }
        return b;
      })
    );
  };

  const lookupBooking = (reference: string, email: string): Booking | null => {
    const cleanRef = reference.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const found = bookings.find(
      (b) =>
        b.reference.toUpperCase() === cleanRef &&
        (b.leadEmail.toLowerCase() === cleanEmail ||
          b.advisorDetails?.advisorEmail.toLowerCase() === cleanEmail)
    );
    return found || null;
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'reference' | 'status' | 'createdAt' | 'paymentStatus'>): Booking => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const reference = `AGT-${year}-${rand}`;

    const newBooking: Booking = {
      ...bookingData,
      id: 'b-' + Math.random().toString(36).substring(2, 9),
      reference,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Automatically update departure booked seats if matched
    setDepartures((prev) =>
      prev.map((d) => {
        if (d.tourId === bookingData.tourId && d.startDate === bookingData.departureDate) {
          const newBooked = d.bookedSeats + bookingData.guests;
          return {
            ...d,
            bookedSeats: newBooked,
            status: newBooked >= d.capacity ? 'sold_out' : newBooked >= d.capacity - 2 ? 'filling_fast' : d.status,
          };
        }
        return d;
      })
    );

    return newBooking;
  };

  const updateBooking = (reference: string, updated: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.reference === reference ? { ...b, ...updated } : b))
    );
  };

  const cancelBooking = (reference: string) => {
    updateBooking(reference, { status: 'cancelled' });
  };

  // Departure Actions
  const addDeparture = (dep: Departure) => {
    setDepartures((prev) => [dep, ...prev]);
  };

  const updateDeparture = (id: string, updated: Partial<Departure>) => {
    setDepartures((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );
  };

  const deleteDeparture = (id: string) => {
    setDepartures((prev) => prev.filter((d) => d.id !== id));
  };

  // Inquiry Actions
  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: 'inq-' + Math.random().toString(36).substring(2, 9),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const addMessage = addInquiry;

  const updateInquiry = (id: string, updated: Partial<Inquiry>) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
    );
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  // Guide Actions
  const addGuide = (guide: Guide) => {
    setGuides((prev) => [guide, ...prev]);
  };

  const updateGuide = (id: string, updated: Partial<Guide>) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        lookupBooking,
        bookings,
        addBooking,
        updateBooking,
        cancelBooking,
        departures,
        addDeparture,
        updateDeparture,
        deleteDeparture,
        inquiries,
        addInquiry,
        addMessage,
        updateInquiry,
        deleteInquiry,
        guides,
        addGuide,
        updateGuide,
        currentAdvisor,
        registeredAdvisors,
        advisorLogin,
        advisorRegister,
        advisorLogout,
        createAdvisorBooking,
        notifyFinanceForBooking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
