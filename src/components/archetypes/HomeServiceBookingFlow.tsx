'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Wrench,
  Zap,
  Droplets,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';

interface HomeServiceBookingFlowProps {
  venueName: string;
  merchantId: string;
  category: string;
  city?: string;
  liveServices: any[];
  setSelectedService: (svc: any) => void;
  setSelectedSlot: (slot: any) => void;
}

const CATEGORY_META: Record<
  string,
  { label: string; subtitle: string; badge: string; icon: React.ReactNode }
> = {
  electrician: {
    label: 'Certified Electrician Services',
    subtitle: 'Licensed electricians for wiring, switches, MCB & appliance hookups.',
    badge: 'Electrical Call-Out',
    icon: <Zap size={18} className="text-amber-500" />,
  },
  plumber: {
    label: 'Professional Plumbing Services',
    subtitle: 'Verified plumbers for leakages, pipe fittings, taps & drainage.',
    badge: 'Plumbing Dispatch',
    icon: <Droplets size={18} className="text-sky-500" />,
  },
  cleaning: {
    label: 'Home & Deep Cleaning Services',
    subtitle: 'Trained cleaning teams for full-home, kitchen & bathroom sanitization.',
    badge: 'Cleaning Crew',
    icon: <Sparkles size={18} className="text-emerald-500" />,
  },
  technician: {
    label: 'Appliance & Technician Services',
    subtitle: 'Expert technicians for AC, fridge, washing machine, microwave & TV repair.',
    badge: 'Appliance Repair',
    icon: <Wrench size={18} className="text-[#FF5201]" />,
  },
};

function getCategoryMeta(category: string) {
  const key = (category || '').toLowerCase();
  if (key.includes('electri')) return CATEGORY_META.electrician;
  if (key.includes('plumb')) return CATEGORY_META.plumber;
  if (key.includes('clean')) return CATEGORY_META.cleaning;
  return CATEGORY_META.technician;
}

const MORNING_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM'];
const AFTERNOON_SLOTS = ['12:00 PM', '02:00 PM', '03:00 PM'];
const EVENING_SLOTS = ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];

export function HomeServiceBookingFlow({
  venueName,
  merchantId,
  category,
  city = 'Chennai',
  liveServices,
  setSelectedService,
  setSelectedSlot,
}: HomeServiceBookingFlowProps) {
  const router = useRouter();
  const meta = getCategoryMeta(category);
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    liveServices[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedShift, setSelectedShift] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('10:00 AM');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  const [addressLine, setAddressLine] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [bookedSlotKeys, setBookedSlotKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (liveServices.length > 0 && !liveServices.some((s) => s.id === selectedServiceId)) {
      setSelectedServiceId(liveServices[0].id);
    }
  }, [liveServices, selectedServiceId]);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/bookings/sync')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const list = Array.isArray(data) ? data : data.bookings || [];
        const keys = new Set<string>();
        const mId = String(merchantId || '').trim();
        const mName = (venueName || '').toLowerCase().trim();
        list.forEach((b: any) => {
          if (b.status === 'CANCELLED') return;
          const bId = String(b.merchantId || '').trim();
          const bName = (b.merchantName || '').toLowerCase().trim();
          if (mId && bId && bId !== mId && mName && bName && bName !== mName) return;
          const hs = b.metadata?.homeService;
          if (hs?.serviceId && hs?.timeSlot && (hs?.date || b.date)) {
            keys.add(`${hs.serviceId}|${hs.date || b.date}|${hs.timeSlot.trim()}`);
          }
        });
        setBookedSlotKeys(keys);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [merchantId, venueName]);

  const activeService = useMemo(
    () => liveServices.find((s) => s.id === selectedServiceId) || liveServices[0],
    [liveServices, selectedServiceId]
  );

  const shifts = [
    { id: 'MORNING' as const, label: '🌅 Morning', slots: MORNING_SLOTS },
    { id: 'AFTERNOON' as const, label: '☀️ Afternoon', slots: AFTERNOON_SLOTS },
    { id: 'EVENING' as const, label: '🌆 Evening', slots: EVENING_SLOTS },
  ];
  const currentSlots = shifts.find((s) => s.id === selectedShift)?.slots || [];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim()) {
      setFormError('Please enter your Door / Flat No & Street address.');
      return;
    }
    if (!contactPhone.trim()) {
      setFormError('Please enter a mobile number for technician arrival.');
      return;
    }
    if (!activeService) return;

    setFormError('');
    const price = Number(activeService.price || 499);

    setSelectedService({
      id: activeService.id,
      title: activeService.title || activeService.name || meta.label,
      price,
      merchant: venueName,
      merchantId,
      category,
      city,
      metadata: {
        homeService: {
          serviceId: activeService.id,
          serviceTitle: activeService.title || activeService.name,
          date: selectedDate,
          timeSlot: selectedSlotTime,
          addressLine: addressLine.trim(),
          landmark: landmark.trim(),
          contactPhone: contactPhone.trim(),
          issueNotes: issueNotes.trim(),
        },
      },
    });

    setSelectedSlot({
      id: `slot-hs-${Date.now()}`,
      timeStr: `${selectedDate} at ${selectedSlotTime}`,
      date: selectedDate,
      time: selectedSlotTime,
    });

    setIsAddressModalOpen(false);
    router.push('/booking/checkout');
  };

  if (liveServices.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
        <p className="text-sm font-bold text-slate-500">
          No services listed yet for this provider.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {meta.icon}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{meta.label}</h2>
            <p className="text-xs text-slate-500 font-medium">{meta.subtitle}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#0A3161]/10 text-[#0A3161] dark:text-sky-400 text-[11px] font-bold">
          {meta.badge}
        </span>
      </div>

      {/* Step 1: Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {liveServices.map((svc) => {
          const isSelected = svc.id === activeService?.id;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => setSelectedServiceId(svc.id)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? 'border-[#0A3161] bg-[#0A3161]/[0.03] dark:bg-white/[0.04] ring-1 ring-[#0A3161]'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                    <ShieldCheck size={13} /> Verified
                  </span>
                  {svc.duration && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      • {svc.duration}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                  {svc.title || svc.name}
                </h3>
                {svc.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{svc.description}</p>
                )}
                <p className="text-base font-black text-[#0A3161] dark:text-[#FF5201] mt-2">
                  ₹{Number(svc.price || 499).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 ${
                  isSelected
                    ? 'bg-[#0A3161] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {isSelected ? 'Selected' : 'Select'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step 2: Date & Time Slot */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            <Clock size={15} className="text-[#FF5201]" />
            <span>Select Arrival Slot — {activeService?.title || activeService?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Date:</span>
            <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 gap-2">
              <Calendar size={14} className="text-[#0A3161] dark:text-[#FF5201] shrink-0 pointer-events-none" />
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {shifts.map((sh) => (
            <button
              key={sh.id}
              type="button"
              onClick={() => setSelectedShift(sh.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                selectedShift === sh.id
                  ? 'bg-[#0A3161] text-white border-[#0A3161]'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
              }`}
            >
              {sh.label} ({sh.slots.length})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {currentSlots.map((slot) => {
            const slotKey = `${activeService?.id || ''}|${selectedDate}|${slot.trim()}`;
            const isBooked = bookedSlotKeys.has(slotKey);
            const isSelected = !isBooked && selectedSlotTime === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={isBooked}
                onClick={() => !isBooked && setSelectedSlotTime(slot)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isBooked
                    ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-400 line-through cursor-not-allowed opacity-60'
                    : isSelected
                      ? 'bg-[#FF5201] text-white border-[#FF5201] shadow-xs cursor-pointer'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-slate-300 cursor-pointer'
                }`}
              >
                {slot}
                {isBooked ? ' (Booked)' : ''}
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
          <div className="text-xs text-slate-500 font-semibold">
            {selectedDate} • {selectedSlotTime}
          </div>
          <button
            type="button"
            onClick={() => setIsAddressModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0A3161] hover:bg-[#072448] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Enter Service Address</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Step 3: Address & Issue Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0A3161] text-white text-[10px] font-black uppercase">
                  Service Address
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {activeService?.title || activeService?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDate} • {selectedSlotTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <MapPin size={13} /> Door / Flat No & Street *
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Flat 4B, Anna Nagar West"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-[#0A3161]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Landmark / Area
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Tower Park"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-[#0A3161]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <Phone size={13} /> Mobile Number *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-[#0A3161]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <FileText size={13} /> Issue / Work Description
                </label>
                <textarea
                  rows={2}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="Briefly describe the issue..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-[#0A3161]"
                />
              </div>

              {formError && (
                <p className="text-xs font-bold text-red-500">{formError}</p>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Service Fee
                  </span>
                  <span className="text-lg font-black text-[#0A3161] dark:text-white">
                    ₹{Number(activeService?.price || 499).toLocaleString()}
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5201] hover:bg-[#e54800] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

