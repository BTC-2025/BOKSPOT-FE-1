'use client';

import { useShortcutStore, SUBNAV_CATEGORIES } from '../../store/useShortcutStore';
import { useEffect, useState } from 'react';

export function SubnavManagerModal() {
  const { subnavCategories, subnavModalOpen, toggleSubnavCategory, setSubnavModalOpen } = useShortcutStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !subnavModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 pt-16 sm:pt-20">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSubnavModalOpen(false)}></div>
      
      <div className="relative w-full max-w-lg bg-[color:var(--color-surface-container)] rounded-2xl shadow-2xl border border-[color:var(--color-outline)]/10 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-[color:var(--color-outline)]/10 flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-headline-md text-[color:var(--color-on-surface)]">Manage Categories</h2>
            <p className="font-body-md text-[color:var(--color-on-surface-variant)] mt-1">Select categories to display in your navigation bar.</p>
          </div>
          <button 
            onClick={() => setSubnavModalOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[color:var(--color-surface-variant)] transition-colors text-[color:var(--color-outline)] hover:text-[color:var(--color-on-surface)]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-md text-[color:var(--color-primary)] uppercase tracking-widest">{Array.isArray(subnavCategories) ? subnavCategories.length : 0} / 3 Selected</span>
            {Array.isArray(subnavCategories) && subnavCategories.length >= 3 && (
              <span className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider animate-pulse">Max limit of 3 reached</span>
            )}
          </div>
          
          <div className="space-y-2">
            {SUBNAV_CATEGORIES.map(category => {
              const isActive = Array.isArray(subnavCategories) ? subnavCategories.includes(category.id) : false;
              const isMaxReached = Array.isArray(subnavCategories) && subnavCategories.length >= 3;
              const isDisabled = !isActive && isMaxReached;

              return (
                <div 
                  key={category.id}
                  onClick={() => {
                    if (isDisabled) return;
                    toggleSubnavCategory(category.id);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-[color:var(--color-primary)]/10 border-[color:var(--color-primary)] text-[color:var(--color-primary)] cursor-pointer' 
                      : isDisabled
                        ? 'opacity-40 border-[color:var(--color-outline)]/10 bg-[color:var(--color-surface-container-high)] cursor-not-allowed'
                        : 'bg-[color:var(--color-surface-container-high)] border-[color:var(--color-outline)]/10 hover:border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-surface-variant)] text-[color:var(--color-on-surface)] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isActive ? 'bg-[color:var(--color-primary)]/20' : 'bg-[color:var(--color-surface)]'}`}>
                      {category.emoji}
                    </div>
                    <div>
                      <h4 className="font-label-md">{category.label}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isActive ? (
                      <span className="material-symbols-outlined text-[color:var(--color-primary)]">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined opacity-30">add_circle</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-[color:var(--color-outline)]/10 bg-[color:var(--color-surface-container-low)]">
          <button 
            onClick={() => setSubnavModalOpen(false)}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-4 rounded-xl font-label-md hover:opacity-90 transition-colors font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
