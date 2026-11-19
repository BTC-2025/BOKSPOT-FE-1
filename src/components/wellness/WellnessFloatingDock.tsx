'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface WellnessFloatingDockProps {
  selectedCount: number;
  totalDuration: number;
  grandTotal: number;
  serviceMode: 'IN_SALON' | 'HOME_VISIT';
  onOpenModal: () => void;
}

export const WellnessFloatingDock: React.FC<WellnessFloatingDockProps> = ({
  selectedCount,
  totalDuration,
  grandTotal,
  serviceMode,
  onOpenModal,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="w-full mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-orange-50/50 dark:from-slate-900 dark:via-[#0f1624] dark:to-slate-900 border border-[#ff6325]/30 dark:border-[#ff6325]/20 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 transition-all">
      {/* Left: Summary with Icon */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ff6325] to-[#e04e13] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-[#ff6325]/25">
          ✂️
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {selectedCount} Service{selectedCount > 1 ? 's' : ''} Selected
            </h4>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              ⏱️ {totalDuration} mins
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total:</span>
            <span className="text-base font-black text-[#ff6325]">
              ₹{grandTotal.toLocaleString()}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#ff6325]/10 text-[#ff6325] border border-[#ff6325]/20">
              {serviceMode === 'HOME_VISIT' ? '🏠 Doorstep Visit' : '🏢 In-Salon Chair'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Primary Call to Action */}
      <button
        type="button"
        onClick={onOpenModal}
        className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#ff6325] to-[#e04e13] hover:from-[#e04e13] hover:to-[#c83f08] text-white font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-[#ff6325]/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Select Date & Slot</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
