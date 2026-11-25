'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';

export function HorizontalQuickShortcuts() {
  const router = useRouter();
  const { activeShortcuts, setShortcutModalOpen, openActionModal } = useShortcutStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prefetch all active shortcut targets for 0ms instant transition
    const userIds = Array.isArray(activeShortcuts) ? activeShortcuts : [];
    userIds.forEach((id) => {
      const shortcut = AVAILABLE_SHORTCUTS.find((s) => s.id === id);
      if (shortcut && shortcut.actionType !== 'modal' && shortcut.actionTarget.startsWith('/')) {
        router.prefetch(shortcut.actionTarget);
      }
    });
  }, [activeShortcuts, router]);

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
          <span className="h-2 w-2 rounded-full bg-[#0A3161]" />
          <span className="text-[11px] font-black tracking-widest text-[#0A3161] dark:text-blue-400 uppercase">
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

          const buttonContent = (
            <>
              <span className="material-symbols-outlined text-[18px] text-[#0A3161] dark:text-blue-400 group-hover:text-[#0A3161] dark:group-hover:text-blue-300 group-active:text-white transition-colors">
                {shortcut.icon}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white group-active:text-white tracking-tight whitespace-nowrap transition-colors">
                {shortcut.label}
              </span>
            </>
          );

          const baseBtnClasses = "group h-11 px-4 rounded-xl md:rounded-2xl border border-black/10 dark:border-white/[0.04] bg-white dark:bg-[#1a2232] hover:bg-[#0A3161]/[0.06] dark:hover:bg-[#0A3161]/30 hover:border-[#0A3161]/50 active:bg-[#0A3161] active:text-white active:border-[#0A3161] active:shadow-[0_4px_16px_rgba(10,49,97,0.3)] text-slate-800 dark:text-white flex items-center gap-2.5 shrink-0 transition-all duration-150 hover:scale-[1.02] active:scale-[0.97] cursor-pointer shadow-xs focus:outline-hidden";

          if (shortcut.actionType === 'modal') {
            return (
              <button
                key={shortcut.id}
                type="button"
                onClick={() => openActionModal(shortcut.actionTarget)}
                className={baseBtnClasses}
              >
                {buttonContent}
              </button>
            );
          }

          return (
            <Link
              key={shortcut.id}
              href={shortcut.actionTarget}
              prefetch={true}
              className={baseBtnClasses}
            >
              {buttonContent}
            </Link>
          );
        })}

        {/* Customize Dock Button */}
        <button
          onClick={() => setShortcutModalOpen(true)}
          className="h-11 px-4 rounded-xl md:rounded-2xl border border-dashed border-[#0A3161]/40 dark:border-blue-500/40 hover:border-[#0A3161] dark:hover:border-blue-400 hover:text-white hover:bg-[#0A3161] dark:hover:bg-blue-600 active:bg-[#08284d] active:text-white active:border-[#08284d] bg-[#0A3161]/[0.05] dark:bg-blue-950/20 text-[#0A3161] dark:text-blue-400 flex items-center gap-2 shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs"
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
