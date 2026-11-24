'use client';

import { MapPin, Star, Navigation, Compass, Loader, ArrowRight, Grid, List as ListIcon, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useLocationStore, useBookingFlowStore } from '../../lib/store';
import { calculateDistance } from '../../lib/geoUtils';
import { api } from '../../lib/api';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import of Leaflet map wrapper to disable SSR and prevent 'window is not defined' error
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[color:var(--color-surface-dim)]/50">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin text-[color:var(--color-primary)] mx-auto mb-2" />
        <p className="text-xs text-[color:var(--color-outline)] font-bold uppercase tracking-wider">Loading Map Interface...</p>
      </div>
    </div>
  ),
});

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  chennai: { lat: 13.0827, lng: 80.2707 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  theni: { lat: 10.0104, lng: 77.4702 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
};

const POPULAR_MAP_CATEGORIES = [
  { slug: 'all', name: 'All Services', emoji: '🔍' },
  { slug: 'hotels', name: 'Hotels & Stays', emoji: '🏨' },
  { slug: 'temple', name: 'Temples & Shrines', emoji: '🛕' },
  { slug: 'shop', name: 'Shops & Supermarkets', emoji: '🛍️' },
  { slug: 'movies', name: 'Movies & Shows', emoji: '🎥' },
  { slug: 'football-turf', name: 'Sports & Turfs', emoji: '⚽' },
  { slug: 'dining', name: 'Restaurants', emoji: '🍴' },
  { slug: 'salons', name: 'Salons & Spas', emoji: '💇' },
  { slug: 'doctor', name: 'Doctors & Hospitals', emoji: '🏥' },
  { slug: 'cabs', name: 'Cabs & Rentals', emoji: '🚖' },
  { slug: 'plumber', name: 'Plumbers', emoji: '🔧' },
  { slug: 'electrician', name: 'Electricians', emoji: '⚡' },
];

function matchesCategory(activeCategory: string, categoryName: string): boolean {
  if (activeCategory === 'all') return true;
  const catLower = (categoryName || '').toLowerCase();
  
  if (activeCategory === 'hotels') {
    return catLower.includes('hotel') || catLower.includes('resort') || catLower.includes('stay') || catLower.includes('homestay') || catLower.includes('villa') || catLower.includes('hostel') || catLower.includes('camping') || catLower.includes('camp') || catLower.includes('accommodation');
  }
  if (activeCategory === 'movies') {
    return catLower.includes('movie') || catLower.includes('cinema') || catLower.includes('theatre') || catLower.includes('show') || catLower.includes('concert') || catLower.includes('event') || catLower.includes('festival') || catLower.includes('exhibition') || catLower.includes('workshop') || catLower.includes('class') || catLower.includes('gaming') || catLower.includes('arena');
  }
  if (activeCategory === 'football-turf') {
    return catLower.includes('turf') || catLower.includes('court') || catLower.includes('ground') || catLower.includes('sports') || catLower.includes('sport') || catLower.includes('gym') || catLower.includes('yoga') || catLower.includes('fitness') || catLower.includes('pool') || catLower.includes('swim') || catLower.includes('play') || catLower.includes('arena');
  }
  if (activeCategory === 'dining') {
    return catLower.includes('restaurant') || catLower.includes('dining') || catLower.includes('dine') || catLower.includes('food') || catLower.includes('cafe') || catLower.includes('eat');
  }
  if (activeCategory === 'salons') {
    return catLower.includes('salon') || catLower.includes('spa') || catLower.includes('beauty') || catLower.includes('wellness') || catLower.includes('haircut') || catLower.includes('massage');
  }
  if (activeCategory === 'doctor') {
    return catLower.includes('doctor') || catLower.includes('hospital') || catLower.includes('clinic') || catLower.includes('dentist') || catLower.includes('medical') || catLower.includes('care') || catLower.includes('health');
  }
  if (activeCategory === 'cabs') {
    return catLower.includes('cab') || catLower.includes('taxi') || catLower.includes('car') || catLower.includes('bike') || catLower.includes('rent') || catLower.includes('rental') || catLower.includes('bus') || catLower.includes('train') || catLower.includes('flight') || catLower.includes('ferry') || catLower.includes('boat') || catLower.includes('shuttle') || catLower.includes('van') || catLower.includes('helicopter') || catLower.includes('transport') || catLower.includes('travel');
  }
  if (activeCategory === 'temple') {
    return catLower.includes('temple') || catLower.includes('pooja') || catLower.includes('darshan') || catLower.includes('pilgrimage') || catLower.includes('shrine') || catLower.includes('worship') || catLower.includes('religious');
  }
  if (activeCategory === 'shop') {
    return catLower.includes('shop') || catLower.includes('store') || catLower.includes('market') || catLower.includes('supermarket') || catLower.includes('grocery') || catLower.includes('boutique') || catLower.includes('retail') || catLower.includes('space') || catLower.includes('room') || catLower.includes('studio') || catLower.includes('hall') || catLower.includes('conference') || catLower.includes('meeting') || catLower.includes('office') || catLower.includes('coworking') || catLower.includes('business') || catLower.includes('appointment');
  }
  if (activeCategory === 'plumber') {
    return catLower.includes('plumber') || catLower.includes('plumbing') || catLower.includes('pipe') || catLower.includes('leak');
  }
  if (activeCategory === 'electrician') {
    return catLower.includes('electrician') || catLower.includes('electrical') || catLower.includes('wire') || catLower.includes('power');
  }

  return false;
}

export default function MapsPage() {
  const { city, latitude, longitude, setLocation } = useLocationStore();
  const { services, merchants } = useBookingFlowStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [loadingReal, setLoadingReal] = useState(false);
  const [customPin, setCustomPin] = useState<{ lat: number; lng: number } | null>(null);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNavigationRoute, setShowNavigationRoute] = useState(false);

  // Reset navigation route flag when service changes
  useEffect(() => {
    setShowNavigationRoute(false);
  }, [selectedService]);

  // Default coordinate center based on active city
  const cityCenter = useMemo(() => {
    return CITY_COORDINATES[(city || 'Chennai').toLowerCase()] || { lat: 13.0827, lng: 80.2707 };
  }, [city]);

  // Current active map center
  const mapCenter = useMemo((): [number, number] => {
    if (latitude !== null && longitude !== null) {
      return [latitude, longitude];
    }
    return [cityCenter.lat, cityCenter.lng];
  }, [cityCenter, latitude, longitude]);

  // Reset panned center and custom pin when city or manual location changes
  useEffect(() => {
    setUserPannedCenter(null);
    setCustomPin(null);
  }, [city, latitude, longitude]);

  const activeMapCenter = useMemo((): [number, number] => {
    return userPannedCenter || mapCenter;
  }, [userPannedCenter, mapCenter]);

  const cityServices = useMemo(() => {
    if (searchQuery.trim()) {
      return services;
    }
    return services.filter((s) => {
      const sCity = (s.city || '').toLowerCase();
      const userCity = (city || 'Chennai').toLowerCase();
      return userCity.includes(sCity) || sCity.includes(userCity);
    });
  }, [services, city, searchQuery]);

  const cityMerchants = useMemo(() => {
    if (searchQuery.trim()) {
      return merchants;
    }
    return merchants.filter((m) => {
      const mCity = (m.city || '').toLowerCase();
      const userCity = (city || 'Chennai').toLowerCase();
      return userCity.includes(mCity) || mCity.includes(userCity);
    });
  }, [merchants, city, searchQuery]);

  // Fetch real services from the NestJS backend near the active map center coordinates
  useEffect(() => {
    let active = true;
    const fetchRealServices = async () => {
      setLoadingReal(true);
      try {
        const [lat, lng] = activeMapCenter;
        const params: Record<string, string> = {
          latitude: String(lat),
          longitude: String(lng),
          radius: '25',
          limit: '50',
        };

        if (activeCategory !== 'all') {
          params.categorySlug = activeCategory;
        }

        const response = await api.services.list(params);
        if (active && response && (response as any).data) {
          setRealServices((response as any).data);
        }
      } catch (err) {
        console.warn('Failed to fetch real nearby services:', err);
      } finally {
        if (active) setLoadingReal(false);
      }
    };
    fetchRealServices();
    return () => {
      active = false;
    };
  }, [activeMapCenter, activeCategory]);

  // Consolidate static, dynamic, and database-loaded category listings
  const mapServices = useMemo(() => {
    let categoriesToGenerate = POPULAR_MAP_CATEGORIES.filter((c) => c.slug !== 'all');
    if (activeCategory !== 'all') {
      categoriesToGenerate = POPULAR_MAP_CATEGORIES.filter((c) => c.slug === activeCategory);
    }

    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const list: any[] = [];

    // 1. First, map and include real services fetched from database
    const mappedReal = realServices
      .filter((s: any) => s && s.merchant && s.category)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        merchant: s.merchant.name,
        price: parseFloat(s.basePrice) || 0,
        rating: s.rating,
        reviews: s.reviewCount,
        duration: s.durationMinutes,
        city: s.merchant.city,
        image: s.images && s.images[0] ? s.images[0] : '🏢',
        category: s.category.name,
        lat: s.merchant.latitude,
        lng: s.merchant.longitude,
        address: s.merchant.address || 'Premium verified venue',
        distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], s.merchant.latitude, s.merchant.longitude),
      }));
    
    list.push(...mappedReal);

    // Merge actual store bookings/services matching current selection from local flow storage
    const storeServices = cityServices.filter((s) => matchesCategory(activeCategory, s.category || ''));

    storeServices.forEach((s) => {
      if (!list.some((item) => item.id === s.id)) {
        const seedLat = s.id.charCodeAt(s.id.length - 1) || 5;
        const seedLng = s.id.charCodeAt(0) || 7;
        const lat = s.lat || cityCenter.lat + (pseudoRandom(seedLat) - 0.5) * 0.035;
        const lng = s.lng || cityCenter.lng + (pseudoRandom(seedLng) - 0.5) * 0.035;
        list.push({
          ...s,
          address: s.desc || 'Premium verified venue',
          lat: lat,
          lng: lng,
          distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], lat, lng),
        });
      }
    });

    // 4. Merge actual onboarded merchants matching current selection
    const storeMerchants = cityMerchants.filter((m) => matchesCategory(activeCategory, m.category));

    storeMerchants.forEach((m) => {
      if (!list.some((item) => item.id === `merchant-${m.id}` || item.name === m.name)) {
        const lat = m.latitude || cityCenter.lat;
        const lng = m.longitude || cityCenter.lng;
        list.push({
          id: `merchant-${m.id}`,
          name: m.name,
          merchant: m.name,
          price: 'Partner Store',
          rating: m.rating || 5.0,
          reviews: 12,
          duration: 0,
          city: m.city || city,
          image: '🏢',
          category: m.category || 'Local Partner',
          lat: lat,
          lng: lng,
          address: m.address || 'Premium verified venue',
          desc: m.description || 'Verified local shop and services provider.',
          distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], lat, lng),
        });
      }
    });

    // Ensure the selected service is always included in the list to maintain its marker/route
    if (selectedService && !list.some((item) => item.id === selectedService.id)) {
      const lat = selectedService.lat || cityCenter.lat;
      const lng = selectedService.lng || cityCenter.lng;
      list.push({
        ...selectedService,
        lat,
        lng,
        distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], lat, lng),
      });
    }

    // Sort by proximity distance
    return list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [city, cityCenter, activeCategory, activeMapCenter, cityServices, cityMerchants, realServices, selectedService, searchQuery]);



  const filteredMapServices = useMemo(() => {
    if (!searchQuery.trim()) return mapServices;
    const query = searchQuery.toLowerCase();
    return mapServices.filter((svc) => 
      svc.name.toLowerCase().includes(query) ||
      svc.merchant.toLowerCase().includes(query) ||
      svc.category.toLowerCase().includes(query) ||
      (svc.address && svc.address.toLowerCase().includes(query))
    );
  }, [mapServices, searchQuery]);

  // Automatically fetch coordinates on mount if not loaded
  useEffect(() => {
    setLocated(latitude !== null);
  }, [latitude]);

  const handleUseLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setLocated(true);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const fallbackCoords = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
          setLocation(lat, lng, fallbackCoords);

          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
            headers: {
              'User-Agent': 'BetaBookingApp/1.0',
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data && data.address) {
                const address = data.address;
                const localArea =
                  address.suburb ||
                  address.neighbourhood ||
                  address.residential ||
                  address.city_district ||
                  address.village;
                const cityOrTown = address.city || address.town || address.municipality;

                const parts = [];
                if (localArea) parts.push(localArea);
                if (cityOrTown) parts.push(cityOrTown);

                if (parts.length > 0) {
                  setLocation(lat, lng, parts.join(', '));
                  return;
                }
              }
              setLocation(lat, lng, fallbackCoords);
            })
            .catch((err) => {
              console.warn(err);
              setLocation(lat, lng, fallbackCoords);
            });
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
          // Standard simulation if geolocation request fails
          setTimeout(() => {
            const shiftLat = cityCenter.lat + (Math.random() - 0.5) * 0.02;
            const shiftLng = cityCenter.lng + (Math.random() - 0.5) * 0.02;
            setLocation(shiftLat, shiftLng, `Simulated GPS in ${city}`);
          }, 500);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Map markers to Leaflet structure
  const leafletMarkers = useMemo(() => {
    return filteredMapServices.map((svc) => ({
      id: svc.id,
      name: svc.name,
      merchant: svc.merchant,
      lat: svc.lat,
      lng: svc.lng,
      emoji: typeof svc.image === 'string' && svc.image.length < 5 ? svc.image : '📍',
      category: svc.category,
      price: typeof svc.price === 'number' ? `₹${svc.price}` : svc.price,
      rating: svc.rating,
      reviews: svc.reviews || 45,
      address: svc.address || 'Premium verified venue',
      description: svc.desc || 'Best service in the area, offering top-tier quality and instant booking options.',
      linkUrl: `/service/${svc.id}`,
    }));
  }, [filteredMapServices]);

  return (
    <>
      <main className="page-content h-screen flex flex-col bg-[color:var(--color-background)]">
        <div className="flex h-full relative overflow-hidden">
          
          {/* Sidebar Panel */}
          <div className={`${mobileView === 'list' ? 'flex w-full' : 'hidden'} sm:flex sm:w-96 overflow-y-auto border-r border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)] flex-col custom-scrollbar z-10 shrink-0`}>
            <div className="p-4 border-b border-[color:var(--color-outline-variant)]/20">
              <h1 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
                <MapPin className="h-5 w-5 text-[color:var(--color-primary)]" /> Nearby Terminal
              </h1>
              
              <button
                onClick={handleUseLocation}
                disabled={isLocating}
                className="mt-3 flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary)] w-full justify-center hover:bg-[color:var(--color-primary)]/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" /> Locating...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" /> Sync GPS coordinates
                  </>
                )}
              </button>
              
              {located && latitude !== null && longitude !== null && (
                <div className="mt-2 text-center bg-emerald-500/5 rounded-xl border border-emerald-500/10 py-1.5">
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                    ✓ GPS Telemetry Synced
                  </p>
                </div>
              )}

              {/* Sidebar Search Input */}
              <div className="mt-3.5 relative">
                <input
                  type="text"
                  placeholder="Search shop, category, domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 focus:bg-slate-900/50 pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Category Filters */}
            <div className="px-4 py-2.5 border-b border-[color:var(--color-outline-variant)]/10 bg-[color:var(--color-surface-dim)]/40 overflow-x-auto flex gap-2 custom-scrollbar whitespace-nowrap">
              {POPULAR_MAP_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      setActiveCategory(cat.slug);
                      setSelectedService(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)] text-[color:var(--color-on-primary)] shadow-md shadow-[color:var(--color-primary)]/10'
                        : 'bg-[color:var(--color-surface-container-high)] border-[color:var(--color-outline-variant)]/20 text-[color:var(--color-on-surface-variant)] hover:bg-[color:var(--color-surface-container-highest)]'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Services List */}
            <div className="divide-y divide-[color:var(--color-outline-variant)]/20 flex-1 overflow-y-auto custom-scrollbar">
              {filteredMapServices.length > 0 ? (
                filteredMapServices.map((svc) => {
                  const isSelected = selectedService?.id === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => {
                        if (selectedService && selectedService.id === svc.id) {
                          setSelectedService(null);
                        } else {
                          setSelectedService(svc);
                        }
                      }}
                      className={`p-4 hover:bg-[color:var(--color-surface-dim)]/45 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[color:var(--color-surface-dim)]/70 border-l-4 border-[color:var(--color-primary)]'
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 border border-[color:var(--color-primary)]/15 px-1.5 py-0.5 rounded">
                            {svc.category}
                          </span>
                          <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)] mt-1.5 leading-tight">{svc.name}</h3>
                          <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-0.5">{svc.merchant}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold bg-[color:var(--color-surface-container-highest)] border border-[color:var(--color-outline-variant)]/30 px-2 py-0.5 rounded text-[color:var(--color-on-surface)]">
                          {svc.distance ? `${svc.distance.toFixed(1)} km` : '0.8 km'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-[color:var(--color-on-surface-variant)]">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-[color:var(--color-on-surface)]">{svc.rating}</span>
                          <span className="text-[10px] text-[color:var(--color-outline)]">({svc.reviews})</span>
                        </div>
                        <span className="font-extrabold text-[color:var(--color-primary)]">
                          {typeof svc.price === 'number' ? `₹${svc.price}` : svc.price}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4 text-xs text-[color:var(--color-outline)]">
                  No services found near {city} matching this filter.
                </div>
              )}
            </div>
          </div>

          {/* Map Display & Detail Modal */}
          <div className={`${mobileView === 'map' ? 'flex' : 'hidden'} sm:flex flex-1 h-full bg-[color:var(--color-surface-dim)]/40 relative flex-col justify-end`}>
            
            {/* Embedded interactive Leaflet map */}
            <div className="absolute inset-0 z-0">
              <MapComponent
                center={selectedService ? [selectedService.lat, selectedService.lng] : (userPannedCenter || mapCenter)}
                zoom={selectedService ? 17 : 13}
                markers={leafletMarkers}
                selectedMarkerId={selectedService?.id}
                customPin={customPin}
                showRoute={showNavigationRoute}
                onCenterChange={(lat, lng) => setUserPannedCenter([lat, lng])}
                onMapClick={(lat, lng) => {
                  setCustomPin({ lat, lng });
                  setSelectedService(null);
                  setShowNavigationRoute(false);
                }}
                onMarkerClick={(marker) => {
                  if (selectedService && selectedService.id === marker.id) {
                    setSelectedService(null);
                  } else {
                    const match = mapServices.find((s) => s.id === marker.id);
                    if (match) {
                      setSelectedService(match);
                      setCustomPin(null);
                      setShowNavigationRoute(false);
                    }
                  }
                }}
              />
            </div>

            {/* Selected Service Detail Panel */}
            {selectedService && !customPin && (
              <div className="p-4 sm:p-6 bg-[color:var(--color-surface-container)]/95 border-t border-[color:var(--color-outline-variant)]/30 backdrop-blur-xl z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-2xl relative animate-fade-up max-w-2xl mx-auto sm:mb-6 sm:rounded-3xl sm:border border-x border-[color:var(--color-outline-variant)]/30 w-full sm:w-[calc(100%-3rem)]">
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="h-16 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500/25 to-purple-500/25 border border-[color:var(--color-outline-variant)]/20 flex items-center justify-center text-3xl shadow-inner shrink-0 select-none">
                    {typeof selectedService.image === 'string' && selectedService.image.length < 5 ? selectedService.image : '🏢'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/8 border border-[color:var(--color-primary)]/20 px-2 py-0.5 rounded-md">
                      {selectedService.category}
                    </span>
                    <h2 className="text-base font-black text-[color:var(--color-on-surface)] mt-1.5 leading-tight truncate">{selectedService.name}</h2>
                    <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 truncate">
                      {selectedService.merchant}
                    </p>
                    <p className="text-[10px] text-[color:var(--color-outline)] mt-0.5 leading-none">
                      📍 {selectedService.address}
                    </p>
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-[color:var(--color-outline-variant)]/10 pt-3 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-[color:var(--color-outline)] block uppercase font-bold tracking-wider">Estimated Fare</span>
                    <span className="text-xl font-black text-[color:var(--color-primary)]">
                      {typeof selectedService.price === 'number' ? `₹${selectedService.price}` : selectedService.price}
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setShowNavigationRoute(!showNavigationRoute)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow active:scale-[0.97] transition-all cursor-pointer border ${
                        showNavigationRoute
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 animate-pulse'
                          : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                      }`}
                    >
                      {showNavigationRoute ? (
                        <>✕ Hide Route</>
                      ) : (
                        <>
                          <Navigation className="h-3.5 w-3.5" /> Get Directions
                        </>
                      )}
                    </button>
                    <Link
                      href={`/service/${selectedService.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:from-indigo-600 hover:to-purple-700 active:scale-[0.97] transition-all"
                    >
                      View & Book <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Pinned Location Detail Panel */}
            {customPin && (
              <div className="p-4 sm:p-6 bg-[color:var(--color-surface-container)]/95 border-t border-[color:var(--color-outline-variant)]/30 backdrop-blur-xl z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-2xl relative animate-fade-up max-w-2xl mx-auto sm:mb-6 sm:rounded-3xl sm:border border-x border-[color:var(--color-outline-variant)]/30 w-full sm:w-[calc(100%-3rem)]">
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="h-16 w-20 rounded-2xl bg-gradient-to-tr from-rose-500/25 to-orange-500/25 border border-rose-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0 select-none animate-pulse">
                    📍
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                      Interactive Pin
                    </span>
                    <h2 className="text-base font-black text-[color:var(--color-on-surface)] mt-1.5 leading-tight truncate">Selected Map Coordinate</h2>
                    <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 truncate">
                      Latitude: {customPin.lat.toFixed(6)}
                    </p>
                    <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-0.5 truncate">
                      Longitude: {customPin.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto border-t sm:border-t-0 border-[color:var(--color-outline-variant)]/10 pt-3 sm:pt-0 shrink-0 justify-end">
                  <button
                    onClick={() => setShowNavigationRoute(!showNavigationRoute)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow active:scale-[0.97] transition-all cursor-pointer border ${
                      showNavigationRoute
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 animate-pulse'
                        : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                    }`}
                  >
                    {showNavigationRoute ? (
                      <>✕ Hide Route</>
                    ) : (
                      <>
                        <Navigation className="h-3.5 w-3.5" /> Navigate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCustomPin(null);
                      setShowNavigationRoute(false);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/40 hover:bg-[color:var(--color-surface-dim)]/50 text-xs font-bold text-[color:var(--color-on-surface-variant)] transition-all cursor-pointer"
                  >
                    Clear Pin
                  </button>
                  <button
                    onClick={() => {
                      const readableName = `${customPin.lat.toFixed(4)}° N, ${customPin.lng.toFixed(4)}° E`;
                      setLocation(customPin.lat, customPin.lng, readableName);
                      setCustomPin(null);
                      setShowNavigationRoute(false);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:from-emerald-600 hover:to-teal-700 active:scale-[0.97] transition-all cursor-pointer animate-pulse"
                  >
                    Pin as Active Location
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Floating Mobile Toggle Button */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[450] sm:hidden">
            <button
              onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-2xl hover:from-indigo-600 hover:to-purple-700 active:scale-[0.95] transition-all cursor-pointer border border-white/20"
            >
              {mobileView === 'map' ? (
                <>
                  <ListIcon className="h-4 w-4" /> List View
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4" /> Map View
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
