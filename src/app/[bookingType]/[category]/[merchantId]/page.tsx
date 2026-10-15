'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Clock, CheckCircle2, ChevronRight, ChevronLeft, Info, ShieldCheck, Search, Users, Utensils, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocationStore, useBookingFlowStore } from '@/lib/store';

const CATEGORY_NAMES: Record<string, string> = {
  // Travel & Transport
  flights: 'Flight Booking', trains: 'Train Booking', buses: 'Bus Booking', ferry: 'Ferry / Boat Booking', shuttle: 'Shuttle / Van Booking', helicopter: 'Helicopter Booking', cabs: 'Cab / Taxi Booking', 'bike-rental': 'Bike Rental', 'car-rental': 'Self-Drive Car Rental',
  // Stay & Accommodation
  hotels: 'Hotel Booking', resorts: 'Resort Booking', villas: 'Homestay / Villa', hostels: 'Hostel Booking', camping: 'Camping Booking',
  // Entertainment & Events
  movies: 'Cinema / Movie Tickets', theatre: 'Theatre Shows', concerts: 'Concert Tickets', events: 'Events & Festivals', exhibitions: 'Exhibition Entry', workshops: 'Workshops / Classes', gaming: 'Gaming Arena Booking',
  // Sports & Turf
  'football-turf': 'Football Turf', 'cricket-ground': 'Cricket Ground', badminton: 'Badminton Court', tennis: 'Tennis Court', basketball: 'Basketball Court', swimming: 'Swimming Pool Slots', 'play-arena': 'Indoor Play Arena',
  // Lifestyle & Local Services
  dining: 'Restaurant Table Reservation', salons: 'Salon / Spa Appointment', 'gym-yoga': 'Gym / Yoga Slot Booking', doctor: 'Doctor Appointment', electrician: 'Electrician Booking', plumber: 'Plumber Booking', cleaning: 'Cleaning Service', technician: 'Technician Service', studio: 'Studio Booking',
  // Business & Professional
  coworking: 'Co-working Space', 'meeting-room': 'Meeting Room', podcast: 'Podcast Studio', conference: 'Conference Hall', training: 'Training Sessions',
  // Religious Services
  darshan: 'Temple Darshan Booking', pooja: 'Pooja Slot Booking', pilgrimage: 'Pilgrimage Packages',
  // Rental & Equipment Booking
  'cycle-rental': 'Cycle Rental', 'sports-bike': 'Sports Bike Rental', camera: 'Camera Rental', 'sound-system': 'Sound System Rental', 'event-equip': 'Event Equipment Rental',
  // Personal & Miscellaneous Services
  'pet-grooming': 'Pet Grooming Appointment', babysitting: 'Babysitting Service', 'elder-care': 'Elder Care Service', 'event-organizer': 'Event Organizer Booking'
};

export default function VenueProfilePage() {
  const params = useParams();
  const router = useRouter();
  const bookingType = params?.bookingType as string;
  const category = params?.category as string;
  const merchantId = params?.merchantId as string;
  const { city } = useLocationStore();
  const { setSelectedService } = useBookingFlowStore();

  const [liveServices, setLiveServices] = useState<any[]>([]);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch full merchant details for the Venue Profile (About, Gallery, Amenities)
        // If merchantId is the dummy megamerchant, we just fall back, but for real merchants this will get the filled details.
        let mData = null;
        if (merchantId !== '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e') {
          try {
            mData = await api.merchants.get(merchantId);
          } catch (e) {
            console.warn('Could not fetch merchant:', e);
          }
        }
        
        const res = await api.services.list({});
        if (active && res && res.data) {
          const merchantServices = res.data.filter((s: any) => {
            const isMatchMerchant = (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId));
            
            let isMatchType = true;
            if (merchantId === '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e') {
              const bType = bookingType.toLowerCase();
              const typeKeywords = (bType.includes('stay') || bType.includes('hotel') || bType.includes('accommodation') || bType.includes('room')) ? ['hotel', 'room', 'resort', 'accommodation', 'stay'] :
                                   (bType.includes('sports') || bType.includes('turf') || bType.includes('play')) ? ['turf', 'cricket', 'football', 'badminton', 'tennis', 'court', 'sport', 'ground', 'ball'] :
                                   (bType.includes('health') || bType.includes('doctor') || bType.includes('clinic') || bType.includes('medical')) ? ['doctor', 'clinic', 'dental', 'medical', 'appointment', 'health'] :
                                   (bType.includes('dine') || bType.includes('food') || bType.includes('restaurant')) ? ['restaurant', 'dining', 'food', 'table', 'dine'] : 
                                   (bType.includes('salon') || bType.includes('spa') || bType.includes('beauty') || bType.includes('care')) ? ['salon', 'spa', 'beauty', 'hair', 'massage', 'care'] :
                                   (bType.includes('event') || bType.includes('party') || bType.includes('hall')) ? ['event', 'party', 'hall', 'wedding', 'banquet'] : [];
                                   
              if (typeKeywords.length > 0) {
                const catName = (s.category || '').toLowerCase();
                const svcName = (s.name || '').toLowerCase();
                const catSlug = (s.categoryObj?.slug || '').toLowerCase();
                isMatchType = typeKeywords.some(kw => catName.includes(kw) || svcName.includes(kw) || catSlug.includes(kw));
              }
            } else {
              const expectedCategoryName = CATEGORY_NAMES[category];
              if (expectedCategoryName) {
                isMatchType = s.category === expectedCategoryName || s.categoryObj?.slug === category;
              }
            }
            return isMatchMerchant && isMatchType;
          });
          setLiveServices(merchantServices);
          if (mData) {
            setMerchantData((mData as any).data || mData);
          } else if (merchantServices.length > 0) {
            setMerchantData(merchantServices[0].merchantObj || {});
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    fetchData();
    return () => { active = false; };
  }, [merchantId, bookingType]);

  const venueName = liveServices.length > 0 ? (liveServices[0].merchantObj?.name || liveServices[0].merchant || 'Venue') : 'Loading...';
  const address = liveServices.length > 0 ? (liveServices[0].merchantObj?.address || `${city || 'Chennai'}`) : '';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div><p>Loading Venue...</p></div></div>;
  }

  if (liveServices.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><p>Venue not found or has no services.</p></div>;
  }

  const defaultHotelPhotos = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40eb0d8e73?w=800&q=80',
    'https://images.unsplash.com/photo-1522771731478-44bc10b49cb3?w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
  ];

  const finalMerchantObj = merchantData || liveServices[0]?.merchantObj || {};
  const validMerchantImages = (finalMerchantObj.images || []).filter((img: any) => typeof img === 'string' && img.trim() !== '');
  
  // Combine real images with curated luxury hotel photos if merchant only has 1 or 2 images
  const galleryImages = validMerchantImages.length >= 4 
    ? validMerchantImages 
    : [
        ...validMerchantImages, 
        ...defaultHotelPhotos.slice(validMerchantImages.length)
      ];

  const aboutText = finalMerchantObj.description || liveServices[0]?.rawConfig?.description;
  const amenities = finalMerchantObj.amenities || [];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-32">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{bookingType.replace('-', ' ')}</span>
            <h1 className="text-sm font-bold text-white truncate max-w-[250px]">{venueName}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Top Header: Property Title + Stars + Add to Wishlist */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {venueName}
            </h1>
            <span className="text-amber-400 text-sm font-bold ml-1">★★★★☆</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-white/15 hover:border-white/30 transition-colors bg-[#111827] shadow-sm">
            <span>♡</span>
            <span>Add to Wishlist</span>
          </button>
        </div>

        {/* Hero Gallery (Left) + Top Action Cards (Right) Grid matching MakeMyTrip */}
        {(() => {
          const firstService = liveServices.find((s: any) => s.name !== '__BOKSPOT_GROUP__') || liveServices[0];
          const listings = firstService?.rawConfig?.metadata?.listings || firstService?.metadata?.listings || [];
          const startingPrice = Number(firstService?.price || firstService?.basePrice || listings[0]?.price) || 2800;
          const origPrice = Math.round(startingPrice * 1.25);
          const maxCapacity = Number(firstService?.rawConfig?.participantCapacity) || Number(listings[0]?.metadata?.maxGuests) || 2;
          const mapQuery = (finalMerchantObj.latitude && finalMerchantObj.longitude) 
            ? `${finalMerchantObj.latitude},${finalMerchantObj.longitude}` 
            : encodeURIComponent(address || venueName || 'Chennai');

          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                {/* LEFT SIDE: Image Gallery (1 Large Primary Photo + 2 Side Photos Stack) */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-12 gap-3 min-h-[360px] sm:h-[400px]">
                  {/* Main Large Photo */}
                  <div 
                    className="sm:col-span-7 h-full min-h-[260px] rounded-2xl overflow-hidden relative cursor-pointer group shadow-lg bg-[#111827] border border-white/10"
                    onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
                  >
                    <img 
                      src={galleryImages[0]} 
                      alt={venueName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-white/25 shadow-xl hover:bg-black transition-all">
                      <span>📷</span>
                      <span>{galleryImages.length} Property & Guest Photos &rarr;</span>
                    </div>
                  </div>

                  {/* 2 Stacked Side Photos */}
                  <div className="sm:col-span-5 hidden sm:grid grid-rows-2 gap-3 h-full">
                    <div 
                      className="rounded-2xl overflow-hidden relative cursor-pointer group shadow-md bg-[#111827] border border-white/10"
                      onClick={() => { setCurrentImageIdx(1); setIsGalleryOpen(true); }}
                    >
                      <img 
                        src={galleryImages[1]} 
                        alt="Room view" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <div 
                      className="rounded-2xl overflow-hidden relative cursor-pointer group shadow-md bg-[#111827] border border-white/10"
                      onClick={() => { setCurrentImageIdx(2); setIsGalleryOpen(true); }}
                    >
                      <img 
                        src={galleryImages[2]} 
                        alt="Interior view" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Booking Card & Map Link Card */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-3 min-h-[360px] sm:h-[400px]">
                  {/* Top Price & Book Card (Dark Card) */}
                  <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-base md:text-lg text-white leading-tight line-clamp-1">
                        {firstService?.name || 'Luxe Twin Room'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Fits {maxCapacity} Adults
                      </p>

                      {/* Offers & Perks List */}
                      <div className="mt-2.5 space-y-1.5 text-[11px] text-emerald-400 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span>🍸</span> <span>Enjoy Happy Hours with 1+1 offer</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>🍽️</span> <span>20% off on Food & Beverage services</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>👔</span> <span>10% Off on Laundry service</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span>🕒</span> <span>Guaranteed early check-in available</span>
                        </div>
                        <div className="text-slate-400 text-[10px] pt-0.5">• Non-Refundable</div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/10">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Per Night:</div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-black text-white">
                          ₹ {startingPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">+ ₹ {Math.round(startingPrice * 0.12)} taxes & fees</span>
                      </div>

                      <button
                        onClick={() => {
                          const targetService = firstService || liveServices[0];
                          if (targetService?.id) {
                            setSelectedService({
                              ...targetService,
                              price: startingPrice,
                              metadata: {
                                ...(targetService.metadata || {}),
                                hotelBooking: true,
                                roomType: targetService.name || 'AC Room',
                                venueName: venueName,
                                address: address
                              }
                            });
                            router.push(`/service/${targetService.id}`);
                          } else {
                            const roomsSection = document.getElementById('available-rooms-section');
                            if (roomsSection) {
                              roomsSection.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              setIsModalOpen(true);
                            }
                          }
                        }}
                        className="w-full mt-2.5 py-3 bg-gradient-to-r from-[#006ce4] to-[#0057b8] hover:brightness-110 active:scale-[0.98] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                      >
                        <span>BOOK THIS NOW</span>
                        <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Location & Rating Card */}
                  <div className="bg-[#111827] border border-white/10 rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 text-base shrink-0">
                        📍
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-white truncate">
                          {finalMerchantObj.city || city || 'Chennai, Tamil Nadu'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {finalMerchantObj.metadata?.aroundProperty?.[0]?.name ? `${finalMerchantObj.metadata.aroundProperty[0].name} nearby` : '8 minutes walk to beach / station'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-[#006ce4] hover:underline shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      See on Map &rarr;
                    </a>
                  </div>
                </div>
              </div>

              {/* Room Specs & Configuration Strip (Like MakeMyTrip / Airbnb) */}
              <div className="w-full relative z-10 clear-both bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-5 mt-4 mb-8 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <span>{firstService?.name || 'Entire Luxury Accommodation'}</span>
                        <span className="text-xs text-blue-400 font-semibold cursor-pointer hover:underline">ⓘ</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span>🚪</span> <span>{listings.length > 0 ? `${listings.length} Bed Units` : '1 Bedroom'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <span>🚿</span> <span>Private Ensuite Bathrooms</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <span>🛏️</span> <span>King / Queen Beds</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👥</span>
                      <div>
                        <span className="text-xs font-bold text-white block">Up to {maxCapacity} Guests</span>
                        <span className="text-[11px] text-emerald-400 font-medium">Family & Couple Friendly</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const el = document.getElementById('available-rooms-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#ff6325] hover:underline"
                    >
                      View Layout &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {/* Available Rooms Section Header */}
        <div id="available-rooms-section" className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                Available Room Categories
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your preferred room to view bed layouts, full inclusions, and book directly.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-500/15 text-blue-400 rounded-full border border-blue-500/30">
              {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length} Types Available
            </span>
          </div>

          {/* Rooms Grid */}
          <div className="space-y-4">
            {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length === 0 ? (
              <p className="text-sm text-slate-400 italic p-6 rounded-2xl border border-white/10 text-center bg-[#111827] shadow-sm">
                No specific rooms have been listed by the property yet.
              </p>
            ) : (
              liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').map((svc, sIdx) => {
                const listings = svc.rawConfig?.metadata?.listings || svc.metadata?.listings || [];
                const listingsCount = listings.length;
                const startingPrice = svc.price || svc.basePrice || svc.rawConfig?.basePrice || listings[0]?.price || 0;
                const defaultThumbs = [
                  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
                  'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&q=80',
                  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
                ];
                const thumb = svc.imageUrl || svc.image || svc.metadata?.mainImageUrl || svc.metadata?.images?.[0] || listings[0]?.imageUrl || defaultThumbs[sIdx % defaultThumbs.length];
                const primaryListing = listings[0] || {};
                const primaryMeta = primaryListing.metadata || {};

                return (
                  <div 
                    key={svc.id}
                    className="bg-[#111827] border border-white/10 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Image Thumbnail */}
                      <div className="md:col-span-4 h-44 rounded-xl overflow-hidden relative group cursor-pointer border border-white/10 bg-slate-900" onClick={() => router.push(`/service/${svc.id}`)}>
                        <img 
                          src={thumb} 
                          alt={svc.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                          {listingsCount > 0 ? `${listingsCount} Room Type${listingsCount > 1 ? 's' : ''}` : 'Instant Reserve'}
                        </div>
                      </div>

                      {/* Room Details & Highlights */}
                      <div className="md:col-span-5 space-y-2.5">
                        <div>
                          <h3 
                            onClick={() => router.push(`/service/${svc.id}`)}
                            className="font-black text-lg text-white hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {svc.name}
                          </h3>
                          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                            {svc.description || primaryListing.description || 'Fully appointed room with premium bedding, ensuite washroom, and verified hospitality.'}
                          </p>
                        </div>

                        {/* Tags & Inclusions */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {primaryMeta.maxGuests && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-200 border border-white/10">
                              👥 Max {primaryMeta.maxGuests} Guests
                            </span>
                          )}
                          {primaryMeta.checkInTime && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-200 border border-white/10">
                              🕒 In: {primaryMeta.checkInTime}
                            </span>
                          )}
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            ✓ Free Wi-Fi
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            ✓ Free Cancellation
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Booking Button */}
                      <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5 gap-3">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Price per night
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black text-white">
                              ₹{startingPrice || 1500}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold block">
                            + taxes & fees included
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedService({
                              ...svc,
                              price: startingPrice || 1500,
                              metadata: {
                                ...(svc.metadata || {}),
                                hotelBooking: true,
                                roomType: svc.name,
                                venueName: venueName,
                                address: address
                              }
                            });
                            router.push(`/service/${svc.id}`);
                          }}
                          className="px-6 py-2.5 bg-gradient-to-r from-[#ff6325] to-[#e04e13] hover:brightness-110 active:scale-95 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Reserve Room</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Property Information: About, Amenities, Policies, and Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 pt-8 border-t border-white/10">
          {/* Main Info Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* About */}
            {aboutText && (
              <div className="bg-[#111827] rounded-2xl p-6 border border-white/10 shadow-md">
                <h2 className="text-base font-extrabold text-white mb-2">About {venueName}</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {aboutText}
                </p>
              </div>
            )}

            {/* Things to Know & Amenities */}
            {Boolean(
              (amenities && amenities.length > 0) ||
              liveServices[0]?.rawConfig?.isTimingEnabled ||
              liveServices[0]?.rawConfig?.isCapacityEnabled ||
              liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasAC ||
              liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasWiFi ||
              liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasBreakfast
            ) && (
              <div className="bg-[#111827] rounded-2xl p-6 border border-white/10 shadow-md">
                <h2 className="text-base font-extrabold text-white mb-3">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
                  {amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 font-medium">
                      <CheckCircle2 size={16} className="text-blue-400 shrink-0" /> {amenity}
                    </div>
                  ))}
                  {liveServices[0]?.rawConfig?.isTimingEnabled && (
                    <div className="flex items-center gap-2.5 font-medium">
                      <Clock size={16} className="text-blue-400 shrink-0" /> {liveServices[0].rawConfig.timingDetails || '24/7 Check-in available'}
                    </div>
                  )}
                  {liveServices[0]?.rawConfig?.isCapacityEnabled && (
                    <div className="flex items-center gap-2.5 font-medium">
                      <Users size={16} className="text-blue-400 shrink-0" /> Capacity: {liveServices[0].rawConfig.participantCapacity} max
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Policies */}
            {finalMerchantObj.metadata?.policies && finalMerchantObj.metadata.policies.length > 0 && (
              <div className="bg-[#111827] rounded-2xl p-6 border border-white/10 shadow-md">
                <h2 className="text-base font-extrabold text-white mb-3">House Rules & Policies</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-300 font-medium">
                  {finalMerchantObj.metadata.policies.map((policy: string, idx: number) => (
                    <li key={idx}>{policy}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Location & Map Right Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111827] rounded-2xl p-6 border border-white/10 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-white">Location & Surroundings</h3>
              {address && <p className="text-xs text-slate-400">{address}</p>}

              {/* Embedded Google Map */}
              {(() => {
                const lat = finalMerchantObj.latitude || liveServices[0]?.merchantObj?.latitude;
                const lng = finalMerchantObj.longitude || liveServices[0]?.merchantObj?.longitude;
                const mapQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(address || venueName || 'Chennai');

                return (
                  <div className="rounded-xl overflow-hidden border border-white/10 relative">
                    <div className="h-56 w-full relative">
                      <iframe
                        title="Property Location Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center justify-between">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open in Google Maps &rarr;</span>
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* Around Property Landmarks */}
              {Array.isArray(finalMerchantObj.metadata?.aroundProperty) && finalMerchantObj.metadata.aroundProperty.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Nearby Landmarks</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                    {finalMerchantObj.metadata.aroundProperty.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                        <span>{item.name || item.title}</span> 
                        <span className="font-bold text-blue-400">{item.distance || ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[color:var(--color-surface)] rounded-3xl shadow-2xl z-[99999] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[color:var(--color-outline-variant)]/20">
                <h2 className="text-2xl font-extrabold">Select Category</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').map(svc => {
                     const numOptions = svc.rawConfig?.metadata?.listings ? svc.rawConfig.metadata.listings.length : 1;
                     return (
                       <button
                         key={svc.id}
                         onClick={() => router.push(`/service/${svc.id}`)}
                         className="flex flex-col text-left p-6 rounded-2xl border border-[color:var(--color-outline-variant)]/30 hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5 transition-all group"
                       >
                         <h3 className="text-lg font-bold mb-2 group-hover:text-[color:var(--color-primary)] transition-colors">
                           {svc.name}
                         </h3>
                         <p className="text-sm text-[color:var(--color-on-surface-variant)] font-medium">{numOptions} option{numOptions !== 1 ? 's' : ''}</p>
                       </button>
                     );
                  })}
                  {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length === 0 && (
                    <p className="text-sm text-[color:var(--color-on-surface-variant)] italic p-4 col-span-2 text-center">No specific categories have been added by the business yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Gallery Header */}
            <div className="flex items-center justify-between p-4 md:p-6 text-white absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h3 className="font-bold">{venueName}</h3>
                  <p className="text-xs text-white/60">{currentImageIdx + 1} / {galleryImages.length}</p>
                </div>
              </div>
              <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Main Image Viewer */}
            <div className="flex-1 flex items-center justify-center relative px-4 md:px-12 mt-16 md:mt-0">
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => prev === 0 ? galleryImages.length - 1 : prev - 1); }}
                className="absolute left-2 md:left-6 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors border border-white/10 z-10"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="w-full max-w-5xl max-h-[70vh] flex items-center justify-center">
                <motion.img 
                  key={currentImageIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={galleryImages[currentImageIdx]} 
                  alt="Gallery image" 
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => prev === galleryImages.length - 1 ? 0 : prev + 1); }}
                className="absolute right-2 md:right-6 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors border border-white/10 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="p-4 md:p-6 bg-black/50 border-t border-white/10 overflow-x-auto">
              <div className="flex items-center gap-3 w-max mx-auto px-4">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all ${currentImageIdx === idx ? 'ring-2 ring-white scale-105 opacity-100' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
