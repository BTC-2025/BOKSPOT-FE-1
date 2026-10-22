'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, Clock, MapPin, XCircle,
  Train, Bus, Plane, Car, Navigation, Compass,
  Calendar, ChevronRight,
  Shield, Hotel, Coffee, Zap, User, Mail, Phone, Building2, Key, QrCode, DoorClosed, Lock, Unlock
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
  PENDING:   { badge: 'bg-amber-50 text-amber-700 border border-amber-200',   dot: 'bg-amber-400 animate-pulse', label: 'Pending' },
  CONFIRMED: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500 animate-pulse', label: 'Confirmed' },
  CANCELLED: { badge: 'bg-red-50 text-red-600 border border-red-200',         dot: 'bg-red-400',             label: 'Cancelled' },
  COMPLETED: { badge: 'bg-blue-50 text-blue-700 border border-blue-200',      dot: 'bg-blue-500',            label: 'Completed' },
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
  const [liveStatuses, setLiveStatuses] = useState<Record<string, string>>({});
  const [remoteMetadata, setRemoteMetadata] = useState<Record<string, { keycardIssued?: boolean; roomNumber?: string }>>({});
  const [unlockedRooms, setUnlockedRooms] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const FILTERS = [
    { id: 'ALL',       label: 'All Bookings' },
    { id: 'ACTIVE',    label: 'Active' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  useEffect(() => { setMounted(true); }, []);

  const [remoteBookings, setRemoteBookings] = useState<any[]>([]);

  // Live poll backend for status updates & keycard issuance
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/v1/bookings/sync?t=${Date.now()}`, { cache: 'no-store' });
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
      } catch {}
    };
    poll();
    const id = setInterval(poll, 3000);
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
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ACTIVE') {
      return b.status === 'SPLIT_PENDING' || b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'CHECKED_IN';
    }
    if (activeFilter === 'COMPLETED') {
      return b.status === 'COMPLETED';
    }
    if (activeFilter === 'CANCELLED') {
      return b.status === 'CANCELLED';
    }
    return b.status === activeFilter;
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
      } catch {}
    }
  };

  return (
    <main className="page-content px-4 md:px-8 lg:pr-8 min-h-screen">
      <div className="mx-auto max-w-5xl py-8 sm:py-12 space-y-10">

        {/* ── Header ────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[color:var(--color-on-surface)] tracking-tight">
            Track your bookings<br className="hidden sm:block" /> and live activity
          </h1>
          <p className="mt-2 text-[color:var(--color-on-surface-variant)] text-sm md:text-base max-w-xl">
            Keep an eye on reservations, service progress, and important transit updates from one clean dashboard.
          </p>
        </div>

        {/* ── 1. Real-Time Travel Tracker ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[color:var(--color-surface-container)]/60 backdrop-blur-xl border border-[color:var(--color-outline-variant)]/30 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Compass size={18} className="text-[color:var(--color-primary)]" />
            <h2 className="font-extrabold text-[color:var(--color-on-surface)] text-base">Real-Time Travel Tracker</h2>
          </div>
          <p className="text-xs text-[color:var(--color-on-surface-variant)] mb-5">
            Select a travel classification, input your PNR reference or ticket identifier, and hook into real-time satellite updates.
          </p>

          {/* Transport Mode Selector */}
          <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] mb-3">Transportation Mode</p>
          <div className="flex gap-2 mb-5">
            {TRANSPORT_MODES.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setSelectedMode(id)}
                title={label}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
                  selectedMode === id
                    ? 'bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)] scale-110 shadow-md'
                    : 'bg-[color:var(--color-surface)] border-[color:var(--color-outline-variant)]/30 text-[color:var(--color-on-surface-variant)] hover:border-[color:var(--color-primary)]/40'
                }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          {/* PNR Input + Find Button */}
          <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] mb-2">PNR / Ticket / Reference</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={pnr}
              onChange={e => setPnr(e.target.value)}
              placeholder="e.g., Booking CAB-8291"
              className="flex-1 px-4 py-3 rounded-2xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface)] text-[color:var(--color-on-surface)] text-sm font-medium placeholder:text-[color:var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/30"
            />
            <button
              onClick={() => pnr && router.push(`/booking/track?ref=${pnr}`)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[color:var(--color-primary)] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <Navigation size={16} />
              Find & Track
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[color:var(--color-outline-variant)]/20">
            {[
              { label: 'Recent Bookings', value: `${mergedBookings.filter(b => b.status === 'PENDING').length} active items`, sub: 'Track ongoing and upcoming reservations' },
              { label: 'Live Updates',    value: 'Realtime status',   sub: 'Monitor booking and service changes' },
              { label: 'Saved Trails',    value: `${mergedBookings.filter(b => b.status === 'CONFIRMED').length} journeys`,        sub: 'Keep track of frequent destinations' },
            ].map(s => (
              <div key={s.label} className="bg-[color:var(--color-surface)]/60 rounded-2xl p-4 border border-[color:var(--color-outline-variant)]/20">
                <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] mb-1">{s.label}</p>
                <p className="font-black text-[color:var(--color-on-surface)] text-sm">{s.value}</p>
                <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 2. My Bookings ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-xl text-[color:var(--color-on-surface)]">My Bookings</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-[color:var(--color-surface-container)]/60 backdrop-blur-xl p-1.5 rounded-2xl border border-[color:var(--color-outline-variant)]/30 w-full overflow-x-auto no-scrollbar shadow-sm mb-5">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`relative px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 flex-1 ${
                  activeFilter === f.id
                    ? 'text-white'
                    : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'
                }`}
              >
                {activeFilter === f.id && (
                  <motion.div
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-[color:var(--color-primary)] rounded-xl shadow-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-[color:var(--color-surface-container)]/60 border border-[color:var(--color-outline-variant)]/20 rounded-3xl p-10 text-center">
              <Calendar size={36} className="mx-auto mb-3 text-[color:var(--color-on-surface-variant)]/40" />
              <p className="font-bold text-[color:var(--color-on-surface)]">
                {activeFilter === 'ALL' ? 'No bookings yet' : `No ${activeFilter.toLowerCase()} bookings`}
              </p>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1">Your upcoming reservations will appear here.</p>
              {activeFilter === 'ALL' && (
                <Link href="/categories" className="inline-block mt-4 px-5 py-2.5 bg-[color:var(--color-primary)] text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity">
                  Browse Services
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredBookings.map((b: any, i) => {
                  const st = STATUS_STYLE[b.status] || STATUS_STYLE.PENDING;
                  
                  const formatDate = (iso: string) => {
                    if (!iso) return '';
                    try {
                      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                    } catch { return iso; }
                  };
                  
                  const formatDateTime = (iso: string) => {
                    if (!iso) return '';
                    try {
                      return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
                    } catch { return iso; }
                  };

                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[color:var(--color-surface-container)]/60 backdrop-blur-xl border border-[color:var(--color-outline-variant)]/30 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                      {/* Status + Ref */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">
                          REF #{b.ref}
                        </span>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${st.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>

                      {/* Business & Service Info */}
                      <div className="mb-3 border-b border-[color:var(--color-outline-variant)]/20 pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="font-black text-[color:var(--color-on-surface)] text-xl leading-tight mb-0.5">{b.merchantName}</h2>
                            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] opacity-80 flex items-center gap-1 mb-2">
                              <MapPin size={10}/> {b.merchantAddress || b.city || 'No Address Provided'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-[11px] font-black uppercase tracking-widest text-[color:var(--color-primary)]">
                            {b.merchantCategory || getBookingType(b.serviceName)}
                          </span>
                          <span className="text-sm font-bold text-[color:var(--color-on-surface)]">
                            {getCategoryName(b.serviceName, b.category)} &bull; {b.serviceName}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm font-bold text-[color:var(--color-primary)]">
                        <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(b.date)}</span>
                        <span className="flex items-center gap-1"><Clock size={13} />{b.time}</span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 gap-2 mt-4 pt-2">
                        
                        {/* User Info */}
                        <div className="flex items-start gap-2">
                          <User size={12} className="text-[color:var(--color-on-surface-variant)] mt-0.5 shrink-0" />
                          <div className="text-xs text-[color:var(--color-on-surface-variant)] font-medium flex flex-col gap-0.5">
                            <span className="font-bold text-[color:var(--color-on-surface)]">{b.customerName || user?.fullName || 'N/A'}</span>
                            <div className="flex flex-wrap items-center gap-x-2">
                              {b.customerEmail && <span className="flex items-center gap-1"><Mail size={10}/> {b.customerEmail}</span>}
                              {b.customerPhone && <span className="flex items-center gap-1"><Phone size={10}/> {b.customerPhone}</span>}
                            </div>
                            <span className="opacity-80 flex items-center gap-1 mt-0.5"><MapPin size={10}/> {b.customerAddress || user?.address || 'No Address Provided'}</span>
                          </div>
                        </div>
                        
                        {/* Booked At Info */}
                        {b.bookedAt && (
                          <div className="flex items-start gap-2 mt-1">
                            <Clock size={12} className="text-[color:var(--color-on-surface-variant)] mt-0.5 shrink-0" />
                            <p className="text-[10px] text-[color:var(--color-on-surface-variant)] font-medium uppercase tracking-wider">
                              Placed on {formatDateTime(b.bookedAt)}
                            </p>
                          </div>
                        )}

                        {/* ── Hotel Digital Keycard & Entry Pass Module ── */}
                        {((b.category || '').toLowerCase().includes('hotel') || (b.serviceName || '').toLowerCase().includes('room') || b.keycardIssued) && (
                          <div className="mt-3 p-3.5 rounded-2xl border border-[color:var(--color-primary)]/20 bg-gradient-to-br from-[color:var(--color-primary)]/5 via-transparent to-amber-500/5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Key size={14} className="text-[color:var(--color-primary)]" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-[color:var(--color-on-surface)]">
                                  {b.keycardIssued ? 'Digital Keycard Active' : 'Digital Room Access'}
                                </span>
                              </div>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                b.keycardIssued 
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}>
                                {b.keycardIssued ? `Room ${b.roomNumber || 'Assigned'} Access` : 'Awaiting Reception Desk'}
                              </span>
                            </div>

                            {b.keycardIssued ? (
                              <div className="space-y-2">
                                <p className="text-[11px] text-[color:var(--color-on-surface-variant)]">
                                  Your NFC &amp; Smart RFID Key is active for <strong>Room {b.roomNumber || '102'}</strong>. Hold your phone near the door lock or tap below to unlock.
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => {
                                      setUnlockedRooms(prev => ({ ...prev, [b.ref]: true }));
                                      setTimeout(() => {
                                        setUnlockedRooms(prev => ({ ...prev, [b.ref]: false }));
                                      }, 4000);
                                    }}
                                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                                      unlockedRooms[b.ref]
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-102'
                                        : 'bg-[color:var(--color-primary)] text-white hover:opacity-90 active:scale-95'
                                    }`}
                                  >
                                    {unlockedRooms[b.ref] ? (
                                      <>
                                        <Unlock size={14} />
                                        <span>Door Unlocked! (Open Now)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Lock size={14} />
                                        <span>Tap to Unlock Room {b.roomNumber || ''}</span>
                                      </>
                                    )}
                                  </button>
                                  <Link
                                    href={`/booking/track?ref=${b.ref}`}
                                    className="p-2 bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/40 rounded-xl text-[color:var(--color-on-surface)] hover:text-[color:var(--color-primary)] transition-colors"
                                    title="View QR Entry Pass"
                                  >
                                    <QrCode size={16} />
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[11px] text-[color:var(--color-on-surface-variant)] pt-1">
                                <span>Show Entry QR Pass at front desk to receive keycard.</span>
                                <Link
                                  href={`/booking/track?ref=${b.ref}`}
                                  className="text-[color:var(--color-primary)] font-bold flex items-center gap-1 hover:underline"
                                >
                                  <QrCode size={12} /> View Entry Pass
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Amount and Action */}
                      <div className="flex flex-col mt-5 pt-4 border-t border-[color:var(--color-outline-variant)]/20 gap-3">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">Total Amount</p>
                            <p className="font-black text-[color:var(--color-on-surface)] text-lg">₹{b.amount}</p>
                          </div>
                          <Link
                            href={`/booking/track?ref=${b.ref}`}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-2xl text-xs font-bold hover:opacity-90 group-hover:gap-2.5 transition-all"
                          >
                            Track <ChevronRight size={13} />
                          </Link>
                        </div>
                        {b.status === 'PENDING' && (
                          <div className="w-full flex justify-end">
                            <button 
                              onClick={() => handleCancel(b)}
                              className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── 3. Connected Services & Add-ons ──────────────────── */}
        <div>
          <div className="mb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/5 px-3 py-1 rounded-full">
              Transit Essentials
            </span>
            <h2 className="font-black text-2xl text-[color:var(--color-on-surface)] mt-3">Connected Services &amp; Add-ons</h2>
            <p className="text-sm text-[color:var(--color-on-surface-variant)] mt-1 max-w-xl">
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
                  className="bg-[color:var(--color-surface-container)]/60 backdrop-blur-xl border border-[color:var(--color-outline-variant)]/20 rounded-3xl p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${addon.color} flex items-center justify-center shadow-sm`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-[color:var(--color-on-surface-variant)] tracking-wider opacity-50">⊕</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-[color:var(--color-on-surface)] text-sm">{addon.title}</h3>
                    <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1 leading-relaxed">{addon.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-[color:var(--color-on-surface-variant)]">Starts at <span className="text-[color:var(--color-on-surface)]">{addon.price}</span></span>
                    <button className="px-3 py-1.5 bg-[color:var(--color-primary)] text-white rounded-xl text-[10px] font-black tracking-wide hover:opacity-90 active:scale-95 transition-all">
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
