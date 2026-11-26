/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { ToursProvider, useTours } from './context/ToursContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ComparisonProvider, useComparison } from './context/ComparisonContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollUpDown } from './components/ScrollUpDown';
import { TourComparisonBar } from './components/TourComparisonBar';
import { TourComparisonModal } from './components/TourComparisonModal';
import { StickyInquiryBar } from './components/StickyInquiryBar';
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
import { SitemapPage } from './pages/SitemapPage';
import { ComparePage } from './pages/ComparePage';
import { RoomingSelection } from './data/toursData';
import { POSTS_DATA } from './data/postsData';
import { NotFoundPage } from './pages/NotFoundPage';
import { applyRouteMeta } from './seo/applyMeta';
import { findDestinationCountry, findTourBySlug, resolveRouteMeta } from './seo/routeMeta';

// Route guards: render a real 404 instead of silently falling back to
// another tour or the homepage (prevents duplicate-content soft 404s).
const TourRoute: React.FC<{ slug: string; children: React.ReactNode; onNavigate: (p: string) => void }> = ({
  slug,
  children,
  onNavigate,
}) => {
  const { tours } = useTours();
  return findTourBySlug(tours, slug) ? <>{children}</> : <NotFoundPage onNavigate={onNavigate} />;
};

const DestinationRoute: React.FC<{
  countryId: string;
  onNavigate: (p: string) => void;
  onSelectTour: (slug: string) => void;
}> = ({ countryId, onNavigate, onSelectTour }) => {
  const { tours } = useTours();
  const destination = findDestinationCountry(tours, countryId);
  if (!destination) return <NotFoundPage onNavigate={onNavigate} />;
  return <ToursPage key={destination.id} destination={destination} onSelectTour={onSelectTour} />;
};

// Inner layout component to access comparison context
const AppLayout: React.FC<{
  currentPath: string;
  navigate: (path: string) => void;
  renderCurrentPage: () => React.ReactNode;
  handleSelectTour: (slug: string) => void;
  handleBookTour: (slug: string) => void;
}> = ({ currentPath, navigate, renderCurrentPage, handleSelectTour, handleBookTour }) => {
  const { isComparisonModalOpen, closeComparisonModal } = useComparison();
  const { tours } = useTours();

  // Keep <head> (title, description, canonical, OG, JSON-LD) in sync during
  // in-app navigation. The server injects the same tags into the initial HTML.
  // Articles fetched from the journal API return null here; BlogPostPage
  // applies their meta once loaded.
  useEffect(() => {
    const meta = resolveRouteMeta(currentPath, { tours, posts: POSTS_DATA });
    if (meta) applyRouteMeta(meta);
  }, [currentPath, tours]);

  const isBookingFlow = currentPath.includes('/book');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      {!isBookingFlow && <StickyInquiryBar />}
      <main className="flex-1">{renderCurrentPage()}</main>
      <Footer onNavigate={navigate} />
      <ScrollUpDown />

      {/* Floating Bottom Comparison Tray */}
      <TourComparisonBar onNavigateCompare={() => navigate('/compare')} />

      {/* Side-by-Side Comparison Modal */}
      <TourComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={closeComparisonModal}
        onSelectTour={handleSelectTour}
        onBookTour={handleBookTour}
      />
    </div>
  );
};

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

  // Route matching helper
  const renderCurrentPage = () => {
    // Dynamic tour booking: /tours/:slug/book
    if (currentPath.startsWith('/tours/') && currentPath.endsWith('/book')) {
      const parts = currentPath.split('/');
      const slug = parts[2];
      if (parts.length !== 4) return <NotFoundPage onNavigate={navigate} />;
      return (
        <TourRoute slug={slug} onNavigate={navigate}>
        <BookTourPage
          slug={slug}
          initialDepartureId={bookingParams.departureId}
          initialGuests={bookingParams.guests}
          initialRoomSelections={bookingParams.roomSelections}
          onNavigate={navigate}
          onSelectTour={handleSelectTour}
        />
        </TourRoute>
      );
    }

    // Dynamic tour detail: /tours/:slug
    if (currentPath.startsWith('/tours/')) {
      const rest = currentPath.replace('/tours/', '').replace(/\/+$/, '');
      const slug = rest.split('/')[0];
      if (!slug || rest.includes('/')) return <NotFoundPage onNavigate={navigate} />;
      return (
        <TourRoute slug={slug} onNavigate={navigate}>
          <TourDetailPage
            slug={slug}
            onNavigate={navigate}
            onSelectTour={handleSelectTour}
            onBookTour={handleBookTour}
          />
        </TourRoute>
      );
    }

    // Destination landing pages: /destinations/:country
    if (currentPath.startsWith('/destinations/')) {
      const countryId = currentPath.replace('/destinations/', '').replace(/\/+$/, '');
      if (!countryId || countryId.includes('/')) return <NotFoundPage onNavigate={navigate} />;
      return <DestinationRoute countryId={countryId} onNavigate={navigate} onSelectTour={handleSelectTour} />;
    }

    // Dynamic blog detail: /blog/:slug
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '').split('/')[0];
      return (
        <BlogPostPage
          slug={slug}
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
      case '/compare':
      case '/compare/':
        return (
          <ComparePage
            onNavigate={navigate}
            onSelectTour={handleSelectTour}
            onBookTour={handleBookTour}
          />
        );
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
      case '/sitemap':
      case '/sitemap/':
      case '/sitemap.html':
        return (
          <SitemapPage
            onNavigate={navigate}
            onSelectTour={handleSelectTour}
            onSelectPost={handleSelectPost}
          />
        );
      case '/':
        return (
          <HomePage
            onNavigate={navigate}
            onSelectTour={handleSelectTour}
            onSelectRegion={handleSelectRegion}
            onSelectContinent={handleSelectContinent}
            onSelectCountry={handleSelectCountry}
          />
        );
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToursProvider>
          <ReviewsProvider>
            <CurrencyProvider>
              <ComparisonProvider>
                <AppLayout
                  currentPath={currentPath}
                  navigate={navigate}
                  renderCurrentPage={renderCurrentPage}
                  handleSelectTour={handleSelectTour}
                  handleBookTour={handleBookTour}
                />
              </ComparisonProvider>
            </CurrencyProvider>
          </ReviewsProvider>
        </ToursProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
