'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Navigation, Play, Pause, Plus, Minus } from 'lucide-react';

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}


interface MarkerData {
  id: string;
  name: string;
  merchant: string;
  lat: number;
  lng: number;
  emoji: string;
  category: string;
  price: string | number;
  rating: number;
  reviews?: number;
  address?: string;
  description?: string;
  linkUrl?: string;
}

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  markers: MarkerData[];
  onMarkerClick?: (marker: MarkerData) => void;
  selectedMarkerId?: string | null;
  onCenterChange?: (lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  customPin?: { lat: number; lng: number } | null;
  showRoute?: boolean;
}

export default function MapComponent({
  center,
  zoom = 13,
  markers,
  onMarkerClick,
  selectedMarkerId,
  onCenterChange,
  onMapClick,
  customPin,
  showRoute = false,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapMode, setMapMode] = useState<'normal' | 'satellite'>('normal');
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasFitBoundsRef = useRef(false);
  const prevCenterRef = useRef(center);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [liveCoords, setLiveCoords] = useState<[number, number] | null>(null);
  const liveMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const lastFetchedRouteKeyRef = useRef<string>('');
  const customPinMarkerRef = useRef<L.Marker | null>(null);
  const [routingError, setRoutingError] = useState<string | null>(null);

  const [mapZoom, setMapZoom] = useState(zoom);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const routePointsRef = useRef<[number, number][]>([]);
  const liveCoordsRef = useRef<[number, number] | null>(null);
  const headingRef = useRef<number>(0);
  const prevZoomRef = useRef(zoom);

  const handleSimulateNavigation = () => {
    if (isSimulating) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulating(false);
      setLiveCoords(null);
      liveCoordsRef.current = null;
      return;
    }

    if (routePointsRef.current.length < 2) {
      alert("No active route found to simulate. Please select a shop to show navigation first.");
      return;
    }

    setIsSimulating(true);
    setIsTracking(false);

    let currentStep = 0;
    const points = routePointsRef.current;

    setLiveCoords(points[0]);
    liveCoordsRef.current = points[0];
    headingRef.current = 0;
    if (mapRef.current) {
      mapRef.current.setView(points[0], 18, { animate: true, duration: 0.5 });
    }

    simulationIntervalRef.current = setInterval(() => {
      currentStep++;
      if (currentStep >= points.length) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        setIsSimulating(false);
        alert("🎉 You have arrived at your destination!");
        return;
      }

      const prevPoint = points[currentStep - 1];
      const nextPoint = points[currentStep];

      const bearing = calculateBearing(prevPoint[0], prevPoint[1], nextPoint[0], nextPoint[1]);
      headingRef.current = bearing;

      setLiveCoords(nextPoint);
      liveCoordsRef.current = nextPoint;

      if (mapRef.current) {
        mapRef.current.setView(nextPoint, 18, { animate: true, duration: 0.6 });
      }
    }, 1000);
  };

  // Reset fit bounds flag when the center/city changes significantly (e.g. changing cities)
  const distCenter = Math.sqrt(
    Math.pow(prevCenterRef.current[0] - center[0], 2) + Math.pow(prevCenterRef.current[1] - center[1], 2)
  );
  if (distCenter > 0.0005) {
    if (distCenter > 0.1) {
      hasFitBoundsRef.current = false;
    }
    prevCenterRef.current = center;
  }


  // Time-adaptive Google Maps or Dark theme tiles
  const getTileUrl = (mode: 'normal' | 'satellite') => {
    if (mode === 'satellite') {
      return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Satellite Hybrid
    }
    return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Google Roadmap
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const successCallback = (position: any) => {
      const { latitude, longitude } = position.coords;
      
      // Update live coords and center so route is dynamically calculated from actual physical location
      setLiveCoords([latitude, longitude]);
      liveCoordsRef.current = [latitude, longitude];
      if (onCenterChange) {
        onCenterChange(latitude, longitude);
      }

      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 17, { animate: true, duration: 1.2 });
        
        // Remove previous user marker if it exists
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // Create custom user location marker
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="relative flex items-center justify-center w-6 h-6">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400/40 opacity-75"></span>
              <div class="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-indigo-500 shadow-md animate-scale-up"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        
        const newMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current);
        userMarkerRef.current = newMarker;
      }
    };

    // Try high accuracy first (usually fast on mobile GPS, but times out on desktop)
    navigator.geolocation.getCurrentPosition(
      successCallback,
      (error) => {
        console.warn("High accuracy geolocation failed or timed out, trying fallback...", error);
        // Fallback: Disable high accuracy, increase timeout to 15 seconds
        navigator.geolocation.getCurrentPosition(
          successCallback,
          (err) => {
            console.warn("Fallback geolocation failed or denied. Proceeding with simulated location.");
            // Simulate a location offset near current active city center
            const shiftLat = center[0] + (Math.random() - 0.5) * 0.015;
            const shiftLng = center[1] + (Math.random() - 0.5) * 0.015;
            
            successCallback({
              coords: {
                latitude: shiftLat,
                longitude: shiftLng,
              }
            });
            console.warn("Using simulated coordinates near default area due to device timeout.");
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 5000 }
    );
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1, { animate: true });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1, { animate: true });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      zoomSnap: 0,
      zoomDelta: 0,
    });

    // Custom zoom controls are handled by floating buttons in the UI instead
    // L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Set Initial Tile Layer
    const tileLayer = L.tileLayer(getTileUrl(mapMode), {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapRef.current = map;
    tileLayerRef.current = tileLayer;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Set initial map zoom state
    setMapZoom(map.getZoom());

    // Listen to panned movements (moveend) to support real-time sensing of nearby shops
    map.on('moveend', () => {
      if (!isPinching) {
        const newCenter = map.getCenter();
        if (onCenterChange) {
          onCenterChange(newCenter.lat, newCenter.lng);
        }
      }
    });

    // Listen to zoom changes to show/hide markers
    map.on('zoomend', () => {
      if (!isPinching) {
        setMapZoom(map.getZoom());
      }
    });

    // Enable custom zoom only when pinching (sets e.ctrlKey to true in browsers)
    // or holding Ctrl while scrolling. This ensures regular two-finger swipes or scrolls
    // never trigger any random zooms.
    const container = mapContainerRef.current;
    let targetZoom = map.getZoom();
    let zoomLatLng: L.LatLng | null = null;
    let zoomTimeout: NodeJS.Timeout | null = null;
    let lastZoomTime = 0;
    let isPinching = false;

    const performZoom = () => {
      if (!mapRef.current || !zoomLatLng) return;
      
      const now = Date.now();
      const currentZoom = map.getZoom();
      
      if (Math.abs(targetZoom - currentZoom) < 0.01) return;

      // Use Leaflet's smooth CSS-animated zoom (duration 0.15s)
      map.setZoomAround(zoomLatLng, targetZoom, {
        animate: true,
        duration: 0.15
      } as any);
      
      lastZoomTime = now;
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        
        isPinching = true;

        if (zoomTimeout) {
          clearTimeout(zoomTimeout);
          zoomTimeout = null;
        }

        zoomLatLng = map.mouseEventToLatLng(e);
        
        // Normalize delta based on deltaMode
        let delta = -e.deltaY;
        if (e.deltaMode === 1) { // Line mode
          delta *= 16;
        } else if (e.deltaMode === 2) { // Page mode
          delta *= 100;
        }
        
        const zoomFactor = 0.003;
        const minZoom = map.getMinZoom();
        const maxZoom = map.getMaxZoom();
        
        targetZoom = Math.max(minZoom, Math.min(maxZoom, targetZoom + delta * zoomFactor));
        
        const now = Date.now();
        if (now - lastZoomTime >= 100) {
          performZoom();
        }

        // Debounce the final state release and zoom settlement
        zoomTimeout = setTimeout(() => {
          isPinching = false;
          performZoom();
        }, 120);
      }
    };
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Listen to map click events for selecting and pinning locations
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Invalidate size on mount to prevent partial loading
    const timer = setTimeout(() => {
      try {
        if (mapRef.current && (mapRef.current as any)._container) {
          mapRef.current.invalidateSize();
        }
      } catch (e) {
        // Safe catch if unmounted rapidly
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Silent auto-location on mount (if permission is already granted) to initialize coordinates
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLiveCoords([latitude, longitude]);
          liveCoordsRef.current = [latitude, longitude];
          if (onCenterChange) {
            onCenterChange(latitude, longitude);
          }
        },
        (error) => {
          console.warn("Silent auto-locate on mount failed:", error);
        },
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
      );
    }
  }, []);

  // Sync mode changes dynamically
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapMode));
    }
  }, [mapMode]);

  // Update map view on center or zoom changes
  useEffect(() => {
    if (mapRef.current && Array.isArray(center) && typeof center[0] === 'number' && typeof center[1] === 'number' && !isNaN(center[0]) && !isNaN(center[1])) {
      try {
        const currentCenter = mapRef.current.getCenter();
        const currentZoom = mapRef.current.getZoom();
        const distance = Math.sqrt(
          Math.pow(currentCenter.lat - center[0], 2) + Math.pow(currentCenter.lng - center[1], 2)
        );
        
        const zoomChanged = prevZoomRef.current !== zoom;
        prevZoomRef.current = zoom;

        // If the distance is very large (> 0.1 degrees), it's likely a city fly-to/reset,
        // so we should reset the zoom to the prop zoom. Otherwise, preserve user's zoom.
        const isLargeDistance = distance > 0.1;

        // Only call setView if the difference is significant to prevent feedback loops
        if (distance > 0.0005 || zoomChanged) {
          const targetZoom = (zoomChanged || isLargeDistance) ? zoom : currentZoom;
          mapRef.current.setView(center, targetZoom, { animate: true, duration: 0.8 });
          setMapZoom(targetZoom);
        }
      } catch (err) {
        console.warn('Map setView error:', err);
      }
    }
  }, [center?.[0], center?.[1], zoom]);

  // Live Geolocation Tracking
  useEffect(() => {
    if (isTracking) {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        setIsTracking(false);
        return;
      }

      const startWatching = (highAccuracy: boolean): number => {
        return navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const rawHeading = position.coords.heading;

            // Resolve heading
            let newHeading = headingRef.current;
            if (rawHeading !== null && rawHeading !== undefined && !isNaN(rawHeading)) {
              newHeading = rawHeading;
            } else if (liveCoordsRef.current) {
              const [prevLat, prevLng] = liveCoordsRef.current;
              // Check if they are actually different coordinates to avoid jittering
              if (prevLat !== latitude || prevLng !== longitude) {
                newHeading = calculateBearing(prevLat, prevLng, latitude, longitude);
              }
            }

            headingRef.current = newHeading;
            liveCoordsRef.current = [latitude, longitude];
            setLiveCoords([latitude, longitude]);

            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 17, { animate: true, duration: 1.0 });
            }
          },
          (error) => {
            console.warn(`Watch position error (highAccuracy=${highAccuracy}):`, error);
            if (highAccuracy) {
              // Try falling back to low accuracy
              if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
              }
              watchIdRef.current = startWatching(false);
            } else {
              // If low accuracy also fails, simulate a tracking position and pan
              const shiftLat = center[0] + (Math.random() - 0.5) * 0.015;
              const shiftLng = center[1] + (Math.random() - 0.5) * 0.015;
              setLiveCoords([shiftLat, shiftLng]);
              liveCoordsRef.current = [shiftLat, shiftLng];
              if (mapRef.current) {
                mapRef.current.setView([shiftLat, shiftLng], 17, { animate: true, duration: 1.0 });
              }
            }
          },
          { 
            enableHighAccuracy: highAccuracy, 
            timeout: highAccuracy ? 6000 : 15000, 
            maximumAge: 10000 
          }
        );
      };

      watchIdRef.current = startWatching(true);
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (!isSimulating) {
        // Keep the last known coordinates so the route start point stays accurate
        headingRef.current = 0;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking, isSimulating]);

  // Render Live Tracker Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (liveMarkerRef.current) {
      liveMarkerRef.current.remove();
      liveMarkerRef.current = null;
    }

    if (liveCoords) {
      const currentHeading = headingRef.current;
      const liveIcon = L.divIcon({
        className: 'live-tracking-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8" style="transform: rotate(${currentHeading}deg); transition: transform 0.25s cubic-bezier(0.1, 0.8, 0.2, 1);">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/25 opacity-75"></span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.4));">
              <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="#1a73e8" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      liveMarkerRef.current = L.marker(liveCoords, { icon: liveIcon }).addTo(mapRef.current);
    }

    return () => {
      if (liveMarkerRef.current) {
        liveMarkerRef.current.remove();
        liveMarkerRef.current = null;
      }
    };
  }, [liveCoords]);

  // Draw Route Tracking Line to selected vendor or custom pin
  useEffect(() => {
    if (!mapRef.current) return;

    if ((selectedMarkerId || customPin) && showRoute) {
      let endPoint: [number, number];

      if (selectedMarkerId) {
        const selectedMarker = markers.find(m => m.id === selectedMarkerId);
        if (!selectedMarker || !selectedMarker.lat || !selectedMarker.lng) return;
        endPoint = [selectedMarker.lat, selectedMarker.lng];
      } else if (customPin) {
        endPoint = [customPin.lat, customPin.lng];
      } else {
        return;
      }

      // If we are currently simulating, do not fetch/redraw the route line
      if (isSimulating && routeLineRef.current) {
        return;
      }

      let startPoint: [number, number] = liveCoords || center;

        // Ensure we calculate routing locally to guarantee beautiful, natural road turns.
        // If the start and destination are in different cities or far apart (>10 km),
        // we snap the starting point to a nearby road coordinate (~1.2 km away).
        const dist = Math.sqrt(
          Math.pow(startPoint[0] - endPoint[0], 2) + Math.pow(startPoint[1] - endPoint[1], 2)
        );
        if (dist > 0.1) {
          startPoint = [endPoint[0] - 0.007, endPoint[1] - 0.007];
        }

        // Generate a unique route cache key with 4 decimal precision to avoid jittery refetches
        const routeKey = `${startPoint[0].toFixed(4)},${startPoint[1].toFixed(4)}->${endPoint[0].toFixed(4)},${endPoint[1].toFixed(4)}`;

        // If the route hasn't changed and the route line is already active, return early
        if (lastFetchedRouteKeyRef.current === routeKey && routeLineRef.current) {
          return;
        }

        // Clean up the previous route line before showing fallback or fetching new OSRM route
        if (routeLineRef.current) {
          routeLineRef.current.remove();
          routeLineRef.current = null;
        }

        lastFetchedRouteKeyRef.current = routeKey;

        // Draw straight line fallback immediately first (double layered casing/core)
        const drawFallbackLine = () => {
          if (routeLineRef.current) routeLineRef.current.remove();
          
          const casing = L.polyline([startPoint, endPoint], {
            color: 'rgba(99, 102, 241, 0.35)',
            weight: 9,
            lineCap: 'round',
            lineJoin: 'round'
          });

          const core = L.polyline([startPoint, endPoint], {
            color: '#6366f1',
            weight: 4,
            dashArray: '8, 8',
            lineCap: 'round',
            lineJoin: 'round'
          });

          routeLineRef.current = L.featureGroup([casing, core]).addTo(mapRef.current!) as any;
          routePointsRef.current = [startPoint, endPoint];
        };

        // Draw straight line fallback immediately as placeholder/loading state
        drawFallbackLine();
        setRoutingError(null);

        // Async route fetching from multiple endpoints (primary: openstreetmap.de, secondary: project-osrm.org)
        const fetchRoute = async (start: [number, number], end: [number, number]) => {
          const endpoints = [
            `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
            `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
          ];

          let lastError = null;
          for (const url of endpoints) {
            try {
              const res = await fetch(url);
              if (!res.ok) {
                lastError = new Error(`HTTP error! status: ${res.status}`);
                continue;
              }
              const data = await res.json();
              if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
                return data.routes[0].geometry.coordinates;
              }
            } catch (err) {
              lastError = err;
              console.warn(`Routing endpoint failed: ${url}`, err);
            }
          }
          throw lastError || new Error("All routing endpoints failed");
        };

        fetchRoute(startPoint, endPoint)
          .then(geojsonCoords => {
            // Stop if route key changed during fetch (race condition)
            if (lastFetchedRouteKeyRef.current !== routeKey) return;

            const routePoints: [number, number][] = geojsonCoords.map((coord: [number, number]) => [coord[1], coord[0]]);
            
            if (routeLineRef.current) routeLineRef.current.remove();

            // Draw beautiful Google Maps style road polyline (Casing + Core)
            const casing = L.polyline(routePoints, {
              color: 'rgba(37, 99, 235, 0.35)', // transparent blue glow
              weight: 11,
              lineCap: 'round',
              lineJoin: 'round'
            });

            const core = L.polyline(routePoints, {
              color: '#1a73e8', // Google Maps navigation blue core
              weight: 5,
              lineCap: 'round',
              lineJoin: 'round'
            });

            routeLineRef.current = L.featureGroup([casing, core]).addTo(mapRef.current!) as any;
            routePointsRef.current = routePoints;

            // adjust bounds to show the entire route
            if (mapRef.current && routeLineRef.current) {
              mapRef.current.fitBounds(routeLineRef.current.getBounds().pad(0.2), { animate: true });
            }
          })
          .catch(err => {
            if (lastFetchedRouteKeyRef.current !== routeKey) return;
            console.warn("OSRM routing failed, drawing fallback line:", err);
            setRoutingError("Road-based routing unavailable. Showing direct line.");
            drawFallbackLine();
          });
    } else {
      // Clear route line if selection is cleared or showRoute is false
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      lastFetchedRouteKeyRef.current = '';
      setRoutingError(null);
      routePointsRef.current = [];
    }
  }, [selectedMarkerId, markers, center, liveCoords, showRoute, isSimulating, customPin]);

  // Clean up route line, custom pin marker, and simulation interval when map component unmounts
  useEffect(() => {
    return () => {
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      if (customPinMarkerRef.current) {
        customPinMarkerRef.current.remove();
        customPinMarkerRef.current = null;
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, []);

  // Separately manage custom pin marker to prevent drag gesture interruptions
  useEffect(() => {
    if (!mapRef.current) return;

    if (!customPin || !customPin.lat || !customPin.lng) {
      if (customPinMarkerRef.current) {
        customPinMarkerRef.current.remove();
        customPinMarkerRef.current = null;
      }
      return;
    }

    if (customPinMarkerRef.current) {
      const currentLatLng = customPinMarkerRef.current.getLatLng();
      const diffLat = Math.abs(currentLatLng.lat - customPin.lat);
      const diffLng = Math.abs(currentLatLng.lng - customPin.lng);
      
      if (diffLat > 0.00001 || diffLng > 0.00001) {
        const isDragging = customPinMarkerRef.current.dragging && (customPinMarkerRef.current.dragging as any)._draggable && (customPinMarkerRef.current.dragging as any)._draggable._moving;
        if (!isDragging) {
          customPinMarkerRef.current.setLatLng([customPin.lat, customPin.lng]);
          customPinMarkerRef.current.setPopupContent(`
            <div class="p-2.5 font-sans min-w-[180px] bg-slate-950 text-white rounded-xl border border-rose-800 shadow-2xl text-center">
              <h4 class="font-extrabold text-xs text-rose-400 mb-1">📍 Custom Pin Dropped</h4>
              <p class="text-[10px] text-slate-400 mb-1.5">${customPin.lat.toFixed(5)}°, ${customPin.lng.toFixed(5)}°</p>
              <div class="text-[9px] text-amber-300 font-bold uppercase tracking-wider">Use Panel to Set Active</div>
            </div>
          `);
        }
      }
      return;
    }

    const customPinIcon = L.divIcon({
      className: 'custom-pinned-location-marker',
      html: `
        <div class="relative flex items-center justify-center w-12 h-12">
          <span class="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-rose-500/40 opacity-75"></span>
          <div class="relative flex h-9.5 w-9.5 items-center justify-center rounded-full border-2 border-white bg-rose-600 shadow-2xl animate-scale-up select-none">
            <span class="text-xl">📍</span>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const pinMarker = L.marker([customPin.lat, customPin.lng], { 
      icon: customPinIcon,
      draggable: true 
    });
    pinMarker.addTo(mapRef.current);
    customPinMarkerRef.current = pinMarker;

    pinMarker.on('drag', (event) => {
      const marker = event.target as L.Marker;
      const position = marker.getLatLng();
      if (onMapClick) {
        onMapClick(position.lat, position.lng);
      }
    });

    pinMarker.on('dragend', (event) => {
      const marker = event.target as L.Marker;
      const position = marker.getLatLng();
      if (onMapClick) {
        onMapClick(position.lat, position.lng);
      }
    });
    
    pinMarker.bindPopup(`
      <div class="p-2.5 font-sans min-w-[180px] bg-slate-950 text-white rounded-xl border border-rose-800 shadow-2xl text-center">
        <h4 class="font-extrabold text-xs text-rose-400 mb-1">📍 Custom Pin Dropped</h4>
        <p class="text-[10px] text-slate-400 mb-1.5">${customPin.lat.toFixed(5)}°, ${customPin.lng.toFixed(5)}°</p>
        <div class="text-[9px] text-amber-300 font-bold uppercase tracking-wider">Use Panel to Set Active</div>
      </div>
    `, { closeButton: false }).openPopup();

  }, [customPin, onMapClick]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    const isZoomedIn = mapZoom >= 16;

    markers.forEach((marker) => {
      if (!marker.lat || !marker.lng) return;

      const isSelected = selectedMarkerId === marker.id;

      // Google Maps style behavior: only show markers when zoomed in close (zoom >= 16),
      // or if the marker is currently selected.
      if (!isZoomedIn && !isSelected) {
        return;
      }

      // Custom marker label DivIcon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10">
            ${
              isSelected
                 ? `<span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-amber-500/40"></span>`
                 : ''
            }
            <div class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 ${
              isSelected
                ? 'border-amber-400 bg-amber-950 scale-110 shadow-xl'
                : 'border-indigo-500 bg-slate-900 hover:border-indigo-400 hover:scale-105'
            } shadow-lg transition-all duration-300">
              <span class="text-base select-none">${marker.emoji || '📍'}</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -18],
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-3.5 font-sans min-w-[240px] bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-2">
          <div class="flex justify-between items-start gap-2">
            <span class="text-[9px] uppercase font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md tracking-wider">
              ${marker.category}
            </span>
            <span class="font-bold text-[10px] text-amber-400 flex items-center gap-0.5">⭐ ${marker.rating} <span class="text-[9px] text-slate-500 font-normal">(${marker.reviews || 45})</span></span>
          </div>
          <div>
            <h4 class="font-extrabold text-sm text-slate-100 leading-tight mb-0.5">${marker.name}</h4>
            <p class="text-[11px] text-slate-400">${marker.merchant}</p>
          </div>
          ${
            marker.description
              ? `<p class="text-[10px] text-slate-400/90 leading-relaxed border-t border-slate-900 pt-1.5 mt-0.5">${marker.description}</p>`
              : ''
          }
          ${
            marker.address
              ? `<p class="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">📍 ${marker.address}</p>`
              : ''
          }
          <div class="flex justify-between items-center border-t border-slate-900 pt-2.5 mt-1">
            <span class="font-black text-indigo-300 text-sm">${marker.price}</span>
            ${
              marker.linkUrl
                ? `<a href="${marker.linkUrl}" class="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] uppercase font-bold py-2 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md active:scale-[0.97]">Book Slot</a>`
                : ''
            }
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup',
        maxWidth: 280,
      });

      leafletMarker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker);
        }
      });

      leafletMarker.addTo(markersGroupRef.current!);
    });

    if (markers.length > 1 && mapRef.current && !hasFitBoundsRef.current) {
      const group = L.featureGroup(
        markers
          .filter((m) => m.lat && m.lng)
          .map((m) => L.marker([m.lat, m.lng]))
      );
      if (group.getLayers().length > 0) {
        mapRef.current.fitBounds(group.getBounds().pad(0.15), { animate: true });
        hasFitBoundsRef.current = true;
      }
    }
  }, [markers, selectedMarkerId, customPin, mapZoom]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-[color:var(--color-outline-variant)]/20 bg-slate-950">
      {/* Routing status notice */}
      {routingError && (
        <div className="absolute top-4 left-4 z-[400] bg-rose-950/90 backdrop-blur-md border border-rose-500/30 text-rose-200 px-3.5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-[10px] font-bold tracking-wide animate-fade-in max-w-[240px] sm:max-w-xs transition-all duration-300">
          <span className="text-sm select-none">⚠️</span>
          <span>{routingError}</span>
        </div>
      )}

      {/* Floating Satellite Switcher Panel */}
      <div className="absolute top-4 right-4 z-[400] flex bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 p-0.5 shadow-xl select-none">
        <button
          onClick={() => setMapMode('normal')}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            mapMode === 'normal'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setMapMode('satellite')}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            mapMode === 'satellite'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Floating Simulation Button */}
      {showRoute && (selectedMarkerId || customPin) && (
        <button
          onClick={handleSimulateNavigation}
          className={`absolute bottom-[18rem] right-3.5 z-[400] flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 shadow-xl transition-all cursor-pointer group ${
            isSimulating ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-900/90 hover:bg-amber-600 text-white'
          }`}
          title={isSimulating ? "Pause Simulation" : "Simulate Navigation"}
        >
          {isSimulating ? (
            <Pause className="h-4.5 w-4.5 text-white" />
          ) : (
            <Play className="h-4.5 w-4.5 text-slate-300 group-hover:text-white transition-colors" />
          )}
        </button>
      )}

      {/* Floating Live Tracking Button */}
      <button
        onClick={() => setIsTracking(!isTracking)}
        className={`absolute bottom-[15rem] right-3.5 z-[400] flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 shadow-xl transition-all cursor-pointer group ${
          isTracking ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-900/90 hover:bg-emerald-600 text-white'
        }`}
        title={isTracking ? "Live GPS Tracking Active" : "Start Live GPS Tracking"}
      >
        <Navigation className={`h-4.5 w-4.5 text-slate-300 group-hover:text-white transition-colors ${isTracking ? 'text-white' : ''}`} />
      </button>

      {/* Floating Zoom In Button */}
      <button
        onClick={handleZoomIn}
        className="absolute bottom-48 right-3.5 z-[400] flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-white border border-white/10 shadow-xl transition-all cursor-pointer group"
        title="Zoom In"
      >
        <Plus className="h-4.5 w-4.5 text-slate-300 group-hover:text-white transition-colors" />
      </button>

      {/* Floating Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        className="absolute bottom-36 right-3.5 z-[400] flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-white border border-white/10 shadow-xl transition-all cursor-pointer group"
        title="Zoom Out"
      >
        <Minus className="h-4.5 w-4.5 text-slate-300 group-hover:text-white transition-colors" />
      </button>

      {/* Floating Geolocation Button */}
      <button
        onClick={handleLocate}
        className="absolute bottom-24 right-3.5 z-[400] flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-white border border-white/10 shadow-xl transition-all cursor-pointer group"
        title="Locate Me"
      >
        <Locate className="h-4.5 w-4.5 text-slate-300 group-hover:text-white transition-colors" />
      </button>

      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: rgba(15, 23, 42, 0.85) !important;
          color: #ffffff !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          transition: background-color 0.2s;
        }
        .leaflet-bar a:hover {
          background-color: rgba(99, 102, 241, 0.85) !important;
        }
        @keyframes scaleUp {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
