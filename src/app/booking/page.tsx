'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, Clock, MapPin, XCircle,
  Train, Bus, Plane, Car, Navigation, Compass,
  Calendar, ChevronRight, ChevronLeft, Bookmark, Radio, ShieldCheck,
  Shield, Hotel, Coffee, Zap, User, Mail, Phone, Building2, Key, QrCode, DoorClosed, Lock, Unlock, Search, Ticket, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlowStore, useUserStore } from '../../lib/store';

const TRANSPORT_MODES = [
  { id: 'flight', icon: Plane, label: 'Flight' },
  { id: 'train', icon: Train, label: 'Train' },
  { id: 'bus', icon: Bus, label: 'Bus' },
  { id: 'cab', icon: Car, label: 'Cab' },
];

const STATUS_STYLE: Record<string, { badge: string; dot: string; label: string }> = {
  SPLIT_PENDING: { badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-500 animate-pulse', label: 'Split In Progress' },
  PENDING: { badge: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-400 animate-pulse', label: 'Pending' },
  CONFIRMED: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500 animate-pulse', label: 'Confirmed' },
  CANCELLED: { badge: 'bg-red-50 text-red-600 border border-red-200', dot: 'bg-red-400', label: 'Cancelled' },
  COMPLETED: { badge: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500', label: 'Completed' },
};

const ADD_ONS = [
  {
    icon: Car,
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    title: 'Airport / Station Cab',
    desc: 'Pre-book a cab from your arrival terminal to your final destination with instant verification.',
    price: '₹399',
    cta: 'BOOK CAB →',
  },
  {
    icon: Hotel,
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50',
    title: 'Transit Room / Hotel',
    desc: 'Book hourly rooms or premium hotels near your arrival station/airport for a quick refresh.',
    price: '₹1,200',
    cta: 'BOOK STAY →',
  },
  {
    icon: Coffee,
    color: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-50',
    title: 'Airport Lounge Pass',
    desc: 'Get exclusive access to premium terminal lounges with complimentary dining and high-speed Wi-Fi.',
    price: '₹799',
    cta: 'GET PASS →',
  },
  {
    icon: Shield,
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-50',
    title: 'Travel Protection',
    desc: 'Secure your journey against cancellations, delays, baggage loss, or medical emergencies.',
    price: '₹99',
    cta: 'PROTECT TRIP →',
  },
];

const getServiceBanner = (serviceName: string, category: string) => {
  const name = (serviceName || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  if (cat.includes('resort') || name.includes('resort') || name.includes('villa')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80';
  }
  if (cat.includes('turf') || name.includes('turf') || name.includes('football')) {
    return 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=700&auto=format&fit=crop&q=80';
  }
  if (name.includes('cricket') || name.includes('ground')) {
    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=700&auto=format&fit=crop&q=80';
  }
  if (cat.includes('camp') || name.includes('camp') || name.includes('tent')) {
    return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&auto=format&fit=crop&q=80';
  }
  if (cat.includes('hotel') || name.includes('room') || name.includes('suite')) {
    return 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80';
  }
  if (cat.includes('train') || cat.includes('bus') || name.includes('express')) {
    return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=700&auto=format&fit=crop&q=80';
};

const getBookingType = (serviceName: string, fallback?: string) => {
  const name = (serviceName || '').toLowerCase();
  if (name.includes('room') || name.includes('hotel') || name.includes('suite')) return 'Hotel Booking';
  if (name.includes('cricket') || name.includes('ground 1')) return 'Cricket Ground Booking';
  if (name.includes('football') || name.includes('turf')) return 'Football Turf Booking';
  if (name.includes('ground')) return 'Cricket Ground Booking';
  if (name.includes('hair') || name.includes('spa')) return 'Salon Booking';
  if (name.includes('table') || name.includes('dine')) return 'Restaurant Booking';
  return fallback || 'Service Booking';
};

const getCategoryName = (serviceName: string, originalCat?: string) => {
  if (originalCat && originalCat !== 'Category') return originalCat;
  const name = (serviceName || '').toLowerCase();
  if (name.includes('room')) return 'Deluxe Room';
  if (name.includes('ground')) return 'Shed A';
  return 'General';
};

function TracksContent() {
  const router = useRouter();
  const { bookings, cancelBooking } = useBookingFlowStore();
  const { user } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const [pnr, setPnr] = useState('');
  const [hasTracked, setHasTracked] = useState(false);
  const [searchBookingsQuery, setSearchBookingsQuery] = useState('');
  const [liveStatuses, setLiveStatuses] = useState<Record<string, string>>({});
  const [remoteMetadata, setRemoteMetadata] = useState<Record<string, { keycardIssued?: boolean; roomNumber?: string }>>({});
  const [unlockedRooms, setUnlockedRooms] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const FILTERS = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  // Reset pagination to page 1 whenever search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchBookingsQuery]);

  useEffect(() => { setMounted(true); }, []);

  const [remoteBookings, setRemoteBookings] = useState<any[]>([]);

  // Live background poll for status updates & keycard issuance (lightweight 8s interval)
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`/api/v1/bookings/sync?t=${Date.now()}`, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(tid);
        if (!res.ok) return;
        const json = await res.json();
        const all: any[] = json?.data || json;
        if (Array.isArray(all) && !cancelled) {
          setRemoteBookings(all);
          const map: Record<string, string> = {};
          const metaMap: Record<string, { keycardIssued?: boolean; roomNumber?: string }> = {};
          all.forEach((b: any) => {
            map[b.ref] = b.status;
            if (b.keycardIssued || b.roomNumber) {
              metaMap[b.ref] = { keycardIssued: b.keycardIssued, roomNumber: b.roomNumber };
            }
          });
          setLiveStatuses(map);
          setRemoteMetadata(metaMap);
        }
      } catch { }
    };
    poll();
    const id = setInterval(poll, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!mounted) return null;

  // Merge store bookings with any backend synced bookings that aren't yet in local storage
  const combinedAllBookings = [...bookings];
  remoteBookings.forEach((rb: any) => {
    if (!combinedAllBookings.some(b => b.ref === rb.ref || b.id === rb.id)) {
      combinedAllBookings.push(rb);
    }
  });

  const mergedBookings = combinedAllBookings.map(b => ({
    ...b,
    status: (liveStatuses[b.ref] || b.status) as any,
    keycardIssued: remoteMetadata[b.ref]?.keycardIssued || (b as any).keycardIssued,
    roomNumber: remoteMetadata[b.ref]?.roomNumber || (b as any).roomNumber,
  }));

  const filteredBookings = mergedBookings.filter(b => {
    // 1. Status Filter
    let statusMatch = true;
    if (activeFilter === 'ACTIVE') {
      statusMatch = b.status === 'SPLIT_PENDING' || b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'CHECKED_IN';
    } else if (activeFilter === 'COMPLETED') {
      statusMatch = b.status === 'COMPLETED';
    } else if (activeFilter === 'CANCELLED') {
      statusMatch = b.status === 'CANCELLED';
    } else if (activeFilter !== 'ALL') {
      statusMatch = b.status === activeFilter;
    }

    if (!statusMatch) return false;

    // 2. Search query match in bookings
    if (searchBookingsQuery.trim()) {
      const q = searchBookingsQuery.trim().toLowerCase();
      const refMatch = (b.ref || '').toLowerCase().includes(q);
      const merchantMatch = (b.merchantName || '').toLowerCase().includes(q);
      const serviceMatch = (b.serviceName || '').toLowerCase().includes(q);
      const customerMatch = (b.customerName || '').toLowerCase().includes(q);
      return refMatch || merchantMatch || serviceMatch || customerMatch;
    }

    return true;
  });

  // Pagination calculation: 3 columns x 3 rows = 9 items per page (Max 3 rows)
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handleCancel = async (booking: any) => {
    if (confirm(`Cancel reservation ${booking.ref}?`)) {
      cancelBooking(booking.id);
      try {
        await fetch('/api/v1/bookings/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...booking, status: 'CANCELLED' }),
        });
        setLiveStatuses(prev => ({ ...prev, [booking.ref]: 'CANCELLED' }));
      } catch { }
    }
  };

  // Dynamic Tracking Selection: Active Booking resolution from real user bookings
  const activeModeBooking = mergedBookings.find(b => {
    const cat = (b.category || '').toLowerCase();
    const svc = (b.serviceName || '').toLowerCase();
    if (selectedMode === 'train') return cat.includes('train') || svc.includes('train') || cat.includes('rail');
    if (selectedMode === 'bus') return cat.includes('bus') || svc.includes('bus');
    if (selectedMode === 'cab') return cat.includes('cab') || cat.includes('taxi') || svc.includes('cab') || svc.includes('car');
    if (selectedMode === 'flight') return cat.includes('flight') || svc.includes('flight') || cat.includes('airline');
    return false;
  }) || mergedBookings.find(b => b.status === 'CONFIRMED' || b.status === 'PENDING') || mergedBookings[0];

  // Specific dynamic details directly from real bookings
  const displayPnr = pnr.trim() || activeModeBooking?.ref || 'BK-LIVE';
  const displayStatus = activeModeBooking?.status || 'CONFIRMED';
  const displayCarrier = activeModeBooking?.merchantName || (
    selectedMode === 'flight' ? 'IndiGo Airlines (6E 421)' :
    selectedMode === 'train' ? 'Southern Railway (12675 Kovai SF)' :
    selectedMode === 'bus' ? 'SRS Travels (Multi-Axle Volvo)' :
    'BokSpot Prime (Toyota Etios)'
  );
  const displayService = activeModeBooking?.serviceName || (
    selectedMode === 'flight' ? 'Economy Standard • MAA to BLR' :
    selectedMode === 'train' ? 'AC Chair Car • MAS to SBC' :
    selectedMode === 'bus' ? 'A/C Sleeper 2+1 • Chennai to Bangalore' :
    'Airport City Drop'
  );
  const displayTime = activeModeBooking?.time || '14:30';
  const displayDate = activeModeBooking?.date || 'Today';

  return (
    <main className="page-content w-full px-4 sm:px-6 lg:px-8 min-h-screen overflow-x-hidden">
      <div className="w-full pt-4 pb-14 space-y-6">

        {/* ── DESIGN MOCKUP & SKETCH TRACKER HERO DOCK ── */}
        <div className="relative w-full">
          <div className="relative z-10 w-full space-y-3">
            {/* 1. TOP ROW: 4 Compact Transit Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3 w-full">
              {/* Left Promo / Quick Action Card */}
              <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-orange-50/60 dark:from-slate-800/80 dark:to-slate-800/60 border border-slate-200/80 dark:border-white/10 shadow-2xs w-full">
                <img
                  src="/images/transport/plan-smarter.png"
                  alt="Plan Smarter"
                  className="w-20 h-20 -my-3 -ml-1 object-contain shrink-0 drop-shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-black text-[#0a3161] dark:text-white truncate">
                    Plan Smarter. Travel Better!
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    Track, Book &amp; Explore
                  </div>
                </div>
                <span className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-xs font-black text-[#0a3161] dark:text-white shrink-0">
                  →
                </span>
              </div>
              {[
                {
                  id: 'flight',
                  icon: Plane,
                  label: 'Flights',
                  subtitle: 'Terminals',
                  tag: 'Live',
                  iconBg: 'bg-blue-500/15 text-blue-500',
                },
                {
                  id: 'train',
                  icon: Train,
                  label: 'Trains',
                  subtitle: 'IRCTC',
                  tag: 'Platform',
                  iconBg: 'bg-indigo-500/15 text-indigo-500',
                },
                {
                  id: 'bus',
                  icon: Bus,
                  label: 'Buses',
                  subtitle: 'Intercity',
                  tag: 'GPS',
                  iconBg: 'bg-amber-500/15 text-amber-500',
                },
                {
                  id: 'cab',
                  icon: Car,
                  label: 'Cabs',
                  subtitle: 'Outstation',
                  tag: 'ETA',
                  iconBg: 'bg-emerald-500/15 text-emerald-500',
                },
              ].map(({ id, icon: Icon, label, subtitle, tag, iconBg }) => {
                const isActive = (selectedMode || 'flight') === id;
                const matchingCount = mergedBookings.filter(b => (b.category || '').toLowerCase().includes(id) || (b.serviceName || '').toLowerCase().includes(id)).length;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedMode(id);
                    }}
                    className={`relative group flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer select-none w-full h-full min-h-[84px] text-left ${
                      isActive
                        ? 'bg-[#0a3161]/5 dark:bg-[#0a3161]/20 text-slate-900 dark:text-white border border-[#0a3161] shadow-md'
                        : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Left: 3D Pop-out Icon */}
                    <img
                      src={`/images/transport/${id}.png`}
                      alt={label}
                      className="w-20 h-20 -my-3 -ml-1 object-contain shrink-0 drop-shadow-md transition-transform group-hover:scale-105"
                    />

                    {/* Middle: Title & Subtitle */}
                    <div className="min-w-0 flex-1 text-center">
                      <span className="text-sm sm:text-base font-black tracking-tight block truncate">{label}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                        {subtitle}
                      </span>
                    </div>

                    {/* Right: Simplified Live Count Badge (hidden when 0) */}
                    {matchingCount > 0 && (
                      <span
                        title={`${matchingCount} trips with live tracking`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F6EE] text-[#0F7A4B] text-[12px] font-semibold shrink-0 mr-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F7A4B] shrink-0" />
                        <span>{matchingCount} live</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 2. MIDDLE ROW: Left (Track Title + Search Box & Track Live) + Right (Tracked Booking Summary) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F8FAFD] dark:bg-slate-900/90 py-4 px-6 rounded-2xl">
              {/* Left Side: Track Title, Subtitle + Search Box */}
              <div className="space-y-3 w-full lg:max-w-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF5A1F] motion-safe:animate-pulse shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6325]">
                      Real-time Radar
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#0A3161] dark:text-white tracking-tight flex items-center gap-2">
                    <span>Track Your Journey &amp;</span>
                    <span className="text-[#ff6325]">Live</span>
                    <span>PNR</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Real-time tracking across flights, trains, buses and cabs.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!pnr.trim()) return;
                    setHasTracked(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1 flex items-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-white/15 shadow-xs px-3.5 py-2.5 focus-within:border-[#ff6325] focus-within:ring-2 focus-within:ring-[#ff6325]/15 transition-all">
                    <Search size={16} className="text-[#0A3161] dark:text-[#FF5201] mr-2.5 shrink-0" />
                    <input
                      type="text"
                      value={pnr}
                      onChange={e => { setPnr(e.target.value); if (hasTracked) setHasTracked(false); }}
                      placeholder={
                        activeModeBooking ? `Search PNR (e.g. ${activeModeBooking.ref})...` :
                        (selectedMode || 'flight') === 'flight' ? 'Quick Paste PNR (e.g. 6E-421)...' :
                        selectedMode === 'train' ? 'Train PNR (e.g. 4819284729)...' :
                        selectedMode === 'bus' ? 'Bus Ticket ID (e.g. BUS-TN09)...' :
                        'Booking REF or Cab Code...'
                      }
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none py-0.5"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) setPnr(text.trim());
                        } catch { }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-700/80 text-[#0a3161] dark:text-slate-200 hover:bg-[#ff6325]/15 hover:text-[#ff6325] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0"
                      title="Scan / Paste PNR"
                    >
                      <QrCode size={15} />
                      <span>Scan</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="h-[52px] px-6 rounded-[12px] bg-[#0a3161] border-b-[3px] border-[#061e3d] hover:brightness-110 hover:shadow-md active:translate-y-[1px] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2447] focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Track Live</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                  </button>
                </form>

                {/* Sub status line under search box (only after tracking) */}
                {hasTracked && pnr.trim() && (
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${displayStatus === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    </span>
                    <span className={`font-bold text-[11px] ${displayStatus === 'CONFIRMED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {displayStatus === 'CONFIRMED' ? 'Confirmed & On Schedule • Departs Soon' :
                       displayStatus === 'SPLIT_PENDING' ? 'Split Payment in Progress' :
                       'Awaiting Partner Confirmation'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                    {activeModeBooking?.city ? `${activeModeBooking.city.toUpperCase()} • IN` : 'MAA ✈ BLR'}
                  </span>
                </div>
                )}
              </div>

              {/* Right Side: Tracked Booking Summary Card (or clean placeholder before tracking) */}
              {hasTracked && pnr.trim() ? (() => {
                const modeKey = (selectedMode || 'flight') as 'flight' | 'train' | 'bus' | 'cab';
                const templates = {
                  flight: {
                    title: 'IndiGo 6E-542',
                    subtitle: `${pnr.trim() || 'BK-RA0BFR'} • Seat 14A • Updated 2 min ago`,
                    badge: 'On time',
                    badgeTone: 'green',
                    fromCode: 'MAA',
                    fromCity: 'Chennai',
                    fromTime: '10:00 AM',
                    toCode: 'BLR',
                    toCity: 'Bengaluru',
                    toTime: '11:15 AM',
                    duration: '1h 15m • Non-stop',
                    note: 'Boarding opens in 1h 05m',
                    boxes: [
                      { label: 'Terminal', val: 'T1' },
                      { label: 'Gate', val: 'B12' },
                      { label: 'Boarding', val: '09:30 AM' },
                      { label: 'Check-in', val: 'Open' },
                    ],
                    updateTime: '08:42',
                    updateText: 'Gate B12 assigned',
                    updateCount: 3,
                    action1: 'Boarding pass',
                    action2: 'Share',
                  },
                  train: {
                    title: '12607 Lalbagh Express',
                    subtitle: `PNR ${pnr.trim() || '4521896307'} • Coach B2 • Berth 34 • Updated 1 min ago`,
                    badge: 'Late 12 min',
                    badgeTone: 'orange',
                    fromCode: 'MAS',
                    fromCity: 'Chennai Central',
                    fromTime: '03:30 PM',
                    toCode: 'SBC',
                    toCity: 'KSR Bengaluru',
                    toTime: '09:20 PM',
                    duration: '5h 50m • Express',
                    note: 'Crossed Katpadi • next Jolarpettai, 6:05 PM',
                    boxes: [
                      { label: 'Platform', val: '5' },
                      { label: 'Now at', val: 'Katpadi' },
                      { label: 'Late by', val: '12 min' },
                      { label: 'Chart', val: 'Prepared' },
                    ],
                    updateTime: '05:12',
                    updateText: 'Departed Katpadi, 12 min late',
                    updateCount: 4,
                    action1: 'Ticket',
                    action2: 'Share status',
                  },
                  bus: {
                    title: 'SRS Travels • Volvo AC Sleeper',
                    subtitle: `${pnr.trim() || 'BK-BS2291'} • Seat L4 • Live GPS • Updated 30 sec ago`,
                    badge: 'On the way',
                    badgeTone: 'green',
                    fromCode: 'CMBT',
                    fromCity: 'Koyambedu',
                    fromTime: '10:30 PM',
                    toCode: 'BLR',
                    toCity: 'Majestic',
                    toTime: '04:45 AM',
                    duration: '6h 15m • Sleeper',
                    note: 'Next stop: Vellore • ETA 12:05 AM',
                    boxes: [
                      { label: 'Bus no', val: 'TN 01 AB 1234' },
                      { label: 'Boarding point', val: 'Gate 4' },
                      { label: 'Next stop', val: 'Vellore' },
                      { label: 'Driver', val: 'Call now' },
                    ],
                    updateTime: '11:20',
                    updateText: 'Left Poonamallee toll',
                    updateCount: 3,
                    action1: 'Call driver',
                    action2: 'Share location',
                  },
                  cab: {
                    title: 'Outstation • Sedan • Murugan 4.8',
                    subtitle: `${pnr.trim() || 'BK-CB7710'} • Fare ₹3,450 • Live GPS`,
                    badge: 'Driver arriving',
                    badgeTone: 'orange',
                    fromCode: 'Pickup',
                    fromCity: 'Adyar',
                    fromTime: '06:00 AM',
                    toCode: 'Drop',
                    toCity: 'Pondicherry',
                    toTime: '08:45 AM',
                    duration: '151 km • 2h 45m',
                    note: 'Driver is 6 min away • TN 09 CD 4567',
                    boxes: [
                      { label: 'Start OTP', val: '4 8 2 1', highlight: true },
                      { label: 'Arrives in', val: '6 min' },
                      { label: 'Vehicle', val: 'TN 09 CD 4567' },
                      { label: 'Driver', val: 'Call Murugan' },
                    ],
                    updateTime: '05:54',
                    updateText: 'Driver is on the way',
                    updateCount: 3,
                    action1: 'Call driver',
                    action2: 'Share trip',
                  },
                };
                const tpl = templates[modeKey] || templates.flight;

                return (
                <div className="w-full lg:flex-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 p-4 shadow-xs space-y-3.5">
                  {/* Top Row: Carrier + PNR + Status badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-10 w-10 flex items-center justify-center shrink-0">
                        <img src={`/images/transport/${modeKey}.png`} alt={modeKey} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-[#0A3161] dark:text-white truncate">
                          {tpl.title}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 truncate">
                          {tpl.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      tpl.badgeTone === 'green' ? 'bg-[#E7F6EE] text-[#0F7A4B]' : 'bg-[#FFF1EB] text-[#FF5201]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tpl.badgeTone === 'green' ? 'bg-[#0F7A4B]' : 'bg-[#FF5201]'}`} />
                      {tpl.badge}
                    </span>
                  </div>

                  {/* Middle Row: Route + 2x2 Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-7 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-lg font-black text-[#0A3161] dark:text-white leading-none">{tpl.fromCode}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{tpl.fromCity}</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{tpl.fromTime}</p>
                        </div>
                        <div className="flex-1 px-2 text-center">
                          <p className="text-[10px] font-semibold text-slate-400 mb-1">{tpl.duration}</p>
                          <div className="relative h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="absolute left-0 top-0 h-1.5 w-1/4 rounded-full bg-[#0A3161]" />
                            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FF5201] ring-2 ring-white dark:ring-slate-900" />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-[#0A3161] dark:text-white leading-none">{tpl.toCode}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{tpl.toCity}</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{tpl.toTime}</p>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <Clock size={12} /> {tpl.note}
                      </p>
                    </div>

                    <div className="sm:col-span-5 grid grid-cols-2 gap-2">
                      {tpl.boxes.map((box: any) => (
                        <div key={box.label} className={`rounded-xl px-2.5 py-1.5 ${box.highlight ? 'bg-[#FFF1EB] dark:bg-[#FF5201]/15' : 'bg-slate-50 dark:bg-slate-800/70'}`}>
                          <span className="text-[10px] font-semibold text-slate-400 block">{box.label}</span>
                          <span className={`text-xs font-black ${box.highlight ? 'text-[#FF5201]' : 'text-[#0A3161] dark:text-white'}`}>{box.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Updates + Actions */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">
                      <span className="font-black text-[#0A3161] dark:text-white">{tpl.updateTime}</span> {tpl.updateText} •{' '}
                      <button
                        type="button"
                        onClick={() => router.push(`/booking/track?ref=${encodeURIComponent(pnr.trim())}`)}
                        className="text-[#FF5201] font-bold hover:underline cursor-pointer"
                      >
                        All updates ({tpl.updateCount})
                      </button>
                    </p>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => router.push(`/booking/track?ref=${encodeURIComponent(pnr.trim())}`)}
                        className="h-[38px] px-4 rounded-[10px] bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-white/15 hover:border-[#FF5201] text-[#0A3161] dark:text-white text-[13px] font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        {modeKey === 'bus' || modeKey === 'cab' ? <Phone size={16} /> : <Ticket size={16} />}
                        <span>{tpl.action1}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigator.share?.({ title: `${modeKey.toUpperCase()} ${displayPnr}`, url: window.location.href }).catch(() => {})}
                        className="h-[38px] px-4 rounded-[10px] bg-[#0A3161] hover:bg-[#072448] text-white text-[13px] font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Share2 size={16} />
                        <span>{tpl.action2}</span>
                      </button>
                    </div>
                  </div>
                </div>
                );
              })() : (
                <div className="w-full lg:flex-1 lg:border-l border-slate-200/80 dark:border-white/10 lg:pl-6 flex items-center gap-4">
                  {/* 3D Radar Globe Visual on Left */}
                  <div className="hidden sm:flex items-center justify-center shrink-0">
                    <img
                      src="/images/transport/radar-3d.png"
                      alt="Live Radar"
                      className="w-[100px] h-[100px] object-contain shrink-0 drop-shadow-md"
                    />
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <div>
                      <h3 className="text-[#0B2447] dark:text-white tracking-tight" style={{ fontSize: '18px', fontWeight: 700 }}>
                        Your live status shows here
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: '14px' }}>
                        Enter a PNR to see where your trip is right now.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-[28px] pt-0.5">
                      {[
                        'Enter or scan PNR',
                        'Track any travel mode',
                        'Live status & alerts'
                      ].map((stepText, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-[10px] text-[#0B2447] dark:text-slate-200 min-w-0"
                          style={{ fontSize: '15px', fontWeight: 600 }}
                        >
                          <img
                            src={`/images/transport/step-${idx + 1}.png`}
                            alt=""
                            className="w-[26px] h-[26px] object-contain shrink-0 drop-shadow-xs"
                          />
                          <span>{stepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Studio Header with Title & Metrics ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Live Reservations Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A3161] dark:text-blue-300 tracking-tight">
              My Bookings
            </h1>
            <p className="text-[#0A3161]/70 dark:text-slate-400 text-xs font-normal mt-0.5">
              Manage your confirmed bookings, digital passes, and contactless room keycards.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-white/10 shadow-xs text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
            <span className="text-slate-400 font-normal">Active:</span>
            <span className="text-[#003580] dark:text-blue-400 font-black">
              {mergedBookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'SPLIT_PENDING').length}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-400 font-normal">Total:</span>
            <span className="text-slate-900 dark:text-white font-black">{mergedBookings.length}</span>
          </div>
        </div>

        {/* ── Floating Filter & Bookings Search Bar ── */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-white/10 rounded-2xl p-2.5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search In My Bookings */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchBookingsQuery}
                onChange={e => setSearchBookingsQuery(e.target.value)}
                placeholder="Search my bookings (ref, venue, service)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Right: Segmented Status Filter Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-white/10 overflow-x-auto no-scrollbar shrink-0">
              {FILTERS.map(f => {
                const count = f.id === 'ALL' 
                  ? mergedBookings.length 
                  : mergedBookings.filter(b => f.id === 'ACTIVE' 
                      ? (b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'SPLIT_PENDING')
                      : b.status === f.id
                    ).length;

                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`relative px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      activeFilter === f.id
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {activeFilter === f.id && (
                      <motion.div
                        layoutId="filter-pill"
                        className="absolute inset-0 bg-[#ff6325] rounded-lg shadow-xs"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{f.label}</span>
                    <span className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        {/* ── 2. My Bookings Cards Grid ────────────────────────────────────── */}
        <div>

          {filteredBookings.length === 0 ? (
            <div className="bg-white/70 dark:bg-[color:var(--color-surface-container)]/70 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[28px] p-12 text-center shadow-xs">
              <Calendar size={36} className="mx-auto mb-3 text-[color:var(--color-outline)]/40" />
              <p className="font-extrabold text-[color:var(--color-on-surface)]">
                {activeFilter === 'ALL' ? 'No active bookings found' : `No ${activeFilter.toLowerCase()} reservations`}
              </p>
              <p className="text-xs text-[color:var(--color-outline)] mt-1 font-medium">Your upcoming reservations and passes will appear here.</p>
              {activeFilter === 'ALL' && (
                <Link href="/categories" className="inline-block mt-4 px-5 py-2.5 bg-[color:var(--color-primary)] text-white rounded-2xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md">
                  Browse Services
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {paginatedBookings.map((b: any, i) => {
                  const st = STATUS_STYLE[b.status] || STATUS_STYLE.PENDING;

                  const formatDate = (iso: string) => {
                    if (!iso) return '';
                    try {
                      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                    } catch { return iso; }
                  };

                  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                    `BOKSPOT:REF=${b.ref};SERVICE=${b.serviceName};GUEST=${b.customerName || 'GUEST'}`
                  )}`;

                  // Dynamic theme based on status
                  const isCancelled = b.status === 'CANCELLED';
                  const isCompleted = b.status === 'COMPLETED';
                  const isPending = b.status === 'PENDING' || b.status === 'SPLIT_PENDING';

                  const stubTheme = isCancelled
                    ? {
                        bg: 'bg-gradient-to-br from-red-950/90 via-slate-900 to-black',
                        pillBg: 'bg-red-500 text-white',
                        pillText: 'CANCELLED',
                        admitText: 'INACTIVE',
                        dateColor: 'text-red-300',
                        qrOverlay: 'grayscale opacity-30',
                        qrBadge: 'text-red-400 bg-red-950/70 border border-red-800',
                      }
                    : isCompleted
                    ? {
                        bg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-black',
                        pillBg: 'bg-emerald-600 text-white',
                        pillText: 'USED',
                        admitText: 'COMPLETED',
                        dateColor: 'text-emerald-300',
                        qrOverlay: 'opacity-50 grayscale',
                        qrBadge: 'text-emerald-400 bg-emerald-950/70 border border-emerald-800',
                      }
                    : {
                        bg: 'bg-gradient-to-br from-[#003580] via-[#002868] to-[#0a192f]',
                        pillBg: 'bg-[#ff6325] text-white',
                        pillText: 'PASS',
                        admitText: 'ACTIVE',
                        dateColor: 'text-orange-300/90',
                        qrOverlay: 'opacity-100',
                        qrBadge: 'text-blue-300 bg-blue-950/70 border border-blue-800',
                      };

                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 450, damping: 28 } }}
                      whileTap={{ scale: 0.982, transition: { type: 'spring', stiffness: 550, damping: 32 } }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 350, damping: 26 }}
                      className={`relative bg-white dark:bg-[#111726] border rounded-3xl shadow-sm hover:shadow-xl group flex items-stretch overflow-hidden cursor-pointer apple-card ${
                        isCancelled
                          ? 'border-red-200/60 dark:border-red-900/30 opacity-75'
                          : isCompleted
                          ? 'border-emerald-200/60 dark:border-emerald-900/30'
                          : 'border-slate-200/90 dark:border-white/10'
                      }`}
                    >
                      {/* ── LEFT SIDE: BOARDING PASS TICKET STUB (COLOR BY STATUS) ── */}
                      <div className={`relative w-36 sm:w-40 shrink-0 ${stubTheme.bg} text-white p-3.5 flex flex-col items-center justify-between text-center select-none transition-colors`}>
                        {/* Perforation Cutout Notches (Top & Bottom Circles) */}
                        <div className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full bg-[#f8fafc] dark:bg-[#0b0f19] border border-slate-200/90 dark:border-white/10 z-10" />
                        <div className="absolute -bottom-3.5 -right-3.5 w-7 h-7 rounded-full bg-[#f8fafc] dark:bg-[#0b0f19] border border-slate-200/90 dark:border-white/10 z-10" />
                        
                        {/* Dashed Vertical Tear Line */}
                        <div className="absolute top-4 bottom-4 right-0 w-0 border-r-2 border-dashed border-white/20" />

                        {/* Top: Status Ticket Pill Badge */}
                        <div className="w-full flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm ${stubTheme.pillBg}`}>
                            {stubTheme.pillText}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-white/70">
                            {stubTheme.admitText}
                          </span>
                        </div>

                        {/* Center: Live Digital QR Code with Dynamic Status Overlays */}
                        <div className="relative my-2 p-1.5 bg-white rounded-xl shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                          <img
                            src={qrApiUrl}
                            alt={`Pass QR ${b.ref}`}
                            className={`w-16 h-16 sm:w-18 sm:h-18 object-contain transition-all ${stubTheme.qrOverlay}`}
                            loading="lazy"
                          />
                          {/* Cancelled Strikethrough Watermark */}
                          {isCancelled && (
                            <div className="absolute inset-0 bg-red-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                              <span className="text-[9px] font-black uppercase tracking-wider text-red-300 border border-red-400 px-1.5 py-0.5 rounded rotate-[-12deg]">
                                CANCELLED
                              </span>
                            </div>
                          )}
                          {/* Completed Used Watermark */}
                          {isCompleted && (
                            <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300 border border-emerald-400 px-1 py-0.5 rounded rotate-[-8deg]">
                                CHECKED
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bottom: Date & REF */}
                        <div className="w-full pt-1 border-t border-white/15">
                          <span className="block text-[11px] font-black tracking-tight text-white leading-tight uppercase">
                            {formatDate(b.date)}
                          </span>
                          <span className={`block text-[9px] font-mono font-bold mt-0.5 ${stubTheme.dateColor}`}>
                            #{b.ref}
                          </span>
                        </div>
                      </div>

                      {/* ── RIGHT SIDE: VENUE & BOOKING DETAILS ── */}
                      <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
                        {/* Top: Category + Status Badge */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#0A3161]/10 dark:bg-blue-950/50 text-[#0A3161] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-[#0A3161]/20 dark:border-blue-900/40 truncate">
                              {b.merchantCategory || getBookingType(b.serviceName)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide shrink-0 ${st.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                          </div>

                          {/* Venue Title & Unit */}
                          <h2 className="font-bold text-base sm:text-lg text-[#0A3161] dark:text-white truncate tracking-tight leading-snug group-hover:text-[#ff6325] dark:group-hover:text-blue-400 transition-colors">
                            {b.merchantName}
                          </h2>
                          <p className="text-xs font-normal text-slate-600 dark:text-slate-300 truncate mt-0.5">
                            {b.serviceName}
                          </p>
                        </div>

                        {/* Middle: Location & Time Capsule */}
                        <div className="my-2.5 py-2 border-y border-slate-100 dark:border-white/5 space-y-1 text-xs">
                          {/* Cinema Screening Specific Seat & Audi Capsule */}
                          {(b.metadata?.isEntertainmentBooking || b.metadata?.entertainmentBooking || b.serviceName?.toLowerCase().includes('avatar') || b.serviceName?.toLowerCase().includes('movie')) && (
                            <div className="flex items-center justify-between p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#ff6325] font-black text-[11px] mb-1">
                              <span>🎬 {b.metadata?.audiScreen || b.metadata?.entertainmentBooking?.audiScreen || 'Audi 1 (IMAX)'}</span>
                              <span>Seats: {Array.isArray(b.metadata?.seatsSelected) ? b.metadata.seatsSelected.join(', ') : (Array.isArray(b.metadata?.entertainmentBooking?.seats) ? b.metadata.entertainmentBooking.seats.join(', ') : (b.metadata?.seats || 'C7, C8'))}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium truncate">
                            <MapPin size={12} className="shrink-0 text-[#ff6325]" />
                            <span className="truncate">{b.merchantAddress || b.city || 'Verified Venue'}</span>
                          </div>
                          {b.time && (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold truncate">
                              <Clock size={12} className="shrink-0 text-blue-600 dark:text-blue-400" />
                              <span className="truncate">{b.time}</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom: Price + View Details CTA */}
                        <div className="flex items-center justify-between pt-0.5">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">Total Fare</span>
                            <span className={`font-black text-base sm:text-lg tracking-tight leading-tight ${isCancelled ? 'line-through text-slate-400' : 'text-[#0A3161] dark:text-blue-300'}`}>
                              ₹{b.amount?.toLocaleString()}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#003580] hover:text-white dark:bg-slate-800 dark:hover:bg-[#ff6325] text-slate-700 dark:text-slate-200 text-xs font-black transition-all group-hover:shadow-xs">
                            <span>{isCancelled ? 'View Info' : isCompleted ? 'Past Pass' : 'View Pass'}</span>
                            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Card Clickable Overlay */}
                      <Link
                        href={`/booking/track?ref=${b.ref}`}
                        className="absolute inset-0 z-20 focus:outline-none"
                        aria-label={`View pass for ${b.merchantName}`}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination Controls (Max 3 rows = 9 cards per page) */}
          {filteredBookings.length > ITEMS_PER_PAGE && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 border-t border-black/5 dark:border-white/10 select-none">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-800 dark:text-slate-100">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-slate-800 dark:text-slate-100">{Math.min(endIndex, filteredBookings.length)}</span> of{' '}
                <span className="font-bold text-slate-800 dark:text-slate-100">{filteredBookings.length}</span> bookings
              </div>

              <div className="flex items-center gap-1.5">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter((pageNum) => {
                      // Always show first, last, and pages around current page
                      if (pageNum === 1 || pageNum === totalPages) return true;
                      if (Math.abs(pageNum - currentPage) <= 1) return true;
                      return false;
                    })
                    .reduce<number[]>((acc, pageNum) => {
                      // Add ellipsis logic if gap exists
                      if (acc.length > 0 && pageNum - acc[acc.length - 1] > 1) {
                        acc.push(-1); // Indicator for ellipsis
                      }
                      acc.push(pageNum);
                      return acc;
                    }, [])
                    .map((item, idx) => {
                      if (item === -1) {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 select-none">
                            ...
                          </span>
                        );
                      }
                      const isActive = item === currentPage;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setCurrentPage(item);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#003580] text-white shadow-md scale-105 dark:bg-[#ff6325]'
                              : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Connected Services & Add-ons (Apple Carousel Grid) ──────────────────── */}
        <div>
          <div className="mb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/10 px-3 py-1 rounded-full shadow-2xs">
              Transit Essentials
            </span>
            <h2 className="font-extrabold text-2xl text-[color:var(--color-on-surface)] mt-3 tracking-tight">
              Connected Services &amp; Add-ons
            </h2>
            <p className="text-sm text-[color:var(--color-outline)] mt-1 max-w-xl font-normal leading-relaxed">
              Maximize comfort and security on your journey. Complete your itinerary with pre-booked transfers, accommodations, lounge passes, or protection plans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADD_ONS.map((addon, i) => {
              const Icon = addon.icon;
              return (
                <motion.div
                  key={addon.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white/70 dark:bg-[#121722]/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[24px] p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3.5">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${addon.color} flex items-center justify-center shadow-md`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-[color:var(--color-outline)] tracking-wider">
                        Quick Add
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[color:var(--color-on-surface)] text-sm">{addon.title}</h3>
                    <p className="text-[11px] text-[color:var(--color-outline)] mt-1 leading-relaxed font-medium">{addon.desc}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/10">
                    <span className="text-xs font-black text-[color:var(--color-outline)]">From <span className="text-[color:var(--color-on-surface)] font-extrabold">{addon.price}</span></span>
                    <button className="px-3.5 py-1.5 bg-[color:var(--color-primary)] hover:brightness-110 active:scale-95 text-white rounded-xl text-[10px] font-extrabold tracking-wide transition-all shadow-xs cursor-pointer">
                      {addon.cta}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[color:var(--color-primary)] rounded-full animate-spin" />
      </div>
    }>
      <TracksContent />
    </Suspense>
  );
}
