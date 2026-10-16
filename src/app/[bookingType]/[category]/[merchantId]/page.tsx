'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Clock, CheckCircle2, ChevronRight, ChevronLeft, Info, ShieldCheck, Search, Users, Utensils, X, Calendar, Bed, Star, Heart, Check, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocationStore, useBookingFlowStore } from '@/lib/store';

const CATEGORY_NAMES: Record<string, string> = {
  // Travel & Transport
  flights: 'Flight Booking', trains: 'Train Booking', buses: 'Bus Booking', ferry: 'Ferry / Boat Booking', shuttle: 'Shuttle / Van Booking', helicopter: 'Helicopter Booking', cabs: 'Cab / Taxi Booking', 'bike-rental': 'Bike Rental', 'car-rental': 'Self-Drive Car Rental',
  // Stay & Accommodation
  hotels: 'Hotel Booking', resorts: 'Resort Booking', villas: 'Homestay / Villa', hostels: 'Hostel Booking', camping: 'Camping Booking',
  // Entertainment & Events
  movies: 'Cinema / Movie Tickets', theatre: 'Theatre Shows', concerts: 'Concert Tickets', events: 'Events & Festivals', exhibitions: 'Exhibition Entry', workshops: 'Workshops / Classes', gaming: 'Gaming Arena Booking',
  // Sports & Turf
  'football-turf': 'Football Turf', 'cricket-ground': 'Cricket Ground', badminton: 'Badminton Court', tennis: 'Tennis Court', basketball: 'Basketball Court', swimming: 'Swimming Pool Slots', 'play-arena': 'Indoor Play Arena',
  // Lifestyle & Local Services
  dining: 'Restaurant Table Reservation', salons: 'Salon / Spa Appointment', 'gym-yoga': 'Gym / Yoga Slot Booking', doctor: 'Doctor Appointment', electrician: 'Electrician Booking', plumber: 'Plumber Booking', cleaning: 'Cleaning Service', technician: 'Technician Service', studio: 'Studio Booking',
  // Business & Professional
  coworking: 'Co-working Space', 'meeting-room': 'Meeting Room', podcast: 'Podcast Studio', conference: 'Conference Hall', training: 'Training Sessions',
  // Religious Services
  darshan: 'Temple Darshan Booking', pooja: 'Pooja Slot Booking', pilgrimage: 'Pilgrimage Packages',
  // Rental & Equipment Booking
  'cycle-rental': 'Cycle Rental', 'sports-bike': 'Sports Bike Rental', camera: 'Camera Rental', 'sound-system': 'Sound System Rental', 'event-equip': 'Event Equipment Rental',
  // Personal & Miscellaneous Services
  'pet-grooming': 'Pet Grooming Appointment', babysitting: 'Babysitting Service', 'elder-care': 'Elder Care Service', 'event-organizer': 'Event Organizer Booking'
};

export default function VenueProfilePage() {
  const params = useParams();
  const router = useRouter();
  const bookingType = params?.bookingType as string;
  const category = params?.category as string;
  const merchantId = params?.merchantId as string;
  const { city } = useLocationStore();
  const { setSelectedService, setSelectedSlot } = useBookingFlowStore();
  const searchParams = useSearchParams();
  const isHotel = category === 'hotels' || category === 'resorts' || category === 'villas' || category === 'hostels' || category === 'camping' || bookingType === 'stay-accommodation';

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 2);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(searchParams?.get('checkIn') || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams?.get('checkOut') || tomorrowStr);
  const [adults, setAdults] = useState(Number(searchParams?.get('adults')) || 2);
  const [children, setChildren] = useState(Number(searchParams?.get('children')) || 0);
  const [childAges, setChildAges] = useState<number[]>(() => {
    try {
      const q = searchParams?.get('childAges');
      return q ? JSON.parse(decodeURIComponent(q)) : [];
    } catch { return []; }
  });
  const [rooms, setRooms] = useState(Number(searchParams?.get('rooms')) || 1);
  const [pets, setPets] = useState(searchParams?.get('pets') === 'true');
  const [petCount, setPetCount] = useState<number>(Number(searchParams?.get('petCount')) || 0);

  // Compute stay duration in nights
  const nights = React.useMemo(() => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, [checkIn, checkOut]);

  const [liveServices, setLiveServices] = useState<any[]>([]);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // ── Hotel Interactive Room Details & Add-ons Flow States ──
  const [activeRoomService, setActiveRoomService] = useState<any | null>(null);
  const [roomModalStep, setRoomModalStep] = useState<'DETAILS' | 'ADDONS' | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [roomModalImageIdx, setRoomModalImageIdx] = useState(0);

  const [isSaved, setIsSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isEditSearchOpen, setIsEditSearchOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch full merchant details for the Venue Profile (About, Gallery, Amenities)
        // If merchantId is the dummy megamerchant, we just fall back, but for real merchants this will get the filled details.
        let mData = null;
        if (merchantId !== '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e') {
          try {
            mData = await api.merchants.get(merchantId);
          } catch (e) {
            console.warn('Could not fetch merchant:', e);
          }
        }
        
        const res = await api.services.list({});
        if (active && res && res.data) {
          const merchantServices = res.data.filter((s: any) => {
            const isMatchMerchant = (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId));
            
            let isMatchType = true;
            if (merchantId === '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e') {
              const bType = bookingType.toLowerCase();
              const typeKeywords = (bType.includes('stay') || bType.includes('hotel') || bType.includes('accommodation') || bType.includes('room')) ? ['hotel', 'room', 'resort', 'accommodation', 'stay'] :
                                   (bType.includes('sports') || bType.includes('turf') || bType.includes('play')) ? ['turf', 'cricket', 'football', 'badminton', 'tennis', 'court', 'sport', 'ground', 'ball'] :
                                   (bType.includes('health') || bType.includes('doctor') || bType.includes('clinic') || bType.includes('medical')) ? ['doctor', 'clinic', 'dental', 'medical', 'appointment', 'health'] :
                                   (bType.includes('dine') || bType.includes('food') || bType.includes('restaurant')) ? ['restaurant', 'dining', 'food', 'table', 'dine'] : 
                                   (bType.includes('salon') || bType.includes('spa') || bType.includes('beauty') || bType.includes('care')) ? ['salon', 'spa', 'beauty', 'hair', 'massage', 'care'] :
                                   (bType.includes('event') || bType.includes('party') || bType.includes('hall')) ? ['event', 'party', 'hall', 'wedding', 'banquet'] : [];
                                   
              if (typeKeywords.length > 0) {
                const catName = (s.category || '').toLowerCase();
                const svcName = (s.name || '').toLowerCase();
                const catSlug = (s.categoryObj?.slug || '').toLowerCase();
                isMatchType = typeKeywords.some(kw => catName.includes(kw) || svcName.includes(kw) || catSlug.includes(kw));
              }
            } else {
              const expectedCategoryName = CATEGORY_NAMES[category];
              if (expectedCategoryName) {
                isMatchType = s.category === expectedCategoryName || s.categoryObj?.slug === category;
              }
            }
            return isMatchMerchant && isMatchType;
          });
          setLiveServices(merchantServices);
          if (mData) {
            setMerchantData((mData as any).data || mData);
          } else if (merchantServices.length > 0) {
            setMerchantData(merchantServices[0].merchantObj || {});
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    fetchData();
    return () => { active = false; };
  }, [merchantId, bookingType]);

  const venueName = liveServices.length > 0 ? (liveServices[0].merchantObj?.name || liveServices[0].merchant || 'Venue') : 'Loading...';
  const address = liveServices.length > 0 ? (liveServices[0].merchantObj?.address || `${city || 'Chennai'}`) : '';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div><p>Loading Venue...</p></div></div>;
  }

  if (liveServices.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><p>Venue not found or has no services.</p></div>;
  }

  // Luxury fallback photos only if hotel hasn't uploaded any photos yet
  const defaultHotelPhotos = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40eb0d8e73?w=800&q=80',
    'https://images.unsplash.com/photo-1522771731478-44bc10b49cb3?w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
  ];

  const finalMerchantObj = merchantData || liveServices[0]?.merchantObj || {};
  
  // Extract and clean real images from merchant object and room services
  const extractedImages: string[] = [];
  const addIfValid = (url: any) => {
    if (typeof url === 'string' && url.trim().length > 0 && !extractedImages.includes(url)) {
      // Do not include UI screenshots or system placeholders as hotel photos
      if (!url.startsWith('blob:') && !url.includes('screenshot') && !url.includes('data:image')) {
        extractedImages.push(url.trim());
      }
    }
  };

  (finalMerchantObj.images || []).forEach(addIfValid);
  liveServices.forEach((svc: any) => {
    addIfValid(svc.imageUrl);
    addIfValid(svc.image);
    (svc.metadata?.images || []).forEach(addIfValid);
    (svc.rawConfig?.metadata?.listings || []).forEach((l: any) => addIfValid(l.imageUrl));
  });

  // Provide curated high-res hotel photos if no custom images exist
  const galleryImages: string[] = extractedImages.length > 0 
    ? extractedImages 
    : defaultHotelPhotos;

  const aboutText = finalMerchantObj.description || liveServices[0]?.rawConfig?.description;
  const amenities = finalMerchantObj.amenities || [];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b10] text-slate-800 dark:text-slate-100 pb-32 transition-colors">
      {/* Top Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f1219]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#033266] dark:text-[#ff6325] font-bold">
                {bookingType.replace('-', ' ')} • {city || 'Chennai'}
              </span>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md">
                {venueName}
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-white/10"
              title="Share hotel"
            >
              <span className="text-xs">🔗</span>
              <span className="hidden sm:inline">{copiedShare ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                isSaved 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400' 
                  : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Save to favorites"
            >
              <Heart size={14} className={isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-400'} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ============================================================
         * SECTION A: HOTEL HEADER
         * ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-2">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] text-[11px] font-bold flex items-center gap-1 border border-[#033266]/20 dark:border-[#ff6325]/30">
                <span>✓</span> BokSpot Verified Stay
              </span>
              <div className="flex items-center text-amber-500 text-xs font-black tracking-widest">
                ★★★★☆
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">• 4-Star Luxury Property</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {venueName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="text-[#033266] dark:text-[#ff6325]">📍</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{address || `${city || 'Chennai'}, Tamil Nadu`}</span>
              <span>•</span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || venueName || 'Chennai')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#033266] dark:text-[#ff6325] font-bold hover:underline"
              >
                Show on map
              </a>
            </div>
          </div>

          {/* Review Score Badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#0f1219] p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs self-start md:self-auto shrink-0">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Very Good</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">324 verified reviews</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#033266] dark:bg-[#ff6325] text-white flex items-center justify-center font-black text-sm shadow-sm">
              4.8
            </div>
          </div>
        </div>

        {/* ============================================================
         * SECTION B: PREMIUM PHOTO GALLERY (Desktop Dynamic Bento & Mobile)
         * ============================================================ */}
        <div className="mb-8">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-slate-900">
            {/* Desktop View: Adapts intelligently to image count */}
            <div className="hidden md:block h-[420px] p-2.5">
              {galleryImages.length === 1 ? (
                <div 
                  onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
                  className="w-full h-full relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
                >
                  <img 
                    src={galleryImages[0]} 
                    alt={`${venueName} primary photo`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                    onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : galleryImages.length <= 3 ? (
                <div className="grid grid-cols-2 gap-2.5 h-full">
                  <div 
                    onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200 h-full"
                  >
                    <img 
                      src={galleryImages[0]} 
                      alt={`${venueName} photo 1`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                    />
                  </div>
                  <div className="grid grid-rows-2 gap-2.5 h-full">
                    {[1, 2].slice(0, galleryImages.length - 1).map((idx) => (
                      <div 
                        key={idx}
                        onClick={() => { setCurrentImageIdx(idx); setIsGalleryOpen(true); }}
                        className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200 h-full"
                      >
                        <img 
                          src={galleryImages[idx]} 
                          alt={`${venueName} photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          onError={(e) => { e.currentTarget.src = defaultHotelPhotos[idx % defaultHotelPhotos.length]; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Standard 5-Photo Bento Grid (1 large primary + 4 supporting) */
                <div className="grid grid-cols-4 grid-rows-2 gap-2.5 h-full">
                  <div 
                    onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
                    className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
                  >
                    <img 
                      src={galleryImages[0]} 
                      alt={`${venueName} primary photo`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {galleryImages.slice(1, 5).map((imgUrl, idx) => (
                    <div 
                      key={idx + 1}
                      onClick={() => { setCurrentImageIdx(idx + 1); setIsGalleryOpen(true); }}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${venueName} preview ${idx + 2}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => { e.currentTarget.src = defaultHotelPhotos[(idx + 1) % defaultHotelPhotos.length]; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Carousel / Scrollable View */}
            <div className="md:hidden relative h-64 w-full">
              <img 
                src={galleryImages[currentImageIdx] || galleryImages[0]} 
                alt={venueName} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white border border-white/20 text-xs shadow-md"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white border border-white/20 text-xs shadow-md"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold">
                    {currentImageIdx + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {/* "See All Photos" CTA Floating Button */}
            <button
              onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
              className="absolute bottom-5 right-5 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg border border-slate-200/80 dark:border-white/10 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span>📷</span>
              <span>See all {galleryImages.length} photos</span>
            </button>
          </div>
        </div>

        {/* ============================================================
         * SECTION C: STAY DETAILS SUMMARY BAR & EDIT SEARCH
         * ============================================================ */}
        {isHotel && (
          <div className="mb-8">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 text-xs">
                {/* Stay Dates */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Dates & Nights
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-[#033266] dark:text-[#ff6325] font-bold ml-1.5 px-2 py-0.5 rounded-md bg-[#033266]/10 dark:bg-[#ff6325]/15">
                      {nights} Night{nights > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />

                {/* Occupancy */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Guests & Units
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {adults + children} Guest{adults + children > 1 ? 's' : ''} ({adults} Adults{children > 0 ? `, ${children} Children` : ''}) • {rooms} Room{rooms > 1 ? 's' : ''}
                    </span>
                    {(pets || petCount > 0) && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold ml-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                        🐾 {petCount || 1} Pet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsEditSearchOpen(!isEditSearchOpen)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
                >
                  {isEditSearchOpen ? 'Close Editor' : 'Edit Search'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('available-rooms-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Select Room</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Quick Inline Date / Occupancy Editor */}
            {isEditSearchOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-4 bg-white dark:bg-[#0f1219] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs"
              >
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white outline-none focus:border-[#033266] dark:focus:border-[#ff6325]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white outline-none focus:border-[#033266] dark:focus:border-[#ff6325]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Adults & Rooms</label>
                  <div className="flex gap-2">
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 font-bold text-slate-900 dark:text-white outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="dark:bg-slate-800 dark:text-white">{n} Adult{n > 1 ? 's' : ''}</option>)}
                    </select>
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(Number(e.target.value))}
                      className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 font-bold text-slate-900 dark:text-white outline-none"
                    >
                      {[1, 2, 3, 4].map(n => <option key={n} value={n} className="dark:bg-slate-800 dark:text-white">{n} Room{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setIsEditSearchOpen(false)}
                    className="w-full py-2 bg-[#033266] dark:bg-[#ff6325] text-white rounded-xl font-bold hover:bg-[#022349] dark:hover:bg-[#e04e13] transition-colors cursor-pointer"
                  >
                    Apply Dates
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ============================================================
         * SECTION D1: HOTEL HIGHLIGHTS (Amenities, Check-in, Breakfast)
         * ============================================================ */}
        {Boolean(
          (amenities && amenities.length > 0) ||
          liveServices[0]?.rawConfig?.isTimingEnabled ||
          liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasAC ||
          liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasWiFi ||
          liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasBreakfast
        ) && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Property Highlights & Key Inclusions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Connectivity</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">Free High-Speed Wi-Fi</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Check-in / Out</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {liveServices[0]?.rawConfig?.timingDetails || 'Flexible Check-in'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Locality</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {city || 'Prime Location'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                  <span>🛡️</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Trust & Safety</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">Verified Partner</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
         * SECTION D2: ABOUT HOTEL & LOCATION OVERVIEW (Two-Column Layout)
         * ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          {/* About & Amenities Column */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white dark:bg-[#0f1219] rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">About {venueName}</h2>
                <span className="text-[10px] font-bold text-[#033266] dark:text-[#ff6325] bg-[#033266]/10 dark:bg-[#ff6325]/15 px-2.5 py-0.5 rounded-full border border-[#033266]/20 dark:border-[#ff6325]/30">
                  Verified Stay
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {aboutText 
                  ? (isAboutExpanded || aboutText.length <= 220 ? aboutText : `${aboutText.slice(0, 220)}...`)
                  : `${venueName} provides comfortable, well-curated rooms designed for modern business travelers, tourists, and families visiting ${city || 'the area'}.`}
              </p>
              {aboutText && aboutText.length > 220 && (
                <button
                  type="button"
                  onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                  className="mt-2 text-xs font-bold text-[#033266] dark:text-[#ff6325] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{isAboutExpanded ? 'Show less' : 'Read more &rarr;'}</span>
                </button>
              )}
            </div>

            {/* Popular Amenities Pills */}
            {amenities && amenities.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/10">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Featured Amenities
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {amenities.slice(0, 6).map((amenity: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} className="text-[#033266] dark:text-[#ff6325]" /> {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location & Map Preview Column */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0f1219] rounded-3xl p-5 border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Location & Area</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{city || 'Chennai'}</span>
              </div>
              {address && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2.5 flex items-center gap-1">
                  <MapPin size={13} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                  <span>{address}</span>
                </p>
              )}

              {/* Embedded Google Map Preview */}
              {(() => {
                const lat = finalMerchantObj.latitude || liveServices[0]?.merchantObj?.latitude;
                const lng = finalMerchantObj.longitude || liveServices[0]?.merchantObj?.longitude;
                const mapQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(address || venueName || 'Chennai');

                return (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative bg-slate-100 dark:bg-slate-800">
                    <div className="h-44 sm:h-48 w-full relative">
                      <iframe
                        title="Property Location Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[170px]">
                        {venueName}
                      </span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] font-bold text-[#033266] dark:text-[#ff6325] hover:underline shrink-0"
                      >
                        View on Map &rarr;
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Nearby Landmarks if available */}
            {Array.isArray(finalMerchantObj.metadata?.aroundProperty) && finalMerchantObj.metadata.aroundProperty.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {finalMerchantObj.metadata.aroundProperty.slice(0, 3).map((item: any, idx: number) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span>📍</span> {item.name || item.title} ({item.distance || ''})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
         * SECTION D3: AVAILABLE ROOM CATEGORIES
         * ============================================================ */}
        <div id="available-rooms-section" className="space-y-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Available Room Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All rooms include clean linens, ensuite bathroom, and standard hotel hospitality.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] rounded-full border border-[#033266]/20 dark:border-[#ff6325]/30 self-start sm:self-auto">
              {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length} Types Available
            </span>
          </div>

          {/* Rooms List */}
          <div className="space-y-4">
            {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center bg-white dark:bg-[#0f1219] shadow-xs">
                No specific rooms have been listed by the property yet.
              </p>
            ) : (
              liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').map((svc, sIdx) => {
                const listings = svc.rawConfig?.metadata?.listings || svc.metadata?.listings || [];
                const startingPrice = Number(svc.price || svc.basePrice || svc.rawConfig?.basePrice || listings[0]?.price) || 2200;
                const stayTotal = startingPrice * nights * rooms;
                const primaryListing = listings[0] || {};
                const primaryMeta = primaryListing.metadata || svc.metadata || {};
                const maxGuests = primaryMeta.maxGuests || 2;
                const bedType = primaryMeta.bedType;
                const roomSize = primaryMeta.sizeSqFt || primaryMeta.roomSize;
                const bathroomType = primaryMeta.bathroomType;
                const perks = Array.isArray(primaryMeta.perks) ? primaryMeta.perks : (primaryMeta.perks ? [primaryMeta.perks] : []);
                const roomAmenities = Array.isArray(primaryMeta.amenities) ? primaryMeta.amenities : [];
                
                // Pick valid image, exclude generic screenshot data urls
                const rawThumb = svc.imageUrl || svc.image || svc.metadata?.mainImageUrl || svc.metadata?.images?.[0] || listings[0]?.imageUrl;
                const thumb = (rawThumb && !rawThumb.includes('screenshot') && !rawThumb.startsWith('blob:')) 
                  ? rawThumb 
                  : defaultHotelPhotos[sIdx % defaultHotelPhotos.length];

                const isNonAc = svc.name?.toLowerCase().includes('non ac') || svc.name?.toLowerCase().includes('non-ac');

                return (
                  <div 
                    key={svc.id || sIdx}
                    className="bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 hover:border-[#033266]/30 dark:hover:border-[#ff6325]/40 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                      {/* Room Photo */}
                      <div 
                        onClick={() => {
                          setActiveRoomService(svc);
                          setRoomModalStep('DETAILS');
                          setSelectedAddonIds([]);
                          setRoomModalImageIdx(0);
                        }}
                        className="lg:col-span-4 h-52 sm:h-56 rounded-2xl overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 shrink-0"
                      >
                        <img 
                          src={thumb} 
                          alt={svc.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                        />
                        <div className="absolute top-2.5 left-2.5 bg-[#033266]/90 dark:bg-[#ff6325]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                          {listings.length > 0 ? `${listings.length} Unit Options` : 'Instant Reserve'}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-bold">
                          View Specs &rarr;
                        </div>
                      </div>

                      {/* Room Details & Specifications */}
                      <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 
                            onClick={() => {
                              setActiveRoomService(svc);
                              setRoomModalStep('DETAILS');
                              setSelectedAddonIds([]);
                              setRoomModalImageIdx(0);
                            }}
                            className="font-black text-lg text-slate-900 dark:text-white hover:text-[#033266] dark:hover:text-[#ff6325] cursor-pointer transition-colors"
                          >
                            {svc.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {svc.description || primaryListing.description || 'Spacious and welcoming accommodation with comfortable bedding, clean linens, and private ensuite bathroom.'}
                          </p>
                        </div>

                        {/* Specs Pills: Bed, Capacity, Size, Bathroom (Render if available) */}
                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                            <Users size={13} className="text-[#033266] dark:text-[#ff6325]" /> Fits {maxGuests} Adults
                          </span>
                          {bedType && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                              <Bed size={13} className="text-[#033266] dark:text-[#ff6325]" /> {bedType}
                            </span>
                          )}
                          {roomSize && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                              <span>📐</span> {roomSize} sq.ft
                            </span>
                          )}
                          {bathroomType && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                              <span>🚿</span> {bathroomType}
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                            <span>{isNonAc ? '💨' : '❄️'}</span> {isNonAc ? 'Natural Airflow / Fan' : 'Air Conditioned'}
                          </span>
                        </div>

                        {/* Inclusions & Business Perks Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                          {perks.length > 0 ? (
                            perks.map((perk: string, pIdx: number) => (
                              <span key={pIdx} className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900/50 flex items-center gap-1">
                                🎁 {perk}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                                ✓ Free Wi-Fi
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                                ✓ Free Cancellation (24h before)
                              </span>
                            </>
                          )}
                          {roomAmenities.slice(0, 2).map((am: string, aIdx: number) => (
                            <span key={aIdx} className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-white/10">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Column & Booking Actions */}
                      <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 pt-4 lg:pt-0 lg:pl-6 gap-3">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                            Price per night
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black text-[#033266] dark:text-[#ff6325]">
                              ₹{startingPrice.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold block mt-1">
                            Total stay: <strong className="text-slate-900 dark:text-white">₹{stayTotal.toLocaleString()}</strong> ({nights}N)
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                            + taxes & fees included
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRoomService(svc);
                              setRoomModalStep('DETAILS');
                              setSelectedAddonIds([]);
                              setRoomModalImageIdx(0);
                            }}
                            className="px-5 py-2.5 bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Select Room &rarr;</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveRoomService(svc);
                              setRoomModalStep('DETAILS');
                              setSelectedAddonIds([]);
                              setRoomModalImageIdx(0);
                            }}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>View Details</span>
                            <Info size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================
         * SECTION E: HOUSE RULES & PROPERTY POLICIES
         * ============================================================ */}
        {finalMerchantObj.metadata?.policies && finalMerchantObj.metadata.policies.length > 0 && (
          <div className="mt-10 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span>📋</span> House Rules & Stay Policies
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              {finalMerchantObj.metadata.policies.map((policy: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-white/5">
                  <span className="text-[#033266] dark:text-[#ff6325] font-bold">•</span>
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[color:var(--color-surface)] rounded-3xl shadow-2xl z-[99999] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[color:var(--color-outline-variant)]/20">
                <h2 className="text-2xl font-extrabold">Select Category</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').map(svc => {
                     const numOptions = svc.rawConfig?.metadata?.listings ? svc.rawConfig.metadata.listings.length : 1;
                     return (
                       <button
                         key={svc.id}
                         onClick={() => router.push(`/service/${svc.id}`)}
                         className="flex flex-col text-left p-6 rounded-2xl border border-[color:var(--color-outline-variant)]/30 hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5 transition-all group"
                       >
                         <h3 className="text-lg font-bold mb-2 group-hover:text-[color:var(--color-primary)] transition-colors">
                           {svc.name}
                         </h3>
                         <p className="text-sm text-[color:var(--color-on-surface-variant)] font-medium">{numOptions} option{numOptions !== 1 ? 's' : ''}</p>
                       </button>
                     );
                  })}
                  {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length === 0 && (
                    <p className="text-sm text-[color:var(--color-on-surface-variant)] italic p-4 col-span-2 text-center">No specific categories have been added by the business yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Gallery Header */}
            <div className="flex items-center justify-between p-4 md:p-6 text-white absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h3 className="font-bold">{venueName}</h3>
                  <p className="text-xs text-white/60">{currentImageIdx + 1} / {galleryImages.length}</p>
                </div>
              </div>
              <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Main Image Viewer */}
            <div className="flex-1 flex items-center justify-center relative px-4 md:px-12 mt-16 md:mt-0">
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => prev === 0 ? galleryImages.length - 1 : prev - 1); }}
                className="absolute left-2 md:left-6 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors border border-white/10 z-10"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="w-full max-w-5xl max-h-[70vh] flex items-center justify-center">
                <motion.img 
                  key={currentImageIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={galleryImages[currentImageIdx]} 
                  alt="Gallery image" 
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => prev === galleryImages.length - 1 ? 0 : prev + 1); }}
                className="absolute right-2 md:right-6 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors border border-white/10 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="p-4 md:p-6 bg-black/50 border-t border-white/10 overflow-x-auto">
              <div className="flex items-center gap-3 w-max mx-auto px-4">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all ${currentImageIdx === idx ? 'ring-2 ring-white scale-105 opacity-100' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE HOTEL ROOM DETAILS & ADD-ONS WORKFLOW MODAL ── */}
      <AnimatePresence>
        {activeRoomService && roomModalStep && (
          <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              className="w-full sm:max-w-2xl md:max-w-3xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92vh] sm:h-auto sm:max-h-[88vh]"
            >
              {/* Modal Top Header with Stepper Indicator */}
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-3.5">
                  {roomModalStep === 'ADDONS' && (
                    <button
                      type="button"
                      onClick={() => setRoomModalStep('DETAILS')}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs"
                      title="Back to Room Details"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border border-[#033266]/20 dark:border-[#ff6325]/30">
                        {roomModalStep === 'DETAILS' ? 'Step 1 of 2: Room Overview' : 'Step 2 of 2: Customize Stay (Add-ons)'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white mt-1.5 tracking-tight">
                      {activeRoomService.name || 'Room Details'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRoomService(null);
                    setRoomModalStep(null);
                  }}
                  className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {(() => {
                  const roomListings = activeRoomService.rawConfig?.metadata?.listings || activeRoomService.metadata?.listings || [];
                  const roomMeta = roomListings[0]?.metadata || activeRoomService.metadata || {};
                  const roomPrice = Number(activeRoomService.price || activeRoomService.basePrice || roomListings[0]?.price) || 2500;
                  const roomTotal = roomPrice * nights * rooms;

                  // Curated room gallery
                  const roomPhotos = [
                    activeRoomService.imageUrl || activeRoomService.metadata?.mainImageUrl || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=80',
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80'
                  ];

                  // Check if hotel partner has custom add-ons saved in this listing
                  const partnerListingAddons = Array.isArray(roomMeta.addons) ? roomMeta.addons : [];
                  
                  // Curated hotel add-ons available for this room merged with business partner add-ons
                  const availableAddonsList = [
                    ...partnerListingAddons.map((pa: any, pIdx: number) => ({
                      id: `custom-addon-${pIdx}`,
                      name: pa.name,
                      desc: 'Custom enhancement offered directly by hotel partner',
                      price: Number(pa.price) || 0,
                      tag: 'Partner Exclusive',
                      icon: '✨'
                    })),
                    {
                      id: 'addon-breakfast',
                      name: 'Daily Chef Buffet Breakfast',
                      desc: 'Full morning spread at hotel restaurant for all guests',
                      price: 350 * nights * (adults + children),
                      tag: 'Most Popular',
                      icon: '🍳'
                    },
                    {
                      id: 'addon-early-checkin',
                      name: 'Guaranteed Early Check-in (10:00 AM)',
                      desc: 'Early room readiness with welcome beverage on arrival',
                      price: 499,
                      tag: 'Convenience',
                      icon: '🕒'
                    },
                    {
                      id: 'addon-airport-pickup',
                      name: 'Private Sedan Airport / Station Pickup',
                      desc: 'Chauffeur driven AC cab directly to hotel lobby',
                      price: 799,
                      tag: 'Stress-free',
                      icon: '🚗'
                    },
                    {
                      id: 'addon-cake',
                      name: 'Celebration Bouquet & Cake Setup',
                      desc: 'Fresh flower arrangement & Dutch chocolate cake in room',
                      price: 599,
                      tag: 'Special Occasion',
                      icon: '🎂'
                    }
                  ];

                  const addonsTotalSum = selectedAddonIds.reduce((sum, id) => {
                    const found = availableAddonsList.find(a => a.id === id);
                    return sum + (found?.price || 0);
                  }, 0);

                  const finalCalculatedPayable = roomTotal + addonsTotalSum;

                  if (roomModalStep === 'DETAILS') {
                    return (
                      <div className="space-y-5">
                        {/* Room Image Carousel / Hero */}
                        <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 group shrink-0">
                          <img
                            src={roomPhotos[roomModalImageIdx] || roomPhotos[0]}
                            alt={activeRoomService.name}
                            className="w-full h-full object-cover transition-transform duration-300"
                            onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                          {/* Image Switcher Pills */}
                          {roomPhotos.length > 1 && (
                            <div className="absolute bottom-3 left-3 flex gap-2">
                              {roomPhotos.map((_, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setRoomModalImageIdx(pIdx)}
                                  className={`h-2 rounded-full transition-all cursor-pointer ${
                                    roomModalImageIdx === pIdx ? 'w-6 bg-[#033266] dark:bg-[#ff6325]' : 'w-2 bg-white/70'
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#033266] dark:bg-[#ff6325] text-white text-xs font-bold shadow-sm">
                            ₹{roomPrice.toLocaleString()} / night
                          </div>
                        </div>

                        {/* Room Specs Badges (Render only available fields) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Capacity</span>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                              <Users size={13} className="text-[#033266] dark:text-[#ff6325]" />
                              <span>Max {roomMeta.maxGuests || 2} Adults</span>
                            </span>
                          </div>

                          {roomMeta.bedType && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Bed Setup</span>
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                <Bed size={13} className="text-[#033266] dark:text-[#ff6325]" />
                                <span>{roomMeta.bedType}</span>
                              </span>
                            </div>
                          )}

                          {(roomMeta.sizeSqFt || roomMeta.roomSize) && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Room Size</span>
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                <span>📐</span>
                                <span>{roomMeta.sizeSqFt || roomMeta.roomSize} sq.ft</span>
                              </span>
                            </div>
                          )}

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Cooling</span>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                              <span>❄️</span>
                              <span>{activeRoomService.name?.toLowerCase().includes('non ac') ? 'Natural Airflow / Fan' : 'Air Conditioned'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Room Description */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Room Description
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-white/10">
                            {activeRoomService.description ||
                              'Well-appointed room featuring comfortable bedding, attached ensuite bathroom with hot/cold shower, and standard hotel essentials.'}
                          </p>
                        </div>

                        {/* Inclusions & Amenities Checklist */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Included In This Room
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 font-semibold">
                              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Free High-Speed Wi-Fi</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 font-semibold">
                              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Free Cancellation (up to 24h before)</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                              <CheckCircle2 size={15} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span>Private Attached Bathroom</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                              <CheckCircle2 size={15} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span>Fresh Linens & Bath Toiletries</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                              <CheckCircle2 size={15} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span>Drinking Water & Electric Kettle</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                              <CheckCircle2 size={15} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span>Daily Housekeeping & Assistance</span>
                            </div>
                          </div>
                        </div>

                        {/* Selected Dates Review Banner */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Selected Stay</span>
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {checkIn} &rarr; {checkOut} ({nights} Night{nights > 1 ? 's' : ''})
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              {adults} Adults{children > 0 ? `, ${children} Children` : ''} • {rooms} Room{rooms > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Room Total</span>
                            <span className="font-black text-[#033266] dark:text-[#ff6325] text-base">
                              ₹{roomTotal.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                              Taxes & fees included
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // ── STEP 2: ADD-ONS SELECTION ──
                  if (roomModalStep === 'ADDONS') {
                    return (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-2xl bg-[#033266]/5 dark:bg-[#ff6325]/10 border border-[#033266]/15 dark:border-[#ff6325]/20 flex items-center gap-3">
                          <span className="text-2xl">✨</span>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Enhance Your Stay</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              Choose optional upgrades below, or click <strong>Skip Add-ons</strong> to continue directly to checkout.
                            </p>
                          </div>
                        </div>

                        {/* Add-ons List */}
                        <div className="space-y-2.5">
                          {availableAddonsList.map(addon => {
                            const isSelected = selectedAddonIds.includes(addon.id);
                            return (
                              <div
                                key={addon.id}
                                onClick={() => {
                                  setSelectedAddonIds(prev =>
                                    prev.includes(addon.id)
                                      ? prev.filter(x => x !== addon.id)
                                      : [...prev, addon.id]
                                  );
                                }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  isSelected
                                    ? 'bg-[#033266]/5 dark:bg-[#ff6325]/10 border-[#033266] dark:border-[#ff6325] shadow-xs'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
                                    {addon.icon}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                        {addon.name}
                                      </h5>
                                      {addon.tag && (
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border border-[#033266]/20 dark:border-[#ff6325]/30">
                                          {addon.tag}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                      {addon.desc}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right">
                                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                                      +₹{addon.price.toLocaleString()}
                                    </span>
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                      isSelected
                                        ? 'bg-[#033266] dark:bg-[#ff6325] border-[#033266] dark:border-[#ff6325] text-white'
                                        : 'border-slate-300 dark:border-white/20 bg-white dark:bg-slate-700'
                                    }`}
                                  >
                                    {isSelected && <Check size={12} />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Live Total Calculation Preview */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs mt-4">
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                              Base Room ({nights}N) + {selectedAddonIds.length} Add-on{selectedAddonIds.length === 1 ? '' : 's'}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 text-xs">
                              ₹{roomTotal.toLocaleString()} + ₹{addonsTotalSum.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Final Total</span>
                            <span className="text-base font-black text-[#033266] dark:text-[#ff6325]">
                              ₹{finalCalculatedPayable.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

              {/* Modal Bottom Action Bar */}
              <div className="px-6 py-4.5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                {roomModalStep === 'DETAILS' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRoomService(null);
                        setRoomModalStep(null);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
                    >
                      Back to Rooms
                    </button>

                    <button
                      type="button"
                      onClick={() => setRoomModalStep('ADDONS')}
                      className="px-6 py-2.5 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <span>Choose This Room &rarr;</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        // Skip Addons: directly execute checkout payload with empty addons
                        const roomPrice = Number(activeRoomService.price || activeRoomService.basePrice) || 2500;
                        const roomTotal = roomPrice * nights * rooms;
                        const slotStr = `${checkIn} to ${checkOut} (${nights} Night${nights > 1 ? 's' : ''}) • ${adults + children} Guests • ${rooms} Room${rooms > 1 ? 's' : ''}`;

                        setSelectedService({
                          ...activeRoomService,
                          price: roomTotal,
                          name: `${venueName} — ${activeRoomService.name || 'Room'}`,
                          metadata: {
                            ...(activeRoomService.metadata || {}),
                            hotelBooking: {
                              venueName,
                              address,
                              roomType: activeRoomService.name,
                              checkIn,
                              checkOut,
                              nights,
                              rooms,
                              adults,
                              children,
                              childAges,
                              pets,
                              petCount,
                              selectedAddons: [],
                              pricePerNight: roomPrice,
                              totalPrice: roomTotal
                            }
                          }
                        });

                        setSelectedSlot({
                          id: `hotel-stay-${Date.now()}`,
                          timeStr: slotStr,
                          date: checkIn,
                          available: true
                        });

                        router.push('/booking/checkout');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
                    >
                      Skip Add-ons &rarr;
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Proceed to Checkout with Selected Addons included
                        const roomListings = activeRoomService.rawConfig?.metadata?.listings || activeRoomService.metadata?.listings || [];
                        const roomPrice = Number(activeRoomService.price || activeRoomService.basePrice || roomListings[0]?.price) || 2500;
                        const roomTotal = roomPrice * nights * rooms;

                        const availableAddonsList = [
                          { id: 'addon-breakfast', name: 'Daily Chef Buffet Breakfast', price: 350 * nights * (adults + children) },
                          { id: 'addon-early-checkin', name: 'Guaranteed Early Check-in (10:00 AM)', price: 499 },
                          { id: 'addon-airport-pickup', name: 'Private Sedan Airport Pickup', price: 799 },
                          { id: 'addon-cake', name: 'Celebration Bouquet & Cake Setup', price: 599 }
                        ];

                        const chosenAddons = availableAddonsList.filter(a => selectedAddonIds.includes(a.id));
                        const addonsTotalSum = chosenAddons.reduce((sum, a) => sum + a.price, 0);
                        const finalTotal = roomTotal + addonsTotalSum;
                        const slotStr = `${checkIn} to ${checkOut} (${nights} Night${nights > 1 ? 's' : ''}) • ${adults + children} Guests • ${rooms} Room${rooms > 1 ? 's' : ''}`;

                        setSelectedService({
                          ...activeRoomService,
                          price: finalTotal,
                          name: `${venueName} — ${activeRoomService.name || 'Room'}`,
                          metadata: {
                            ...(activeRoomService.metadata || {}),
                            hotelBooking: {
                              venueName,
                              address,
                              roomType: activeRoomService.name,
                              checkIn,
                              checkOut,
                              nights,
                              rooms,
                              adults,
                              children,
                              childAges,
                              pets,
                              petCount,
                              selectedAddons: chosenAddons,
                              pricePerNight: roomPrice,
                              totalPrice: finalTotal
                            }
                          }
                        });

                        setSelectedSlot({
                          id: `hotel-stay-${Date.now()}`,
                          timeStr: slotStr,
                          date: checkIn,
                          available: true
                        });

                        router.push('/booking/checkout');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <span>Proceed to Checkout &rarr;</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
