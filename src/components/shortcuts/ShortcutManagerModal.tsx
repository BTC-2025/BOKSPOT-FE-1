'use client';

import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';
import { useEffect, useState } from 'react';

export function ShortcutManagerModal() {
  const { activeShortcuts, shortcutModalOpen, toggleShortcut, setShortcutModalOpen } = useShortcutStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !shortcutModalOpen) return null;

  const currentCount = Array.isArray(activeShortcuts) ? activeShortcuts.length : 0;

  const filtered = AVAILABLE_SHORTCUTS.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 pt-16 sm:pt-20 font-sans animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
        onClick={() => setShortcutModalOpen(false)}
      />
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] z-10">
        
        {/* Simple Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Customize Shortcuts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select 8 shortcuts ({currentCount}/8 selected)
            </p>
          </div>
          <button 
            onClick={() => setShortcutModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-3 pb-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:border-[#ff6325] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Clean 2-column or 1-column list of items */}
        <div className="px-6 py-2 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map(item => {
            const isSelected = Array.isArray(activeShortcuts) ? activeShortcuts.includes(item.id) : false;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (!isSelected && currentCount >= 8) {
                    // Replace oldest item seamlessly so user never gets blocked
                    const updated = [...activeShortcuts.slice(1), item.id];
                    useShortcutStore.setState({ activeShortcuts: updated });
                    return;
                  }
                  toggleShortcut(item.id);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#ff6325]/10 border-[#ff6325] text-[#ff6325] shadow-xs' 
                    : 'bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#ff6325] text-white' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  </div>
                  <span className="text-xs font-semibold truncate">{item.label}</span>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                  isSelected 
                    ? 'border-[#ff6325] bg-[#ff6325] text-white' 
                    : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[11px] font-black">check</span>
                  )}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-full text-center py-6 text-xs text-slate-400">No services found</p>
          )}
        </div>

        {/* Clean minimal footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={() => {
              useShortcutStore.setState({ activeShortcuts: ['buses', 'trains', 'flights', 'hotels', 'movies', 'football-turf', 'dining', 'cabs'] });
            }}
            className="text-xs font-semibold text-slate-500 hover:text-[#ff6325] cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => setShortcutModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-[#ff6325] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
