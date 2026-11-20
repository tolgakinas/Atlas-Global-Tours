import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  RotateCcw,
  Navigation,
  Info,
  ChevronRight,
  Eye,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Tour } from '../data/toursData';
import { extractTourRouteStops, RouteStop } from '../utils/geoCoordinates';

// CARTO Basemaps API key provided by user (with env override support)
export const CARTO_API_KEY =
  (import.meta as any).env?.VITE_CARTO_API_KEY || 'cb1_4ice_1_343bbf0ac8fa64d233ec4e19';

export type MapTileStyle = 'voyager' | 'light_all' | 'osm';

/**
 * CARTO Basemaps tile URL with ?key parameter:
 * e.g. https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4ice_1_343bbf0ac8fa64d233ec4e19
 */
export const getTileUrl = (style: MapTileStyle = 'voyager', useKey = true) => {
  if (style === 'osm') {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }
  const base = `https://basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}.png`;
  return useKey && CARTO_API_KEY ? `${base}?key=${CARTO_API_KEY}` : base;
};

export const getCartoTileUrl = getTileUrl;

interface TourRouteMapProps {
  tour: Tour;
  selectedDay?: number | null;
  onSelectDay?: (dayNumber: number) => void;
  className?: string;
}

export const TourRouteMap: React.FC<TourRouteMapProps> = ({
  tour,
  selectedDay,
  onSelectDay,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const dashedPolylineRef = useRef<L.Polyline | null>(null);

  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'cities' | 'activities'>('all');
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('voyager');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tileErrorFallback, setTileErrorFallback] = useState(false);

  // Extract stops based on tour data
  const routeStops = useMemo(() => {
    return extractTourRouteStops(tour);
  }, [tour]);

  // Reset active stop whenever the tour changes
  useEffect(() => {
    setActiveStopId(routeStops[0]?.id ?? null);
  }, [tour.id, routeStops]);

  // Sync when selectedDay prop changes (e.g. from Day-by-day Itinerary)
  useEffect(() => {
    if (selectedDay) {
      const matchingStop = routeStops.find((s) => s.dayNumbers.includes(selectedDay));
      if (matchingStop) {
        setActiveStopId(matchingStop.id);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([matchingStop.lat, matchingStop.lng], 11, {
            duration: 1.2,
          });
          const marker = markersRef.current.get(matchingStop.id);
          if (marker) {
            marker.openPopup();
          }
        }
      }
    }
  }, [selectedDay, routeStops]);

  // Force map resize check
  const triggerMapResize = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, []);

  // Initialize and maintain Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Reset potential recycled Leaflet ID
    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center (first stop or central Türkiye)
    const initialLat = routeStops[0]?.lat || 39.0;
    const initialLng = routeStops[0]?.lng || 35.0;

    // Create Leaflet instance
    const map = L.map(container, {
      center: [initialLat, initialLng],
      zoom: routeStops.length > 1 ? 6 : 10,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    // Determine initial tile URL
    const tileUrl = getTileUrl(mapStyle, !tileErrorFallback);
    const tileLayer = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    });

    // Graceful fallback if CARTO API key encounters rate-limit/CORS issue
    tileLayer.on('tileerror', () => {
      if (!tileErrorFallback && mapStyle !== 'osm') {
        console.warn('CARTO Basemap tile error with query param, switching to direct basemap stream');
        setTileErrorFallback(true);
        if (tileLayerRef.current) {
          tileLayerRef.current.remove();
        }
        const fallbackUrl = getTileUrl('voyager', false);
        const fallbackLayer = L.tileLayer(fallbackUrl, {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);
        tileLayerRef.current = fallbackLayer;
      }
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Add zoom controls on top right
    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Initial resize invalidation sequence
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    // ResizeObserver ensures map adjusts to any layout shifts
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      ro.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [tour.id]);

  // Update tile layer when style or fallback status changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const newTileUrl = getTileUrl(mapStyle, !tileErrorFallback);
    const newTileLayer = L.tileLayer(newTileUrl, {
      attribution:
        mapStyle === 'osm'
          ? '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    map.invalidateSize();
  }, [mapStyle, tileErrorFallback, mapReady]);

  // Draw Route Polyline & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || routeStops.length === 0) return;

    // Clear previous markers & polylines
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (dashedPolylineRef.current) {
      dashedPolylineRef.current.remove();
      dashedPolylineRef.current = null;
    }

    // Coordinates for the route line
    const routeCoords: [number, number][] = routeStops.map((stop) => [stop.lat, stop.lng]);

    // Draw main route polyline
    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#1e6b52', // Brand emerald
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      polylineRef.current = polyline;

      // Dashed accent overlay line
      const dashedPolyline = L.polyline(routeCoords, {
        color: '#ffffff',
        weight: 2,
        opacity: 0.95,
        dashArray: '8, 12',
      }).addTo(map);
      dashedPolylineRef.current = dashedPolyline;
    }

    // Add markers for all route stops
    routeStops.forEach((stop, index) => {
      const isVisible =
        filterMode === 'all' ||
        (filterMode === 'cities' && stop.type === 'city') ||
        (filterMode === 'activities' && stop.type !== 'city');

      if (!isVisible) return;

      const isCity = stop.type === 'city';
      const stopNumber = index + 1;

      // Custom HTML Marker using L.divIcon
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 34px; height: 34px;">
          <div class="absolute -inset-1.5 rounded-full ${
            isCity ? 'bg-emerald-600/30' : 'bg-amber-500/30'
          } animate-pulse blur-[1px]"></div>
          <div class="relative flex size-8 items-center justify-center rounded-full border-2 border-white ${
            isCity
              ? 'bg-[#1e6b52] text-white shadow-md'
              : 'bg-[#cf9b52] text-white shadow-md'
          } font-bold text-xs transition-transform duration-200 group-hover:scale-115">
            ${
              isCity
                ? `<span>${stopNumber}</span>`
                : `<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
            }
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/90 text-white px-2 py-0.5 text-[0.65rem] font-bold shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
            ${stop.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-route-marker',
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = `
        <div class="p-1 min-w-[220px] max-w-[280px] font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
            <span class="text-[0.65rem] font-bold uppercase tracking-wider text-[#1e6b52]">
              Stop ${stopNumber} · Day ${stop.dayNumbers.join(', ')}
            </span>
            <span class="text-[0.65rem] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              ${stop.type === 'city' ? 'Destination' : 'Experience'}
            </span>
          </div>
          <h4 class="font-bold text-sm text-gray-900 leading-snug mb-1">
            ${stop.name}
          </h4>
          ${
            stop.activityLabel
              ? `<div class="text-[0.7rem] text-amber-700 font-semibold mb-1.5 flex items-center gap-1">
                  ★ ${stop.activityLabel}
                 </div>`
              : ''
          }
          <p class="text-xs text-gray-600 leading-relaxed">
            ${stop.description || 'Guided destination highlight on this tour.'}
          </p>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-tour-popup',
        closeButton: true,
      });

      marker.on('click', () => {
        setActiveStopId(stop.id);
        if (onSelectDay && stop.dayNumbers.length > 0) {
          onSelectDay(stop.dayNumbers[0]);
        }
      });

      markersRef.current.set(stop.id, marker);
    });

    // Fit map bounds with adaptive maxZoom (closer zoom for single-city walking tours)
    if (routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      const latSpan = Math.abs(bounds.getNorth() - bounds.getSouth());
      const lngSpan = Math.abs(bounds.getEast() - bounds.getWest());
      const span = Math.max(latSpan, lngSpan);
      const adaptiveMaxZoom = routeCoords.length === 1 ? 14 : span < 0.05 ? 15 : span < 0.35 ? 12 : 9;

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: adaptiveMaxZoom,
      });
    }

    // Re-check sizing
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [routeStops, filterMode, mapReady, onSelectDay]);

  // Handle clicking a timeline stop chip
  const handleSelectStop = (stop: RouteStop) => {
    setActiveStopId(stop.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([stop.lat, stop.lng], tour.tour_type === 'day' ? 15 : 11, { duration: 1.1 });
      const marker = markersRef.current.get(stop.id);
      if (marker) {
        marker.openPopup();
      }
    }
    if (onSelectDay && stop.dayNumbers.length > 0) {
      onSelectDay(stop.dayNumbers[0]);
    }
  };

  // Reset view to entire route bounds
  const handleResetBounds = () => {
    const map = mapInstanceRef.current;
    if (map && routeStops.length > 0) {
      const bounds = L.latLngBounds(routeStops.map((s) => [s.lat, s.lng]));
      const span = Math.max(
        Math.abs(bounds.getNorth() - bounds.getSouth()),
        Math.abs(bounds.getEast() - bounds.getWest())
      );
      const adaptiveMaxZoom = routeStops.length === 1 ? 14 : span < 0.05 ? 15 : span < 0.35 ? 12 : 9;
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: adaptiveMaxZoom,
      });
      map.invalidateSize();
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  return (
    <section
      id="tour-route-map"
      className={`mt-10 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col bg-background' : ''
      } ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border p-4 sm:p-5 bg-card">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Compass className="size-4 animate-spin-slow" />
            <span className="eyebrow text-primary">Interactive Journey Map</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Tour Route & Destination Highlights
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Follow the journey across {routeStops.length} stops and activity locations. Click any pin to inspect day highlights.
          </p>
        </div>

        {/* Action Controls & Layer Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tile Layer Style Switcher */}
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMapStyle('voyager')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                mapStyle === 'voyager'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="CARTO Voyager Basemap"
            >
              Voyager
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('light_all')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                mapStyle === 'light_all'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="CARTO Positron Light Basemap"
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('osm')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                mapStyle === 'osm'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="OpenStreetMap Standard Basemap"
            >
              OSM
            </button>
          </div>

          {/* Marker Filter Buttons */}
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Stops ({routeStops.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('cities')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterMode === 'cities'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cities
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('activities')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterMode === 'activities'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activities
            </button>
          </div>

          {/* Reset route bounds */}
          <button
            type="button"
            onClick={handleResetBounds}
            title="Fit whole route"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Fit Route</span>
          </button>

          {/* Expand/Collapse Map */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-3.5" />
                <span className="hidden sm:inline">Collapse</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas with Guaranteed Dimensions */}
      <div className="relative w-full overflow-hidden bg-[#f1ede4]">
        <div
          ref={mapContainerRef}
          style={{
            height: isFullscreen ? 'calc(100vh - 160px)' : '480px',
            minHeight: '400px',
            width: '100%',
          }}
          className="w-full relative z-0"
        />

        {/* Loading overlay until map initializes */}
        {!mapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/60 backdrop-blur-xs z-20">
            <Compass className="size-8 text-primary animate-spin" />
            <span className="mt-2 text-xs font-semibold text-foreground">
              Loading interactive route map...
            </span>
          </div>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 right-3 z-10 rounded-lg border border-border/80 bg-card/95 backdrop-blur-xs p-2.5 shadow-md text-[0.7rem] space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1">
            <span className="font-bold text-foreground text-[0.68rem] uppercase tracking-wider">
              Map Legend
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3.5 rounded-full bg-[#1e6b52] border border-white shrink-0"></span>
            <span className="text-foreground">Destination City & Overnight</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3.5 rounded-full bg-[#cf9b52] border border-white shrink-0"></span>
            <span className="text-foreground">Activity & Experience Pin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#1e6b52] border-t border-dashed border-white shrink-0"></span>
            <span className="text-foreground">Planned Travel Route</span>
          </div>
        </div>

        {/* Helper tip */}
        <div className="absolute top-3 left-3 z-10 rounded-md bg-slate-900/80 text-white px-2.5 py-1 text-[0.65rem] font-medium backdrop-blur-xs pointer-events-none hidden sm:flex items-center gap-1.5">
          <Info className="size-3 text-primary" />
          <span>Click any marker to view day description</span>
        </div>
      </div>

      {/* Sequential Stop Chips Bar below map */}
      <div className="border-t border-border bg-muted/20 p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
          <span className="flex items-center gap-1 text-foreground">
            <Navigation className="size-3.5 text-primary" />
            Route Itinerary Timeline ({routeStops.length} Stops)
          </span>
          <span className="text-[0.7rem]">Click to focus location on map</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {routeStops.map((stop, index) => {
            const isActive = activeStopId === stop.id;
            return (
              <React.Fragment key={stop.id}>
                <button
                  type="button"
                  onClick={() => handleSelectStop(stop)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs scale-102'
                      : 'border-border bg-card text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                      isActive
                        ? 'bg-white text-primary'
                        : stop.type === 'city'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="text-left">
                    <span className="block leading-tight line-clamp-1">{stop.name}</span>
                    <span
                      className={`block text-[0.65rem] ${
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      Day {stop.dayNumbers.join(', ')}
                    </span>
                  </div>
                </button>

                {index < routeStops.length - 1 && (
                  <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
