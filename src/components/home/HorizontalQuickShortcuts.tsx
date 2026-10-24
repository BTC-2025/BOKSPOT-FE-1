'use client';

import { useEffect, useState } from 'react';
import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';

export function HorizontalQuickShortcuts() {
  const { activeShortcuts, setShortcutModalOpen, openActionModal } = useShortcutStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map directly from activeShortcuts chosen by user
  const userIds = Array.isArray(activeShortcuts) ? activeShortcuts : [];
  const selectedShortcuts = userIds
    .map((id) => AVAILABLE_SHORTCUTS.find((s) => s.id === id))
    .filter(Boolean) as typeof AVAILABLE_SHORTCUTS;

  // Fallback defaults only if store has literally 0 items
  const fallbackShortcuts = AVAILABLE_SHORTCUTS.slice(0, 6);
  const displayShortcuts = mounted && selectedShortcuts.length > 0 
    ? selectedShortcuts 
    : (selectedShortcuts.length > 0 ? selectedShortcuts : fallbackShortcuts);

  return (
    <div className="w-full pt-1 pb-4">
      {/* Top Header Label */}
      <div className="flex items-center justify-between pb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#ff6325]" />
          <span className="text-[11px] font-black tracking-widest text-[color:var(--color-outline)] uppercase">
            QUICK ACTIONS DOCK
          </span>
        </div>
        <span className="text-[11px] text-[color:var(--color-outline)] font-medium">
          Tap any service for instant booking flow
        </span>
      </div>

      {/* Dock Container - Adaptive to Light / Dark Mode */}
      <div className="w-full rounded-[22px] md:rounded-[26px] bg-white/80 dark:bg-[#121722]/90 border border-black/5 dark:border-white/[0.06] p-2.5 md:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-xl backdrop-blur-xl flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        {displayShortcuts.map((shortcut) => {
          if (!shortcut) return null;
          const handleAction = () => {
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
              className="h-11 px-4 rounded-xl md:rounded-2xl bg-white dark:bg-[#1a2232] hover:bg-slate-50 dark:hover:bg-[#222d42] border border-black/10 dark:border-white/[0.04] hover:border-[#ff6325]/40 text-slate-800 dark:text-white flex items-center gap-2.5 shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#ff6325]">
                {shortcut.icon}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight whitespace-nowrap">
                {shortcut.label}
              </span>
            </button>
          );
        })}

        {/* Customize Dock Button */}
        <button
          onClick={() => setShortcutModalOpen(true)}
          className="h-11 px-4 rounded-xl md:rounded-2xl border border-dashed border-[#ff6325]/60 hover:border-[#ff6325] bg-[#ff6325]/[0.05] hover:bg-[#ff6325]/15 text-[#ff6325] flex items-center gap-2 shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span className="text-xs font-extrabold tracking-tight whitespace-nowrap">
            Customize Dock
          </span>
        </button>
      </div>
    </div>
  );
}
