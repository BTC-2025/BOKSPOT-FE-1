// Yoga Shala, Mat Booking & Meditation Dynamic Registry & Master Schemas
// Authentic Yoga Flow with certified gurus, lineages, and serene batch schedules

export interface YogaGuru {
  id: string;
  name: string;
  role: string; // e.g. "Acharya - Rishikesh Alliance", "Senior Iyengar Alignment Specialist"
  avatar: string;
  rating: number;
  experienceYears: number;
  lineage: string;
  specialties: string[];
}

export interface YogaMembershipPlan {
  id: string;
  name: string;
  months: number;
  price: number;
  originalPrice: number;
  pricePerDay: number;
  popular?: boolean;
  savingsBadge?: string;
  description: string;
  features: string[];
}

export interface YogaPassItem {
  id: string;
  name: string;
  discipline: 'HATHA' | 'ASHTANGA_VINYASA' | 'PRANAYAMA_SOUND_BATH' | 'YOGA_THERAPY' | 'TRIAL_PASS';
  price: number;
  originalPrice?: number;
  durationMinutes: number;
  batchType: 'SINGLE_SESSION' | 'DAY_PASS' | 'MONTHLY_SADHANA';
  maxCapacity: number;
  description: string;
  inclusions: string[];
}

export interface YogaShalaConfig {
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
  features: string[];
  passes: YogaPassItem[];
  membershipPlans: YogaMembershipPlan[];
  gurus: YogaGuru[];
  timeSlots: {
    time: string;
    sessionName: string;
    sessionType: 'SUNRISE' | 'MORNING' | 'SUNSET' | 'MEDITATION';
    spotsLeft: number;
  }[];
}

export const YOGA_DEFAULT_MEMBERSHIP_PLANS: YogaMembershipPlan[] = [
  {
    id: 'yoga-sadhana-1m',
    name: '1 Month Shala Sadhana',
    months: 1,
    price: 2199,
    originalPrice: 2800,
    pricePerDay: 73,
    popular: false,
    savingsBadge: 'Save 21%',
    description: 'Unlimited daily access to morning & evening shala batches.',
    features: ['Unlimited Shala Mat Access', 'Free Cork Yoga Mat & Props', 'Herbal Detox Drink Daily', 'Weekend Sound Bath Workshop']
  },
  {
    id: 'yoga-sadhana-3m',
    name: '3 Months Yogic Transformation',
    months: 3,
    price: 4999,
    originalPrice: 6999,
    pricePerDay: 55,
    popular: true,
    savingsBadge: 'Most Popular (Save 28%)',
    description: 'Structured 90-day yogic progression covering asanas, pranayama and chakra alignment.',
    features: ['All 1-Month Privileges Included', 'Bi-weekly Postural Correction Check', 'Chakra Alignment & Meditation Guide', '15-Day Flexible Pause Privilege']
  },
  {
    id: 'yoga-sadhana-6m',
    name: '6 Months Yogic Immersion',
    months: 6,
    price: 8999,
    originalPrice: 12999,
    pricePerDay: 49,
    popular: false,
    savingsBadge: 'Save 30%',
    description: 'Comprehensive half-yearly shala pass with master guru retreats and kriyas.',
    features: ['Unlimited Morning & Evening Batches', '2 Master Guru Private Consultations', 'Complimentary Organic Cotton Mat Bag', '30-Day Flexible Pause Privilege']
  }
];

export const MASTER_YOGA_CONFIG: Record<string, YogaShalaConfig> = {
  'prana-veda-shala': {
    slug: 'prana-veda-shala',
    name: 'Prana Veda Yoga Shala & Meditation Sanctuary',
    category: 'Yoga Shala, Meditation & Sound Bath',
    rating: 4.96,
    reviewsCount: '620+ reviews',
    city: 'Chennai',
    locality: 'Alwarpet / TTK Road',
    address: '42 TTK Road, Near Olive Sanctuary, Alwarpet, Chennai, Tamil Nadu 600018',
    openingHours: '05:45 AM – 08:30 PM (Daily)',
    heroImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80'
    ],
    features: [
      'Natural Bamboo Flooring & Sunlit Glass Studio',
      'Sanitized Eco-Friendly Cork Mats & Cotton Bolsters',
      'Tibetan Singing Bowls & Brass Gongs Sound Studio',
      'Herbal Detox Tea & Ayurvedic Brew Bar',
      'Peaceful Garden Walkway & Valet Parking'
    ],
    membershipPlans: YOGA_DEFAULT_MEMBERSHIP_PLANS,
    passes: [
      {
        id: 'yoga-trial-pass',
        name: '1-Day Shala Experience & Mat Pass',
        discipline: 'TRIAL_PASS',
        price: 299,
        durationMinutes: 75,
        batchType: 'SINGLE_SESSION',
        maxCapacity: 18,
        description: 'Complete trial access to any morning sunrise or evening yoga batch with herbal tea.',
        inclusions: ['Eco Cork Mat Provided', 'Ayurvedic Detox Brew', 'Locker & Shower Access']
      },
      {
        id: 'yoga-hatha-flow',
        name: 'Hatha Yoga & Breathwork Batch',
        discipline: 'HATHA',
        price: 399,
        durationMinutes: 60,
        batchType: 'SINGLE_SESSION',
        maxCapacity: 20,
        description: 'Traditional slow-paced asana practice focusing on alignment, spinal flexibility and pranayama.',
        inclusions: ['Guided Pranayama', 'Props & Bolsters', 'Herbal Refreshment']
      },
      {
        id: 'yoga-ashtanga-vinyasa',
        name: 'Ashtanga Vinyasa Dynamic Flow',
        discipline: 'ASHTANGA_VINYASA',
        price: 449,
        durationMinutes: 75,
        batchType: 'SINGLE_SESSION',
        maxCapacity: 15,
        description: 'Energizing primary series flow building stamina, core strength and dynamic balance.',
        inclusions: ['Sweat Towel & Mat', 'Core Alignment Adjustments', 'Post-Flow Lemon Honey Brew']
      },
      {
        id: 'yoga-sound-bath',
        name: 'Tibetan Sound Bath & Deep Yoga Nidra',
        discipline: 'PRANAYAMA_SOUND_BATH',
        price: 499,
        durationMinutes: 60,
        batchType: 'SINGLE_SESSION',
        maxCapacity: 14,
        description: 'Acoustic sound frequencies with 7-metal singing bowls inducing meditative state & stress relief.',
        inclusions: ['Eye Pillows & Blankets', 'Aromatherapy Diffusers', 'Deep Sleep Relaxation']
      },
      {
        id: 'yoga-guru-1on1',
        name: 'Single 1-on-1 Dedicated Yoga Therapy Guru Session',
        discipline: 'YOGA_THERAPY',
        price: 799,
        durationMinutes: 60,
        batchType: 'SINGLE_SESSION',
        maxCapacity: 1,
        description: 'Private personalized session with a master guru addressing posture, sciatica or stress.',
        inclusions: ['Dedicated Master Guru', 'Custom Daily Routine Plan', 'Postural Alignment Audit']
      }
    ],
    gurus: [
      {
        id: 'guru-shanti',
        name: 'Acharya Shanti Vardhan',
        role: 'Master Hatha & Ashtanga Acharya',
        avatar: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&q=80',
        rating: 4.97,
        experienceYears: 12,
        lineage: 'Rishikesh Yoga Peeth (E-RYT 500)',
        specialties: ['Spinal Alignment', 'Pranayama Kriyas', 'Ashtanga Primary Series']
      },
      {
        id: 'guru-meenakshi',
        name: 'Meenakshi Sundaram',
        role: 'Senior Iyengar & Therapeutic Yoga Specialist',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
        rating: 4.94,
        experienceYears: 9,
        lineage: 'Iyengar Yoga Institute Certified',
        specialties: ['Back Pain Rehab', 'Joint Mobility', 'Restorative Asanas']
      },
      {
        id: 'guru-ananya',
        name: 'Ananya Sharma',
        role: 'Sound Healing & Yoga Nidra Practitioner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
        rating: 4.92,
        experienceYears: 6,
        lineage: 'Himalayan Sound Therapy Master',
        specialties: ['Tibetan Singing Bowls', 'Chakra Balancing', 'Stress & Anxiety Relief']
      }
    ],
    timeSlots: [
      { time: '06:00 AM', sessionName: 'Brahma Muhurta Sunrise Flow', sessionType: 'SUNRISE', spotsLeft: 8 },
      { time: '07:30 AM', sessionName: 'Morning Asana & Pranayama', sessionType: 'MORNING', spotsLeft: 12 },
      { time: '09:00 AM', sessionName: 'Gentle Flow & Breathwork', sessionType: 'MORNING', spotsLeft: 14 },
      { time: '05:30 PM', sessionName: 'Sunset Vinyasa & Mobility', sessionType: 'SUNSET', spotsLeft: 6 },
      { time: '07:00 PM', sessionName: 'Tibetan Sound Bath & Yoga Nidra', sessionType: 'MEDITATION', spotsLeft: 5 }
    ]
  }
};

export function getYogaConfig(identifier?: string): YogaShalaConfig {
  if (!identifier) return MASTER_YOGA_CONFIG['prana-veda-shala'];
  const clean = identifier.toLowerCase().trim();
  const match = Object.values(MASTER_YOGA_CONFIG).find(y =>
    y.slug.includes(clean) || clean.includes(y.slug) || y.name.toLowerCase().includes(clean)
  );
  return match || MASTER_YOGA_CONFIG['prana-veda-shala'];
}

