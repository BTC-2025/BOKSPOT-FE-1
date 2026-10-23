'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Star, MapPin, Car, Clock, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { WishlistButton } from './HomeShared';

export function WeekendEscapes() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const escapes = [
    {
      id: 'we-1',
      title: 'Heritage French Quarter Villa',
      destination: 'White Town, Pondicherry',
      driveTime: '2.5 hrs drive',
      distance: '150 km via ECR',
      category: 'French Boutique Stay',
      price: '₹4,200',
      originalPrice: '₹5,500',
      rating: '4.9',
      reviews: '1.4k reviews',
      tag: 'Bestseller',
      tagColor: 'bg-emerald-500/90 text-white',
      badgeIcon: 'wb_sunny',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      highlights: 'Private Courtyard • Cyclist Paradise • Promenade 5 mins',
      link: '/home/hotels',
    },
    {
      id: 'we-2',
      title: 'Seafront Infinity Resort & Private Cabana',
      destination: 'Mahabalipuram Coastal Road',
      driveTime: '1 hr drive',
      distance: '55 km via ECR',
      category: 'Beachfront Resort',
      price: '₹5,499',
      originalPrice: '₹6,800',
      rating: '4.8',
      reviews: '920 reviews',
      tag: 'Sea View',
      tagColor: 'bg-sky-500/90 text-white',
      badgeIcon: 'waves',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      highlights: 'Beach Access • Seafood Buffet • Sunset Bar',
      link: '/home/hotels',
    },
    {
      id: 'we-3',
      title: 'Pine Hilltop Cloud Cottage',
      destination: 'Yelagiri Hills, Tamil Nadu',
      driveTime: '3.5 hrs drive',
      distance: '220 km via NH48',
      category: 'Hill Station Retreat',
      price: '₹3,600',
      originalPrice: '₹4,500',
      rating: '4.7',
      reviews: '610 reviews',
      tag: 'Misty Weather',
      tagColor: 'bg-teal-500/90 text-white',
      badgeIcon: 'landscape',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
      highlights: 'Bonfire & BBQ • Mountain View Trek • Bird Watching',
      link: '/home/hotels',
    },
    {
      id: 'we-4',
      title: 'Dutch Heritage Bay Glasshouse',
      destination: 'Sadras Fort Bay, Kalpakkam',
      driveTime: '1.2 hrs drive',
      distance: '68 km via ECR',
      category: 'Private Glasshouse Villa',
      price: '₹6,200',
      originalPrice: '₹7,900',
      rating: '4.9',
      reviews: '480 reviews',
      tag: 'Exclusive 1 Villa',
      tagColor: 'bg-purple-600/90 text-white',
      badgeIcon: 'diamond',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      highlights: 'Private Plunge Pool • Chef on Request • Stargazing Deck',
      link: '/home/hotels',
    },
    {
      id: 'we-5',
      title: 'Nilgiris Heritage Tea Estate Bungalow',
      destination: 'Coonoor & Kotagiri Hills',
      driveTime: 'Scenic Train / Fly to CJB',
      distance: 'Weekend Air/Rail Link',
      category: 'Colonial Tea Bungalow',
      price: '₹7,500',
      originalPrice: '₹9,800',
      rating: '4.9',
      reviews: '850 reviews',
      tag: 'Tea Tasting',
      tagColor: 'bg-amber-600/90 text-white',
      badgeIcon: 'spa',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      highlights: 'Organic Tea Factory Tour • Fireplace • British High Tea',
      link: '/home/hotels',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="mb-12 text-left"
    >
      <div className="relative overflow-hidden rounded-[32px] bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/25 p-5 sm:p-7 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        {/* Ambient Gradient Glow */}
        <div
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #0ea5e9, #6366f1)' }}
        />

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-500 shadow-sm">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </span>
              <h2 className="text-[19px] sm:text-[21px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                Weekend Getaways & Escapes
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                From Chennai
              </span>
            </div>
            <p className="text-[12px] mt-1 text-[color:var(--color-outline)] font-medium">
              Handcrafted road-trips, coastal beachfront villas & misty hill retreats under 4 hours
            </p>
          </div>

          <Link
            href="/stay-accommodation/resorts"
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300"
          >
            <span>All Getaways</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute -left-4 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[color:var(--color-surface-container)]/95 backdrop-blur-md border border-[color:var(--color-outline-variant)]/40 flex items-center justify-center shadow-xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100 text-[color:var(--color-on-surface)]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute -right-4 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[color:var(--color-surface-container)]/95 backdrop-blur-md border border-[color:var(--color-outline-variant)]/40 flex items-center justify-center shadow-xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100 text-[color:var(--color-on-surface)]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>

          {/* Scrollable Cards Grid */}
          <div
            ref={scrollRef}
            className="flex gap-4.5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1"
          >
            {escapes.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="w-[250px] sm:w-[270px] shrink-0 snap-start group flex flex-col"
              >
                <div className="relative bg-[color:var(--color-surface-container-high)]/60 rounded-[20px] overflow-hidden border border-[color:var(--color-outline-variant)]/25 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.1)] hover:border-[color:var(--color-primary)]/40 transition-all duration-400 flex flex-col h-[310px] hover:-translate-y-1">
                  
                  {/* Image Section */}
                  <div className="relative h-[155px] w-full shrink-0 overflow-hidden bg-slate-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(e: any) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20 pointer-events-none" />

                    {/* Category Pill Top Left */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white/95 border border-white/20 shadow-sm flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        <span>{item.category}</span>
                      </span>
                    </div>

                    {/* Wishlist Button Top Right */}
                    <WishlistButton item={item} />

                    {/* Drive Distance Pill Bottom Left */}
                    <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold backdrop-blur-md bg-black/75 text-white/90 border border-white/20 flex items-center gap-1 shadow-sm">
                        <Car className="w-2.5 h-2.5 text-sky-300" />
                        <span>{item.driveTime}</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>

                    {/* Price Tag Bottom Right */}
                    <div className="absolute bottom-2.5 right-2.5 z-10 flex items-baseline gap-1 px-2.5 py-0.5 rounded-lg backdrop-blur-md bg-black/80 border border-white/20 text-white shadow-md">
                      <span className="text-[12px] font-black tracking-tight">{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-[9px] text-white/60 line-through font-semibold">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Section */}
                  <div className="p-3 flex-1 flex flex-col justify-between bg-[color:var(--color-surface-container)]">
                    <div>
                      {/* Title */}
                      <h3 className="font-extrabold text-[13px] leading-snug text-[color:var(--color-on-surface)] line-clamp-1 group-hover:text-[color:var(--color-primary)] transition-colors">
                        {item.title}
                      </h3>

                      {/* Location & Distance */}
                      <div className="flex items-center gap-1 text-[10px] text-[color:var(--color-outline)] font-medium mt-1">
                        <MapPin className="w-3 h-3 text-[color:var(--color-primary)] shrink-0" />
                        <span className="truncate">{item.destination}</span>
                        <span className="text-[9px] text-[color:var(--color-outline)]/70">({item.distance})</span>
                      </div>

                      {/* Highlights */}
                      <p className="text-[9px] text-[color:var(--color-outline)] font-medium mt-1.5 line-clamp-1 border-t border-[color:var(--color-outline-variant)]/15 pt-1">
                        {item.highlights}
                      </p>
                    </div>

                    {/* Bottom Rating & CTA */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-[color:var(--color-outline-variant)]/20">
                      <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                          {item.rating}
                        </span>
                        <span className="text-[9px] text-[color:var(--color-outline)] font-medium hidden sm:inline">
                          ({item.reviews})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] group-hover:bg-[color:var(--color-primary)] group-hover:text-white transition-all duration-300 font-bold text-[10px] shadow-xs">
                        <span>Book Stay</span>
                        <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
