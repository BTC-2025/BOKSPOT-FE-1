// Dining & Restaurant Table Booking Master Data & Configuration
// Covers:
// - Cuisines, Meal Sessions (Breakfast, Lunch, High Tea, Dinner)
// - Table Types (2-Seater Cozy, 4-Seater Family, 6-8 Seater Group, PDR - Private Dining Room)
// - Seating Zones (AC Main Hall, Romantic Rooftop Open-Air, Garden Patio, Chef's Table)
// - Food Menus & Pre-order Specialties
// - Table Reservation Deposit & Deals

export interface DiningTableType {
  id: string;
  name: string;
  capacity: string; // e.g. "2 Guests", "4-6 Guests"
  minGuests: number;
  maxGuests: number;
  zone: 'AC_INDOOR' | 'ROOFTOP' | 'GARDEN_PATIO' | 'PRIVATE_DINING';
  depositAmount: number; // ₹0 for free reservation or ₹200-₹500 adjustable against final bill
  badge?: string;
  icon: string;
  description: string;
}

export interface DiningTimeSlot {
  time: string;
  session: 'LUNCH' | 'DINNER' | 'BREAKFAST' | 'HIGH_TEA';
  discountOffer?: string; // e.g. "Flat 20% Off Bill", "Complimentary Dessert"
  isFastFilling?: boolean;
}

export interface DiningMenuItem {
  id: string;
  name: string;
  category: 'STARTER' | 'MAIN_COURSE' | 'BREADS_RICE' | 'DESSERT' | 'BEVERAGE';
  isVeg: boolean;
  price: number;
  rating: number;
  chefSpecial?: boolean;
  description: string;
  imageUrl?: string;
}

export interface RestaurantProfileConfig {
  slug: string;
  name: string;
  cuisines: string[];
  costForTwo: number;
  rating: number;
  reviewsCount: string;
  city: string;
  locality: string;
  address: string;
  openingHours: string;
  heroImage: string;
  galleryImages: string[];
  features: string[];
  tableTypes: DiningTableType[];
  timeSlots: DiningTimeSlot[];
  popularMenu: DiningMenuItem[];
  bookingDeals: {
    id: string;
    title: string;
    description: string;
    code: string;
  }[];
}

export const MASTER_RESTAURANTS_CONFIG: Record<string, RestaurantProfileConfig> = {
  'grand-temple-dine': {
    slug: 'grand-temple-dine',
    name: 'The Grand Temple Dine & Rooftop Bistro',
    cuisines: ['South Indian Heritage', 'Chettinad Gourmet', 'North Indian', 'Tandoor & Grills'],
    costForTwo: 950,
    rating: 4.8,
    reviewsCount: '840+ reviews',
    city: 'Chennai',
    locality: 'Mylapore / R.A. Puram',
    address: '24 South Mada Street, Mylapore, Chennai, Tamil Nadu 600004',
    openingHours: '11:30 AM – 03:30 PM, 07:00 PM – 11:00 PM',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'
    ],
    features: [
      'Air Conditioned Luxury Dining',
      'Starlit Romantic Rooftop Seating',
      'Pure Veg & Heritage Non-Veg Kitchens',
      'Complimentary Valet Parking',
      'Live Instrumental Fusion Music'
    ],
    tableTypes: [
      {
        id: 'tbl-cozy-2',
        name: 'Cozy Couple Table (2 Seater)',
        capacity: '1 - 2 Guests',
        minGuests: 1,
        maxGuests: 2,
        zone: 'ROOFTOP',
        depositAmount: 0,
        badge: 'Romantic',
        icon: '🍷',
        description: 'Intimate candlelit seating with panoramic city rooftop views.'
      },
      {
        id: 'tbl-family-4',
        name: 'Prime Family Booth (4 Seater)',
        capacity: '3 - 4 Guests',
        minGuests: 3,
        maxGuests: 4,
        zone: 'AC_INDOOR',
        depositAmount: 0,
        badge: 'Most Popular',
        icon: '🛋️',
        description: 'Plush cushioned booth seating in the central air-conditioned royal dining hall.'
      },
      {
        id: 'tbl-large-6',
        name: 'Celebration Grand Table (6 - 8 Seater)',
        capacity: '5 - 8 Guests',
        minGuests: 5,
        maxGuests: 8,
        zone: 'AC_INDOOR',
        depositAmount: 200,
        badge: 'Celebrations',
        icon: '🎂',
        description: 'Spacious extended table ideal for family reunions, birthdays & gatherings.'
      },
      {
        id: 'tbl-pdr',
        name: 'Royal Private Dining Suite (PDR)',
        capacity: '8 - 14 Guests',
        minGuests: 8,
        maxGuests: 14,
        zone: 'PRIVATE_DINING',
        depositAmount: 500,
        badge: 'Ultra Luxury',
        icon: '👑',
        description: 'Exclusive sound-insulated VIP room with dedicated butler & custom curated menu.'
      }
    ],
    timeSlots: [
      // Lunch Sessions
      { time: '12:00 PM', session: 'LUNCH', discountOffer: 'Flat 20% Off on Food Bill', isFastFilling: false },
      { time: '12:45 PM', session: 'LUNCH', discountOffer: 'Flat 15% Off', isFastFilling: true },
      { time: '01:30 PM', session: 'LUNCH', discountOffer: 'Flat 15% Off', isFastFilling: true },
      { time: '02:15 PM', session: 'LUNCH', discountOffer: 'Flat 20% Off', isFastFilling: false },
      // Dinner Sessions
      { time: '07:00 PM', session: 'DINNER', discountOffer: 'Complimentary Welcome Mocktail', isFastFilling: false },
      { time: '07:45 PM', session: 'DINNER', discountOffer: 'Prime Slot (Full Menu Available)', isFastFilling: true },
      { time: '08:30 PM', session: 'DINNER', discountOffer: 'Live Acoustic Music Session', isFastFilling: true },
      { time: '09:15 PM', session: 'DINNER', discountOffer: 'Chef Special Dessert Free', isFastFilling: true },
      { time: '10:00 PM', session: 'DINNER', discountOffer: 'Late Night Dinner Special', isFastFilling: false }
    ],
    popularMenu: [
      {
        id: 'menu-1',
        name: 'Ghee Podi Tossed Idli & Chutney Trio',
        category: 'STARTER',
        isVeg: true,
        price: 180,
        rating: 4.9,
        chefSpecial: true,
        description: 'Mini button idlis pan-roasted in aromatic Guntur karam podi and organic cow ghee.'
      },
      {
        id: 'menu-2',
        name: 'Chettinad Pepper Chicken Sukka',
        category: 'STARTER',
        isVeg: false,
        price: 320,
        rating: 4.8,
        chefSpecial: true,
        description: 'Tender country chicken braised in stone-ground tellicherry black pepper and shallots.'
      },
      {
        id: 'menu-3',
        name: 'Paneer Butter Masala & Garlic Naan Combo',
        category: 'MAIN_COURSE',
        isVeg: true,
        price: 340,
        rating: 4.7,
        description: 'Charcoal-grilled cottage cheese cubes simmered in velvet tomato makhani sauce.'
      },
      {
        id: 'menu-4',
        name: 'Dum Biryani with Mirchi Ka Salan',
        category: 'MAIN_COURSE',
        isVeg: false,
        price: 380,
        rating: 4.9,
        chefSpecial: true,
        description: 'Fragrant Seeraga Samba rice layered with slow-cooked spiced meat and saffron.'
      },
      {
        id: 'menu-5',
        name: 'Elaneer Payasam (Tender Coconut Kheer)',
        category: 'DESSERT',
        isVeg: true,
        price: 160,
        rating: 4.9,
        chefSpecial: true,
        description: 'Chilled creamy dessert prepared with freshly scooped tender coconut pulp and cardamom.'
      }
    ],
    bookingDeals: [
      { id: 'deal-1', title: '20% Instant Discount', description: 'Applicable on total food bill for lunch bookings between 12 PM - 3 PM', code: 'DINE20' },
      { id: 'deal-2', title: 'Free Birthday Cake & Sparklers', description: 'Complimentary 500g chocolate truffle cake for celebration table reservations', code: 'BDAYBOK' }
    ]
  }
};

export function getDiningConfig(identifier?: string): RestaurantProfileConfig {
  if (!identifier) return MASTER_RESTAURANTS_CONFIG['grand-temple-dine'];
  const clean = identifier.toLowerCase().trim();
  const match = Object.values(MASTER_RESTAURANTS_CONFIG).find(r => 
    r.slug.includes(clean) || clean.includes(r.slug) || r.name.toLowerCase().includes(clean)
  );
  return match || MASTER_RESTAURANTS_CONFIG['grand-temple-dine'];
}

