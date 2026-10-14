'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, CreditCard, Clock, MapPin, ArrowLeft, ChevronRight, AlertCircle, Check, User, Phone, Home, Bed, Users } from 'lucide-react';
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
  const isHotel = Boolean(selectedService.metadata?.hotelBooking);
  const availableAddons = meta.addons || [];
  const addonsTotal = selectedAddons.reduce((sum: number, idx: number) => sum + (availableAddons[idx]?.price || 0), 0);
  
  const basePrice = isHotel 
    ? Math.round(selectedService.price / 1.12) // extract pre-tax price from inclusive total
    : (listing?.price || selectedService.price || 0);

  const platformFee = 29;
  const gst = isHotel 
    ? (selectedService.price - basePrice) // exact 12% GST calculated in template
    : Math.round((basePrice + addonsTotal) * 0.18);

  const total = isHotel 
    ? (selectedService.price + addonsTotal + platformFee) 
    : (basePrice + addonsTotal + platformFee + gst);

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

      const newBooking = {
        id: String(Date.now()),
        ref,
        serviceId: selectedService.id,
        serviceName: listing?.name || selectedService.name,
        merchantName: selectedService.merchant?.name || selectedService.merchant || '',
        merchantId: selectedService.merchantObj?.id || selectedService.merchantId || (typeof selectedService.merchant === 'string' ? selectedService.merchant : selectedService.merchant?.id) || '',
        category: selectedService.category?.name || selectedService.category || 'Default',
        date: selectedSlot.date,
        time: selectedSlot.time,
        amount: total,
        status: 'PENDING' as const,
        city: selectedService.city,
        durationMinutes: selectedService.duration,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes: notes || '',
        bookedAt: new Date().toISOString(),
        paymentMethod,
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
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-extrabold text-lg">Complete Your Booking</h1>
            <p className="text-xs text-gray-500 font-medium">{selectedService.merchant}</p>
          </div>
          {timeLeft > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full">
              <Clock size={12} /><span>Expires in {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-4">

            {/* ── Booking Summary Card ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-extrabold text-base text-gray-900">📋 Booking Summary</h2>
              </div>
              <div className="flex gap-4 p-5">
                {(listing?.imageUrl || listing?.image || selectedService.images?.[0]) && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={listing?.imageUrl || listing?.image || selectedService.images?.[0]}
                      alt={listing?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-extrabold text-lg text-gray-900">{listing?.name || selectedService.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{selectedService.name} · {selectedService.merchant}</p>

                  {/* Dynamic Hotel / Listing Details */}
                  {selectedService.metadata?.hotelBooking ? (
                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 flex items-center gap-1">
                          <Bed size={12} /> {selectedService.metadata.hotelBooking.roomType}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 flex items-center gap-1">
                          🍴 {selectedService.metadata.hotelBooking.mealPlan}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100 flex items-center gap-1">
                          <Users size={12} /> {selectedService.metadata.hotelBooking.rooms} Room, {selectedService.metadata.hotelBooking.adults} Adults{selectedService.metadata.hotelBooking.children > 0 ? `, ${selectedService.metadata.hotelBooking.children} Kids` : ''}
                        </span>
                        {selectedService.metadata.hotelBooking.nights > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 flex items-center gap-1">
                            <Clock size={12} /> {selectedService.metadata.hotelBooking.nights} Night{selectedService.metadata.hotelBooking.nights > 1 ? 's' : ''} Stay
                          </span>
                        )}
                      </div>

                      {/* Check-in & Check-out details */}
                      <div className="grid grid-cols-2 gap-2 pt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold block text-[10px] uppercase">Check-In</span>
                          <span className="font-extrabold text-gray-800">{selectedService.metadata.hotelBooking.checkIn}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block text-[10px] uppercase">Check-Out</span>
                          <span className="font-extrabold text-gray-800">{selectedService.metadata.hotelBooking.checkOut}</span>
                        </div>
                      </div>

                      {selectedService.metadata.hotelBooking.specialRequests?.length > 0 && (
                        <div className="text-[11px] text-gray-500 font-medium">
                          <strong>Special Requests:</strong> {selectedService.metadata.hotelBooking.specialRequests.join(', ')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {meta.roomType && (
                        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 flex items-center gap-1">
                          <Bed size={11} />{meta.roomType}
                        </span>
                      )}
                      {meta.maxGuests && (
                        <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100 flex items-center gap-1">
                          <Users size={11} />Max {meta.maxGuests} guests
                        </span>
                      )}
                      {meta.checkInTime && (
                        <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 flex items-center gap-1">
                          <Clock size={11} />Check-in: {meta.checkInTime}
                        </span>
                      )}
                      {meta.checkOutTime && (
                        <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-100 flex items-center gap-1">
                          <Clock size={11} />Check-out: {meta.checkOutTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add-ons Section */}
              {availableAddons.length > 0 && (
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Add-ons & Extras</h3>
                  <div className="space-y-2">
                    {availableAddons.map((addon: any, idx: number) => {
                      const isSelected = selectedAddons.includes(idx);
                      return (
                        <label key={idx} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)]' : 'border-gray-300 bg-white'}`}>
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                            <span className={`text-sm font-bold ${isSelected ? 'text-[color:var(--color-primary)]' : 'text-gray-700'}`}>{addon.name}</span>
                          </div>
                          <span className="text-sm font-extrabold text-gray-900">+₹{addon.price}</span>
                          <input type="checkbox" className="hidden" checked={isSelected} onChange={() => {
                            if (isSelected) setSelectedAddons(selectedAddons.filter(i => i !== idx));
                            else setSelectedAddons([...selectedAddons, idx]);
                          }} />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-extrabold text-gray-900 leading-tight">{formatDate(selectedSlot.date)}</p>
                </div>
                <div className="bg-[color:var(--color-primary)]/5 rounded-xl p-3 border border-[color:var(--color-primary)]/20">
                  <p className="text-[10px] font-black text-[color:var(--color-primary)] uppercase tracking-wider mb-1">Time Slot</p>
                  <p className="text-sm font-extrabold text-gray-900">{selectedSlot.time}</p>
                </div>
              </div>
            </div>

            {/* ── User Details ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-extrabold text-base text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-[color:var(--color-primary)]" /> Your Details
              </h2>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Vinoth Kumar"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wider">Email (optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Payment Method ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-extrabold text-base text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-[color:var(--color-primary)]" /> Payment Method
              </h2>

              <div className="space-y-2">
                {[
                  { id: 'upi', label: 'UPI / QR Code', sub: 'Google Pay, PhonePe, Paytm', icon: '📱' },
                  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                  { id: 'netbanking', label: 'Net Banking', sub: 'All major banks supported', icon: '🏦' },
                ].map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5'
                        : 'border-gray-100 hover:border-gray-200'
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
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === method.id ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <Shield size={13} className="text-green-500" /> 256-bit SSL encrypted · Powered by Razorpay
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Price Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-extrabold text-base text-gray-900">💰 Price Details</h2>
              </div>

              <div className="p-5 space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Base Price</span>
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
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">GST</span>
                    <span className="text-xs text-gray-400 ml-1">(18%)</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{gst.toLocaleString()}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-900 text-base">Total Amount</span>
                    <span className="font-black text-2xl text-[color:var(--color-primary)]">₹{total.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-0.5">Inclusive of all taxes</p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={isSubmitting || timeLeft === 0}
                  className={`w-full py-4 rounded-xl font-extrabold text-base transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isSubmitting
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
                  ) : (
                    <><Shield size={18} /> Pay & Confirm ₹{total.toLocaleString()}</>
                  )}
                </button>

                {timeLeft > 0 ? (
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Clock size={11} />Slot held for <span className="font-bold text-amber-600 font-mono">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
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
