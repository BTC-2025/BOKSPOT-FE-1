'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../../lib/store';
import Link from 'next/link';
import { 
  CheckCircle2, XCircle, Clock, ArrowLeft, MapPin, Calendar, Download, Share2, Check, 
  AlertCircle, Key, Lock, Unlock, CreditCard, ShieldCheck, Ticket, User, Wallet, 
  Sparkles, RefreshCcw, Bus, Hotel, Trophy, ArrowRight, Info
} from 'lucide-react';

// ─── Status colour schemes ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  SPLIT_PENDING: {
    gradient: 'from-indigo-600 via-indigo-500 to-purple-600',
    bgGradient: 'from-indigo-50 via-slate-50 to-purple-100',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    pulseColor: 'bg-indigo-500',
    icon: Clock,
    iconColor: 'text-indigo-600',
    title: 'Group Split in Progress 👥',
    subtitle: 'Share split payment link with your friends to lock in this booking!',
    badge: '👥 Awaiting Friends Payment',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    showPulse: true,
  },
  PENDING: {
    gradient: 'from-[#ff6325] via-[#ff8452] to-[#e04e13]',
    bgGradient: 'from-orange-50 via-slate-50 to-orange-100',
    borderColor: 'border-[#ff6325]/30',
    textColor: 'text-[#ff6325]',
    iconBg: 'bg-[#ff6325]/10',
    pulseColor: 'bg-[#ff6325]',
    icon: Clock,
    iconColor: 'text-[#ff6325]',
    title: 'Payment Confirmed!',
    subtitle: 'Waiting for the venue to accept your booking...',
    badge: '⏳ Awaiting Acceptance',
    badgeColor: 'bg-[#ff6325]/10 text-[#ff6325] border-[#ff6325]/30',
    showPulse: true,
  },
  CONFIRMED: {
    gradient: 'from-emerald-400 via-green-400 to-teal-500',
    bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    pulseColor: 'bg-emerald-400',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    title: 'Booking Confirmed! 🎉',
    subtitle: 'The venue has accepted your booking. You\'re all set!',
    badge: '✅ Order Confirmed',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    showPulse: false,
  },
  CANCELLED: {
    gradient: 'from-red-400 via-rose-400 to-red-500',
    bgGradient: 'from-red-50 via-rose-50 to-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-700',
    iconBg: 'bg-red-100',
    pulseColor: 'bg-red-400',
    icon: XCircle,
    iconColor: 'text-red-500',
    title: 'Booking Cancelled',
    subtitle: 'This booking was cancelled. Your refund will be processed in 3-5 business days.',
    badge: '❌ Cancelled',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    showPulse: false,
  },
} as const;

function TrackingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get('ref');
  const { bookings, updateBooking } = useBookingFlowStore();
  const [remoteBooking, setRemoteBooking] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  // Find local booking
  const localBooking = bookings.find(b => b.ref === ref) || bookings[0];
  // Prefer remote (most up-to-date) status
  const booking = remoteBooking || localBooking;

  // Accurately compute how many members have actually paid in group split
  const splitPaidCount = booking?.isSplitEnabled
    ? (Array.isArray(booking.splitPayments)
        ? booking.splitPayments.filter((s: any) => s.status === 'PAID').length
        : (typeof booking.splitPaidMembers === 'number' ? booking.splitPaidMembers : 0))
    : 0;
  const isSplitComplete = !booking?.isSplitEnabled || splitPaidCount >= (booking?.splitCount || 2);

  // If group split is active and not everyone has paid yet, force SPLIT_PENDING status
  const rawStatus = (booking?.status as any) || 'PENDING';
  const status: keyof typeof STATUS_CONFIG = (booking?.isSplitEnabled && !isSplitComplete)
    ? 'SPLIT_PENDING'
    : (rawStatus === 'SPLIT_PENDING' && isSplitComplete ? 'CONFIRMED' : rawStatus);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  // ── Poll backend every 3 seconds ────────────────────────────────────────────
  useEffect(() => {
    if (!ref) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/v1/bookings/sync?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const all = json?.data || json;
        const found = (Array.isArray(all) ? all : []).find((b: any) => b.ref === ref);
        if (found && !cancelled) {
          setRemoteBooking(found);
          // Sync full remote booking object back to local store
          if (localBooking) {
            updateBooking?.(found.id, {
              status: found.status,
              splitPaidMembers: found.splitPaidMembers,
              splitPayments: found.splitPayments,
              amountPaidByLeader: found.amountPaidByLeader,
            });
          }
        }
      } catch (e) {
        // Silently fail; use local data
      }
      setPollingCount(p => p + 1);
    };

    poll(); // immediate first call
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [ref]);

  const handleShare = () => {
    if (!booking) return;
    const text = `My booking at ${booking.merchantName} is ${booking.ref}. Service: ${booking.serviceName} on ${booking.date} at ${booking.time}!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!booking) return;
    const ticketText = `
===================================================
             BOKSPOT BOOKING TICKET
===================================================
Reference:   ${booking.ref}
Service:     ${booking.serviceName}
Provider:    ${booking.merchantName}
Date:        ${booking.date}
Time:        ${booking.time}
Amount:      ₹${booking.amount}
Status:      ${booking.status}
===================================================
Show this at the reception counter.
===================================================`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ticketText], { type: 'text/plain' }));
    a.download = `BokspotTicket-${booking.ref}.txt`;
    a.click();
  };

  if (!booking) {
    return (
      <div className="text-center py-20 px-4">
        <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Booking Not Found</h2>
        <p className="text-sm text-gray-400 mt-2">Reference: {ref || 'N/A'}</p>
        <Link href="/" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-content min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 pb-16 w-full px-4 sm:px-6 lg:px-8">
      <div className="w-full space-y-4 pt-1">
        
        {/* ── Breadcrumb & Back Action Bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>Back to My Bookings</span>
          </Link>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
            REF #{booking.ref}
          </span>
        </div>

        {/* ── Top Confetti & Skyline Celebration Hero Card (Full Width) ── */}
        <div className="relative rounded-2xl bg-white dark:bg-[#111726] border border-emerald-100 dark:border-white/10 shadow-xs p-5 sm:p-6 overflow-hidden w-full">
          {/* Skyline Silhouette Background Vector Graphic */}
          <div className="absolute right-0 bottom-0 top-0 w-2/5 pointer-events-none opacity-20 dark:opacity-10 bg-no-repeat bg-right-bottom"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 150' fill='%23059669'%3E%3Cpath d='M0,150 L20,150 L20,90 L40,90 L40,150 L60,150 L60,60 L80,60 L80,150 L110,150 L110,40 L135,40 L135,150 L160,150 L160,80 L180,80 L180,150 L210,150 L210,50 L240,50 L240,150 L270,150 L270,70 L300,70 L300,150 L340,150 L340,30 L370,30 L370,150 L400,150 L400,85 L420,85 L420,150 L460,150 L460,65 L500,65 L500,150 Z'/%3E%3C/svg%3E")`,
              backgroundSize: 'contain'
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            
            {/* Left: Confetti Icon + Booking Confirmed Header */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 ring-10 ring-emerald-100/60 dark:ring-emerald-900/20">
                <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-amber-400" />
                <span className="absolute -bottom-1 -left-1.5 w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="absolute -top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                <span className="absolute -bottom-0.5 right-0.5 w-2.5 h-1 rounded-xs bg-teal-400 rotate-45" />
                
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <Check size={20} className="stroke-[3.5]" />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 mb-1">
                  ✓ BOOKING CONFIRMED &amp; GUARANTEED
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Booking Confirmed!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Your reservation at <strong className="text-slate-900 dark:text-white font-black">{booking.merchantName}</strong> is locked in. Instant QR check-in pass is active below.
                </p>
              </div>
            </div>

            {/* Right: Compact Stepper */}
            <div className="w-full md:w-auto shrink-0 bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl px-5 py-2.5 border border-slate-200/80 dark:border-white/10 flex items-center justify-around gap-5 sm:gap-7">
              <div className="text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard size={15} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Payment</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Lock size={15} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Slot Locked</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Check size={16} className="stroke-[3]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Gate Pass</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-Column Responsive Dashboard Layout (Full Width 50/50 Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch w-full">
          
          {/* Left Column: Details Breakdown & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            
            {/* Booking Reference Card */}
            <div className="rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-700/50 bg-white dark:bg-[#111726] shadow-xs overflow-hidden p-5 sm:p-6 flex-1">
              {/* Header: Vehicle/Category Icon + Title + REF Pill */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Bus size={17} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    BOOKING REFERENCE
                  </h3>
                </div>

                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-black text-xs tracking-wide">
                  {booking.ref}
                </span>
              </div>

              {/* Rows with Colorful Crisp Icons & Dot Leaders to eliminate center gap */}
              <div className="space-y-1.5 pt-1 text-xs">
                {[
                  {
                    icon: <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs"><Sparkles size={15} /></div>,
                    label: 'Service',
                    value: booking.serviceName,
                    bold: true,
                  },
                  {
                    icon: <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs"><MapPin size={15} /></div>,
                    label: 'Venue',
                    value: booking.merchantName,
                    bold: true,
                  },
                  {
                    icon: <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs"><Calendar size={15} /></div>,
                    label: 'Date',
                    value: booking.date,
                    bold: true,
                  },
                  {
                    icon: <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs"><Clock size={15} /></div>,
                    label: 'Time Slot',
                    value: booking.time,
                    bold: true,
                  },
                  {
                    icon: <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs"><User size={15} /></div>,
                    label: 'Customer',
                    value: booking.customerName || 'Premium Traveler',
                    bold: true,
                  },
                  {
                    icon: <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs"><Wallet size={15} /></div>,
                    label: 'Total Booking Value',
                    value: `₹${booking.amount?.toLocaleString()}`,
                    bold: true,
                  },
                  {
                    icon: <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs"><CreditCard size={15} /></div>,
                    label: 'Amount Paid',
                    value: `₹${(booking.amountPaidByLeader !== undefined ? booking.amountPaidByLeader : booking.amount)?.toLocaleString()}`,
                    bold: true,
                    highlight: 'text-emerald-600 dark:text-emerald-400 font-black text-base',
                  },
                ].map((row, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Left: Icon & Label */}
                    <div className="flex items-center gap-3 shrink-0">
                      {row.icon}
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">{row.label}</span>
                    </div>

                    {/* Middle: Subtle Dotted Connector Line (Fills empty center space cleanly) */}
                    <div className="flex-1 mx-3 border-b border-dotted border-slate-200 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors" />

                    {/* Right: Value Pill */}
                    <span className={`text-right shrink-0 px-2 py-0.5 rounded-lg ${row.highlight || 'text-slate-900 dark:text-white font-bold bg-slate-50/60 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

        {/* ── District-Style Split with Friends Group Share Card ── */}
        {booking?.isSplitEnabled && (
          <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 shadow-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-600/30">
                  👥
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">
                    Group Split ({splitPaidCount}/{booking.splitCount || 2} Paid)
                  </h3>
                  <p className="text-[11px] text-indigo-700 font-bold">
                    Per Head: ₹{(booking.splitPerPerson || Math.round(booking.amount / (booking.splitCount || 2))).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${isSplitComplete
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}>
                {isSplitComplete ? '✓ Fully Paid' : 'Split Active'}
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-600">Payment Progress</span>
                <span className="text-indigo-700 font-mono">
                  {splitPaidCount} of {booking.splitCount || 2} Members
                </span>
              </div>
              <div className="w-full h-2.5 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((splitPaidCount / (booking.splitCount || 2)) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Distinct Individual Split Links (Link 1, Link 2...) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-800">
                  Individual Payment Links ({booking.splitCount || 2} Links)
                </span>
                <span className="text-[10px] text-gray-500 font-medium">1 unique link per person</span>
              </div>

              <div className="space-y-2">
                {(booking.splitPayments || Array.from({ length: booking.splitCount || 2 }).map((_, i) => ({
                  slotIndex: i + 1,
                  linkKey: `slot-${i + 1}`,
                  name: `Friend ${i + 1}`,
                  amount: booking.splitPerPerson || Math.round(booking.amount / (booking.splitCount || 2)),
                  status: i === 0 && booking.amountPaidByLeader > 0 ? 'PAID' : 'PENDING'
                }))).map((slot: any, idx: number) => {
                  const slotNum = slot.slotIndex || idx + 1;
                  const linkKey = slot.linkKey || `slot-${slotNum}`;
                  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bokspot.com';
                  const individualUrl = `${baseUrl}/split/pay?ref=${booking.ref}&slot=${linkKey}`;
                  const isPaid = slot.status === 'PAID';
                  const shareText = encodeURIComponent(
                    `Hey ${slot.name || 'Friend'}! Here is your individual link to pay your share of ₹${(slot.amount || booking.splitPerPerson)?.toLocaleString()} for our booking at ${booking.merchantName || 'Bokspot'}:\n${individualUrl}`
                  );

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all ${isPaid
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-white border-indigo-100 shadow-sm hover:border-indigo-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${isPaid ? 'bg-emerald-600 text-white' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                            {slotNum}
                          </span>
                          <div>
                            <span className="font-extrabold text-xs text-gray-900 block">
                              Link {slotNum}: {slot.name || `Friend ${slotNum}`} {slot.role === 'LEADER' ? '(Organizer)' : ''}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              Share: ₹{(slot.amount || booking.splitPerPerson)?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${isPaid
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                          {isPaid ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </div>

                      {/* Link Actions */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={individualUrl}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-gray-600 truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(individualUrl);
                            alert(`Link ${slotNum} copied to clipboard! Share it with ${slot.name || `Friend ${slotNum}`}.`);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all shrink-0"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const rawShareText = `Hey ${slot.name || 'Friend'}! Here is your individual link to pay your share of ₹${(slot.amount || booking.splitPerPerson)?.toLocaleString()} for our booking at ${booking.merchantName || 'Bokspot'}:\n${individualUrl}`;
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: `Bokspot Split Share for ${slot.name || 'Friend'}`,
                                  text: rawShareText,
                                  url: individualUrl,
                                });
                              } catch (err) {
                                // User dismissed or fallback
                              }
                            } else {
                              // Fallback opens WhatsApp Web / App directly
                              window.open(`https://wa.me/?text=${shareText}`, '_blank');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Share2 size={13} />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Safety Fallback Actions: Cover Remaining OR Cancel & Instant Refund */}
            {splitPaidCount < (booking.splitCount || 2) && (
              <div className="pt-3 border-t border-indigo-100 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Split Controls</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm('Would you like to pay the remaining share yourself and confirm this booking immediately?')) return;
                      const remainingAmt = (booking.amount || 0) - (booking.amountPaidByLeader || (booking.amount / 2));
                      const updatedBooking = {
                        ...booking,
                        splitPaidMembers: booking.splitCount || 2,
                        status: 'CONFIRMED',
                        amountPaidByLeader: booking.amount,
                      };
                      await fetch('/api/v1/bookings/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedBooking),
                      });
                      setRemoteBooking(updatedBooking);
                      alert('Remaining balance cleared! Booking confirmed.');
                    }}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all text-center cursor-pointer"
                  >
                    Pay Remaining Myself
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm('Are you sure you want to cancel? Your paid share will be 100% refunded immediately to your account.')) return;
                      const updatedBooking = {
                        ...booking,
                        status: 'CANCELLED',
                        cancellationReason: 'Cancelled by user due to split timeout / friend delay',
                      };
                      await fetch('/api/v1/bookings/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedBooking),
                      });
                      setRemoteBooking(updatedBooking);
                      alert('Booking cancelled. 100% full refund initiated to your original payment method!');
                    }}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition-all text-center cursor-pointer"
                  >
                    Cancel & Refund 100%
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


              {/* SLA Cancellation Button (Underneath the table) */}
              {status !== 'CANCELLED' && (status as string) !== 'COMPLETED' && (
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={async () => {
                      const cat = (booking.category || '').toLowerCase();
                      let policyMessage = '';
                      let refundPercent = 100;

                      if (['buses', 'flights', 'trains', 'movies', 'concerts', 'theatre', 'events'].includes(cat)) {
                        policyMessage = 'STRICTLY NON-REFUNDABLE: Under PassEntry policy, tickets/passes are non-refundable once barcode/PNR is generated. Event cancellation provides 100% refund.';
                        refundPercent = 0;
                      } else if (cat.includes('turf') || cat.includes('cricket') || cat.includes('court') || cat.includes('football')) {
                        policyMessage = 'PARTIAL REFUND SLA: Turf cancellation allows 70% refund when cancelled >4 hours prior. 30% advance is forfeited as slot collision hold.';
                        refundPercent = 70;
                      } else if (cat.includes('hotel') || cat.includes('resort') || cat.includes('stay') || cat.includes('villa')) {
                        policyMessage = 'FREE CANCELLATION: 100% full refund available when cancelled 24 hours prior to standard check-in time.';
                        refundPercent = 100;
                      } else {
                        policyMessage = 'STANDARD SLA: Free cancellation with 100% refund available prior to technician/specialist dispatch.';
                        refundPercent = 100;
                      }

                      const refundAmount = Math.round((booking.amount || 0) * (refundPercent / 100));
                      const confirmCancel = window.confirm(
                        `${policyMessage}\n\nExpected Refund: ₹${refundAmount.toLocaleString()} (${refundPercent}% of ₹${booking.amount})\n\nDo you wish to confirm cancellation?`
                      );

                      if (confirmCancel) {
                        try {
                          const updated = { ...booking, status: 'CANCELLED' as const };
                          setRemoteBooking(updated);
                          updateBooking?.(booking.id, { status: 'CANCELLED' });

                          await fetch('/api/v1/bookings/sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updated),
                          });
                          alert(`Booking cancelled successfully. Refund of ₹${refundAmount} initiated.`);
                        } catch (err) {
                          alert('Cancelled locally. Syncing back to server...');
                        }
                      }
                    }}
                    className="w-full py-3 rounded-2xl border border-red-200/90 bg-red-50/60 hover:bg-red-50 text-red-500 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <RefreshCcw size={14} className="stroke-[2.5]" />
                    <span>CANCEL BOOKING &amp; REQUEST SLA REFUND</span>
                  </button>
                </div>
              )}
            </div>

          {/* ── RIGHT COLUMN: PASS QR CODE & DIGITAL ACCESS & ACTIONS (5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* QR code – shown once confirmed */}
            {status === 'CONFIRMED' && (() => {
              const cat = (booking.category || '').toLowerCase();
              const svc = (booking.serviceName || '').toLowerCase();
              const isStay = cat.includes('resort') || cat.includes('hotel') || cat.includes('stay') || cat.includes('villa') || svc.includes('resort') || svc.includes('hotel');
              const isTransit = cat.includes('flight') || cat.includes('train') || cat.includes('bus') || cat.includes('metro');

              const badgeTitle = isStay
                ? 'FAST CHECK-IN PASS'
                : isTransit
                  ? 'DIGITAL BOARDING PASS'
                  : 'DIGITAL ENTRY PASS';

              const refLabel = isTransit
                ? `PNR : ${booking.ref}`
                : `REF : ${booking.ref}`;

              const helpText = isStay
                ? 'Present this QR code or Reference ID at the resort reception for instant key handover'
                : isTransit
                  ? 'Hold this QR code or Barcode to the turnstile / conductor scanner for instant boarding'
                  : 'Present this QR code or Reference ID at the venue gate for instant check-in';

              return (
                <div className="rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-700/50 bg-white dark:bg-[#111726] shadow-xs p-4 sm:p-5 flex flex-col items-center animate-fade-in relative overflow-hidden">
                  
                  {/* Top Header: Ticket Icon + Badge Title + PNR Pill */}
                  <div className="w-full flex items-center justify-between pb-3 mb-2.5 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                        <Ticket size={15} className="stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {badgeTitle}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-mono font-black text-[11px] tracking-wider">
                      {refLabel}
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="p-1.5 bg-white rounded-xl shadow-xs border border-slate-100 dark:border-white/10 my-0.5">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(booking.ref)}`}
                      alt="QR Code"
                      className="h-32 w-32 object-contain"
                    />
                  </div>

                  {/* Barcode Strip with PNR text below */}
                  <div className="mt-3 w-full max-w-[240px] py-1.5 px-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between gap-1 h-7 opacity-85">
                      {[4, 2, 5, 1, 3, 2, 4, 1, 6, 2, 3, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 4].map((w, idx) => (
                        <div key={idx} className="bg-slate-900 dark:bg-white h-full rounded-xs" style={{ width: `${w * 1.8}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] text-slate-600 dark:text-slate-400 font-black mt-0.5 tracking-widest uppercase">
                      *{booking.ref}*
                    </span>
                  </div>

                  {/* Info Notice Line */}
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-3 text-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-[9px] font-black">
                      i
                    </div>
                    <span>{helpText}</span>
                  </div>
                </div>
              );
            })()}

            {/* Action buttons (Save Ticket & Share) with Emerald Outlines */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#111726] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-black text-xs tracking-wide transition-all shadow-2xs cursor-pointer"
              >
                <Download size={14} className="stroke-[2.5]" />
                <span>Save Ticket</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#111726] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-black text-xs tracking-wide transition-all shadow-2xs cursor-pointer"
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} className="stroke-[2.5]" /> Share</>}
              </button>
            </div>

            {/* Emerald Solid CTA Button: View All My Bookings */}
            <Link
              href="/bookings"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-center font-black text-white text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Ticket size={15} />
              <span>View All My Bookings</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingTrackPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading booking status...</p>
          </div>
        </div>
      }>
        <TrackingPageContent />
      </Suspense>
    </main>
  );
}
