'use client';

import { ShieldCheck, Zap, QrCode, Headphones, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustGuarantee() {
  const guarantees = [
    {
      icon: QrCode,
      title: 'Instant QR Confirmation',
      desc: 'Zero waiting queues. Instant digital booking passes delivered straight to WhatsApp & Apple/Google Wallet.',
      color: 'from-blue-500/20 to-indigo-500/20',
      textColor: 'text-blue-500 dark:text-blue-400',
      tag: 'Zero Wait',
    },
    {
      icon: ShieldCheck,
      title: '100% Verified Partners',
      desc: 'Every turf arena, movie screen, clinic, and luxury stay is physically audited and quality-certified.',
      color: 'from-emerald-500/20 to-teal-500/20',
      textColor: 'text-emerald-500 dark:text-emerald-400',
      tag: 'Audited & Safe',
    },
    {
      icon: Zap,
      title: 'Zero Hidden Fees & Instant Refund',
      desc: 'Transparent pricing upfront. Enjoy hassle-free 1-click slot cancellation and instant wallet refunds.',
      color: 'from-amber-500/20 to-orange-500/20',
      textColor: 'text-amber-500 dark:text-amber-400',
      tag: 'Zero Surcharge',
    },
    {
      icon: Headphones,
      title: '24/7 Concierge Support',
      desc: 'Dedicated Tamil & English support specialists ready to assist your bookings, reschedule, and venue access.',
      color: 'from-purple-500/20 to-pink-500/20',
      textColor: 'text-purple-500 dark:text-purple-400',
      tag: 'Round The Clock',
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
      <div className="relative overflow-hidden rounded-[32px] bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/25 p-6 sm:p-8 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        {/* Subtle radial glow */}
        <div
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary), #0a3161)' }}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/20 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-[19px] sm:text-[22px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                Why Book on BOKSPOT
              </h2>
            </div>
            <p className="text-[12px] mt-1 text-[color:var(--color-outline)] font-medium">
              Tamil Nadu&apos;s most reliable super-booking platform with guaranteed slots & instant access
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Slot Guarantee
            </span>
          </div>
        </div>

        {/* Grid of 4 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-5 rounded-[22px] bg-[color:var(--color-surface-container-high)]/60 border border-[color:var(--color-outline-variant)]/30 hover:border-[color:var(--color-primary)]/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Top: Icon + Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-inner border border-white/10`}
                    >
                      <Icon className={`w-5 h-5 ${item.textColor}`} />
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/20 text-[color:var(--color-outline)]">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-extrabold text-[14px] text-[color:var(--color-on-surface)] leading-snug group-hover:text-[color:var(--color-primary)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[color:var(--color-outline)] leading-relaxed mt-1.5 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
