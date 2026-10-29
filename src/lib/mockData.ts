export interface MockService {
  id: string;
  name: string;
  merchant: string;
  price: number;
  rating: number;
  reviews: number;
  duration: number;
  city: string;
  image: string;
  category: string;
  lat?: number;
  lng?: number;
  desc?: string;
  customCommissionRate?: number;
  metadata?: Record<string, any>;
}

export const MOCK_SERVICES: MockService[] = [
  // H101 Hotel Demo removed to prevent dummy duplicates with real merchant units
  
  // Chennai (2 services)
  { id: 'svc-1', name: 'Premium Haircut', merchant: 'Style Studio', price: 599, rating: 4.8, reviews: 234, duration: 45, city: 'Chennai', image: 'https://picsum.photos/seed/10/400/250', category: 'Salon / Spa Appointment', lat: 13.085, lng: 80.275 },
  { id: 'svc-2', name: 'Yoga Class', merchant: 'ZenFit', price: 499, rating: 4.9, reviews: 189, duration: 60, city: 'Chennai', image: 'https://picsum.photos/seed/11/400/250', category: 'Gym / Yoga Slot Booking', lat: 13.078, lng: 80.268 },

  // Madurai (2 services)
  { id: 'svc-3', name: 'Table Reservation', merchant: 'The Grand temple Dine', price: 1200, rating: 4.7, reviews: 156, duration: 120, city: 'Madurai', image: 'https://picsum.photos/seed/12/400/250', category: 'Restaurant Table Reservation', lat: 9.925, lng: 78.118 },
  { id: 'svc-4', name: 'Concert Tickets', merchant: 'Temple City EventHub', price: 2500, rating: 4.6, reviews: 445, duration: 180, city: 'Madurai', image: 'https://picsum.photos/seed/13/400/250', category: 'Concert Tickets', lat: 9.918, lng: 78.105 },

  // Theni (2 services)
  { id: 'svc-5', name: 'Spa Treatment', merchant: 'Valley Serenity Spa', price: 1800, rating: 4.9, reviews: 312, duration: 90, city: 'Theni', image: 'https://picsum.photos/seed/14/400/250', category: 'Salon / Spa Appointment', lat: 10.012, lng: 77.478 },
  { id: 'svc-6', name: 'Gym Session', merchant: 'Cardamom Hills FitZone', price: 399, rating: 4.5, reviews: 567, duration: 60, city: 'Theni', image: 'https://picsum.photos/seed/15/400/250', category: 'Gym / Yoga Slot Booking', lat: 10.005, lng: 77.462 },

  // Coimbatore (2 services)
  { id: 'svc-7', name: 'Dance Class', merchant: 'Kovai Rhythm Dance', price: 699, rating: 4.8, reviews: 123, duration: 75, city: 'Coimbatore', image: 'https://picsum.photos/seed/16/400/250', category: 'Workshops / Classes', lat: 11.015, lng: 76.958 },
  { id: 'svc-8', name: 'Photography Session', merchant: 'Western Ghats ClickPro', price: 3500, rating: 4.7, reviews: 89, duration: 120, city: 'Coimbatore', image: 'https://picsum.photos/seed/17/400/250', category: 'Workshops / Classes', lat: 11.002, lng: 76.938 },

  // Bangalore (2 services)
  { id: 'svc-9', name: 'Music Lesson', merchant: 'Silicon Valley Melody', price: 800, rating: 4.6, reviews: 67, duration: 45, city: 'Bangalore', image: 'https://picsum.photos/seed/18/400/250', category: 'Workshops / Classes', lat: 12.975, lng: 77.595 },
  { id: 'svc-10', name: 'Art Workshop', merchant: 'Cubbon ArtHouse', price: 1200, rating: 4.8, reviews: 145, duration: 90, city: 'Bangalore', image: 'https://picsum.photos/seed/19/400/250', category: 'Workshops / Classes', lat: 12.962, lng: 77.578 },

  // Mumbai (1 service)
  { id: 'svc-11', name: 'Cooking Class', merchant: 'Marine Drive ChefTable', price: 1500, rating: 4.9, reviews: 201, duration: 150, city: 'Mumbai', image: 'https://picsum.photos/seed/20/400/250', category: 'Workshops / Classes', lat: 19.082, lng: 72.882 },

  // Delhi (1 service)
  { id: 'svc-12', name: 'Tennis Court Reservation', merchant: 'Connaught SportArena', price: 600, rating: 4.5, reviews: 334, duration: 60, city: 'Delhi', image: 'https://picsum.photos/seed/21/400/250', category: 'Tennis Court', lat: 28.625, lng: 77.215 }
];

export interface DynamicProvider {
  id: string;
  name: string;
  slug: string;
  rating: number;
  reviewCount: number;
  city: string;
  address: string;
  distance: string;
  isVerified: boolean;
  isOpen: boolean;
  tags: string[];
  price: string;
  image: string;
  openTime: string;
  lat?: number;
  lng?: number;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
}

export function getProvidersByCategory(categorySlug: string, categoryName: string, activeCity: string = 'Chennai'): DynamicProvider[] {
  const seedString = `${categorySlug}-${activeCity}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const nameSuffixes = ['Care', 'Studio', 'Pro', 'Express', 'Hub', 'Specialists'];
  const emojis = ['✨', '📍', '🔧', '⭐', '⚡', '🏥', '🔑', '🎯'];

  // Realistic names based on category
  const nameTemplates: Record<string, string[]> = {
    temple: [
      'Sri Kapaleeshwarar Temple',
      'Arulmigu Meenakshi Amman Kovil',
      'Sri Vadapalani Murugan Mandir',
      'Lord Ganesha Vinayagar Temple',
      'Sri Parthasarathy Temple',
      'Marundeeswarar Shiva Kovil',
      'Sri Ashtalakshmi Shrine',
      'Sai Baba Prayer Center',
      'Arulmigu Ekambareswarar Temple',
      'Sri Kalikambal Alayam',
      'Sri Velleeswarar Temple',
      'Sri Mangadu Kamakshi Kovil'
    ],
    shop: [
      'Saravana Super Store',
      'Nilgiris Grocery & Fresh Mart',
      'Reliance Smart Bazaar',
      'Ganesh Provisions & General Shop',
      'Pazhamudir Nilayam Fruits',
      'Metro Traders & Stationers',
      'Organic Harvest Daily Mart',
      'Vasanth & Co Electronics',
      'Chennai Silks Fashion Mall',
      'Daily Needs Supermarket',
      'Nalli Silks Emporium',
      'Local Corner Grocery'
    ],
    hotels: [
      'The Grand Residency Suites',
      'Taj Gateway Royal Plaza',
      'Royal Palace Premium Inn',
      'Fortune Park Boutique Hotel',
      'Classic Heritage Resort',
      'Park Hyatt Residency',
      'The Leela Palace Hotel',
      'Radisson Blu Plaza',
      'Courtyard Marriott Inn',
      'Trident Executive Hotel',
      'Ginger Premium Stay',
      'Heritage Inn Rooms'
    ],
    dining: [
      'Anjappar Chettinad Restaurant',
      'Saravana Bhavan Pure Veg',
      'Sangeetha Veg Restaurant',
      'The Spice Route Cafe & Bistro',
      'Coastal Flavors Seafood Grill',
      'Dindigul Thalappakatti Biryani',
      'The Grand Temple Dine',
      'Copper Chimney Fine Dining',
      'Barbeque Nation Buffet',
      'Cafe Coffee Day Elite',
      'Little Italy Pizzeria',
      'Cream Centre Desserts'
    ]
  };

  const categoryEmojis: Record<string, string> = {
    temple: '🛕',
    shop: '🛍️',
    hotels: '🏨',
    dining: '🍴',
    salons: '💇',
    doctor: '🏥',
    cabs: '🚖',
    'football-turf': '⚽',
    movies: '🎥',
    plumber: '🔧',
    electrician: '⚡',
  };

  // Base coordinates mapping for cities
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    chennai: { lat: 13.0827, lng: 80.2707 },
    madurai: { lat: 9.9252, lng: 78.1198 },
    theni: { lat: 10.0104, lng: 77.4702 },
    coimbatore: { lat: 11.0168, lng: 76.9558 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.2090 }
  };
  const base = cityCoords[activeCity.toLowerCase()] || cityCoords.chennai;
  
  // Increase from 5 to 12 mock items per category to create a highly populated map
  return Array.from({ length: 12 }, (_, i) => {
    const s = hash + i;
    const rating = parseFloat((4.2 + seededRandom(s) * 0.75).toFixed(1));
    const reviews = Math.floor(seededRandom(s + 1) * 350) + 15;
    const basePrice = Math.floor(seededRandom(s + 2) * 80) * 10 + 200;
    const distanceVal = parseFloat((0.8 + seededRandom(s + 3) * 6.5).toFixed(1));
    const openH = Math.floor(seededRandom(s + 4) * 3) + 8;
    const closeH = Math.floor(seededRandom(s + 5) * 4) + 6;

    // Determine realistic name based on templates
    let providerName = '';
    const templates = nameTemplates[categorySlug];
    if (templates && templates[i % templates.length]) {
      providerName = templates[i % templates.length];
    } else {
      const suffix = nameSuffixes[(Math.abs(hash) + i) % nameSuffixes.length];
      providerName = `${categoryName} ${suffix}`;
    }

    const providerSlug = `${categorySlug}-${i + 1}`;
    
    // Determine realistic emoji
    const emoji = categoryEmojis[categorySlug] || emojis[(Math.abs(hash) + i) % emojis.length];

    // Add slightly offset coordinates for dynamic providers in this city
    const offsetLat = base.lat + (seededRandom(s + 9) - 0.5) * 0.1;
    const offsetLng = base.lng + (seededRandom(s + 10) - 0.5) * 0.1;

    return {
      id: `prov-${categorySlug}-${i + 1}`,
      name: providerName,
      slug: providerSlug,
      rating,
      reviewCount: reviews,
      city: activeCity,
      address: `${Math.floor(seededRandom(s + 6) * 140) + 1} Main Road, Sector ${i + 1}`,
      distance: `${distanceVal} km`,
      isVerified: seededRandom(s + 7) > 0.4,
      isOpen: seededRandom(s + 8) > 0.3,
      tags: [categoryName, 'Verified', 'Instant scheduling'],
      price: `₹${basePrice}`,
      image: emoji,
      openTime: `${openH} AM – ${closeH} PM`,
      lat: offsetLat,
      lng: offsetLng
    };
  });
}

export function getMerchantBySlug(merchantSlug: string, category: string, bookingType: string, activeCity: string = 'Chennai') {
  if (merchantSlug === 'apollo-dental') {
    return {
      name: 'Apollo Dental Care',
      image: '🦷',
      rating: 4.8,
      reviewCount: 324,
      city: 'Chennai',
      address: '42 Anna Nagar Main Road',
      distance: '1.2 km',
      phone: '+91 98765 43210',
      email: 'info@apollodental.com',
      isVerified: true,
      isOpen: true,
      openTime: '9 AM – 9 PM',
      about: 'Apollo Dental Care is a state-of-the-art dental clinic providing top-tier oral care services. Our team of experienced dentists are committed to offering premium treatments.',
      services: [
        { id: 's1', name: 'Root Canal Treatment', price: 3500, duration: '60 min', desc: 'Expert pain-free root canal treatment with ceramic crowns.' },
        { id: 's2', name: 'Dental Braces Consultation', price: 500, duration: '30 min', desc: 'Detailed orthodontic scanning and consultation for aligners.' },
        { id: 's3', name: 'Teeth Whitening & Bleaching', price: 2500, duration: '45 min', desc: 'Advanced laser teeth whitening for a sparkling smile.' }
      ]
    };
  }

  if (merchantSlug === 'smile-dental') {
    return {
      name: 'Smile Dental Studio',
      image: '😁',
      rating: 4.6,
      reviewCount: 189,
      city: 'Chennai',
      address: '15 T Nagar High Road',
      distance: '2.4 km',
      phone: '+91 98765 12345',
      email: 'smile@dentalstudio.com',
      isVerified: true,
      isOpen: true,
      openTime: '8 AM – 8 PM',
      about: 'At Smile Dental Studio, we create beautiful and healthy smiles. We utilize the latest tools to ensure precision and comfort.',
      services: [
        { id: 's5', name: 'Teeth Cleaning', price: 800, duration: '30 min', desc: 'Complete scaling and polishing using ultra-fine scaling tools.' },
        { id: 's6', name: 'Composite Fillings', price: 1200, duration: '30 min', desc: 'Natural-looking tooth-colored composite fillings for cavities.' }
      ]
    };
  }

  const parts = merchantSlug.split('-');
  let indexStr = parts.pop() || '1';
  let index = parseInt(indexStr);
  if (isNaN(index)) {
    index = 1;
    parts.push(indexStr); // Put the word back if it wasn't a number
  }
  const categorySlug = parts.join('-');
  const categoryFormatted = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const names = ['Care', 'Studio', 'Pro', 'Express', 'Hub', 'Specialists'];
  const nameIdx = (categorySlug.length + index) % names.length;
  const merchantName = categoryFormatted ? `${categoryFormatted} ${names[nameIdx]}` : merchantSlug;

  return {
    name: merchantName,
    image: '🏢',
    rating: 4.6,
    reviewCount: 145,
    city: activeCity,
    address: `${Math.floor(categorySlug.length * 7)} Main Road, Block ${index}`,
    distance: `${(1.2 + index * 0.9).toFixed(1)} km`,
    phone: `+91 90000 00${index}00`,
    email: `contact@${categorySlug}-${index}.com`,
    isVerified: true,
    isOpen: true,
    openTime: '9 AM – 7 PM',
    about: `Welcome to ${merchantName}, your trusted premium partner in ${activeCity}. We guarantee expert consultations, absolute hygiene, and top-tier services tailored to you.`,
    services: [
      { id: `s-ds1-${merchantSlug}`, name: `${categoryFormatted} Standard Check`, price: 400, duration: '30 min', desc: `Standard evaluation and basic package for ${categoryFormatted}.` },
      { id: `s-ds2-${merchantSlug}`, name: `${categoryFormatted} Premium Package`, price: 1500, duration: '60 min', desc: `Full comprehensive treatment and priority support for ${categoryFormatted}.` }
    ]
  };
}

export function getServiceById(id: string): MockService | null {
  const found = MOCK_SERVICES.find(s => s.id === id);
  if (found) return found;

  const apolloServices = [
    { id: 's1', name: 'Root Canal Treatment', price: 3500, duration: 60, city: 'Chennai', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60', category: 'Doctor Appointment', merchant: 'Apollo Dental Care' },
    { id: 's2', name: 'Dental Braces Consultation', price: 500, duration: 30, city: 'Chennai', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60', category: 'Doctor Appointment', merchant: 'Apollo Dental Care' },
    { id: 's3', name: 'Teeth Whitening & Bleaching', price: 2500, duration: 45, city: 'Chennai', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60', category: 'Doctor Appointment', merchant: 'Apollo Dental Care' }
  ];
  const foundApollo = apolloServices.find(s => s.id === id);
  if (foundApollo) {
    return { ...foundApollo, reviews: 324, rating: 4.8 };
  }

  const smileServices = [
    { id: 's5', name: 'Teeth Cleaning', price: 800, duration: 30, city: 'Chennai', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=60', category: 'Doctor Appointment', merchant: 'Smile Dental Studio' },
    { id: 's6', name: 'Composite Fillings', price: 1200, duration: 30, city: 'Chennai', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=60', category: 'Doctor Appointment', merchant: 'Smile Dental Studio' }
  ];
  const foundSmile = smileServices.find(s => s.id === id);
  if (foundSmile) {
    return { ...foundSmile, reviews: 189, rating: 4.6 };
  }

  if (id.startsWith('s-ds1-') || id.startsWith('s-ds2-')) {
    const isPremium = id.startsWith('s-ds2-');
    const merchantSlug = id.replace(isPremium ? 's-ds2-' : 's-ds1-', '');
    
    const parts = merchantSlug.split('-');
    parts.pop();
    const categorySlug = parts.join('-');
    const categoryFormatted = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const names = ['Care', 'Studio', 'Pro', 'Express', 'Hub', 'Specialists'];
    const nameIdx = categorySlug.length % names.length;
    const merchantName = `${categoryFormatted} ${names[nameIdx]}`;

    return {
      id,
      name: isPremium ? `${categoryFormatted} Premium Package` : `${categoryFormatted} Standard Check`,
      merchant: merchantName,
      price: isPremium ? 1500 : 400,
      rating: 4.6,
      reviews: 145,
      duration: isPremium ? 60 : 30,
      city: 'Chennai',
      image: isPremium 
        ? 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60'
        : 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60',
      category: categoryFormatted
    };
  }

  return null;
}
