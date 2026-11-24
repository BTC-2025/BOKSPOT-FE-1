'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Star, Compass, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShortcutManagerModal } from '../components/shortcuts/ShortcutManagerModal';
import { SubnavManagerModal } from '../components/shortcuts/SubnavManagerModal';
import { ActionModalManager } from '../components/shortcuts/ActionModalManager';
import { useBookingFlowStore, useLocationStore } from '../lib/store';
import { useShortcutStore, AVAILABLE_SHORTCUTS, SUBNAV_CATEGORIES } from '../store/useShortcutStore';
import { calculateDistance } from '../lib/geoUtils';
import { api } from '../lib/api';
import { CarouselSections } from '../components/home/CarouselSections';
import { ConciergeJourneys } from '../components/home/ConciergeJourneys';
import { WeekendEscapes } from '../components/home/WeekendEscapes';
import { VerifiedPartners } from '../components/home/VerifiedPartners';
import { NearbyRadar } from '../components/home/NearbyRadar';
import { AdBanner } from '../components/home/AdBanner';
import { HorizontalQuickShortcuts } from '../components/home/HorizontalQuickShortcuts';
import { MegaMenuSubnav } from '../components/home/MegaMenuSubnav';
import { CategoryCard, SectionHeader, StatCard, WishlistButton, CartAddButton } from '../components/home/HomeShared';
// Live activity notification ticker pool
const LIVE_ACTIVITIES_POOL = [
  { id: 'act-1', user: 'Ananya S.', city: 'Chennai', action: 'reserved table at', item: 'Grand Temple Restaurant', merchant: 'Mylapore', time: 'Just now', emoji: '🍽️', link: '/lifestyle-local/dining' },
  { id: 'act-2', user: 'Karthik V.', city: 'Chennai', action: 'booked 7v7 slot at', item: 'Sunstone Football Turf', merchant: 'OMR', time: '1 min ago', emoji: '⚽', link: '/sports-turf/football-turf' },
  { id: 'act-3', user: 'Sneha R.', city: 'Bangalore', action: 'booked haircut & spa at', item: 'Style Studio', merchant: 'Indiranagar', time: '3 mins ago', emoji: '💇', link: '/lifestyle-local/salons' },
  { id: 'act-4', user: 'Arun M.', city: 'Chennai', action: 'scheduled consultation at', item: 'Apollo Dental', merchant: 'Anna Nagar', time: '5 mins ago', emoji: '🩺', link: '/lifestyle-local/doctor' }
];



import { BokspotLoader } from '../components/ui/BokspotLoader';

export default function HomePage() {
  const { bookings } = useBookingFlowStore();
  const { city, latitude, longitude } = useLocationStore();
  const { activeShortcuts, setShortcutModalOpen, openActionModal, subnavCategories, setSubnavModalOpen } = useShortcutStore();
  const [mounted, setMounted] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  const [selectedNearbyService, setSelectedNearbyService] = useState<any>(null);

  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = 320;
      trendingScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const scrollRecommended = (direction: 'left' | 'right') => {
    if (recommendedScrollRef.current) {
      const scrollAmount = 320;
      recommendedScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const scrollEvents = (direction: 'left' | 'right') => {
    if (eventsScrollRef.current) {
      const scrollAmount = 320;
      eventsScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const journeysScrollRef = useRef<HTMLDivElement>(null);
  const scrollJourneys = (direction: 'left' | 'right') => {
    if (journeysScrollRef.current) {
      const scrollAmount = 320;
      journeysScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };




  // Live activity notification ticker state
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [activityDismissed, setActivityDismissed] = useState(false);

  // Advertisement auto-play rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Live activity notification ticker logic
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      if (!activityDismissed) {
        const randomIdx = Math.floor(Math.random() * LIVE_ACTIVITIES_POOL.length);
        setCurrentActivity(LIVE_ACTIVITIES_POOL[randomIdx]);
        setShowActivity(true);
      }
    }, 6000);

    const interval = setInterval(() => {
      setShowActivity(false);
      setTimeout(() => {
        if (!activityDismissed) {
          const randomIdx = Math.floor(Math.random() * LIVE_ACTIVITIES_POOL.length);
          setCurrentActivity(LIVE_ACTIVITIES_POOL[randomIdx]);
          setShowActivity(true);
        }
      }, 500);
    }, 18000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [activityDismissed]);

  const getDiff = (idx: number) => {
    let d = idx - adIndex;
    if (d < -2) d += 5;
    if (d > 2) d -= 5;
    return d;
  };



  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCount = Array.isArray(bookings) ? bookings.filter(b => b.status === 'CONFIRMED').length : 0;
  const activeNote = activeCount === 1 ? '1 active reservation' : `${activeCount} active reservations`;

  return (
    <>
      <ShortcutManagerModal />
      <SubnavManagerModal />
      <ActionModalManager />

      <main className="page-content w-full px-4 md:px-8 lg:px-12">
        <div className="mx-auto w-full space-y-4">
          {/* Row 1: Ad Banner with Smart Slot Finder */}
          <motion.div
            id="today-slots"
            className="relative z-30"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <AdBanner />
          </motion.div>

          {/* Row 1.5: Quick Access Shortcuts (Horizontal Row below banner) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <HorizontalQuickShortcuts />
          </motion.div>

          {/* Row 2: Carousel Sections (Recommended & Trending) */}
          <motion.div
            id="top-rated"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <CarouselSections />
          </motion.div>

          {/* Row 3: Concierge Live Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <ConciergeJourneys />
            <div className="h-px bg-[color:var(--color-outline-variant)]/20 my-6 w-full" />
          </motion.div>

          {/* Row 4: Weekend Getaways & Escapes */}
          <motion.div
            id="weekend-deals"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <WeekendEscapes />
          </motion.div>

          {/* Row 5: Verified Venues & Partners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <VerifiedPartners />
          </motion.div>

          {/* Row 6: Live Radar Map */}
          <motion.div
            id="near-me"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <NearbyRadar />
          </motion.div>
        </div>
      </main>

      {/* Glassmorphic Dashboard Drawer/Modal */}
      {dashboardOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[color:var(--color-surface-container)]/90 border border-[color:var(--color-outline-variant)]/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-up card-glass">

            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[color:var(--color-outline-variant)]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-primary)]">analytics</span>
                <h3 className="font-extrabold text-base text-[color:var(--color-on-surface)]">Dashboard Control Center</h3>
              </div>
              <button
                onClick={() => setDashboardOpen(false)}
                className="p-1.5 hover:bg-[color:var(--color-on-surface)]/[0.05] rounded-full text-[color:var(--color-outline)] hover:text-[color:var(--color-primary)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Active Bookings"
                  value={String(activeCount)}
                  note={activeNote}
                  icon="event_available"
                />
                <StatCard
                  label="Saved Places"
                  value="28"
                  note="Verified local venues"
                  icon="bookmark"
                />
                <StatCard
                  label="Support Score"
                  value="98%"
                  note="Instant response rating"
                  icon="support_agent"
                />
              </div>

              {/* Quick Access Library */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[color:var(--color-outline)]">explore</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[color:var(--color-outline)]">Quick Library</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_SHORTCUTS.map(shortcut => {
                    const handleAction = () => {
                      setDashboardOpen(false);
                      if (shortcut.actionType === 'modal') {
                        openActionModal(shortcut.actionTarget);
                      } else {
                        window.location.href = shortcut.actionTarget;
                      }
                    };
                    return (
                      <button
                        key={shortcut.id}
                        onClick={handleAction}
                        className="h-10 px-3 rounded-xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-dim)]/50 hover:border-[color:var(--color-primary)]/45 hover:bg-[color:var(--color-surface-container-high)]/60 transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] text-left truncate"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[color:var(--color-primary)]">{shortcut.icon}</span>
                        <span className="truncate">{shortcut.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-[color:var(--color-surface-dim)]/50 border-t border-[color:var(--color-outline-variant)]/25 flex justify-end">
              <button
                onClick={() => {
                  setDashboardOpen(false);
                  setShortcutModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors text-xs font-bold shadow-md"
              >
                Manage Docks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time floating activity ticker */}
      <AnimatePresence>
        {showActivity && currentActivity && !activityDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-20 lg:bottom-6 right-4 sm:right-8 lg:right-20 z-40 max-w-sm rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/95 dark:bg-black/90 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex gap-3 text-left group transition-colors duration-300"
          >
            {/* Live Indicator Icon */}
            <div className="h-9 w-9 rounded-xl bg-[color:var(--color-surface-container-high)]/80 border border-[color:var(--color-outline-variant)]/30 flex items-center justify-center text-lg shrink-0 shadow-inner">
              {currentActivity.emoji}
            </div>

            {/* Text details */}
            <div className="flex-1 space-y-1 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600 dark:bg-emerald-400"></span>
                </span>
                <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400">Live booking activity</span>
              </div>
              <p className="text-[11px] font-semibold text-[color:var(--color-on-surface-variant)] leading-normal">
                <span className="font-extrabold text-[color:var(--color-on-surface)]">{currentActivity.user}</span> in <span className="text-[color:var(--color-primary)] font-bold">{currentActivity.city}</span> {currentActivity.action} <span className="font-bold text-[color:var(--color-on-surface)] underline underline-offset-2 decoration-[color:var(--color-primary)]/50">{currentActivity.item}</span> <span className="text-[color:var(--color-outline)] text-[10px] block font-medium mt-0.5">at {currentActivity.merchant}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] font-bold text-[color:var(--color-outline)] uppercase">{currentActivity.time}</span>
                <Link href={currentActivity.link || '/'} className="text-[9px] font-black text-[color:var(--color-primary)] uppercase tracking-wider hover:underline transition-colors flex items-center gap-0.5">
                  View Service <ArrowRight size={8} />
                </Link>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActivity(false);
                setActivityDismissed(true);
              }}
              className="absolute top-2 right-2 text-[color:var(--color-outline)] hover:text-[color:var(--color-on-surface)] p-1 hover:bg-[color:var(--color-outline-variant)]/20 rounded-lg transition-all cursor-pointer"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}