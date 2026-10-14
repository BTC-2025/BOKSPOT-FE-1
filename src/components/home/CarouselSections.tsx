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
      <section className="mb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight">Recommended For You</h2>
            <p className="text-[11px] mt-0.5 text-[color:var(--color-outline)]">Curated bookings and activities tailored to your profile</p>
          </div>
          <Link href="/search" className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
            View All
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </Link>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scrollRecommended('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/40 flex items-center justify-center shadow-md transition-all text-[color:var(--color-on-surface)] z-10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[color:var(--color-surface-container-high)]"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollRecommended('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/40 flex items-center justify-center shadow-md transition-all text-[color:var(--color-on-surface)] z-10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[color:var(--color-surface-container-high)]"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          <div
            ref={recommendedScrollRef}
            className="flex gap-4 pb-6 pt-2 overflow-x-auto snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1"
          >
            {RECOMMENDED_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="w-[280px] lg:w-[calc(20%-12px)] shrink-0 group flex flex-col self-stretch snap-start"
              >
                <div className="bg-[color:var(--color-surface-container)] rounded-[24px] overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[340px]">
                  {/* Image Section */}
                  <div className="relative flex-1 w-full overflow-hidden rounded-b-[20px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <WishlistButton item={item} />
                    <CartAddButton item={item} />
                    {/* Badge */}
                    {item.badge && (
                      <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[10px]">sell</span>
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Content Section (3 Lines) */}
                  <div className="px-3 pt-2.5 pb-2.5 flex flex-col justify-center bg-[color:var(--color-surface-container)]">
                    {/* Line 1: Title */}
                    <h3 className="font-bold text-[13px] text-[color:var(--color-on-surface)] truncate">
                      {item.title}
                    </h3>

                    {/* Line 2: Location */}
                    <p className="text-[11px] text-[color:var(--color-outline)] truncate mt-0.5">
                      {item.location}
                    </p>

                    {/* Line 3: Rating & Price */}
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-[11px] font-bold text-[color:var(--color-on-surface)]">{item.ratingScore}</span>
                        <span className="text-[10px] text-[color:var(--color-outline)]">({item.usersCount})</span>
                      </div>
                      <div className="text-[13px] font-extrabold text-[color:var(--color-on-surface)]">
                        {item.price}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Row 5: Trending Now (Horizontal scrolling format below Recommended) */}
      {(() => {
        const sec = EXPLORE_SECTIONS.find(s => s.id === 'trending');
        if (!sec) return null;
        return (
          <section className="mb-10 text-left">
            <div className="bg-[color:var(--color-surface-container)] rounded-3xl p-6 shadow-sm border border-[color:var(--color-outline-variant)]/20">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight flex items-center gap-2">
                    <span className="select-none text-xl">{sec.emoji}</span>
                    <span>{sec.title}</span>
                  </h2>
                  <p className="text-[11px] mt-0.5 text-[color:var(--color-outline)]">{sec.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={sec.href} className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
                    View All
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="relative group">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollTrending('left')}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_left</span>
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollTrending('right')}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_right</span>
                </button>

                <div
                  ref={trendingScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {sec.items.map((item: any) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-[280px] shrink-0 snap-start group flex flex-col self-stretch"
                    >
                      <div className="bg-[color:var(--color-surface-container)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                        {/* Image Section */}
                        <div className="relative h-[160px] w-full shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <WishlistButton item={item} />
                          <CartAddButton item={item} />
                          {/* Badge */}
                          {item.badge && (
                            <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                              <span className="material-symbols-outlined text-[10px]">sell</span>
                              {item.badge}
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-3 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-bold text-sm text-[color:var(--color-on-surface)] truncate pr-2">
                              {item.title}
                            </h3>
                            <div className="flex text-yellow-500 shrink-0">
                              {[...Array(item.stars || 4)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>

                          <p className="text-[11px] text-[color:var(--color-outline)] mb-3">{item.location}</p>

                          <div className="flex items-end justify-between mt-auto">
                            <div className="flex items-center gap-1.5">
                              <div className="bg-[#20274d] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                {item.ratingScore}
                              </div>
                              <div className="text-[10px] text-[color:var(--color-on-surface)]">
                                <span className="font-bold">{item.ratingText}</span>
                                <span className="text-[color:var(--color-outline)] mx-1">•</span>
                                <span className="text-[color:var(--color-outline)]">{item.usersCount}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-extrabold text-[color:var(--color-on-surface)]">
                                {item.price}
                              </div>
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

      {/* Row 6: Local Events (Horizontal scrolling format below Trending Now) */}
      {(() => {
        const sec = EXPLORE_SECTIONS.find(s => s.id === 'events');
        if (!sec) return null;
        return (
          <section className="mb-10 text-left">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight flex items-center gap-2">
                  <span className="select-none text-xl">{sec.emoji}</span>
                  <span>{sec.title}</span>
                </h2>
                <p className="text-[11px] mt-0.5 text-[color:var(--color-outline)]">{sec.description}</p>
              </div>
              <Link href={sec.href} className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
                View All
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
            </div>

            <div className="relative group">
              {/* Left Arrow */}
              <button
                onClick={() => scrollEvents('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_left</span>
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => scrollEvents('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_right</span>
              </button>

              <div
                ref={eventsScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {sec.items.map((item: any) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="w-[380px] shrink-0 snap-start group flex flex-col self-stretch"
                  >
                    <div className="bg-[color:var(--color-surface-container)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                      {/* Image Section */}
                      <div className="relative h-[200px] w-full shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <WishlistButton item={item} />
                        <CartAddButton item={item} />
                        {/* Badge */}
                        {item.badge && (
                          <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                            <span className="material-symbols-outlined text-[10px]">sell</span>
                            {item.badge}
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-sm text-[color:var(--color-on-surface)] truncate pr-2">
                            {item.title}
                          </h3>
                          <div className="flex text-yellow-500 shrink-0">
                            {[...Array(item.stars || 4)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>

                        <p className="text-[11px] text-[color:var(--color-outline)] mb-3">{item.location}</p>

                        <div className="flex items-end justify-between mt-auto">
                          <div className="flex items-center gap-1.5">
                            <div className="bg-[#20274d] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              {item.ratingScore}
                            </div>
                            <div className="text-[10px] text-[color:var(--color-on-surface)]">
                              <span className="font-bold">{item.ratingText}</span>
                              <span className="text-[color:var(--color-outline)] mx-1">•</span>
                              <span className="text-[color:var(--color-outline)]">{item.usersCount}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-extrabold text-[color:var(--color-on-surface)]">
                              {item.price}
                            </div>
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


    </motion.div>
  );
}
