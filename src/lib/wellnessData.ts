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
  originalPrice?: number;
  durationMinutes: number;
  genderTarget: 'MEN' | 'WOMEN' | 'UNISEX';
  serviceMode: 'IN_SALON' | 'HOME_VISIT' | 'BOTH';
  icon: string;
  description: string;
  popular?: boolean;
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
  homeVisitEnabled: boolean;
  homeMinOrderValue: number;
  homeConvenienceFee: number;
  openTimeStr: string; // e.g. "09:00"
  closeTimeStr: string; // e.g. "21:00"
  slotIntervalMinutes: number;
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
    openingHours: '09:00 AM – 09:00 PM (Daily)',
    openTimeStr: '09:00',
    closeTimeStr: '21:00',
    slotIntervalMinutes: 30,
    homeVisitEnabled: true,
    homeMinOrderValue: 399,
    homeConvenienceFee: 49,
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
        price: 499,
        originalPrice: 650,
        durationMinutes: 30,
        genderTarget: 'MEN',
        serviceMode: 'BOTH',
        icon: '✂️',
        description: 'Scalp assessment, master scissor cut, refreshing hair wash & blow-dry styling.',
        popular: true
      },
      {
        id: 'trt-beard-spa',
        name: 'Royal Beard Sculpting & Hot Towel Treatment',
        category: 'BEARD',
        price: 349,
        originalPrice: 450,
        durationMinutes: 20,
        genderTarget: 'MEN',
        serviceMode: 'BOTH',
        icon: '🧔',
        description: 'Razor sharp beard contouring, organic argan oil massage and hot steam towel infusion.',
        popular: true
      },
      {
        id: 'trt-hair-women',
        name: 'Creative Layered Haircut & Moroccan Blow-Dry',
        category: 'HAIR',
        price: 899,
        originalPrice: 1200,
        durationMinutes: 45,
        genderTarget: 'WOMEN',
        serviceMode: 'BOTH',
        icon: '💇‍♀️',
        description: 'Custom face-framing cut, deep conditioning hair wash, and voluminous runway finish.',
        popular: true
      },
      {
        id: 'trt-hair-spa-keratin',
        name: 'Intense Keratin Hair Spa & Scalp Detox',
        category: 'HAIR',
        price: 1299,
        originalPrice: 1800,
        durationMinutes: 60,
        genderTarget: 'UNISEX',
        serviceMode: 'BOTH',
        icon: '💆‍♀️',
        description: 'Protein infusion serum, 20-min acupressure scalp massage & ozone micro-mist steam.',
        popular: false
      },
      {
        id: 'trt-gold-facial',
        name: '24K Gold Radiance Facial & De-Tan',
        category: 'SKIN_FACIAL',
        price: 1499,
        originalPrice: 2000,
        durationMinutes: 60,
        genderTarget: 'UNISEX',
        serviceMode: 'BOTH',
        icon: '✨',
        description: 'Cellular rejuvenation with 24K gold foil serum, ultrasonic exfoliation & firming mask.',
        popular: true
      },
      {
        id: 'trt-detox-cleanup',
        name: 'Charcoal Deep Pore Cleanup & Blackhead Removal',
        category: 'SKIN_FACIAL',
        price: 699,
        originalPrice: 950,
        durationMinutes: 30,
        genderTarget: 'UNISEX',
        serviceMode: 'BOTH',
        icon: '🫧',
        description: 'Deep pore unclogging with activated charcoal peel, vacuum extraction & calming aloe mist.',
        popular: false
      },
      {
        id: 'trt-aromatherapy',
        name: 'Deep Tissue Swedish Aromatherapy Massage',
        category: 'SPA_MASSAGE',
        price: 1999,
        originalPrice: 2600,
        durationMinutes: 60,
        genderTarget: 'UNISEX',
        serviceMode: 'BOTH',
        icon: '💆',
        description: 'Therapeutic pressure-point massage using heated lavender oils to melt chronic muscle tension.',
        popular: true
      },
      {
        id: 'trt-foot-reflexology',
        name: 'Thai Foot Reflexology & Herbal Soak',
        category: 'SPA_MASSAGE',
        price: 799,
        originalPrice: 1100,
        durationMinutes: 30,
        genderTarget: 'UNISEX',
        serviceMode: 'BOTH',
        icon: '🦶',
        description: 'Warm Epsom salt foot bath followed by acupressure zone therapy for deep stress relief.',
        popular: false
      },
      {
        id: 'trt-groom-package',
        name: 'The Royal Groom Makeover Package',
        category: 'BRIDAL',
        price: 2999,
        originalPrice: 4200,
        durationMinutes: 90,
        genderTarget: 'MEN',
        serviceMode: 'IN_SALON',
        icon: '👑',
        description: 'Precision haircut, beard styling, gold facial, hair spa & de-tan manicure.',
        popular: true
      },
      {
        id: 'trt-bridal-package',
        name: 'Bridal Glow & Skin Rejuvenation Ritual',
        category: 'BRIDAL',
        price: 4999,
        originalPrice: 6500,
        durationMinutes: 120,
        genderTarget: 'WOMEN',
        serviceMode: 'IN_SALON',
        icon: '👰‍♀️',
        description: 'Complete pre-bridal ritual: luxury facial, body polishing, hair keratin & nail art.',
        popular: true
      }
    ],
    specialists: [
      {
        id: 'spec-any',
        name: 'Any Available Professional',
        role: 'Fastest Slot • Certified Specialist',
        avatar: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80',
        rating: 4.95,
        experienceYears: 6,
        specialties: ['All Services', 'Zero Waiting Time']
      },
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
  const base = MASTER_WELLNESS_CONFIG['style-studio'];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('bokspot_wellness_custom_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...base, ...parsed };
      }
    } catch (e) {
      // ignore
    }
  }
  if (!identifier) return base;
  const clean = identifier.toLowerCase().trim();
  const match = Object.values(MASTER_WELLNESS_CONFIG).find(w => 
    w.slug.includes(clean) || clean.includes(w.slug) || w.name.toLowerCase().includes(clean)
  );
  return match || base;
}
