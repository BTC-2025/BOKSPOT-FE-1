'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BokspotLoader } from '../../../components/ui/BokspotLoader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, ChevronLeft, MapPin, Star, Clock, Shield, Search, SlidersHorizontal,
  List, Map, AlertCircle, Plane, Train, Bus, Car, Compass, Sparkles, QrCode, Ticket, Grid,
  Luggage, X, RotateCw, CheckCircle2, ShieldCheck, Heart, User, Phone, Check, RefreshCw,
  Navigation, HelpCircle, Activity, AlertTriangle, Bed, Calendar, Users, Plus, Minus, ChevronDown, Headphones
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useLocationStore, useBookingFlowStore, useUserStore, ALL_CITIES, POPULAR_CITIES } from '../../../lib/store';
import { api, Service } from '../../../lib/api';
import { calculateDistance } from '../../../lib/mockData';
import { getSportCategoryConfig } from '../../../lib/sportsData';
import { getEntertainmentCategoryConfig, NOW_SHOWING_MOVIES, MovieListingItem } from '../../../lib/entertainmentData';
import { getDiningConfig, DiningTableType } from '../../../lib/diningData';
import { getWellnessConfig } from '../../../lib/wellnessData';
import { getFitnessConfig } from '../../../lib/fitnessData';
import { getClinicConfig } from '../../../lib/clinicalData';
import { getHomeServiceConfig } from '../../../lib/homeServicesData';
import { Film, Clapperboard, Play, Flame, Utensils, Coffee, Award } from 'lucide-react';

const MapComponent = dynamic(() => import('../../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[color:var(--color-surface-dim)]/50">
      <div className="text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[color:var(--color-primary)] mx-auto mb-2" />
        <p className="text-[10px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider">Syncing Map Overlays...</p>
      </div>
    </div>
  ),
});

const CATEGORY_NAMES: Record<string, string> = {
  // Travel & Transport
  flights: 'Flight Booking',
  trains: 'Train Booking',
  buses: 'Bus Booking',
  ferry: 'Ferry / Boat Booking',
  shuttle: 'Shuttle / Van Booking',
  helicopter: 'Helicopter Booking',
  cabs: 'Cab / Taxi Booking',
  'bike-rental': 'Bike Rental',
  'car-rental': 'Self-Drive Car Rental',

  // Stay & Accommodation
  hotels: 'Hotel Booking',
  hotel: 'Hotel Booking',
  stayhotel: 'Hotel Booking',
  'stay-hotel': 'Hotel Booking',
  resorts: 'Resort Booking',
  resort: 'Resort Booking',
  villas: 'Homestay / Villa',
  villa: 'Homestay / Villa',
  hostels: 'Hostel Booking',
  'pg-hostels': 'PG & Co-Living Stays',
  camping: 'Camping Booking',

  // Entertainment & Events
  movies: 'Cinema / Movie Tickets',
  theatre: 'Theatre Shows',
  concerts: 'Concert Tickets',
  events: 'Events & Festivals',
  exhibitions: 'Exhibition Entry',
  workshops: 'Workshops / Classes',
  gaming: 'Gaming Arena Booking',

  // Sports & Turf
  'football-turf': 'Football Turf',
  'cricket-ground': 'Cricket Ground',
  badminton: 'Badminton Court',
  tennis: 'Tennis Court',
  basketball: 'Basketball Court',
  swimming: 'Swimming Pool Slots',
  'play-arena': 'Indoor Play Arena',

  // Lifestyle & Local Services
  dining: 'Restaurant Table Reservation',
  salons: 'Salon / Spa Appointment',
  spa: 'Spa & Wellness Rituals',
  gym: 'Gym Floor & Membership Booking',
  'gym-yoga': 'Gym Floor & Membership Booking',
  yoga: 'Yoga Shala & Meditation Batches',
  'yoga-meditation': 'Yoga Shala & Meditation Batches',
  doctor: 'Doctor Appointment',
  electrician: 'Electrician Booking',
  plumber: 'Plumber Booking',
  cleaning: 'Cleaning Service',
  technician: 'Technician Service',
  studio: 'Studio Booking',

  // Business & Professional
  coworking: 'Co-working Space',
  'meeting-room': 'Meeting Room',
  podcast: 'Podcast Studio',
  conference: 'Conference Hall',
  training: 'Training Sessions',

  // Religious Services
  darshan: 'Temple Darshan Booking',
  pooja: 'Pooja Slot Booking',
  pilgrimage: 'Pilgrimage Packages',

  // Rental & Equipment Booking
  'cycle-rental': 'Cycle Rental',
  'sports-bike': 'Sports Bike Rental',
  camera: 'Camera Rental',
  'sound-system': 'Sound System Rental',
  'event-equip': 'Event Equipment Rental',

  // Personal & Miscellaneous Services
  'pet-grooming': 'Pet Grooming Appointment',
  babysitting: 'Babysitting Service',
  'elder-care': 'Elder Care Service',
  'event-organizer': 'Event Organizer Booking',
};

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price', label: 'Lowest Price' },
  { value: 'reviews', label: 'Most Reviewed' },
];

export function getCategoryHeroTheme(category: string, bookingType: string, city: string, categoryName: string) {
  const normCat = (category || '').toLowerCase();
  const normType = (bookingType || '').toLowerCase();
  const cName = categoryName || 'Experiences';
  const cityName = city || 'Chennai';

  // 1. SPORTS & TURF
  if (
    normType.includes('sport') ||
    ['football-turf', 'cricket-ground', 'badminton', 'tennis', 'basketball', 'swimming', 'play-arena', 'turfs'].includes(normCat)
  ) {
    let img = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80&auto=format&fit=crop';
    if (normCat.includes('cricket')) {
      img = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80&auto=format&fit=crop';
    } else if (normCat.includes('badminton') || normCat.includes('tennis')) {
      img = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1920&q=80&auto=format&fit=crop';
    } else if (normCat.includes('swimming')) {
      img = 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=1920&q=80&auto=format&fit=crop';
    } else if (normCat.includes('basketball')) {
      img = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80&auto=format&fit=crop';
    }

    return {
      bgImage: img,
      subtitle: 'PREMIUM ARENAS • INSTANT SLOT CONFIRMATION',
      title: `Book Top ${cName} in ${cityName}`,
      description: `Reserve floodlit courts, FIFA-grade turfs, and certified sporting arenas with real-time slot lock in ${cityName}.`,
      badge: `${cName.toUpperCase()} • ${cityName.toUpperCase()}`,
      whereLabel: 'WHERE / VENUE',
      wherePlaceholder: `Search ${cName} arenas, clubs or areas in ${cityName}...`,
      searchBtnLabel: 'Search Slots',
    };
  }

  // 2. VEHICLE & GEAR RENTALS
  if (
    normType.includes('rental') ||
    ['car-rental', 'bike-rental', 'cycle-rental', 'sports-bike', 'camera', 'sound-system', 'event-equip'].includes(normCat)
  ) {
    let img = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80&auto=format&fit=crop';
    if (normCat.includes('bike') || normCat.includes('cycle')) {
      img = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1920&q=80&auto=format&fit=crop';
    } else if (normCat.includes('camera') || normCat.includes('sound')) {
      img = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80&auto=format&fit=crop';
    }

    return {
      bgImage: img,
      subtitle: 'SELF-DRIVE & VERIFIED GEAR • ZERO HIDDEN DEPOSIT',
      title: `Rent Top ${cName} in ${cityName}`,
      description: `Explore premium fleet & high-end gear delivered or picked up across ${cityName} with instant security check.`,
      badge: `${cName.toUpperCase()} • ${cityName.toUpperCase()}`,
      whereLabel: 'PICKUP LOCATION',
      wherePlaceholder: `Search pickup hub, station, or landmark in ${cityName}...`,
      searchBtnLabel: 'Find Rentals',
    };
  }

  // 3. ENTERTAINMENT & EVENTS
  if (
    normType.includes('entertainment') ||
    ['movies', 'theatre', 'concerts', 'events', 'exhibitions', 'workshops', 'gaming'].includes(normCat)
  ) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80&auto=format&fit=crop',
      subtitle: 'LIVE EXPERIENCES • INSTANT DIGITAL TICKETS',
      title: `Discover ${cName} in ${cityName}`,
      description: `Experience the best live concerts, blockbusters, and premier shows with verified QR entrance passes.`,
      badge: `${cName.toUpperCase()} • ${cityName.toUpperCase()}`,
      whereLabel: 'CITY / VENUE',
      wherePlaceholder: `Search shows, theatres, or events in ${cityName}...`,
      searchBtnLabel: 'Explore Shows',
    };
  }

  // 4. LIFESTYLE, HEALTHCARE & WELLNESS
  if (
    normType.includes('lifestyle') ||
    ['dining', 'salons', 'gym-yoga', 'doctor', 'pet-grooming', 'studio', 'electrician', 'plumber', 'cleaning'].includes(normCat)
  ) {
    let img = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80&auto=format&fit=crop';
    if (normCat.includes('doctor')) {
      img = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80&auto=format&fit=crop';
    } else if (normCat.includes('dining')) {
      img = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80&auto=format&fit=crop';
    } else if (normCat.includes('gym')) {
      img = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80&auto=format&fit=crop';
    }

    return {
      bgImage: img,
      subtitle: 'VERIFIED SPECIALISTS • ZERO WAITING TIME',
      title: `Book ${cName} in ${cityName}`,
      description: `Connect with certified practitioners, stylists, and local master professionals with doorstep & clinic booking.`,
      badge: `${cName.toUpperCase()} • ${cityName.toUpperCase()}`,
      whereLabel: 'LOCATION / CLINIC',
      wherePlaceholder: `Search clinics, salons, or locations in ${cityName}...`,
      searchBtnLabel: 'Book Appointment',
    };
  }

  // 5. STAYS & ACCOMMODATION (Default hotel reference)
  if (
    normType.includes('stay') ||
    ['hotels', 'resorts', 'villas', 'hostels', 'pg-hostels', 'camping'].includes(normCat)
  ) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80&auto=format&fit=crop',
      subtitle: 'PREMIUM STAYS • BETTER EXPERIENCES',
      title: `Find Your Perfect Stay in ${cityName}`,
      description: `Discover handpicked ${cName.toLowerCase()} & verified stays in ${cityName} for your next getaway or living arrangement.`,
      badge: `${cName.toUpperCase()} • ${cityName.toUpperCase()}`,
      whereLabel: 'WHERE',
      wherePlaceholder: 'Search destination, hotel or city...',
      searchBtnLabel: 'Search Stays',
    };
  }

  // 6. DEFAULT / ALL OTHER 54 CATEGORIES
  return {
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop',
    subtitle: 'CURATED CHOICES • VERIFIED DISPATCH',
    title: `Find & Book ${cName} in ${cityName}`,
    description: `Curated top-rated choices and verified dispatcher portal in ${cityName} with instant confirmation.`,
    badge: `${cName.toUpperCase()} • ${cityName.toUpperCase()}`,
    whereLabel: 'SEARCH / AREA',
    wherePlaceholder: `Search ${cName} in ${cityName}...`,
    searchBtnLabel: 'Search',
  };
}

function MockQRCode({ value }: { value: string }) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  const size = 17;
  const blocks = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isTopLeft = r < 5 && c < 5;
      const isTopRight = r < 5 && c >= size - 5;
      const isBottomLeft = r >= size - 5 && c < 5;

      let fill = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = r < 5 ? r : r >= size - 5 ? r - (size - 5) : r;
        const localC = c < 5 ? c : c >= size - 5 ? c - (size - 5) : c;
        fill = (localR === 0 || localR === 4 || localC === 0 || localC === 4) || (localR === 2 && localC === 2);
      } else {
        const val = Math.abs(Math.sin(hash + r * 19 + c * 31));
        fill = val > 0.48;
      }

      if (fill) {
        blocks.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="currentColor" />);
      }
    }
  }

  return (
    <div className="bg-white p-2 rounded-2xl inline-block shadow-lg border border-slate-200">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24 text-slate-900 animate-scale-up" shapeRendering="crispEdges">
        <rect width={size} height={size} fill="white" />
        {blocks}
      </svg>
    </div>
  );
}

/* ============================================================================
 * 1. CAB SERVICE VIEW (cabs)
 * ============================================================================ */
function CabBookingView({ categoryName, city, initialQuery }: any) {
  const router = useRouter();
  const [pickup, setPickup] = useState(initialQuery?.venue || initialQuery?.city || 'Anna Nagar Metro Station');
  const [drop, setDrop] = useState('Chennai International Airport');
  const [cabType, setCabType] = useState<'mini' | 'sedan' | 'suv' | 'auto'>('mini');
  const [rideState, setRideState] = useState<'idle' | 'searching' | 'driver_found' | 'riding' | 'completed'>('idle');
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const cabDetails = {
    mini: { name: 'Go Mini', price: 160, time: '2 mins away' },
    sedan: { name: 'Prime Sedan', price: 240, time: '3 mins away' },
    suv: { name: 'Luxury SUV', price: 380, time: '5 mins away' },
    auto: { name: 'Auto Express', price: 85, time: '1 min away' },
  };

  const handleBook = () => {
    setRideState('searching');

    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const id = `trv-${Date.now()}`;
    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-cab-${cabType}`,
      serviceName: `Cab Booking (${cabDetails[cabType].name})`,
      merchantName: 'Beta Transit Cabs',
      category: 'cabs',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: cabDetails[cabType].price,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 30,
      customerName,
      customerEmail,
      customerPhone,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced cab booking to backend:', data))
      .catch(err => console.error('Error syncing cab booking to backend:', err));

    setTimeout(() => {
      setRideState('driver_found');
      setTimeout(() => {
        setRideState('riding');
        setTimeout(() => {
          setRideState('completed');
        }, 5000);
      }, 3000);
    }, 3000);
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Car size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Dashboard</span>
        </h2>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 px-2.5 py-1 rounded-full border border-[color:var(--color-primary)]/20">
          Cab Dispatcher
        </span>
      </div>

      {rideState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Pickup Address</label>
              <div className="flex items-center gap-2 border border-[color:var(--color-outline-variant)]/40 rounded-xl px-3 py-2 bg-[color:var(--color-surface-dim)]">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="bg-transparent text-xs w-full outline-none text-[color:var(--color-on-surface)]" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Destination Address</label>
              <div className="flex items-center gap-2 border border-[color:var(--color-outline-variant)]/40 rounded-xl px-3 py-2 bg-[color:var(--color-surface-dim)]">
                <MapPin size={14} className="text-rose-400 shrink-0" />
                <input value={drop} onChange={(e) => setDrop(e.target.value)} className="bg-transparent text-xs w-full outline-none text-[color:var(--color-on-surface)]" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-2">Select Cab Tier</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(cabDetails) as Array<keyof typeof cabDetails>).map((key) => {
                const isSel = cabType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCabType(key)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer hover:scale-102 ${isSel
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 shadow-[0_0_12px_rgba(255,215,0,0.1)]'
                      : 'border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/45'
                      }`}
                  >
                    <span className="text-xs font-bold text-[color:var(--color-on-surface)]">{cabDetails[key].name}</span>
                    <div className="mt-2 flex items-baseline justify-between w-full">
                      <span className="text-sm font-black text-[color:var(--color-primary)]">₹{cabDetails[key].price}</span>
                      <span className="text-[9px] text-[color:var(--color-outline)]">{cabDetails[key].time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleBook}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Car size={14} />
            <span>Confirm Booking — ₹{cabDetails[cabType].price}</span>
          </button>
        </div>
      )}

      {rideState === 'searching' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center h-20 w-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-primary)] opacity-20"></span>
            <div className="relative rounded-full h-14 w-14 bg-[color:var(--color-primary)]/15 border border-[color:var(--color-primary)]/40 flex items-center justify-center text-[color:var(--color-primary)]">
              <Compass size={28} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Matching Nearby Drivers...</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Analyzing satellite telematics & dispatch routes</p>
          </div>
        </div>
      )}

      {rideState === 'driver_found' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-up">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={24} className="scale-110" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Driver Secured!</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Ramesh Kumar is dispatching your vehicle</p>
          </div>
          <div className="bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-2xl p-4 w-full max-w-sm grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Vehicle Info</span>
              <p className="text-xs font-bold mt-1 text-[color:var(--color-on-surface)]">TN-01-AB-4820</p>
              <p className="text-[10px] text-[color:var(--color-on-surface-variant)]">Maruti Suzuki Dzire (White)</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">OTP Code</span>
              <p className="text-base font-black mt-1 text-[color:var(--color-primary)] tracking-widest">{activeBooking?.otp || '4829'}</p>
            </div>
          </div>
        </div>
      )}

      {rideState === 'riding' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold text-[color:var(--color-on-surface)]">Ride In Progress</span>
            </div>
            <span className="text-[10px] font-mono text-[color:var(--color-primary)] font-bold">ETA: 4 mins</span>
          </div>

          <div className="relative h-32 bg-[color:var(--color-surface-dim)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,60 Q 150,120 300,40 T 600,100" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
            </svg>
            <motion.div
              animate={{ x: [-150, 150] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="text-[color:var(--color-primary)] flex flex-col items-center gap-1 relative z-10"
            >
              <Car size={24} className="drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-[color:var(--color-outline)]">Cruising...</span>
            </motion.div>
          </div>
        </div>
      )}

      {rideState === 'completed' && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-fade-up">
          <div className="h-10 w-10 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/30 flex items-center justify-center">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Ride Completed!</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Thank you for traveling with Beta Transit.</p>
          </div>

          {activeBooking && (
            <div className="w-full max-w-xs rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] p-4 space-y-3 shadow-lg text-left mx-auto">
              <div className="flex justify-between items-center border-b border-[color:var(--color-outline-variant)]/20 pb-2">
                <span className="text-[9px] uppercase font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Confirmed Pass
                </span>
                <span className="text-[10px] font-mono text-[color:var(--color-outline)]">{activeBooking.ref}</span>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-[color:var(--color-outline)] block">Boarding OTP</span>
                  <span className="text-lg font-black tracking-widest text-[color:var(--color-primary)] block">{activeBooking.otp}</span>
                  <span className="text-[9px] text-[color:var(--color-outline)] block">Fare Paid: ₹{cabDetails[cabType].price}</span>
                </div>
                <div className="shrink-0 flex justify-center items-center">
                  <MockQRCode value={activeBooking.ref} />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setRideState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-xl cursor-pointer transition-all"
          >
            Book Another Ride
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 2. FLIGHT BOOKING VIEW (flights)
 * ============================================================================ */
function FlightBookingView({ categoryName, city, initialQuery }: any) {
  const [tripType, setTripType] = useState<'one-way' | 'round'>('one-way');
  const [fromAirport, setFromAirport] = useState(() => {
    const c = (initialQuery?.city || city || '').toLowerCase();
    if (c.includes('bangalore') || c.includes('bengaluru')) return 'BLR - Bangalore';
    if (c.includes('mumbai')) return 'BOM - Mumbai';
    if (c.includes('delhi')) return 'DEL - Delhi';
    return 'MAA - Chennai';
  });
  const [toAirport, setToAirport] = useState(() => {
    const v = (initialQuery?.venue || '').toLowerCase();
    if (v.includes('chennai')) return 'MAA - Chennai';
    if (v.includes('mumbai')) return 'BOM - Mumbai';
    if (v.includes('delhi')) return 'DEL - Delhi';
    return 'BLR - Bangalore';
  });
  const [flightState, setFlightState] = useState<'idle' | 'searching' | 'results' | 'booked'>('idle');
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string; pnr: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const mockFlights = [
    { id: 'f1', carrier: 'Air India', code: 'AI-439', time: '08:00 AM – 09:15 AM', price: 4200, duration: '1h 15m' },
    { id: 'f2', carrier: 'IndiGo Airlines', code: '6E-205', time: '11:30 AM – 12:45 PM', price: 3800, duration: '1h 15m' },
    { id: 'f3', carrier: 'SpiceJet', code: 'SG-902', time: '04:15 PM – 05:30 PM', price: 3500, duration: '1h 15m' },
  ];

  const handleSearch = () => {
    setFlightState('searching');
    setTimeout(() => {
      setFlightState('results');
    }, 3500);
  };

  const handleBookFlight = (flight: any) => {
    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const pnr = `PNR-FLT-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `trv-${Date.now()}`;

    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-flight-${flight.id}`,
      serviceName: `Flight Booking (${flight.carrier} - ${flight.code})`,
      merchantName: 'Beta Airways',
      category: 'flights',
      date: new Date().toISOString().split('T')[0],
      time: flight.time.split(' – ')[0],
      amount: flight.price,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 75,
      customerName,
      customerEmail,
      customerPhone,
      notes: `Route: ${fromAirport} to ${toAirport}. PNR: ${pnr}`,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp, pnr });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced flight booking to backend:', data))
      .catch(err => console.error('Error syncing flight booking to backend:', err));

    setSelectedFlight(flight);
    setFlightState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Plane size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Dispatcher</span>
        </h2>
        <div className="flex border border-[color:var(--color-outline-variant)]/30 rounded-xl overflow-hidden p-0.5 bg-[color:var(--color-surface-dim)]">
          <button
            onClick={() => setTripType('one-way')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${tripType === 'one-way' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            One-Way
          </button>
          <button
            onClick={() => setTripType('round')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${tripType === 'round' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            Round-Trip
          </button>
        </div>
      </div>

      {flightState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">From Airport</label>
              <select value={fromAirport} onChange={(e) => setFromAirport(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="MAA - Chennai">MAA - Chennai International</option>
                <option value="BLR - Bangalore">BLR - Kempegowda Bangalore</option>
                <option value="BOM - Mumbai">BOM - Chhatrapati Shivaji Mumbai</option>
                <option value="DEL - Delhi">DEL - Indira Gandhi Delhi</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">To Airport</label>
              <select value={toAirport} onChange={(e) => setToAirport(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="BLR - Bangalore">BLR - Kempegowda Bangalore</option>
                <option value="MAA - Chennai">MAA - Chennai International</option>
                <option value="BOM - Mumbai">BOM - Chhatrapati Shivaji Mumbai</option>
                <option value="DEL - Delhi">DEL - Indira Gandhi Delhi</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Search size={14} />
            <span>Search Flight Options</span>
          </button>
        </div>
      )}

      {flightState === 'searching' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-full h-16 bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <motion.div
              animate={{ x: [-200, 200] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-[color:var(--color-primary)]"
            >
              <Plane size={32} className="rotate-90" />
            </motion.div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Scanning Radar Airspaces...</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Retrieving active airlines schedule database</p>
          </div>
        </div>
      )}

      {flightState === 'results' && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[color:var(--color-on-surface-variant)]">Available Flights ({fromAirport.split(' - ')[0]} ➔ {toAirport.split(' - ')[0]})</span>
            <button onClick={() => setFlightState('idle')} className="text-xs text-[color:var(--color-primary)] hover:underline cursor-pointer">Modify Search</button>
          </div>

          <div className="space-y-2.5">
            {mockFlights.map((flight) => (
              <div
                key={flight.id}
                className="p-4 rounded-2xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-dim)]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[color:var(--color-on-surface)]">{flight.carrier}</span>
                    <span className="text-[9px] font-bold text-[color:var(--color-outline)] font-mono border border-[color:var(--color-outline-variant)]/30 px-1.5 py-0.5 rounded">{flight.code}</span>
                  </div>
                  <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 font-mono">{flight.time}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-[color:var(--color-outline)] font-semibold block">{flight.duration}</span>
                    <span className="text-base font-black text-[color:var(--color-primary)]">₹{flight.price}</span>
                  </div>
                  <button
                    onClick={() => handleBookFlight(flight)}
                    className="bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] text-[10px] font-extrabold uppercase py-2 px-4 rounded-xl cursor-pointer hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors"
                  >
                    Select Seat & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {flightState === 'booked' && selectedFlight && activeBooking && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up animate-scale-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Boarding Pass Issued</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Your seat 12A is locked and ticket is compiled.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-left flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Boarding Pass</span>
                <h4 className="text-sm font-extrabold">{selectedFlight.carrier}</h4>
              </div>
              <span className="text-xs font-mono font-bold">{selectedFlight.code}</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Route</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{fromAirport.split(' - ')[0]} ➔ {toAirport.split(' - ')[0]}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Seat Assignment</span>
                <p className="text-xs font-bold text-[color:var(--color-primary)] mt-0.5">12A (Window)</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Gate Status</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">Gate 3B (Open)</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket PNR</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.pnr}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Boarding OTP</span>
                <p className="text-base font-black text-[color:var(--color-primary)] tracking-widest leading-none mt-0.5">{activeBooking.otp}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket Ref</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.ref}</p>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface-container-high)]/60 py-4 px-6 border-t border-[color:var(--color-outline-variant)]/20 flex flex-col items-center justify-center gap-2 select-none">
              <MockQRCode value={activeBooking.ref} />
              <span className="text-[8px] font-mono text-[color:var(--color-outline)] tracking-widest uppercase">Digital Security Barcode</span>
            </div>
          </div>

          <button
            onClick={() => setFlightState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Ticket
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 3. TRAIN BOOKING VIEW (trains)
 * ============================================================================ */
function TrainBookingView({ categoryName, city, initialQuery }: any) {
  const [fromStation, setFromStation] = useState(() => {
    const c = (initialQuery?.city || city || '').toLowerCase();
    if (c.includes('bangalore') || c.includes('bengaluru')) return 'KSR Bengaluru (SBC)';
    return 'Chennai Central (MAS)';
  });
  const [toStation, setToStation] = useState(() => {
    const v = (initialQuery?.venue || '').toLowerCase();
    if (v.includes('chennai')) return 'Chennai Central (MAS)';
    return 'KSR Bengaluru (SBC)';
  });
  const [classType, setClassType] = useState<'3AC' | '2AC' | 'SL'>('3AC');
  const [trainState, setTrainState] = useState<'idle' | 'searching' | 'results' | 'booked'>('idle');
  const [selectedTrain, setSelectedTrain] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string; pnr: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const mockTrains = [
    { id: 't1', name: 'Shatabdi Express', no: '12007', time: '06:00 AM – 11:00 AM', price: 890, seats: 'AVBL 14' },
    { id: 't2', name: 'Lalbagh Express', no: '12607', time: '03:30 PM – 09:30 PM', price: 420, seats: 'AVBL 108' },
    { id: 't3', name: 'Chennai Express', no: '12609', time: '01:35 PM – 08:05 PM', price: 390, seats: 'WL 3' },
  ];

  const handleSearch = () => {
    setTrainState('searching');
    setTimeout(() => {
      setTrainState('results');
    }, 3500);
  };

  const handleBookTrain = (train: any) => {
    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const pnr = `PNR-TRN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const id = `trv-${Date.now()}`;

    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-train-${train.id}`,
      serviceName: `Train Booking (${train.name} - ${train.no})`,
      merchantName: 'Beta Rail Connect',
      category: 'trains',
      date: new Date().toISOString().split('T')[0],
      time: train.time.split(' – ')[0],
      amount: train.price,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 300,
      customerName,
      customerEmail,
      customerPhone,
      notes: `Train: ${train.no} ${train.name}. PNR: ${pnr}`,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp, pnr });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced train booking to backend:', data))
      .catch(err => console.error('Error syncing train booking to backend:', err));

    setSelectedTrain(train);
    setTrainState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Train size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Dispatcher</span>
        </h2>
        <div className="flex border border-[color:var(--color-outline-variant)]/30 rounded-xl overflow-hidden p-0.5 bg-[color:var(--color-surface-dim)]">
          {(['3AC', '2AC', 'SL'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setClassType(c)}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${classType === c ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {trainState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Departure Station</label>
              <select value={fromStation} onChange={(e) => setFromStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="Chennai Central (MAS)">MAS - Chennai Central</option>
                <option value="KSR Bengaluru (SBC)">SBC - KSR Bengaluru</option>
                <option value="Mumbai CSMT (CSMT)">CSMT - Chhatrapati Shivaji Mumbai</option>
                <option value="New Delhi (NDLS)">NDLS - New Delhi Station</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Arrival Station</label>
              <select value={toStation} onChange={(e) => setToStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="KSR Bengaluru (SBC)">SBC - KSR Bengaluru</option>
                <option value="Chennai Central (MAS)">MAS - Chennai Central</option>
                <option value="Mumbai CSMT (CSMT)">CSMT - Chhatrapati Shivaji Mumbai</option>
                <option value="New Delhi (NDLS)">NDLS - New Delhi Station</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Train size={14} />
            <span>Search Train Connections</span>
          </button>
        </div>
      )}

      {trainState === 'searching' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-full h-16 bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <motion.div
              animate={{ x: [-200, 200] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="text-[color:var(--color-primary)] flex items-center gap-1.5"
            >
              <Train size={28} />
              <div className="flex gap-0.5">
                <span className="h-1 w-1 bg-[color:var(--color-primary)] rounded-full animate-bounce" />
                <span className="h-1 w-1 bg-[color:var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="h-1 w-1 bg-[color:var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Scanning Railway Telematics...</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Interrogating live seat availability databases</p>
          </div>
        </div>
      )}

      {trainState === 'results' && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[color:var(--color-on-surface-variant)]">Available Express Services ({fromStation.split(' ')[0]} ➔ {toStation.split(' ')[0]})</span>
            <button onClick={() => setTrainState('idle')} className="text-xs text-[color:var(--color-primary)] hover:underline cursor-pointer">Modify Search</button>
          </div>

          <div className="space-y-2.5">
            {mockTrains.map((train) => (
              <div
                key={train.id}
                className="p-4 rounded-2xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-dim)]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[color:var(--color-on-surface)]">{train.name}</span>
                    <span className="text-[9px] font-bold text-[color:var(--color-outline)] font-mono border border-[color:var(--color-outline-variant)]/30 px-1.5 py-0.5 rounded">{train.no}</span>
                  </div>
                  <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 font-mono">{train.time}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="text-left sm:text-right">
                    <span className={`text-[9px] font-bold block ${train.seats.includes('WL') ? 'text-rose-400' : 'text-emerald-400'}`}>{train.seats}</span>
                    <span className="text-base font-black text-[color:var(--color-primary)]">₹{train.price}</span>
                  </div>
                  <button
                    onClick={() => handleBookTrain(train)}
                    className="bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] text-[10px] font-extrabold uppercase py-2 px-4 rounded-xl cursor-pointer hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors"
                  >
                    Book Berth
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trainState === 'booked' && selectedTrain && activeBooking && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up animate-scale-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Berth Booking Secured</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Seat assigned inside coach {classType}.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white text-left flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Indian Railways</span>
                <h4 className="text-sm font-extrabold">{selectedTrain.name}</h4>
              </div>
              <span className="text-xs font-mono font-bold">Class {classType}</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Train No</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{selectedTrain.no}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Coach & Seat</span>
                <p className="text-xs font-bold text-[color:var(--color-primary)] mt-0.5">B2 - Berth 42 (Lower)</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Departure</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{selectedTrain.time.split(' – ')[0]}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">IRCTC PNR</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.pnr}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Boarding OTP</span>
                <p className="text-base font-black text-[color:var(--color-primary)] tracking-widest leading-none mt-0.5">{activeBooking.otp}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket Ref</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.ref}</p>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface-container-high)]/60 py-4 px-6 border-t border-[color:var(--color-outline-variant)]/20 flex flex-col items-center justify-center gap-2 select-none">
              <MockQRCode value={activeBooking.ref} />
              <span className="text-[8px] font-mono text-[color:var(--color-outline)] tracking-widest uppercase">Digital Security Barcode</span>
            </div>
          </div>

          <button
            onClick={() => setTrainState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Train
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 4. BUS BOOKING VIEW (buses)
 * ============================================================================ */
function BusBookingView({ categoryName, city, initialQuery }: any) {
  const [fromCity, setFromCity] = useState(initialQuery?.city || city || 'Chennai');
  const [toCity, setToCity] = useState(initialQuery?.venue || 'Madurai');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [busState, setBusState] = useState<'seat_selection' | 'booked'>('seat_selection');
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const SEAT_PRICE = 650;
  const mockSeats = [
    { code: 'A1', booked: true }, { code: 'A2', booked: false }, { code: 'A3', booked: false }, { code: 'A4', booked: true },
    { code: 'B1', booked: false }, { code: 'B2', booked: false }, { code: 'B3', booked: false }, { code: 'B4', booked: false },
    { code: 'C1', booked: true }, { code: 'C2', booked: true }, { code: 'C3', booked: false }, { code: 'C4', booked: false },
    { code: 'D1', booked: false }, { code: 'D2', booked: false }, { code: 'D3', booked: false }, { code: 'D4', booked: true },
    { code: 'E1', booked: false }, { code: 'E2', booked: false }, { code: 'E3', booked: false }, { code: 'E4', booked: false },
  ];

  const handleSeatClick = (code: string, booked: boolean) => {
    if (booked) return;
    if (selectedSeats.includes(code)) {
      setSelectedSeats(prev => prev.filter(s => s !== code));
    } else {
      setSelectedSeats(prev => [...prev, code]);
    }
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;

    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const id = `trv-${Date.now()}`;

    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-bus-${id}`,
      serviceName: `Bus Booking (Volvo AC - Seats: ${selectedSeats.join(', ')})`,
      merchantName: 'Beta Roadlines',
      category: 'buses',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: selectedSeats.length * SEAT_PRICE,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 360,
      customerName,
      customerEmail,
      customerPhone,
      notes: `Seats: ${selectedSeats.join(', ')}. Route: ${fromCity} to ${toCity}`,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced bus booking to backend:', data))
      .catch(err => console.error('Error syncing bus booking to backend:', err));

    setBusState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Bus size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Seat Dispatcher</span>
        </h2>
        <span className="text-[10px] font-mono text-[color:var(--color-outline)] font-bold">
          Sleeper Multi-Axle Volvo
        </span>
      </div>

      {busState === 'seat_selection' && (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Route Source</label>
              <input value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Route Destination</label>
              <input value={toCity} onChange={(e) => setToCity(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none" />
            </div>
          </div>

          <div className="border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/50 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[color:var(--color-outline)] mb-4 block">Select Seats (Upper/Lower Deck)</span>
            <div className="w-full flex justify-end max-w-[200px] border-b border-[color:var(--color-outline-variant)]/20 pb-2 mb-3">
              <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)] flex items-center gap-1">
                Driver <Compass size={11} className="rotate-45" />
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-[200px]">
              {mockSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.code);
                return (
                  <button
                    key={seat.code}
                    disabled={seat.booked}
                    onClick={() => handleSeatClick(seat.code, seat.booked)}
                    className={`h-9 w-9 rounded-lg border flex items-center justify-center text-[10px] font-black tracking-tighter transition-all cursor-pointer ${seat.booked
                      ? 'bg-[color:var(--color-surface-container-highest)] border-[color:var(--color-outline-variant)]/40 text-[color:var(--color-outline)] cursor-not-allowed opacity-35'
                      : isSelected
                        ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)] text-[color:var(--color-on-primary)] scale-95 shadow-[0_0_8px_rgba(255,215,0,0.5)]'
                        : 'bg-[color:var(--color-surface-dim)] border-[color:var(--color-outline-variant)]/50 text-[color:var(--color-on-surface-variant)] hover:border-[color:var(--color-primary)]/40'
                      }`}
                  >
                    {seat.code}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[color:var(--color-outline-variant)]/20 pt-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Selected Seats</span>
              <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Total Fare</span>
              <p className="text-base font-black text-[color:var(--color-primary)] mt-0.5">₹{selectedSeats.length * SEAT_PRICE}</p>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedSeats.length === 0}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] disabled:opacity-50 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Bus size={14} />
            <span>Confirm Seats & Book</span>
          </button>
        </div>
      )}

      {busState === 'booked' && activeBooking && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up animate-scale-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Bus Reservation Confirmed</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Seats {selectedSeats.join(', ')} secured successfully.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl mx-auto">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-4 text-white text-left flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Beta Roadlines</span>
                <h4 className="text-sm font-extrabold">Volvo Multi-Axle AC</h4>
              </div>
              <span className="text-xs font-mono font-bold">{selectedSeats.length} Seat(s)</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Route</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{fromCity} ➔ {toCity}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Seat Codes</span>
                <p className="text-xs font-bold text-[color:var(--color-primary)] mt-0.5">{selectedSeats.join(', ')}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Total Fare Paid</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">₹{selectedSeats.length * SEAT_PRICE}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Boarding OTP</span>
                <p className="text-base font-black text-[color:var(--color-primary)] tracking-widest leading-none mt-0.5">{activeBooking.otp}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket Ref</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.ref}</p>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface-container-high)]/60 py-4 px-6 border-t border-[color:var(--color-outline-variant)]/20 flex flex-col items-center justify-center gap-2 select-none">
              <MockQRCode value={activeBooking.ref} />
              <span className="text-[8px] font-mono text-[color:var(--color-outline)] tracking-widest uppercase">Digital Security Barcode</span>
            </div>
          </div>

          <button
            onClick={() => { setSelectedSeats([]); setBusState('seat_selection'); }}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Ticket
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 5. METRO ROUTE VIEW (metro)
 * ============================================================================ */
function MetroBookingView({ categoryName, city }: any) {
  const [startStation, setStartStation] = useState('Central Metro');
  const [endStation, setEndStation] = useState('Guindy Metro');
  const [activeTab, setActiveTab] = useState<'route' | 'recharge'>('route');
  const [metroState, setMetroState] = useState<'idle' | 'token_generated' | 'card_recharged'>('idle');

  const [cardNo, setCardNo] = useState('');
  const [rechargeAmt, setRechargeAmt] = useState('100');

  const handleGenerateToken = () => {
    setMetroState('token_generated');
  };

  const handleRecharge = () => {
    if (!cardNo.trim()) return;
    setMetroState('card_recharged');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <QrCode size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Route Center</span>
        </h2>
        <div className="flex border border-[color:var(--color-outline-variant)]/30 rounded-xl overflow-hidden p-0.5 bg-[color:var(--color-surface-dim)]">
          <button
            onClick={() => { setActiveTab('route'); setMetroState('idle'); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${activeTab === 'route' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            QR Token
          </button>
          <button
            onClick={() => { setActiveTab('recharge'); setMetroState('idle'); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${activeTab === 'recharge' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            Card Recharge
          </button>
        </div>
      </div>

      {activeTab === 'route' && metroState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Origin Station</label>
              <select value={startStation} onChange={(e) => setStartStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="Central Metro">Central Metro Station</option>
                <option value="Teynampet Metro">Teynampet Metro</option>
                <option value="Guindy Metro">Guindy Metro Station</option>
                <option value="Airport Metro">Airport Metro Station</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Destination Station</label>
              <select value={endStation} onChange={(e) => setEndStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="Guindy Metro">Guindy Metro Station</option>
                <option value="Airport Metro">Airport Metro Station</option>
                <option value="Central Metro">Central Metro Station</option>
                <option value="Teynampet Metro">Teynampet Metro</option>
              </select>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 p-3 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-[color:var(--color-on-surface-variant)]">Token Fare Estimate:</span>
            <span className="font-extrabold text-[color:var(--color-primary)]">₹40</span>
          </div>

          <button
            onClick={handleGenerateToken}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Ticket size={14} />
            <span>Generate QR Token</span>
          </button>
        </div>
      )}

      {activeTab === 'route' && metroState === 'token_generated' && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">QR Token Generated</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Please scan this token code at the entry gate.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl p-4 flex flex-col items-center justify-center gap-4">
            <div className="relative h-44 w-44 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
              <QrCode size={120} className="text-slate-900" />
              {/* Laser scanner effect */}
              <motion.div
                animate={{ y: [-80, 80] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              />
            </div>
            <div className="text-left w-full border-t border-[color:var(--color-outline-variant)]/20 pt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Stations</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{startStation.split(' ')[0]} ➔ {endStation.split(' ')[0]}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Fare Token</span>
                <p className="font-bold text-[color:var(--color-primary)]">₹40 (Single Entry)</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setMetroState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Buy Another Token
          </button>
        </div>
      )}

      {activeTab === 'recharge' && metroState === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Metro Smart Card Number</label>
            <div className="flex items-center gap-2 border border-[color:var(--color-outline-variant)]/40 rounded-xl px-3 py-2.5 bg-[color:var(--color-surface-dim)]">
              <QrCode size={14} className="text-[color:var(--color-outline)] shrink-0" />
              <input
                placeholder="Enter 10-digit card serial number"
                value={cardNo}
                onChange={(e) => setCardNo(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-[color:var(--color-on-surface)]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Recharge Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {['100', '200', '500'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setRechargeAmt(amt)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${rechargeAmt === amt
                    ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                    : 'border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/45 text-[color:var(--color-on-surface-variant)]'
                    }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRecharge}
            disabled={!cardNo.trim()}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] disabled:opacity-50 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <RotateCw size={14} />
            <span>Proceed Recharge — ₹{rechargeAmt}</span>
          </button>
        </div>
      )}

      {activeTab === 'recharge' && metroState === 'card_recharged' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Smart Card Recharged!</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">₹{rechargeAmt} credited successfully to card serial: <span className="font-bold text-[color:var(--color-primary)] font-mono">{cardNo}</span></p>
          </div>
          <button
            onClick={() => { setCardNo(''); setMetroState('idle'); }}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Recharge Another Card
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 6. TURFS ARENA BOOKING VIEW (turfs)
 * ============================================================================ */
function TurfsBookingView({ categoryName, city }: any) {
  const [selectedSport, setSelectedSport] = useState<'football' | 'cricket' | 'badminton'>('football');
  const [bookingDate, setBookingDate] = useState('2026-05-29');
  const [timeSlot, setTimeSlot] = useState('06:00 PM - 08:00 PM');
  const [duration, setDuration] = useState<number>(2);
  const [equipmentRental, setEquipmentRental] = useState(false);
  const [bookingState, setBookingState] = useState<'idle' | 'booked'>('idle');

  const sportConfig = {
    football: {
      name: 'Football Turf',
      rate: 1200,
      emoji: '⚽',
      addons: 'Bibs, football, & pump kit',
      addonPrice: 150,
    },
    cricket: {
      name: 'Cricket Pitch',
      rate: 1500,
      emoji: '🏏',
      addons: 'Bat, leather balls, stumps, & pads',
      addonPrice: 250,
    },
    badminton: {
      name: 'Badminton Court',
      rate: 400,
      emoji: '🏸',
      addons: '2 Carbon rackets & nylon shuttles',
      addonPrice: 100,
    },
  };

  const currentSport = sportConfig[selectedSport];
  const baseCost = currentSport.rate * duration;
  const addonCost = equipmentRental ? currentSport.addonPrice : 0;
  const totalCost = baseCost + addonCost;

  const handleBook = () => {
    setBookingState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between mb-5 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Activity size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Arena Hub</span>
        </h2>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 px-2.5 py-1 rounded-full border border-[color:var(--color-primary)]/20">
          Arena Booking
        </span>
      </div>

      {bookingState === 'idle' && (
        <div className="space-y-5 animate-fade-up">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-2.5">Select Court/Sport</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(sportConfig) as Array<keyof typeof sportConfig>).map((key) => {
                const isSel = selectedSport === key;
                const config = sportConfig[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSport(key)}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:scale-102 ${isSel
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 shadow-[0_0_12px_rgba(255,215,0,0.1)] font-extrabold'
                      : 'border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/45 font-medium'
                      }`}
                  >
                    <span className="text-2xl mb-1">{config.emoji}</span>
                    <span className="text-[11px] text-[color:var(--color-on-surface)]">{config.name}</span>
                    <span className="text-[9px] text-[color:var(--color-outline)] mt-0.5">₹{config.rate}/hr</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Select Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2.5 text-xs text-[color:var(--color-on-surface)] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2.5 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer"
              >
                <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM</option>
                <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Floodlights)</option>
                <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM (Floodlights)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2.5 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={3}>3 Hours</option>
                <option value={4}>4 Hours</option>
              </select>
            </div>
          </div>

          <div
            onClick={() => setEquipmentRental(!equipmentRental)}
            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all duration-300 ${equipmentRental
              ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/[0.04]'
              : 'border-[color:var(--color-outline-variant)]/20 bg-transparent hover:bg-[color:var(--color-surface-dim)]/40'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎒</span>
              <div className="text-left">
                <p className="text-xs font-bold text-[color:var(--color-on-surface)]">Rent Play Equipment Kit?</p>
                <p className="text-[10px] text-[color:var(--color-outline)] mt-0.5">{currentSport.addons}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[color:var(--color-primary)]">+₹{currentSport.addonPrice}</span>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${equipmentRental ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)]' : 'border-[color:var(--color-outline-variant)]'
                }`}>
                {equipmentRental && <Check size={10} className="text-[#0C0C10] stroke-[4]" />}
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/20 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[color:var(--color-on-surface-variant)] text-[10px] uppercase tracking-wider font-bold">Total Arena Fare:</span>
              <p className="text-[9px] text-[color:var(--color-outline)] mt-0.5">₹{currentSport.rate}/hr × {duration} hrs {equipmentRental && `+ ₹${currentSport.addonPrice} rental`}</p>
            </div>
            <span className="font-extrabold text-base text-[color:var(--color-primary)]">₹{totalCost}</span>
          </div>

          <button
            onClick={handleBook}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Activity size={14} />
            <span>Book {currentSport.name} slot — ₹{totalCost}</span>
          </button>
        </div>
      )}

      {bookingState === 'booked' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-up">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[color:var(--color-on-surface)]">Arena Booking Confirmed!</h3>
            <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1.5">Your play slot has been reserved near {city}.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[color:var(--color-outline-variant)]/20">
              <span className="text-[10px] uppercase tracking-widest text-[color:var(--color-outline)] font-black">Booking ID</span>
              <span className="font-bold text-xs text-[color:var(--color-primary)] font-mono">TRF-98274A</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Facility</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{currentSport.emoji} {currentSport.name}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Date & Duration</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{bookingDate} ({duration} hrs)</p>
              </div>
              <div className="col-span-2 border-t border-[color:var(--color-outline-variant)]/10 pt-2.5">
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Reserved Timing</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{timeSlot}</p>
              </div>
              <div className="col-span-2 border-t border-[color:var(--color-outline-variant)]/10 pt-2.5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Equipment Rental</span>
                  <p className="font-bold text-[color:var(--color-on-surface)]">{equipmentRental ? 'Included' : 'None'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Total Paid</span>
                  <p className="font-extrabold text-sm text-[color:var(--color-primary)]">₹{totalCost}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEquipmentRental(false); setBookingState('idle'); }}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Court
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * MAIN SERVICE DISCOVERY PAGE COMPONENT
 * ============================================================================ */
export default function ProviderDiscoveryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingType = (params?.bookingType as string) || 'stay-accommodation';
  const rawCategory = params?.category as string;
  const effectiveCategory = rawCategory === 'stayhotel' || rawCategory === 'stay-hotel' || rawCategory === 'hotel' ? 'hotels' : (rawCategory === 'resort' ? 'resorts' : (rawCategory === 'villa' ? 'villas' : rawCategory));
  const category = effectiveCategory;
  let categoryName = CATEGORY_NAMES[category] || category;
  if (bookingType === 'accomodation' && category === 'camping') {
    categoryName = 'Camps & Glamping';
  }
  if (bookingType === 'entertainment' && category === 'sports-events') {
    categoryName = 'Sports';
  }

  const { city, latitude, longitude, setCity, setLocation } = useLocationStore();
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Read custom search inputs passed from Home Page SmartSlotFinder / URL query
  const queryDate = searchParams?.get('date');
  const querySlot = searchParams?.get('slot');
  const queryCity = searchParams?.get('city');
  const queryVenue = searchParams?.get('venue');

  const [searchQuery, setSearchQuery] = useState(() => queryVenue || queryCity || city || 'Chennai');

  const isHostelOrPg = category === 'hostels' || category === 'pg-hostels' || (categoryName || '').toLowerCase().includes('hostel') || (categoryName || '').toLowerCase().includes('pg');
  const isPgCategory = category === 'pg-hostels';
  const isDoctorCategory = category === 'doctor' || (bookingType === 'lifestyle_local' && category.includes('doctor'));
  const isHomeServicesCategory = ['plumber', 'electrician', 'cleaning', 'technician', 'babysitting', 'elder-care', 'event-organizer', 'pet-grooming'].includes(category);
  const isSalonCategory = category === 'salons' || category === 'spa' || category === 'studio' || (bookingType === 'lifestyle_local' && (category.includes('salon') || category.includes('spa') || category.includes('studio')));
  const isFitnessCategory = category === 'gym' || category === 'yoga' || category === 'gym-yoga' || (bookingType === 'lifestyle_local' && (category.includes('gym') || category.includes('yoga') || category.includes('fitness')));
  const isAppointmentCategory = (!isSalonCategory && !isFitnessCategory && ['appointment'].includes(category)) || (bookingType === 'lifestyle_local' && !isSalonCategory && !isFitnessCategory && (category.includes('appointment')));
  const isDiningCategory = category === 'dining' || category === 'restaurants' || (bookingType === 'lifestyle-local' && (category.includes('dine') || category.includes('food') || category.includes('restaurant')));
  const isSportsCategory = (bookingType || '').toLowerCase().includes('sport') || ['football-turf', 'cricket-ground', 'badminton', 'tennis', 'basketball', 'swimming', 'play-arena', 'turfs'].includes((category || '').toLowerCase());
  const isEntertainmentCategory = (bookingType || '').toLowerCase().includes('entertainment') || ['movies', 'theatre', 'concerts', 'events', 'exhibitions', 'workshops', 'gaming'].includes((category || '').toLowerCase());
  const isHotelCategory = !isDoctorCategory && !isHomeServicesCategory && !isAppointmentCategory && !isSalonCategory && !isFitnessCategory && !isDiningCategory && !isSportsCategory && !isEntertainmentCategory && (category === 'hotels' || category === 'resorts' || category === 'villas' || category === 'hostels' || category === 'pg-hostels' || category === 'camping' || bookingType === 'stay-accommodation' || bookingType === 'home');
  const [homeServiceTimeWindow, setHomeServiceTimeWindow] = useState<string>('ALL');
  const [doctorSpecialityFilter, setDoctorSpecialityFilter] = useState<string>('ALL');
  const [doctorModeFilter, setDoctorModeFilter] = useState<'ALL' | 'IN_CLINIC' | 'VIDEO_CALL'>('ALL');

  // Fitness / Gym / Yoga Dedicated Search States
  const isExplicitGym = category === 'gym' || category.includes('gym');
  const isExplicitYoga = category === 'yoga' || category.includes('yoga');
  const [fitnessPlanFilter, setFitnessPlanFilter] = useState<'ALL' | 'DAILY' | '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '12_MONTHS' | 'PT'>('1_MONTH');
  const [fitnessBatchFilter, setFitnessBatchFilter] = useState<string>('ALL'); // 'ALL', 'MORNING', 'EVENING'
  const [isFitnessPlanDropdownOpen, setIsFitnessPlanDropdownOpen] = useState(false);
  const [isFitnessBatchDropdownOpen, setIsFitnessBatchDropdownOpen] = useState(false);
  const [isFitnessDatePickerOpen, setIsFitnessDatePickerOpen] = useState(false);

  // Salon & Spa Dedicated Search States
  const [salonTypeFilter, setSalonTypeFilter] = useState<'ALL' | 'SALON' | 'SPA'>('ALL'); // 'ALL' | 'SALON' | 'SPA'
  const [salonGenderFilter, setSalonGenderFilter] = useState<'ALL' | 'WOMEN' | 'MEN' | 'KIDS'>('ALL'); // 'ALL' | 'WOMEN' | 'MEN' | 'KIDS'
  const [salonServiceInput, setSalonServiceInput] = useState<string>(''); // e.g. 'Haircut', 'Massage', 'Facial'
  const [isSalonServiceDropdownOpen, setIsSalonServiceDropdownOpen] = useState(false);
  const [isSalonGenderDropdownOpen, setIsSalonGenderDropdownOpen] = useState(false);

  // Dining Dedicated Search States
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowD = new Date();
  tomorrowD.setDate(tomorrowD.getDate() + 1);
  const tomorrowStr = tomorrowD.toISOString().split('T')[0];
  const [diningMealSession, setDiningMealSession] = useState<'ALL' | 'LUNCH' | 'DINNER'>('ALL');
  const [diningGuestsCount, setDiningGuestsCount] = useState<number>(2);
  const [diningSeatingZone, setDiningSeatingZone] = useState<string>('all'); // 'all', 'AC_INDOOR', 'ROOFTOP', 'PRIVATE_DINING'
  const [isDiningGuestsOpen, setIsDiningGuestsOpen] = useState(false);
  const [isDiningZoneOpen, setIsDiningZoneOpen] = useState(false);

  // Entertainment Dedicated Search States
  const [entLanguageFilter, setEntLanguageFilter] = useState<string>('all');
  const [entFormatFilter, setEntFormatFilter] = useState<string>('all');
  const [entTimeFilter, setEntTimeFilter] = useState<string>('all'); // 'all' | 'morning' | 'afternoon' | 'evening' | 'night'
  const [entExperienceFilter, setEntExperienceFilter] = useState<string>('all'); // 'all' | 'imax' | '4dx' | 'dolby' | 'recliner'

  // Sports & Turf Dedicated Search States
  const [sportsSlotDate, setSportsSlotDate] = useState(() => queryDate || new Date().toISOString().split('T')[0]);
  const [sportsSlotTime, setSportsSlotTime] = useState(() => querySlot || '06:00 PM - 07:00 PM');
  const [sportsDurationHours, setSportsDurationHours] = useState<number>(1);
  const [isSportsSlotDropdownOpen, setIsSportsSlotDropdownOpen] = useState(false);
  const [isSportsDatePickerOpen, setIsSportsDatePickerOpen] = useState(false);
  const [sportsCalDate, setSportsCalDate] = useState<Date>(() => new Date());
  const [sportsFormatFilter, setSportsFormatFilter] = useState<string>('all');

  // Cinema / Theatre Picker Modal States (BookMyShow standard: Select Movie -> Pick Theatre/Branch -> Showtimes)
  const [selectedMovieForTheatres, setSelectedMovieForTheatres] = useState<MovieListingItem | null>(null);
  const [showTheatreModal, setShowTheatreModal] = useState<boolean>(false);
  const [theatreFilterDate, setTheatreFilterDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Hostel & PG Dedicated Search States
  const [hostelMoveInDate, setHostelMoveInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hostelDurationMonths, setHostelDurationMonths] = useState<number>(3); // 1, 2, 3, 6, 11 months
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const [isHostelOccupancyOpen, setIsHostelOccupancyOpen] = useState(false);
  const [isMoveInDatePickerOpen, setIsMoveInDatePickerOpen] = useState(false);
  const [hostelMoveInCalDate, setHostelMoveInCalDate] = useState<Date>(() => new Date());

  const [pgGenderFilter, setPgGenderFilter] = useState<'all' | 'gents' | 'ladies' | 'coliving'>('all');
  const [pgFoodFilter, setPgFoodFilter] = useState<'all' | 'with-food' | 'self-cooking'>('all');
  const [pgSharingFilter, setPgSharingFilter] = useState<'all' | 'single' | '2-sharing' | '3-sharing' | '4-sharing'>('all');
  const [ladiesWardenOnly, setLadiesWardenOnly] = useState(false);
  const [ladiesLunchBoxOnly, setLadiesLunchBoxOnly] = useState(false);
  const [colivingCoworkingOnly, setColivingCoworkingOnly] = useState(false);
  const [colivingPowerBackupOnly, setColivingPowerBackupOnly] = useState(false);
  const [hotelDestination, setHotelDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [activeDatePicker, setActiveDatePicker] = useState<'checkin' | 'checkout' | null>(null);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [rooms, setRooms] = useState(1);
  const [pets, setPets] = useState(false);
  const [petCount, setPetCount] = useState<number>(0);

  // Autocomplete suggestions state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchDockRef = useRef<HTMLDivElement>(null);

  // Auto-close any open popup when clicking outside anywhere on the page
  useEffect(() => {
    const handleGlobalClickOutside = (e: MouseEvent) => {
      if (searchDockRef.current && !searchDockRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
        setActiveDatePicker(null);
        setGuestDropdownOpen(false);
        setIsDurationDropdownOpen(false);
        setIsHostelOccupancyOpen(false);
        setIsMoveInDatePickerOpen(false);
        setIsSportsSlotDropdownOpen(false);
        setIsSportsDatePickerOpen(false);
      }
    };

    // Instant update when business portal changes PG or Mystery configurations
    const handleConfigUpdate = () => {
      setMounted(m => !m); // trigger immediate rerender with new dynamic values
    };
    window.addEventListener('pg_config_updated', handleConfigUpdate);
    window.addEventListener('hotel_mystery_toggle', handleConfigUpdate);
    window.addEventListener('hotel_luggage_toggle', handleConfigUpdate);
    window.addEventListener('storage', handleConfigUpdate);

    document.addEventListener('mousedown', handleGlobalClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClickOutside);
      window.removeEventListener('pg_config_updated', handleConfigUpdate);
      window.removeEventListener('hotel_mystery_toggle', handleConfigUpdate);
      window.removeEventListener('hotel_luggage_toggle', handleConfigUpdate);
      window.removeEventListener('storage', handleConfigUpdate);
    };
  }, []);

  // Faceted Filters State (Sidebar / Bar)
  const [priceRange, setPriceRange] = useState<number>(50000); // Max price ceiling
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [freeCancellationOnly, setFreeCancellationOnly] = useState<boolean>(false);
  const [petFriendlyOnly, setPetFriendlyOnly] = useState<boolean>(false);
  const [isLuxuryMode, setIsLuxuryMode] = useState<boolean>(false);

  // Sports Specific Faceted Filters State
  const [sportsSurfaceFilter, setSportsSurfaceFilter] = useState<string>('all');
  const [floodlightsOnly, setFloodlightsOnly] = useState<boolean>(false);
  const [acCourtsOnly, setAcCourtsOnly] = useState<boolean>(false);
  const [equipmentProvidedOnly, setEquipmentProvidedOnly] = useState<boolean>(false);


  const [servicesList, setServicesList] = useState<Service[]>(() => {
    try {
      const cacheKey = JSON.stringify({ categorySlug: effectiveCategory, ...(city ? { city } : {}) });
      if ((api.services as any)._cache && (api.services as any)._cache[cacheKey]) {
        return (api.services as any)._cache[cacheKey].data?.data || [];
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cacheKey = JSON.stringify({ categorySlug: effectiveCategory, ...(city ? { city } : {}) });
      if ((api.services as any)._cache && (api.services as any)._cache[cacheKey]) {
        return false;
      }
    } catch {
      // ignore
    }
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (queryCity && queryCity.trim() !== '' && queryCity !== 'Near Me / Current Location') {
      setCity(queryCity);
      if (!queryVenue) {
        setSearchQuery(queryCity);
      }
    } else if (city && !queryVenue) {
      setSearchQuery(city);
    }
  }, [city, queryCity, queryVenue, setCity]);


  useEffect(() => {
    if (!mounted) return;
    let active = true;
    const fetchServices = async () => {
      // Background revalidation: keep existing data visible while fetching
      setLoading((prev) => (servicesList.length === 0 ? true : prev));
      setError(null);
      try {
        const params: Record<string, string> = {
          categorySlug: category,
        };
        if (city) {
          params.city = city;
        }
        let response = await api.services.list(params);
        let list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

        // Format real merchant services if returned from backend
        if (category === 'hotels' || category === 'hotel-booking' || category === 'hostels' || category === 'pg-hostels' || category.includes('hotel') || category.includes('room')) {
          list = list.filter((item: any) => {
            const mName = (item.merchant?.name || item.merchantName || '').toLowerCase();
            const sName = (item.name || '').toLowerCase();
            if (mName.includes('bokspot verified') || sName.includes('bokspot verified')) return false;
            if (item.id === '11111111-1111-4111-a111-111111111111') return false;
            if (mName.includes('grand hotel') && sName.includes('standard king')) return false;
            return true;
          }).map((item: any) => ({
            ...item,
            merchant: typeof item.merchant === 'object' ? item.merchant : { name: item.merchantName || 'Grand Hotel', id: item.merchantId || item.id },
            basePrice: item.basePrice || item.price || (category === 'pg-hostels' ? '6500' : category === 'hostels' ? '499' : '2500')
          }));
        }

        // Add Backpackers Hostel (H104) if hostels category is loaded and list is empty
        if (category === 'hostels' && list.length === 0) {
          const hostelTargetCity = city || 'Chennai';
          list = [
            {
              id: 'service-backpackers-hostel',
              name: 'Backpackers Hostel — Mixed Dorm Bed & Social Lounge',
              category: { name: 'Hostel Booking', slug: 'hostels' },
              rating: 4.8,
              reviewCount: 228,
              basePrice: '499',
              image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
              merchant: {
                id: '51c6a3b8-2abc-9421-7644-2a2dea05dbc0',
                name: 'Backpackers Hostel',
                city: hostelTargetCity,
                address: `BokSpot Backpacker Zone, Near Transit Terminal, ${hostelTargetCity}`,
                rating: 4.8,
                metadata: {
                  isHostel: true,
                  thingsToKnow: [
                    'High-Speed Wi-Fi',
                    'Washing Machine & Laundry',
                    'RO Purified Drinking Water',
                    '3 Times Homely Meals',
                    '24/7 CCTV & Biometric Security',
                    'Daily Housekeeping',
                    'Two-Wheeler Parking'
                  ]
                }
              },
              metadata: {
                hostelType: 'backpackers',
                startingPrice: 499,
                amenities: ['High-Speed Wi-Fi', 'Locker Padlock', 'Hot Water', 'Social Lounge', 'RO Water']
              }
            }
          ];
        }

        // Add Realistic Verified PG / Co-Living sample stays if pg-hostels is empty from backend
        if (category === 'pg-hostels' && list.length === 0) {
          const pgTargetCity = city || 'Chennai';
          list = [
            {
              id: 'pg-1',
              name: 'Zolo Starlight Luxury Coliving & PG',
              category: { name: 'PG & Co-Living Stays', slug: 'pg-hostels' },
              rating: 4.8,
              reviewCount: 312,
              basePrice: '7500',
              image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
              merchant: {
                id: 'm-pg-1',
                name: 'Zolo Starlight Coliving',
                city: pgTargetCity,
                address: `Near IT Tech Park, OMR, ${pgTargetCity}`,
                rating: 4.8,
                metadata: {
                  pgType: 'coliving',
                  hasFood: true,
                  foodModel: 'with-food',
                  curfewTime: '24/7 Biometric Entry (No Curfew)',
                  noticePeriod: '15 Days',
                  refundableDeposit: 3000,
                  tokenAdvance: 999,
                  foodMenu: {
                    breakfast: 'Idli, Dosa, Pongal, Tea/Coffee',
                    lunch: 'Unlimited South/North Meals, Sambar, Curd',
                    dinner: 'Chapathi, Veg Fried Rice, Chicken Gravy (Wed & Sun)'
                  }
                }
              },
              metadata: {
                sharing: '2-sharing',
                roomType: '2-Sharing AC with 3-Time Food',
                hasFood: true,
                gender: 'coliving',
                refundableDeposit: 3000,
                tokenAdvance: 999,
                amenities: ['3 Times Food', 'High-Speed Wi-Fi', 'Washing Machine', 'Housekeeping', 'Power Backup', 'AC', 'RO Water']
              }
            },
            {
              id: 'pg-2',
              name: 'Comfort Zone Gents Luxury PG',
              category: { name: 'PG & Co-Living Stays', slug: 'pg-hostels' },
              rating: 4.7,
              reviewCount: 184,
              basePrice: '6200',
              image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
              merchant: {
                id: 'm-pg-2',
                name: 'Comfort Zone Gents PG',
                city: pgTargetCity,
                address: `Main Road, Near Metro Station, ${pgTargetCity}`,
                rating: 4.7,
                metadata: {
                  pgType: 'gents',
                  hasFood: true,
                  foodModel: 'with-food',
                  curfewTime: '11:00 PM Gate Closing',
                  noticePeriod: '30 Days',
                  refundableDeposit: 2500,
                  tokenAdvance: 999
                }
              },
              metadata: {
                sharing: '3-sharing',
                roomType: '3-Sharing Non-AC with Homely Meals',
                hasFood: true,
                gender: 'gents',
                refundableDeposit: 2500,
                tokenAdvance: 999,
                amenities: ['3 Times Food', 'Free Wi-Fi', 'Washing Machine', 'RO Water', 'CCTV Security']
              }
            },
            {
              id: 'pg-3',
              name: 'Royal Orchid Ladies Premium PG',
              category: { name: 'PG & Co-Living Stays', slug: 'pg-hostels' },
              rating: 4.9,
              reviewCount: 246,
              basePrice: '8500',
              image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
              merchant: {
                id: 'm-pg-3',
                name: 'Royal Orchid Ladies PG',
                city: pgTargetCity,
                address: `Safe Residential Colony, ${pgTargetCity}`,
                rating: 4.9,
                metadata: {
                  pgType: 'ladies',
                  hasFood: true,
                  foodModel: 'with-food',
                  curfewTime: '10:00 PM (Biometric Attendance)',
                  noticePeriod: '15 Days',
                  refundableDeposit: 3500,
                  tokenAdvance: 999
                }
              },
              metadata: {
                sharing: '2-sharing',
                roomType: '2-Sharing AC with North/South Cuisine',
                hasFood: true,
                gender: 'ladies',
                refundableDeposit: 3500,
                tokenAdvance: 999,
                amenities: ['3 Times Hygienic Food', '24x7 Female Warden', 'Wi-Fi', 'Gym Access', 'Automatic Washing Machine']
              }
            },
            {
              id: 'pg-4',
              name: 'Urban Nest Single Studio PG & Coliving',
              category: { name: 'PG & Co-Living Stays', slug: 'pg-hostels' },
              rating: 4.6,
              reviewCount: 98,
              basePrice: '12000',
              image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
              merchant: {
                id: 'm-pg-4',
                name: 'Urban Nest Studio',
                city: pgTargetCity,
                address: `Central City Hub, ${pgTargetCity}`,
                rating: 4.6,
                metadata: {
                  pgType: 'coliving',
                  hasFood: false,
                  foodModel: 'self-cooking',
                  curfewTime: 'No Curfew (Digital Key)',
                  noticePeriod: '15 Days',
                  refundableDeposit: 5000,
                  tokenAdvance: 999
                }
              },
              metadata: {
                sharing: 'single',
                roomType: 'Private Single Studio (Self-Cooking Kitchen)',
                hasFood: false,
                gender: 'coliving',
                refundableDeposit: 5000,
                tokenAdvance: 999,
                amenities: ['Fully Equipped Kitchen', 'Refrigerator', 'Attached Balcony', 'High-Speed Wi-Fi', 'Housekeeping']
              }
            }
          ];
        }

        // Generic Sports & Recreation Master Archetype Fallback (Categories 22-28)
        const sportConfig = getSportCategoryConfig(category);
        if (sportConfig && list.length === 0) {
          const targetCity = city || 'Chennai';

          // Check if custom branch or listings configured by business vendor in portal
          let merchantBranchList: any[] = [];
          if (typeof window !== 'undefined') {
            try {
              const busStorageRaw = localStorage.getItem('vendor-portal-storage-v10');
              if (busStorageRaw) {
                const busData = JSON.parse(busStorageRaw);
                const curM = busData.state?.currentMerchant;
                if (curM && curM.username === sportConfig.username && Array.isArray(curM.branches) && curM.branches.length > 0) {
                  merchantBranchList = curM.branches;
                }
              }
            } catch (e) {}
          }

          if (merchantBranchList.length > 0) {
            list = merchantBranchList.map((br: any) => ({
              id: `svc-${sportConfig.slug}-${br.id}`,
              name: `${br.name} — ${sportConfig.categoryName}`,
              category: { name: sportConfig.categoryName, slug: sportConfig.slug },
              rating: 4.9,
              reviewCount: 384,
              basePrice: String(sportConfig.defaultPrice),
              image: sportConfig.heroImage,
              branchName: br.name,
              address: br.address,
              merchant: {
                id: sportConfig.merchantId,
                name: br.name,
                city: br.city || targetCity,
                address: br.address || `Sports Hub Arena, Stadium Road, ${targetCity}`,
                rating: 4.9,
                username: sportConfig.username,
                metadata: {
                  isFacility: true,
                  branchId: br.id,
                  units: sportConfig.units,
                  addons: sportConfig.addons,
                  mandatoryRule: sportConfig.mandatoryRule,
                  amenities: sportConfig.amenities,
                  includedGear: sportConfig.includedGear,
                  supervisorTitle: sportConfig.supervisorTitle
                }
              },
              metadata: {
                isFacility: true,
                branchId: br.id,
                branchName: br.name,
                address: br.address,
                startingPrice: sportConfig.defaultPrice,
                amenities: sportConfig.amenities,
                mandatoryRule: sportConfig.mandatoryRule,
                units: sportConfig.units,
                addons: sportConfig.addons
              }
            }));
          } else {
            list = [
              {
                id: `svc-${sportConfig.slug}-${sportConfig.username.toLowerCase()}`,
                name: `${sportConfig.merchantName} — ${sportConfig.categoryName}`,
                category: { name: sportConfig.categoryName, slug: sportConfig.slug },
                rating: 4.9,
                reviewCount: 384,
                basePrice: String(sportConfig.defaultPrice),
                image: sportConfig.heroImage,
                branchName: sportConfig.merchantName,
                address: `Sports Hub Arena, Stadium Road, ${targetCity}`,
                merchant: {
                  id: sportConfig.merchantId,
                  name: sportConfig.merchantName,
                  city: targetCity,
                  address: `Sports Hub Arena, Stadium Road, ${targetCity}`,
                  rating: 4.9,
                  username: sportConfig.username,
                  metadata: {
                    isFacility: true,
                    units: sportConfig.units,
                    addons: sportConfig.addons,
                    mandatoryRule: sportConfig.mandatoryRule,
                    amenities: sportConfig.amenities,
                    includedGear: sportConfig.includedGear,
                    supervisorTitle: sportConfig.supervisorTitle
                  }
                },
                metadata: {
                  isFacility: true,
                  startingPrice: sportConfig.defaultPrice,
                  amenities: sportConfig.amenities,
                  mandatoryRule: sportConfig.mandatoryRule,
                  units: sportConfig.units,
                  addons: sportConfig.addons
                }
              }
            ];
          }
        }

        // Generic Entertainment & Live Events Master Archetype Fallback (Categories 15-21)
        const entConfig = getEntertainmentCategoryConfig(category);
        if (entConfig && list.length === 0) {
          const targetCity = city || 'Chennai';

          // Check if custom branch or offerings configured by business vendor in portal
          let merchantBranchList: any[] = [];
          if (typeof window !== 'undefined') {
            try {
              const busStorageRaw = localStorage.getItem('vendor-portal-storage-v10');
              if (busStorageRaw) {
                const busData = JSON.parse(busStorageRaw);
                const curM = busData.state?.currentMerchant;
                if (curM && curM.username === entConfig.username && Array.isArray(curM.branches) && curM.branches.length > 0) {
                  merchantBranchList = curM.branches;
                }
              }
            } catch (e) {}
          }

          if (merchantBranchList.length > 0) {
            list = merchantBranchList.map((br: any) => ({
              id: `svc-${entConfig.slug}-${br.id}`,
              name: `${br.name} — ${entConfig.categoryName}`,
              category: { name: entConfig.categoryName, slug: entConfig.slug },
              rating: 4.8,
              reviewCount: 420,
              basePrice: String(entConfig.defaultPrice),
              image: entConfig.heroImage,
              branchName: br.name,
              address: br.address,
              city: br.city || targetCity,
              merchant: {
                id: entConfig.merchantId,
                name: br.name,
                city: br.city || targetCity,
                address: br.address || `${entConfig.categoryName} Complex, Entertainment Zone, ${targetCity}`,
                rating: 4.8,
                username: entConfig.username,
                metadata: {
                  isEntertainment: true,
                  branchId: br.id,
                  formats: entConfig.formats,
                  languages: entConfig.languages,
                  showtimes: entConfig.showtimes,
                  seatTiers: entConfig.seatTiers,
                  snackAddons: entConfig.snackAddons,
                  amenities: entConfig.amenities,
                  venueRules: entConfig.venueRules
                }
              },
              metadata: {
                isEntertainment: true,
                branchId: br.id,
                branchName: br.name,
                address: br.address,
                startingPrice: entConfig.defaultPrice,
                formats: entConfig.formats,
                languages: entConfig.languages,
                showtimes: entConfig.showtimes,
                seatTiers: entConfig.seatTiers,
                snackAddons: entConfig.snackAddons,
                amenities: entConfig.amenities,
                venueRules: entConfig.venueRules
              }
            }));
          } else if (Array.isArray(entConfig.branches) && entConfig.branches.length > 0) {
            list = entConfig.branches.map((br: any) => ({
              id: `svc-${entConfig.slug}-${br.id}`,
              name: `${br.name} — ${entConfig.categoryName}`,
              category: { name: entConfig.categoryName, slug: entConfig.slug },
              rating: 4.8,
              reviewCount: 390,
              basePrice: String(entConfig.defaultPrice),
              image: entConfig.heroImage,
              branchName: br.name,
              address: br.address,
              city: br.city || targetCity,
              merchant: {
                id: entConfig.merchantId,
                name: br.name,
                city: br.city || targetCity,
                address: br.address,
                rating: 4.8,
                username: entConfig.username,
                metadata: {
                  isEntertainment: true,
                  branchId: br.id,
                  formats: entConfig.formats,
                  languages: entConfig.languages,
                  showtimes: entConfig.showtimes,
                  seatTiers: entConfig.seatTiers,
                  snackAddons: entConfig.snackAddons,
                  amenities: entConfig.amenities,
                  venueRules: entConfig.venueRules
                }
              },
              metadata: {
                isEntertainment: true,
                branchId: br.id,
                branchName: br.name,
                address: br.address,
                startingPrice: entConfig.defaultPrice,
                formats: entConfig.formats,
                languages: entConfig.languages,
                showtimes: entConfig.showtimes,
                seatTiers: entConfig.seatTiers,
                snackAddons: entConfig.snackAddons,
                amenities: entConfig.amenities,
                venueRules: entConfig.venueRules
              }
            }));
          } else {
            list = [
              {
                id: `svc-${entConfig.slug}-${entConfig.username.toLowerCase()}`,
                name: `${entConfig.merchantName} — ${entConfig.categoryName}`,
                category: { name: entConfig.categoryName, slug: entConfig.slug },
                rating: 4.8,
                reviewCount: 420,
                basePrice: String(entConfig.defaultPrice),
                image: entConfig.heroImage,
                branchName: entConfig.merchantName,
                address: `${entConfig.categoryName} Complex, Entertainment Zone, ${targetCity}`,
                city: targetCity,
                merchant: {
                  id: entConfig.merchantId,
                  name: entConfig.merchantName,
                  city: targetCity,
                  address: `${entConfig.categoryName} Complex, Entertainment Zone, ${targetCity}`,
                  rating: 4.8,
                  username: entConfig.username,
                  metadata: {
                    isEntertainment: true,
                    formats: entConfig.formats,
                    languages: entConfig.languages,
                    showtimes: entConfig.showtimes,
                    seatTiers: entConfig.seatTiers,
                    snackAddons: entConfig.snackAddons,
                    amenities: entConfig.amenities,
                    venueRules: entConfig.venueRules
                  }
                },
                metadata: {
                  isEntertainment: true,
                  startingPrice: entConfig.defaultPrice,
                  formats: entConfig.formats,
                  languages: entConfig.languages,
                  showtimes: entConfig.showtimes,
                  seatTiers: entConfig.seatTiers,
                  snackAddons: entConfig.snackAddons,
                  amenities: entConfig.amenities,
                  venueRules: entConfig.venueRules
                }
              }
            ];
          }
        }

        // Generic Lifestyle & Local Services Dynamic Fallbacks (Dining, Wellness, Fitness, Doctor, Home Services)
        const cleanCat = (category || '').toLowerCase();
        if (cleanCat.includes('dining') || cleanCat.includes('restaurant')) {
          if (list.length === 0) {
            const diningCfg = getDiningConfig();
            const targetCity = city || diningCfg.city || 'Chennai';
            list = [
              {
                id: `svc-dining-grand-temple-dine`,
                name: diningCfg.name,
                category: { name: 'Restaurant Table Reservation', slug: 'dining' },
                rating: diningCfg.rating,
                reviewCount: 840,
                basePrice: String(diningCfg.costForTwo),
                image: diningCfg.heroImage,
                branchName: diningCfg.name,
                address: diningCfg.address,
                city: targetCity,
                merchant: {
                  id: 'R404',
                  name: diningCfg.name,
                  city: targetCity,
                  address: diningCfg.address,
                  rating: diningCfg.rating,
                  username: 'R404',
                  metadata: {
                    isDining: true,
                    cuisines: diningCfg.cuisines,
                    costForTwo: diningCfg.costForTwo,
                    tableTypes: diningCfg.tableTypes,
                    timeSlots: diningCfg.timeSlots,
                    popularMenu: diningCfg.popularMenu,
                    bookingDeals: diningCfg.bookingDeals
                  }
                },
                metadata: {
                  isDining: true,
                  cuisines: diningCfg.cuisines,
                  costForTwo: diningCfg.costForTwo,
                  tableTypes: diningCfg.tableTypes,
                  timeSlots: diningCfg.timeSlots,
                  popularMenu: diningCfg.popularMenu,
                  bookingDeals: diningCfg.bookingDeals
                }
              }
            ];
          }
        } else if (cleanCat.includes('salon') || cleanCat.includes('spa') || cleanCat.includes('wellness') || cleanCat.includes('studio')) {
          if (list.length === 0) {
            const wellCfg = getWellnessConfig('style-studio');
            const targetCity = city || wellCfg.city || 'Chennai';
            list = [
              {
                id: `svc-wellness-style-studio`,
                name: wellCfg.name,
                category: { name: wellCfg.category, slug: 'salons' },
                rating: wellCfg.rating,
                reviewCount: 620,
                basePrice: String(wellCfg.treatments[0]?.price || 499),
                image: wellCfg.heroImage,
                branchName: wellCfg.name,
                address: wellCfg.address,
                city: targetCity,
                merchant: {
                  id: 'S303',
                  name: wellCfg.name,
                  city: targetCity,
                  address: wellCfg.address,
                  rating: wellCfg.rating,
                  username: 'S303',
                  metadata: {
                    isWellness: true,
                    treatments: wellCfg.treatments,
                    specialists: wellCfg.specialists,
                    amenities: wellCfg.amenities
                  }
                },
                metadata: {
                  isWellness: true,
                  treatments: wellCfg.treatments,
                  specialists: wellCfg.specialists
                }
              }
            ];
          }
        } else if (cleanCat.includes('gym') || cleanCat.includes('yoga') || cleanCat.includes('fitness')) {
          if (list.length === 0) {
            const fitCfg = getFitnessConfig('zenfit-clinic');
            const targetCity = city || fitCfg.city || 'Chennai';
            list = [
              {
                id: `svc-fitness-zenfit`,
                name: fitCfg.name,
                category: { name: fitCfg.category, slug: 'gym-yoga' },
                rating: fitCfg.rating,
                reviewCount: 450,
                basePrice: String(fitCfg.passes[0]?.price || 299),
                image: fitCfg.heroImage,
                branchName: fitCfg.name,
                address: fitCfg.address,
                city: targetCity,
                merchant: {
                  id: 'F202',
                  name: fitCfg.name,
                  city: targetCity,
                  address: fitCfg.address,
                  rating: fitCfg.rating,
                  username: 'F202',
                  metadata: {
                    isFitness: true,
                    passes: fitCfg.passes,
                    trainers: fitCfg.trainers,
                    timeSlots: fitCfg.timeSlots,
                    features: fitCfg.features
                  }
                },
                metadata: {
                  isFitness: true,
                  passes: fitCfg.passes,
                  trainers: fitCfg.trainers
                }
              }
            ];
          }
        } else if (cleanCat.includes('doctor') || cleanCat.includes('clinic')) {
          if (list.length === 0) {
            const docCfg = getClinicConfig('apollo-dental');
            const targetCity = city || docCfg.city || 'Chennai';
            list = [
              {
                id: `svc-doctor-apollo-dental`,
                name: docCfg.name,
                category: { name: docCfg.category, slug: 'doctor' },
                rating: docCfg.rating,
                reviewCount: 520,
                basePrice: String(docCfg.doctors[0]?.consultationFee || 600),
                image: docCfg.heroImage,
                branchName: docCfg.name,
                address: docCfg.address,
                city: targetCity,
                merchant: {
                  id: 'D101',
                  name: docCfg.name,
                  city: targetCity,
                  address: docCfg.address,
                  rating: docCfg.rating,
                  username: 'D101',
                  metadata: {
                    isDoctor: true,
                    doctors: docCfg.doctors,
                    consultationModes: docCfg.consultationModes,
                    facilities: docCfg.facilities
                  }
                },
                metadata: {
                  isDoctor: true,
                  doctors: docCfg.doctors
                }
              }
            ];
          }
        } else if (cleanCat.includes('electrician') || cleanCat.includes('plumber') || cleanCat.includes('clean') || cleanCat.includes('technician')) {
          if (list.length === 0) {
            const homeCfg = getHomeServiceConfig(cleanCat);
            const matched = homeCfg.services.find(s => cleanCat.includes(s.category)) || homeCfg.services[0];
            const targetCity = city || homeCfg.city || 'Chennai';
            list = [
              {
                id: `svc-home-${cleanCat}-fixit`,
                name: `${homeCfg.name} — ${matched.name}`,
                category: { name: matched.name, slug: cleanCat },
                rating: homeCfg.rating,
                reviewCount: 890,
                basePrice: String(matched.inspectionFee),
                image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
                branchName: homeCfg.name,
                address: homeCfg.locality,
                city: targetCity,
                merchant: {
                  id: 'E201',
                  name: homeCfg.name,
                  city: targetCity,
                  address: homeCfg.locality,
                  rating: homeCfg.rating,
                  username: 'E201',
                  metadata: {
                    isHomeService: true,
                    serviceItem: matched,
                    arrivalWindows: homeCfg.arrivalWindows,
                    warrantyDays: homeCfg.warrantyDays
                  }
                },
                metadata: {
                  isHomeService: true,
                  serviceItem: matched,
                  arrivalWindows: homeCfg.arrivalWindows,
                  warrantyDays: homeCfg.warrantyDays
                }
              }
            ];
          }
        }

        if (active) {
          setServicesList(list);
        }
      } catch (err: any) {
        if (active) {
          console.error('Error fetching services:', err);
          setError(err.message || 'Failed to load services.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchServices();
    return () => {
      active = false;
    };
  }, [category, city, mounted]);

  // Intercept the custom booking flows for custom dashboard category views
  const isCustomBooking = ['cabs', 'flights', 'trains', 'buses', 'metro'].includes(category);

  // Handle local sorting
  const sortedServices = [...(Array.isArray(servicesList) ? servicesList : [])].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = parseFloat(a.basePrice || (a as any).price || '0') || 0;
      const priceB = parseFloat(b.basePrice || (b as any).price || '0') || 0;
      return priceA - priceB;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'reviews') {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
    if (sortBy === 'distance' && latitude !== null && longitude !== null) {
      const distA = a.merchant?.latitude && a.merchant?.longitude ? calculateDistance(latitude, longitude, a.merchant.latitude, a.merchant.longitude) : 9999;
      const distB = b.merchant?.latitude && b.merchant?.longitude ? calculateDistance(latitude, longitude, b.merchant.latitude, b.merchant.longitude) : 9999;
      return distA - distB;
    }
    return 0;
  });

  // Handle local search & Unified Intelligent Filtering
  const filteredServices = sortedServices.filter((s: any) => {
    // Hotel & Stay Strict Category Guard: Filter out Sports, Turfs, Dining, Transit
    if (isHotelCategory) {
      const sCat = (s.category?.name || s.category?.slug || s.category || '').toLowerCase();
      const sName = (s.name || '').toLowerCase();
      const mName = (s.merchant?.name || s.merchantName || '').toLowerCase();
      const isTurfOrSports = sCat.includes('turf') || sCat.includes('sport') || sCat.includes('cricket') || sCat.includes('badminton') ||
        sCat.includes('tennis') || sCat.includes('basketball') || sCat.includes('swimming') || sCat.includes('play-arena') ||
        sName.includes('turf') || sName.includes('court') || sName.includes('pool') || sName.includes('pitch') || sName.includes('arena') ||
        mName.includes('turf') || mName.includes('arena') || mName.includes('court');
      if (isTurfOrSports) return false;
    }

    // Sports & Facility Strict Category Guard: Filter out Stays, Hotels, Clinics, Salons
    const isSportsCat = category.includes('badminton') || category.includes('tennis') || category.includes('basketball') ||
      category.includes('swimming') || category.includes('play-arena') || category.includes('turf') || category.includes('cricket');
    if (isSportsCat) {
      const sCat = (s.category?.name || s.category?.slug || s.category || '').toLowerCase();
      const sName = (s.name || '').toLowerCase();
      const mName = (s.merchant?.name || s.merchantName || '').toLowerCase();
      const isStayOrWellness = sCat.includes('hotel') || sCat.includes('resort') || sCat.includes('villa') || sCat.includes('hostel') ||
        sCat.includes('doctor') || sCat.includes('salon') || sCat.includes('spa') ||
        sName.includes('hotel') || sName.includes('resort') || sName.includes('villa') || sName.includes('hostel') ||
        mName.includes('hotel') || mName.includes('resort') || mName.includes('villa') || mName.includes('hostel');
      if (isStayOrWellness) return false;
    }

    // Price range filter (only apply if user explicitly reduced it from default 50000)
    const itemPrice = parseFloat(s.basePrice || s.price || '0');
    if (priceRange && priceRange < 50000 && itemPrice > 0 && itemPrice > priceRange) return false;

    // Minimum rating filter
    if (minRating > 0 && (s.rating || 0) < minRating) return false;

    // Property Type filter
    if (selectedPropertyTypes.length > 0) {
      const pType = (s.category || s.metadata?.propertyType || '').toLowerCase();
      const matchType = selectedPropertyTypes.some(t => pType.includes(t.toLowerCase()));
      if (!matchType) return false;
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      const rawMeta = JSON.stringify(s.metadata || {}).toLowerCase();
      const rawDesc = (s.description || '').toLowerCase();
      const hasAllAmenities = selectedAmenities.every(a => rawMeta.includes(a.toLowerCase()) || rawDesc.includes(a.toLowerCase()));
      if (!hasAllAmenities) return false;
    }

    // Free cancellation only
    if (freeCancellationOnly) {
      const rawText = `${s.name} ${s.description || ''} ${JSON.stringify(s.metadata || {})} ${JSON.stringify(s.merchant?.metadata || {})}`.toLowerCase();
      const hasFreeCancellation = rawText.includes('free cancellation') ||
        rawText.includes('cancellation available') ||
        rawText.includes('cancel anytime') ||
        rawText.includes('24h before') ||
        (s.metadata?.policies && JSON.stringify(s.metadata.policies).toLowerCase().includes('cancellation'));
      if (!hasFreeCancellation) return false;
    }

    // Pet friendly only
    if (petFriendlyOnly || pets || petCount > 0) {
      const mMeta = s.merchant?.metadata || s.merchantObj?.metadata || s.metadata || {};
      const isExplicitlyPetFriendly = s.merchant?.isPetFriendly === true ||
        s.merchantObj?.isPetFriendly === true ||
        s.isPetFriendly === true ||
        mMeta.isPetFriendly === true ||
        s.metadata?.isPetFriendly === true;

      const rawText = `${s.name || ''} ${s.description || ''} ${s.merchant?.name || ''} ${JSON.stringify(s.metadata || {})} ${JSON.stringify(mMeta)}`.toLowerCase();
      
      const hasStrictNoPets = rawText.includes('no pets') || rawText.includes('pets not allowed') || rawText.includes('strictly no pets') || rawText.includes('pets are not permitted');
      if (hasStrictNoPets && !isExplicitlyPetFriendly) {
        return false;
      }

      if (petFriendlyOnly || pets || petCount > 0) {
        const hasPetFriendlyKeyword = isExplicitlyPetFriendly ||
          rawText.includes('pet friendly') ||
          rawText.includes('pet-friendly') ||
          rawText.includes('petfriendly') ||
          rawText.includes('pets allowed') ||
          rawText.includes('pets welcome') ||
          rawText.includes('dog friendly') ||
          rawText.includes('cat friendly') ||
          rawText.includes('bring your pet') ||
          rawText.includes('pet policy') ||
          rawText.includes('pet stay');
        if (!hasPetFriendlyKeyword) return false;
      }
    }

    // Just Luxury Mode: Works for ALL categories & bookings (Hotels, Resorts, Stays, Sports & Turfs, Experiences)
    if (isLuxuryMode) {
      const customerRating = Number(s.rating || s.merchantObj?.rating || s.merchant?.rating || 4.8);
      const sPrice = parseFloat(s.basePrice || s.price || '0');
      const rawText = `${s.name || ''} ${s.description || ''} ${s.merchant?.name || ''} ${JSON.stringify(s.metadata || {})}`.toLowerCase();

      // Check explicit Luxury tier from Business Portal or verified badges
      const mMeta = s.merchant?.metadata || s.merchantObj?.metadata || s.metadata || {};
      const isExplicitLuxe = s.tier === 'LUXURY' ||
        s.merchant?.tier === 'LUXURY' ||
        s.merchantObj?.tier === 'LUXURY' ||
        s.isLuxeVerified === true ||
        s.merchant?.isLuxeVerified === true ||
        s.merchantObj?.isLuxeVerified === true ||
        mMeta.isLuxeVerified === true ||
        mMeta.tier === 'LUXURY' ||
        rawText.includes('luxury') ||
        rawText.includes('5-star') ||
        rawText.includes('5 star') ||
        rawText.includes('fifa') ||
        rawText.includes('pro arena') ||
        rawText.includes('olympic') ||
        rawText.includes('ac wooden court') ||
        rawText.includes('premium villa');

      // In Sports category, Luxury filters for FIFA standard / AC Courts / Olympic pools / 4.5★+ facilities
      if (isSportsCategory) {
        if (!isExplicitLuxe && (customerRating < 4.6 || sPrice < 1000)) return false;
      } else {
        // In Stay & Accommodation, filters 4.5★+ luxury stays & confidential mystery deals
        if (!isExplicitLuxe && (customerRating < 4.5 || sPrice < 2500)) return false;
      }
    }

    // Sports Specific Filters (Surface type, Floodlights, AC Court, Equipment gear)
    if (isSportsCategory) {
      const rawSportText = `${s.name || ''} ${s.description || ''} ${JSON.stringify(s.metadata || {})} ${JSON.stringify(s.merchant?.metadata || {})}`.toLowerCase();
      
      if (sportsSurfaceFilter !== 'all') {
        const filterNorm = sportsSurfaceFilter.toLowerCase();
        if (!rawSportText.includes(filterNorm)) return false;
      }

      if (floodlightsOnly) {
        const hasFloodlights = rawSportText.includes('floodlight') || rawSportText.includes('floodlights') || rawSportText.includes('night match') || rawSportText.includes('led light');
        if (!hasFloodlights) return false;
      }

      if (acCourtsOnly) {
        const hasAc = rawSportText.includes('ac indoor') || rawSportText.includes('air conditioned') || rawSportText.includes('fully air-conditioned') || rawSportText.includes('indoor wooden');
        if (!hasAc) return false;
      }

      if (equipmentProvidedOnly) {
        const hasEquipment = rawSportText.includes('equipment') || rawSportText.includes('gear') || rawSportText.includes('balls provided') || rawSportText.includes('rackets provided') || rawSportText.includes('bats provided');
        if (!hasEquipment) return false;
      }
    }

    // Entertainment & Live Events Filters (Language, Screen Format, Timing Band)
    if (isEntertainmentCategory) {
      const rawEntText = `${s.name || ''} ${s.description || ''} ${JSON.stringify(s.metadata || {})} ${JSON.stringify(s.merchant?.metadata || {})}`.toLowerCase();

      if (entLanguageFilter !== 'all') {
        const langNorm = entLanguageFilter.toLowerCase();
        if (!rawEntText.includes(langNorm)) return false;
      }

      if (entFormatFilter !== 'all') {
        const formatNorm = entFormatFilter.toLowerCase();
        if (!rawEntText.includes(formatNorm)) return false;
      }

      if (entExperienceFilter !== 'all') {
        const expNorm = entExperienceFilter.toLowerCase();
        if (!rawEntText.includes(expNorm)) return false;
      }
    }

    // PG & Hostel Specific Filters (Gender, Food Model, Sharing)
    const isThisPgOrHostel = isPgCategory || 
      category === 'hostels' || 
      (categoryName || '').toLowerCase().includes('hostel') ||
      (s.name || '').toLowerCase().includes('hostel') ||
      (s.name || '').toLowerCase().includes('dorm') ||
      Boolean(s.merchant?.metadata?.isPgProperty || s.merchantObj?.metadata?.isPgProperty);

    if (isThisPgOrHostel) {
      const sGender = (s.metadata?.gender || s.merchant?.metadata?.pgGenderType || s.merchantObj?.metadata?.pgGenderType || s.merchant?.metadata?.pgType || '').toLowerCase();
      if (pgGenderFilter !== 'all') {
        if (pgGenderFilter === 'ladies' && !sGender.includes('ladies') && !s.name?.toLowerCase().includes('ladies')) return false;
        if (pgGenderFilter === 'gents' && !sGender.includes('gents') && !s.name?.toLowerCase().includes('gents')) return false;
        if (pgGenderFilter === 'coliving' && !sGender.includes('coliving') && !sGender.includes('unisex')) return false;
      }

      const sFood = s.metadata?.hasFood ?? s.merchant?.metadata?.pgFoodIncluded ?? s.merchantObj?.metadata?.pgFoodIncluded ?? s.merchant?.metadata?.hasFood;
      if (pgFoodFilter === 'with-food' && sFood === false) {
        return false;
      }
      if (pgFoodFilter === 'self-cooking') {
        const foodModel = (s.merchant?.metadata?.foodModel || s.metadata?.foodModel || '').toLowerCase();
        const hasKitchen = JSON.stringify(s.metadata || {}).toLowerCase().includes('kitchen');
        if (foodModel !== 'self-cooking' && !hasKitchen && sFood !== false) return false;
      }

      if (pgSharingFilter !== 'all') {
        const sSharing = (s.metadata?.sharing || s.name || '').toLowerCase();
        if (!sSharing.includes(pgSharingFilter.toLowerCase())) return false;
      }

      if (pgGenderFilter === 'ladies' || sGender.includes('ladies')) {
        const mObj = s.merchantObj || s.merchant || {};
        const meta = mObj.metadata || s.metadata || {};
        if (ladiesWardenOnly && meta.hasLadyWarden === false) return false;
        if (ladiesLunchBoxOnly && meta.hasPackedLunchBox === false) return false;
      }

      if (pgGenderFilter === 'coliving' || sGender.includes('coliving') || sGender.includes('unisex')) {
        const mObj = s.merchantObj || s.merchant || {};
        const meta = mObj.metadata || s.metadata || {};
        if (colivingCoworkingOnly && meta.hasCoworkingLounge === false) return false;
        if (colivingPowerBackupOnly && meta.hasFullPowerBackup === false) return false;
      }
    }

    // Salon & Luxury Spa Filtering (Salon vs Spa, Gender Target & Specific Ritual Search)
    if (isSalonCategory) {
      const rawSalonText = `${s.name || ''} ${s.description || ''} ${JSON.stringify(s.metadata || {})} ${JSON.stringify(s.merchant?.metadata || {})}`.toLowerCase();
      
      // 1. Type: Salon vs Spa
      if (salonTypeFilter === 'SALON') {
        const isSpaOnly = rawSalonText.includes('ayurvedic spa') || rawSalonText.includes('luxury spa') || rawSalonText.includes('thai spa');
        const hasSalonServices = rawSalonText.includes('salon') || rawSalonText.includes('hair') || rawSalonText.includes('grooming') || rawSalonText.includes('beard') || rawSalonText.includes('stylist');
        if (isSpaOnly && !hasSalonServices) return false;
      } else if (salonTypeFilter === 'SPA') {
        const hasSpa = rawSalonText.includes('spa') || rawSalonText.includes('massage') || rawSalonText.includes('therapy') || rawSalonText.includes('steam') || rawSalonText.includes('sauna') || rawSalonText.includes('jacuzzi');
        if (!hasSpa) return false;
      }

      // 2. Gender Target: Women, Men, Kids
      if (salonGenderFilter === 'WOMEN') {
        const isMenOnly = (rawSalonText.includes("men's") || rawSalonText.includes("mens")) && !rawSalonText.includes("women") && !rawSalonText.includes("unisex");
        if (isMenOnly) return false;
      } else if (salonGenderFilter === 'MEN') {
        const isWomenOnly = (rawSalonText.includes("women's") || rawSalonText.includes("womens") || rawSalonText.includes("ladies")) && !rawSalonText.includes("men") && !rawSalonText.includes("unisex");
        if (isWomenOnly) return false;
      } else if (salonGenderFilter === 'KIDS') {
        const hasKids = rawSalonText.includes('kid') || rawSalonText.includes('children') || rawSalonText.includes('baby') || rawSalonText.includes('unisex');
        if (!hasKids) return false;
      }

      // 3. Specific Ritual / Service Typed (e.g. Haircut, Facial, Body Massage, Pedicure)
      if (salonServiceInput.trim()) {
        const reqService = salonServiceInput.toLowerCase().trim();
        if (!rawSalonText.includes(reqService)) return false;
      }
    }

    // Unified Intelligent Search Query (Matches Venue, Merchant, City, Address, Description, Amenities, Tags)
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Check query for special keywords (e.g. "top rated", "pet", "cheap", "ac", "pool")
    if (query.includes('top rated') || query.includes('best') || query.includes('5 star')) {
      if ((s.rating || 0) >= 4.5) return true;
    }
    if (query.includes('pet') || query.includes('dog') || query.includes('cat')) {
      const raw = `${s.name} ${s.description || ''} ${JSON.stringify(s.metadata || {})}`.toLowerCase();
      if (!raw.includes('no pets')) return true;
    }

    // Deep match across all attributes: Name, Merchant, City, Address, Description, Amenities, Tags
    const sName = (s.name || '').toLowerCase();
    const mName = (s.merchant?.name || s.merchantName || s.branchName || '').toLowerCase();
    const sCity = (s.city || s.merchant?.city || '').toLowerCase();
    const sAddress = (s.address || s.merchant?.address || s.metadata?.address || '').toLowerCase();
    const sDesc = (s.description || '').toLowerCase();
    const metadataStr = JSON.stringify(s.metadata || {}).toLowerCase();

    // If query matches current city, don't drop listings unless specific venue query was typed
    if (query === (city || '').toLowerCase().trim()) {
      return true;
    }

    const matchName = sName.includes(query);
    const matchMerchant = mName.includes(query);
    const matchCity = sCity.includes(query);
    const matchAddress = sAddress.includes(query);
    const matchDesc = sDesc.includes(query);
    const matchMeta = metadataStr.includes(query);

    return matchName || matchMerchant || matchCity || matchAddress || matchDesc || matchMeta;
  });

  // Dynamic Category Theme Config for Hero Banner and Search Dock
  const categoryHeroTheme = getCategoryHeroTheme(category, bookingType, city, categoryName);

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 relative overflow-hidden pt-[98px] lg:pt-[104px]">
      {/* Ambient Luxury Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#ff6325]/10 via-[#0a3161]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-[#ff6325]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── FULL-WIDTH LUXURY HERO BANNER (Dynamic for all 54 categories) ── */}
      <div className="relative w-full shadow-2xl border-b border-slate-200/60 dark:border-white/10 pb-8 sm:pb-10">
        {/* Dynamic Category Hero Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={categoryHeroTheme.bgImage}
            alt={`${categoryName} Banner`}
            className="w-full h-full object-cover object-center"
          />
          {/* Dark Navy to Sunset horizontal gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#031833] via-[#03264d]/95 sm:via-[#03264d]/85 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#021329] via-transparent to-black/40" />
        </div>

        <div className="relative z-10 container-main max-w-6xl mx-auto pt-6 pb-8 text-white space-y-4">
          {/* Top Navigation Row: Back Button + Breadcrumbs + Pill Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/${bookingType}`}
                className="p-2 rounded-xl bg-white/10 hover:bg-[#ff6325] backdrop-blur-md border border-white/20 text-white transition-all shadow-md group shrink-0"
                title="Go Back"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <Link href="/" className="hover:text-[#ff6325] transition-colors">Home</Link>
                <ChevronRight size={12} className="opacity-50" />
                <Link href={`/${bookingType}`} className="hover:text-[#ff6325] transition-colors capitalize">{bookingType}</Link>
                <ChevronRight size={12} className="opacity-50" />
                <span className="text-white font-bold">{categoryName}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ff6325] text-white shadow-md">
              <MapPin size={11} className="text-white" />
              <span>{categoryHeroTheme.badge}</span>
            </div>
          </div>

          {/* Clean Hero Title Row - Compact, Balanced & Centered */}
          <div className="text-center pt-1 pb-2 space-y-1.5">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-300 drop-shadow">
              {categoryHeroTheme.subtitle}
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {categoryHeroTheme.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 font-medium max-w-3xl mx-auto drop-shadow truncate">
              {categoryHeroTheme.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── MODERN UNIFIED PILL SEARCH DOCK (Matching Reference Design for All Categories) ── */}
      <div ref={searchDockRef} className="w-full flex justify-center sticky top-[98px] z-30 px-4 pt-3 pb-2 -mt-3 mb-4 bg-[var(--bg-base)] transition-all">
        <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-full p-2 sm:p-2.5 shadow-2xl shadow-slate-900/25 border border-slate-200/90 dark:border-white/10 hover:shadow-orange-500/10 transition-all">
          {isHostelOrPg ? (
              /* =========================================================================
               * DEDICATED HOSTEL / PG & CO-LIVING SEARCH DOCK (Stanza Living / Zolo Style)
               * WHERE (Area/Tech Park) | MOVE-IN DATE | STAY DURATION | GENDER & SHARING
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

                {/* 1. Destination / Area / Landmark */}
                <div className="flex-[1.2] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">WHERE / AREA</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder="Search area, tech park, college or hostel..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const q = searchQuery.trim().toLowerCase();
                            if (q) {
                              const matchedCity = ALL_CITIES.find(c => c.toLowerCase() === q);
                              if (matchedCity) {
                                const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === matchedCity.toLowerCase());
                                if (popMatch) {
                                  setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                } else {
                                  setCity(matchedCity);
                                }
                              }
                            }
                            setShowAutocomplete(false);
                            const el = document.getElementById('hotel-results-anchor');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                        title="Clear"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <ChevronDown size={14} className="text-slate-400 shrink-0" />
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAutocomplete(false)} />
                      <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                          <span>{searchQuery ? `Matching "${searchQuery}"` : `Top PG Localities & Hubs`}</span>
                          <span className="text-[9px] text-[#ff6325]">{city || 'All India'}</span>
                        </div>
                        {(() => {
                          const q = searchQuery.toLowerCase().trim();
                          const matchingCities = q
                            ? ALL_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 4).map(c => ({
                              label: c,
                              type: 'City Destination',
                              icon: '📍',
                              city: c,
                              isCity: true
                            }))
                            : [
                              { label: 'OMR, Chennai', type: 'IT Corridor Hub', icon: '🏢', city: 'Chennai', isCity: false },
                              { label: 'Velachery, Chennai', type: 'Residential & Metro', icon: '🚇', city: 'Chennai', isCity: false },
                              { label: 'Sholinganallur, Chennai', type: 'Tech Parks & SEZ', icon: '💻', city: 'Chennai', isCity: false },
                              { label: 'HSR Layout, Bangalore', type: 'Startup & Tech Hub', icon: '🚀', city: 'Bangalore', isCity: false },
                              { label: 'Koramangala, Bangalore', type: 'Coliving & Cafes', icon: '☕', city: 'Bangalore', isCity: false },
                              { label: 'Electronic City, Bangalore', type: 'Phase 1 & 2 SEZ', icon: '🏙️', city: 'Bangalore', isCity: false },
                            ];

                          return matchingCities.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery(item.label);
                                setShowAutocomplete(false);
                              }}
                              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                            >
                              <span className="flex items-center gap-2 font-semibold truncate">
                                <span>{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">{item.type}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Move-in Date (Single Calendar Picker) */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => {
                      setHostelMoveInCalDate(new Date(hostelMoveInDate));
                      setIsMoveInDatePickerOpen(!isMoveInDatePickerOpen);
                    }}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className={`transition-colors shrink-0 ${isMoveInDatePickerOpen ? 'text-[#ff6325]' : 'text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325]'}`}>
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">MOVE-IN DATE</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {(() => {
                          try {
                            const [y, m, d] = hostelMoveInDate.split('-');
                            return `${d}-${m}-${y}`;
                          } catch {
                            return hostelMoveInDate;
                          }
                        })()}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isMoveInDatePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Move-in Calendar Popover */}
                  {isMoveInDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMoveInDatePickerOpen(false)} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-150 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-4 border border-slate-150/60 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(hostelMoveInCalDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setHostelMoveInCalDate(newD);
                            }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                            {hostelMoveInCalDate.toLocaleString('default', { month: 'long' })} {hostelMoveInCalDate.getFullYear()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(hostelMoveInCalDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setHostelMoveInCalDate(newD);
                            }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="py-1">{day}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                          {(() => {
                            const year = hostelMoveInCalDate.getFullYear();
                            const month = hostelMoveInCalDate.getMonth();
                            const firstDayIndex = new Date(year, month, 1).getDay();
                            const totalDays = new Date(year, month + 1, 0).getDate();
                            const todayStr = new Date().toISOString().split('T')[0];

                            const cells = [];
                            for (let i = 0; i < firstDayIndex; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-9 w-9" />);
                            }

                            for (let day = 1; day <= totalDays; day++) {
                              const monthStr = String(month + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const dateStr = `${year}-${monthStr}-${dayStr}`;
                              const isSelected = dateStr === hostelMoveInDate;
                              const isPast = dateStr < todayStr;

                              cells.push(
                                <button
                                  key={`day-${day}`}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setHostelMoveInDate(dateStr);
                                    setIsMoveInDatePickerOpen(false);
                                  }}
                                  className={`h-9 w-9 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30 font-black scale-105'
                                      : isPast
                                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Stay Duration (Months) */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsDurationDropdownOpen(!isDurationDropdownOpen)}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Clock size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">DURATION</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {hostelDurationMonths === 1 ? '1 Month' : hostelDurationMonths === 12 ? '1 Year+' : `${hostelDurationMonths} Months`}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isDurationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Duration Popover */}
                  {isDurationDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDurationDropdownOpen(false)} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 shadow-2xl p-3 z-50 space-y-1.5 text-slate-900 dark:text-white">
                        <span className="text-[10px] font-black uppercase text-slate-400 block px-2 py-1">Select Stay Duration</span>
                        {[
                          { months: 1, label: '1 Month', tag: 'Short Term', badge: 'Flexible' },
                          { months: 2, label: '2 Months', tag: 'Probation / Training', badge: 'Standard' },
                          { months: 3, label: '3 Months', tag: 'Quarterly Stay', badge: 'Popular' },
                          { months: 6, label: '6 Months', tag: 'Half Yearly', badge: 'Best Value' },
                          { months: 11, label: '11 Months', tag: 'Annual Agreement', badge: 'Lowest Rent' },
                        ].map((d) => (
                          <button
                            key={d.months}
                            type="button"
                            onClick={() => {
                              setHostelDurationMonths(d.months);
                              setIsDurationDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              hostelDurationMonths === d.months
                                ? 'bg-[#ff6325] text-white shadow-sm'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex flex-col text-left">
                              <span>{d.label}</span>
                              <span className={`text-[10px] font-normal ${hostelDurationMonths === d.months ? 'text-white/80' : 'text-slate-400'}`}>{d.tag}</span>
                            </div>
                            <span className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-black ${
                              hostelDurationMonths === d.months ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {d.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 4. Gender & Sharing Room Config */}
                <div className="flex-[1.1] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsHostelOccupancyOpen(!isHostelOccupancyOpen)}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Users size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">GENDER & SHARING</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {pgGenderFilter === 'gents' ? 'Gents' : pgGenderFilter === 'ladies' ? 'Ladies' : pgGenderFilter === 'coliving' ? 'Coliving' : 'All'} • {pgSharingFilter === 'all' ? 'Any Sharing' : pgSharingFilter.replace('-', ' ')}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isHostelOccupancyOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Gender & Sharing Popover */}
                  {isHostelOccupancyOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsHostelOccupancyOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 space-y-4 text-slate-900 dark:text-white">
                        
                        {/* Gender Tabs */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                            Occupancy Gender
                          </label>
                          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            {[
                              { id: 'all', label: 'All' },
                              { id: 'gents', label: '🚹 Gents' },
                              { id: 'ladies', label: '🚺 Ladies' },
                              { id: 'coliving', label: '👥 Co-ed' },
                            ].map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => setPgGenderFilter(g.id as any)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                                  pgGenderFilter === g.id
                                    ? 'bg-[#ff6325] text-white shadow-xs'
                                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                                }`}
                              >
                                {g.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Room Sharing Config */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                            Room Sharing Type
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'all', label: 'Any Sharing', desc: 'Single to 4-sharing' },
                              { id: 'single', label: 'Single Room', desc: '1 Person / Private' },
                              { id: '2-sharing', label: '2-Sharing', desc: '2 Beds per room' },
                              { id: '3-sharing', label: '3-Sharing', desc: 'Budget friendly' },
                              { id: '4-sharing', label: '4-Sharing', desc: 'Most economical' },
                            ].map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setPgSharingFilter(s.id as any)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  pgSharingFilter === s.id
                                    ? 'bg-[#ff6325]/10 border-[#ff6325] text-[#ff6325]'
                                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="text-xs font-bold block">{s.label}</span>
                                <span className="text-[10px] text-slate-400 block">{s.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Food Preference Switch */}
                        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold block">🍲 3 Meals Food Included</span>
                            <span className="text-[10px] text-slate-400 block">Breakfast, Lunch & Dinner</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPgFoodFilter(pgFoodFilter === 'with-food' ? 'all' : 'with-food')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              pgFoodFilter === 'with-food'
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                            }`}
                          >
                            {pgFoodFilter === 'with-food' ? 'Included ✓' : 'Optional'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsHostelOccupancyOpen(false)}
                          className="w-full py-2.5 bg-[#ff6325] hover:bg-[#e0531b] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md text-center"
                        >
                          Apply Preferences
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* 5. Search Action Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsDurationDropdownOpen(false);
                      setIsHostelOccupancyOpen(false);
                      setIsMoveInDatePickerOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Search size={17} className="group-hover:scale-110 transition-transform" />
                    <span>Search Hostels</span>
                  </button>
                </div>
              </div>
            ) : isSportsCategory ? (
              /* =========================================================================
               * DEDICATED SPORTS & TURF SEARCH DOCK (District / Playo Style)
               * WHERE (Arena / Area) | SLOT DATE | SEARCH SLOTS
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

                {/* 1. Arena / Turf Location or Name */}
                <div className="flex-[1.5] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">WHERE / VENUE</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder={`Search ${categoryName} arena, club or area...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const q = searchQuery.trim().toLowerCase();
                            if (q) {
                              const matchedCity = ALL_CITIES.find(c => c.toLowerCase() === q);
                              if (matchedCity) {
                                const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === matchedCity.toLowerCase());
                                if (popMatch) {
                                  setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                } else {
                                  setCity(matchedCity);
                                }
                              }
                            }
                            setShowAutocomplete(false);
                            const el = document.getElementById('hotel-results-anchor');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                        title="Clear"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAutocomplete(false)} />
                      <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                          <span>{searchQuery ? `Matching "${searchQuery}"` : `Popular Arenas & Areas`}</span>
                          <span className="text-[9px] text-[#ff6325]">{city || 'All India'}</span>
                        </div>
                        {(() => {
                          const q = searchQuery.toLowerCase().trim();

                          // 1. Matching cities from ALL_CITIES (e.g. Hyderabad, Chennai, Bangalore...)
                          const matchingCities = q
                            ? ALL_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 5).map(c => ({
                              label: c,
                              type: 'City Destination',
                              icon: '📍',
                              isCity: true
                            }))
                            : [
                              { label: city || 'Chennai', type: 'Current City', icon: '📍', isCity: true },
                              ...POPULAR_CITIES.filter(p => p.name !== city).slice(0, 3).map(p => ({
                                label: p.name,
                                type: 'Popular City',
                                icon: '📍',
                                isCity: true
                              }))
                            ];

                          // 2. Matching arenas / services from servicesList
                          const matchingArenas = (servicesList || [])
                            .filter((s: any) => {
                              if (!q) return true;
                              const sName = (s.name || '').toLowerCase();
                              const mName = (s.merchant?.name || s.branchName || s.merchantName || '').toLowerCase();
                              const sCity = (s.city || s.merchant?.city || '').toLowerCase();
                              const sAddress = (s.address || s.merchant?.address || '').toLowerCase();
                              return sName.includes(q) || mName.includes(q) || sCity.includes(q) || sAddress.includes(q);
                            })
                            .slice(0, 5)
                            .map((s: any) => ({
                              label: s.branchName || s.merchant?.name || s.name,
                              type: s.name || s.merchant?.name || 'Verified Arena',
                              icon: '⚽',
                              isCity: false
                            }));

                          const combinedMatches = [...matchingCities, ...matchingArenas];

                          if (combinedMatches.length === 0) {
                            return (
                              <div className="px-3 py-3 text-center text-xs text-slate-400">
                                Press Search to find all slots for "{searchQuery}".
                              </div>
                            );
                          }

                          return combinedMatches.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.isCity) {
                                  const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === item.label.toLowerCase());
                                  if (popMatch) {
                                    setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                  } else {
                                    setCity(item.label);
                                  }
                                }
                                setSearchQuery(item.label);
                                setShowAutocomplete(false);
                              }}
                              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                            >
                              <span className="flex items-center gap-2 font-semibold truncate">
                                <span>{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">{item.type}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </>
                  )}
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                {/* 2. Slot Play Date (Single Date Picker) */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => {
                      setSportsCalDate(new Date(sportsSlotDate));
                      setIsSportsDatePickerOpen(!isSportsDatePickerOpen);
                    }}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className={`transition-colors shrink-0 ${isSportsDatePickerOpen ? 'text-[#ff6325]' : 'text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325]'}`}>
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PLAY DATE</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {(() => {
                          try {
                            const [y, m, d] = sportsSlotDate.split('-');
                            const todayStr = new Date().toISOString().split('T')[0];
                            if (sportsSlotDate === todayStr) return `Today (${d}-${m})`;
                            return `${d}-${m}-${y}`;
                          } catch {
                            return sportsSlotDate;
                          }
                        })()}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isSportsDatePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Single Date Calendar Popover */}
                  {isSportsDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSportsDatePickerOpen(false)} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-76 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                        {/* Quick Day Shortcuts */}
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {[
                            { label: 'Today', offset: 0 },
                            { label: 'Tomorrow', offset: 1 },
                            { label: 'Weekend', offset: (() => { const d = new Date(); return (6 - d.getDay() + 7) % 7 || 7; })() },
                          ].map((tab, idx) => {
                            const d = new Date();
                            d.setDate(d.getDate() + tab.offset);
                            const val = d.toISOString().split('T')[0];
                            const isSel = sportsSlotDate === val;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSportsSlotDate(val);
                                  setIsSportsDatePickerOpen(false);
                                }}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                                  isSel
                                    ? 'bg-[#ff6325] text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {tab.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Calendar Month Header */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-3 border border-slate-150/60 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(sportsCalDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setSportsCalDate(newD);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            <ChevronLeft size={15} />
                          </button>
                          <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white">
                            {sportsCalDate.toLocaleString('default', { month: 'short' })} {sportsCalDate.getFullYear()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(sportsCalDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setSportsCalDate(newD);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {(() => {
                            const year = sportsCalDate.getFullYear();
                            const month = sportsCalDate.getMonth();
                            const firstDayIndex = new Date(year, month, 1).getDay();
                            const totalDays = new Date(year, month + 1, 0).getDate();
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const cells = [];
                            for (let i = 0; i < firstDayIndex; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                            }

                            for (let day = 1; day <= totalDays; day++) {
                              const monthStr = String(month + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const dateStr = `${year}-${monthStr}-${dayStr}`;
                              const cellDate = new Date(year, month, day);
                              const isPast = cellDate < today;
                              const isSelected = dateStr === sportsSlotDate;

                              cells.push(
                                <button
                                  key={`d-${day}`}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setSportsSlotDate(dateStr);
                                    setIsSportsDatePickerOpen(false);
                                  }}
                                  className={`h-8 w-8 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30 font-black scale-105'
                                      : isPast
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Search Action Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsSportsSlotDropdownOpen(false);
                      setIsSportsDatePickerOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Search size={17} className="group-hover:scale-110 transition-transform" />
                    <span>Search Arenas</span>
                  </button>
                </div>
              </div>
            ) : isEntertainmentCategory ? (
              /* =========================================================================
               * DEDICATED ENTERTAINMENT, CINEMA & SHOWS SEARCH DOCK (BookMyShow / District Style)
               * CITY / THEATRE / SHOW | SHOW DATE | FORMAT / TIME | EXPLORE SHOWS
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

                {/* 1. Cinema / Theatre / Event Venue or Title */}
                <div className="flex-[1.4] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CITY / CINEMA / SHOW</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder={`Search ${categoryName} theatre, artist or city...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const q = searchQuery.trim().toLowerCase();
                            if (q) {
                              const matchedCity = ALL_CITIES.find(c => c.toLowerCase() === q);
                              if (matchedCity) {
                                const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === matchedCity.toLowerCase());
                                if (popMatch) {
                                  setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                } else {
                                  setCity(matchedCity);
                                }
                              }
                            }
                            setShowAutocomplete(false);
                            const el = document.getElementById('hotel-results-anchor');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                        title="Clear"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAutocomplete(false)} />
                      <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                          <span>{searchQuery ? `Matching "${searchQuery}"` : `Popular Shows & Theatres`}</span>
                          <span className="text-[9px] text-[#ff6325]">{city || 'All India'}</span>
                        </div>
                        {(() => {
                          const q = searchQuery.toLowerCase().trim();

                          // 1. Matching cities from ALL_CITIES
                          const matchingCities = q
                            ? ALL_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 5).map(c => ({
                              label: c,
                              type: 'City Destination',
                              icon: '📍',
                              isCity: true
                            }))
                            : [
                              { label: city || 'Chennai', type: 'Current City', icon: '📍', isCity: true },
                              ...POPULAR_CITIES.filter(p => p.name !== city).slice(0, 3).map(p => ({
                                label: p.name,
                                type: 'Popular City',
                                icon: '📍',
                                isCity: true
                              }))
                            ];

                          // 2. Matching entertainment listings / branches
                          const matchingVenues = (servicesList || [])
                            .filter((s: any) => {
                              if (!q) return true;
                              const sName = (s.name || '').toLowerCase();
                              const mName = (s.merchant?.name || s.branchName || s.merchantName || '').toLowerCase();
                              const sCity = (s.city || s.merchant?.city || '').toLowerCase();
                              const sAddress = (s.address || s.merchant?.address || '').toLowerCase();
                              return sName.includes(q) || mName.includes(q) || sCity.includes(q) || sAddress.includes(q);
                            })
                            .slice(0, 5)
                            .map((s: any) => ({
                              label: s.branchName || s.merchant?.name || s.name,
                              type: s.name || s.merchant?.name || 'Verified Venue',
                              icon: '🎭',
                              isCity: false
                            }));

                          const combinedMatches = [...matchingCities, ...matchingVenues];

                          if (combinedMatches.length === 0) {
                            return (
                              <div className="px-3 py-3 text-center text-xs text-slate-400">
                                Press Search to explore all shows for "{searchQuery}".
                              </div>
                            );
                          }

                          return combinedMatches.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.isCity) {
                                  const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === item.label.toLowerCase());
                                  if (popMatch) {
                                    setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                  } else {
                                    setCity(item.label);
                                  }
                                }
                                setSearchQuery(item.label);
                                setShowAutocomplete(false);
                              }}
                              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                            >
                              <span className="flex items-center gap-2 font-semibold truncate">
                                <span>{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">{item.type}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Show Date Selector (Quick Pills: Today, Tomorrow, Weekend) */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsSportsDatePickerOpen(!isSportsDatePickerOpen)}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SHOW DATE</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {(() => {
                          const today = new Date();
                          const todayStr = today.toISOString().split('T')[0];
                          const tmrw = new Date();
                          tmrw.setDate(tmrw.getDate() + 1);
                          const tmrwStr = tmrw.toISOString().split('T')[0];

                          if (sportsSlotDate === todayStr) return `Today (${today.getDate()} ${today.toLocaleDateString('en-US', { month: 'short' })})`;
                          if (sportsSlotDate === tmrwStr) return `Tomorrow (${tmrw.getDate()} ${tmrw.toLocaleDateString('en-US', { month: 'short' })})`;
                          const chosen = new Date(sportsSlotDate);
                          return `${chosen.toLocaleDateString('en-US', { weekday: 'short' })}, ${chosen.getDate()} ${chosen.toLocaleDateString('en-US', { month: 'short' })}`;
                        })()}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isSportsDatePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Show Date Picker Modal */}
                  {isSportsDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSportsDatePickerOpen(false)} />
                      <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/10">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Select Show Date</span>
                          <button
                            type="button"
                            onClick={() => setIsSportsDatePickerOpen(false)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Quick Date Tabs */}
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {[
                            { label: 'Today', days: 0 },
                            { label: 'Tomorrow', days: 1 },
                            { label: 'Weekend', days: (() => {
                              const d = new Date();
                              const day = d.getDay();
                              return day === 0 ? 0 : 6 - day;
                            })() },
                          ].map((tab, idx) => {
                            const d = new Date();
                            d.setDate(d.getDate() + tab.days);
                            const val = d.toISOString().split('T')[0];
                            const isSel = sportsSlotDate === val;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSportsSlotDate(val);
                                  setIsSportsDatePickerOpen(false);
                                }}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                                  isSel
                                    ? 'bg-[#ff6325] text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {tab.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Month Navigator */}
                        <div className="flex items-center justify-between mb-2 px-1 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(sportsCalDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setSportsCalDate(newD);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            <ChevronLeft size={15} />
                          </button>
                          <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white">
                            {sportsCalDate.toLocaleString('default', { month: 'short' })} {sportsCalDate.getFullYear()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(sportsCalDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setSportsCalDate(newD);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {(() => {
                            const year = sportsCalDate.getFullYear();
                            const month = sportsCalDate.getMonth();
                            const firstDayIndex = new Date(year, month, 1).getDay();
                            const totalDays = new Date(year, month + 1, 0).getDate();
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const cells = [];
                            for (let i = 0; i < firstDayIndex; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                            }

                            for (let day = 1; day <= totalDays; day++) {
                              const monthStr = String(month + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const dateStr = `${year}-${monthStr}-${dayStr}`;
                              const cellDate = new Date(year, month, day);
                              const isPast = cellDate < today;
                              const isSelected = dateStr === sportsSlotDate;

                              cells.push(
                                <button
                                  key={`d-${day}`}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setSportsSlotDate(dateStr);
                                    setIsSportsDatePickerOpen(false);
                                  }}
                                  className={`h-8 w-8 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30 font-black scale-105'
                                      : isPast
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Screen Format & Timing Quick Pill Filter */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsSportsSlotDropdownOpen(!isSportsSlotDropdownOpen)}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">FORMAT / EXPERIENCE</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {entFormatFilter === 'all' ? 'All Screen Formats' : entFormatFilter}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isSportsSlotDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Format Dropdown Menu */}
                  {isSportsSlotDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSportsSlotDropdownOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                          Screen & Audio Experience
                        </div>
                        {[
                          { id: 'all', label: 'All Formats', icon: '🎬' },
                          { id: 'IMAX Laser', label: 'IMAX Laser 3D', icon: '📽️' },
                          { id: 'Dolby Atmos', label: 'Dolby Atmos 7.1', icon: '🔊' },
                          { id: '4DX', label: '4DX Motion Dynamic', icon: '💺' },
                          { id: 'Recliner', label: 'VIP Royal Recliner', icon: '👑' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => {
                              setEntFormatFilter(fmt.id);
                              setIsSportsSlotDropdownOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                              entFormatFilter === fmt.id
                                ? 'bg-[#ff6325] text-white font-black'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{fmt.icon}</span>
                              <span>{fmt.label}</span>
                            </span>
                            {entFormatFilter === fmt.id && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 4. Search Action Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsSportsSlotDropdownOpen(false);
                      setIsSportsDatePickerOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Search size={17} className="group-hover:scale-110 transition-transform" />
                    <span>Explore Shows</span>
                  </button>
                </div>
              </div>
            ) : isDiningCategory ? (
              /* =========================================================================
               * DEDICATED RESTAURANT & TABLE RESERVATION SEARCH DOCK (Zomato Dining / Dineout Style)
               * RESTAURANT / CUISINE | DATE & MEAL | GUESTS & SEATING | FIND A TABLE
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                {/* 1. Restaurant / Cuisine / Locality */}
                <div className="flex-[1.4] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Utensils size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">RESTAURANT / CUISINE</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder={`Search rooftop bistro, buffet, cafe in ${city || 'Chennai'}...`}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Dining Date & Meal Session (Today Lunch / Dinner) */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsSportsDatePickerOpen(!isSportsDatePickerOpen)}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">DATE & SESSION</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {sportsSlotDate === todayStr ? 'Today' : sportsSlotDate} • {diningMealSession === 'ALL' ? 'Lunch / Dinner' : diningMealSession}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  </button>

                  {/* Dining Date & Session Picker Popover */}
                  {isSportsDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSportsDatePickerOpen(false)} />
                      <div className="absolute top-full left-0 mt-3 w-72 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 shadow-2xl p-3.5 z-50 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Meal Session</span>
                          <div className="flex items-center gap-1">
                            {['ALL', 'LUNCH', 'DINNER'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setDiningMealSession(s as any)}
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  diningMealSession === s ? 'bg-[#ff6325] text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Date Pills */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: 'Today', date: todayStr },
                            { label: 'Tomorrow', date: tomorrowStr },
                            {
                              label: 'This Weekend',
                              date: (() => {
                                const d = new Date();
                                const day = d.getDay();
                                const diff = (6 - day + 7) % 7 || 7;
                                d.setDate(d.getDate() + diff);
                                return d.toISOString().split('T')[0];
                              })()
                            }
                          ].map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                setSportsSlotDate(p.date);
                                setIsSportsDatePickerOpen(false);
                              }}
                              className={`py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all ${
                                sportsSlotDate === p.date
                                  ? 'bg-[#ff6325] text-white shadow-md shadow-[#ff6325]/25'
                                  : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Guests Count & Seating Preference */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsDiningGuestsOpen(!isDiningGuestsOpen)}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Users size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">GUESTS & SEATING</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {diningGuestsCount} Guests • {diningSeatingZone === 'ROOFTOP' ? 'Rooftop' : diningSeatingZone === 'AC_INDOOR' ? 'AC Hall' : diningSeatingZone === 'PRIVATE_DINING' ? 'Private Dining' : 'Any Seating'}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  </button>

                  {/* Guests & Seating Dropdown */}
                  {isDiningGuestsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDiningGuestsOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-72 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                          <span className="text-xs font-bold text-slate-800 dark:text-white">Number of Guests</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={diningGuestsCount <= 1}
                              onClick={() => setDiningGuestsCount(Math.max(1, diningGuestsCount - 1))}
                              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold disabled:opacity-30"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">{diningGuestsCount}</span>
                            <button
                              type="button"
                              onClick={() => setDiningGuestsCount(diningGuestsCount + 1)}
                              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Preferred Zone */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Seating Ambience</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'all', label: 'Any Seating', icon: '🍽️' },
                              { id: 'ROOFTOP', label: 'Rooftop Views', icon: '🍷' },
                              { id: 'AC_INDOOR', label: 'AC Dining Hall', icon: '🛋️' },
                              { id: 'PRIVATE_DINING', label: 'Private Suite', icon: '👑' }
                            ].map((z) => (
                              <button
                                key={z.id}
                                type="button"
                                onClick={() => {
                                  setDiningSeatingZone(z.id);
                                  setIsDiningGuestsOpen(false);
                                }}
                                className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-colors ${
                                  diningSeatingZone === z.id
                                    ? 'bg-[#ff6325]/10 border-[#ff6325] text-[#ff6325]'
                                    : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="mr-1">{z.icon}</span> {z.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 4. Search Action Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsSportsDatePickerOpen(false);
                      setIsDiningGuestsOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Utensils size={17} className="group-hover:scale-110 transition-transform" />
                    <span>Find a Table</span>
                  </button>
                </div>
              </div>
            ) : isDoctorCategory ? (
              /* =========================================================================
               * DEDICATED DOCTOR & HEALTHCARE CONSULTATION SEARCH DOCK (Practo / Apollo Style)
               * CLINIC / DOCTOR / HOSPITAL | SPECIALITY / DEPARTMENT | CONSULTATION MODE | APPOINTMENT DATE | BOOK CONSULTATION
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                {/* 1. Doctor / Clinic / Hospital / Area */}
                <div className="flex-[1.4] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Search size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        DOCTOR / CLINIC / HOSPITAL
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder={`Search doctors, dental, skin clinics in ${city || 'Chennai'}...`}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Doctor Speciality / Department */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <div className="flex items-center gap-3 w-full text-left">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Award size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SPECIALITY / FIELD</span>
                      <select
                        value={doctorSpecialityFilter}
                        onChange={(e) => setDoctorSpecialityFilter(e.target.value)}
                        className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="ALL" className="dark:bg-slate-900">All Specialities</option>
                        <option value="GENERAL" className="dark:bg-slate-900">General Physician / MD</option>
                        <option value="DENTAL" className="dark:bg-slate-900">Dentist & Orthodontist</option>
                        <option value="DERMA" className="dark:bg-slate-900">Dermatologist (Skin & Hair)</option>
                        <option value="PEDIA" className="dark:bg-slate-900">Pediatrician (Child Care)</option>
                        <option value="ORTHO" className="dark:bg-slate-900">Orthopedic (Bone & Joint)</option>
                        <option value="ENT" className="dark:bg-slate-900">ENT Specialist (Ear Nose Throat)</option>
                        <option value="GYNAEC" className="dark:bg-slate-900">Gynecologist & Obstetrician</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Consultation Mode & Date */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <div className="flex items-center gap-3 w-full text-left">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">MODE & DATE</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <select
                          value={doctorModeFilter}
                          onChange={(e) => setDoctorModeFilter(e.target.value as any)}
                          className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="ALL" className="dark:bg-slate-900">🏥 In-Clinic / Video</option>
                          <option value="IN_CLINIC" className="dark:bg-slate-900">🏥 In-Clinic Visit</option>
                          <option value="VIDEO_CALL" className="dark:bg-slate-900">📱 Video Consult</option>
                        </select>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCalendarViewDate(new Date(sportsSlotDate || todayStr));
                            setIsSportsDatePickerOpen(!isSportsDatePickerOpen);
                          }}
                          className="text-xs font-bold text-[#ff6325] hover:underline cursor-pointer"
                        >
                          {sportsSlotDate === todayStr ? 'Today' : sportsSlotDate}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clean Interactive Calendar Popover (Airbnb / Agoda Standard) */}
                  {isSportsDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSportsDatePickerOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                        {/* Calendar Month Header */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-3 border border-slate-150/60 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                            {calendarViewDate.toLocaleString('default', { month: 'long' })} {calendarViewDate.getFullYear()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Day of Week Labels */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="py-1">{day}</div>
                          ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {(() => {
                            const year = calendarViewDate.getFullYear();
                            const month = calendarViewDate.getMonth();
                            const firstDayIndex = new Date(year, month, 1).getDay();
                            const totalDays = new Date(year, month + 1, 0).getDate();

                            const cells = [];
                            for (let i = 0; i < firstDayIndex; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                            }

                            for (let day = 1; day <= totalDays; day++) {
                              const monthStr = String(month + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const dateStr = `${year}-${monthStr}-${dayStr}`;
                              const isSelected = dateStr === (sportsSlotDate || todayStr);
                              const isPast = dateStr < todayStr;

                              cells.push(
                                <button
                                  key={`day-${day}`}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setSportsSlotDate(dateStr);
                                    setIsSportsDatePickerOpen(false);
                                  }}
                                  className={`h-8 w-8 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-sm font-black'
                                      : isPast
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 4. Action CTA Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsSportsDatePickerOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Search size={17} className="group-hover:scale-110 transition-transform" />
                    <span>Book Doctor</span>
                  </button>
                </div>
              </div>
            ) : isSalonCategory ? (
              /* =========================================================================
               * DEDICATED SALON & SPA SEARCH DOCK (Option 1: Clean, Spacious & Uncrowded)
               * SALON / SPA / AREA | SERVICE & RITUAL | FOR WHOM | APPOINTMENT DATE | CTA
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 sm:gap-2">
                {/* 1. Salon / Spa / Locality with Autocomplete */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <MapPin size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">LOCATION / SALON</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder={`Search salon, spa, or area in ${city || 'Chennai'}...`}
                        className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
                        title="Clear"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAutocomplete(false)} />
                      <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                          <span>{searchQuery ? `Matching "${searchQuery}"` : `Top Salons & Spas`}</span>
                          <span className="text-[9px] text-[#ff6325]">{city || 'All India'}</span>
                        </div>
                        {(() => {
                          const q = searchQuery.toLowerCase().trim();
                          const matchingCities = q
                            ? ALL_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 4).map(c => ({
                              label: c,
                              type: 'City Destination',
                              icon: '📍',
                              isCity: true
                            }))
                            : [
                              { label: city || 'Chennai', type: 'Current City', icon: '📍', isCity: true },
                              ...POPULAR_CITIES.filter(p => p.name !== city).slice(0, 3).map(p => ({
                                label: p.name,
                                type: 'Popular City',
                                icon: '📍',
                                isCity: true
                              }))
                            ];

                          const matchingSalons = (servicesList || [])
                            .filter((s: any) => {
                              if (!q) return true;
                              const sName = (s.name || '').toLowerCase();
                              const mName = (s.merchant?.name || s.branchName || s.merchantName || '').toLowerCase();
                              const sAddress = (s.address || s.merchant?.address || '').toLowerCase();
                              return sName.includes(q) || mName.includes(q) || sAddress.includes(q);
                            })
                            .slice(0, 4)
                            .map((s: any) => ({
                              label: s.branchName || s.merchant?.name || s.name,
                              type: s.name || 'Verified Salon / Spa',
                              icon: '✨',
                              isCity: false
                            }));

                          const combinedMatches = [...matchingCities, ...matchingSalons];

                          return combinedMatches.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.isCity) {
                                  const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === item.label.toLowerCase());
                                  if (popMatch) {
                                    setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                  } else {
                                    setCity(item.label);
                                  }
                                }
                                setSearchQuery(item.label);
                                setShowAutocomplete(false);
                              }}
                              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                            >
                              <span className="flex items-center gap-2 font-semibold truncate">
                                <span>{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">{item.type}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Service / Ritual Type (Clean Popover Picker with Salon vs Spa Filter) */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Sparkles size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {salonTypeFilter === 'SPA' ? 'SPA & MASSAGE' : salonTypeFilter === 'SALON' ? 'SALON & GROOMING' : 'SERVICE / RITUAL'}
                      </span>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={salonServiceInput}
                          onFocus={() => setIsSalonServiceDropdownOpen(true)}
                          onChange={(e) => setSalonServiceInput(e.target.value)}
                          placeholder="All Services & Treatments..."
                          className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                        />
                        {salonServiceInput ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSalonServiceInput('');
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                          >
                            <X size={12} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsSalonServiceDropdownOpen(!isSalonServiceDropdownOpen)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <ChevronDown size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Ritual / Service Dropdown Menu with Salon vs Spa Tabs */}
                  {isSalonServiceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSalonServiceDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-3 z-50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Choose Type</span>
                          {salonServiceInput && (
                            <button
                              type="button"
                              onClick={() => setSalonServiceInput('')}
                              className="text-[10px] font-bold text-[#ff6325] hover:underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Clean Tab Segment: All, Salon, Spa */}
                        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                          {[
                            { id: 'ALL', label: 'All Services', icon: '✨' },
                            { id: 'SALON', label: 'Salon', icon: '✂️' },
                            { id: 'SPA', label: 'Spa & Sauna', icon: '🧖' },
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSalonTypeFilter(t.id as any)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                                salonTypeFilter === t.id
                                  ? 'bg-[#ff6325] text-white shadow-xs font-black'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <span>{t.icon}</span>
                              <span className="truncate">{t.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                          Popular Treatments & Rituals
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                          {[
                            { label: 'Haircut & Styling', icon: '✂️', type: 'SALON' },
                            { label: 'Beard Grooming', icon: '🧔', type: 'SALON' },
                            { label: 'Facial & Clean Up', icon: '✨', type: 'SALON' },
                            { label: 'Full Body Massage', icon: '💆', type: 'SPA' },
                            { label: 'Thai Therapy', icon: '🧘', type: 'SPA' },
                            { label: 'Hair Spa & Keratin', icon: '🧴', type: 'SALON' },
                            { label: 'Pedicure & Manicure', icon: '💅', type: 'SALON' },
                            { label: 'Aromatherapy Steam', icon: '🧖', type: 'SPA' },
                            { label: 'Bridal Makeover', icon: '👰', type: 'SALON' },
                          ]
                            .filter(i => salonTypeFilter === 'ALL' || i.type === salonTypeFilter)
                            .map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => {
                                  setSalonServiceInput(item.label);
                                  setIsSalonServiceDropdownOpen(false);
                                }}
                                className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  salonServiceInput.toLowerCase() === item.label.toLowerCase()
                                    ? 'bg-[#ff6325] text-white font-black'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-white/5'
                                }`}
                              >
                                <span>{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. For Whom (Gender / Audience Target) */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsSalonGenderDropdownOpen(!isSalonGenderDropdownOpen)}
                    className="flex items-center gap-2 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Users size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">FOR WHOM</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {salonGenderFilter === 'WOMEN'
                          ? "👩 Women"
                          : salonGenderFilter === 'MEN'
                          ? "🧔 Men"
                          : salonGenderFilter === 'KIDS'
                          ? "🧒 Kids"
                          : '✨ All / Unisex'}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform shrink-0 ${isSalonGenderDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Gender Selector Dropdown */}
                  {isSalonGenderDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSalonGenderDropdownOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                          Target Audience
                        </div>
                        {[
                          { id: 'ALL', label: 'All Services (Unisex)', icon: '✨' },
                          { id: 'WOMEN', label: "Women's Beauty & Spa", icon: '👩' },
                          { id: 'MEN', label: "Men's Grooming", icon: '🧔' },
                          { id: 'KIDS', label: 'Kids & Teens Care', icon: '🧒' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              setSalonGenderFilter(g.id as any);
                              setIsSalonGenderDropdownOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              salonGenderFilter === g.id
                                ? 'bg-[#ff6325] text-white font-black'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{g.icon}</span>
                              <span>{g.label}</span>
                            </span>
                            {salonGenderFilter === g.id && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 4. Service Date (Today, Tomorrow, Custom) */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsSportsDatePickerOpen(!isSportsDatePickerOpen)}
                    className="flex items-center gap-2 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Calendar size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">DATE</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {sportsSlotDate === todayStr ? 'Today' : sportsSlotDate === tomorrowStr ? 'Tomorrow' : sportsSlotDate}
                      </span>
                    </div>
                  </button>

                  {isSportsDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSportsDatePickerOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                        {/* Month Header */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-3 border border-slate-150/60 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                            {calendarViewDate.toLocaleString('default', { month: 'long' })} {calendarViewDate.getFullYear()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Day of Week */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="py-1">{day}</div>
                          ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {(() => {
                            const year = calendarViewDate.getFullYear();
                            const month = calendarViewDate.getMonth();
                            const firstDayIndex = new Date(year, month, 1).getDay();
                            const totalDays = new Date(year, month + 1, 0).getDate();

                            const cells = [];
                            for (let i = 0; i < firstDayIndex; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                            }

                            for (let day = 1; day <= totalDays; day++) {
                              const monthStr = String(month + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const dateStr = `${year}-${monthStr}-${dayStr}`;
                              const isSelected = dateStr === (sportsSlotDate || todayStr);
                              const isPast = dateStr < todayStr;

                              cells.push(
                                <button
                                  key={`day-${day}`}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setSportsSlotDate(dateStr);
                                    setIsSportsDatePickerOpen(false);
                                  }}
                                  className={`h-8 w-8 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-sm font-black'
                                      : isPast
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 5. Action CTA Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsSportsDatePickerOpen(false);
                      setIsSalonGenderDropdownOpen(false);
                      setIsSalonServiceDropdownOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-6 py-3 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-lg shadow-[#ff6325]/30 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Search size={16} className="group-hover:scale-110 transition-transform" />
                    <span>Find Salons & Spas</span>
                  </button>
                </div>
              </div>
            ) : isFitnessCategory ? (
              /* =========================================================================
               * DEDICATED GYM & YOGA SEARCH DOCK (Matching Category Style)
               * GYM/YOGA/AREA | MEMBERSHIP / PASS TYPE | BATCH / TIMING | START DATE | CTA
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 sm:gap-2">
                {/* 1. Gym / Yoga Studio / Locality */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <MapPin size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {isExplicitGym ? 'GYM / AREA' : isExplicitYoga ? 'YOGA SHALA / AREA' : 'FITNESS CLUB / AREA'}
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder={`Search ${isExplicitGym ? 'gym, crossfit' : isExplicitYoga ? 'yoga shala, guru' : 'fitness studio'} in ${city || 'Chennai'}...`}
                        className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
                        title="Clear"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Membership Duration / Plan Type */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsFitnessPlanDropdownOpen(!isFitnessPlanDropdownOpen)}
                    className="flex items-center gap-2 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Sparkles size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">MEMBERSHIP PLAN</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {fitnessPlanFilter === '1_MONTH'
                          ? '📅 1 Month Standard'
                          : fitnessPlanFilter === '3_MONTHS'
                          ? '🚀 3 Months (Quarterly)'
                          : fitnessPlanFilter === '6_MONTHS'
                          ? '🏆 6 Months (Pro Pass)'
                          : fitnessPlanFilter === '12_MONTHS'
                          ? '👑 12 Months (Annual VIP)'
                          : fitnessPlanFilter === 'DAILY'
                          ? '🎟️ 1 Day Workout Pass'
                          : fitnessPlanFilter === 'PT'
                          ? '🏋️ 1-on-1 Personal Trainer'
                          : '✨ All Memberships'}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform shrink-0 ${isFitnessPlanDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Plan Selector Dropdown */}
                  {isFitnessPlanDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFitnessPlanDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2.5 z-50 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                          {isExplicitGym ? 'Gym Memberships & Passes' : 'Yoga Shala Plans'}
                        </div>
                        {[
                          { id: '1_MONTH', label: '1 Month Membership (Standard)', icon: '📅' },
                          { id: '3_MONTHS', label: '3 Months (Quarterly Transformation)', icon: '🚀' },
                          { id: '6_MONTHS', label: '6 Months (Pro Fitness Pass)', icon: '🏆' },
                          { id: '12_MONTHS', label: '12 Months (Annual VIP — Best Value)', icon: '👑' },
                          { id: 'DAILY', label: 'Single Day Workout Pass', icon: '🎟️' },
                          { id: 'PT', label: '1-on-1 Personal Trainer Package', icon: '🏋️' },
                          { id: 'ALL', label: 'Browse All Membership Tiers', icon: '✨' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setFitnessPlanFilter(p.id as any);
                              setIsFitnessPlanDropdownOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              fitnessPlanFilter === p.id
                                ? 'bg-[#ff6325] text-white font-black'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{p.icon}</span>
                              <span className="truncate">{p.label}</span>
                            </span>
                            {fitnessPlanFilter === p.id && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Session / Batch Timing */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsFitnessBatchDropdownOpen(!isFitnessBatchDropdownOpen)}
                    className="flex items-center gap-2 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Clock size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">SHIFT / TIME</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {fitnessBatchFilter === 'MORNING'
                          ? '🌅 Morning (05:30 AM – 10:30 AM)'
                          : fitnessBatchFilter === 'EVENING'
                          ? '🌆 Evening (04:30 PM – 10:00 PM)'
                          : '⚡ Flexible All-Day Access'}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform shrink-0 ${isFitnessBatchDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Batch Selector Dropdown */}
                  {isFitnessBatchDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFitnessBatchDropdownOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                          Workout Shift
                        </div>
                        {[
                          { id: 'ALL', label: 'Flexible (All-Day Floor Access)', icon: '⚡' },
                          { id: 'MORNING', label: 'Morning Shift (05:30 AM - 10:30 AM)', icon: '🌅' },
                          { id: 'EVENING', label: 'Evening Shift (04:30 PM - 10:00 PM)', icon: '🌆' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setFitnessBatchFilter(b.id);
                              setIsFitnessBatchDropdownOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              fitnessBatchFilter === b.id
                                ? 'bg-[#ff6325] text-white font-black'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{b.icon}</span>
                              <span className="truncate">{b.label}</span>
                            </span>
                            {fitnessBatchFilter === b.id && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 4. Start Date with Full Interactive Calendar Popover */}
                <div className="flex-1 relative px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsFitnessDatePickerOpen(!isFitnessDatePickerOpen)}
                    className="flex items-center gap-2 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Calendar size={17} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">START DATE</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {sportsSlotDate === todayStr ? 'Today' : sportsSlotDate === tomorrowStr ? 'Tomorrow' : sportsSlotDate}
                      </span>
                    </div>
                  </button>

                  {isFitnessDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFitnessDatePickerOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                        {/* Month Header */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-3 border border-slate-150/60 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                            {calendarViewDate.toLocaleString('default', { month: 'long' })} {calendarViewDate.getFullYear()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Quick Start Shortcuts (Today, Tomorrow, 1st of Next Month) */}
                        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                          {[
                            { label: 'Today', val: todayStr },
                            { label: 'Tomorrow', val: tomorrowStr },
                            {
                              label: '1st of Next Mo.',
                              val: (() => {
                                const d = new Date();
                                d.setMonth(d.getMonth() + 1, 1);
                                return d.toISOString().split('T')[0];
                              })()
                            }
                          ].map(s => (
                            <button
                              key={s.label}
                              type="button"
                              onClick={() => {
                                setSportsSlotDate(s.val);
                                setIsFitnessDatePickerOpen(false);
                              }}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer ${
                                sportsSlotDate === s.val
                                  ? 'bg-[#ff6325] text-white font-black'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>

                        {/* Day of Week */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="py-1">{day}</div>
                          ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {(() => {
                            const year = calendarViewDate.getFullYear();
                            const month = calendarViewDate.getMonth();
                            const firstDayIndex = new Date(year, month, 1).getDay();
                            const totalDays = new Date(year, month + 1, 0).getDate();

                            const cells = [];
                            for (let i = 0; i < firstDayIndex; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                            }

                            for (let day = 1; day <= totalDays; day++) {
                              const monthStr = String(month + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const dateStr = `${year}-${monthStr}-${dayStr}`;
                              const isSelected = dateStr === (sportsSlotDate || todayStr);
                              const isPast = dateStr < todayStr;

                              cells.push(
                                <button
                                  key={`day-${day}`}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setSportsSlotDate(dateStr);
                                    setIsFitnessDatePickerOpen(false);
                                  }}
                                  className={`h-8 w-8 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-sm font-black'
                                      : isPast
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 5. Search Action Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsFitnessDatePickerOpen(false);
                      setIsFitnessPlanDropdownOpen(false);
                      setIsFitnessBatchDropdownOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-6 py-3 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-lg shadow-[#ff6325]/30 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Search size={16} className="group-hover:scale-110 transition-transform" />
                    <span>{isExplicitGym ? 'Find Gym Memberships' : isExplicitYoga ? 'Find Yoga Studios' : 'Find Fitness Studios'}</span>
                  </button>
                </div>
              </div>
            ) : (isHomeServicesCategory || isAppointmentCategory) ? (
              /* =========================================================================
               * DEDICATED HOME SERVICES & APPOINTMENT SEARCH DOCK (Urban Company Style)
               * SERVICE / AREA | SERVICE DATE | TIME WINDOW | BOOK PRO / SPECIALIST
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                {/* 1. Service / Locality */}
                <div className="flex-[1.4] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Search size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {isHomeServicesCategory ? 'LOCALITY / PINCODE' : 'CLINIC / SALON / AREA'}
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onFocus={(e) => {
                          setShowAutocomplete(true);
                          e.target.select();
                        }}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        placeholder={`Search ${categoryName} in ${city || 'Chennai'}...`}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Service Date */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <button
                    type="button"
                    onClick={() => setIsSportsDatePickerOpen(!isSportsDatePickerOpen)}
                    className="flex items-center gap-3 w-full text-left cursor-pointer"
                  >
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PREFERRED DATE</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {sportsSlotDate === todayStr ? 'Today' : sportsSlotDate}
                      </span>
                    </div>
                  </button>

                  {isSportsDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSportsDatePickerOpen(false)} />
                      <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                        {/* Calendar Month Header */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-3 border border-slate-150/60 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                            {calendarViewDate.toLocaleString('default', { month: 'long' })} {calendarViewDate.getFullYear()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setCalendarViewDate(newD);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Day of Week Labels */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="py-1">{day}</div>
                          ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {(() => {
                            const year = calendarViewDate.getFullYear();
                            const month = calendarViewDate.getMonth();
                            const firstDayIndex = new Date(year, month, 1).getDay();
                            const totalDays = new Date(year, month + 1, 0).getDate();

                            const cells = [];
                            for (let i = 0; i < firstDayIndex; i++) {
                              cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                            }

                            for (let day = 1; day <= totalDays; day++) {
                              const monthStr = String(month + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const dateStr = `${year}-${monthStr}-${dayStr}`;
                              const isSelected = dateStr === (sportsSlotDate || todayStr);
                              const isPast = dateStr < todayStr;

                              cells.push(
                                <button
                                  key={`day-${day}`}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setSportsSlotDate(dateStr);
                                    setIsSportsDatePickerOpen(false);
                                  }}
                                  className={`h-8 w-8 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-sm font-black'
                                      : isPast
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Preferred Time Slot Window */}
                <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                  <div className="flex items-center gap-3 w-full text-left">
                    <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                      <Clock size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SLOT WINDOW</span>
                      <select
                        value={homeServiceTimeWindow}
                        onChange={(e) => setHomeServiceTimeWindow(e.target.value)}
                        className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="ALL" className="dark:bg-slate-900">Any Time Slot</option>
                        <option value="MORNING" className="dark:bg-slate-900">Morning (09 AM – 12 PM)</option>
                        <option value="AFTERNOON" className="dark:bg-slate-900">Afternoon (12 PM – 04 PM)</option>
                        <option value="EVENING" className="dark:bg-slate-900">Evening (04 PM – 08 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Action CTA Button */}
                <div className="p-1 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      setIsSportsDatePickerOpen(false);
                      const el = document.getElementById('hotel-results-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                  >
                    <Search size={17} className="group-hover:scale-110 transition-transform" />
                    <span>{isHomeServicesCategory ? 'Book Expert' : 'Book Specialist'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* =========================================================================
               * STANDARD HOTEL / RESORT / VILLA SEARCH DOCK (Daily Check-in / Check-out)
               * ========================================================================= */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

              {/* 1. Destination / Where */}
              <div className="flex-[1.2] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{categoryHeroTheme.whereLabel}</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onFocus={(e) => {
                        setShowAutocomplete(true);
                        e.target.select();
                      }}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowAutocomplete(true);
                      }}
                      placeholder={categoryHeroTheme.wherePlaceholder}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const q = searchQuery.trim().toLowerCase();
                          if (q) {
                            const matchedCity = ALL_CITIES.find(c => c.toLowerCase() === q);
                            if (matchedCity) {
                              const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === matchedCity.toLowerCase());
                              if (popMatch) {
                                setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                              } else {
                                setCity(matchedCity);
                              }
                            }
                          }
                          setShowAutocomplete(false);
                          const el = document.getElementById('hotel-results-anchor');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal outline-none truncate"
                    />
                  </div>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                      title="Clear"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  )}
                </div>

                {/* Autocomplete Dropdown - Real-time Filtering by City, Name & Locality */}
                {showAutocomplete && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAutocomplete(false)} />
                    <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
                        <span>{searchQuery ? `Matching "${searchQuery}"` : `Popular Stays & Places`}</span>
                        <span className="text-[9px] text-[#ff6325]">{city || 'All India'}</span>
                      </div>
                      {(() => {
                        const q = searchQuery.toLowerCase().trim();

                        // 1. Matching cities from ALL_CITIES
                        const matchingCities = q
                          ? ALL_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 5).map(c => ({
                            label: c,
                            type: 'City Destination',
                            icon: '📍',
                            city: c,
                            isCity: true
                          }))
                          : [
                            { label: city || 'Chennai', type: 'Current City', icon: '📍', city: city || 'Chennai', isCity: true },
                            ...POPULAR_CITIES.filter(p => p.name !== city).slice(0, 4).map(p => ({
                              label: p.name,
                              type: 'Popular City',
                              icon: '📍',
                              city: p.name,
                              isCity: true
                            }))
                          ];

                        // 2. Matching stays from loaded servicesList
                        const matchingStays = (servicesList || [])
                          .filter((s: any) => {
                            if (!q) return true;
                            const sName = (s.name || '').toLowerCase();
                            const sCat = (s.category?.name || '').toLowerCase();
                            const sCity = (s.city || s.merchant?.city || '').toLowerCase();
                            return sName.includes(q) || sCat.includes(q) || sCity.includes(q);
                          })
                          .slice(0, 5)
                          .map((s: any) => ({
                            label: s.name,
                            type: s.category?.name || 'Verified Stay',
                            icon: '🏨',
                            city: s.city || s.merchant?.city || city,
                            isCity: false
                          }));

                        const combinedSuggestions = [...matchingCities, ...matchingStays];

                        if (combinedSuggestions.length === 0) {
                          return (
                            <div className="px-3 py-4 text-center text-xs text-slate-400">
                              No matching stays or cities found for "{searchQuery}". Press Search to explore all options.
                            </div>
                          );
                        }

                        return combinedSuggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.isCity) {
                                const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === item.label.toLowerCase());
                                if (popMatch) {
                                  setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                } else {
                                  setCity(item.label);
                                }
                                setSearchQuery(item.label);
                              } else {
                                setSearchQuery(item.label);
                              }
                              setShowAutocomplete(false);
                            }}
                            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-2 font-semibold truncate">
                              <span>{item.icon}</span>
                              <span className="truncate">{item.label}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">{item.type}</span>
                          </button>
                        ));
                      })()}
                    </div>
                  </>
                )}
              </div>

              {/* 2. Check-in Date */}
              <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarViewDate(new Date(checkInDate));
                    setActiveDatePicker(activeDatePicker === 'checkin' ? null : 'checkin');
                  }}
                  className="flex items-center gap-3 w-full text-left cursor-pointer"
                >
                  <div className={`transition-colors shrink-0 ${activeDatePicker === 'checkin' ? 'text-[#ff6325]' : 'text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325]'}`}>
                    <Calendar size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CHECK-IN</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                      {(() => {
                        try {
                          const [y, m, d] = checkInDate.split('-');
                          return `${d}-${m}-${y}`;
                        } catch {
                          return checkInDate;
                        }
                      })()}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${activeDatePicker === 'checkin' ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Interactive Calendar Popover for Check-in */}
                {activeDatePicker === 'checkin' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDatePicker(null)} />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-150 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                      {/* Calendar Month Header */}
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-4 border border-slate-150/60 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            const newD = new Date(calendarViewDate);
                            newD.setMonth(newD.getMonth() - 1);
                            setCalendarViewDate(newD);
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                          {calendarViewDate.toLocaleString('default', { month: 'long' })} {calendarViewDate.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newD = new Date(calendarViewDate);
                            newD.setMonth(newD.getMonth() + 1);
                            setCalendarViewDate(newD);
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Day of Week Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="py-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {(() => {
                          const year = calendarViewDate.getFullYear();
                          const month = calendarViewDate.getMonth();
                          const firstDayIndex = new Date(year, month, 1).getDay();
                          const totalDays = new Date(year, month + 1, 0).getDate();

                          const cells = [];
                          for (let i = 0; i < firstDayIndex; i++) {
                            cells.push(<div key={`empty-${i}`} className="h-9 w-9" />);
                          }

                          for (let day = 1; day <= totalDays; day++) {
                            const monthStr = String(month + 1).padStart(2, '0');
                            const dayStr = String(day).padStart(2, '0');
                            const dateStr = `${year}-${monthStr}-${dayStr}`;
                            const isSelected = dateStr === checkInDate;

                            cells.push(
                              <button
                                key={`day-${day}`}
                                type="button"
                                onClick={() => {
                                  setCheckInDate(dateStr);
                                  // Auto shift checkout if checkout <= checkin
                                  if (new Date(dateStr) >= new Date(checkOutDate)) {
                                    const nextD = new Date(dateStr);
                                    nextD.setDate(nextD.getDate() + 1);
                                    const nextMonthStr = String(nextD.getMonth() + 1).padStart(2, '0');
                                    const nextDayStr = String(nextD.getDate()).padStart(2, '0');
                                    setCheckOutDate(`${nextD.getFullYear()}-${nextMonthStr}-${nextDayStr}`);
                                  }
                                  setActiveDatePicker('checkout');
                                }}
                                className={`h-9 w-9 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${isSelected
                                    ? 'bg-[#1d4ed8] text-white shadow-md shadow-blue-500/30 font-black scale-105'
                                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {day}
                              </button>
                            );
                          }
                          return cells;
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. Check-out Date */}
              <div className="flex-1 relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarViewDate(new Date(checkOutDate));
                    setActiveDatePicker(activeDatePicker === 'checkout' ? null : 'checkout');
                  }}
                  className="flex items-center gap-3 w-full text-left cursor-pointer"
                >
                  <div className={`transition-colors shrink-0 ${activeDatePicker === 'checkout' ? 'text-[#ff6325]' : 'text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325]'}`}>
                    <Calendar size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CHECK-OUT</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                      {(() => {
                        try {
                          const [y, m, d] = checkOutDate.split('-');
                          return `${d}-${m}-${y}`;
                        } catch {
                          return checkOutDate;
                        }
                      })()}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${activeDatePicker === 'checkout' ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Interactive Calendar Popover for Check-out */}
                {activeDatePicker === 'checkout' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDatePicker(null)} />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-150 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                      {/* Calendar Month Header */}
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-4 border border-slate-150/60 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            const newD = new Date(calendarViewDate);
                            newD.setMonth(newD.getMonth() - 1);
                            setCalendarViewDate(newD);
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                          {calendarViewDate.toLocaleString('default', { month: 'long' })} {calendarViewDate.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newD = new Date(calendarViewDate);
                            newD.setMonth(newD.getMonth() + 1);
                            setCalendarViewDate(newD);
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Day of Week Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="py-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {(() => {
                          const year = calendarViewDate.getFullYear();
                          const month = calendarViewDate.getMonth();
                          const firstDayIndex = new Date(year, month, 1).getDay();
                          const totalDays = new Date(year, month + 1, 0).getDate();

                          const cells = [];
                          for (let i = 0; i < firstDayIndex; i++) {
                            cells.push(<div key={`empty-${i}`} className="h-9 w-9" />);
                          }

                          for (let day = 1; day <= totalDays; day++) {
                            const monthStr = String(month + 1).padStart(2, '0');
                            const dayStr = String(day).padStart(2, '0');
                            const dateStr = `${year}-${monthStr}-${dayStr}`;
                            const isSelected = dateStr === checkOutDate;
                            const isPastCheckIn = new Date(dateStr) < new Date(checkInDate);

                            cells.push(
                              <button
                                key={`day-${day}`}
                                type="button"
                                disabled={isPastCheckIn}
                                onClick={() => {
                                  setCheckOutDate(dateStr);
                                  setActiveDatePicker(null);
                                }}
                                className={`h-9 w-9 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${isSelected
                                    ? 'bg-[#1d4ed8] text-white shadow-md shadow-blue-500/30 font-black scale-105'
                                    : isPastCheckIn
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {day}
                              </button>
                            );
                          }
                          return cells;
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 4. Who (Guests & Rooms) */}
              <div className="flex-[1.1] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors group">
                <button
                  type="button"
                  onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
                  className="flex items-center gap-3 w-full text-left cursor-pointer"
                >
                  <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">WHO</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                      {adults + children} Guest{adults + children > 1 ? 's' : ''} • {rooms} Room{rooms > 1 ? 's' : ''}{petCount > 0 ? ` • ${petCount} Pet${petCount > 1 ? 's' : ''}` : ''}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${guestDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Guests Popover */}
                {guestDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setGuestDropdownOpen(false)} />
                    <div className="absolute top-full right-0 mt-3 w-72 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 space-y-3.5 text-slate-900 dark:text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Adults</p>
                          <p className="text-[10px] text-slate-400">Ages 18+</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={adults <= 1}
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[#ff6325] cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{adults}</span>
                          <button
                            type="button"
                            onClick={() => setAdults(adults + 1)}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold hover:border-[#ff6325] cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Children</p>
                          <p className="text-[10px] text-slate-400">Ages 0 to 17</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={children <= 0}
                            onClick={() => {
                              const newCount = Math.max(0, children - 1);
                              setChildren(newCount);
                              setChildAges(prev => prev.slice(0, newCount));
                            }}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[#ff6325] cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{children}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCount = children + 1;
                              setChildren(newCount);
                              setChildAges(prev => [...prev, 5]);
                            }}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold hover:border-[#ff6325] cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
                        <div>
                          <p className="text-xs font-bold">Rooms</p>
                          <p className="text-[10px] text-slate-400">Total units</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={rooms <= 1}
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[#ff6325] cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{rooms}</span>
                          <button
                            type="button"
                            onClick={() => setRooms(rooms + 1)}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold hover:border-[#ff6325] cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Pets Selector Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
                        <div>
                          <p className="text-xs font-bold flex items-center gap-1">
                            <span>Pets</span>
                            <span className="text-[11px]">🐾</span>
                          </p>
                          <p className="text-[10px] text-slate-400">Bringing a pet?</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={petCount <= 0}
                            onClick={() => {
                              const newCount = Math.max(0, petCount - 1);
                              setPetCount(newCount);
                              setPets(newCount > 0);
                            }}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-[#ff6325] cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{petCount}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCount = petCount + 1;
                              setPetCount(newCount);
                              setPets(true);
                              setPetFriendlyOnly(true);
                            }}
                            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold hover:border-[#ff6325] cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGuestDropdownOpen(false)}
                        className="w-full py-2 bg-[#ff6325] hover:bg-[#e0531b] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* 5. Search Action Button (Prominent Orange Capsule Pill) */}
              <div className="p-1 shrink-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const q = searchQuery.trim().toLowerCase();
                    if (q) {
                      const matchedCity = ALL_CITIES.find(c => c.toLowerCase() === q);
                      if (matchedCity) {
                        const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === matchedCity.toLowerCase());
                        if (popMatch) {
                          setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                        } else {
                          setCity(matchedCity);
                        }
                      }
                    }
                    setShowAutocomplete(false);
                    const el = document.getElementById('hotel-results-anchor');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                >
                  <Search size={17} className="group-hover:scale-110 transition-transform" />
                  <span>{categoryHeroTheme.searchBtnLabel}</span>
                </button>
              </div>
            </div>
            )}
          </div>
        </div>

      <div className={`container-main max-w-7xl mx-auto pt-0 pb-6`}>
        {/* Sleek Airbnb-Style Luxury Filter & Sort Capsule Toolbar */}
        <div className="flex flex-col gap-3 mb-6 px-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Unified Interactive Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* 1. Price Range Pill */}
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${priceRange < 50000
                      ? 'bg-[#ff6325]/10 border-[#ff6325] text-[#ff6325]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
                    }`}
                >
                  <option value={50000}>₹ Any Price</option>
                  <option value={3500}>Under ₹3,500</option>
                  <option value={7500}>Under ₹7,500</option>
                  <option value={15000}>Under ₹15,000</option>
                  <option value={30000}>Under ₹30,000</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* 2. Rating Pill */}
              <div className="relative">
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${minRating > 0
                      ? 'bg-[#ff6325]/10 border-[#ff6325] text-[#ff6325]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
                    }`}
                >
                  <option value={0}>★ Any Rating</option>
                  <option value={4.0}>★ 4.0+ Above</option>
                  <option value={4.5}>★ 4.5+ Top Rated</option>
                  <option value={4.8}>★ 4.8+ Luxury</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* 3. PG & Hostel Contextual Dropdowns (Gender & Food) seamlessly in the same row */}
              {(isPgCategory || category === 'hostels' || (categoryName || '').toLowerCase().includes('hostel')) && (
                <>
                  {/* Gender Dropdown Pill */}
                  <div className="relative">
                    <select
                      value={pgGenderFilter}
                      onChange={(e) => setPgGenderFilter(e.target.value as any)}
                      className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                        pgGenderFilter !== 'all'
                          ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <option value="all">👥 All Genders (PG)</option>
                      <option value="gents">🚹 Gents Only</option>
                      <option value="ladies">🚺 Ladies Only</option>
                      <option value="coliving">👥 Coliving Stay</option>
                    </select>
                    <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${pgGenderFilter !== 'all' ? 'text-white' : 'text-slate-400'}`} />
                  </div>

                  {/* Food Model Pill */}
                  <div className="relative">
                    <select
                      value={pgFoodFilter}
                      onChange={(e) => setPgFoodFilter(e.target.value as any)}
                      className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                        pgFoodFilter !== 'all'
                          ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <option value="all">🍛 Any Meal Plan</option>
                      <option value="with-food">🍲 3 Meals Included</option>
                      <option value="self-cooking">🍳 Self-Cooking</option>
                    </select>
                    <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${pgFoodFilter !== 'all' ? 'text-white' : 'text-slate-400'}`} />
                  </div>

                  {/* Sharing Room Dropdown */}
                  <div className="relative">
                    <select
                      value={pgSharingFilter}
                      onChange={(e) => setPgSharingFilter(e.target.value as any)}
                      className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                        pgSharingFilter !== 'all'
                          ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <option value="all">🛏️ Any Sharing</option>
                      <option value="single">Single Room</option>
                      <option value="2-sharing">2-Sharing</option>
                      <option value="3-sharing">3-Sharing</option>
                      <option value="4-sharing">4-Sharing</option>
                    </select>
                    <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${pgSharingFilter !== 'all' ? 'text-white' : 'text-slate-400'}`} />
                  </div>

                  {/* Dedicated Ladies PG Contextual Quick Filters */}
                  {pgGenderFilter === 'ladies' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setLadiesWardenOnly(!ladiesWardenOnly)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                          ladiesWardenOnly
                            ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <span>👩‍💼 Lady Warden</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLadiesLunchBoxOnly(!ladiesLunchBoxOnly)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                          ladiesLunchBoxOnly
                            ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <span>🍱 Packed Lunch Box</span>
                      </button>
                    </>
                  )}

                  {/* Dedicated Co-Living Contextual Quick Filters */}
                  {pgGenderFilter === 'coliving' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setColivingCoworkingOnly(!colivingCoworkingOnly)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                          colivingCoworkingOnly
                            ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <span>💻 Coworking Lounge</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setColivingPowerBackupOnly(!colivingPowerBackupOnly)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                          colivingPowerBackupOnly
                            ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <span>⚡ 100% Power Backup</span>
                      </button>
                    </>
                  )}
                </>
              )}

              {/* 4. Sports & Turf Specific Filters (Surface, Floodlights, AC, Gear) */}
              {isSportsCategory && (
                <>
                  {/* Pitch / Surface Type */}
                  <div className="relative">
                    <select
                      value={sportsSurfaceFilter}
                      onChange={(e) => setSportsSurfaceFilter(e.target.value)}
                      className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                        sportsSurfaceFilter !== 'all'
                          ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <option value="all">🏟️ Any Surface</option>
                      <option value="fifa">FIFA Approved Turf</option>
                      <option value="wooden">Wooden Court (Badminton/Squash)</option>
                      <option value="clay">Red Clay / Matting</option>
                      <option value="synthetic">Synthetic / AstroTurf</option>
                    </select>
                    <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${sportsSurfaceFilter !== 'all' ? 'text-white' : 'text-slate-400'}`} />
                  </div>

                  {/* Floodlights Pill */}
                  <button
                    type="button"
                    onClick={() => setFloodlightsOnly(!floodlightsOnly)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                      floodlightsOnly
                        ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span>💡 Match Floodlights</span>
                  </button>

                  {/* AC Court Pill */}
                  <button
                    type="button"
                    onClick={() => setAcCourtsOnly(!acCourtsOnly)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                      acCourtsOnly
                        ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span>❄️ AC Indoor Court</span>
                  </button>

                  {/* Equipment Provided Pill */}
                  <button
                    type="button"
                    onClick={() => setEquipmentProvidedOnly(!equipmentProvidedOnly)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                      equipmentProvidedOnly
                        ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span>🏸 Gear & Kit Included</span>
                  </button>
                </>
              )}

              {/* 4.5. Entertainment & Live Shows Filters (Language, Audi Format, Cinema Lounge) */}
              {isEntertainmentCategory && (
                <>
                  {/* Language Selector */}
                  <div className="relative">
                    <select
                      value={entLanguageFilter}
                      onChange={(e) => setEntLanguageFilter(e.target.value)}
                      className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                        entLanguageFilter !== 'all'
                          ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <option value="all">🗣️ Any Language</option>
                      <option value="tamil">Tamil</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="telugu">Telugu</option>
                    </select>
                    <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${entLanguageFilter !== 'all' ? 'text-white' : 'text-slate-400'}`} />
                  </div>

                  {/* Format Selector (IMAX 3D / Dolby Atmos) */}
                  <div className="relative">
                    <select
                      value={entFormatFilter}
                      onChange={(e) => setEntFormatFilter(e.target.value)}
                      className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                        entFormatFilter !== 'all'
                          ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <option value="all">🎬 Any Screen Format</option>
                      <option value="imax">IMAX Laser</option>
                      <option value="4dx">4DX Experience</option>
                      <option value="dolby">Dolby Atmos 7.1</option>
                      <option value="3d">RealD 3D</option>
                    </select>
                    <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${entFormatFilter !== 'all' ? 'text-white' : 'text-slate-400'}`} />
                  </div>

                  {/* Fan-Pit / VIP Lounge Access */}
                  <button
                    type="button"
                    onClick={() => setEntExperienceFilter(entExperienceFilter === 'recliner' ? 'all' : 'recliner')}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                      entExperienceFilter === 'recliner'
                        ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span>👑 VIP Recliner / Fan-Pit</span>
                  </button>
                </>
              )}

              {/* Contextual Pills for Doctor Healthcare Consultation */}
              {isDoctorCategory && (
                <>
                  {/* Quick Speciality Filter Pills */}
                  {[
                    { id: 'ALL', label: 'All Specialities' },
                    { id: 'DENTAL', label: '🦷 Dental & Implants' },
                    { id: 'GENERAL', label: '🩺 General Physician' },
                    { id: 'DERMA', label: '✨ Skin & Dermatology' },
                    { id: 'PEDIA', label: '👶 Pediatrician' }
                  ].map(spec => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setDoctorSpecialityFilter(spec.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                        doctorSpecialityFilter === spec.id
                          ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <span>{spec.label}</span>
                    </button>
                  ))}

                  {/* Consultation Mode Quick Filter Toggle */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-full shadow-xs">
                    {(['ALL', 'IN_CLINIC', 'VIDEO_CALL'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDoctorModeFilter(mode)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          doctorModeFilter === mode
                            ? 'bg-[#ff6325] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {mode === 'ALL' ? '🏥 In-Clinic & Video' : mode === 'IN_CLINIC' ? '🏥 In-Clinic' : '📱 Video Consult'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 5. Free Cancellation Pill (Hidden in Sports if non-cancellable or customized) */}
              {(!isSportsCategory && !isEntertainmentCategory) && (
                <button
                  type="button"
                  onClick={() => setFreeCancellationOnly(!freeCancellationOnly)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${freeCancellationOnly
                      ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <span>Free Cancellation</span>
                </button>
              )}

              {/* 6. Pet Friendly Pill (Only for Stays & Outdoor Parks) */}
              {(isHotelCategory || isPgCategory) && (
                <button
                  type="button"
                  onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${petFriendlyOnly || pets
                      ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <span>🐾 Pet Friendly</span>
                </button>
              )}

              {/* 7. Just Luxury (Golden Luxury Pill) — Universal across All Bookings */}
              <button
                type="button"
                onClick={() => setIsLuxuryMode(!isLuxuryMode)}
                className={`px-4 py-1.5 rounded-full border text-xs font-black transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-sm ${isLuxuryMode
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30'
                    : 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:border-amber-400 hover:bg-amber-500/15'
                  }`}
                title={isSportsCategory ? "Filter Pro FIFA, Olympic and Luxury AC sports arenas" : "Filter 5-Star & Ultra Luxury listings"}
              >
                <Sparkles size={13} className={isLuxuryMode ? 'text-slate-950 animate-spin' : 'text-amber-500'} />
                <span>✨ Just Luxury</span>
                {isLuxuryMode && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 bg-black/80 text-amber-300 rounded font-black tracking-wider">
                    {isSportsCategory ? 'Pro Tier' : 'Secret Mode'}
                  </span>
                )}
              </button>

              {/* Reset Filters (Only appears when any filter is active) */}
              {(priceRange < 50000 || minRating > 0 || freeCancellationOnly || petFriendlyOnly || isLuxuryMode || pgGenderFilter !== 'all' || pgFoodFilter !== 'all' || pgSharingFilter !== 'all' || sportsSurfaceFilter !== 'all' || floodlightsOnly || acCourtsOnly || equipmentProvidedOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange(50000);
                    setMinRating(0);
                    setFreeCancellationOnly(false);
                    setPetFriendlyOnly(false);
                    setIsLuxuryMode(false);
                    setPgGenderFilter('all');
                    setPgFoodFilter('all');
                    setPgSharingFilter('all');
                    setSportsSurfaceFilter('all');
                    setFloodlightsOnly(false);
                    setAcCourtsOnly(false);
                    setEquipmentProvidedOnly(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-400 hover:text-[#ff6325] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Right: Clean Sort Pill & View Toggle */}
            <div className="flex items-center gap-2.5 ml-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3.5 pr-7 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs"
                >
                  <option value="distance">Recommended / Distance</option>
                  <option value="price">Price: Low to High</option>
                  <option value="rating">Guest Rating: High to Low</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-slate-300 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
                title="Toggle Grid / List View"
              >
                {viewMode === 'grid' ? (
                  <>
                    <Grid size={13} className="text-[#ff6325]" />
                    <span className="hidden sm:inline">Grid</span>
                  </>
                ) : (
                  <>
                    <List size={13} className="text-[#ff6325]" />
                    <span className="hidden sm:inline">List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          {category === 'cabs' && <CabBookingView categoryName={categoryName} city={city} initialQuery={{ date: queryDate, slot: querySlot, city: queryCity, venue: queryVenue }} />}
          {category === 'flights' && <FlightBookingView categoryName={categoryName} city={city} initialQuery={{ date: queryDate, slot: querySlot, city: queryCity, venue: queryVenue }} />}
          {category === 'trains' && <TrainBookingView categoryName={categoryName} city={city} initialQuery={{ date: queryDate, slot: querySlot, city: queryCity, venue: queryVenue }} />}
          {category === 'buses' && <BusBookingView categoryName={categoryName} city={city} initialQuery={{ date: queryDate, slot: querySlot, city: queryCity, venue: queryVenue }} />}
          {category === 'metro' && <MetroBookingView categoryName={categoryName} city={city} />}
          {/* {['turfs', 'football-turf', 'cricket-ground'].includes(category) && <TurfsBookingView categoryName={categoryName} city={city} />} */}

          {/* BookMyShow / District Style: Now Showing Movies & Premier Events Discovery Sections */}
          {isEntertainmentCategory && (
            <div className="space-y-8 mb-8 animate-fade-in">
              {/* 1. Top Featured Hero Spotlight Banner */}
              {(() => {
                const featured = NOW_SHOWING_MOVIES.find(m => m.isFeaturedBanner) || NOW_SHOWING_MOVIES[0];
                return (
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 text-white min-h-[300px] md:min-h-[360px] flex items-center">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-65 transform hover:scale-105 transition-transform duration-700"
                      style={{ backgroundImage: `url("${featured.bannerUrl}"), url("${featured.posterUrl}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                    <div className="relative z-10 p-6 md:p-10 max-w-xl space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-1 shadow-lg">
                          <Flame size={12} /> Blockbuster Spotlight
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold">
                          {featured.certificate}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold">
                          {featured.runtime}
                        </span>
                        <span className="text-amber-400 font-extrabold text-xs flex items-center gap-1">
                          ★ {featured.rating}/10 <span className="text-white/60 text-[10px]">({featured.votesCount})</span>
                        </span>
                      </div>

                      <div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none drop-shadow-md">
                          {featured.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-2 line-clamp-2">
                          {featured.tagline} • {featured.synopsis}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {featured.formats.map((fmt, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 transition-colors">
                            {fmt}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMovieForTheatres(featured);
                            setShowTheatreModal(true);
                          }}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff6325] to-[#e04e13] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ff6325]/30 flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Ticket size={16} /> Book Tickets
                        </button>
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                          <span>In Cinemas:</span>
                          <strong className="text-white">CineMax Multiplex OMR & Forum</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Popular Near You / Now Showing Movies Carousel / Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <span>Popular Near You</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        Now Showing
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Select any movie to choose your multiplex, showtime, and seats</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">5 Blockbusters</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {NOW_SHOWING_MOVIES.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        setSelectedMovieForTheatres(movie);
                        setShowTheatreModal(true);
                      }}
                      className="group flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 hover:border-[#ff6325]/50 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
                    >
                      {/* Movie Poster Aspect 2:3 */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                        {/* Top Rating Tag */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-black border border-white/10">
                          ★ {movie.rating}
                          <span className="text-[9px] text-white/60 font-medium">({movie.votesCount.split(' ')[0]})</span>
                        </div>

                        {/* Top Right Certificate */}
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold border border-white/10">
                          {movie.certificate}
                        </div>

                        {/* Bottom Formats Pill on Poster */}
                        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                          {movie.formats.slice(0, 2).map((fmt, fIdx) => (
                            <span key={fIdx} className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold border border-white/15">
                              {fmt.replace(' Standard', '').replace(' Motion', '')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Movie Meta Information */}
                      <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#ff6325] transition-colors">
                            {movie.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold line-clamp-1 mt-0.5">
                            {movie.languages.slice(0, 2).join(', ')} • {movie.genres.slice(0, 2).join('/')}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {movie.runtime}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-[#ff6325]/10 text-[#ff6325] group-hover:bg-[#ff6325] group-hover:text-white text-[10px] font-black transition-colors uppercase tracking-wider flex items-center gap-0.5">
                            Book <ChevronRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Standard fallback listing for all other categories (Excluded when Entertainment / Movies is active to prevent duplication) */}
          {!isCustomBooking && !isEntertainmentCategory && (
            <div className="space-y-6">
              <div id="hotel-results-anchor" className="scroll-mt-6">
                {loading ? (
                  <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5' : 'grid-cols-1 gap-4'}`}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`skel-${i}`} className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-3 shadow-xs animate-pulse">
                        <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-3" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/2 mb-4" />
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="col-span-full py-20 px-6 rounded-3xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="h-16 w-16 bg-[#033266]/10 border border-[#033266]/20 rounded-2xl flex items-center justify-center mb-4 text-[#033266] shadow-inner">
                      <Search size={30} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No {categoryName} found</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      There are no services available matching your criteria in {city} right now. Please explore other categories or adjust your filters.
                    </p>
                  </div>
                ) : (
                  <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5' : 'grid-cols-1 gap-4'}`}>
                    {Object.values(filteredServices.reduce((acc: any, service: any) => {
                      const mObj = service.merchantObj || (typeof service.merchant === 'string' ? { id: service.merchant, name: service.merchant } : service.merchant) || { name: 'BokSpot Merchant', id: 'unknown' };
                      const branchName = service.branchName || service.metadata?.branchName || service.metadata?.facilityName;
                      const branchAddress = service.address || service.metadata?.address || mObj.address;
                      const mId = mObj.id && mObj.id !== 'unknown' ? mObj.id : (mObj.name || service.name || 'unknown');
                      let groupKey = branchName ? `${mId}_${branchName.toLowerCase().replace(/\s+/g, '_')}` : (mObj.name ? mObj.name.toLowerCase().trim() : mId);
                      if ((mObj.name || '').toLowerCase().includes('bokspot verified')) return acc;


                      if (!acc[groupKey]) {
                        acc[groupKey] = {
                          groupKey: groupKey,
                          branchName: branchName || mObj.name,
                          address: branchAddress || mObj.address || service.address || null,
                          merchantObj: {
                            ...mObj,
                            name: branchName || mObj.name
                          },
                          service: service,
                          categories: new Set(),
                          groupImageUrl: null,
                          minPrice: service.basePrice || service.price || null,
                          rating: service.rating || 4.8,
                          reviewCount: service.reviewCount || 24,
                          dist: (latitude !== null && longitude !== null && mObj.latitude && mObj.longitude)
                            ? `${calculateDistance(latitude, longitude, mObj.latitude, mObj.longitude)} km`
                            : '4.5 km',
                        };
                      }
                      if (service.name === '__BOKSPOT_GROUP__') {
                        acc[groupKey].groupImageUrl = service.metadata?.mainImageUrl || service.imageUrl;
                        acc[groupKey].groupName = service.category;
                        acc[groupKey].groupCity = service.city;
                      }
                      if (service.basePrice && (!acc[groupKey].minPrice || service.basePrice < acc[groupKey].minPrice)) {
                        acc[groupKey].minPrice = service.basePrice;
                      }

                      if (service.metadata?.listings && Array.isArray(service.metadata.listings) && service.metadata.listings.length > 0) {
                        if (!acc[groupKey].listings) acc[groupKey].listings = [];
                        service.metadata.listings.forEach((l: any) => {
                          acc[groupKey].listings.push(l);
                          if (l.name) acc[groupKey].categories.add(l.name);
                        });
                        if (!acc[groupKey].primaryUnitName && service.metadata.listings[0]?.name) {
                          acc[groupKey].primaryUnitName = service.metadata.listings[0].name;
                        }
                      }

                      if (mObj.allCategories && Array.isArray(mObj.allCategories)) {
                        mObj.allCategories.forEach((cat: any) => {
                          if (typeof cat === 'string') acc[groupKey].categories.add(cat);
                          else if (cat?.name) acc[groupKey].categories.add(cat.name);
                        });
                      } else if (service.name && service.name !== '__BOKSPOT_GROUP__') {
                        if (typeof service.name === 'string') acc[groupKey].categories.add(service.name);
                        else if ((service.name as any)?.name) acc[groupKey].categories.add((service.name as any).name);
                      }
                      return acc;
                    }, {})).map((group: any, i: number) => {
                      const m = group.merchantObj;
                      const s = group.service;

                      // Detect PG / Hostel stay context
                      const isItemPgOrHostel = isPgCategory || 
                        category === 'hostels' || 
                        (categoryName || '').toLowerCase().includes('hostel') || 
                        (m?.name || '').toLowerCase().includes('hostel') || 
                        (s?.name || '').toLowerCase().includes('dorm') ||
                        Boolean(m?.metadata?.isPgProperty);

                      // Resolve live PG Configs dynamically from localStorage (Business Portal updates) or merchant metadata
                      let livePgConfig: any = null;
                      if (typeof window !== 'undefined') {
                        try {
                          const keys = [
                            `pg_config_${m?.id}`,
                            `pg_config_${m?.username}`,
                            'pg_config_default'
                          ];
                          for (const k of keys) {
                            const val = localStorage.getItem(k);
                            if (val) {
                              livePgConfig = JSON.parse(val);
                              break;
                            }
                          }
                          // Also check vendor-portal-storage-v10 if user edited in business portal
                          if (!livePgConfig) {
                            const busStore = localStorage.getItem('vendor-portal-storage-v10');
                            if (busStore) {
                              const parsed = JSON.parse(busStore);
                              const curM = parsed.state?.currentMerchant;
                              if (curM?.metadata?.pgGenderType) {
                                livePgConfig = curM.metadata;
                              }
                            }
                          }
                        } catch {}
                      }

                      const pgGenderVal = livePgConfig?.pgGenderType || m?.metadata?.pgGenderType || (m?.name?.toLowerCase().includes('ladies') ? 'ladies' : (m?.name?.toLowerCase().includes('gents') ? 'gents' : 'coliving'));
                      const pgFoodVal = livePgConfig?.pgFoodIncluded !== undefined ? livePgConfig.pgFoodIncluded : (m?.metadata?.pgFoodIncluded !== false);
                      const pgCurfewVal = livePgConfig?.pgGateCurfew || m?.metadata?.pgGateCurfew || '24/7 Biometric Entry';

                      const chips = Array.from(group.categories)
                        .map((c: any) => (typeof c === 'string' ? c : (c?.name || '')))
                        .filter(Boolean)
                        .slice(0, 3);

                      // Check whether merchant opted into Secret Mystery deals
                      const checkMysteryOptIn = () => {
                        if (typeof window !== 'undefined') {
                          const mId = m?.id || group.merchantId;
                          if (mId) {
                            const directStore = localStorage.getItem(`hotel_mystery_optin_${mId}`);
                            if (directStore !== null) return directStore === 'true';
                          }
                          const uStore = m?.username ? localStorage.getItem(`hotel_mystery_optin_${m?.username}`) : null;
                          if (uStore !== null) return uStore === 'true';

                          // Check business portal live storage (vendor-portal-storage-v10)
                          try {
                            const busStoreRaw = localStorage.getItem('vendor-portal-storage-v10');
                            if (busStoreRaw) {
                              const busData = JSON.parse(busStoreRaw);
                              const curM = busData.state?.currentMerchant;
                              if (curM) {
                                // Match current active merchant by ID, username, or name
                                const isSameMerchant = (mId && curM.id === mId) ||
                                  (m?.username && curM.username === m.username) ||
                                  ((m?.name || '').toLowerCase() === (curM.merchantName || '').toLowerCase()) ||
                                  ((group.branchName || '').toLowerCase().includes((curM.merchantName || '').toLowerCase()));
                                
                                if (isSameMerchant) {
                                  if (curM.isMysteryModeOptIn !== undefined) return Boolean(curM.isMysteryModeOptIn);
                                  if (curM.metadata?.isMysteryModeOptIn !== undefined) return Boolean(curM.metadata.isMysteryModeOptIn);
                                }
                              }
                            }
                          } catch {}

                          // Check explicit merchant keys before defaults
                          const h101Store = localStorage.getItem('hotel_mystery_optin_H101');
                          if ((m?.username === 'H101' || (m?.name || '').toLowerCase().includes('grand hotel')) && h101Store !== null) {
                            return h101Store === 'true';
                          }
                          const defaultStore = localStorage.getItem('hotel_mystery_optin_default');
                          if (defaultStore !== null) return defaultStore === 'true';
                        }
                        const mMeta = m?.metadata || s?.metadata || {};
                        if (m?.isMysteryModeOptIn !== undefined) return Boolean(m.isMysteryModeOptIn);
                        if (mMeta?.isMysteryModeOptIn !== undefined) return Boolean(mMeta.isMysteryModeOptIn);
                        return true; // Default true so all qualified partners display Secret Mode when Just Luxury is enabled
                      };
                      const isMysteryOptedIn = checkMysteryOptIn();
                      const isCardSecret = Boolean(isLuxuryMode && isMysteryOptedIn);

                      // Check live vendor-portal-storage for costForTwo if dining
                      let diningCostForTwo = 800;
                      if (isDiningCategory) {
                        if (typeof window !== 'undefined') {
                          try {
                            const mId = m?.id || group.merchantId;
                            const uname = m?.username;
                            const directStored = localStorage.getItem(`dining_cost_for_two_${mId}`) ||
                              (uname ? localStorage.getItem(`dining_cost_for_two_${uname}`) : null) ||
                              localStorage.getItem('dining_cost_for_two_grand-temple-dine') ||
                              localStorage.getItem('dining_cost_for_two_default');
                            
                            const busStoreRaw = localStorage.getItem('vendor-portal-storage-v10');
                            const busData = busStoreRaw ? JSON.parse(busStoreRaw) : null;
                            const curM = busData?.state?.currentMerchant;

                            if (directStored) {
                              diningCostForTwo = Number(directStored);
                            } else if (curM?.metadata?.costForTwo) {
                              diningCostForTwo = Number(curM.metadata.costForTwo);
                            } else if (curM?.costForTwo) {
                              diningCostForTwo = Number(curM.costForTwo);
                            } else if (m?.metadata?.costForTwo) {
                              diningCostForTwo = Number(m.metadata.costForTwo);
                            } else if (s?.metadata?.costForTwo) {
                              diningCostForTwo = Number(s.metadata.costForTwo);
                            }
                          } catch {}
                        }
                      }
                      return (
                        <motion.div
                          key={group.groupKey || `${m.id || 'm'}-${group.branchName || i}-${i}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.05, 0.4) }}
                          className="h-full"
                        >
                          <Link
                            href={isHotelCategory
                              ? `/${bookingType}/${category}/${m.id || m.slug || 'merchant'}?checkIn=${checkInDate}&checkOut=${checkOutDate}&adults=${adults}&children=${children}&childAges=${encodeURIComponent(JSON.stringify(childAges))}&rooms=${rooms}&pets=${pets}&petCount=${petCount}${isCardSecret ? '&isLuxury=true' : ''}`
                              : isDiningCategory
                              ? `/${bookingType}/${category}/${m.id || m.slug || 'merchant'}?date=${encodeURIComponent(sportsSlotDate || todayStr)}&session=${encodeURIComponent(diningMealSession)}&guests=${diningGuestsCount}&zone=${encodeURIComponent(diningSeatingZone)}`
                              : `/${bookingType}/${category}/${m.id || m.slug || 'merchant'}?date=${encodeURIComponent(sportsSlotDate || queryDate || new Date().toISOString().split('T')[0])}&city=${encodeURIComponent(queryCity || city || '')}&venue=${encodeURIComponent(queryVenue || m.name || '')}`
                            }
                            className="block h-full"
                          >
                            <div className={`group relative flex flex-col h-full bg-[color:var(--color-surface)] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${isCardSecret
                                ? 'border-amber-400/50 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/15'
                                : 'border-[color:var(--color-outline-variant)]/30 hover:border-[#ff6325]/50 hover:shadow-xl hover:shadow-[#ff6325]/10'
                              } ${viewMode === 'list' ? 'sm:flex-row' : ''}`}>
                              {/* Compact Image Header with Hover Zoom */}
                              <div className={`relative overflow-hidden bg-[color:var(--color-surface-dim)] shrink-0 ${viewMode === 'list' ? 'sm:w-64 h-44 sm:h-auto' : 'h-40 sm:h-44 w-full'}`}>
                                <img
                                  src={
                                    group.listings?.[0]?.imageUrl ||
                                    group.listings?.[0]?.metadata?.gallery?.[0] ||
                                    group.listings?.[0]?.images?.[0] ||
                                    s?.metadata?.listings?.[0]?.imageUrl ||
                                    s?.metadata?.listings?.[0]?.metadata?.gallery?.[0] ||
                                    s?.metadata?.mainImageUrl ||
                                    s?.images?.[0] ||
                                    s?.imageUrl ||
                                    group.groupImageUrl ||
                                    (category.includes('turf') || category.includes('football') || category.includes('cricket') || category.includes('badminton') || category.includes('court')
                                      ? 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80'
                                      : (m.images?.[0] || `https://images.unsplash.com/photo-1540039155732-68bebc6894b9?w=800&q=80`))
                                  }
                                  alt={s?.metadata?.facilityName || s?.metadata?.branchName || m.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                  onError={(e) => {
                                    e.currentTarget.src = (category.includes('turf') || category.includes('football'))
                                      ? 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80'
                                      : 'https://images.unsplash.com/photo-1540039155732-68bebc6894b9?w=800&q=80';
                                  }}
                                />

                                {/* Subtle Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                                {/* Verified Pill / Rating Badge */}
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[80%]">
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold shadow-sm">
                                    <Star size={11} className={isCardSecret ? 'text-amber-400 fill-amber-400' : 'text-[#ff6325] fill-[#ff6325]'} />
                                    <span>{group.rating || '4.8'}</span>
                                    <span className="text-white/60 text-[9px]">({group.reviewCount || '20+'})</span>
                                  </div>

                                  {/* PG / Hostel Gender Exclusivity & Food Badges Directly on the Card Header */}
                                  {isItemPgOrHostel && (
                                    <div className="flex items-center gap-1">
                                      <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${
                                        pgGenderVal === 'ladies' ? 'bg-pink-600/95 ring-1 ring-white/20' : pgGenderVal === 'gents' ? 'bg-blue-600/95 ring-1 ring-white/20' : 'bg-purple-600/95 ring-1 ring-white/20'
                                      }`}>
                                        {pgGenderVal === 'ladies' ? '🚺 Ladies PG' : pgGenderVal === 'gents' ? '🚹 Gents PG' : '👥 Coliving'}
                                      </span>
                                      {pgFoodVal && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-600/95 text-white text-[9px] font-bold backdrop-blur-md shadow-sm hidden sm:inline-block">
                                          🍲 3 Meals
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {isCardSecret && (
                                  <div className="absolute top-2.5 left-24 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                                    <Sparkles size={9} /> BokSpot Luxe
                                  </div>
                                )}

                                <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 hover:text-[#ff6325] hover:scale-110 transition-all shadow-sm">
                                  <Heart size={13} />
                                </div>

                                {/* Bottom of Image: Price tag preview if available */}
                                {group.minPrice && (
                                  <div className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-white font-extrabold text-[11px] shadow-md ${isCardSecret
                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950'
                                      : 'bg-gradient-to-r from-[#ff6325] to-[#e04e13]'
                                    }`}>
                                    {isDiningCategory ? `₹${diningCostForTwo} for 2` : `From ₹${group.minPrice}`}
                                  </div>
                                )}
                              </div>

                              {/* Info Body - Compact & Clean */}
                              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
                                <div>
                                  <div className="flex items-start justify-between gap-1.5 mb-1">
                                    <h3 className={`font-bold text-sm sm:text-base line-clamp-1 tracking-tight transition-colors ${isCardSecret
                                        ? 'text-amber-500 dark:text-amber-300 font-extrabold'
                                        : 'text-[color:var(--color-on-surface)] group-hover:text-[#ff6325]'
                                      }`}>
                                      {isCardSecret
                                        ? (() => {
                                            const rawPrimary = group.listings?.[0]?.name || Array.from(group.categories)[0] || '';
                                            const primaryUnit = typeof rawPrimary === 'string' ? rawPrimary : (rawPrimary?.name || '');
                                            const raw = `${typeof group.branchName === 'string' ? group.branchName : ''} ${typeof s?.name === 'string' ? s.name : ''} ${primaryUnit} ${category}`.toLowerCase();
                                            
                                            let archetype = '5-Star Luxury Stay';
                                            if (raw.includes('turf') || category.includes('turf') || raw.includes('arena') || raw.includes('court') || isSportsCategory) {
                                              archetype = 'Secret Pro FIFA Arena';
                                            } else if (raw.includes('villa') || category.includes('villa')) {
                                              archetype = 'Secret Luxury Villa';
                                            } else if (raw.includes('resort') || category.includes('resort')) {
                                              archetype = 'Secret Luxury Resort';
                                            } else if (raw.includes('palace') || raw.includes('heritage')) {
                                              archetype = 'Secret Heritage Palace';
                                            } else if (raw.includes('beach') || raw.includes('ocean')) {
                                              archetype = 'Secret Coastal Haven';
                                            } else if (raw.includes('city') || raw.includes('executive')) {
                                              archetype = 'Secret Executive Sanctuary';
                                            } else if (raw.includes('deluxe') || raw.includes('premier')) {
                                              archetype = 'Secret Premier Residence';
                                            }

                                            if (primaryUnit) {
                                              return `${archetype} • ${primaryUnit.replace(/\b(Standard|Non-AC|AC|Room)\b/gi, '').trim() || primaryUnit}`;
                                            }
                                            return archetype;
                                          })()
                                        : (() => {
                                            const finalName = group.branchName || s?.branchName || s?.metadata?.branchName || s?.name || m?.name || 'BokSpot Stay';
                                            return typeof finalName === 'string' ? finalName : (finalName?.name || 'BokSpot Stay');
                                          })()}
                                    </h3>
                                  </div>

                                  <div className="flex items-center text-[11px] font-medium text-[color:var(--color-on-surface-variant)] mb-2">
                                    <MapPin size={12} className={isCardSecret ? 'text-amber-500 mr-1 shrink-0' : 'text-[#ff6325]/80 mr-1 shrink-0'} />
                                    <span className="truncate max-w-[200px]">
                                      {isCardSecret
                                        ? `${city || 'Prime District'} • Full address revealed on booking`
                                        : (group.address || group.groupCity || m?.address || city || 'Chennai')}
                                    </span>
                                    {group.dist && (
                                      <>
                                        <span className="mx-1.5 text-[color:var(--color-outline-variant)]">•</span>
                                        <span className="shrink-0 font-semibold text-[color:var(--color-on-surface)]/80">{group.dist}</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Dining Cuisines Tag Bar */}
                                  {isDiningCategory && (
                                    <div className="flex flex-wrap items-center gap-1 mb-2">
                                      {(() => {
                                        let cuisineList = m?.metadata?.cuisines || s?.metadata?.cuisines || ['South Indian Heritage', 'Chettinad Gourmet', 'North Indian', 'Tandoor & Grills'];
                                        if (typeof window !== 'undefined') {
                                          try {
                                            const directCfg = localStorage.getItem('dining_config_grand-temple-dine') || localStorage.getItem('dining_config_default');
                                            if (directCfg) {
                                              const parsed = JSON.parse(directCfg);
                                              if (parsed.cuisines && Array.isArray(parsed.cuisines) && parsed.cuisines.length > 0) {
                                                cuisineList = parsed.cuisines;
                                              }
                                            }
                                          } catch {}
                                        }
                                        return cuisineList.slice(0, 3).map((c: string, idx: number) => (
                                          <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-orange-500/10 text-[#ff6325] border border-[#ff6325]/20">
                                            {c}
                                          </span>
                                        ));
                                      })()}
                                    </div>
                                  )}
                                  {isItemPgOrHostel && (
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs ${
                                        pgGenderVal === 'ladies' ? 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-400/30' :
                                        pgGenderVal === 'gents' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/30' :
                                        'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/30'
                                      }`}>
                                        {pgGenderVal === 'ladies' ? '🚺 Ladies PG' : pgGenderVal === 'gents' ? '🚹 Gents Only PG' : '👥 Coliving Stay'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-400/30 flex items-center gap-1">
                                        <span>🍲</span> {pgFoodVal ? '3 Meals Included' : 'Self-Cooking'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hidden sm:inline-flex items-center gap-1">
                                        <span>🔒</span> {pgCurfewVal}
                                      </span>
                                      {pgGenderVal === 'ladies' && (livePgConfig?.hasLadyWarden !== false && m?.metadata?.hasLadyWarden !== false) && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ff6325]/10 text-[#ff6325] border border-[#ff6325]/30 flex items-center gap-1">
                                          <span>👩‍💼</span> Lady Warden
                                        </span>
                                      )}
                                      {pgGenderVal === 'ladies' && (livePgConfig?.hasPackedLunchBox || m?.metadata?.hasPackedLunchBox) && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ff6325]/10 text-[#ff6325] border border-[#ff6325]/30 hidden sm:inline-flex items-center gap-1">
                                          <span>🍱</span> Lunch Box
                                        </span>
                                      )}
                                      {(pgGenderVal === 'coliving' || pgGenderVal === 'unisex') && (livePgConfig?.hasCoworkingLounge !== false && m?.metadata?.hasCoworkingLounge !== false) && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                                          <span>💻</span> Coworking
                                        </span>
                                      )}
                                      {(pgGenderVal === 'coliving' || pgGenderVal === 'unisex') && (livePgConfig?.hasFullPowerBackup !== false && m?.metadata?.hasFullPowerBackup !== false) && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-400/30 hidden sm:inline-flex items-center gap-1">
                                          <span>⚡</span> 100% Backup
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Tags / Service Offerings */}
                                {chips.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[color:var(--color-outline-variant)]/15 mt-1">
                                    {chips.map((chip: any, idx: number) => {
                                      const isCurrentCat = chip === categoryName;
                                      return (
                                        <span
                                          key={idx}
                                          className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide transition-all ${isCurrentCat
                                            ? 'bg-gradient-to-r from-[#ff6325] to-[#e04e13] text-white shadow-xs font-extrabold'
                                            : 'bg-[color:var(--color-surface-dim)]/80 border border-[color:var(--color-outline-variant)]/30 text-[color:var(--color-on-surface)]/90 hover:border-[#ff6325]/40'
                                            }`}
                                        >
                                          {typeof chip === 'string' ? chip : (chip?.name || '')}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Action Footer for Hotels & PGs - Compact */}
                                {isHotelCategory && (
                                  <div className="mt-2.5 pt-2.5 border-t border-[color:var(--color-outline-variant)]/15 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider block leading-tight">
                                        {isItemPgOrHostel ? 'Monthly Rent' : 'Starting from'}
                                      </span>
                                      <span className="text-sm sm:text-base font-black text-[#ff6325]">₹{group.minPrice || (isItemPgOrHostel ? '6,500' : '2,499')}</span>
                                      <span className="text-[9px] text-[color:var(--color-on-surface-variant)] font-medium">
                                        {isItemPgOrHostel ? ' / month' : ' / night'}
                                      </span>
                                      {isItemPgOrHostel && pgFoodVal && (
                                        <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                                          ✓ 3 Meals Included
                                        </span>
                                      )}
                                    </div>
                                    <span className="px-2.5 py-1.5 rounded-lg bg-[#0a3161] dark:bg-[#ff6325] text-white text-[11px] font-bold group-hover:brightness-110 flex items-center gap-1 shadow-xs transition-all">
                                      <span>{isItemPgOrHostel ? 'View Beds' : 'View Rooms'}</span>
                                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </div>
                                )}

                                {/* Action Footer for Salon, Spa & Studio Appointments */}
                                {isSalonCategory && !isDiningCategory && (
                                  <div className="mt-2.5 pt-2.5 border-t border-[color:var(--color-outline-variant)]/15 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider block leading-tight">
                                        Starting from
                                      </span>
                                      <span className="text-sm sm:text-base font-black text-[#ff6325]">₹{group.minPrice || '499'}</span>
                                      <span className="text-[9px] text-[color:var(--color-on-surface-variant)] font-medium">
                                        {' '}• Certified Specialists
                                      </span>
                                      <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                                        ✓ Instant Appointment Confirmation
                                      </span>
                                    </div>
                                    <span className="px-2.5 py-1.5 rounded-lg bg-[#ff6325] text-white text-[11px] font-black group-hover:brightness-110 flex items-center gap-1 shadow-sm transition-all uppercase tracking-wider">
                                      <span>Book Appointment</span>
                                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </div>
                                )}

                                {/* Action Footer for Dining & Restaurant Table Reservation */}
                                {isDiningCategory && (
                                  <div className="mt-2.5 pt-2.5 border-t border-[color:var(--color-outline-variant)]/15 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider block leading-tight">
                                        Average Cost
                                      </span>
                                      <span className="text-sm sm:text-base font-black text-[#ff6325]">₹{diningCostForTwo}</span>
                                      <span className="text-[9px] text-[color:var(--color-on-surface-variant)] font-medium">
                                        {' '}for two
                                      </span>
                                      <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                                        ✓ Free Instant Reservation
                                      </span>
                                    </div>
                                    <span className="px-2.5 py-1.5 rounded-lg bg-[#ff6325] text-white text-[11px] font-black group-hover:brightness-110 flex items-center gap-1 shadow-sm transition-all uppercase tracking-wider">
                                      <span>Reserve Table</span>
                                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
       * BOOKMYSHOW STYLE THEATRE & MULTIPLEX SELECTION MODAL
       * Triggered when user clicks any Movie poster or Book Tickets button
       * ========================================================================= */}
      <AnimatePresence>
        {showTheatreModal && selectedMovieForTheatres && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTheatreModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header: Movie Overview */}
              <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 border-b border-white/10 shrink-0">
                {/* Background Movie Art Accent */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
                  style={{ backgroundImage: `url("${selectedMovieForTheatres.bannerUrl}"), url("${selectedMovieForTheatres.posterUrl}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedMovieForTheatres.posterUrl}
                      alt={selectedMovieForTheatres.title}
                      className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl object-cover border border-white/20 shadow-lg shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[10px] uppercase">
                          {selectedMovieForTheatres.certificate}
                        </span>
                        <span className="text-amber-400 font-extrabold text-xs">
                          ★ {selectedMovieForTheatres.rating}/10
                        </span>
                        <span className="text-white/60 text-xs">
                          {selectedMovieForTheatres.runtime}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                        {selectedMovieForTheatres.title}
                      </h2>
                      <p className="text-xs text-slate-300">
                        {selectedMovieForTheatres.languages.join(', ')} • {selectedMovieForTheatres.genres.join(', ')}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        {selectedMovieForTheatres.formats.map((fmt, fIdx) => (
                          <span key={fIdx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15 text-white/90">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setShowTheatreModal(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Date Filter Strip */}
                <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-xs font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                    <Calendar size={13} /> Select Date:
                  </span>
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const isoDate = d.toISOString().split('T')[0];
                    const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateNum = d.getDate();
                    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                    const isSelected = theatreFilterDate === isoDate;
                    return (
                      <button
                        key={isoDate}
                        type="button"
                        onClick={() => setTheatreFilterDate(isoDate)}
                        className={`px-3 py-1.5 rounded-xl text-center shrink-0 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#ff6325] text-white shadow-md shadow-[#ff6325]/30 ring-2 ring-[#ff6325]/40'
                            : 'bg-white/10 hover:bg-white/15 text-slate-200'
                        }`}
                      >
                        <span className="block text-[10px] uppercase font-bold opacity-80">{dayName}</span>
                        <span className="block text-xs font-black">{dateNum} {monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Body: Theatres List with Showtimes */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-[#ff6325]" />
                    <span>Theatres playing in {city || 'Chennai'}</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    M-Ticket & Contactless QR available
                  </span>
                </div>

                {/* Multiplex Branches */}
                {(() => {
                  const entConfig = getEntertainmentCategoryConfig('movies');
                  const branches = entConfig?.branches || [
                    {
                      id: 'branch-cinemax-omr',
                      name: 'CineMax Multiplex — OMR Marina Mall',
                      city: 'Chennai',
                      address: 'Marina Mall, 4th Floor, Egatoor, OMR, Chennai',
                      offeringsSummary: 'IMAX Laser 3D, Dolby Atmos Screen 2 & 3, VIP Recliner Lounge'
                    },
                    {
                      id: 'branch-cinemax-vadapalani',
                      name: 'CineMax Multiplex — Nexus Forum Vadapalani',
                      city: 'Chennai',
                      address: 'Nexus Forum Mall, 3rd Floor, Vadapalani, Chennai',
                      offeringsSummary: '4DX Motion Cinema, Dolby Atmos 7.1, 8 Screens Multiplex'
                    }
                  ];

                  return (
                    <div className="space-y-4">
                      {branches.map((branch, bIdx) => (
                        <div
                          key={branch.id || bIdx}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 hover:border-[#ff6325]/40 transition-colors"
                        >
                          {/* Theatre Details */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                  {branch.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                  ✓ Verified Partner
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {branch.address}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                                <span className="text-[#ff6325]">★</span>
                                <span>{branch.offeringsSummary}</span>
                              </p>
                            </div>

                            <Link
                              href={`/${bookingType}/${category}/635bce5c-6d3a-56b4-b7ed-9320ea055dae?movie=${selectedMovieForTheatres.slug}&branch=${branch.id}&date=${theatreFilterDate}`}
                              onClick={() => setShowTheatreModal(false)}
                              className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-[#ff6325] hover:text-white text-slate-800 dark:text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              View All Shows →
                            </Link>
                          </div>

                          {/* Showtimes Pill Row */}
                          <div className="pt-3.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                              Available Timings & Screens:
                            </span>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              {(entConfig?.showtimes || [
                                { time: '10:30 AM', screen: 'Audi 1 (IMAX Laser)', status: 'Fast Filling', fillingFast: true },
                                { time: '02:15 PM', screen: 'Audi 1 (IMAX Laser)', status: 'Available' },
                                { time: '06:45 PM', screen: 'Audi 2 (Dolby Atmos)', status: 'Fast Filling', fillingFast: true },
                                { time: '10:00 PM', screen: 'Audi 2 (Dolby Atmos)', status: 'Available' }
                              ]).map((st, sIdx) => (
                                <Link
                                  key={sIdx}
                                  href={`/${bookingType}/${category}/635bce5c-6d3a-56b4-b7ed-9320ea055dae?movie=${selectedMovieForTheatres.slug}&branch=${branch.id}&date=${theatreFilterDate}&time=${encodeURIComponent(st.time)}`}
                                  onClick={() => setShowTheatreModal(false)}
                                  className="group/pill p-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 hover:border-[#ff6325] hover:bg-[#ff6325]/5 transition-all text-center min-w-[110px] cursor-pointer shadow-xs active:scale-95"
                                >
                                  <span className="block text-xs font-black text-slate-900 dark:text-white group-hover/pill:text-[#ff6325] transition-colors">
                                    {st.time}
                                  </span>
                                  <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[120px] mt-0.5">
                                    {st.screen}
                                  </span>
                                  {st.fillingFast && (
                                    <span className="inline-block mt-1 text-[8px] font-black uppercase px-1.5 py-0.2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
                                      Filling Fast
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
