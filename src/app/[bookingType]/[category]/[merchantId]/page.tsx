'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Clock, CheckCircle2, ChevronRight, ChevronLeft, Info, ShieldCheck, Search, Users, Utensils, X, Calendar, Bed, Star, Heart, Check, MapPin, ExternalLink, Headphones, Award, Minus, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocationStore, useBookingFlowStore } from '@/lib/store';
import { BokspotLoader } from '@/components/ui/BokspotLoader';

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
  const rawCategory = params?.category as string;
  const category = rawCategory === 'stayhotel' || rawCategory === 'stay-hotel' || rawCategory === 'hotel' ? 'hotels' : (rawCategory === 'resort' ? 'resorts' : (rawCategory === 'villa' ? 'villas' : rawCategory));
  const merchantId = params?.merchantId as string;
  const { city } = useLocationStore();
  const { setSelectedService, setSelectedSlot } = useBookingFlowStore();
  const searchParams = useSearchParams();
  const isHotel = category === 'hotels' || category === 'resorts' || category === 'villas' || category === 'hostels' || category === 'camping' || bookingType === 'stay-accommodation' || bookingType === 'home';
  const isFacility = category === 'football-turf' || category === 'cricket-ground' || category === 'badminton' || category === 'tennis' || category === 'basketball' || category === 'studio' || category === 'meeting-room' || category === 'podcast' || category === 'gaming' || bookingType === 'sports-turf';
  const isAppointment = category === 'doctor' || category === 'salons' || category === 'gym-yoga' || category === 'pet-grooming';
  const isRental = category === 'sports-bike' || category === 'car-rental' || category === 'bike-rental' || category === 'camera' || category === 'cycle-rental' || category === 'sound-system' || category === 'event-equip' || bookingType === 'rental-equipment';
  const isPass = category === 'movies' || category === 'concerts' || category === 'theatre' || category === 'events' || category === 'exhibitions' || category === 'swimming' || category === 'play-arena' || category === 'darshan' || category === 'coworking';
  const isHomeCall = category === 'electrician' || category === 'plumber' || category === 'cleaning' || category === 'technician' || category === 'babysitting' || category === 'elder-care';

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

  // Custom Calendar Popover states for Check-in / Check-out
  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [pickerMonthDate, setPickerMonthDate] = useState(() => new Date());

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

  const [liveServices, setLiveServices] = useState<any[]>(() => {
    try {
      if ((api.services as any)._cache) {
        for (const k in (api.services as any)._cache) {
          const list = (api.services as any)._cache[k]?.data?.data;
          if (Array.isArray(list)) {
            const matches = list.filter((s: any) => (s.merchantId === merchantId) || (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId)));
            if (matches.length > 0) return matches;
          }
        }
      }
    } catch {}
    return [];
  });
  const [merchantData, setMerchantData] = useState<any>(() => {
    try {
      return (api.merchants as any)._cache?.[merchantId]?.data || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => liveServices.length === 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // ── Hotel Interactive Room Details & Add-ons Flow States ──
  const [activeRoomService, setActiveRoomService] = useState<any | null>(null);
  const [roomModalStep, setRoomModalStep] = useState<'DETAILS' | 'ADDONS' | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [roomModalImageIdx, setRoomModalImageIdx] = useState(0);

  // ── Facility / Turf Interactive Slot Flow States ──
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHourSlot, setSelectedHourSlot] = useState<string | null>(null);
  const [selectedTurfService, setSelectedTurfService] = useState<any | null>(null);
  const [selectedTurfAddons, setSelectedTurfAddons] = useState<string[]>([]);
  const [isTurfAddonModalOpen, setIsTurfAddonModalOpen] = useState(false);
  const [slotHoldTimeRemaining, setSlotHoldTimeRemaining] = useState<number | null>(null);
  const [pricingResult, setPricingResult] = useState<any | null>(null);
  const [isPricingCalculating, setIsPricingCalculating] = useState(false);

  // ── Archetype 3: TimeSlot (Doctor & Salon/Spa) Flow States ──
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('Dr. Rajesh Kumar (Senior Consultant)');
  const [selectedApptSlot, setSelectedApptSlot] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [tokenQueueNum, setTokenQueueNum] = useState<number>(14);

  // ── Archetype 4: AssetRental (Bikes, Cars, Equipment) Flow States ──
  const [rentalStartDate, setRentalStartDate] = useState(todayStr);
  const [rentalEndDate, setRentalEndDate] = useState(tomorrowStr);
  const [rentalDays, setRentalDays] = useState<number>(2);
  const [uploadedDlName, setUploadedDlName] = useState<string>('');
  const [helmetOrGearAddon, setHelmetOrGearAddon] = useState<boolean>(true);

  // ── Archetype 5: PassEntry (Movies, Events, Concerts, Darshan) Flow States ──
  const [passCount, setPassCount] = useState<number>(2);
  const [selectedTier, setSelectedTier] = useState<string>('Standard VIP');
  const [popcornComboAddon, setPopcornComboAddon] = useState<boolean>(false);

  // ── Archetype 6: HomeCall (Electrician, Plumber, Cleaning, AC Repair) Flow States ──
  const [homeIssueCategory, setHomeIssueCategory] = useState<string>('Inspection & Diagnosis');
  const [homeAddressLine, setHomeAddressLine] = useState<string>('');
  const [preferredHomeWindow, setPreferredHomeWindow] = useState<string>('Morning (10:00 AM - 01:00 PM)');

  const [isSaved, setIsSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isEditSearchOpen, setIsEditSearchOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [activeSubNavTab, setActiveSubNavTab] = useState<'overview' | 'facilities' | 'location' | 'policies'>('overview');

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel instant fetch for venue profile + services catalog
        const [mDataRes, res] = await Promise.all([
          merchantId !== '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e'
            ? api.merchants.get(merchantId).catch(() => null)
            : Promise.resolve(null),
          api.services.list({})
        ]);
        const mData = mDataRes;

        if (active && res && res.data) {
          const merchantServices = res.data.filter((s: any) => {
            const isMatchMerchant = (s.merchantId === merchantId) || (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId));

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
              const sCat = (s.category || '').toLowerCase();
              const catSlug = (s.categoryObj?.slug || '').toLowerCase();
              const sName = (s.name || '').toLowerCase();
              const expCat = (expectedCategoryName || '').toLowerCase();
              const urlCat = (category || '').toLowerCase().replace(/-/g, ' ');

              isMatchType = sCat === expCat || 
                catSlug === category.toLowerCase() || 
                sCat.includes(urlCat) || 
                sName.includes(urlCat) ||
                (urlCat.includes('turf') && (sCat.includes('turf') || sName.includes('turf')));
            }
            return isMatchMerchant && isMatchType;
          });

          // Match strictly from live backend services
          let finalServices = merchantServices;
          if (finalServices.length === 0) {
            const fallbackCategoryMatch = res.data.filter((s: any) => {
              const catName = (s.category || '').toLowerCase();
              const svcName = (s.name || '').toLowerCase();
              const catSlug = (s.categoryObj?.slug || '').toLowerCase();
              return catName.includes(category.toLowerCase()) || svcName.includes(category.toLowerCase()) || catSlug.includes(category.toLowerCase());
            });

            if (fallbackCategoryMatch.length > 0) {
              finalServices = fallbackCategoryMatch;
            }
          }

          setLiveServices(finalServices);
          if (mData) {
            setMerchantData((mData as any).data || mData);
          } else if (finalServices.length > 0) {
            setMerchantData(finalServices[0].merchantObj || {});
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

  const venueName = (liveServices.length > 0 && (liveServices[0].metadata?.facilityName || liveServices[0].metadata?.branchName || liveServices[0].metadata?.merchantName || liveServices[0].merchantObj?.name)) ||
    merchantData?.name ||
    merchantData?.merchantName ||
    (liveServices.length > 0 ? (liveServices[0].merchant || 'Venue') : 'Loading...');

  const address = (liveServices.length > 0 && (liveServices[0].metadata?.address || liveServices[0].merchantObj?.address)) ||
    merchantData?.address ||
    `${city || 'Chennai'}`;

  if (loading) {
    const isHotel = category === 'resorts' || category === 'hotels' || category === 'villas' || category === 'hostels' || category === 'camping';
    return (
      <BokspotLoader
        message={isHotel ? `Loading ${category === 'resorts' ? 'Resort' : category === 'villas' ? 'Villa' : category === 'hotels' ? 'Hotel' : 'Stay'} details...` : 'Loading Venue details...'}
      />
    );
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

  // Extract and clean real images from room listings first (highest priority), then property gallery
  const extractedImages: string[] = [];
  const addIfValid = (url: any) => {
    if (typeof url === 'string' && url.trim().length > 0 && !extractedImages.includes(url)) {
      const lower = url.toLowerCase();
      // Filter out temporary blobs, UI screenshots, and previous dummy temple or card preview captures
      if (
        !url.startsWith('blob:') && 
        !lower.includes('screenshot') && 
        !lower.includes('temple') &&
        !lower.includes('darshan') &&
        !lower.includes('dummy')
      ) {
        extractedImages.push(url.trim());
      }
    }
  };

  // 1. First priority: Freshly uploaded active listings / room photos
  liveServices.forEach((svc: any) => {
    const svcListings = svc.metadata?.listings || svc.rawConfig?.metadata?.listings || [];
    svcListings.forEach((l: any) => {
      addIfValid(l.imageUrl);
      addIfValid(l.image);
      (l.images || []).forEach(addIfValid);
      (l.metadata?.gallery || []).forEach(addIfValid);
    });
    // Only include service level images if there are no listing photos yet
    if (extractedImages.length === 0) {
      addIfValid(svc.imageUrl);
      addIfValid(svc.image);
      (svc.images || []).forEach(addIfValid);
      (svc.metadata?.images || []).forEach(addIfValid);
      (svc.metadata?.gallery || []).forEach(addIfValid);
    }
  });

  // 2. Second priority: Merchant Property Showcase gallery only if NO room listing photos exist
  if (!isFacility && extractedImages.length === 0) {
    (finalMerchantObj.images || []).forEach(addIfValid);
    (finalMerchantObj.gallery || []).forEach(addIfValid);
  }

  // Fallback photos based on category (Turf/Sports vs Hotel)
  const defaultTurfPhotos = [
    'https://images.unsplash.com/photo-1529900245534-47fbf82a4fbe?w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80'
  ];

  // Provide curated high-res photos if no custom images exist
  const galleryImages: string[] = extractedImages.length > 0
    ? extractedImages
    : (isFacility ? defaultTurfPhotos : defaultHotelPhotos);

  const firstSvc = liveServices[0];
  const firstListing = firstSvc?.metadata?.listings?.[0] || firstSvc?.rawConfig?.metadata?.listings?.[0];
  
  // Venue profile about text (distinct from court/pitch listing description)
  const aboutText = isFacility 
    ? (firstSvc?.description ||
      firstListing?.description ||
      firstSvc?.metadata?.about ||
      `Premier sports arena and multi-sport turf facility located in ${city || 'Chennai'}. Equipped with FIFA certified astro turf, high-mast floodlights, and professional player amenities.`)
    : (finalMerchantObj.description ||
      finalMerchantObj.aboutText ||
      finalMerchantObj.about ||
      firstSvc?.description ||
      firstListing?.description);

  const defaultFacilityAmenities = [
    'FIFA Standard Astro Turf', 'High-Mast LED Floodlights', 'Clean Changing Rooms', 'Dugout Seating for Teams', 'Drinking Water & First Aid', 'Parking Area'
  ];

  const amenities = isFacility
    ? ((firstListing?.metadata?.amenities && firstListing.metadata.amenities.length > 0)
        ? firstListing.metadata.amenities
        : ((firstSvc?.metadata?.amenities && firstSvc.metadata.amenities.length > 0)
            ? firstSvc.metadata.amenities
            : defaultFacilityAmenities))
    : ((finalMerchantObj.amenities && finalMerchantObj.amenities.length > 0)
        ? finalMerchantObj.amenities
        : (finalMerchantObj.thingsToKnow && finalMerchantObj.thingsToKnow.length > 0)
          ? finalMerchantObj.thingsToKnow
          : (firstSvc?.metadata?.amenities || firstListing?.metadata?.amenities || []));

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b10] text-slate-800 dark:text-slate-100 pt-20 sm:pt-24 pb-32 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* ============================================================
         * SECTION A: AGODA STANDARD BREADCRUMB & STREAMLINED HOTEL HEADER
         * ============================================================ */}
        <div className="mb-5 space-y-3">
          {/* Agoda Standard Breadcrumbs (Home > Category > City > Property) */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap py-1">
            <Link href="/" className="hover:text-[#033266] dark:hover:text-[#ff6325] hover:underline transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            <Link href={`/${bookingType}/${category}`} className="hover:text-[#033266] dark:hover:text-[#ff6325] hover:underline transition-colors capitalize">
              {category ? category.replace('-', ' ') : 'Stays'}
            </Link>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            <span className="hover:text-[#033266] dark:hover:text-[#ff6325] hover:underline cursor-pointer transition-colors">
              {city || 'Chennai'}
            </span>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
              {venueName}
            </span>
          </nav>

        </div>

        {/* ============================================================
         * SECTION C: STAY DETAILS SUMMARY BAR & EDIT SEARCH (TOP POSITION)
         * ============================================================ */}
        {isHotel && (
          <div className="mb-6">
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
                className="mt-3 p-5 bg-white dark:bg-[#0f1219] rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg text-xs space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Check-in */}
                  <div className="relative">
                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                      Check-in Date
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const targetD = checkIn ? new Date(checkIn) : new Date();
                        setPickerMonthDate(isNaN(targetD.getTime()) ? new Date() : targetD);
                        setActiveDatePicker(activeDatePicker === 'checkIn' ? null : 'checkIn');
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white flex items-center justify-between hover:border-[#033266] dark:hover:border-[#ff6325] transition-all cursor-pointer text-left"
                    >
                      <span className="text-xs">
                        {(() => {
                          try {
                            const [y, m, d] = checkIn.split('-');
                            return `${d}-${m}-${y}`;
                          } catch {
                            return checkIn;
                          }
                        })()}
                      </span>
                      <Calendar size={15} className="text-[#ff6325] shrink-0" />
                    </button>

                    {/* Popover Calendar for Check-In */}
                    <AnimatePresence>
                      {activeDatePicker === 'checkIn' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl z-50 space-y-3"
                        >
                          {/* Calendar Month Header */}
                          <div className="bg-slate-50 dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() - 1, 1));
                              }}
                              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                            >
                              <ChevronLeft size={15} />
                            </button>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {pickerMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() + 1, 1));
                              }}
                              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                            >
                              <ChevronRight size={15} />
                            </button>
                          </div>

                          {/* Days of Week */}
                          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                              <div key={d} className="py-1">{d}</div>
                            ))}
                          </div>

                          {/* Days Grid */}
                          <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {(() => {
                              const year = pickerMonthDate.getFullYear();
                              const month = pickerMonthDate.getMonth();
                              const firstDay = new Date(year, month, 1).getDay();
                              const totalDays = new Date(year, month + 1, 0).getDate();
                              const cells = [];

                              for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-${i}`} className="h-8" />);
                              }

                              for (let d = 1; d <= totalDays; d++) {
                                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const isSelected = checkIn === dStr;
                                const isToday = todayStr === dStr;

                                cells.push(
                                  <div key={d} className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCheckIn(dStr);
                                        // Ensure checkOut is at least next day
                                        if (new Date(dStr) >= new Date(checkOut)) {
                                          const nextD = new Date(year, month, d + 1);
                                          const nextStr = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(nextD.getDate()).padStart(2, '0')}`;
                                          setCheckOut(nextStr);
                                        }
                                        setActiveDatePicker(null);
                                      }}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#1a56db] text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-400/30 font-extrabold'
                                          : isToday
                                          ? 'border border-[#1a56db] text-[#1a56db] dark:text-blue-400 font-extrabold'
                                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      {d}
                                    </button>
                                  </div>
                                );
                              }
                              return cells;
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Check-out */}
                  <div className="relative">
                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                      Check-out Date
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const targetD = checkOut ? new Date(checkOut) : new Date();
                        setPickerMonthDate(isNaN(targetD.getTime()) ? new Date() : targetD);
                        setActiveDatePicker(activeDatePicker === 'checkOut' ? null : 'checkOut');
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white flex items-center justify-between hover:border-[#033266] dark:hover:border-[#ff6325] transition-all cursor-pointer text-left"
                    >
                      <span className="text-xs">
                        {(() => {
                          try {
                            const [y, m, d] = checkOut.split('-');
                            return `${d}-${m}-${y}`;
                          } catch {
                            return checkOut;
                          }
                        })()}
                      </span>
                      <Calendar size={15} className="text-[#ff6325] shrink-0" />
                    </button>

                    {/* Popover Calendar for Check-Out */}
                    <AnimatePresence>
                      {activeDatePicker === 'checkOut' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl z-50 space-y-3"
                        >
                          {/* Calendar Month Header */}
                          <div className="bg-slate-50 dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() - 1, 1));
                              }}
                              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                            >
                              <ChevronLeft size={15} />
                            </button>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {pickerMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() + 1, 1));
                              }}
                              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                            >
                              <ChevronRight size={15} />
                            </button>
                          </div>

                          {/* Days of Week */}
                          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                              <div key={d} className="py-1">{d}</div>
                            ))}
                          </div>

                          {/* Days Grid */}
                          <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {(() => {
                              const year = pickerMonthDate.getFullYear();
                              const month = pickerMonthDate.getMonth();
                              const firstDay = new Date(year, month, 1).getDay();
                              const totalDays = new Date(year, month + 1, 0).getDate();
                              const cells = [];

                              for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-out-${i}`} className="h-8" />);
                              }

                              for (let d = 1; d <= totalDays; d++) {
                                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const isSelected = checkOut === dStr;
                                const isToday = todayStr === dStr;

                                cells.push(
                                  <div key={d} className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCheckOut(dStr);
                                        // If user selects checkOut before or equal to checkIn, adjust checkIn
                                        if (new Date(dStr) <= new Date(checkIn)) {
                                          const prevD = new Date(year, month, d - 1);
                                          const prevStr = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}-${String(prevD.getDate()).padStart(2, '0')}`;
                                          setCheckIn(prevStr);
                                        }
                                        setActiveDatePicker(null);
                                      }}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#1a56db] text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-400/30 font-extrabold'
                                          : isToday
                                          ? 'border border-[#1a56db] text-[#1a56db] dark:text-blue-400 font-extrabold'
                                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      {d}
                                    </button>
                                  </div>
                                );
                              }
                              return cells;
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Adults Stepper */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Adults</h5>
                      <p className="text-[10px] text-slate-400 font-medium">Ages 18 or above</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-250 dark:border-white/15 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-4 text-center font-black text-sm text-slate-900 dark:text-white">
                        {adults}
                      </span>
                      <button
                        type="button"
                        disabled={adults >= 10}
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-250 dark:border-white/15 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Children Stepper */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Children</h5>
                      <p className="text-[10px] text-slate-400 font-medium">Ages 0 to 17</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={() => {
                          const newC = Math.max(0, children - 1);
                          setChildren(newC);
                          setChildAges(prev => prev.slice(0, newC));
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-250 dark:border-white/15 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-4 text-center font-black text-sm text-slate-900 dark:text-white">
                        {children}
                      </span>
                      <button
                        type="button"
                        disabled={children >= 6}
                        onClick={() => {
                          const newC = Math.min(6, children + 1);
                          setChildren(newC);
                          setChildAges(prev => [...prev, 5]);
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-250 dark:border-white/15 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Rooms Stepper */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Rooms</h5>
                      <p className="text-[10px] text-slate-400 font-medium">Units required</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={rooms <= 1}
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-250 dark:border-white/15 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-4 text-center font-black text-sm text-slate-900 dark:text-white">
                        {rooms}
                      </span>
                      <button
                        type="button"
                        disabled={rooms >= 8}
                        onClick={() => setRooms(Math.min(8, rooms + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-250 dark:border-white/15 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Child Ages row if children > 0 */}
                {children > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Ages of Children (at checkout)
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {Array.from({ length: children }).map((_, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Child {cIdx + 1}:</span>
                          <select
                            value={childAges[cIdx] ?? 5}
                            onChange={(e) => {
                              const ageVal = Number(e.target.value);
                              setChildAges(prev => {
                                const copy = [...prev];
                                copy[cIdx] = ageVal;
                                return copy;
                              });
                            }}
                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 font-bold text-xs text-slate-900 dark:text-white outline-none"
                          >
                            {Array.from({ length: 18 }).map((_, age) => (
                              <option key={age} value={age}>
                                {age === 0 ? '< 1 yr' : `${age} yr${age > 1 ? 's' : ''}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Row: Pets Checkbox + Apply Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-white/10">
                  {/* Pet traveling */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pets}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setPets(isChecked);
                          if (isChecked && petCount === 0) setPetCount(1);
                          if (!isChecked) setPetCount(0);
                        }}
                        className="w-4 h-4 rounded text-[#033266] dark:text-[#ff6325] focus:ring-0 cursor-pointer accent-[#033266] dark:accent-[#ff6325]"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>🐾</span> Traveling with Pets?
                      </span>
                    </label>

                    {pets && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <select
                          value={petCount || 1}
                          onChange={(e) => setPetCount(Number(e.target.value))}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        >
                          {[1, 2, 3, 4].map(n => (
                            <option key={n} value={n}>
                              {n} Pet{n > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsEditSearchOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSearchOpen(false);
                        const newQuery = new URLSearchParams(window.location.search);
                        newQuery.set('checkIn', checkIn);
                        newQuery.set('checkOut', checkOut);
                        newQuery.set('adults', String(adults));
                        newQuery.set('children', String(children));
                        newQuery.set('childAges', encodeURIComponent(JSON.stringify(childAges)));
                        newQuery.set('rooms', String(rooms));
                        newQuery.set('pets', String(pets));
                        newQuery.set('petCount', String(petCount));
                        window.history.replaceState(null, '', `?${newQuery.toString()}`);
                      }}
                      className="px-6 py-2 bg-[#033266] dark:bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Apply Search
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ============================================================
         * SECTION B: OPTION 1 — 2-SIDES SPLIT HERO (Left: 58% Gallery | Right: 42% Overview & Map)
         * ============================================================ */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* Side 1: Left 58% (lg:col-span-7) — Modern Dynamic Photo Gallery */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-slate-900 flex flex-col justify-between">
            {/* Desktop Dynamic Bento Layout (370px height for optimal proportion) */}
            <div className="hidden md:block h-[370px] p-2.5">
              <div className="grid grid-cols-3 grid-rows-2 gap-2.5 h-full">
                {/* Main Featured Photo (2 cols x 2 rows) */}
                <div
                  onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
                  className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
                >
                  <img
                    src={galleryImages[0]}
                    alt={`${venueName} primary photo`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => { e.currentTarget.src = isFacility ? defaultTurfPhotos[0] : defaultHotelPhotos[0]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                    ✨ Featured Property
                  </div>
                </div>

                {/* 2 Supporting Side Thumbnails */}
                {galleryImages.slice(1, 3).map((imgUrl, idx) => (
                  <div
                    key={idx + 1}
                    onClick={() => { setCurrentImageIdx(idx + 1); setIsGalleryOpen(true); }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
                  >
                    <img
                      src={imgUrl}
                      alt={`${venueName} preview ${idx + 2}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => { 
                        e.currentTarget.src = isFacility 
                          ? defaultTurfPhotos[(idx + 1) % defaultTurfPhotos.length] 
                          : defaultHotelPhotos[(idx + 1) % defaultHotelPhotos.length]; 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Carousel View */}
            <div className="md:hidden relative h-60 w-full">
              <img
                src={galleryImages[currentImageIdx] || galleryImages[0]}
                alt={venueName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = isFacility ? defaultTurfPhotos[0] : defaultHotelPhotos[0]; }}
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

            {/* Floating "See All Photos" CTA Badge */}
            <button
              onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
              className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg border border-slate-200/80 dark:border-white/10 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span>📷</span>
              <span>View All {galleryImages.length} Photos</span>
            </button>
          </div>

          {/* Side 2: Right 42% (lg:col-span-5) — Agoda-Style Combined Property Highlights & Mini Map Card */}
          <div className="lg:col-span-5 rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">

            {/* Property Title & Quick Actions Header */}
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {venueName}
                </h1>

                {/* Share & Save Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors text-xs font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1219] shadow-xs cursor-pointer active:scale-95"
                    title="Share property"
                  >
                    <span>🔗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-2 rounded-xl transition-all text-xs font-bold border shadow-xs cursor-pointer active:scale-95 ${isSaved
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-[#0f1219] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    title="Save to favorites"
                  >
                    <Heart size={14} className={isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-400'} />
                  </button>
                </div>
              </div>

              {/* Catchy Bio / Summary Text */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {aboutText || `${venueName} features luxury air-conditioned accommodations, outdoor swimming pools, multi-cuisine dining, and 24/7 dedicated guest assistance along the scenic East Coast corridor.`}
              </p>
            </div>


            {/* Middle: Amenities Grid & Check-in Pill */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block tracking-wider">
                {isFacility ? 'Venue Highlights & Amenities' : 'Property Highlights & Inclusions'}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {(amenities && amenities.length > 0 ? amenities.slice(0, 6) : ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Air Conditioned', '24/7 Front Desk', 'Private Bath', 'Daily Housekeeping']).map((am: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 shadow-2xs">
                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                    <span className="truncate text-[11px]">{am}</span>
                  </div>
                ))}
              </div>

              {/* Timings Bar: Operating Hours for Facility/Turf, Check-in/out for Stays */}
              {isFacility ? (
                <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <span>🕒 Operating Hours:</span>
                    <strong className="font-extrabold">{firstSvc?.metadata?.operatingHours || firstListing?.metadata?.operatingHours || (finalMerchantObj.operatingHours && !finalMerchantObj.operatingHours.includes('Front Desk') ? finalMerchantObj.operatingHours : '06:00 AM – 11:00 PM')}</strong>
                  </span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100">
                    Open Daily
                  </span>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">🕒 Check-in: <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{finalMerchantObj.metadata?.checkInTime || '12:00 PM'}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">Check-out: <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{finalMerchantObj.metadata?.checkOutTime || '11:00 AM'}</strong></span>
                </div>
              )}
            </div>

            {/* Bottom Quick-Action: View on Map */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('property-location-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-extrabold text-[#033266] dark:text-[#ff6325] hover:underline flex items-center gap-1 cursor-pointer py-1"
              >
                <span>📍 View Location on Map</span>
                <span>&darr;</span>
              </button>

              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {isFacility ? 'Slots & Courts listed below ↓' : 'Rooms listed below ↓'}
              </span>
            </div>

          </div>
        </div>

        {/* ============================================================
         * SECTION D4: SPORTS, TURF & COURT HOURLY SLOTS BOOKING (PLAYO STYLE)
         * ============================================================ */}
        {isFacility && (
          <div className="space-y-6 mb-10 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚽</span> Select Time Slot & Court
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Book 1-hour slots. Instant 5-minute temporary reservation hold upon selection.
                </p>
              </div>

              {/* Slot Hold Timer */}
              {selectedHourSlot && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-xs font-bold animate-pulse">
                  <Clock size={14} />
                  <span>Slot Held: 04:59 mins remaining</span>
                </div>
              )}
            </div>

            {/* Available Courts / Pitches Selector */}
            {(() => {
              const allAvailablePitches: any[] = [];
              liveServices.forEach((svc: any) => {
                const svcListings = svc.metadata?.listings || svc.rawConfig?.metadata?.listings || [];
                if (svcListings.length > 0) {
                  svcListings.forEach((lst: any) => {
                    allAvailablePitches.push({
                      id: lst.id || svc.id,
                      name: lst.name || svc.name,
                      price: lst.price || svc.price || svc.basePrice || 1350,
                      description: lst.description || svc.description,
                      parentService: svc,
                      rawListing: lst
                    });
                  });
                } else if (svc.name && svc.name !== '__BOKSPOT_GROUP__') {
                  allAvailablePitches.push({
                    id: svc.id,
                    name: svc.name,
                    price: svc.price || svc.basePrice || 1350,
                    description: svc.description,
                    parentService: svc
                  });
                }
              });

              if (allAvailablePitches.length === 0) return null;

              const activePitchId = selectedTurfService?.id || allAvailablePitches[0].id;
              const activePitch = allAvailablePitches.find(p => p.id === activePitchId) || allAvailablePitches[0];
              const activeListing = activePitch.rawListing || activePitch.parentService || {};
              const activeMeta = activeListing.metadata || activePitch.parentService?.metadata || {};

              return (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Choose Court / Pitch Unit
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {allAvailablePitches.map((pitch) => {
                        const isPitchSelected = activePitchId === pitch.id;
                        return (
                          <div
                            key={pitch.id}
                            onClick={() => {
                              setSelectedTurfService({
                                ...(pitch.parentService || liveServices[0]),
                                id: pitch.id,
                                name: pitch.name,
                                price: pitch.price,
                                rawListing: pitch.rawListing
                              });
                              setSelectedHourSlot(null);
                              setPricingResult(null);
                            }}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                              isPitchSelected
                                ? 'bg-gradient-to-br from-[#033266]/10 to-[#ff6325]/10 border-[#ff6325] ring-2 ring-[#ff6325]/20 shadow-sm'
                                : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                                {pitch.name}
                              </span>
                              <span className="text-xs font-extrabold text-[#ff6325] shrink-0">
                                ₹{pitch.price}/hr
                              </span>
                            </div>
                            {pitch.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {pitch.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Playo-Style Court Profile Card */}
                  <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-5">
                    
                    {/* Top Row: Pitch Cover, Title, Crown Badge, Description & Big Price Box */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={(Array.isArray(activeListing.images) && activeListing.images[0]) || activeListing.imageUrl || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80'}
                          alt={activePitch.name}
                          className="h-20 w-24 sm:h-24 sm:w-32 object-cover rounded-2xl border border-slate-200 dark:border-white/10 shrink-0 shadow-xs"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <span>👑</span> Best Value
                            </span>
                            {activeListing.discountPercentage && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                {activeListing.discountPercentage}% OFF
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                            {activePitch.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">
                            {activePitch.description || 'FIFA Certified 50mm monofilament turf with rubber granules infill. Equipped with high-mast LED floodlights for night play.'}
                          </p>
                        </div>
                      </div>

                      {/* Right Big Price Box */}
                      <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center p-3 sm:p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 shrink-0">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-[#033266] dark:text-[#ff6325]">
                            ₹{activePitch.price}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/hr</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/40 mt-1 flex items-center gap-1">
                          <span>☀️</span> {activeListing.offerBadge || 'Prime Evening Slot'}
                        </span>
                      </div>
                    </div>

                    {/* 4-Pill Specs Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                          🥅
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Dimensions & Size</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                            {activeMeta.turfSize || '100ft x 65ft (7-a-side)'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                          ⚽
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pitch Surface</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block" title={activeMeta.surfaceType || 'FIFA 50mm AstroTurf'}>
                            {activeMeta.surfaceType || 'FIFA 50mm Monofilament'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                          💡
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Floodlights</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                            {activeMeta.floodlightsSurcharge ? `₹${activeMeta.floodlightsSurcharge}/hr (Night)` : 'Included in Night Play'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                          🛡️
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">On-site Official</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block" title={activeMeta.refereeOrManager || 'Ground Supervisor (KFA Certified)'}>
                            {activeMeta.refereeOrManager || 'Ground Supervisor'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Green Included Playing Gear Banner */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                          ⚽
                        </div>
                        <div>
                          <span className="text-xs font-black block">Included Playing Gear</span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                            {activeMeta.equipmentAddons || '2 Match Balls (Size 5), 14 Team Bibs (Neon Green & Orange), Goalkeeper Gloves'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">›</span>
                    </div>

                    {/* Court Photos Gallery Section */}
                    {(() => {
                      const courtImages = (Array.isArray(activeListing.images) && activeListing.images.length > 0)
                        ? activeListing.images
                        : [
                            'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80',
                            'https://images.unsplash.com/photo-1574629810360-7efbb49fec90?w=1200&q=80',
                            'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80'
                          ];

                      return (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="text-sm">📷</span> Court Photos ({courtImages.length})
                            </span>
                            <span className="text-xs font-bold text-[#033266] dark:text-[#ff6325] hover:underline cursor-pointer">
                              View all ›
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative group">
                              <img
                                src={courtImages[0]}
                                alt={`${activePitch.name} wide`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <div className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative group">
                              <img
                                src={courtImages[1] || courtImages[0]}
                                alt={`${activePitch.name} pitch`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {courtImages.length > 2 && (
                                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-black shadow-lg">
                                  +{courtImages.length - 2} More
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              );
            })()}

            {/* Date Quick Selector */}
            {(() => {
              const currentListing = selectedTurfService?.rawListing || 
                liveServices[0]?.metadata?.listings?.[0] || 
                liveServices[0]?.rawConfig?.metadata?.listings?.[0];

              const publishedSchedule: Array<{ dayOfWeek?: string; specificDate?: string; startTime: string; endTime: string; price: number }> =
                currentListing?.schedule || currentListing?.metadata?.schedule || selectedTurfService?.schedule || [];

              return (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const ds = d.toISOString().split('T')[0];
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                    const isSelected = selectedDate === ds;
                    const daySlotCount = publishedSchedule.filter((s: any) => {
                      if (s.specificDate) {
                        return s.specificDate === ds;
                      }
                      return s.dayOfWeek?.toLowerCase() === dayName.toLowerCase();
                    }).length;

                    return (
                      <button
                        key={ds}
                        type="button"
                        onClick={() => {
                          setSelectedDate(ds);
                          setSelectedHourSlot(null);
                          setPricingResult(null);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex flex-col items-center min-w-[76px] transition-all cursor-pointer border relative ${isSelected
                          ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325]'
                          }`}
                      >
                        <span className="text-[10px] uppercase font-bold opacity-80">
                          {offset === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-black mt-0.5">
                          {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        {daySlotCount > 0 && (
                          <span className={`text-[9px] font-black mt-1 px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                            {daySlotCount} slots
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Slot Grid - Purely driven by Business Published Schedule */}
            {(() => {
              // Extract selected date day of week (e.g. 'Monday', 'Tuesday'...)
              const targetDayOfWeek = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });

              // Find active listing or service
              const currentListing = selectedTurfService?.rawListing || 
                liveServices[0]?.metadata?.listings?.[0] || 
                liveServices[0]?.rawConfig?.metadata?.listings?.[0];

              const publishedSchedule: Array<{ dayOfWeek?: string; specificDate?: string; startTime: string; endTime: string; price: number }> =
                currentListing?.schedule || currentListing?.metadata?.schedule || selectedTurfService?.schedule || [];

              // Priority 1: Specific Date match (e.g. 2026-10-28)
              // Priority 2: Fallback or combine with recurring day of week match
              const dateSpecificSlots = publishedSchedule.filter(s => s.specificDate === selectedDate);
              const daySlots = (dateSpecificSlots.length > 0 
                ? dateSpecificSlots 
                : publishedSchedule.filter(s => !s.specificDate && s.dayOfWeek?.toLowerCase() === targetDayOfWeek.toLowerCase())
              ).sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (daySlots.length === 0) {
                // Check if any other day has slots
                const daysWithSlots = Array.from(new Set(publishedSchedule.map(s => s.specificDate || s.dayOfWeek).filter(Boolean)));

                return (
                  <div className="py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-white/10 text-center space-y-3">
                    <span className="text-3xl block">⏳</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No slots published for {targetDayOfWeek} ({selectedDate})
                    </h4>
                    {daysWithSlots.length > 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        This venue currently has slots scheduled for <strong className="text-slate-700 dark:text-slate-300">{daysWithSlots.join(', ')}</strong>. Click on one of those dates/days above to book!
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Venue has not published booking slots yet. Please check back shortly.
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ⚡ Available Slots for {targetDayOfWeek} ({daySlots.length} Slots)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {daySlots.map((slot, sIdx) => {
                      const timeLabel = `${slot.startTime} - ${slot.endTime}`;
                      const isSelected = selectedHourSlot === timeLabel;
                      const slotPrice = Number(slot.price) || Number(selectedTurfService?.price) || 1350;

                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={async () => {
                            setSelectedHourSlot(timeLabel);
                            const currentSvc = selectedTurfService || liveServices[0] || {};
                            if (!selectedTurfService) setSelectedTurfService(currentSvc);
                            setIsPricingCalculating(true);
                            const calc = await api.services.calculatePricing({
                              archetype: 'FacilityHourly',
                              basePrice: slotPrice,
                              durationHours: 1,
                              isNightPeak: false,
                              quantity: 1
                            });
                            setPricingResult({
                              ...calc,
                              finalPayable: slotPrice,
                              breakdownSummary: `₹${slotPrice} / slot`
                            });
                            setIsPricingCalculating(false);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md scale-102'
                              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325] text-slate-900 dark:text-white'
                          }`}
                        >
                          <span className="text-xs font-black block">{slot.startTime}</span>
                          <span className="text-[10px] opacity-75 font-semibold mt-0.5 block">to {slot.endTime}</span>
                          <span className="text-[10px] font-black text-[#ff6325] dark:text-amber-400 mt-1 block">
                            ₹{slotPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Live Pricing Engine Result Card */}
            {selectedHourSlot && pricingResult && (() => {
              const baseSlotCost = Number(pricingResult.finalPayable) || 1350;
              // Sum any selected addons
              const activeListingObj = selectedTurfService?.rawListing || liveServices[0]?.metadata?.listings?.[0] || {};
              const activeMetaObj = activeListingObj.metadata || {};
              const defaultAddonsList = [
                { name: 'Certified Match Referee', price: 300 },
                { name: 'High-Res Match Video Recording', price: 500 },
                { name: 'Chilled Energy Drinks (Pack of 6)', price: 250 },
                { name: 'Extra Pro Match Ball (Size 5)', price: 150 },
                { name: 'Warm-up Bibs Set (10 Pack)', price: 100 },
                { name: 'Ice Pack & Recovery First-Aid Kit', price: 120 }
              ];
              const availableAddons = (Array.isArray(activeMetaObj.addons) && activeMetaObj.addons.length > 0)
                ? activeMetaObj.addons
                : defaultAddonsList;

              const addonsTotal = selectedTurfAddons.reduce((sum, addName) => {
                const found = availableAddons.find((a: any) => a.name === addName);
                return sum + (found ? Number(found.price) : 0);
              }, 0);

              const grandTotal = baseSlotCost + addonsTotal;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#033266] to-[#0c4a85] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-sm font-black text-white">
                        ⚽ {selectedTurfService?.name || '7v7 Premier FIFA Astro Turf A'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        Slot Reserved (5m hold)
                      </span>
                    </div>
                    <span className="text-xs text-blue-100 block font-medium">
                      📅 {selectedDate} • ⏰ {selectedHourSlot}
                      {selectedTurfAddons.length > 0 && ` • ${selectedTurfAddons.length} Add-on(s) (+₹${addonsTotal})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-blue-200 block">Total Payable</span>
                      <span className="text-2xl font-black text-amber-400">
                        ₹{grandTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsTurfAddonModalOpen(true);
                      }}
                      className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-2"
                    >
                      <span>⚡</span> Continue &rarr;
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}



        {/* ============================================================
         * SECTION D3: DYNAMIC ACCOMMODATION CATEGORIES (TOP BOOKING PRIORITY)
         * ============================================================ */}
        {isHotel && (
          <div id="available-rooms-section" className="space-y-6 mb-10">
            {(() => {
              const catTitleMap: Record<string, { title: string; subtitle: string; unitName: string }> = {
                villas: {
                  title: 'Select Your Villa',
                  subtitle: 'Choose your preferred villa unit and proceed to booking.',
                  unitName: 'Villa'
                },
                resorts: {
                  title: 'Select Your Room',
                  subtitle: 'Choose your room type and proceed to booking.',
                  unitName: 'Option'
                },
                hostels: {
                  title: 'Select Your Dorm',
                  subtitle: 'Choose your dorm or bed type and proceed to booking.',
                  unitName: 'Bed'
                },
                camping: {
                  title: 'Select Your Tent',
                  subtitle: 'Choose your camping setup and proceed to booking.',
                  unitName: 'Tent'
                },
                hotels: {
                  title: 'Select Your Room',
                  subtitle: 'Choose your room type and proceed to booking.',
                  unitName: 'Room'
                }
              };

              const dynamicHeading = catTitleMap[category] || {
                title: 'Select Your Room',
                subtitle: 'Choose your stay option and proceed directly to booking.',
                unitName: 'Option'
              };

              return (
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {dynamicHeading.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {dynamicHeading.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] rounded-full border border-[#033266]/20 dark:border-[#ff6325]/30 self-start sm:self-auto">
                    {(() => {
                      let total = 0;
                      liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').forEach((svc: any) => {
                        const cnt = (svc.metadata?.listings || svc.rawConfig?.metadata?.listings || []).length;
                        total += cnt > 0 ? cnt : 1;
                      });
                      return `${total} ${dynamicHeading.unitName}${total !== 1 ? 's' : ''} Available`;
                    })()}
                  </span>
                </div>
              );
            })()}

            {/* Rooms List */}
            <div className="space-y-4">
              {(() => {
                const nonGroupServices = liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__');
                const roomItems: any[] = [];

                nonGroupServices.forEach((svc: any, sIdx: number) => {
                  const listings = svc.metadata?.listings || svc.rawConfig?.metadata?.listings || [];
                  if (listings.length > 0) {
                    listings.forEach((l: any, lIdx: number) => {
                      const lMeta = l.metadata || {};
                      const lPrice = Number(l.basePrice || l.price || svc.basePrice || svc.price) || 2200;
                      const lName = l.name || svc.name;
                      const lDesc = l.description || svc.description || 'Spacious and welcoming accommodation with comfortable bedding, clean linens, and private ensuite bathroom.';
                      const rawThumb = l.imageUrl || l.image || lMeta.gallery?.[0] || l.images?.[0] || svc.imageUrl || svc.image;
                      const thumb = (rawThumb && !rawThumb.includes('screenshot') && !rawThumb.startsWith('blob:'))
                        ? rawThumb
                        : defaultHotelPhotos[(sIdx + lIdx) % defaultHotelPhotos.length];

                      roomItems.push({
                        id: l.id || `${svc.id}-${lIdx}`,
                        parentService: svc,
                        listing: l,
                        name: lName,
                        description: lDesc,
                        price: lPrice,
                        thumb,
                        maxGuests: l.maxGuests || lMeta.maxGuests || 2,
                        bedType: l.bedType || lMeta.bedType,
                        roomSize: l.sizeSqFt || lMeta.sizeSqFt || lMeta.roomSize,
                        bathroomType: l.bathroomType || lMeta.bathroomType,
                        perks: Array.isArray(l.perks) ? l.perks : (Array.isArray(lMeta.perks) ? lMeta.perks : (lMeta.perks ? [lMeta.perks] : [])),
                        roomAmenities: Array.isArray(l.amenities) ? l.amenities : (Array.isArray(lMeta.amenities) ? lMeta.amenities : []),
                        addons: l.addons || lMeta.addons || svc.metadata?.addons || svc.addOns || [],
                        gallery: (l.images && l.images.length > 0) ? l.images : (lMeta.gallery || [thumb])
                      });
                    });
                  } else {
                    // Fallback for services without nested listings array
                    const primaryMeta = svc.metadata || {};
                    const sPrice = Number(svc.price || svc.basePrice) || 2200;
                    const rawThumb = svc.imageUrl || svc.image;
                    const thumb = (rawThumb && !rawThumb.includes('screenshot') && !rawThumb.startsWith('blob:'))
                      ? rawThumb
                      : defaultHotelPhotos[sIdx % defaultHotelPhotos.length];

                    roomItems.push({
                      id: svc.id,
                      parentService: svc,
                      listing: null,
                      name: svc.name,
                      description: svc.description || 'Spacious and welcoming accommodation with comfortable bedding, clean linens, and private ensuite bathroom.',
                      price: sPrice,
                      thumb,
                      maxGuests: primaryMeta.maxGuests || 2,
                      bedType: primaryMeta.bedType,
                      roomSize: primaryMeta.sizeSqFt || primaryMeta.roomSize,
                      bathroomType: primaryMeta.bathroomType,
                      perks: Array.isArray(primaryMeta.perks) ? primaryMeta.perks : (primaryMeta.perks ? [primaryMeta.perks] : []),
                      roomAmenities: Array.isArray(primaryMeta.amenities) ? primaryMeta.amenities : [],
                      addons: svc.metadata?.addons || svc.addOns || [],
                      gallery: svc.images || [thumb]
                    });
                  }
                });

                if (roomItems.length === 0) {
                  return (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center bg-white dark:bg-[#0f1219] shadow-xs">
                      No specific rooms have been listed by the property yet.
                    </p>
                  );
                }

                return roomItems.map((roomItem, rIdx) => {
                  const startingPrice = roomItem.price;
                  const stayTotal = startingPrice * nights * rooms;
                  const maxGuests = roomItem.maxGuests;
                  const bedType = roomItem.bedType;
                  const roomSize = roomItem.roomSize;
                  const bathroomType = roomItem.bathroomType;
                  const perks = roomItem.perks;
                  const roomAmenities = roomItem.roomAmenities;
                  const thumb = roomItem.thumb;
                  const isNonAc = roomItem.name?.toLowerCase().includes('non ac') || roomItem.name?.toLowerCase().includes('non-ac');

                  const servicePayloadForModal = {
                    ...roomItem.parentService,
                    id: roomItem.parentService.id,
                    selectedListingId: roomItem.id,
                    name: roomItem.name,
                    description: roomItem.description,
                    price: roomItem.price,
                    basePrice: roomItem.price,
                    imageUrl: thumb,
                    images: roomItem.gallery,
                    metadata: {
                      ...(roomItem.parentService.metadata || {}),
                      ...(roomItem.listing?.metadata || {}),
                      gallery: roomItem.gallery,
                      addons: roomItem.addons,
                      maxGuests,
                      bedType,
                      sizeSqFt: roomSize,
                      bathroomType,
                      perks,
                      amenities: roomAmenities,
                      listings: roomItem.listing ? [roomItem.listing] : (roomItem.parentService.metadata?.listings || [])
                    }
                  };

                  const listingMeta = roomItem.listing?.metadata || {};
                  const merchantOriginalPrice = Number(listingMeta.originalPrice ?? (roomItem.listing as any)?.originalPrice ?? 0);
                  const merchantDiscountPct = Number(listingMeta.discountPercentage ?? (roomItem.listing as any)?.discountPercentage ?? 0);
                  const offerBadgeText = listingMeta.offerBadge || (roomItem.listing as any)?.offerBadge || '';
                  const merchantBannerTagline = listingMeta.bannerTagline || (roomItem.listing as any)?.bannerTagline || '';

                  // Dynamic original price & discount calculation:
                  // 1) If merchant gave explicit discount % (e.g. 10%), use that directly!
                  // 2) If merchant gave original price > selling price, calculate %
                  // 3) Fallback to 20% standard only if neither is provided
                  let discountPct = 20;
                  let originalPrice = Math.round(startingPrice * 1.25);

                  if (merchantDiscountPct > 0) {
                    discountPct = merchantDiscountPct;
                    originalPrice = merchantOriginalPrice > startingPrice
                      ? merchantOriginalPrice
                      : Math.round(startingPrice / (1 - merchantDiscountPct / 100));
                  } else if (merchantOriginalPrice > startingPrice) {
                    originalPrice = merchantOriginalPrice;
                    discountPct = Math.round(((merchantOriginalPrice - startingPrice) / merchantOriginalPrice) * 100);
                  }

                  const roomGallery = (roomItem.gallery && roomItem.gallery.length > 0) ? roomItem.gallery : [thumb];
                  const totalReviews = 120 + ((rIdx * 17) % 45);
                  const roomRating = (4.7 + ((rIdx * 0.1) % 0.3)).toFixed(1);

                  return (
                    <div
                      key={roomItem.id || rIdx}
                      className="bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                        {/* ==============================================================
                         * COLUMN 1: LEFT (lg:col-span-4) - Image Carousel + Thumbnails + Title/Bio
                         * ============================================================== */}
                        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Main Room Image with badges & navigation */}
                            <div
                              onClick={() => {
                                setActiveRoomService(servicePayloadForModal);
                                setRoomModalStep('DETAILS');
                                setSelectedAddonIds([]);
                                setRoomModalImageIdx(0);
                              }}
                              className="h-56 sm:h-64 rounded-2xl overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800"
                            >
                              <img
                                src={thumb}
                                alt={roomItem.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                              />
                              {/* Remaining Units Badge */}
                              <div className="absolute top-3 left-3 bg-[#033266]/90 dark:bg-[#ff6325]/90 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-black text-white flex items-center gap-1.5 shadow-md">
                                <Users size={12} />
                                <span>{roomItem.listing?.metadata?.totalUnits ? `${roomItem.listing.metadata.totalUnits} UNITS LEFT` : '3 UNITS LEFT'}</span>
                              </div>

                              {/* See Photos Pill Button */}
                              <button
                                type="button"
                                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <span>📷</span>
                                <span>See Photos ({roomGallery.length})</span>
                              </button>

                              {/* Dot Indicators */}
                              {roomGallery.length > 1 && (
                                <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                                  {roomGallery.slice(0, 5).map((_: string, dotIdx: number) => (
                                    <span
                                      key={dotIdx}
                                      className={`w-1.5 h-1.5 rounded-full ${dotIdx === 0 ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Thumbnail Row */}
                            {roomGallery.length > 1 && (
                              <div className="grid grid-cols-5 gap-2 mt-2.5">
                                {roomGallery.slice(0, 5).map((imgUrl: string, tIdx: number) => (
                                  <div
                                    key={tIdx}
                                    onClick={() => {
                                      setActiveRoomService(servicePayloadForModal);
                                      setRoomModalStep('DETAILS');
                                      setSelectedAddonIds([]);
                                      setRoomModalImageIdx(tIdx);
                                    }}
                                    className={`h-12 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${tIdx === 0
                                      ? 'border-[#033266] dark:border-[#ff6325]'
                                      : 'border-transparent opacity-75 hover:opacity-100'
                                      }`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Room Title & Reviews */}
                            <div className="mt-4">
                              <h3
                                onClick={() => {
                                  setActiveRoomService(servicePayloadForModal);
                                  setRoomModalStep('DETAILS');
                                  setSelectedAddonIds([]);
                                  setRoomModalImageIdx(0);
                                }}
                                className="font-black text-xl text-slate-900 dark:text-white hover:text-[#033266] dark:hover:text-[#ff6325] cursor-pointer transition-colors tracking-tight"
                              >
                                {roomItem.name}
                              </h3>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-xs">
                                  ★ {roomRating}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  ({totalReviews} Reviews)
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                                {roomItem.description || `${roomItem.name} featuring premium bedding, spacious ensuite bathroom, and modern guest amenities for a truly luxurious stay.`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ==============================================================
                         * COLUMN 2: MIDDLE (lg:col-span-5) - Inclusions, Perks & Specs Grid
                         * ============================================================== */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Instant Confirmation Pill */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/50 mb-3">
                              <CheckCircle2 size={13} className="shrink-0" />
                              <span>Instant Confirmation</span>
                            </div>

                            {/* Inclusions List with Green Checkmarks */}
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                <CheckCircle2 size={13} className="shrink-0" />
                                <span>Free Cancellation (up to 24h before check-in)</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                <CheckCircle2 size={13} className="shrink-0" />
                                <span>Free High-Speed Wi-Fi in unit</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                <CheckCircle2 size={13} className="shrink-0" />
                                <span>Complimentary Bottled Water & Clean Linens</span>
                              </div>
                            </div>

                            {/* 2-Column Specs Grid (Light Blue / Clean Slate Box) */}
                            <div className="grid grid-cols-2 gap-3.5 p-4 mt-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-xs">
                              {/* Left specs: Perks & Highlights */}
                              <div className="space-y-2.5">
                                {perks.length > 0 ? (
                                  perks.slice(0, 4).map((perk: string, pIdx: number) => {
                                    const cleanPerk = (perk || '')
                                      .replace(/([a-z])([A-Z])/g, '$1 $2')
                                      .replace(/Freelaunch/i, 'Free Lunch')
                                      .replace(/freedinner/i, 'Free Dinner')
                                      .replace(/Freewifi/i, 'Free Wi-Fi')
                                      .replace(/smarttv/i, 'Smart TV')
                                      .replace(/balconyview/i, 'Balcony View')
                                      .replace(/oceanview/i, 'Ocean View')
                                      .replace(/seaview/i, 'Sea View')
                                      .replace(/swimmingpool/i, 'Swimming Pool')
                                      .replace(/ComplimentorbuffetBreakfast/i, 'Buffet Breakfast')
                                      .trim();
                                    const formattedPerk = cleanPerk.charAt(0).toUpperCase() + cleanPerk.slice(1);
                                    return (
                                      <div key={pIdx} className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                        <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">✨</span>
                                        <span className="leading-snug">{formattedPerk}</span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🏊</span>
                                      <span className="leading-snug">Private Plunge Pool</span>
                                    </div>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🌅</span>
                                      <span className="leading-snug">Sunset Deck View</span>
                                    </div>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🍳</span>
                                      <span className="leading-snug">Floating Breakfast</span>
                                    </div>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🛎️</span>
                                      <span className="leading-snug">24/7 Butler Support</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Right specs: Capacity, Bed, Size, Bath, AC */}
                              <div className="space-y-2.5">
                                <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                  <Users size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0 mt-0.5" />
                                  <span className="leading-snug">{typeof maxGuests === 'string' && maxGuests.toLowerCase().includes('guest') ? maxGuests : `Max ${maxGuests} Guests`}</span>
                                </div>
                                {bedType && (
                                  <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                    <Bed size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0 mt-0.5" />
                                    <span className="leading-snug">{bedType}</span>
                                  </div>
                                )}
                                {roomSize && (
                                  <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                    <span className="text-xs shrink-0 mt-0.5">📐</span>
                                    <span className="leading-snug">{roomSize} sq.ft / {(Number(roomSize) * 0.0929).toFixed(0)} m²</span>
                                  </div>
                                )}
                                {bathroomType && (
                                  <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                    <span className="text-xs shrink-0 mt-0.5">🚿</span>
                                    <span className="leading-snug">{bathroomType} Ensuite</span>
                                  </div>
                                )}
                                <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                  <span className="shrink-0 mt-0.5">{isNonAc ? '💨' : '❄️'}</span>
                                  <span className="leading-snug">{isNonAc ? 'Non-AC / Fan' : 'Air Conditioned'}</span>
                                </div>
                              </div>
                            </div>

                            {/* See room specs trigger link */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRoomService(servicePayloadForModal);
                                setRoomModalStep('DETAILS');
                                setSelectedAddonIds([]);
                                setRoomModalImageIdx(0);
                              }}
                              className="text-xs font-bold text-[#033266] dark:text-[#ff6325] hover:underline cursor-pointer inline-flex items-center gap-1 mt-3"
                            >
                              <span>See room specs & policies &rarr;</span>
                            </button>
                          </div>

                          {/* 3 Trust Badges Footer: Secure Booking, 24/7 Guest Support, Best Price */}
                          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-[10px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                              <ShieldCheck size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span className="leading-tight">100% Secure Booking</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                              <Headphones size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span className="leading-tight">24/7 Guest Support</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                              <Award size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span className="leading-tight">Best Price Guarantee</span>
                            </div>
                          </div>
                        </div>

                        {/* ==============================================================
                         * COLUMN 3: RIGHT (lg:col-span-3) - Pricing Box, Book Button & Getaway Card
                         * ============================================================== */}
                        <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 pt-5 lg:pt-0 lg:pl-6">
                          <div>
                            {/* Strikethrough original rate & Discount Badge */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-400 line-through">
                                ₹{originalPrice.toLocaleString()}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-black border border-rose-200 dark:border-rose-900/40">
                                -{discountPct}%
                              </span>
                            </div>

                            {/* Main Nightly Price */}
                            <div className="mt-1">
                              <span className="text-3xl font-black text-[#033266] dark:text-[#ff6325] tracking-tight">
                                ₹{startingPrice.toLocaleString()}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">
                                per night before taxes
                              </span>
                            </div>

                            {/* Total Stay Price Calculation */}
                            <div className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                              Total: ₹{stayTotal.toLocaleString()} ({nights} Night{nights > 1 ? 's' : ''})
                            </div>

                            {/* Big Primary Book Room Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const partnerListingAddons = roomItem.addons || [];

                                if (partnerListingAddons.length > 0) {
                                  setActiveRoomService(servicePayloadForModal);
                                  setRoomModalStep('ADDONS');
                                  setSelectedAddonIds([]);
                                  setRoomModalImageIdx(0);
                                } else {
                                  const roomPrice = startingPrice;
                                  const roomTotal = roomPrice * nights * rooms;
                                  const slotStr = `${checkIn} to ${checkOut} (${nights} Night${nights > 1 ? 's' : ''}) • ${adults + children} Guests • ${rooms} Room${rooms > 1 ? 's' : ''}`;

                                  setSelectedService({
                                    ...servicePayloadForModal,
                                    price: roomTotal,
                                    name: `${venueName} — ${roomItem.name}`,
                                    selectedListing: roomItem.listing || undefined,
                                    metadata: {
                                      ...(servicePayloadForModal.metadata || {}),
                                      hotelBooking: {
                                        venueName,
                                        address,
                                        roomType: roomItem.name,
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
                                }
                              }}
                              className="w-full mt-4 py-3.5 bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Calendar size={15} />
                              <span>BOOK ROOM &rarr;</span>
                            </button>

                            {/* Micro guarantee badge */}
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 text-center mt-2.5">
                              FREE Cancellation • Pay later available
                            </div>

                            {/* Urgent Scarcity Callout Box with Dynamic Merchant Offer Badge */}
                            <div className="mt-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-start gap-2.5">
                              <span className="text-[#033266] dark:text-[#ff6325] font-black text-base shrink-0 leading-none">⚡</span>
                              <div>
                                <span className="text-xs font-black text-slate-900 dark:text-white block">
                                  {offerBadgeText ? offerBadgeText : `Only ${roomItem.listing?.metadata?.totalUnits || 3} units left at this price!`}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {offerBadgeText ? `Book now before offer expires.` : `Book now before it's gone.`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Promotional Getaway Banner */}
                          <div className="h-32 rounded-2xl overflow-hidden relative shadow-inner border border-slate-200 dark:border-white/10 group">
                            <img
                              src={thumb}
                              alt="Getaway"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3.5">
                              <span className="font-serif italic text-white text-base font-bold drop-shadow-md">
                                {merchantBannerTagline ? merchantBannerTagline : 'Your Perfect Getaway Awaits'}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ============================================================
         * SECTION D1: AGODA-STYLE SUB-NAV & OVERVIEW (AFTER SELECT ROOM)
         * ============================================================ */}
        <div className="space-y-6 mb-10">
          {/* 1. Agoda Sub-Navigation Bar (Removed Rooms button, Dynamic Tab Switching) */}
          <div className="bg-white dark:bg-[#0f1219] rounded-2xl border border-slate-200/90 dark:border-white/10 p-2 sm:px-4 shadow-2xs flex items-center justify-start overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setActiveSubNavTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                  activeSubNavTab === 'overview'
                    ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveSubNavTab('facilities')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                  activeSubNavTab === 'facilities'
                    ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Facilities
              </button>
              <button
                type="button"
                onClick={() => setActiveSubNavTab('location')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                  activeSubNavTab === 'location'
                    ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Location
              </button>
              <button
                type="button"
                onClick={() => setActiveSubNavTab('policies')}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                  activeSubNavTab === 'policies'
                    ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Policies
              </button>
            </div>
          </div>

          {/* 2. Main Agoda Content — Header stays in place, content below switches dynamically */}
          <div id="agoda-overview-section" className="space-y-6">

            {/* TAB CONTENT: OVERVIEW (Name Card + Highlights + Staycation + About + Mini Map sidebar) */}
            {activeSubNavTab === 'overview' && (
              <div className="space-y-6">
                {/* Property Identity & Address (Only in Overview) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                      {finalMerchantObj.metadata?.offerBadge || 'Best Seller'}
                    </span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                      <span>★ ★ ★ ★</span>
                      <span className="text-[10px] text-slate-400 font-semibold ml-1">BokSpot Preferred</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {venueName}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center flex-wrap gap-1.5">
                      <span>{address || `${city || 'Chennai'}, Tamil Nadu`}</span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setActiveSubNavTab('location')}
                        className="text-[#033266] dark:text-[#ff6325] font-extrabold hover:underline uppercase text-[11px] cursor-pointer"
                      >
                        SEE MAP
                      </button>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Highlights */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Highlights
                    </h3>
                    <div className="space-y-3.5">
                      {(() => {
                        const defaultStayHighlights = [
                          {
                            icon: '🍳',
                            title: 'Great breakfast & inclusions',
                            description: finalMerchantObj.metadata?.breakfastDetails || 'Breakfast buffet gets strong praise for its wide spread, varied choices, and fresh multi-cuisine preparations.'
                          },
                          {
                            icon: '🍽️',
                            title: 'Great food & dining',
                            description: 'In-house multi-cuisine dining options with seafood specialties and room service options praised by guests.'
                          },
                          {
                            icon: '🛎️',
                            title: 'Professional guest services',
                            description: 'Dedicated 24/7 front desk, warm concierge, express check-in, and personalized butler assistance.'
                          },
                          {
                            icon: '✨',
                            title: 'Sparkling clean & hygienic',
                            description: 'Rooms are regularly sanitized and described as clean, neat, and well kept with spotless linen.'
                          },
                          {
                            icon: '🏊',
                            title: 'Top property leisure facilities',
                            description: 'Private swimming pool, lawn garden, sun deck, and entertainment conveniences designed for staycations.'
                          }
                        ];

                        const defaultFacilityHighlights = [
                          {
                            icon: '⚽',
                            title: 'FIFA Standard Astro Turf',
                            description: 'High-density 50mm monofilament synthetic grass with shock-absorbing rubber infill engineered for all-weather play.'
                          },
                          {
                            icon: '💡',
                            title: 'High-Mast LED Floodlights',
                            description: 'Stadium-grade anti-glare illumination across all pitch zones ensuring seamless evening and late-night matches.'
                          },
                          {
                            icon: '🚿',
                            title: 'Player Changing Rooms & Showers',
                            description: 'Hygienic private dressing rooms, lockers, and clean showers ready for teams before and after games.'
                          },
                          {
                            icon: '🪑',
                            title: 'Covered Team Dugouts & Spectator Seating',
                            description: 'Weather-protected substitutes benches, scoring tables, and viewing spaces for fans and guests.'
                          },
                          {
                            icon: '🚗',
                            title: 'Dedicated Parking & Amenities',
                            description: 'Spacious on-site two-wheeler and car parking, RO drinking water dispenser, and first-aid support.'
                          }
                        ];

                        const activeHighlights = isFacility
                          ? ((Array.isArray(firstSvc?.metadata?.highlights) && firstSvc.metadata.highlights.length > 0)
                              ? firstSvc.metadata.highlights
                              : defaultFacilityHighlights)
                          : ((Array.isArray(finalMerchantObj.metadata?.highlights) && finalMerchantObj.metadata.highlights.length > 0)
                              ? finalMerchantObj.metadata.highlights
                              : defaultStayHighlights);

                        return activeHighlights.map((hl: any, idx: number) => {
                          const iconBgColors = [
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                            'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                            'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                            'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          ];
                          const colorClass = iconBgColors[idx % iconBgColors.length];

                          return (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${colorClass}`}>
                                {hl.icon || '⭐'}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                  {hl.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                  {hl.description}
                                </p>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>


                  {/* About Us */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      About us
                    </h3>
                    <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      <p>
                        {aboutText
                          ? (isAboutExpanded || aboutText.length <= 260 ? aboutText : `${aboutText.slice(0, 260)}...`)
                          : `Indulge in a luxurious stay at ${venueName} situated on the scenic ${city || 'Chennai'} corridor. Immerse yourself in the vibrant culture while exploring nearby beaches, entertainment hubs, and serene gardens. Experience signature hospitality, private pools, and bespoke concierge care.`}
                      </p>
                      {aboutText && aboutText.length > 260 && (
                        <button
                          type="button"
                          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                          className="mt-2 text-xs font-extrabold text-[#033266] dark:text-[#ff6325] hover:underline cursor-pointer block"
                        >
                          {isAboutExpanded ? 'Show less ↑' : 'Read more →'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column (4 cols) Map Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                    {/* Map Preview */}
                    {(() => {
                      const lat = finalMerchantObj.latitude || liveServices[0]?.merchantObj?.latitude;
                      const lng = finalMerchantObj.longitude || liveServices[0]?.merchantObj?.longitude;
                      const mapQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(address || venueName || 'Chennai');

                      return (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 bg-slate-100 dark:bg-slate-800 group shadow-sm">
                          <div className="h-40 w-full relative">
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
                          <button
                            type="button"
                            onClick={() => setActiveSubNavTab('location')}
                            className="absolute inset-0 bg-black/30 hover:bg-black/40 flex items-center justify-center transition-colors group cursor-pointer"
                          >
                            <span className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                              SEE MAP
                            </span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Location Score Pill */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          8.2 Excellent
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                          Top Rated Area
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Excellent location — situated conveniently near beaches and transport routes in {city || 'Chennai'}.
                      </p>
                    </div>

                    {/* Parking Tag */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">🅿️ Parking</span>
                      <span className="text-emerald-600 dark:text-emerald-400 uppercase font-black text-[11px]">FREE</span>
                    </div>

                    {/* What's Nearby Distances */}
                    {Array.isArray(finalMerchantObj.metadata?.aroundProperty) && finalMerchantObj.metadata.aroundProperty.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                        <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block tracking-wider">
                          See nearby places
                        </span>
                        <div className="space-y-2">
                          {finalMerchantObj.metadata.aroundProperty.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                                📍 {item.name || item.title}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] shrink-0">
                                {item.distance || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* TAB CONTENT: FACILITIES (Full Grid) */}
            {activeSubNavTab === 'facilities' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Property Facilities & Inclusions
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Verified amenities provided directly for guests staying at {venueName}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#033266]/5 dark:bg-[#ff6325]/10 text-[#033266] dark:text-[#ff6325] font-black text-xs">
                    {amenities.length} Verified Facilities
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {(amenities.length > 0 ? amenities : ['Free Wi-Fi', 'Swimming pool', 'Free parking', 'Spa & Jacuzzi', 'Front desk [24-hour]', 'Fitness center', 'Restaurants', 'Bar & Lounge', 'Air Conditioned', 'Daily Housekeeping', 'Butler Service', 'Power Backup']).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 shadow-2xs">
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: LOCATION (Full interactive map + Directions + Places) */}
            {activeSubNavTab === 'location' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Location & Nearby Landmarks
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {address || `${city || 'Chennai'}, Tamil Nadu`}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                    8.2 Top Rated Location
                  </span>
                </div>

                {(() => {
                  const lat = finalMerchantObj.latitude || liveServices[0]?.merchantObj?.latitude;
                  const lng = finalMerchantObj.longitude || liveServices[0]?.merchantObj?.longitude;
                  const mapQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(address || venueName || 'Chennai');

                  return (
                    <div className="space-y-4">
                      <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative">
                        <iframe
                          title="Property Location Detailed Map"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Need driving navigation directly in Google Maps?
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#033266] dark:bg-[#ff6325] text-white rounded-xl text-xs font-black shadow-sm hover:opacity-95 transition-opacity"
                        >
                          Open in Google Maps →
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Nearby Places */}
                {Array.isArray(finalMerchantObj.metadata?.aroundProperty) && finalMerchantObj.metadata.aroundProperty.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Walking & Driving Distances
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {finalMerchantObj.metadata.aroundProperty.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            📍 {item.name || item.title}
                          </span>
                          <span className="text-xs font-extrabold text-[#033266] dark:text-[#ff6325] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 shadow-2xs">
                            {item.distance || ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: POLICIES (Full detailed list) */}
            {activeSubNavTab === 'policies' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-5">
                <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📋</span> Property Policies & Stay Rules
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Important rules and check-in guidelines for guests staying at {venueName}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {(Array.isArray(finalMerchantObj.metadata?.policies) && finalMerchantObj.metadata.policies.length > 0
                    ? finalMerchantObj.metadata.policies
                    : [
                      'Valid Government ID required for all guests at check-in (Aadhaar / Passport / DL)',
                      `Standard Check-in is ${finalMerchantObj.metadata?.checkInTime || '12:00 PM'} and Check-out is ${finalMerchantObj.metadata?.checkOutTime || '11:00 AM'}`,
                      'Couples and families are warmly welcome',
                      'Smoking strictly prohibited in air-conditioned suites and indoor areas',
                      'Pets permitted in designated private villa lawns with prior intimation',
                      'Quiet hours observed after 10:30 PM for guest relaxation'
                    ]
                  ).map((policy: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                      <span className="text-[#033266] dark:text-[#ff6325] font-black text-sm mt-0.5">•</span>
                      <span className="leading-relaxed">{policy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>





        {/* ============================================================
         * SECTION D5: APPOINTMENTS & CLINIC/SALON QUEUE (ARCHETYPE 3: TimeSlot)
         * ============================================================ */}
        {isAppointment && (
          <div className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🩺</span> {category === 'doctor' ? 'Doctor Appointment & Token Queue' : 'Specialist & Salon Appointment'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Guaranteed slot with live OPD token queue estimate to avoid waiting room congestion.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                <span>⏱️ Live Token Serving: #{tokenQueueNum - 3}</span>
              </div>
            </div>

            {/* Practitioner Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Select Specialist / Doctor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Dr. Rajesh Kumar (Senior Consultant)', fee: 600, exp: '14+ yrs exp • MBBS, MD' },
                  { name: 'Dr. Priya Sundaram (Associate Specialist)', fee: 450, exp: '8+ yrs exp • DNB, Fellow' }
                ].map(spec => (
                  <div
                    key={spec.name}
                    onClick={() => setSelectedPractitioner(spec.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedPractitioner === spec.name
                      ? 'bg-[#033266]/5 dark:bg-[#ff6325]/10 border-[#033266] dark:border-[#ff6325]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{spec.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{spec.exp}</p>
                    </div>
                    <span className="text-sm font-black text-[#033266] dark:text-[#ff6325]">₹{spec.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultation Slots */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Available Appointment Windows
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'].map(slot => {
                  const isSelected = selectedApptSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedApptSlot(slot)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                        ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325] text-slate-900 dark:text-white'
                        }`}
                    >
                      <span className="text-xs font-black block">{slot}</span>
                      <span className="text-[10px] opacity-75 font-medium mt-0.5 block">Token #{tokenQueueNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Patient Symptoms / Reason */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Brief Symptoms or Visit Notes (Optional)
              </label>
              <input
                type="text"
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="e.g., Routine fever checkup, throat irritation since 2 days..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#033266] dark:focus:border-[#ff6325]"
              />
            </div>

            {/* Confirm Consultation Card */}
            {selectedApptSlot && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {selectedPractitioner}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {selectedDate} at {selectedApptSlot} • Est. Token #{tokenQueueNum}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const fee = selectedPractitioner.includes('Rajesh') ? 600 : 450;
                    setSelectedService({
                      id: `appt-${Date.now()}`,
                      name: `${venueName} — ${selectedPractitioner}`,
                      price: fee,
                      metadata: {
                        appointmentBooking: {
                          venueName,
                          practitioner: selectedPractitioner,
                          slotTime: selectedApptSlot,
                          slotDate: selectedDate,
                          tokenNum: tokenQueueNum,
                          patientNotes
                        }
                      }
                    });
                    setSelectedSlot({
                      id: `token-${tokenQueueNum}`,
                      timeStr: `${selectedDate} at ${selectedApptSlot} (Token #${tokenQueueNum})`,
                      date: selectedDate,
                      available: true
                    });
                    router.push('/booking/checkout');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
                >
                  Confirm Appointment (₹{selectedPractitioner.includes('Rajesh') ? '600' : '450'}) &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
         * SECTION D6: SELF-DRIVE & VEHICLE RENTALS (ARCHETYPE 4: AssetRental)
         * ============================================================ */}
        {isRental && (
          <div className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚗</span> Vehicle / Equipment Rental Selection
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  100% Tax-Exempt Security Deposit refunded immediately upon safe return.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold">
                <span>🛡️ Zero Deposit Deductions Guarantee</span>
              </div>
            </div>

            {/* Rental Duration Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Pick-up Date
                </label>
                <input
                  type="date"
                  value={rentalStartDate}
                  onChange={(e) => setRentalStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Return Date
                </label>
                <input
                  type="date"
                  value={rentalEndDate}
                  onChange={(e) => setRentalEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Total Rental Days
                </label>
                <select
                  value={rentalDays}
                  onChange={(e) => setRentalDays(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  {[1, 2, 3, 5, 7, 14, 30].map(d => (
                    <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mandatory DL / ID Verification Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🪪</span>
                <div>
                  <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                    Mandatory Driving License / Govt ID Check
                  </h4>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    Required at handover for vehicle insurance coverage.
                  </p>
                </div>
              </div>
              <label className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0">
                <span>{uploadedDlName ? `✓ ${uploadedDlName}` : 'Upload DL / ID Document'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setUploadedDlName(e.target.files[0].name);
                  }}
                />
              </label>
            </div>

            {/* Rental Breakdown Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  {liveServices[0]?.name || 'Standard Vehicle Rental'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  ₹1,500/day × {rentalDays} days (₹{1500 * rentalDays}) + ₹2,000 Refundable Security Deposit
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                  <span className="text-xl font-black text-[#033266] dark:text-[#ff6325]">
                    ₹{(1500 * rentalDays + 2000).toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const baseDaily = 1500;
                    const deposit = 2000;
                    const total = baseDaily * rentalDays + deposit;
                    setSelectedService({
                      id: `rental-${Date.now()}`,
                      name: `${venueName} — Rental`,
                      price: total,
                      metadata: {
                        rentalBooking: {
                          venueName,
                          rentalDays,
                          rentalStartDate,
                          rentalEndDate,
                          securityDeposit: deposit,
                          uploadedDoc: uploadedDlName || 'Verified at Counter'
                        }
                      }
                    });
                    setSelectedSlot({
                      id: `rental-slot-${Date.now()}`,
                      timeStr: `${rentalStartDate} to ${rentalEndDate} (${rentalDays} Days)`,
                      date: rentalStartDate,
                      available: true
                    });
                    router.push('/booking/checkout');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  Reserve Vehicle &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
         * SECTION D7: PASSES, MOVIES & TURNSTILE ENTRY (ARCHETYPE 5: PassEntry)
         * ============================================================ */}
        {isPass && (
          <div className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎟️</span> Event Passes & Turnstile Entry
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instant digital turnstile QR pass delivered via BNX SMS & WhatsApp.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 text-xs font-bold">
                <span>📱 Scan QR for Turnstile Entry</span>
              </div>
            </div>

            {/* Pass Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Silver General', price: 299, desc: 'Single Entry • Standard Zone' },
                { name: 'Standard VIP', price: 599, desc: 'Priority Gate Entry • Lounge Access' },
                { name: 'Platinum All-Access', price: 999, desc: 'VIP Lounge + F&B Voucher included' }
              ].map(tier => (
                <div
                  key={tier.name}
                  onClick={() => setSelectedTier(tier.name)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${selectedTier === tier.name
                    ? 'bg-[#033266]/5 dark:bg-[#ff6325]/10 border-[#033266] dark:border-[#ff6325]'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{tier.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{tier.desc}</p>
                  </div>
                  <span className="text-base font-black text-[#033266] dark:text-[#ff6325] mt-3">₹{tier.price} / pass</span>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Number of Attendees / Passes</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Max 10 passes per transaction</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassCount(Math.max(1, passCount - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 font-bold text-sm text-slate-900 dark:text-white"
                >
                  -
                </button>
                <span className="text-sm font-black text-slate-900 dark:text-white w-4 text-center">{passCount}</span>
                <button
                  type="button"
                  onClick={() => setPassCount(Math.min(10, passCount + 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 font-bold text-sm text-slate-900 dark:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* F&B Snack Combo Add-on */}
            <div
              onClick={() => setPopcornComboAddon(!popcornComboAddon)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${popcornComboAddon
                ? 'bg-amber-500/10 border-amber-500'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍿</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Add Large Tub Popcorn & Beverage Combo</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Save 25% compared to counter price</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">+₹250</span>
            </div>

            {/* Confirm Passes Card */}
            {(() => {
              const tierPrices: Record<string, number> = { 'Silver General': 299, 'Standard VIP': 599, 'Platinum All-Access': 999 };
              const unitPrice = tierPrices[selectedTier] || 599;
              const subtotal = unitPrice * passCount + (popcornComboAddon ? 250 : 0);

              return (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {selectedTier} ({passCount} Pass{passCount > 1 ? 'es' : ''})
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      {popcornComboAddon ? 'Includes F&B Combo • ' : ''}Valid for event date
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                      <span className="text-xl font-black text-[#033266] dark:text-[#ff6325]">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService({
                          id: `pass-${Date.now()}`,
                          name: `${venueName} — ${selectedTier}`,
                          price: subtotal,
                          metadata: {
                            passBooking: {
                              venueName,
                              tier: selectedTier,
                              passCount,
                              popcornComboAddon,
                              totalPayable: subtotal
                            }
                          }
                        });
                        setSelectedSlot({
                          id: `pass-slot-${Date.now()}`,
                          timeStr: `${passCount} × ${selectedTier} (Digital Pass)`,
                          date: selectedDate,
                          available: true
                        });
                        router.push('/booking/checkout');
                      }}
                      className="px-6 py-3 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      Get {passCount} Pass{passCount > 1 ? 'es' : ''} &rarr;
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================
         * SECTION D8: HOME REPAIR & CLEANING VISITS (ARCHETYPE 6: HomeCall)
         * ============================================================ */}
        {isHomeCall && (
          <div className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🛠️</span> Doorstep Home Visit & Inspection
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pay only ₹199 inspection fee upfront. Spare parts and extra labor quoted after physical check.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50 text-xs font-bold">
                <span>🛡️ BOKSPOT 30-Day Service Guarantee</span>
              </div>
            </div>

            {/* Service Category */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Type of Issue / Service Needed
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Inspection & Diagnosis', 'Major Repair / Wiring', 'Periodic Maintenance'].map(cat => (
                  <div
                    key={cat}
                    onClick={() => setHomeIssueCategory(cat)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${homeIssueCategory === cat
                      ? 'bg-[#033266]/5 dark:bg-[#ff6325]/10 border-[#033266] dark:border-[#ff6325]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{cat}</span>
                    <span className="text-xs font-black text-[#033266] dark:text-[#ff6325]">₹199</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Visit Time Slot */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Select Technician Arrival Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  'Morning (09:00 AM - 12:00 PM)',
                  'Afternoon (01:00 PM - 04:00 PM)',
                  'Evening (04:30 PM - 07:30 PM)'
                ].map(win => (
                  <button
                    key={win}
                    type="button"
                    onClick={() => setPreferredHomeWindow(win)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${preferredHomeWindow === win
                      ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325] text-slate-900 dark:text-white'
                      }`}
                  >
                    <span className="text-xs font-black block">{win}</span>
                    <span className="text-[10px] opacity-75 font-semibold mt-0.5 block">Verified Professional</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Address Input */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Doorstep Service Address
              </label>
              <input
                type="text"
                value={homeAddressLine}
                onChange={(e) => setHomeAddressLine(e.target.value)}
                placeholder="Door / Flat No., Street Name, Apartment Landmark..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#033266] dark:focus:border-[#ff6325]"
              />
            </div>

            {/* Booking Action Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  {homeIssueCategory}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Arrival: {preferredHomeWindow} • ₹199 Inspection Fee
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Upfront Visiting Fee</span>
                  <span className="text-xl font-black text-[#033266] dark:text-[#ff6325]">₹199</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedService({
                      id: `homecall-${Date.now()}`,
                      name: `${venueName} — ${homeIssueCategory}`,
                      price: 199,
                      metadata: {
                        homeCallBooking: {
                          venueName,
                          issueCategory: homeIssueCategory,
                          arrivalWindow: preferredHomeWindow,
                          serviceAddress: homeAddressLine || address,
                          upfrontVisitingFee: 199
                        }
                      }
                    });
                    setSelectedSlot({
                      id: `home-slot-${Date.now()}`,
                      timeStr: `${preferredHomeWindow} (Doorstep Visit)`,
                      date: selectedDate,
                      available: true
                    });
                    router.push('/booking/checkout');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  Book Doorstep Visit &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

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
                  onError={(e) => { e.currentTarget.src = defaultHotelPhotos[currentImageIdx % defaultHotelPhotos.length]; }}
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
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = defaultHotelPhotos[idx % defaultHotelPhotos.length]; }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE TURF MATCH ADD-ONS WORKFLOW MODAL (Resort-Style) ── */}
      <AnimatePresence>
        {isTurfAddonModalOpen && selectedHourSlot && pricingResult && (() => {
          const baseSlotCost = Number(pricingResult.finalPayable) || 1350;
          const activeListingObj = selectedTurfService?.rawListing || liveServices[0]?.metadata?.listings?.[0] || {};
          const activeMetaObj = activeListingObj.metadata || {};
          const defaultAddonsList = [
            { id: 'referee', name: 'Certified Match Referee', price: 300, icon: '👨‍⚖️', desc: 'Official qualified referee for 60 mins match management & fair play.' },
            { id: 'video', name: 'High-Res Match Video Recording', price: 500, icon: '📹', desc: 'Full match recording delivered via HD cloud link within 24 hours.' },
            { id: 'drinks', name: 'Chilled Energy Drinks (Pack of 6)', price: 250, icon: '🧴', desc: 'Ice-chilled electrolyte sports beverages ready at bench.' },
            { id: 'ball', name: 'Extra Pro Match Ball (Size 5)', price: 150, icon: '⚽', desc: 'FIFA standard match ball pumped to regulation pressure.' },
            { id: 'bibs', name: 'Warm-up Bibs Set (10 Pack)', price: 100, icon: '🎽', desc: 'Clean, sanitized breathable neon training bibs.' },
            { id: 'firstaid', name: 'Ice Pack & Recovery First-Aid Kit', price: 120, icon: '🧊', desc: 'Instant cold compress packs, compression straps, and spray.' }
          ];

          const availableAddons = (Array.isArray(activeMetaObj.addons) && activeMetaObj.addons.length > 0)
            ? activeMetaObj.addons.map((a: any, i: number) => ({
                id: a.id || a.name || `addon-${i}`,
                name: a.name || 'Custom Add-on',
                price: Number(a.price) || 0,
                icon: a.icon || '⭐',
                desc: a.description || 'Enhance your match experience.'
              }))
            : defaultAddonsList;

          const addonsTotal = selectedTurfAddons.reduce((sum, addName) => {
            const found = availableAddons.find((a: any) => a.name === addName);
            return sum + (found ? Number(found.price) : 0);
          }, 0);

          const grandTotal = baseSlotCost + addonsTotal;

          const executeTurfBooking = (finalAddons: string[], finalCost: number) => {
            const totalToPay = baseSlotCost + finalCost;
            setSelectedService({
              ...selectedTurfService,
              price: totalToPay,
              name: `${venueName} — ${selectedTurfService?.name || 'Turf Slot'}`,
              metadata: {
                ...(selectedTurfService?.metadata || {}),
                selectedAddons: finalAddons,
                addonsCost: finalCost,
                turfBooking: {
                  venueName,
                  address,
                  slotDate: selectedDate,
                  slotTime: selectedHourSlot,
                  selectedAddons: finalAddons,
                  addonsCost: finalCost,
                  priceBreakdown: {
                    ...pricingResult,
                    finalPayable: totalToPay
                  }
                }
              }
            });

            setSelectedSlot({
              id: `turf-slot-${Date.now()}`,
              timeStr: `${selectedDate} at ${selectedHourSlot} (1 Hour)`,
              date: selectedDate,
              available: true
            });

            setIsTurfAddonModalOpen(false);
            router.push('/booking/checkout');
          };

          return (
            <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 30 }}
                className="w-full sm:max-w-2xl md:max-w-3xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]"
              >
                {/* Modal Top Header */}
                <div className="px-6 py-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Step 2 of 2: Optional Match Add-ons
                    </span>
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white mt-1 tracking-tight flex items-center gap-2">
                      <span>⚽ Upgrade Your Match Session</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      📅 {selectedDate} • ⏰ {selectedHourSlot} • {selectedTurfService?.name || 'Astro Turf'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTurfAddonModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Add-ons Grid */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">✨</span>
                      <div>
                        <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 block">Want official match gear or refreshments?</span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Select any add-ons below or skip to proceed with pure turf slot rental.</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {availableAddons.map((addon: any, aIdx: number) => {
                      const isChecked = selectedTurfAddons.includes(addon.name);

                      return (
                        <div
                          key={aIdx}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedTurfAddons(prev => prev.filter(n => n !== addon.name));
                            } else {
                              setSelectedTurfAddons(prev => [...prev, addon.name]);
                            }
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                            isChecked
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 flex items-center justify-center text-lg shrink-0">
                            {addon.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {addon.name}
                              </h4>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                                +₹{addon.price}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                              {addon.desc}
                            </p>
                          </div>
                          <div className={`h-5 w-5 rounded-md border flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                            isChecked 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'border-slate-300 dark:border-white/20'
                          }`}>
                            {isChecked && '✓'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer (Skip vs Proceed with Add-ons) */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
                  {/* Skip Option */}
                  <button
                    type="button"
                    onClick={() => {
                      executeTurfBooking([], 0);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
                  >
                    Skip Add-ons
                  </button>

                  {/* Proceed to Checkout */}
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Total Payable</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        ₹{grandTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        executeTurfBooking(selectedTurfAddons, addonsTotal);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Payment</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
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

                  // Room gallery from listing / merchant uploads
                  const rawPhotos: string[] = [];
                  if (activeRoomService.images && Array.isArray(activeRoomService.images)) {
                    activeRoomService.images.forEach((img: string) => { if (img && !rawPhotos.includes(img)) rawPhotos.push(img); });
                  }
                  if (activeRoomService.metadata?.gallery && Array.isArray(activeRoomService.metadata.gallery)) {
                    activeRoomService.metadata.gallery.forEach((img: string) => { if (img && !rawPhotos.includes(img)) rawPhotos.push(img); });
                  }
                  if (activeRoomService.imageUrl && !rawPhotos.includes(activeRoomService.imageUrl)) {
                    rawPhotos.unshift(activeRoomService.imageUrl);
                  }
                  const roomPhotos = rawPhotos.length > 0 ? rawPhotos : [
                    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=80',
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80'
                  ];

                  // Check if hotel partner has custom add-ons saved in this listing
                  const rawAddons = roomMeta.addons || activeRoomService.metadata?.addons || activeRoomService.addOns || [];
                  const partnerListingAddons = Array.isArray(rawAddons) ? rawAddons : [];

                  // ONLY show add-ons created directly by the business merchant (No dummy/template duplicates)
                  const availableAddonsList = partnerListingAddons.map((pa: any, pIdx: number) => ({
                    id: `custom-addon-${pIdx}`,
                    name: typeof pa === 'string' ? pa : (pa.name || 'Custom Add-on'),
                    desc: pa.desc || 'Optional enhancement offered directly by host',
                    price: Number(pa.price || pa.cost || 0),
                    tag: 'Included Choice',
                    icon: '✨'
                  }));

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
                                  className={`h-2 rounded-full transition-all cursor-pointer ${roomModalImageIdx === pIdx ? 'w-6 bg-[#033266] dark:bg-[#ff6325]' : 'w-2 bg-white/70'
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
                          {(() => {
                            const rawPerks: string[] = Array.isArray(roomMeta.perks) ? roomMeta.perks : [];
                            const rawAmenities: string[] = Array.isArray(roomMeta.amenities) ? roomMeta.amenities : [];

                            // Formatting helper for camelCase/tight strings like "balconyview" -> "Balcony View", "smartTV" -> "Smart TV"
                            const formatPerkName = (str: string) => {
                              if (!str) return '';
                              const formatted = str
                                .replace(/([a-z])([A-Z])/g, '$1 $2')
                                .replace(/Freelaunch/i, 'Free Lunch')
                                .replace(/freedinner/i, 'Free Dinner')
                                .replace(/Freewifi/i, 'Free Wi-Fi')
                                .replace(/smarttv/i, 'Smart TV')
                                .replace(/balconyview/i, 'Balcony View')
                                .replace(/oceanview/i, 'Ocean View')
                                .replace(/seaview/i, 'Sea View')
                                .replace(/swimmingpool/i, 'Swimming Pool')
                                .replace(/ComplimentorbuffetBreakfast/i, 'Complimentary Buffet Breakfast')
                                .replace(/buffetbreakfast/i, 'Buffet Breakfast')
                                .replace(/firecamp/i, 'Fire Camp')
                                .replace(/waterbottle/i, 'Water Bottle')
                                .trim();
                              return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                            };

                            const dynamicPerks = rawPerks.map(p => ({
                              label: formatPerkName(p),
                              isFreeHighlight: true,
                            }));

                            const dynamicAmenities = rawAmenities.map(a => ({
                              label: formatPerkName(a),
                              isFreeHighlight: false,
                            }));

                            const extraFeatures: { label: string; isFreeHighlight: boolean }[] = [];
                            if (roomMeta.bathroomType) {
                              extraFeatures.push({
                                label: `Private Attached Bathroom (${roomMeta.bathroomType.trim()})`,
                                isFreeHighlight: false,
                              });
                            }
                            if (roomMeta.bedType) {
                              extraFeatures.push({
                                label: `${roomMeta.bedType.trim()} Bed Setup`,
                                isFreeHighlight: false,
                              });
                            }

                            const allInclusions = [...dynamicPerks, ...dynamicAmenities, ...extraFeatures];

                            // Fallback if merchant didn't add any perks or amenities
                            const displayList = allInclusions.length > 0 ? allInclusions : [
                              { label: 'Free High-Speed Wi-Fi', isFreeHighlight: true },
                              { label: 'Free Cancellation (up to 24h before)', isFreeHighlight: true },
                              { label: 'Private Attached Bathroom', isFreeHighlight: false },
                              { label: 'Fresh Linens & Bath Toiletries', isFreeHighlight: false },
                              { label: 'Drinking Water & Electric Kettle', isFreeHighlight: false },
                              { label: 'Daily Housekeeping & Assistance', isFreeHighlight: false },
                            ];

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 dark:text-slate-200">
                                {displayList.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg border font-semibold ${item.isFreeHighlight
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10'
                                      }`}
                                  >
                                    <CheckCircle2
                                      size={15}
                                      className={`shrink-0 ${item.isFreeHighlight
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-[#033266] dark:text-[#ff6325]'
                                        }`}
                                    />
                                    <span>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
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
                          {availableAddonsList.length === 0 ? (
                            <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                              <p className="text-xs font-semibold">No additional paid upgrades configured for this room.</p>
                              <p className="text-[11px] mt-1 text-slate-400">You can proceed directly to checkout.</p>
                            </div>
                          ) : (
                            availableAddonsList.map(addon => {
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
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
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
                                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-[#033266] dark:bg-[#ff6325] border-[#033266] dark:border-[#ff6325] text-white'
                                        : 'border-slate-300 dark:border-white/20 bg-white dark:bg-slate-700'
                                        }`}
                                    >
                                      {isSelected && <Check size={12} />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
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
                        const roomMeta = roomListings[0]?.metadata || activeRoomService.metadata || {};
                        const roomPrice = Number(activeRoomService.price || activeRoomService.basePrice || roomListings[0]?.price) || 2500;
                        const roomTotal = roomPrice * nights * rooms;

                        const rawAddons = roomMeta.addons || activeRoomService.metadata?.addons || activeRoomService.addOns || [];
                        const partnerListingAddons = Array.isArray(rawAddons) ? rawAddons : [];
                        const availableAddonsList = partnerListingAddons.map((pa: any, pIdx: number) => ({
                          id: `custom-addon-${pIdx}`,
                          name: typeof pa === 'string' ? pa : (pa.name || 'Custom Add-on'),
                          price: Number(pa.price || pa.cost || 0),
                        }));

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

        {/* Full-Screen Photo Gallery Lightbox Modal */}
        {isGalleryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-5xl h-[85vh] bg-[#0b0f19] rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Top Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                  <span className="text-white font-black text-sm sm:text-base">{venueName} Gallery</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold">
                    {currentImageIdx + 1} of {galleryImages.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close gallery"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Image View */}
              <div className="relative flex-1 flex items-center justify-center p-4 min-h-0 bg-black/50">
                <img
                  src={galleryImages[currentImageIdx] || galleryImages[0]}
                  alt={`${venueName} photo ${currentImageIdx + 1}`}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
                />

                {/* Left/Right Prev/Next Buttons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 shadow-xl cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      title="Previous photo"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 shadow-xl cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      title="Next photo"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              <div className="p-3 bg-black/70 border-t border-white/10 overflow-x-auto flex items-center gap-2.5 scrollbar-thin scrollbar-thumb-white/20">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${currentImageIdx === idx
                      ? 'border-[#ff6325] scale-105 shadow-md shadow-[#ff6325]/30'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
