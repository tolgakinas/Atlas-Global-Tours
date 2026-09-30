import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'traveller' | 'admin';
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
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  travelDate?: string;
  guests?: string;
  message: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, role?: 'traveller' | 'admin') => void;
  logout: () => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'reference' | 'status' | 'createdAt'>) => Booking;
  cancelBooking: (reference: string) => void;
  messages: ContactMessage[];
  addMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('agt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('agt_bookings');
      if (saved) return JSON.parse(saved);
      // Sample seed booking
      return [
        {
          id: 'b-seed-1',
          reference: 'AGT-2026-8492',
          tourId: 'cac84395-f80e-4bd0-a2e8-108f3748f752',
          tourSlug: 'shortbreak-eastern-turkiye',
          tourTitle: 'immersive South Eastern Turkiye : Culinary & Cultural tour',
          tourImage: 'https://atlasglobaltours.com/wp-content/uploads/2022/03/2D8C3436_20180704160312891.jpg',
          departureDate: '2026-10-15',
          guests: 2,
          totalPriceCents: 420000,
          currency: 'USD',
          leadName: 'Jane Cooper',
          leadEmail: 'jane.cooper@example.com',
          leadPhone: '+1 (555) 234-5678',
          specialRequests: 'Vegetarian meals for one guest please',
          status: 'confirmed',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        }
      ];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem('agt_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('agt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agt_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('agt_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('agt_messages', JSON.stringify(messages));
  }, [messages]);

  const login = (email: string, name?: string, role: 'traveller' | 'admin' = 'traveller') => {
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substring(2, 9),
      email,
      name: name || email.split('@')[0],
      role,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addBooking = (data: Omit<Booking, 'id' | 'reference' | 'status' | 'createdAt'>): Booking => {
    const randomRef = 'AGT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      ...data,
      id: 'b-' + Math.random().toString(36).substring(2, 9),
      reference: randomRef,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = (reference: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.reference === reference ? { ...b, status: 'cancelled' } : b))
    );
  };

  const addMessage = (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, bookings, addBooking, cancelBooking, messages, addMessage }}
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
