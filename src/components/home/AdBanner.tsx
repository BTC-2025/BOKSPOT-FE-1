'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_ADS } from '../../lib/homeData';
import { SmartSlotFinder } from './SmartSlotFinder';

export function AdBanner() {
  const [adIndex, setAdIndex] = useState(0);

  // Advertisement auto-play rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % MOCK_ADS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-3 md:pt-3.5 pb-2 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
        
        {/* Left Hero Spotlight Sliding Carousel (~68% on Desktop) */}
        <section
          id="hero-featured-spotlight"
          aria-label="Featured Experiences"
          className="lg:col-span-8 featured-spotlight-carousel w-full relative overflow-hidden rounded-[24px] md:rounded-[28px] shadow-xl border border-[color:var(--color-outline-variant)]/20 bg-black group min-h-[320px] md:min-h-[380px] flex flex-col justify-between"
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

        {/* Right Hero Smart Slot Finder Widget (~32% on Desktop) */}
        <SmartSlotFinder />

      </div>
    </div>
  );
}
