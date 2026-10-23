'use client';

import Link from 'next/link';
import { Star, BadgeCheck, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function VerifiedPartners() {
  const partners = [
    {
      id: 'vp-1',
      name: 'Zenith Sports & Football Turf',
      category: 'FIFA 2-Star Turf',
      city: 'OMR Corridor, Chennai',
      rating: '4.9',
      reviews: '1.2k bookings',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
      tag: 'Floodlight Slot',
      perks: 'Free Parking • Locker Room • Water Bar',
      startingPrice: '₹1,200/hr',
      link: '/sports-turf/play-arena',
      goldPartner: true,
    },
    {
      id: 'vp-2',
      name: 'PVR INOX Laser IMAX Screens',
      category: 'Luxury Cinema Audi',
      city: 'Phoenix Marketcity, Velachery',
      rating: '4.9',
      reviews: '8.4k reservations',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
      tag: '4K Dual Laser',
      perks: 'Recliner Loungers • Gourmet Bites • Dolby Atmos',
      startingPrice: '₹480',
      link: '/entertainment-events/movies',
      goldPartner: true,
    },
    {
      id: 'vp-3',
      name: 'Apollo Premier Medical Center',
      category: 'Certified Hospital Network',
      city: 'Greams Road, Chennai',
      rating: '4.8',
      reviews: '5.1k patients',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      tag: 'NABH Accredited',
      perks: 'Instant Doctor Queue • Digital Lab Reports',
      startingPrice: '₹499',
      link: '/service/1',
      goldPartner: true,
    },
    {
      id: 'vp-4',
      name: 'The Tamara Private Seafront Retreat',
      category: 'Ultra-Luxury Resort',
      city: 'ECR, Kovalam Beach',
      rating: '4.9',
      reviews: '640 guests',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      tag: 'Private Beach',
      perks: 'Infinity Pool • Sunset Dinners • Spa Access',
      startingPrice: '₹5,800/night',
      link: '/home/hotels',
      goldPartner: true,
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
        {/* Subtle Ambient Glow */}
        <div
          className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #f59e0b, #e11d48)' }}
        />

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
                <BadgeCheck className="w-5 h-5" />
              </span>
              <h2 className="text-[19px] sm:text-[21px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                Top Rated Venues & Verified Partners
              </h2>
            </div>
            <p className="text-[12px] mt-1 text-[color:var(--color-outline)] font-medium">
              Physically verified arenas, premier cinemas, and medical networks in Tamil Nadu
            </p>
          </div>

          <Link
            href="/search?q=verified"
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 relative z-10">
          {partners.map((partner) => (
            <Link
              key={partner.id}
              href={partner.link}
              className="group flex flex-col rounded-[20px] bg-[color:var(--color-surface-container-high)]/60 border border-[color:var(--color-outline-variant)]/25 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.1)] hover:border-[color:var(--color-primary)]/40 transition-all duration-400 hover:-translate-y-1"
            >
              {/* Image Section */}
              <div className="relative h-[145px] w-full overflow-hidden bg-slate-800">
                <img
                  src={partner.image}
                  alt={partner.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20 pointer-events-none" />

                {/* Top Badge: Verified Gold Seal */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-amber-500/90 text-black border border-amber-300/40 shadow-sm flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-black" />
                    <span>Verified Gold</span>
                  </span>
                </div>

                {/* Category Pill - Top Right */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white/90 border border-white/20">
                    {partner.category}
                  </span>
                </div>

                {/* Bottom Row on Image */}
                <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-md bg-black/70 text-white/90 border border-white/20">
                    {partner.tag}
                  </span>

                  <div className="flex items-baseline gap-1 px-2 py-0.5 rounded-lg backdrop-blur-md bg-black/80 border border-white/20 text-white shadow-md">
                    <span className="text-[11px] font-black tracking-tight">{partner.startingPrice}</span>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-3 flex-1 flex flex-col justify-between bg-[color:var(--color-surface-container)]">
                <div>
                  <h3 className="font-extrabold text-[13px] leading-snug text-[color:var(--color-on-surface)] line-clamp-1 group-hover:text-[color:var(--color-primary)] transition-colors">
                    {partner.name}
                  </h3>

                  <div className="flex items-center gap-1 text-[10px] text-[color:var(--color-outline)] font-medium mt-1">
                    <MapPin className="w-3 h-3 text-[color:var(--color-primary)] shrink-0" />
                    <span className="truncate">{partner.city}</span>
                  </div>

                  <p className="text-[9px] text-[color:var(--color-outline)]/80 mt-1.5 font-medium line-clamp-1 border-t border-[color:var(--color-outline-variant)]/15 pt-1">
                    {partner.perks}
                  </p>
                </div>

                {/* Bottom Rating & CTA */}
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-[color:var(--color-outline-variant)]/20">
                  <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                      {partner.rating}
                    </span>
                    <span className="text-[9px] text-[color:var(--color-outline)] font-medium hidden sm:inline">
                      ({partner.reviews})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] group-hover:bg-[color:var(--color-primary)] group-hover:text-white transition-all duration-300 font-bold text-[10px] shadow-xs">
                    <span>View Slots</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
