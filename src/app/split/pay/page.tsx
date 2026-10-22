'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle2, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';

function SplitPayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get('ref');
  const slotKey = searchParams.get('slot'); // e.g. 'slot-1', 'slot-2'

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasInitializedName, setHasInitializedName] = useState(false);

  // Load booking by ref
  const fetchBooking = async () => {
    if (!ref) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/v1/bookings/sync?t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data || [];
      const found = list.find((b: any) => b.ref === ref);
      if (found) {
        setBooking(found);

        // Pre-fill name ONLY ONCE on initial load, and only if it's a real name (not placeholder like "You (Organizer)" or "Friend ")
        if (!hasInitializedName && slotKey && Array.isArray(found.splitPayments)) {
          const targeted = found.splitPayments.find((s: any) => s.linkKey === slotKey);
          if (targeted && targeted.name) {
            const isPlaceholder = targeted.name.includes('Organizer') || targeted.name.startsWith('Friend ') || targeted.name.toLowerCase() === 'you';
            if (!isPlaceholder) {
              setGuestName(targeted.name);
            }
          }
          setHasInitializedName(true);
        }

        // Calculate remaining seconds if expiresAt exists
        if (found.splitExpiresAt) {
          const rem = Math.max(0, Math.floor((new Date(found.splitExpiresAt).getTime() - Date.now()) / 1000));
          setTimeLeft(rem);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 4000);
    return () => clearInterval(interval);
  }, [ref, slotKey]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePayShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim() || !booking) return;

    setPaying(true);
    const shareAmt = booking.splitPerPerson || Math.round((booking.amount || 0) / (booking.splitCount || 2));

    let updatedSplits: any[] = [];
    if (Array.isArray(booking.splitPayments) && booking.splitPayments.length > 0) {
      // Find the slot targeted by this link or the first unpaid slot
      let targetIdx = slotKey ? booking.splitPayments.findIndex((s: any) => s.linkKey === slotKey) : -1;
      if (targetIdx === -1) {
        targetIdx = booking.splitPayments.findIndex((s: any) => s.status !== 'PAID');
      }

      updatedSplits = booking.splitPayments.map((slot: any, idx: number) => {
        if (idx === targetIdx) {
          return {
            ...slot,
            name: guestName.trim(),
            phone: guestPhone.trim(),
            amount: shareAmt,
            paidAt: new Date().toISOString(),
            status: 'PAID',
          };
        }
        return slot;
      });

      // If no pre-created slots matched, append as new member
      if (targetIdx === -1) {
        updatedSplits.push({
          id: `p-${Date.now()}`,
          name: guestName.trim(),
          phone: guestPhone.trim(),
          amount: shareAmt,
          paidAt: new Date().toISOString(),
          role: 'MEMBER',
          status: 'PAID',
        });
      }
    } else {
      updatedSplits = [
        {
          id: `p-${Date.now()}`,
          name: guestName.trim(),
          phone: guestPhone.trim(),
          amount: shareAmt,
          paidAt: new Date().toISOString(),
          role: 'MEMBER',
          status: 'PAID',
        }
      ];
    }

    const paidCount = updatedSplits.filter((s: any) => s.status === 'PAID').length;
    const totalPaidSoFar = updatedSplits
      .filter((s: any) => s.status === 'PAID')
      .reduce((sum: number, s: any) => sum + (s.amount || shareAmt), 0);
    const isAllPaid = paidCount >= (booking.splitCount || 2);

    const updatedBooking = {
      ...booking,
      splitPayments: updatedSplits,
      splitPaidMembers: paidCount,
      advancePaid: totalPaidSoFar,
      amountPaidByLeader: totalPaidSoFar,
      status: isAllPaid ? 'CONFIRMED' : 'SPLIT_PENDING',
    };

    try {
      await fetch('/api/v1/bookings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });
      setBooking(updatedBooking);
      setPaymentSuccess(true);
      setTimeout(() => {
        router.push(`/booking/track?ref=${booking.ref}`);
      }, 2000);
    } catch (err) {
      alert('Failed to process payment. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading split invite...</p>
      </div>
    );
  }

  if (!booking || !booking.isSplitEnabled) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-bold">Split Booking Not Found or Expired</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">This split payment session is invalid or has already been completed.</p>
        <Link href="/" className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">
          Return to BokSpot Home
        </Link>
      </div>
    );
  }

  const isExpired = booking.status === 'CANCELLED' || (timeLeft === 0 && (booking.splitPaidMembers || 1) < (booking.splitCount || 2) && booking.status === 'SPLIT_PENDING');
  const isAllPaid = booking.status === 'CONFIRMED' || (booking.splitPaidMembers || 1) >= (booking.splitCount || 2);
  const shareAmount = booking.splitPerPerson || Math.round((booking.amount || 0) / (booking.splitCount || 2));
  const leadName = booking.customerName || 'Your friend';

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8">
      {/* Top Navbar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> BokSpot Split
        </Link>
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Ref: {booking.ref}
        </span>
      </div>

      <div className="max-w-md w-full mx-auto space-y-4 my-auto">
        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Inviter */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
              👥
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Group Split Invite</p>
              <h1 className="text-base font-extrabold text-white leading-tight">
                {leadName} invited you to split
              </h1>
            </div>
          </div>

          {/* Property / Service Info */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-5 space-y-2">
            <h3 className="font-extrabold text-sm text-slate-200">{booking.serviceName}</h3>
            <p className="text-xs text-slate-400">{booking.merchantName} · {booking.category}</p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <span className="text-slate-500">Dates / Slot:</span>
              <span className="font-bold text-slate-300">{booking.date} ({booking.time})</span>
            </div>
          </div>

          {/* Split Breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Bill</span>
              <span className="text-base font-black text-slate-300">₹{booking.amount?.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Your Equal Share</span>
              <span className="text-xl font-black text-indigo-400">₹{shareAmount?.toLocaleString()}</span>
            </div>
          </div>

          {/* Countdown Timer or Status Banner */}
          {isAllPaid ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 mb-5">
              <CheckCircle2 size={20} className="shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">All Shares Completed! 🎉</p>
                <p className="text-[11px] text-emerald-500/80">This reservation is fully confirmed.</p>
              </div>
            </div>
          ) : isExpired ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 mb-5">
              <AlertTriangle size={20} className="shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Session Expired & Refunded</p>
                <p className="text-[11px] text-red-400/80">Payment window closed. Prior payers are auto-refunded.</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock size={16} className="animate-pulse" />
                <span className="text-xs font-bold">Lock Timer Remaining:</span>
              </div>
              <span className="font-mono font-black text-sm text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg">
                {formatTimer(timeLeft)}
              </span>
            </div>
          )}

          {/* Members Status List */}
          <div className="space-y-2 mb-6">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Individual Shares ({booking.splitPayments?.length || booking.splitCount || 2} Slots)
            </span>
            {(booking.splitPayments || [
              { name: leadName, role: 'LEADER', status: 'PAID', amount: shareAmount }
            ]).map((slot: any, idx: number) => {
              const isPaid = slot.status === 'PAID';
              const isTargeted = slotKey && slot.linkKey === slotKey;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    isPaid
                      ? 'bg-slate-950/40 border-slate-800/80'
                      : isTargeted
                      ? 'bg-indigo-950/50 border-indigo-500/60 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/20 border-dashed border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[10px] ${
                      isPaid 
                        ? 'bg-emerald-600/30 text-emerald-400' 
                        : isTargeted
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {slot.slotIndex || idx + 1}
                    </div>
                    <div>
                      <span className={`font-bold ${isTargeted ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {slot.name || `Friend ${slot.slotIndex || idx + 1}`}
                      </span>
                      {slot.role === 'LEADER' && <span className="ml-1 text-[9px] text-indigo-400 font-extrabold uppercase">(Organizer)</span>}
                      {isTargeted && !isPaid && <span className="ml-1.5 text-[9px] text-indigo-400 font-bold bg-indigo-500/20 px-1.5 py-0.5 rounded">You are paying this share</span>}
                    </div>
                  </div>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={10} /> Paid ₹{(slot.amount || shareAmount)?.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-500/80">
                      Pending ₹{(slot.amount || shareAmount)?.toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Form */}
          {!isAllPaid && !isExpired && (
            <form onSubmit={handlePayShare} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Your Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Phone Number (UPI receipt)</label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {paying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={14} /> Pay My Share (₹{shareAmount?.toLocaleString()})
                  </>
                )}
              </button>
            </form>
          )}

          {paymentSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center border border-emerald-500/30">
              Payment Confirmed! Redirecting to tracking...
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>256-Bit Escrow Protection • 100% Refund on Timeout</span>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-600">
        BokSpot Group Split Engine • All Rights Reserved
      </div>
    </main>
  );
}

export default function SplitPayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <SplitPayContent />
    </Suspense>
  );
}
