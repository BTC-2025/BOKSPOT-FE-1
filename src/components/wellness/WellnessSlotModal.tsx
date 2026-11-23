'use client';

import React from 'react';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';

interface WellnessSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTreatmentsCount: number;
  totalDuration: number;
  todayStr: string;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  isCalOpen: boolean;
  onToggleCal: () => void;
  calMonth: Date;
  onChangeCalMonth: (newDate: Date) => void;
  slotSession: 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING';
  onChangeSlotSession: (session: 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING') => void;
  displayedSlots: { label: string; slotValue: string }[];
  allSlotsCount: number;
  morningSlotsCount: number;
  afternoonSlotsCount: number;
  eveningSlotsCount: number;
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  serviceMode: 'IN_SALON' | 'HOME_VISIT';
  homeMinOrderValue: number;
  homeAddress: string;
  onChangeHomeAddress: (val: string) => void;
  homeLandmark: string;
  onChangeHomeLandmark: (val: string) => void;
  homePhone: string;
  onChangeHomePhone: (val: string) => void;
  addressError: boolean;
  stylistName: string;
  grandTotal: number;
  appliedHomeFee: number;
  onConfirm: () => void;
}

export const WellnessSlotModal: React.FC<WellnessSlotModalProps> = ({
  isOpen,
  onClose,
  selectedTreatmentsCount,
  totalDuration,
  todayStr,
  selectedDate,
  onSelectDate,
  isCalOpen,
  onToggleCal,
  calMonth,
  onChangeCalMonth,
  slotSession,
  onChangeSlotSession,
  displayedSlots,
  allSlotsCount,
  morningSlotsCount,
  afternoonSlotsCount,
  eveningSlotsCount,
  selectedSlot,
  onSelectSlot,
  serviceMode,
  homeMinOrderValue,
  homeAddress,
  onChangeHomeAddress,
  homeLandmark,
  onChangeHomeLandmark,
  homePhone,
  onChangeHomePhone,
  addressError,
  stylistName,
  grandTotal,
  appliedHomeFee,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-6 pt-28 sm:pt-28 pb-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Modal Dialog Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0f1624] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col h-auto max-h-[75vh] overflow-hidden my-auto"
      >
        {/* Sticky Header: ALWAYS VISIBLE, NEVER CUTS OFF */}
        <div className="shrink-0 bg-white dark:bg-[#0f1624] px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-black shrink-0">
              <Calendar size={19} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                Select Appointment Date & Slot
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {selectedTreatmentsCount} service{selectedTreatmentsCount > 1 ? 's' : ''} selected • {totalDuration} mins continuous window
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-black text-sm cursor-pointer transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Step 1: Choose Date */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                1. Choose Date
              </label>
              <button
                type="button"
                onClick={onToggleCal}
                className="text-[11px] font-bold text-[#ff6325] hover:underline cursor-pointer"
              >
                Pick Custom Date ▾
              </button>
            </div>

            {/* Quick 4-Day Horizon Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((offset) => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dayNum = String(d.getDate()).padStart(2, '0');
                const dateKey = `${y}-${m}-${dayNum}`;
                const isSelected = dateKey === (selectedDate || todayStr);
                const dayName =
                  offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('default', { weekday: 'short' });
                const monthStr = d.toLocaleDateString('default', { month: 'short' });

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => onSelectDate(dateKey)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-md font-black'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] block opacity-80 uppercase tracking-wider">{dayName}</span>
                    <span className="text-xs sm:text-sm font-black block mt-0.5">
                      {dayNum} {monthStr}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Calendar Popover */}
            {isCalOpen && (
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-white/10 animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {calMonth.toLocaleString('default', { month: 'long' })} {calMonth.getFullYear()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newD = new Date(calMonth);
                        newD.setMonth(newD.getMonth() - 1);
                        onChangeCalMonth(newD);
                      }}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newD = new Date(calMonth);
                        newD.setMonth(newD.getMonth() + 1);
                        onChangeCalMonth(newD);
                      }}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {(() => {
                    const year = calMonth.getFullYear();
                    const month = calMonth.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const totalDays = new Date(year, month + 1, 0).getDate();

                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-7 w-7" />);
                    }

                    for (let day = 1; day <= totalDays; day++) {
                      const mStr = String(month + 1).padStart(2, '0');
                      const dStr = String(day).padStart(2, '0');
                      const dateStr = `${year}-${mStr}-${dStr}`;
                      const isSelected = dateStr === (selectedDate || todayStr);
                      const isPast = dateStr < todayStr;

                      cells.push(
                        <button
                          key={`day-${day}`}
                          type="button"
                          disabled={isPast}
                          onClick={() => {
                            onSelectDate(dateStr);
                            onToggleCal();
                          }}
                          className={`h-7 w-7 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#ff6325] text-white shadow-xs font-black'
                              : isPast
                              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                              : 'hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
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
            )}
          </div>

          {/* Step 2: Time Slot Windows with Session Filter */}
          <div>
            <div className="space-y-2 mb-2.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                2. Choose Time Slot ({totalDuration} mins window)
              </label>

              {/* Session Filter Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'ALL', label: `All (${allSlotsCount})` },
                  { id: 'MORNING', label: `🌅 Morning (${morningSlotsCount})` },
                  { id: 'AFTERNOON', label: `☀️ Afternoon (${afternoonSlotsCount})` },
                  { id: 'EVENING', label: `🌆 Evening (${eveningSlotsCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChangeSlotSession(tab.id as any)}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      slotSession === tab.id
                        ? 'bg-[#ff6325] text-white shadow-xs font-black'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
              {displayedSlots.map((slot) => {
                const isSelected = selectedSlot === slot.slotValue;
                return (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => onSelectSlot(slot.slotValue)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-md ring-2 ring-[#ff6325]/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-900 dark:text-white'
                    }`}
                  >
                    <span className="text-xs font-black block tracking-tight">{slot.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                      {serviceMode === 'HOME_VISIT' ? 'Doorstep Visit' : 'Instant Chair'}
                    </span>
                  </button>
                );
              })}
            </div>

            {displayedSlots.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No slots available for this session. Please pick another session.
              </p>
            )}
          </div>

          {/* Step 3: If Home Visit Mode ➔ Doorstep Address Input */}
          {serviceMode === 'HOME_VISIT' && (
            <div
              className={`p-4 rounded-2xl space-y-3 transition-all ${
                addressError && !homeAddress.trim()
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-500'
                  : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#ff6325] shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Doorstep Visit Address <span className="text-rose-500">*</span>
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Min Order: <strong className="text-slate-800 dark:text-slate-200">₹{homeMinOrderValue}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => onChangeHomeAddress(e.target.value)}
                  placeholder="Flat / House No., Building Name *"
                  className={`bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#ff6325] transition-colors ${
                    addressError && !homeAddress.trim()
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200 dark:border-white/15'
                  }`}
                />
                <input
                  type="text"
                  value={homeLandmark}
                  onChange={(e) => onChangeHomeLandmark(e.target.value)}
                  placeholder="Street, Landmark *"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#ff6325] transition-colors"
                />
                <input
                  type="tel"
                  value={homePhone}
                  onChange={(e) => onChangeHomePhone(e.target.value)}
                  placeholder="Contact Mobile Number *"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#ff6325] transition-colors"
                />
              </div>

              {addressError && !homeAddress.trim() && (
                <p className="text-[11px] font-bold text-rose-600">
                  Please enter your House / Flat Address to proceed.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Professional Assignment Badge */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚡</span>
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white">{stylistName}</h5>
                <p className="text-[10px] text-slate-400">Guaranteed instant slot • Zero waiting time</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold">
              ✓ Assigned
            </span>
          </div>
        </div>

        {/* Sticky Footer: ALWAYS VISIBLE AT BOTTOM */}
        <div className="shrink-0 bg-white dark:bg-[#0f1624] border-t border-slate-100 dark:border-white/10 px-5 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg z-10">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">TOTAL PAYABLE</span>
            <span className="text-xl font-black text-[#ff6325]">₹{grandTotal.toLocaleString()}</span>
            {appliedHomeFee > 0 && (
              <span className="text-[10px] text-slate-400 block font-medium">Includes ₹{appliedHomeFee} doorstep kit fee</span>
            )}
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#ff6325] hover:bg-[#e04e13] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ff6325]/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Confirm & Proceed</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
