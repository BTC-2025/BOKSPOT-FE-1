'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Share2, Heart, Check, Clock, Info, CheckCircle2, ShieldCheck, Bed, Sparkles } from 'lucide-react';
import { api } from '../../../lib/api';
import { useBookingFlowStore } from '../../../lib/store';

export default function VenuePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { setSelectedService } = useBookingFlowStore();

  const [merchant, setMerchant] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We will simulate fetching the venue and its listings
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch real merchant details first
        const merchantRes = await api.merchants.get(id);
        const realMerchant = merchantRes; // apiFetch returns the data directly if it doesn't wrap in { data } but let's assume it does if it matches list. Actually apiFetch<Merchant> returns Merchant.
        
        // Fetch services for this specific merchant
        const res = await api.services.list({ merchantId: id, limit: '50' });
        if (res && res.data) {
          setServices(res.data);
        }

        if (realMerchant) {
          setMerchant({
            id: id,
            name: realMerchant.name || 'Venue Name',
            description: realMerchant.description || 'Welcome to our luxurious property. Enjoy your stay with premium amenities.',
            phone: realMerchant.phone,
            website: realMerchant.website,
            address: realMerchant.address,
            gallery: (realMerchant.images && realMerchant.images.length > 0) ? realMerchant.images : [
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
              'https://images.unsplash.com/photo-1522771731478-44bc10b49cb3?w=800&q=80'
            ],
            thingsToKnow: (realMerchant.amenities && realMerchant.amenities.length > 0) ? realMerchant.amenities : ['Free WiFi', 'Parking', 'Air Conditioning'],
            policies: realMerchant.metadata?.policies || [],
            aroundProperty: realMerchant.metadata?.aroundProperty || [],
            checkInTime: realMerchant.metadata?.checkInTime || '12:00 PM',
            checkOutTime: realMerchant.metadata?.checkOutTime || '11:00 AM',
            rating: realMerchant.rating || 4.8,
            reviewCount: realMerchant.reviewCount || 0,
            location: `${realMerchant.city || 'City'}, ${(realMerchant as any).state || ''}`,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin w-10 h-10 border-4 border-[#8b6508] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <p className="text-red-500 font-bold">Venue not found.</p>
      </div>
    );
  }

  const handleBookService = (categoryService: any, listing: any) => {
    setSelectedService({
      ...categoryService,
      selectedListing: listing,
      price: listing.basePrice || listing.price || categoryService.basePrice || categoryService.price,
    });
    // Navigate to the archetype booking flow with listing ID preselected
    router.push(`/service/${categoryService.id}?listing=${listing.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 sm:pt-32 pb-24">
      {/* Dynamic Header & Gallery */}
      <div className="relative h-[40vh] md:h-[55vh] w-full group">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-1 md:gap-2 p-1 md:p-2 bg-black">
          {/* Main Hero Image */}
          <div className="col-span-4 row-span-2 md:col-span-2 md:row-span-2 relative overflow-hidden rounded-l-xl md:rounded-l-2xl">
            <img src={merchant.gallery?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Main" />
          </div>
          {/* Secondary Images (Hidden on mobile) */}
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden">
            <img src={merchant.gallery?.[1] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Sub 1" />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden rounded-tr-2xl">
            <img src={merchant.gallery?.[2] || 'https://images.unsplash.com/photo-1522771731478-44bc10b49cb3'} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Sub 2" />
          </div>
          <div className="hidden md:block col-span-2 row-span-1 relative overflow-hidden rounded-br-2xl">
            <img src={merchant.gallery?.[3] || 'https://images.unsplash.com/photo-1551882547-ff40eb0d8e73'} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Sub 3" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
              <span className="text-white font-bold text-lg">View All Photos</span>
            </div>
          </div>
        </div>
        
        {/* Top Nav Overlay */}
        <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10">
          <button onClick={() => router.back()} className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-3">
            <button className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-[#ff6325]/10 text-[#ff6325] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Premium Venue</span>
              <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Verified</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{merchant.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <Star className="text-amber-500 fill-amber-500" size={18} />
                <span className="text-slate-900 font-bold">{merchant.rating}</span>
                <span className="text-slate-500 text-sm">({merchant.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={18} className="text-slate-400" />
                <span>{merchant.location || 'Chennai, Tamil Nadu'}</span>
                <button className="text-[#0a3161] hover:text-[#ff6325] hover:underline text-sm ml-1 font-semibold">View Map</button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column (About & Details) */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="text-[#0a3161]" /> About the Venue
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {merchant.description}
              </p>
            </section>

            {/* Timings & Policies */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="text-[#ff6325]" /> Property Timings
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Check-in</span>
                    <span className="text-base font-extrabold text-slate-900">{merchant.checkInTime || '12:00 PM'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Check-out</span>
                    <span className="text-base font-extrabold text-slate-900">{merchant.checkOutTime || '11:00 AM'}</span>
                  </div>
                </div>
              </div>

              {merchant.policies && merchant.policies.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="text-blue-500" /> House Rules & Policies
                  </h3>
                  <div className="space-y-2.5">
                    {merchant.policies.map((pol: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                        <span className="text-[#ff6325] font-bold">•</span>
                        <span>{pol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {merchant.aroundProperty && merchant.aroundProperty.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="text-amber-500" /> Nearby Landmarks
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {merchant.aroundProperty.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
                        <span>📍 {item.name}</span>
                        <span className="text-[#ff6325] bg-[#ff6325]/10 px-2 py-0.5 rounded-md font-extrabold">{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column (Listings Widget) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0a3161] via-[#ff6325] to-[#ff8452]" />
                <h3 className="text-xl font-black text-slate-900 mb-6">Available Options</h3>
                
                <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                  {services.map((categoryService, idx) => (
                    <div key={idx} className="space-y-4">
                      {/* Category Header */}
                      <h4 className="font-extrabold text-lg text-slate-800 pb-2 border-b-2 border-slate-100 inline-block">
                        {categoryService.name}
                      </h4>
                      
                      {/* Listings under Category */}
                      {(categoryService.metadata?.listings || []).length > 0 ? (
                        <div className="space-y-4">
                          {(categoryService.metadata?.listings || []).map((listing: any, lIdx: number) => {
                            const listingImg = listing.imageUrl || listing.image || listing.metadata?.gallery?.[0] || listing.images?.[0];
                            const price = listing.basePrice || listing.price || 0;
                            return (
                              <div 
                                key={lIdx} 
                                className="group bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#ff6325] hover:shadow-lg transition-all duration-300 cursor-pointer space-y-3"
                                onClick={() => handleBookService(categoryService, listing)}
                              >
                                {listingImg && (
                                  <div className="w-full h-36 rounded-xl overflow-hidden relative bg-slate-200">
                                    <img 
                                      src={listingImg} 
                                      alt={listing.name} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    {listing.metadata?.totalUnits && (
                                      <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {listing.metadata.totalUnits} Units
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <h5 className="font-extrabold text-base text-slate-900 group-hover:text-[#ff6325] transition-colors leading-snug">
                                      {listing.name}
                                    </h5>
                                    <div className="text-right shrink-0">
                                      <span className="font-black text-lg text-slate-900">₹{price.toLocaleString()}</span>
                                      <span className="block text-[10px] text-slate-400 font-semibold">per night</span>
                                    </div>
                                  </div>
                                  {listing.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                      {listing.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {listing.bedType && (
                                    <span className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <Bed size={10} className="text-[#ff6325]" /> {listing.bedType}
                                    </span>
                                  )}
                                  {listing.maxGuests && (
                                    <span className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                                      👥 {listing.maxGuests} Guests
                                    </span>
                                  )}
                                  {listing.sizeSqFt && (
                                    <span className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                                      📐 {listing.sizeSqFt} sq.ft
                                    </span>
                                  )}
                                </div>

                                <button 
                                  type="button"
                                  className="w-full py-2.5 bg-[#0a3161] group-hover:bg-[#ff6325] text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                  <span>Book {listing.name}</span>
                                  <span className="text-white/70">→</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No options added yet in this category.</p>
                      )}
                    </div>
                  ))}
                  
                  {services.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No categories or options available at the moment.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
