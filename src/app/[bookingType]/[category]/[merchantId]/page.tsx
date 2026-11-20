'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Clock, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, Info, ShieldCheck, Search, Users, Utensils, X, Calendar, Bed, Star, Heart, Check, MapPin, ExternalLink, Headphones, Award, Minus, Plus, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocationStore, useBookingFlowStore, ALL_CITIES, POPULAR_CITIES } from '@/lib/store';
import { BokspotLoader } from '@/components/ui/BokspotLoader';
import { getSportCategoryConfig } from '@/lib/sportsData';
import { getEntertainmentCategoryConfig, getMovieBySlugOrId, NOW_SHOWING_MOVIES, MovieListingItem } from '@/lib/entertainmentData';
import { getDiningConfig } from '@/lib/diningData';
import { getWellnessConfig } from '@/lib/wellnessData';
import { getFitnessConfig } from '@/lib/fitnessData';
import { getClinicConfig } from '@/lib/clinicalData';
import { getHomeServiceConfig } from '@/lib/homeServicesData';

const CATEGORY_NAMES: Record<string, string> = {
  // Travel & Transport
  flights: 'Flight Booking', trains: 'Train Booking', buses: 'Bus Booking', ferry: 'Ferry / Boat Booking', shuttle: 'Shuttle / Van Booking', helicopter: 'Helicopter Booking', cabs: 'Cab / Taxi Booking', 'bike-rental': 'Bike Rental', 'car-rental': 'Self-Drive Car Rental',
  // Stay & Accommodation
  hotels: 'Hotel Booking', resorts: 'Resort Booking', villas: 'Homestay / Villa', hostels: 'Hostel Booking', 'pg-hostels': 'PG & Co-Living Stays', camping: 'Camping Booking',
  // Entertainment & Events
  movies: 'Cinema / Movie Tickets', theatre: 'Theatre Shows', concerts: 'Concert Tickets', events: 'Events & Festivals', exhibitions: 'Exhibition Entry', workshops: 'Workshops / Classes', gaming: 'Gaming Arena Booking',
  // Sports & Turf
  'football-turf': 'Football Turf', 'cricket-ground': 'Cricket Ground', badminton: 'Badminton Court', tennis: 'Tennis Court', basketball: 'Basketball Court', swimming: 'Swimming Pool Slots', 'play-arena': 'Indoor Play Arena',
  // Lifestyle & Local Services
  dining: 'Restaurant Table Reservation', salons: 'Salon / Spa Appointment', spa: 'Spa & Wellness Rituals', gym: 'Gym Floor & Membership Booking', 'gym-yoga': 'Gym Floor & Membership Booking', yoga: 'Yoga Shala & Meditation Batches', 'yoga-meditation': 'Yoga Shala & Meditation Batches', doctor: 'Doctor Appointment', electrician: 'Electrician Booking', plumber: 'Plumber Booking', cleaning: 'Cleaning Service', technician: 'Technician Service', studio: 'Studio Booking',
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
  const rawCategory = params?.category as string;
  const category = rawCategory === 'stayhotel' || rawCategory === 'stay-hotel' || rawCategory === 'hotel' ? 'hotels' : (rawCategory === 'resort' ? 'resorts' : (rawCategory === 'villa' ? 'villas' : rawCategory));
  const merchantId = params?.merchantId as string;
  const cleanCat = (category || '').toLowerCase();
  const cleanMerchantId = (merchantId || '').toLowerCase();
  const { city, setCity, setLocation } = useLocationStore();
  const { setSelectedService, setSelectedSlot, bookings } = useBookingFlowStore();
  const searchParams = useSearchParams();
  const isEntertainment = Boolean(getEntertainmentCategoryConfig(category)) || (bookingType || '').toLowerCase().includes('entertainment') || ['movies', 'theatre', 'concerts', 'events', 'exhibitions', 'workshops'].includes((category || '').toLowerCase());
  const isPgStay = !isEntertainment && (category === 'pg-hostels' || category === 'hostels' || (bookingType === 'stay-accommodation' && (rawCategory?.includes('pg') || rawCategory?.includes('hostel'))));
  const isFacility = !isEntertainment && (category === 'football-turf' || category === 'cricket-ground' || category === 'badminton' || category === 'tennis' || category === 'basketball' || category === 'swimming' || category === 'play-arena' || category === 'studio' || category === 'photo-studios' || category === 'dance-studio' || category === 'meeting-room' || category === 'podcast' || category === 'gaming' || bookingType === 'sports-turf');
  const isDoctor = category === 'doctor';
  const isWellness = category === 'salons' || category === 'spa' || category === 'wellness' || (cleanCat.includes('salon') || cleanCat.includes('spa'));
  const isFitness = (category === 'gym' || category === 'gym-yoga' || cleanCat.includes('gym') || (cleanCat.includes('fitness') && !cleanCat.includes('yoga')));
  const isYoga = (category === 'yoga' || category === 'yoga-meditation' || cleanCat.includes('yoga') || cleanCat.includes('meditation'));
  const isStudio = category === 'studio' || category === 'photo-studios' || category === 'dance-studio' || category === 'podcast' || cleanCat.includes('studio');
  const isDining = category === 'dining' || category === 'restaurants' || cleanCat.includes('dine') || cleanCat.includes('restaurant') || cleanCat.includes('food');
  const isAppointment = isDoctor;
  const isRental = category === 'sports-bike' || category === 'car-rental' || category === 'bike-rental' || category === 'camera' || category === 'cycle-rental' || category === 'sound-system' || category === 'event-equip' || bookingType === 'rental-equipment';
  const isPass = category === 'movies' || category === 'concerts' || category === 'theatre' || category === 'events' || category === 'exhibitions' || category === 'darshan' || category === 'coworking';
  const isHomeCall = category === 'electrician' || category === 'plumber' || category === 'cleaning' || category === 'technician' || category === 'babysitting' || category === 'elder-care';
  const isHotel = !isEntertainment && !isFacility && !isAppointment && !isWellness && !isFitness && !isYoga && !isStudio && !isDining && !isRental && !isPass && !isHomeCall && (category === 'hotels' || category === 'resorts' || category === 'villas' || category === 'hostels' || category === 'pg-hostels' || category === 'camping' || bookingType === 'stay-accommodation' || (bookingType === 'home' && !category.includes('turf') && !category.includes('movie')));
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitMode, setVisitMode] = useState<'IN_PERSON' | 'LIVE_VIDEO'>('IN_PERSON');
  const [videoPlatform, setVideoPlatform] = useState<'WHATSAPP' | 'GOOGLE_MEET'>('WHATSAPP');
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [visitTimeSlot, setVisitTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitConfirmed, setVisitConfirmed] = useState(false);
  const [isVisitCalPopoverOpen, setIsVisitCalPopoverOpen] = useState(false);
  const [visitCalMonthDate, setVisitCalMonthDate] = useState(() => new Date());

  // PG Food Exclusion Discount Toggle state (Optional without food: -₹1,500/mo)
  const [isFoodExcluded, setIsFoodExcluded] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 2);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(searchParams?.get('checkIn') || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams?.get('checkOut') || tomorrowStr);
  const [adults, setAdults] = useState(Number(searchParams?.get('adults')) || 2);
  const [children, setChildren] = useState(Number(searchParams?.get('children')) || 0);
  const [childAges, setChildAges] = useState<number[]>(() => {
    try {
      const q = searchParams?.get('childAges');
      return q ? JSON.parse(decodeURIComponent(q)) : [];
    } catch { return []; }
  });
  const [rooms, setRooms] = useState(Number(searchParams?.get('rooms')) || 1);
  const [pets, setPets] = useState(searchParams?.get('pets') === 'true');
  const [petCount, setPetCount] = useState<number>(Number(searchParams?.get('petCount')) || 0);

  // Custom Calendar Popover states for Check-in / Check-out
  const [activeDatePicker, setActiveDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [pickerMonthDate, setPickerMonthDate] = useState(() => new Date());

  // Dedicated Hostel & PG Move-in & Stay States
  const [hostelMoveInDate, setHostelMoveInDate] = useState(() => searchParams?.get('moveIn') || todayStr);
  const [hostelDurationMonths, setHostelDurationMonths] = useState<number>(Number(searchParams?.get('durationMonths')) || 3);
  const [hostelGender, setHostelGender] = useState<'all' | 'gents' | 'ladies' | 'coliving'>((searchParams?.get('gender') as any) || 'all');
  const [hostelSharing, setHostelSharing] = useState<'all' | 'single' | '2-sharing' | '3-sharing' | '4-sharing'>((searchParams?.get('sharing') as any) || 'all');
  const [hostelFoodIncluded, setHostelFoodIncluded] = useState<boolean>(searchParams?.get('foodIncluded') !== 'false');
  const [isMoveInCalOpen, setIsMoveInCalOpen] = useState(false);
  const [moveInCalMonthDate, setMoveInCalMonthDate] = useState(() => new Date());

  // Sports dedicated search dock states (matching category discovery page)
  const [sportsSlotDate, setSportsSlotDate] = useState(() => searchParams?.get('date') || todayStr);
  const [sportsSlotTime, setSportsSlotTime] = useState(() => searchParams?.get('slot') || '06:00 PM - 07:00 PM');
  const [sportsDurationHours, setSportsDurationHours] = useState<number>(1);
  const [sportsFormatFilter, setSportsFormatFilter] = useState<string>('all');
  const [isSportsDatePickerOpen, setIsSportsDatePickerOpen] = useState(false);
  const [isSportsSlotDropdownOpen, setIsSportsSlotDropdownOpen] = useState(false);
  const [sportsCalDate, setSportsCalDate] = useState(() => new Date());
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const [showEditSearchAutocomplete, setShowEditSearchAutocomplete] = useState(false);

  // Compute stay duration in nights
  const nights = React.useMemo(() => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, [checkIn, checkOut]);

  const [liveServices, setLiveServices] = useState<any[]>(() => {
    try {
      if ((api.services as any)._cache) {
        for (const k in (api.services as any)._cache) {
          const list = (api.services as any)._cache[k]?.data?.data;
          if (Array.isArray(list)) {
            const matches = list.filter((s: any) => (s.merchantId === merchantId) || (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId)));
            if (matches.length > 0) return matches;
          }
        }
      }
    } catch { }
    return [];
  });
  const [merchantData, setMerchantData] = useState<any>(() => {
    try {
      return (api.merchants as any)._cache?.[merchantId]?.data || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => liveServices.length === 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // ── Hotel Interactive Room Details & Add-ons Flow States ──
  const [activeRoomService, setActiveRoomService] = useState<any | null>(null);
  const [roomModalStep, setRoomModalStep] = useState<'DETAILS' | 'ADDONS' | 'VISIT' | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [roomModalImageIdx, setRoomModalImageIdx] = useState(0);
  const [pgPaymentType, setPgPaymentType] = useState<'FULL_MONTH_RENT' | 'TOKEN_ADVANCE'>('FULL_MONTH_RENT');

  // ── Selected Movie Context (BookMyShow Flow) ──
  const movieParam = searchParams?.get('movie');
  const [activeMovie, setActiveMovie] = useState<MovieListingItem>(() => getMovieBySlugOrId(movieParam || 'avatar-fire-and-ash'));

  useEffect(() => {
    if (movieParam) {
      setActiveMovie(getMovieBySlugOrId(movieParam));
    }
  }, [movieParam]);

  // Lock background body scroll whenever modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(activeRoomService && roomModalStep) || isVisitModalOpen || isGalleryOpen || isModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeRoomService, roomModalStep, isVisitModalOpen, isGalleryOpen, isModalOpen]);

  // ── Facility / Turf Interactive Slot Flow States ──
  const queryParamDate = searchParams?.get('date');
  const queryParamSlot = searchParams?.get('slot');

  const [selectedDate, setSelectedDate] = useState(() => queryParamDate || todayStr);
  const [selectedHourSlot, setSelectedHourSlot] = useState<string | null>(null);
  const [selectedTurfService, setSelectedTurfService] = useState<any | null>(null);
  const [selectedTurfAddons, setSelectedTurfAddons] = useState<string[]>([]);
  const [isTurfAddonModalOpen, setIsTurfAddonModalOpen] = useState(false);
  const [slotHoldTimeRemaining, setSlotHoldTimeRemaining] = useState<number | null>(null);
  const [pricingResult, setPricingResult] = useState<any | null>(null);
  const [isPricingCalculating, setIsPricingCalculating] = useState(false);

  // ── Archetype 3: TimeSlot (Doctor & Salon/Spa) Flow States ──
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('Dr. Rajesh Kumar (Senior Consultant)');
  const [selectedApptSlot, setSelectedApptSlot] = useState<string | null>(() => {
    if (queryParamSlot && queryParamSlot !== 'Any Time (All Slots)') {
      if (queryParamSlot.includes('Morning')) return '10:00 AM';
      if (queryParamSlot.includes('Afternoon')) return '11:30 AM';
      if (queryParamSlot.includes('Evening')) return '05:00 PM';
      if (queryParamSlot.includes('Night')) return '06:00 PM';
    }
    return null;
  });
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [tokenQueueNum, setTokenQueueNum] = useState<number>(14);
  const [isApptCalOpen, setIsApptCalOpen] = useState<boolean>(false);
  const [apptCalMonth, setApptCalMonth] = useState<Date>(() => new Date());

  // ── Dedicated Salon & Spa / Wellness Appointment Flow States ──
  const [wellnessServiceMode, setWellnessServiceMode] = useState<'IN_SALON' | 'HOME_VISIT'>('IN_SALON');
  const [wellnessHomeAddress, setWellnessHomeAddress] = useState<string>('');
  const [wellnessHomeLandmark, setWellnessHomeLandmark] = useState<string>('');
  const [wellnessHomePhone, setWellnessHomePhone] = useState<string>('');
  const [selectedWellnessStylist, setSelectedWellnessStylist] = useState<string>('Any Available Professional (Fastest Slot)');
  const [isCustomStylistExpanded, setIsCustomStylistExpanded] = useState<boolean>(false);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(['trt-haircut-men']);
  const [wellnessGenderFilter, setWellnessGenderFilter] = useState<'ALL' | 'MEN' | 'WOMEN'>('ALL');
  const [wellnessActiveTab, setWellnessActiveTab] = useState<'ALL' | 'HAIR' | 'BEARD' | 'SKIN_FACIAL' | 'SPA_MASSAGE' | 'BRIDAL'>('ALL');
  const [wellnessSlotSession, setWellnessSlotSession] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');
  const [wellnessAddressError, setWellnessAddressError] = useState<boolean>(false);
  const [isWellnessSlotModalOpen, setIsWellnessSlotModalOpen] = useState<boolean>(false);
  const [isWellnessCalOpen, setIsWellnessCalOpen] = useState<boolean>(false);
  const [wellnessCalMonth, setWellnessCalMonth] = useState<Date>(() => new Date());

  // ── Dedicated Gym / Yoga / Fitness Slot Flow States ──
  const [gymBookingType, setGymBookingType] = useState<'MEMBERSHIP' | 'DAY_PASS'>('MEMBERSHIP');
  const [selectedGymPlanId, setSelectedGymPlanId] = useState<string>('gym-plan-3m');
  const [selectedGymPTId, setSelectedGymPTId] = useState<string>('pt-none');
  const [selectedGymTrainerId, setSelectedGymTrainerId] = useState<string>('trn-vikram');
  const [selectedGymShift, setSelectedGymShift] = useState<'ANY' | 'MORNING' | 'EVENING'>('ANY');
  const [fitnessDigitalLockerAddon, setFitnessDigitalLockerAddon] = useState<boolean>(true);
  const [fitnessProteinShakeAddon, setFitnessProteinShakeAddon] = useState<boolean>(false);
  const [selectedFitnessPassId, setSelectedFitnessPassId] = useState<string>('pass-open-gym');
  const [fitnessFormatFilter, setFitnessFormatFilter] = useState<'ALL' | 'MEMBERSHIP' | 'OPEN_GYM' | 'YOGA_CLASS' | 'PERSONAL_TRAINING'>('ALL');
  const [selectedFitnessTimeSlot, setSelectedFitnessTimeSlot] = useState<string>('06:00 AM');
  const [isFitnessCalOpen, setIsFitnessCalOpen] = useState<boolean>(false);
  const [fitnessCalMonth, setFitnessCalMonth] = useState<Date>(() => new Date());

  // ── Dedicated Dining / Table Reservation Flow States ──
  const [selectedTableId, setSelectedTableId] = useState<string>('tbl-2-cozy');
  const [diningGuestCount, setDiningGuestCount] = useState<number>(() => Number(searchParams?.get('guests')) || 2);
  const [diningSession, setDiningSession] = useState<'LUNCH' | 'DINNER' | 'ALL'>('ALL');
  const [diningZoneTab, setDiningZoneTab] = useState<'ALL' | 'AC_INDOOR' | 'ROOFTOP' | 'GARDEN_PATIO' | 'PRIVATE_DINING'>('ALL');
  const [selectedDiningTime, setSelectedDiningTime] = useState<string>('07:30 PM');
  const [diningSpecialRequest, setDiningSpecialRequest] = useState<string>('');
  const [selectedDiningDealId, setSelectedDiningDealId] = useState<string>('');
  const [selectedPreOrderItems, setSelectedPreOrderItems] = useState<{ id: string; qty: number }[]>([]);
  const [isDiningCalOpen, setIsDiningCalOpen] = useState<boolean>(false);
  const [diningCalMonth, setDiningCalMonth] = useState<Date>(() => new Date());

  // ── Archetype 4: AssetRental (Bikes, Cars, Equipment) Flow States ──
  const [rentalStartDate, setRentalStartDate] = useState(() => queryParamDate || todayStr);
  const [rentalEndDate, setRentalEndDate] = useState(tomorrowStr);
  const [rentalDays, setRentalDays] = useState<number>(2);
  const [uploadedDlName, setUploadedDlName] = useState<string>('');
  const [helmetOrGearAddon, setHelmetOrGearAddon] = useState<boolean>(true);

  // ── Archetype 5: PassEntry (Movies, Events, Concerts, Darshan) Flow States ──
  const [passCount, setPassCount] = useState<number>(2);
  const [selectedTier, setSelectedTier] = useState<string>('Standard VIP');
  const [popcornComboAddon, setPopcornComboAddon] = useState<boolean>(false);
  const [selectedShowDate, setSelectedShowDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedShowTime, setSelectedShowTime] = useState<string>('06:45 PM');
  const [selectedScreenFormat, setSelectedScreenFormat] = useState<string>('IMAX Laser 3D');
  const [selectedSeatZone, setSelectedSeatZone] = useState<string>('👑 Royal Recliner (Lounge)');
  const [snackNachosAddon, setSnackNachosAddon] = useState<boolean>(false);
  const [snackBeverageAddon, setSnackBeverageAddon] = useState<boolean>(false);
  // Interactive Cinema Visual Seat Selection
  const [selectedCinemaSeats, setSelectedCinemaSeats] = useState<string[]>(['C7', 'C8']);
  // BookMyShow Multi-Step Stepper States: 'SHOWTIMES' | 'SEAT_COUNT' | 'SEAT_LAYOUT' | 'FNB_DRAWER'
  const [cinemaStep, setCinemaStep] = useState<'SHOWTIMES' | 'SEAT_COUNT' | 'SEAT_LAYOUT' | 'FNB_DRAWER'>('SHOWTIMES');
  const [selectedAudiScreen, setSelectedAudiScreen] = useState<string>('Audi 1 (IMAX)');
  // Real-time 8-Minute Seat Lock Timer (BMS Industry Standard)
  const [seatLockSecondsRemaining, setSeatLockSecondsRemaining] = useState<number>(480);
  const [isSeatLockActive, setIsSeatLockActive] = useState<boolean>(false);
  const [seatLockExpired, setSeatLockExpired] = useState<boolean>(false);
  // Realtime Cross-Tab / Cross-User Locked Seats from other shoppers
  const [remoteLockedSeats, setRemoteLockedSeats] = useState<string[]>([]);
  const [clientId] = useState<string>(() => `client-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);

  // Broadcast & Sync Held Seats across browser tabs / users
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lockKey = `bokspot_seat_locks_${merchantId}_${selectedShowDate}_${selectedShowTime}`;

    const syncLockedSeats = () => {
      try {
        const raw = localStorage.getItem(lockKey);
        if (raw) {
          const locks = JSON.parse(raw);
          const now = Date.now();
          const otherClientSeats: string[] = [];
          Object.entries(locks).forEach(([cId, data]: [string, any]) => {
            if (cId !== clientId && data.expiresAt > now && Array.isArray(data.seats)) {
              otherClientSeats.push(...data.seats);
            }
          });
          setRemoteLockedSeats(Array.from(new Set(otherClientSeats)));
        } else {
          setRemoteLockedSeats([]);
        }
      } catch { }
    };

    // Initial sync and event listeners
    syncLockedSeats();
    window.addEventListener('storage', syncLockedSeats);
    const interval = setInterval(syncLockedSeats, 2500);

    return () => {
      window.removeEventListener('storage', syncLockedSeats);
      clearInterval(interval);
    };
  }, [merchantId, selectedShowDate, selectedShowTime, clientId]);

  // Update this client's held seats in shared storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lockKey = `bokspot_seat_locks_${merchantId}_${selectedShowDate}_${selectedShowTime}`;
    try {
      const raw = localStorage.getItem(lockKey);
      const locks = raw ? JSON.parse(raw) : {};
      if (isSeatLockActive && selectedCinemaSeats.length > 0 && !seatLockExpired) {
        locks[clientId] = {
          seats: selectedCinemaSeats,
          audi: selectedAudiScreen,
          expiresAt: Date.now() + (seatLockSecondsRemaining * 1000)
        };
      } else {
        delete locks[clientId];
      }
      localStorage.setItem(lockKey, JSON.stringify(locks));
    } catch { }
  }, [selectedCinemaSeats, isSeatLockActive, seatLockExpired, seatLockSecondsRemaining, merchantId, selectedShowDate, selectedShowTime, selectedAudiScreen, clientId]);

  // Seat Lock Timer countdown effect when user proceeds to seat layout or F&B
  useEffect(() => {
    let timer: any = null;
    if (isSeatLockActive && seatLockSecondsRemaining > 0) {
      timer = setInterval(() => {
        setSeatLockSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSeatLockExpired(true);
            setIsSeatLockActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSeatLockActive, seatLockSecondsRemaining]);

  // ── Archetype 6: HomeCall (Electrician, Plumber, Cleaning, AC Repair) Flow States ──
  const [homeIssueCategory, setHomeIssueCategory] = useState<string>('Inspection & Diagnosis');
  const [homeAddressLine, setHomeAddressLine] = useState<string>(() => searchParams?.get('venue') || searchParams?.get('city') || '');
  const [preferredHomeWindow, setPreferredHomeWindow] = useState<string>(() => {
    if (queryParamSlot && queryParamSlot !== 'Any Time (All Slots)') {
      if (queryParamSlot.includes('Morning')) return 'Morning (09:00 AM - 12:00 PM)';
      if (queryParamSlot.includes('Afternoon')) return 'Afternoon (01:00 PM - 04:00 PM)';
      if (queryParamSlot.includes('Evening') || queryParamSlot.includes('Night')) return 'Evening (04:30 PM - 07:30 PM)';
    }
    return 'Morning (10:00 AM - 01:00 PM)';
  });

  const [isSaved, setIsSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isEditSearchOpen, setIsEditSearchOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [activeSubNavTab, setActiveSubNavTab] = useState<'overview' | 'facilities' | 'location' | 'policies' | 'mini-space'>('overview');
  // Mini Space (Luggage & Cloakroom Drop) booking state
  const [miniSpaceStorageMode, setMiniSpaceStorageMode] = useState<'bags' | 'dimensions'>('bags');
  // Multi-item counter quantities for mixed luggage (personal/handbag, backpack, trolley/standard, carton box, bulky gear)
  const [miniSpaceItemCounts, setMiniSpaceItemCounts] = useState<{
    handbag: number;
    backpack: number;
    standard: number;
    box: number;
    bulky: number;
  }>({
    handbag: 0,
    backpack: 0,
    standard: 0,
    box: 0,
    bulky: 0,
  });
  const [miniSpaceHours, setMiniSpaceHours] = useState<number>(3);
  const [miniSpaceEstimatedWeight, setMiniSpaceEstimatedWeight] = useState<string>('10-15 kg');
  const [miniSpaceApproxSqft, setMiniSpaceApproxSqft] = useState<number>(4);
  const [miniSpaceDropDate, setMiniSpaceDropDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isMiniSpaceCalOpen, setIsMiniSpaceCalOpen] = useState<boolean>(false);
  const [miniSpaceCalMonth, setMiniSpaceCalMonth] = useState<Date>(() => new Date());
  const [miniSpaceDropHour, setMiniSpaceDropHour] = useState<string>('11');
  const [miniSpaceDropMinute, setMiniSpaceDropMinute] = useState<string>('00');
  const [miniSpaceDropPeriod, setMiniSpaceDropPeriod] = useState<'AM' | 'PM'>('AM');
  const [miniSpaceBagDesc, setMiniSpaceBagDesc] = useState<string>('Trolley Bag / Suitcase');
  const [hotelLuggageMaxCapacity, setHotelLuggageMaxCapacity] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hotel_luggage_capacity_${merchantId}`) ||
          localStorage.getItem('hotel_luggage_capacity_default');
        if (stored) return Number(stored);
        const busState = localStorage.getItem('vendor-portal-storage-v10');
        if (busState) {
          const parsed = JSON.parse(busState);
          if (parsed.state?.currentMerchant?.metadata?.luggageMaxCapacity) {
            return Number(parsed.state.currentMerchant.metadata.luggageMaxCapacity);
          }
        }
      } catch { }
    }
    return 10;
  });
  const [hotelLuggageHourlyRate, setHotelLuggageHourlyRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hotel_luggage_rate_trolley_${merchantId}`) ||
          localStorage.getItem(`hotel_luggage_rate_${merchantId}`) ||
          localStorage.getItem('hotel_luggage_rate_default');
        if (stored) return Number(stored);
        const busState = localStorage.getItem('vendor-portal-storage-v10');
        if (busState) {
          const parsed = JSON.parse(busState);
          if (parsed.state?.currentMerchant?.metadata?.rateTrolley) {
            return Number(parsed.state.currentMerchant.metadata.rateTrolley);
          }
          if (parsed.state?.currentMerchant?.luggageHourlyRate) {
            return Number(parsed.state.currentMerchant.luggageHourlyRate);
          }
        }
      } catch { }
    }
    return 49;
  });

  const [hotelLuggageDayPassRate, setHotelLuggageDayPassRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hotel_luggage_daypass_${merchantId}`) ||
          localStorage.getItem('hotel_luggage_daypass_default');
        if (stored) return Number(stored);
        const busState = localStorage.getItem('vendor-portal-storage-v10');
        if (busState) {
          const parsed = JSON.parse(busState);
          if (parsed.state?.currentMerchant?.metadata?.luggageDayPassRate) {
            return Number(parsed.state.currentMerchant.metadata.luggageDayPassRate);
          }
        }
      } catch { }
    }
    return 199;
  });

  // Dedicated rates configured by Business Owner
  const getCategoryRate = (catId: 'handbag' | 'backpack' | 'standard' | 'box' | 'bulky', fallbackMultiplier: number) => {
    if (typeof window !== 'undefined') {
      try {
        const keyMap: Record<string, string> = {
          handbag: 'handbag',
          backpack: 'backpack',
          standard: 'trolley',
          box: 'box',
          bulky: 'bulky',
        };
        const catKey = keyMap[catId] || catId;
        const stored = localStorage.getItem(`hotel_luggage_rate_${catKey}_${merchantId}`) ||
          localStorage.getItem(`hotel_luggage_rate_${catKey}_default`);
        if (stored) return Number(stored);

        const busState = localStorage.getItem('vendor-portal-storage-v10');
        if (busState) {
          const parsed = JSON.parse(busState);
          const meta = parsed.state?.currentMerchant?.metadata;
          const camelKey = `rate${catKey.charAt(0).toUpperCase() + catKey.slice(1)}`;
          if (meta && meta[camelKey]) return Number(meta[camelKey]);
        }
      } catch { }
    }
    return Math.round(hotelLuggageHourlyRate * fallbackMultiplier);
  };
  const checkLuggageEnabled = (mDataObj?: any) => {
    // 1. Check direct backend merchant metadata first if explicitly boolean
    if (mDataObj?.metadata?.isLuggageStorageEnabled !== undefined) {
      return Boolean(mDataObj.metadata.isLuggageStorageEnabled);
    }
    if (typeof window !== 'undefined') {
      try {
        // 2. Check vendor portal storage state across local browser sessions
        const busState = localStorage.getItem('vendor-portal-storage-v10');
        if (busState) {
          const parsed = JSON.parse(busState);
          const curM = parsed.state?.currentMerchant;
          const customM = parsed.state?.customMerchants?.[merchantId];
          const target = (curM?.id === merchantId || curM?.merchantName === merchantId) ? curM : (customM || curM);
          if (target?.metadata?.isLuggageStorageEnabled !== undefined) {
            return Boolean(target.metadata.isLuggageStorageEnabled);
          }
        }
        // 3. Check specific multi-key localStorage flags
        const keys = [
          `hotel_luggage_enabled_${merchantId}`,
          'hotel_luggage_enabled_H101',
          'hotel_luggage_enabled_default'
        ];
        for (const k of keys) {
          const val = localStorage.getItem(k);
          if (val !== null) return val === 'true';
        }
      } catch { }
    }
    // If merchant explicitly provided metadata, respect it
    if (mDataObj?.metadata && 'isLuggageStorageEnabled' in mDataObj.metadata) {
      return Boolean(mDataObj.metadata.isLuggageStorageEnabled);
    }
    // Default to true so newly enabled cloakroom always shows unless explicitly turned off
    return true;
  };

  const [isHotelLuggageEnabled, setIsHotelLuggageEnabled] = useState<boolean>(() => checkLuggageEnabled());

  // Cross-tab, API polling and immediate custom event listener for instant toggle synchronization
  useEffect(() => {
    const handleSync = (e?: any) => {
      if (e?.detail?.enabled !== undefined) {
        setIsHotelLuggageEnabled(Boolean(e.detail.enabled));
      } else {
        setIsHotelLuggageEnabled(checkLuggageEnabled());
      }
      try {
        const storedRate = localStorage.getItem(`hotel_luggage_rate_${merchantId}`) ||
          localStorage.getItem('hotel_luggage_rate_default');
        if (storedRate) setHotelLuggageHourlyRate(Number(storedRate));
        const storedCap = localStorage.getItem(`hotel_luggage_capacity_${merchantId}`) ||
          localStorage.getItem('hotel_luggage_capacity_default');
        if (storedCap) setHotelLuggageMaxCapacity(Number(storedCap));
      } catch { }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('hotel_luggage_toggle', handleSync);
    window.addEventListener('pg_config_updated', handleSync);
    window.addEventListener('venue_gallery_updated', handleSync);

    // Steady status check - only update if backend returned a merchant and explicitly has isLuggageStorageEnabled
    const interval = setInterval(async () => {
      try {
        const m = await api.merchants.get(merchantId, true).catch(() => null);
        const parsed = (m as any)?.data || m;
        if (parsed) {
          setMerchantData((prev: any) => {
            if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
            return { ...(prev || {}), ...parsed };
          });
          if (parsed.metadata?.isLuggageStorageEnabled !== undefined) {
            const newLuggageStatus = Boolean(parsed.metadata.isLuggageStorageEnabled);
            setIsHotelLuggageEnabled((prev: boolean) => (prev !== newLuggageStatus ? newLuggageStatus : prev));
          }
          if (parsed?.metadata?.luggageHourlyRate || parsed?.luggageHourlyRate) {
            const newRate = Number(parsed.metadata?.luggageHourlyRate || parsed.luggageHourlyRate);
            setHotelLuggageHourlyRate((prev: number) => (prev !== newRate ? newRate : prev));
          }
          if (parsed?.metadata?.luggageMaxCapacity) {
            const newCap = Number(parsed.metadata.luggageMaxCapacity);
            setHotelLuggageMaxCapacity((prev: number) => (prev !== newCap ? newCap : prev));
          }
        }
      } catch { }
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('hotel_luggage_toggle', handleSync);
      window.removeEventListener('pg_config_updated', handleSync);
      window.removeEventListener('venue_gallery_updated', handleSync);
    };
  }, [merchantId]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel instant fetch for venue profile + services catalog
        const [mDataRes, res] = await Promise.all([
          merchantId !== '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e'
            ? api.merchants.get(merchantId).catch(() => null)
            : Promise.resolve(null),
          api.services.list({})
        ]);
        const mData = mDataRes;

        if (active && res && res.data) {
          const merchantServices = res.data.filter((s: any) => {
            const isMatchMerchant = (s.merchantId === merchantId) || (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId));

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
              const sCat = (s.category || '').toLowerCase();
              const catSlug = (s.categoryObj?.slug || '').toLowerCase();
              const sName = (s.name || '').toLowerCase();
              const expCat = (expectedCategoryName || '').toLowerCase();
              const urlCat = (category || '').toLowerCase().replace(/-/g, ' ');

              // Strict Category Isolation: prevent cross-category contamination
              const isCrossCategory = (urlCat.includes('tennis') && !sCat.includes('tennis') && !catSlug.includes('tennis')) ||
                (urlCat.includes('basketball') && !sCat.includes('basketball') && !catSlug.includes('basketball')) ||
                (urlCat.includes('swimming') && !sCat.includes('swimming') && !catSlug.includes('swimming')) ||
                (urlCat.includes('badminton') && !sCat.includes('badminton') && !catSlug.includes('badminton')) ||
                (urlCat.includes('play-arena') && !sCat.includes('play') && !catSlug.includes('play')) ||
                ((urlCat.includes('turf') || urlCat.includes('football')) && (sCat.includes('resort') || sCat.includes('hotel') || sCat.includes('room') || sCat.includes('villa')));

              if (isCrossCategory) return false;

              isMatchType = sCat === expCat ||
                catSlug === category.toLowerCase() ||
                sCat.includes(urlCat) ||
                sName.includes(urlCat) ||
                (urlCat.includes('turf') && (sCat.includes('turf') || sName.includes('turf')));
            }
            return isMatchMerchant && isMatchType;
          });

          // Match strictly from live backend services
          let finalServices = merchantServices;
          if (finalServices.length === 0) {
            const fallbackCategoryMatch = res.data.filter((s: any) => {
              const isMatchMerchant = (s.merchantId === merchantId) || (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId));
              const catName = (s.category || '').toLowerCase();
              const svcName = (s.name || '').toLowerCase();
              const catSlug = (s.categoryObj?.slug || '').toLowerCase();
              return isMatchMerchant && (catName.includes(category.toLowerCase()) || svcName.includes(category.toLowerCase()) || catSlug.includes(category.toLowerCase()));
            });

            if (fallbackCategoryMatch.length > 0) {
              finalServices = fallbackCategoryMatch;
            }
          }

          // Dynamic Generic Sports Archetype Fallback (Categories 22-28)
          const sportCfg = getSportCategoryConfig(category);
          if (finalServices.length === 0 && sportCfg) {
            const targetCity = city || 'Chennai';

            // Check if vendor locally updated this in Business Portal
            let customListings = sportCfg.units.map(u => ({
              id: u.id,
              name: u.name,
              price: u.price,
              description: u.description,
              images: [u.imageUrl, ...sportCfg.galleryImages],
              metadata: {
                surface: u.surface,
                badge: u.badge,
                addons: sportCfg.addons,
                mandatoryRule: sportCfg.mandatoryRule,
                equipmentAddons: sportCfg.includedGear,
                refereeOrManager: sportCfg.supervisorTitle
              }
            }));

            if (typeof window !== 'undefined') {
              try {
                const busStorageRaw = localStorage.getItem('vendor-portal-storage-v10');
                if (busStorageRaw) {
                  const busData = JSON.parse(busStorageRaw);
                  const storedServices = busData.state?.services || [];
                  const activeBranchId = busData.state?.currentMerchant?.activeBranchId;
                  const matchedService = storedServices.find((s: any) => {
                    const matchCat = s.category === sportCfg.categoryName ||
                      s.name?.includes(sportCfg.categoryName) ||
                      s.metadata?.originalCategory === sportCfg.categoryName ||
                      (category.includes('turf') && (s.category?.toLowerCase().includes('turf') || s.name?.toLowerCase().includes('turf')));
                    const matchBranch = activeBranchId ? (!s.branchId || s.branchId === activeBranchId) : true;
                    return matchCat && matchBranch;
                  });
                  if (matchedService && Array.isArray(matchedService.listings) && matchedService.listings.length > 0) {
                    customListings = matchedService.listings.map((l: any) => ({
                      id: l.id,
                      name: l.name,
                      price: Number(l.price || l.basePrice || sportCfg.defaultPrice),
                      originalPrice: l.originalPrice ? Number(l.originalPrice) : undefined,
                      discountPercentage: l.discountPercentage ? Number(l.discountPercentage) : undefined,
                      offerBadge: l.offerBadge || l.metadata?.offerBadge || undefined,
                      bannerTagline: l.bannerTagline || l.metadata?.bannerTagline || undefined,
                      description: l.description || '',
                      schedule: l.schedule || l.metadata?.schedule || undefined,
                      images: (l.images && l.images.length > 0) ? l.images : (l.imageUrl ? [l.imageUrl] : sportCfg.galleryImages),
                      metadata: {
                        surface: l.metadata?.surface || l.surface || 'Standard Court Surface',
                        badge: l.metadata?.badge || l.offerBadge || 'Verified Unit',
                        offerBadge: l.offerBadge || l.metadata?.offerBadge || undefined,
                        bannerTagline: l.bannerTagline || l.metadata?.bannerTagline || undefined,
                        originalPrice: l.originalPrice ? Number(l.originalPrice) : undefined,
                        discountPercentage: l.discountPercentage ? Number(l.discountPercentage) : undefined,
                        schedule: l.schedule || l.metadata?.schedule || undefined,
                        addons: l.metadata?.addons || sportCfg.addons,
                        mandatoryRule: l.metadata?.mandatoryRule || sportCfg.mandatoryRule,
                        equipmentAddons: l.metadata?.equipmentAddons || sportCfg.includedGear,
                        refereeOrManager: l.metadata?.refereeOrManager || sportCfg.supervisorTitle
                      }
                    }));
                  }
                }
              } catch (e) { }
            }

            // Retrieve custom branch info if configured by vendor
            let activeBranchName = sportCfg.merchantName;
            let activeBranchAddress = `BokSpot Sports Hub Arena, Stadium Road, ${targetCity}`;
            if (typeof window !== 'undefined') {
              try {
                const busStorageRaw = localStorage.getItem('vendor-portal-storage-v10');
                if (busStorageRaw) {
                  const busData = JSON.parse(busStorageRaw);
                  const curM = busData.state?.currentMerchant;
                  // Match by username OR if current merchant has a branch matching sports facility
                  if (curM && (curM.username === sportCfg.username || curM.id === merchantId)) {
                    if (Array.isArray(curM.branches) && curM.branches.length > 0) {
                      const matchedBranch = curM.branches.find((b: any) =>
                        (curM.activeBranchId && b.id === curM.activeBranchId && (b.category?.toLowerCase().includes('turf') || b.businessType?.toLowerCase().includes('sports'))) ||
                        b.category === sportCfg.categoryName ||
                        b.name?.toLowerCase().includes('arena') ||
                        b.name?.toLowerCase().includes('turf')
                      ) || curM.branches.find((b: any) => b.id === curM.activeBranchId) || curM.branches[0];

                      if (matchedBranch) {
                        activeBranchName = matchedBranch.name || curM.merchantName;
                        activeBranchAddress = matchedBranch.address || activeBranchAddress;
                      }
                    } else if (curM.merchantName) {
                      activeBranchName = curM.merchantName;
                      activeBranchAddress = curM.address || activeBranchAddress;
                    }
                  }
                }
              } catch (e) { }
            }

            finalServices = [
              {
                id: `svc-${sportCfg.slug}-${sportCfg.username.toLowerCase()}`,
                name: `${activeBranchName} — ${sportCfg.categoryName}`,
                category: sportCfg.categoryName,
                rating: 4.9,
                reviewCount: 384,
                basePrice: String(customListings[0]?.price || sportCfg.defaultPrice),
                price: Number(customListings[0]?.price || sportCfg.defaultPrice),
                description: `Premier ${sportCfg.categoryName} arena located in ${targetCity}. Equipped with international standard surfaces, professional lighting, and player amenities.`,
                merchantId: sportCfg.merchantId,
                merchant: activeBranchName,
                branchName: activeBranchName,
                address: activeBranchAddress,
                merchantObj: {
                  id: sportCfg.merchantId,
                  name: activeBranchName,
                  city: targetCity,
                  address: activeBranchAddress,
                  rating: 4.9,
                  username: sportCfg.username,
                  metadata: {
                    isFacility: true,
                    units: customListings,
                    addons: sportCfg.addons,
                    mandatoryRule: sportCfg.mandatoryRule,
                    amenities: sportCfg.amenities,
                    includedGear: sportCfg.includedGear,
                    supervisorTitle: sportCfg.supervisorTitle
                  }
                },
                metadata: {
                  isFacility: true,
                  facilityName: activeBranchName,
                  merchantName: activeBranchName,
                  branchName: activeBranchName,
                  address: activeBranchAddress,
                  amenities: sportCfg.amenities,
                  mandatoryRule: sportCfg.mandatoryRule,
                  supervisorTitle: sportCfg.supervisorTitle,
                  includedGear: sportCfg.includedGear,
                  listings: customListings
                }
              }
            ];
          }

          // Entertainment & Live Events Master Fallback
          const entCfg = getEntertainmentCategoryConfig(category);
          if (entCfg && finalServices.length === 0) {
            const targetCity = city || 'Chennai';
            let activeBranchName = entCfg.merchantName;
            let activeBranchAddress = `${entCfg.categoryName} Complex, Entertainment Zone, ${targetCity}`;

            // Check if vendor portal has custom branches or live configurations
            let customListings: any[] = [];
            if (typeof window !== 'undefined') {
              try {
                const busStorageRaw = localStorage.getItem('vendor-portal-storage-v10');
                if (busStorageRaw) {
                  const busData = JSON.parse(busStorageRaw);
                  const curM = busData.state?.currentMerchant;
                  const storedServices = busData.state?.services || [];
                  const activeBranchId = curM?.activeBranchId;

                  if (curM && (curM.username === entCfg.username || curM.id === merchantId)) {
                    if (Array.isArray(curM.branches) && curM.branches.length > 0) {
                      const matchedBranch = curM.branches.find((b: any) => b.id === curM.activeBranchId) || curM.branches[0];
                      if (matchedBranch) {
                        activeBranchName = matchedBranch.name || curM.merchantName;
                        activeBranchAddress = matchedBranch.address || activeBranchAddress;
                      }
                    } else if (curM.merchantName) {
                      activeBranchName = curM.merchantName;
                      activeBranchAddress = curM.address || activeBranchAddress;
                    }
                  }

                  // Live link to configured services/listings created in business portal
                  const matchedService = storedServices.find((s: any) => {
                    const matchCat = s.category === entCfg.categoryName || s.metadata?.originalCategory === entCfg.categoryName;
                    const matchBranch = activeBranchId ? (!s.branchId || s.branchId === activeBranchId) : true;
                    return matchCat && matchBranch;
                  });

                  if (matchedService && Array.isArray(matchedService.listings) && matchedService.listings.length > 0) {
                    customListings = matchedService.listings.map((l: any) => ({
                      id: l.id,
                      name: l.name,
                      price: Number(l.price || l.basePrice || entCfg.defaultPrice),
                      badge: l.metadata?.badge || l.offerBadge || 'Verified Tier',
                      icon: l.metadata?.icon || '🎟️',
                      desc: l.description || l.desc || ''
                    }));
                  }
                }
              } catch (e) { }
            }

            const effectiveSeatTiers = customListings.length > 0 ? customListings : entCfg.seatTiers;

            finalServices = [
              {
                id: `svc-${entCfg.slug}-${entCfg.username.toLowerCase()}`,
                name: `${activeBranchName} — ${entCfg.categoryName}`,
                category: entCfg.categoryName,
                rating: 4.8,
                reviewCount: 420,
                basePrice: String(effectiveSeatTiers[0]?.price || entCfg.defaultPrice),
                price: Number(effectiveSeatTiers[0]?.price || entCfg.defaultPrice),
                description: `Experience premier ${entCfg.categoryName} in ${targetCity}. Featuring cutting-edge audiovisual systems, plush seating, and verified digital admission.`,
                merchantId: entCfg.merchantId,
                merchant: activeBranchName,
                branchName: activeBranchName,
                address: activeBranchAddress,
                merchantObj: {
                  id: entCfg.merchantId,
                  name: activeBranchName,
                  city: targetCity,
                  address: activeBranchAddress,
                  rating: 4.8,
                  username: entCfg.username,
                  metadata: {
                    isEntertainment: true,
                    formats: entCfg.formats,
                    languages: entCfg.languages,
                    showtimes: entCfg.showtimes,
                    seatTiers: effectiveSeatTiers,
                    snackAddons: entCfg.snackAddons,
                    amenities: entCfg.amenities,
                    venueRules: entCfg.venueRules
                  }
                },
                metadata: {
                  isEntertainment: true,
                  facilityName: activeBranchName,
                  merchantName: activeBranchName,
                  branchName: activeBranchName,
                  address: activeBranchAddress,
                  amenities: entCfg.amenities,
                  venueRules: entCfg.venueRules,
                  formats: entCfg.formats,
                  languages: entCfg.languages,
                  showtimes: entCfg.showtimes,
                  seatTiers: effectiveSeatTiers,
                  snackAddons: entCfg.snackAddons
                }
              }
            ];
          }

          // ── Lifestyle & Local Dynamic Fallbacks ──
          const cleanCat = (category || '').toLowerCase();
          const cleanMerchantId = (merchantId || '').toLowerCase();

          if (finalServices.length === 0 && (cleanCat.includes('dining') || cleanCat.includes('restaurant') || cleanMerchantId.includes('r404') || cleanMerchantId.includes('grand-temple'))) {
            const diningCfg = getDiningConfig('grand-temple-dine');
            const targetCity = city || diningCfg.city || 'Chennai';
            finalServices = [
              {
                id: `svc-dining-${merchantId}`,
                name: diningCfg.name,
                category: 'Restaurant Table Reservation',
                rating: diningCfg.rating,
                reviewCount: 840,
                basePrice: String(diningCfg.costForTwo),
                price: diningCfg.costForTwo,
                image: diningCfg.heroImage,
                merchantId: merchantId,
                merchant: diningCfg.name,
                branchName: diningCfg.name,
                address: diningCfg.address,
                merchantObj: {
                  id: merchantId,
                  name: diningCfg.name,
                  city: targetCity,
                  address: diningCfg.address,
                  rating: diningCfg.rating,
                  username: 'R404',
                  metadata: {
                    isDining: true,
                    cuisines: diningCfg.cuisines,
                    costForTwo: diningCfg.costForTwo,
                    tableTypes: diningCfg.tableTypes,
                    timeSlots: diningCfg.timeSlots,
                    popularMenu: diningCfg.popularMenu,
                    bookingDeals: diningCfg.bookingDeals
                  }
                },
                metadata: {
                  isDining: true,
                  cuisines: diningCfg.cuisines,
                  costForTwo: diningCfg.costForTwo,
                  tableTypes: diningCfg.tableTypes,
                  timeSlots: diningCfg.timeSlots,
                  popularMenu: diningCfg.popularMenu,
                  bookingDeals: diningCfg.bookingDeals
                }
              }
            ];
          } else if (finalServices.length === 0 && (cleanCat.includes('salon') || cleanCat.includes('spa') || cleanCat.includes('wellness') || cleanCat.includes('studio') || cleanMerchantId.includes('s303') || cleanMerchantId.includes('style-studio'))) {
            const wellCfg = getWellnessConfig(cleanMerchantId);
            const targetCity = city || wellCfg.city || 'Chennai';
            finalServices = [
              {
                id: `svc-wellness-${merchantId}`,
                name: `${wellCfg.name} — Appointments`,
                category: wellCfg.category,
                rating: wellCfg.rating,
                reviewCount: 620,
                basePrice: String(wellCfg.treatments[0]?.price || 499),
                price: wellCfg.treatments[0]?.price || 499,
                image: wellCfg.heroImage,
                merchantId: merchantId,
                merchant: wellCfg.name,
                branchName: wellCfg.name,
                address: wellCfg.address,
                merchantObj: {
                  id: merchantId,
                  name: wellCfg.name,
                  city: targetCity,
                  address: wellCfg.address,
                  rating: wellCfg.rating,
                  username: 'S303',
                  metadata: {
                    isWellness: true,
                    treatments: wellCfg.treatments,
                    specialists: wellCfg.specialists
                  }
                },
                metadata: {
                  isWellness: true,
                  treatments: wellCfg.treatments,
                  specialists: wellCfg.specialists
                }
              }
            ];
          } else if (finalServices.length === 0 && (cleanCat.includes('gym') || cleanCat.includes('yoga') || cleanMerchantId.includes('f202') || cleanMerchantId.includes('zenfit'))) {
            const fitCfg = getFitnessConfig('zenfit-clinic');
            const targetCity = city || fitCfg.city || 'Chennai';
            const isYogaCat = isYoga || cleanCat.includes('yoga') || cleanCat.includes('meditation');
            const venueDisplayName = isYogaCat ? 'Ananda Yoga Shala & Meditation Studio' : fitCfg.name;
            const venueDisplayCat = isYogaCat ? 'Yoga Shala & Meditation Batches' : fitCfg.category;
            const categoryPasses = isYogaCat
              ? fitCfg.passes.filter((p: any) => p.formatType === 'YOGA_CLASS')
              : fitCfg.passes.filter((p: any) => p.formatType !== 'YOGA_CLASS');
            const passList = categoryPasses.length > 0 ? categoryPasses : fitCfg.passes;

            finalServices = [
              {
                id: `svc-fitness-${merchantId}`,
                name: venueDisplayName,
                category: venueDisplayCat,
                rating: fitCfg.rating,
                reviewCount: 450,
                basePrice: String(passList[0]?.price || 299),
                price: passList[0]?.price || 299,
                image: fitCfg.heroImage,
                merchantId: merchantId,
                merchant: venueDisplayName,
                branchName: venueDisplayName,
                address: fitCfg.address,
                merchantObj: {
                  id: merchantId,
                  name: venueDisplayName,
                  city: targetCity,
                  address: fitCfg.address,
                  rating: fitCfg.rating,
                  username: 'F202',
                  metadata: {
                    isFitness: true,
                    passes: passList,
                    trainers: fitCfg.trainers
                  }
                },
                metadata: {
                  isFitness: true,
                  passes: passList,
                  trainers: fitCfg.trainers
                }
              }
            ];
          } else if (finalServices.length === 0 && (cleanCat.includes('doctor') || cleanCat.includes('clinic') || cleanMerchantId.includes('d101') || cleanMerchantId.includes('apollo'))) {
            const docCfg = getClinicConfig(cleanMerchantId);
            const targetCity = city || docCfg.city || 'Chennai';
            finalServices = [
              {
                id: `svc-doctor-${merchantId}`,
                name: `${docCfg.name} — OPD Consultations`,
                category: docCfg.category,
                rating: docCfg.rating,
                reviewCount: 520,
                basePrice: String(docCfg.doctors[0]?.consultationFee || 600),
                price: docCfg.doctors[0]?.consultationFee || 600,
                image: docCfg.heroImage,
                merchantId: merchantId,
                merchant: docCfg.name,
                branchName: docCfg.name,
                address: docCfg.address,
                merchantObj: {
                  id: merchantId,
                  name: docCfg.name,
                  city: targetCity,
                  address: docCfg.address,
                  rating: docCfg.rating,
                  username: 'D101',
                  metadata: {
                    isDoctor: true,
                    doctors: docCfg.doctors,
                    consultationModes: docCfg.consultationModes,
                    facilities: docCfg.facilities
                  }
                },
                metadata: {
                  isDoctor: true,
                  doctors: docCfg.doctors
                }
              }
            ];
          } else if (finalServices.length === 0 && (cleanCat.includes('electrician') || cleanCat.includes('plumber') || cleanCat.includes('clean') || cleanCat.includes('technician') || cleanMerchantId.includes('e201') || cleanMerchantId.includes('h701'))) {
            const homeCfg = getHomeServiceConfig(cleanCat);
            const matched = homeCfg.services.find(s => cleanCat.includes(s.category)) || homeCfg.services[0];
            const targetCity = city || homeCfg.city || 'Chennai';
            finalServices = [
              {
                id: `svc-home-${merchantId}`,
                name: `${homeCfg.name} — ${matched.name}`,
                category: matched.name,
                rating: homeCfg.rating,
                reviewCount: 890,
                basePrice: String(matched.inspectionFee),
                price: matched.inspectionFee,
                image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
                merchantId: merchantId,
                merchant: homeCfg.name,
                branchName: homeCfg.name,
                address: homeCfg.locality,
                merchantObj: {
                  id: merchantId,
                  name: homeCfg.name,
                  city: targetCity,
                  address: homeCfg.locality,
                  rating: homeCfg.rating,
                  username: 'E201',
                  metadata: {
                    isHomeService: true,
                    serviceItem: matched,
                    arrivalWindows: homeCfg.arrivalWindows,
                    warrantyDays: homeCfg.warrantyDays
                  }
                },
                metadata: {
                  isHomeService: true,
                  serviceItem: matched,
                  arrivalWindows: homeCfg.arrivalWindows,
                  warrantyDays: homeCfg.warrantyDays
                }
              }
            ];
          }

          setLiveServices(finalServices);
          if (mData) {
            const parsedM = (mData as any).data || mData;
            setMerchantData(parsedM);
            if (parsedM?.luggageHourlyRate) setHotelLuggageHourlyRate(Number(parsedM.luggageHourlyRate));
            setIsHotelLuggageEnabled(checkLuggageEnabled(parsedM));
          } else if (finalServices.length > 0) {
            const mObj = finalServices[0].merchantObj || {};
            setMerchantData(mObj);
            if (mObj?.luggageHourlyRate) setHotelLuggageHourlyRate(Number(mObj.luggageHourlyRate));
            setIsHotelLuggageEnabled(checkLuggageEnabled(mObj));
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

  const isLuxury = searchParams?.get('isLuxury') === 'true';

  const rawVenueName = (liveServices.length > 0 && (liveServices[0].metadata?.facilityName || liveServices[0].metadata?.branchName || liveServices[0].metadata?.merchantName || liveServices[0].merchantObj?.name)) ||
    merchantData?.name ||
    merchantData?.merchantName ||
    (liveServices.length > 0 ? (liveServices[0].merchant || 'Venue') : 'Loading...');

  const checkMysteryOptIn = () => {
    // 0. Only genuine stays/accommodations and sports arenas can have mystery mode (never simple appointments, rentals, passes, home calls)
    if (isAppointment || isRental || isPass || isHomeCall) {
      return false;
    }
    // 1. Hostels / PG are never blind mystery mode
    if (isPgStay || category === 'hostels' || category === 'pg-hostels' || (merchantData?.name || '').toLowerCase().includes('hostel')) {
      return false;
    }

    if (typeof window !== 'undefined') {
      const directStore = localStorage.getItem(`hotel_mystery_optin_${merchantId}`);
      if (directStore !== null) return directStore === 'true';
      const uName = merchantData?.username;
      if (uName) {
        const uStore = localStorage.getItem(`hotel_mystery_optin_${uName}`);
        if (uStore !== null) return uStore === 'true';
      }

      // Also check business portal live storage (vendor-portal-storage-v10)
      try {
        const busStoreRaw = localStorage.getItem('vendor-portal-storage-v10');
        if (busStoreRaw) {
          const busData = JSON.parse(busStoreRaw);
          const curM = busData.state?.currentMerchant;
          const isSameMerchant = curM && (
            (curM.id === merchantId) ||
            (uName && curM.username === uName) ||
            ((merchantData?.name || '').toLowerCase() === (curM.merchantName || '').toLowerCase()) ||
            (!merchantId)
          );
          if (isSameMerchant) {
            if (curM.isMysteryModeOptIn !== undefined) return Boolean(curM.isMysteryModeOptIn);
            if (curM.metadata?.isMysteryModeOptIn !== undefined) return Boolean(curM.metadata.isMysteryModeOptIn);
          }
        }
      } catch { }

      const h101Store = localStorage.getItem('hotel_mystery_optin_H101');
      if ((uName === 'H101' || (merchantData?.name || '').toLowerCase().includes('grand hotel')) && h101Store !== null) {
        return h101Store === 'true';
      }
      const defaultStore = localStorage.getItem('hotel_mystery_optin_default');
      if (defaultStore !== null) return defaultStore === 'true';
    }
    if (merchantData?.isMysteryModeOptIn !== undefined) return Boolean(merchantData.isMysteryModeOptIn);
    if (merchantData?.metadata?.isMysteryModeOptIn !== undefined) return Boolean(merchantData.metadata.isMysteryModeOptIn);
    return true;
  };

  const isMysteryOptedIn = checkMysteryOptIn();

  const isLuxeBlindBooking = Boolean(isLuxury && isMysteryOptedIn);

  const venueName = (() => {
    if (isLuxeBlindBooking) {
      const raw = `${rawVenueName} ${JSON.stringify(merchantData || {})} ${JSON.stringify(liveServices[0]?.metadata || {})}`.toLowerCase();
      let archetype = 'Luxury Suite';
      if (raw.includes('turf') || category.includes('turf') || raw.includes('arena') || isFacility) archetype = 'Secret Pro FIFA Arena';
      else if (raw.includes('villa') || category.includes('villa')) archetype = 'Architectural Villa';
      else if (raw.includes('resort') || category.includes('resort')) archetype = 'Beachfront Resort';
      else if (raw.includes('palace') || raw.includes('heritage')) archetype = 'Heritage Palace Suite';
      else if (raw.includes('penthouse')) archetype = 'Skyline Penthouse';
      else if (raw.includes('haven') || raw.includes('retreat')) archetype = 'Private Luxury Retreat';

      let standoutFeature = 'with Private Butler & Dining';
      if (raw.includes('pool') || raw.includes('swimming')) standoutFeature = 'with Private Infinity Pool';
      else if (raw.includes('beach') || raw.includes('sea') || raw.includes('ocean')) standoutFeature = 'with Panoramic Ocean View';
      else if (raw.includes('spa') || raw.includes('jacuzzi')) standoutFeature = 'with Hydrotherapy Jacuzzi';
      else if (raw.includes('garden') || raw.includes('lawn')) standoutFeature = 'with Private Courtyard Garden';

      return `${archetype} ${standoutFeature}`;
    }
    return rawVenueName;
  })();

  const rawAddress = (liveServices.length > 0 && (liveServices[0].metadata?.address || liveServices[0].merchantObj?.address)) ||
    merchantData?.address ||
    `${city || 'Chennai'}`;

  const address = (isLuxury && isHotel && isMysteryOptedIn)
    ? `${city || 'Prime District'} • Full address revealed on booking confirmation`
    : rawAddress;

  if (loading) {
    const isHotel = category === 'resorts' || category === 'hotels' || category === 'villas' || category === 'hostels' || category === 'camping';
    return (
      <BokspotLoader
        message={isHotel ? `Loading ${category === 'resorts' ? 'Resort' : category === 'villas' ? 'Villa' : category === 'hotels' ? 'Hotel' : 'Stay'} details...` : 'Loading Venue details...'}
      />
    );
  }

  if (liveServices.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><p>Venue not found or has no services.</p></div>;
  }

  // Luxury fallback photos only if hotel hasn't uploaded any photos yet
  const defaultHotelPhotos = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40eb0d8e73?w=800&q=80',
    'https://images.unsplash.com/photo-1522771731478-44bc10b49cb3?w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
  ];

  const finalMerchantObj = merchantData || liveServices[0]?.merchantObj || {};

  // Resolve live PG Configs dynamically from localStorage or backend metadata
  const livePgConfig = (() => {
    if (typeof window !== 'undefined') {
      try {
        const keys = [
          `pg_config_${merchantId}`,
          `pg_config_${finalMerchantObj?.username}`,
          'pg_config_default'
        ];
        for (const k of keys) {
          const val = localStorage.getItem(k);
          if (val) return JSON.parse(val);
        }
        const busStore = localStorage.getItem('vendor-portal-storage-v10');
        if (busStore) {
          const parsed = JSON.parse(busStore);
          const curM = parsed.state?.currentMerchant;
          if (curM?.metadata?.pgGenderType) return curM.metadata;
        }
      } catch { }
    }
    return null;
  })();

  const pgGenderType = livePgConfig?.pgGenderType || finalMerchantObj?.metadata?.pgGenderType || 'coliving';
  const pgFoodIncluded = livePgConfig?.pgFoodIncluded !== undefined ? livePgConfig.pgFoodIncluded : (finalMerchantObj?.metadata?.pgFoodIncluded !== false);
  const pgGateCurfew = livePgConfig?.pgGateCurfew || finalMerchantObj?.metadata?.pgGateCurfew || '24/7 Biometric Entry (No Curfew)';

  // Dedicated Women's PG safety and living comfort values
  const hasLadyWarden = livePgConfig?.hasLadyWarden !== undefined ? livePgConfig.hasLadyWarden : (finalMerchantObj?.metadata?.hasLadyWarden !== false);
  const zeroMaleFloorAccess = livePgConfig?.zeroMaleFloorAccess !== undefined ? livePgConfig.zeroMaleFloorAccess : (finalMerchantObj?.metadata?.zeroMaleFloorAccess !== false);
  const hasReceptionVisitorLobby = livePgConfig?.hasReceptionVisitorLobby !== undefined ? livePgConfig.hasReceptionVisitorLobby : (finalMerchantObj?.metadata?.hasReceptionVisitorLobby !== false);
  const hasParentsDaytimeLounge = livePgConfig?.hasParentsDaytimeLounge !== undefined ? livePgConfig.hasParentsDaytimeLounge : (finalMerchantObj?.metadata?.hasParentsDaytimeLounge !== false);
  const hasPeriodEmergencyKit = livePgConfig?.hasPeriodEmergencyKit !== undefined ? livePgConfig.hasPeriodEmergencyKit : (finalMerchantObj?.metadata?.hasPeriodEmergencyKit !== false);
  const hasPrivateDryingZone = livePgConfig?.hasPrivateDryingZone !== undefined ? livePgConfig.hasPrivateDryingZone : (finalMerchantObj?.metadata?.hasPrivateDryingZone !== false);
  const hasVanityMirrorSocket = livePgConfig?.hasVanityMirrorSocket !== undefined ? livePgConfig.hasVanityMirrorSocket : (finalMerchantObj?.metadata?.hasVanityMirrorSocket !== false);
  const hasPackedLunchBox = livePgConfig?.hasPackedLunchBox !== undefined ? livePgConfig.hasPackedLunchBox : Boolean(finalMerchantObj?.metadata?.hasPackedLunchBox);
  const hasContactlessParcelHub = livePgConfig?.hasContactlessParcelHub !== undefined ? livePgConfig.hasContactlessParcelHub : (finalMerchantObj?.metadata?.hasContactlessParcelHub !== false);
  const parentMotherStayAllowed = livePgConfig?.parentMotherStayAllowed !== undefined ? livePgConfig.parentMotherStayAllowed : (finalMerchantObj?.metadata?.parentMotherStayAllowed !== false);

  // Dedicated Co-Living lifestyle & remote work amenities values
  const hasCoworkingLounge = livePgConfig?.hasCoworkingLounge !== undefined ? livePgConfig.hasCoworkingLounge : (finalMerchantObj?.metadata?.hasCoworkingLounge !== false);
  const hasHighSpeedDualWifi = livePgConfig?.hasHighSpeedDualWifi !== undefined ? livePgConfig.hasHighSpeedDualWifi : (finalMerchantObj?.metadata?.hasHighSpeedDualWifi !== false);
  const hasFullPowerBackup = livePgConfig?.hasFullPowerBackup !== undefined ? livePgConfig.hasFullPowerBackup : (finalMerchantObj?.metadata?.hasFullPowerBackup !== false);
  const hasGamingLounge = livePgConfig?.hasGamingLounge !== undefined ? livePgConfig.hasGamingLounge : (finalMerchantObj?.metadata?.hasGamingLounge !== false);
  const hasRooftopCafe = livePgConfig?.hasRooftopCafe !== undefined ? livePgConfig.hasRooftopCafe : (finalMerchantObj?.metadata?.hasRooftopCafe !== false);
  const hasModularKitchen = livePgConfig?.hasModularKitchen !== undefined ? livePgConfig.hasModularKitchen : (finalMerchantObj?.metadata?.hasModularKitchen !== false);
  const hasFitnessGym = livePgConfig?.hasFitnessGym !== undefined ? livePgConfig.hasFitnessGym : (finalMerchantObj?.metadata?.hasFitnessGym !== false);
  const hasCommercialDryerLaundry = livePgConfig?.hasCommercialDryerLaundry !== undefined ? livePgConfig.hasCommercialDryerLaundry : (finalMerchantObj?.metadata?.hasCommercialDryerLaundry !== false);
  const hasEvChargingPoint = livePgConfig?.hasEvChargingPoint !== undefined ? livePgConfig.hasEvChargingPoint : (finalMerchantObj?.metadata?.hasEvChargingPoint !== false);

  // Extract and clean real images from Venue Gallery (1st priority) + room listings photos
  const extractedImages: string[] = [];
  const addIfValid = (url: any) => {
    if (typeof url === 'string' && url.trim().length > 0 && !extractedImages.includes(url)) {
      const lower = url.toLowerCase();
      // Filter out temporary blobs, UI screenshots, and previous dummy temple or card preview captures
      if (
        !url.startsWith('blob:') &&
        !lower.includes('screenshot') &&
        !lower.includes('temple') &&
        !lower.includes('darshan') &&
        !lower.includes('dummy')
      ) {
        extractedImages.push(url.trim());
      }
    }
  };

  // 1. Highest Priority: Venue Photo Showcase Gallery (uploaded in Venue Profile)
  if (typeof window !== 'undefined') {
    try {
      const gKeys = [
        `venue_gallery_${merchantId}`,
        `venue_gallery_${finalMerchantObj?.username}`,
        'venue_gallery_default'
      ];
      for (const k of gKeys) {
        const stored = localStorage.getItem(k);
        if (stored) {
          const parsedG = JSON.parse(stored);
          if (Array.isArray(parsedG) && parsedG.length > 0) {
            // For sports/turfs, do not inject hotel room photos that were stored in a generic key
            const isTurfContaminated = isFacility && parsedG.some((img: string) => {
              const lower = (img || '').toLowerCase();
              return lower.includes('bed') || lower.includes('bedroom') || lower.includes('room') || lower.includes('hotel');
            });
            if (!isTurfContaminated) {
              parsedG.forEach(addIfValid);
              break;
            }
          }
        }
      }
      if (extractedImages.length === 0) {
        const busStore = localStorage.getItem('vendor-portal-storage-v10');
        if (busStore) {
          const parsed = JSON.parse(busStore);
          const curM = parsed.state?.currentMerchant;
          // Check active branch gallery first if multi-branch merchant
          if (curM && Array.isArray(curM.branches)) {
            const sportsBranch = curM.branches.find((b: any) =>
              (isFacility && (b.category?.toLowerCase().includes('turf') || b.businessType?.toLowerCase().includes('sports') || b.name?.toLowerCase().includes('arena') || b.name?.toLowerCase().includes('turf')))
            );
            if (sportsBranch && Array.isArray(sportsBranch.gallery) && sportsBranch.gallery.length > 0) {
              sportsBranch.gallery.forEach(addIfValid);
            }
          }

          // Only take parent gallery if the merchant category / branch matches this page archetype (avoid showing hotel room photos on turf)
          if (extractedImages.length === 0) {
            const curMCat = (curM?.category || '').toLowerCase();
            const isCompatible = isFacility
              ? (curMCat.includes('turf') || curMCat.includes('sport') || curMCat.includes('arena') || curMCat.includes('ground') || curMCat.includes('court') || curMCat.includes('badminton') || curMCat.includes('football') || curMCat.includes('cricket'))
              : (!curMCat.includes('turf') && !curMCat.includes('sport'));

            if (isCompatible && curM?.gallery && Array.isArray(curM.gallery)) {
              curM.gallery.forEach(addIfValid);
            }
          }
        }
      }
    } catch { }
  }

  // Also include backend merchant gallery/images only if compatible
  const mCat = (finalMerchantObj?.category || '').toLowerCase();
  const isMerchantCompatible = isFacility
    ? (mCat.includes('turf') || mCat.includes('sport') || mCat.includes('arena') || mCat.includes('court') || mCat.includes('badminton') || mCat.includes('football') || mCat.includes('cricket'))
    : (!mCat.includes('turf') && !mCat.includes('sport'));

  if (isMerchantCompatible) {
    (finalMerchantObj.images || []).forEach(addIfValid);
    (finalMerchantObj.gallery || []).forEach(addIfValid);
    (finalMerchantObj.metadata?.gallery || []).forEach(addIfValid);
  }

  // 2. Next Priority: Room listings / service photos (strictly matching current category)
  liveServices.forEach((svc: any) => {
    const sCat = (svc.category || svc.categoryObj?.slug || '').toLowerCase();
    const isSvcCompatible = isFacility
      ? (sCat.includes('turf') || sCat.includes('sport') || sCat.includes('arena') || sCat.includes('court') || sCat.includes('play') || sCat.includes('swimming') || sCat.includes('badminton') || sCat.includes('football') || sCat.includes('cricket'))
      : true;

    if (isSvcCompatible) {
      const svcListings = svc.metadata?.listings || svc.rawConfig?.metadata?.listings || [];
      svcListings.forEach((l: any) => {
        addIfValid(l.imageUrl);
        addIfValid(l.image);
        (l.images || []).forEach(addIfValid);
        (l.metadata?.gallery || []).forEach(addIfValid);
      });
      addIfValid(svc.imageUrl);
      addIfValid(svc.image);
      (svc.images || []).forEach(addIfValid);
      (svc.metadata?.images || []).forEach(addIfValid);
      (svc.metadata?.gallery || []).forEach(addIfValid);
    }
  });

  // Fallback photos based on category (Turf/Sports vs Hotel)
  const defaultTurfPhotos = [
    'https://images.unsplash.com/photo-1529900245534-47fbf82a4fbe?w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80'
  ];

  // Provide curated high-res photos if no custom images exist
  const galleryImages: string[] = extractedImages.length > 0
    ? extractedImages
    : (isFacility ? defaultTurfPhotos : defaultHotelPhotos);

  const firstSvc = liveServices[0];
  const firstListing = firstSvc?.metadata?.listings?.[0] || firstSvc?.rawConfig?.metadata?.listings?.[0];

  // Venue profile about text (distinct from court/pitch listing description)
  const aboutText = isFacility
    ? (() => {
      // If merchant has an aboutText, check if it's hotel-specific (e.g., contains 'Hotel Suites')
      const rawMAbout = finalMerchantObj.aboutText || finalMerchantObj.about || finalMerchantObj.description || '';
      const isHotelSpecificText = rawMAbout.toLowerCase().includes('hotel') || rawMAbout.toLowerCase().includes('resort') || rawMAbout.toLowerCase().includes('suite');
      if (rawMAbout && !isHotelSpecificText) {
        return rawMAbout;
      }
      return firstSvc?.description ||
        firstListing?.description ||
        firstSvc?.metadata?.about ||
        `Premier sports arena and multi-sport turf facility located in ${city || 'Chennai'}. Equipped with FIFA certified astro turf, high-mast floodlights, and professional player amenities.`;
    })()
    : (finalMerchantObj.description ||
      finalMerchantObj.aboutText ||
      finalMerchantObj.about ||
      firstSvc?.description ||
      firstListing?.description);

  const defaultFacilityAmenities = [
    'FIFA Standard Astro Turf', 'High-Mast LED Floodlights', 'Clean Changing Rooms', 'Dugout Seating for Teams', 'Drinking Water & First Aid', 'Parking Area'
  ];

  const amenities = isFacility
    ? ((firstListing?.metadata?.amenities && firstListing.metadata.amenities.length > 0)
      ? firstListing.metadata.amenities
      : ((firstSvc?.metadata?.amenities && firstSvc.metadata.amenities.length > 0)
        ? firstSvc.metadata.amenities
        : defaultFacilityAmenities))
    : ((finalMerchantObj.amenities && finalMerchantObj.amenities.length > 0)
      ? finalMerchantObj.amenities
      : (finalMerchantObj.thingsToKnow && finalMerchantObj.thingsToKnow.length > 0)
        ? finalMerchantObj.thingsToKnow
        : (firstSvc?.metadata?.amenities || firstListing?.metadata?.amenities || []));

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b10] text-slate-800 dark:text-slate-100 pt-20 sm:pt-24 pb-32 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* ============================================================
         * SECTION A: AGODA STANDARD BREADCRUMB & STREAMLINED HOTEL HEADER
         * ============================================================ */}
        <div className="mb-5 space-y-3">
          {/* Agoda Standard Breadcrumbs (Home > Category > City > Property) */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap py-1">
            <Link href="/" className="hover:text-[#033266] dark:hover:text-[#ff6325] hover:underline transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            <Link href={`/${bookingType}/${category}`} className="hover:text-[#033266] dark:hover:text-[#ff6325] hover:underline transition-colors capitalize">
              {category ? category.replace('-', ' ') : 'Stays'}
            </Link>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            <span className="hover:text-[#033266] dark:hover:text-[#ff6325] hover:underline cursor-pointer transition-colors">
              {city || 'Chennai'}
            </span>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
              {venueName}
            </span>
          </nav>

        </div>

        {/* ============================================================
         * SECTION C: CONTEXTUAL SUMMARY BAR & EDIT SEARCH DOCK (ALL BOOKINGS)
         * ============================================================ */}
        <div className="mb-6 sticky top-[98px] z-30 pt-3 pb-2 -mt-3 bg-[#f8fafc] dark:bg-[#090b10] transition-all flex flex-col items-center">
          <div className={`p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-md flex items-center justify-between gap-4 transition-all ${isFacility ? 'w-fit max-w-full' : 'w-full'}`}>
            {isPgStay ? (
              <div className="flex flex-wrap items-center gap-6 text-xs">
                {/* Move-in Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Move-in Date
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {(() => {
                        try {
                          const [y, m, d] = hostelMoveInDate.split('-');
                          return `${d}-${m}-${y}`;
                        } catch {
                          return hostelMoveInDate;
                        }
                      })()}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />

                {/* Stay Duration */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {hostelDurationMonths} Month{hostelDurationMonths > 1 ? 's' : ''} Stay
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />

                {/* Gender & Sharing Preference */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Type & Sharing
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm capitalize">
                      {hostelGender === 'all' ? 'Any Gender' : hostelGender} • {hostelSharing === 'all' ? 'Any Sharing' : hostelSharing}
                    </span>
                    {hostelFoodIncluded && (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold ml-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                        🍱 3 Meals
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : isEntertainment ? (
              /* Dedicated Entertainment & Cinema Summary Bar */
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs w-full lg:w-auto">
                {/* 1. Cinema / Venue Location */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">
                      CINEMA / VENUE
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[180px] block">
                      {venueName}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                {/* 2. Show Date with Quick Date Switcher */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">
                      SHOW DATE
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {(() => {
                        try {
                          const curD = selectedShowDate || sportsSlotDate || todayStr;
                          const [y, m, d] = curD.split('-');
                          const isT = curD === todayStr;
                          return isT ? `Today (${d}-${m})` : `${d}-${m}-${y}`;
                        } catch {
                          return selectedShowDate || todayStr;
                        }
                      })()}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                {/* 3. Screen Format & Showtime */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">
                      EXPERIENCE & TIME
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {selectedScreenFormat} • {selectedShowTime}
                    </span>
                  </div>
                </div>
              </div>
            ) : isFacility ? (
              /* Dedicated Sports & Arena Summary Bar (District / Playo Style) */
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs w-full lg:w-auto">
                {/* 1. Arena Location */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">
                      WHERE / VENUE
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[160px] block">
                      {venueName}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                {/* 2. Slot Play Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">
                      PLAY DATE
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {(() => {
                        try {
                          const curD = selectedDate || sportsSlotDate;
                          const [y, m, d] = curD.split('-');
                          const isT = curD === todayStr;
                          return isT ? `Today (${d}-${m})` : `${d}-${m}-${y}`;
                        } catch {
                          return selectedDate || sportsSlotDate;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ) : isRental ? (
              /* Dedicated Rental Summary Bar */
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Rental Period</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {rentalStartDate} ➔ {rentalEndDate} ({rentalDays} Days)
                    </span>
                  </div>
                </div>
              </div>
            ) : isDining ? (
              /* Dedicated Restaurant Table Reservation Summary Bar */
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Dining Date & Time
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {selectedDate || todayStr} • {selectedDiningTime}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Party Size & Seating
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {diningGuestCount} Guests • {diningZoneTab === 'ROOFTOP' ? '🌆 Rooftop' : diningZoneTab === 'GARDEN_PATIO' ? '🌿 Garden Patio' : diningZoneTab === 'PRIVATE_DINING' ? '👑 Private Dining' : '🌟 AC Indoor'}
                    </span>
                  </div>
                </div>
              </div>
            ) : isAppointment || isHomeCall || isWellness || isFitness || isYoga ? (
              /* Dedicated Appointment / Home Services / Wellness / Fitness Summary Bar */
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      {isHomeCall ? 'Service Date & Window' : isYoga ? 'Yoga Batch Date' : isFitness ? 'Gym Workout Date' : isWellness ? 'Salon Appointment Date' : 'Consultation Date'}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {selectedDate || todayStr} • {isHomeCall ? (preferredHomeWindow || 'Morning (09:00 AM - 12:00 PM)') : isYoga ? (selectedFitnessTimeSlot || '06:00 AM Batch') : isFitness ? (selectedFitnessTimeSlot || '06:00 AM Batch') : (selectedApptSlot || '10:00 AM Slot')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Stays / Hotel Summary Bar */
              <div className="flex flex-wrap items-center gap-6 text-xs">
                {/* Stay Dates */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Dates & Nights
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-[#033266] dark:text-[#ff6325] font-bold ml-1.5 px-2 py-0.5 rounded-md bg-[#033266]/10 dark:bg-[#ff6325]/15">
                      {nights} Night{nights > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />

                {/* Occupancy */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      Guests & Units
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {adults + children} Guest{adults + children > 1 ? 's' : ''} ({adults} Adults{children > 0 ? `, ${children} Children` : ''}) • {rooms} Room{rooms > 1 ? 's' : ''}
                    </span>
                    {(pets || petCount > 0) && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold ml-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                        🐾 {petCount || 1} Pet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 ml-4 sm:ml-6">
              <button
                type="button"
                onClick={() => setIsEditSearchOpen(!isEditSearchOpen)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
              >
                {isEditSearchOpen ? 'Close Editor' : 'Edit Search'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = isDining ? 'dining-booking-section' : isEntertainment ? 'entertainment-booking-section' : (isFitness || isYoga) ? 'fitness-booking-section' : isWellness ? 'wellness-booking-section' : isFacility ? 'available-slots-section' : isHomeCall ? 'home-services-booking-section' : 'available-rooms-section';
                  const el = document.getElementById(targetId);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-[#ff6325] hover:bg-[#e04e13] active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>{isDining ? 'Reserve Table' : isYoga ? 'Select Yoga Batch' : isFitness ? 'Select Gym Pass' : isWellness ? 'Select Stylist & Services' : isFacility ? (isStudio ? 'Select Studio Bay' : 'Select Court & Slot') : isEntertainment ? 'Select Tickets & Seats' : isRental ? 'Select Gear' : isHomeCall ? 'Book Home Service' : isAppointment ? 'Select Specialist' : 'Select Room'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick Inline Date / Occupancy / Slot Editor */}
          {isEditSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 p-5 bg-white dark:bg-[#0f1219] rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg text-xs space-y-4 ${isFacility || isEntertainment ? 'w-full max-w-2xl' : 'w-full'}`}
            >
              {isEntertainment ? (
                /* ================= Dedicated Entertainment & Movie Show Date Editor ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* 1. Venue & Screen Format */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        CINEMA / VENUE
                      </label>
                      <div className="relative flex items-center">
                        <MapPin size={14} className="text-[#ff6325] shrink-0 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          readOnly
                          value={venueName}
                          className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 font-bold text-xs text-slate-900 dark:text-white outline-none truncate"
                        />
                      </div>
                    </div>

                    {/* 2. Interactive Show Date Selector */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        SHOW DATE
                      </label>
                      <div className="relative flex items-center">
                        <Calendar size={14} className="text-[#ff6325] shrink-0 absolute left-3 pointer-events-none" />
                        <input
                          type="date"
                          min={todayStr}
                          value={selectedShowDate || sportsSlotDate || todayStr}
                          onChange={(e) => {
                            setSelectedShowDate(e.target.value);
                            setSportsSlotDate(e.target.value);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-[#ff6325] transition-all cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 3. Quick Date Pills (Today, Tomorrow, Weekend) */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        QUICK SELECT
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedShowDate(todayStr);
                            setSportsSlotDate(todayStr);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${(selectedShowDate || sportsSlotDate) === todayStr ? 'bg-[#ff6325] text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            const val = d.toISOString().split('T')[0];
                            setSelectedShowDate(val);
                            setSportsSlotDate(val);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${(selectedShowDate || sportsSlotDate) === tomorrowDate.toISOString().split('T')[0] ? 'bg-[#ff6325] text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            const offset = (6 - d.getDay() + 7) % 7 || 7;
                            d.setDate(d.getDate() + offset);
                            const val = d.toISOString().split('T')[0];
                            setSelectedShowDate(val);
                            setSportsSlotDate(val);
                          }}
                          className="py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          Weekend
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Show Timing Quick Selector */}
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1.5">
                      AVAILABLE SHOWTIMES
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['10:30 AM', '01:45 PM', '04:30 PM', '06:45 PM', '09:45 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedShowTime(t)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedShowTime === t
                            ? 'bg-[#ff6325] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsEditSearchOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSearchOpen(false);
                        const newQuery = new URLSearchParams(window.location.search);
                        newQuery.set('date', selectedShowDate || sportsSlotDate || todayStr);
                        newQuery.set('time', selectedShowTime);
                        window.history.replaceState(null, '', `?${newQuery.toString()}`);
                      }}
                      className="px-6 py-2 bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Apply Date & Time
                    </button>
                  </div>
                </div>
              ) : isFacility ? (
                /* ================= Dedicated Sports & Turf Slot Editor (Matching Category Search Dock: Venue & Play Date) ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* 1. Venue / Area Display with Search & Switcher */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        WHERE / VENUE
                      </label>
                      <div className="relative flex items-center">
                        <MapPin size={14} className="text-[#ff6325] shrink-0 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={editSearchQuery || venueName}
                          onFocus={(e) => {
                            if (!editSearchQuery) setEditSearchQuery(venueName);
                            setShowEditSearchAutocomplete(true);
                            e.target.select();
                          }}
                          onChange={(e) => {
                            setEditSearchQuery(e.target.value);
                            setShowEditSearchAutocomplete(true);
                          }}
                          placeholder="Search venue or location..."
                          className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-7 py-2 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-[#ff6325] transition-all truncate"
                        />
                        {editSearchQuery ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditSearchQuery('');
                              setShowEditSearchAutocomplete(false);
                            }}
                            className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                          >
                            <X size={13} />
                          </button>
                        ) : (
                          <ChevronDown size={13} className="absolute right-2.5 text-slate-400 pointer-events-none" />
                        )}
                      </div>

                      {/* Autocomplete Dropdown for venues, branches & cities */}
                      {showEditSearchAutocomplete && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowEditSearchAutocomplete(false)} />
                          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 max-h-60 overflow-y-auto">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between border-b border-slate-100 dark:border-white/10 mb-1">
                              <span>Select Venue or City</span>
                              <span className="text-[#ff6325]">{city || 'Chennai'}</span>
                            </div>

                            {/* Available Branches / Venues */}
                            {(() => {
                              const q = (editSearchQuery || '').toLowerCase().trim();

                              // Check multi-branches from business portal or live merchants
                              let venueOptions: Array<{ id: string; name: string; type: string; address?: string }> = [];
                              if (typeof window !== 'undefined') {
                                try {
                                  const busStorageRaw = localStorage.getItem('vendor-portal-storage-v10');
                                  if (busStorageRaw) {
                                    const busData = JSON.parse(busStorageRaw);
                                    const curM = busData.state?.currentMerchant;
                                    if (curM && Array.isArray(curM.branches)) {
                                      curM.branches.forEach((b: any) => {
                                        venueOptions.push({
                                          id: curM.id || merchantId,
                                          name: b.name || curM.merchantName,
                                          type: b.category || 'Branch Location',
                                          address: b.address || b.city
                                        });
                                      });
                                    }
                                  }
                                } catch { }
                              }

                              // Add current venue if not listed
                              if (!venueOptions.some(v => v.name.toLowerCase() === venueName.toLowerCase())) {
                                venueOptions.unshift({
                                  id: merchantId,
                                  name: venueName,
                                  type: 'Current Venue',
                                  address: address
                                });
                              }

                              const filteredVenues = venueOptions.filter(v => !q || v.name.toLowerCase().includes(q) || (v.address && v.address.toLowerCase().includes(q)));

                              const matchingCities = ALL_CITIES.filter(c => q && c.toLowerCase().includes(q)).slice(0, 3);

                              return (
                                <div className="space-y-1">
                                  {filteredVenues.map((v, idx) => (
                                    <button
                                      key={`v-${idx}`}
                                      type="button"
                                      onClick={() => {
                                        setEditSearchQuery(v.name);
                                        setShowEditSearchAutocomplete(false);
                                        // If different merchant / branch, navigate
                                        const newQuery = new URLSearchParams(window.location.search);
                                        newQuery.set('venue', v.name);
                                        newQuery.set('date', sportsSlotDate);
                                        router.push(`/${bookingType}/${category}/${v.id}?${newQuery.toString()}`);
                                      }}
                                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${v.name === venueName ? 'bg-[#ff6325]/10 text-[#ff6325] font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <MapPin size={13} className="shrink-0 text-[#ff6325]" />
                                        <span className="truncate">{v.name}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 shrink-0 ml-1.5">{v.type}</span>
                                    </button>
                                  ))}

                                  {matchingCities.length > 0 && (
                                    <div className="pt-1 border-t border-slate-100 dark:border-white/10 mt-1">
                                      <div className="text-[9px] uppercase font-bold text-slate-400 px-2 py-0.5">Change City</div>
                                      {matchingCities.map(c => (
                                        <button
                                          key={`c-${c}`}
                                          type="button"
                                          onClick={() => {
                                            const popMatch = POPULAR_CITIES.find(p => p.name.toLowerCase() === c.toLowerCase());
                                            if (popMatch) {
                                              setLocation(popMatch.lat, popMatch.lng, popMatch.name);
                                            } else {
                                              setCity(c);
                                            }
                                            setShowEditSearchAutocomplete(false);
                                            router.push(`/${bookingType}/${category}?city=${encodeURIComponent(c)}&date=${sportsSlotDate}`);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                                        >
                                          <span>📍 Explore {c}</span>
                                          <span className="text-[9px] text-[#ff6325]">Browse Category →</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>

                    {/* 2. Play Date */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        PLAY DATE
                      </label>
                      <input
                        type="date"
                        value={sportsSlotDate}
                        min={todayStr}
                        onChange={(e) => {
                          setSportsSlotDate(e.target.value);
                          setSelectedDate(e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                      />
                    </div>

                    {/* 3. Quick Date Shortcuts */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        QUICK SHORTCUTS
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSportsSlotDate(todayStr);
                            setSelectedDate(todayStr);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${sportsSlotDate === todayStr ? 'bg-[#ff6325] text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                            }`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            const val = d.toISOString().split('T')[0];
                            setSportsSlotDate(val);
                            setSelectedDate(val);
                          }}
                          className="py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            const offset = (6 - d.getDay() + 7) % 7 || 7;
                            d.setDate(d.getDate() + offset);
                            const val = d.toISOString().split('T')[0];
                            setSportsSlotDate(val);
                            setSelectedDate(val);
                          }}
                          className="py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Weekend
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsEditSearchOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSearchOpen(false);
                        const newQuery = new URLSearchParams(window.location.search);
                        newQuery.set('date', sportsSlotDate);
                        window.history.replaceState(null, '', `?${newQuery.toString()}`);
                        const el = document.getElementById('available-slots-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-2 bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Search Slots
                    </button>
                  </div>
                </div>
              ) : isPgStay ? (
                /* ================= Dedicated Hostel & PG Editor ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Move-in Date */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Move-in Date
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const targetD = hostelMoveInDate ? new Date(hostelMoveInDate) : new Date();
                          setMoveInCalMonthDate(isNaN(targetD.getTime()) ? new Date() : targetD);
                          setIsMoveInCalOpen(!isMoveInCalOpen);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white flex items-center justify-between hover:border-[#033266] dark:hover:border-[#ff6325] transition-all cursor-pointer text-left"
                      >
                        <span className="text-xs">
                          {(() => {
                            try {
                              const [y, m, d] = hostelMoveInDate.split('-');
                              return `${d}-${m}-${y}`;
                            } catch {
                              return hostelMoveInDate;
                            }
                          })()}
                        </span>
                        <Calendar size={15} className="text-[#ff6325] shrink-0" />
                      </button>

                      {/* Popover Calendar for Move-In Date */}
                      <AnimatePresence>
                        {isMoveInCalOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl z-50 space-y-3"
                          >
                            <div className="bg-slate-50 dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-2 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setMoveInCalMonthDate(new Date(moveInCalMonthDate.getFullYear(), moveInCalMonthDate.getMonth() - 1, 1));
                                }}
                                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              >
                                <ChevronLeft size={15} />
                              </button>
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {moveInCalMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setMoveInCalMonthDate(new Date(moveInCalMonthDate.getFullYear(), moveInCalMonthDate.getMonth() + 1, 1));
                                }}
                                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              >
                                <ChevronRight size={15} />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="py-1">{d}</div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                              {(() => {
                                const year = moveInCalMonthDate.getFullYear();
                                const month = moveInCalMonthDate.getMonth();
                                const firstDay = new Date(year, month, 1).getDay();
                                const totalDays = new Date(year, month + 1, 0).getDate();
                                const cells = [];

                                for (let i = 0; i < firstDay; i++) {
                                  cells.push(<div key={`hostel-empty-${i}`} className="h-8" />);
                                }

                                for (let d = 1; d <= totalDays; d++) {
                                  const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                  const isSelected = hostelMoveInDate === dStr;
                                  const isToday = todayStr === dStr;

                                  cells.push(
                                    <div key={d} className="flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setHostelMoveInDate(dStr);
                                          setIsMoveInCalOpen(false);
                                        }}
                                        className={`w-8 h-8 rounded-full text-xs font-black transition-all flex items-center justify-center cursor-pointer ${isSelected
                                          ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-md scale-105'
                                          : isToday
                                            ? 'border border-[#ff6325] text-[#ff6325] font-black'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                          }`}
                                      >
                                        {d}
                                      </button>
                                    </div>
                                  );
                                }
                                return cells;
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Stay Duration (Months) */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Stay Duration (Tenure)
                      </label>
                      <select
                        value={hostelDurationMonths}
                        onChange={(e) => setHostelDurationMonths(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-[#033266] dark:focus:border-[#ff6325]"
                      >
                        <option value={1}>1 Month (Short Stay)</option>
                        <option value={2}>2 Months</option>
                        <option value={3}>3 Months (Standard)</option>
                        <option value={6}>6 Months (Semester / Job)</option>
                        <option value={11}>11 Months (Annual Agreement)</option>
                      </select>
                    </div>

                    {/* Gender Policy */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Gender Type
                      </label>
                      <select
                        value={hostelGender}
                        onChange={(e) => setHostelGender(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-[#033266] dark:focus:border-[#ff6325]"
                      >
                        <option value="all">Any Gender / Coliving</option>
                        <option value="gents">Gents Only</option>
                        <option value="ladies">Ladies Only</option>
                        <option value="coliving">Unisex / Co-living</option>
                      </select>
                    </div>

                    {/* Sharing Preference */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Sharing Type
                      </label>
                      <select
                        value={hostelSharing}
                        onChange={(e) => setHostelSharing(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-[#033266] dark:focus:border-[#ff6325]"
                      >
                        <option value="all">Any Sharing</option>
                        <option value="single">Single Room (Private)</option>
                        <option value="2-sharing">2 Sharing</option>
                        <option value="3-sharing">3 Sharing</option>
                        <option value="4-sharing">4 Sharing</option>
                      </select>
                    </div>
                  </div>

                  {/* Bottom Bar: Daily Food Checkbox + Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hostelFoodIncluded}
                        onChange={(e) => setHostelFoodIncluded(e.target.checked)}
                        className="w-4 h-4 rounded text-[#033266] dark:text-[#ff6325] focus:ring-0 cursor-pointer"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Include 3 Times Daily Food (Breakfast, Lunch & Dinner)
                      </span>
                    </label>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsEditSearchOpen(false)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditSearchOpen(false);
                          const newQuery = new URLSearchParams(window.location.search);
                          newQuery.set('moveIn', hostelMoveInDate);
                          newQuery.set('durationMonths', String(hostelDurationMonths));
                          newQuery.set('gender', hostelGender);
                          newQuery.set('sharing', hostelSharing);
                          newQuery.set('foodIncluded', String(hostelFoodIncluded));
                          window.history.replaceState(null, '', `?${newQuery.toString()}`);
                        }}
                        className="px-6 py-2 bg-[#033266] dark:bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                      >
                        Apply Search
                      </button>
                    </div>
                  </div>
                </div>
              ) : isHomeCall ? (
                /* ================= Dedicated Home Services Editor (Plumber, Electrician, Cleaning) ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Service Type */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Service Type
                      </label>
                      <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white flex items-center justify-between text-xs">
                        <span>{CATEGORY_NAMES[category] || category || 'Doorstep Service'}</span>
                        <span className="text-emerald-600 font-black">✓ Doorstep</span>
                      </div>
                    </div>

                    {/* 2. Service Date */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={selectedDate || todayStr}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>

                    {/* 3. Arrival Window */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Technician Arrival Window
                      </label>
                      <select
                        value={preferredHomeWindow}
                        onChange={(e) => setPreferredHomeWindow(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                        <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (01:00 PM - 04:00 PM)</option>
                        <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditSearchOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSearchOpen(false);
                        const newQuery = new URLSearchParams(window.location.search);
                        newQuery.set('date', selectedDate);
                        newQuery.set('slot', preferredHomeWindow);
                        window.history.replaceState(null, '', `?${newQuery.toString()}`);
                        const el = document.getElementById('home-services-booking-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-2 bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Apply Search
                    </button>
                  </div>
                </div>
              ) : isDining ? (
                /* ================= Dedicated Dining / Table Reservation Search Editor ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* 1. Dining Date */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">Dining Date</label>
                      <input
                        type="date"
                        value={selectedDate || todayStr}
                        min={todayStr}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>

                    {/* 2. Meal Session & Time */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">Meal & Time</label>
                      <select
                        value={selectedDiningTime}
                        onChange={(e) => setSelectedDiningTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        <optgroup label="Lunch Slots">
                          <option value="12:30 PM">12:30 PM (Lunch)</option>
                          <option value="01:00 PM">01:00 PM (Lunch)</option>
                          <option value="01:30 PM">01:30 PM (Lunch)</option>
                          <option value="02:00 PM">02:00 PM (Lunch)</option>
                        </optgroup>
                        <optgroup label="Dinner Slots">
                          <option value="07:00 PM">07:00 PM (Dinner)</option>
                          <option value="07:30 PM">07:30 PM (Dinner)</option>
                          <option value="08:00 PM">08:00 PM (Dinner)</option>
                          <option value="08:30 PM">08:30 PM (Dinner)</option>
                          <option value="09:00 PM">09:00 PM (Dinner)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* 3. Number of Guests */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">Guests / Party Size</label>
                      <select
                        value={diningGuestCount}
                        onChange={(e) => setDiningGuestCount(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map(cnt => (
                          <option key={cnt} value={cnt}>{cnt} Guest{cnt > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* 4. Seating Zone */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">Seating Ambience</label>
                      <select
                        value={diningZoneTab}
                        onChange={(e) => setDiningZoneTab(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="ALL">All Seating Zones</option>
                        <option value="AC_INDOOR">🌟 AC Indoor Dining</option>
                        <option value="ROOFTOP">🌆 Open-Air Rooftop</option>
                        <option value="GARDEN_PATIO">🌿 Garden Patio</option>
                        <option value="PRIVATE_DINING">👑 Private Dining Room</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditSearchOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSearchOpen(false);
                        const el = document.getElementById('dining-booking-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-2 bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Update Table Search
                    </button>
                  </div>
                </div>
              ) : (isFitness || isYoga) ? (
                /* ================= Dedicated Gym & Yoga Fitness Editor ================= */
                (() => {
                  const isYogaCategory = isYoga || cleanCat.includes('yoga') || cleanCat.includes('meditation');
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. Format / Class Type */}
                        <div className="relative">
                          <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                            {isYogaCategory ? 'Yoga Batch Format' : 'Gym Workout Format'}
                          </label>
                          <select
                            value={fitnessFormatFilter}
                            onChange={(e) => setFitnessFormatFilter(e.target.value as any)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                          >
                            {isYogaCategory ? (
                              <>
                                <option value="ALL">All Yoga Batches</option>
                                <option value="YOGA_CLASS">Group Yoga Batch</option>
                                <option value="PERSONAL_TRAINING">1-on-1 Guru Session</option>
                              </>
                            ) : (
                              <>
                                <option value="ALL">All Gym Passes</option>
                                <option value="OPEN_GYM">Open Gym Floor Pass</option>
                                <option value="PERSONAL_TRAINING">1-on-1 PT Session</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* 2. Workout Date */}
                        <div className="relative">
                          <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                            {isYogaCategory ? 'Yoga Date' : 'Workout Date'}
                          </label>
                          <input
                            type="date"
                            min={todayStr}
                            value={selectedDate || todayStr}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white text-xs outline-none"
                          />
                        </div>

                        {/* 3. Session Timing */}
                        <div className="relative">
                          <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                            {isYogaCategory ? 'Yoga Batch Time' : 'Gym Shift / Time'}
                          </label>
                          <select
                            value={selectedFitnessTimeSlot}
                            onChange={(e) => setSelectedFitnessTimeSlot(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                          >
                            {['06:00 AM', '07:15 AM', '08:30 AM', '05:00 PM', '06:15 PM', '07:30 PM', '08:45 PM'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsEditSearchOpen(false)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditSearchOpen(false);
                            const newQuery = new URLSearchParams(window.location.search);
                            newQuery.set('date', selectedDate);
                            newQuery.set('slot', selectedFitnessTimeSlot);
                            window.history.replaceState(null, '', `?${newQuery.toString()}`);
                            const el = document.getElementById('fitness-booking-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 py-2 bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                        >
                          Apply Search
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : isWellness ? (
                /* ================= Dedicated Salon & Spa Appointment Editor (Matching Search Dock) ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* 1. Category / Service Type (Salon vs Spa) */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Service Type
                      </label>
                      <select
                        value={wellnessServiceMode === 'HOME_VISIT' ? 'HOME_VISIT' : 'IN_SALON'}
                        onChange={(e) => setWellnessServiceMode(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="IN_SALON">🏢 In-Salon Visit</option>
                        <option value="HOME_VISIT">🏠 Doorstep Home Service</option>
                      </select>
                    </div>

                    {/* 2. For Whom (Gender Target) */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        For Whom
                      </label>
                      <select
                        value={wellnessGenderFilter}
                        onChange={(e) => setWellnessGenderFilter(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="ALL">✨ All / Unisex</option>
                        <option value="WOMEN">👩 Women's Beauty & Spa</option>
                        <option value="MEN">🧔 Men's Grooming</option>
                      </select>
                    </div>

                    {/* 3. Appointment Date */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Appointment Date
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={selectedDate || todayStr}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>

                    {/* 4. Preferred Slot */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Time Slot Window
                      </label>
                      <select
                        value={selectedApptSlot || '10:00 AM'}
                        onChange={(e) => setSelectedApptSlot(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        {['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditSearchOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSearchOpen(false);
                        const newQuery = new URLSearchParams(window.location.search);
                        newQuery.set('date', selectedDate);
                        newQuery.set('slot', selectedApptSlot || '10:00 AM');
                        newQuery.set('gender', wellnessGenderFilter);
                        window.history.replaceState(null, '', `?${newQuery.toString()}`);
                        const el = document.getElementById('wellness-booking-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-2 bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Apply Search
                    </button>
                  </div>
                </div>
              ) : isAppointment ? (
                /* ================= Dedicated Doctor & Clinic Appointment Editor ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Speciality / Service Title */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        {isDoctor ? 'Department / Field' : 'Specialist / Stylist'}
                      </label>
                      <select
                        value={isDoctor ? selectedPractitioner : selectedWellnessStylist}
                        onChange={(e) => {
                          if (isDoctor) setSelectedPractitioner(e.target.value);
                          else setSelectedWellnessStylist(e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        {isDoctor ? (
                          <>
                            <option value="Dr. Rajesh Kumar (Senior Consultant)">Dr. Rajesh Kumar (Senior Consultant)</option>
                            <option value="Dr. Priya Sundaram (Associate Specialist)">Dr. Priya Sundaram (Associate Specialist)</option>
                          </>
                        ) : (
                          <>
                            <option value="Arun Varma (Creative Hair Director)">Arun Varma (Creative Hair Director)</option>
                            <option value="Priya Sundaram (Senior Aesthetician)">Priya Sundaram (Senior Aesthetician)</option>
                            <option value="Marcus D'Souza (Lead Spa Therapist)">Marcus D'Souza (Lead Spa Therapist)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* 2. Appointment Date */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Appointment Date
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={selectedDate || todayStr}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>

                    {/* 3. Slot / Time */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Preferred Time Slot
                      </label>
                      <select
                        value={selectedApptSlot || '10:00 AM'}
                        onChange={(e) => setSelectedApptSlot(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white text-xs outline-none cursor-pointer"
                      >
                        {['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditSearchOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSearchOpen(false);
                        const newQuery = new URLSearchParams(window.location.search);
                        newQuery.set('date', selectedDate);
                        newQuery.set('slot', selectedApptSlot || '10:00 AM');
                        window.history.replaceState(null, '', `?${newQuery.toString()}`);
                      }}
                      className="px-6 py-2 bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Apply Search
                    </button>
                  </div>
                </div>
              ) : (
                /* ================= Standard Hotel Editor ================= */
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Check-in */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Check-in Date
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const targetD = checkIn ? new Date(checkIn) : new Date();
                          setPickerMonthDate(isNaN(targetD.getTime()) ? new Date() : targetD);
                          setActiveDatePicker(activeDatePicker === 'checkIn' ? null : 'checkIn');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white flex items-center justify-between hover:border-[#033266] dark:hover:border-[#ff6325] transition-all cursor-pointer text-left"
                      >
                        <span className="text-xs">
                          {(() => {
                            try {
                              const [y, m, d] = checkIn.split('-');
                              return `${d}-${m}-${y}`;
                            } catch {
                              return checkIn;
                            }
                          })()}
                        </span>
                        <Calendar size={15} className="text-[#ff6325] shrink-0" />
                      </button>

                      {/* Popover Calendar for Check-In */}
                      <AnimatePresence>
                        {activeDatePicker === 'checkIn' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl z-50 space-y-3"
                          >
                            <div className="bg-slate-50 dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-2 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() - 1, 1));
                                }}
                                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              >
                                <ChevronLeft size={15} />
                              </button>
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {pickerMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() + 1, 1));
                                }}
                                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              >
                                <ChevronRight size={15} />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="py-1">{d}</div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                              {(() => {
                                const year = pickerMonthDate.getFullYear();
                                const month = pickerMonthDate.getMonth();
                                const firstDay = new Date(year, month, 1).getDay();
                                const totalDays = new Date(year, month + 1, 0).getDate();
                                const cells = [];

                                for (let i = 0; i < firstDay; i++) {
                                  cells.push(<div key={`empty-${i}`} className="h-8" />);
                                }

                                for (let d = 1; d <= totalDays; d++) {
                                  const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                  const isSelected = checkIn === dStr;
                                  const isToday = todayStr === dStr;

                                  cells.push(
                                    <div key={d} className="flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCheckIn(dStr);
                                          setActiveDatePicker(null);
                                          if (new Date(dStr) >= new Date(checkOut)) {
                                            const nextDay = new Date(dStr);
                                            nextDay.setDate(nextDay.getDate() + 1);
                                            setCheckOut(nextDay.toISOString().split('T')[0]);
                                          }
                                        }}
                                        className={`w-8 h-8 rounded-full text-xs font-black transition-all flex items-center justify-center cursor-pointer ${isSelected
                                          ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-md scale-105'
                                          : isToday
                                            ? 'border border-[#ff6325] text-[#ff6325] font-black'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                          }`}
                                      >
                                        {d}
                                      </button>
                                    </div>
                                  );
                                }
                                return cells;
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Check-out */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Check-out Date
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const targetD = checkOut ? new Date(checkOut) : new Date();
                          setPickerMonthDate(isNaN(targetD.getTime()) ? new Date() : targetD);
                          setActiveDatePicker(activeDatePicker === 'checkOut' ? null : 'checkOut');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white flex items-center justify-between hover:border-[#033266] dark:hover:border-[#ff6325] transition-all cursor-pointer text-left"
                      >
                        <span className="text-xs">
                          {(() => {
                            try {
                              const [y, m, d] = checkOut.split('-');
                              return `${d}-${m}-${y}`;
                            } catch {
                              return checkOut;
                            }
                          })()}
                        </span>
                        <Calendar size={15} className="text-[#ff6325] shrink-0" />
                      </button>

                      {/* Popover Calendar for Check-Out */}
                      <AnimatePresence>
                        {activeDatePicker === 'checkOut' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl z-50 space-y-3"
                          >
                            <div className="bg-slate-50 dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-2 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() - 1, 1));
                                }}
                                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              >
                                <ChevronLeft size={15} />
                              </button>
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {pickerMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() + 1, 1));
                                }}
                                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              >
                                <ChevronRight size={15} />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="py-1">{d}</div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                              {(() => {
                                const year = pickerMonthDate.getFullYear();
                                const month = pickerMonthDate.getMonth();
                                const firstDay = new Date(year, month, 1).getDay();
                                const totalDays = new Date(year, month + 1, 0).getDate();
                                const cells = [];

                                for (let i = 0; i < firstDay; i++) {
                                  cells.push(<div key={`empty-${i}`} className="h-8" />);
                                }

                                for (let d = 1; d <= totalDays; d++) {
                                  const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                  const isSelected = checkOut === dStr;
                                  const isPastCheckIn = new Date(dStr) <= new Date(checkIn);

                                  cells.push(
                                    <div key={d} className="flex items-center justify-center">
                                      <button
                                        type="button"
                                        disabled={isPastCheckIn}
                                        onClick={() => {
                                          setCheckOut(dStr);
                                          setActiveDatePicker(null);
                                        }}
                                        className={`w-8 h-8 rounded-full text-xs font-black transition-all flex items-center justify-center cursor-pointer ${isSelected
                                          ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-md scale-105'
                                          : isPastCheckIn
                                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                          }`}
                                      >
                                        {d}
                                      </button>
                                    </div>
                                  );
                                }
                                return cells;
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Adults */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Adults <span className="text-[9px] font-medium lowercase text-slate-400">Ages 18 or above</span>
                      </label>
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="font-black text-sm text-slate-900 dark:text-white">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(adults + 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Children <span className="text-[9px] font-medium lowercase text-slate-400">Ages 0 to 17</span>
                      </label>
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newC = Math.max(0, children - 1);
                            setChildren(newC);
                            setChildAges(childAges.slice(0, newC));
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="font-black text-sm text-slate-900 dark:text-white">{children}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newC = children + 1;
                            setChildren(newC);
                            setChildAges([...childAges, 5]);
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block mb-1">
                        Rooms <span className="text-[9px] font-medium lowercase text-slate-400">Units required</span>
                      </label>
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="font-black text-sm text-slate-900 dark:text-white">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(rooms + 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Child Age Selection Details */}
                  {children > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Age of Children:</span>
                      {childAges.map((age, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-semibold">Child {idx + 1}:</span>
                          <select
                            value={age}
                            onChange={(e) => {
                              const newAges = [...childAges];
                              newAges[idx] = Number(e.target.value);
                              setChildAges(newAges);
                            }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none"
                          >
                            {Array.from({ length: 18 }, (_, i) => (
                              <option key={i} value={i}>
                                {i === 0 ? 'Under 1 yr' : `${i} yrs`}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pets Checkbox & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-white/5 mt-3">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pets}
                          onChange={(e) => {
                            setPets(e.target.checked);
                            if (e.target.checked && petCount === 0) setPetCount(1);
                            if (!e.target.checked) setPetCount(0);
                          }}
                          className="w-4 h-4 rounded text-[#033266] dark:text-[#ff6325] focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                          🐾 Traveling with Pets?
                        </span>
                      </label>

                      {pets && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <select
                            value={petCount || 1}
                            onChange={(e) => setPetCount(Number(e.target.value))}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none"
                          >
                            {[1, 2, 3, 4].map(n => (
                              <option key={n} value={n}>
                                {n} Pet{n > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsEditSearchOpen(false)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditSearchOpen(false);
                          const newQuery = new URLSearchParams(window.location.search);
                          newQuery.set('checkIn', checkIn);
                          newQuery.set('checkOut', checkOut);
                          newQuery.set('adults', String(adults));
                          newQuery.set('children', String(children));
                          newQuery.set('childAges', encodeURIComponent(JSON.stringify(childAges)));
                          newQuery.set('rooms', String(rooms));
                          newQuery.set('pets', String(pets));
                          newQuery.set('petCount', String(petCount));
                          window.history.replaceState(null, '', `?${newQuery.toString()}`);
                        }}
                        className="px-6 py-2 bg-[#033266] dark:bg-[#ff6325] text-white rounded-xl font-black text-xs hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 transition-all cursor-pointer shadow-md"
                      >
                        Apply Search
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ============================================================
         * SECTION B: OPTION 1 — 2-SIDES SPLIT HERO (Left: 58% Gallery | Right: 42% Overview & Map)
         * ============================================================ */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* Side 1: Left 58% (lg:col-span-7) — Modern Dynamic Photo Gallery */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-slate-900 flex flex-col justify-between">
            {/* Desktop Dynamic Bento Layout (370px height for optimal proportion) */}
            <div className="hidden md:block h-[370px] p-2.5">
              <div className="grid grid-cols-3 grid-rows-2 gap-2.5 h-full">
                {/* Main Featured Photo (2 cols x 2 rows) */}
                <div
                  onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
                  className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
                >
                  <img
                    src={galleryImages[0]}
                    alt={`${venueName} primary photo`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => { e.currentTarget.src = isFacility ? defaultTurfPhotos[0] : defaultHotelPhotos[0]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                    ✨ Featured Property
                  </div>
                </div>

                {/* 2 Supporting Side Thumbnails */}
                {galleryImages.slice(1, 3).map((imgUrl, idx) => (
                  <div
                    key={idx + 1}
                    onClick={() => { setCurrentImageIdx(idx + 1); setIsGalleryOpen(true); }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-200"
                  >
                    <img
                      src={imgUrl}
                      alt={`${venueName} preview ${idx + 2}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.currentTarget.src = isFacility
                          ? defaultTurfPhotos[(idx + 1) % defaultTurfPhotos.length]
                          : defaultHotelPhotos[(idx + 1) % defaultHotelPhotos.length];
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Carousel View */}
            <div className="md:hidden relative h-60 w-full">
              <img
                src={galleryImages[currentImageIdx] || galleryImages[0]}
                alt={venueName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = isFacility ? defaultTurfPhotos[0] : defaultHotelPhotos[0]; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white border border-white/20 text-xs shadow-md"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white border border-white/20 text-xs shadow-md"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold">
                    {currentImageIdx + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Floating "See All Photos" CTA Badge */}
            <button
              onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}
              className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg border border-slate-200/80 dark:border-white/10 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span>📷</span>
              <span>View All {galleryImages.length} Photos</span>
            </button>
          </div>

          {/* Side 2: Right 42% (lg:col-span-5) — Agoda-Style Combined Property Highlights & Mini Map Card */}
          <div className="lg:col-span-5 rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">

            {/* Property Title & Quick Actions Header */}
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                <div className="min-w-0 flex-1">
                  {isLuxeBlindBooking && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles size={11} className="text-amber-500" />
                      <span>BokSpot Luxe • Confidential Blind Booking</span>
                    </div>
                  )}

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                    {venueName}
                  </h1>

                  {/* Clean, horizontally aligned & compact PG badges bar */}
                  {isPgStay && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[11px] font-black uppercase tracking-wider shadow-2xs ${pgGenderType === 'ladies' ? 'bg-pink-600' : pgGenderType === 'gents' ? 'bg-blue-600' : 'bg-purple-600'
                        }`}>
                        {pgGenderType === 'ladies' ? '🚺 Ladies PG' : pgGenderType === 'gents' ? '🚹 Gents PG' : '👥 Coliving Stay'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-[#ff6325] text-[11px] font-bold">
                        <span>🔒</span> {pgGateCurfew}
                      </span>
                      {pgFoodIncluded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          <span>🍲</span> 3 Meals Included
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                          <span>🍳</span> Self-Cooking
                        </span>
                      )}
                      {pgGenderType === 'ladies' && hasLadyWarden && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/25 text-pink-700 dark:text-pink-300 text-[11px] font-bold">
                          <span>👩‍💼</span> 24/7 Lady Warden
                        </span>
                      )}
                      {pgGenderType === 'ladies' && hasPackedLunchBox && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          <span>🍱</span> Lunch Box Allowed
                        </span>
                      )}
                      {(pgGenderType === 'coliving' || pgGenderType === 'unisex') && hasCoworkingLounge && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                          <span>💻</span> Coworking Lounge
                        </span>
                      )}
                      {(pgGenderType === 'coliving' || pgGenderType === 'unisex') && hasFullPowerBackup && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                          <span>⚡</span> 100% Power Backup
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Share & Save Actions */}
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors text-xs font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1219] shadow-xs cursor-pointer active:scale-95"
                    title="Share property"
                  >
                    <span>🔗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-2 rounded-xl transition-all text-xs font-bold border shadow-xs cursor-pointer active:scale-95 ${isSaved
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-[#0f1219] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    title="Save to favorites"
                  >
                    <Heart size={14} className={isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-400'} />
                  </button>
                </div>
              </div>

              {/* Catchy Bio / Summary Text */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {aboutText || `${venueName} features luxury air-conditioned accommodations, outdoor swimming pools, multi-cuisine dining, and 24/7 dedicated guest assistance along the scenic East Coast corridor.`}
              </p>

              {/* Dedicated High-Trust Card for Women's / Ladies PG Stays */}
              {isPgStay && pgGenderType === 'ladies' && (
                <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-[#ff6325]/10 via-[#033266]/5 to-transparent border border-[#ff6325]/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#ff6325] dark:text-[#ff6325] flex items-center gap-1.5">
                      <span>🌸</span> Verified Women's Safety & Living Comfort
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#033266] text-white">
                      100% Safe Stays
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Lady Warden:</strong> {hasLadyWarden ? '24/7 Resident' : 'Available'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Floor Access:</strong> {zeroMaleFloorAccess ? 'Strictly Zero Male Floor Entry' : 'Restricted'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Visitor Area:</strong> {hasReceptionVisitorLobby ? 'Reception Lobby Waiting Desk' : 'Front Gate'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Parents Lounge:</strong> {hasParentsDaytimeLounge ? 'Daytime Family Lounge (10 AM - 7 PM)' : 'Allowed'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Hygiene:</strong> {hasPeriodEmergencyKit ? 'Pad Dispenser & Period Kit' : 'Daily Housekeeping'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Privacy:</strong> {hasPrivateDryingZone ? 'Covered Cloth Drying Zone' : 'Secure Rooms'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Grooming:</strong> {hasVanityMirrorSocket ? 'Full Mirror & Styling Plug' : 'Wardrobes'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Deliveries:</strong> {hasContactlessParcelHub ? 'Gate Drop Desk (No Strangers Inside)' : 'Safe Access'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dedicated High-Trust Card for Co-Living & Remote Work Stays */}
              {isPgStay && (pgGenderType === 'coliving' || pgGenderType === 'unisex') && (
                <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-[#033266]/5 to-[#ff6325]/10 border border-indigo-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#033266] dark:text-[#ff6325] flex items-center gap-1.5">
                      <span>🏢</span> Verified Co-Living Lifestyle & Remote Work Perks
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff6325] text-white">
                      WFH Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Coworking:</strong> {hasCoworkingLounge ? 'Dedicated Lounge & Desks' : 'Work Desks Available'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>High-Speed Wi-Fi:</strong> {hasHighSpeedDualWifi ? 'Dual Line (300+ Mbps)' : 'High Speed Included'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Power Backup:</strong> {hasFullPowerBackup ? '100% Non-Stop Generator (AC/Wi-Fi)' : 'Inverter Backup'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Gaming Lounge:</strong> {hasGamingLounge ? 'PS5 / TT & Recreation' : 'Available'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Rooftop:</strong> {hasRooftopCafe ? 'Cafe Lounge & Open Deck' : 'Hangout Area'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Kitchen:</strong> {hasModularKitchen ? 'Self-Cooking Modular Pantry' : 'Dining Area'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Fitness:</strong> {hasFitnessGym ? 'In-house Gym & Yoga Deck' : 'Wellness Zone'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                      <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                      <span><strong>Commercial Laundry:</strong> {hasCommercialDryerLaundry ? 'Auto Machines & Heat Dryer' : 'Washing Area'}</span>
                    </div>
                    {hasEvChargingPoint && (
                      <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200 col-span-2">
                        <span className="text-[#ff6325] font-bold shrink-0">✓</span>
                        <span><strong>EV Charging:</strong> Dedicated 16A points for electric 2-wheelers</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>


            {/* Middle: Amenities Grid & Check-in Pill */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block tracking-wider">
                {isFacility ? 'Venue Highlights & Amenities' : 'Property Highlights & Inclusions'}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {(amenities && amenities.length > 0 ? amenities.slice(0, 6) : ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Air Conditioned', '24/7 Front Desk', 'Private Bath', 'Daily Housekeeping']).map((am: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 shadow-2xs">
                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                    <span className="truncate text-[11px]">{am}</span>
                  </div>
                ))}
              </div>

              {/* Timings Bar: Operating Hours for Facility/Turf, Check-in/out for Stays */}
              {isFacility ? (
                <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <span>🕒 Operating Hours:</span>
                    <strong className="font-extrabold">{firstSvc?.metadata?.operatingHours || firstListing?.metadata?.operatingHours || (finalMerchantObj.operatingHours && !finalMerchantObj.operatingHours.includes('Front Desk') ? finalMerchantObj.operatingHours : '06:00 AM – 11:00 PM')}</strong>
                  </span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100">
                    Open Daily
                  </span>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">🕒 Check-in: <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{finalMerchantObj.metadata?.checkInTime || '12:00 PM'}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">Check-out: <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{finalMerchantObj.metadata?.checkOutTime || '11:00 AM'}</strong></span>
                </div>
              )}
            </div>

            {/* Bottom Quick-Action: View on Map */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('property-location-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-extrabold text-[#033266] dark:text-[#ff6325] hover:underline flex items-center gap-1 cursor-pointer py-1"
              >
                <span>📍 View Location on Map</span>
                <span>&darr;</span>
              </button>

              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {isFacility ? 'Slots & Courts listed below ←“' : 'Rooms listed below ←“'}
              </span>
            </div>

          </div>
        </div>

        {/* ============================================================
         * SECTION D4: SPORTS, TURF & COURT HOURLY SLOTS BOOKING (PLAYO STYLE)
         * ============================================================ */}
        {isFacility && (
          <div className="space-y-6 mb-10 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isStudio ? '📸' : category === 'badminton' ? '🏸' : category === 'tennis' ? '🎾' : category === 'cricket-ground' ? '🏏' : category === 'basketball' ? '🏀' : category === 'swimming' ? '🏊' : category === 'play-arena' ? '🧗' : '⚽'}</span>
                  <span>{isStudio ? 'Select Studio Floor & Hourly Slot' : 'Select Time Slot & Unit'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isStudio
                    ? 'Lease creative studio floors, acoustic setups & cyclorama walls by the hour. Instant reservation hold.'
                    : 'Book 1-hour slots. Instant 5-minute temporary reservation hold upon selection.'}
                </p>
              </div>

              {/* Slot Hold Timer */}
              {selectedHourSlot && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-xs font-bold animate-pulse">
                  <Clock size={14} />
                  <span>Slot Held: 04:59 mins remaining</span>
                </div>
              )}
            </div>

            {/* Mandatory Venue Rule Pill Banner */}
            {(() => {
              const rule = firstListing?.metadata?.mandatoryRule || firstSvc?.metadata?.mandatoryRule || getSportCategoryConfig(category)?.mandatoryRule;
              if (!rule) return null;
              return (
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200">
                  <span className="text-2xl shrink-0">{rule.icon || '⚠️'}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-black block tracking-tight">{rule.title}</span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed block mt-0.5">
                      {rule.desc}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Available Courts / Pitches Selector */}
            {(() => {
              const allAvailablePitches: any[] = [];
              liveServices.forEach((svc: any) => {
                const svcListings = svc.metadata?.listings || svc.rawConfig?.metadata?.listings || [];
                if (svcListings.length > 0) {
                  svcListings.forEach((lst: any) => {
                    allAvailablePitches.push({
                      id: lst.id || svc.id,
                      name: lst.name || svc.name,
                      price: lst.price || svc.price || svc.basePrice || 1350,
                      description: lst.description || svc.description,
                      parentService: svc,
                      rawListing: lst
                    });
                  });
                } else if (svc.name && svc.name !== '__BOKSPOT_GROUP__') {
                  allAvailablePitches.push({
                    id: svc.id,
                    name: svc.name,
                    price: svc.price || svc.basePrice || 1350,
                    description: svc.description,
                    parentService: svc
                  });
                }
              });

              if (allAvailablePitches.length === 0) return null;

              const activePitchId = selectedTurfService?.id || allAvailablePitches[0].id;
              const activePitch = allAvailablePitches.find(p => p.id === activePitchId) || allAvailablePitches[0];
              const activeListing = activePitch.rawListing || activePitch.parentService || {};
              const activeMeta = activeListing.metadata || activePitch.parentService?.metadata || {};

              const unitSelectionLabel = isStudio
                ? 'Choose Studio Floor / Creative Bay'
                : category === 'badminton'
                  ? 'Choose Badminton Court'
                  : category === 'tennis'
                    ? 'Choose Tennis Court'
                    : category === 'basketball'
                      ? 'Choose Basketball Court'
                      : category === 'swimming'
                        ? 'Choose Pool Lane / Leisure Zone'
                        : category === 'play-arena'
                          ? 'Choose Jump Zone / Session Unit'
                          : category === 'cricket-ground'
                            ? 'Choose Pitch / Net Unit'
                            : 'Choose Court / Pitch Unit';

              return (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      {unitSelectionLabel}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {allAvailablePitches.map((pitch) => {
                        const isPitchSelected = activePitchId === pitch.id;
                        return (
                          <div
                            key={pitch.id}
                            onClick={() => {
                              setSelectedTurfService({
                                ...(pitch.parentService || liveServices[0]),
                                id: pitch.id,
                                name: pitch.name,
                                price: pitch.price,
                                rawListing: pitch.rawListing
                              });
                              setSelectedHourSlot(null);
                              setPricingResult(null);
                            }}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${isPitchSelected
                              ? 'bg-gradient-to-br from-[#033266]/10 to-[#ff6325]/10 border-[#ff6325] ring-2 ring-[#ff6325]/20 shadow-sm'
                              : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                                {pitch.name}
                              </span>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-[#ff6325] block">
                                  ₹{pitch.price}/hr
                                </span>
                                {pitch.rawListing?.originalPrice && pitch.rawListing.originalPrice > pitch.price && (
                                  <span className="text-[10px] text-slate-400 line-through block">
                                    ₹{pitch.rawListing.originalPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-1">
                              {pitch.description ? (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {pitch.description}
                                </p>
                              ) : <span />}
                              {(pitch.rawListing?.offerBadge || pitch.rawListing?.metadata?.offerBadge) && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                  {pitch.rawListing.offerBadge || pitch.rawListing.metadata?.offerBadge}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Playo-Style Court Profile Card */}
                  <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-5">

                    {/* Top Row: Pitch Cover, Title, Crown Badge, Description & Big Price Box */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={(Array.isArray(activeListing.images) && activeListing.images[0]) || activeListing.imageUrl || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80'}
                          alt={activePitch.name}
                          className="h-20 w-24 sm:h-24 sm:w-32 object-cover rounded-2xl border border-slate-200 dark:border-white/10 shrink-0 shadow-xs"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <span>👑</span> Best Value
                            </span>
                            {activeListing.discountPercentage && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                {activeListing.discountPercentage}% OFF
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                            {activePitch.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">
                            {activePitch.description || 'FIFA Certified 50mm monofilament turf with rubber granules infill. Equipped with high-mast LED floodlights for night play.'}
                          </p>
                        </div>
                      </div>

                      {/* Right Big Price Box */}
                      <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center p-3 sm:p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 shrink-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-[#033266] dark:text-[#ff6325]">
                            ₹{activePitch.price}
                          </span>
                          {((activeListing.originalPrice && activeListing.originalPrice > activePitch.price) || (activeMeta.originalPrice && activeMeta.originalPrice > activePitch.price)) && (
                            <span className="text-sm font-bold text-slate-400 line-through">
                              ₹{activeListing.originalPrice || activeMeta.originalPrice}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/hr</span>
                        </div>
                        {(activeListing.discountPercentage || activeMeta.discountPercentage) && (
                          <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">
                            Save {activeListing.discountPercentage || activeMeta.discountPercentage}% OFF
                          </span>
                        )}
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/40 mt-1 flex items-center gap-1">
                          <span>☀️</span> {activeListing.offerBadge || activeMeta.offerBadge || 'Prime Evening Slot'}
                        </span>
                      </div>
                    </div>

                    {/* 4-Pill Specs Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                          🥅
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Dimensions & Size</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                            {activeMeta.turfSize || '100ft x 65ft (7-a-side)'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                          ⚽
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pitch Surface</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block" title={activeMeta.surfaceType || 'FIFA 50mm AstroTurf'}>
                            {activeMeta.surfaceType || 'FIFA 50mm Monofilament'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                          💡
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Floodlights</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                            {activeMeta.floodlightsSurcharge ? `₹${activeMeta.floodlightsSurcharge}/hr (Night)` : 'Included in Night Play'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                          🛡️
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">On-site Official</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block" title={activeMeta.refereeOrManager || 'Ground Supervisor (KFA Certified)'}>
                            {activeMeta.refereeOrManager || 'Ground Supervisor'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Green Included Playing Gear / Studio Gear Banner */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                          {isStudio ? '💡' : '⚽'}
                        </div>
                        <div>
                          <span className="text-xs font-black block">{isStudio ? 'Included Studio Inclusions & Equipment' : 'Included Playing Gear'}</span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                            {activeMeta.equipmentAddons || (isStudio ? 'Continuous 150W Softbox Lighting, Backdrop Stand, High-Speed Wi-Fi, Full AC & Makeup Vanity Mirror' : '2 Match Balls (Size 5), 14 Team Bibs (Neon Green & Orange), Goalkeeper Gloves')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">›</span>
                    </div>

                    {/* Court Photos Gallery Section */}
                    {(() => {
                      const courtImages = (Array.isArray(activeListing.images) && activeListing.images.length > 0)
                        ? activeListing.images
                        : [
                          'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80',
                          'https://images.unsplash.com/photo-1574629810360-7efbb49fec90?w=1200&q=80',
                          'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80'
                        ];

                      return (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="text-sm">📷</span> Court Photos ({courtImages.length})
                            </span>
                            <span className="text-xs font-bold text-[#033266] dark:text-[#ff6325] hover:underline cursor-pointer">
                              View all ›
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative group">
                              <img
                                src={courtImages[0]}
                                alt={`${activePitch.name} wide`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <div className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative group">
                              <img
                                src={courtImages[1] || courtImages[0]}
                                alt={`${activePitch.name} pitch`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {courtImages.length > 2 && (
                                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-black shadow-lg">
                                  +{courtImages.length - 2} More
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              );
            })()}

            {/* Date Quick Selector */}
            {(() => {
              const currentListing = selectedTurfService?.rawListing ||
                liveServices[0]?.metadata?.listings?.[0] ||
                liveServices[0]?.rawConfig?.metadata?.listings?.[0];

              const publishedSchedule: Array<{ dayOfWeek?: string; specificDate?: string; startTime: string; endTime: string; price: number }> =
                currentListing?.schedule || currentListing?.metadata?.schedule || selectedTurfService?.schedule || [];

              return (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const ds = d.toISOString().split('T')[0];
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                    const isSelected = selectedDate === ds;
                    const daySlotCount = publishedSchedule.length > 0
                      ? publishedSchedule.filter((s: any) => {
                        if (s.specificDate) {
                          return s.specificDate === ds;
                        }
                        return s.dayOfWeek?.toLowerCase() === dayName.toLowerCase();
                      }).length
                      : 16; // Standard 16 operational slots (06:00 AM - 10:00 PM)

                    return (
                      <button
                        key={ds}
                        type="button"
                        onClick={() => {
                          setSelectedDate(ds);
                          setSelectedHourSlot(null);
                          setPricingResult(null);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex flex-col items-center min-w-[76px] transition-all cursor-pointer border relative ${isSelected
                          ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325]'
                          }`}
                      >
                        <span className="text-[10px] uppercase font-bold opacity-80">
                          {offset === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-black mt-0.5">
                          {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        {daySlotCount > 0 && (
                          <span className={`text-[9px] font-black mt-1 px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                            {daySlotCount} slots
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Slot Grid - Purely driven by Business Published Schedule with Smart Fallback */}
            {(() => {
              // Extract selected date day of week (e.g. 'Monday', 'Tuesday'...)
              const targetDayOfWeek = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });

              // Find active listing or service
              const currentListing = selectedTurfService?.rawListing ||
                liveServices[0]?.metadata?.listings?.[0] ||
                liveServices[0]?.rawConfig?.metadata?.listings?.[0];

              const publishedSchedule: Array<{ dayOfWeek?: string; specificDate?: string; startTime: string; endTime: string; price: number }> =
                currentListing?.schedule || currentListing?.metadata?.schedule || selectedTurfService?.schedule || [];

              // Priority 1: Specific Date match (e.g. 2026-10-28)
              // Priority 2: Recurring day of week match
              const dateSpecificSlots = publishedSchedule.filter(s => s.specificDate === selectedDate);
              const hasVendorSchedule = publishedSchedule.length > 0;
              let daySlots = (dateSpecificSlots.length > 0
                ? dateSpecificSlots
                : publishedSchedule.filter(s => !s.specificDate && s.dayOfWeek?.toLowerCase() === targetDayOfWeek.toLowerCase())
              ).sort((a, b) => a.startTime.localeCompare(b.startTime));

              const baseTariff = Number(currentListing?.price) || Number(selectedTurfService?.price) || 1200;

              // If merchant has NOT published custom schedule, generate dynamic 0.5 hr / 1 hr / 2 hr slots based on selected duration
              if (!hasVendorSchedule || daySlots.length === 0) {
                const generatedSlots: Array<{ startTime: string; endTime: string; price: number }> = [];
                // 06:00 (6.0) to 23:00 (23.0)
                const startHour = 6;
                const endHour = 23;
                const dur = sportsDurationHours || 1;
                const step = dur === 0.5 ? 0.5 : (dur >= 2 ? 1 : 1);

                for (let h = startHour; h + dur <= endHour; h += step) {
                  const formatTime = (timeVal: number) => {
                    const hr = Math.floor(timeVal);
                    const min = Math.round((timeVal - hr) * 60);
                    const period = hr >= 12 ? 'PM' : 'AM';
                    const displayHr = hr % 12 === 0 ? 12 : hr % 12;
                    return `${String(displayHr).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
                  };
                  const startTimeStr = formatTime(h);
                  const endTimeStr = formatTime(h + dur);
                  // Pricing multiplier based on duration & prime evening peak
                  const isPeak = h >= 17 && h < 22;
                  const peakMultiplier = isPeak ? 1.15 : (h >= 12 && h < 16 ? 0.9 : 1.0);
                  const slotCost = Math.round(baseTariff * dur * peakMultiplier);
                  generatedSlots.push({
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    price: slotCost
                  });
                }
                daySlots = generatedSlots;
              }

              return (
                <div className="space-y-4 pt-2">
                  {/* District / Playo Style Duration Selector Bar (- / + / Quick Pills) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold">
                        <Clock size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          Game Duration
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {hasVendorSchedule ? 'Business published custom slots' : 'Choose play hours (0.5 hr, 1 hr, 2 hrs+)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Interactive - / + Duration Controller */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            const newDur = Math.max(0.5, (sportsDurationHours || 1) - 0.5);
                            setSportsDurationHours(newDur);
                            setSelectedHourSlot(null);
                            setPricingResult(null);
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer shadow-xs transition-transform active:scale-95"
                          title="Decrease duration"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 text-xs font-black text-slate-900 dark:text-white min-w-[55px] text-center">
                          {sportsDurationHours} Hr{sportsDurationHours > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newDur = Math.min(4, (sportsDurationHours || 1) + 0.5);
                            setSportsDurationHours(newDur);
                            setSelectedHourSlot(null);
                            setPricingResult(null);
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer shadow-xs transition-transform active:scale-95"
                          title="Increase duration"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ⚡ Available Slots for {targetDayOfWeek} ({daySlots.length} Slots • {sportsDurationHours} Hr Duration)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {daySlots.map((slot, sIdx) => {
                      const timeLabel = `${slot.startTime} - ${slot.endTime}`;
                      const isSelected = selectedHourSlot === timeLabel;
                      const slotPrice = Number(slot.price) || Math.round(baseTariff * (sportsDurationHours || 1));

                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={async () => {
                            setSelectedHourSlot(timeLabel);
                            const currentSvc = selectedTurfService || liveServices[0] || {};
                            if (!selectedTurfService) setSelectedTurfService(currentSvc);
                            setIsPricingCalculating(true);
                            const calc = await api.services.calculatePricing({
                              archetype: 'FacilityHourly',
                              basePrice: slotPrice,
                              durationHours: sportsDurationHours || 1,
                              isNightPeak: false,
                              quantity: 1
                            });
                            setPricingResult({
                              ...calc,
                              finalPayable: slotPrice,
                              breakdownSummary: `₹${slotPrice} / slot (${sportsDurationHours}h)`
                            });
                            setIsPricingCalculating(false);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                            ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md scale-102'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325] text-slate-900 dark:text-white'
                            }`}
                        >
                          <span className="text-xs font-black block">{slot.startTime}</span>
                          <span className="text-[10px] opacity-75 font-semibold mt-0.5 block">to {slot.endTime}</span>
                          <span className={`text-[10px] font-black mt-1 block ${isSelected ? 'text-white' : 'text-[#ff6325] dark:text-amber-400'}`}>
                            ₹{slotPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Live Pricing Engine Result Card */}
            {selectedHourSlot && pricingResult && (() => {
              const baseSlotCost = Number(pricingResult.finalPayable) || 1350;
              // Sum any selected addons
              const activeListingObj = selectedTurfService?.rawListing || liveServices[0]?.metadata?.listings?.[0] || {};
              const activeMetaObj = activeListingObj.metadata || {};
              const sportFallbackCfg = getSportCategoryConfig(category);
              const defaultAddonsList = sportFallbackCfg?.addons || [
                { id: 'referee', name: 'Certified Match Referee', price: 300, icon: '👨‍⚖️', desc: 'Official qualified referee for 60 mins match management & fair play.' },
                { id: 'video', name: 'High-Res Match Video Recording', price: 500, icon: '📹', desc: 'Full match recording delivered via HD cloud link within 24 hours.' },
                { id: 'drinks', name: 'Chilled Energy Drinks (Pack of 6)', price: 250, icon: '🧴', desc: 'Ice-chilled electrolyte sports beverages ready at bench.' }
              ];
              const availableAddons = (Array.isArray(activeMetaObj.addons) && activeMetaObj.addons.length > 0)
                ? activeMetaObj.addons
                : defaultAddonsList;

              const addonsTotal = selectedTurfAddons.reduce((sum, addName) => {
                const found = availableAddons.find((a: any) => a.name === addName);
                return sum + (found ? Number(found.price) : 0);
              }, 0);

              const grandTotal = baseSlotCost + addonsTotal;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#033266] to-[#0c4a85] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-sm font-black text-white">
                        {category === 'badminton' ? '🏸' : category === 'tennis' ? '🎾' : category === 'cricket-ground' ? '🏏' : category === 'basketball' ? '🏀' : category === 'swimming' ? '🏊' : category === 'play-arena' ? '🧗' : '⚽'} {selectedTurfService?.name || 'Unit Slot'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        Slot Reserved (5m hold)
                      </span>
                    </div>
                    <span className="text-xs text-blue-100 block font-medium">
                      📅 {selectedDate} • ⏰ {selectedHourSlot}
                      {selectedTurfAddons.length > 0 && ` • ${selectedTurfAddons.length} Add-on(s) (+₹${addonsTotal})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-blue-200 block">Total Payable</span>
                      <span className="text-2xl font-black text-amber-400">
                        ₹{grandTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsTurfAddonModalOpen(true);
                      }}
                      className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-2"
                    >
                      <span>⚡</span> Continue &rarr;
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}



        {/* ============================================================
         * SECTION D3: DYNAMIC ACCOMMODATION CATEGORIES (TOP BOOKING PRIORITY)
         * ============================================================ */}
        {isHotel && (
          <div id="available-rooms-section" className="space-y-6 mb-10">
            {(() => {
              const catTitleMap: Record<string, { title: string; subtitle: string; unitName: string }> = {
                villas: {
                  title: 'Select Your Villa',
                  subtitle: 'Choose your preferred villa unit and proceed to booking.',
                  unitName: 'Villa'
                },
                resorts: {
                  title: 'Select Your Room',
                  subtitle: 'Choose your room type and proceed to booking.',
                  unitName: 'Option'
                },
                hostels: {
                  title: 'Select Your Dorm',
                  subtitle: 'Choose your dorm or bed type and proceed to booking.',
                  unitName: 'Dorm Type'
                },
                'pg-hostels': {
                  title: 'Select Your Dorm',
                  subtitle: 'Choose your dorm or bed type and proceed to booking.',
                  unitName: 'Dorm Type'
                },
                camping: {
                  title: 'Select Your Tent',
                  subtitle: 'Choose your camping setup and proceed to booking.',
                  unitName: 'Tent Type'
                },
                hotels: {
                  title: 'Select Your Room',
                  subtitle: 'Choose your room type and proceed to booking.',
                  unitName: 'Room Type'
                }
              };

              const dynamicHeading = catTitleMap[category] || {
                title: isPgStay ? 'Select Your Dorm' : 'Select Your Room',
                subtitle: isPgStay ? 'Choose your dorm or bed type and proceed to booking.' : 'Choose your stay option and proceed directly to booking.',
                unitName: isPgStay ? 'Dorm Type' : 'Room Type'
              };

              return (
                <div className="space-y-4 border-b border-slate-200 dark:border-white/10 pb-4">
                  {/* High-Visibility Bag Locker (Luggage Drop) Transit Strip for Travelers across all 54 categories */}
                  {isHotelLuggageEnabled && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 border border-amber-500/30 p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl shrink-0 shadow-sm font-black">
                          🧳
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              Arriving Early or Departing Late?
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                              Instant Cloakroom
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            Drop your heavy bags at the frontdesk before 12 PM check-in and explore freely. Starting at just <span className="font-extrabold text-amber-600 dark:text-amber-400">₹49/bag/hr</span>.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubNavTab('mini-space');
                          setTimeout(() => {
                            const el = document.getElementById('agoda-overview-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="self-stretch sm:self-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Book Luggage Drop</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {dynamicHeading.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {dynamicHeading.subtitle}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] rounded-full border border-[#033266]/20 dark:border-[#ff6325]/30 self-start sm:self-auto">
                      {(() => {
                        const seen = new Set<string>();
                        liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').forEach((svc: any) => {
                          const listings = svc.metadata?.listings || svc.rawConfig?.metadata?.listings || [];
                          if (listings.length > 0) {
                            listings.forEach((l: any) => {
                              const name = (l.name || svc.name || '').trim().toLowerCase();
                              if (name) seen.add(name);
                            });
                          } else {
                            const name = (svc.name || '').trim().toLowerCase();
                            if (name) seen.add(name);
                          }
                        });
                        const total = seen.size > 0 ? seen.size : 1;
                        return `${total} ${dynamicHeading.unitName}${total !== 1 ? 's' : ''} Available`;
                      })()}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Rooms List */}
            <div className="space-y-4">
              {(() => {
                const nonGroupServices = liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__');
                const roomItems: any[] = [];

                nonGroupServices.forEach((svc: any, sIdx: number) => {
                  const listings = svc.metadata?.listings || svc.rawConfig?.metadata?.listings || [];
                  if (listings.length > 0) {
                    listings.forEach((l: any, lIdx: number) => {
                      const lMeta = l.metadata || {};
                      const lPrice = Number(l.basePrice || l.price || svc.basePrice || svc.price) || 2200;
                      const lName = l.name || svc.name;
                      const lDesc = l.description || svc.description || 'Spacious and welcoming accommodation with comfortable bedding, clean linens, and private ensuite bathroom.';
                      const rawThumb = l.imageUrl || l.image || lMeta.gallery?.[0] || l.images?.[0] || svc.imageUrl || svc.image;
                      const thumb = (rawThumb && !rawThumb.includes('screenshot') && !rawThumb.startsWith('blob:'))
                        ? rawThumb
                        : defaultHotelPhotos[(sIdx + lIdx) % defaultHotelPhotos.length];

                      roomItems.push({
                        id: l.id || `${svc.id}-${lIdx}`,
                        parentService: svc,
                        listing: l,
                        name: lName,
                        description: lDesc,
                        price: lPrice,
                        thumb,
                        maxGuests: l.maxGuests || lMeta.maxGuests || 2,
                        bedType: l.bedType || lMeta.bedType,
                        roomSize: l.sizeSqFt || lMeta.sizeSqFt || lMeta.roomSize,
                        bathroomType: l.bathroomType || lMeta.bathroomType,
                        perks: Array.isArray(l.perks) ? l.perks : (Array.isArray(lMeta.perks) ? lMeta.perks : (lMeta.perks ? [lMeta.perks] : [])),
                        roomAmenities: Array.isArray(l.amenities) ? l.amenities : (Array.isArray(lMeta.amenities) ? lMeta.amenities : []),
                        addons: l.addons || lMeta.addons || svc.metadata?.addons || svc.addOns || [],
                        gallery: (l.images && l.images.length > 0) ? l.images : (lMeta.gallery || [thumb])
                      });
                    });
                  } else {
                    // Fallback for services without nested listings array
                    const primaryMeta = svc.metadata || {};
                    const sPrice = Number(svc.price || svc.basePrice) || 2200;
                    const rawThumb = svc.imageUrl || svc.image;
                    const thumb = (rawThumb && !rawThumb.includes('screenshot') && !rawThumb.startsWith('blob:'))
                      ? rawThumb
                      : defaultHotelPhotos[sIdx % defaultHotelPhotos.length];

                    roomItems.push({
                      id: svc.id,
                      parentService: svc,
                      listing: null,
                      name: svc.name,
                      description: svc.description || 'Spacious and welcoming accommodation with comfortable bedding, clean linens, and private ensuite bathroom.',
                      price: sPrice,
                      thumb,
                      maxGuests: primaryMeta.maxGuests || 2,
                      bedType: primaryMeta.bedType,
                      roomSize: primaryMeta.sizeSqFt || primaryMeta.roomSize,
                      bathroomType: primaryMeta.bathroomType,
                      perks: Array.isArray(primaryMeta.perks) ? primaryMeta.perks : (primaryMeta.perks ? [primaryMeta.perks] : []),
                      roomAmenities: Array.isArray(primaryMeta.amenities) ? primaryMeta.amenities : [],
                      addons: svc.metadata?.addons || svc.addOns || [],
                      gallery: svc.images || [thumb]
                    });
                  }
                });

                // Deduplicate roomItems strictly by normalized room name & price
                const seenRoomNames = new Set<string>();
                const uniqueRoomItems = roomItems.filter((item) => {
                  const normalizedName = (item.name || '').trim().toLowerCase();
                  if (!normalizedName) return true;
                  if (seenRoomNames.has(normalizedName)) {
                    return false;
                  }
                  seenRoomNames.add(normalizedName);
                  return true;
                });

                if (uniqueRoomItems.length === 0) {
                  return (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center bg-white dark:bg-[#0f1219] shadow-xs">
                      No specific rooms have been listed by the property yet.
                    </p>
                  );
                }

                return uniqueRoomItems.map((roomItem, rIdx) => {
                  const totalUnitsConfig = Number(roomItem.listing?.metadata?.totalUnits ?? (roomItem.listing as any)?.totalUnits ?? (roomItem.parentService?.metadata?.totalUnits ?? (rIdx === 2 ? 0 : rIdx === 1 ? 1 : 4)));
                  const isSoldOut = totalUnitsConfig <= 0 || (isPgStay && (roomItem.listing?.metadata?.isSoldOut === true || (roomItem.name && roomItem.name.toLowerCase().includes('sold out'))));
                  const isLowAvailability = !isSoldOut && totalUnitsConfig <= 2;
                  const startingPrice = roomItem.price;
                  const stayTotal = startingPrice * nights * rooms;
                  const maxGuests = roomItem.maxGuests;
                  const bedType = roomItem.bedType;
                  const roomSize = roomItem.roomSize;
                  const bathroomType = roomItem.bathroomType;
                  const perks = roomItem.perks;
                  const roomAmenities = roomItem.roomAmenities;
                  const thumb = roomItem.thumb;
                  const isNonAc = roomItem.name?.toLowerCase().includes('non ac') || roomItem.name?.toLowerCase().includes('non-ac');

                  const servicePayloadForModal = {
                    ...roomItem.parentService,
                    id: roomItem.parentService.id,
                    selectedListingId: roomItem.id,
                    selectedListing: roomItem.listing,
                    name: roomItem.name,
                    description: roomItem.description,
                    price: roomItem.price,
                    basePrice: roomItem.price,
                    imageUrl: thumb,
                    images: roomItem.gallery,
                    metadata: {
                      ...(roomItem.parentService.metadata || {}),
                      ...(roomItem.listing?.metadata || {}),
                      gallery: roomItem.gallery,
                      addons: roomItem.addons,
                      maxGuests,
                      bedType,
                      sizeSqFt: roomSize,
                      bathroomType,
                      perks,
                      amenities: roomAmenities,
                      listings: roomItem.listing ? [roomItem.listing] : (roomItem.parentService.metadata?.listings || [])
                    }
                  };

                  const listingMeta = roomItem.listing?.metadata || {};
                  const merchantOriginalPrice = Number(listingMeta.originalPrice ?? (roomItem.listing as any)?.originalPrice ?? 0);
                  const merchantDiscountPct = Number(listingMeta.discountPercentage ?? (roomItem.listing as any)?.discountPercentage ?? 0);
                  const offerBadgeText = listingMeta.offerBadge || (roomItem.listing as any)?.offerBadge || '';
                  const merchantBannerTagline = listingMeta.bannerTagline || (roomItem.listing as any)?.bannerTagline || '';

                  // Dynamic original price & discount calculation:
                  // 1) If merchant gave explicit discount % (e.g. 10%), use that directly!
                  // 2) If merchant gave original price > selling price, calculate %
                  // 3) Default 20% standard offer display
                  let discountPct = merchantDiscountPct > 0 ? merchantDiscountPct : 20;
                  let originalPrice = merchantOriginalPrice > startingPrice
                    ? merchantOriginalPrice
                    : Math.round(startingPrice / (1 - (discountPct / 100)));

                  if (merchantDiscountPct > 0) {
                    discountPct = merchantDiscountPct;
                    originalPrice = merchantOriginalPrice > startingPrice
                      ? merchantOriginalPrice
                      : Math.round(startingPrice / (1 - merchantDiscountPct / 100));
                  } else if (merchantOriginalPrice > startingPrice) {
                    originalPrice = merchantOriginalPrice;
                    discountPct = Math.round(((merchantOriginalPrice - startingPrice) / merchantOriginalPrice) * 100);
                  }

                  const roomGallery = (roomItem.gallery && roomItem.gallery.length > 0) ? roomItem.gallery : [thumb];
                  const totalReviews = 120 + ((rIdx * 17) % 45);
                  const roomRating = (4.7 + ((rIdx * 0.1) % 0.3)).toFixed(1);

                  return (
                    <div
                      key={`room-card-${roomItem.id || 'item'}-${rIdx}`}
                      className="bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                        {/* ==============================================================
                         * COLUMN 1: LEFT (lg:col-span-4) - Image Carousel + Thumbnails + Title/Bio
                         * ============================================================== */}
                        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Main Room Image with badges & navigation */}
                            <div
                              onClick={() => {
                                setActiveRoomService(servicePayloadForModal);
                                setRoomModalStep('DETAILS');
                                setSelectedAddonIds([]);
                                setRoomModalImageIdx(0);
                              }}
                              className="h-56 sm:h-64 rounded-2xl overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800"
                            >
                              <img
                                src={thumb}
                                alt={roomItem.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                              />
                              {/* Remaining Units / Sold Out Badge */}
                              {isSoldOut ? (
                                <div className="absolute top-3 left-3 bg-rose-600/95 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-black text-white flex items-center gap-1.5 shadow-md">
                                  <span>🚫</span>
                                  <span>SOLD OUT</span>
                                </div>
                              ) : isLowAvailability ? (
                                <div className="absolute top-3 left-3 bg-amber-500/95 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-black text-slate-950 flex items-center gap-1.5 shadow-md animate-pulse">
                                  <span>🔥</span>
                                  <span>ONLY {totalUnitsConfig} {isPgStay ? 'BED' : 'UNIT'}{totalUnitsConfig > 1 ? 'S' : ''} LEFT</span>
                                </div>
                              ) : (
                                <div className="absolute top-3 left-3 bg-[#033266]/90 dark:bg-[#ff6325]/90 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-black text-white flex items-center gap-1.5 shadow-md">
                                  <Users size={12} />
                                  <span>{totalUnitsConfig} {isPgStay ? 'BEDS' : 'UNITS'} AVAILABLE</span>
                                </div>
                              )}

                              {/* See Photos Pill Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveRoomService(servicePayloadForModal);
                                  setRoomModalStep('DETAILS');
                                  setSelectedAddonIds([]);
                                  setRoomModalImageIdx(0);
                                }}
                                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <span>📷</span>
                                <span>See Photos ({roomGallery.length})</span>
                              </button>

                              {/* Dot Indicators */}
                              {roomGallery.length > 1 && (
                                <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                                  {roomGallery.slice(0, 5).map((_: string, dotIdx: number) => (
                                    <span
                                      key={dotIdx}
                                      className={`w-1.5 h-1.5 rounded-full ${dotIdx === 0 ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Thumbnail Row */}
                            {roomGallery.length > 1 && (
                              <div className="grid grid-cols-5 gap-2 mt-2.5">
                                {roomGallery.slice(0, 5).map((imgUrl: string, tIdx: number) => (
                                  <div
                                    key={tIdx}
                                    onClick={() => {
                                      setActiveRoomService(servicePayloadForModal);
                                      setRoomModalStep('DETAILS');
                                      setSelectedAddonIds([]);
                                      setRoomModalImageIdx(tIdx);
                                    }}
                                    className={`h-12 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${tIdx === 0
                                      ? 'border-[#033266] dark:border-[#ff6325]'
                                      : 'border-transparent opacity-75 hover:opacity-100'
                                      }`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Room Title & Reviews */}
                            <div className="mt-4">
                              <h3
                                onClick={() => {
                                  setActiveRoomService(servicePayloadForModal);
                                  setRoomModalStep('DETAILS');
                                  setSelectedAddonIds([]);
                                  setRoomModalImageIdx(0);
                                }}
                                className="font-black text-xl text-slate-900 dark:text-white hover:text-[#033266] dark:hover:text-[#ff6325] cursor-pointer transition-colors tracking-tight"
                              >
                                {roomItem.name}
                              </h3>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-xs">
                                  ★ {roomRating}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  ({totalReviews} Reviews)
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                {roomItem.description || `${roomItem.name} featuring premium bedding, spacious ensuite bathroom, and modern guest amenities for a comfortable stay.`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ==============================================================
                         * COLUMN 2: MIDDLE (lg:col-span-5) - Inclusions, Perks & Specs Grid
                         * ============================================================== */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Instant Confirmation Pill */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/50 mb-3">
                              <CheckCircle2 size={13} className="shrink-0" />
                              <span>Instant Confirmation</span>
                            </div>

                            {/* Inclusions List with Green Checkmarks */}
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                <CheckCircle2 size={13} className="shrink-0" />
                                <span>{isPgStay ? '3 Hygienic Homely Meals Included (Breakfast, Lunch, Dinner)' : 'Free Cancellation (up to 24h before check-in)'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                <CheckCircle2 size={13} className="shrink-0" />
                                <span>{isPgStay ? 'Free High-Speed Wi-Fi & Washing Machine Access' : 'Free High-Speed Wi-Fi in unit'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                <CheckCircle2 size={13} className="shrink-0" />
                                <span>{isPgStay ? 'Daily Housekeeping & 24/7 RO Purified Water' : 'Complimentary Bottled Water & Clean Linens'}</span>
                              </div>
                            </div>

                            {/* 2-Column Specs Grid (Light Blue / Clean Slate Box) */}
                            <div className="grid grid-cols-2 gap-3.5 p-4 mt-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-xs">
                              {/* Left specs: Perks & Highlights */}
                              <div className="space-y-2.5">
                                {perks.length > 0 ? (
                                  perks.slice(0, 4).map((perk: string, pIdx: number) => {
                                    const cleanPerk = (perk || '')
                                      .replace(/([a-z])([A-Z])/g, '$1 $2')
                                      .replace(/luandry/i, 'Laundry Service')
                                      .replace(/foodfaciiity|foodfacility|food\s*facility/i, 'Food Facility / Mess')
                                      .replace(/Freelaunch/i, 'Free Lunch')
                                      .replace(/freedinner/i, 'Free Dinner')
                                      .replace(/Freewifi/i, 'Free Wi-Fi')
                                      .replace(/smarttv/i, 'Smart TV')
                                      .replace(/balconyview/i, 'Balcony View')
                                      .replace(/oceanview/i, 'Ocean View')
                                      .replace(/seaview/i, 'Sea View')
                                      .replace(/swimmingpool/i, 'Swimming Pool')
                                      .replace(/ComplimentorbuffetBreakfast/i, 'Buffet Breakfast')
                                      .trim();
                                    const formattedPerk = cleanPerk.charAt(0).toUpperCase() + cleanPerk.slice(1);
                                    return (
                                      <div key={pIdx} className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                        <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">✨</span>
                                        <span className="leading-snug">{formattedPerk}</span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🏊</span>
                                      <span className="leading-snug">Private Plunge Pool</span>
                                    </div>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🌅</span>
                                      <span className="leading-snug">Sunset Deck View</span>
                                    </div>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🍳</span>
                                      <span className="leading-snug">Floating Breakfast</span>
                                    </div>
                                    <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                      <span className="text-[#033266] dark:text-[#ff6325] text-sm shrink-0 mt-0.5">🛎️</span>
                                      <span className="leading-snug">24/7 Butler Support</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Right specs: Capacity, Bed, Size, Bath, AC */}
                              <div className="space-y-2.5">
                                <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                  <Users size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0 mt-0.5" />
                                  <span className="leading-snug">{typeof maxGuests === 'string' && maxGuests.toLowerCase().includes('guest') ? maxGuests : `Max ${maxGuests} Guests`}</span>
                                </div>
                                {bedType && (
                                  <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                    <Bed size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0 mt-0.5" />
                                    <span className="leading-snug">{bedType}</span>
                                  </div>
                                )}
                                {roomSize && (
                                  <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                    <span className="text-xs shrink-0 mt-0.5">📐</span>
                                    <span className="leading-snug">{roomSize} sq.ft / {(Number(roomSize) * 0.0929).toFixed(0)} m²</span>
                                  </div>
                                )}
                                {bathroomType && (
                                  <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                    <span className="text-xs shrink-0 mt-0.5">🚿</span>
                                    <span className="leading-snug">{bathroomType} Ensuite</span>
                                  </div>
                                )}
                                <div className="flex items-start gap-2 font-bold text-slate-800 dark:text-slate-200">
                                  <span className="shrink-0 mt-0.5">{isNonAc ? '💨' : '❄️'}</span>
                                  <span className="leading-snug">{isNonAc ? 'Non-AC / Fan' : 'Air Conditioned'}</span>
                                </div>
                              </div>
                            </div>

                            {/* See room specs trigger link */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRoomService(servicePayloadForModal);
                                setRoomModalStep('DETAILS');
                                setSelectedAddonIds([]);
                                setRoomModalImageIdx(0);
                              }}
                              className="text-xs font-bold text-[#033266] dark:text-[#ff6325] hover:underline cursor-pointer inline-flex items-center gap-1 mt-3"
                            >
                              <span>See room specs, meals & policies &rarr;</span>
                            </button>
                          </div>

                          {/* 3 Trust Badges Footer: Secure Booking, 24/7 Guest Support, Best Price */}
                          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-[10px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                              <ShieldCheck size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span className="leading-tight">100% Secure Booking</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                              <Headphones size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span className="leading-tight">24/7 Guest Support</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                              <Award size={14} className="text-[#033266] dark:text-[#ff6325] shrink-0" />
                              <span className="leading-tight">Best Price Guarantee</span>
                            </div>
                          </div>
                        </div>

                        {/* ==============================================================
                         * COLUMN 3: RIGHT (lg:col-span-3) - Pricing Box, Book Button & Getaway Card
                         * ============================================================== */}
                        <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 pt-5 lg:pt-0 lg:pl-6">
                          <div>
                            {/* Strikethrough original rate & Discount Badge */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-400 line-through">
                                ₹{originalPrice.toLocaleString()}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-black border border-rose-200 dark:border-rose-900/40">
                                -{discountPct}%
                              </span>
                            </div>

                            {/* Main Nightly / Monthly Price */}
                            <div className="mt-1">
                              <span className="text-3xl font-black text-[#033266] dark:text-[#ff6325] tracking-tight">
                                ₹{startingPrice.toLocaleString()}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">
                                {(() => {
                                  const customUnit = (roomItem.listing as any)?.priceUnit || listingMeta.priceUnit || (roomItem.parentService as any)?.priceUnit || roomItem.parentService?.metadata?.priceUnit;
                                  if (customUnit && customUnit.trim() !== '' && !customUnit.includes('/ night')) {
                                    return customUnit.trim();
                                  }
                                  return 'monthly rent (all inclusive)';
                                })()}
                              </span>
                            </div>

                            {/* Total Stay Price or Deposit Calculation */}
                            <div className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                              {isPgStay
                                ? `Refundable Deposit: ₹${Number((roomItem.listing as any)?.securityDeposit ?? listingMeta.securityDeposit ?? roomItem.metadata?.refundableDeposit ?? 3000).toLocaleString()}`
                                : `Total: ₹${stayTotal.toLocaleString()} (${nights} Night${nights > 1 ? 's' : ''})`
                              }
                            </div>

                            {/* Top Booking Pattern: Clean CTA Flow */}
                            {isPgStay ? (
                              <div className="space-y-2 mt-4">
                                {isSoldOut ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled
                                      className="w-full py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-wider rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-300 dark:border-white/10"
                                    >
                                      <span>🚫 ALL BEDS OCCUPIED</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVisitMode('LIVE_VIDEO');
                                        setIsVisitModalOpen(true);
                                      }}
                                      className="w-full py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 text-[#ff6325] font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-orange-200 dark:border-orange-900/40"
                                    >
                                      <span>🔔 Join Waitlist & Video Tour</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {/* Primary Top-Booking Style CTA: Select Bed & Customize */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveRoomService(servicePayloadForModal);
                                        setRoomModalStep('DETAILS');
                                        setSelectedAddonIds([]);
                                        setRoomModalImageIdx(0);
                                      }}
                                      className="w-full py-3.5 bg-gradient-to-r from-[#ff6325] to-[#f4511e] hover:from-[#e04e13] hover:to-[#d84315] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                                    >
                                      <span>SELECT BED & BOOK</span>
                                      <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                    </button>

                                    {/* Micro trust token note (Dynamic Lock Bed Amount from Business Listing) */}
                                    {((roomItem.listing as any)?.isTokenAdvanceEnabled ?? (listingMeta.isTokenAdvanceEnabled ?? true)) && (
                                      <div className="text-center">
                                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                          🔒 Lock this bed today for just ₹{((roomItem.listing as any)?.tokenAdvanceAmount || listingMeta.tokenAdvanceAmount || 999).toLocaleString()}
                                        </span>
                                      </div>
                                    )}

                                    {/* Free Property Visit (with Warden Callback) & Live Video Tour Button Group */}
                                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVisitMode('IN_PERSON');
                                          setIsVisitModalOpen(true);
                                        }}
                                        className="py-2 px-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-200 dark:border-white/10"
                                      >
                                        <span>🗓️ Free Visit & Call</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVisitMode('LIVE_VIDEO');
                                          setIsVisitModalOpen(true);
                                        }}
                                        className="py-2 px-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-[#1a56db] dark:text-[#60a5fa] font-bold text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-900/40"
                                      >
                                        <span>📹 Video Tour</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const partnerListingAddons = roomItem.addons || [];

                                  if (partnerListingAddons.length > 0) {
                                    setActiveRoomService(servicePayloadForModal);
                                    setRoomModalStep('ADDONS');
                                    setSelectedAddonIds([]);
                                    setRoomModalImageIdx(0);
                                  } else {
                                    const roomPrice = startingPrice;
                                    const roomTotal = roomPrice * nights * rooms;
                                    const slotStr = `${checkIn} to ${checkOut} (${nights} Night${nights > 1 ? 's' : ''}) • ${adults + children} Guests • ${rooms} Room${rooms > 1 ? 's' : ''}`;

                                    const isBackpackersHostel = category === 'hostels' || venueName.toLowerCase().includes('backpackers');
                                    const effectiveMerchantId = isBackpackersHostel ? '51c6a3b8-2abc-9421-7644-2a2dea05dbc0' : (servicePayloadForModal.merchantId || merchantId);
                                    const effectiveMerchantName = isBackpackersHostel ? 'Backpackers Hostel' : venueName;

                                    setSelectedService({
                                      ...servicePayloadForModal,
                                      price: roomTotal,
                                      name: `${effectiveMerchantName} — ${roomItem.name}`,
                                      merchantId: effectiveMerchantId,
                                      merchantName: effectiveMerchantName,
                                      merchant: {
                                        id: effectiveMerchantId,
                                        name: effectiveMerchantName,
                                      },
                                      merchantObj: {
                                        ...(servicePayloadForModal.merchantObj || {}),
                                        id: effectiveMerchantId,
                                        name: effectiveMerchantName,
                                      },
                                      category: category === 'hostels' ? 'Hostel Booking' : (category === 'pg-hostels' ? 'PG & Co-Living Stays' : 'Hotel Booking'),
                                      selectedListing: roomItem.listing || undefined,
                                      metadata: {
                                        ...(servicePayloadForModal.metadata || {}),
                                        merchantId: effectiveMerchantId,
                                        merchantName: effectiveMerchantName,
                                        hotelBooking: {
                                          venueName: effectiveMerchantName,
                                          realHotelName: rawVenueName,
                                          isLuxeBlindBooking,
                                          address,
                                          roomType: roomItem.name,
                                          checkIn,
                                          checkOut,
                                          nights,
                                          rooms,
                                          adults,
                                          children,
                                          childAges,
                                          pets,
                                          petCount,
                                          selectedAddons: [],
                                          pricePerNight: roomPrice,
                                          totalPrice: roomTotal
                                        }
                                      }
                                    });

                                    setSelectedSlot({
                                      id: `hotel-stay-${Date.now()}`,
                                      timeStr: slotStr,
                                      date: checkIn,
                                      available: true
                                    });

                                    router.push('/booking/checkout');
                                  }
                                }}
                                className="w-full mt-4 py-3.5 bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                <Calendar size={15} />
                                <span>BOOK ROOM &rarr;</span>
                              </button>
                            )}

                            {/* Micro guarantee badge */}
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 text-center mt-2.5 flex items-center justify-center gap-2 flex-wrap">
                              <span>FREE Cancellation • Pay later available</span>
                              {isHotelLuggageEnabled && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSubNavTab('mini-space');
                                      setTimeout(() => {
                                        const el = document.getElementById('agoda-overview-section');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                      }, 100);
                                    }}
                                    className="text-amber-600 dark:text-amber-400 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>🧳 Luggage Drop (₹{hotelLuggageHourlyRate}/hr)</span>
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Urgent Scarcity Callout Box with Dynamic Merchant Offer Badge */}
                            {(offerBadgeText || !isPgStay) && (
                              <div className="mt-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-start gap-2.5">
                                <span className="text-[#033266] dark:text-[#ff6325] font-black text-base shrink-0 leading-none">⚡</span>
                                <div>
                                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                                    {offerBadgeText ? offerBadgeText : `Only ${roomItem.listing?.metadata?.totalUnits || 3} units left at this price!`}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {offerBadgeText ? `Book now before offer expires.` : `Book now before it's gone.`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Dynamic Promotional Getaway Banner */}
                          <div className="h-32 rounded-2xl overflow-hidden relative shadow-inner border border-slate-200 dark:border-white/10 group">
                            <img
                              src={thumb}
                              alt="Getaway"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3.5">
                              <span className="font-serif italic text-white text-base font-bold drop-shadow-md">
                                {merchantBannerTagline ? merchantBannerTagline : 'Your Perfect Getaway Awaits'}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ============================================================
         * SECTION D5: DOCTOR APPOINTMENTS & CLINIC OPD TOKEN QUEUE
         * ============================================================ */}
        {isDoctor && (
          <div className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🩺</span> Doctor Appointment & Token Queue
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Guaranteed slot with live OPD token queue estimate to avoid waiting room congestion.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                <span>⏱️ Live Token Serving: #{tokenQueueNum - 3}</span>
              </div>
            </div>

            {/* Practitioner Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Select Specialist / Doctor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Dr. Rajesh Kumar (Senior Consultant)', fee: 600, exp: '14+ yrs exp • MBBS, MD' },
                  { name: 'Dr. Priya Sundaram (Associate Specialist)', fee: 450, exp: '8+ yrs exp • DNB, Fellow' }
                ].map(spec => (
                  <div
                    key={spec.name}
                    onClick={() => setSelectedPractitioner(spec.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedPractitioner === spec.name
                      ? 'bg-[#033266]/5 dark:bg-[#ff6325]/10 border-[#033266] dark:border-[#ff6325]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{spec.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{spec.exp}</p>
                    </div>
                    <span className="text-sm font-black text-[#033266] dark:text-[#ff6325]">₹{spec.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Clean Appointment Date Picker */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Select Appointment Date
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const d = selectedDate ? new Date(selectedDate) : new Date();
                    setApptCalMonth(isNaN(d.getTime()) ? new Date() : d);
                    setIsApptCalOpen(!isApptCalOpen);
                  }}
                  className="w-full sm:w-80 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white hover:border-[#ff6325] transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">CONSULTATION DATE</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {(() => {
                          try {
                            const [y, m, d] = (selectedDate || todayStr).split('-');
                            return `${d}-${m}-${y}`;
                          } catch {
                            return selectedDate || todayStr;
                          }
                        })()} {selectedDate === todayStr ? '(Today)' : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isApptCalOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Clean Airbnb / BokSpot Standard White Calendar Popover */}
                {isApptCalOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsApptCalOpen(false)} />
                    <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                      {/* Month Header */}
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-3 border border-slate-150/60 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            const newD = new Date(apptCalMonth);
                            newD.setMonth(newD.getMonth() - 1);
                            setApptCalMonth(newD);
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                          {apptCalMonth.toLocaleString('default', { month: 'long' })} {apptCalMonth.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newD = new Date(apptCalMonth);
                            newD.setMonth(newD.getMonth() + 1);
                            setApptCalMonth(newD);
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Day of Week */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <div key={d} className="py-1">{d}</div>
                        ))}
                      </div>

                      {/* Day Cells */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {(() => {
                          const year = apptCalMonth.getFullYear();
                          const month = apptCalMonth.getMonth();
                          const firstDay = new Date(year, month, 1).getDay();
                          const totalDays = new Date(year, month + 1, 0).getDate();

                          const cells = [];
                          for (let i = 0; i < firstDay; i++) {
                            cells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
                          }

                          for (let day = 1; day <= totalDays; day++) {
                            const mStr = String(month + 1).padStart(2, '0');
                            const dStr = String(day).padStart(2, '0');
                            const dateStr = `${year}-${mStr}-${dStr}`;
                            const isSelected = dateStr === (selectedDate || todayStr);
                            const isPast = dateStr < todayStr;

                            cells.push(
                              <button
                                key={`day-${day}`}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setIsApptCalOpen(false);
                                }}
                                className={`h-8 w-8 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${isSelected
                                  ? 'bg-[#ff6325] text-white shadow-sm font-black'
                                  : isPast
                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                                  }`}
                              >
                                {day}
                              </button>
                            );
                          }
                          return cells;
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Consultation Slots */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Available Appointment Windows
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'].map(slot => {
                  const isSelected = selectedApptSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedApptSlot(slot)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                        ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325] text-slate-900 dark:text-white'
                        }`}
                    >
                      <span className="text-xs font-black block">{slot}</span>
                      <span className="text-[10px] opacity-75 font-medium mt-0.5 block">Token #{tokenQueueNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Patient Symptoms / Reason */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Brief Symptoms or Visit Notes (Optional)
              </label>
              <input
                type="text"
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="e.g., Routine fever checkup, throat irritation since 2 days..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#033266] dark:focus:border-[#ff6325]"
              />
            </div>

            {/* Confirm Consultation Card */}
            {selectedApptSlot && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {selectedPractitioner}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {selectedDate} at {selectedApptSlot} • Est. Token #{tokenQueueNum}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const fee = selectedPractitioner.includes('Rajesh') ? 600 : 450;
                    setSelectedService({
                      id: `appt-${Date.now()}`,
                      name: `${venueName} — ${selectedPractitioner}`,
                      price: fee,
                      metadata: {
                        appointmentBooking: {
                          venueName,
                          practitioner: selectedPractitioner,
                          slotTime: selectedApptSlot,
                          slotDate: selectedDate,
                          tokenNum: tokenQueueNum,
                          patientNotes
                        }
                      }
                    });
                    setSelectedSlot({
                      id: `token-${tokenQueueNum}`,
                      timeStr: `${selectedDate} at ${selectedApptSlot} (Token #${tokenQueueNum})`,
                      date: selectedDate,
                      available: true
                    });
                    router.push('/booking/checkout');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
                >
                  Confirm Appointment (₹{selectedPractitioner.includes('Rajesh') ? '600' : '450'}) &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
         * SECTION D5-B: LUXURY SALON, SPA & DOORSTEP WELLNESS TREATMENTS
         * ============================================================ */}
        {isWellness && (() => {
          const wellCfg = getWellnessConfig(cleanMerchantId);
          const allTreatments = (liveServices && liveServices.length > 0 && liveServices[0]?.metadata?.treatments)
            ? (liveServices[0].metadata.treatments as any[])
            : wellCfg.treatments;
          const allSpecialists = (liveServices && liveServices.length > 0 && liveServices[0]?.metadata?.specialists)
            ? (liveServices[0].metadata.specialists as any[])
            : wellCfg.specialists;

          const homeVisitAllowed = wellCfg.homeVisitEnabled !== false;
          const homeMinOrderValue = wellCfg.homeMinOrderValue || 399;
          const homeConvenienceFee = wellCfg.homeConvenienceFee || 49;

          // Filter by Gender & Category & Service Mode
          const filteredTreatments = allTreatments.filter((t: any) => {
            const matchesGender = wellnessGenderFilter === 'ALL' || t.genderTarget === 'UNISEX' || t.genderTarget === wellnessGenderFilter;
            const matchesCat = wellnessActiveTab === 'ALL' || t.category === wellnessActiveTab;
            const matchesMode = wellnessServiceMode === 'IN_SALON'
              ? true
              : (t.serviceMode === 'BOTH' || t.serviceMode === 'HOME_VISIT');
            return matchesGender && matchesCat && matchesMode;
          });

          const selectedTreatmentObjects = allTreatments.filter((t: any) => selectedTreatments.includes(t.id));

          const totalSelectedPrice = selectedTreatmentObjects
            .reduce((sum: number, t: any) => sum + (Number(t.price) || 0), 0);

          const totalSelectedDuration = selectedTreatmentObjects
            .reduce((sum: number, t: any) => sum + (Number(t.durationMinutes) || 30), 0);

          const isBelowHomeMov = wellnessServiceMode === 'HOME_VISIT' && totalSelectedPrice < homeMinOrderValue;
          const appliedHomeFee = (wellnessServiceMode === 'HOME_VISIT' && totalSelectedPrice > 0)
            ? (totalSelectedPrice >= 999 ? 0 : homeConvenienceFee)
            : 0;
          const grandTotalPayable = totalSelectedPrice + appliedHomeFee;

          // Smart Slot Calculation with Overrun Protection
          const startMinutes = 9 * 60; // 09:00 AM
          const endMinutes = 21 * 60; // 09:00 PM
          const interval = 30; // 30 min intervals
          const duration = Math.max(totalSelectedDuration || 30, 20);

          const formatMinutesToTime = (totalMins: number) => {
            let h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            if (h === 0) h = 12;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
          };

          const dynamicSlots: { startStr: string; endStr: string; label: string; slotValue: string; period: 'MORNING' | 'AFTERNOON' | 'EVENING' }[] = [];
          for (let m = startMinutes; m <= endMinutes - duration; m += interval) {
            const sTime = formatMinutesToTime(m);
            const eTime = formatMinutesToTime(m + duration);
            const period: 'MORNING' | 'AFTERNOON' | 'EVENING' = m < 12 * 60 ? 'MORNING' : m < 16 * 60 ? 'AFTERNOON' : 'EVENING';
            dynamicSlots.push({
              startStr: sTime,
              endStr: eTime,
              label: `${sTime} – ${eTime}`,
              slotValue: sTime,
              period
            });
          }

          const morningSlots = dynamicSlots.filter(s => s.period === 'MORNING');
          const afternoonSlots = dynamicSlots.filter(s => s.period === 'AFTERNOON');
          const eveningSlots = dynamicSlots.filter(s => s.period === 'EVENING');

          const displayedSlots = wellnessSlotSession === 'MORNING'
            ? morningSlots
            : wellnessSlotSession === 'AFTERNOON'
              ? afternoonSlots
              : wellnessSlotSession === 'EVENING'
                ? eveningSlots
                : dynamicSlots;

          return (
            <div id="wellness-booking-section" className="space-y-6 mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
              {/* Header & Service Mode Dual Switcher */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Salon, Spa & Doorstep Grooming
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select beauty & spa rituals. Browse catalog below and pick your preferred time slot.
                  </p>
                </div>

                {/* Service Mode Switcher Tabs */}
                {homeVisitAllowed && (
                  <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setWellnessServiceMode('IN_SALON')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${wellnessServiceMode === 'IN_SALON'
                        ? 'bg-white dark:bg-slate-900 text-[#ff6325] shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <span>🏢 In-Salon Visit</span>
                      <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-extrabold dark:bg-emerald-950/60 dark:text-emerald-400">Chair</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWellnessServiceMode('HOME_VISIT')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${wellnessServiceMode === 'HOME_VISIT'
                        ? 'bg-[#ff6325] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <span>🏠 Doorstep Home Visit</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-extrabold">Urban Style</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mode-Specific Assurance Banner */}
              {wellnessServiceMode === 'IN_SALON' ? (
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 size={16} /> 100% Sanitized Equipment & Single-Use Capes
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                    <CheckCircle2 size={16} /> Guaranteed Zero Waiting Time
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                    <CheckCircle2 size={16} /> Private AC Luxury Treatment Suites
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-black text-amber-700 dark:text-amber-300">
                    <span>🛡️ Urban Doorstep Service Assurance</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-extrabold">
                      Min Order: ₹{homeMinOrderValue}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {totalSelectedPrice >= 999 ? '🎉 Free Doorstep Visit (Order > ₹999)' : `Convenience Fee: ₹${homeConvenienceFee}`}
                  </span>
                </div>
              )}

              {/* Step 1: Gender / Audience Segment Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    1. Choose Category & Target Audience
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    Showing: <span className="text-[#ff6325] font-black">{wellnessGenderFilter}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { id: 'ALL', label: 'All Services', icon: '✨' },
                    { id: 'MEN', label: "Men's Grooming", icon: '🧔' },
                    { id: 'WOMEN', label: "Women's Beauty", icon: '💇‍♀️' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setWellnessGenderFilter(g.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${wellnessGenderFilter === g.id
                        ? 'bg-[#ff6325]/10 border-[#ff6325] text-[#ff6325] font-black ring-2 ring-[#ff6325]/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                      <span className="text-base sm:text-lg">{g.icon}</span>
                      <span className="text-xs font-extrabold">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Multi-Service Menu Selection */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    2. Select Treatments & Services ({selectedTreatments.length} chosen • {totalSelectedDuration} mins)
                  </label>

                  {/* Sub-Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'HAIR', label: '✂️ Hair' },
                      { id: 'BEARD', label: '🧔 Beard' },
                      { id: 'SKIN_FACIAL', label: '✨ Facials' },
                      { id: 'SPA_MASSAGE', label: '💆 Massage & Spa' },
                      { id: 'BRIDAL', label: '👑 Packages' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setWellnessActiveTab(tab.id as any)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${wellnessActiveTab === tab.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Rituals Mini Drawer */}
                {selectedTreatmentObjects.length > 0 && (
                  <div className="p-3 rounded-2xl bg-[#ff6325]/10 border border-[#ff6325]/25 flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
                    <span className="text-[11px] font-black text-[#ff6325] uppercase tracking-wider mr-1">
                      In Cart ({selectedTreatmentObjects.length}):
                    </span>
                    {selectedTreatmentObjects.map(t => (
                      <span key={t.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-[#ff6325]/30 text-xs font-black text-slate-900 dark:text-white shadow-xs">
                        <span>{t.icon || '✨'}</span>
                        <span className="truncate max-w-[150px]">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">({t.durationMinutes}m)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTreatments(selectedTreatments.filter(id => id !== t.id));
                          }}
                          className="w-4 h-4 rounded-full bg-slate-150 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center font-black text-xs cursor-pointer ml-0.5"
                          title="Remove service"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedTreatments([])}
                      className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 underline ml-auto cursor-pointer"
                    >
                      Clear Cart
                    </button>
                  </div>
                )}

                {/* Empty State Prompt if 0 Selected */}
                {selectedTreatments.length === 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center text-xs font-bold text-amber-800 dark:text-amber-300">
                    👉 Please select at least one grooming or spa ritual below to book an appointment slot.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredTreatments.map((trt: any) => {
                    const isSelected = selectedTreatments.includes(trt.id);
                    return (
                      <div
                        key={trt.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTreatments(selectedTreatments.filter(id => id !== trt.id));
                          } else {
                            setSelectedTreatments([...selectedTreatments, trt.id]);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 relative overflow-hidden ${isSelected
                          ? 'bg-[#ff6325]/5 dark:bg-[#ff6325]/10 border-[#ff6325] ring-2 ring-[#ff6325]/20 shadow-xs'
                          : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                          }`}
                      >
                        {trt.popular && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl tracking-wider uppercase shadow-xs">
                            🔥 Popular
                          </div>
                        )}

                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="text-2xl shrink-0 mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/60 dark:border-white/5">
                            {trt.icon || '✨'}
                          </span>
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">{trt.name}</h4>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                ⏱️ {trt.durationMinutes} min
                              </span>
                              {trt.serviceMode === 'BOTH' && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ✓ Salon & Home
                                </span>
                              )}
                              {trt.serviceMode === 'IN_SALON' && (
                                <span className="text-[9px] font-bold text-slate-400">
                                  🏢 In-Salon Only
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug line-clamp-2">
                              {trt.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 self-center">
                          <div className="flex items-baseline justify-end gap-1.5">
                            {trt.originalPrice && trt.originalPrice > trt.price && (
                              <span className="text-[11px] text-slate-400 line-through">₹{trt.originalPrice}</span>
                            )}
                            <span className="text-sm font-black text-[#ff6325]">₹{trt.price}</span>
                          </div>
                          <span className={`block text-[11px] font-black mt-1.5 px-3 py-1 rounded-xl transition-all ${isSelected
                            ? 'bg-[#ff6325] text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                            }`}>
                            {isSelected ? '✓ Added' : '+ Add'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Summary Card / Dock (Clean Light Theme) */}
              {selectedTreatmentObjects.length > 0 && (
                <div className="w-full mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-orange-50/50 dark:from-slate-900 dark:via-[#0f1624] dark:to-slate-900 border border-[#ff6325]/30 dark:border-[#ff6325]/20 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 transition-all">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ff6325] to-[#e04e13] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-[#ff6325]/25">
                      ✂️
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {selectedTreatmentObjects.length} Service{selectedTreatmentObjects.length > 1 ? 's' : ''} Selected
                        </h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          ⏱️ {totalSelectedDuration} mins
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Total:</span>
                        <span className="text-base font-black text-[#ff6325]">
                          ₹{grandTotalPayable.toLocaleString()}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#ff6325]/10 text-[#ff6325] border border-[#ff6325]/20">
                          {wellnessServiceMode === 'HOME_VISIT' ? '🏠 Doorstep Visit' : '🪑 In-Salon Chair'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsWellnessSlotModalOpen(true)}
                    className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#ff6325] to-[#e04e13] hover:from-[#e04e13] hover:to-[#c83f08] text-white font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-[#ff6325]/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>SELECT DATE & SLOT</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* ============================================================
               * FOCUSED STEP-BY-STEP BOOKING MODAL (ZERO LONG SCROLL!)
               * ============================================================ */}
              {isWellnessSlotModalOpen && (
                <div
                  onClick={() => setIsWellnessSlotModalOpen(false)}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl bg-white dark:bg-[#0f1624] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-6 my-auto"
                  >
                    {/* Modal Top Bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-black shrink-0">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                            Select Appointment Date & Slot
                          </h3>
                          <p className="text-xs text-slate-400 font-medium">
                            {selectedTreatmentObjects.length} service{selectedTreatmentObjects.length > 1 ? 's' : ''} • {totalSelectedDuration} mins continuous window
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsWellnessSlotModalOpen(false)}
                        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-black text-sm cursor-pointer transition-colors shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Step A: Horizontal Quick Date Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          1. Choose Date
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsWellnessCalOpen(!isWellnessCalOpen)}
                          className="text-[11px] font-bold text-[#ff6325] hover:underline cursor-pointer"
                        >
                          Pick Custom Date ▾
                        </button>
                      </div>

                      {/* Quick 4-Day Horizon Buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map(offset => {
                          const d = new Date();
                          d.setDate(d.getDate() + offset);
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, '0');
                          const dayNum = String(d.getDate()).padStart(2, '0');
                          const dateKey = `${y}-${m}-${dayNum}`;
                          const isSelected = dateKey === (selectedDate || todayStr);
                          const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('default', { weekday: 'short' });
                          const monthStr = d.toLocaleDateString('default', { month: 'short' });

                          return (
                            <button
                              key={dateKey}
                              type="button"
                              onClick={() => setSelectedDate(dateKey)}
                              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${isSelected
                                ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-md font-black'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                              <span className="text-[10px] block opacity-80 uppercase tracking-wider">{dayName}</span>
                              <span className="text-sm font-black block mt-0.5">{dayNum} {monthStr}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Calendar Popover */}
                      {isWellnessCalOpen && (
                        <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-white/10 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {wellnessCalMonth.toLocaleString('default', { month: 'long' })} {wellnessCalMonth.getFullYear()}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newD = new Date(wellnessCalMonth);
                                  newD.setMonth(newD.getMonth() - 1);
                                  setWellnessCalMonth(newD);
                                }}
                                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold"
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newD = new Date(wellnessCalMonth);
                                  newD.setMonth(newD.getMonth() + 1);
                                  setWellnessCalMonth(newD);
                                }}
                                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold"
                              >
                                ›
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                              <div key={d}>{d}</div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center">
                            {(() => {
                              const year = wellnessCalMonth.getFullYear();
                              const month = wellnessCalMonth.getMonth();
                              const firstDay = new Date(year, month, 1).getDay();
                              const totalDays = new Date(year, month + 1, 0).getDate();

                              const cells = [];
                              for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-${i}`} className="h-7 w-7" />);
                              }

                              for (let day = 1; day <= totalDays; day++) {
                                const mStr = String(month + 1).padStart(2, '0');
                                const dStr = String(day).padStart(2, '0');
                                const dateStr = `${year}-${mStr}-${dStr}`;
                                const isSelected = dateStr === (selectedDate || todayStr);
                                const isPast = dateStr < todayStr;

                                cells.push(
                                  <button
                                    key={`day-${day}`}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => {
                                      setSelectedDate(dateStr);
                                      setIsWellnessCalOpen(false);
                                    }}
                                    className={`h-7 w-7 mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all ${isSelected
                                      ? 'bg-[#ff6325] text-white shadow-xs font-black'
                                      : isPast
                                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                        : 'hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                      }`}
                                  >
                                    {day}
                                  </button>
                                );
                              }
                              return cells;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step B: Time Slot Windows with Session Filter */}
                    <div>
                      <div className="space-y-2 mb-3">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          2. Choose Time Slot ({totalSelectedDuration} mins window)
                        </label>

                        {/* Session Filter Tabs in clean grid so items never misalign */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {[
                            { id: 'ALL', label: `All (${dynamicSlots.length})` },
                            { id: 'MORNING', label: `🌅 Morning (${morningSlots.length})` },
                            { id: 'AFTERNOON', label: `☀️ Afternoon (${afternoonSlots.length})` },
                            { id: 'EVENING', label: `🌆 Evening (${eveningSlots.length})` }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setWellnessSlotSession(tab.id as any)}
                              className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${wellnessSlotSession === tab.id
                                ? 'bg-[#ff6325] text-white shadow-xs font-black'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slots Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {displayedSlots.map(slot => {
                          const isSelected = selectedApptSlot === slot.slotValue;
                          return (
                            <button
                              key={slot.label}
                              type="button"
                              onClick={() => setSelectedApptSlot(slot.slotValue)}
                              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${isSelected
                                ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-md ring-2 ring-[#ff6325]/30'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-900 dark:text-white'
                                }`}
                            >
                              <span className="text-xs font-black block tracking-tight">{slot.label}</span>
                              <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                                {wellnessServiceMode === 'HOME_VISIT' ? 'Doorstep Visit' : 'Instant Chair'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {displayedSlots.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          No slots available for this session. Please pick another session.
                        </p>
                      )}
                    </div>

                    {/* Step C: If Home Visit Mode ➔ Doorstep Address Input */}
                    {wellnessServiceMode === 'HOME_VISIT' && (
                      <div className={`p-4 rounded-2xl space-y-2.5 transition-all ${wellnessAddressError && !wellnessHomeAddress.trim() ? 'bg-rose-500/10 border-2 border-rose-500' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-amber-800 dark:text-amber-200">
                            🏠 3. Doorstep Visit Address (Required)
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            Min Order: ₹{homeMinOrderValue}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={wellnessHomeAddress}
                            onChange={(e) => {
                              setWellnessHomeAddress(e.target.value);
                              if (e.target.value.trim()) setWellnessAddressError(false);
                            }}
                            placeholder="Flat / House No., Building Name *"
                            className={`bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none ${wellnessAddressError && !wellnessHomeAddress.trim() ? 'border-rose-500 ring-1 ring-rose-500' : 'border-amber-300 dark:border-amber-800/50'}`}
                          />
                          <input
                            type="text"
                            value={wellnessHomeLandmark}
                            onChange={(e) => setWellnessHomeLandmark(e.target.value)}
                            placeholder="Street, Landmark *"
                            className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/50 rounded-xl px-3 py-2 text-xs outline-none"
                          />
                          <input
                            type="tel"
                            value={wellnessHomePhone}
                            onChange={(e) => setWellnessHomePhone(e.target.value)}
                            placeholder="Contact Mobile Number *"
                            className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/50 rounded-xl px-3 py-2 text-xs outline-none"
                          />
                        </div>

                        {wellnessAddressError && !wellnessHomeAddress.trim() && (
                          <p className="text-[11px] font-bold text-rose-600">
                            ⚠️ Please enter your House / Flat Address to proceed.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Step D: Professional Assignment Badge */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">⚡</span>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {selectedWellnessStylist}
                          </h5>
                          <p className="text-[10px] text-slate-400">
                            Guaranteed instant slot • Zero waiting time
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold">
                        ✓ Assigned
                      </span>
                    </div>

                    {/* Modal Bottom Confirm Button */}
                    <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">TOTAL PAYABLE</span>
                        <span className="text-xl font-black text-[#ff6325]">₹{grandTotalPayable.toLocaleString()}</span>
                        {appliedHomeFee > 0 && (
                          <span className="text-[10px] text-slate-400 block font-medium">Includes ₹{appliedHomeFee} doorstep kit fee</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (wellnessServiceMode === 'HOME_VISIT' && !wellnessHomeAddress.trim()) {
                            setWellnessAddressError(true);
                            return;
                          }

                          const slotToSave = selectedApptSlot || dynamicSlots[0]?.slotValue || '09:00 AM';

                          setSelectedService({
                            id: `wellness-${Date.now()}`,
                            name: `${venueName} — ${wellnessServiceMode === 'HOME_VISIT' ? 'Doorstep Home Service' : 'In-Salon Appointment'}`,
                            price: grandTotalPayable,
                            metadata: {
                              appointmentBooking: {
                                venueName,
                                serviceMode: wellnessServiceMode,
                                practitioner: selectedWellnessStylist,
                                slotTime: slotToSave,
                                slotDate: selectedDate || todayStr,
                                treatments: selectedTreatments,
                                treatmentDetails: selectedTreatmentObjects,
                                totalDuration: totalSelectedDuration,
                                convenienceFee: appliedHomeFee,
                                homeAddress: wellnessHomeAddress,
                                homeLandmark: wellnessHomeLandmark,
                                homePhone: wellnessHomePhone
                              }
                            }
                          });
                          setSelectedSlot({
                            id: `slot-${slotToSave}`,
                            timeStr: `${selectedDate || todayStr} at ${slotToSave} (${totalSelectedDuration} mins)`,
                            date: selectedDate || todayStr,
                            available: true
                          });
                          setIsWellnessSlotModalOpen(false);
                          router.push('/booking/checkout');
                        }}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#ff6325] hover:bg-[#e04e13] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ff6325]/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Confirm & Proceed</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

                {/* ============================================================
         * SECTION D5-C: GYM & YOGA FITNESS PASS / BATCH SLOT SELECTION
         * ============================================================ */}
        {(isFitness || isYoga) && (() => {
          const isYogaCategory = isYoga || cleanCat.includes('yoga') || cleanCat.includes('meditation');
          const fitCfg = getFitnessConfig('zenfit-clinic');
          const allPasses = (liveServices && liveServices.length > 0 && liveServices[0]?.metadata?.passes)
            ? (liveServices[0].metadata.passes as any[])
            : fitCfg.passes;
          const allTrainers = (liveServices && liveServices.length > 0 && liveServices[0]?.metadata?.trainers)
            ? (liveServices[0].metadata.trainers as any[])
            : fitCfg.trainers;
          const allMembershipPlans = (liveServices && liveServices.length > 0 && liveServices[0]?.metadata?.membershipPlans)
            ? (liveServices[0].metadata.membershipPlans as any[])
            : fitCfg.membershipPlans;
          const allPtPackages = (liveServices && liveServices.length > 0 && liveServices[0]?.metadata?.ptPackages)
            ? (liveServices[0].metadata.ptPackages as any[])
            : fitCfg.ptPackages;

          // Dynamically isolate passes based on pure Gym vs pure Yoga category
          const categoryPasses = allPasses.filter((p: any) => {
            if (isYogaCategory) {
              return p.formatType === 'YOGA_CLASS';
            } else {
              return p.formatType !== 'YOGA_CLASS';
            }
          });

          const filteredPasses = categoryPasses.filter((p: any) => {
            if (fitnessFormatFilter === 'ALL') return true;
            return p.formatType === fitnessFormatFilter;
          });

          // Active selection handling based on Gym Booking Mode
          const activePass = filteredPasses.find((p: any) => p.id === selectedFitnessPassId) || filteredPasses[0] || allPasses[0];
          const activePlan = allMembershipPlans.find((m: any) => m.id === selectedGymPlanId) || allMembershipPlans[1] || allMembershipPlans[0];
          const activePt = allPtPackages.find((pt: any) => pt.id === selectedGymPTId) || allPtPackages[0];
          const activeTrainer = allTrainers.find((t: any) => t.id === selectedGymTrainerId) || allTrainers[0];

          // Effective price calculation
          let effectivePrice = activePass?.price || 299;
          if (!isYogaCategory) {
            if (gymBookingType === 'MEMBERSHIP') {
              effectivePrice = (activePlan?.price || 1999) + (activePt?.price || 0);
            } else {
              effectivePrice = activePass?.price || 299;
            }
          }

          // Dynamic Gym Capacity Slots with real spots left
          const gymDynamicSlots = [
            { time: '05:30 AM', spotsLeft: 14, peak: false },
            { time: '06:45 AM', spotsLeft: 4, peak: true },
            { time: '08:00 AM', spotsLeft: 8, peak: true },
            { time: '09:30 AM', spotsLeft: 18, peak: false },
            { time: '05:00 PM', spotsLeft: 12, peak: false },
            { time: '06:15 PM', spotsLeft: 3, peak: true },
            { time: '07:30 PM', spotsLeft: 5, peak: true },
            { time: '08:45 PM', spotsLeft: 16, peak: false }
          ];

          return (
            <div id="fitness-booking-section" className="space-y-6 mt-8 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{isYogaCategory ? '🧘' : '🏋️'}</span> {isYogaCategory ? 'Yoga Shala Mat & Batch Booking' : 'Gym Floor, Memberships & Personal Training'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isYogaCategory
                      ? 'Book daily yoga sessions, pranayama workshops & certified guru batches. Direct shala check-in.'
                      : 'Book certified transformation memberships, daily workout passes & dedicated coach sessions. Instant turnstile QR entry.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ff6325] border border-[#ff6325]/25 text-xs font-bold">
                    <span>⚡ Instant QR / NFC Turnstile Pass</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 text-[11px] font-bold">
                    <span>🛡️ No Hidden Admission Fees</span>
                  </div>
                </div>
              </div>

              {/* Gym Experience Mode Switcher (Memberships vs Daily Passes) */}
              {!isYogaCategory && (
                <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 inline-flex items-center gap-1 border border-slate-200/80 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setGymBookingType('MEMBERSHIP')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                      gymBookingType === 'MEMBERSHIP'
                        ? 'bg-[#ff6325] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span>🔥 Monthly Transformation Plans</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md font-mono">1M - 12M</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGymBookingType('DAY_PASS')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                      gymBookingType === 'DAY_PASS'
                        ? 'bg-[#ff6325] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span>🎟️ 1-Day Trial & Experience Passes</span>
                  </button>
                </div>
              )}

              {/* SECTION: MEMBERSHIP PLANS GRID (Shown when MEMBERSHIP mode is active) */}
              {!isYogaCategory && gymBookingType === 'MEMBERSHIP' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        1. Choose Transformation Membership Plan
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">All plans include unlimited gym floor, cardio deck, steam bath & smart locker.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                      ✓ Vacation Freeze Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {allMembershipPlans.map((plan: any) => {
                      const isSelected = selectedGymPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedGymPlanId(plan.id)}
                          className={`relative p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#ff6325] bg-orange-50/30 dark:bg-[#ff6325]/10 ring-2 ring-[#ff6325]/30 shadow-md scale-[1.01]'
                              : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/10 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          {plan.savingsBadge && (
                            <div className="absolute -top-2.5 right-3">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#ff6325] text-white shadow-xs">
                                {plan.savingsBadge}
                              </span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white">{plan.name}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {plan.description}
                            </p>

                            <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-baseline gap-2">
                              <span className="text-xl font-black text-[#ff6325]">₹{plan.price}</span>
                              {plan.originalPrice && (
                                <span className="text-xs text-slate-400 line-through">₹{plan.originalPrice}</span>
                              )}
                              <span className="text-[10px] text-slate-500 font-bold ml-auto bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                                ₹{plan.pricePerDay || Math.round(plan.price / (plan.months * 30))}/day
                              </span>
                            </div>

                            {plan.features && plan.features.length > 0 && (
                              <ul className="mt-3 space-y-1.5 border-t border-slate-200/60 dark:border-white/5 pt-2.5">
                                {plan.features.slice(0, 3).map((f: string, idx: number) => (
                                  <li key={idx} className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span className="truncate">{f}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="mt-4 pt-2">
                            <span className={`block w-full text-center text-[11px] font-extrabold py-2 rounded-xl transition-all ${
                              isSelected
                                ? 'bg-[#ff6325] text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                            }`}>
                              {isSelected ? '✓ Plan Selected' : 'Choose Plan'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Optional PT Addon Selection */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>💪</span> Add Dedicated 1-on-1 Personal Training Package
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Pair your floor membership with private coaching & nutrition tracking.</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OPTIONAL ADD-ON</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {allPtPackages.map((pt: any) => {
                        const isPtSelected = selectedGymPTId === pt.id;
                        return (
                          <div
                            key={pt.id}
                            onClick={() => setSelectedGymPTId(pt.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isPtSelected
                                ? 'border-[#ff6325] bg-white dark:bg-slate-800 ring-2 ring-[#ff6325]/20 shadow-xs'
                                : 'bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/10 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 dark:text-white">{pt.title}</span>
                                <span className="text-xs font-black text-[#ff6325]">
                                  {pt.price === 0 ? 'Free' : `+₹${pt.price}`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {pt.description}
                              </p>
                            </div>
                            <div className="mt-2 text-right">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                isPtSelected ? 'bg-[#ff6325] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                              }`}>
                                {isPtSelected ? '✓ Added' : '+ Add'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DAY PASS SELECTION (Shown in DAY_PASS mode or pure Yoga) */}
              {(isYogaCategory || gymBookingType === 'DAY_PASS') && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {isYogaCategory ? '1. Select Yoga Batch or Session' : '1. Select Daily Workout Pass or Trial'}
                    </label>

                    {/* Format Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(isYogaCategory ? [
                        { id: 'ALL', label: 'All Batches' },
                        { id: 'YOGA_CLASS', label: '🧘 Group Yoga Batches' },
                        { id: 'PERSONAL_TRAINING', label: '🕉️ 1-on-1 Guru Session' }
                      ] : [
                        { id: 'ALL', label: 'All Passes' },
                        { id: 'OPEN_GYM', label: '🏋️ Open Gym Floor' },
                        { id: 'PERSONAL_TRAINING', label: '💪 1-on-1 PT' }
                      ]).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setFitnessFormatFilter(tab.id as any)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${fitnessFormatFilter === tab.id
                            ? 'bg-[#ff6325] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredPasses.map((pass: any) => {
                      const isSelected = (selectedFitnessPassId === pass.id) || (activePass?.id === pass.id);
                      return (
                        <div
                          key={pass.id}
                          onClick={() => setSelectedFitnessPassId(pass.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${isSelected
                            ? 'bg-orange-50/30 dark:bg-[#ff6325]/10 border-[#ff6325] ring-2 ring-[#ff6325]/20 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0 mt-0.5">{pass.icon || (isYogaCategory ? '🧘' : '🏋️')}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{pass.name}</h4>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                  {pass.durationMinutes >= 60 ? `${pass.durationMinutes / 60}h Session` : `${pass.durationMinutes}m`}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                                {pass.description}
                              </p>
                              {pass.amenities && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {pass.amenities.map((am: string, idx: number) => (
                                    <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200/50">
                                      ✓ {am}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-[#ff6325]">₹{pass.price}</span>
                            <span className={`block text-[10px] font-bold mt-1 px-2.5 py-1 rounded-lg ${isSelected ? 'bg-[#ff6325] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                              {isSelected ? '✓ Selected' : 'Choose'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: CERTIFIED COACHES & PERSONAL TRAINERS (Interactive Selection) */}
              {allTrainers && allTrainers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {isYogaCategory ? '2. Choose Dedicated Yoga Guru' : '2. On-Floor Certified Coaches & Personal Trainers'}
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Click to select coach for your session</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {allTrainers.map((tr: any) => {
                      const isTrainerActive = selectedGymTrainerId === tr.id;
                      return (
                        <div
                          key={tr.id}
                          onClick={() => setSelectedGymTrainerId(tr.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isTrainerActive
                              ? 'border-[#ff6325] bg-orange-50/40 dark:bg-[#ff6325]/10 ring-2 ring-[#ff6325]/20 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 hover:border-slate-300'
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={tr.avatar}
                              alt={tr.name}
                              className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-white dark:border-slate-700 shadow-xs"
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80'; }}
                            />
                            {isTrainerActive && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#ff6325] text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{tr.name}</span>
                              <span className="text-[10px] font-black text-amber-500">★ {tr.rating}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{tr.role}</span>
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                              {tr.experienceYears}+ yrs exp • {tr.specialties?.slice(0, 2).join(', ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3 & 4: DATE & CROWD TELEMETRY TIME SLOTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 border-t border-slate-200/80 dark:border-white/10">
                {/* Date Picker */}
                <div className="lg:col-span-5 space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    3. Workout Start Date
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const d = selectedDate ? new Date(selectedDate) : new Date();
                        setFitnessCalMonth(isNaN(d.getTime()) ? new Date() : d);
                        setIsFitnessCalOpen(!isFitnessCalOpen);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white hover:border-[#ff6325] transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#ff6325]/10 text-[#ff6325] flex items-center justify-center font-bold shrink-0">
                          <Calendar size={16} />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">START DATE</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {(() => {
                              try {
                                const [y, m, d] = (selectedDate || todayStr).split('-');
                                return `${d}-${m}-${y}`;
                              } catch {
                                return selectedDate || todayStr;
                              }
                            })()} {selectedDate === todayStr ? '(Today)' : ''}
                          </span>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isFitnessCalOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Popover Calendar */}
                    {isFitnessCalOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsFitnessCalOpen(false)} />
                        <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-4 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-3 border border-slate-150/60 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                const newD = new Date(fitnessCalMonth);
                                newD.setMonth(newD.getMonth() - 1);
                                setFitnessCalMonth(newD);
                              }}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black tracking-wide">
                              {fitnessCalMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newD = new Date(fitnessCalMonth);
                                newD.setMonth(newD.getMonth() + 1);
                                setFitnessCalMonth(newD);
                              }}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all cursor-pointer"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center mb-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                              <span key={d} className="text-[10px] font-black text-slate-400 py-1">{d}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const y = fitnessCalMonth.getFullYear();
                              const m = fitnessCalMonth.getMonth();
                              const firstDay = new Date(y, m, 1).getDay();
                              const daysInMonth = new Date(y, m + 1, 0).getDate();
                              const cells = [];
                              for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`blank-${i}`} className="h-8" />);
                              }
                              for (let d = 1; d <= daysInMonth; d++) {
                                const dayStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const isCurrentSelected = dayStr === selectedDate;
                                const isPast = dayStr < todayStr;
                                cells.push(
                                  <button
                                    key={dayStr}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => {
                                      setSelectedDate(dayStr);
                                      setIsFitnessCalOpen(false);
                                    }}
                                    className={`h-8 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                                      isCurrentSelected
                                        ? 'bg-[#ff6325] text-white shadow-xs'
                                        : isPast
                                          ? 'opacity-25 cursor-not-allowed text-slate-400'
                                          : 'hover:bg-orange-50 hover:text-[#ff6325] dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {d}
                                  </button>
                                );
                              }
                              return cells;
                            })()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Telemetry Time Slots */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      4. Preferred Workout Batch & Live Floor Capacity
                    </label>
                    <span className="text-[10px] text-slate-400">Live Telemetry</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {gymDynamicSlots.map((slot) => {
                      const isSelected = selectedFitnessTimeSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedFitnessTimeSlot(slot.time)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-[#ff6325] text-white border-transparent shadow-md'
                              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#ff6325] text-slate-900 dark:text-white'
                          }`}
                        >
                          <span className="text-xs font-black block">{slot.time}</span>
                          <span className={`text-[9px] font-bold block mt-1 ${
                            isSelected
                              ? 'text-white/90'
                              : slot.spotsLeft <= 5
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {slot.spotsLeft <= 5 ? `🟠 ${slot.spotsLeft} spots left` : `🟢 ${slot.spotsLeft} spots open`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Gym Facility Highlights Grid (BookMyService Standard) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Included Gym Equipment & Amenities
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { icon: '🏋️', label: 'Olympic Barbells & Rogue Racks' },
                    { icon: '🏃', label: 'Hi-Tech Cardio & Sled Track' },
                    { icon: '🚿', label: 'Steam Sauna & Luxury Showers' },
                    { icon: '📊', label: 'InBody Body Composition Scan' },
                    { icon: '🔒', label: 'RFID Smart Lockers' },
                    { icon: '🥤', label: 'Whey Protein & Cold Brew Bar' },
                    { icon: '❄️', label: 'Central Air Conditioning' },
                    { icon: '🚗', label: 'Valet Parking & EV Charging' }
                  ].map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/5">
                      <span className="text-base">{amenity.icon}</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky Summary / Checkout Dock */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-[#ff6325]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {!isYogaCategory && gymBookingType === 'MEMBERSHIP' ? activePlan.name : activePass.name}
                    </span>
                    <span className="text-base font-black text-[#ff6325]">
                      ₹{effectivePrice}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    📅 {selectedDate || todayStr} at {selectedFitnessTimeSlot} • Coach: {activeTrainer.name} • Instant Turnstile Pass
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const bookingTitle = !isYogaCategory && gymBookingType === 'MEMBERSHIP'
                      ? `${venueName} — ${activePlan.name} (${activePlan.months}M)`
                      : `${venueName} — ${activePass.name}`;

                    setSelectedService({
                      id: `fitness-${Date.now()}`,
                      name: bookingTitle,
                      price: effectivePrice,
                      metadata: {
                        isFitnessBooking: true,
                        fitnessBooking: {
                          venueName,
                          passName: !isYogaCategory && gymBookingType === 'MEMBERSHIP' ? activePlan.name : activePass.name,
                          bookingType: gymBookingType,
                          formatType: activePass.formatType,
                          planMonths: !isYogaCategory && gymBookingType === 'MEMBERSHIP' ? activePlan.months : 1,
                          slotTime: selectedFitnessTimeSlot,
                          slotDate: selectedDate || todayStr,
                          trainer: activeTrainer.name,
                          ptPackage: selectedGymPTId,
                          durationMinutes: activePass.durationMinutes || 720
                        }
                      }
                    });
                    setSelectedSlot({
                      id: `slot-fit-${Date.now()}`,
                      timeStr: `${selectedDate || todayStr} at ${selectedFitnessTimeSlot}`,
                      date: selectedDate || todayStr,
                      available: true
                    });
                    router.push('/booking/checkout');
                  }}
                  className="px-8 py-3.5 rounded-xl bg-[#ff6325] hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <span>{!isYogaCategory && gymBookingType === 'MEMBERSHIP' ? `Join Membership (₹${effectivePrice})` : `Book Gym Pass (₹${effectivePrice})`}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })()}


        {/* ============================================================
         * SECTION D5-D: RESTAURANT & TABLE RESERVATION FLOW
         * ============================================================ */}
{
  isDining && (() => {
    const diningCfg = getDiningConfig(cleanMerchantId);
    let allTables = diningCfg.tableTypes || [];
    let allSlots = diningCfg.timeSlots || [];
    let popularMenu = diningCfg.popularMenu || [];
    let activeDeals = diningCfg.bookingDeals || [];
    let activeCuisines = diningCfg.cuisines || [];
    let activeCostForTwo = diningCfg.costForTwo || 800;
    let customSessionsList: any[] = [];

    if (typeof window !== 'undefined') {
      try {
        const busStorageRaw = localStorage.getItem('vendor-portal-storage-v10');
        if (busStorageRaw) {
          const busData = JSON.parse(busStorageRaw);
          const curM = busData.state?.currentMerchant;
          const storedServices = busData.state?.services || [];
          const activeBranchId = curM?.activeBranchId;

          // 1. Read Vendor Cuisines, Cost for Two, Deals & Perks from Merchant Profile (Modules 1, 3)
          if (curM?.metadata?.cuisines && Array.isArray(curM.metadata.cuisines) && curM.metadata.cuisines.length > 0) {
            activeCuisines = curM.metadata.cuisines;
          }
          if (curM?.metadata?.costForTwo) {
            activeCostForTwo = Number(curM.metadata.costForTwo);
          }
          if (curM?.metadata?.bookingDeals && Array.isArray(curM.metadata.bookingDeals)) {
            activeDeals = curM.metadata.bookingDeals.filter((d: any) => d.active !== false);
          }
          if (curM?.metadata?.customSessions && Array.isArray(curM.metadata.customSessions)) {
            customSessionsList = curM.metadata.customSessions.filter((cs: any) => cs.enabled);
          }

          const vendorLunchPerk = curM?.metadata?.lunchPerkText;
          const vendorDinnerPerk = curM?.metadata?.dinnerPerkText;
          if (vendorLunchPerk || vendorDinnerPerk) {
            allSlots = allSlots.map((s: any) => {
              if (s.session === 'LUNCH' && vendorLunchPerk) {
                return { ...s, discountOffer: vendorLunchPerk };
              }
              if (s.session === 'DINNER' && vendorDinnerPerk) {
                return { ...s, discountOffer: vendorDinnerPerk };
              }
              return s;
            });
          }

          // Append custom session slots if vendor configured them (e.g. Breakfast / High Tea)
          if (customSessionsList.length > 0) {
            customSessionsList.forEach((cs: any) => {
              const sessionKey = cs.name.toUpperCase().includes('BREAKFAST') ? 'BREAKFAST' : cs.name.toUpperCase().includes('TEA') ? 'HIGH_TEA' : cs.name.toUpperCase();
              if (!allSlots.some(s => s.session === sessionKey)) {
                allSlots.push({
                  time: cs.opensAt || '08:00 AM',
                  session: sessionKey as any,
                  discountOffer: `${cs.name} Special`,
                  isFastFilling: false
                });
              }
            });
          }

          // 2. Read live tables configured in Business Portal (Module 2)
          const matchedService = storedServices.find((s: any) => {
            const sName = (s.name || '').toLowerCase();
            const sCat = (s.category || '').toLowerCase();
            const matchCat = sCat.includes('dining') || sCat.includes('restaurant') || sName.includes('dining') || s.metadata?.isDining;
            const matchBranch = activeBranchId ? (!s.branchId || s.branchId === activeBranchId) : true;
            return matchCat && matchBranch;
          });

          if (matchedService && Array.isArray(matchedService.listings) && matchedService.listings.length > 0) {
            allTables = matchedService.listings.map((l: any, idx: number) => {
              const zone = l.metadata?.tableZone || l.tableZone || 'AC_INDOOR';
              const icon = zone === 'ROOFTOP' ? '🌆' : zone === 'PRIVATE_DINING' ? '👑' : zone === 'GARDEN_PATIO' ? '🌿' : '🛋️';
              return {
                id: l.id || `table-${idx}`,
                name: l.name,
                capacity: `${l.minGuests || l.metadata?.minGuests || 1} - ${l.maxGuests || l.metadata?.maxGuests || 4} Guests`,
                minGuests: l.minGuests || l.metadata?.minGuests || 1,
                maxGuests: l.maxGuests || l.metadata?.maxGuests || 4,
                zone: zone,
                depositAmount: Number(l.price || l.basePrice || l.metadata?.depositAmount || 0),
                badge: l.offerBadge || l.metadata?.highlightBadge || undefined,
                icon,
                description: l.description || l.metadata?.atmosphereTagline || `Comfortable table setup in ${zone.replace('_', ' ')}.`
              };
            });

            // Read add-on dishes
            const vendorAddons: any[] = [];
            matchedService.listings.forEach((l: any) => {
              const isAddonsOn = l.isAddonsEnabled ?? l.metadata?.isAddonsEnabled ?? true;
              const items = l.addOns || l.metadata?.addons || [];
              if (isAddonsOn && Array.isArray(items)) {
                items.forEach((item: any) => {
                  if (item.name && !vendorAddons.some(v => v.name.toLowerCase() === item.name.toLowerCase())) {
                    vendorAddons.push({
                      id: `menu-vendor-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                      name: item.name,
                      category: 'MAIN_COURSE',
                      isVeg: !item.name.toLowerCase().includes('chicken') && !item.name.toLowerCase().includes('mutton') && !item.name.toLowerCase().includes('fish') && !item.name.toLowerCase().includes('meat') && !item.name.toLowerCase().includes('prawn'),
                      price: Number(item.price || 0),
                      rating: 4.8,
                      chefSpecial: true,
                      description: `Chef special pre-order item freshly prepared for your table.`
                    });
                  }
                });
              }
            });
            if (vendorAddons.length > 0) {
              popularMenu = vendorAddons;
            }
          }
        }
      } catch (e) { }
    }

    // Auto-Match Best Fit Table for user's selected party size
    const bestFitTable = allTables.find((t: any) => diningGuestCount >= t.minGuests && diningGuestCount <= t.maxGuests);
    const effectiveSelectedTableId = selectedTableId || (bestFitTable ? bestFitTable.id : (allTables[0]?.id || ''));

    const filteredTables = allTables.filter((tbl: any) => {
      if (diningZoneTab === 'ALL') return true;
      return tbl.zone === diningZoneTab;
    });

    const activeTable = allTables.find((t: any) => t.id === effectiveSelectedTableId) || bestFitTable || allTables[0];
    const reservationDeposit = activeTable?.depositAmount || 0;

    return (
      <div id="dining-booking-section" className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
        {/* Header with Search Context Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🍽️</span> Restaurant Table Reservation
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-[#ff6325] text-xs font-black">
                <span>📅</span> {selectedDate || todayStr} {selectedDate === todayStr ? '(Today)' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#033266] dark:text-blue-400 text-xs font-black">
                <span>👥</span> {diningGuestCount} {diningGuestCount === 1 ? 'Guest' : 'Guests'}
              </span>
              <button
                type="button"
                onClick={() => setIsEditSearchOpen(true)}
                className="text-[11px] text-[#ff6325] hover:underline font-bold cursor-pointer ml-1"
              >
                Change Date / Party Size
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ✓ Instant Confirmation
            </span>
          </div>
        </div>

        {/* 2. Seating Zone Ambiance Filter Tabs */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            1. Select Seating Ambience & Zone
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Tables', icon: '🍽️' },
              { id: 'AC_INDOOR', label: 'AC Indoor Hall', icon: '🌟' },
              { id: 'ROOFTOP', label: 'Romantic Rooftop', icon: '🌆' },
              { id: 'GARDEN_PATIO', label: 'Garden Patio', icon: '🌿' },
              { id: 'PRIVATE_DINING', label: 'Private Dining (PDR)', icon: '👑' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDiningZoneTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${diningZoneTab === tab.id
                  ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Table Types Selection Cards */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            2. Choose Table Type & Arrangement
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {filteredTables.map((tbl: any) => {
              const isSelected = selectedTableId === tbl.id;
              const isCapacityFit = diningGuestCount >= tbl.minGuests && diningGuestCount <= tbl.maxGuests;

              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTableId(tbl.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${isSelected
                    ? 'bg-[#ff6325]/5 border-[#ff6325] shadow-md ring-2 ring-[#ff6325]/20'
                    : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                >
                  {isCapacityFit && (
                    <div className="absolute -top-2 right-3">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                        Best Fit ({tbl.capacity})
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tbl.icon}</span>
                      {tbl.badge && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {tbl.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{tbl.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tbl.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <span>👥</span> {tbl.capacity}
                    </span>
                    <span className="text-xs font-black text-[#ff6325]">
                      {tbl.depositAmount === 0 ? 'Free Reservation' : `₹${tbl.depositAmount} Hold Deposit`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Time Slots with Session Filters & Discount Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              3. Preferred Dining Time Slot & Offers
            </label>
            <div className="flex items-center gap-1.5">
              {['ALL', 'LUNCH', 'DINNER'].map((ses) => (
                <button
                  key={ses}
                  type="button"
                  onClick={() => setDiningSession(ses as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${diningSession === ses
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {ses === 'ALL' ? 'All Slots' : ses}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {/* Lunch Sessions */}
            {(diningSession === 'ALL' || diningSession === 'LUNCH') && (
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  ☀️ Lunch Slots (12:00 PM - 03:30 PM)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {allSlots
                    .filter((s: any) => s.session === 'LUNCH')
                    .map((slot: any) => {
                      const isSelected = selectedDiningTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedDiningTime(slot.time)}
                          className={`py-3 px-3 rounded-xl text-center border transition-all cursor-pointer ${isSelected
                            ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-md scale-[1.02]'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <span className="text-xs font-black block">{slot.time}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Dinner Sessions */}
            {(diningSession === 'ALL' || diningSession === 'DINNER') && (
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  🌙 Dinner Slots (07:00 PM - 11:00 PM)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {allSlots
                    .filter((s: any) => s.session === 'DINNER')
                    .map((slot: any) => {
                      const isSelected = selectedDiningTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedDiningTime(slot.time)}
                          className={`py-3 px-3 rounded-xl text-center border transition-all cursor-pointer ${isSelected
                            ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-md scale-[1.02]'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <span className="text-xs font-black block">{slot.time}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Special Booking Deals & Coupons (Top App Standards: Dineout / EazyDiner) */}
        {activeDeals && activeDeals.length > 0 && (
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              4. Applicable Restaurant Deals & Offers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeDeals.map((deal: any) => {
                const isApplied = selectedDiningDealId === deal.id;
                return (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDiningDealId(isApplied ? '' : deal.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isApplied
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎉</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{deal.title}</h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                            {deal.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {deal.description}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 ${isApplied ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                      }`}>
                      {isApplied ? 'Applied ✓' : 'Apply'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Optional Chef Special Pre-order Delicacies (Zero Wait Serving) */}
        {popularMenu && popularMenu.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                5. Pre-order Signature Dishes (Optional)
              </label>
              <span className="text-[10px] text-slate-400 font-bold">
                {selectedPreOrderItems.length} items added (+₹{selectedPreOrderItems.reduce((acc, itm) => {
                  const m = popularMenu.find((p: any) => p.id === itm.id);
                  return acc + (m ? m.price * itm.qty : 0);
                }, 0)})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {popularMenu.slice(0, 6).map((item: any) => {
                const sel = selectedPreOrderItems.find((p) => p.id === item.id);
                const qty = sel?.qty || 0;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.name}</h5>
                      </div>
                      <span className="text-xs font-black text-[#ff6325] block mt-1">₹{item.price}</span>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPreOrderItems([...selectedPreOrderItems, { id: item.id, qty: 1 }])}
                        className="px-3 py-1.5 rounded-xl border border-[#ff6325] text-[#ff6325] hover:bg-[#ff6325] hover:text-white text-xs font-black transition-all cursor-pointer"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (qty === 1) {
                              setSelectedPreOrderItems(selectedPreOrderItems.filter((p) => p.id !== item.id));
                            } else {
                              setSelectedPreOrderItems(selectedPreOrderItems.map((p) => p.id === item.id ? { ...p, qty: p.qty - 1 } : p));
                            }
                          }}
                          className="text-xs font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPreOrderItems(selectedPreOrderItems.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
                          }}
                          className="text-xs font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Special Requests / Occasions */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            6. Special Requests & Occasions (Optional)
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {['🎂 Birthday Celebration', '🥂 Anniversary Dinner', '👶 High Chair Required', '🌸 Quiet Corner Table', '🕯️ Candlelight Setup'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setDiningSpecialRequest(prev => prev.includes(tag) ? prev.replace(tag, '').trim() : `${prev} ${tag}`.trim());
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${diningSpecialRequest.includes(tag)
                    ? 'bg-[#ff6325]/15 border-[#ff6325] text-[#ff6325]'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={diningSpecialRequest}
              onChange={(e) => setDiningSpecialRequest(e.target.value)}
              placeholder="Add other requests (e.g., Less spicy, wheelchair access, table near window)..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#ff6325]"
            />
          </div>
        </div>
        {/* Bottom Reservation Action Summary */}
        {(() => {
          const popularMenu = diningCfg.popularMenu || [];
          const preOrderTotal = selectedPreOrderItems.reduce((acc, itm) => {
            const m = popularMenu.find((p) => p.id === itm.id);
            return acc + (m ? m.price * itm.qty : 0);
          }, 0);
          const finalPayableAtBooking = reservationDeposit + preOrderTotal;
          const activeDeal = (diningCfg.bookingDeals || []).find((d) => d.id === selectedDiningDealId);

          return (
            <div className="pt-5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-800/60 p-4 sm:p-5 rounded-3xl">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {activeTable?.name || 'Selected Table'} • {diningGuestCount} Guests
                  </span>
                  <span className="text-xs text-slate-500 font-bold">• {selectedDiningTime}</span>
                  {activeDeal && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-2xs">
                      Offer: {activeDeal.code}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {finalPayableAtBooking === 0
                      ? '✓ Free Table Reservation • Pay bill at restaurant'
                      : `Total Booking Payable: ₹${finalPayableAtBooking}${reservationDeposit > 0 ? ` (₹${reservationDeposit} adjustable deposit` : ''}${preOrderTotal > 0 ? ` + ₹${preOrderTotal} pre-order` : ''}${reservationDeposit > 0 ? ')' : ''}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const effectiveMerchantId = merchantId || 'R404';
                  const effectiveMerchantName = venueName || diningCfg.name;

                  setSelectedService({
                    id: `dining-table-${activeTable?.id || '2-cozy'}`,
                    name: `${effectiveMerchantName} — ${activeTable?.name || 'Table'} (${diningGuestCount} Guests)`,
                    price: finalPayableAtBooking,
                    merchantId: effectiveMerchantId,
                    merchantName: effectiveMerchantName,
                    merchant: {
                      id: effectiveMerchantId,
                      name: effectiveMerchantName
                    },
                    category: 'Restaurant Table Reservation',
                    metadata: {
                      isDiningBooking: true,
                      diningBooking: {
                        restaurantName: effectiveMerchantName,
                        tableType: activeTable?.name,
                        tableId: activeTable?.id,
                        zone: diningZoneTab,
                        guests: diningGuestCount,
                        date: selectedDate || todayStr,
                        time: selectedDiningTime,
                        depositAmount: reservationDeposit,
                        preOrderTotal,
                        preOrderItems: selectedPreOrderItems.map(p => {
                          const m = popularMenu.find((item: any) => item.id === p.id);
                          return {
                            id: p.id,
                            name: m?.name || 'Dish',
                            price: m?.price || 0,
                            qty: p.qty,
                            isVeg: m?.isVeg ?? true
                          };
                        }),
                        appliedDeal: activeDeal ? {
                          code: activeDeal.code,
                          title: activeDeal.title,
                          description: activeDeal.description
                        } : null,
                        specialRequest: diningSpecialRequest,
                        costForTwo: activeCostForTwo,
                        cuisines: activeCuisines
                      }
                    }
                  });

                  setSelectedSlot({
                    id: `table-slot-${Date.now()}`,
                    timeStr: `${selectedDate || todayStr} at ${selectedDiningTime} (${diningGuestCount} Guests)`,
                    date: selectedDate || todayStr,
                    available: true
                  });

                  router.push('/booking/checkout');
                }}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#ff6325] to-[#f4511e] hover:from-[#e04e13] hover:to-[#d84315] text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer w-full sm:w-auto text-center"
              >
                Confirm Table Reservation &rarr;
              </button>
            </div>
          );
        })()}
      </div>
    );
  })()
}

{/* ============================================================
         * SECTION D6: SELF-DRIVE & VEHICLE RENTALS (ARCHETYPE 4: AssetRental)
         * ============================================================ */}
{
  isRental && (
    <div className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🚗</span> Vehicle / Equipment Rental Selection
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            100% Tax-Exempt Security Deposit refunded immediately upon safe return.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold">
          <span>🛡️ Zero Deposit Deductions Guarantee</span>
        </div>
      </div>

      {/* Rental Duration Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            Pick-up Date
          </label>
          <input
            type="date"
            value={rentalStartDate}
            onChange={(e) => setRentalStartDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            Return Date
          </label>
          <input
            type="date"
            value={rentalEndDate}
            onChange={(e) => setRentalEndDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            Total Rental Days
          </label>
          <select
            value={rentalDays}
            onChange={(e) => setRentalDays(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
          >
            {[1, 2, 3, 5, 7, 14, 30].map(d => (
              <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandatory DL / ID Verification Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪪</span>
          <div>
            <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
              Mandatory Driving License / Govt ID Check
            </h4>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
              Required at handover for vehicle insurance coverage.
            </p>
          </div>
        </div>
        <label className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0">
          <span>{uploadedDlName ? `✓ ${uploadedDlName}` : 'Upload DL / ID Document'}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setUploadedDlName(e.target.files[0].name);
            }}
          />
        </label>
      </div>

      {/* Rental Breakdown Summary */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-slate-900 dark:text-white block">
            {liveServices[0]?.name || 'Standard Vehicle Rental'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
            ₹1,500/day × {rentalDays} days (₹{1500 * rentalDays}) + ₹2,000 Refundable Security Deposit
          </span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
            <span className="text-xl font-black text-[#033266] dark:text-[#ff6325]">
              ₹{(1500 * rentalDays + 2000).toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const baseDaily = 1500;
              const deposit = 2000;
              const total = baseDaily * rentalDays + deposit;
              setSelectedService({
                id: `rental-${Date.now()}`,
                name: `${venueName} — Rental`,
                price: total,
                metadata: {
                  rentalBooking: {
                    venueName,
                    rentalDays,
                    rentalStartDate,
                    rentalEndDate,
                    securityDeposit: deposit,
                    uploadedDoc: uploadedDlName || 'Verified at Counter'
                  }
                }
              });
              setSelectedSlot({
                id: `rental-slot-${Date.now()}`,
                timeStr: `${rentalStartDate} to ${rentalEndDate} (${rentalDays} Days)`,
                date: rentalStartDate,
                available: true
              });
              router.push('/booking/checkout');
            }}
            className="px-6 py-3 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Reserve Vehicle &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

{/* ============================================================
         * SECTION D7: BOOKMYSHOW & DISTRICT MULTI-STEP CINEMA TICKETING WIZARD
         * ============================================================ */}
{
  isPass && (() => {
    // Dynamic binding to live service metadata created by business partner
    const activeEntSvc = liveServices.find(s => s.metadata?.isEntertainment || s.category?.toLowerCase().includes('movie') || s.category?.toLowerCase().includes('cinema')) || liveServices[0];
    const dynamicFormats: Array<{ id: string; label: string; sub: string; icon: string }> = (activeEntSvc?.metadata?.formats && Array.isArray(activeEntSvc.metadata.formats))
      ? activeEntSvc.metadata.formats.map((fmt: any) => {
        if (typeof fmt === 'string') {
          const icon = fmt.includes('IMAX') ? '🎥' : fmt.includes('Atmos') ? '🔊' : fmt.includes('4DX') ? '⚡' : '👓';
          const sub = fmt.includes('IMAX') ? 'Next-Gen 4K Laser Projection' : fmt.includes('Atmos') ? 'Immersive 64-Channel Spatial Audio' : fmt.includes('4DX') ? 'Synchronised Motion Seats' : 'Crystal Clear Digital Laser';
          return { id: fmt, label: fmt, sub, icon };
        }
        return { id: fmt.id || fmt.name, label: fmt.label || fmt.name, sub: fmt.sub || 'Cinema Standard', icon: fmt.icon || '🎥' };
      })
      : [
        { id: 'IMAX Laser 3D', label: 'IMAX Laser 3D', sub: 'Next-Gen 4K Laser Projection', icon: '🎥' },
        { id: 'Dolby Atmos 7.1', label: 'Dolby Atmos 7.1', sub: 'Immersive 64-Channel Spatial Audio', icon: '🔊' },
        { id: '4DX Motion', label: '4DX Motion & Scent', sub: 'Synchronised Motion Seats', icon: '⚡' },
        { id: 'RealD 3D / 2D', label: 'RealD 3D / 2D Standard', sub: 'Crystal Clear Digital Laser', icon: '👓' }
      ];

    const dynamicShowtimes: Array<{ time: string; status: string; audi: string }> = (activeEntSvc?.metadata?.showtimes && Array.isArray(activeEntSvc.metadata.showtimes))
      ? activeEntSvc.metadata.showtimes.map((st: any) => ({
        time: st.time || '10:30 AM',
        status: st.status || (st.fillingFast ? 'Fast Filling' : 'Available'),
        audi: st.screen || st.audi || 'Audi 1'
      }))
      : [
        { time: '10:30 AM', status: 'Almost Full', audi: 'Audi 1 (IMAX)' },
        { time: '02:15 PM', status: 'Available', audi: 'Audi 1 (IMAX)' },
        { time: '06:45 PM', status: 'Fast Filling', audi: 'Audi 2 (Dolby Atmos)' },
        { time: '10:00 PM', status: 'Available', audi: 'Audi 2 (Dolby Atmos)' }
      ];

    const dynamicSeatTiers: Array<{ id: string; name: string; price: number; icon: string; desc: string }> = (activeEntSvc?.metadata?.seatTiers && Array.isArray(activeEntSvc.metadata.seatTiers))
      ? activeEntSvc.metadata.seatTiers.map((tier: any) => ({
        id: tier.id || tier.name,
        name: tier.name || 'Standard Tier',
        price: Number(tier.price) || 190,
        icon: tier.icon || '🎟️',
        desc: tier.desc || 'Standard cinema seat'
      }))
      : [
        { id: 'recliner', name: 'Royal Recliner (Lounge)', price: 380, icon: '👑', desc: 'Motorized lounger + Butler dining' },
        { id: 'prime', name: 'Prime Circle', price: 250, icon: '🌟', desc: 'Optimum center rows + Extra legroom' },
        { id: 'classic', name: 'Classic Executive', price: 190, icon: '🎟️', desc: 'Standard cushioned cinema seat' }
      ];

    const dynamicSnacks: Array<{ id: string; name: string; price: number; icon: string; desc: string }> = (activeEntSvc?.metadata?.snackAddons && Array.isArray(activeEntSvc.metadata.snackAddons))
      ? activeEntSvc.metadata.snackAddons.map((snk: any) => ({
        id: snk.id || snk.name,
        name: snk.name,
        price: Number(snk.price) || 150,
        icon: snk.icon || '🍿',
        desc: snk.desc || 'Fresh cinema concession'
      }))
      : [
        { id: 'popcorn', name: 'Tub Popcorn + Coke Combo', price: 240, icon: '🍿', desc: 'Large Salted & Caramel popcorn tub with 500ml chilled Coke' },
        { id: 'nachos', name: 'Warm Cheesy Nachos', price: 180, icon: '🌮', desc: 'Crisp tortilla chips served with warm melted jalapeno salsa dip' },
        { id: 'coffee', name: 'Cold Coffee / Iced Tea', price: 120, icon: '🥤', desc: 'Chilled refreshing brew delivered directly to your cinema lounger' }
      ];

    const reclinerTier = dynamicSeatTiers.find(t => t.name.toLowerCase().includes('recliner') || t.id.toLowerCase().includes('recliner')) || dynamicSeatTiers[0];
    const primeTier = dynamicSeatTiers.find(t => t.name.toLowerCase().includes('prime') || t.id.toLowerCase().includes('prime')) || dynamicSeatTiers[1] || dynamicSeatTiers[0];
    const classicTier = dynamicSeatTiers.find(t => t.name.toLowerCase().includes('classic') || t.id.toLowerCase().includes('classic') || t.id.toLowerCase().includes('executive')) || dynamicSeatTiers[dynamicSeatTiers.length - 1];

    return (
      <div id="entertainment-booking-section" className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">

        {/* Quick Movie Selector Strip (Allows instant switching between now-showing movies in this theatre) */}
        <div className="space-y-2 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🎬</span> Now Showing At This Multiplex ({NOW_SHOWING_MOVIES.length} Movies)
            </span>
            <span className="text-[10px] font-bold text-[#ff6325]">Click any poster to switch show</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {NOW_SHOWING_MOVIES.map((mov) => {
              const isCur = activeMovie.id === mov.id || activeMovie.slug === mov.slug;
              return (
                <button
                  key={mov.id}
                  type="button"
                  onClick={() => {
                    setActiveMovie(mov);
                    router.replace(`/${bookingType}/${category}/${merchantId}?movie=${mov.slug}`, { scroll: false });
                  }}
                  className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border text-left transition-all cursor-pointer shrink-0 ${isCur
                    ? 'border-[#ff6325] bg-[#ff6325]/10 shadow-sm shadow-[#ff6325]/20 ring-1 ring-[#ff6325]'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                >
                  <div className="w-10 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                    <img src={mov.posterUrl} alt={mov.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-black text-amber-400 text-center py-0.5">
                      ★{mov.rating}
                    </span>
                  </div>
                  <div className="min-w-0 max-w-[130px]">
                    <h4 className={`text-xs font-black truncate ${isCur ? 'text-[#ff6325]' : 'text-slate-800 dark:text-white'}`}>
                      {mov.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      {mov.certificate} • {mov.runtime}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate block">
                      {mov.formats[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Header Specs Banner - Displays Currently Active Selected Movie Details */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-2xl overflow-hidden shadow-lg border border-white/15 shrink-0 bg-slate-900">
              <img
                src={activeMovie.posterUrl}
                alt={activeMovie.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-400 font-black text-[9px]">
                ★ {activeMovie.rating}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-[10px] tracking-wide border border-amber-500/30">
                  {activeMovie.certificate}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                  {activeMovie.genres.join(' / ')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                  ⏱️ {activeMovie.runtime}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                  {activeMovie.languages.join(', ')}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎬</span> {activeMovie.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl line-clamp-2">
                {activeMovie.synopsis}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">At Theatre:</span>
                <span className="text-xs font-black text-[#ff6325]">{venueName}</span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-400 font-medium">{address || 'Chennai Location'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 text-xs font-bold shrink-0 shadow-xs">
            <span>📱 Contactless Turnstile M-Ticket</span>
          </div>
        </div>

        {/* STEP PROGRESS BAR (BookMyShow standard 4 steps + Live 8-Min Seat Lock Timer) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 sm:px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${cinemaStep === 'SHOWTIMES' ? 'text-[#ff6325] font-black' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${cinemaStep === 'SHOWTIMES' ? 'bg-[#ff6325] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>1</span>
              <span>Date & Show</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600 font-normal">→</span>
            <div className={`flex items-center gap-1.5 ${cinemaStep === 'SEAT_COUNT' ? 'text-[#ff6325] font-black' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${cinemaStep === 'SEAT_COUNT' ? 'bg-[#ff6325] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>2</span>
              <span>Seats Qty</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600 font-normal">→</span>
            <div className={`flex items-center gap-1.5 ${cinemaStep === 'SEAT_LAYOUT' ? 'text-[#ff6325] font-black' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${cinemaStep === 'SEAT_LAYOUT' ? 'bg-[#ff6325] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>3</span>
              <span>Seat Layout</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600 font-normal">→</span>
            <div className={`flex items-center gap-1.5 ${cinemaStep === 'FNB_DRAWER' ? 'text-[#ff6325] font-black' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${cinemaStep === 'FNB_DRAWER' ? 'bg-[#ff6325] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>4</span>
              <span>Grab a Bite</span>
            </div>
          </div>

          {/* BookMyShow Live Seat Lock Indicator Banner (Runs in Stages 3 & 4) */}
          {(cinemaStep === 'SEAT_LAYOUT' || cinemaStep === 'FNB_DRAWER') && (
            <div className={`px-4 py-2 rounded-2xl flex items-center justify-between border transition-all ${seatLockExpired
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{seatLockExpired ? '⚠️' : '⏱️'}</span>
                <span className="text-xs font-bold">
                  {seatLockExpired
                    ? 'Seats Lock Expired! Another user may book these seats.'
                    : `Seats are locked for you in ${selectedAudiScreen}:`}
                </span>
                {!seatLockExpired && (
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {selectedCinemaSeats.join(', ') || `${passCount} Seats`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!seatLockExpired ? (
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Lock Expires In:</span>
                    <span className="font-mono text-xs font-black text-[#ff6325]">
                      {Math.floor(seatLockSecondsRemaining / 60).toString().padStart(2, '0')}:{(seatLockSecondsRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSeatLockSecondsRemaining(480);
                      setSeatLockExpired(false);
                      setIsSeatLockActive(true);
                    }}
                    className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase cursor-pointer hover:bg-rose-700 shadow-sm"
                  >
                    Renew Lock (8 Mins)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
             * STAGE 1: SHOWTIMES, DATE & MULTIPLEX AUDI SCHEDULE
             * ============================================================ */}
        {cinemaStep === 'SHOWTIMES' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Show Date Quick Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Select Show Date
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[0, 1, 2, 3, 4].map(offset => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const dStr = d.toISOString().split('T')[0];
                  const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                  const isSelected = selectedShowDate === dStr;

                  return (
                    <button
                      key={dStr}
                      type="button"
                      onClick={() => setSelectedShowDate(dStr)}
                      className={`px-4 py-2.5 rounded-2xl border text-center transition-all cursor-pointer shrink-0 ${isSelected
                        ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-md shadow-orange-500/20 font-black'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <span className="text-[10px] uppercase font-bold block opacity-80">{dayName}</span>
                      <span className="text-xs font-extrabold block mt-0.5">{dateLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Format & Audio Standard */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Experience Format & Audio Quality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {dynamicFormats.map(fmt => {
                  const isSelected = selectedScreenFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedScreenFormat(fmt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${isSelected
                        ? 'bg-[#ff6325]/10 border-[#ff6325] text-[#ff6325] shadow-xs ring-2 ring-[#ff6325]/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{fmt.icon}</span>
                        <span className="truncate">{fmt.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1 truncate">{fmt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Showtime Bands (Audi Screenings) */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Available Showtimes (Click timing to pick seats)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {dynamicShowtimes.map(show => (
                  <button
                    key={show.time}
                    type="button"
                    onClick={() => {
                      setSelectedShowTime(show.time);
                      setSelectedAudiScreen(show.audi);
                      setCinemaStep('SEAT_COUNT');
                    }}
                    className="p-3.5 rounded-2xl border text-center transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#ff6325] hover:bg-orange-50/30 text-slate-900 dark:text-white group hover:shadow-md"
                  >
                    <span className="text-base font-black block group-hover:text-[#ff6325]">{show.time}</span>
                    <span className="text-[11px] opacity-80 block mt-0.5">{show.audi}</span>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-2 ${show.status.includes('Full') ? 'bg-rose-500/15 text-rose-500' :
                      show.status.includes('Fast') ? 'bg-amber-500/15 text-amber-500' :
                        'bg-emerald-500/15 text-emerald-500'
                      }`}>
                      {show.status}
                    </span>
                    <span className="text-[10px] text-[#ff6325] font-extrabold block mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">Select Seats &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
             * STAGE 2: HOW MANY SEATS? (BOOKMYSHOW VEHICLE/AVATAR MODAL)
             * ============================================================ */}
        {cinemaStep === 'SEAT_COUNT' && (
          <div className="space-y-6 animate-fade-in py-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎟️</span> How Many Seats?
                </h3>
                <p className="text-xs text-slate-500">{selectedAudiScreen} • {selectedShowDate} • {selectedShowTime}</p>
              </div>
              <button
                type="button"
                onClick={() => setCinemaStep('SHOWTIMES')}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1"
              >
                ← Change Time
              </button>
            </div>

            {/* BMS Style Vehicles and Numbers Selector */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                const icon = n === 1 ? '🚲' : n === 2 ? '🛵' : n === 3 ? '🛺' : n <= 5 ? '🚗' : '🚌';
                const isSelected = passCount === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPassCount(n)}
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${isSelected
                      ? 'bg-[#ff6325] text-white border-[#ff6325] shadow-lg shadow-orange-500/30 scale-105 font-black'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-[#ff6325]'
                      }`}
                  >
                    <span className="text-base sm:text-lg mb-0.5">{icon}</span>
                    <span className="text-xs sm:text-sm font-black">{n}</span>
                  </button>
                );
              })}
            </div>

            {/* Available Price Tiers Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {dynamicSeatTiers.map(tier => (
                <div
                  key={tier.name}
                  onClick={() => setSelectedSeatZone(tier.name)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedSeatZone === tier.name
                    ? 'bg-[#ff6325]/10 border-[#ff6325] ring-2 ring-[#ff6325]/20'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10'
                    }`}
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{tier.icon} {tier.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</p>
                  </div>
                  <span className="text-sm font-black text-[#ff6325] shrink-0 ml-2">₹{tier.price}</span>
                </div>
              ))}
            </div>

            {/* Proceed to Seat Layout */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
              <span className="text-xs font-bold text-slate-500">
                Booking <span className="text-slate-900 dark:text-white font-extrabold">{passCount} seat{passCount > 1 ? 's' : ''}</span> under <span className="text-[#ff6325] font-extrabold">{selectedSeatZone}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  // Pre-populate adjacent seats matching count
                  const autoSeats = Array.from({ length: passCount }, (_, i) => `C${7 + i}`);
                  setSelectedCinemaSeats(autoSeats);
                  setSeatLockSecondsRemaining(480);
                  setSeatLockExpired(false);
                  setIsSeatLockActive(true);
                  setCinemaStep('SEAT_LAYOUT');
                }}
                className="px-6 py-3 rounded-xl bg-[#ff6325] hover:bg-[#e04e13] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Select Seats on Layout &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
             * STAGE 3: IMMERSIVE FULL THEATRE SEAT LAYOUT
             * ============================================================ */}
        {cinemaStep === 'SEAT_LAYOUT' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💺</span> {selectedAudiScreen} — Seat Layout
                </h3>
                <p className="text-xs text-slate-500">Click any seat to select or unselect. Target: {passCount} Seat{passCount > 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCinemaStep('SEAT_COUNT')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ← Change Qty ({passCount})
                </button>
                {/* Legend */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/20 inline-block" /> Free</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#ff6325] inline-block shadow-xs" /> Selected</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500 inline-block" /> Held by Other</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700 opacity-60 inline-block" /> Taken</span>
                </div>
              </div>
            </div>

            {/* Curved Screen Bar */}
            <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-center">
              <div className="w-3/4 mx-auto mb-6">
                <div className="h-2.5 rounded-t-full bg-gradient-to-r from-transparent via-[#ff6325] to-transparent shadow-md shadow-orange-500/30" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                  ⬇ SCREEN THIS WAY ⬇
                </p>
              </div>

              {/* Seat Grid Rows */}
              <div className="space-y-4 max-w-xl mx-auto overflow-x-auto pb-2">
                {/* Row A: Recliner */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-600 dark:text-amber-400 mb-1.5 px-2">
                    <span>{reclinerTier.icon} {reclinerTier.name}</span>
                    <span>₹{reclinerTier.price} / seat</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 w-3 text-center">A</span>
                    <div className="flex items-center gap-1.5">
                      {['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'].map(seatId => {
                        const isBooked = ['A3', 'A4'].includes(seatId);
                        const isHeldByOther = remoteLockedSeats.includes(seatId);
                        const isSelected = selectedCinemaSeats.includes(seatId);
                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={isBooked || isHeldByOther}
                            title={isHeldByOther ? `${seatId} is temporarily held by another customer` : seatId}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCinemaSeats(selectedCinemaSeats.filter(s => s !== seatId));
                              } else {
                                if (selectedCinemaSeats.length >= passCount) {
                                  // replace oldest
                                  setSelectedCinemaSeats([...selectedCinemaSeats.slice(1), seatId]);
                                } else {
                                  setSelectedCinemaSeats([...selectedCinemaSeats, seatId]);
                                }
                              }
                            }}
                            className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center justify-center ${isBooked
                              ? 'bg-slate-300 dark:bg-slate-700/60 text-slate-400 cursor-not-allowed opacity-50'
                              : isHeldByOther
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30 scale-105'
                                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:border-[#ff6325]'
                              }`}
                          >
                            {seatId.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Rows B, C, D: Prime */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-blue-600 dark:text-blue-400 mb-1.5 px-2">
                    <span>{primeTier.icon} {primeTier.name}</span>
                    <span>₹{primeTier.price} / seat</span>
                  </div>
                  <div className="space-y-1.5">
                    {['B', 'C', 'D'].map(row => (
                      <div key={row} className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-3 text-center">{row}</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                            const seatId = `${row}${num}`;
                            const isBooked = (row === 'B' && [2, 3].includes(num)) || (row === 'C' && [4, 5].includes(num));
                            const isHeldByOther = remoteLockedSeats.includes(seatId);
                            const isSelected = selectedCinemaSeats.includes(seatId);
                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isBooked || isHeldByOther}
                                title={isHeldByOther ? `${seatId} is temporarily held by another customer` : seatId}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCinemaSeats(selectedCinemaSeats.filter(s => s !== seatId));
                                  } else {
                                    if (selectedCinemaSeats.length >= passCount) {
                                      setSelectedCinemaSeats([...selectedCinemaSeats.slice(1), seatId]);
                                    } else {
                                      setSelectedCinemaSeats([...selectedCinemaSeats, seatId]);
                                    }
                                  }
                                }}
                                className={`w-6 h-6 rounded-md text-[9px] font-black transition-all cursor-pointer flex items-center justify-center ${isBooked
                                  ? 'bg-slate-300 dark:bg-slate-700/60 text-slate-400 cursor-not-allowed opacity-50'
                                  : isHeldByOther
                                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30 scale-105'
                                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:border-[#ff6325]'
                                  }`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rows E, F: Classic */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 dark:text-slate-400 mb-1.5 px-2">
                    <span>{classicTier.icon} {classicTier.name}</span>
                    <span>₹{classicTier.price} / seat</span>
                  </div>
                  <div className="space-y-1.5">
                    {['E', 'F'].map(row => (
                      <div key={row} className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-3 text-center">{row}</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                            const seatId = `${row}${num}`;
                            const isBooked = (row === 'E' && [7, 8].includes(num));
                            const isHeldByOther = remoteLockedSeats.includes(seatId);
                            const isSelected = selectedCinemaSeats.includes(seatId);
                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isBooked || isHeldByOther}
                                title={isHeldByOther ? `${seatId} is temporarily held by another customer` : seatId}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCinemaSeats(selectedCinemaSeats.filter(s => s !== seatId));
                                  } else {
                                    if (selectedCinemaSeats.length >= passCount) {
                                      setSelectedCinemaSeats([...selectedCinemaSeats.slice(1), seatId]);
                                    } else {
                                      setSelectedCinemaSeats([...selectedCinemaSeats, seatId]);
                                    }
                                  }
                                }}
                                className={`w-6 h-6 rounded-md text-[9px] font-black transition-all cursor-pointer flex items-center justify-center ${isBooked
                                  ? 'bg-slate-300 dark:bg-slate-700/60 text-slate-400 cursor-not-allowed opacity-50'
                                  : isHeldByOther
                                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30 scale-105'
                                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:border-[#ff6325]'
                                  }`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seat Status Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs px-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-700 dark:text-slate-200">Selected Seats:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {selectedCinemaSeats.length > 0 ? (
                      selectedCinemaSeats.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-[#ff6325] text-white font-black text-[10px]">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No seats clicked</span>
                    )}
                  </div>
                </div>
                <span className="text-slate-500 font-bold">
                  {selectedCinemaSeats.length} / {passCount} Seats Selected
                </span>
              </div>
            </div>

            {/* Seat Layout Bottom Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
              <div>
                {(() => {
                  let ticketPrice = 0;
                  selectedCinemaSeats.forEach(seat => {
                    if (seat.startsWith('A')) ticketPrice += reclinerTier.price;
                    else if (['B', 'C', 'D'].includes(seat[0])) ticketPrice += primeTier.price;
                    else ticketPrice += classicTier.price;
                  });
                  if (selectedCinemaSeats.length === 0) ticketPrice = primeTier.price * passCount;
                  return (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Total</span>
                      <span className="text-xl font-black text-[#ff6325]">₹{ticketPrice.toLocaleString()}</span>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCinemaStep('FNB_DRAWER')}
                  className="px-6 py-3 rounded-xl bg-[#ff6325] hover:bg-[#e04e13] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Proceed to Grab a Bite &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
             * STAGE 4: GRAB A BITE (BOOKMYSHOW GOURMET CONCESSIONS DRAWER)
             * ============================================================ */}
        {cinemaStep === 'FNB_DRAWER' && (
          <div className="space-y-6 animate-fade-in py-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🍿</span> Grab a Bite! (Pre-order & Save 20%)
                </h3>
                <p className="text-xs text-slate-500">Delicious cinema popcorn, warm nachos, and beverages delivered right to your seat</p>
              </div>
              <button
                type="button"
                onClick={() => setCinemaStep('SEAT_LAYOUT')}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ← Change Seats ({selectedCinemaSeats.join(', ')})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {dynamicSnacks.map((snk, idx) => {
                const isAdded = idx === 0 ? popcornComboAddon : idx === 1 ? snackNachosAddon : snackBeverageAddon;
                const toggleFn = idx === 0 ? () => setPopcornComboAddon(!popcornComboAddon) : idx === 1 ? () => setSnackNachosAddon(!snackNachosAddon) : () => setSnackBeverageAddon(!snackBeverageAddon);
                return (
                  <div
                    key={snk.id || snk.name}
                    onClick={toggleFn}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isAdded
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{snk.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{snk.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{snk.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-200/60 dark:border-white/10">
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">+₹{snk.price}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isAdded ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {isAdded ? '✓ Added' : '+ Add'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Order Summary & Handover to Checkout */}
            {(() => {
              const count = Math.max(1, selectedCinemaSeats.length);
              let ticketPrice = 0;
              selectedCinemaSeats.forEach(seat => {
                if (seat.startsWith('A')) ticketPrice += reclinerTier.price;
                else if (['B', 'C', 'D'].includes(seat[0])) ticketPrice += primeTier.price;
                else ticketPrice += classicTier.price;
              });
              if (selectedCinemaSeats.length === 0) ticketPrice = primeTier.price * count;

              const s0Price = dynamicSnacks[0]?.price || 240;
              const s1Price = dynamicSnacks[1]?.price || 180;
              const s2Price = dynamicSnacks[2]?.price || 120;
              const fnbCost = (popcornComboAddon ? s0Price : 0) + (snackNachosAddon ? s1Price : 0) + (snackBeverageAddon ? s2Price : 0);
              const subtotal = ticketPrice + fnbCost;

              return (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {venueName} • {selectedAudiScreen} ({count} Ticket{count > 1 ? 's' : ''})
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      {selectedShowDate} • {selectedShowTime} • {selectedScreenFormat} • Seats: {selectedCinemaSeats.join(', ') || 'Auto-assigned'}
                      {fnbCost > 0 ? ` • +₹${fnbCost} Concessions` : ' • No F&B added'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                      <span className="text-xl font-black text-[#ff6325]">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService({
                          id: `ent-pass-${Date.now()}`,
                          name: `${activeMovie.title} — ${selectedScreenFormat}`,
                          price: subtotal,
                          imageUrl: activeMovie.posterUrl,
                          metadata: {
                            isEntertainmentBooking: true,
                            movieTitle: activeMovie.title,
                            moviePoster: activeMovie.posterUrl,
                            certificate: activeMovie.certificate,
                            runtime: activeMovie.runtime,
                            entertainmentBooking: {
                              movieTitle: activeMovie.title,
                              moviePoster: activeMovie.posterUrl,
                              venueName,
                              category,
                              showDate: selectedShowDate,
                              showTime: selectedShowTime,
                              format: selectedScreenFormat,
                              audiScreen: selectedAudiScreen,
                              seatZone: selectedSeatZone,
                              seats: selectedCinemaSeats,
                              ticketsCount: count,
                              fnbAddons: {
                                popcorn: popcornComboAddon,
                                nachos: snackNachosAddon,
                                beverage: snackBeverageAddon
                              },
                              totalPayable: subtotal
                            }
                          }
                        });
                        setSelectedSlot({
                          id: `ent-slot-${Date.now()}`,
                          timeStr: `${activeMovie.title} • ${selectedShowDate} at ${selectedShowTime} (${selectedScreenFormat})`,
                          date: selectedShowDate,
                          available: true
                        });
                        router.push('/booking/checkout');
                      }}
                      className="px-6 py-3 rounded-xl bg-[#ff6325] hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      Book M-Ticket &rarr;
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  })()
}

{/* ============================================================
         * SECTION D8: HOME REPAIR & CLEANING VISITS (ARCHETYPE 6: HomeCall)
         * ============================================================ */}
{
  isHomeCall && (
    <div id="home-services-booking-section" className="space-y-6 mt-8 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🛠️</span> Doorstep Home Visit & Inspection
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pay only ₹199 inspection fee upfront. Spare parts and extra labor quoted after physical check.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50 text-xs font-bold">
          <span>🛡️ BOKSPOT 30-Day Service Guarantee</span>
        </div>
      </div>

      {/* Service Category */}
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
          Type of Issue / Service Needed
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['Inspection & Diagnosis', 'Major Repair / Wiring', 'Periodic Maintenance'].map(cat => (
            <div
              key={cat}
              onClick={() => setHomeIssueCategory(cat)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${homeIssueCategory === cat
                ? 'bg-[#033266]/5 dark:bg-[#ff6325]/10 border-[#033266] dark:border-[#ff6325]'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300'
                }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white">{cat}</span>
              <span className="text-xs font-black text-[#033266] dark:text-[#ff6325]">₹199</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Visit Time Slot */}
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
          Select Technician Arrival Window
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            'Morning (09:00 AM - 12:00 PM)',
            'Afternoon (01:00 PM - 04:00 PM)',
            'Evening (04:30 PM - 07:30 PM)'
          ].map(win => (
            <button
              key={win}
              type="button"
              onClick={() => setPreferredHomeWindow(win)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${preferredHomeWindow === win
                ? 'bg-[#033266] dark:bg-[#ff6325] text-white border-transparent shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-[#033266] dark:hover:border-[#ff6325] text-slate-900 dark:text-white'
                }`}
            >
              <span className="text-xs font-black block">{win}</span>
              <span className="text-[10px] opacity-75 font-semibold mt-0.5 block">Verified Professional</span>
            </button>
          ))}
        </div>
      </div>

      {/* Service Address Input */}
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
          Doorstep Service Address
        </label>
        <input
          type="text"
          value={homeAddressLine}
          onChange={(e) => setHomeAddressLine(e.target.value)}
          placeholder="Door / Flat No., Street Name, Apartment Landmark..."
          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#033266] dark:focus:border-[#ff6325]"
        />
      </div>

      {/* Booking Action Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-slate-900 dark:text-white block">
            {homeIssueCategory}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Arrival: {preferredHomeWindow} • ₹199 Inspection Fee
          </span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Upfront Visiting Fee</span>
            <span className="text-xl font-black text-[#033266] dark:text-[#ff6325]">₹199</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedService({
                id: `homecall-${Date.now()}`,
                name: `${venueName} — ${homeIssueCategory}`,
                price: 199,
                metadata: {
                  homeCallBooking: {
                    venueName,
                    issueCategory: homeIssueCategory,
                    arrivalWindow: preferredHomeWindow,
                    serviceAddress: homeAddressLine || address,
                    upfrontVisitingFee: 199
                  }
                }
              });
              setSelectedSlot({
                id: `home-slot-${Date.now()}`,
                timeStr: `${preferredHomeWindow} (Doorstep Visit)`,
                date: selectedDate,
                available: true
              });
              router.push('/booking/checkout');
            }}
            className="px-6 py-3 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Book Doorstep Visit &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

{/* ============================================================
         * PROPERTY HIGHLIGHTS & OVERVIEW CARD (PLACED BELOW BOOKING OPTIONS)
         * ============================================================ */}


{/* ============================================================
         * SECTION D1: AGODA-STYLE SUB-NAV & OVERVIEW (AFTER SELECT ROOM)
         * ============================================================ */}
<div className="space-y-6 mb-10">
  {/* 1. Agoda Sub-Navigation Bar (Removed Rooms button, Dynamic Tab Switching) */}
  <div className="bg-white dark:bg-[#0f1219] rounded-2xl border border-slate-200/90 dark:border-white/10 p-2 sm:px-4 shadow-2xs flex items-center justify-start overflow-x-auto custom-scrollbar">
    <div className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
      <button
        type="button"
        onClick={() => setActiveSubNavTab('overview')}
        className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${activeSubNavTab === 'overview'
          ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        Overview
      </button>
      <button
        type="button"
        onClick={() => setActiveSubNavTab('facilities')}
        className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${activeSubNavTab === 'facilities'
          ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        Facilities
      </button>
      <button
        type="button"
        onClick={() => setActiveSubNavTab('location')}
        className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${activeSubNavTab === 'location'
          ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        Location
      </button>
      <button
        type="button"
        onClick={() => setActiveSubNavTab('policies')}
        className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${activeSubNavTab === 'policies'
          ? 'bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border-b-2 border-[#033266] dark:border-[#ff6325] font-black'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        Policies
      </button>
      {/* Mini Space (Bag Locker) Tab: Controlled dynamically by Business toggle across all 54 categories */}
      {isHotelLuggageEnabled && (
        <button
          type="button"
          onClick={() => setActiveSubNavTab('mini-space')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 border ${activeSubNavTab === 'mini-space'
            ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
        >
          <span>🧳</span>
          <span className="font-bold">Mini Space (Bag Locker)</span>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${activeSubNavTab === 'mini-space' ? 'bg-black text-amber-300' : 'bg-amber-500 text-white'
            }`}>
            Hourly
          </span>
        </button>
      )}
    </div>
  </div>

  {/* 2. Main Agoda Content — Header stays in place, content below switches dynamically */}
  <div id="agoda-overview-section" className="space-y-6">

    {/* TAB CONTENT: OVERVIEW (Name Card + Highlights + Staycation + About + Mini Map sidebar) */}
    {activeSubNavTab === 'overview' && (
      <div className="space-y-6">
        {/* Property Identity & Address (Only in Overview) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
              {finalMerchantObj.metadata?.offerBadge || 'Best Seller'}
            </span>
            <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
              <span>★ ★ ★ ★</span>
              <span className="text-[10px] text-slate-400 font-semibold ml-1">BokSpot Preferred</span>
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {venueName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center flex-wrap gap-1.5">
              <span>{address || `${city || 'Chennai'}, Tamil Nadu`}</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveSubNavTab('location')}
                className="text-[#033266] dark:text-[#ff6325] font-extrabold hover:underline uppercase text-[11px] cursor-pointer"
              >
                SEE MAP
              </button>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Highlights */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Highlights
              </h3>
              <div className="space-y-3.5">
                {(() => {
                  const defaultStayHighlights = [
                    {
                      icon: '🍳',
                      title: 'Great breakfast & inclusions',
                      description: finalMerchantObj.metadata?.breakfastDetails || 'Breakfast buffet gets strong praise for its wide spread, varied choices, and fresh multi-cuisine preparations.'
                    },
                    {
                      icon: '🍽️',
                      title: 'Great food & dining',
                      description: 'In-house multi-cuisine dining options with seafood specialties and room service options praised by guests.'
                    },
                    {
                      icon: '🛎️',
                      title: 'Professional guest services',
                      description: 'Dedicated 24/7 front desk, warm concierge, express check-in, and personalized butler assistance.'
                    },
                    {
                      icon: '✨',
                      title: 'Sparkling clean & hygienic',
                      description: 'Rooms are regularly sanitized and described as clean, neat, and well kept with spotless linen.'
                    },
                    {
                      icon: '🏊',
                      title: 'Top property leisure facilities',
                      description: 'Private swimming pool, lawn garden, sun deck, and entertainment conveniences designed for staycations.'
                    }
                  ];

                  const defaultFacilityHighlights = [
                    {
                      icon: '⚽',
                      title: 'FIFA Standard Astro Turf',
                      description: 'High-density 50mm monofilament synthetic grass with shock-absorbing rubber infill engineered for all-weather play.'
                    },
                    {
                      icon: '💡',
                      title: 'High-Mast LED Floodlights',
                      description: 'Stadium-grade anti-glare illumination across all pitch zones ensuring seamless evening and late-night matches.'
                    },
                    {
                      icon: '🚿',
                      title: 'Player Changing Rooms & Showers',
                      description: 'Hygienic private dressing rooms, lockers, and clean showers ready for teams before and after games.'
                    },
                    {
                      icon: '🪑',
                      title: 'Covered Team Dugouts & Spectator Seating',
                      description: 'Weather-protected substitutes benches, scoring tables, and viewing spaces for fans and guests.'
                    },
                    {
                      icon: '🚗',
                      title: 'Dedicated Parking & Amenities',
                      description: 'Spacious on-site two-wheeler and car parking, RO drinking water dispenser, and first-aid support.'
                    }
                  ];

                  const activeHighlights = isFacility
                    ? ((Array.isArray(firstSvc?.metadata?.highlights) && firstSvc.metadata.highlights.length > 0)
                      ? firstSvc.metadata.highlights
                      : defaultFacilityHighlights)
                    : ((Array.isArray(finalMerchantObj.metadata?.highlights) && finalMerchantObj.metadata.highlights.length > 0)
                      ? finalMerchantObj.metadata.highlights
                      : defaultStayHighlights);

                  return activeHighlights.map((hl: any, idx: number) => {
                    const iconBgColors = [
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    ];
                    const colorClass = iconBgColors[idx % iconBgColors.length];

                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${colorClass}`}>
                          {hl.icon || '⭐'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">
                            {hl.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {hl.description}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>


            {/* About Us */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                About us
              </h3>
              <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                <p>
                  {aboutText
                    ? (isAboutExpanded || aboutText.length <= 260 ? aboutText : `${aboutText.slice(0, 260)}...`)
                    : isFacility
                      ? `Welcome to ${venueName}, the premier sports arena in ${city || 'Chennai'}. Featuring FIFA certified AstroTurf, floodlights, team dugouts, clean amenities, and equipment support for non-stop action.`
                      : `Indulge in a luxurious stay at ${venueName} situated on the scenic ${city || 'Chennai'} corridor. Immerse yourself in the vibrant culture while exploring nearby beaches, entertainment hubs, and serene gardens. Experience signature hospitality, private pools, and bespoke concierge care.`}
                </p>
                {aboutText && aboutText.length > 260 && (
                  <button
                    type="button"
                    onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                    className="mt-2 text-xs font-extrabold text-[#033266] dark:text-[#ff6325] hover:underline cursor-pointer block"
                  >
                    {isAboutExpanded ? 'Show less ←‘' : 'Read more →'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) Map Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
              {/* Map Preview */}
              {(() => {
                const lat = finalMerchantObj.latitude || liveServices[0]?.merchantObj?.latitude;
                const lng = finalMerchantObj.longitude || liveServices[0]?.merchantObj?.longitude;
                const mapQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(address || venueName || 'Chennai');

                return (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 bg-slate-100 dark:bg-slate-800 group shadow-sm">
                    <div className="h-40 w-full relative">
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
                    <button
                      type="button"
                      onClick={() => setActiveSubNavTab('location')}
                      className="absolute inset-0 bg-black/30 hover:bg-black/40 flex items-center justify-center transition-colors group cursor-pointer"
                    >
                      <span className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                        SEE MAP
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* Location Score Pill */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    8.2 Excellent
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                    Top Rated Area
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Excellent location — situated conveniently near beaches and transport routes in {city || 'Chennai'}.
                </p>
              </div>

              {/* Parking Tag */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">🅿️ Parking</span>
                <span className="text-emerald-600 dark:text-emerald-400 uppercase font-black text-[11px]">FREE</span>
              </div>

              {/* What's Nearby Distances */}
              {Array.isArray(finalMerchantObj.metadata?.aroundProperty) && finalMerchantObj.metadata.aroundProperty.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                  <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 block tracking-wider">
                    See nearby places
                  </span>
                  <div className="space-y-2">
                    {finalMerchantObj.metadata.aroundProperty.slice(0, 4).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                          📍 {item.name || item.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] shrink-0">
                          {item.distance || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* TAB CONTENT: FACILITIES (Full Grid) */}
    {activeSubNavTab === 'facilities' && (
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Property Facilities & Inclusions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified amenities provided directly for guests staying at {venueName}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#033266]/5 dark:bg-[#ff6325]/10 text-[#033266] dark:text-[#ff6325] font-black text-xs">
            {amenities.length} Verified Facilities
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
          ... [truncated for diff preview]
          {(amenities.length > 0 ? amenities : ['Free Wi-Fi', 'Swimming pool', 'Free parking', 'Spa & Jacuzzi', 'Front desk [24-hour]', 'Fitness center', 'Restaurants', 'Bar & Lounge', 'Air Conditioned', 'Daily Housekeeping', 'Butler Service', 'Power Backup']).map((item: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate text-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* TAB CONTENT: LOCATION (Full interactive map + Directions + Places) */}
    {activeSubNavTab === 'location' && (
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Location & Nearby Landmarks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {address || `${city || 'Chennai'}, Tamil Nadu`}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
            8.2 Top Rated Location
          </span>
        </div>

        {(() => {
          const lat = finalMerchantObj.latitude || liveServices[0]?.merchantObj?.latitude;
          const lng = finalMerchantObj.longitude || liveServices[0]?.merchantObj?.longitude;
          const mapQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(address || venueName || 'Chennai');

          return (
            <div className="space-y-4">
              <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative">
                <iframe
                  title="Property Location Detailed Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Need driving navigation directly in Google Maps?
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#033266] dark:bg-[#ff6325] text-white rounded-xl text-xs font-black shadow-sm hover:opacity-95 transition-opacity"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          );
        })()}

        {/* Nearby Places */}
        {Array.isArray(finalMerchantObj.metadata?.aroundProperty) && finalMerchantObj.metadata.aroundProperty.length > 0 && (
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Walking & Driving Distances
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {finalMerchantObj.metadata.aroundProperty.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    📍 {item.name || item.title}
                  </span>
                  <span className="text-xs font-extrabold text-[#033266] dark:text-[#ff6325] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 shadow-2xs">
                    {item.distance || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    {/* TAB CONTENT: POLICIES (Full detailed list) */}
    {activeSubNavTab === 'policies' && (
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-5">
        <div className="border-b border-slate-100 dark:border-white/10 pb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Property Policies & Stay Rules
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Important rules and check-in guidelines for guests staying at {venueName}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
          {isPgStay && (
            <>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40">
                <span className="text-[#ff6325] font-black text-sm mt-0.5">🚪</span>
                <div>
                  <strong className="block text-slate-900 dark:text-white">Gate Curfew & Access Timings</strong>
                  <span>{pgGateCurfew}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-blue-600 font-black text-sm mt-0.5">👥</span>
                <div>
                  <strong className="block text-slate-900 dark:text-white">Stay Exclusivity</strong>
                  <span>{pgGenderType === 'ladies' ? 'Ladies Only PG (Strictly Female Guests)' : pgGenderType === 'gents' ? 'Gents Only PG (Strictly Male Guests)' : 'Unisex / Coliving Community'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-emerald-600 font-black text-sm mt-0.5">🍲</span>
                <div>
                  <strong className="block text-slate-900 dark:text-white">Food / Mess Policy</strong>
                  <span>{pgFoodIncluded ? '3 Daily Meals Included with optional food exclusion discount' : 'Self-Cooking & external food allowed'}</span>
                </div>
              </div>
            </>
          )}
          {(Array.isArray(finalMerchantObj.metadata?.policies) && finalMerchantObj.metadata.policies.length > 0
            ? finalMerchantObj.metadata.policies
            : [
              'Valid Government ID required for all guests at check-in (Aadhaar / Passport / DL)',
              `Standard Check-in is ${finalMerchantObj.metadata?.checkInTime || '12:00 PM'} and Check-out is ${finalMerchantObj.metadata?.checkOutTime || '11:00 AM'}`,
              'Couples and families are warmly welcome',
              'Smoking strictly prohibited in air-conditioned suites and indoor areas',
              'Pets permitted in designated private villa lawns with prior intimation',
              'Quiet hours observed after 10:30 PM for guest relaxation'
            ]
          ).map((policy: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
              <span className="text-[#033266] dark:text-[#ff6325] font-black text-sm mt-0.5">•</span>
              <span className="leading-relaxed">{policy}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* TAB CONTENT: MINI SPACE (Luggage & Cloakroom Temporary Drop) */}
    {isHotelLuggageEnabled && activeSubNavTab === 'mini-space' && (
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                BokSpot Cloakroom Network
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> CCTV Monitored & Insured
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🧳</span> Mini Space — Luggage & Item Drop (Bag Locker)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Traveling or waiting for your train/flight? Safely store your luggage, backpacks, and personal baggage at {venueName} frontdesk and collect anytime with your instant QR gate pass.
            </p>
          </div>

          <div className="text-right shrink-0 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-2xl">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider block">Storage Tariff</span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-[11px] font-bold text-slate-500">From</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">₹{getCategoryRate('handbag', 0.5)}</span>
              <span className="text-xs text-slate-500 font-semibold">/hr</span>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold block mt-0.5">
              Full-Day Cap @ ₹{hotelLuggageDayPassRate}/24h
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Left: Input Selection */}
          <div className="md:col-span-2 space-y-4">
            {/* Multi-Item Luggage Selection (Mix and match Handbags, Backpacks, Trolleys, Boxes, Bulky items) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block tracking-wider">
                  Select Your Bags & Luggage (Mixed Items Allowed)
                </label>
                <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                  Total: {miniSpaceItemCounts.handbag + miniSpaceItemCounts.backpack + miniSpaceItemCounts.standard + miniSpaceItemCounts.box + miniSpaceItemCounts.bulky} Items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'handbag' as const, label: 'Handbag', sub: 'Pouch, sleeves', icon: '👛', multiplier: 0.5, weight: 'Upto 3 kg', slotWeight: 0.5 },
                  { id: 'backpack' as const, label: 'Backpack', sub: 'Laptop & kit bags', icon: '🎒', multiplier: 0.8, weight: '5-8 kg', slotWeight: 1 },
                  { id: 'standard' as const, label: 'Trolley Bag', sub: 'Cabin or check-in', icon: '🧳', multiplier: 1.0, weight: '10-20 kg', slotWeight: 1 },
                  { id: 'box' as const, label: 'Carton Box', sub: 'Parcels, goods', icon: '📦', multiplier: 1.2, weight: '15-30 kg', slotWeight: 2 },
                  { id: 'bulky' as const, label: 'Bulky Gear', sub: 'Bike gear, sports', icon: '🚲', multiplier: 1.5, weight: '30+ kg', slotWeight: 3 },
                ].map((item) => {
                  const count = miniSpaceItemCounts[item.id];
                  const itemRate = getCategoryRate(item.id, item.multiplier);
                  const isAdded = count > 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${isAdded
                        ? 'bg-amber-500/10 border-amber-500/80 shadow-xs ring-1 ring-amber-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">{item.label}</span>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                              ₹{itemRate}/h
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block whitespace-nowrap">
                            {item.weight} • {item.sub}
                          </span>
                        </div>
                      </div>

                      {/* Stepper for this specific item type */}
                      <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-700/80 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
                        <button
                          type="button"
                          disabled={count <= 0}
                          onClick={() => setMiniSpaceItemCounts(prev => ({ ...prev, [item.id]: Math.max(0, prev[item.id] - 1) }))}
                          className="w-6 h-6 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-xs disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-black text-xs text-slate-900 dark:text-white">
                          {count}
                        </span>
                        <button
                          type="button"
                          disabled={count >= 10}
                          onClick={() => setMiniSpaceItemCounts(prev => ({ ...prev, [item.id]: Math.min(10, prev[item.id] + 1) }))}
                          className="w-6 h-6 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Storage Duration Stepper with total hourly rate */}
              {(() => {
                const handbagRate = getCategoryRate('handbag', 0.5);
                const backpackRate = getCategoryRate('backpack', 0.8);
                const standardRate = getCategoryRate('standard', 1.0);
                const boxRate = getCategoryRate('box', 1.2);
                const bulkyRate = getCategoryRate('bulky', 1.5);

                const totalHourly =
                  (miniSpaceItemCounts.handbag * handbagRate) +
                  (miniSpaceItemCounts.backpack * backpackRate) +
                  (miniSpaceItemCounts.standard * standardRate) +
                  (miniSpaceItemCounts.box * boxRate) +
                  (miniSpaceItemCounts.bulky * bulkyRate);

                return (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200/50 dark:border-white/5">
                      <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block tracking-wider">
                        Storage Duration
                      </label>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold whitespace-nowrap bg-amber-500/10 px-2 py-0.5 rounded-md">
                        Combined Rate: ₹{totalHourly}/hr
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-sm font-black text-slate-900 dark:text-white block">
                          {miniSpaceHours} {miniSpaceHours > 1 ? 'Hours' : 'Hour'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Flexible Hourly Slot (1 - 24 hrs)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={miniSpaceHours <= 1}
                          onClick={() => setMiniSpaceHours(Math.max(1, miniSpaceHours - 1))}
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-700 hover:bg-slate-100 flex items-center justify-center font-black disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-sm">{miniSpaceHours}h</span>
                        <button
                          type="button"
                          disabled={miniSpaceHours >= 24}
                          onClick={() => setMiniSpaceHours(Math.min(24, miniSpaceHours + 1))}
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-700 hover:bg-slate-100 flex items-center justify-center font-black cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Luggage Security & Facility Note */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-lg font-black shrink-0">
                  🛡️
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">CCTV & Tamper Sealed</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                    Each bag receives an individual tamper-proof numerical barcode tag & 24/7 bell desk guard protection.
                  </span>
                </div>
              </div>
            </div>

            {/* Drop-off Date & Handover Time Selector Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">📅</span>
                    <span className="text-xs uppercase font-black text-slate-900 dark:text-white tracking-wider">
                      Luggage Handover Date & Time
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Frontdesk bell desk operates 24x7. Select the exact date & time you will arrive to drop your bags.
                  </p>
                </div>

                {/* Live Auto Pick-up calculation badge */}
                {(() => {
                  const h = parseInt(miniSpaceDropHour, 10);
                  const m = parseInt(miniSpaceDropMinute, 10);
                  let h24 = miniSpaceDropPeriod === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
                  const totalH = (h24 + miniSpaceHours) % 24;
                  const pickPeriod = totalH >= 12 ? 'PM' : 'AM';
                  const displayH = totalH % 12 || 12;
                  const formattedPick = `${displayH}:${m < 10 ? '0' : ''}${m} ${pickPeriod}`;
                  return (
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto shadow-2xs">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-black tracking-wider">Est. Collection:</span>
                      <span className="font-black font-mono text-xs">{formattedPick}</span>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1) Drop-off Date - Custom BokSpot Calendar */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                    Handover / Drop Date
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const d = miniSpaceDropDate ? new Date(miniSpaceDropDate) : new Date();
                      setMiniSpaceCalMonth(isNaN(d.getTime()) ? new Date() : d);
                      setIsMiniSpaceCalOpen(!isMiniSpaceCalOpen);
                    }}
                    className="w-full bg-white dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between outline-none cursor-pointer transition-colors focus:border-amber-500 shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#ff6325] shrink-0" />
                      <span>
                        {(() => {
                          try {
                            const parsed = new Date(miniSpaceDropDate);
                            if (isNaN(parsed.getTime())) return miniSpaceDropDate;
                            return parsed.toLocaleDateString('en-GB', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            });
                          } catch {
                            return miniSpaceDropDate;
                          }
                        })()}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700">
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isMiniSpaceCalOpen ? 'rotate-180 text-amber-600' : ''}`} />
                    </span>
                  </button>

                  {/* Custom Popover Calendar */}
                  <AnimatePresence>
                    {isMiniSpaceCalOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsMiniSpaceCalOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.16 }}
                          className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-3.5 space-y-3"
                        >
                          {/* Month & Navigation Header */}
                          <div className="flex items-center justify-between">
                            <div className="font-black text-xs text-slate-800 dark:text-white">
                              {miniSpaceCalMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMiniSpaceCalMonth(new Date(miniSpaceCalMonth.getFullYear(), miniSpaceCalMonth.getMonth() - 1, 1));
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <ChevronLeft size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMiniSpaceCalMonth(new Date(miniSpaceCalMonth.getFullYear(), miniSpaceCalMonth.getMonth() + 1, 1));
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Days Header */}
                          <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                              <div key={day} className="py-1">{day}</div>
                            ))}
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {(() => {
                              const year = miniSpaceCalMonth.getFullYear();
                              const month = miniSpaceCalMonth.getMonth();
                              const firstDay = new Date(year, month, 1).getDay();
                              const daysInMonth = new Date(year, month + 1, 0).getDate();
                              const cells = [];
                              const todayObj = new Date();
                              todayObj.setHours(0, 0, 0, 0);

                              for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-${i}`} className="h-8" />);
                              }

                              for (let d = 1; d <= daysInMonth; d++) {
                                const cellDate = new Date(year, month, d);
                                cellDate.setHours(0, 0, 0, 0);
                                const isPast = cellDate < todayObj;
                                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const isSelected = miniSpaceDropDate === dStr;
                                const isToday = cellDate.getTime() === todayObj.getTime();

                                cells.push(
                                  <div key={d} className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      disabled={isPast}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMiniSpaceDropDate(dStr);
                                        setIsMiniSpaceCalOpen(false);
                                      }}
                                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${isSelected
                                        ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30 font-black'
                                        : isToday
                                          ? 'border-2 border-[#ff6325] text-[#ff6325] font-black'
                                          : isPast
                                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-amber-500/15 hover:text-[#ff6325] cursor-pointer'
                                        }`}
                                    >
                                      {d}
                                    </button>
                                  </div>
                                );
                              }
                              return cells;
                            })()}
                          </div>

                          {/* Quick Jump: Today & Close */}
                          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const todayStr = new Date().toISOString().split('T')[0];
                                setMiniSpaceDropDate(todayStr);
                                setMiniSpaceCalMonth(new Date());
                                setIsMiniSpaceCalOpen(false);
                              }}
                              className="font-bold text-[#ff6325] hover:underline cursor-pointer"
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMiniSpaceCalOpen(false);
                              }}
                              className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2) Drop-off Time Custom Pickers (Hour, Minute, AM/PM) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                    Handover Time (Hour : Min : AM/PM)
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Hour Select */}
                    <select
                      value={miniSpaceDropHour}
                      onChange={(e) => setMiniSpaceDropHour(e.target.value)}
                      className="w-1/3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-amber-500 text-center"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hr => (
                        <option key={hr} value={hr}>{hr}</option>
                      ))}
                    </select>

                    <span className="font-black text-slate-400">:</span>

                    {/* Minute Select */}
                    <select
                      value={miniSpaceDropMinute}
                      onChange={(e) => setMiniSpaceDropMinute(e.target.value)}
                      className="w-1/3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-amber-500 text-center"
                    >
                      {['00', '15', '30', '45'].map(min => (
                        <option key={min} value={min}>{min}</option>
                      ))}
                    </select>

                    {/* AM/PM Switch Buttons */}
                    <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-white/10 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMiniSpaceDropPeriod('AM')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${miniSpaceDropPeriod === 'AM'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setMiniSpaceDropPeriod('PM')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${miniSpaceDropPeriod === 'PM'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Luggage Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">
                  Luggage Details & Special Instructions
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  Tagging & Luggage Protection
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Bag Description (Colors / Brands / Items)</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Blue American Tourister Trolley + 1 Black Laptop Bag"
                  value={miniSpaceBagDesc}
                  onChange={(e) => setMiniSpaceBagDesc(e.target.value)}
                  className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Security Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Tamper-proof seal tags</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>₹10,000 Bag Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Instant QR Pass upon checkout</span>
              </div>
            </div>
          </div>

          {/* Right: Price Summary & Book Drop Button */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Cloakroom Summary
            </h4>

            {(() => {
              const totalBags =
                miniSpaceItemCounts.handbag +
                miniSpaceItemCounts.backpack +
                miniSpaceItemCounts.standard +
                miniSpaceItemCounts.box +
                miniSpaceItemCounts.bulky;

              // Slot weights: Handbag=0.5, Backpack=1, Trolley=1.5, Box=2, Bulky=3
              const requestedSlots =
                (miniSpaceItemCounts.handbag * 0.5) +
                (miniSpaceItemCounts.backpack * 1) +
                (miniSpaceItemCounts.standard * 1.5) +
                (miniSpaceItemCounts.box * 2) +
                (miniSpaceItemCounts.bulky * 3);

              // Rates configured directly by Business Owner
              const handbagRate = getCategoryRate('handbag', 0.5);
              const backpackRate = getCategoryRate('backpack', 0.8);
              const standardRate = getCategoryRate('standard', 1.0);
              const boxRate = getCategoryRate('box', 1.2);
              const bulkyRate = getCategoryRate('bulky', 1.5);

              const totalHourlyRate =
                (miniSpaceItemCounts.handbag * handbagRate) +
                (miniSpaceItemCounts.backpack * backpackRate) +
                (miniSpaceItemCounts.standard * standardRate) +
                (miniSpaceItemCounts.box * boxRate) +
                (miniSpaceItemCounts.bulky * bulkyRate);

              // Radical / Bounce Hybrid: 24-hr daily capped pricing pass per item
              const maxDailyCapTotal = totalBags * hotelLuggageDayPassRate;
              const standardHoursTotal = totalHourlyRate * miniSpaceHours;
              // If customer stores for full day or hourly total exceeds daily cap, apply daily cap
              const isDailyCapApplied = miniSpaceHours >= 6 && standardHoursTotal > maxDailyCapTotal;
              const totalAmount = isDailyCapApplied ? maxDailyCapTotal : standardHoursTotal;

              // Breakdown string for UI
              const breakdownItems: string[] = [];
              if (miniSpaceItemCounts.handbag > 0) breakdownItems.push(`${miniSpaceItemCounts.handbag}x Handbag`);
              if (miniSpaceItemCounts.backpack > 0) breakdownItems.push(`${miniSpaceItemCounts.backpack}x Backpack`);
              if (miniSpaceItemCounts.standard > 0) breakdownItems.push(`${miniSpaceItemCounts.standard}x Trolley`);
              if (miniSpaceItemCounts.box > 0) breakdownItems.push(`${miniSpaceItemCounts.box}x Box`);
              if (miniSpaceItemCounts.bulky > 0) breakdownItems.push(`${miniSpaceItemCounts.bulky}x Bulky`);

              // Real-time capacity check using live bookings
              const activeMerchantBookings = (bookings || []).filter((b: any) => {
                const isMatch = (b.merchantId === merchantId) || (b.metadata?.miniSpace && b.merchantName === venueName);
                const isConfirmed = b.status === 'CONFIRMED' || b.status === 'ACTIVE';
                const isSameDate = b.date === (miniSpaceDropDate || new Date().toISOString().split('T')[0]);
                return isMatch && isConfirmed && isSameDate && Boolean(b.metadata?.miniSpace);
              });

              const currentlyOccupied = activeMerchantBookings.reduce((sum: number, b: any) => {
                const ms = b.metadata?.miniSpace;
                if (!ms) return sum;
                if (ms.requestedSlots) return sum + ms.requestedSlots;
                if (ms.itemBreakdown) {
                  const ib = ms.itemBreakdown;
                  return sum +
                    ((ib.handbag || 0) * 0.5) +
                    ((ib.backpack || 0) * 1) +
                    ((ib.standard || 0) * 1.5) +
                    ((ib.box || 0) * 2) +
                    ((ib.bulky || 0) * 3);
                }
                const count = ms.bagCount || 1;
                return sum + count;
              }, 0);

              const availableCapacity = Math.max(0, hotelLuggageMaxCapacity - currentlyOccupied);
              const isBookingFilled = availableCapacity <= 0 || requestedSlots > availableCapacity || totalBags === 0;

              return (
                <>
                  <div className="space-y-2 text-xs border-b border-slate-200 dark:border-white/10 pb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Storage Unit</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {totalBags > 0 ? `${totalBags} Items (${breakdownItems.join(', ')})` : '0 Items Selected'} × {miniSpaceHours} hrs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Item Type</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {totalBags > 0 ? breakdownItems.join(' + ') : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Facility Location</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Frontdesk Bell Desk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacity Status</span>
                      {availableCapacity <= 0 || requestedSlots > availableCapacity ? (
                        <span className="font-black text-rose-500">FILLED / FULL ({availableCapacity} left)</span>
                      ) : availableCapacity <= 3 ? (
                        <span className="font-black text-amber-500">Fast Filling ({availableCapacity} slots left)</span>
                      ) : (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{availableCapacity} of {hotelLuggageMaxCapacity} Slots Available</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security Tag Fee</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white block">Total Amount</span>
                        {isDailyCapApplied && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider">
                            Full Day Cap Applied
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {isDailyCapApplied
                          ? `${totalBags} Items capped at ₹${hotelLuggageDayPassRate}/bag full day pass`
                          : `${totalBags} ${totalBags > 1 ? 'Items' : 'Item'} × ${miniSpaceHours}h @ combined ₹${totalHourlyRate}/hr`
                        }
                      </span>
                    </div>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{totalAmount}</span>
                  </div>

                  {totalBags === 0 ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>SELECT AT LEAST 1 ITEM</span>
                    </button>
                  ) : isBookingFilled ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled
                        className="w-full py-3.5 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
                      >
                        <span>🔒 BOOKING FILLED (NO SPACE LEFT)</span>
                      </button>
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] font-bold text-rose-600 dark:text-rose-400 text-center leading-snug">
                        Cloakroom is full for this time slot (Only {availableCapacity} slots left, your selection requires {requestedSlots} slots). Please reduce items or choose another date.
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const formattedDropTime = `${miniSpaceDropHour}:${miniSpaceDropMinute} ${miniSpaceDropPeriod}`;
                        const slotDate = miniSpaceDropDate || new Date().toISOString().split('T')[0];

                        setSelectedService({
                          id: `svc-minispace-${merchantId || 'business'}`,
                          name: `${venueName} — Mini Space Cloakroom`,
                          merchant: venueName || 'BokSpot Partner',
                          merchantId: merchantId || liveServices[0]?.merchantId || (merchantData as any)?.id || '',
                          merchantObj: merchantData || liveServices[0]?.merchantObj || { id: merchantId, name: venueName },
                          price: totalAmount,
                          basePrice: totalAmount,
                          currency: 'INR',
                          city: city || 'Chennai',
                          category: rawCategory || 'hotels',
                          duration: miniSpaceHours * 60,
                          metadata: {
                            facilityName: `${venueName} Frontdesk Cloakroom`,
                            merchantId: merchantId || liveServices[0]?.merchantId || (merchantData as any)?.id || '',
                            returnHotelUrl: `/${bookingType}/${rawCategory}/${merchantId}`,
                            miniSpace: {
                              itemBreakdown: miniSpaceItemCounts,
                              breakdownSummary: breakdownItems.join(', '),
                              bagCount: totalBags,
                              requestedSlots,
                              durationHours: miniSpaceHours,
                              hourlyRate: hotelLuggageHourlyRate,
                              dropDate: slotDate,
                              dropTime: formattedDropTime,
                              bagDesc: miniSpaceBagDesc || breakdownItems.join(', '),
                              totalAmount,
                              hotelName: venueName,
                              returnHotelUrl: `/${bookingType}/${rawCategory}/${merchantId}`
                            }
                          }
                        });

                        setSelectedSlot({
                          id: `slot-minispace-${Date.now()}`,
                          date: slotDate,
                          timeStr: `${formattedDropTime} (${miniSpaceHours} Hours)`,
                          available: true
                        });

                        router.push('/booking/checkout');
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>PROCEED TO CHECKOUT</span>
                      <span className="transition-transform group-hover:translate-x-1 text-sm font-bold">&rarr;</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                    Select guest details & payment method on checkout page. Digital QR Pass generated upon confirmation.
                  </p>
                </>
              );
            })()}
          </div>
        </div>

        {/* 4 Easy Steps — How It Works Banner (Bounce / Stasher Style) */}
        <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              How It Works (Easy 4-Step Drop & Pick-Up)
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              ✓ Instant QR Pass
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Show your booking
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Present your instant digital QR code at the frontdesk counter upon arrival.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Bag registration
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Staff seals & tags your bags with physical barcode seals linked to your booking.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Secure storage
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Your luggage is placed in a 24/7 CCTV guarded, staff-only cloakroom vault.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Easy pick-up
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Show your booking QR again when returning; staff verifies and returns your bags.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

  </div>
</div>





{/* ============================================================
         * SECTION E: HOUSE RULES & PROPERTY POLICIES
         * ============================================================ */}
{
  finalMerchantObj.metadata?.policies && finalMerchantObj.metadata.policies.length > 0 && (
    <div className="mt-10 p-6 rounded-3xl bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/10 shadow-xs">
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <span>📋</span> House Rules & Stay Policies
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
        {finalMerchantObj.metadata.policies.map((policy: string, idx: number) => (
          <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-white/5">
            <span className="text-[#033266] dark:text-[#ff6325] font-bold">•</span>
            <span>{policy}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
                  </div >

  {/* Category Selection Modal */ }
  <AnimatePresence>
{
  isModalOpen && (
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
  )
}
                  </AnimatePresence >

  {/* Fullscreen Image Gallery Modal */ }
  <AnimatePresence>
{
  isGalleryOpen && (
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
            onError={(e) => { e.currentTarget.src = defaultHotelPhotos[currentImageIdx % defaultHotelPhotos.length]; }}
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
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = defaultHotelPhotos[idx % defaultHotelPhotos.length]; }}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
                  </AnimatePresence >

  {/* ── INTERACTIVE TURF MATCH ADD-ONS WORKFLOW MODAL (Resort-Style) ── */ }
  <AnimatePresence>
{
  isTurfAddonModalOpen && selectedHourSlot && pricingResult && (() => {
    const baseSlotCost = Number(pricingResult.finalPayable) || 1350;
    const activeListingObj = selectedTurfService?.rawListing || liveServices[0]?.metadata?.listings?.[0] || {};
    const activeMetaObj = activeListingObj.metadata || {};
    const sportFallbackCfg = getSportCategoryConfig(category);
    const defaultAddonsList = sportFallbackCfg?.addons || [
      { id: 'referee', name: 'Certified Match Referee', price: 300, icon: '👨‍⚖️', desc: 'Official qualified referee for 60 mins match management & fair play.' },
      { id: 'video', name: 'High-Res Match Video Recording', price: 500, icon: '📹', desc: 'Full match recording delivered via HD cloud link within 24 hours.' },
      { id: 'drinks', name: 'Chilled Energy Drinks (Pack of 6)', price: 250, icon: '🧴', desc: 'Ice-chilled electrolyte sports beverages ready at bench.' }
    ];

    const availableAddons = (Array.isArray(activeMetaObj.addons) && activeMetaObj.addons.length > 0)
      ? activeMetaObj.addons.map((a: any, i: number) => ({
        id: a.id || a.name || `addon-${i}`,
        name: a.name || 'Custom Add-on',
        price: Number(a.price) || 0,
        icon: a.icon || '⭐',
        desc: a.desc || a.description || 'Enhance your session experience.'
      }))
      : defaultAddonsList;

    const addonsTotal = selectedTurfAddons.reduce((sum, addName) => {
      const found = availableAddons.find((a: any) => a.name === addName);
      return sum + (found ? Number(found.price) : 0);
    }, 0);

    const grandTotal = baseSlotCost + addonsTotal;

    const executeTurfBooking = (finalAddons: string[], finalCost: number) => {
      const totalToPay = baseSlotCost + finalCost;
      const fullSelectedAddons = finalAddons.map(name => {
        const matched = availableAddons.find((a: any) => a.name === name);
        return {
          id: matched?.id || name,
          name: matched?.name || name,
          price: Number(matched?.price) || 0,
          icon: matched?.icon || '⭐',
          desc: matched?.desc || ''
        };
      });

      setSelectedService({
        ...selectedTurfService,
        price: baseSlotCost, // Keep pure base slot tariff distinct from add-ons
        category: category === 'badminton' ? 'Badminton Court Booking' :
          category === 'tennis' ? 'Tennis Court Booking' :
            category === 'cricket-ground' ? 'Cricket Ground Booking' :
              category === 'basketball' ? 'Basketball Court Booking' :
                category === 'swimming' ? 'Swimming Pool Booking' :
                  category === 'play-arena' ? 'Play Arena Pass Booking' :
                    'Sports Turf Booking',
        selectedListing: {
          ...(activeListingObj || {}),
          name: selectedTurfService?.name || activeListingObj?.name || 'Court Listing',
          price: baseSlotCost,
          addons: availableAddons
        },
        name: `${venueName} — ${selectedTurfService?.name || 'Session Slot'}`,
        metadata: {
          ...(selectedTurfService?.metadata || {}),
          addons: availableAddons,
          selectedAddons: fullSelectedAddons,
          addonsCost: finalCost,
          turfBooking: {
            venueName,
            address,
            slotDate: selectedDate,
            slotTime: selectedHourSlot,
            selectedAddons: fullSelectedAddons,
            addonsCost: finalCost,
            baseSlotCost,
            priceBreakdown: {
              ...pricingResult,
              finalPayable: totalToPay
            }
          }
        }
      });

      setSelectedSlot({
        id: `turf-slot-${Date.now()}`,
        timeStr: `${selectedDate} at ${selectedHourSlot} (1 Hour)`,
        date: selectedDate,
        available: true
      });

      setIsTurfAddonModalOpen(false);
      router.push('/booking/checkout');
    };

    return (
      <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 30 }}
          className="w-full sm:max-w-2xl md:max-w-3xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]"
        >
          {/* Modal Top Header */}
          <div className="px-6 py-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Step 2 of 2: Optional Session Add-ons
              </span>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white mt-1 tracking-tight flex items-center gap-2">
                <span>{category === 'badminton' ? '🏸' : category === 'tennis' ? '🎾' : category === 'cricket-ground' ? '🏏' : category === 'basketball' ? '🏀' : category === 'swimming' ? '🏊' : category === 'play-arena' ? '🧗' : '⚽'}</span>
                <span>
                  {category === 'badminton' ? 'Upgrade Your Badminton Session' :
                    category === 'tennis' ? 'Upgrade Your Tennis Session' :
                      category === 'cricket-ground' ? 'Upgrade Your Cricket Match' :
                        category === 'basketball' ? 'Upgrade Your Basketball Game' :
                          category === 'swimming' ? 'Upgrade Your Pool Session' :
                            category === 'play-arena' ? 'Upgrade Your Arena Jump Pass' :
                              'Upgrade Your Match Session'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                📅 {selectedDate} • ⏰ {selectedHourSlot} • {selectedTurfService?.name || 'Session Unit'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsTurfAddonModalOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Add-ons Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✨</span>
                <div>
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 block">Want official match gear or refreshments?</span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Select any add-ons below or skip to proceed with pure turf slot rental.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {availableAddons.map((addon: any, aIdx: number) => {
                const isChecked = selectedTurfAddons.includes(addon.name);

                return (
                  <div
                    key={aIdx}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedTurfAddons(prev => prev.filter(n => n !== addon.name));
                      } else {
                        setSelectedTurfAddons(prev => [...prev, addon.name]);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${isChecked
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 flex items-center justify-center text-lg shrink-0">
                      {addon.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {addon.name}
                        </h4>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                          +₹{addon.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                        {addon.desc}
                      </p>
                    </div>
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${isChecked
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 dark:border-white/20'
                      }`}>
                      {isChecked && '✓'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Universal BokSpot Payment Options Preview */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Universal BokSpot Payment Options (Configurable at Checkout)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10">
                  <span className="text-xs block">💳</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block mt-0.5">100% Online</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">Instant VIP Pass</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                  <span className="text-xs block">⚡</span>
                  <span className="text-[10px] font-black text-amber-900 dark:text-amber-300 block mt-0.5">30% Advance</span>
                  <span className="text-[9px] text-amber-700 dark:text-amber-400">Hold & 70% at venue</span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
                  <span className="text-xs block">👥</span>
                  <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 block mt-0.5">Split with Friends</span>
                  <span className="text-[9px] text-indigo-700 dark:text-indigo-400">Equal share links</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer (Skip vs Proceed with Add-ons) */}
          <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
            {/* Skip Option */}
            <button
              type="button"
              onClick={() => {
                executeTurfBooking([], 0);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
            >
              Skip Add-ons
            </button>

            {/* Proceed to Checkout */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Total Payable</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  executeTurfBooking(selectedTurfAddons, addonsTotal);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  })()
}
                  </AnimatePresence >

  {/* ── INTERACTIVE HOTEL ROOM DETAILS & ADD-ONS WORKFLOW MODAL ── */ }
  <AnimatePresence>
{
  activeRoomService && roomModalStep && (
    <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 30 }}
        className="w-full sm:max-w-2xl md:max-w-3xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
      >
        {/* Modal Top Header with Stepper Indicator */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3.5">
            {(roomModalStep === 'ADDONS' || roomModalStep === 'VISIT') && (
              <button
                type="button"
                onClick={() => setRoomModalStep('DETAILS')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs"
                title="Back to Room Details"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border border-[#033266]/20 dark:border-[#ff6325]/30">
                  {isPgStay ? (roomModalStep === 'VISIT' ? 'Schedule Visit' : 'Bed Selection') : (roomModalStep === 'DETAILS' ? 'Step 1 of 2: Room Overview' : 'Step 2 of 2: Customize Stay (Add-ons)')}
                </span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white mt-1.5 tracking-tight">
                {roomModalStep === 'VISIT'
                  ? (visitMode === 'LIVE_VIDEO'
                    ? 'Schedule Live Video Tour'
                    : 'Schedule Free Property Visit & Callback')
                  : (activeRoomService.name || 'Room Details')}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveRoomService(null);
              setRoomModalStep(null);
            }}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={`flex-1 px-6 py-5 space-y-6 ${roomModalStep === 'VISIT' ? 'overflow-visible' : 'overflow-y-auto overscroll-contain'}`}>
          {(() => {
            const roomListings = activeRoomService.rawConfig?.metadata?.listings || activeRoomService.metadata?.listings || [];
            const selectedListing = activeRoomService.selectedListing || (activeRoomService.selectedListingId ? roomListings.find((l: any) => l.id === activeRoomService.selectedListingId) : roomListings[0]);
            const roomMeta = selectedListing?.metadata || activeRoomService.metadata || {};
            const rawPgBasePrice = Number(selectedListing?.price || selectedListing?.basePrice || activeRoomService.price || activeRoomService.basePrice) || 2200;

            // Dynamic Tenure Discount & Direct Rent Calculation
            const customTenureConfig = (selectedListing as any)?.metadata?.tenureDiscounts || (selectedListing as any)?.tenureDiscounts;

            let discountedMonthlyRent = rawPgBasePrice;
            if (hostelDurationMonths === 11) {
              discountedMonthlyRent = customTenureConfig?.mo11Price
                ? Number(customTenureConfig.mo11Price)
                : Math.round(rawPgBasePrice * (1 - (customTenureConfig?.mo11Pct ?? customTenureConfig?.mo11 ?? 15) / 100));
            } else if (hostelDurationMonths === 6) {
              discountedMonthlyRent = customTenureConfig?.mo6Price
                ? Number(customTenureConfig.mo6Price)
                : Math.round(rawPgBasePrice * (1 - (customTenureConfig?.mo6Pct ?? customTenureConfig?.mo6 ?? 10) / 100));
            } else if (hostelDurationMonths === 3) {
              discountedMonthlyRent = customTenureConfig?.mo3Price
                ? Number(customTenureConfig.mo3Price)
                : Math.round(rawPgBasePrice * (1 - (customTenureConfig?.mo3Pct ?? customTenureConfig?.mo3 ?? 5) / 100));
            }

            const pgBasePrice = discountedMonthlyRent;
            const roomPrice = isPgStay ? discountedMonthlyRent : (Number(selectedListing?.price || selectedListing?.basePrice || activeRoomService.price || activeRoomService.basePrice) || 2500);
            const roomTotal = roomPrice * nights * rooms;

            // Room gallery from listing / merchant uploads
            const rawPhotos: string[] = [];
            if (activeRoomService.metadata?.gallery && Array.isArray(activeRoomService.metadata.gallery)) {
              activeRoomService.metadata.gallery.forEach((img: string) => { if (img && !rawPhotos.includes(img)) rawPhotos.push(img); });
            }
            if (activeRoomService.images && Array.isArray(activeRoomService.images)) {
              activeRoomService.images.forEach((img: string) => { if (img && !rawPhotos.includes(img)) rawPhotos.push(img); });
            }
            if (activeRoomService.imageUrl && !rawPhotos.includes(activeRoomService.imageUrl)) {
              rawPhotos.unshift(activeRoomService.imageUrl);
            }
            // Fallback to property showcase gallery if room has no specific photo uploaded
            const propertyGallery = (extractedImages && extractedImages.length > 0) ? extractedImages : defaultHotelPhotos;
            const roomPhotos = rawPhotos.length > 0 ? rawPhotos : propertyGallery;

            // Check if hotel partner has custom add-ons saved in this listing
            const rawAddons = roomMeta.addons || activeRoomService.metadata?.addons || activeRoomService.addOns || [];
            const partnerListingAddons = Array.isArray(rawAddons) ? rawAddons : [];

            const pgFoodDiscount = Number(
              (selectedListing as any)?.foodDiscountAmount ??
              activeRoomService.metadata?.foodDiscountAmount ??
              2000
            );

            // ONLY show add-ons created directly by the business merchant (or standard PG add-ons if in PG stay mode)
            const defaultPgAddons = isPgStay ? [
              { id: 'custom-addon-pg-laundry', name: 'Laundry & Washing Machine Access', desc: 'Unlimited monthly washing machine and drying yard access', price: 350, tag: 'Popular', icon: '🧺' },
              { id: 'custom-addon-pg-parking', name: 'Reserved Two-Wheeler Parking', desc: 'Covered dedicated CCTV-monitored 2-wheeler parking slot', price: 200, tag: 'Convenience', icon: '🛵' },
              { id: 'custom-addon-pg-locker', name: 'Personal High-Security Locker', desc: 'Keyed personal wardrobe locker with master backup code', price: 250, tag: 'Security', icon: '🔐' },
            ] : [];

            const availableAddonsList = partnerListingAddons.length > 0
              ? partnerListingAddons.map((pa: any, pIdx: number) => ({
                id: `custom-addon-${pIdx}`,
                name: typeof pa === 'string' ? pa : (pa.name || 'Custom Add-on'),
                desc: pa.desc || (isPgStay ? 'Monthly amenity enhancement' : 'Optional enhancement offered directly by host'),
                price: Number(pa.price || pa.cost || 0),
                tag: 'Included Choice',
                icon: '✨'
              }))
              : defaultPgAddons;

            const addonsTotalSum = selectedAddonIds.reduce((sum, id) => {
              const found = availableAddonsList.find((a: any) => a.id === id);
              return sum + (found?.price || 0);
            }, 0);

            const basePgPayable = pgPaymentType === 'TOKEN_ADVANCE'
              ? Number((selectedListing as any)?.tokenAdvanceAmount || activeRoomService.metadata?.tokenAdvanceAmount || 999)
              : (isFoodExcluded ? Math.max(500, pgBasePrice - pgFoodDiscount) : pgBasePrice);

            const finalCalculatedPayable = isPgStay
              ? (basePgPayable + addonsTotalSum)
              : (roomTotal + addonsTotalSum);

            if (roomModalStep === 'DETAILS') {
              return (
                <div className="space-y-5">
                  {/* Room Image Carousel / Hero */}
                  <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 group shrink-0">
                    <img
                      src={roomPhotos[roomModalImageIdx] || roomPhotos[0]}
                      alt={activeRoomService.name}
                      className="w-full h-full object-cover transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = defaultHotelPhotos[0]; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    {/* Left & Right Interactive Navigation Arrows */}
                    {roomPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomModalImageIdx((prev) => (prev > 0 ? prev - 1 : roomPhotos.length - 1));
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md hover:scale-105 active:scale-95 border border-white/20 z-10"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomModalImageIdx((prev) => (prev < roomPhotos.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md hover:scale-105 active:scale-95 border border-white/20 z-10"
                          aria-label="Next image"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}

                    {/* Image Switcher Pills + Photo Counter Badge */}
                    {roomPhotos.length > 1 && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                        <div className="flex gap-1.5 items-center bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                          {roomPhotos.map((_, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setRoomModalImageIdx(pIdx)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${roomModalImageIdx === pIdx ? 'w-5 bg-[#ff6325]' : 'w-1.5 bg-white/60 hover:bg-white'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-xs">
                          📷 {roomModalImageIdx + 1} / {roomPhotos.length}
                        </span>
                      </div>
                    )}

                    {/* Top Right Price Tag (Standard Hotels Only) */}
                    {!isPgStay && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#033266] dark:bg-[#ff6325] text-white text-xs font-bold shadow-sm">
                        ₹{roomPrice.toLocaleString()} / night
                      </div>
                    )}
                  </div>

                  {/* Long-Stay Tenure Saver / Duration Selection (1 Mo, 3+ Mo, 6+ Mo, 11 Mo Offers) */}
                  {isPgStay && (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                          Stay Duration & Tenure Discounts
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                          {hostelDurationMonths >= 6 ? '⭐ Best Value' : hostelDurationMonths >= 3 ? '🔥 Most Popular' : 'Flexi Plan'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {(() => {
                          const activeListingData = activeRoomService?.selectedListing as any;
                          const customTenure = activeListingData?.metadata?.tenureDiscounts || activeListingData?.tenureDiscounts;
                          const disc3 = customTenure?.mo3 !== undefined ? Number(customTenure.mo3) : 5;
                          const disc6 = customTenure?.mo6 !== undefined ? Number(customTenure.mo6) : 10;
                          const disc11 = customTenure?.mo11 !== undefined ? Number(customTenure.mo11) : 15;

                          const slabs = [
                            { months: 1, label: '1 Mo', tag: 'Flexi Stay', disc: 0, rent: rawPgBasePrice },
                            { months: 3, label: '3 Mo', tag: disc3 > 0 ? `${disc3}% OFF` : 'Standard', disc: disc3, rent: Math.round(rawPgBasePrice * (1 - disc3 / 100)) },
                            { months: 6, label: '6 Mo', tag: disc6 > 0 ? `${disc6}% OFF` : 'Standard', disc: disc6, rent: Math.round(rawPgBasePrice * (1 - disc6 / 100)) },
                            { months: 11, label: '11 Mo', tag: disc11 > 0 ? `${disc11}% OFF` : 'Standard', disc: disc11, rent: Math.round(rawPgBasePrice * (1 - disc11 / 100)) },
                          ];

                          return slabs.map((slab) => {
                            const isSelected = hostelDurationMonths === slab.months;
                            return (
                              <button
                                key={slab.months}
                                type="button"
                                onClick={() => setHostelDurationMonths(slab.months)}
                                className={`p-2 rounded-xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-between ${isSelected
                                  ? 'border-[#ff6325] bg-white dark:bg-slate-800 shadow-sm scale-102'
                                  : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300'
                                  }`}
                              >
                                <div>
                                  <span className={`text-xs font-black block ${isSelected ? 'text-[#ff6325]' : 'text-slate-900 dark:text-white'}`}>
                                    {slab.label}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 block">
                                    ₹{slab.rent.toLocaleString()}/mo
                                  </span>
                                </div>
                                <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded-md ${slab.disc > 0
                                  ? isSelected
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                                  : 'text-slate-400'
                                  }`}>
                                  {slab.tag}
                                </span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Top Booking Compact Meal Plans Selector: With Mess vs Without Mess */}
                  {isPgStay && ((activeRoomService.selectedListing as any)?.foodFacilityProvided ?? (roomMeta.foodFacilityProvided ?? true)) && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-0.5">
                        Meal & Stay Plan
                      </span>
                      {(() => {
                        const foodDiscount = Number(
                          (activeRoomService.selectedListing as any)?.foodDeductionAmount ||
                          roomMeta.foodDeductionAmount ||
                          1500
                        );
                        const mealPlanDesc = roomMeta.mealPlanOptions || (activeRoomService.selectedListing as any)?.mealPlanOptions || 'Daily Breakfast, Lunch, Dinner';
                        const finalNoMessPrice = Math.max(500, roomPrice - foodDiscount);

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Plan A: Stay + 3 Homely Meals Included */}
                            <div
                              onClick={() => setIsFoodExcluded(false)}
                              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${!isFoodExcluded
                                ? 'border-[#ff6325] bg-orange-50/50 dark:bg-[#ff6325]/10 shadow-2xs'
                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1219] hover:border-slate-300 dark:hover:border-white/20 opacity-75'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${!isFoodExcluded ? 'border-[#ff6325] bg-[#ff6325]' : 'border-slate-300 dark:border-white/20'}`}>
                                  {!isFoodExcluded && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                    🍱 3 Meals + Stay
                                  </h4>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                                    {mealPlanDesc}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm font-black text-[#033266] dark:text-[#ff6325] block">
                                  ₹{roomPrice.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold block">/month</span>
                              </div>
                            </div>

                            {/* Plan B: Only Stay (Mess Excluded - Dynamic Off) */}
                            <div
                              onClick={() => setIsFoodExcluded(true)}
                              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${isFoodExcluded
                                ? 'border-[#ff6325] bg-orange-50/50 dark:bg-[#ff6325]/10 shadow-2xs'
                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1219] hover:border-slate-300 dark:hover:border-white/20 opacity-75'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isFoodExcluded ? 'border-[#ff6325] bg-[#ff6325]' : 'border-slate-300 dark:border-white/20'}`}>
                                  {isFoodExcluded && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                    🍳 Only Stay (No Mess)
                                  </h4>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block truncate">
                                    Save ₹{foodDiscount.toLocaleString()}/month
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="flex items-baseline gap-1 justify-end">
                                  <span className="text-[10px] text-slate-400 line-through">₹{roomPrice.toLocaleString()}</span>
                                  <span className="text-sm font-black text-[#033266] dark:text-[#ff6325]">
                                    ₹{finalNoMessPrice.toLocaleString()}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-semibold block">/month</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Top-Tier Booking App Style: Premium Key Room Features Bar */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-50 dark:from-slate-800/90 dark:via-sky-950/20 dark:to-slate-800/90 border border-slate-200/90 dark:border-white/10 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3 px-0.5">
                      Key Room Specifications
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3.5 gap-x-5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      {/* 1. Capacity */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Users size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Capacity</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
                            {typeof roomMeta.maxGuests === 'string' && roomMeta.maxGuests.toLowerCase().includes('guest') ? roomMeta.maxGuests : `Max ${roomMeta.maxGuests || 2} Residents`}
                          </span>
                        </div>
                      </div>

                      {/* 2. Bed Setup */}
                      {roomMeta.bedType && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#ff6325] flex items-center justify-center shrink-0 mt-0.5">
                            <Bed size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Bed Setup</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
                              {roomMeta.bedType}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 3. Room Size */}
                      {(roomMeta.sizeSqFt || roomMeta.roomSize) && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 text-sm mt-0.5">
                            📐
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Room Size</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
                              {roomMeta.sizeSqFt || roomMeta.roomSize} sq.ft
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 4. Attached Bathroom */}
                      {roomMeta.bathroomType && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 text-sm mt-0.5">
                            🚿
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Washroom</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
                              {roomMeta.bathroomType}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 5. Balcony / Ventilation */}
                      {roomMeta.viewType && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-sm mt-0.5">
                            🌿
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Balcony / Air</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
                              {roomMeta.viewType}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 6. Cooling */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 text-sm mt-0.5">
                          ❄️
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Climate</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
                            {activeRoomService.name?.toLowerCase().includes('non ac') ? 'Natural Airflow / Fan' : 'Air Conditioned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Room Description
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-white/10">
                      {activeRoomService.description ||
                        'Well-appointed room featuring comfortable bedding, attached ensuite bathroom with hot/cold shower, and standard hotel essentials.'}
                    </p>
                  </div>

                  {/* Inclusions & Amenities Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Included In This Room
                    </h4>
                    {(() => {
                      const rawPerks: string[] = Array.isArray(roomMeta.perks) ? roomMeta.perks : [];
                      const rawAmenities: string[] = Array.isArray(roomMeta.amenities) ? roomMeta.amenities : [];

                      // Formatting helper for camelCase/tight strings like "balconyview" -> "Balcony View", "smartTV" -> "Smart TV"
                      const formatPerkName = (str: string) => {
                        if (!str) return '';
                        const formatted = str
                          .replace(/([a-z])([A-Z])/g, '$1 $2')
                          .replace(/luandry/i, 'Laundry Service')
                          .replace(/foodfaciiity|foodfacility|food\s*facility/i, 'Food Facility / Mess')
                          .replace(/Freelaunch/i, 'Free Lunch')
                          .replace(/freedinner/i, 'Free Dinner')
                          .replace(/Freewifi/i, 'Free Wi-Fi')
                          .replace(/waterheater/i, 'Geyser / Water Heater')
                          .replace(/smarttv/i, 'Smart TV')
                          .replace(/balconyview/i, 'Balcony View')
                          .replace(/oceanview/i, 'Ocean View')
                          .replace(/seaview/i, 'Sea View')
                          .replace(/swimmingpool/i, 'Swimming Pool')
                          .replace(/ComplimentorbuffetBreakfast/i, 'Complimentary Buffet Breakfast')
                          .replace(/buffetbreakfast/i, 'Buffet Breakfast')
                          .replace(/firecamp/i, 'Fire Camp')
                          .replace(/waterbottle/i, 'Water Bottle')
                          .trim();
                        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                      };

                      const dynamicPerks = rawPerks.map(p => ({
                        label: formatPerkName(p),
                        isFreeHighlight: true,
                      }));

                      const dynamicAmenities = rawAmenities.map(a => ({
                        label: formatPerkName(a),
                        isFreeHighlight: false,
                      }));

                      const extraFeatures: { label: string; isFreeHighlight: boolean }[] = [];
                      if (roomMeta.bathroomType) {
                        const bType = roomMeta.bathroomType.trim();
                        extraFeatures.push({
                          label: bType.toLowerCase().includes('bathroom') || bType.toLowerCase().includes('ensuite') ? bType : `${bType} Ensuite`,
                          isFreeHighlight: false,
                        });
                      }
                      if (roomMeta.bedType) {
                        const bSetup = roomMeta.bedType.trim();
                        extraFeatures.push({
                          label: bSetup.toLowerCase().includes('bed') ? bSetup : `${bSetup} Bed Setup`,
                          isFreeHighlight: false,
                        });
                      }

                      const allInclusions = [...dynamicPerks, ...dynamicAmenities, ...extraFeatures];

                      // Fallback if merchant didn't add any perks or amenities
                      const displayList = allInclusions.length > 0 ? allInclusions : [
                        { label: 'Free High-Speed Wi-Fi', isFreeHighlight: true },
                        { label: 'Free Cancellation (up to 24h before)', isFreeHighlight: true },
                        { label: 'Private Attached Bathroom', isFreeHighlight: false },
                        { label: 'Fresh Linens & Bath Toiletries', isFreeHighlight: false },
                        { label: 'Drinking Water & Electric Kettle', isFreeHighlight: false },
                        { label: 'Daily Housekeeping & Assistance', isFreeHighlight: false },
                      ];

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 dark:text-slate-200">
                          {displayList.map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border font-semibold ${item.isFreeHighlight
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10'
                                }`}
                            >
                              <CheckCircle2
                                size={15}
                                className={`shrink-0 ${item.isFreeHighlight
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-[#033266] dark:text-[#ff6325]'
                                  }`}
                              />
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Highlighted Schedule Free Property Visit Card & Hostel Policies (PG / Hostel) */}
                  {isPgStay ? (
                    <div className="space-y-3">
                      {/* Gate Curfew, Notice & Deposit Policies Note */}
                      {((activeRoomService.selectedListing as any)?.metadata?.petPolicy || (activeRoomService.selectedListing as any)?.metadata?.checkOutTime || (activeRoomService.selectedListing as any)?.metadata?.cancellationPolicy || roomMeta.petPolicy || roomMeta.checkOutTime || roomMeta.cancellationPolicy) && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-xs">
                          {((activeRoomService.selectedListing as any)?.metadata?.checkOutTime || roomMeta.checkOutTime) && (
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <span className="text-base shrink-0">🚪</span>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Gate Timing</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  Closes at {(activeRoomService.selectedListing as any)?.metadata?.checkOutTime || roomMeta.checkOutTime}
                                </span>
                              </div>
                            </div>
                          )}
                          {((activeRoomService.selectedListing as any)?.metadata?.petPolicy || roomMeta.petPolicy) && (
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <span className="text-base shrink-0">📜</span>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Notice Period</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {(activeRoomService.selectedListing as any)?.metadata?.petPolicy || roomMeta.petPolicy}
                                </span>
                              </div>
                            </div>
                          )}
                          {((activeRoomService.selectedListing as any)?.metadata?.cancellationPolicy || roomMeta.cancellationPolicy) && (
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <span className="text-base shrink-0">🛡️</span>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Deposit Refund</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {(activeRoomService.selectedListing as any)?.metadata?.cancellationPolicy || roomMeta.cancellationPolicy}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50/50 to-indigo-50/40 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-indigo-950/20 border border-sky-200 dark:border-sky-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-sky-100 dark:border-white/10 shrink-0">
                            🗓️
                          </span>
                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <span>Want to inspect the property in person?</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px]">
                                100% Free
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              Meet the hostel warden, inspect room amenities & check out mess food before paying.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRoomModalStep('VISIT')}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#033266] hover:bg-[#022349] dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0 text-center"
                        >
                          Schedule Free Visit &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Selected Dates Review Banner (Hotel / Resorts Only) */
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Selected Stay</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {checkIn} &rarr; {checkOut} ({nights} Night{nights > 1 ? 's' : ''})
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {adults} Adults{children > 0 ? `, ${children} Children` : ''} • {rooms} Room{rooms > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Room Total</span>
                        <span className="font-black text-[#033266] dark:text-[#ff6325] text-base">
                          ₹{roomTotal.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                          Taxes & fees included
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ── STEP 1.5: SCHEDULE VISIT / VIDEO TOUR VIEW ──
            if (roomModalStep === 'VISIT') {
              return (
                <div className="space-y-4 max-w-lg mx-auto py-2">
                  {/* 2-Way Segmented Switcher: Consistent Brand Toggle Styling */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setVisitMode('IN_PERSON');
                        setVisitConfirmed(false);
                      }}
                      className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${visitMode === 'IN_PERSON'
                        ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <span>🏢 Free Visit Pass & Callback</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVisitMode('LIVE_VIDEO');
                        setVisitConfirmed(false);
                      }}
                      className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${visitMode === 'LIVE_VIDEO'
                        ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <span>📹 Live Video Tour</span>
                    </button>
                  </div>

                  {visitConfirmed ? (
                    <div className="py-8 text-center space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-6 rounded-3xl">
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                        ✓
                      </div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {visitMode === 'LIVE_VIDEO'
                          ? 'Live Video Tour Booked!'
                          : 'Visit Pass Confirmed!'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        {visitMode === 'LIVE_VIDEO' ? (
                          <>
                            Property Warden will connect via <span className="font-bold text-[#ff6325]">{videoPlatform === 'WHATSAPP' ? 'WhatsApp Video' : 'Google Meet'}</span> on <span className="font-bold text-[#ff6325]">{visitDate}</span> at <span className="font-bold text-[#ff6325]">{visitTimeSlot}</span>. Confirmation SMS sent to {visitPhone || 'your mobile'}.
                          </>
                        ) : (
                          <>
                            The PG Warden has been notified for <span className="font-bold text-[#ff6325]">{visitDate}</span> at <span className="font-bold text-[#ff6325]">{visitTimeSlot}</span>. Warden will also call your number <span className="font-bold text-emerald-600 dark:text-emerald-400">{visitPhone || 'provided'}</span> to confirm directions and answer your queries.
                          </>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setVisitConfirmed(false);
                          setRoomModalStep('DETAILS');
                        }}
                        className="mt-3 px-6 py-2.5 bg-[#ff6325] hover:bg-[#e04e13] text-white text-xs font-black rounded-xl cursor-pointer"
                      >
                        Back to Bed Details
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Top Informational Banner */}
                      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${visitMode === 'LIVE_VIDEO'
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40'
                        : 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/40'
                        }`}>
                        <span className="text-2xl shrink-0">
                          {visitMode === 'LIVE_VIDEO' ? '📹' : '🗓️'}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">
                            {visitMode === 'LIVE_VIDEO'
                              ? 'Schedule Live 1-on-1 Video Tour'
                              : 'Free Property Inspection Pass & Warden Callback'}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {visitMode === 'LIVE_VIDEO'
                              ? 'Outstation student or working professional? Warden will walk you through rooms, mess, and washrooms over video call.'
                              : 'Visit property in person, inspect bed setup & taste mess food. PG Warden will also call you back to assist with directions and details.'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* Video Platform Preference selector (Only for LIVE_VIDEO mode) */}
                        {visitMode === 'LIVE_VIDEO' && (
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Preferred Video Call App</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setVideoPlatform('WHATSAPP')}
                                className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${videoPlatform === 'WHATSAPP'
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                  : 'border-slate-200 dark:border-white/10 text-slate-600'
                                  }`}
                              >
                                <span>💬 WhatsApp Video</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setVideoPlatform('GOOGLE_MEET')}
                                className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${videoPlatform === 'GOOGLE_MEET'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                                  : 'border-slate-200 dark:border-white/10 text-slate-600'
                                  }`}
                              >
                                <span>🎥 Google Meet</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Your Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Arun Kumar"
                            value={visitName}
                            onChange={(e) => setVisitName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold focus:border-[#ff6325]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone Number (For Warden Callback & SMS)</label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={visitPhone}
                            onChange={(e) => setVisitPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold focus:border-[#ff6325]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                              {visitMode === 'LIVE_VIDEO' ? 'Tour Date' : 'Visit Date'}
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const targetD = visitDate ? new Date(visitDate) : new Date();
                                setVisitCalMonthDate(isNaN(targetD.getTime()) ? new Date() : targetD);
                                setIsVisitCalPopoverOpen(!isVisitCalPopoverOpen);
                              }}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold flex items-center justify-between text-left hover:border-[#ff6325] transition-colors cursor-pointer"
                            >
                              <span className="text-slate-900 dark:text-white font-bold">
                                {(() => {
                                  try {
                                    const [y, m, d] = visitDate.split('-');
                                    return `${d}-${m}-${y}`;
                                  } catch {
                                    return visitDate;
                                  }
                                })()}
                              </span>
                              <Calendar size={15} className="text-[#ff6325] shrink-0" />
                            </button>

                            {/* Custom Popover Calendar matching top booking app UI */}
                            <AnimatePresence>
                              {isVisitCalPopoverOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute left-0 bottom-full mb-3 w-72 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl z-[300000] space-y-3"
                                >
                                  {/* Month Header with Pill Container & < > Controls (Matching Check-in Calendar) */}
                                  <div className="bg-slate-50 dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-2.5 flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVisitCalMonthDate(new Date(visitCalMonthDate.getFullYear(), visitCalMonthDate.getMonth() - 1, 1));
                                      }}
                                      className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                                    >
                                      <ChevronLeft size={15} />
                                    </button>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                      {visitCalMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVisitCalMonthDate(new Date(visitCalMonthDate.getFullYear(), visitCalMonthDate.getMonth() + 1, 1));
                                      }}
                                      className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                                    >
                                      <ChevronRight size={15} />
                                    </button>
                                  </div>

                                  {/* Weekday Names */}
                                  <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                      <div key={d} className="py-1">{d}</div>
                                    ))}
                                  </div>

                                  {/* Days Grid with Blue Circle Selection */}
                                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                    {(() => {
                                      const year = visitCalMonthDate.getFullYear();
                                      const month = visitCalMonthDate.getMonth();
                                      const firstDay = new Date(year, month, 1).getDay();
                                      const totalDays = new Date(year, month + 1, 0).getDate();
                                      const cells = [];

                                      for (let i = 0; i < firstDay; i++) {
                                        cells.push(<div key={`visit-modal-empty-${i}`} className="h-8" />);
                                      }

                                      for (let d = 1; d <= totalDays; d++) {
                                        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                        const isSelected = visitDate === dStr;
                                        const isPast = new Date(dStr) < new Date(new Date().setHours(0, 0, 0, 0));

                                        cells.push(
                                          <div key={d} className="flex items-center justify-center">
                                            <button
                                              type="button"
                                              disabled={isPast}
                                              onClick={() => {
                                                setVisitDate(dStr);
                                                setIsVisitCalPopoverOpen(false);
                                              }}
                                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${isSelected
                                                ? 'bg-[#1a56db] text-white font-black shadow-md shadow-blue-500/40 ring-2 ring-blue-400/30'
                                                : isPast
                                                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                              {d}
                                            </button>
                                          </div>
                                        );
                                      }
                                      return cells;
                                    })()}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                              {visitMode === 'LIVE_VIDEO' ? 'Video Slot' : 'Preferred Time'}
                            </label>
                            <select
                              value={visitTimeSlot}
                              onChange={(e) => setVisitTimeSlot(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold"
                            >
                              <option>09:00 AM - 11:00 AM</option>
                              <option>11:00 AM - 01:00 PM</option>
                              <option>02:00 PM - 04:00 PM</option>
                              <option>04:00 PM - 06:00 PM</option>
                              <option>06:00 PM - 08:00 PM</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!visitPhone) {
                            alert('Please enter your phone number so the Warden can connect with you.');
                            return;
                          }

                          // Sync Live Property Visit Request to Backend & Business Portal
                          try {
                            const visitBookingData = {
                              id: `visit-${Date.now()}`,
                              ref: `VISIT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                              merchantId: merchantId || activeRoomService.merchantId || (merchantData as any)?.id || '51c6a3b8-2abc-9421-7644-2a2dea05dbc0',
                              merchantName: (merchantData as any)?.name || (merchantData as any)?.businessName || activeRoomService.merchantName || 'Backpackers Hostel',
                              category: 'Hostel Booking',
                              serviceId: activeRoomService.id || 'svc-hostel-visit',
                              serviceName: activeRoomService.name ? `${activeRoomService.name} (${visitMode === 'LIVE_VIDEO' ? 'Live Video Tour' : 'In-Person Inspection'})` : (visitMode === 'LIVE_VIDEO' ? 'Live Video Tour' : 'Property Visit & Callback'),
                              customerName: visitName || 'Guest Visitor',
                              customerPhone: visitPhone,
                              date: visitDate,
                              time: `${visitTimeSlot} • ${visitMode === 'LIVE_VIDEO' ? (videoPlatform === 'WHATSAPP' ? 'WhatsApp Video' : 'Google Meet') : 'Physical Visit'}`,
                              amount: 0,
                              status: 'PENDING',
                              bookingType: 'PROPERTY_VISIT',
                              notes: `Scheduled ${visitMode === 'LIVE_VIDEO' ? `Live Video Tour on ${videoPlatform === 'WHATSAPP' ? 'WhatsApp' : 'Google Meet'}` : 'Physical Property Visit & Warden Callback'} for ${visitName || 'Visitor'} (${visitPhone})`,
                              metadata: {
                                isPropertyVisit: true,
                                visitMode,
                                videoPlatform: visitMode === 'LIVE_VIDEO' ? videoPlatform : undefined,
                                roomName: activeRoomService.name,
                                roomSharing: (selectedListing as any)?.name || 'Bed Inspection',
                                scheduledDate: visitDate,
                                timeSlot: visitTimeSlot,
                              }
                            };

                            await fetch('/api/v1/bookings/sync', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(visitBookingData),
                            }).catch(() => { });
                          } catch (e) {
                            console.error('Failed to post live visit sync:', e);
                          }

                          setVisitConfirmed(true);
                        }}
                        className={`w-full py-3.5 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer mt-2 ${visitMode === 'LIVE_VIDEO'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-[#ff6325] hover:bg-[#e04e13]'
                          }`}
                      >
                        {visitMode === 'LIVE_VIDEO'
                          ? 'Confirm Live Video Tour →'
                          : 'Confirm Free Visit Pass & Callback →'}
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // ── STEP 2: ADD-ONS SELECTION ──
            if (roomModalStep === 'ADDONS') {
              return (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#033266]/5 dark:bg-[#ff6325]/10 border border-[#033266]/15 dark:border-[#ff6325]/20 flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Enhance Your Stay</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Choose optional upgrades below, or click <strong>Skip Add-ons</strong> to continue directly to checkout.
                      </p>
                    </div>
                  </div>

                  {/* Add-ons List */}
                  <div className="space-y-2.5">
                    {availableAddonsList.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                        <p className="text-xs font-semibold">No additional paid upgrades configured for this room.</p>
                        <p className="text-[11px] mt-1 text-slate-400">You can proceed directly to checkout.</p>
                      </div>
                    ) : (
                      availableAddonsList.map(addon => {
                        const isSelected = selectedAddonIds.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => {
                              setSelectedAddonIds(prev =>
                                prev.includes(addon.id)
                                  ? prev.filter(x => x !== addon.id)
                                  : [...prev, addon.id]
                              );
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                              ? 'bg-[#033266]/5 dark:bg-[#ff6325]/10 border-[#033266] dark:border-[#ff6325] shadow-xs'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                              }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
                                {addon.icon}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                    {addon.name}
                                  </h5>
                                  {addon.tag && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#033266]/10 dark:bg-[#ff6325]/15 text-[#033266] dark:text-[#ff6325] border border-[#033266]/20 dark:border-[#ff6325]/30">
                                      {addon.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                  {addon.desc}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-xs font-black text-slate-900 dark:text-white block">
                                  +₹{addon.price.toLocaleString()}
                                </span>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected
                                  ? 'bg-[#033266] dark:bg-[#ff6325] border-[#033266] dark:border-[#ff6325] text-white'
                                  : 'border-slate-300 dark:border-white/20 bg-white dark:bg-slate-700'
                                  }`}
                              >
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Live Total Calculation Preview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs mt-4">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                        {isPgStay
                          ? `${pgPaymentType === 'TOKEN_ADVANCE' ? 'Token Advance' : '1st Month Rent'} + ${selectedAddonIds.length} Add-on${selectedAddonIds.length === 1 ? '' : 's'}`
                          : `Base Room (${nights}N) + ${selectedAddonIds.length} Add-on${selectedAddonIds.length === 1 ? '' : 's'}`
                        }
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs">
                        ₹{(isPgStay ? basePgPayable : roomTotal).toLocaleString()} + ₹{addonsTotalSum.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Final Total</span>
                      <span className="text-base font-black text-[#033266] dark:text-[#ff6325]">
                        ₹{finalCalculatedPayable.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })()}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/90 dark:bg-slate-900/80 flex items-center justify-between gap-3 backdrop-blur-md shrink-0 rounded-b-3xl">
          {roomModalStep === 'VISIT' ? (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRoomModalStep('DETAILS')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
              >
                &larr; Back to Bed Overview
              </button>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ✓ No payment required for visit
              </span>
            </div>
          ) : roomModalStep === 'DETAILS' ? (
            isPgStay ? (
              (() => {
                const basePrice = Number(activeRoomService.price || activeRoomService.basePrice) || 2200;
                const foodDiscount = Number(
                  (activeRoomService.selectedListing as any)?.foodDeductionAmount ||
                  activeRoomService.metadata?.foodDeductionAmount ||
                  1500
                );
                const effectiveRent = isFoodExcluded ? Math.max(500, basePrice - foodDiscount) : basePrice;

                return (
                  /* Balanced Modern Booking Action Bar: Primary Full Rent + Flexible Token Option */
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Left: Clear Monthly Rent Summary */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Total Monthly Rent
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          ₹{effectiveRent.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/month</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                          {isFoodExcluded ? '(No Mess)' : '(All Meals Inc.)'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Primary Full Payment & Secondary Token Advance Action */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRoomService(null);
                          setRoomModalStep(null);
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
                      >
                        Back
                      </button>

                      {/* Secondary Action: Pay Dynamic Token Advance */}
                      {((activeRoomService.selectedListing as any)?.isTokenAdvanceEnabled ?? (activeRoomService.metadata?.isTokenAdvanceEnabled ?? true)) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPgPaymentType('TOKEN_ADVANCE');
                            setRoomModalStep('ADDONS');
                          }}
                          className="px-4 py-2.5 rounded-xl border border-orange-200 dark:border-orange-900/40 hover:border-[#ff6325] text-[#ff6325] hover:bg-orange-50 dark:hover:bg-orange-950/20 text-xs font-black transition-all cursor-pointer bg-white dark:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
                        >
                          <span>🔒 Pay ₹{Number((activeRoomService.selectedListing as any)?.tokenAdvanceAmount || activeRoomService.metadata?.tokenAdvanceAmount || 999).toLocaleString()} Token</span>
                        </button>
                      )}

                      {/* Primary Main CTA: Pay Full 1st Month Rent */}
                      <button
                        type="button"
                        onClick={() => {
                          setPgPaymentType('FULL_MONTH_RENT');
                          setRoomModalStep('ADDONS');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6325] to-[#f4511e] hover:from-[#e04e13] hover:to-[#d84315] active:scale-95 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>PAY FULL MONTH (₹{effectiveRent.toLocaleString()})</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoomService(null);
                    setRoomModalStep(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
                >
                  Back to Rooms
                </button>

                <button
                  type="button"
                  onClick={() => setRoomModalStep('ADDONS')}
                  className="px-6 py-2.5 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <span>Choose This Room &rarr;</span>
                </button>
              </>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  // Skip Addons: directly execute checkout payload with empty addons
                  const isBackpackersHostel = category === 'hostels' || venueName.toLowerCase().includes('backpackers');
                  const effectiveMerchantId = isBackpackersHostel ? '51c6a3b8-2abc-9421-7644-2a2dea05dbc0' : (activeRoomService.merchantId || merchantId);
                  const effectiveMerchantName = isBackpackersHostel ? 'Backpackers Hostel' : venueName;

                  if (isPgStay) {
                    const rawBasePrice = Number(activeRoomService.price || activeRoomService.basePrice) || 2200;
                    // Tenure discount calculation
                    const tenureDiscountPct = hostelDurationMonths >= 11 ? 15 : hostelDurationMonths >= 6 ? 10 : hostelDurationMonths >= 3 ? 5 : 0;
                    const basePrice = Math.round(rawBasePrice * (1 - tenureDiscountPct / 100));

                    const foodDiscount = Number(
                      (activeRoomService.selectedListing as any)?.foodDiscountAmount ??
                      activeRoomService.metadata?.foodDiscountAmount ??
                      2000
                    );
                    const actualRent = isFoodExcluded ? Math.max(500, basePrice - foodDiscount) : basePrice;
                    const deposit = Number((activeRoomService.selectedListing as any)?.securityDeposit ?? activeRoomService.metadata?.securityDeposit ?? activeRoomService.metadata?.refundableDeposit ?? 3000);
                    const tokenAmount = Number((activeRoomService.selectedListing as any)?.tokenAdvanceAmount || activeRoomService.metadata?.tokenAdvanceAmount || 999);
                    const payable = pgPaymentType === 'TOKEN_ADVANCE' ? tokenAmount : actualRent;
                    const slotStr = pgPaymentType === 'TOKEN_ADVANCE'
                      ? `${hostelDurationMonths} Month${hostelDurationMonths > 1 ? 's' : ''} Stay (Starts ${checkIn}) • Token Advance ₹${tokenAmount}`
                      : `1st Month Rent for ${hostelDurationMonths} Month${hostelDurationMonths > 1 ? 's' : ''} Stay (Starts ${checkIn}) • ₹${actualRent.toLocaleString()}`;

                    setSelectedService({
                      ...activeRoomService,
                      price: payable,
                      name: `${effectiveMerchantName} — ${activeRoomService.name} (${pgPaymentType === 'TOKEN_ADVANCE' ? 'Token Advance' : '1st Month Rent'})`,
                      merchantId: effectiveMerchantId,
                      merchantName: effectiveMerchantName,
                      merchant: {
                        id: effectiveMerchantId,
                        name: effectiveMerchantName,
                      },
                      merchantObj: {
                        ...(activeRoomService.merchantObj || {}),
                        id: effectiveMerchantId,
                        name: effectiveMerchantName,
                      },
                      category: category === 'hostels' ? 'Hostel Booking' : 'PG & Co-Living Stays',
                      metadata: {
                        ...(activeRoomService.metadata || {}),
                        merchantId: effectiveMerchantId,
                        merchantName: effectiveMerchantName,
                        pgBooking: {
                          venueName: effectiveMerchantName,
                          address,
                          roomType: activeRoomService.name,
                          monthlyRent: actualRent,
                          tokenPaid: payable,
                          refundableDeposit: deposit,
                          foodExcluded: isFoodExcluded,
                          startDate: checkIn,
                          durationMonths: hostelDurationMonths,
                          tenureDiscountPct,
                          paymentType: pgPaymentType,
                          selectedAddons: []
                        }
                      }
                    });

                    setSelectedSlot({
                      id: `pg-bed-${Date.now()}`,
                      timeStr: slotStr,
                      date: checkIn,
                      available: true
                    });

                    setActiveRoomService(null);
                    setRoomModalStep(null);
                    router.push('/booking/checkout');
                    return;
                  }

                  const roomPrice = Number(activeRoomService.price || activeRoomService.basePrice) || 2500;
                  const roomTotal = roomPrice * nights * rooms;
                  const slotStr = `${checkIn} to ${checkOut} (${nights} Night${nights > 1 ? 's' : ''}) • ${adults + children} Guests • ${rooms} Room${rooms > 1 ? 's' : ''}`;

                  setSelectedService({
                    ...activeRoomService,
                    price: roomTotal,
                    name: `${effectiveMerchantName} — ${activeRoomService.name || 'Room'}`,
                    merchantId: effectiveMerchantId,
                    merchantName: effectiveMerchantName,
                    merchant: {
                      id: effectiveMerchantId,
                      name: effectiveMerchantName,
                    },
                    merchantObj: {
                      ...(activeRoomService.merchantObj || {}),
                      id: effectiveMerchantId,
                      name: effectiveMerchantName,
                    },
                    category: category === 'hostels' ? 'Hostel Booking' : (category === 'pg-hostels' ? 'PG & Co-Living Stays' : 'Hotel Booking'),
                    metadata: {
                      ...(activeRoomService.metadata || {}),
                      merchantId: effectiveMerchantId,
                      merchantName: effectiveMerchantName,
                      hotelBooking: {
                        venueName: effectiveMerchantName,
                        realHotelName: rawVenueName,
                        isLuxeBlindBooking,
                        address,
                        roomType: activeRoomService.name,
                        checkIn,
                        checkOut,
                        nights,
                        rooms,
                        adults,
                        children,
                        childAges,
                        pets,
                        petCount,
                        selectedAddons: [],
                        pricePerNight: roomPrice,
                        totalPrice: roomTotal
                      }
                    }
                  });

                  setSelectedSlot({
                    id: `hotel-stay-${Date.now()}`,
                    timeStr: slotStr,
                    date: checkIn,
                    available: true
                  });

                  router.push('/booking/checkout');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-800"
              >
                Skip Add-ons &rarr;
              </button>

              <button
                type="button"
                onClick={() => {
                  // Proceed to Checkout with Selected Addons included
                  const isBackpackersHostel = category === 'hostels' || venueName.toLowerCase().includes('backpackers');
                  const effectiveMerchantId = isBackpackersHostel ? '51c6a3b8-2abc-9421-7644-2a2dea05dbc0' : (activeRoomService.merchantId || merchantId);
                  const effectiveMerchantName = isBackpackersHostel ? 'Backpackers Hostel' : venueName;

                  const roomListings = activeRoomService.rawConfig?.metadata?.listings || activeRoomService.metadata?.listings || [];
                  const selectedListing = activeRoomService.selectedListing || (activeRoomService.selectedListingId ? roomListings.find((l: any) => l.id === activeRoomService.selectedListingId) : roomListings[0]);
                  const roomMeta = selectedListing?.metadata || activeRoomService.metadata || {};

                  const rawAddons = roomMeta.addons || activeRoomService.metadata?.addons || activeRoomService.addOns || [];
                  const partnerListingAddons = Array.isArray(rawAddons) ? rawAddons : [];

                  const defaultPgAddons = isPgStay ? [
                    { id: 'custom-addon-pg-laundry', name: 'Laundry & Washing Machine Access', desc: 'Unlimited monthly washing machine and drying yard access', price: 350, tag: 'Popular', icon: '🧺' },
                    { id: 'custom-addon-pg-parking', name: 'Reserved Two-Wheeler Parking', desc: 'Covered dedicated CCTV-monitored 2-wheeler parking slot', price: 200, tag: 'Convenience', icon: '🛵' },
                    { id: 'custom-addon-pg-locker', name: 'Personal High-Security Locker', desc: 'Keyed personal wardrobe locker with master backup code', price: 250, tag: 'Security', icon: '🔐' },
                  ] : [];

                  const activeAddonsList = partnerListingAddons.length > 0
                    ? partnerListingAddons.map((pa: any, pIdx: number) => ({
                      id: `custom-addon-${pIdx}`,
                      name: typeof pa === 'string' ? pa : (pa.name || 'Custom Add-on'),
                      desc: pa.desc || (isPgStay ? 'Monthly amenity enhancement' : 'Optional enhancement offered directly by host'),
                      price: Number(pa.price || pa.cost || 0),
                      tag: 'Included Choice',
                      icon: '✨'
                    }))
                    : defaultPgAddons;

                  const chosenAddons = activeAddonsList.filter((a: any) => selectedAddonIds.includes(a.id));
                  const currentAddonsSum = chosenAddons.reduce((sum: number, a: any) => sum + (a.price || 0), 0);

                  if (isPgStay) {
                    const rawBasePrice = Number(activeRoomService.price || activeRoomService.basePrice || selectedListing?.price) || 2200;
                    const tenureDiscountPct = hostelDurationMonths >= 11 ? 15 : hostelDurationMonths >= 6 ? 10 : hostelDurationMonths >= 3 ? 5 : 0;
                    const basePrice = Math.round(rawBasePrice * (1 - tenureDiscountPct / 100));

                    const foodDiscount = Number(
                      (selectedListing as any)?.foodDiscountAmount ??
                      activeRoomService.metadata?.foodDiscountAmount ??
                      2000
                    );
                    const actualRent = isFoodExcluded ? Math.max(500, basePrice - foodDiscount) : basePrice;
                    const deposit = Number((selectedListing as any)?.securityDeposit ?? activeRoomService.metadata?.securityDeposit ?? activeRoomService.metadata?.refundableDeposit ?? 3000);
                    const tokenAmount = Number((selectedListing as any)?.tokenAdvanceAmount || activeRoomService.metadata?.tokenAdvanceAmount || 999);
                    const payable = (pgPaymentType === 'TOKEN_ADVANCE' ? tokenAmount : actualRent) + currentAddonsSum;
                    const slotStr = pgPaymentType === 'TOKEN_ADVANCE'
                      ? `${hostelDurationMonths} Month${hostelDurationMonths > 1 ? 's' : ''} Stay (Starts ${checkIn}) • Token Advance ₹${tokenAmount} + Add-ons ₹${currentAddonsSum}`
                      : `1st Month Rent for ${hostelDurationMonths} Month${hostelDurationMonths > 1 ? 's' : ''} Stay (Starts ${checkIn}) • ₹${actualRent.toLocaleString()} + Add-ons ₹${currentAddonsSum}`;

                    setSelectedService({
                      ...activeRoomService,
                      price: payable,
                      name: `${effectiveMerchantName} — ${activeRoomService.name} (${pgPaymentType === 'TOKEN_ADVANCE' ? 'Token Advance' : '1st Month Rent'})`,
                      merchantId: effectiveMerchantId,
                      merchantName: effectiveMerchantName,
                      merchant: {
                        id: effectiveMerchantId,
                        name: effectiveMerchantName,
                      },
                      merchantObj: {
                        ...(activeRoomService.merchantObj || {}),
                        id: effectiveMerchantId,
                        name: effectiveMerchantName,
                      },
                      category: category === 'hostels' ? 'Hostel Booking' : 'PG & Co-Living Stays',
                      metadata: {
                        ...(activeRoomService.metadata || {}),
                        merchantId: effectiveMerchantId,
                        merchantName: effectiveMerchantName,
                        pgBooking: {
                          venueName: effectiveMerchantName,
                          address,
                          roomType: activeRoomService.name,
                          monthlyRent: actualRent,
                          tokenPaid: payable,
                          refundableDeposit: deposit,
                          foodExcluded: isFoodExcluded,
                          startDate: checkIn,
                          durationMonths: hostelDurationMonths,
                          tenureDiscountPct,
                          paymentType: pgPaymentType,
                          selectedAddons: chosenAddons
                        }
                      }
                    });

                    setSelectedSlot({
                      id: `pg-bed-${Date.now()}`,
                      timeStr: slotStr,
                      date: checkIn,
                      available: true
                    });

                    setActiveRoomService(null);
                    setRoomModalStep(null);
                    router.push('/booking/checkout');
                    return;
                  }

                  const roomPrice = Number(activeRoomService.price || activeRoomService.basePrice || selectedListing?.price) || 2500;
                  const roomTotal = roomPrice * nights * rooms;
                  const finalTotal = roomTotal + currentAddonsSum;
                  const slotStr = `${checkIn} to ${checkOut} (${nights} Night${nights > 1 ? 's' : ''}) • ${adults + children} Guests • ${rooms} Room${rooms > 1 ? 's' : ''}`;

                  setSelectedService({
                    ...activeRoomService,
                    price: finalTotal,
                    name: `${effectiveMerchantName} — ${activeRoomService.name || 'Room'}`,
                    merchantId: effectiveMerchantId,
                    merchantName: effectiveMerchantName,
                    merchant: {
                      id: effectiveMerchantId,
                      name: effectiveMerchantName,
                    },
                    merchantObj: {
                      ...(activeRoomService.merchantObj || {}),
                      id: effectiveMerchantId,
                      name: effectiveMerchantName,
                    },
                    category: category === 'hostels' ? 'Hostel Booking' : (category === 'pg-hostels' ? 'PG & Co-Living Stays' : 'Hotel Booking'),
                    metadata: {
                      ...(activeRoomService.metadata || {}),
                      merchantId: effectiveMerchantId,
                      merchantName: effectiveMerchantName,
                      hotelBooking: {
                        venueName: effectiveMerchantName,
                        realHotelName: rawVenueName,
                        isLuxeBlindBooking,
                        address,
                        roomType: activeRoomService.name,
                        checkIn,
                        checkOut,
                        nights,
                        rooms,
                        adults,
                        children,
                        childAges,
                        pets,
                        petCount,
                        selectedAddons: chosenAddons,
                        pricePerNight: roomPrice,
                        totalPrice: finalTotal
                      }
                    }
                  });

                  setSelectedSlot({
                    id: `hotel-stay-${Date.now()}`,
                    timeStr: slotStr,
                    date: checkIn,
                    available: true
                  });

                  router.push('/booking/checkout');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#033266] dark:bg-[#ff6325] hover:bg-[#022349] dark:hover:bg-[#e04e13] active:scale-95 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Proceed to Checkout &rarr;</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

{/* Full-Screen Photo Gallery Lightbox Modal */ }
{
  isGalleryOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0b0f19] rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-sm sm:text-base">{venueName} Gallery</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold">
              {currentImageIdx + 1} of {galleryImages.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsGalleryOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close gallery"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Image View */}
        <div className="relative flex-1 flex items-center justify-center p-4 min-h-0 bg-black/50">
          <img
            src={galleryImages[currentImageIdx] || galleryImages[0]}
            alt={`${venueName} photo ${currentImageIdx + 1}`}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
          />

          {/* Left/Right Prev/Next Buttons */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 shadow-xl cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setCurrentImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 shadow-xl cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="Next photo"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        <div className="p-3 bg-black/70 border-t border-white/10 overflow-x-auto flex items-center gap-2.5 scrollbar-thin scrollbar-thumb-white/20">
          {galleryImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentImageIdx(idx)}
              className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${currentImageIdx === idx
                ? 'border-[#ff6325] scale-105 shadow-md shadow-[#ff6325]/30'
                : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
            >
              <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
                  </AnimatePresence >

  {/* ── PG "Schedule Free Property Visit" Modal ── */ }
  <AnimatePresence>
{
  isVisitModalOpen && (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{visitMode === 'LIVE_VIDEO' ? '📹' : '🗓️'}</span>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {visitMode === 'LIVE_VIDEO' ? 'Schedule Live Video Tour' : 'Schedule Free Property Visit'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {visitMode === 'LIVE_VIDEO' ? 'Live 1-on-1 video walkthrough with property warden' : 'Inspect room, food & facilities before paying'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsVisitModalOpen(false);
              setVisitConfirmed(false);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Visit Type Toggle Switch (Consistent Brand Styling) */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => setVisitMode('IN_PERSON')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${visitMode === 'IN_PERSON'
              ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <span>🏢 Free Visit & Callback</span>
          </button>
          <button
            type="button"
            onClick={() => setVisitMode('LIVE_VIDEO')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${visitMode === 'LIVE_VIDEO'
              ? 'bg-[#033266] dark:bg-[#ff6325] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <span>📹 Live Video Tour</span>
          </button>
        </div>

        {visitConfirmed ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {visitMode === 'LIVE_VIDEO' ? 'Live Video Tour Booked!' : 'Visit Confirmed!'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {visitMode === 'LIVE_VIDEO' ? (
                <>
                  Property Warden will call you on <span className="font-bold text-[#ff6325]">{videoPlatform === 'WHATSAPP' ? 'WhatsApp Video' : 'Google Meet'}</span> for <span className="font-bold text-[#ff6325]">{visitDate}</span> at <span className="font-bold text-[#ff6325]">{visitTimeSlot}</span>. Confirmation SMS sent to {visitPhone || 'your mobile'}.
                </>
              ) : (
                <>
                  The PG Warden has been notified for <span className="font-bold text-[#ff6325]">{visitDate}</span> at <span className="font-bold text-[#ff6325]">{visitTimeSlot}</span>. SMS sent to {visitPhone || 'your mobile'}.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsVisitModalOpen(false);
                setVisitConfirmed(false);
              }}
              className="mt-3 px-6 py-2 bg-[#ff6325] text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 text-xs">
            {visitMode === 'LIVE_VIDEO' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Video Call Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoPlatform('WHATSAPP')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${videoPlatform === 'WHATSAPP'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-white/10 text-slate-600'
                      }`}
                  >
                    <span>💬 WhatsApp Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoPlatform('GOOGLE_MEET')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${videoPlatform === 'GOOGLE_MEET'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-white/10 text-slate-600'
                      }`}
                  >
                    <span>🎥 Google Meet</span>
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Arun Kumar"
                value={visitName}
                onChange={(e) => setVisitName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone Number (For Warden SMS)</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={visitPhone}
                onChange={(e) => setVisitPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  {visitMode === 'LIVE_VIDEO' ? 'Tour Date' : 'Visit Date'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const targetD = visitDate ? new Date(visitDate) : new Date();
                    setVisitCalMonthDate(isNaN(targetD.getTime()) ? new Date() : targetD);
                    setIsVisitCalPopoverOpen(!isVisitCalPopoverOpen);
                  }}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold flex items-center justify-between text-left hover:border-[#ff6325] transition-colors cursor-pointer"
                >
                  <span className="text-slate-900 dark:text-white font-bold">
                    {(() => {
                      try {
                        const [y, m, d] = visitDate.split('-');
                        return `${d}-${m}-${y}`;
                      } catch {
                        return visitDate;
                      }
                    })()}
                  </span>
                  <Calendar size={15} className="text-[#ff6325] shrink-0" />
                </button>

                {/* Custom Popover Calendar matching top booking app UI */}
                <AnimatePresence>
                  {isVisitCalPopoverOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute left-0 bottom-full mb-3 w-72 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl z-[300000] space-y-3"
                    >
                      {/* Month Header with Pill Container & < > Controls (Matching Check-in Calendar) */}
                      <div className="bg-slate-50 dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-2.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setVisitCalMonthDate(new Date(visitCalMonthDate.getFullYear(), visitCalMonthDate.getMonth() - 1, 1));
                          }}
                          className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {visitCalMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setVisitCalMonthDate(new Date(visitCalMonthDate.getFullYear(), visitCalMonthDate.getMonth() + 1, 1));
                          }}
                          className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>

                      {/* Weekday Names */}
                      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                          <div key={d} className="py-1">{d}</div>
                        ))}
                      </div>

                      {/* Days Grid with Blue Circle Selection */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {(() => {
                          const year = visitCalMonthDate.getFullYear();
                          const month = visitCalMonthDate.getMonth();
                          const firstDay = new Date(year, month, 1).getDay();
                          const totalDays = new Date(year, month + 1, 0).getDate();
                          const cells = [];

                          for (let i = 0; i < firstDay; i++) {
                            cells.push(<div key={`standalone-visit-empty-${i}`} className="h-8" />);
                          }

                          for (let d = 1; d <= totalDays; d++) {
                            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const isSelected = visitDate === dStr;
                            const isPast = new Date(dStr) < new Date(new Date().setHours(0, 0, 0, 0));

                            cells.push(
                              <div key={d} className="flex items-center justify-center">
                                <button
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setVisitDate(dStr);
                                    setIsVisitCalPopoverOpen(false);
                                  }}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${isSelected
                                    ? 'bg-[#1a56db] text-white font-black shadow-md shadow-blue-500/40 ring-2 ring-blue-400/30'
                                    : isPast
                                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  {d}
                                </button>
                              </div>
                            );
                          }
                          return cells;
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Preferred Time Slot</label>
                <select
                  value={visitTimeSlot}
                  onChange={(e) => setVisitTimeSlot(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 outline-none text-xs font-semibold"
                >
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                  <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              {visitMode === 'LIVE_VIDEO'
                ? '✓ 1-on-1 live walkthrough • Warden video inspection • Mess & room live preview.'
                : '✓ Free visit pass • PG Warden direct assistance & callback • Sample mess food inspection.'}
            </div>

            <button
              type="button"
              onClick={() => {
                if (!visitName) setVisitName('Guest');
                setVisitConfirmed(true);
              }}
              className="w-full py-3 bg-[#ff6325] hover:bg-[#e04e13] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-2"
            >
              {visitMode === 'LIVE_VIDEO' ? 'Confirm Live Video Tour →' : 'Confirm Free Visit →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
                  </AnimatePresence >
                </div >
              );
}