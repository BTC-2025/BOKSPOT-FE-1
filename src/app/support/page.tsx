'use client';

import { useState, useEffect } from 'react';
import { Shield, Building2, Ticket, CheckCircle2, Search, ArrowLeft, Send } from 'lucide-react';
import { useBookingFlowStore } from '../../lib/store';
import Link from 'next/link';

export default function SupportPage() {
  const { merchants, addUserTicket, userTickets, fetchTickets } = useBookingFlowStore();
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const [targetType, setTargetType] = useState<'ADMIN' | 'BUSINESS'>('ADMIN');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  return (
    <div className="min-h-screen bg-bg-primary pt-[116px] md:pt-[124px] pb-16 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-gradient-to-b from-[#0a3161]/10 dark:from-[#ff6325]/10 via-[#0a3161]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* Header & Back Action */}
        <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-border-brand/40 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-[#ff6325] text-text-primary hover:text-white transition-all text-xs font-bold border border-black/5 dark:border-white/10 shadow-2xs group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Home</span>
              </Link>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-[#ff6325]/10 text-[#ff6325] border border-[#ff6325]/20">
                24/7 Priority Desk
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Help Center &amp; Support Concierge
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-1 font-medium max-w-2xl">
              Resolve booking issues, request cancellations, report merchant discrepancies, or connect directly with our resolution desk.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 self-start md:self-end shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Agents Online (~3 min response)</span>
            </div>
          </div>
        </div>

        {/* Top 3 Quick Channels (Filled Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-brand/60 shadow-xs flex items-center gap-3 hover:border-[#ff6325]/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-text-primary">Admin Resolution</h4>
              <p className="text-[10px] text-text-muted mt-0.5">Refunds, billing &amp; portal safety</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-brand/60 shadow-xs flex items-center gap-3 hover:border-sky-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-text-primary">Direct Merchant Line</h4>
              <p className="text-[10px] text-text-muted mt-0.5">Resort, turf &amp; cab timing changes</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border-brand/60 shadow-xs flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-text-primary">Instant SLA Guarantee</h4>
              <p className="text-[10px] text-text-muted mt-0.5">Automated ticket tracking &amp; alerts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-brand/70 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden backdrop-blur-xl">
              
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-brand/40">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#ff6325]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">New Resolution Ticket</h3>
                </div>
                <span className="text-[10px] text-text-muted font-bold">Fast-track routing</span>
              </div>

              {/* Target Selection Toggle */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Who do you want to contact?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetType('ADMIN')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      targetType === 'ADMIN' 
                        ? 'border-[#ff6325] bg-[#ff6325]/10 text-[#ff6325] shadow-xs ring-1 ring-[#ff6325]/30' 
                        : 'border-border-brand/60 bg-black/[0.02] dark:bg-white/[0.02] text-text-secondary hover:border-border-brand hover:text-text-primary'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      targetType === 'ADMIN' ? 'bg-[#ff6325] text-white shadow-xs' : 'bg-black/5 dark:bg-white/10 text-text-muted'
                    }`}>
                      <Shield size={16} />
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-xs block text-text-primary">BOKSPOT Admin</span>
                      <span className="text-[10px] text-text-muted font-medium">Platform &amp; Refunds</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('BUSINESS')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      targetType === 'BUSINESS' 
                        ? 'border-[#0a3161] dark:border-sky-400 bg-[#0a3161]/10 dark:bg-sky-400/10 text-[#0a3161] dark:text-sky-400 shadow-xs ring-1 ring-sky-400/30' 
                        : 'border-border-brand/60 bg-black/[0.02] dark:bg-white/[0.02] text-text-secondary hover:border-border-brand hover:text-text-primary'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      targetType === 'BUSINESS' ? 'bg-[#0a3161] text-white shadow-xs' : 'bg-black/5 dark:bg-white/10 text-text-muted'
                    }`}>
                      <Building2 size={16} />
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-xs block text-text-primary">A Business</span>
                      <span className="text-[10px] text-text-muted font-medium">Slots &amp; Venue Support</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5">
                
                {targetType === 'BUSINESS' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Select Business</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                      <select 
                        value={selectedMerchantId}
                        onChange={(e) => setSelectedMerchantId(e.target.value)}
                        className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-border-brand/70 text-text-primary text-xs rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 transition-colors appearance-none cursor-pointer font-medium"
                      >
                        <option value="" disabled>Choose a business from catalog...</option>
                        {merchants.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Slot rescheduling request, payment dispute..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-border-brand/70 text-text-primary text-xs rounded-xl py-2 px-3.5 focus:outline-none focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 transition-colors font-medium placeholder-text-muted/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Message Details</label>
                  <textarea 
                    placeholder="Provide booking ID or relevant details so our team can resolve immediately..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-border-brand/70 text-text-primary text-xs rounded-xl py-2 px-3.5 focus:outline-none focus:border-[#ff6325] focus:ring-1 focus:ring-[#ff6325]/30 transition-colors resize-none font-medium placeholder-text-muted/60"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#ff6325] hover:bg-[#ff7b47] active:scale-[0.99] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#ff6325]/20 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Submit Ticket</span>
                </button>

              </div>
            </form>
            
            {/* Success Message */}
            {isSubmitted && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
                <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary">Ticket Submitted Successfully!</h3>
                  <p className="text-text-secondary text-[11px] font-medium">Your request has been routed to our support queue. We will update you shortly.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recent Tickets + Help Topics & Direct Lines (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 animate-fade-in">
            
            {/* Recent Tickets Card */}
            <div className="bg-bg-secondary border border-border-brand/70 rounded-2xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border-brand/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#ff6325]/10 rounded-lg text-[#ff6325]">
                    <Ticket size={14} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold text-text-primary">Recent Tickets</h2>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted font-bold">{userTickets.length} Logged</span>
              </div>

              {userTickets.length === 0 ? (
                <div className="text-center py-5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-border-brand/40">
                  <Ticket size={18} className="mx-auto text-text-muted/60 mb-1" />
                  <p className="text-text-muted font-medium text-xs">No active tickets.</p>
                  <p className="text-[10px] text-text-muted/80 mt-0.5">Submit the form on the left to open a new case.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userTickets.slice(0, 4).map(ticket => (
                    <div key={ticket.id} className="p-2.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-border-brand/60 flex flex-col gap-1 hover:border-[#ff6325]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-muted font-mono">{ticket.id}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          ticket.status === 'OPEN' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' :
                          ticket.status === 'PENDING' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-text-primary line-clamp-1">{ticket.subject}</h4>
                      <p className="text-[10px] font-medium text-text-secondary flex items-center gap-1">
                        <span>To:</span> {ticket.targetType === 'ADMIN' ? <span className="text-[#ff6325] font-bold">Admin</span> : <span className="text-[#0a3161] dark:text-sky-400 font-bold">{ticket.merchantName}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Common FAQ & Quick Solutions Card (Fills remaining space) */}
            <div className="bg-bg-secondary border border-border-brand/70 rounded-2xl p-4.5 shadow-xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary mb-2.5 flex items-center gap-1.5">
                <span>Frequently Resolved Inquiries</span>
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-brand/50">
                  <h4 className="font-extrabold text-text-primary text-[11px]">How do refunds work for cancelled turf/hotel slots?</h4>
                  <p className="text-text-secondary text-[10px] mt-0.5 leading-relaxed">
                    Refunds are initiated instantly and credited to source account within 2-4 business hours.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-brand/50">
                  <h4 className="font-extrabold text-text-primary text-[11px]">Can I reschedule my appointment directly with the merchant?</h4>
                  <p className="text-text-secondary text-[10px] mt-0.5 leading-relaxed">
                    Yes, choose &ldquo;A Business&rdquo; in the form above to send an official time amendment request.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-brand/50">
                  <h4 className="font-extrabold text-text-primary text-[11px]">Where do I find my booking QR pass?</h4>
                  <p className="text-text-secondary text-[10px] mt-0.5 leading-relaxed">
                    Head to the <Link href="/bookings" className="text-[#ff6325] font-bold underline">Bookings tab</Link> in the top navigation bar to download or present passes.
                  </p>
                </div>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
