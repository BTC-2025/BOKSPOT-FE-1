'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUBNAV_CATEGORIES, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';

const TIME_SLOTS = [
  'Morning (06:00 AM - 09:00 AM)',
  'Day Time (10:00 AM - 01:00 PM)',
  'Afternoon (01:00 PM - 05:00 PM)',
  'Prime Evening (06:00 PM - 09:00 PM)',
  'Night Special (09:00 PM - 12:00 AM)',
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
  
  // Real Date Input (Defaults to today in YYYY-MM-DD format)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  
  // Time Slot
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[3]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const activeCategory = SUBNAV_CATEGORIES.find(c => c.id === selectedCatId) || SUBNAV_CATEGORIES[3];
  const activeService = AVAILABLE_SHORTCUTS.find(s => s.id === selectedServiceId) || fallbackServices[0];

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
      router.push(`${targetUrl}?date=${selectedDate}&slot=${encodeURIComponent(selectedSlot)}`);
    }, 400);
  };

  return (
    <>
      <section
        aria-label="Instant Slot Finder"
        className="lg:col-span-4 rounded-[24px] md:rounded-[28px] border border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#121722]/85 backdrop-blur-2xl p-4 md:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col justify-between relative overflow-hidden"
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

        {/* Form Body */}
        <div className="flex-1 flex flex-col justify-around py-2.5 gap-2.5">
          {/* Step 1: Category & Sub-Booking */}
          <div>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-outline)]">
                Step 1: Category & Service
              </span>
            </div>

            {/* Category Button (Triggers 9 Categories Modal) */}
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] hover:border-[#ff6325]/50 flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{activeCategory.emoji}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {activeCategory.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#ff6325] group-hover:underline shrink-0 ml-1">
                  Change
                </span>
              </button>
            </div>

            {/* Sub-Service Select Dropdown */}
            <div className="relative">
              <select
                aria-label="Select Specific Service"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full appearance-none px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-pointer transition-all shadow-xs pr-8"
              >
                {fallbackServices.map((service) => (
                  <option key={service.id} value={service.id} className="bg-white dark:bg-[#121722] text-slate-800 dark:text-white py-1">
                    {service.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Step 2: Calendar Date Input (No Today/Tomorrow chips) */}
          <div>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-outline)]">
                Step 2: Date
              </span>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Slots Active
              </span>
            </div>
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-pointer shadow-xs"
              />
            </div>
          </div>

          {/* Step 3: Preferred Time Slot */}
          <div>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-outline)]">
                Step 3: Preferred Time Slot
              </span>
            </div>
            <div className="relative">
              <select
                aria-label="Select Preferred Slot"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full appearance-none px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 cursor-pointer shadow-xs pr-8"
              >
                {TIME_SLOTS.map((slot, idx) => (
                  <option key={idx} value={slot} className="bg-white dark:bg-[#121722] text-slate-800 dark:text-white py-1">
                    {slot}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                schedule
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 border-t border-[color:var(--color-outline-variant)]/20 shrink-0 space-y-2">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff6325] via-[#ea580c] to-[#d94e09] hover:brightness-110 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,99,37,0.35)] transition-all cursor-pointer disabled:opacity-75"
          >
            {isSearching ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
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
