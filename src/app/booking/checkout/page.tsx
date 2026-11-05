'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, CreditCard, Clock, MapPin, ArrowLeft, ChevronRight, AlertCircle, Check, User, Phone, Home, Bed, Users, Sparkles } from 'lucide-react';
import { useBookingFlowStore, useUserStore } from '../../../lib/store';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedService, selectedSlot, addBooking, notes } = useBookingFlowStore();
  const { user } = useUserStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [timeLeft, setTimeLeft] = useState(585);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);

  // District App Style: Group / Split Billing State
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitPayerNames, setSplitPayerNames] = useState<string[]>(['You (Organizer)', 'Friend 2']);
  const [splitInitiatorPaysNow, setSplitInitiatorPaysNow] = useState(true);

  // Payment Timing & Mode: 100% Online vs Partial Advance + Venue Pay
  const [payMode, setPayMode] = useState<'FULL_ONLINE' | 'PARTIAL_ADVANCE'>('FULL_ONLINE');

  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!selectedService || !selectedSlot) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={20} /></Link>
          <h1 className="font-extrabold text-lg">Checkout</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No Active Booking Session</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">Please select a service and time slot before proceeding to checkout.</p>
          <Link href="/search" className="mt-6 rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[color:var(--color-primary)]/20">
            Browse Services
          </Link>
        </div>
      </main>
    );
  }

  const listing = selectedService.selectedListing;
  const meta = listing?.metadata || {};
  const isPgStay = Boolean(selectedService.metadata?.pgBooking);
  const isHotel = Boolean(selectedService.metadata?.hotelBooking);
  const merchantDisplayName = typeof selectedService.merchant === 'string'
    ? selectedService.merchant
    : (selectedService.merchant?.name || selectedService.merchantObj?.name || 'BokSpot Verified Partner');
  const serviceDisplayName = typeof selectedService.name === 'string'
    ? selectedService.name
    : (selectedService.name?.name || 'Service Booking');
  const isLuxeBlind = Boolean(selectedService.metadata?.hotelBooking?.isLuxeBlindBooking);
  const realHotelName = selectedService.metadata?.hotelBooking?.realHotelName || selectedService.metadata?.hotelBooking?.venueName || merchantDisplayName;
  const pgSelectedAddons = selectedService.metadata?.pgBooking?.selectedAddons || [];
  const pgAddonsTotal = pgSelectedAddons.reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0);
  const availableAddons = (listing?.addons && listing.addons.length > 0)
    ? listing.addons
    : (meta.addons && meta.addons.length > 0)
      ? meta.addons
      : (selectedService.selectedListing?.addons || selectedService.metadata?.addons || []);
  const checkoutAddonsTotal = selectedAddons.reduce((sum: number, idx: number) => sum + (availableAddons[idx]?.price || 0), 0);
  const addonsTotal = isPgStay ? pgAddonsTotal : checkoutAddonsTotal;

  // For PG: separate base rent from add-ons so price breakdown shows both distinctly
  const basePrice = isPgStay
    ? (selectedService.price - pgAddonsTotal)
    : isHotel
      ? Math.round(selectedService.price / 1.12) // extract pre-tax price from inclusive total
      : (listing?.price || selectedService.price || 0);

  const platformFee = 29;
  const gst = isPgStay
    ? 0 // No GST for monthly residential stays / hostel beds
    : isHotel
      ? (selectedService.price - basePrice) // exact 12% GST calculated in template
      : Math.round((basePrice + addonsTotal) * 0.18);

  const total = isPgStay
    ? (basePrice + addonsTotal + platformFee)
    : isHotel
      ? (selectedService.price + addonsTotal + platformFee)
      : (basePrice + addonsTotal + platformFee + gst);

  // Partial Advance calculation (e.g. 30% online advance for venues/turfs, 70% at venue)
  const advanceAmount = payMode === 'PARTIAL_ADVANCE' ? Math.round(total * 0.3) : total;
  const balanceAtVenue = payMode === 'PARTIAL_ADVANCE' ? total - advanceAmount : 0;

  // Split Billing calculation
  const splitPerPersonAmt = isSplitEnabled ? Math.round(advanceAmount / splitCount) : advanceAmount;
  const amountToPayNow = isSplitEnabled
    ? (splitInitiatorPaysNow ? splitPerPersonAmt : 0)
    : advanceAmount;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in your name and phone number.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    setTimeout(async () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let ref = 'BK-';
      for (let i = 0; i < 6; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));

      const bookingTime = selectedSlot.time || selectedSlot.timeStr || (selectedService.metadata?.hotelBooking?.stayMode === 'TRANSIT' ? selectedService.metadata.hotelBooking.transitSlot : 'Standard Check-in: 12:00 PM') || '12:00 PM';

      // Generate distinct slots for each member (e.g. Link 1, Link 2...)
      const splitSlots = isSplitEnabled ? Array.from({ length: splitCount }).map((_, idx) => {
        const isLeaderPaid = idx === 0 && splitInitiatorPaysNow;
        return {
          id: `p-${Date.now()}-${idx + 1}`,
          slotIndex: idx + 1,
          linkKey: `slot-${idx + 1}`,
          name: isLeaderPaid ? name : (splitPayerNames[idx] || `Friend ${idx + 1}`),
          phone: isLeaderPaid ? phone : undefined,
          amount: splitPerPersonAmt,
          paidAt: isLeaderPaid ? new Date().toISOString() : undefined,
          role: idx === 0 ? 'LEADER' : 'MEMBER',
          status: isLeaderPaid ? 'PAID' : 'PENDING'
        };
      }) : undefined;

      const resolvedMerchantName = selectedService.metadata?.hotelBooking?.venueName ||
        selectedService.metadata?.pgBooking?.venueName ||
        selectedService.metadata?.venueName ||
        (typeof selectedService.merchant === 'object' ? selectedService.merchant?.name : selectedService.merchant) ||
        (typeof selectedService.merchantObj === 'object' ? selectedService.merchantObj?.name : selectedService.merchantObj) ||
        merchantDisplayName ||
        'BokSpot Partner';

      const isHostelBooking = Boolean(
        (selectedService.name || '').toLowerCase().includes('hostel') ||
        (selectedService.category?.name || selectedService.category || '').toLowerCase().includes('hostel') ||
        resolvedMerchantName.toLowerCase().includes('hostel')
      );

      const resolvedMerchantId = isHostelBooking
        ? '51c6a3b8-2abc-9421-7644-2a2dea05dbc0'
        : (selectedService.merchantObj?.id || selectedService.merchantId || (typeof selectedService.merchant === 'string' ? selectedService.merchant : selectedService.merchant?.id) || '');

      const resolvedCategory = isHostelBooking
        ? 'Hostel Booking'
        : (typeof selectedService.category === 'object' ? selectedService.category?.name : selectedService.category) || 'Hotel Booking';

      const newBooking = {
        id: String(Date.now()),
        ref,
        serviceId: selectedService.id,
        serviceName: listing?.name || selectedService.name,
        merchantName: isLuxeBlind ? realHotelName : resolvedMerchantName,
        isLuxeBlindBooking: isLuxeBlind,
        realHotelName: realHotelName,
        maskedSecretName: resolvedMerchantName,
        merchantId: resolvedMerchantId,
        category: resolvedCategory,
        date: selectedSlot.date,
        time: bookingTime,
        amount: total,
        status: (isSplitEnabled && (!splitInitiatorPaysNow || splitCount > 1) ? 'SPLIT_PENDING' : 'CONFIRMED') as any,
        city: selectedService.city,
        durationMinutes: selectedService.duration,
        customerName: name,
        customerEmail: email,
        notes: selectedService.metadata?.miniSpace
          ? `[Mini Space Cloakroom] ${selectedService.metadata.miniSpace.bagCount} Bags • ${selectedService.metadata.miniSpace.durationHours}h Storage | Desc: ${selectedService.metadata.miniSpace.bagDesc || 'None'} | ${notes || ''}`
          : (notes || ''),
        metadata: {
          ...(selectedService.metadata || {}),
          miniSpace: selectedService.metadata?.miniSpace || undefined,
        },
        bookedAt: new Date().toISOString(),
        paymentMethod,
        payMode,
        advancePaid: advanceAmount,
        balanceAtVenue,
        isSplitEnabled,
        splitCount: isSplitEnabled ? splitCount : 1,
        splitPerPerson: isSplitEnabled ? splitPerPersonAmt : total,
        amountPaidByLeader: amountToPayNow,
        splitPaidMembers: isSplitEnabled ? (splitInitiatorPaysNow ? 1 : 0) : 1,
        splitInitiatorPaysNow,
        splitExpiresAt: isSplitEnabled ? new Date(Date.now() + 20 * 60 * 1000).toISOString() : undefined, // 20 mins escrow window
        splitPayments: splitSlots,
      };

      // Save locally
      addBooking(newBooking);

      // Sync to backend so Business Dashboard can see it
      try {
        await fetch('/api/v1/bookings/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBooking),
        });
      } catch (err) {
        console.warn('Sync failed, continuing offline:', err);
      }

      setIsSubmitting(false);
      router.push(`/booking/track?ref=${ref}`);
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-slate-50/70 pt-20 sm:pt-24 pb-24">
      {/* Checkout Title Bar (Clean in-page header) */}
      <div className="bg-transparent mb-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#033266]/10 text-[#033266]">
                  Secure Checkout
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-500 truncate max-w-[200px] sm:max-w-none">
                  {merchantDisplayName}
                </span>
              </div>
              <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-tight mt-0.5">
                Review & Confirm Booking
              </h1>
            </div>
          </div>

          {timeLeft > 0 && (
            <div className="flex items-center gap-2 text-xs font-black bg-amber-500/10 border border-amber-500/20 text-amber-700 px-3.5 py-1.5 rounded-full shrink-0">
              <Clock size={13} className="animate-pulse text-amber-600" />
              <span>Holding slot: {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Two-Column Flow (Airbnb & Booking.com Standard) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: Clean Flowing Sections (No heavy outer box borders) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Stay Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-4">
                {(listing?.imageUrl || listing?.image || selectedService.images?.[0]) && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-2xs">
                    <img
                      src={listing?.imageUrl || listing?.image || selectedService.images?.[0]}
                      alt={listing?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {isLuxeBlind ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-sm flex items-center gap-1">
                        <Sparkles size={10} /> BokSpot Luxe • Mystery Deal
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60">
                        {isPgStay ? 'PG / Hostel Stay' : 'Room Booking'}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <span>✓</span> Verified Partner
                    </span>
                  </div>
                  <h2 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-snug">
                    {listing?.name || selectedService.metadata?.pgBooking?.roomType || serviceDisplayName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isLuxeBlind ? '🔒 Exact luxury hotel name & address revealed instantly upon booking' : merchantDisplayName}
                  </p>
                </div>
              </div>

              {/* PG Inclusions & Payment Mode */}
              {selectedService.metadata?.pgBooking && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/80 flex items-center gap-1.5">
                      {selectedService.metadata.pgBooking.foodExcluded ? '🍳 Mess Excluded' : '🍛 3 Meals Included (Homely Food)'}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                      selectedService.metadata.pgBooking.paymentType === 'FULL_MONTH_RENT'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {selectedService.metadata.pgBooking.paymentType === 'FULL_MONTH_RENT' ? '💳 1st Month Full Rent' : `🔒 Token Advance: ₹${selectedService.metadata.pgBooking.tokenPaid || 999}`}
                    </span>
                  </div>

                  {/* Add-ons List */}
                  {selectedService.metadata.pgBooking.selectedAddons && selectedService.metadata.pgBooking.selectedAddons.length > 0 && (
                    <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/60 space-y-2">
                      <span className="text-[10px] font-black uppercase text-orange-900 tracking-wider block">
                        Included Add-ons / Upgrades:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.metadata.pgBooking.selectedAddons.map((add: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-200 rounded-lg text-xs font-bold text-gray-800 shadow-2xs">
                            <span>{add.icon || '✨'}</span>
                            <span>{add.name}</span>
                            <span className="text-orange-600 font-extrabold ml-0.5">(+₹{Number(add.price).toLocaleString()})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rent & Deposit Two-Column Row */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Monthly Rent</span>
                      <span className="font-black text-sm text-slate-900 mt-0.5 block">
                        ₹{selectedService.metadata.pgBooking.monthlyRent?.toLocaleString() || '6,000'}<span className="text-xs font-normal text-slate-500">/mo</span>
                      </span>
                    </div>
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                      <span className="text-amber-800/70 font-bold block text-[10px] uppercase tracking-wider">Refundable Deposit</span>
                      <span className="font-black text-sm text-amber-900 mt-0.5 block">
                        ₹{selectedService.metadata.pgBooking.refundableDeposit?.toLocaleString() || '5,000'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Date & Time Slot Row */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Stay Start Date</p>
                  <p className="text-xs font-extrabold text-slate-900">{formatDate(selectedSlot.date)}</p>
                </div>
                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200/50">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Check-in Plan</p>
                  <p className="text-xs font-extrabold text-slate-900">
                    {selectedSlot.time || selectedSlot.timeStr || '1st Month Lease (Starts on check-in)'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Guest Information */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <User size={18} className="text-[#033266]" /> Guest Information
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Instant Verification
                </span>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Vishnu Kumar KR"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#033266] focus:bg-white focus:ring-2 focus:ring-[#033266]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#033266] focus:bg-white focus:ring-2 focus:ring-[#033266]/15 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">Email (optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#033266] focus:bg-white focus:ring-2 focus:ring-[#033266]/15 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#033266]" /> Payment Method
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  100% Secure & Encrypted
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'upi', label: 'UPI Instant / QR Code', sub: 'Google Pay, PhonePe, Paytm, BHIM', icon: '📱' },
                  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay & Corporate Cards', icon: '💳' },
                  { id: 'netbanking', label: 'Net Banking', sub: 'All Indian Public & Private Banks', icon: '🏦' },
                ].map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                        ? 'border-[#033266] bg-[#033266]/5 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id as any)}
                      className="hidden"
                    />
                    <span className="text-xl p-2 rounded-xl bg-slate-100 border border-slate-200/60">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-black text-sm text-slate-900">{method.label}</p>
                      <p className="text-xs text-slate-500">{method.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === method.id ? 'border-[#033266] bg-[#033266]' : 'border-slate-300'
                      }`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Shield size={14} className="text-emerald-500" />
                <span>256-bit Bank-grade SSL encryption · Powered by Razorpay</span>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLS: Sticky Price Breakdown & Action Bar */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <span>💰</span> Payment Breakdown
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isPgStay ? 'Monthly Lease' : 'Instant Confirmation'}
                </span>
              </div>

              <div className="p-5 space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">{isPgStay ? 'Monthly Stay Rent / Advance' : 'Base Price'}</span>
                  <span className="font-bold text-gray-900">₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Platform Fee</span>
                  <span className="font-bold text-gray-900">₹{platformFee}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[color:var(--color-primary)] font-bold">Add-ons Total</span>
                    <span className="font-bold text-[color:var(--color-primary)]">+₹{addonsTotal.toLocaleString()}</span>
                  </div>
                )}
                {gst > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">GST</span>
                      <span className="text-xs text-gray-400 ml-1">({isHotel ? '12%' : '18%'})</span>
                    </div>
                    <span className="font-bold text-gray-900">₹{gst.toLocaleString()}</span>
                  </div>
                )}

                {/* Refundable Security Deposit Note */}
                {((listing as any)?.securityDeposit || meta.securityDeposit) && (
                  <div className="flex justify-between items-center text-sm p-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                    <div>
                      <span className="text-amber-900 font-bold block text-xs">Refundable Security Deposit</span>
                      <span className="text-[10px] text-amber-700">100% refunded after checkout / inspection</span>
                    </div>
                    <span className="font-extrabold text-amber-900">₹{Number((listing as any)?.securityDeposit || meta.securityDeposit).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-900 text-base">Total Order Value</span>
                    <span className="font-black text-xl text-gray-900">₹{total.toLocaleString()}</span>
                  </div>

                  {payMode === 'PARTIAL_ADVANCE' && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-amber-900">
                        <span>Advance Online (30%):</span>
                        <span>₹{advanceAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Balance at Venue:</span>
                        <span className="font-bold text-gray-800">₹{balanceAtVenue.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {isSplitEnabled && (
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/60 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>Split ({splitCount} people):</span>
                        <span>₹{splitPerPersonAmt.toLocaleString()} / person</span>
                      </div>
                      <div className="flex justify-between text-indigo-700 text-[11px]">
                        <span>Organizer Upfront Due:</span>
                        <span className="font-bold">₹{amountToPayNow.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-black text-gray-900 text-sm">
                      {isSplitEnabled && !splitInitiatorPaysNow ? 'Amount to Pay Now:' : 'Amount to Pay Now:'}
                    </span>
                    <span className="font-black text-2xl text-[color:var(--color-primary)]">
                      {isSplitEnabled && !splitInitiatorPaysNow ? '₹0' : `₹${amountToPayNow.toLocaleString()}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 text-right">
                    {isSplitEnabled && !splitInitiatorPaysNow
                      ? 'No advance payment needed. Generate links & collect.'
                      : 'Inclusive of all taxes'}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={isSubmitting || timeLeft === 0}
                  className={`w-full py-4 rounded-xl font-extrabold text-base transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : timeLeft === 0
                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                        : 'bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90 text-white shadow-[color:var(--color-primary)]/30 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                >
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : timeLeft === 0 ? (
                    'Session Expired'
                  ) : isSplitEnabled && !splitInitiatorPaysNow ? (
                    <><span className="text-lg">👥</span> Generate {splitCount} Split Links & Hold Slot</>
                  ) : (
                    <><Shield size={18} /> Pay ₹{amountToPayNow.toLocaleString()} & Lock Slot</>
                  )}
                </button>

                {timeLeft === 0 && (
                  <p className="text-center text-xs text-red-500 mt-3 flex items-center justify-center gap-1">
                    <AlertCircle size={11} />Slot expired. Go back and re-select.
                  </p>
                )}
              </div>

              {/* What's included */}
              <div className="px-5 pb-5 pt-0">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Included</p>
                  {['Instant booking confirmation', 'Cancel up to 24hrs before', 'Customer support 24/7'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <Check size={13} className="text-green-500 shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
