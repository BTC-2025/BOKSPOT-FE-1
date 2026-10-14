'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBookingFlowStore } from '../../../lib/store';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, ArrowLeft, MapPin, Calendar, Download, Share2, Check, AlertCircle } from 'lucide-react';

// ─── Status colour schemes ────────────────────────────────────────────────────
const STATUS_CONFIG = {
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

  const status: keyof typeof STATUS_CONFIG = (booking?.status as any) || 'PENDING';
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
          // Sync status back to local store
          if (localBooking && found.status !== localBooking.status) {
            updateBooking?.(found.id, { status: found.status });
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
    <div className="min-h-screen transition-colors duration-700" style={{ background: 'white' }}>
      {/* ── Gradient Header Banner ──────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${config.gradient} overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10 blur-xl" />

        <div className="relative max-w-lg mx-auto px-4 pt-14 pb-10 text-center">
          {/* Status Icon */}
          <div className="relative inline-flex mb-4">
            {config.showPulse && (
              <>
                <span className={`absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-40 animate-ping`} />
                <span className={`absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-20 animate-ping`}
                  style={{ animationDelay: '0.5s' }} />
              </>
            )}
            <div className={`relative w-24 h-24 rounded-full ${config.iconBg} border-4 border-white shadow-2xl flex items-center justify-center`}>
              <Icon size={44} className={config.iconColor} />
            </div>
          </div>

          <h1 className="text-2xl font-black text-white drop-shadow mb-1">{config.title}</h1>
          <p className="text-white/80 text-sm font-medium max-w-xs mx-auto">{config.subtitle}</p>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs font-black border bg-white/90 ${config.textColor} shadow`}>
            {config.badge}
          </div>

          {/* Polling indicator for PENDING */}
          {status === 'PENDING' && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-white/70 text-[10px] font-bold ml-1">Checking for updates...</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress Steps ──────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-b ${config.bgGradient} border-b ${config.borderColor} px-4 py-5`}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between relative">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
            <div
              className={`absolute left-0 top-4 h-0.5 bg-gradient-to-r ${config.gradient} z-0 transition-all duration-700`}
              style={{
                width: status === 'PENDING' ? '33%' : status === 'CONFIRMED' ? '100%' : '66%',
              }}
            />

            {[
              { label: 'Payment Done', done: true },
              {
                label: 'Venue Accepted',
                done: status === 'CONFIRMED',
                active: status === 'PENDING',
                failed: status === 'CANCELLED',
              },
              { label: 'All Set!', done: status === 'CONFIRMED', failed: status === 'CANCELLED' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-500 ${
                  step.failed
                    ? 'bg-red-100 border-red-400 text-red-600'
                    : step.done
                    ? `bg-gradient-to-br ${config.gradient} border-white text-white shadow-md`
                    : step.active
                    ? 'bg-white border-amber-400 text-amber-600 animate-pulse shadow'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {step.failed ? '✕' : step.done ? '✓' : i + 1}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight ${
                  step.failed ? 'text-red-500' : step.done ? config.textColor : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
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
              { label: 'Amount Paid', value: `₹${booking.amount?.toLocaleString()}`, bold: true },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center py-1 ${i < 5 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-gray-500 font-medium">{row.label}</span>
                <span className={`font-bold ${row.bold ? config.textColor + ' text-base' : 'text-gray-900'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QR code – shown once confirmed */}
        {status === 'CONFIRMED' && (
          <div className="rounded-3xl border-2 border-emerald-200 bg-white shadow-sm p-6 flex flex-col items-center animate-fade-in">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Entry QR Code</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(booking.ref)}`}
              alt="QR Code"
              className="h-36 w-36 rounded-2xl border border-gray-100 shadow p-2 bg-white"
            />
            <p className="text-xs text-gray-400 font-medium mt-3">Show at reception for entry</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 ${config.borderColor} font-bold text-sm ${config.textColor} hover:opacity-80 transition-all`}
          >
            <Download size={16} /> Save Ticket
          </button>
          <button
            onClick={handleShare}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 ${config.borderColor} font-bold text-sm ${config.textColor} hover:opacity-80 transition-all`}
          >
            {copied ? <><Check size={16} /> Copied!</> : <><Share2 size={16} /> Share</>}
          </button>
        </div>

        {/* Navigate to bookings */}
        <Link
          href="/tracks"
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
