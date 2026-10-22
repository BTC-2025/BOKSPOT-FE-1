'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, QrCode, Calendar, Clock, MapPin, Download, Share2, ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useBookingFlowStore } from '../../../lib/store';
import { useState, Suspense } from 'react';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const { bookings } = useBookingFlowStore();
  const booking = bookings.find(b => b.ref === ref) || bookings[0];
  
  const [copied, setCopied] = useState(false);

  if (!booking) {
    return (
      <div className="rounded-3xl border border-[var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)] p-8 text-center shadow-xl">
        <h1 className="text-xl font-bold">Booking Not Found</h1>
        <p className="mt-2 text-[color:var(--color-on-surface-variant)] text-sm">Could not retrieve booking details for reference {ref || 'N/A'}.</p>
        <Link href="/" className="mt-6 block w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white">
          Go to Home
        </Link>
      </div>
    );
  }

  const handleDownloadTicket = () => {
    const ticketText = `
===================================================
             BETA BOOKING PLATFORM
===================================================
Booking Reference: ${booking.ref}
Service Name:      ${booking.serviceName}
Provider:          ${booking.merchantName}
Date:              ${booking.date}
Time Slot:         ${booking.time}
Amount Paid:       ₹${booking.amount}
Status:            ${booking.status}
Venue City:        ${booking.city || 'Chennai'}
Duration:          ${booking.durationMinutes || 45} mins
===================================================
Please show this text file or the QR code at the
reception counter for verification upon arrival.
Thank you for booking with BETA!
===================================================
    `;
    const element = document.createElement("a");
    const file = new Blob([ticketText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `BetaTicket-${booking.ref}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    const text = `My booking reference at ${booking.merchantName} is ${booking.ref}. Service: ${booking.serviceName} on ${booking.date} at ${booking.time}!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-md w-full px-4">
      <div className="rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)] p-8 text-center shadow-xl card-glass">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </motion.div>

        <h1 className="text-2xl font-black tracking-tight text-[color:var(--color-on-surface)]">Booking Confirmed!</h1>
        <p className="mt-2 text-sm text-[color:var(--color-on-surface-variant)]">Your reservation is locked in and ready</p>

        <div className="mt-6 rounded-2xl bg-[color:var(--color-surface-dim)]/60 border border-[color:var(--color-outline-variant)]/20 p-4 text-left space-y-2.5 text-sm">
          <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/10 pb-2">
            <span className="text-[color:var(--color-on-surface-variant)]">Reference</span>
            <span className="font-mono font-bold text-[color:var(--color-primary)]">{booking.ref}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/10 pb-2">
            <span className="text-[color:var(--color-on-surface-variant)]">Service</span>
            <span className="font-semibold text-[color:var(--color-on-surface)]">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/10 pb-2">
            <span className="text-[color:var(--color-on-surface-variant)]">Provider</span>
            <span className="font-semibold text-[color:var(--color-on-surface)]">{booking.merchantName}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/10 pb-2">
            <span className="text-[color:var(--color-on-surface-variant)]">Date & Time</span>
            <span className="font-bold text-[color:var(--color-on-surface)]">{booking.date} · {booking.time}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-[color:var(--color-on-surface-variant)]">Amount Paid</span>
            <span className="font-black text-green-500 text-base">₹{booking.amount}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-[color:var(--color-outline-variant)]/30 p-6 bg-[color:var(--color-surface-dim)]/30 flex flex-col items-center justify-center">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(booking.ref)}`} 
            alt="Booking QR Code" 
            className="mx-auto h-32 w-32 rounded-xl border border-white/10 shadow-lg p-2 bg-white"
          />
          <p className="mt-3 text-xs text-[color:var(--color-on-surface-variant)] font-medium">Show this QR code at the reception desk</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={handleDownloadTicket} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-container-high)] py-3 text-sm font-semibold hover:border-[color:var(--color-primary)]/40 transition-colors text-[color:var(--color-on-surface)]">
            <Download className="h-4 w-4 text-[color:var(--color-primary)]" /> Save Ticket
          </button>
          <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-container-high)] py-3 text-sm font-semibold hover:border-[color:var(--color-primary)]/40 transition-colors text-[color:var(--color-on-surface)]">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500 animate-bounce" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-[color:var(--color-primary)]" /> Share
              </>
            )}
          </button>
        </div>

        <Link href="/bookings" className="mt-4 block w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3.5 font-bold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/10">
          View My Bookings
        </Link>
      </div>
    </motion.div>
  );
}

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-on-surface)] transition-colors duration-300">
      {/* Sticky header */}
      <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[color:var(--color-outline-variant)]/30 backdrop-blur-xl">
        <div className="container-main flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn-ghost p-2">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-[color:var(--color-outline)]">
              <Link href="/" className="hover:text-[color:var(--color-on-surface)] transition-colors">Home</Link>
              <ChevronRight size={14} />
              <span className="text-[color:var(--color-on-surface)]">Booking Confirmed</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex items-center justify-center py-12">
        <Suspense fallback={
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-4">progress_activity</span>
            <p className="text-on-surface-variant text-sm">Retrieving confirmation status...</p>
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </div>
    </main>
  );
}
