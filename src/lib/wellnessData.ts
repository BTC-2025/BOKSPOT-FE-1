// Salon, Spa & Wellness Appointments Dynamic Registry & Master Schemas
// Connects dynamically to Merchant Services & Staff Roster

export interface WellnessSpecialist {
  id: string;
  name: string;
  role: string; // e.g. "Creative Hair Director", "Senior Spa Therapist", "Skin Consultant"
  avatar: string;
  rating: number;
  experienceYears: number;
  specialties: string[];
}

export interface WellnessTreatment {
  id: string;
  name: string;
  category: 'HAIR' | 'BEARD' | 'SKIN_FACIAL' | 'SPA_MASSAGE' | 'BRIDAL';
  price: number;
  durationMinutes: number;
  genderTarget: 'MEN' | 'WOMEN' | 'UNISEX';
  icon: string;
  description: string;
}

export interface WellnessVenueConfig {
  slug: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: string;
  city: string;
  locality: string;
  address: string;
  openingHours: string;
  heroImage: string;
  galleryImages: string[];
  amenities: string[];
  treatments: WellnessTreatment[];
  specialists: WellnessSpecialist[];
}

export const MASTER_WELLNESS_CONFIG: Record<string, WellnessVenueConfig> = {
  'style-studio': {
    slug: 'style-studio',
    name: 'Style Studio Luxury Salon & Urban Spa',
    category: 'Salon / Spa Appointment',
    rating: 4.9,
    reviewsCount: '620+ reviews',
    city: 'Chennai',
    locality: 'Nungambakkam',
    address: '18 Khader Nawaz Khan Road, Nungambakkam, Chennai 600006',
    openingHours: '09:30 AM – 09:00 PM (Daily)',
    heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'
    ],
    amenities: [
      'Private AC Spa Suites',
      'Complimentary Herbal Green Tea / Espresso',
      '100% Organic Dermatologist-Approved Products',
      'Steam & Shower Enclosure',
      'Valet Car Parking'
    ],
    treatments: [
      {
        id: 'trt-haircut-men',
        name: 'Signature Precision Haircut & Styling',
        category: 'HAIR',
        price: 599,
        durationMinutes: 45,
        genderTarget: 'MEN',
        icon: '✂️',
        description: 'Scalp assessment, master scissor cut, refreshing hair wash & blow-dry styling.'
      },
      {
        id: 'trt-beard-spa',
        name: 'Royal Beard Sculpting & Hot Towel Treatment',
        category: 'BEARD',
        price: 399,
        durationMinutes: 30,
        genderTarget: 'MEN',
        icon: '🧔',
        description: 'Razor sharp beard contouring, organic argan oil massage and hot steam towel infusion.'
      },
      {
        id: 'trt-hair-women',
        name: 'Creative Layered Haircut & Moroccan Blow-Dry',
        category: 'HAIR',
        price: 899,
        durationMinutes: 60,
        genderTarget: 'WOMEN',
        icon: '💇‍♀️',
        description: 'Custom face-framing cut, deep conditioning hair wash, and voluminous runway finish.'
      },
      {
        id: 'trt-gold-facial',
        name: '24K Gold Radiance Facial & De-Tan',
        category: 'SKIN_FACIAL',
        price: 1499,
        durationMinutes: 75,
        genderTarget: 'UNISEX',
        icon: '✨',
        description: 'Cellular rejuvenation with 24K gold foil serum, ultrasonic exfoliation & firming mask.'
      },
      {
        id: 'trt-aromatherapy',
        name: 'Deep Tissue Swedish Aromatherapy Massage',
        category: 'SPA_MASSAGE',
        price: 1999,
        durationMinutes: 60,
        genderTarget: 'UNISEX',
        icon: '💆',
        description: 'Therapeutic pressure-point massage using heated lavender oils to melt chronic muscle tension.'
      }
    ],
    specialists: [
      {
        id: 'spec-arun',
        name: 'Arun Varma',
        role: 'Creative Hair Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
        rating: 4.95,
        experienceYears: 11,
        specialties: ['Fades & Tapers', 'Textured Scissors', 'Scalp Health']
      },
      {
        id: 'spec-priya',
        name: 'Priya Sundaram',
        role: 'Senior Aesthetician & Skin Stylist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
        rating: 4.92,
        experienceYears: 8,
        specialties: ['Gold Facials', 'Skin Rejuvenation', 'Bridal Makeovers']
      },
      {
        id: 'spec-marcus',
        name: 'Marcus D\'Souza',
        role: 'Lead Swedish Spa Therapist',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
        rating: 4.88,
        experienceYears: 9,
        specialties: ['Deep Tissue Massage', 'Aromatherapy', 'Reflexology']
      }
    ]
  }
};

export function getWellnessConfig(identifier?: string): WellnessVenueConfig {
  if (!identifier) return MASTER_WELLNESS_CONFIG['style-studio'];
  const clean = identifier.toLowerCase().trim();
  const match = Object.values(MASTER_WELLNESS_CONFIG).find(w => 
    w.slug.includes(clean) || clean.includes(w.slug) || w.name.toLowerCase().includes(clean)
  );
  return match || MASTER_WELLNESS_CONFIG['style-studio'];
}

