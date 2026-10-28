'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../../lib/store';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, ArrowLeft, MapPin, Calendar, Download, Share2, Check, AlertCircle, Key, Lock, Unlock } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 pt-24 sm:pt-28 pb-20">
      {/* ── Top App-Style Success Hero Card ─────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white dark:bg-[#111726] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Subtle Confetti/Accent background */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          
          {/* Status Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-500/5">
            <CheckCircle2 size={36} className="stroke-[2.3]" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 mb-2">
            ✓ Booking Confirmed & Guaranteed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5 max-w-sm mx-auto">
            Your reservation at <strong className="text-slate-800 dark:text-slate-200">{booking.merchantName}</strong> is locked in. Instant QR check-in pass is active below.
          </p>

          {/* Stepper Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 block">Payment</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 block">Slot Locked</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 block">Gate Pass Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Details Card ────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className={`rounded-3xl border-2 ${config.borderColor} bg-white shadow-sm overflow-hidden`}>
          <div className={`bg-gradient-to-r ${config.bgGradient} px-5 py-4 border-b ${config.borderColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Booking Reference</span>
              <span className={`font-mono font-black text-base ${config.textColor}`}>{booking.ref}</span>
            </div>
          </div>

          <div className="p-5 space-y-3 text-sm">
            {[
              { label: 'Service', value: booking.serviceName },
              { label: 'Venue', value: booking.merchantName },
              { label: 'Date', value: booking.date },
              { label: 'Time Slot', value: booking.time },
              { label: 'Customer', value: booking.customerName },
              { label: 'Total Booking Value', value: `₹${booking.amount?.toLocaleString()}` },
              ...(booking.advancePaid && booking.balanceAtVenue > 0 ? [
                { label: 'Advance Paid Online', value: `₹${booking.advancePaid?.toLocaleString()}`, bold: true },
                { label: 'Balance Payable at Venue', value: `₹${booking.balanceAtVenue?.toLocaleString()}`, bold: true }
              ] : booking.isSplitEnabled ? [
                { 
                  label: 'Amount Paid', 
                  value: `₹${(booking.amountPaidByLeader !== undefined ? booking.amountPaidByLeader : (booking.splitInitiatorPaysNow ? booking.splitPerPerson : 0))?.toLocaleString()}`, 
                  bold: true 
                },
                ...(splitPaidCount < (booking.splitCount || 2) ? [
                  { 
                    label: 'Pending From Friends', 
                    value: `₹${Math.max(0, (booking.amount || 0) - (booking.amountPaidByLeader !== undefined ? booking.amountPaidByLeader : (booking.splitInitiatorPaysNow ? booking.splitPerPerson : 0))).toLocaleString()}` 
                  }
                ] : [])
              ] : [
                { label: 'Amount Paid', value: `₹${(booking.amountPaidByLeader !== undefined ? booking.amountPaidByLeader : booking.amount)?.toLocaleString()}`, bold: true }
              ])
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                <span className="text-gray-500 font-medium">{row.label}</span>
                <span className={`font-bold ${row.bold ? config.textColor + ' text-base' : 'text-gray-900'}`}>{row.value}</span>
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

        {/* QR code – shown once confirmed */}
        {status === 'CONFIRMED' && (() => {
          const cat = (booking.category || '').toLowerCase();
          const svc = (booking.serviceName || '').toLowerCase();
          const isStay = cat.includes('resort') || cat.includes('hotel') || cat.includes('stay') || cat.includes('villa') || svc.includes('resort') || svc.includes('hotel');
          const isTransit = cat.includes('flight') || cat.includes('train') || cat.includes('bus') || cat.includes('metro');

          const badgeTitle = isStay
            ? 'Fast Check-In Pass'
            : isTransit
              ? 'Digital Boarding Pass'
              : 'Digital Entry Pass';

          const refLabel = isTransit
            ? `PNR: ${booking.ref?.replace('BK-', 'PNR-')}`
            : `REF: ${booking.ref}`;

          const helpText = isStay
            ? 'Present this QR code or Reference ID at the resort reception for instant key handover'
            : isTransit
              ? 'Hold this QR code or Barcode to the turnstile / conductor scanner for instant boarding'
              : 'Present this QR code or Reference ID at the venue gate for instant check-in';

          return (
            <div className="rounded-3xl border-2 border-emerald-200 bg-white shadow-sm p-6 flex flex-col items-center animate-fade-in relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {badgeTitle}
                </span>
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono">
                  {refLabel}
                </span>
              </div>

              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(booking.ref)}`}
                alt="QR Code"
                className="h-36 w-36 rounded-2xl border border-gray-100 shadow p-2 bg-white"
              />

              {/* Barcode Strip */}
              <div className="mt-4 w-full max-w-[260px] py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                <div className="w-full flex items-center justify-between gap-1 h-8 opacity-80">
                  {[4, 2, 5, 1, 3, 2, 4, 1, 6, 2, 3, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 4].map((w, idx) => (
                    <div key={idx} className="bg-slate-800 h-full rounded-xs" style={{ width: `${w * 2}px` }} />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-slate-500 font-bold mt-1 tracking-widest">*{booking.ref}*</span>
              </div>

              <p className="text-xs text-gray-500 font-medium mt-3 text-center">
                {helpText}
              </p>
            </div>
          );
        })()}

        {/* Digital Room Keycard Access (Only for Hotel and Hostel; Not applicable for Camping) */}
        {booking?.keycardIssued && (() => {
          const categoryLower = (booking.category || '').toLowerCase();
          const merchantLower = (booking.merchantName || '').toLowerCase();
          const isCamp = categoryLower.includes('camp') || merchantLower.includes('camp') || (booking.roomNumber || '').startsWith('T-') || (booking.roomNumber || '').startsWith('D-') || (booking.roomNumber || '').startsWith('P-');
          if (isCamp) return null; // Camping does not use digital NFC door keycard

          const isHostel = categoryLower.includes('hostel') || merchantLower.includes('hostel') || (booking.roomNumber || '').startsWith('B-');
          const unitTitle = isHostel ? 'Dorm & Locker Digital Key' : 'Digital Smart Keycard';
          const unitPrefix = isHostel ? 'Bed / Locker' : 'Room';
          const badgeText = 'Active NFC Key';
          const unitNumber = booking.roomNumber || '102';

          return (
            <div className="rounded-3xl border-2 border-[#ff6325]/30 bg-gradient-to-br from-[#ff6325]/5 via-white to-orange-50 shadow-md p-6 animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#ff6325] text-white flex items-center justify-center shadow-sm">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">{unitTitle}</h4>
                    <p className="text-[11px] text-[#ff6325] font-bold">{unitPrefix} {unitNumber} Door Access</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse">
                  {badgeText}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Your digital key has been authorized by the front desk. Hold your mobile near {unitPrefix} {unitNumber} smart lock or tap below.
              </p>

              <button
                onClick={() => alert(`${unitPrefix} ${unitNumber} door unlocked! Welcome in.`)}
                className="w-full py-3 bg-gradient-to-r from-[#ff6325] to-[#ff8452] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock size={16} /> Tap to Unlock {unitPrefix} {unitNumber}
              </button>
            </div>
          );
        })()}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 ${config.borderColor} font-bold text-sm ${config.textColor} hover:opacity-80 transition-all cursor-pointer`}
          >
            <Download size={16} /> Save Ticket
          </button>
          <button
            onClick={handleShare}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 ${config.borderColor} font-bold text-sm ${config.textColor} hover:opacity-80 transition-all cursor-pointer`}
          >
            {copied ? <><Check size={16} /> Copied!</> : <><Share2 size={16} /> Share</>}
          </button>
        </div>

        {/* ── Cancellation & Refund SLA Policy Button ── */}
        {status !== 'CANCELLED' && (status as string) !== 'COMPLETED' && (
          <div className="pt-2">
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
              className="w-full py-3 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Cancel Booking & Request SLA Refund
            </button>
          </div>
        )}

        {/* Navigate to bookings */}
        <Link
          href="/bookings"
          className={`block w-full py-4 rounded-2xl text-center font-extrabold text-white text-sm bg-gradient-to-r ${config.gradient} shadow-lg hover:opacity-90 transition-all`}
        >
          View All My Bookings
        </Link>
      </div>
    </div>
  );
}

export default function BookingTrackPage() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-extrabold text-base">Booking Status</h1>
        </div>
      </nav>
      <div className="pt-14">
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
      </div>
    </main>
  );
}
