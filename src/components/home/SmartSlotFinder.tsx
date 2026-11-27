'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SUBNAV_CATEGORIES, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';

const TIME_SLOTS = [
  'Any Time (All Slots)',
  'Morning (06:00 - 12:00)',
  'Afternoon (12:00 - 17:00)',
  'Evening (17:00 - 21:00)',
  'Night (21:00 - 00:00)',
];

const POPULAR_CITIES = [
  'Near Me / Current Location',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Vellore',
  'Bengaluru',
  'Hyderabad',
  'Kochi',
  'Mumbai',
  'Delhi NCR'
];

export function SmartSlotFinder() {
  const router = useRouter();
  
  // Selected Category ID (defaults to empty so user actively chooses)
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  
  // Sub-services belonging to selected category
  const subServices = selectedCatId
    ? AVAILABLE_SHORTCUTS.filter(s => s.actionTarget.startsWith(`/${selectedCatId}`) || (selectedCatId === 'stay-accommodation' && s.actionTarget.startsWith('/home/hotels')))
    : [];
  const fallbackServices = subServices;

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState<boolean>(false);
  
  // Real Date Input (Defaults to today in YYYY-MM-DD format)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  
  // Time Slot (Defaults to Any Time)
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Dynamic Contextual Inputs for Step 3 & Step 4 across Archetypes
  // 1. Hostel / PG (Tenure & Sharing & Gender)
  const [hostelDurationMonths, setHostelDurationMonths] = useState<number>(3);
  const [hostelSharing, setHostelSharing] = useState<string>('all'); // all, single, 2-sharing, 3-sharing, 4-sharing
  const [hostelDormType, setHostelDormType] = useState<string>('mixed'); // mixed, gents, ladies

  // 2. Hotel / Resorts / Villas / Camping (Nights, Adults, Children, Child Ages, Rooms, Pets)
  const [hotelNights, setHotelNights] = useState<number>(2);
  const [hotelAdults, setHotelAdults] = useState<number>(2);
  const [hotelChildren, setHotelChildren] = useState<number>(0);
  const [hotelChildAges, setHotelChildAges] = useState<number[]>([]);
  const [hotelRooms, setHotelRooms] = useState<number>(1);
  const [hotelPets, setHotelPets] = useState<boolean>(false);
  const [isHotelOccupancyOpen, setIsHotelOccupancyOpen] = useState<boolean>(false);
  const hotelOccupancyRef = useRef<HTMLDivElement>(null);

  // 3. Sports & Turf (Pitch Format & Players)
  const [pitchFormat, setPitchFormat] = useState<string>('5v5'); // 5v5, 7v7, full

  // 3b. Travel & Transit (Passenger count & trip mode)
  const [passengers, setPassengers] = useState<number>(1);

  // 4. Rentals & Equipment (Rental Duration & Gear Type)
  const [rentalDuration, setRentalDuration] = useState<string>('24 Hours (Full Day)');

  // 5. Appointments & Healthcare (Consultation Type / For)
  const [appointmentFor, setAppointmentFor] = useState<string>('Self');

  // 6. Tickets & Events / Darshan (Tickets/Devotees Count)
  const [ticketCount, setTicketCount] = useState<number>(2);

  // Location / City (Typeable with custom themed dropdown)
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isCitySuggestionsOpen, setIsCitySuggestionsOpen] = useState<boolean>(false);
  const cityContainerRef = useRef<HTMLDivElement>(null);
  const serviceContainerRef = useRef<HTMLDivElement>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or blur
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cityContainerRef.current && !cityContainerRef.current.contains(target)) {
        setIsCitySuggestionsOpen(false);
      }
      if (serviceContainerRef.current && !serviceContainerRef.current.contains(target)) {
        setIsServiceDropdownOpen(false);
      }
      if (calendarContainerRef.current && !calendarContainerRef.current.contains(target)) {
        setIsCalendarOpen(false);
      }
      if (hotelOccupancyRef.current && !hotelOccupancyRef.current.contains(target)) {
        setIsHotelOccupancyOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(target)) {
        setIsTimePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Lock background scroll when Category Modal is open
  useEffect(() => {
    if (isCategoryModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCategoryModalOpen]);

  // Spot / Venue Name (Optional Search filter)
  const [selectedVenue, setSelectedVenue] = useState<string>('');

  const activeCategory = selectedCatId ? SUBNAV_CATEGORIES.find(c => c.id === selectedCatId) : null;
  const activeService = selectedServiceId ? AVAILABLE_SHORTCUTS.find(s => s.id === selectedServiceId) : null;

  // Detect Archetypes based on active service / category
  const serviceId = activeService?.id || '';
  const isTravelTransitArchetype = selectedCatId === 'travel-transport' || serviceId === 'buses' || serviceId === 'trains' || serviceId === 'flights' || serviceId === 'cabs' || serviceId === 'ferry' || serviceId === 'shuttle' || serviceId === 'helicopter';
  const isHostelArchetype = serviceId === 'hostels' || serviceId === 'pg-hostels';
  const isHotelStayArchetype = serviceId === 'hotels' || serviceId === 'resorts' || serviceId === 'villas' || serviceId === 'camping';
  const isSportsArchetype = selectedCatId === 'sports-turf' || serviceId.includes('turf') || serviceId.includes('ground') || serviceId.includes('court') || serviceId.includes('swimming') || serviceId.includes('arena');
  const isRentalArchetype = selectedCatId === 'rental-equipment' || serviceId.includes('rental') || serviceId.includes('bike') || serviceId.includes('camera') || serviceId.includes('sound');
  const isAppointmentArchetype = serviceId === 'doctor' || serviceId === 'salons' || serviceId === 'gym-yoga' || serviceId === 'cleaning' || serviceId === 'electrician' || serviceId === 'plumber' || serviceId === 'technician' || serviceId === 'pet-grooming';
  const isTicketsEventsArchetype = selectedCatId === 'entertainment-events' || serviceId === 'movies' || serviceId === 'theatre' || serviceId === 'concerts' || serviceId === 'events' || serviceId === 'darshan' || serviceId === 'pooja' || serviceId === 'pilgrimage';

  // State to track if current archetype even has additional Step 4 requirements
  const hasStep4Requirements = Boolean(activeCategory && (isHostelArchetype || isHotelStayArchetype || isSportsArchetype || isRentalArchetype || isAppointmentArchetype || isTicketsEventsArchetype));

  const filteredCities = selectedCity.trim() === ''
    ? POPULAR_CITIES
    : POPULAR_CITIES.filter(c => c.toLowerCase().includes(selectedCity.toLowerCase()));

  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
    const newSubList = AVAILABLE_SHORTCUTS.filter(s => s.actionTarget.startsWith(`/${catId}`) || (catId === 'stay-accommodation' && s.actionTarget.startsWith('/home/hotels')));
    if (newSubList.length > 0) {
      setSelectedServiceId(newSubList[0].id);
    } else {
      setSelectedServiceId('');
    }
    setIsCategoryModalOpen(false);
  };

  const handleSearch = () => {
    if (!selectedCatId && !selectedServiceId) {
      setIsCategoryModalOpen(true);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const targetUrl = activeService?.actionTarget || activeCategory?.href || '/';
      
      const queryParams = new URLSearchParams();
      queryParams.set('date', selectedDate);
      if (selectedCity) queryParams.set('city', selectedCity);
      if (selectedVenue) queryParams.set('venue', selectedVenue);

      if (isHostelArchetype) {
        queryParams.set('moveIn', selectedDate);
        queryParams.set('durationMonths', String(hostelDurationMonths));
        queryParams.set('sharing', hostelSharing);
        queryParams.set('gender', hostelDormType);
        queryParams.set('dorm', hostelDormType);
      } else if (isTravelTransitArchetype) {
        queryParams.set('passengers', String(passengers));
        queryParams.set('date', selectedDate);
        if (selectedVenue) queryParams.set('destination', selectedVenue);
      } else if (isHotelStayArchetype) {
        queryParams.set('nights', String(hotelNights));
        queryParams.set('adults', String(hotelAdults));
        queryParams.set('children', String(hotelChildren));
        queryParams.set('guests', String(hotelAdults + hotelChildren));
        queryParams.set('rooms', String(hotelRooms));
        if (hotelPets) queryParams.set('pets', 'true');
        if (hotelChildAges.length > 0) queryParams.set('childAges', hotelChildAges.join(','));
      } else if (isSportsArchetype) {
        queryParams.set('slot', selectedSlot);
        queryParams.set('pitchFormat', pitchFormat);
      } else if (isRentalArchetype) {
        queryParams.set('rentalDuration', rentalDuration);
      } else if (isAppointmentArchetype) {
        queryParams.set('slot', selectedSlot);
        queryParams.set('appointmentFor', appointmentFor);
      } else if (isTicketsEventsArchetype) {
        queryParams.set('slot', selectedSlot);
        queryParams.set('tickets', String(ticketCount));
      } else {
        queryParams.set('slot', selectedSlot);
      }

      router.push(`${targetUrl}?${queryParams.toString()}`);
    }, 400);
  };

  return (
    <>
      <section
        aria-label="Instant Slot Finder"
        className="lg:col-span-4 rounded-[24px] md:rounded-[28px] border border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#121722]/85 backdrop-blur-2xl p-4 md:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col justify-between relative z-40"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ff6325]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[color:var(--color-outline-variant)]/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0a3161] motion-safe:animate-pulse shrink-0" />
            <h3 className="text-xs md:text-sm font-bold tracking-tight text-[#0A3161] dark:text-white flex items-center gap-1.5">
              <span>Instant Slot Finder</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-[#0a3161]/15 dark:bg-[#0a3161]/35 text-[#0a3161] dark:text-blue-300 border border-[#0a3161]/25 shadow-xs">
                Live
              </span>
            </h3>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="text-[10px] uppercase font-semibold tracking-wider text-[#0A3161] dark:text-blue-300 hover:text-[#0A3161]/80 hover:brightness-125 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>9 Categories</span>
            <span className="material-symbols-outlined text-[13px]">tune</span>
          </button>
        </div>

        {/* Form Body - Completely Balanced & Meaningful for all 54 bookings */}
        <div className="flex-1 flex flex-col justify-between py-2 gap-2">
          {/* Step 1: Category & Service (Unified Single Line) */}
          <div>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0A3161] dark:text-blue-300">
                Step 1: Category &amp; Service
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {fallbackServices.length} Services
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Category Button */}
              {(() => {
                const icon3DMap: Record<string, string> = {
                  'travel-transport': '/images/user_icons/travel-cabs.png',
                  'stay-accommodation': '/images/user_icons/stay-accommodation.png',
                  'entertainment-events': '/images/user_icons/entertainment.png',
                  'sports-turf': '/images/user_icons/sports-turfs.png',
                  'lifestyle-local': '/images/user_icons/lifestyle-spa.png',
                  'business-professional': '/images/user_icons/coworking-office.png',
                  'religious-government': '/images/user_icons/darshan-pooja.png',
                  'rental-equipment': '/images/user_icons/equipment-rentals-v2.png',
                  'personal-misc': '/images/user_icons/personal-services-v2.png',
                };
                const active3DIcon = selectedCatId ? icon3DMap[selectedCatId] : null;

                return (
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className={`h-9 px-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer group min-w-0 ${
                      activeCategory
                        ? 'border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] hover:border-[#0A3161]/50'
                        : 'border-dashed border-[#0A3161]/40 bg-[#0A3161]/5 hover:bg-[#0A3161]/10 text-[#0A3161] dark:text-blue-300'
                    }`}
                    title={activeCategory ? `${activeCategory.label} - Click to switch category` : 'Choose booking category'}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      {active3DIcon ? (
                        <img 
                          src={active3DIcon} 
                          alt={activeCategory?.label || 'Category'} 
                          className="w-4 h-4 object-contain shrink-0 drop-shadow-xs" 
                        />
                      ) : (
                        <span className="text-sm shrink-0">{activeCategory ? activeCategory.emoji : '🎯'}</span>
                      )}
                      <span className={`text-xs font-semibold truncate ${activeCategory ? 'text-[#0A3161] dark:text-white' : 'text-[#0A3161] dark:text-blue-300'}`}>
                        {activeCategory ? activeCategory.label : 'Select Category'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[15px] text-[#0A3161] dark:text-blue-300 shrink-0 ml-1 group-hover:rotate-180 transition-transform">
                      swap_vert
                    </span>
                  </button>
                );
              })()}

              {/* Sub-Service Custom Themed Dropdown */}
              <div className="relative" ref={serviceContainerRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedCatId) {
                      setIsCategoryModalOpen(true);
                      return;
                    }
                    setIsServiceDropdownOpen(!isServiceDropdownOpen);
                  }}
                  className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer shadow-xs min-w-0 ${
                    activeService
                      ? 'border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white hover:border-[#0A3161]/50'
                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <span className={`truncate text-xs ${activeService ? 'font-semibold text-slate-800 dark:text-white' : 'font-medium text-slate-400'}`}>
                    {activeService ? activeService.label : (selectedCatId ? 'Select Service' : 'Choose Category First')}
                  </span>
                  <span className={`material-symbols-outlined text-[16px] text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180 text-[#0A3161]' : ''}`}>
                    arrow_drop_down
                  </span>
                </button>

                {/* Custom Themed Service Dropdown Menu */}
                {isServiceDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsServiceDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-56 max-h-56 overflow-y-auto z-50 bg-white dark:bg-[#1a202c] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
                      <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {activeCategory ? activeCategory.label : 'Select'} Services
                      </div>
                      {fallbackServices.map((service) => {
                        const isSelected = service.id === selectedServiceId;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              setSelectedServiceId(service.id);
                              setIsServiceDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#0A3161]/10 text-[#0A3161] font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="truncate">{service.label}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[14px] text-[#0A3161] shrink-0">
                                check
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: City & Spot/Venue (Contextual for Transit & Other Verticals) */}
          <div>
            <div className="mb-1 px-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0A3161] dark:text-blue-300">
                {isTravelTransitArchetype ? 'Step 2: Source & Destination Route' : 'Step 2: City & Venue'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* City / Location (Custom Themed Autocomplete Dropdown) */}
              <div className="relative" ref={cityContainerRef}>
                <input
                  type="text"
                  placeholder={isTravelTransitArchetype ? 'From (Source City)...' : 'City or Area...'}
                  value={selectedCity}
                  onFocus={() => setIsCitySuggestionsOpen(true)}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setIsCitySuggestionsOpen(true);
                  }}
                  className="w-full h-9 pl-8.5 pr-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#0A3161] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#0A3161]/30 cursor-text shadow-xs placeholder:text-slate-400"
                />
                <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#0A3161] dark:text-blue-400">
                  {isTravelTransitArchetype ? 'trip_origin' : 'location_on'}
                </span>

                {/* Custom Themed Suggestion Menu */}
                {isCitySuggestionsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsCitySuggestionsOpen(false)} 
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-60 max-h-52 overflow-y-auto z-50 bg-white dark:bg-[#1a202c] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested Cities
                      </div>
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedCity(city);
                              setIsCitySuggestionsOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                              selectedCity === city
                                ? 'bg-[#0A3161]/10 text-[#0A3161] dark:text-blue-400 font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-[#0A3161]/[0.05] dark:hover:bg-blue-950/30'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px] text-[#0A3161] dark:text-blue-400 shrink-0">
                              {city.includes('Near Me') ? 'my_location' : 'near_me'}
                            </span>
                            <span className="truncate">{city}</span>
                          </button>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsCitySuggestionsOpen(false)}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-black/[0.04] flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#0A3161] dark:text-blue-400">location_searching</span>
                          <span>Use &ldquo;{selectedCity}&rdquo;</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Spot / Specific Venue Name or Destination */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={isTravelTransitArchetype ? 'To (Destination City)...' : 'Spot / Venue (Optional)'}
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="w-full h-9 pl-8.5 pr-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#0A3161] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#0A3161]/30 cursor-text shadow-xs placeholder:text-slate-400"
                />
                <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#0A3161] dark:text-blue-400">
                  {isTravelTransitArchetype ? 'location_on' : 'storefront'}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Date & Archetype-Specific Duration/Slot */}
          <div>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0A3161] dark:text-blue-300">
                {isHostelArchetype ? 'Step 3: Move-in Date & Duration' : isHotelStayArchetype ? 'Step 3: Check-in Date & Nights' : isRentalArchetype ? 'Step 3: Pickup Date & Duration' : 'Step 3: Date & Slot'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Custom Themed Calendar Dropdown */}
              <div className="relative" ref={calendarContainerRef}>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full h-9 pl-3 pr-8 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold hover:border-[#0A3161]/50 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                >
                  <span>
                    {(() => {
                      const [y, m, d] = selectedDate.split('-');
                      return `${d}-${m}-${y}`;
                    })()}
                  </span>
                  <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] transition-colors ${isCalendarOpen ? 'text-[#0A3161]' : 'text-slate-400'}`}>
                    calendar_today
                  </span>
                </button>

                {/* Custom Themed Calendar Modal Menu */}
                {isCalendarOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsCalendarOpen(false)} 
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-68 z-[100] bg-white dark:bg-[#121722] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
                      {/* Month & Year Interactive Selectors */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 gap-1.5">
                        <div className="flex items-center gap-1 min-w-0">
                          {/* Month Selector */}
                          <div className="relative">
                            <select
                              value={calendarViewDate.getMonth()}
                              onChange={(e) => {
                                const newMonth = parseInt(e.target.value, 10);
                                setCalendarViewDate(new Date(calendarViewDate.getFullYear(), newMonth, 1));
                              }}
                              className="h-7 px-2 pr-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#ff6325]"
                            >
                              {[
                                'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                              ].map((m, idx) => (
                                <option key={m} value={idx} className="bg-white dark:bg-[#121722] text-slate-800 dark:text-white">
                                  {m}
                                </option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                              expand_more
                            </span>
                          </div>

                          {/* Year Selector */}
                          <div className="relative">
                            <select
                              value={calendarViewDate.getFullYear()}
                              onChange={(e) => {
                                const newYear = parseInt(e.target.value, 10);
                                setCalendarViewDate(new Date(newYear, calendarViewDate.getMonth(), 1));
                              }}
                              className="h-7 px-2 pr-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#ff6325]"
                            >
                              {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                                <option key={y} value={y} className="bg-white dark:bg-[#121722] text-slate-800 dark:text-white">
                                  {y}
                                </option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                              expand_more
                            </span>
                          </div>
                        </div>

                        {/* Prev / Next Arrows */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                            title="Previous Month"
                          >
                            <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                            title="Next Month"
                          >
                            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                          </button>
                        </div>
                      </div>

                      {/* Day of Week Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {(() => {
                          const year = calendarViewDate.getFullYear();
                          const month = calendarViewDate.getMonth();
                          const firstDay = new Date(year, month, 1).getDay();
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const days = [];

                          for (let i = 0; i < firstDay; i++) {
                            days.push(<div key={`empty-${i}`} className="h-6" />);
                          }

                          for (let d = 1; d <= daysInMonth; d++) {
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedDate;
                            const isPast = dateStr < todayStr;

                            days.push(
                              <button
                                key={d}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setIsCalendarOpen(false);
                                }}
                                className={`h-6 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0A3161] text-white shadow-xs'
                                    : isPast
                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-[#0A3161]/15 hover:text-[#0A3161]'
                                }`}
                              >
                                {d}
                              </button>
                            );
                          }
                          return days;
                        })()}
                      </div>

                      {/* Quick Today Jump */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(todayStr);
                            setCalendarViewDate(new Date());
                            setIsCalendarOpen(false);
                          }}
                          className="text-[#0A3161] dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Select Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic Field 2 based on Archetype */}
              {isHostelArchetype ? (
                /* Hostel/PG: Stay Duration (Tenure Months) */
                <div className="relative">
                  <select
                    aria-label="Select Stay Tenure"
                    value={hostelDurationMonths}
                    onChange={(e) => setHostelDurationMonths(Number(e.target.value))}
                    className="w-full h-9 appearance-none pl-3 pr-7 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-pointer shadow-xs truncate"
                  >
                    <option value={1}>1 Month (Flexible)</option>
                    <option value={2}>2 Months (Short-term)</option>
                    <option value={3}>3 Months (Quarterly)</option>
                    <option value={6}>6 Months (Best Value)</option>
                    <option value={11}>11 Months (Annual Agreement)</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                    date_range
                  </span>
                </div>
              ) : isHotelStayArchetype ? (
                /* Hotels/Resorts: Nights Selector */
                <div className="relative">
                  <select
                    aria-label="Select Stay Duration"
                    value={hotelNights}
                    onChange={(e) => setHotelNights(Number(e.target.value))}
                    className="w-full h-9 appearance-none pl-3 pr-7 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-pointer shadow-xs truncate"
                  >
                    <option value={1}>1 Night Stay</option>
                    <option value={2}>2 Nights Stay</option>
                    <option value={3}>3 Nights Stay</option>
                    <option value={4}>4 Nights Stay</option>
                    <option value={5}>5+ Nights Stay</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                    bedtime
                  </span>
                </div>
              ) : isRentalArchetype ? (
                /* Rentals: Duration */
                <div className="relative">
                  <select
                    aria-label="Select Rental Duration"
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className="w-full h-9 appearance-none pl-3 pr-7 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-pointer shadow-xs truncate"
                  >
                    <option value="12 Hours (Half Day)">12 Hours (Half Day)</option>
                    <option value="24 Hours (Full Day)">24 Hours (Full Day)</option>
                    <option value="2 Days (Weekend)">2 Days (Weekend)</option>
                    <option value="3+ Days (Weekly Pass)">3+ Days (Weekly Pass)</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                    timer
                  </span>
                </div>
              ) : (
                /* Themed Interactive Time Popover with Quick Bands + Clock Hour Slots */
                <div className="relative" ref={timePickerRef}>
                  <button
                    type="button"
                    onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                    className="w-full h-9 pl-3 pr-7 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden hover:border-[#0A3161]/50 flex items-center justify-between transition-all cursor-pointer shadow-xs min-w-0"
                  >
                    <span className="truncate">{selectedSlot}</span>
                    <span className={`material-symbols-outlined text-[16px] text-slate-400 shrink-0 transition-transform ${isTimePickerOpen ? 'rotate-180 text-[#0A3161]' : ''}`}>
                      schedule
                    </span>
                  </button>

                  {/* Custom Themed Floating Time Popover */}
                  {isTimePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsTimePickerOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-72 z-[100] bg-white dark:bg-[#121722] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-[#0A3161]">schedule</span>
                            <span>Choose Timing Window</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsTimePickerOpen(false)}
                            className="text-[10px] font-bold text-[#0A3161] hover:underline cursor-pointer"
                          >
                            Done
                          </button>
                        </div>

                        {/* Quick Time Bands (Buses, Trains, Cinema, Darshan) */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block px-0.5">Quick Windows</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { label: 'Any Time (All Slots)', tag: 'All Day' },
                              { label: 'Morning (06:00 - 12:00)', tag: '06:00 - 12:00' },
                              { label: 'Afternoon (12:00 - 17:00)', tag: '12:00 - 17:00' },
                              { label: 'Evening (17:00 - 21:00)', tag: '17:00 - 21:00' },
                              { label: 'Night (21:00 - 00:00)', tag: '21:00 - 00:00' },
                            ].map((slot, idx) => {
                              const isSelected = selectedSlot === slot.label;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSlot(slot.label);
                                    setIsTimePickerOpen(false);
                                  }}
                                  className={`p-1.5 rounded-xl text-left border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#0A3161] text-white border-[#0A3161] shadow-xs'
                                      : 'border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 hover:border-[#0A3161]/40 text-slate-700 dark:text-slate-200'
                                  } ${idx === 0 ? 'col-span-2' : ''}`}
                                >
                                  <span className="text-[11px] font-bold block truncate">{slot.label.split(' (')[0]}</span>
                                  <span className={`text-[9px] block ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{slot.tag}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Specific Hour / Clock Slots (Turf, Appointments, Dining, Studio) */}
                        <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block px-0.5">Exact Hour Slots (Sports / Clinic / Dining)</span>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM',
                              '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
                              '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
                              '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
                            ].map((hr) => {
                              const isSelected = selectedSlot === hr;
                              return (
                                <button
                                  key={hr}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSlot(hr);
                                    setIsTimePickerOpen(false);
                                  }}
                                  className={`py-1 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer border ${
                                    isSelected
                                      ? 'bg-[#0A3161] text-white border-[#0A3161] shadow-xs'
                                      : 'border-transparent hover:border-[#0A3161]/40 bg-black/[0.03] dark:bg-white/[0.04] text-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  {hr}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Contextual Booking Requirements (Consistent Step Header) */}
          {hasStep4Requirements && (
            <div>
              <div className="mb-1 px-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-outline)]">
                  {isHostelArchetype ? 'Step 4: Sharing & Gender' : isHotelStayArchetype ? 'Step 4: Guests & Rooms' : isSportsArchetype ? 'Step 4: Match Format' : isTravelTransitArchetype ? 'Step 4: Passengers' : isRentalArchetype ? 'Step 4: Rental Terms' : 'Step 4: Booking Details'}
                </span>
              </div>
              {isHostelArchetype ? (
                /* Hostel/PG Specs: Room Sharing Type & Gender */
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={hostelSharing}
                      onChange={(e) => setHostelSharing(e.target.value)}
                      className="w-full h-8 appearance-none pl-2.5 pr-6 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325]"
                    >
                      <option value="all">🛏️ Any Sharing</option>
                      <option value="single">🚪 Single Room (Private)</option>
                      <option value="2-sharing">👥 2-Sharing Room</option>
                      <option value="3-sharing">🧑‍🤝‍🧑 3-Sharing Room</option>
                      <option value="4-sharing">🏢 4-Sharing Room</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                      arrow_drop_down
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={hostelDormType}
                      onChange={(e) => setHostelDormType(e.target.value)}
                      className="w-full h-8 appearance-none pl-2.5 pr-6 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325]"
                    >
                      <option value="mixed">👥 Mixed / Co-living</option>
                      <option value="gents">🚹 Gents Only</option>
                      <option value="ladies">🚺 Ladies Only</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                      arrow_drop_down
                    </span>
                  </div>
                </div>
              ) : isTravelTransitArchetype ? (
                /* Travel & Transit: Passengers Counter */
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] flex items-center justify-between col-span-2">
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#ff6325]">person</span>
                      <span>Passengers:</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-slate-900 dark:text-white min-w-6 text-center">{passengers} {passengers > 1 ? 'Passengers' : 'Passenger'}</span>
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.min(6, passengers + 1))}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : isHotelStayArchetype ? (
                /* Hotel/Resort Specs: Ultra-compact 2-Column Bar with Popover */
                <div className="grid grid-cols-2 gap-2" ref={hotelOccupancyRef}>
                  {/* Left: Occupancy Trigger Button (Adults, Children, Rooms) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsHotelOccupancyOpen(!isHotelOccupancyOpen)}
                      className="w-full h-8 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] flex items-center justify-between text-left hover:border-[#ff6325]/50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {hotelAdults} Adults{hotelChildren > 0 ? `, ${hotelChildren} Ch` : ''} • {hotelRooms} Rm
                      </span>
                      <span className={`material-symbols-outlined text-[15px] text-slate-400 shrink-0 transition-transform ${isHotelOccupancyOpen ? 'rotate-180 text-[#ff6325]' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {/* Compact Popover for Detailed Occupancy (Adults, Children, Ages, Rooms) */}
                    {isHotelOccupancyOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsHotelOccupancyOpen(false)} />
                        <div className="absolute left-0 bottom-full mb-1.5 w-64 rounded-2xl bg-white dark:bg-[#121722] border border-black/10 dark:border-white/10 shadow-2xl p-3 z-50 space-y-2.5 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Rooms &amp; Guests</span>
                            <button
                              type="button"
                              onClick={() => setIsHotelOccupancyOpen(false)}
                              className="text-[10px] font-bold text-[#ff6325] hover:underline cursor-pointer"
                            >
                              Done
                            </button>
                          </div>

                          {/* Adults */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold block">Adults</span>
                              <span className="text-[9px] text-slate-400 block">Age 13+ yrs</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setHotelAdults(Math.max(1, hotelAdults - 1))}
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-black min-w-4 text-center">{hotelAdults}</span>
                              <button
                                type="button"
                                onClick={() => setHotelAdults(Math.min(10, hotelAdults + 1))}
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold block">Children</span>
                              <span className="text-[9px] text-slate-400 block">Age 0–12 yrs</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const newCount = Math.max(0, hotelChildren - 1);
                                  setHotelChildren(newCount);
                                  setHotelChildAges(hotelChildAges.slice(0, newCount));
                                }}
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-black min-w-4 text-center">{hotelChildren}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCount = Math.min(6, hotelChildren + 1);
                                  setHotelChildren(newCount);
                                  setHotelChildAges([...hotelChildAges, 5]);
                                }}
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Child Ages if Children > 0 */}
                          {hotelChildren > 0 && (
                            <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] space-y-1.5">
                              <span className="text-[9px] font-bold uppercase text-slate-400 block">Age of Children</span>
                              <div className="grid grid-cols-3 gap-1">
                                {Array.from({ length: hotelChildren }).map((_, i) => (
                                  <select
                                    key={i}
                                    value={hotelChildAges[i] ?? 5}
                                    onChange={(e) => {
                                      const next = [...hotelChildAges];
                                      next[i] = Number(e.target.value);
                                      setHotelChildAges(next);
                                    }}
                                    className="h-6 px-1 text-[10px] rounded bg-white dark:bg-[#1a202c] border border-black/10 dark:border-white/10 font-bold text-center"
                                  >
                                    {Array.from({ length: 13 }).map((_, age) => (
                                      <option key={age} value={age}>
                                        {age === 0 ? '<1 yr' : `${age} yr`}
                                      </option>
                                    ))}
                                  </select>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rooms */}
                          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2">
                            <div>
                              <span className="text-xs font-bold block">Rooms</span>
                              <span className="text-[9px] text-slate-400 block">Number of rooms</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setHotelRooms(Math.max(1, hotelRooms - 1))}
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-black min-w-4 text-center">{hotelRooms}</span>
                              <button
                                type="button"
                                onClick={() => setHotelRooms(Math.min(5, hotelRooms + 1))}
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Traveling with Pets Toggle (Fits in exactly 1 neat row) */}
                  <button
                    type="button"
                    onClick={() => setHotelPets(!hotelPets)}
                    className={`h-8 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      hotelPets
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400 shadow-xs'
                        : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-600 dark:text-slate-300 hover:border-amber-400/40'
                    }`}
                  >
                    <span className="flex items-center gap-1 truncate">
                      <span>🐶</span>
                      <span>Pets {hotelPets ? 'Included' : 'Allowed?'}</span>
                    </span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                      hotelPets ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {hotelPets && '✓'}
                    </span>
                  </button>
                </div>
              ) : isSportsArchetype ? (
                /* Sports & Turf Specs: Pitch Format (5v5, 7v7, Full Ground) */
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: '5v5', label: '5 vs 5' },
                    { id: '7v7', label: '7 vs 7' },
                    { id: 'full', label: 'Full Pitch' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setPitchFormat(fmt.id)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        pitchFormat === fmt.id
                          ? 'bg-[#0A3161] text-white border-[#0A3161] shadow-xs'
                          : 'bg-white dark:bg-[#1a202c] text-slate-700 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-[#0A3161]/40'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              ) : isRentalArchetype ? (
                /* Rental Specs: Quick Deposit / Insurance note */
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Security Deposit:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹0 / ID Proof</span>
                  </div>
                  <div className="h-8 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Delivery:</span>
                    <span className="font-bold text-[#ff6325]">Self Pickup / Hub</span>
                  </div>
                </div>
              ) : isTicketsEventsArchetype ? (
                /* Tickets / Events Specs: Pass/Seat Count */
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] flex items-center justify-between col-span-2">
                    <span className="text-xs text-slate-500 font-semibold">Passes / Devotees:</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-slate-900 dark:text-white min-w-6 text-center">{ticketCount} Person{ticketCount > 1 ? 's' : ''}</span>
                      <button
                        type="button"
                        onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Appointments / Healthcare Specs ONLY: Consultation for Self or Family */
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Self', label: '👤 For Myself' },
                    { id: 'Family', label: '👨‍👩‍👧 For Family / Friend' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAppointmentFor(opt.id)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        appointmentFor === opt.id
                          ? 'bg-[#0A3161] text-white border-[#0A3161] shadow-xs'
                          : 'bg-white dark:bg-[#1a202c] text-slate-700 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-[#0A3161]/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Button (Compact & Balanced) */}
        <div className="pt-2 border-t border-[color:var(--color-outline-variant)]/20 shrink-0 flex items-center justify-center">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full sm:w-auto min-w-[210px] px-6 py-2 rounded-xl bg-[#ff6325] hover:brightness-110 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,99,37,0.35)] transition-all cursor-pointer disabled:opacity-75"
          >
            {isSearching ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin material-symbols-outlined text-[15px]">progress_activity</span>
                <span>Searching Available Slots...</span>
              </span>
            ) : (
              <>
                <span>FIND AVAILABLE SLOTS</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 9 Categories Selection Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 pt-16 sm:pt-20 font-sans animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity cursor-pointer"
            onClick={() => setIsCategoryModalOpen(false)}
          />

          {/* Modal Dialog Card */}
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff6325] text-[20px]">category</span>
                  <span>Select Category (9 Main Verticals)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick a category to discover available slots & specific booking services
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* 3x3 Grid of 9 Umbrella Categories */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {SUBNAV_CATEGORIES.map((cat) => {
                const isSelected = cat.id === selectedCatId;
                const icon3DMap: Record<string, string> = {
                  'travel-transport': '/images/user_icons/travel-cabs.png',
                  'stay-accommodation': '/images/user_icons/stay-accommodation.png',
                  'entertainment-events': '/images/user_icons/entertainment.png',
                  'sports-turf': '/images/user_icons/sports-turfs.png',
                  'lifestyle-local': '/images/user_icons/lifestyle-spa.png',
                  'business-professional': '/images/user_icons/coworking-office.png',
                  'religious-government': '/images/user_icons/darshan-pooja.png',
                  'rental-equipment': '/images/user_icons/equipment-rentals-v2.png',
                  'personal-misc': '/images/user_icons/personal-services-v2.png',
                };
                const icon3d = icon3DMap[cat.id];

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#ff6325] bg-[#ff6325]/10 shadow-sm ring-2 ring-[#ff6325]/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 hover:border-[#ff6325]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {icon3d ? (
                        <img 
                          src={icon3d} 
                          alt={cat.label} 
                          className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" 
                        />
                      ) : (
                        <span className="text-2xl">{cat.emoji}</span>
                      )}
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#ff6325] text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#ff6325]' : 'text-slate-800 dark:text-white group-hover:text-[#ff6325]'}`}>
                        {cat.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Explore slots</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">54+ booking services covered</span>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
