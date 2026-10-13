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

  // Default select first item
  useEffect(() => {
    if (homepageNearbyServices.length > 0) {
      // Keep selected item within the list if still matching, otherwise pick first
      const exists = homepageNearbyServices.some(s => s.id === selectedNearbyService?.id);
      if (!exists) {
        setSelectedNearbyService(homepageNearbyServices[0]);
      }
    }
  }, [homepageNearbyServices, selectedNearbyService]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
                {/* Row 6: Nearby Services */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-bold text-[color:var(--color-on-surface)] tracking-tight">Nearby Services Live Radar</h2>
                <p className="text-[12px] mt-0.5 text-[color:var(--color-outline)]">Real-time local tracking and instant slot bookings in {city}</p>
              </div>
              <Link
                href="/maps"
                className="flex items-center gap-1 text-[12px] font-semibold text-[color:var(--color-primary)] hover:gap-2 transition-all duration-300"
              >
                Expand Maps Hub
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-stretch">
              {/* Map Canvas */}
              <div className="lg:col-span-2 h-[380px] rounded-3xl overflow-hidden border border-[color:var(--color-outline-variant)]/30 shadow-2xl relative bg-slate-900/50">
                <MapComponent
                  center={
                    (selectedNearbyService && typeof selectedNearbyService.lat === 'number' && typeof selectedNearbyService.lng === 'number')
                      ? [selectedNearbyService.lat, selectedNearbyService.lng]
                      : (userPannedCenter || mapCenter || [13.0827, 80.2707])
                  }
                  zoom={selectedNearbyService ? 17 : 13}
                  selectedMarkerId={selectedNearbyService?.id}
                  onCenterChange={(lat, lng) => setUserPannedCenter([lat, lng])}
                  onMarkerClick={(marker) => {
                    if (selectedNearbyService && selectedNearbyService.id === marker.id) {
                      setSelectedNearbyService(null);
                    } else {
                      const match = homepageNearbyServices.find(s => s.id === marker.id);
                      if (match) setSelectedNearbyService(match);
                    }
                  }}
                  markers={homepageNearbyServices.map(svc => ({
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
              </div>

              {/* Scrollable list card */}
              <div className="lg:col-span-1 rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 backdrop-blur p-4 flex flex-col justify-between h-[380px] card-glass">
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)] block mb-1">📡 Real-Time Sensing Feed</span>
                  {homepageNearbyServices.map((svc) => {
                    const isSelected = selectedNearbyService?.id === svc.id;
                    return (
                      <div
                        key={svc.id}
                        onClick={() => setSelectedNearbyService(svc)}
                        className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${isSelected
                            ? 'bg-[color:var(--color-primary)]/10 border-[color:var(--color-primary)]'
                            : 'bg-[color:var(--color-surface-dim)]/30 border-[color:var(--color-outline-variant)]/20 hover:bg-[color:var(--color-surface-dim)]/50'
                          }`}
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-outline-variant)]/30 flex items-center justify-center text-xl">
                          {svc.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-xs text-[color:var(--color-on-surface)] truncate leading-tight">{svc.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[color:var(--color-on-surface-variant)]">
                            <span className="font-bold flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" /> {svc.rating}</span>
                            <span>•</span>
                            <span className="font-medium">📍 {svc.distance ? `${svc.distance.toFixed(1)} km` : '1.2 km'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom preview detail card */}
                {selectedNearbyService && (
                  <div className="mt-3 border-t border-[color:var(--color-outline-variant)]/20 pt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-[color:var(--color-on-surface)] truncate">{selectedNearbyService.name}</h4>
                      <p className="text-[10px] text-[color:var(--color-primary)] font-bold mt-0.5">{selectedNearbyService.price}</p>
                    </div>
                    <Link
                      href={`/service/${selectedNearbyService.id}`}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3.5 py-2 text-[10px] uppercase font-bold text-white shadow hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all flex items-center gap-1 shrink-0"
                    >
                      Book <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

    </motion.div>
  );
}
