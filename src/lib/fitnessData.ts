// Gym / Yoga Slot & Fitness Pass Dynamic Registry & Master Schemas
// Connects dynamically to Merchant Services & Fitness Trainer Roster

export interface FitnessTrainer {
  id: string;
  name: string;
  role: string; // e.g. "Senior Strength & Conditioning Coach", "CrossFit & Hypertrophy Specialist"
  avatar: string;
  rating: number;
  experienceYears: number;
  specialties: string[];
}

export interface GymMembershipPlan {
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

export interface GymPTSessionPackage {
  id: string;
  title: string;
  sessionsCount: number;
  price: number;
  description: string;
  recommendedFor: string;
}

export interface FitnessPassItem {
  id: string;
  name: string;
  formatType: 'MEMBERSHIP' | 'OPEN_GYM' | 'YOGA_CLASS' | 'PERSONAL_TRAINING' | 'CROSSFIT';
  price: number;
  originalPrice?: number;
  durationMinutes?: number; // 60 mins or full day 720 mins
  batchType: 'SINGLE_SESSION' | 'DAY_PASS' | 'MONTHLY_MEMBERSHIP' | 'QUARTERLY_MEMBERSHIP' | 'ANNUAL_MEMBERSHIP';
  tenureDuration?: string; // "1 Month", "3 Months", "6 Months", "1 Year"
  savingsPct?: number; // 15%, 25%, 40%
  popularBadge?: string;
  maxCapacity: number; // e.g. 15 spots per yoga batch or 40 for open gym floor
  icon: string;
  description: string;
  amenities: string[];
}

export interface FitnessVenueConfig {
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
  passes: FitnessPassItem[];
  membershipPlans: GymMembershipPlan[];
  ptPackages: GymPTSessionPackage[];
  trainers: FitnessTrainer[];
  timeSlots: {
    time: string;
    session: 'MORNING' | 'EVENING';
    spotsLeft: number;
  }[];
}

export const GYM_DEFAULT_MEMBERSHIP_PLANS: GymMembershipPlan[] = [
  {
    id: 'gym-plan-1m',
    name: '1 Month Starter Pass',
    months: 1,
    price: 1999,
    originalPrice: 2499,
    pricePerDay: 66,
    popular: false,
    savingsBadge: 'Save 20%',
    description: 'Zero lock-in 30 days full gym floor & cardio machines access.',
    features: ['Unlimited Gym Floor & Free Weights', 'Cardio Deck & Steam Bath Access', 'Free RFID Smart Locker', 'General Floor Coach Guidance']
  },
  {
    id: 'gym-plan-3m',
    name: '3 Months Transformation',
    months: 3,
    price: 4499,
    originalPrice: 5999,
    pricePerDay: 49,
    popular: true,
    savingsBadge: '🔥 Most Popular (Save 25%)',
    description: 'Our #1 chosen transformation plan with certified nutritionist diet chart.',
    features: ['All 1-Month Privileges Included', 'Personalized Macro & Diet Plan', 'Bi-weekly InBody Fat% Analysis', '15-Day Vacation Freeze Option']
  },
  {
    id: 'gym-plan-6m',
    name: '6 Months Elite Athlete',
    months: 6,
    price: 7499,
    originalPrice: 11999,
    pricePerDay: 41,
    popular: false,
    savingsBadge: 'Save 37%',
    description: 'Half-yearly commitment for serious hypertrophy & body recomposition.',
    features: ['Everything in 3-Month Plan', 'Complimentary Gym Shaker & Duffel Bag', '30-Day Flexible Pause / Freeze', 'Monthly Coach Progress Review']
  },
  {
    id: 'gym-plan-12m',
    name: '12 Months Annual VIP Pro',
    months: 12,
    price: 11999,
    originalPrice: 20999,
    pricePerDay: 32,
    popular: false,
    savingsBadge: '👑 Best Value (Save 43%)',
    description: '365 days unlimited VIP fitness regime at lowest cost per day.',
    features: ['365 Days Unrestricted Gym Floor', '2 Free 1-on-1 Personal Trainer Sessions', '45-Day Pause Privilege', 'Dedicated Locker Priority']
  }
];

export const GYM_DEFAULT_PT_PACKAGES: GymPTSessionPackage[] = [
  {
    id: 'pt-none',
    title: 'General Floor Trainer',
    sessionsCount: 0,
    price: 0,
    description: 'On-floor coaches assist with posture, spotting, machine ergonomics & basic workout routine.',
    recommendedFor: 'Independent workouts & regular lifters'
  },
  {
    id: 'pt-12',
    title: '12 Sessions (1 Month PT)',
    sessionsCount: 12,
    price: 3499,
    description: 'Dedicated 1-on-1 coach, customized workout splits, form correction & weekly weigh-in accountability.',
    recommendedFor: 'Beginners & fast-track fat loss'
  },
  {
    id: 'pt-24',
    title: '24 Sessions (2 Months PT)',
    sessionsCount: 24,
    price: 5999,
    description: 'Comprehensive 1-on-1 coaching for advanced muscle building, mobility work and progressive overload.',
    recommendedFor: 'Complete physique transformation'
  }
];

export const MASTER_FITNESS_CONFIG: Record<string, FitnessVenueConfig> = {
  'zenfit-clinic': {
    slug: 'zenfit-clinic',
    name: 'ZenFit Fitness Club & Gym Floor',
    category: 'Gym Membership & Fitness Passes',
    rating: 4.9,
    reviewsCount: '540+ reviews',
    city: 'Chennai',
    locality: 'Alwarpet / TTK Road',
    address: '84 TTK Road, Alwarpet, Chennai, Tamil Nadu 600018',
    openingHours: '05:30 AM – 10:00 PM (Monday – Sunday)',
    heroImage: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80'
    ],
    features: [
      'Biomechanical Hammer Strength & Rogue Racks',
      'Rubberized Olympic Lifting Turf Platform',
      'Luxury Locker Rooms with Steam & Hot Showers',
      'In-House Whey Shake & Cold Brew Bar',
      'Valet Parking & EV Charging Spot'
    ],
    membershipPlans: GYM_DEFAULT_MEMBERSHIP_PLANS,
    ptPackages: GYM_DEFAULT_PT_PACKAGES,
    passes: [
      {
        id: 'pass-open-gym',
        name: '1-Day Trial & Experience Pass (Open Gym & Steam)',
        formatType: 'OPEN_GYM',
        price: 299,
        durationMinutes: 720,
        batchType: 'DAY_PASS',
        tenureDuration: 'Single Day Pass',
        maxCapacity: 45,
        icon: '🎫',
        description: 'Single-day trial access to free weights, squat racks, turf track, cardio machines & steam shower.',
        amenities: ['Locker with Key', 'Steam Bath Access', 'Shower & Towel']
      },
      {
        id: 'pass-pt-session',
        name: 'Single 1-on-1 Personal Trainer Assessment Session',
        formatType: 'PERSONAL_TRAINING',
        price: 799,
        durationMinutes: 60,
        batchType: 'SINGLE_SESSION',
        tenureDuration: 'Single 60m PT Session',
        maxCapacity: 1,
        icon: '💪',
        description: 'Dedicated 60-min personalized session with a master strength coach, postural check & workout log.',
        amenities: ['Dedicated Coach', 'InBody Body Composition Scan', 'Post-Workout Protein Shake']
      }
    ],
    trainers: [
      {
        id: 'trn-vikram',
        name: 'Vikram Rathore, CSCS',
        role: 'Head Strength & Conditioning Coach',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
        rating: 4.95,
        experienceYears: 9,
        specialties: ['Powerlifting', 'Hypertrophy', 'Fat Loss Conditioning']
      },
      {
        id: 'trn-kavitha',
        name: 'Kavitha Ramamurthy, K11',
        role: 'Senior Functional & Calisthenics Coach',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
        rating: 4.93,
        experienceYears: 7,
        specialties: ['Body Recomposition', 'Injury Rehab', 'Mobility & Core']
      },
      {
        id: 'trn-rahul',
        name: 'Rahul Shenoy, ACE',
        role: 'Transformation & Athletic Performance Specialist',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
        rating: 4.91,
        experienceYears: 6,
        specialties: ['HIIT & Conditioning', 'Olympic Lifting', 'Macro Coaching']
      }
    ],
    timeSlots: [
      { time: '05:30 AM', session: 'MORNING', spotsLeft: 12 },
      { time: '07:00 AM', session: 'MORNING', spotsLeft: 15 },
      { time: '08:30 AM', session: 'MORNING', spotsLeft: 10 },
      { time: '10:00 AM', session: 'MORNING', spotsLeft: 18 },
      { time: '05:00 PM', session: 'EVENING', spotsLeft: 8 },
      { time: '06:30 PM', session: 'EVENING', spotsLeft: 6 },
      { time: '08:00 PM', session: 'EVENING', spotsLeft: 14 }
    ]
  }
};

export function getFitnessConfig(identifier?: string): FitnessVenueConfig {
  if (!identifier) return MASTER_FITNESS_CONFIG['zenfit-clinic'];
  const clean = identifier.toLowerCase().trim();
  const match = Object.values(MASTER_FITNESS_CONFIG).find(f => 
    f.slug.includes(clean) || clean.includes(f.slug) || f.name.toLowerCase().includes(clean)
  );
  return match || MASTER_FITNESS_CONFIG['zenfit-clinic'];
}
