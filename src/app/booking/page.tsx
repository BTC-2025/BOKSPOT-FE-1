'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, Clock, MapPin, XCircle,
  Train, Bus, Plane, Car, Navigation, Compass,
  Calendar, ChevronRight, Bookmark, Radio, ShieldCheck,
  Shield, Hotel, Coffee, Zap, User, Mail, Phone, Building2, Key, QrCode, DoorClosed, Lock, Unlock, Search
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
  const [searchBookingsQuery, setSearchBookingsQuery] = useState('');
  const [liveStatuses, setLiveStatuses] = useState<Record<string, string>>({});
  const [remoteMetadata, setRemoteMetadata] = useState<Record<string, { keycardIssued?: boolean; roomNumber?: string }>>({});
  const [unlockedRooms, setUnlockedRooms] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const FILTERS = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

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

  return (
    <main className="page-content w-full px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-[1600px] pt-4 pb-14 space-y-6">

        {/* ── HIGH-CONVERTING EYE-CATCHY TRACKER HERO CARD (OPTIMIZED & RESPONSIVE) ── */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-[#0d1424] dark:via-[#111936] dark:to-[#0f172a] p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
          {/* Subtle Ambient Decorative Gradient Glow */}
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-orange-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Punchy, Clear & Optimized Title */}
            <div className="space-y-1.5 max-w-lg">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6325] animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6325]">
                  Instant Live Radar
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Track Any Booking &amp; PNR</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/30 font-black">
                    Live
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
                  Enter your flight, train, bus, turf slot, cab, or stay reference to view live status and digital QR passes.
                </p>
              </div>
            </div>

            {/* Right: Roomy Tactile Search Dock (No Placeholder Clipping) */}
            <div className="w-full lg:max-w-xl space-y-2">
              {/* Category Quick Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10">
                {TRANSPORT_MODES.map(({ id, icon: Icon, label }) => {
                  const isActive = selectedMode === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedMode(selectedMode === id ? '' : id)}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#003580] text-white shadow-xs font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Icon size={12} className={isActive ? 'text-orange-400' : 'text-slate-400'} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* High-Contrast Search Input with Generous Width */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pnr.trim()) router.push(`/booking/track?ref=${encodeURIComponent(pnr.trim())}`);
                }}
                className="relative flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 focus-within:border-[#ff6325] dark:border-white/15 dark:focus-within:border-[#ff6325] shadow-xs transition-all"
              >
                <div className="pl-3 pr-1.5 text-slate-400 shrink-0">
                  <Navigation size={15} className="text-[#ff6325]" />
                </div>
                <input
                  type="text"
                  value={pnr}
                  onChange={e => setPnr(e.target.value)}
                  placeholder={
                    selectedMode === 'flight' ? 'Flight PNR (e.g. 6E-2849)...' :
                    selectedMode === 'train' ? 'Train PNR (e.g. 4819284729)...' :
                    selectedMode === 'bus' ? 'Bus Ticket ID (e.g. BUS-TN09)...' :
                    selectedMode === 'cab' ? 'Cab Booking REF (e.g. CAB-4921)...' :
                    'Enter Booking REF or PNR ID...'
                  }
                  className="min-w-0 flex-1 py-2 px-1 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6325] to-[#ff4500] hover:from-[#e04e13] hover:to-[#e03d00] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Track Status</span>
                  <ChevronRight size={13} />
                </button>
              </form>
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              My Bookings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">
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
                        className="absolute inset-0 bg-[#003580] dark:bg-blue-600 rounded-lg shadow-xs"
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
                {filteredBookings.map((b: any, i) => {
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
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003580] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-100 dark:border-blue-900/40 truncate">
                              {b.merchantCategory || getBookingType(b.serviceName)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide shrink-0 ${st.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                          </div>

                          {/* Venue Title & Unit */}
                          <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate tracking-tight leading-snug group-hover:text-[#003580] dark:group-hover:text-blue-400 transition-colors">
                            {b.merchantName}
                          </h2>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {b.serviceName}
                          </p>
                        </div>

                        {/* Middle: Location & Time Capsule */}
                        <div className="my-2.5 py-2 border-y border-slate-100 dark:border-white/5 space-y-1 text-xs">
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
                            <span className={`font-black text-base sm:text-lg tracking-tight leading-tight ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
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
