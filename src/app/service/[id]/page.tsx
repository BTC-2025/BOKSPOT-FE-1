'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, Clock, Users, Wifi, Coffee, Tv, Car, Bed, Wind, Droplets, Utensils, Heart, Star } from 'lucide-react';
import { api } from '../../../lib/api';
import { useBookingFlowStore } from '../../../lib/store';
import EventTemplate from '../../../components/archetypes/EventTemplate';
import HotelAccommodationTemplate from '../../../components/archetypes/HotelAccommodationTemplate';

const DUMMY_SLOTS = [
  { id: 'slot-1', timeStr: '8:00 AM - 9:00 AM', available: true, remaining: 3 },
  { id: 'slot-2', timeStr: '9:00 AM - 10:00 AM', available: true, remaining: 2 },
  { id: 'slot-3', timeStr: '10:00 AM - 11:00 AM', available: true, remaining: 4 },
  { id: 'slot-4', timeStr: '11:00 AM - 12:00 PM', available: false, remaining: 0 },
  { id: 'slot-5', timeStr: '12:00 PM - 1:00 PM', available: true, remaining: 1 },
  { id: 'slot-6', timeStr: '2:00 PM - 3:00 PM', available: true, remaining: 3 },
  { id: 'slot-7', timeStr: '3:00 PM - 4:00 PM', available: true, remaining: 2 },
  { id: 'slot-8', timeStr: '4:00 PM - 5:00 PM', available: true, remaining: 5 },
];

export default function DistrictServiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const listingId = searchParams?.get('listing');
  const { setSelectedService, setSelectedSlot } = useBookingFlowStore();

  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const rawService = await api.services.byId(id);
        if (active) {
          const mapped = {
            ...rawService,
            price: parseFloat(rawService.basePrice),
            merchant: rawService.merchant?.name || 'Venue',
            category: rawService.category?.name || 'Category',
          };
          setService(mapped);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load service details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) fetchService();
    return () => { active = false; };
  }, [id]);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateObj: d,
      month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
      dayName: d.toLocaleString('default', { weekday: 'short' }).toUpperCase(),
      dayNum: d.getDate(),
    };
  });

  const handleBook = (listing: any) => {
    if (!selectedSlotId) return alert('Please select a time slot first.');
    const selectedSlot = slotsToDisplay.find(s => s.id === selectedSlotId);
    setSelectedService({ ...service, selectedListing: listing });
    setSelectedSlot({
      id: selectedSlotId,
      date: dates[selectedDateIdx].dateObj.toISOString(),
      time: selectedSlot?.timeStr || '',
    });
    router.push(`/booking/checkout`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full" /></div>;
  }
  if (error || !service) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500 font-bold">{error || 'Service not found.'}</p></div>;
  }

  const listings: any[] = service.rawConfig?.metadata?.listings || service.metadata?.listings || [];

  const currentDayNameLong = dates[selectedDateIdx].dateObj.toLocaleString('en-US', { weekday: 'long' });
  const availableSlotsMap = new Map<string, any>();
  listings.forEach((l: any) => {
    if (l.schedule && Array.isArray(l.schedule)) {
      l.schedule.forEach((s: any) => {
        if (s.dayOfWeek === currentDayNameLong) {
          const timeStr = `${s.startTime} - ${s.endTime}`;
          if (!availableSlotsMap.has(timeStr)) {
            availableSlotsMap.set(timeStr, { id: `slot-${timeStr.replace(/\s+/g, '-')}`, timeStr, available: true, remaining: 1 });
          } else {
            availableSlotsMap.get(timeStr)!.remaining += 1;
          }
        }
      });
    }
  });
  let slotsToDisplay = Array.from(availableSlotsMap.values());

  const archetype = (service.metadata?.archetype || service.rawConfig?.metadata?.archetype || '').toUpperCase();
  const catLower = (service.category?.name || service.category || '').toLowerCase();
  const nameLower = (service.name || '').toLowerCase();

  if (archetype === 'EVENT' || catLower.includes('event') || catLower.includes('show') || catLower.includes('concert')) {
    return <EventTemplate service={service} />;
  }

  if (
    archetype === 'ACCOMMODATION' || 
    archetype === 'HOTEL' ||
    catLower.includes('hotel') || 
    catLower.includes('resort') || 
    catLower.includes('room') || 
    catLower.includes('stay') || 
    catLower.includes('accommodation') ||
    nameLower.includes('hotel') ||
    nameLower.includes('resort') ||
    nameLower.includes('suite')
  ) {
    return <HotelAccommodationTemplate service={service} />;
  }

  const selectedSlot = slotsToDisplay.find(s => s.id === selectedSlotId);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-extrabold text-lg leading-tight">{service.name || service.category}</h1>
            <p className="text-sm text-gray-500 font-medium">{service.merchant}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {listings.length > 0 && (
          <>
            {/* ─── DATE PICKER ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
            <div className="shrink-0 flex flex-col items-center w-10">
              <span className="text-[10px] font-black text-[color:var(--color-primary)] uppercase tracking-widest">
                {dates[selectedDateIdx].month}
              </span>
            </div>
            {dates.map((d, i) => {
              const isSelected = i === selectedDateIdx;
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDateIdx(i); setSelectedSlotId(null); }}
                  className={`flex flex-col items-center justify-center shrink-0 w-[60px] h-[68px] rounded-xl border-2 transition-all font-bold ${
                    isSelected
                      ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)] text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className="text-[10px] tracking-wider">{d.dayName.slice(0,3)}</span>
                  <span className="text-xl leading-tight mt-0.5">{d.dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── TIME SLOTS ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Time Slots Available</h2>
          <div className="flex flex-wrap gap-2">
            {slotsToDisplay.length > 0 ? (
              slotsToDisplay.map(slot => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && setSelectedSlotId(isSelected ? null : slot.id)}
                    disabled={!slot.available}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      !slot.available
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]'
                    }`}
                  >
                    {slot.timeStr}
                    {slot.available && slot.remaining <= 2 && (
                      <span className={`ml-2 text-[10px] font-black ${isSelected ? 'text-white/80' : 'text-orange-500'}`}>
                        {slot.remaining} left
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 font-medium py-2">No slots available on this date.</p>
            )}
          </div>
        </div>
        </>
        )}

        {/* ─── LISTINGS ─── */}
        <div>
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 px-1">
            {listings.length > 0 ? `${listings.length} option${listings.length !== 1 ? 's' : ''} available` : 'Available Options'}
          </h2>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400 font-medium">No listings added yet for this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing: any, idx: number) => {
                // Basic details
                const amenities = listing.description
                  ? listing.description.split('|').map((a: string) => a.trim()).filter(Boolean)
                  : [];
                const img = listing.imageUrl || listing.image || service.images?.[0] || service.image || `https://picsum.photos/seed/${listing.id || idx}/400/300`;
                const price = listing.price || service.price || 0;
                
                // Dynamic metadata from Business App form
                const meta = listing.metadata || {};
                const roomType = meta.roomType || meta.room_type;
                const checkIn = meta.checkInTime || meta.check_in_time || meta.standardCheckInTime;
                const checkOut = meta.checkOutTime || meta.check_out_time || meta.standardCheckOutTime;
                const maxGuests = meta.maxGuests || meta.max_guests || meta.maxGuestsPerRoom;
                const inventory = meta.inventory || meta.numberOfRooms || meta.number_of_rooms;
                const roomAmenities: string[] = meta.roomAmenities
                  ? (typeof meta.roomAmenities === 'string' ? meta.roomAmenities.split(',').map((a: string) => a.trim()).filter(Boolean) : meta.roomAmenities)
                  : [];

                return (
                  <div key={listing.id || idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex">
                      {/* Left: Image */}
                      <div className="w-52 shrink-0 hidden sm:block relative overflow-hidden bg-gray-100">
                        <img src={img} alt={listing.name} className="w-full h-full object-cover min-h-[200px]" />
                      </div>

                      {/* Center: Details */}
                      <div className="flex-1 p-5 flex flex-col gap-3 border-r border-gray-100 min-w-0">
                        {/* Mobile image */}
                        <div className="sm:hidden w-full h-44 rounded-xl overflow-hidden bg-gray-100 mb-1">
                          <img src={img} alt={listing.name} className="w-full h-full object-cover" />
                        </div>

                        <h3 className="text-lg font-extrabold text-gray-900">{listing.name || 'Standard Option'}</h3>

                        {/* Description amenities */}
                        {amenities.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {amenities.map((amn: string, i: number) => (
                              <span key={i} className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                <Check size={14} className="text-green-500 shrink-0" />{amn}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Dynamic Details from Business App */}
                        <div className="flex flex-wrap gap-3 mt-1">
                          {roomType && (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                              <Bed size={12} /> {roomType}
                            </span>
                          )}
                          {maxGuests && (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                              <Users size={12} /> Max {maxGuests} guests
                            </span>
                          )}
                          {inventory && (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                              🏠 {inventory} rooms
                            </span>
                          )}
                          {checkIn && (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                              <Clock size={12} /> Check-in: {checkIn}
                            </span>
                          )}
                          {checkOut && (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100">
                              <Clock size={12} /> Check-out: {checkOut}
                            </span>
                          )}
                        </div>

                        {/* Room Amenities from business */}
                        {roomAmenities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {roomAmenities.map((amn: string, i: number) => (
                              <span key={i} className="text-[11px] font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">{amn}</span>
                            ))}
                          </div>
                        )}

                        {/* Generic metadata badges (AC, WiFi, Breakfast, Parking) */}
                        {(meta.hasAC || meta.hasWiFi || meta.hasBreakfast || meta.hasParking) && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {meta.hasAC && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">❄️ AC</span>}
                            {meta.hasWiFi && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">📶 WiFi</span>}
                            {meta.hasBreakfast && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">🍳 Breakfast</span>}
                            {meta.hasParking && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">🚗 Parking</span>}
                          </div>
                        )}

                        {selectedSlot && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-primary)] mt-auto">
                            <Clock size={13} /><span>{selectedSlot.timeStr}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Price & Book */}
                      <div className="shrink-0 w-44 p-5 flex-col items-end justify-center gap-3 hidden sm:flex">
                        <div className="text-right">
                          <p className="text-2xl font-black text-gray-900">₹{price.toLocaleString()}</p>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">+ taxes & fees</p>
                        </div>
                        <button
                          onClick={() => handleBook(listing)}
                          className="w-full py-3 px-4 rounded-xl bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90 text-white font-extrabold text-sm shadow-md shadow-[color:var(--color-primary)]/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                        >
                          Booking <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile: Bottom bar */}
                    <div className="sm:hidden flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <div>
                        <p className="text-xl font-black text-gray-900">₹{price.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400 font-semibold">+ taxes & fees</p>
                      </div>
                      <button
                        onClick={() => handleBook(listing)}
                        className="px-5 py-2.5 rounded-xl bg-[color:var(--color-primary)] text-white font-extrabold text-sm shadow-md active:scale-95"
                      >
                        Booking →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── PEOPLE ALSO VIEWED ─── */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">People also viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { name: 'Hotel Avenue 11', img: 'https://picsum.photos/seed/hotel1/600/400', distance: '18.74 km from this hotel', rating: '7.4', ratingText: 'Very Good', reviews: 289, price: 4279, oldPrice: 4887, tag: '12% off', features: ['Breakfast Included', 'Free Wifi'] },
              { name: 'Four Points by Sheraton', img: 'https://picsum.photos/seed/hotel2/600/400', distance: '1.40 km from this hotel', rating: '7.7', ratingText: 'Very Good', reviews: 1055, price: 4899, oldPrice: 5350, tag: '8% off', features: ['Free Wifi'] },
              { name: 'ibis Chennai OMR', img: 'https://picsum.photos/seed/hotel3/600/400', distance: '3.27 km from this hotel', rating: '9.0', ratingText: 'Exceptional', reviews: 2097, price: 4019, oldPrice: 4399, tag: '8% off', features: ['Free Wifi'] },
            ].map((hotel, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group cursor-pointer">
                <div className="h-44 relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-white text-green-700 text-[10px] font-black px-2 py-1 rounded-full shadow-sm z-10">{hotel.tag}</span>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur flex items-center justify-center z-10 text-white hover:bg-black/40 transition-colors"><Heart size={16} /></div>
                  <img src={hotel.img} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 truncate pr-2 text-sm">{hotel.name}</h3>
                    <div className="flex items-center text-amber-400 shrink-0"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 truncate">{hotel.distance}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gray-900 text-white font-bold text-xs px-2 py-1 rounded-md">{hotel.rating}</div>
                    <span className="text-xs font-bold text-gray-900">{hotel.ratingText}</span>
                    <span className="text-xs text-gray-400">· {hotel.reviews} Ratings</span>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-3">
                    <div className="space-y-1">
                      {hotel.features.map((f, i) => <div key={i} className="flex items-center gap-1 text-[11px] font-bold text-green-600"><Check size={12} strokeWidth={3} /> {f}</div>)}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 line-through">₹{hotel.oldPrice}</p>
                      <p className="text-lg font-black text-gray-900 leading-none mb-1">₹{hotel.price.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 leading-tight">+ taxes & fees<br/>per night, per room</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
