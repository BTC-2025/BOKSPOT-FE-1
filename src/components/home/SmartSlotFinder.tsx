'use client';

import { useState } from 'react';
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
  
  // Selected Category ID (defaults to 'sports-turf')
  const [selectedCatId, setSelectedCatId] = useState<string>('sports-turf');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  
  // Sub-services belonging to selected category
  const subServices = AVAILABLE_SHORTCUTS.filter(s => s.actionTarget.startsWith(`/${selectedCatId}`) || (selectedCatId === 'stay-accommodation' && s.actionTarget.startsWith('/home/hotels')));
  const fallbackServices = subServices.length > 0 ? subServices : AVAILABLE_SHORTCUTS.slice(0, 5);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(fallbackServices[0]?.id || 'football-turf');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState<boolean>(false);
  
  // Real Date Input (Defaults to today in YYYY-MM-DD format)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  
  // Time Slot (Defaults to Any Time)
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Location / City (Typeable with custom themed dropdown)
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isCitySuggestionsOpen, setIsCitySuggestionsOpen] = useState<boolean>(false);

  // Spot / Venue Name (Optional Search filter)
  const [selectedVenue, setSelectedVenue] = useState<string>('');

  const activeCategory = SUBNAV_CATEGORIES.find(c => c.id === selectedCatId) || SUBNAV_CATEGORIES[3];
  const activeService = AVAILABLE_SHORTCUTS.find(s => s.id === selectedServiceId) || fallbackServices[0];

  const filteredCities = selectedCity.trim() === ''
    ? POPULAR_CITIES
    : POPULAR_CITIES.filter(c => c.toLowerCase().includes(selectedCity.toLowerCase()));

  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
    const newSubList = AVAILABLE_SHORTCUTS.filter(s => s.actionTarget.startsWith(`/${catId}`) || (catId === 'stay-accommodation' && s.actionTarget.startsWith('/home/hotels')));
    if (newSubList.length > 0) {
      setSelectedServiceId(newSubList[0].id);
    }
    setIsCategoryModalOpen(false);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const targetUrl = activeService?.actionTarget || activeCategory.href;
      router.push(`${targetUrl}?date=${selectedDate}&slot=${encodeURIComponent(selectedSlot)}&city=${selectedCity}&venue=${encodeURIComponent(selectedVenue)}`);
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
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6325] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff6325]" />
            </span>
            <h3 className="text-xs md:text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Instant Slot Finder</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#ff6325]/15 text-[#ff6325] uppercase tracking-wider">
                Live
              </span>
            </h3>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="text-[10px] uppercase font-bold tracking-wider text-[#ff6325] hover:text-[#ea580c] transition-colors flex items-center gap-1 cursor-pointer"
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-outline)]">
                Step 1: Category &amp; Service
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {fallbackServices.length} Services
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Category Button */}
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="h-9 px-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] hover:border-[#ff6325]/50 flex items-center justify-between transition-all cursor-pointer group min-w-0"
                title={`${activeCategory.label} - Click to switch category`}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-sm shrink-0">{activeCategory.emoji}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {activeCategory.label}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[15px] text-[#ff6325] shrink-0 ml-1 group-hover:rotate-180 transition-transform">
                  swap_vert
                </span>
              </button>

              {/* Sub-Service Custom Themed Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                  className="w-full h-9 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold hover:border-[#ff6325]/50 flex items-center justify-between transition-all cursor-pointer shadow-xs min-w-0"
                >
                  <span className="truncate">{activeService?.label || 'Select Service'}</span>
                  <span className={`material-symbols-outlined text-[16px] text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180 text-[#ff6325]' : ''}`}>
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
                        {activeCategory.label} Services
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
                                ? 'bg-[#ff6325]/10 text-[#ff6325] font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="truncate">{service.label}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[14px] text-[#ff6325] shrink-0">
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

          {/* Step 2: City & Spot/Venue (100% Conflict-free universal input) */}
          <div>
            <div className="mb-1 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-outline)]">
                Step 2: City &amp; Venue
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* City / Location (Custom Themed Autocomplete Dropdown) */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="City or Area..."
                  value={selectedCity}
                  onFocus={() => setIsCitySuggestionsOpen(true)}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setIsCitySuggestionsOpen(true);
                  }}
                  className="w-full h-9 pl-8.5 pr-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-text shadow-xs placeholder:text-slate-400"
                />
                <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#ff6325]">
                  location_on
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
                                ? 'bg-[#ff6325]/10 text-[#ff6325] font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px] text-[#ff6325] shrink-0">
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
                          <span className="material-symbols-outlined text-[13px] text-[#ff6325]">location_searching</span>
                          <span>Use &ldquo;{selectedCity}&rdquo;</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Spot / Specific Venue Name (Optional) */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Spot / Venue (Optional)"
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="w-full h-9 pl-8.5 pr-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-text shadow-xs placeholder:text-slate-400"
                />
                <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-blue-500">
                  storefront
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Date & Preferred Time Slot (Without Today/Tom buttons) */}
          <div>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-outline)]">
                Step 3: Date &amp; Time
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Custom Themed Calendar Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full h-9 pl-3 pr-8 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold hover:border-[#ff6325]/50 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                >
                  <span>
                    {(() => {
                      const [y, m, d] = selectedDate.split('-');
                      return `${d}-${m}-${y}`;
                    })()}
                  </span>
                  <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] transition-colors ${isCalendarOpen ? 'text-[#ff6325]' : 'text-slate-400'}`}>
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
                                    ? 'bg-[#ff6325] text-white shadow-xs'
                                    : isPast
                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-[#ff6325]/15 hover:text-[#ff6325]'
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
                          className="text-[#ff6325] hover:underline cursor-pointer"
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

              {/* Time Slot */}
              <div className="relative">
                <select
                  aria-label="Select Preferred Slot"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full h-9 appearance-none pl-3 pr-7 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-pointer shadow-xs truncate"
                >
                  {TIME_SLOTS.map((slot, idx) => (
                    <option key={idx} value={slot} className="bg-white dark:bg-[#121722] text-slate-800 dark:text-white py-1">
                      {slot}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                  schedule
                </span>
              </div>
            </div>
          </div>

          {/* Micro Trust Indicators (Zero empty space, maximum professional look) */}
          <div className="flex items-center justify-between px-1.5 py-1 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-emerald-500">verified</span>
              Instant Confirm
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-blue-500">lock_reset</span>
              Easy Reschedule
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-[#ff6325]">loyalty</span>
              Best Price Guarantee
            </span>
          </div>
        </div>

        {/* CTA Button (Compact & Balanced) */}
        <div className="pt-2 border-t border-[color:var(--color-outline-variant)]/20 shrink-0 flex items-center justify-center">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full sm:w-auto min-w-[210px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff6325] via-[#ea580c] to-[#d94e09] hover:brightness-110 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,99,37,0.35)] transition-all cursor-pointer disabled:opacity-75"
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
                      <span className="text-2xl">{cat.emoji}</span>
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
