'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, useBookingFlowStore } from '../../lib/store';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { RECOMMENDED_ITEMS } from '../../lib/homeData';
import { WishlistButton, CartAddButton } from '../../components/home/HomeShared';

export default function CartPage() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const clearCart = useCartStore(state => state.clearCart);

  const router = useRouter();
  const { addBooking } = useBookingFlowStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handlePayment = () => {
    // Generate bookings from cart items
    items.forEach(item => {
      addBooking({
        id: `BKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ref: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        merchantId: 'merchant-id', // default
        merchantName: 'BOKSPOT Merchant',
        serviceId: item.id,
        serviceName: item.title,
        amount: (item.price || 0) * item.quantity,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: '10:00 AM', // Default time
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      } as any);
    });

    clearCart();

    // Redirect to user tracks page where bookings are shown
    router.push('/booking');
  };

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const scrollRecommended = (direction: 'left' | 'right') => {
    if (recommendedScrollRef.current) {
      const scrollAmount = 320;
      recommendedScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.10; // 10% tax
  const serviceFee = items.length > 0 ? 500 : 0; // Flat ₹500 fee if items exist
  const totalAmount = subtotal + tax + serviceFee;

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-[104px] sm:pt-[110px] pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0A3161] tracking-tight mb-2">Your Cart</h1>
          <p className="text-slate-500 font-medium">Review your selected services before checkout.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {items.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">shopping_cart</span>
                <h3 className="text-lg font-bold text-slate-700">Your cart is empty</h3>
                <p className="text-slate-500 text-sm mt-1 mb-4">Looks like you haven't added any services yet.</p>
                <Link href="/" className="text-[#0056b3] font-semibold hover:underline">
                  Browse Services
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/50 hover:shadow-md transition-shadow">

                  <Link href="/booking" className="flex items-center gap-4 flex-1 group hover:opacity-80 transition-opacity">
                    {/* Icon / Image */}
                    <div className={`w-14 h-14 shrink-0 rounded-xl bg-${item.iconColor || 'blue'}-50 flex items-center justify-center text-${item.iconColor || 'blue'}-600 overflow-hidden`}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="material-symbols-outlined text-[24px]">{item.icon || 'sell'}</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-[#0056b3] transition-colors">{item.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        {item.date && (
                          <>
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            <span>{item.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Quantity & Price & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pl-0 md:pl-4 mt-3 md:mt-0 border-t border-slate-100 md:border-t-0 pt-3 md:pt-0">

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-8 text-center font-bold text-slate-700 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="font-bold text-slate-800 text-[15px] md:text-[17px] whitespace-nowrap min-w-[80px] text-right">
                      {formatCurrency((item.price || 0) * item.quantity)}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>

                </div>
              ))
            )}

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/80 sticky top-[120px]">

              <h2 className="text-[17px] font-bold text-slate-800 pb-4 border-b border-slate-100 mb-4">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3.5 mb-6">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-700 font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Tax (10%)</span>
                  <span className="text-slate-700 font-semibold">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Service Fee</span>
                  <span className="text-slate-700 font-semibold">{formatCurrency(serviceFee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-slate-100 mb-6">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#0056b3] tracking-tight">{formatCurrency(totalAmount)}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={items.length === 0}
                className="w-full bg-[#0056b3] hover:bg-[#004494] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                Proceed to Payment
                <span className="material-symbols-outlined text-[18px]">payment</span>
              </button>

              <p className="text-center text-xs text-slate-400 mt-5 font-medium flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Secure checkout. Easy cancellations.
              </p>

            </div>
          </div>

        </div>

        {/* Recommended Items Carousel */}
        <div className="mt-16 mb-8 border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0A3161] tracking-tight">
                Recommended based on your Booking trends
              </h2>
              <p className="text-sm text-slate-500 mt-1">Inspired by the items in your cart</p>
            </div>
          </div>

          <div className="relative group">
            {/* Left Arrow */}
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-lg transition-all text-slate-600 z-10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-slate-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Right Arrow */}
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-lg transition-all text-slate-600 z-10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-slate-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div 
              ref={scrollRef}
              className="flex gap-4 pb-6 pt-2 overflow-x-auto snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2"
            >
            {RECOMMENDED_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="w-[280px] lg:w-[calc(20%-12px)] shrink-0 group flex flex-col self-stretch snap-start"
              >
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[340px] overflow-hidden">
                  {/* Image Section */}
                  <div className="relative flex-1 w-full overflow-hidden rounded-b-[20px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <WishlistButton item={item} />
                    <CartAddButton item={item} />
                    {/* Badge */}
                    {item.badge && (
                      <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[10px]">sell</span>
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Content Section (3 Lines) */}
                  <div className="px-3 pt-2.5 pb-2.5 flex flex-col justify-center bg-white">
                    {/* Line 1: Title */}
                    <h3 className="font-bold text-[13px] text-slate-800 truncate">
                      {item.title}
                    </h3>
                    
                    {/* Line 2: Location / Subtitle */}
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.location}
                    </p>

                    {/* Line 3: Rating & Price */}
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-[11px] font-bold text-slate-700">{item.ratingScore || '4.5'}</span>
                        <span className="text-[10px] text-slate-400">({item.usersCount || '50+'})</span>
                      </div>
                      <div className="text-[13px] font-extrabold text-slate-800">
                        {item.price || 'View'}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
