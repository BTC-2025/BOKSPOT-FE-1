'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useWishlistStore, useCartStore } from '../../lib/store';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { RECOMMENDED_ITEMS } from '../../lib/homeData';
import { WishlistButton, CartAddButton } from '../../components/home/HomeShared';

export default function WishlistPage() {
  const items = useWishlistStore(state => state.items);
  const removeItem = useWishlistStore(state => state.removeItem);
  const addItemToCart = useCartStore(state => state.addItem);

  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  const handleMoveToCart = (item: any) => {
    addItemToCart({
      id: item.id,
      title: item.title,
      price: item.price || 0,
      quantity: 1,
      image: item.image,
      icon: item.icon,
      iconColor: item.iconColor
    });
    removeItem(item.id);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-[104px] sm:pt-[110px] pb-24">
      <div className="w-full px-4 md:px-8 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-1">My Wishlist</h1>
            <p className="text-slate-500 font-medium text-sm">{items.length} items saved</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 shadow-sm cursor-pointer">
              <option>Recently Saved</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid Container */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">favorite</span>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Explore Bokspot to find services and experiences you love, and save them here for later.</p>
            <Link href="/" className="inline-flex items-center justify-center bg-[#0056b3] hover:bg-[#004494] text-white font-bold px-6 py-2.5 rounded-full shadow-md transition-all">
              Discover Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="relative bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Link href="/booking" className="absolute inset-0 z-0" aria-label={`Book ${item.title}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${item.iconColor || 'indigo'}-50 text-${item.iconColor || 'indigo'}-500 flex items-center justify-center overflow-hidden`}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">{item.icon || 'star'}</span>
                      )}
                    </div>
                    {item.tag && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="relative z-10 text-slate-300 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-1">
                    {item.description}
                  </p>
                )}
                
                {item.statusTag && (
                  <div className="mb-4 mt-auto">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {item.statusTag}
                    </span>
                  </div>
                )}
                
                <div className={`flex items-end justify-between ${!item.statusTag && !item.description ? 'mt-auto pt-6' : 'mt-auto'}`}>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Starting at</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-800">{formatCurrency(item.price || 0)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleMoveToCart(item)} className="relative z-10 bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-sm px-5 py-2 rounded-full shadow-md active:scale-95 transition-all">
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Items Carousel */}
        <div className="mt-16 mb-8 border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0A3161] tracking-tight">
                Recommended based on your Booking trends
              </h2>
              <p className="text-sm text-slate-500 mt-1">Inspired by the items in your wishlist</p>
            </div>
          </div>

          <div className="relative group">
            {/* Left Arrow */}
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-lg transition-all text-slate-600 z-10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-slate-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Right Arrow */}
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-lg transition-all text-slate-600 z-10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-slate-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div 
              ref={scrollRef}
              className="flex gap-4 pb-6 pt-2 overflow-x-auto snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2"
            >
            {RECOMMENDED_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="w-[280px] lg:w-[calc(20%-12px)] shrink-0 group flex flex-col self-stretch snap-start"
              >
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[340px] overflow-hidden">
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
                  <div className="px-3 pt-2.5 pb-2.5 flex flex-col justify-center bg-white">
                    {/* Line 1: Title */}
                    <h3 className="font-bold text-[13px] text-slate-800 truncate">
                      {item.title}
                    </h3>
                    
                    {/* Line 2: Location */}
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.location}
                    </p>
                    
                    {/* Line 3: Rating & Price */}
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-[11px] font-bold text-slate-700">{item.ratingScore}</span>
                        <span className="text-[10px] text-slate-500">({item.usersCount})</span>
                      </div>
                      <div className="text-[13px] font-extrabold text-[#0A3161]">
                        {item.price}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
