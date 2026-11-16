// Entertainment & Live Events Master Archetype Data & Configuration
// Covers categories:
// 15. movies (Cinema / Movie Tickets - CineMax Multiplex - M101)
// 16. theatre (Theatre Shows - Nataka Kala Rangam - M102)
// 17. concerts (Concert Tickets - VibeNation Live Events - M103)
// 18. events (Events & Festivals - Grand Fiesta Carnival - M104)
// 19. exhibitions (Exhibition Entry - Pragati Trade Expo - M105)
// 20. workshops (Workshops / Classes - Creative Canvas Hub - M106)
// 21. gaming (Gaming Arena Booking - Cyber Core Cafe - G101)

export interface EntSeatTier {
  id: string;
  name: string;
  price: number;
  icon: string;
  badge?: string;
  desc: string;
}

export interface EntShowtime {
  time: string;
  screen: string;
  status: string;
  fillingFast?: boolean;
}

export interface EntSnackAddon {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
}

export interface EntertainmentCategoryConfig {
  slug: string;
  categoryName: string;
  merchantId: string;
  merchantName: string;
  username: string;
  defaultPrice: number;
  heroImage: string;
  galleryImages: string[];
  formats: string[];
  languages: string[];
  showtimes: EntShowtime[];
  seatTiers: EntSeatTier[];
  snackAddons: EntSnackAddon[];
  amenities: string[];
  venueRules: {
    icon: string;
    title: string;
    desc: string;
  };
  branches: {
    id: string;
    name: string;
    city: string;
    address: string;
    offeringsSummary: string;
  }[];
}

export const ENTERTAINMENT_MASTER_CONFIGS: Record<string, EntertainmentCategoryConfig> = {
  // ── 15. Cinema / Movie Tickets (CineMax Multiplex - M101) ──
  movies: {
    slug: 'movies',
    categoryName: 'Cinema / Movie Tickets',
    merchantId: '635bce5c-6d3a-56b4-b7ed-9320ea055dae',
    merchantName: 'CineMax Multiplex',
    username: 'M101',
    defaultPrice: 190,
    heroImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80',
      'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&q=80'
    ],
    formats: ['IMAX Laser 3D', 'Dolby Atmos 7.1', '4DX Motion', 'RealD 3D / 2D'],
    languages: ['Tamil', 'English', 'Hindi', 'Telugu'],
    showtimes: [
      { time: '10:30 AM', screen: 'Audi 1 (IMAX Laser)', status: 'Fast Filling', fillingFast: true },
      { time: '02:15 PM', screen: 'Audi 1 (IMAX Laser)', status: 'Available' },
      { time: '06:45 PM', screen: 'Audi 2 (Dolby Atmos)', status: 'Fast Filling', fillingFast: true },
      { time: '10:00 PM', screen: 'Audi 2 (Dolby Atmos)', status: 'Available' }
    ],
    seatTiers: [
      { id: 'recliner', name: 'Royal Recliner (Lounge)', price: 380, icon: '👑', badge: 'VIP Lounger', desc: '180° Motorized Recliner + In-Seat Dining Butler' },
      { id: 'prime', name: 'Prime Circle', price: 250, icon: '🌟', badge: 'Popular', desc: 'Optimum Eye-Level Center Rows with Extra Legroom' },
      { id: 'classic', name: 'Classic Executive', price: 190, icon: '🎟️', desc: 'Standard Tier High-Back Ergonomic Cinema Seating' }
    ],
    snackAddons: [
      { id: 'popcorn', name: 'Tub Popcorn + Coke Combo', price: 240, icon: '🍿', desc: 'Large Salted/Caramel Popcorn with 500ml Chilled Coke' },
      { id: 'nachos', name: 'Warm Cheesy Nachos', price: 180, icon: '🌮', desc: 'Crispy Tortilla Chips with Warm Jalapeño Cheese Dip' },
      { id: 'coffee', name: 'Cold Coffee / Iced Tea', price: 120, icon: '🥤', desc: 'Chilled Refreshing Beverage Delivered directly to your Seat' }
    ],
    amenities: [
      'IMAX Commercial Laser Projection',
      'Dolby Atmos 64-Channel Spatial Audio',
      'Contactless QR M-Ticket Entry',
      'In-Seat F&B Butler Delivery',
      'Valet Car & Bike Parking'
    ],
    venueRules: {
      icon: '🍿',
      title: 'Outside Food Prohibited',
      desc: 'Outside food and beverages are strictly not allowed inside cinema auditoriums.'
    },
    branches: [
      {
        id: 'branch-cinemax-omr',
        name: 'CineMax Multiplex — OMR Marina Mall',
        city: 'Chennai',
        address: 'Marina Mall, 4th Floor, Egatoor, OMR, Chennai',
        offeringsSummary: 'IMAX Laser 3D, Dolby Atmos Screen 2 & 3, VIP Recliner Lounge'
      },
      {
        id: 'branch-cinemax-vadapalani',
        name: 'CineMax Multiplex — Nexus Forum Vadapalani',
        city: 'Chennai',
        address: 'Nexus Forum Mall, 3rd Floor, Vadapalani, Chennai',
        offeringsSummary: '4DX Motion Cinema, Dolby Atmos 7.1, 8 Screens Multiplex'
      },
      {
        id: 'branch-cinemax-hyderabad',
        name: 'CineMax Multiplex — Inorbit Mall Cyberabad',
        city: 'Hyderabad',
        address: 'Inorbit Mall, Madhapur, Hitec City, Hyderabad',
        offeringsSummary: 'IMAX Laser Experience, 4K RGB Laser, Gourmet Concessions'
      },
      {
        id: 'branch-cinemax-bangalore',
        name: 'CineMax Multiplex — Koramangala Forum',
        city: 'Bangalore',
        address: 'Hosur Road, Koramangala, Bangalore',
        offeringsSummary: 'Dolby Atmos 64-Channel, Gold Class Recliner Lounge'
      }
    ]
  },

  // ── 16. Theatre Shows (Nataka Kala Rangam - M102) ──
  theatre: {
    slug: 'theatre',
    categoryName: 'Theatre Shows',
    merchantId: 'e4a69557-1b75-5404-9257-01419210fba0',
    merchantName: 'Nataka Kala Rangam',
    username: 'M102',
    defaultPrice: 350,
    heroImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80',
      'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800&q=80'
    ],
    formats: ['Live Stage Drama', 'Acoustic Soundstage', 'Musical Theatre'],
    languages: ['Tamil', 'English', 'Hindi'],
    showtimes: [
      { time: '04:00 PM', screen: 'Main Auditorium', status: 'Available' },
      { time: '07:30 PM', screen: 'Main Auditorium', status: 'Fast Filling', fillingFast: true }
    ],
    seatTiers: [
      { id: 'patron', name: 'Patron Box (Front Rows)', price: 750, icon: '👑', badge: 'Front Row', desc: 'Front Row unobstructed view of stage performance' },
      { id: 'balcony', name: 'Mezzanine Balcony', price: 450, icon: '🌟', badge: 'Best Acoustic', desc: 'Center Balcony with panoramic stage acoustics' },
      { id: 'general', name: 'General Hall Entry', price: 350, icon: '🎟️', desc: 'Standard Tier auditorium seating' }
    ],
    snackAddons: [
      { id: 'filter_coffee', name: 'Hot Filter Coffee & Cookies', price: 110, icon: '☕', desc: 'Traditional South Indian Filter Coffee with Butter Biscuits' },
      { id: 'samosa', name: 'Crispy Samosa Platter (2 Pcs)', price: 90, icon: '🥟', desc: 'Served with mint and tamarind chutney' }
    ],
    amenities: [
      'Natural Acoustic Architecture',
      'Full AC Air Circulation',
      'Green Room & Backstage Access for VIP Patrons',
      'Wheelchair Accessible Ramps'
    ],
    venueRules: {
      icon: '📵',
      title: 'Silent Mode Mandatory',
      desc: 'Mobile phones must be strictly switched off or on silent mode during the live play.'
    },
    branches: [
      {
        id: 'branch-nataka-chennai',
        name: 'Nataka Kala Rangam — Mylapore',
        city: 'Chennai',
        address: 'Luz Church Road, Mylapore, Chennai',
        offeringsSummary: '700-Seat Proscenium Theatre, Heritage Stage & Green Rooms'
      },
      {
        id: 'branch-nataka-hyderabad',
        name: 'Nataka Kala Rangam — Ravindra Bharati Hub',
        city: 'Hyderabad',
        address: 'Saifabad, Near Assembly, Hyderabad',
        offeringsSummary: 'Classical Stage Plays, Dance Drama & Folk Festivals'
      }
    ]
  },

  // ── 17. Concert Tickets (VibeNation Live Events - M103) ──
  concerts: {
    slug: 'concerts',
    categoryName: 'Concert Tickets',
    merchantId: '6043fd64-f325-5583-8946-e0bbb75f26ce',
    merchantName: 'VibeNation Live Events',
    username: 'M103',
    defaultPrice: 799,
    heroImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'
    ],
    formats: ['Live Arena Concert', 'Festival Stage', 'Open Air Amphitheatre'],
    languages: ['Multi-Lingual', 'Tamil', 'English', 'Hindi', 'Telugu'],
    showtimes: [
      { time: '05:30 PM (Gates Open)', screen: 'Main Festival Arena', status: 'Available' },
      { time: '07:00 PM (Live Show)', screen: 'Main Festival Arena', status: 'Fast Filling', fillingFast: true }
    ],
    seatTiers: [
      { id: 'fanpit', name: 'VIP Fan-Pit (Front Stage)', price: 2499, icon: '🔥', badge: 'Next to Artists', desc: 'Front-of-stage standing pit with dedicated VIP entrance and bar access' },
      { id: 'gold', name: 'Gold Arena Pass', price: 1299, icon: '🌟', badge: 'Popular', desc: 'Elevated viewing platform with premium sound coverage' },
      { id: 'silver', name: 'Silver General Admission', price: 799, icon: '🎟️', desc: 'Main lawn standing entry with multi-angle LED mega-screens' }
    ],
    snackAddons: [
      { id: 'energy_pack', name: 'Festival Energy & Beverage Pass', price: 299, icon: '⚡', desc: '2 Cold beverages + Energy drink voucher' },
      { id: 'merch_band', name: 'Official Tour Wristband & Poster', price: 350, icon: '🎸', desc: 'Collect on entry from the official merchandise hub' }
    ],
    amenities: [
      'L-Acoustics K2 Line Array Concert Audio',
      'Full Synchronized Laser & Pyrotechnic Setup',
      'RFID Wristband Fast-Track Entry',
      'Ambulance & Paramedic Base On-Site',
      'Food Truck Village & Hydration Stations'
    ],
    venueRules: {
      icon: '🎫',
      title: 'Valid Government Photo ID Required',
      desc: 'Physical or digital Govt ID mandatory along with BokSpot QR ticket at security gate.'
    },
    branches: [
      {
        id: 'branch-vibenation-chennai',
        name: 'VibeNation Arena — YMCA Grounds Nandanam',
        city: 'Chennai',
        address: 'YMCA Grounds, Anna Salai, Nandanam, Chennai',
        offeringsSummary: '15,000 Capacity Concert Grounds, VIP Fan-Pit, Food Court'
      },
      {
        id: 'branch-vibenation-hyderabad',
        name: 'VibeNation Arena — Gachibowli Stadium Grounds',
        city: 'Hyderabad',
        address: 'Old Mumbai Highway, Gachibowli, Hyderabad',
        offeringsSummary: 'International Tours, EDM Festivals & Mega Music Concerts'
      },
      {
        id: 'branch-vibenation-bangalore',
        name: 'VibeNation Arena — Manpho Convention Grounds',
        city: 'Bangalore',
        address: 'Near Manyata Tech Park, Nagavara, Bangalore',
        offeringsSummary: 'Festival Arena, Twin Sound Stages & Artisan Flea'
      }
    ]
  },

  // ── 18. Events & Festivals (Grand Fiesta Carnival - M104) ──
  events: {
    slug: 'events',
    categoryName: 'Events & Festivals',
    merchantId: '992e0ecc-caa7-52c5-9cb8-eb151d8048bd',
    merchantName: 'Grand Fiesta Carnival',
    username: 'M104',
    defaultPrice: 299,
    heroImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'
    ],
    formats: ['Carnival Fair', 'Food Festival', 'Comedy Night', 'Night Flea Market'],
    languages: ['English', 'Tamil', 'Hindi'],
    showtimes: [
      { time: '11:00 AM – 04:00 PM', screen: 'Day Session Pass', status: 'Available' },
      { time: '05:00 PM – 11:00 PM', screen: 'Evening Carnival & DJ Night', status: 'Fast Filling', fillingFast: true }
    ],
    seatTiers: [
      { id: 'all_access', name: 'All-Access Carnival Pass', price: 599, icon: '👑', badge: 'Includes Rides', desc: 'Includes entrance + 5 Game Carnival coupons + Fast-Track access' },
      { id: 'entry', name: 'General Single Entry', price: 299, icon: '🎟️', desc: 'Festival grounds entry with live acoustic performances and flea market' }
    ],
    snackAddons: [
      { id: 'carnival_snack', name: 'Cotton Candy & Churros Pack', price: 150, icon: '🍭', desc: 'Fresh pink spun sugar + Warm Cinnamon Churros' }
    ],
    amenities: [
      'Family Friendly Carnival Rides',
      'Over 50+ Curated Food Stalls',
      'Live Indie Acoustic Stage',
      'Kids Play Area with Supervised Care'
    ],
    venueRules: {
      icon: '🎪',
      title: 'Re-entry Allowed with Wristband',
      desc: 'Keep festival wristband intact for seamless re-entry during the event hours.'
    },
    branches: [
      {
        id: 'branch-fiesta-chennai',
        name: 'Grand Fiesta Carnival — Island Grounds',
        city: 'Chennai',
        address: 'Island Grounds, Anna Salai, Park Town, Chennai',
        offeringsSummary: 'Food Trucks, Carnival Ferris Wheel, Artisan Market'
      },
      {
        id: 'branch-fiesta-hyderabad',
        name: 'Grand Fiesta Carnival — Hitex Exhibition Grounds',
        city: 'Hyderabad',
        address: 'Trade Fair Grounds, IZZAT Nagar, Madhapur, Hyderabad',
        offeringsSummary: 'Mega Cultural Carnival, Night Bazaar & Live Food Pavilions'
      }
    ]
  },

  // ── 19. Exhibition Entry (Pragati Trade Expo - M105) ──
  exhibitions: {
    slug: 'exhibitions',
    categoryName: 'Exhibition Entry',
    merchantId: '23c3e74f-1cdd-5a44-9756-76afcafd8e36',
    merchantName: 'Pragati Trade Expo',
    username: 'M105',
    defaultPrice: 199,
    heroImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'
    ],
    formats: ['Trade Expo', 'Art Gallery', 'Tech Showcase', 'Auto Show'],
    languages: ['English', 'Regional'],
    showtimes: [
      { time: '10:00 AM – 02:00 PM', screen: 'Morning Business Slot', status: 'Available' },
      { time: '02:00 PM – 07:00 PM', screen: 'Public & Family Slot', status: 'Available' }
    ],
    seatTiers: [
      { id: 'biz_delegate', name: 'Business Delegate Pass', price: 499, icon: '💼', badge: 'B2B Lounge', desc: 'B2B Buyer directory + Exclusive access to Conference Lounge' },
      { id: 'visitor', name: 'Standard Visitor Pass', price: 199, icon: '🎟️', desc: 'Full-day expo floor visitor pass' }
    ],
    snackAddons: [
      { id: 'lunch_box', name: 'Executive Lunch Buffet Coupon', price: 350, icon: '🍱', desc: 'Redeemable at Expo Dining Hall' }
    ],
    amenities: [
      'Fully Air-Conditioned Exhibition Halls',
      'Digital Badge Printing Stations',
      'Business Networking Desks'
    ],
    venueRules: {
      icon: '💼',
      title: 'Business Card or ID Required',
      desc: 'Visiting card or valid photo identification needed at verification desk.'
    },
    branches: [
      {
        id: 'branch-pragati-chennai',
        name: 'Pragati Trade Expo — Chennai Trade Centre',
        city: 'Chennai',
        address: 'Nandambakkam, Mount Poonamallee Road, Chennai',
        offeringsSummary: '3 Mega AC Exhibition Halls, B2B Networking Lounges'
      },
      {
        id: 'branch-pragati-hyderabad',
        name: 'Pragati Trade Expo — HITEX Exhibition Centre',
        city: 'Hyderabad',
        address: 'HITEX Exhibition Center, Madhapur, Hyderabad',
        offeringsSummary: 'International Trade Fairs, Machinery & Technology Pavilions'
      }
    ]
  },

  // ── 20. Workshops / Classes (Creative Canvas Hub - M106) ──
  workshops: {
    slug: 'workshops',
    categoryName: 'Workshops / Classes',
    merchantId: '4d4ba8c4-4b45-54ab-89e0-3f89606bd1e9',
    merchantName: 'Creative Canvas Hub',
    username: 'M106',
    defaultPrice: 499,
    heroImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80'
    ],
    formats: ['Hands-On Studio', 'Masterclass', 'Ceramic Pottery', 'Baking & Culinary'],
    languages: ['English', 'Tamil'],
    showtimes: [
      { time: '10:00 AM – 12:30 PM', screen: 'Batch A (Morning)', status: 'Fast Filling', fillingFast: true },
      { time: '03:30 PM – 06:00 PM', screen: 'Batch B (Evening)', status: 'Available' }
    ],
    seatTiers: [
      { id: 'seat_kit', name: 'Workshop Seat + Full Materials Kit', price: 899, icon: '🎨', badge: 'All Included', desc: 'Includes canvas, acrylics, brushes & take-home packaging' },
      { id: 'seat_only', name: 'Workshop Seat (Bring Own Kit)', price: 499, icon: '🎟️', desc: 'Masterclass seat with mentor guidance' }
    ],
    snackAddons: [
      { id: 'beverage', name: 'Artisan Tea & Cupcake', price: 120, icon: '🧁', desc: 'Fresh bakery cupcake and herbal tea during break' }
    ],
    amenities: [
      'All Premium Artist Supplies Provided',
      'Step-by-Step Expert Guidance',
      'Take Your Finished Artwork Home'
    ],
    venueRules: {
      icon: '🎨',
      title: 'Wear Comfortable Attire',
      desc: 'Protective aprons provided, but comfortable casual clothing is recommended.'
    },
    branches: [
      {
        id: 'branch-canvas-chennai',
        name: 'Creative Canvas Hub — Alwarpet Studio',
        city: 'Chennai',
        address: 'TTK Road, Alwarpet, Chennai',
        offeringsSummary: 'Pottery Wheel Studio, Resin Art, Acrylic Painting'
      },
      {
        id: 'branch-canvas-hyderabad',
        name: 'Creative Canvas Hub — Jubilee Hills',
        city: 'Hyderabad',
        address: 'Road No 36, Jubilee Hills, Hyderabad',
        offeringsSummary: 'Boutique Creative Workspace, Culinary & Clay Workshops'
      }
    ]
  },

  // ── 21. Gaming Arena Booking (Cyber Core Cafe - G101) ──
  gaming: {
    slug: 'gaming',
    categoryName: 'Gaming Arena Booking',
    merchantId: '5ef7ac5b-f41e-d1bd-8741-498129d65866',
    merchantName: 'Cyber Core Cafe',
    username: 'G101',
    defaultPrice: 150,
    heroImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80'
    ],
    formats: ['PC Esports Rigs', 'PS5 4K VIP Booth', 'Sim Racing Cockpit', 'VR Zone'],
    languages: ['All'],
    showtimes: [
      { time: '11:00 AM – 01:00 PM', screen: 'Morning Esports Slot', status: 'Available' },
      { time: '02:00 PM – 05:00 PM', screen: 'Afternoon Squad Match', status: 'Fast Filling', fillingFast: true },
      { time: '06:00 PM – 09:00 PM', screen: 'Evening Prime League', status: 'Fast Filling', fillingFast: true },
      { time: '09:00 PM – 12:00 AM', screen: 'Midnight All-Nighter', status: 'Available' }
    ],
    seatTiers: [
      { id: 'sim_racing', name: 'Sim Racing Rig (Fanatec DD)', price: 350, icon: '🏎️', badge: 'Ultra Immersive', desc: 'Direct-Drive Force Feedback wheel with triple 144Hz monitors' },
      { id: 'ps5_lounge', name: 'PS5 4K Private Couch Lounge', price: 250, icon: '🎮', badge: 'Popular for 2', desc: '65-inch OLED 120Hz TV + 2 DualSense controllers with FIFA & Tekken' },
      { id: 'esports_pc', name: 'RTX 4080 240Hz PC Booth', price: 150, icon: '🖥️', desc: 'Intel i7 + RTX 4080, ZOWIE 240Hz esports display, mechanical keyboard' }
    ],
    snackAddons: [
      { id: 'gamer_snack', name: 'Red Bull + Loaded Cheese Fries', price: 199, icon: '🍟', desc: 'High-energy gamer fuel served right at your station' }
    ],
    amenities: [
      'Gigabit Dedicated Fiber Internet (Zero Jitter)',
      'Secretlab Ergonomic Gaming Chairs',
      'HyperX Cloud 7.1 Surround Headsets',
      'Chilled AC Gaming Arena with Neon Ambience'
    ],
    venueRules: {
      icon: '🎮',
      title: 'Zero Toxicity & Fair Play Policy',
      desc: 'Keep headset volume balanced and respect fellow community gamers.'
    },
    branches: [
      {
        id: 'branch-cybercore-chennai',
        name: 'Cyber Core Cafe — Sterling Road Nungambakkam',
        city: 'Chennai',
        address: 'Sterling Road, Nungambakkam, Chennai',
        offeringsSummary: '30 RTX 4080 Rigs, 4 PS5 4K Lounges, 2 Sim Racing Cockpits'
      },
      {
        id: 'branch-cybercore-hyderabad',
        name: 'Cyber Core Cafe — Madhapur Hitec City',
        city: 'Hyderabad',
        address: 'Near Ayyappa Society, Madhapur, Hyderabad',
        offeringsSummary: '24/7 LAN Gaming, VR Arena, Esports Tournament Stage'
      },
      {
        id: 'branch-cybercore-bangalore',
        name: 'Cyber Core Cafe — Indiranagar 100ft Road',
        city: 'Bangalore',
        address: '100ft Road, Indiranagar, Bangalore',
        offeringsSummary: 'Flagship Gaming Lounge, Fiber 1Gbps, Console Suites'
      }
    ]
  }
};

export function getEntertainmentCategoryConfig(categorySlug: string): EntertainmentCategoryConfig | null {
  if (!categorySlug) return null;
  const slug = categorySlug.toLowerCase().trim().replace(/\s+/g, '-');
  if (ENTERTAINMENT_MASTER_CONFIGS[slug]) {
    return ENTERTAINMENT_MASTER_CONFIGS[slug];
  }
  // Check exact matches or contains
  if (slug.includes('movie') || slug.includes('cinema') || slug.includes('multiplex') || slug.includes('film')) return ENTERTAINMENT_MASTER_CONFIGS['movies'];
  if (slug.includes('theatre') || slug.includes('theater') || slug.includes('drama') || slug.includes('plays') || slug.includes('stage')) return ENTERTAINMENT_MASTER_CONFIGS['theatre'];
  if (slug.includes('concert') || slug.includes('music') || slug.includes('live-event')) return ENTERTAINMENT_MASTER_CONFIGS['concerts'];
  if (slug.includes('event') || slug.includes('carnival') || slug.includes('festival')) return ENTERTAINMENT_MASTER_CONFIGS['events'];
  if (slug.includes('expo') || slug.includes('exhibition') || slug.includes('trade')) return ENTERTAINMENT_MASTER_CONFIGS['exhibitions'];
  if (slug.includes('workshop') || slug.includes('class') || slug.includes('masterclass')) return ENTERTAINMENT_MASTER_CONFIGS['workshops'];
  if (slug.includes('gaming') || slug.includes('esport') || slug.includes('arcade')) return ENTERTAINMENT_MASTER_CONFIGS['gaming'];
  return null;
}

// ── Curated Now Showing Movies and Premier Events Catalog ──
export interface MovieListingItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  posterUrl: string;
  bannerUrl: string;
  certificate: string; // 'UA 16+', 'U', 'A'
  rating: number; // 8.4
  votesCount: string; // '120K ratings'
  runtime: string; // '2h 45m'
  releaseDate: string;
  languages: string[];
  genres: string[];
  formats: string[]; // ['IMAX 3D', 'Dolby Atmos', '4DX', '2D Standard']
  synopsis: string;
  director: string;
  cast: string[];
  isFeaturedBanner?: boolean;
}

export const NOW_SHOWING_MOVIES: MovieListingItem[] = [
  {
    id: 'mov-avatar-3',
    slug: 'avatar-fire-and-ash',
    title: 'Avatar: Fire & Ash',
    tagline: 'Experience the next chapter in breathtaking 3D',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80',
    certificate: 'UA 16+',
    rating: 8.4,
    votesCount: '120K ratings',
    runtime: '2h 45m',
    releaseDate: 'Nov 16, 2026',
    languages: ['Tamil', 'Telugu', 'Hindi', 'English'],
    genres: ['Action', 'Sci-Fi', 'Adventure', 'Fantasy'],
    formats: ['IMAX Laser 3D', 'Dolby Atmos 7.1', '4DX Motion', 'RealD 3D / 2D'],
    synopsis: 'The next chapter in the Avatar saga takes you deeper into Pandora’s breathtaking volcanic world with the Ash People, testing Jake Sully and Neytiri’s family like never before.',
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
    isFeaturedBanner: true
  },
  {
    id: 'mov-leo',
    slug: 'leo-bloody-sweet',
    title: 'Leo',
    tagline: 'Bloody Sweet Action Saga',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80',
    certificate: 'UA 16+',
    rating: 8.8,
    votesCount: '240K ratings',
    runtime: '2h 44m',
    releaseDate: 'Now Showing',
    languages: ['Tamil', 'Telugu', 'Hindi', 'Kannada'],
    genres: ['Action', 'Crime', 'Thriller'],
    formats: ['IMAX Laser 3D', 'Dolby Atmos 7.1', 'RealD 3D / 2D Standard'],
    synopsis: 'Parthiban is a mild-mannered cafe owner in Kashmir who successfully defends against a gang of murderous thugs. Soon, ruthless crime lords suspect he is their long-lost brother Leo Das.',
    director: 'Lokesh Kanagaraj',
    cast: ['Thalapathy Vijay', 'Trisha', 'Sanjay Dutt', 'Arjun Sarja'],
    isFeaturedBanner: false
  },
  {
    id: 'mov-pushpa-2',
    slug: 'pushpa-2-the-rule',
    title: 'Pushpa 2: The Rule',
    tagline: 'The Wildfire Returns Across The Nation',
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&q=80',
    certificate: 'UA 16+',
    rating: 9.1,
    votesCount: '310K ratings',
    runtime: '3h 12m',
    releaseDate: 'Now Showing',
    languages: ['Telugu', 'Tamil', 'Hindi', 'Malayalam'],
    genres: ['Action', 'Drama', 'Thriller'],
    formats: ['IMAX Laser 3D', 'Dolby Atmos 7.1', '4DX Motion'],
    synopsis: 'Pushpa Raj asserts his iron dominance over the international red sandalwood syndicate while escalating an uncompromising war with SP Bhanwar Singh Shekhawat.',
    director: 'Sukumar',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    isFeaturedBanner: false
  },
  {
    id: 'mov-gladiator-2',
    slug: 'gladiator-2',
    title: 'Gladiator II',
    tagline: 'What We Do In Life Echoes In Eternity',
    posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1920&q=80',
    certificate: 'A 18+',
    rating: 8.5,
    votesCount: '95K ratings',
    runtime: '2h 28m',
    releaseDate: 'Now Showing',
    languages: ['English', 'Tamil', 'Hindi'],
    genres: ['Action', 'Drama', 'Historical'],
    formats: ['IMAX Laser 3D', 'Dolby Atmos 7.1', '4DX Motion'],
    synopsis: 'Years after witnessing the death of revered Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors of Rome.',
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
    isFeaturedBanner: false
  },
  {
    id: 'mov-wicked',
    slug: 'wicked',
    title: 'Wicked',
    tagline: 'Defy Gravity In An Epic Musical Spectacular',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&q=80',
    certificate: 'U 7+',
    rating: 8.7,
    votesCount: '65K ratings',
    runtime: '2h 40m',
    releaseDate: 'Now Showing',
    languages: ['English', 'Hindi'],
    genres: ['Musical', 'Fantasy', 'Family'],
    formats: ['Dolby Atmos 7.1', 'RealD 3D / 2D Standard'],
    synopsis: 'The untold story of the witches of Oz: Elphaba, an ostracized green-skinned woman, and Glinda, an ambitious aristocrat, form an unlikely friendship before destiny tears them into legendary rivals.',
    director: 'Jon M. Chu',
    cast: ['Cynthia Erivo', 'Ariana Grande', 'Jeff Goldblum', 'Michelle Yeoh'],
    isFeaturedBanner: false
  }
];

export function getMovieBySlugOrId(identifier: string): MovieListingItem {
  if (!identifier) return NOW_SHOWING_MOVIES[0];
  const clean = identifier.toLowerCase().trim();
  const found = NOW_SHOWING_MOVIES.find(m => m.id.toLowerCase() === clean || m.slug.toLowerCase() === clean || clean.includes(m.slug) || m.slug.includes(clean) || m.title.toLowerCase().includes(clean));
  return found || NOW_SHOWING_MOVIES[0];
}

