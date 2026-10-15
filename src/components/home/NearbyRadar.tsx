'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Star, ArrowRight } from 'lucide-react';
import { useLocationStore } from '../../lib/store';
import { api } from '../../lib/api';
import { calculateDistance, getProvidersByCategory } from '../../lib/mockData';
import { CITY_COORDINATES } from '../../lib/homeData';
import { motion } from 'framer-motion';

const MapComponent = dynamic(() => import('../MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-[color:var(--color-surface-dim)]/50 rounded-2xl border border-[color:var(--color-outline-variant)]/20">
      <div className="text-center">
        <div className="h-6 w-6 border-2 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-[10px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider animate-pulse">Syncing Satellite Feeds...</p>
      </div>
    </div>
  ),
});

export function NearbyRadar() {
  const { city, latitude, longitude } = useLocationStore();
  const [realServices, setRealServices] = useState<any[]>([]);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  const [selectedNearbyService, setSelectedNearbyService] = useState<any>(null);
  
const cityCenter = useMemo(() => {
    return CITY_COORDINATES[(city || 'Chennai').toLowerCase()] || { lat: 13.0827, lng: 80.2707 };
  }, [city]);

  const mapCenter = useMemo((): [number, number] => {
    if (latitude !== null && longitude !== null) return [latitude, longitude];
    return [cityCenter.lat, cityCenter.lng];
  }, [cityCenter, latitude, longitude]);

  // Reset panned center when city or manual location changes (re-centers the map)
  useEffect(() => {
    setUserPannedCenter(null);
  }, [city, latitude, longitude]);

  const activeMapCenter = useMemo((): [number, number] => {
    return userPannedCenter || mapCenter;
  }, [userPannedCenter, mapCenter]);

  // Fetch real services from NestJS backend near activeMapCenter for homepage radar
  useEffect(() => {
    let active = true;
    const fetchRealServices = async () => {
      try {
        const [lat, lng] = activeMapCenter;
        const response = await api.services.list({
          latitude: String(lat),
          longitude: String(lng),
          radius: '25',
          limit: '20',
        });
        if (active && response && (response as any).data) {
          setRealServices((response as any).data);
        }
      } catch (err) {
        console.warn('Failed to fetch real homepage services:', err);
      }
    };
    fetchRealServices();
    return () => {
      active = false;
    };
  }, [activeMapCenter]);

  // Generate popular nearby merchants dynamically for the homepage map
  const homepageNearbyServices = useMemo(() => {
    const list: any[] = [];

    // 1. First, map and include real services from the database
    const mappedReal = realServices
      .filter((s: any) => s && s.merchant && s.category)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        merchant: s.merchant.name,
        price: `₹${s.basePrice}`,
        rating: s.rating,
        reviews: s.reviewCount,
        category: s.category.name,
        emoji: '🏢',
        lat: s.merchant.latitude,
        lng: s.merchant.longitude,
        address: s.merchant.address || 'Premium verified venue',
        distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], s.merchant.latitude, s.merchant.longitude),
      }));

    list.push(...mappedReal);

    // 2. Next, generate dynamic mock providers (avoiding duplicates)
    const categoriesToMap = [
      { slug: 'doctor', name: 'Hospitals', emoji: '🏥' },
      { slug: 'dining', name: 'Restaurants', emoji: '🍴' },
      { slug: 'salons', name: 'Salons', emoji: '💇' },
      { slug: 'hotels', name: 'Hotels', emoji: '🏨' },
      { slug: 'football-turf', name: 'Sports turfs', emoji: '⚽' }
    ];

    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    categoriesToMap.forEach((cat, idx) => {
      const providers = getProvidersByCategory(cat.slug, cat.name, city);
      if (providers) {
        providers.forEach((p, pIdx) => {
          const seedLat = idx * 17 + pIdx;
          const seedLng = idx * 31 + pIdx * 3;
          // Generate realistic offsets within a local radius (~2 km) around cityCenter
          const lat = cityCenter.lat + (pseudoRandom(seedLat) - 0.5) * 0.022;
          const lng = cityCenter.lng + (pseudoRandom(seedLng) - 0.5) * 0.022;

          const itemVal = {
            id: p.id,
            name: p.name,
            merchant: p.name,
            price: p.price,
            rating: p.rating,
            reviews: p.reviewCount,
            category: cat.name,
            emoji: cat.emoji,
            lat: lat,
            lng: lng,
            address: p.address,
            distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], lat, lng)
          };

          if (!list.some(existing => existing.id === itemVal.id || existing.name === itemVal.name)) {
            list.push(itemVal);
          }
        });
      }
    });

    return list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [city, cityCenter, activeMapCenter, realServices]);

  // Filter state for category pills
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredServices = useMemo(() => {
    // Filter out ugly test names like AC ROOM, __BOKSPOT_GROUP__, etc.
    const cleanList = homepageNearbyServices.filter(s => {
      const n = (s.name || '').toLowerCase();
      return !n.includes('__bokspot') && !n.includes('test luxury') && n !== 'ac room';
    });

    if (selectedCategory === 'All') return cleanList;
    return cleanList.filter(s => s.category?.toLowerCase().includes(selectedCategory.toLowerCase()));
  }, [homepageNearbyServices, selectedCategory]);

  // Default select first item of filtered list
  useEffect(() => {
    if (filteredServices.length > 0) {
      const exists = filteredServices.some(s => s.id === selectedNearbyService?.id);
      if (!exists) {
        setSelectedNearbyService(filteredServices[0]);
      }
    }
  }, [filteredServices, selectedNearbyService]);

  const categories = ['All', 'Turfs', 'Hospitals', 'Restaurants', 'Hotels', 'Salons'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      <section className="mb-12 text-left">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h2 className="text-[19px] sm:text-[21px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                Live Radar & Instant Slots
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                {city || 'Chennai'}
              </span>
            </div>
            <p className="text-[12px] mt-1 text-[color:var(--color-outline)] font-medium">
              Geolocated venues, turf availability & clinic queues within 5 km of you
            </p>
          </div>

          <Link
            href="/maps"
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300 self-start sm:self-auto"
          >
            <span>Full-Screen Radar</span>
            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </Link>
        </div>

        {/* Main Radar Card */}
        <div className="relative rounded-[32px] overflow-hidden border border-[color:var(--color-outline-variant)]/25 bg-[color:var(--color-surface-container)]/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-3 sm:p-5">
          
          {/* Top Quick Filter Capsules */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1 rounded-full text-[11px] font-extrabold transition-all duration-300 shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[color:var(--color-primary)] text-white shadow-md'
                      : 'bg-[color:var(--color-surface-container-high)] text-[color:var(--color-outline)] hover:text-[color:var(--color-on-surface)] hover:bg-[color:var(--color-surface-container-highest)] border border-[color:var(--color-outline-variant)]/30'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            <span className="text-[10px] text-[color:var(--color-outline)] font-bold ml-auto hidden md:inline shrink-0">
              {filteredServices.length} verified venues found
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-4 items-stretch">
            {/* Map Canvas (70% width on desktop) */}
            <div className="lg:col-span-8 h-[360px] sm:h-[400px] rounded-[24px] overflow-hidden border border-[color:var(--color-outline-variant)]/30 shadow-inner relative bg-slate-900">
              <MapComponent
                center={
                  selectedNearbyService && typeof selectedNearbyService.lat === 'number' && typeof selectedNearbyService.lng === 'number'
                    ? [selectedNearbyService.lat, selectedNearbyService.lng]
                    : userPannedCenter || mapCenter || [13.0827, 80.2707]
                }
                zoom={selectedNearbyService ? 16 : 14}
                selectedMarkerId={selectedNearbyService?.id}
                onCenterChange={(lat, lng) => setUserPannedCenter([lat, lng])}
                onMarkerClick={(marker) => {
                  if (selectedNearbyService && selectedNearbyService.id === marker.id) {
                    setSelectedNearbyService(null);
                  } else {
                    const match = filteredServices.find(s => s.id === marker.id);
                    if (match) setSelectedNearbyService(match);
                  }
                }}
                markers={filteredServices.map(svc => ({
                  id: svc.id,
                  name: svc.name,
                  merchant: svc.merchant,
                  lat: svc.lat,
                  lng: svc.lng,
                  emoji: svc.emoji,
                  category: svc.category,
                  price: svc.price,
                  rating: svc.rating,
                  linkUrl: `/service/${svc.id}`
                }))}
              />

              {/* Floating Map Overlay Capsule */}
              <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/75 border border-white/20 text-white text-[11px] font-bold shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live GPS Radar Feed</span>
              </div>
            </div>

            {/* Sensing Feed Sidebar (30% width) */}
            <div className="lg:col-span-4 rounded-[24px] border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container-high)]/50 backdrop-blur-md p-3.5 flex flex-col justify-between h-[360px] sm:h-[400px]">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-[color:var(--color-outline-variant)]/20">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">sensors</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[color:var(--color-on-surface)]">
                    Nearby Venues
                  </span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-2">
                {filteredServices.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[color:var(--color-outline)] font-medium">
                    No active slots in this category.
                  </div>
                ) : (
                  filteredServices.map((svc) => {
                    const isSelected = selectedNearbyService?.id === svc.id;
                    return (
                      <div
                        key={svc.id}
                        onClick={() => setSelectedNearbyService(svc)}
                        className={`p-3 rounded-2xl cursor-pointer border transition-all duration-300 flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[color:var(--color-primary)]/10 border-[color:var(--color-primary)] shadow-sm'
                            : 'bg-[color:var(--color-surface-container)] border-[color:var(--color-outline-variant)]/20 hover:border-[color:var(--color-outline-variant)]/50 hover:bg-[color:var(--color-surface-container-high)]'
                        }`}
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-outline-variant)]/30 flex items-center justify-center text-lg shadow-inner">
                          {svc.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-[12px] text-[color:var(--color-on-surface)] truncate leading-tight">
                            {svc.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[color:var(--color-outline)] font-medium">
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              {svc.rating}
                            </span>
                            <span>•</span>
                            <span className="truncate">
                              {svc.distance ? `${svc.distance.toFixed(1)} km away` : '1.2 km away'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-black text-[color:var(--color-on-surface)] block">
                            {svc.price}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom active venue preview card */}
              {selectedNearbyService && (
                <div className="mt-2.5 pt-2.5 border-t border-[color:var(--color-outline-variant)]/25 flex items-center justify-between gap-3 bg-[color:var(--color-surface-container)]/80 p-2.5 rounded-2xl border border-[color:var(--color-outline-variant)]/20 shadow-sm">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 block">
                      Ready for Booking
                    </span>
                    <h4 className="font-extrabold text-[12px] text-[color:var(--color-on-surface)] truncate">
                      {selectedNearbyService.name}
                    </h4>
                    <p className="text-[11px] font-black text-[color:var(--color-primary)]">
                      {selectedNearbyService.price}
                    </p>
                  </div>
                  <Link
                    href={`/service/${selectedNearbyService.id}`}
                    className="rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-[11px] font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
