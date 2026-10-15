'use client';

import React, { useRef } from 'react';
import Link from 'next/link';

export function OffersForYou() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  const offers = [
    {
      id: 1,
      bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      textColor: 'text-white',
      title: 'Flat 80% Off',
      subtitle: 'up to ₹350 on Hotels',
      code: 'IXIWEEKEND',
      isFestival: true
    },
    {
      id: 2,
      bg: 'bg-orange-100',
      textColor: 'text-slate-800',
      bank: 'HDFC BANK',
      title: 'Flat 50% Off',
      subtitle: 'on Hotels with HDFC Bank Mastercard Debit Cards',
    },
    {
      id: 3,
      bg: 'bg-white border border-slate-100 shadow-sm',
      textColor: 'text-slate-800',
      bank: 'HDFC BANK',
      title: 'Flat ₹700 Off',
      subtitle: 'on Domestic Hotels with HDFC Bank Credit Cards + Interest Free EMI',
    },
    {
      id: 4,
      bg: 'bg-red-50',
      textColor: 'text-slate-800',
      bank: 'ICICI Bank',
      title: 'Up to ₹2,500 Off',
      subtitle: 'on Domestic Hotels with ICICI Bank Credit Card EMI',
    },
    {
      id: 5,
      bg: 'bg-blue-50',
      textColor: 'text-slate-800',
      bank: 'kotak',
      title: 'Flat 12% Off',
      subtitle: 'on Domestic Hotels with Kotak Retail Credit Cards + Interest Free EMI',
    }
  ];

  return (
    <section className="mb-10 text-left relative group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight">
          Offers For You
        </h2>
        <Link href="/offers" className="flex items-center gap-1 text-[12px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
          View All
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 mt-2"
      >
        <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_left</span>
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 mt-2"
      >
        <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_right</span>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`w-[280px] lg:w-[220px] xl:w-full xl:flex-1 shrink-0 h-[160px] rounded-2xl p-5 flex flex-col justify-between snap-start relative overflow-hidden cursor-pointer ${offer.bg}`}
          >
            {/* Background Decorations & Icons */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/5 rounded-full blur-xl" />
            <div className="absolute -right-10 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

            {/* Decorative Icon matching the image style */}
            <div className="absolute right-4 bottom-4 opacity-80 pointer-events-none transform rotate-[-15deg] group-hover:scale-110 transition-transform duration-300">
              {offer.id === 1 && <span className="material-symbols-outlined text-[70px] text-white/90 drop-shadow-md">celebration</span>}
              {offer.id === 2 && <span className="material-symbols-outlined text-[70px] text-orange-400 drop-shadow-md">credit_card</span>}
              {offer.id === 3 && <span className="material-symbols-outlined text-[70px] text-red-500 drop-shadow-md">payments</span>}
              {offer.id === 4 && <span className="material-symbols-outlined text-[70px] text-orange-500 drop-shadow-md">account_balance_wallet</span>}
              {offer.id === 5 && <span className="material-symbols-outlined text-[70px] text-blue-500 drop-shadow-md">savings</span>}
            </div>

            {/* Content */}
            <div className="relative z-10 w-2/3">
              {offer.bank && (
                <div className="text-[10px] font-black uppercase tracking-wider mb-2 text-slate-500 bg-white/80 w-max px-2 py-0.5 rounded shadow-sm">
                  {offer.bank}
                </div>
              )}
              {offer.isFestival && (
                <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-1 drop-shadow-sm">
                  FESTIVE SALE
                </div>
              )}
              <h3 className={`text-xl md:text-2xl font-black ${offer.textColor} leading-tight mb-1`}>
                {offer.title}
              </h3>
              <p className={`text-[11px] md:text-xs font-semibold ${offer.textColor} opacity-90 line-clamp-2 leading-snug`}>
                {offer.subtitle}
              </p>
            </div>

            {offer.code && (
              <div className="relative z-10 mt-auto">
                <span className="inline-block px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-lg shadow-sm border border-orange-400">
                  Code: {offer.code}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
