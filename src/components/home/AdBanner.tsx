'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_ADS } from '../../lib/homeData';

export function AdBanner() {
  const [adIndex, setAdIndex] = useState(0);

  // Advertisement auto-play rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % MOCK_ADS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentAd = MOCK_ADS[adIndex];

  return (
    <section
      id="ad-banner-hero"
      data-ad-slot=""
      aria-label="Featured Experiences"
      className="ad-block mb-8 w-full relative overflow-hidden rounded-[28px] md:rounded-[36px] shadow-2xl border border-[color:var(--color-outline-variant)]/25 bg-[color:var(--color-surface-container)] group"
    >
      {/* Ambient glow behind banner */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#0a3161]/30 via-transparent to-[#ff6325]/20 blur-xl opacity-75 pointer-events-none -z-10" />

      <div className="w-full h-[240px] sm:h-[300px] md:h-[360px] lg:h-[390px] relative flex items-center justify-center overflow-hidden">
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
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-1000 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
              </div>

              {/* Floating Top Pill Badges */}
              <div className="absolute top-5 left-5 md:top-8 md:left-8 z-30 flex items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 bg-white/10 text-white shadow-lg flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  FEATURED SPOTLIGHT
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border ${ad.tagBg || 'bg-white/10 text-white border-white/20'} shadow-md`}>
                  {ad.tag}
                </span>
              </div>

              {/* Ad Content */}
              <div className="absolute inset-0 z-20 p-6 md:p-10 lg:p-12 flex flex-col justify-end text-left max-w-3xl">
                <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight leading-[1.1] drop-shadow-md">
                  {ad.title}
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-slate-200/90 font-medium mb-6 line-clamp-2 leading-relaxed drop-shadow-sm max-w-2xl">
                  {ad.desc}
                </p>

                <div className="flex items-center gap-3.5 flex-wrap">
                  <Link
                    href={ad.href}
                    className="px-7 py-3 rounded-full text-xs md:text-sm font-black tracking-wider bg-gradient-to-r from-[#ff6325] to-[#ea580c] hover:brightness-110 text-white transition-all shadow-[0_8px_24px_rgba(255,99,37,0.45)] hover:shadow-[0_12px_28px_rgba(255,99,37,0.6)] active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{ad.actionText.toUpperCase()}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="px-6 py-3 rounded-full text-xs md:text-sm font-bold backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all active:scale-95 cursor-pointer"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition-all z-30 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl cursor-pointer"
          aria-label="Previous Slide"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <button
          onClick={() => setAdIndex((prev) => (prev + 1) % MOCK_ADS.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition-all z-30 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl cursor-pointer"
          aria-label="Next Slide"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>

        {/* Floating Slide Counter Pill */}
        <div className="absolute top-5 right-5 md:top-8 md:right-8 z-30 backdrop-blur-md bg-black/40 border border-white/20 px-3 py-1 rounded-full text-white text-[10px] md:text-[11px] font-black tracking-widest">
          0{adIndex + 1} / 0{MOCK_ADS.length}
        </div>
      </div>

      {/* Modern Segmented Progress Bar Indicator */}
      <div className="absolute bottom-5 left-0 w-full flex items-center justify-center gap-2 z-30 px-6">
        {MOCK_ADS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setAdIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
              adIndex === idx
                ? 'w-10 bg-gradient-to-r from-[#ff6325] to-amber-400 shadow-[0_0_12px_rgba(255,99,37,0.8)]'
                : 'w-2.5 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
