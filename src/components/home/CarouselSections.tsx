'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { RECOMMENDED_ITEMS, EXPLORE_SECTIONS } from '../../lib/homeData';
import { WishlistButton, CartAddButton } from './HomeShared';

export function CarouselSections() {
  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const scrollRecommended = (direction: 'left' | 'right') => {
    if (recommendedScrollRef.current) {
      const { scrollLeft, clientWidth } = recommendedScrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      recommendedScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = 320;
      trendingScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const scrollEvents = (direction: 'left' | 'right') => {
    if (eventsScrollRef.current) {
      const scrollAmount = 320;
      eventsScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Row 4: Recommended Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              </span>
              <h2 className="text-[19px] sm:text-[20px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                Recommended For You
              </h2>
            </div>
            <p className="text-[12px] mt-1 text-[color:var(--color-outline)] font-medium">
              Curated bookings, premium stays, express transit & exclusive events tailored for you
            </p>
          </div>
          <Link 
            href="/search" 
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </Link>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scrollRecommended('left')}
            aria-label="Scroll left"
            className="absolute -left-3.5 top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-[color:var(--color-surface-container)]/95 backdrop-blur-md border border-[color:var(--color-outline-variant)]/40 flex items-center justify-center shadow-xl transition-all text-[color:var(--color-on-surface)] z-20 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[color:var(--color-surface-container-high)]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollRecommended('right')}
            aria-label="Scroll right"
            className="absolute -right-3.5 top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-[color:var(--color-surface-container)]/95 backdrop-blur-md border border-[color:var(--color-outline-variant)]/40 flex items-center justify-center shadow-xl transition-all text-[color:var(--color-on-surface)] z-20 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[color:var(--color-surface-container-high)]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>

          <div
            ref={recommendedScrollRef}
            className="flex gap-4.5 pb-6 pt-1 overflow-x-auto snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1"
          >
            {RECOMMENDED_ITEMS.map((item: any) => (
              <Link
                key={item.id}
                href={item.link}
                className="w-[240px] sm:w-[260px] lg:w-[calc(25%-12px)] shrink-0 group flex flex-col snap-start"
              >
                <div className="relative bg-[color:var(--color-surface)] dark:bg-[color:var(--color-surface-container)] rounded-[22px] overflow-hidden border border-[color:var(--color-outline-variant)]/30 dark:border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.4)] hover:border-[color:var(--color-primary)]/40 transition-all duration-400 flex flex-col h-[300px] hover:-translate-y-1">
                  
                  {/* Image Section */}
                  <div className="relative h-[155px] w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(e: any) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                    />
                    
                    {/* Modern gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25 pointer-events-none" />

                    {/* Category pill - Top Left */}
                    {item.category && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-xl bg-black/55 text-white/95 border border-white/20 shadow-sm flex items-center gap-1">
                          {item.badgeIcon && (
                            <span className="material-symbols-outlined text-[11px] text-amber-300">
                              {item.badgeIcon}
                            </span>
                          )}
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button - Top Right */}
                    <WishlistButton item={item} />

                    {/* Bottom Row on Image: Deal Badge & Price Pill */}
                    <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
                      {/* Deal badge */}
                      {item.badge ? (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-xl shadow-sm border border-white/20 flex items-center gap-1 ${item.badgeBg}`}>
                          {item.badge}
                        </span>
                      ) : <span />}

                      {/* Floating Apple Glass Price Chip */}
                      <div className="flex items-baseline gap-1 px-2.5 py-0.5 rounded-lg backdrop-blur-xl bg-black/75 border border-white/20 text-white shadow-md">
                        <span className="text-[12px] font-black tracking-tight">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-[9px] text-white/60 line-through font-semibold">
                            {item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Content Section */}
                  <div className="p-3 flex-1 flex flex-col justify-between bg-[color:var(--color-surface-container)]">
                    <div>
                      {/* Title */}
                      <h3 className="font-extrabold text-[13px] leading-snug text-[color:var(--color-on-surface)] line-clamp-1 group-hover:text-[color:var(--color-primary)] transition-colors">
                        {item.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-[10px] text-[color:var(--color-outline)] font-medium mt-1">
                        <span className="material-symbols-outlined text-[12px] text-[color:var(--color-primary)] shrink-0">
                          location_on
                        </span>
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>

                    {/* Bottom Metadata & Booking Action */}
                    <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-[color:var(--color-outline-variant)]/20">
                      {/* Rating pill */}
                      <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                          {item.ratingScore}
                        </span>
                        <span className="text-[9px] text-[color:var(--color-outline)] font-medium hidden sm:inline">
                          ({item.usersCount})
                        </span>
                      </div>

                      {/* Book CTA pill */}
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] group-hover:bg-[color:var(--color-primary)] group-hover:text-white transition-all duration-300 font-bold text-[10px] shadow-xs">
                        <span>Book Slot</span>
                        <span className="material-symbols-outlined text-[12px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Row 5: Trending Now — Clean Ambient Open Stage / Spotlight Rail (NO outer box enclosure) */}
      {(() => {
        const sec = EXPLORE_SECTIONS.find(s => s.id === 'trending');
        if (!sec) return null;
        return (
          <section className="mb-10 text-left relative">
            {/* Top Header with Fire Icon and Quick Stats matching Recommended For You */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-orange-500/15 text-orange-500">
                    <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                  </span>
                  <h2 className="text-[19px] sm:text-[20px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                    {sec.title}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                    Live Now
                  </span>
                </div>
                <p className="text-[12px] mt-1 text-[color:var(--color-outline)] font-medium">
                  {sec.description} • Real-time bookings in your city
                </p>
              </div>

              <Link 
                href={sec.href} 
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300"
              >
                <span>View All Trending</span>
                <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </div>

            {/* Seamless Open Track with Floating Arrows */}
            <div className="relative group">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollTrending('left')}
                  aria-label="Scroll left"
                  className="absolute -left-4 top-[45%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-2xl hover:scale-110 hover:border-orange-500/50 transition-all opacity-0 group-hover:opacity-100 text-white"
                >
                  <span className="material-symbols-outlined text-[22px]">chevron_left</span>
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollTrending('right')}
                  aria-label="Scroll right"
                  className="absolute -right-4 top-[45%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-2xl hover:scale-110 hover:border-orange-500/50 transition-all opacity-0 group-hover:opacity-100 text-white"
                >
                  <span className="material-symbols-outlined text-[22px]">chevron_right</span>
                </button>

                <div
                  ref={trendingScrollRef}
                  className="flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1"
                >
                  {sec.items.map((item: any, idx: number) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-[245px] sm:w-[260px] shrink-0 snap-start group flex flex-col"
                    >
                      <div className="relative bg-[color:var(--color-surface)] dark:bg-[#161c2b]/95 rounded-[22px] overflow-hidden border border-[color:var(--color-outline-variant)]/25 dark:border-white/[0.08] hover:border-orange-500/50 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_14px_35px_rgba(249,115,22,0.15)] transition-all duration-400 flex flex-col h-[310px] hover:-translate-y-1">
                        
                        {/* Image Section */}
                        <div className="relative h-[160px] w-full shrink-0 overflow-hidden bg-slate-900">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            onError={(e: any) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />
                          
                          {/* Rank Ribbon Badge (#1, #2, #3) */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/30 flex items-center gap-1">
                              <span>#{idx + 1} Trending</span>
                            </span>
                          </div>

                          {/* Wishlist Button - Top Right */}
                          <WishlistButton item={item} />

                          {/* Image Footer: Category & Price Tag */}
                          <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
                            {item.badge ? (
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 flex items-center gap-1 ${item.badgeBg || 'bg-rose-500 text-white'}`}>
                                {item.badge}
                              </span>
                            ) : <span />}

                            <div className="flex items-baseline gap-0.5 px-2.5 py-0.5 rounded-lg backdrop-blur-xl bg-slate-900/90 border border-orange-500/30 text-white shadow-md">
                              <span className="text-[12px] font-black tracking-tight text-orange-400">{item.price}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Info Body */}
                        <div className="p-3 flex-1 flex flex-col justify-between bg-[color:var(--color-surface)] dark:bg-[#161c2b]">
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <h3 className="font-black text-[13px] leading-snug text-[color:var(--color-on-surface)] dark:text-white line-clamp-1 group-hover:text-orange-500 transition-colors">
                                {item.title}
                              </h3>
                              <div className="flex text-amber-400 shrink-0">
                                {[...Array(item.stars || 5)].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 fill-current" />
                                ))}
                              </div>
                            </div>

                            <p className="text-[11px] text-[color:var(--color-outline)] mt-1 flex items-center gap-1 font-medium truncate">
                              <span className="material-symbols-outlined text-[13px] text-orange-500 shrink-0">location_on</span>
                              <span className="truncate">{item.location}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 mt-1 border-t border-[color:var(--color-outline-variant)]/20 dark:border-white/[0.06]">
                            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                                {item.ratingScore}
                              </span>
                              <span className="text-[9px] text-[color:var(--color-outline)] font-medium">
                                ({item.usersCount})
                              </span>
                            </div>

                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white group-hover:brightness-110 transition-all font-bold text-[10px] shadow-sm">
                              <span>Instant Book</span>
                              <span className="material-symbols-outlined text-[11px] group-hover:translate-x-0.5 transition-transform">
                                bolt
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
          </section>
        );
      })()}

      {/* Row 6: Local Events — Ticket & Pass Grid Style with Cyan/Emerald Theme */}
      {(() => {
        const sec = EXPLORE_SECTIONS.find(s => s.id === 'events');
        if (!sec) return null;
        return (
          <section className="mb-10 text-left">
            {/* Outer Container with Light/Dark Adaptive Mesh */}
            <div className="bg-[color:var(--color-surface-container)] rounded-[28px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(16,185,129,0.06)] border border-[color:var(--color-outline-variant)]/30 backdrop-blur-2xl relative overflow-hidden">
              {/* Ambient Emerald/Cyan Glow Core */}
              <div 
                className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-15 pointer-events-none blur-[100px]"
                style={{ background: 'radial-gradient(circle, #10b981 0%, #06b6d4 60%, transparent 80%)' }}
              />

              {/* Section Header with Standardized Styling */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500">
                    <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[19px] sm:text-[20px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                        {sec.title}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="material-symbols-outlined text-[11px]">calendar_today</span>
                        This Weekend
                      </span>
                    </div>
                    <p className="text-[12px] mt-0.5 text-[color:var(--color-outline)] font-medium">
                      {sec.description}
                    </p>
                  </div>
                </div>

                <Link 
                  href={sec.href} 
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300"
                >
                  <span>All Events</span>
                  <span className="material-symbols-outlined text-[14px] text-[color:var(--color-primary)] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </Link>
              </div>

              {/* Event Ticket Rail */}
              <div className="relative group">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollEvents('left')}
                  aria-label="Scroll left"
                  className="absolute -left-4 top-[45%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-2xl hover:scale-110 hover:border-emerald-500/50 transition-all opacity-0 group-hover:opacity-100 text-white"
                >
                  <span className="material-symbols-outlined text-[22px]">chevron_left</span>
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollEvents('right')}
                  aria-label="Scroll right"
                  className="absolute -right-4 top-[45%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-2xl hover:scale-110 hover:border-emerald-500/50 transition-all opacity-0 group-hover:opacity-100 text-white"
                >
                  <span className="material-symbols-outlined text-[22px]">chevron_right</span>
                </button>

                <div
                  ref={eventsScrollRef}
                  className="flex gap-5 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1"
                >
                  {sec.items.map((item: any) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-[260px] sm:w-[280px] shrink-0 snap-start group flex flex-col"
                    >
                      {/* Ticket Card Architecture with Perforated Look & Pass Entry Pill */}
                      <div className="relative bg-[color:var(--color-surface)] dark:bg-[#101c1c]/90 rounded-[22px] overflow-hidden border border-emerald-500/25 hover:border-emerald-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.15)] transition-all duration-400 flex flex-col h-[320px] hover:-translate-y-1">
                        
                        {/* Wide Image Header */}
                        <div className="relative h-[155px] w-full shrink-0 overflow-hidden bg-slate-950">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            onError={(e: any) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out brightness-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                          <WishlistButton item={item} />
                          
                          {/* Event Category Tag */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              PASS ENTRY
                            </span>
                          </div>

                          {/* Event Badge */}
                          {item.badge && (
                            <div className="absolute bottom-2.5 left-2.5 z-10">
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 flex items-center gap-1 ${item.badgeBg}`}>
                                {item.badge}
                              </span>
                            </div>
                          )}

                          {/* Ticket Price Chip */}
                          <div className="absolute bottom-2.5 right-2.5 z-10 flex items-baseline gap-0.5 px-2.5 py-0.5 rounded-lg backdrop-blur-xl bg-slate-950/90 border border-emerald-500/40 text-emerald-300 shadow-md">
                            <span className="text-[9px] text-slate-400 font-bold">From</span>
                            <span className="text-[12px] font-black tracking-tight">{item.price}</span>
                          </div>
                        </div>

                        {/* Ticket Perforation Dashed Line */}
                        <div className="relative flex items-center justify-between px-3 py-0.5 bg-[color:var(--color-surface)] dark:bg-[#101c1c]">
                          <div className="w-3 h-3 rounded-full bg-[color:var(--color-surface-container)] -ml-4 border-r border-emerald-500/30" />
                          <div className="flex-1 border-b border-dashed border-emerald-500/30 mx-2" />
                          <div className="w-3 h-3 rounded-full bg-[color:var(--color-surface-container)] -mr-4 border-l border-emerald-500/30" />
                        </div>

                        {/* Ticket Lower Half Content */}
                        <div className="p-3 flex-1 flex flex-col justify-between bg-[color:var(--color-surface)] dark:bg-[#101c1c]">
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <h3 className="font-black text-[13px] leading-snug text-[color:var(--color-on-surface)] line-clamp-1 group-hover:text-emerald-500 transition-colors">
                                {item.title}
                              </h3>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                                ⭐ {item.ratingScore}
                              </span>
                            </div>

                            <p className="text-[11px] text-[color:var(--color-outline)] mt-1 flex items-center gap-1 font-medium truncate">
                              <span className="material-symbols-outlined text-[13px] text-emerald-500 shrink-0">stadium</span>
                              <span className="truncate">{item.location}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 mt-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              <span className="material-symbols-outlined text-[13px]">qr_code_scanner</span>
                              <span>Turnstile Pass</span>
                            </div>

                            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 group-hover:brightness-110 transition-all font-black text-[10px] shadow-sm">
                              <span>Get Pass</span>
                              <span className="material-symbols-outlined text-[12px] group-hover:translate-x-0.5 transition-transform">
                                confirmation_number
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}


    </motion.div>
  );
}
