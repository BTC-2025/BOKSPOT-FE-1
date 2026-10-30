'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import { useLocationStore, useBookingFlowStore, useUserStore } from '../../../lib/store';
import { api, Service } from '../../../lib/api';
import { calculateDistance } from '../../../lib/mockData';

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
  'gym-yoga': 'Gym / Yoga Slot Booking',
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
function CabBookingView({ categoryName, city }: any) {
  const router = useRouter();
  const [pickup, setPickup] = useState('Anna Nagar Metro Station');
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
function FlightBookingView({ categoryName, city }: any) {
  const [tripType, setTripType] = useState<'one-way' | 'round'>('one-way');
  const [fromAirport, setFromAirport] = useState('MAA - Chennai');
  const [toAirport, setToAirport] = useState('BLR - Bangalore');
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
function TrainBookingView({ categoryName, city }: any) {
  const [fromStation, setFromStation] = useState('Chennai Central (MAS)');
  const [toStation, setToStation] = useState('KSR Bengaluru (SBC)');
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
function BusBookingView({ categoryName, city }: any) {
  const [fromCity, setFromCity] = useState('Chennai');
  const [toCity, setToCity] = useState('Madurai');
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
  const bookingType = (params?.bookingType as string) || 'stay-accommodation';
  const rawCategory = params?.category as string;
  const effectiveCategory = rawCategory === 'stayhotel' || rawCategory === 'stay-hotel' || rawCategory === 'hotel' ? 'hotels' : (rawCategory === 'resort' ? 'resorts' : (rawCategory === 'villa' ? 'villas' : rawCategory));
  const category = effectiveCategory;
  const { city, latitude, longitude } = useLocationStore();
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const isHotelCategory = category === 'hotels' || category === 'resorts' || category === 'villas' || category === 'hostels' || category === 'camping' || bookingType === 'stay-accommodation' || bookingType === 'home';
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
      }
    };
    document.addEventListener('mousedown', handleGlobalClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClickOutside);
    };
  }, []);

  // Faceted Filters State (Sidebar / Bar)
  const [priceRange, setPriceRange] = useState<number>(50000); // Max price ceiling
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [freeCancellationOnly, setFreeCancellationOnly] = useState<boolean>(false);
  const [petFriendlyOnly, setPetFriendlyOnly] = useState<boolean>(false);


  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  let categoryName = CATEGORY_NAMES[category] || category;
  if (bookingType === 'accomodation' && category === 'camping') {
    categoryName = 'Camps & Glamping';
  }
  if (bookingType === 'entertainment' && category === 'sports-events') {
    categoryName = 'Sports';
  }

  useEffect(() => {
    if (!mounted) return;
    let active = true;
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          categorySlug: category,
        };
        if (city) {
          params.city = city;
        }
        if (latitude !== null && longitude !== null) {
          params.latitude = String(latitude);
          params.longitude = String(longitude);
        }
        let response = await api.services.list(params);
        let list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

        // Format real merchant services if returned from backend
        if (category === 'hotels' || category === 'hotel-booking' || category.includes('hotel') || category.includes('room')) {
          list = list.filter((item: any) => {
            const mName = (item.merchant?.name || item.merchantName || '').toLowerCase();
            const sName = (item.name || '').toLowerCase();
            if (mName.includes('bokspot verified') || sName.includes('bokspot verified')) return false;
            if (item.id === '11111111-1111-4111-a111-111111111111') return false;
            if (mName.includes('grand hotel') && sName.includes('standard king')) return false;
            return true;
          }).map((item: any) => ({
            ...item,
            merchant: item.merchant || { name: item.merchantName || 'Grand Hotel', id: item.merchantId || item.id },
            basePrice: item.basePrice || item.price || '2500'
          }));
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
  }, [category, city, latitude, longitude, mounted]);

  if (!mounted) {
    return <BokspotLoader message="Initializing terminal..." />;
  }

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
        sName.includes('turf') || sName.includes('court') || mName.includes('turf');
      if (isTurfOrSports) return false;
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
      const rawText = `${s.name} ${s.description || ''} ${JSON.stringify(s.metadata || {})} ${JSON.stringify(s.merchant?.metadata || {})}`.toLowerCase();
      if (rawText.includes('no pets') || rawText.includes('pets not allowed') || rawText.includes('strictly no pets')) {
        return false;
      }
      // If user explicitly activated pet friendly filter, verify positive pet allowance
      if (petFriendlyOnly) {
        const isPetFriendly = rawText.includes('pet friendly') ||
          rawText.includes('pets allowed') ||
          rawText.includes('pet-friendly') ||
          rawText.includes('pets welcome') ||
          rawText.includes('dog friendly');
        if (!isPetFriendly) return false;
      }
    }

    // Unified Intelligent Search Query
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
    const matchName = s.name?.toLowerCase().includes(query);
    const matchMerchant = s.merchant?.name?.toLowerCase().includes(query);
    const matchCity = s.city?.toLowerCase().includes(query) || s.merchant?.city?.toLowerCase().includes(query);
    const matchAddress = s.merchant?.address?.toLowerCase().includes(query);
    const matchDesc = s.description && s.description.toLowerCase().includes(query);

    // Check metadata / amenities / features
    const metadataStr = JSON.stringify(s.metadata || {}).toLowerCase();
    const matchMeta = metadataStr.includes(query);

    return matchName || matchMerchant || matchCity || matchAddress || matchDesc || matchMeta;
  });

  if (loading && !isCustomBooking) {
    return <BokspotLoader message={`Scanning for ${categoryName}...`} />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 relative overflow-hidden pt-[98px] lg:pt-[104px]">
      {/* Ambient Luxury Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#ff6325]/10 via-[#0a3161]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-[#ff6325]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Inline Breadcrumb (Only for non-stay categories) */}
      {!isHotelCategory && (
        <div className="container-main flex items-center justify-between pt-2 pb-1.5">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/${bookingType}`}
              className="p-2.5 shrink-0 rounded-xl bg-[var(--color-surface)]/70 backdrop-blur-md border border-[var(--color-outline-variant)]/40 hover:border-[#ff6325]/60 hover:bg-[#ff6325]/10 text-[var(--text-primary)] transition-all shadow-sm group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] min-w-0">
              <Link href="/" className="hover:text-[#ff6325] transition-colors shrink-0">Home</Link>
              <ChevronRight size={13} className="shrink-0 opacity-40" />
              <Link href={`/${bookingType}`} className="hover:text-[#ff6325] transition-colors truncate shrink-0 capitalize">{bookingType}</Link>
              <ChevronRight size={13} className="shrink-0 opacity-40" />
              <span className="text-[var(--text-primary)] font-bold truncate bg-[#ff6325]/10 text-[#ff6325] px-2.5 py-0.5 rounded-md border border-[#ff6325]/20">{categoryName}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── FULL-WIDTH LUXURY STAY HERO BANNER ── */}
      {isHotelCategory ? (
        <div className="relative w-full shadow-2xl border-b border-slate-200/60 dark:border-white/10 pb-8 sm:pb-10">
          {/* Panoramic Luxury Sunset Villa Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80&auto=format&fit=crop"
              alt="Luxury Resort Banner"
              className="w-full h-full object-cover object-right sm:object-center"
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
                <span>{categoryName.toUpperCase()} • {city || 'AHMEDNAGAR'}</span>
              </div>
            </div>

            {/* Clean Hero Title Row - Compact, Balanced & Centered */}
            <div className="text-center pt-1 pb-2 space-y-1.5">
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-300 drop-shadow">
                PREMIUM STAYS &nbsp;•&nbsp; BETTER EXPERIENCES
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                Find Your Perfect Stay in <span className="text-[#ff6325]">{city || 'Bangalore'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-200/90 font-medium max-w-3xl mx-auto drop-shadow truncate">
                {(() => {
                  const catLabel = categoryName ? categoryName.toLowerCase() : 'stays';
                  return `Discover handpicked ${catLabel} & verified stays in ${city || 'your destination'} for your next getaway`;
                })()}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── MODERN UNIFIED PILL SEARCH DOCK (Matching Reference Design) ── */}
      {isHotelCategory && (
        <div ref={searchDockRef} className="w-full flex justify-center -translate-y-1/2 relative z-30 -mb-6 sm:-mb-8 px-4">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-full p-2 sm:p-2.5 shadow-2xl shadow-slate-900/25 border border-slate-200/90 dark:border-white/10 hover:shadow-orange-500/10 transition-all">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

              {/* 1. Destination / Where */}
              <div className="flex-[1.2] relative px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="text-slate-600 dark:text-slate-300 group-hover:text-[#ff6325] transition-colors shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">WHERE</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onFocus={() => setShowAutocomplete(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowAutocomplete(true);
                      }}
                      placeholder={`Search city, villa, hotel or resort...`}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 placeholder:font-medium outline-none truncate"
                    />
                  </div>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
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
                        const allSuggestions: Array<{ label: string; type: string; icon: string; city?: string }> = [
                          { label: city || 'Bangalore', type: 'City', icon: '📍', city: city || 'Bangalore' },
                          { label: `${city || 'Bangalore'} Central`, type: 'City Hub', icon: '🏙️', city: city || 'Bangalore' },
                          { label: `${city || 'Bangalore'} North / Airport Road`, type: 'Transit Hub', icon: '🛫', city: city || 'Bangalore' },
                          { label: 'Scenic Outskirts & Luxury Villas', type: 'Villas', icon: '🏡', city: city || 'Bangalore' },
                          { label: 'Hilltop Resort & Spa', type: 'Resorts', icon: '🌄', city: city || 'Bangalore' },
                          ...servicesList.map((s: any) => ({
                            label: s.name,
                            type: s.category?.name || 'Verified Stay',
                            icon: '🏨',
                            city: s.city || s.merchant?.city || city
                          }))
                        ];

                        const q = searchQuery.toLowerCase().trim();
                        const filteredSuggestions = q
                          ? allSuggestions.filter(item =>
                              item.label.toLowerCase().includes(q) ||
                              item.type.toLowerCase().includes(q) ||
                              (item.city && item.city.toLowerCase().includes(q))
                            ).slice(0, 8)
                          : allSuggestions.slice(0, 6);

                        if (filteredSuggestions.length === 0) {
                          return (
                            <div className="px-3 py-4 text-center text-xs text-slate-400">
                              No matching stays or cities found for "{searchQuery}". Press Search to explore all options.
                            </div>
                          );
                        }

                        return filteredSuggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
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
                  <Calendar size={15} className="text-[#ff6325] shrink-0" />
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
                                className={`h-9 w-9 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                  isSelected
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
                  <Calendar size={15} className="text-[#ff6325] shrink-0" />
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
                                className={`h-9 w-9 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                  isSelected
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
                    const el = document.getElementById('hotel-results-anchor');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#ff6325] hover:bg-[#e0531b] active:scale-95 text-white flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg shadow-[#ff6325]/35 hover:shadow-[#ff6325]/50 transition-all cursor-pointer group"
                >
                  <Search size={17} className="group-hover:scale-110 transition-transform" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`container-main max-w-7xl mx-auto ${isHotelCategory ? 'pt-0 pb-6' : 'py-4'}`}>
        {/* Sleek Airbnb-Style Luxury Filter & Sort Capsule Toolbar */}
        {isHotelCategory && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
            {/* Left: Interactive Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Price Range Pill */}
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                    priceRange < 50000
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

              {/* Rating Pill */}
              <div className="relative">
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none ${
                    minRating > 0
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

              {/* Free Cancellation Pill */}
              <button
                type="button"
                onClick={() => setFreeCancellationOnly(!freeCancellationOnly)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                  freeCancellationOnly
                    ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>Free Cancellation</span>
              </button>

              {/* Pet Friendly Pill */}
              <button
                type="button"
                onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                  petFriendlyOnly || pets
                    ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-sm shadow-[#ff6325]/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>🐾 Pet Friendly</span>
              </button>

              {/* Reset Filters (Only appears when any filter is active) */}
              {(priceRange < 50000 || minRating > 0 || freeCancellationOnly || petFriendlyOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange(50000);
                    setMinRating(0);
                    setFreeCancellationOnly(false);
                    setPetFriendlyOnly(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-400 hover:text-[#ff6325] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Right: Clean Sort Pill */}
            <div className="flex items-center gap-2 ml-auto">
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
            </div>
          </div>
        )}
        {!isHotelCategory && (
          /* Luxury Hero Header for Other Categories */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#ff6325] uppercase tracking-wider mb-2.5 px-3 py-1 rounded-full bg-[#ff6325]/10 border border-[#ff6325]/20 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6325] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6325]"></span>
              </span>
              <MapPin size={12} className="text-[#ff6325]" />
              <span>Search Hub: {city} Terminal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[color:var(--color-on-surface)] flex items-center gap-3">
              {categoryName}
              <Sparkles size={24} className="text-[#ff6325]/80 hidden sm:inline-block animate-pulse" />
            </h1>
            <p className="text-sm text-[color:var(--color-on-surface-variant)] mt-2 max-w-xl font-normal leading-relaxed">
              Curated top-rated choices and verified dispatcher portal in {city}.
            </p>
          </motion.div>
        )}

        <div className="mt-4">
          {category === 'cabs' && <CabBookingView categoryName={categoryName} city={city} />}
          {category === 'flights' && <FlightBookingView categoryName={categoryName} city={city} />}
          {category === 'trains' && <TrainBookingView categoryName={categoryName} city={city} />}
          {category === 'buses' && <BusBookingView categoryName={categoryName} city={city} />}
          {category === 'metro' && <MetroBookingView categoryName={categoryName} city={city} />}
          {/* {['turfs', 'football-turf', 'cricket-ground'].includes(category) && <TurfsBookingView categoryName={categoryName} city={city} />} */}

          {/* Standard fallback listing for all other categories */}
          {!isCustomBooking && (
            <div className="space-y-6">
              {/* ── UNIFIED ALL-IN-ONE SEARCH BAR & FILTER DOCK (For Non-Stay Categories) ── */}
              {!isHotelCategory && (
                <div className="rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 backdrop-blur-xl p-3 shadow-xl space-y-3">
                  {/* ── STANDARD SINGLE SEARCH INPUT ROW (Other Categories) ── */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                    <div className="relative flex-1 w-full flex items-center rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface)] px-3.5 py-2.5 focus-within:border-[#0a3161] dark:focus-within:border-[#ff6325] focus-within:ring-2 focus-within:ring-[#0a3161]/15 dark:focus-within:ring-[#ff6325]/15 transition-all shadow-xs">
                      <Search size={16} className="text-[#0a3161] dark:text-[#ff6325] mr-2.5 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${categoryName} by name, area, or service...`}
                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-[color:var(--color-outline)] hover:text-[color:var(--color-on-surface)] text-xs p-1 cursor-pointer"
                          title="Clear search"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                      {/* Sort Selector */}
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30">
                        <SlidersHorizontal size={13} className="text-[#0a3161] dark:text-[#ff6325] shrink-0" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-transparent text-xs font-bold text-[color:var(--color-on-surface)] outline-none cursor-pointer"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[color:var(--color-surface)] text-[color:var(--color-on-surface)] font-medium">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Toggle for Grid / List */}
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode(viewMode === 'grid' ? 'list' : 'grid');
                        }}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface)] hover:border-[#0a3161] dark:hover:border-[#ff6325] text-xs font-extrabold text-[color:var(--color-on-surface)] transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Click to toggle view (Grid / List)"
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <Grid size={14} className="text-[#0a3161] dark:text-[#ff6325]" />
                            <span className="capitalize">Grid</span>
                          </>
                        ) : (
                          <>
                            <List size={14} className="text-[#0a3161] dark:text-[#ff6325]" />
                            <span className="capitalize">List</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div id="hotel-results-anchor" className="scroll-mt-6">
                {filteredServices.length === 0 ? (
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
                        mObj.allCategories.forEach((cat: string) => acc[groupKey].categories.add(cat));
                      } else if (service.name && service.name !== '__BOKSPOT_GROUP__') {
                        acc[groupKey].categories.add(service.name);
                      }
                      return acc;
                    }, {})).map((group: any, i: number) => {
                      const m = group.merchantObj;
                      const s = group.service;
                      const chips = Array.from(group.categories).slice(0, 3);
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
                              ? `/${bookingType}/${category}/${m.id || m.slug || 'merchant'}?checkIn=${checkInDate}&checkOut=${checkOutDate}&adults=${adults}&children=${children}&childAges=${encodeURIComponent(JSON.stringify(childAges))}&rooms=${rooms}&pets=${pets}&petCount=${petCount}`
                              : `/${bookingType}/${category}/${m.id || m.slug || 'merchant'}`
                            }
                            className="block h-full"
                          >
                            <div className={`group relative flex flex-col h-full bg-[color:var(--color-surface)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/30 hover:border-[#ff6325]/50 hover:shadow-xl hover:shadow-[#ff6325]/10 transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'sm:flex-row' : ''}`}>
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
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold shadow-sm">
                                  <Star size={11} className="text-[#ff6325] fill-[#ff6325]" />
                                  <span>{group.rating || '4.8'}</span>
                                  <span className="text-white/60 text-[9px]">({group.reviewCount || '20+'})</span>
                                </div>

                                <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 hover:text-[#ff6325] hover:scale-110 transition-all shadow-sm">
                                  <Heart size={13} />
                                </div>

                                {/* Bottom of Image: Price tag preview if available */}
                                {group.minPrice && (
                                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#ff6325] to-[#e04e13] text-white font-extrabold text-[11px] shadow-md">
                                    From ₹{group.minPrice}
                                  </div>
                                )}
                              </div>

                              {/* Info Body - Compact & Clean */}
                              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
                                <div>
                                  <div className="flex items-start justify-between gap-1.5 mb-1">
                                    <h3 className="font-bold text-sm sm:text-base text-[color:var(--color-on-surface)] group-hover:text-[#ff6325] transition-colors line-clamp-1 tracking-tight">
                                      {group.branchName || s?.branchName || s?.metadata?.branchName || m.name || 'Merchant'}
                                    </h3>
                                  </div>


                                  <div className="flex items-center text-[11px] font-medium text-[color:var(--color-on-surface-variant)] mb-2">
                                    <MapPin size={12} className="text-[#ff6325]/80 mr-1 shrink-0" />
                                    <span className="truncate max-w-[200px]">{group.address || group.groupCity || m.address || city || 'Chennai'}</span>
                                    {group.dist && (
                                      <>
                                        <span className="mx-1.5 text-[color:var(--color-outline-variant)]">•</span>
                                        <span className="shrink-0 font-semibold text-[color:var(--color-on-surface)]/80">{group.dist}</span>
                                      </>
                                    )}
                                  </div>
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
                                          {chip}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Action Footer for Hotels - Compact */}
                                {isHotelCategory && (
                                  <div className="mt-2.5 pt-2.5 border-t border-[color:var(--color-outline-variant)]/15 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider block leading-tight">Starting from</span>
                                      <span className="text-sm sm:text-base font-black text-[#ff6325]">₹{group.minPrice || '2,499'}</span>
                                      <span className="text-[9px] text-[color:var(--color-on-surface-variant)] font-medium"> / night</span>
                                    </div>
                                    <span className="px-2.5 py-1.5 rounded-lg bg-[#0a3161] dark:bg-[#ff6325] text-white text-[11px] font-bold group-hover:brightness-110 flex items-center gap-1 shadow-xs transition-all">
                                      <span>View Rooms</span>
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
    </main>
  );
}
