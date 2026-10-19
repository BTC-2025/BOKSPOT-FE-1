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
                className="w-[285px] sm:w-[300px] lg:w-[calc(25%-14px)] shrink-0 group flex flex-col snap-start"
              >
                <div className="relative bg-[color:var(--color-surface-container)] rounded-[24px] overflow-hidden border border-[color:var(--color-outline-variant)]/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] hover:border-[color:var(--color-primary)]/40 transition-all duration-500 flex flex-col h-[360px] hover:-translate-y-1.5">
                  
                  {/* Image Section */}
                  <div className="relative h-[200px] w-full overflow-hidden bg-slate-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(e: any) => {
                        // High-reliability fallback image if any unsplash id fails
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Modern gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                    {/* Category pill - Top Left */}
                    {item.category && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white/95 border border-white/20 shadow-sm flex items-center gap-1">
                          {item.badgeIcon && (
                            <span className="material-symbols-outlined text-[12px] text-amber-300">
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
                    <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
                      {/* Deal badge */}
                      {item.badge ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md border border-white/25 flex items-center gap-1 ${item.badgeBg}`}>
                          {item.badge}
                        </span>
                      ) : <span />}

                      {/* Floating Glass Price Chip */}
                      <div className="flex items-baseline gap-1.5 px-3 py-1 rounded-xl backdrop-blur-md bg-black/80 border border-white/25 text-white shadow-lg">
                        <span className="text-[13px] font-black tracking-tight">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-[10px] text-white/60 line-through font-semibold">
                            {item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Content Section */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-[color:var(--color-surface-container)]">
                    <div>
                      {/* Title */}
                      <h3 className="font-extrabold text-[14px] leading-snug text-[color:var(--color-on-surface)] line-clamp-1 group-hover:text-[color:var(--color-primary)] transition-colors">
                        {item.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-outline)] font-medium mt-1.5">
                        <span className="material-symbols-outlined text-[13px] text-[color:var(--color-primary)] shrink-0">
                          location_on
                        </span>
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>

                    {/* Bottom Metadata & Booking Action */}
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[color:var(--color-outline-variant)]/25">
                      {/* Rating pill */}
                      <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                          {item.ratingScore}
                        </span>
                        <span className="text-[10px] text-[color:var(--color-outline)] font-medium hidden sm:inline">
                          ({item.usersCount})
                        </span>
                      </div>

                      {/* Book CTA pill */}
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] group-hover:bg-[color:var(--color-primary)] group-hover:text-white transition-all duration-300 font-bold text-[11px] shadow-sm">
                        <span>Book Slot</span>
                        <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
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
          <section className="mb-14 text-left relative">
            {/* Top Header with Fire Icon and Quick Stats */}
            <div className="flex items-end justify-between mb-6 pb-3 border-b border-[color:var(--color-outline-variant)]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff6325] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                  <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl font-black text-[color:var(--color-on-surface)] tracking-tight">
                      {sec.title}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                      Live Now
                    </span>
                  </div>
                  <p className="text-[13px] text-[color:var(--color-outline)] font-medium mt-0.5">
                    {sec.description} • Real-time bookings in your city
                  </p>
                </div>
              </div>

              <Link 
                href={sec.href} 
                className="group flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300"
              >
                <span>View All Trending</span>
                <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
                      className="w-[290px] sm:w-[310px] shrink-0 snap-start group flex flex-col"
                    >
                      <div className="relative bg-[#161c2b]/90 rounded-[28px] overflow-hidden border border-white/[0.08] hover:border-orange-500/50 shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_45px_rgba(249,115,22,0.18)] transition-all duration-500 flex flex-col h-[380px] hover:-translate-y-2">
                        
                        {/* Image Section */}
                        <div className="relative h-[215px] w-full shrink-0 overflow-hidden bg-slate-900">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            onError={(e: any) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#161c2b] via-transparent to-black/35 pointer-events-none" />
                          
                          {/* Rank Ribbon Badge (#1, #2, #3) */}
                          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/40 flex items-center gap-1.5">
                              <span>#{idx + 1} Trending</span>
                            </span>
                          </div>

                          {/* Wishlist Button - Top Right */}
                          <WishlistButton item={item} />

                          {/* Image Footer: Category & Price Tag */}
                          <div className="absolute bottom-3 inset-x-3.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
                            {item.badge ? (
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md border border-white/20 flex items-center gap-1 ${item.badgeBg || 'bg-rose-500 text-white'}`}>
                                {item.badge}
                              </span>
                            ) : <span />}

                            <div className="flex items-baseline gap-1 px-3 py-1 rounded-xl backdrop-blur-xl bg-slate-900/90 border border-orange-500/30 text-white shadow-xl">
                              <span className="text-[14px] font-black tracking-tight text-orange-400">{item.price}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Info Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between bg-[#161c2b]">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-black text-[15px] leading-snug text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                                {item.title}
                              </h3>
                              <div className="flex text-amber-400 shrink-0">
                                {[...Array(item.stars || 5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                            </div>

                            <p className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium truncate">
                              <span className="material-symbols-outlined text-[14px] text-orange-400 shrink-0">location_on</span>
                              <span className="truncate">{item.location}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.06]">
                            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] font-black text-amber-400">
                                {item.ratingScore}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({item.usersCount})
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white group-hover:brightness-110 transition-all font-extrabold text-[11px] shadow-md shadow-orange-500/25">
                              <span>Instant Book</span>
                              <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
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
          <section className="mb-12 text-left">
            {/* Outer Container with Dark Emerald Slate Mesh & Ticket Cutout Vibes */}
            <div className="bg-gradient-to-br from-[#0c1a1a]/95 via-[#0d161a]/90 to-[#0a1217]/95 rounded-[36px] p-6 sm:p-8 shadow-[0_16px_50px_rgba(16,185,129,0.06)] border border-emerald-500/20 backdrop-blur-2xl relative overflow-hidden">
              {/* Ambient Emerald/Cyan Glow Core */}
              <div 
                className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-20 pointer-events-none blur-[100px]"
                style={{ background: 'radial-gradient(circle, #10b981 0%, #06b6d4 60%, transparent 80%)' }}
              />
              <div 
                className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full opacity-15 pointer-events-none blur-[90px]"
                style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }}
              />

              {/* Section Header with Ticket Pass Styling */}
              <div className="flex items-center justify-between mb-7 relative z-10">
                <div className="flex items-center gap-3.5">
                  <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                    <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {sec.title}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        This Weekend
                      </span>
                    </div>
                    <p className="text-[12px] mt-0.5 text-slate-400 font-medium">
                      {sec.description}
                    </p>
                  </div>
                </div>

                <Link 
                  href={sec.href} 
                  className="group flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-extrabold text-white bg-white/[0.06] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 transition-all duration-300"
                >
                  <span>All Events</span>
                  <span className="material-symbols-outlined text-[15px] text-emerald-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
                      className="w-[310px] sm:w-[335px] shrink-0 snap-start group flex flex-col"
                    >
                      {/* Ticket Card Architecture with Perforated Look & Pass Entry Pill */}
                      <div className="relative bg-[#101c1c]/90 rounded-[28px] overflow-hidden border border-emerald-500/25 hover:border-emerald-400/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)] transition-all duration-500 flex flex-col h-[395px] hover:-translate-y-2">
                        
                        {/* Wide Image Header */}
                        <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-slate-950">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            onError={(e: any) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out brightness-90"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#101c1c] via-transparent to-black/40 pointer-events-none" />
                          <WishlistButton item={item} />
                          
                          {/* Event Category Tag */}
                          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-lg flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              PASS ENTRY
                            </span>
                          </div>

                          {/* Event Badge */}
                          {item.badge && (
                            <div className="absolute bottom-3 left-3.5 z-10">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md border border-white/20 flex items-center gap-1 ${item.badgeBg}`}>
                                {item.badge}
                              </span>
                            </div>
                          )}

                          {/* Ticket Price Chip */}
                          <div className="absolute bottom-3 right-3.5 z-10 flex items-baseline gap-1 px-3 py-1 rounded-xl backdrop-blur-xl bg-slate-950/90 border border-emerald-500/40 text-emerald-300 shadow-xl">
                            <span className="text-[10px] text-slate-400 font-bold">From</span>
                            <span className="text-[14px] font-black tracking-tight">{item.price}</span>
                          </div>
                        </div>

                        {/* Ticket Perforation Dashed Line */}
                        <div className="relative flex items-center justify-between px-3 py-1 bg-[#101c1c]">
                          <div className="w-4 h-4 rounded-full bg-[#0c1a1a] -ml-5 border-r border-emerald-500/20" />
                          <div className="flex-1 border-b border-dashed border-emerald-500/30 mx-2" />
                          <div className="w-4 h-4 rounded-full bg-[#0c1a1a] -mr-5 border-l border-emerald-500/20" />
                        </div>

                        {/* Ticket Lower Half Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between bg-[#101c1c]">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-black text-[15px] leading-snug text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                {item.title}
                              </h3>
                              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                ⭐ {item.ratingScore}
                              </span>
                            </div>

                            <p className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium truncate">
                              <span className="material-symbols-outlined text-[14px] text-emerald-400 shrink-0">stadium</span>
                              <span className="truncate">{item.location}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-1">
                            <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-bold">
                              <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                              <span>Scan at Turnstile</span>
                            </div>

                            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 group-hover:brightness-110 transition-all font-black text-[11px] shadow-lg shadow-emerald-500/25">
                              <span>Get Pass</span>
                              <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
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
