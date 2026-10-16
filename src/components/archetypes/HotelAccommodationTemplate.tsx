'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Wifi, 
  Coffee, 
  Tv, 
  Wind, 
  Bed, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Clock, 
  Building2, 
  CreditCard, 
  QrCode, 
  Plus, 
  Minus,
  AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useBookingFlowStore } from '@/lib/store';

interface HotelAccommodationTemplateProps {
  service: any;
}

export default function HotelAccommodationTemplate({ service }: HotelAccommodationTemplateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedService, setSelectedSlot } = useBookingFlowStore();

  // Booking mode: Standard Multi-Night Stay vs Day-Use Transit (Hourly Refresh)
  const [stayMode, setStayMode] = useState<'NIGHTS' | 'TRANSIT'>('NIGHTS');

  // Dates state for Multi-night stay (check query params first)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDateYMD = (d: Date) => d.toISOString().split('T')[0];

  const queryCheckIn = searchParams?.get('checkIn');
  const queryCheckOut = searchParams?.get('checkOut');
  const queryAdults = Number(searchParams?.get('adults'));
  const queryChildren = Number(searchParams?.get('children'));
  const queryRooms = Number(searchParams?.get('rooms'));
  const queryPets = searchParams?.get('pets') === 'true';

  const [checkInDate, setCheckInDate] = useState<string>(queryCheckIn || formatDateYMD(today));
  const [checkOutDate, setCheckOutDate] = useState<string>(queryCheckOut || formatDateYMD(tomorrow));

  // Transit mode: selected slot
  const [transitSlot, setTransitSlot] = useState<string>('09:00 AM - 01:00 PM (4h)');

  // Guest popover state
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [roomsCount, setRoomsCount] = useState(queryRooms > 0 ? queryRooms : 1);
  const [adultsCount, setAdultsCount] = useState(queryAdults > 0 ? queryAdults : 2);
  const [childrenCount, setChildrenCount] = useState(queryChildren >= 0 ? queryChildren : 0);
  const [petsAllowed, setPetsAllowed] = useState(queryPets);

  // Selected room category and meal plan
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-deluxe');
  const [selectedMealPlan, setSelectedMealPlan] = useState<'EP' | 'CP' | 'MAP'>('CP'); // CP = Breakfast included

  // Special requests
  const [specialRequests, setSpecialRequests] = useState<string[]>(['Early Check-in if available']);

  // Calculate nights
  const nights = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  // Hotel rooms data from metadata or curated luxury options
  const rawListings = service.metadata?.listings || service.rawConfig?.metadata?.listings || [];
  const baseTariff = Number(service.price) || 3500;

  const roomCategories = useMemo(() => {
    if (rawListings.length > 0) {
      return rawListings.map((l: any, idx: number) => {
        const meta = l.metadata || {};
        const realAmenities = Array.isArray(meta.amenities) 
          ? meta.amenities 
          : typeof meta.amenities === 'string' && meta.amenities.trim() !== ''
            ? meta.amenities.split(',').map((s: string) => s.trim())
            : (l.amenities || ['Free Wi-Fi', 'AC & Climate Control', 'City View', 'Smart TV 55"', 'Walk-in Shower']);

        const roomImg = l.imageUrl || l.image || meta.imageUrl || meta.images?.[0] || `https://images.unsplash.com/photo-${idx === 0 ? '1618773928121-c32242e63f39' : idx === 1 ? '1590490360182-c33d57733427' : '1582719478250-c89cae4dc85b'}?w=700&auto=format&fit=crop&q=70`;

        return {
          id: l.id || `room-${idx}`,
          name: l.name || meta.roomType || 'Executive Room',
          description: l.description || (meta.roomType ? `${meta.roomType} room with comfortable bedding and essential amenities.` : 'Spacious modern room with ergonomic workspace and high-speed Wi-Fi.'),
          basePrice: Number(l.basePrice || l.price) || baseTariff,
          maxGuests: Number(meta.maxGuests) || Number(l.maxGuests) || 2,
          bedType: meta.bedType || l.bedType || '1 King Bed or 2 Twins',
          sizeSqFt: meta.sizeSqFt || l.sizeSqFt || 320,
          amenities: realAmenities,
          image: roomImg,
          inventoryLeft: Number(meta.totalUnits) || Number(l.inventoryLeft) || 3,
          checkInTime: meta.checkInTime,
          checkOutTime: meta.checkOutTime,
          addons: meta.addons || []
        };
      });
    }

    return [
      {
        id: 'room-deluxe',
        name: 'Deluxe City View Room',
        description: 'Soundproof room with floor-to-ceiling glass offering skyline views, luxury mattress, and bespoke marble bath.',
        basePrice: baseTariff,
        maxGuests: 2,
        bedType: '1 Ultra-Comfort King Bed',
        sizeSqFt: 340,
        amenities: ['Free High-Speed Wi-Fi', 'Individual AC', 'Coffee Machine', '4K Smart TV', 'Rain Shower'],
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&auto=format&fit=crop&q=70',
        inventoryLeft: 2
      },
      {
        id: 'room-executive',
        name: 'Executive Club Suite',
        description: 'Separate living salon, dedicated executive work desk, deep soaking tub, and access to VIP lounge refreshments.',
        basePrice: Math.round(baseTariff * 1.55),
        maxGuests: 3,
        bedType: '1 Royal California King',
        sizeSqFt: 520,
        amenities: ['VIP Lounge Access', 'Bathtub & Rain Shower', 'Complimentary Mini-Bar', 'Express Laundry', 'Balcony'],
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=70',
        inventoryLeft: 4
      },
      {
        id: 'room-presidential',
        name: 'Presidential Penthouse Suite',
        description: 'Top floor panoramic city views, private dining area, master walk-in wardrobe, and 24/7 dedicated butler service.',
        basePrice: Math.round(baseTariff * 2.8),
        maxGuests: 4,
        bedType: '2 King Master Suites',
        sizeSqFt: 980,
        amenities: ['24/7 Butler Service', 'Jacuzzi with View', 'Private Elevator Key', 'Chauffeur Airport Drop', 'Living & Dining Hall'],
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop&q=70',
        inventoryLeft: 1
      }
    ];
  }, [rawListings, baseTariff]);

  const selectedRoom = roomCategories.find((r: any) => r.id === selectedRoomId) || roomCategories[0];

  // Meal Plan pricing adjustments
  const mealPlanAddon = selectedMealPlan === 'CP' ? 450 : selectedMealPlan === 'MAP' ? 1100 : 0;
  
  // Pricing Calculation
  const pricePerNight = (selectedRoom.basePrice + mealPlanAddon) * roomsCount;
  const totalPrice = stayMode === 'NIGHTS' ? pricePerNight * nights : Math.round(selectedRoom.basePrice * 0.45 * roomsCount);
  const taxes = Math.round(totalPrice * 0.12); // 12% GST standard
  const finalPayable = totalPrice + taxes;

  const toggleSpecialRequest = (req: string) => {
    setSpecialRequests(prev => 
      prev.includes(req) ? prev.filter(r => r !== req) : [...prev, req]
    );
  };

  const handleConfirmReservation = () => {
    const slotString = stayMode === 'NIGHTS' 
      ? `${checkInDate} to ${checkOutDate} (${nights} Night${nights > 1 ? 's' : ''})`
      : `${checkInDate} | Transit Slot: ${transitSlot}`;

    const reservationPayload = {
      ...service,
      price: finalPayable,
      name: `${service.name || 'Hotel Stay'} — ${selectedRoom.name}`,
      metadata: {
        ...(service.metadata || {}),
        hotelBooking: {
          stayMode,
          checkIn: checkInDate,
          checkOut: stayMode === 'NIGHTS' ? checkOutDate : checkInDate,
          nights: stayMode === 'NIGHTS' ? nights : 0,
          transitSlot: stayMode === 'TRANSIT' ? transitSlot : null,
          rooms: roomsCount,
          adults: adultsCount,
          children: childrenCount,
          pets: petsAllowed,
          roomType: selectedRoom.name,
          mealPlan: selectedMealPlan === 'EP' ? 'Room Only' : selectedMealPlan === 'CP' ? 'Free Buffet Breakfast' : 'Breakfast + Dinner Included',
          specialRequests,
          digitalKeyPassEligible: true
        }
      }
    };

    setSelectedService(reservationPayload);
    setSelectedSlot({
      id: `hotel-slot-${Date.now()}`,
      timeStr: slotString,
      date: checkInDate,
      available: true
    });

    router.push('/booking/checkout');
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 pb-36">
      {/* ─── Top Luxury Navigation Bar ─── */}
      <div className="sticky top-0 z-40 bg-[#0c121e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Search</span>
          </button>

          <div className="text-center">
            <h1 className="font-black text-sm md:text-base text-white truncate max-w-[240px] md:max-w-md">
              {service.name || 'Bokspot Verified Luxury Stay'}
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <MapPin size={12} className="text-[#ff6325]" />
              {service.merchant || service.city || 'Chennai Central, Tamil Nadu'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#ff6325]/15 border border-[#ff6325]/30 text-[#ff6325] px-3 py-1 rounded-full text-xs font-black">
            <ShieldCheck size={14} />
            <span>MMT & Agoda Assured</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-8">
        
        {/* ─── Hero Billboard & Trust Badges ─── */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0e1626] shadow-2xl">
          <div className="h-64 sm:h-80 md:h-96 w-full relative">
            <img 
              src={selectedRoom.image || service.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80'} 
              alt={service.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/40 to-black/30" />
            
            {/* Badges on hero */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-[#ff6325] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles size={12} /> Bokspot Exclusive
              </span>
              <span className="bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> Couple Friendly & Local IDs Accepted
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-300 font-bold bg-white/10 backdrop-blur-md px-2 py-0.5 rounded">4.9 / 5 (840+ verified guests)</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {service.name || 'Taj Gateway Luxury Residency'}
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl line-clamp-2">
                  {service.description || '5-star hospitality sanctuary with rooftop infinity pool, 24/7 in-room gourmet dining, signature spa, and express high-speed airport connectivity.'}
                </p>
              </div>

              {/* Price Callout */}
              <div className="bg-[#0c1424]/90 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shrink-0 shadow-2xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Starting From</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#ff6325]">₹{selectedRoom.basePrice}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ night</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <Check size={11} strokeWidth={3} /> Free Cancellation until 24 hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stay Mode Switcher: Full Nights vs Day-Use Transit ─── */}
        <div className="flex items-center justify-center">
          <div className="bg-[#0f182b] p-1.5 rounded-2xl border border-white/10 flex gap-2 shadow-xl">
            <button
              onClick={() => setStayMode('NIGHTS')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                stayMode === 'NIGHTS'
                  ? 'bg-gradient-to-r from-[#ff6325] to-[#e04e13] text-white shadow-lg shadow-[#ff6325]/25 scale-102'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bed size={16} />
              <span>Full Stay (Overnight)</span>
            </button>
            <button
              onClick={() => setStayMode('TRANSIT')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                stayMode === 'TRANSIT'
                  ? 'bg-gradient-to-r from-[#ff6325] to-[#e04e13] text-white shadow-lg shadow-[#ff6325]/25 scale-102'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock size={16} />
              <span>Day-use / Hourly Transit (Up to 60% Off)</span>
            </button>
          </div>
        </div>

        {/* ─── Booking Controller (Dates, Nights & Guests Matrix) ─── */}
        <div className="bg-[#0e1628] rounded-3xl p-6 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {stayMode === 'NIGHTS' ? (
              <>
                {/* Check-In */}
                <div className="md:col-span-3 bg-[#131d33] border border-white/10 rounded-2xl p-3.5 focus-within:border-[#ff6325] transition-all">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                    Check-in (From 12:00 PM)
                  </label>
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon size={18} className="text-[#ff6325]" />
                    <input 
                      type="date" 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="bg-transparent font-bold text-sm w-full outline-none text-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Duration Nights Indicator */}
                <div className="md:col-span-2 flex flex-col items-center justify-center py-1">
                  <div className="bg-[#ff6325]/15 text-[#ff6325] border border-[#ff6325]/30 rounded-full px-3 py-1 text-xs font-black flex items-center gap-1 shadow-sm">
                    <Bed size={13} />
                    <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                </div>

                {/* Check-Out */}
                <div className="md:col-span-3 bg-[#131d33] border border-white/10 rounded-2xl p-3.5 focus-within:border-[#ff6325] transition-all">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                    Check-out (Until 11:00 AM)
                  </label>
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon size={18} className="text-[#ff6325]" />
                    <input 
                      type="date" 
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate}
                      className="bg-transparent font-bold text-sm w-full outline-none text-white cursor-pointer"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Transit Date */}
                <div className="md:col-span-4 bg-[#131d33] border border-white/10 rounded-2xl p-3.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                    Transit Refresh Date
                  </label>
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon size={18} className="text-[#ff6325]" />
                    <input 
                      type="date" 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="bg-transparent font-bold text-sm w-full outline-none text-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Transit Slot Selector */}
                <div className="md:col-span-4 bg-[#131d33] border border-white/10 rounded-2xl p-3.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                    Select Hours Window
                  </label>
                  <select
                    value={transitSlot}
                    onChange={(e) => setTransitSlot(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="06:00 AM - 10:00 AM (4h)" className="bg-[#0f182b] text-white">06:00 AM - 10:00 AM (Early Morning Refresh)</option>
                    <option value="09:00 AM - 01:00 PM (4h)" className="bg-[#0f182b] text-white">09:00 AM - 01:00 PM (Morning Power Stop)</option>
                    <option value="01:00 PM - 07:00 PM (6h)" className="bg-[#0f182b] text-white">01:00 PM - 07:00 PM (Afternoon Transit & Nap)</option>
                    <option value="08:00 PM - 02:00 AM (6h)" className="bg-[#0f182b] text-white">08:00 PM - 02:00 AM (Night Layover)</option>
                  </select>
                </div>
              </>
            )}

            {/* Room & Guests Popover Button */}
            <div className="md:col-span-4 relative">
              <button
                type="button"
                onClick={() => setGuestsOpen(!guestsOpen)}
                className="w-full bg-[#131d33] hover:bg-[#18243e] border border-white/10 rounded-2xl p-3.5 text-left flex items-center justify-between transition-all"
              >
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
                    Rooms & Guests
                  </span>
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Users size={16} className="text-[#ff6325]" />
                    <span>{roomsCount} Room, {adultsCount} Adults{childrenCount > 0 ? `, ${childrenCount} Kids` : ''}{petsAllowed ? ' • 🐾 Pets' : ''}</span>
                  </div>
                </div>
                <ChevronRight size={18} className={`text-slate-400 transition-transform ${guestsOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Guest Selector Dropdown Modal */}
              <AnimatePresence>
                {guestsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-[#0c1424] border border-white/15 rounded-2xl p-5 shadow-2xl z-50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-white">Rooms</div>
                        <div className="text-[11px] text-slate-400">Total rooms to reserve</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))} 
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-white w-4 text-center">{roomsCount}</span>
                        <button 
                          onClick={() => setRoomsCount(Math.min(5, roomsCount + 1))} 
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <div className="font-bold text-sm text-white">Adults</div>
                        <div className="text-[11px] text-slate-400">Ages 12+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))} 
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-white w-4 text-center">{adultsCount}</span>
                        <button 
                          onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))} 
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <div className="font-bold text-sm text-white">Children</div>
                        <div className="text-[11px] text-slate-400">Ages 0 - 11</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))} 
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-white w-4 text-center">{childrenCount}</span>
                        <button 
                          onClick={() => setChildrenCount(Math.min(6, childrenCount + 1))} 
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Travelling with Pets */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>🐾 Travelling with pets?</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Pet-friendly accommodation</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={petsAllowed}
                        onChange={(e) => setPetsAllowed(e.target.checked)}
                        className="w-4 h-4 rounded text-[#ff6325] accent-[#ff6325] cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={() => setGuestsOpen(false)}
                      className="w-full mt-2 py-2 bg-[#ff6325] hover:bg-[#e04e13] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply Guests
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* ─── Room Selection Catalog (Booking.com & Agoda Style) ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Building2 size={22} className="text-[#ff6325]" />
                Select Your Room Category
              </h3>
              <p className="text-xs text-slate-400">All room rates include high-speed Wi-Fi & access to hotel amenities.</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              {roomCategories.length} Categories Available
            </span>
          </div>

          <div className="space-y-5">
            {roomCategories.map((room: any) => {
              const isSelected = room.id === selectedRoomId;
              const displayRoomPrice = stayMode === 'NIGHTS' ? room.basePrice : Math.round(room.basePrice * 0.45);

              return (
                <div 
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? 'bg-[#10192e] border-[#ff6325] shadow-2xl ring-2 ring-[#ff6325]/30' 
                      : 'bg-[#0d1424] border-white/10 hover:border-white/25 hover:bg-[#0f172a]'
                  }`}
                >
                  {/* Real-time Inventory urgency badge */}
                  {room.inventoryLeft <= 2 && (
                    <div className="absolute top-4 right-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <AlertCircle size={11} /> Only {room.inventoryLeft} left at this price!
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Room Thumbnail & Gallery preview */}
                    <div className="lg:col-span-4 rounded-2xl overflow-hidden h-48 sm:h-52 relative border border-white/10">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5">
                        <Bed size={13} className="text-[#ff6325]" />
                        <span>{room.bedType}</span>
                      </div>
                    </div>

                    {/* Room Specs & Amenities */}
                    <div className="lg:col-span-5 space-y-3">
                      <div>
                        <h4 className="text-lg font-black text-white">{room.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{room.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                          📐 {room.sizeSqFt} sq.ft
                        </span>
                        <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                          👥 Up to {room.maxGuests} Guests
                        </span>
                        {room.checkInTime && (
                          <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1">
                            <Clock size={12} className="text-[#ff6325]" /> In: {room.checkInTime}
                          </span>
                        )}
                        {room.checkOutTime && (
                          <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1">
                            <Clock size={12} className="text-amber-400" /> Out: {room.checkOutTime}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {room.amenities.map((am: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                            <Check size={13} className="text-emerald-400 shrink-0" />
                            <span className="truncate">{am}</span>
                          </div>
                        ))}
                      </div>

                      {/* Room Add-ons if provided */}
                      {room.addons && room.addons.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {room.addons.map((add: any, i: number) => (
                            <span key={i} className="text-[10px] font-bold bg-[#ff6325]/10 border border-[#ff6325]/20 text-[#ff6325] px-2 py-0.5 rounded-md">
                              + {add.name} (₹{add.price})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing & Selection Column */}
                    <div className="lg:col-span-3 flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          {stayMode === 'NIGHTS' ? `Price per Night (excl. tax)` : `Transit Price`}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-[#ff6325]">₹{displayRoomPrice}</span>
                          <span className="text-xs text-slate-400 font-semibold">{stayMode === 'NIGHTS' ? '/ night' : ''}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold mt-1">
                          ✓ Free cancellation till 24h before
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#ff6325] text-white shadow-lg shadow-[#ff6325]/30'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                        <span>{isSelected ? 'Room Selected' : 'Select Room'}</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Meal Plan & Inclusions Tab (MakeMyTrip / Agoda Feature) ─── */}
        <div className="bg-[#0e1628] rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Coffee size={20} className="text-[#ff6325]" />
            Choose Your Dining & Meal Plan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* EP - Room Only */}
            <div 
              onClick={() => setSelectedMealPlan('EP')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedMealPlan === 'EP' 
                  ? 'bg-[#121c32] border-[#ff6325] ring-1 ring-[#ff6325]' 
                  : 'bg-[#101726] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-extrabold text-sm text-white">Room Only</span>
                <span className="text-xs font-bold text-slate-400">+₹0</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">Ideal for travelers with external dining plans. Pay only for the room.</p>
            </div>

            {/* CP - With Free Buffet Breakfast (Recommended) */}
            <div 
              onClick={() => setSelectedMealPlan('CP')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                selectedMealPlan === 'CP' 
                  ? 'bg-[#121c32] border-[#ff6325] ring-1 ring-[#ff6325]' 
                  : 'bg-[#101726] border-white/10 hover:border-white/20'
              }`}
            >
              <span className="absolute -top-2.5 right-4 bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                Popular Choice
              </span>
              <div className="flex justify-between items-start mb-2">
                <span className="font-extrabold text-sm text-white">With Free Breakfast</span>
                <span className="text-xs font-bold text-[#ff6325]">+₹450 / night</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">Lavish multi-cuisine morning buffet at hotel grand banquet (7:00 AM - 10:30 AM).</p>
            </div>

            {/* MAP - Half Board (Breakfast + Dinner) */}
            <div 
              onClick={() => setSelectedMealPlan('MAP')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedMealPlan === 'MAP' 
                  ? 'bg-[#121c32] border-[#ff6325] ring-1 ring-[#ff6325]' 
                  : 'bg-[#101726] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-extrabold text-sm text-white">Breakfast + Dinner</span>
                <span className="text-xs font-bold text-[#ff6325]">+₹1,100 / night</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">Complete gourmet dining package with 4-course chef dinner buffet included.</p>
            </div>
          </div>
        </div>

        {/* ─── Special Guest Requests & Hotel Policy ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Special Requests */}
          <div className="bg-[#0e1628] rounded-3xl p-6 border border-white/10 space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff6325]" />
              Front Desk Special Requests
            </h4>
            <div className="space-y-2 pt-1">
              {[
                'Early Check-in if available',
                'Quiet Room (High Floor)',
                'Extra Pillows & Towels in room',
                'Late Check-out priority'
              ].map((req, i) => {
                const isChecked = specialRequests.includes(req);
                return (
                  <button
                    key={i}
                    onClick={() => toggleSpecialRequest(req)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      isChecked 
                        ? 'bg-[#ff6325]/15 border-[#ff6325]/40 text-white' 
                        : 'bg-[#11192a] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{req}</span>
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isChecked ? 'bg-[#ff6325] border-[#ff6325]' : 'border-white/20'}`}>
                      {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hotel Policies & Rules */}
          <div className="bg-[#0e1628] rounded-3xl p-6 border border-white/10 space-y-3">
            <h4 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              Bokspot House Rules & Guarantee
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-[#11192a] p-2.5 rounded-xl border border-white/5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant QR Digital Pass:</strong> No standing in line; scan QR at kiosk or front desk upon arrival.</span>
              </div>
              <div className="flex items-start gap-2 bg-[#11192a] p-2.5 rounded-xl border border-white/5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Govt ID Check:</strong> Passport, Aadhaar, Driving License accepted for all adult guests at check-in.</span>
              </div>
              <div className="flex items-start gap-2 bg-[#11192a] p-2.5 rounded-xl border border-white/5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero Hidden Surcharges:</strong> Tariff includes pool, fitness studio, and high-speed Wi-Fi access.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Sticky Bottom Checkout Bar (Luxury Reservation Bar) ─── */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#0a101d]/95 backdrop-blur-2xl border-t border-white/15 px-4 py-4 shadow-[0_-10px_35px_rgba(0,0,0,0.7)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-[#ff6325]/15 border border-[#ff6325]/30 items-center justify-center text-[#ff6325]">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">₹{finalPayable}</span>
                <span className="text-[11px] text-slate-400 font-semibold">(incl. 12% GST)</span>
              </div>
              <p className="text-xs text-slate-400">
                {stayMode === 'NIGHTS' ? `${nights} Night${nights > 1 ? 's' : ''}` : 'Day Transit'} • {roomsCount} Room • {selectedRoom.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirmReservation}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#ff6325] via-[#ff7844] to-[#e04e13] hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#ff6325]/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Confirm Reservation & Generate Pass</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
