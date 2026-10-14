'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Share2, Heart, Check, Clock, Info, CheckCircle2 } from 'lucide-react';
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
            gallery: (realMerchant.images && realMerchant.images.length > 0) ? realMerchant.images : [
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
              'https://images.unsplash.com/photo-1522771731478-44bc10b49cb3?w=800&q=80'
            ],
            thingsToKnow: (realMerchant.amenities && realMerchant.amenities.length > 0) ? realMerchant.amenities : ['Free WiFi', 'Parking', 'Air Conditioning'],
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

  const handleBookService = (service: any) => {
    setSelectedService(service);
    // Navigate to the specific archetype booking flow
    router.push(`/service/${service.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
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

            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" /> Things to Know
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {merchant.thingsToKnow?.map((thing: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-50 p-1 rounded-full text-emerald-600">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 font-medium">{thing}</span>
                  </div>
                ))}
              </div>
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
                          {(categoryService.metadata?.listings || []).map((listing: any, lIdx: number) => (
                            <div key={lIdx} className="group bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-[#ff6325]/40 hover:shadow-md transition-all cursor-pointer" onClick={() => handleBookService(listing)}>
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-slate-900 group-hover:text-[#ff6325] transition-colors">{listing.name}</h5>
                                <span className="font-black text-slate-900">₹{listing.basePrice || listing.price || 0}</span>
                              </div>
                              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{listing.description}</p>
                              <button className="w-full py-2.5 bg-[#0a3161] hover:bg-[#ff6325] text-white rounded-xl font-bold transition-all shadow-sm">
                                Book {listing.name}
                              </button>
                            </div>
                          ))}
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
