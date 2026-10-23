'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_ADS } from '../../lib/homeData';
import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';

export function AdBanner() {
  const [adIndex, setAdIndex] = useState(0);
  const { activeShortcuts, setShortcutModalOpen, openActionModal } = useShortcutStore();

  // Advertisement auto-play rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % MOCK_ADS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentAd = MOCK_ADS[adIndex];

  // Ensure exactly 8 active user shortcuts (pad from AVAILABLE_SHORTCUTS if user has fewer)
  const userIds = Array.isArray(activeShortcuts) ? activeShortcuts : [];
  const baseList = userIds.map(id => AVAILABLE_SHORTCUTS.find(s => s.id === id)).filter(Boolean) as typeof AVAILABLE_SHORTCUTS;
  const paddingList = AVAILABLE_SHORTCUTS.filter(s => !userIds.includes(s.id));
  const resolvedShortcuts = [...baseList, ...paddingList].slice(0, 8);

  // Palette colors for icons
  const ICON_COLORS = ['#10b981', '#ff6325', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#8b5cf6', '#14b8a6'];

  return (
    <div className="pt-3 md:pt-3.5 pb-5 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
        
        {/* Left Hero Spotlight Sliding Carousel (~68% on Desktop) */}
        <section
          id="hero-featured-spotlight"
          aria-label="Featured Experiences"
          className="lg:col-span-8 featured-spotlight-carousel w-full relative overflow-hidden rounded-[24px] md:rounded-[28px] shadow-xl border border-[color:var(--color-outline-variant)]/20 bg-black group min-h-[300px] md:min-h-[340px] flex flex-col justify-between"
        >
          {/* Ambient glow behind banner */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0a3161]/25 via-transparent to-[#ff6325]/15 blur-lg opacity-60 pointer-events-none -z-10" />

          <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
            {MOCK_ADS.map((ad, idx) => {
              const isActive = adIndex === idx;

              return (
                <div
                  key={ad.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
                  }`}
                >
                  {/* Background Image & Rich Cinematic Vignette */}
                  <div className="absolute inset-0 z-0 overflow-hidden w-full h-full">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-1000 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
                  </div>

                  {/* Floating Top Pill Badges */}
                  <div className="absolute top-4 left-4 md:top-5 md:left-6 z-30 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 bg-white/10 text-white shadow-sm flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      FEATURED SPOTLIGHT
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${ad.tagBg || 'bg-white/10 text-white border-white/20'} shadow-xs`}>
                      {ad.tag}
                    </span>
                  </div>

                  {/* Ad Content */}
                  <div className="absolute inset-0 z-20 p-5 md:p-7 lg:p-8 flex flex-col justify-end text-left max-w-xl pb-7">
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1.5 tracking-tight leading-snug drop-shadow-md">
                      {ad.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200/90 font-medium mb-4 line-clamp-2 leading-relaxed drop-shadow-sm max-w-lg">
                      {ad.desc}
                    </p>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        href={ad.href}
                        className="px-5 py-2 rounded-full text-xs font-black tracking-wider bg-gradient-to-r from-[#ff6325] to-[#ea580c] hover:brightness-110 text-white transition-all shadow-[0_4px_16px_rgba(255,99,37,0.35)] hover:shadow-[0_6px_20px_rgba(255,99,37,0.5)] active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{ad.actionText.toUpperCase()}</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                      <Link
                        href="/categories"
                        className="px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-95 cursor-pointer"
                      >
                        Explore All
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Carousel Arrow Navigation */}
            <button
              onClick={() => setAdIndex((prev) => (prev - 1 + MOCK_ADS.length) % MOCK_ADS.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition-all z-30 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
              aria-label="Previous Slide"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            <button
              onClick={() => setAdIndex((prev) => (prev + 1) % MOCK_ADS.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition-all z-30 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
              aria-label="Next Slide"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>

            {/* Floating Slide Counter Pill */}
            <div className="absolute top-4 right-4 md:top-5 md:right-6 z-30 backdrop-blur-md bg-black/40 border border-white/20 px-2.5 py-0.5 rounded-full text-white text-[9px] font-black tracking-widest">
              0{adIndex + 1} / 0{MOCK_ADS.length}
            </div>
          </div>

          {/* Modern Segmented Progress Bar Indicator */}
          <div className="absolute bottom-3 left-0 w-full flex items-center justify-center gap-1.5 z-30 px-6 pointer-events-auto">
            {MOCK_ADS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setAdIndex(idx)}
                className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
                  adIndex === idx
                    ? 'w-7 bg-gradient-to-r from-[#ff6325] to-amber-400 shadow-[0_0_8px_rgba(255,99,37,0.7)]'
                    : 'w-2 bg-white/35 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Right Hero Quick Access Shortcuts Panel (~32% on Desktop) */}
        <section 
          aria-label="Quick Access Shortcuts"
          className="lg:col-span-4 rounded-[24px] md:rounded-[28px] border border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#121722]/80 backdrop-blur-2xl p-3.5 md:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[color:var(--color-outline-variant)]/20 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff6325] animate-ping" />
              <h3 className="text-xs md:text-sm font-black tracking-tight text-[color:var(--color-on-surface)] flex items-center gap-1">
                Quick Shortcuts
              </h3>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-outline)]">
              Instant Access
            </span>
          </div>

          {/* 2x4 Shortcuts Grid - 8 Compact items filling cleanly */}
          <div className="grid grid-cols-2 grid-rows-4 gap-1.5 flex-1 my-0.5">
            {resolvedShortcuts.map((item: any, idx: number) => {
              const color = ICON_COLORS[idx % ICON_COLORS.length];
              const handleAction = () => {
                if (item.actionType === 'modal') {
                  openActionModal(item.actionTarget);
                } else {
                  window.location.href = item.actionTarget;
                }
              };

              return (
                <button
                  key={item.id || idx}
                  onClick={handleAction}
                  className="group relative px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.09] hover:border-[#ff6325]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between shadow-xs hover:shadow-md text-left cursor-pointer h-full backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                      style={{ backgroundColor: `${color}18`, color: color }}
                    >
                      <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[color:var(--color-on-surface)] group-hover:text-[#ff6325] transition-colors leading-tight truncate">
                      {item.label}
                    </span>
                  </div>

                  <span className="material-symbols-outlined text-[12px] text-[color:var(--color-outline)] group-hover:text-[#ff6325] group-hover:translate-x-0.5 transition-all shrink-0 ml-1">
                    arrow_forward
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-2 pt-2.5 border-t border-[color:var(--color-outline-variant)]/20 flex items-center justify-between text-[11px] font-semibold text-[color:var(--color-outline)] shrink-0">
            <button
              onClick={() => setShortcutModalOpen(true)}
              className="flex items-center gap-1.5 text-[#ff6325] hover:text-[#ea580c] font-bold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Customize Shortcuts</span>
            </button>
            <Link 
              href="/categories" 
              className="hover:text-[color:var(--color-on-surface)] transition-colors flex items-center gap-0.5 text-[11px] font-medium"
            >
              <span>54+ Categories</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
