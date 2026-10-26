'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, Building2, Ticket, CheckCircle2, Search, ArrowLeft, Send, 
  HelpCircle, ChevronDown, ChevronUp, MessageSquare, PhoneCall, 
  Clock, Zap, Sparkles, AlertCircle, FileQuestion, ArrowRight
} from 'lucide-react';
import { useBookingFlowStore } from '../../lib/store';
import Link from 'next/link';

export default function SupportPage() {
  const { merchants, addUserTicket, userTickets, fetchTickets } = useBookingFlowStore();
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const [activeTab, setActiveTab] = useState<'create' | 'tickets' | 'faq'>('create');
  const [targetType, setTargetType] = useState<'ADMIN' | 'BUSINESS'>('ADMIN');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (targetType === 'BUSINESS' && !selectedMerchantId) {
      alert('Please select a business to send the complaint to.');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const merchant = merchants.find(m => m.id === selectedMerchantId);

    addUserTicket({
      targetType,
      merchantId: targetType === 'BUSINESS' ? selectedMerchantId : undefined,
      merchantName: targetType === 'BUSINESS' ? merchant?.name : undefined,
      subject,
      message,
    });

    setIsSubmitted(true);
    setSubject('');
    setMessage('');
    setSelectedMerchantId('');
    
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  const faqs = [
    {
      q: "How do refunds work for cancelled turf/hotel slots?",
      a: "Refunds are processed automatically to your Bokspot Wallet or direct bank source within 2-4 hours of cancellation confirmation without convenience deductions."
    },
    {
      q: "Can I reschedule my appointment directly with the merchant?",
      a: "Yes! Choose 'A Business' in the ticket routing form above and select the booked venue to submit an official time-shift or date amendment request."
    },
    {
      q: "Where do I find my booking QR pass for gate check-in?",
      a: "Head over to the 'Bookings' section in your top navigation bar. Every confirmed booking features a live dynamic QR pass that venue operators scan instantly."
    },
    {
      q: "What should I do if a venue is locked or unavailable on arrival?",
      a: "Select 'BOKSPOT Admin' above and choose urgent escalation. Our 24/7 emergency dispatch team contacts the property manager immediately or arranges an alternative venue."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 pt-32 sm:pt-36 pb-24 relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-[#ff6325]/10 via-[#ea580c]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800/80 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121722] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#ff6325] transition-all text-xs font-bold border border-slate-200/80 dark:border-slate-800 shadow-2xs group cursor-pointer"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Home</span>
              </Link>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-orange-500/10 text-[#ff6325] border border-orange-500/20 flex items-center gap-1">
                <Zap size={11} /> 24/7 Priority Concierge
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Help Center &amp; Resolution Desk
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Instant dispute resolution, direct merchant communication, cancellations, and live ticket tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-end">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Agents Online (~3 min response)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Category Pill Tabs (Breaks the Monotonous Grid Structure) */}
        <div className="flex items-center gap-2 mb-6 p-1.5 bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-[#ff6325] to-[#ea580c] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare size={14} />
            <span>Open Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-[#ff6325] to-[#ea580c] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Ticket size={14} />
            <span>My Tickets</span>
            {userTickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#ff6325] font-black">
                {userTickets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-[#ff6325] to-[#ea580c] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle size={14} />
            <span>Resolved FAQs</span>
          </button>
        </div>

        {/* TAB 1: TICKET CREATION FORM (Streamlined Center Stage) */}
        {activeTab === 'create' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff6325]" />
                    <span>Create New Resolution Case</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select whom you want to route this case to for immediate SLA response.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Avg. Wait: 3 mins
                </span>
              </div>

              {/* Step 1: Destination Selection (Bokspot Admin vs Business) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  1. Who do you want to contact?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setTargetType('ADMIN')}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                      targetType === 'ADMIN'
                        ? 'border-[#ff6325] bg-orange-50/50 dark:bg-orange-950/20 text-[#ff6325] shadow-sm ring-1 ring-[#ff6325]/40'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      targetType === 'ADMIN' ? 'bg-[#ff6325] text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <span className="font-black text-xs block text-slate-900 dark:text-white">BOKSPOT Admin Support</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Payment disputes, instant refunds, platform inquiries</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('BUSINESS')}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                      targetType === 'BUSINESS'
                        ? 'border-[#ff6325] bg-orange-50/50 dark:bg-orange-950/20 text-[#ff6325] shadow-sm ring-1 ring-[#ff6325]/40'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      targetType === 'BUSINESS' ? 'bg-[#ff6325] text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <span className="font-black text-xs block text-slate-900 dark:text-white">Direct Venue / Merchant</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Slot rescheduling, amenities, timing shifts</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {targetType === 'BUSINESS' && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Booked Merchant / Venue <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedMerchantId}
                        onChange={(e) => setSelectedMerchantId(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-[#1a202c] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs rounded-xl px-3.5 focus:outline-hidden focus:border-[#ff6325] appearance-none shadow-2xs font-medium cursor-pointer"
                      >
                        <option value="" disabled>Choose a business from catalog...</option>
                        {merchants.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                        expand_more
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject / Concern Summary <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rescheduling Turf Slot #4, Refund verification for BOK-88402"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-[#1a202c] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs rounded-xl px-3.5 focus:outline-hidden focus:border-[#ff6325] shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Detailed Message &amp; Booking Pass ID <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    placeholder="Describe your issue with dates, slot numbers, and reason for cancellation or query..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full p-3.5 bg-slate-50 dark:bg-[#1a202c] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs rounded-xl focus:outline-hidden focus:border-[#ff6325] shadow-2xs font-medium resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#ff6325] via-[#ea580c] to-[#d94e09] hover:brightness-110 active:scale-98 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,99,37,0.35)] transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>Submit Ticket</span>
                </button>
              </form>

              {isSubmitted && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
                  <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ticket Submitted Successfully!</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Your request has been routed to our resolution queue. You can track updates in the &apos;My Tickets&apos; tab.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: MY TICKETS (Rich Ticket Status List) */}
        {activeTab === 'tickets' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Logged Support Cases
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time status updates from our resolution team.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#ff6325] bg-orange-500/10 px-2.5 py-1 rounded-full">
                  {userTickets.length} Total Cases
                </span>
              </div>

              {userTickets.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-[#ff6325] flex items-center justify-center mx-auto">
                    <Ticket size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No active cases</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All your previous queries have been closed or you haven&apos;t opened any tickets yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#ff6325] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span>Open a Case</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {userTickets.map(ticket => (
                    <div key={ticket.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#ff6325]">{ticket.id}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ticket.status === 'OPEN' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                            ticket.status === 'PENDING' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                            'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ticket.subject}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Routed to: <span className="font-semibold text-slate-700 dark:text-slate-200">{ticket.targetType === 'ADMIN' ? 'Bokspot Admin Resolution' : ticket.merchantName}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-400 sm:self-center">
                        Active SLA: ~15 mins
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FAQS ACCORDION (Interactive List) */}
        {activeTab === 'faq' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Frequently Answered Questions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Instant answers to common booking, refund, and pass issues.
                </p>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div 
                      key={idx}
                      className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-white/[0.02] overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer hover:text-[#ff6325] transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={16} className="text-[#ff6325] shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
