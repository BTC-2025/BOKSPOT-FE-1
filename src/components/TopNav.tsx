'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingBag, Sparkles, MapPin, Map, X, User, Sun, Moon, Laptop, Headset, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocationStore, useUIStore, useUserStore, useCartStore, useWishlistStore, useBookingFlowStore } from '../lib/store';
import { LiveClock } from './LiveClock';
import { ALL_SEARCHABLE_SERVICES, SearchableService } from '../lib/searchData';
import { compressImage } from '../lib/imageUtils';
import { LocationSelectorModal } from './LocationSelectorModal';
import { UtilityDrawer } from './UtilityDrawer';

const CITY_NODES = [
  { name: 'Chennai', x: 80, y: 35, display: 'Chennai (Metro)', lat: 13.0827, lng: 80.2707 },
  { name: 'Bangalore', x: 58, y: 45, display: 'Bangalore (IT)', lat: 12.9716, lng: 77.5946 },
  { name: 'Coimbatore', x: 32, y: 62, display: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Theni', x: 30, y: 80, display: 'Theni (Hill Town)', lat: 10.0104, lng: 77.4768 },
  { name: 'Madurai', x: 50, y: 76, display: 'Madurai (Temple City)', lat: 9.9252, lng: 78.1198 },
  { name: 'Mumbai', x: 18, y: 22, display: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', x: 52, y: 10, display: 'Delhi', lat: 28.7041, lng: 77.1025 },
];

const getNearestCityName = (lat: number, lng: number): string => {
  let nearestCity = CITY_NODES[0];
  let minDistance = Infinity;
  CITY_NODES.forEach((node) => {
    const dist = Math.sqrt((node.lat - lat) ** 2 + (node.lng - lng) ** 2);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = node;
    }
  });
  return nearestCity.name;
};

interface TopNavProps {
  utilityDrawerOpen?: boolean;
  setUtilityDrawerOpen?: (open: boolean) => void;
  activeUtilityTab?: 'calendar' | 'calc' | 'tasks' | 'contacts' | null;
  setActiveUtilityTab?: (tab: 'calendar' | 'calc' | 'tasks' | 'contacts' | null) => void;
}

export function TopNav({
  utilityDrawerOpen = false,
  setUtilityDrawerOpen = () => { },
  activeUtilityTab = null,
  setActiveUtilityTab = () => { },
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistItems = useWishlistStore(state => state.items);
  const wishlistCount = wishlistItems.length;
  const bookings = useBookingFlowStore(state => state.bookings);
  const { city, setCity, setLocation, setStatus, status, latitude, longitude } = useLocationStore();
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempSelectedCity, setTempSelectedCity] = useState<string | null>(null);
  const [markerPos, setMarkerPos] = useState<{ x: string; y: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, setUser, logout } = useUserStore();
  const userName = user?.fullName || user?.username || 'vinothkumar';
  const userEmoji = user?.emoji || '🧑';
  const userEmail = user?.email || 'gmvinoth@bnxmail.com';
  const userPhoto = user?.profilePhoto || null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 200, 200, 0.8);
        setUser({
          ...(user || {}),
          profilePhoto: compressed
        });
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };
  // UI toggle states
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileOpenMobile, setProfileOpenMobile] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  // Refs for dropdown positioning / click‑outside handling
  const profileRef = useRef<HTMLDivElement>(null);
  const profileRefMobile = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Scroll behavior:
  // - Downward scroll: hide all headers
  // - Upward scroll: main header appears first
  // - Top of page (scroll <= 60px): both main and secondary header appear
  const [isMainHeaderVisible, setIsMainHeaderVisible] = useState(true);
  const [isSecondaryHeaderVisible, setIsSecondaryHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY <= 40) {
            // At the top of page: both main and secondary headers are visible
            setIsMainHeaderVisible(true);
            setIsSecondaryHeaderVisible(true);
          } else {
            const scrollDelta = currentScrollY - lastScrollYRef.current;
            if (scrollDelta > 10) {
              // Scrolling DOWN: hide both headers
              setIsMainHeaderVisible(false);
              setIsSecondaryHeaderVisible(false);
            } else if (scrollDelta < -8) {
              // Scrolling UP: reveal ONLY main header while scrolling, secondary remains hidden until reaching top
              setIsMainHeaderVisible(true);
              setIsSecondaryHeaderVisible(false);
            }
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter suggestions when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const UNIVERSAL_ITEMS: SearchableService[] = [
      ...ALL_SEARCHABLE_SERVICES,
      { name: 'Profile Settings', emoji: '⚙️', groupTitle: 'Account & Settings', href: '/profile' },
      { name: 'My Bookings', emoji: '📅', groupTitle: 'Account & Settings', href: '/booking' },
      { name: 'Wishlist', emoji: '❤️', groupTitle: 'Shopping', href: '/wishlist' },
      { name: 'Cart', emoji: '🛍️', groupTitle: 'Shopping', href: '/cart' },
      { name: 'Home', emoji: '🏠', groupTitle: 'Navigation', href: '/' },
      { name: 'Categories', emoji: '📂', groupTitle: 'Navigation', href: '/categories' },
      { name: 'Bookings', emoji: '🎟️', groupTitle: 'Navigation', href: '/booking' },
      { name: 'Become a Vendor', emoji: '🏪', groupTitle: 'Business', href: '/vendor/register' },
      { name: 'Help & Support', emoji: '🎧', groupTitle: 'Support', href: '/support' },
      ...bookings.map((b: any) => ({
        name: `Booking: ${b.serviceName || b.item || 'Booking'}`,
        emoji: '🎟️',
        groupTitle: `My Bookings - ${b.merchantName || b.merchant || 'Merchant'}`,
        href: '/booking'
      }))
    ];

    const query = searchQuery.toLowerCase();
    const filtered = UNIVERSAL_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.groupTitle.toLowerCase().includes(query)
    );

    // Remove exact duplicates by name
    const uniqueFiltered = filtered.filter((item, index, self) =>
      index === self.findIndex((t) => t.name === item.name)
    );

    setSuggestions(uniqueFiltered);
    setActiveIndex(-1);
  }, [searchQuery, bookings]);

  const handleSelectSuggestion = (service: any) => {
    router.push(service.href);
    setShowSuggestions(false);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const targetIndex = activeIndex >= 0 ? activeIndex : 0;
        const selected = suggestions[targetIndex];
        if (selected) {
          handleSelectSuggestion(selected);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        e.currentTarget.blur();
      }
    } else {
      if (e.key === 'Enter' && searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setShowSuggestions(false);
      }
    }
  };

  const detectGPSLocation = () => {
    setStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const nearestCityName = getNearestCityName(lat, lng);
          setLocation(lat, lng, nearestCityName);

          // Attempt to reverse geocode exact coordinate to area name via open street map
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
            headers: {
              'User-Agent': 'BetaBookingApp/1.0'
            }
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const address = data.address;
                const localArea = address.suburb || address.neighbourhood || address.residential || address.city_district || address.village;
                const cityOrTown = address.city || address.town || address.municipality;

                const parts = [];
                if (localArea) parts.push(localArea);
                if (cityOrTown) parts.push(cityOrTown);

                if (parts.length > 0) {
                  setLocation(lat, lng, parts.join(', '));
                  return;
                }
              }
            })
            .catch(err => {
              console.warn('Reverse geocode failed:', err);
            });
        },
        (error) => {
          console.error('GPS Geolocation error:', error);
          setStatus('error');
          setLocation(13.0827, 80.2707, 'Chennai');
        }
      );
    } else {
      setStatus('error');
      setLocation(13.0827, 80.2707, 'Chennai');
    }
  };

  useEffect(() => {
    if (showMapModal) {
      const activeNode = CITY_NODES.find(n => n.name.toLowerCase() === (city || 'Chennai').toLowerCase()) || CITY_NODES[0];
      setTempSelectedCity(activeNode.name);
      setMarkerPos({ x: `${activeNode.x}%`, y: `${activeNode.y}%` });
    }
  }, [showMapModal, city]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    let nearestCity = CITY_NODES[0];
    let minDistance = Infinity;

    CITY_NODES.forEach((node) => {
      const dist = Math.sqrt((node.x - clickX) ** 2 + (node.y - clickY) ** 2);
      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = node;
      }
    });

    setTempSelectedCity(nearestCity.name);
    setMarkerPos({ x: `${nearestCity.x}%`, y: `${nearestCity.y}%` });
  };

  const handleConfirmLocation = () => {
    if (tempSelectedCity) {
      const node = CITY_NODES.find(n => n.name === tempSelectedCity);
      if (node) {
        setLocation(node.lat, node.lng, node.name);
      } else {
        setCity(tempSelectedCity);
      }
    }
    setShowMapModal(false);
  };

  const handleCityChange = (val: string) => {
    if (val === 'Detect Location') {
      detectGPSLocation();
    } else {
      const node = CITY_NODES.find(n => n.name === val);
      if (node) {
        setLocation(node.lat, node.lng, node.name);
      } else {
        setCity(val);
      }
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 custom-navbar transition-transform duration-300 ease-in-out ${
          isMainHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`} 
        style={{ zIndex: 9999 }}
      >
        <div className="flex justify-between items-center w-full pl-6 lg:pl-12 pr-0 py-1.5 lg:py-2 max-w-full">
          {/* Left Column: Logo & Brand + Location Selector (Desktop) */}
          <div className="flex-1 flex justify-start items-center gap-6">
            <Link
              href="/"
              className="flex items-center hover:scale-102 active:scale-98 transition-all duration-300 shrink-0"
            >
              <img src="/logo.png?v=3" alt="BokSpot" className="h-10 md:h-12 object-contain" />
            </Link>

            <div className="relative hidden lg:inline-block">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="custom-nav-btn pl-2.5 pr-3 h-8 shadow-md duration-200 flex items-center gap-2 hover:border-[#ff6325]/40"
              >
                <div className="relative flex items-center justify-center">
                  <MapPin size={13} className={`text-[#ff6325] ${status === 'detecting' ? 'animate-bounce' : ''}`} />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#ff6325] rounded-full animate-ping" />
                </div>
                <span className="!text-white text-[12px] font-black">{mounted ? (city || 'Select Location') : 'Chennai'}</span>
                <span className="material-symbols-outlined text-[15px] !text-white/80 transition-transform duration-200" style={{ transform: isLocationModalOpen ? 'rotate(180deg)' : 'none' }}>keyboard_arrow_down</span>
              </button>
            </div>

          </div>

          {/* Center Column: Floating Segmented Dock (Instant Fluid Switch) */}
          <div className="hidden lg:flex flex-none justify-center">
            <nav className="custom-nav-capsule shadow-lg relative flex items-center p-1">
              {(() => {
                const isHomeActive = pathname === '/' || pathname === '/home' || pathname.startsWith('/home/');
                const isCategoriesActive = pathname === '/categories' || pathname.startsWith('/service') || pathname.startsWith('/venue');
                const isBookingsActive = pathname === '/bookings' || pathname === '/tracks' || pathname.startsWith('/bookings/') || pathname.startsWith('/split');

                const currentActiveId = isHomeActive ? 'home' : isCategoriesActive ? 'categories' : isBookingsActive ? 'bookings' : 'home';

                const navItems = [
                  { label: 'Home', href: '/', id: 'home' },
                  { label: 'Categories', href: '/categories', id: 'categories' },
                  { 
                    label: 'Bookings', 
                    href: '/bookings', 
                    id: 'bookings',
                    hasBadge: Array.isArray(bookings) && bookings.length > 0 
                  },
                ];

                return (
                  <div className="flex items-center relative">
                    {navItems.map((item) => {
                      const isActive = currentActiveId === item.id;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          scroll={false}
                          className={`flex items-center justify-center gap-1.5 px-5 py-1.5 text-[12px] font-black tracking-wide relative z-10 custom-nav-link select-none transition-colors duration-150 ${
                            isActive ? 'custom-nav-link-active' : 'custom-nav-link-inactive'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="fluid-nav-active-pill"
                              className="absolute inset-0 rounded-full custom-nav-active-bg -z-10"
                              style={{ willChange: 'transform' }}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 38,
                                mass: 0.5,
                              }}
                            />
                          )}
                          <span>{item.label}</span>
                          {item.hasBadge && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6325] animate-pulse" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </nav>
          </div>

          {/* Right Column: Actions Capsule */}
          <div className="flex-1 flex justify-end items-center gap-3 pr-4 lg:pr-6">
            {/* Desktop Actions Capsule (>= lg) */}
            {/* Desktop Actions (Separated Glass Circles) */}
            <div className="hidden lg:flex items-center gap-2 mr-2">
              {/* Search Icon Container Wrapper */}
              <div className="relative" ref={searchContainerRef}>
                <div
                  className={`custom-nav-icon-container shadow-md transition-all duration-300 ${searchOpen ? 'w-52 xl:w-64 px-3 py-1' : 'w-8 h-8 justify-center'
                    }`}
                >
                  <button
                    onClick={() => {
                      setSearchOpen(!searchOpen);
                      if (!searchOpen) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="custom-nav-icon-btn p-1 shrink-0"
                    aria-label="Search"
                  >
                    <Search size={14} strokeWidth={2.5} />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 flex items-center ${searchOpen ? 'w-36 xl:w-48 opacity-100 ml-2' : 'w-0 opacity-0'
                      }`}
                  >
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="bg-transparent border-none outline-none text-xs text-[#111] dark:text-white placeholder-[#555] dark:placeholder-[#aaa] w-full font-bold"
                      onKeyDown={handleSearchInputKeyDown}
                      autoFocus={searchOpen}
                    />
                  </div>
                </div>

                {/* Autocomplete Dropdown */}
                {searchOpen && showSuggestions && suggestions.length > 0 && (
                  <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-outline-variant/40 bg-surface-container-high/95 backdrop-blur-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-[110] divide-y divide-outline-variant/10 text-left">
                    {suggestions.map((service, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <div
                          key={`${service.name}-${index}`}
                          onMouseDown={(e) => {
                            // Prevent input blur/close
                            e.preventDefault();
                          }}
                          onClick={() => handleSelectSuggestion(service)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-200 ${isActive
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-on-surface hover:bg-surface-container-highest'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{service.emoji}</span>
                            <div className="text-left font-sans">
                              <span className="text-xs block font-bold">{service.name}</span>
                              <span className="text-[9px] text-outline block mt-0.5">
                                in {service.groupTitle}
                              </span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-[10px] opacity-50">
                            arrow_forward
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Wishlist Icon Container */}
              <Link
                href="/wishlist"
                className="custom-nav-icon-container custom-nav-icon-btn w-8 h-8 shadow-md transition-all hover:scale-105 active:scale-95 relative"
                aria-label="Wishlist"
              >
                <Heart size={14} strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                )}
              </Link>

              {/* Cart Icon Container */}
              <Link
                href="/cart"
                className="custom-nav-icon-container custom-nav-icon-btn w-8 h-8 shadow-md transition-all hover:scale-105 active:scale-95 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={14} strokeWidth={2} />
                {cartCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[color:var(--color-primary)] rounded-full shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                )}
              </Link>
            </div>

            {/* Desktop Profile Dropdown */}
            {!user ? (
              <Link
                href="/login"
                className="custom-nav-btn px-4 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-[11px] font-extrabold tracking-wider bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                Sign In
              </Link>
            ) : (
              <div className="hidden lg:flex items-center gap-2 relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="group custom-nav-btn pl-1.5 pr-3 h-8.5 rounded-full flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#ff6325]/40"
                  aria-label="Toggle profile menu"
                  title="Profile Settings"
                >
                  {/* Sleek User Avatar */}
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#ff6325] to-[#1557bf] text-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-[11px] font-black profile-avatar-circle ring-1 ring-white/30">
                    {userPhoto ? (
                      <img src={userPhoto} alt={userName} className="h-full w-full object-cover animate-fade-in" />
                    ) : (
                      <span>{userName ? userName.charAt(0).toUpperCase() : 'V'}</span>
                    )}
                  </div>

                  {/* Clean Username */}
                  <span className="!text-white text-[12px] font-bold tracking-wide select-none truncate max-w-[130px]">
                    {userName}
                  </span>

                  {/* Chevron pointing down/up on the right */}
                  <span
                    className="material-symbols-outlined text-[15px] !text-white/80 group-hover:!text-white transition-transform duration-200"
                    style={{ transform: profileOpen ? 'rotate(180deg)' : 'none' }}
                  >
                    keyboard_arrow_down
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-[#1a1d24] text-slate-800 dark:text-slate-100 rounded-[28px] shadow-2xl border border-slate-200/80 dark:border-slate-800/80 z-50 overflow-hidden backdrop-blur-xl animate-fade-up p-5">
                    {/* Profile Avatar & Info */}
                    <div className="flex flex-col items-center pt-2 pb-1">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden shadow-md flex items-center justify-center bg-[#1557bf]">
                          {userPhoto ? (
                            <img src={userPhoto} alt={userName} className="w-full h-full object-cover animate-fade-in" />
                          ) : (
                            <span className="text-3xl font-bold text-white select-none">
                              {userName ? userName.charAt(0).toUpperCase() : 'V'}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer hover:scale-110"
                          title="Upload profile photo"
                        >
                          <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>

                      <h4 className="font-bold text-[17px] text-slate-900 dark:text-white mt-3 tracking-tight text-center">
                        {userName}
                      </h4>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal text-center mt-0.5">
                        {userEmail}
                      </p>

                      {/* Manage your account Button */}
                      <div className="flex items-center mt-3.5 w-full">
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="w-full py-2 px-4 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[12px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px] text-slate-600 dark:text-slate-300">manage_accounts</span>
                          <span>Manage Account</span>
                        </Link>
                      </div>
                    </div>

                    {/* Theme Selector (Appearance) */}
                    <div className="border-t border-slate-200 dark:border-slate-800/80 px-2 py-3 my-2">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Appearance</span>
                        <span className="text-[11px] font-extrabold capitalize text-[#ff6325]">{theme || 'System'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            theme === 'light'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Sun size={13} className={theme === 'light' ? 'text-amber-500' : ''} /> Light
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            theme === 'dark'
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Moon size={13} className={theme === 'dark' ? 'text-blue-400' : ''} /> Dark
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('system')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            theme === 'system'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Laptop size={13} /> Auto
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-0.5 border-t border-slate-200 dark:border-slate-800/80 pt-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          router.push('/login');
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[19px] text-slate-500 dark:text-slate-400">person_add</span>
                        <span>Add another account</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                          router.push('/');
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors text-left cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[19px] text-red-500">logout</span>
                        <span>Sign out of this account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Actions Capsule (< lg) */}
            <div className="lg:hidden flex items-center bg-[color:var(--color-surface-container)]/60 border border-[color:var(--color-outline-variant)]/30 rounded-full pl-4 pr-1.5 py-1 shadow-md backdrop-blur-md gap-2.5 custom-nav-mobile-capsule">
              {/* Mobile Location Selector & Map Button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setShowMapModal(true)}
                  className="p-0.5 hover:bg-[color:var(--color-on-surface)]/[0.05] hover:text-[color:var(--color-primary)] text-[color:var(--color-on-surface-variant)] transition-all rounded-full cursor-pointer shrink-0"
                  title="Choose on Interactive Map"
                >
                  <Map size={14} />
                </button>
                <MapPin size={14} className={`text-[color:var(--color-primary)] shrink-0 ${status === 'detecting' ? 'animate-bounce' : ''}`} />
                <select
                  value={mounted ? (status === 'detecting' ? 'Detect Location' : city) : 'Chennai'}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-[color:var(--color-on-surface)] cursor-pointer pr-4 appearance-none focus:ring-0 max-w-[110px] truncate"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23A8A8C0\' stroke-width=\'2.5\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
                    backgroundPosition: 'right center',
                    backgroundSize: '9px',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {mounted && city && !['Chennai', 'Madurai', 'Theni', 'Coimbatore', 'Bangalore', 'Mumbai', 'Delhi', 'Detect Location'].includes(city) && (
                    <option value={city} className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">
                      📍 {city}
                    </option>
                  )}
                  <option value="Chennai" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">Chennai</option>
                  <option value="Madurai" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">Madurai</option>
                  <option value="Theni" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">Theni</option>
                  <option value="Coimbatore" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">Coimbatore</option>
                  <option value="Bangalore" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">Bangalore</option>
                  <option value="Mumbai" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">Mumbai</option>
                  <option value="Delhi" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">Delhi</option>
                  <option value="Detect Location" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-primary)] font-bold">📍 GPS...</option>
                </select>
              </div>
            </div>

          </div>

          {/* Utility Drawer Button Box (50px wide column to align with right sidebar) */}
          <div className="w-[50px] shrink-0 h-full flex items-center justify-center border-l border-white/10">
            <button
              onClick={() => setUtilityDrawerOpen(!utilityDrawerOpen)}
              className={`relative flex items-center justify-center transition-all cursor-pointer shadow-md custom-nav-icon-container custom-nav-icon-btn w-9 h-9 ${utilityDrawerOpen
                  ? 'opacity-100 scale-105 shadow-[0_0_10px_rgba(252,238,167,0.3)]'
                  : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
              title="Bokspot Utilities"
            >
              <img src="/utility-icon.png?v=3" alt="Utilities" className="w-[22px] h-[22px] object-contain" />
            </button>
          </div>
        </div>

        {/* Secondary Subnav Bar (Appears when at the very top of page; hidden during middle scrolling) */}
        <div 
          className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
            isSecondaryHeaderVisible 
              ? 'max-h-14 opacity-100' 
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-full secondary-subnav-bar px-4 lg:px-8 py-1.5 flex items-center justify-between text-xs select-none">
            {/* Left Side: High-intent booking shortcuts */}
            <div className="flex items-center gap-1.5 md:gap-2.5 overflow-x-auto custom-scrollbar scrollbar-none py-0.5">
              <Link
                href="/#today-slots"
                className="subnav-pill flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="text-amber-400">⚡</span>
                <span>Today's Slots</span>
              </Link>

              <Link
                href="/#weekend-deals"
                className="subnav-pill flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="text-rose-400">🔥</span>
                <span>Weekend Deals</span>
              </Link>

              <Link
                href="/#near-me"
                className="subnav-pill flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="text-emerald-400">📍</span>
                <span>Near Me</span>
              </Link>

              <Link
                href="/#top-rated"
                className="hidden md:flex subnav-pill items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="text-yellow-400">⭐</span>
                <span>Top Rated</span>
              </Link>
            </div>

            {/* Right Side: Support and Settings (As requested by user) */}
            <div className="flex items-center gap-2 sm:gap-3 pl-3 shrink-0">
              <Link
                href="/support"
                className="subnav-pill flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold shrink-0"
                title="Customer Support & Help Desk"
              >
                <Headset className="w-3.5 h-3.5 text-white/90 shrink-0" />
                <span>Support</span>
              </Link>

              <Link
                href="/profile#profile-settings"
                className="subnav-pill flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold shrink-0"
                title="App Settings & Preferences"
              >
                <Settings className="w-3.5 h-3.5 text-white/90 shrink-0" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Map Picker Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-up">
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-[color:var(--color-outline-variant)]/20">
              <div>
                <h3 className="font-extrabold text-base text-[color:var(--color-on-surface)]">Choose Location on Map</h3>
                <p className="text-xs text-[color:var(--color-outline)] mt-0.5">Click near any city node to pin your location</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1.5 hover:bg-[color:var(--color-on-surface)]/[0.05] rounded-full text-[color:var(--color-outline)] hover:text-[color:var(--color-primary)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mock Map Area */}
            <div
              onClick={handleMapClick}
              className="relative h-80 bg-[color:var(--color-surface-dim)] m-5 rounded-2xl overflow-hidden cursor-crosshair border border-[color:var(--color-outline-variant)]/30 shadow-inner"
              style={{
                backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-primary) 8%, transparent) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            >
              {/* Regional Grid/Boundary Mock Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0,200 Q 150,150 300,280 T 600,100" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
                <path d="M 100,0 Q 250,220 380,180 T 500,400" fill="none" stroke="var(--color-primary)" strokeWidth="1" />
              </svg>

              {/* City Hotspot Nodes */}
              {CITY_NODES.map((node) => {
                const isSelected = tempSelectedCity === node.name;
                return (
                  <div
                    key={node.name}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/node"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTempSelectedCity(node.name);
                      setMarkerPos({ x: `${node.x}%`, y: `${node.y}%` });
                    }}
                  >
                    <div
                      className={`h-7 w-7 rounded-full absolute -translate-y-0.5 transition-all duration-300 ${isSelected
                        ? 'bg-[color:var(--color-primary)]/20 animate-ping'
                        : 'bg-[color:var(--color-on-surface)]/[0.05] group-hover/node:bg-[color:var(--color-primary)]/10 scale-90'
                        }`}
                    />

                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 relative z-10 ${isSelected
                        ? 'bg-[color:var(--color-primary)] border-[color:var(--color-surface)] scale-110 shadow-[0_0_10px_rgba(255,215,0,0.8)]'
                        : 'bg-[color:var(--color-surface-container)] border-[color:var(--color-outline)] group-hover/node:border-[color:var(--color-primary)]'
                        }`}
                    />

                    <span className="mt-1.5 px-2 py-0.5 rounded bg-[color:var(--color-surface-container-highest)] border border-[color:var(--color-outline-variant)]/30 text-[9px] font-bold text-[color:var(--color-on-surface-variant)] group-hover/node:text-[color:var(--color-on-surface)] transition-colors pointer-events-none whitespace-nowrap shadow">
                      {node.display}
                    </span>
                  </div>
                );
              })}

              {/* Bouncing Map Pin Drop Indicator */}
              {markerPos && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-[85%] z-20 pointer-events-none transition-all duration-300 ease-out"
                  style={{ left: markerPos.x, top: markerPos.y }}
                >
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)] flex items-center justify-center shadow-lg shadow-[color:var(--color-primary)]/25 animate-bounce">
                      <MapPin className="h-4.5 w-4.5 text-[color:var(--color-primary)] fill-[color:var(--color-primary)]/20" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4.5 bg-[color:var(--color-surface-dim)]/50 border-t border-[color:var(--color-outline-variant)]/20 flex items-center justify-between">
              <div className="text-xs text-[color:var(--color-on-surface-variant)] flex flex-col gap-0.5">
                <div>
                  Selected: <span className="font-extrabold text-[color:var(--color-primary)] text-sm">{tempSelectedCity || 'None'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[color:var(--color-outline-variant)]/30 text-[color:var(--color-on-surface)] hover:bg-[color:var(--color-on-surface)]/[0.05] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLocation}
                  disabled={!tempSelectedCity}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Location Permission Request Banner */}
      {mounted && status === 'idle' && !dismissed && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-[100] animate-fade-up">
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container-high)] shadow-2xl border border-[color:var(--color-primary)]/20 relative overflow-hidden">
            {/* Ambient background light */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 65%)' }} />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center text-[color:var(--color-primary)]">
                    <MapPin size={16} className="animate-bounce" />
                  </div>
                  <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[color:var(--color-on-surface)]">Enable Location</h4>
                </div>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 hover:bg-[color:var(--color-on-surface)]/[0.05] rounded-full text-[color:var(--color-outline)] hover:text-[color:var(--color-primary)] transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-[11px] text-[color:var(--color-on-surface-variant)] leading-relaxed">
                Discover medical clinics, fitness coaches, and styling salons nearest to you. We request access to your device's GPS location.
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={detectGPSLocation}
                  className="flex-1 bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-md shadow-[color:var(--color-primary)]/15 cursor-pointer text-center"
                >
                  Allow Access
                </button>
                <button
                  onClick={() => { setShowMapModal(true); setDismissed(true); }}
                  className="flex-1 border border-[color:var(--color-outline-variant)]/30 hover:bg-[color:var(--color-on-surface)]/[0.05] text-[color:var(--color-on-surface)] py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Choose Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <UtilityDrawer isOpen={utilityDrawerOpen} onClose={() => setUtilityDrawerOpen(false)} activeTab={activeUtilityTab} setActiveTab={setActiveUtilityTab} />
      <LocationSelectorModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </>
  );
}

