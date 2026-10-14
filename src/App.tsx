/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { ToursProvider } from './context/ToursContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollUpDown } from './components/ScrollUpDown';
import { HomePage } from './pages/HomePage';
import { ToursPage } from './pages/ToursPage';
import { DayToursPage } from './pages/DayToursPage';
import { TourDetailPage } from './pages/TourDetailPage';
import { BookTourPage } from './pages/BookTourPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TravelerLoginPage } from './pages/TravelerLoginPage';
import { AccountPage } from './pages/AccountPage';
import { OperationsPage } from './pages/OperationsPage';
import { AdminPage } from './pages/AdminPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { PoliciesPage, PolicyTab } from './pages/PoliciesPage';
import { RoomingSelection } from './data/toursData';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [bookingParams, setBookingParams] = useState<{
    departureId?: string;
    guests?: number;
    roomSelections?: RoomingSelection[];
  }>({});

  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  const handleSelectCountry = (country: string, continent?: string) => {
    setSelectedCountry(country);
    setSelectedRegion('All');
    if (continent) setSelectedContinent(continent);
    navigate('/tours');
  };

  const handleSelectRegion = (region: string, continent?: string) => {
    setSelectedRegion(region);
    setSelectedCountry('All');
    if (continent) setSelectedContinent(continent);
    navigate('/tours');
  };

  const handleSelectContinent = (continent: string) => {
    setSelectedContinent(continent);
    setSelectedRegion('All');
    setSelectedCountry('All');
    navigate('/tours');
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectTour = (slug: string) => {
    navigate(`/tours/${slug}`);
  };

  const handleBookTour = (
    slug: string,
    departureId?: string,
    guests?: number,
    roomSelections?: RoomingSelection[]
  ) => {
    setBookingParams({ departureId, guests, roomSelections });
    navigate(`/tours/${slug}/book`);
  };

  const handleSelectPost = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  // Route resolver
  const renderCurrentPage = () => {
    // Check for tour booking /tours/:slug/book
    const bookMatch = currentPath.match(/^\/tours\/([a-zA-Z0-9_\-]+)\/book/);
    if (bookMatch) {
      return (
        <BookTourPage
          slug={bookMatch[1]}
          initialDepartureId={bookingParams.departureId}
          initialGuests={bookingParams.guests}
          initialRoomSelections={bookingParams.roomSelections}
          onNavigate={navigate}
          onSelectTour={handleSelectTour}
        />
      );
    }

    // Check for tour detail /tours/:slug
    const tourMatch = currentPath.match(/^\/tours\/([a-zA-Z0-9_\-]+)/);
    if (tourMatch && !['/tours', '/tours/'].includes(currentPath)) {
      return (
        <TourDetailPage
          slug={tourMatch[1]}
          onNavigate={navigate}
          onSelectTour={handleSelectTour}
          onBookTour={handleBookTour}
        />
      );
    }

    // Check for blog post /blog/:slug
    const blogMatch = currentPath.match(/^\/blog\/([a-zA-Z0-9_\-]+)/);
    if (blogMatch && !['/blog', '/blog/'].includes(currentPath)) {
      return (
        <BlogPostPage
          slug={blogMatch[1]}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    switch (currentPath) {
      case '/tours':
      case '/tours/':
        return (
          <ToursPage
            onSelectTour={handleSelectTour}
            initialContinent={selectedContinent}
            initialRegion={selectedRegion}
            initialCountry={selectedCountry}
          />
        );
      case '/day-tours':
      case '/day-tours/':
        return <DayToursPage onSelectTour={handleSelectTour} />;
      case '/blog':
      case '/blog/':
        return <BlogPage onSelectPost={handleSelectPost} onNavigate={navigate} />;
      case '/about':
      case '/about/':
        return <AboutPage onNavigate={navigate} />;
      case '/contact':
      case '/contact/':
        return <ContactPage />;
      case '/login':
      case '/login/':
      case '/auth':
      case '/auth/':
        return <TravelerLoginPage onNavigate={navigate} />;
      case '/account':
      case '/account/':
        return <AccountPage onNavigate={navigate} onSelectTour={handleSelectTour} />;
      case '/operations':
      case '/operations/':
        return <OperationsPage onNavigate={navigate} onSelectTour={handleSelectTour} />;
      case '/admin':
      case '/admin/':
        return <AdminPage onSelectTour={handleSelectTour} onNavigate={navigate} />;
      case '/advisor':
      case '/advisor/':
      case '/consultant':
      case '/consultant/':
        return <AdvisorPage onNavigate={navigate} onSelectTour={handleSelectTour} />;
      case '/terms':
      case '/terms/':
      case '/bookingterms':
      case '/bookingterms/':
      case '/booking-terms':
      case '/booking-terms/':
      case '/terms-and-conditions':
      case '/terms-and-conditions/':
        return <PoliciesPage initialTab="terms" onNavigate={navigate} />;
      case '/privacy':
      case '/privacy/':
      case '/privacypolicy':
      case '/privacypolicy/':
      case '/privacy-policy':
      case '/privacy-policy/':
        return <PoliciesPage initialTab="privacy" onNavigate={navigate} />;
      case '/modern-slavery':
      case '/modern-slavery/':
      case '/modern-slavery-act':
      case '/modern-slavery-act/':
        return <PoliciesPage initialTab="modern-slavery" onNavigate={navigate} />;
      case '/sustainable-tourism':
      case '/sustainable-tourism/':
      case '/sustainability':
      case '/sustainability/':
        return <PoliciesPage initialTab="sustainable-tourism" onNavigate={navigate} />;
      case '/responsible-travel':
      case '/responsible-travel/':
      case '/responsibletravel':
      case '/responsibletravel/':
      case '/fairtravels':
      case '/fairtravels/':
      case '/fair-travels':
      case '/fair-travels/':
        return <PoliciesPage initialTab="responsible-travel" onNavigate={navigate} />;
      case '/atlas-cares':
      case '/atlas-cares/':
      case '/cares':
      case '/cares/':
        return <PoliciesPage initialTab="atlas-cares" onNavigate={navigate} />;
      case '/policies':
      case '/policies/':
        return <PoliciesPage initialTab="terms" onNavigate={navigate} />;
      case '/':
      default:
        return (
          <HomePage
            onNavigate={navigate}
            onSelectTour={handleSelectTour}
            onSelectRegion={handleSelectRegion}
            onSelectContinent={handleSelectContinent}
            onSelectCountry={handleSelectCountry}
          />
        );
    }
  };

  return (
    <AuthProvider>
      <ToursProvider>
        <ReviewsProvider>
          <CurrencyProvider>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
              <Navbar currentPath={currentPath} onNavigate={navigate} />
              <main className="flex-1">{renderCurrentPage()}</main>
              <Footer onNavigate={navigate} />
              <ScrollUpDown />
            </div>
          </CurrencyProvider>
        </ReviewsProvider>
      </ToursProvider>
    </AuthProvider>
  );
}
