'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, CalendarDays, Plus, Minus, ChevronRight, Info, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { useBookingFlowStore } from '@/lib/store';

interface EventTemplateProps {
  service: any;
}

export default function EventTemplate({ service }: EventTemplateProps) {
  const router = useRouter();
  const { setSelectedService, setSelectedSlot, setAttendeeCount } = useBookingFlowStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Initialize ticket tiers from metadata.listings (or fallback)
  const tickets = service.metadata?.listings || service.rawConfig?.metadata?.listings || [
    { id: 't1', name: 'General Admission', price: service.price || 500, description: 'Entry for one person' },
    { id: 't2', name: 'VIP Pass', price: (service.price || 500) * 2, description: 'Front row + Meet & Greet' }
  ];

  const handleIncrement = (ticketId: string, max: number = 10) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.min((prev[ticketId] || 0) + 1, max)
    }));
  };

  const handleDecrement = (ticketId: string) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      if (current <= 0) return prev;
      const newQuantities = { ...prev, [ticketId]: current - 1 };
      if (newQuantities[ticketId] === 0) delete newQuantities[ticketId];
      return newQuantities;
    });
  };

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(quantities).reduce((total, [id, qty]) => {
    const ticket = tickets.find((t: any) => t.id === id);
    return total + (ticket ? Number(ticket.price) * qty : 0);
  }, 0);

  const handleProceed = () => {
    if (totalTickets === 0) return;
    
    // Convert selected tickets into a "slot" equivalent for the generic checkout
    const primaryTicketId = Object.keys(quantities)[0];
    const ticketDetails = tickets.filter((t: any) => quantities[t.id]);
    
    setSelectedService({
      ...service,
      price: totalPrice,
      name: `${service.name} (${totalTickets} Tickets)`,
    });
    
    // Create a pseudo slot for the event
    setSelectedSlot({
      id: `evt-${primaryTicketId}`,
      date: new Date().toISOString().split('T')[0], // Could be read from metadata
      time: service.timingDetails || '07:00 PM',
      tickets: ticketDetails.map((t: any) => ({ ...t, qty: quantities[t.id] }))
    });
    setAttendeeCount(totalTickets);
    router.push('/booking/checkout');
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-surface)] flex flex-col pb-32">
      {/* 1. Header (District Style) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[color:var(--color-surface)]/80 backdrop-blur-xl border-b border-[color:var(--color-outline-variant)]/20 shadow-sm px-4 py-4 flex items-center justify-between transition-all">
        <button onClick={() => router.back()} className="p-2 bg-[color:var(--color-surface-container)] hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
          <ArrowLeft size={20} className="text-[color:var(--color-on-surface)]" />
        </button>
        <div className="flex flex-col items-center flex-1 pr-10">
          <h1 className="text-sm font-bold text-[color:var(--color-on-surface)] truncate max-w-[200px]">{service.name}</h1>
          <p className="text-[10px] text-[color:var(--color-on-surface-variant)] uppercase tracking-wide font-semibold">{service.category?.name || service.category}</p>
        </div>
      </div>

      {/* 2. Massive Hero Banner */}
      <div className="w-full h-[45vh] md:h-[55vh] relative bg-black mt-16">
        <img 
          src={service.images?.[0] || `https://images.unsplash.com/photo-1540039155732-68bebc6894b9?w=800&q=80`} 
          alt={service.name} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-surface)] via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-8 max-w-4xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <span className="inline-block px-3 py-1 bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 shadow-lg">
              {service.serviceType || 'Live Event'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-md">
              {service.name}
            </h1>
            <p className="text-[color:var(--color-surface-variant)] font-medium text-sm drop-shadow-md max-w-lg line-clamp-2">
              {service.shortDescription || service.description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        
        {/* 3. Event Details Strip */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 p-5 rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[color:var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <CalendarDays className="text-[color:var(--color-primary)]" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[color:var(--color-on-surface)] text-sm">Date & Time</h3>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1">{service.timingDetails || 'Saturday, 12 Oct 2026 • 07:00 PM'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[color:var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <MapPin className="text-[color:var(--color-primary)]" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[color:var(--color-on-surface)] text-sm">Venue</h3>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1">{service.merchant?.name || service.merchant}</p>
              <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5 opacity-80">{service.merchant?.city || 'City'}</p>
            </div>
          </div>
        </motion.div>

        {/* 4. Tickets Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold mb-6 text-[color:var(--color-on-surface)] flex items-center gap-2">
            <Sparkles size={20} className="text-[color:var(--color-primary)]" />
            Select Tickets
          </h2>
          
          <div className="space-y-4">
            {tickets.map((ticket: any) => {
              const qty = quantities[ticket.id] || 0;
              const isSelected = qty > 0;
              
              return (
                <div key={ticket.id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 shadow-[0_4px_20px_rgba(var(--color-primary-rgb),0.05)]' 
                      : 'border-[color:var(--color-outline-variant)]/40 hover:border-black/20 bg-[color:var(--color-surface)]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-[color:var(--color-on-surface)] text-base">{ticket.name || ticket.title}</h3>
                      <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 line-clamp-2">{ticket.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-black text-lg text-[color:var(--color-on-surface)]">₹{ticket.price}</span>
                        {ticket.oldPrice && <span className="text-xs line-through text-[color:var(--color-outline)]">₹{ticket.oldPrice}</span>}
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end">
                      {qty === 0 ? (
                        <button 
                          onClick={() => handleIncrement(ticket.id)}
                          className="px-6 py-2 rounded-full border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-bold text-xs hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-on-primary)] transition-all"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center bg-black text-white rounded-full p-1 shadow-md">
                          <button onClick={() => handleDecrement(ticket.id)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><Minus size={14} strokeWidth={3} /></button>
                          <span className="px-4 text-sm font-black w-8 text-center">{qty}</span>
                          <button onClick={() => handleIncrement(ticket.id)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><Plus size={14} strokeWidth={3} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 5. About the Event */}
        {service.description && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12">
            <h2 className="text-xl font-bold mb-4 text-[color:var(--color-on-surface)]">About the Event</h2>
            <div className="prose prose-sm prose-p:text-[color:var(--color-on-surface-variant)] prose-p:leading-relaxed">
              <p>{service.description}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 6. Sticky Bottom Bar */}
      <AnimatePresence>
        {totalTickets > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[color:var(--color-surface)] border-t border-[color:var(--color-outline-variant)]/20 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] p-4 md:px-8"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-[color:var(--color-on-surface-variant)] uppercase font-bold tracking-wider">{totalTickets} Ticket{totalTickets > 1 ? 's' : ''}</span>
                <span className="text-xl font-black text-[color:var(--color-on-surface)]">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <button 
                onClick={handleProceed}
                className="px-8 py-3.5 rounded-full font-bold text-sm bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-[color:var(--color-primary)]/20"
              >
                Proceed to Pay <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
