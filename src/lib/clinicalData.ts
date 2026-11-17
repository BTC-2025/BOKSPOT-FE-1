// Doctor & Healthcare Consultation Dynamic Registry & Master Schemas
// Benchmark: Practo, Apollo 24/7, Tata 1mg
// Aligned with Bokspot Category #32 (doctor) & Merchant D101 (Apollo Dental)

export interface DoctorSpecialist {
  id: string;
  name: string;
  qualifications: string; // e.g. "MDS - Orthodontics, BDS"
  role: string; // e.g. "Senior Consultant & Dental Surgeon"
  department: string; // "Dental", "General Medicine", "Pediatrics", "Dermatology"
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewsCount: string;
  avatar: string;
  opdRoom: string;
  availableDays: string[];
  languages: string[];
}

export interface ClinicVenueConfig {
  slug: string;
  name: string;
  category: string;
  merchantCode: string;
  rating: number;
  reviewsCount: string;
  city: string;
  locality: string;
  address: string;
  emergencyPhone: string;
  openingHours: string;
  heroImage: string;
  galleryImages: string[];
  facilities: string[];
  doctors: DoctorSpecialist[];
  consultationModes: {
    type: 'IN_CLINIC' | 'VIDEO_CALL';
    label: string;
    description: string;
    icon: string;
  }[];
  commonSymptoms: string[];
  timeSlots: {
    time: string;
    session: 'MORNING' | 'EVENING';
    tokensLeft: number;
  }[];
}

export const MASTER_CLINIC_CONFIG: Record<string, ClinicVenueConfig> = {
  'apollo-dental': {
    slug: 'apollo-dental',
    name: 'Apollo Dental & Super Specialty Polyclinic',
    category: 'Doctor Appointment',
    merchantCode: 'D101',
    rating: 4.9,
    reviewsCount: '620+ patient reviews',
    city: 'Chennai',
    locality: 'Anna Nagar / 2nd Avenue',
    address: 'Plot 112, 2nd Avenue, Anna Nagar East, Chennai 600102',
    emergencyPhone: '+91 44 2621 0000',
    openingHours: '08:30 AM – 09:00 PM (Monday – Saturday)',
    heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80'
    ],
    facilities: [
      'Digital OPG Dental X-Ray & 3D Intraoral Scanner',
      'Air-Conditioned Waiting Lounge with Token Screen',
      'Sterilization Autoclave Lab (Class B Medical Standard)',
      'Wheelchair Accessible Ramp & Priority Senior Citizen Care',
      'Pharmacy & Lab Sample Collection Desk Inside'
    ],
    doctors: [
      {
        id: 'doc-rajesh',
        name: 'Dr. Rajesh Kannan, MDS',
        qualifications: 'MDS (Orthodontics), BDS — Madras Medical College',
        role: 'Chief Dental Surgeon & Implantologist',
        department: 'Dental Surgery & Implants',
        experienceYears: 14,
        consultationFee: 500,
        rating: 4.94,
        reviewsCount: '480+ consultations',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
        opdRoom: 'OPD Chamber 102 (First Floor)',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        languages: ['English', 'Tamil']
      },
      {
        id: 'doc-preeti',
        name: 'Dr. Preeti Menon, BDS',
        qualifications: 'BDS, Fellowship in Aesthetic & Cosmetic Dentistry',
        role: 'Senior Cosmetic Dentist & Smile Designer',
        department: 'Cosmetic Dentistry & Root Canal',
        experienceYears: 9,
        consultationFee: 450,
        rating: 4.88,
        reviewsCount: '310+ consultations',
        avatar: 'https://images.unsplash.com/photo-1594824813583-b7880d388277?w=400&q=80',
        opdRoom: 'OPD Chamber 104 (First Floor)',
        availableDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
        languages: ['English', 'Tamil', 'Malayalam']
      }
    ],
    consultationModes: [
      {
        type: 'IN_CLINIC',
        label: 'In-Clinic OPD Consultation',
        description: 'Physical consultation at clinic with live token queue & vital checkup',
        icon: '🏥'
      },
      {
        type: 'VIDEO_CALL',
        label: 'Instant Teleconsultation / Video',
        description: 'Secure 1-on-1 video call via Google Meet / WhatsApp with digital prescription',
        icon: '📱'
      }
    ],
    commonSymptoms: [
      'Severe Toothache / Cavity',
      'Bleeding Gums / Gingivitis',
      'Wisdom Tooth Pain / Extraction',
      'Teeth Alignment / Braces Check',
      'Teeth Yellowing / Scaling & Polish',
      'Routine 6-Month Oral Health Check'
    ],
    timeSlots: [
      // Morning Session
      { time: '09:00 AM', session: 'MORNING', tokensLeft: 3 },
      { time: '09:30 AM', session: 'MORNING', tokensLeft: 2 },
      { time: '10:15 AM', session: 'MORNING', tokensLeft: 5 },
      { time: '11:00 AM', session: 'MORNING', tokensLeft: 4 },
      { time: '11:45 AM', session: 'MORNING', tokensLeft: 1 },
      // Evening Session
      { time: '05:00 PM', session: 'EVENING', tokensLeft: 6 },
      { time: '05:45 PM', session: 'EVENING', tokensLeft: 4 },
      { time: '06:30 PM', session: 'EVENING', tokensLeft: 3 },
      { time: '07:15 PM', session: 'EVENING', tokensLeft: 2 },
      { time: '08:00 PM', session: 'EVENING', tokensLeft: 5 }
    ]
  }
};

export function getClinicConfig(identifier?: string): ClinicVenueConfig {
  if (!identifier) return MASTER_CLINIC_CONFIG['apollo-dental'];
  const clean = identifier.toLowerCase().trim();
  const match = Object.values(MASTER_CLINIC_CONFIG).find(c =>
    c.slug.includes(clean) || clean.includes(c.slug) || c.name.toLowerCase().includes(clean) || c.merchantCode.toLowerCase() === clean
  );
  return match || MASTER_CLINIC_CONFIG['apollo-dental'];
}

