'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { getCombinedConciergePool } from '../../lib/homeData';
import { motion } from 'framer-motion';

export function ConciergeJourneys() {
  const [activeJourneys, setActiveJourneys] = useState<any[]>([]);

  useEffect(() => {
    const combinedPool = getCombinedConciergePool();
    const initial = [
      { id: 'uj-1', ...combinedPool[0 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 35 },
      { id: 'uj-2', ...combinedPool[1 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 70 },
      { id: 'uj-3', ...combinedPool[2 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 120 },
      { id: 'uj-4', ...combinedPool[3 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 180 },
      { id: 'uj-5', ...combinedPool[4 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 260 },
      { id: 'uj-6', ...combinedPool[5 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 320 }
    ];
    setActiveJourneys(initial);
  }, []);

  useEffect(() => {
    if (activeJourneys.length === 0) return;
    const timer = setInterval(() => {
      setActiveJourneys(prev => {
        let remaining = prev.map(j => ({ ...j, secondsLeft: j.secondsLeft - 1 }));
        const departed = remaining.filter(j => j.secondsLeft <= 0);
        remaining = remaining.filter(j => j.secondsLeft > 0);

        if (departed.length > 0) {
          const combinedPool = getCombinedConciergePool();
          departed.forEach(() => {
            const randomSource = combinedPool[Math.floor(Math.random() * combinedPool.length)];
            remaining.push({
              id: 'uj-new-' + Math.random().toString(36).substring(7),
              ...randomSource,
              status: 'CONFIRMED',
              secondsLeft: Math.floor(Math.random() * (400 - 180) + 180)
            });
          });
        }
        return remaining.sort((a, b) => a.secondsLeft - b.secondsLeft);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeJourneys.length]);

  const getActionVerb = (journey: any) => {
    if (journey.actionVerb) return journey.actionVerb;
    const text = `${journey.trainName || ''} ${journey.category || ''} ${journey.destination || ''}`.toLowerCase();
    if (text.includes('flight') || text.includes('indigo') || text.includes('air')) return 'Boarding in';
    if (text.includes('express') || text.includes('train') || text.includes('metro') || text.includes('vande')) return 'Departs in';
    if (text.includes('darshan') || text.includes('temple')) return 'Darshan in';
    if (text.includes('turf') || text.includes('badminton') || text.includes('league') || text.includes('match')) return 'Kickoff in';
    if (text.includes('concert') || text.includes('festival') || text.includes('sunburn')) return 'Gates Open in';
    if (text.includes('screening') || text.includes('movie') || text.includes('imax')) return 'Starts in';
    if (text.includes('dine') || text.includes('table')) return 'Reserved in';
    return 'Starts in';
  };

  const formatSecondsLeft = (journey: any) => {
    const seconds = journey.secondsLeft;
    const verb = getActionVerb(journey);
    if (seconds <= 0) return `${verb.replace(' in', '')} now`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${verb} ${m}m ${s}s`;
    }
    return `${verb} ${s}s`;
  };

  const getCategoryLabel = (journey: any) => {
    if (journey.category) return journey.category;
    const text = `${journey.trainName || ''} ${journey.destination || ''}`.toLowerCase();
    if (text.includes('flight') || text.includes('indigo')) return 'Flight';
    if (text.includes('vande') || text.includes('train')) return 'Express Rail';
    if (text.includes('metro')) return 'Metro Transit';
    if (text.includes('darshan') || text.includes('temple')) return 'Darshan';
    if (text.includes('badminton')) return 'Sports League';
    if (text.includes('turf') || text.includes('screening')) return 'Live Screening';
    if (text.includes('concert') || text.includes('sunburn')) return 'Live Concert';
    if (text.includes('dine') || text.includes('table')) return 'Fine Dining';
    if (text.includes('yoga')) return 'Wellness';
    return 'Concierge';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Upcoming Concierge Journeys & Events Section */}
      <section className="mb-12 text-left">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-500 shadow-sm">
                <Compass size={18} className="animate-spin-slow" />
              </span>
              <h2 className="text-[19px] sm:text-[21px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                Upcoming Concierge Journeys & Events
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Feed
              </span>
            </div>
            <p className="text-[12px] mt-1 text-[color:var(--color-outline)] font-medium">
              Real-time countdown to transit departures, match kickoffs, temple entries & VIP passes
            </p>
          </div>
          <Link
            href="/tracks"
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 transition-all duration-300"
          >
            <span>Live Board</span>
            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </Link>
        </div>

        {/* Ticker Container with Frosted Glass Borders */}
        <div className="relative group overflow-hidden w-full p-2.5 rounded-[32px] bg-[color:var(--color-surface-container)]/70 border border-[color:var(--color-outline-variant)]/25 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Subtle ambient glow */}
          <div 
            className="absolute -left-10 -top-10 w-64 h-64 rounded-full opacity-10 pointer-events-none blur-3xl"
            style={{ background: 'radial-gradient(circle, #38bdf8, #818cf8)' }}
          />

          <div className="flex gap-4 overflow-visible py-2 animate-marquee relative z-10">
            {[...activeJourneys, ...activeJourneys, ...activeJourneys].map((journey, index) => (
              <Link
                href={journey.link || '/tracks'}
                key={`${journey.id}-${index}`}
                className="w-[235px] shrink-0 group/card flex flex-col rounded-[22px] bg-[color:var(--color-surface-container-high)]/70 hover:bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 hover:border-[color:var(--color-primary)]/40 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
              >
                {/* Image & Header */}
                <div className="relative h-[115px] w-full overflow-hidden bg-slate-800">
                  <img
                    src={journey.image}
                    alt={journey.trainName}
                    loading="lazy"
                    onError={(e: any) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Category Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white/95 border border-white/20 shadow-sm flex items-center gap-1">
                      <span>{journey.icon}</span>
                      <span>{getCategoryLabel(journey)}</span>
                    </span>
                  </div>

                  {/* Live Radar Ping */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md bg-black/60 border border-white/20 text-white text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live</span>
                  </div>

                  {/* Price Tag Floating Bottom Right */}
                  {journey.price && (
                    <div className="absolute bottom-2 right-2.5 z-10 px-2.5 py-0.5 rounded-lg backdrop-blur-md bg-black/75 border border-white/20 text-white text-[11px] font-black shadow-md">
                      {journey.price}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-3.5 flex flex-col justify-between flex-1 bg-[color:var(--color-surface-container)]">
                  <div>
                    {/* Title */}
                    <h3 className="font-extrabold text-[13px] leading-snug text-[color:var(--color-on-surface)] line-clamp-1 group-hover/card:text-[color:var(--color-primary)] transition-colors">
                      {journey.trainName}
                    </h3>

                    {/* Source -> Destination */}
                    <p className="text-[11px] text-[color:var(--color-outline)] font-medium mt-1 truncate flex items-center gap-1">
                      <span className="truncate">{journey.source}</span>
                      <span className="text-[color:var(--color-primary)]">➔</span>
                      <span className="truncate">{journey.destination}</span>
                    </p>
                  </div>

                  {/* Countdown Timer Capsule */}
                  <div className="mt-3 pt-2.5 border-t border-[color:var(--color-outline-variant)]/20 flex items-center justify-between gap-2">
                    <div className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>{formatSecondsLeft(journey)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
