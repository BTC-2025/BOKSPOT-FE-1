'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, CreditCard, Clock, MapPin, ArrowLeft, ChevronRight, AlertCircle, Check, User, Phone, Home, Bed, Users, Sparkles, Ticket, Utensils, Scissors, Wrench, Dumbbell, Stethoscope, CheckCircle2, Lock } from 'lucide-react';
import { useBookingFlowStore, useUserStore } from '../../../lib/store';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedService, selectedSlot, addBooking, notes, bookings } = useBookingFlowStore();
  const { user } = useUserStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [timeLeft, setTimeLeft] = useState(585);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [isEditingAddons, setIsEditingAddons] = useState(false);

  // BokSpot Split with Friends State
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitPayerNames, setSplitPayerNames] = useState<string[]>(['You (Organizer)', 'Friend 2']);
  const [splitInitiatorPaysNow, setSplitInitiatorPaysNow] = useState(true);

  // BokSpot Universal Payment Model: 100% Online, 30% Advance Deposit, or Pay at Venue
  const [payMode, setPayMode] = useState<'FULL_ONLINE' | 'PARTIAL_ADVANCE' | 'PAY_AT_VENUE'>('FULL_ONLINE');

  // Vendor Configured Payment Access Controls (Dynamically fetched from Business Portal / Merchant Policy)
  const [vendorPolicy, setVendorPolicy] = useState<{
    allowFullPayment: boolean;
    allowPartialAdvance: boolean;
    advancePercent: number;
    allowPayAtVenue: boolean;
    allowGroupSplit: boolean;
  }>(() => {
    const mId = selectedService?.merchantId || selectedService?.merchant?.id || selectedService?.merchantObj?.id || 'default';
    const mUname = selectedService?.merchant?.username || selectedService?.merchantObj?.username || 'default';

    if (typeof window !== 'undefined') {
      const getVal = (prefix: string) => {
        const valId = localStorage.getItem(`${prefix}_${mId}`);
        if (valId !== null) return valId === 'true';
        const valUname = localStorage.getItem(`${prefix}_${mUname}`);
        if (valUname !== null) return valUname === 'true';
        const valDef = localStorage.getItem(`${prefix}_default`);
        if (valDef !== null) return valDef === 'true';
        return null;
      };

      const allowFull = getVal('vendor_pay_full') ?? true;
      const allowAdvance = getVal('vendor_pay_advance') ?? true;
      const allowVenue = getVal('vendor_pay_venue') ?? true;
      const allowSplit = getVal('vendor_pay_split') ?? true;
      
      const pctVal = localStorage.getItem(`vendor_advance_pct_${mId}`) ||
        localStorage.getItem(`vendor_advance_pct_${mUname}`) ||
        localStorage.getItem('vendor_advance_pct_default');

      return {
        allowFullPayment: allowFull,
        allowPartialAdvance: allowAdvance,
        advancePercent: pctVal ? Number(pctVal) : 30,
        allowPayAtVenue: allowVenue,
        allowGroupSplit: allowSplit
      };
    }

    return {
      allowFullPayment: true,
      allowPartialAdvance: true,
      advancePercent: 30,
      allowPayAtVenue: true,
      allowGroupSplit: true
    };
  });

  // Sync DoctorBookingFlow's Pay at Clinic selection into checkout payMode
  useEffect(() => {
    const docPayMode = (selectedService as any)?.metadata?.doctor?.paymentMode;
    if (docPayMode === 'PAY_AT_CLINIC' && vendorPolicy.allowPayAtVenue) {
      setPayMode('PAY_AT_VENUE');
    }
  }, [(selectedService as any)?.metadata?.doctor?.paymentMode, vendorPolicy.allowPayAtVenue]);

  // Keep payMode aligned with what vendor has enabled
  useEffect(() => {
    if (!vendorPolicy.allowFullPayment && payMode === 'FULL_ONLINE') {
      if (vendorPolicy.allowPartialAdvance) setPayMode('PARTIAL_ADVANCE');
      else if (vendorPolicy.allowPayAtVenue) setPayMode('PAY_AT_VENUE');
    } else if (!vendorPolicy.allowPartialAdvance && payMode === 'PARTIAL_ADVANCE') {
      if (vendorPolicy.allowFullPayment) setPayMode('FULL_ONLINE');
      else if (vendorPolicy.allowPayAtVenue) setPayMode('PAY_AT_VENUE');
    } else if (!vendorPolicy.allowPayAtVenue && payMode === 'PAY_AT_VENUE') {
      if (vendorPolicy.allowFullPayment) setPayMode('FULL_ONLINE');
      else if (vendorPolicy.allowPartialAdvance) setPayMode('PARTIAL_ADVANCE');
    }
  }, [vendorPolicy, payMode]);

  // Listen for live payment policy updates if vendor toggles in another tab
  useEffect(() => {
    const handlePolicyUpdate = () => {
      const mId = selectedService?.merchantId || selectedService?.merchant?.id || selectedService?.merchantObj?.id || 'default';
      const mUname = selectedService?.merchant?.username || selectedService?.merchantObj?.username || 'default';
      
      const getVal = (prefix: string) => {
        const valId = localStorage.getItem(`${prefix}_${mId}`);
        if (valId !== null) return valId === 'true';
        const valUname = localStorage.getItem(`${prefix}_${mUname}`);
        if (valUname !== null) return valUname === 'true';
        const valDef = localStorage.getItem(`${prefix}_default`);
        if (valDef !== null) return valDef === 'true';
        return null;
      };

      const allowFull = getVal('vendor_pay_full') ?? true;
      const allowAdvance = getVal('vendor_pay_advance') ?? true;
      const allowVenue = getVal('vendor_pay_venue') ?? true;
      const allowSplit = getVal('vendor_pay_split') ?? true;
      const pctVal = localStorage.getItem(`vendor_advance_pct_${mId}`) || localStorage.getItem(`vendor_advance_pct_${mUname}`) || localStorage.getItem('vendor_advance_pct_default');

      setVendorPolicy({
        allowFullPayment: allowFull,
        allowPartialAdvance: allowAdvance,
        advancePercent: pctVal ? Number(pctVal) : 30,
        allowPayAtVenue: allowVenue,
        allowGroupSplit: allowSplit
      });
    };

    window.addEventListener('vendor_payment_policy_updated', handlePolicyUpdate);
    window.addEventListener('storage', handlePolicyUpdate);
    return () => {
      window.removeEventListener('vendor_payment_policy_updated', handlePolicyUpdate);
      window.removeEventListener('storage', handlePolicyUpdate);
    };
  }, [selectedService]);

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
  const isDining = Boolean(selectedService.metadata?.isDining || selectedService.metadata?.dining);
  const isMiniSpace = Boolean(selectedService.metadata?.miniSpace);
  const isTurfBooking = Boolean(selectedService.metadata?.turfBooking);
  const isEntertainmentBooking = Boolean(selectedService.metadata?.entertainmentBooking || selectedService.metadata?.isEntertainmentBooking);
  const entBooking = selectedService.metadata?.entertainmentBooking || {};
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

  // Available addons pool from listing or service metadata
  const availableAddons = (listing?.addons && listing.addons.length > 0)
    ? listing.addons
    : (meta.addons && meta.addons.length > 0)
      ? meta.addons
      : (selectedService.selectedListing?.addons || selectedService.metadata?.addons || []);

  // Pre-selected addons passed from venue detail page (e.g. Turf/Court match addons or appointments)
  const incomingAddons: any[] = selectedService.metadata?.turfBooking?.selectedAddons ||
    selectedService.metadata?.selectedAddons ||
    [];

  // Auto-sync incoming pre-selected addons to selectedAddons indexes on initial load
  useEffect(() => {
    if (incomingAddons && incomingAddons.length > 0 && availableAddons && availableAddons.length > 0) {
      const matchedIndexes: number[] = [];
      incomingAddons.forEach((inc: any) => {
        const incName = typeof inc === 'string' ? inc : (inc?.name || '');
        const foundIdx = availableAddons.findIndex((a: any) => (a.name || a) === incName);
        if (foundIdx !== -1 && !matchedIndexes.includes(foundIdx)) {
          matchedIndexes.push(foundIdx);
        }
      });
      if (matchedIndexes.length > 0) {
        setSelectedAddons(prev => {
          const combined = Array.from(new Set([...prev, ...matchedIndexes]));
          return combined;
        });
      }
    }
  }, [selectedService]);

  const checkoutAddonsTotal = selectedAddons.reduce((sum: number, idx: number) => sum + (Number(availableAddons[idx]?.price) || 0), 0);
  const addonsTotal = isPgStay
    ? pgAddonsTotal
    : (selectedAddons.length > 0 ? checkoutAddonsTotal : (Number(selectedService.metadata?.addonsCost) || 0));

  const diningPreordersTotal = isDining && Array.isArray(selectedService.metadata?.dining?.preOrderDishes)
    ? selectedService.metadata.dining.preOrderDishes.reduce((s: number, d: any) => s + (Number(d.price || 0) * Number(d.qty || d.quantity || 1)), 0)
    : 0;

  const basePrice = isPgStay
    ? (selectedService.price - pgAddonsTotal)
    : isHotel
      ? Math.round(selectedService.price / 1.12) // extract pre-tax price from inclusive total
      : isDining
        ? (Number(selectedService.metadata?.dining?.depositAmount) || 0)
        : isTurfBooking
          ? (Number(selectedService.metadata?.turfBooking?.baseSlotCost) || Number(listing?.price) || Math.max(0, Number(selectedService.price) - addonsTotal))
          : (listing?.price || selectedService.price || 0);

  const platformFee = 29;
  const gst = isPgStay || isDining
    ? 0 // No upfront GST for monthly residential stays or dining table reservations (settled at venue)
    : isHotel
      ? (selectedService.price - basePrice) // exact 12% GST calculated in template
      : Math.round((basePrice + addonsTotal) * 0.18);

  const total = isPgStay
    ? (basePrice + addonsTotal + platformFee)
    : isHotel
      ? (selectedService.price + addonsTotal + platformFee)
      : isDining
        ? (basePrice + diningPreordersTotal + platformFee)
        : (basePrice + addonsTotal + platformFee + gst);

  // BokSpot Universal Payment Model calculation:
  // - FULL_ONLINE: 100% paid online upfront
  // - PARTIAL_ADVANCE: Vendor configured deposit % (default 30%) online advance deposit to hold slot/booking, remaining paid at venue
  // - PAY_AT_VENUE: ₹0 online upfront, 100% paid on arrival at venue
  const depositFraction = (vendorPolicy.advancePercent || 30) / 100;
  const advanceAmount = payMode === 'PAY_AT_VENUE'
    ? 0
    : payMode === 'PARTIAL_ADVANCE'
      ? Math.round(total * depositFraction)
      : total;

  const balanceAtVenue = total - advanceAmount;

  // Split Billing calculation: splits the payable online amount (or total if PAY_AT_VENUE isn't applicable with split)
  const splitBaseAmount = payMode === 'PARTIAL_ADVANCE' ? advanceAmount : total;
  const splitPerPersonAmt = isSplitEnabled ? Math.round(splitBaseAmount / splitCount) : advanceAmount;
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
        selectedAddons: isPgStay 
          ? pgSelectedAddons 
          : selectedAddons.map(i => availableAddons[i]).filter(Boolean),
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
    <main className="min-h-screen bg-slate-50/70 pt-28 sm:pt-32 pb-24">
      {/* Checkout Title Bar (Clean in-page header) */}
      <div className="bg-transparent mb-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
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
                        {isEntertainmentBooking ? 'Cinema & Event M-Ticket' : isPgStay ? 'PG / Hostel Stay' : isTurfBooking ? 'Turf / Sports Slot' : isMiniSpace ? 'Cloakroom Locker' : 'Service Booking'}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified Partner
                    </span>
                  </div>
                  <h2 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-snug">
                    {listing?.name || selectedService.metadata?.pgBooking?.roomType || serviceDisplayName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    {isLuxeBlind ? <><Lock size={12} className="text-amber-500 shrink-0" /> Exact luxury hotel name & address revealed instantly upon booking</> : merchantDisplayName}
                  </p>
                </div>
              </div>

              {/* Entertainment Cinema M-Ticket Badge & Seat Allocation Card */}
              {isEntertainmentBooking && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/10 via-slate-900/5 to-orange-500/10 border border-purple-300/40 dark:border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Ticket size={14} /> Contactless Digital M-Ticket Pass
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Instant Turnstile QR
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Experience</span>
                        <span className="font-extrabold text-slate-900 dark:text-white truncate block">{entBooking.format || 'IMAX Laser 3D'}</span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Seat Zone</span>
                        <span className="font-extrabold text-slate-900 dark:text-white truncate block">{entBooking.seatZone || 'Prime Circle'}</span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Allocated Seats</span>
                        <span className="font-black text-[#ff6325] truncate block">
                          {Array.isArray(entBooking.seats) && entBooking.seats.length > 0 ? entBooking.seats.join(', ') : `${entBooking.ticketsCount || 2} Seats`}
                        </span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Tickets</span>
                        <span className="font-extrabold text-slate-900 dark:text-white block">{entBooking.ticketsCount || 2} Pass(es)</span>
                      </div>
                    </div>

                    {/* Pre-ordered Concessions */}
                    {entBooking.fnbAddons && (entBooking.fnbAddons.popcorn || entBooking.fnbAddons.nachos || entBooking.fnbAddons.beverage) && (
                      <div className="mt-2.5 pt-2 border-t border-purple-200/40 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-[10px] font-black uppercase text-purple-800 dark:text-purple-300">In-Seat Refreshments:</span>
                        {entBooking.fnbAddons.popcorn && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">Tub Popcorn + Coke</span>
                        )}
                        {entBooking.fnbAddons.nachos && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">Warm Cheesy Nachos</span>
                        )}
                        {entBooking.fnbAddons.beverage && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">Cold Coffee / Iced Tea</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dining & Restaurant Table Reservation Specs Banner */}
              {selectedService.metadata?.dining && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#ff6325] uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils size={14} /> {selectedService.metadata.dining.restaurantName || 'Restaurant Table Reservation'}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                        {selectedService.metadata.dining.depositAmount === 0 ? 'Free Reservation' : 'Deposit Adjustable'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Reserved Table</span>
                        <strong className="text-slate-800">{selectedService.metadata.dining.tableType}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Time</span>
                        <strong className="text-slate-800">{selectedService.metadata.dining.date} at {selectedService.metadata.dining.time}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Party Size</span>
                        <strong className="text-slate-800">{selectedService.metadata.dining.guestsCount} Guests</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Meal Session</span>
                        <strong className="text-slate-800">{selectedService.metadata.dining.session} Session</strong>
                      </div>
                    </div>

                    {selectedService.metadata.dining.celebrationType && selectedService.metadata.dining.celebrationType !== 'NONE' && (
                      <div className="p-2 rounded-xl bg-amber-100/70 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-600" />
                        <span>Celebration Setup: {selectedService.metadata.dining.celebrationType}</span>
                      </div>
                    )}

                    {selectedService.metadata.dining.preOrderDishes && selectedService.metadata.dining.preOrderDishes.length > 0 && (
                      <div className="pt-2 border-t border-orange-200/60">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                          Pre-Ordered Kitchen Specialties:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedService.metadata.dining.preOrderDishes.map((dish: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-orange-200 text-xs font-bold text-slate-800">
                              {dish.qty}x {dish.name} (₹{dish.price * dish.qty})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Salon, Spa & Wellness Appointment Specs Banner */}
              {(selectedService.metadata?.appointmentBooking || selectedService.metadata?.wellness || selectedService.metadata?.wellnessBooking) && (() => {
                const wData = selectedService.metadata?.appointmentBooking || selectedService.metadata?.wellnessBooking || selectedService.metadata?.wellness || {};
                const isHomeVisit = wData.serviceMode === 'HOME_VISIT';
                const treatments = Array.isArray(wData.treatmentDetails) ? wData.treatmentDetails : (Array.isArray(wData.treatments) ? wData.treatments : []);
                return (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="p-4 bg-orange-50/70 dark:bg-slate-900/50 border border-orange-200/80 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#ff6325] uppercase tracking-wider flex items-center gap-1.5">
                          <Scissors size={14} /> {wData.venueName || wData.salonName || 'Salon & Luxury Spa Appointment'}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isHomeVisit ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {isHomeVisit ? 'Doorstep Home Visit' : 'In-Salon Chair'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Specialist / Stylist</span>
                          <strong className="text-slate-800 dark:text-slate-200">{wData.practitioner || wData.specialistName || 'Master Stylist'}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Time</span>
                          <strong className="text-slate-800 dark:text-slate-200">{wData.slotDate || wData.appointmentDate || wData.date} at {wData.slotTime || wData.appointmentSlot || wData.time}</strong>
                          {(wData.totalDuration || wData.durationMinutes) && (
                            <span className="text-[10px] text-slate-500 block">{wData.totalDuration || wData.durationMinutes} mins total duration</span>
                          )}
                        </div>

                        {/* Doorstep address if home visit */}
                        {isHomeVisit && wData.homeAddress && (
                          <div className="col-span-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 text-xs">
                            <span className="font-bold text-purple-700 dark:text-purple-300 uppercase text-[10px] block">Doorstep Address:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">{wData.homeAddress}</span>
                            {wData.homeLandmark && (
                              <span className="text-slate-500 block text-[11px]">Landmark: {wData.homeLandmark}</span>
                            )}
                          </div>
                        )}

                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Booked Services ({treatments.length || 1})</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {treatments.length > 0 ? (
                              treatments.map((t: any, idx: number) => (
                                <span key={idx} className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-[11px] shadow-2xs">
                                  {typeof t === 'string' ? t : t.name} {t.price ? `(₹${t.price})` : ''}
                                </span>
                              ))
                            ) : (
                              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-[11px] shadow-2xs">
                                {wData.treatmentName || selectedService.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {wData.specialInstructions && (
                          <div className="col-span-2 mt-1 p-2 rounded-xl bg-white border border-rose-100 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-400 uppercase text-[9px] block">Customer Notes / Preferences:</span>
                            {wData.specialInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Home Services (Plumber, Electrician, Cleaning) Specs Banner */}
              {selectedService.metadata?.homeServiceBooking && (() => {
                const hData = selectedService.metadata.homeServiceBooking;
                return (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Wrench size={14} /> {hData.venueName || 'Doorstep Service Booking'}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                          Doorstep Professional
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Package</span>
                          <strong className="text-slate-800">{hData.packageName}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Preferred Arrival Window</span>
                          <strong className="text-slate-800">{hData.date} • {hData.timeWindow}</strong>
                        </div>

                        {hData.customerNotes && (
                          <div className="col-span-2 mt-1 p-2 rounded-xl bg-white border border-blue-100 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-400 uppercase text-[9px] block">Customer Problem Notes:</span>
                            {hData.customerNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Yoga Shala & Mat Spot Specs Banner */}
              {(selectedService.metadata?.isYogaBooking || selectedService.metadata?.yogaBooking) && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#ff6325]" /> {selectedService.metadata.yogaBooking?.venueName || 'Yoga Shala Sanctuary'}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6325] text-white uppercase tracking-wider">
                        Mat {selectedService.metadata.yogaBooking?.matSpot || 'M-01'} Reserved
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch & Style</span>
                        <strong className="text-slate-800">{selectedService.metadata.yogaBooking?.batchTitle || 'Sunrise Hatha Flow'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Guru & Guide</span>
                        <strong className="text-slate-800">{selectedService.metadata.yogaBooking?.guru || 'Senior Shala Acharya'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Schedule</span>
                        <strong className="text-slate-800">{selectedService.metadata.yogaBooking?.slotDate} • {selectedService.metadata.yogaBooking?.slotTime?.split('–')[0]?.trim()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Inclusions</span>
                        <span className="text-slate-800 font-bold">
                          Cork Mat {selectedService.metadata.yogaBooking?.matSpot}
                          {selectedService.metadata.yogaBooking?.eyePillowAddon ? ' • Eye Pillow' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gym, Yoga & Fitness Pass Specs Banner */}
              {selectedService.metadata?.fitness && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Dumbbell size={14} /> {selectedService.metadata.fitness.gymName || 'Fitness Pass / Class'}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                        Turnstile Pass Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Workout / Pass</span>
                        <strong className="text-slate-800">{selectedService.metadata.fitness.passName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch & Slot</span>
                        <strong className="text-slate-800">{selectedService.metadata.fitness.date} • {selectedService.metadata.fitness.timeSlot}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Trainer / Coach</span>
                        <strong className="text-slate-800">{selectedService.metadata.fitness.trainerName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Amenities</span>
                        <span className="text-slate-800 font-bold">
                          {selectedService.metadata.fitness.lockerIncluded ? 'Digital Locker' : ''}
                          {selectedService.metadata.fitness.proteinShakeIncluded ? ' • Whey Shake' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Consultation & OPD Token Specs Banner */}
              {selectedService.metadata?.doctor && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Stethoscope size={14} /> {selectedService.metadata.doctor.clinicName || 'Doctor Consultation'}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                        Instant OPD Token (After Payment)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Doctor & Dept</span>
                        <strong className="text-slate-800">{selectedService.metadata.doctor.doctorName}</strong>
                        <span className="text-[10px] text-slate-500 block">{selectedService.metadata.doctor.role}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Slot & Mode</span>
                        <strong className="text-slate-800">{selectedService.metadata.doctor.date} at {selectedService.metadata.doctor.timeSlot}</strong>
                        <span className="text-[10px] text-blue-600 font-bold block">
                          {selectedService.metadata.doctor.consultationMode === 'IN_CLINIC' ? `In-Clinic (${selectedService.metadata.doctor.opdRoom})` : 'Video Consultation'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient</span>
                        <strong className="text-slate-800">
                          {selectedService.metadata.doctor.patientName} ({selectedService.metadata.doctor.patientAge}y • {selectedService.metadata.doctor.patientGender})
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Chief Symptoms</span>
                        <span className="text-slate-800 font-bold line-clamp-1">
                          {selectedService.metadata.doctor.symptoms}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Doorstep Home Service Specs Banner (Urban Company Style) */}
              {(selectedService.metadata?.isHomeService || selectedService.metadata?.homeService || selectedService.metadata?.homeCallBooking) && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench size={14} /> {selectedService.metadata.homeService?.serviceName || selectedService.metadata.homeCallBooking?.issueCategory || 'Doorstep Home Service'}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-600 text-white uppercase tracking-wider">
                        30-Day Guarantee
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Arrival Window</span>
                        <strong className="text-slate-800">
                          {selectedService.metadata.homeService?.arrivalWindow || selectedService.metadata.homeCallBooking?.arrivalWindow || selectedSlot.timeStr}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Doorstep Start OTP</span>
                        <strong className="font-mono text-amber-600 tracking-wider font-black text-sm">
                          {selectedService.metadata.homeService?.startOtp || '4821'}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Address</span>
                        <span className="text-slate-800 font-bold block truncate flex items-center gap-1">
                          <MapPin size={12} className="shrink-0 text-amber-600" /> {selectedService.metadata.homeService?.serviceAddress || selectedService.metadata.homeCallBooking?.serviceAddress || 'Customer Doorstep'}
                        </span>
                      </div>
                      {Array.isArray(selectedService.metadata.homeService?.addons) && selectedService.metadata.homeService.addons.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Included Add-ons</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedService.metadata.homeService.addons.map((a: any, idx: number) => (
                              <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white border border-amber-200 font-bold text-slate-800 text-[11px]">
                                {a.name} (+₹{a.price})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PG Inclusions & Payment Mode */}
              {selectedService.metadata?.pgBooking && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/80 flex items-center gap-1.5">
                      {selectedService.metadata.pgBooking.foodExcluded ? 'Mess Excluded' : '3 Meals Included (Homely Food)'}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                      selectedService.metadata.pgBooking.paymentType === 'FULL_MONTH_RENT'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {selectedService.metadata.pgBooking.paymentType === 'FULL_MONTH_RENT' ? '1st Month Full Rent' : `Token Advance: ₹${selectedService.metadata.pgBooking.tokenPaid || 999}`}
                    </span>
                    {selectedService.metadata.pgBooking.durationMonths && (
                      <span className="text-xs font-bold px-3 py-1 bg-orange-50 text-[#ff6325] rounded-lg border border-orange-200/80 flex items-center gap-1.5">
                        <Clock size={12} /> {selectedService.metadata.pgBooking.durationMonths} Months Stay
                        {selectedService.metadata.pgBooking.tenureDiscountPct > 0 && ` (${selectedService.metadata.pgBooking.tenureDiscountPct}% OFF applied)`}
                      </span>
                    )}
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
                            <Sparkles size={12} className="text-orange-500" />
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    {isPgStay ? 'Stay Start Date' : isTurfBooking ? 'Slot Date' : 'Booking Date'}
                  </p>
                  <p className="text-xs font-extrabold text-slate-900">{formatDate(selectedSlot.date)}</p>
                </div>
                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200/50">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">
                    {isPgStay ? 'Check-in Plan' : isTurfBooking ? 'Playing Time' : 'Time Slot'}
                  </p>
                  <p className="text-xs font-extrabold text-slate-900">
                    {selectedSlot.time || selectedSlot.timeStr || (isPgStay ? '1st Month Lease (Starts on check-in)' : 'Standard Slot')}
                  </p>
                </div>
              </div>

              {/* Selected Add-ons Display with Edit/Customize Button for all 54 categories */}
              {!isPgStay && !isDining && (
                <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-200/70 space-y-2.5 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-orange-950 tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#ff6325]" /> Selected Add-ons / Inclusions ({selectedAddons.length}):
                    </span>
                    {availableAddons && availableAddons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddons(!isEditingAddons)}
                        className="px-2.5 py-1 rounded-lg text-xs font-black bg-white hover:bg-orange-100 text-[#ff6325] border border-orange-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{isEditingAddons ? 'Done' : 'Edit Add-ons'}</span>
                      </button>
                    )}
                  </div>

                  {selectedAddons.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedAddons.map((idx: number) => {
                        const add = availableAddons[idx];
                        if (!add) return null;
                        return (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-200 rounded-lg text-xs font-bold text-gray-800 shadow-2xs">
                            <Sparkles size={11} className="text-orange-500" />
                            <span>{add.name}</span>
                            <span className="text-orange-600 font-extrabold ml-0.5">(+₹{Number(add.price).toLocaleString()})</span>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium py-0.5">
                      <span>No additional add-ons selected for this booking.</span>
                      {availableAddons && availableAddons.length > 0 && !isEditingAddons && (
                        <button
                          type="button"
                          onClick={() => setIsEditingAddons(true)}
                          className="text-xs font-bold text-[#ff6325] hover:underline cursor-pointer"
                        >
                          + Add Equipment / Extras
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 1.5 Optional Add-ons & Equipment Upgrades Editor (Toggled via Edit Add-ons) */}
            {availableAddons && availableAddons.length > 0 && !isPgStay && isEditingAddons && (
              <div className="bg-white rounded-2xl border-2 border-orange-200/90 shadow-sm p-5 sm:p-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-[#ff6325]" /> Edit Add-ons & Equipment
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Select or uncheck inclusions & equipment for this booking
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddons(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    Done
                  </button>
                </div>

                <div className="space-y-2.5">
                  {availableAddons.map((addon: any, idx: number) => {
                    const isSelected = selectedAddons.includes(idx);
                    const stockType = addon.stockType || 'REUSABLE';
                    const maxStock = addon.maxStock ?? 5;
                    const baseRemaining = addon.currentStock ?? maxStock;

                    // Calculate active bookings using this addon on the chosen date & slot
                    const bookedCount = (bookings || []).filter((b: any) => {
                      if (b.status === 'CANCELLED') return false;
                      const sameDate = b.date === selectedSlot.date;
                      if (!sameDate) return false;
                      // For slot-bound/reusable check time slot; for daily check date
                      if (stockType === 'REUSABLE' && selectedSlot.time && b.time) {
                        return b.time === selectedSlot.time && (b.selectedAddons || []).some((a: any) => a.name === addon.name);
                      }
                      return (b.selectedAddons || []).some((a: any) => a.name === addon.name);
                    }).length;

                    const availableStock = stockType === 'UNLIMITED' 
                      ? 999 
                      : Math.max(0, (stockType === 'CONSUMABLE' ? baseRemaining : maxStock) - bookedCount);

                    const isSoldOut = stockType !== 'UNLIMITED' && availableStock <= 0;
                    const isFastFilling = stockType !== 'UNLIMITED' && availableStock > 0 && availableStock <= 2;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isSoldOut) return;
                          if (isSelected) {
                            setSelectedAddons(selectedAddons.filter(i => i !== idx));
                          } else {
                            setSelectedAddons([...selectedAddons, idx]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                          isSoldOut
                            ? 'border-slate-200/60 bg-slate-100/70 opacity-60 cursor-not-allowed'
                            : isSelected
                              ? 'border-[#ff6325] bg-orange-50/40 cursor-pointer shadow-xs'
                              : 'border-slate-200/80 hover:border-slate-300 bg-white cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSoldOut
                              ? 'border-slate-300 bg-slate-200 text-slate-400'
                              : isSelected
                                ? 'border-[#ff6325] bg-[#ff6325] text-white'
                                : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${isSoldOut ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                {addon.name}
                              </span>
                              {stockType === 'REUSABLE' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                                  Reusable
                                </span>
                              )}
                              {isSoldOut ? (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                                  🔒 SOLD OUT (No units left)
                                </span>
                              ) : isFastFilling ? (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                  ⚡ Only {availableStock} left
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              {stockType === 'REUSABLE' 
                                ? 'Guaranteed sanitised kit reserved exclusively for your slot' 
                                : stockType === 'CONSUMABLE' 
                                  ? 'Physical amenity kit / consumable pack' 
                                  : 'Optional concierge upgrade'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900 block">
                            +₹{Number(addon.price || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">per booking</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* 3. BokSpot Universal Payment Model: 100% Online, Advance Deposit, Pay at Venue */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#ff6325]" /> How Would You Like to Pay?
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Choose from vendor-approved payment terms for this booking
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Mode 1: 100% Full Payment */}
                {vendorPolicy.allowFullPayment !== false && (
                  <button
                    type="button"
                    onClick={() => setPayMode('FULL_ONLINE')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      payMode === 'FULL_ONLINE'
                        ? 'border-[#033266] bg-[#033266]/5 shadow-xs ring-2 ring-[#033266]/10'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                          <span>💳</span> 100% Full Pay
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          payMode === 'FULL_ONLINE' ? 'border-[#033266] bg-[#033266]' : 'border-slate-300'
                        }`}>
                          {payMode === 'FULL_ONLINE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Instant barcode pass & VIP priority confirmation
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Pay Now</span>
                      <span className="text-xs font-black text-slate-900">₹{total.toLocaleString()}</span>
                    </div>
                  </button>
                )}

                {/* Mode 2: Advance Deposit */}
                {vendorPolicy.allowPartialAdvance !== false && (
                  <button
                    type="button"
                    onClick={() => setPayMode('PARTIAL_ADVANCE')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      payMode === 'PARTIAL_ADVANCE'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/10'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                          <span>⚡</span> {vendorPolicy.advancePercent || 30}% Advance
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          payMode === 'PARTIAL_ADVANCE' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                        }`}>
                          {payMode === 'PARTIAL_ADVANCE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-amber-900/80 leading-snug">
                        Lock slot with {vendorPolicy.advancePercent || 30}% deposit; pay remaining {100 - (vendorPolicy.advancePercent || 30)}% at venue
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800">Pay Now</span>
                      <span className="text-xs font-black text-amber-950">₹{Math.round(total * ((vendorPolicy.advancePercent || 30) / 100)).toLocaleString()}</span>
                    </div>
                  </button>
                )}

                {/* Mode 3: Pay at Venue */}
                {vendorPolicy.allowPayAtVenue !== false && (
                  <button
                    type="button"
                    onClick={() => setPayMode('PAY_AT_VENUE')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      payMode === 'PAY_AT_VENUE'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/10'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                          <span>🏢</span> Pay at Venue
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          payMode === 'PAY_AT_VENUE' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                        }`}>
                          {payMode === 'PAY_AT_VENUE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-900/80 leading-snug">
                        Zero advance online. Pay cash/UPI on arrival
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800">Pay Now</span>
                      <span className="text-xs font-black text-emerald-950">₹0</span>
                    </div>
                  </button>
                )}
              </div>

              {payMode === 'PARTIAL_ADVANCE' && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between text-xs text-amber-950 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <div>
                      <span className="font-black block">Slot Locked with ₹{Math.round(total * ((vendorPolicy.advancePercent || 30) / 100)).toLocaleString()} Token Deposit</span>
                      <span className="text-[11px] text-amber-800">Pay the remaining balance of ₹{(total - Math.round(total * ((vendorPolicy.advancePercent || 30) / 100))).toLocaleString()} at the reception upon arrival.</span>
                    </div>
                  </div>
                </div>
              )}

              {payMode === 'PAY_AT_VENUE' && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between text-xs text-emerald-950 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏢</span>
                    <div>
                      <span className="font-black block">No Upfront Payment Required</span>
                      <span className="text-[11px] text-emerald-800">Your reservation is held. Pay ₹{total.toLocaleString()} directly at the counter via Cash, UPI, or Card.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Group Split Billing (BokSpot Split Pay) - Conditioned on vendor policy */}
            {vendorPolicy.allowGroupSplit !== false && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                      Split Bill with Friends
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        BokSpot Split
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Divide this booking amount equally among teammates or group</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isSplitEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setIsSplitEnabled(enabled);
                      if (enabled && splitPayerNames.length < splitCount) {
                        setSplitPayerNames(['You (Organizer)', ...Array.from({ length: splitCount - 1 }).map((_, i) => `Friend ${i + 2}`)]);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {isSplitEnabled ? (
                <div className="space-y-4 pt-1 animate-fade-in">
                  {/* Participant Counter */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">Total People Splitting</span>
                      <p className="text-xs text-indigo-600 font-medium">Split evenly between 2 to 10 members</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (splitCount > 2) {
                            const newCount = splitCount - 1;
                            setSplitCount(newCount);
                            setSplitPayerNames(prev => prev.slice(0, newCount));
                          }
                        }}
                        disabled={splitCount <= 2}
                        className="w-9 h-9 rounded-xl bg-white border border-indigo-200 text-indigo-900 font-black text-lg flex items-center justify-center hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
                      >
                        -
                      </button>
                      <div className="text-center min-w-[3rem]">
                        <span className="text-xl font-black text-indigo-950">{splitCount}</span>
                        <span className="text-[10px] text-indigo-700 block font-bold">Members</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (splitCount < 10) {
                            const newCount = splitCount + 1;
                            setSplitCount(newCount);
                            setSplitPayerNames(prev => [...prev, `Friend ${newCount}`]);
                          }
                        }}
                        disabled={splitCount >= 10}
                        className="w-9 h-9 rounded-xl bg-white border border-indigo-200 text-indigo-900 font-black text-lg flex items-center justify-center hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Per Person Breakdown Banner */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white flex items-center justify-between shadow-xs">
                    <div>
                      <p className="text-[11px] font-semibold text-indigo-100 uppercase tracking-wide">Each Person Pays</p>
                      <p className="text-xl font-black">₹{splitPerPersonAmt.toLocaleString()}</p>
                    </div>
                    <div className="text-right text-xs text-indigo-100">
                      <span>Total: ₹{splitBaseAmount.toLocaleString()}</span>
                      <span className="block text-[11px] opacity-80">({splitCount} × ₹{splitPerPersonAmt.toLocaleString()})</span>
                    </div>
                  </div>

                  {/* Payment Distribution Option */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Organizer Payment Mode:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSplitInitiatorPaysNow(true)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          splitInitiatorPaysNow
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <p className="text-xs font-black text-slate-900">Pay My Share Now (₹{splitPerPersonAmt})</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">You pay your part now, friends receive payment links</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSplitInitiatorPaysNow(false)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          !splitInitiatorPaysNow
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <p className="text-xs font-black text-slate-900">Collect All via Links (₹0 Now)</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Hold slot and generate split links for all members</p>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                  <span className="text-base">💡</span>
                  <p>Turn on <strong>Split Bill</strong> to automatically divide the amount between you and your group with shareable payment links.</p>
                </div>
              )}
            </div>
            )}

            {/* 4. Payment Method */}
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
                  <span className="text-gray-600 font-medium">
                    {isPgStay ? 'Monthly Stay Rent / Advance' : isDining ? (basePrice === 0 ? 'Table Reservation' : 'Table Reservation Deposit') : 'Base Price'}
                  </span>
                  <span className="font-bold text-gray-900">
                    {isDining && basePrice === 0 ? 'FREE' : `₹${basePrice.toLocaleString()}`}
                  </span>
                </div>
                {isDining && diningPreordersTotal > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-700 font-medium">Chef Specialties Pre-Order</span>
                    <span className="font-bold text-emerald-700">+₹{diningPreordersTotal.toLocaleString()}</span>
                  </div>
                )}
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

                  {payMode === 'PAY_AT_VENUE' && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-emerald-900">
                        <span>Pay Online Now:</span>
                        <span>₹0</span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Due at Venue on Arrival:</span>
                        <span className="font-bold">₹{total.toLocaleString()}</span>
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

                {/* ============================================================
                 * Transparent Cancellation, Refund & Overdue Policy Card
                 * ============================================================ */}
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>🛡️</span> Cancellation & Refund Policy
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Zero Conflict Guarantee
                    </span>
                  </div>

                  {isMiniSpace ? (
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span><strong>Free Cancellation:</strong> 100% refund up to 2 hours before scheduled drop time.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">⚠</span>
                        <span><strong>Late Cancellation (within 2h):</strong> 50% refund credited back to your original source.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">⏱</span>
                        <span><strong>Overdue Collection:</strong> 15 mins free grace period. Delayed pickup beyond grace period is billed hourly upon collection.</span>
                      </div>
                    </div>
                  ) : isPgStay ? (
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span><strong>Inspection Guarantee:</strong> Free visit before move-in. Full advance refundable if room does not match listing.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">📜</span>
                        <span><strong>Notice Period:</strong> 30 days standard notice required for security deposit return.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span><strong>Free Cancellation:</strong> 100% refund up to 24 hours prior to check-in / start time.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">⚠</span>
                        <span><strong>Late Cancel / No-Show:</strong> Standard cancellation terms apply as per vendor partner policy.</span>
                      </div>
                    </div>
                  )}
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
                  ) : payMode === 'PAY_AT_VENUE' ? (
                    <><Shield size={18} /> Confirm Reservation (Pay at Venue)</>
                  ) : isDining ? (
                    <><Shield size={18} /> {amountToPayNow === 0 ? 'Confirm Table Reservation' : `Pay ₹${amountToPayNow.toLocaleString()} & Confirm Table`}</>
                  ) : payMode === 'PARTIAL_ADVANCE' ? (
                    <><Shield size={18} /> Pay ₹{amountToPayNow.toLocaleString()} Advance & Lock Slot</>
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
