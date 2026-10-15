'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  X,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { SERVICE_GROUPS, getHrefForCategoryItem } from '../../lib/searchData';

// Top Filter tabs matching user requirements with real working filters
const FILTER_TABS = [
  { id: 'all', label: 'All Services', icon: 'grid_view' },
  { id: 'trending', label: 'Trending & Popular', icon: 'local_fire_department' },
  { id: 'instant', label: 'Instant Confirmation', icon: 'bolt' },
  { id: 'luxury', label: 'VIP & Luxury', icon: 'diamond' }
];

// Rich metadata, badges & filter tags for every single service
interface ServiceMetadata {
  desc: string;
  badge?: string;
  badgeColor?: string;
  isTrending?: boolean;
  isInstant?: boolean;
  isLuxury?: boolean;
}

const ITEM_DETAILS_MAP: Record<string, ServiceMetadata> = {
  // Travel
  'Flight Booking': {
    desc: 'Domestic & international flights with instant PNR and baggage confirmation',
    badge: 'INSTANT',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    isTrending: true,
    isInstant: true
  },
  'Train Booking': {
    desc: 'Real-time IRCTC seat status, tatkal alerts & live station tracking',
    badge: 'FAST',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    isTrending: true,
    isInstant: true
  },
  'Helicopter Booking (Premium)': {
    desc: 'VIP aerotaxi & helipad charters for special events, weddings & temple visits',
    badge: 'VIP LUXURY',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    isLuxury: true
  },
  'Cab / Taxi Booking': {
    desc: 'Point-to-point AC cabs & airport transfers with zero surge pricing',
    badge: 'INSTANT',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    isInstant: true
  },
  'Bike Rental': {
    desc: 'Hourly & daily sport bikes, scooters with verified helmet kit',
    isInstant: true
  },
  'Self-Drive Car Rental': {
    desc: 'Clean SUVs, sedans & luxury convertibles with contactless key pickup',
    badge: 'LUXURY FLEET',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    isLuxury: true
  },
  'Bus Booking': {
    desc: 'Luxury multi-axle sleeper and AC Volvo coaches across major routes',
    isInstant: true
  },
  'Ferry / Boat Booking': {
    desc: 'Scenic island ferry & house boat private charters with sunset deck',
    badge: 'POPULAR',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    isTrending: true,
    isLuxury: true
  },
  'Shuttle / Van Booking': {
    desc: 'Fast and secure group van booking with verified local partners and instant slots'
  },

  // Stay
  'Hotel Booking': {
    desc: 'Top-rated 3-star to 5-star properties with instant check-in & free cancellation',
    badge: '15% OFF',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    isTrending: true,
    isInstant: true
  },
  'Resort Booking': {
    desc: 'Luxury private beach & hill-view infinity pool stays with private chef',
    badge: '5-STAR VIP',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    isLuxury: true,
    isTrending: true
  },
  'Homestay / Villa': {
    desc: 'Private pool villas & heritage estates for family gatherings & private parties',
    badge: 'TOP RATED',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    isLuxury: true
  },
  'Camping Booking': {
    desc: 'Starlit tent camps with bonfire, BBQ & certified trekking guides'
  },
  'Hostel Booking': {
    desc: 'Vibrant backpacker bunks with high-speed Wi-Fi, lockers & coworking lounges',
    isInstant: true
  },

  // Entertainment
  'Cinema / Movie Tickets': {
    desc: 'IMAX, 4DX, Dolby Atmos recliners with snacks and seat pre-ordering',
    badge: 'TRENDING',
    badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    isTrending: true,
    isInstant: true
  },
  'Concert Tickets': {
    desc: 'Live music festivals, arena stadium tours & front-row VIP lounge access',
    badge: 'HOT PICKS',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    isTrending: true,
    isLuxury: true
  },
  'Gaming Arena Booking': {
    desc: 'PS5, VR rigs, sim racing cockpits & esports battle stations',
    isInstant: true
  },
  'Theatre Shows': {
    desc: 'Drama, comedy standups, musical Broadway acts & live cultural performances'
  },
  'Events & Festivals': {
    desc: 'Food fests, carnivals & weekend cultural gatherings',
    isTrending: true
  },
  'Exhibition Entry': {
    desc: 'Art galleries, trade expos, tech summits and interactive art showcases'
  },
  'Workshops / Classes': {
    desc: 'Pottery, mixology, cooking, and creative weekend masterclasses'
  },

  // Sports
  'Football Turf': {
    desc: 'FIFA-grade floodlit artificial turfs with shower amenities and ball rent',
    badge: 'LIVE SLOTS',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    isTrending: true,
    isInstant: true
  },
  'Cricket Ground': {
    desc: 'Full-size cricket pitches with box cricket nets, scoreboards & balls',
    isTrending: true
  },
  'Badminton Court': {
    desc: 'BWF standard wooden & synthetic courts with racket hire',
    isInstant: true
  },
  'Swimming Pool Slots': {
    desc: 'Clean temperature-controlled Olympic lap pools with certified coaching'
  },
  'Tennis Court': {
    desc: 'Clay, grass, and synthetic hard courts with ball-boy assistance'
  },
  'Basketball Court': {
    desc: 'Indoor wooden courts with official dimensions and scoreboard'
  },
  'Indoor Play Arena': {
    desc: 'Trampoline parks, bowling alleys and laser tag arenas for friends & family'
  },

  // Lifestyle
  'Salon / Spa Appointment': {
    desc: 'Premium haircut, bridal makeover, Thai spa & therapeutic massage',
    badge: 'TOP PICK',
    badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    isTrending: true,
    isLuxury: true
  },
  'Doctor Appointment': {
    desc: 'Verified senior specialists, clinic consults & video triage',
    badge: 'VERIFIED',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    isInstant: true
  },
  'Restaurant Table Reservation': {
    desc: 'Instant table booking at Michelin & top fine dining with welcome drinks',
    badge: 'POPULAR',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    isTrending: true,
    isInstant: true
  },
  'Gym / Yoga Slot Booking': {
    desc: 'Day workout passes & certified personal trainer guided fitness sessions'
  },
  'Electrician Booking': { desc: 'Certified home electrical repairs, wiring, and appliance setup with doorstep arrival' },
  'Plumber Booking': { desc: 'Emergency leak fix, pipeline servicing, and modern bathroom fittings' },
  'Cleaning Service': { desc: 'Deep house cleaning, sofa shampooing, and kitchen sanitization' },
  'Technician Service': { desc: 'AC repair, refrigerator servicing, and home electronics maintenance' },
  'Studio Booking': { desc: 'Acoustic sound stages, photography cyclorama, and high-key video lighting' },

  // Business
  'Co-working Space': {
    desc: 'Plug & play hot desks with Gigabit internet, private phone booths & beverage bar',
    isInstant: true
  },
  'Meeting Room': {
    desc: 'Executive conference setups with 4K interactive screens & video bridge',
    isInstant: true
  },
  'Podcast Studio': {
    desc: 'Acoustic soundproof rooms equipped with Shure SM7B mics and 4K cameras'
  },
  'Conference Hall': {
    desc: 'Banquet and seminar halls with projector, stage, and full audio-visual suite',
    isLuxury: true
  },
  'Training Sessions': { desc: 'Corporate workshop rooms with seating for teams, whiteboard & catering' },

  // Devotional
  'Temple Darshan Booking': {
    desc: 'Special VIP queue passes & sevas across prominent temples',
    badge: 'VIP DARSHAN',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    isLuxury: true,
    isInstant: true
  },
  'Pooja Slot Booking': {
    desc: 'Personalized poojas, homams with verified Vedic priests at home or temple'
  },
  'Pilgrimage Packages': {
    desc: 'End-to-end spiritual tours with hotel, satvik food & sanitized cab transfers',
    isTrending: true
  },

  // Equipment Rentals
  'Cycle Rental': { desc: 'Geared mountain bikes and city cycles for morning rides' },
  'Sports Bike Rental': { desc: 'Superbikes & cruiser rentals with riding gear', isLuxury: true },
  'Camera Rental': { desc: 'DSLR, Sony mirrorless, cinema lenses, and gimbal kits' },
  'Sound System Rental': { desc: 'JBL concert speakers, wireless mics & DJ mixers' },
  'Event Equipment Rental': { desc: 'Canopy tents, chairs, LED screens, and ambient lighting' },

  // Personal Services
  'Pet Grooming Appointment': { desc: 'Spa bath, fur trimming, and tick wash for dogs & cats', isTrending: true },
  'Babysitting Service': { desc: 'Verified, CPR-trained professional nannies for childcare' },
  'Elder Care Service': { desc: 'Compassionate assistance, health monitoring, and senior companionship' },
  'Event Organizer Booking': { desc: 'Full event planners for birthdays, anniversaries, and corporate events', isLuxury: true }
};

interface ServiceItemWithCategory {
  name: string;
  emoji: string;
  subcategory: string;
  groupTitle: string;
  groupIndex: number;
  href: string;
  metadata: ServiceMetadata;
}

export function MegaMenuSubnav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'trending' | 'instant' | 'luxury'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll listener to detect when page is scrolled down (Airbnb morph trigger)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setActiveSubTab('all');
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Master catalog of all services flattened across all 9 groups
  const allCatalogServices: ServiceItemWithCategory[] = useMemo(() => {
    const list: ServiceItemWithCategory[] = [];
    SERVICE_GROUPS.forEach((group, gIdx) => {
      group.subcategories.forEach(subcat => {
        subcat.items.forEach(item => {
          list.push({
            name: item.name,
            emoji: item.emoji,
            subcategory: subcat.name,
            groupTitle: group.title,
            groupIndex: gIdx,
            href: getHrefForCategoryItem(group.title, item.name),
            metadata: ITEM_DETAILS_MAP[item.name] || {
              desc: 'Fast and secure booking with verified local partners and instant slot reservation.'
            }
          });
        });
      });
    });
    return list;
  }, []);

  const currentGroup = SERVICE_GROUPS[activeCategoryIndex] || SERVICE_GROUPS[0];

  // Determine if searching across whole platform or viewing active tab/category
  const isSearchActive = searchQuery.trim().length > 0;
  const isFilterActive = activeSubTab !== 'all';

  // Compute displayed items
  const displayItems = useMemo(() => {
    let pool = allCatalogServices;

    // If neither global search nor global filter is active, restrict to currently selected category
    if (!isSearchActive && !isFilterActive) {
      pool = pool.filter(item => item.groupIndex === activeCategoryIndex);
    }

    // Apply Tab Filter (Trending, Instant, Luxury)
    if (activeSubTab === 'trending') {
      pool = pool.filter(item => item.metadata.isTrending);
    } else if (activeSubTab === 'instant') {
      pool = pool.filter(item => item.metadata.isInstant);
    } else if (activeSubTab === 'luxury') {
      pool = pool.filter(item => item.metadata.isLuxury);
    }

    // Apply Search Query across all domains (matches "hotel", "flight", "turf", "doctor", etc.)
    if (isSearchActive) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.groupTitle.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.metadata.desc.toLowerCase().includes(q)
      );
    }

    return pool;
  }, [allCatalogServices, activeCategoryIndex, activeSubTab, searchQuery, isSearchActive, isFilterActive]);

  // Title for the right content section
  const sectionTitle = useMemo(() => {
    if (isSearchActive) {
      return `Search Results for "${searchQuery}"`;
    }
    if (activeSubTab === 'trending') {
      return '🔥 Trending & Popular Bookings';
    }
    if (activeSubTab === 'instant') {
      return '⚡ Instant Confirmation Services';
    }
    if (activeSubTab === 'luxury') {
      return '💎 VIP & Luxury Reservations';
    }
    return currentGroup.title;
  }, [isSearchActive, searchQuery, activeSubTab, currentGroup.title]);

  const sectionSubtitle = useMemo(() => {
    if (isSearchActive) {
      return `Found ${displayItems.length} matching booking services across all categories`;
    }
    if (activeSubTab === 'trending') {
      return 'Most booked and highly rated services by customers this week';
    }
    if (activeSubTab === 'instant') {
      return 'Zero waiting time. Confirmed slot generated immediately on checkout';
    }
    if (activeSubTab === 'luxury') {
      return 'Exclusive premium venues, 5-star stays, private charters & VIP darshan passes';
    }
    return currentGroup.description;
  }, [isSearchActive, displayItems.length, activeSubTab, currentGroup.description]);

  return (
    <div className={`z-40 mb-6 transition-all duration-300 ${
      isScrolled 
        ? 'sticky top-[68px] py-1 flex justify-center' 
        : 'relative pt-3'
    }`} ref={menuRef}>

      {/* 
        ====================================================
        AIRBNB-STYLE MORPHING BAR:
        - When at top: Full bar with All Bookings button + Vendor actions
        - When scrolled down: Smoothly morphs into a centered, compact static capsule
        ====================================================
      */}
      <AnimatePresence mode="wait">
        {!isScrolled ? (
          /* BEFORE SCROLL: Expanded Bar */
          <motion.div
            key="expanded-bar"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-4 p-2 rounded-2xl md:rounded-full bg-[color:var(--color-surface-container)]/75 border border-[color:var(--color-outline-variant)]/30 backdrop-blur-xl shadow-lg flex-wrap lg:flex-nowrap w-full"
          >
            {/* Left: 'All Bookings' Dropdown Trigger Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`group px-4 py-2.5 rounded-full font-black text-xs flex items-center gap-2.5 transition-all duration-300 cursor-pointer shadow-md active:scale-95 border ${isOpen
                    ? 'bg-gradient-to-r from-[#0a3161] to-[#1557bf] dark:from-[#ff6325] dark:to-[#ea580c] text-white border-white/20 shadow-md shadow-[#0a3161]/25 dark:shadow-[#ff6325]/30'
                    : 'bg-[#0a3161]/10 text-[#0a3161] border-[#0a3161]/25 hover:bg-[#0a3161] hover:text-white dark:bg-[#ff6325]/12 dark:text-[#ff6325] dark:border-[#ff6325]/35 dark:hover:bg-[#ff6325] dark:hover:text-white'
                  }`}
              >
                <div className="h-6 w-6 rounded-full bg-current/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[17px] transition-transform duration-300 group-hover:rotate-90">
                    grid_view
                  </span>
                </div>
                <span className="tracking-wider uppercase text-[12px] font-black">All Bookings</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Middle Prompt text */}
            <div 
              onClick={() => setIsOpen(true)}
              className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-[color:var(--color-surface-container-high)]/40 border border-[color:var(--color-outline-variant)]/20 text-xs text-[color:var(--color-outline)] cursor-pointer hover:border-[#0a3161]/40 dark:hover:border-[#ff6325]/40 hover:text-[color:var(--color-on-surface)] transition-all flex-1 max-w-md mx-auto"
            >
              <Search className="w-3.5 h-3.5 text-[#0a3161] dark:text-[#ff6325]" />
              <span className="font-semibold truncate">Search by flight, hotel, turf, salon or doctor...</span>
              <kbd className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 text-[color:var(--color-outline)]">
                ⌘K
              </kbd>
            </div>

            {/* Right Tools: Become Vendor, Support, Settings */}
            <div className="flex items-center gap-2.5 pl-2 pr-1 ml-auto shrink-0 border-l border-[color:var(--color-outline-variant)]/20">
              <Link
                href="/vendor/register"
                className="bg-gradient-to-r from-[#0a3161] to-[#1557bf] dark:from-[#ff6325] dark:to-[#ea580c] hover:brightness-110 text-white pl-2 pr-4 h-9 rounded-full flex items-center gap-2 shadow-md shadow-[#0a3161]/20 dark:shadow-[#ff6325]/25 hover:scale-105 active:scale-95 transition-all text-[11px] font-black cursor-pointer shrink-0 border border-white/20"
              >
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white">
                  <span className="material-symbols-outlined text-[13px]">storefront</span>
                </div>
                <span className="text-white text-[10px] font-black tracking-widest select-none">BECOME VENDOR</span>
              </Link>

              <Link
                href="/support"
                className="h-9 w-9 rounded-full border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container-high)]/70 flex items-center justify-center text-[color:var(--color-on-surface-variant)] hover:text-[#0a3161] dark:hover:text-[#ff6325] hover:border-[#0a3161]/40 dark:hover:border-[#ff6325]/40 hover:scale-105 transition-all shrink-0 shadow-sm"
                aria-label="Help & Support"
                title="24/7 Concierge Support"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
              </Link>

              <Link
                href="/profile"
                className="h-9 w-9 rounded-full border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container-high)]/70 flex items-center justify-center text-[color:var(--color-on-surface-variant)] hover:text-[#ff6325] hover:border-[#ff6325]/40 hover:scale-105 transition-all shrink-0 shadow-sm"
                aria-label="Settings"
                title="Profile & Appearance Settings"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* AFTER SCROLL: Compact Centered Static Pill with All Bookings + Vendor/Tools + Search Icon */
          <motion.div
            key="collapsed-pill"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-center gap-2 p-1.5 pl-2 pr-2 rounded-full bg-[color:var(--color-surface-container)]/90 border border-[color:var(--color-outline-variant)]/40 backdrop-blur-2xl shadow-xl shadow-black/20 hover:border-[#ff6325]/40 transition-all"
          >
            {/* 1. All Bookings Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsOpen(prev => !prev)}
              className={`group px-3.5 py-1.5 rounded-full font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 border ${isOpen
                  ? 'bg-gradient-to-r from-[#0a3161] to-[#1557bf] dark:from-[#ff6325] dark:to-[#ea580c] text-white border-white/20'
                  : 'bg-[#0a3161]/10 text-[#0a3161] border-[#0a3161]/25 hover:bg-[#0a3161] hover:text-white dark:bg-[#ff6325]/15 dark:text-[#ff6325] dark:border-[#ff6325]/30 dark:hover:bg-[#ff6325] dark:hover:text-white'
                }`}
            >
              <div className="h-5 w-5 rounded-full bg-current/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[15px]">grid_view</span>
              </div>
              <span className="tracking-wider uppercase text-[11px] font-black">All Bookings</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Separator */}
            <div className="h-5 w-[1px] bg-[color:var(--color-outline-variant)]/30 mx-0.5" />

            {/* 2. Become Vendor Pill Button */}
            <Link
              href="/vendor/register"
              className="bg-gradient-to-r from-[#0a3161] to-[#1557bf] dark:from-[#ff6325] dark:to-[#ea580c] hover:brightness-110 text-white pl-2 pr-3 h-8 rounded-full flex items-center gap-1.5 shadow-md shadow-[#0a3161]/20 dark:shadow-[#ff6325]/25 hover:scale-105 active:scale-95 transition-all text-[10px] font-black cursor-pointer shrink-0 border border-white/20"
            >
              <div className="h-4.5 w-4.5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white">
                <span className="material-symbols-outlined text-[12px]">storefront</span>
              </div>
              <span className="text-white text-[9.5px] font-black tracking-wider select-none">BECOME VENDOR</span>
            </Link>

            {/* 3. Support Icon Button */}
            <Link
              href="/support"
              className="h-8 w-8 rounded-full border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container-high)]/70 flex items-center justify-center text-[color:var(--color-on-surface-variant)] hover:text-[#0a3161] dark:hover:text-[#ff6325] hover:border-[#0a3161]/40 dark:hover:border-[#ff6325]/40 hover:scale-105 transition-all shrink-0 shadow-xs"
              aria-label="Help & Support"
              title="24/7 Concierge Support"
            >
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
            </Link>

            {/* 4. Settings Icon Button */}
            <Link
              href="/profile"
              className="h-8 w-8 rounded-full border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container-high)]/70 flex items-center justify-center text-[color:var(--color-on-surface-variant)] hover:text-[#0a3161] dark:hover:text-[#ff6325] hover:border-[#0a3161]/40 dark:hover:border-[#ff6325]/40 hover:scale-105 transition-all shrink-0 shadow-xs"
              aria-label="Settings"
              title="Profile & Appearance Settings"
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </Link>

            {/* Separator */}
            <div className="h-5 w-[1px] bg-[color:var(--color-outline-variant)]/30 mx-0.5" />

            {/* 5. At last: Search Icon Circle that triggers the full catalog search */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0a3161] to-[#1557bf] dark:from-[#ff6325] dark:to-[#ea580c] hover:brightness-110 text-white flex items-center justify-center shadow-md shadow-[#0a3161]/20 dark:shadow-[#ff6325]/30 hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0 border border-white/20"
              title="Search Bookings & Services"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ====================================================
        MEGA-MENU FULL-WIDTH ZOHO-STYLE MODAL/FLYOUT:
        ====================================================
      */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-3 rounded-3xl bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 backdrop-blur-3xl shadow-2xl z-50 overflow-hidden"
          >

            {/* Top Bar inside Dropdown: Functional Tabs (All, Trending, Instant, Luxury) + Link + Close */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-container-high)]/40 flex-wrap gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(tab.id as any);
                        setSearchQuery(''); // clear query when switching tabs for clarity
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isActive
                          ? 'bg-[#ff6325] text-white shadow-sm shadow-[#ff6325]/25 font-black'
                          : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] hover:bg-[color:var(--color-surface-container-highest)]'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* High-visibility prominent Explore All Services button */}
                <Link
                  href="/categories"
                  onClick={() => setIsOpen(false)}
                  className="group px-4 py-2 rounded-full bg-gradient-to-r from-[#ff6325] to-[#ea580c] hover:brightness-110 text-white shadow-md shadow-[#ff6325]/25 flex items-center gap-2 text-xs font-black cursor-pointer tracking-wider uppercase active:scale-95 transition-all border border-white/20"
                >
                  <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                  <span>EXPLORE ALL 45+ SERVICES</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-[color:var(--color-surface-container-highest)] hover:bg-red-500 hover:text-white text-[color:var(--color-outline)] transition-colors cursor-pointer shadow-xs active:scale-90"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Zoho Split Body: Left Categories List + Right Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 h-[540px]">

              {/* Left Column (3.5 / 12 Cols): Search input + Categories Vertical List */}
              <div className="md:col-span-4 lg:col-span-3 border-r border-[color:var(--color-outline-variant)]/20 p-4 flex flex-col justify-between bg-[color:var(--color-surface-container-low)]/50 h-full overflow-hidden">
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Category Search Filter */}
                  <div className="relative mb-3 shrink-0">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-outline)]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 'Hotel', 'Turf', 'Doctor'..."
                      className="w-full pl-9 pr-7 py-2 rounded-xl text-xs bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 text-[color:var(--color-on-surface)] placeholder:text-[color:var(--color-outline)] focus:outline-none focus:border-[#ff6325] transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[color:var(--color-outline)] hover:text-[color:var(--color-on-surface)] cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Vertical Categories List with smooth visible scrolling */}
                  <div className="space-y-1 overflow-y-auto overflow-x-hidden flex-1 pr-1.5 [scrollbar-width:thin] [scrollbar-color:#ff6325_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#ff6325]/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#ff6325]">
                    {SERVICE_GROUPS.map((group, idx) => {
                      const isSelected = activeCategoryIndex === idx && !isSearchActive && activeSubTab === 'all';

                      return (
                        <button
                          key={group.title}
                          type="button"
                          onClick={() => {
                            setActiveCategoryIndex(idx);
                            setActiveSubTab('all');
                            setSearchQuery('');
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${isSelected
                              ? 'bg-[#ff6325]/10 border-[#ff6325]/40 text-[#ff6325] shadow-xs font-black'
                              : 'bg-transparent border-transparent text-[color:var(--color-on-surface-variant)] hover:bg-[color:var(--color-surface-container-high)] hover:text-[color:var(--color-on-surface)]'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="material-symbols-outlined text-[17px] shrink-0 opacity-80">
                              {group.icon}
                            </span>
                            <span className="truncate">{group.title}</span>
                          </div>

                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6325] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zoho-style bottom primary button */}
                <div className="pt-3 mt-3 border-t border-[color:var(--color-outline-variant)]/20 shrink-0">
                  <Link
                    href="/categories"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff6325] to-[#ea580c] hover:brightness-110 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#ff6325]/25 active:scale-98 transition-all uppercase tracking-wider"
                  >
                    <span>BROWSE FULL DIRECTORY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column (8.5 / 12 Cols): Service Cards Grid with dedicated smooth scrolling */}
              <div className="md:col-span-8 lg:col-span-9 p-6 overflow-y-auto flex flex-col justify-between h-full [scrollbar-width:thin] [scrollbar-color:#ff6325_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#ff6325]/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#ff6325] [&::-webkit-scrollbar-track]:bg-black/5 dark:[&::-webkit-scrollbar-track]:bg-white/5">
                <div>
                  {/* Category / Filter Title & Description */}
                  <div className="flex items-center justify-between pb-3 mb-5 border-b border-[color:var(--color-outline-variant)]/20 shrink-0">
                    <div>
                      <h3 className="text-lg font-black text-[color:var(--color-on-surface)] flex items-center gap-2.5">
                        <span>{sectionTitle}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6325]/15 text-[#ff6325]">
                          {displayItems.length} Available Services
                        </span>
                      </h3>
                      <p className="text-xs text-[color:var(--color-outline)] font-medium mt-0.5">
                        {sectionSubtitle}
                      </p>
                    </div>

                    {!isSearchActive && activeSubTab === 'all' && (
                      <Link
                        href={getHrefForCategoryItem(currentGroup.title, '')}
                        onClick={() => setIsOpen(false)}
                        className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#ff6325] hover:underline shrink-0"
                      >
                        <span>View all {currentGroup.title}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* Empty State */}
                  {displayItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="h-12 w-12 rounded-full bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[color:var(--color-on-surface)]">
                        No services match "{searchQuery}"
                      </h4>
                      <p className="text-xs text-[color:var(--color-outline)] mt-1 max-w-sm mx-auto">
                        Try searching for generic terms like "hotel", "turf", "flight", "doctor", or "darshan".
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveSubTab('all');
                        }}
                        className="mt-3 px-4 py-1.5 rounded-full bg-[#ff6325] text-white text-xs font-bold cursor-pointer hover:brightness-110"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    /* Cards Grid: 3 columns like the reference image */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {displayItems.map((item) => {
                        return (
                          <Link
                            key={`${item.groupTitle}-${item.name}`}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="group relative p-4 rounded-2xl bg-[color:var(--color-surface-container-high)]/60 hover:bg-[color:var(--color-surface-container-highest)] border border-[color:var(--color-outline-variant)]/25 hover:border-[#ff6325]/40 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer"
                          >
                            <div>
                              {/* Card Header: Emoji/Icon + Title */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="h-8 w-8 rounded-xl bg-[color:var(--color-surface-container)] flex items-center justify-center text-lg shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xs">
                                    <span>{item.emoji}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-black text-[color:var(--color-on-surface)] group-hover:text-[#ff6325] transition-colors leading-snug truncate">
                                      {item.name}
                                    </h4>
                                    {(isSearchActive || isFilterActive) && (
                                      <span className="text-[10px] text-[color:var(--color-outline)] truncate block">
                                        {item.groupTitle} • {item.subcategory}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Micro Badge */}
                              {item.metadata.badge && (
                                <div className="mb-2">
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider inline-block ${item.metadata.badgeColor || 'bg-[#ff6325]/15 text-[#ff6325] border-[#ff6325]/25'}`}>
                                    {item.metadata.badge}
                                  </span>
                                </div>
                              )}

                              {/* Service Description */}
                              <p className="text-[11px] text-[color:var(--color-outline)] line-clamp-2 leading-relaxed font-normal mb-3">
                                {item.metadata.desc}
                              </p>
                            </div>

                            {/* Bottom Action Link ("BOOK NOW >") */}
                            <div className="pt-2 border-t border-[color:var(--color-outline-variant)]/15 flex items-center gap-1 text-[11px] font-black text-[#ff6325] group-hover:translate-x-1 transition-transform">
                              <span className="uppercase tracking-wider">BOOK NOW</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Trust & Verification Footer */}
                <div className="mt-6 pt-3 border-t border-[color:var(--color-outline-variant)]/20 flex items-center justify-between flex-wrap gap-3 text-xs text-[color:var(--color-outline)]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-[11px] font-medium">BOKSPOT Verified Guarantee: Real-time Slot Availability & 0% Hidden Fees</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-[color:var(--color-on-surface-variant)]">
                      Need customized booking?
                    </span>
                    <Link
                      href="/support"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] font-black text-[#ff6325] hover:underline"
                    >
                      Talk to Concierge
                    </Link>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
