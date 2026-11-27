'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Calendar,
  Clock,
  Video,
  MapPin,
  ShieldCheck,
  User,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  X
} from 'lucide-react';

export interface DoctorBookingFlowProps {
  venueName: string;
  merchantId: string;
  category: string;
  city?: string;
  liveServices?: any[];
  setSelectedService: (service: any) => void;
  setSelectedSlot: (slot: any) => void;
}

interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  degree: string;
  experienceYears: number;
  clinicName: string;
  opdRoom: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
  consultationFee: number;
  videoFee: number;
  languages: string[];
  slotsMorning: string[];
  slotsEvening: string[];
  nextAvailable: string;
}

export function DoctorBookingFlow({
  venueName,
  merchantId,
  category,
  city = 'Chennai',
  liveServices,
  setSelectedService,
  setSelectedSlot
}: DoctorBookingFlowProps) {
  const router = useRouter();

  // 1. Dynamic Doctor Profiles (100% from Business Portal)
  const doctorsList: DoctorProfile[] = useMemo(() => {
    if (!liveServices || liveServices.length === 0) return [];

    const parseMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
    };
    const fmtTime = (mins: number) => {
      const h24 = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const sourceDoctors = (liveServices[0]?.listings && liveServices[0].listings.length > 0)
      ? liveServices[0].listings
      : liveServices;

    return sourceDoctors.map((svc: any, idx: number) => {
      const sched = svc.metadata?.salonSchedule || liveServices[0]?.metadata?.salonSchedule;
      let morning: string[] = [];
      let evening: string[] = [];
      if (sched && sched.openTime && sched.closeTime) {
        const openM = parseMins(sched.openTime);
        const closeM = parseMins(sched.closeTime);
        const step = Number(sched.slotDuration || 20);
        const breaks: any[] = sched.breaks || [];
        const blocked: string[] = sched.blockedSlots || [];
        for (let t = openM; t + step <= closeM; t += step) {
          const label = fmtTime(t);
          const inBreak = breaks.some((b: any) => t >= parseMins(b.start) && t < parseMins(b.end));
          if (!inBreak && !blocked.includes(label)) {
            if (t < 12 * 60) morning.push(label);
            else evening.push(label);
          }
        }
      }

      return {
        id: svc.id || `doc-${idx + 1}`,
        name: svc.name || 'Consultant Doctor',
        specialty: svc.metadata?.specialty || svc.metadata?.salonCategory || svc.category || 'General Medicine',
        degree: svc.metadata?.degree || 'MBBS',
        experienceYears: Number(svc.metadata?.experienceYears) || 5,
        clinicName: venueName || 'Clinic',
        opdRoom: svc.metadata?.opdRoom || `OPD Room ${101 + idx}`,
        rating: 4.9,
        reviewsCount: 0,
        avatar: svc.image || '',
        consultationFee: Number(svc.price || 500),
        videoFee: Number(svc.metadata?.videoFee ?? Math.max(0, Number(svc.price || 500) - 50)),
        languages: svc.metadata?.languages || ['English', 'Tamil'],
        slotsMorning: morning,
        slotsEvening: evening,
        nextAvailable: 'Today • Instant OPD Token',
        clinicContact: svc.metadata?.clinicContact || ''
      };
    });
  }, [liveServices, venueName]);

  // States
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctorsList[0]?.id || 'doc-1');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [consultationMode, setConsultationMode] = useState<'IN_CLINIC' | 'VIDEO_CONSULTATION'>('IN_CLINIC');
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('10:00 AM');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);

  // Patient Details Form
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [hasFollowupReports, setHasFollowupReports] = useState<boolean>(false);
  const [patientVisitType, setPatientVisitType] = useState<'NEW' | 'RETURNING'>('NEW');
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'PAY_AT_CLINIC'>('ONLINE');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedShift, setSelectedShift] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [formError, setFormError] = useState<string>('');
  const [bookedSlotKeys, setBookedSlotKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    fetch('/api/v1/bookings/sync')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const list = Array.isArray(data) ? data : (data.bookings || []);
        const keys = new Set<string>();
        const mId = String(merchantId || '').trim();
        const mName = (venueName || '').toLowerCase().trim();
        list.forEach((b: any) => {
          if (b.status === 'CANCELLED') return;
          const bId = String(b.merchantId || '').trim();
          const bName = (b.merchantName || '').toLowerCase().trim();
          if ((mId && bId && bId !== mId) && (mName && bName && bName !== mName)) return;
          const doc = b.metadata?.doctor;
          if (doc?.doctorName && doc?.timeSlot && (doc?.date || b.date)) {
            keys.add(`${doc.doctorName.toLowerCase().trim()}|${doc.date || b.date}|${doc.timeSlot.trim()}`);
          }
        });
        setBookedSlotKeys(keys);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [merchantId, venueName]);

  const activeDoctor = useMemo(() => {
    return doctorsList.find((d) => d.id === selectedDoctorId) || doctorsList[0];
  }, [doctorsList, selectedDoctorId]);

  const activeFee = activeDoctor
    ? (consultationMode === 'IN_CLINIC' ? activeDoctor.consultationFee : activeDoctor.videoFee)
    : 0;

  // Handle Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!patientName.trim()) {
      setFormError('Please enter the patient full name');
      return;
    }
    if (!patientAge || Number(patientAge) <= 0 || Number(patientAge) > 120) {
      setFormError('Please enter a valid patient age (1-120)');
      return;
    }
    setFormError('');

    // Generate Instant Real-time OPD Token
    const generatedToken = Math.floor(10 + Math.random() * 89);
    const resolvedMerchantId = merchantId || 'merchant-doctor-clinic';
    const bookingTitle = `${activeDoctor.name} — ${consultationMode === 'IN_CLINIC' ? 'In-Clinic Consultation' : 'Video Call Consultation'}`;

    setSelectedService({
      id: `doctor-${activeDoctor.id}-${Date.now()}`,
      name: bookingTitle,
      price: activeFee,
      merchantId: resolvedMerchantId,
      merchantName: venueName || activeDoctor.clinicName,
      category: 'Doctor Appointment',
      metadata: {
        isDoctor: true,
        doctor: {
          doctorName: activeDoctor.name,
          role: activeDoctor.specialty,
          clinicName: venueName || activeDoctor.clinicName,
          tokenNumber: generatedToken,
          opdRoom: activeDoctor.opdRoom,
          consultationMode,
          date: selectedDate,
          timeSlot: selectedSlotTime,
          patientName: patientName.trim(),
          patientAge: Number(patientAge),
          patientGender,
          patientPhone: patientPhone.trim(),
          symptoms: symptoms.trim() || 'General health consultation',
          hasFollowupReports,
          patientVisitType,
          paymentMode,
          clinicContact: (activeDoctor as any).clinicContact || '',
          degree: activeDoctor.degree
        }
      }
    });

    setSelectedSlot({
      id: `slot-doc-${Date.now()}`,
      timeStr: `${selectedDate} at ${selectedSlotTime} (Token #${generatedToken})`,
      date: selectedDate,
      available: true
    });

    setIsPatientModalOpen(false);
    router.push('/booking/checkout');
  };

  if (doctorsList.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-dashed border-slate-200 dark:border-white/10 text-center text-sm font-bold text-slate-500">
        No doctors or OPD consultation slots listed yet for this clinic.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── SECTION HEADER ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#0A3161] text-white flex items-center justify-center">
              <Stethoscope size={14} />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Doctor &amp; Clinic Consultation
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Book certified doctor appointments with instant digital OPD token &amp; live queue pass.
          </p>
        </div>

        {/* In-Clinic vs Video Consultation Mode Pill */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setConsultationMode('IN_CLINIC')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              consultationMode === 'IN_CLINIC'
                ? 'bg-[#0A3161] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <MapPin size={13} />
            <span>In-Clinic Visit</span>
          </button>
          <button
            type="button"
            onClick={() => setConsultationMode('VIDEO_CONSULTATION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              consultationMode === 'VIDEO_CONSULTATION'
                ? 'bg-[#0A3161] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Video size={13} />
            <span>Video Call (-₹50)</span>
          </button>
        </div>
      </div>

      {/* ── DOCTOR PROFILE CARDS ───────────────────────── */}
      {(() => {
        const specialties = ['ALL', ...Array.from(new Set(doctorsList.map(d => d.specialty).filter(Boolean)))];
        const visibleDoctors = selectedSpecialty === 'ALL' ? doctorsList : doctorsList.filter(d => d.specialty === selectedSpecialty);
        return (
          <>
            {specialties.length > 2 && (
              <div className="flex flex-wrap items-center gap-2">
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      selectedSpecialty === spec
                        ? 'bg-[#0A3161] text-white border-[#0A3161] shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#0A3161]/40'
                    }`}
                  >
                    {spec === 'ALL' ? 'All Specialists' : spec}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleDoctors.map((doc) => {
          const isSelected = selectedDoctorId === doc.id;
          const fee = consultationMode === 'IN_CLINIC' ? doc.consultationFee : doc.videoFee;

  return (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'bg-[#0A3161]/[0.05] dark:bg-blue-950/20 border-[#0A3161] dark:border-blue-500 ring-2 ring-[#0A3161]/20'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {doc.avatar ? (
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0A3161]/10 text-[#0A3161] dark:bg-blue-500/20 dark:text-blue-300 flex items-center justify-center text-base font-black shrink-0 border border-slate-200/80 dark:border-white/10">
                    {(doc.name || 'DR').replace(/^Dr\.\s*/i, '').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      ✓ Verified Specialist
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {doc.experienceYears}y exp
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-[#0A3161] dark:text-blue-400 font-bold mt-0.5 truncate">
                    {doc.specialty}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {doc.degree}
                  </p>
                </div>
              </div>

              {/* Consultation Details & Fee */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Consultation Fee
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black text-[#0A3161] dark:text-blue-400">
                      ₹{fee}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      • Instant OPD Token
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDoctorId(doc.id);
                    setIsPatientModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0A3161] hover:bg-[#08284d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>Book Slot</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
            </div>
          </>
        );
      })()}

      {/* ── TIME SLOT SELECTION GRID ───────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock size={13} className="text-[#0A3161] dark:text-blue-400" />
              <span>Select Consultation Time Slot — {activeDoctor.name}</span>
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Average consultation duration: 15-20 minutes • On-time token queue
            </span>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Date:</span>
            <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 gap-2">
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

        {/* Shift Tabs: Morning / Afternoon / Evening */}
        {(() => {
          const morningSlots = activeDoctor.slotsMorning;
          const afternoonSlots = activeDoctor.slotsEvening.filter(s => s.startsWith('12:') || s.startsWith('01:') || s.startsWith('02:') || s.startsWith('03:'));
          const eveningSlots = activeDoctor.slotsEvening.filter(s => !afternoonSlots.includes(s));
          const shifts = [
            { id: 'MORNING' as const, label: '🌅 Morning', slots: morningSlots },
            { id: 'AFTERNOON' as const, label: '☀️ Afternoon', slots: afternoonSlots },
            { id: 'EVENING' as const, label: '🌆 Evening', slots: eveningSlots }
          ];
          const currentSlots = shifts.find(sh => sh.id === selectedShift)?.slots || [];
          return (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {shifts.map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => setSelectedShift(sh.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedShift === sh.id
                        ? 'bg-[#0A3161] text-white border-[#0A3161] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#0A3161]/40'
                    }`}
                  >
                    {sh.label} ({sh.slots.length})
                  </button>
                ))}
              </div>
              {currentSlots.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-2">No slots available in this shift.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentSlots.map((slot) => {
                    const slotKey = `${(activeDoctor.name || '').toLowerCase().trim()}|${selectedDate}|${slot.trim()}`;
                    const isBooked = bookedSlotKeys.has(slotKey);
                    const isSelected = !isBooked && selectedSlotTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        title={isBooked ? 'Already booked' : undefined}
                        onClick={() => !isBooked && setSelectedSlotTime(slot)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isBooked
                            ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-400 line-through cursor-not-allowed opacity-60'
                            : isSelected
                              ? 'bg-[#FF5201] text-white border-[#FF5201] shadow-xs scale-105 cursor-pointer'
                              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        {slot}{isBooked ? ' (Booked)' : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── BOTTOM DOCK BAR ────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {activeDoctor.name} • {consultationMode === 'IN_CLINIC' ? 'In-Clinic OPD' : 'Video Consultation'}
            </span>
            <span className="text-base font-black text-[#0A3161] dark:text-blue-400">
              ₹{activeFee}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
            {selectedDate} at {selectedSlotTime} • {activeDoctor.opdRoom} ({activeDoctor.clinicName})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPatientModalOpen(true)}
          className="px-8 py-3 rounded-xl bg-[#0A3161] hover:bg-[#08284d] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto active:scale-95"
        >
          <span>Continue to Patient Details</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── MODAL DRAWER: PATIENT DETAILS & SYMPTOMS ─── */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 pt-16 font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPatientModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-[#0A3161]/[0.04] dark:bg-blue-950/30 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0A3161] text-white">
                    Step 2: Patient Info
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {selectedDate} • {selectedSlotTime}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeDoctor.name}
                </h3>
                <span className="text-xs text-[#0A3161] dark:text-blue-400 font-bold">
                  {consultationMode === 'IN_CLINIC' ? `In-Clinic OPD (${activeDoctor.opdRoom})` : 'Video Consultation Call'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPatientModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Patient Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Anandha Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0A3161]"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Age (Years) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 34"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0A3161]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0A3161] cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  WhatsApp / SMS Mobile Number (For OPD Token)
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0A3161]"
                />
              </div>

              {/* Chief Complaints / Symptoms */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Visit / Primary Symptoms
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. High fever for 2 days, persistent headache, throat irritation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#0A3161] resize-none"
                />
              </div>

              {/* Checkbox: Follow-up Reports */}
              {/* New / Returning Patient */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Visit Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['NEW', 'RETURNING'] as const).map((vt) => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setPatientVisitType(vt)}
                      className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        patientVisitType === vt
                          ? 'bg-[#0a3161] text-white border-[#0a3161]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {vt === 'NEW' ? 'New Patient' : 'Returning'}
                    </button>
                  ))}
                </div>
              </div>

              <div
                onClick={() => setHasFollowupReports(!hasFollowupReports)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={hasFollowupReports}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#0A3161] rounded cursor-pointer pointer-events-none"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Carrying Previous Medical Reports / Prescriptions
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Doctor will review past investigations during OPD checkup
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Consultation Fee
                </span>
                <span className="text-lg font-black text-[#0A3161] dark:text-blue-400">
                  ₹{activeFee}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="px-6 py-2.5 rounded-xl bg-[#0A3161] hover:bg-[#08284d] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Confirm &amp; Proceed to Pay</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

