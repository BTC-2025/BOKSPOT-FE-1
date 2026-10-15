export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  chennai: { lat: 13.0827, lng: 80.2707 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  theni: { lat: 10.0104, lng: 77.4702 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 }
};

export const EXPLORE_SECTIONS = [
  {
    id: 'trending',
    title: 'Trending Now',
    description: 'Most popular bookings near you',
    emoji: '🔥',
    from: '#F87171',
    to: '#EF4444',
    glow: 'rgba(248,113,113,0.30)',
    href: '/search?q=trending',
    items: [
      { id: 't1', title: 'Delhi to Goa Flight', location: 'IndiGo Indigo-603', price: '₹5,499', ratingScore: '4.9', ratingText: 'Excellent', usersCount: '1k+ Users', stars: 5, emoji: '✈️', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60', badge: 'Selling Fast', badgeBg: 'bg-red-500', link: '/travel-transport/flights' },
      { id: 't2', title: 'Taj Palace Luxury Suite', location: 'Mumbai stay reservation', price: '₹14,500', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '800+ Users', stars: 5, emoji: '🏨', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60', badge: 'Top Rated', badgeBg: 'bg-emerald-500', link: '/stay-accommodation/hotels' },
      { id: 't3', title: 'Style Studio Styling', location: 'Haircut & Styling in T Nagar', price: '₹599', ratingScore: '4.8', ratingText: 'Excellent', usersCount: '2k+ Users', stars: 4, emoji: '💇', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=60', badge: 'Popular', badgeBg: 'bg-blue-500', link: '/service/3' },
      { id: 't4', title: 'Apollo Dental Care', location: 'Oral scaling & checkup', price: '₹899', ratingScore: '4.8', ratingText: 'Excellent', usersCount: '5k+ Users', stars: 4, emoji: '🦷', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60', badge: 'Certified', badgeBg: 'bg-emerald-600', link: '/service/1' },
      { id: 't5', title: 'Zen Sports Turf', location: '9-a-side football turf slot', price: '₹1,500/hr', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '400+ Users', stars: 5, emoji: '⚽', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60', badge: 'Discount', badgeBg: 'bg-amber-500', link: '/sports-turf/football-turf' }
    ]
  },
  {
    id: 'news',
    title: 'News & Updates',
    description: 'Latest updates in your area',
    emoji: '📰',
    from: '#60A5FA',
    to: '#3B82F6',
    glow: 'rgba(96,165,250,0.30)',
    href: '/search?q=news',
    items: [
      { id: 'n1', title: 'Metro High-Speed Rail', subtitle: 'New Chennai routes opened today', tag: '10m ago', rating: 'New', emoji: '🚆', link: '/travel-transport/trains' },
      { id: 'n2', title: 'ZenFit Yoga Sessions', subtitle: 'New morning batches starting Monday', tag: '2h ago', rating: 'Yoga', emoji: '🧘', link: '/service/2' },
      { id: 'n3', title: 'Monsoon Safety Guidelines', subtitle: 'Travel advisories for hill stations', tag: '1d ago', rating: 'Alert', emoji: '🌧️', link: '/travel-transport/cabs' },
      { id: 'n4', title: 'Kapaleeshwarar Temple Darshan', subtitle: 'Special festival booking slots open', tag: '2d ago', rating: 'Temple', emoji: '🛕', link: '/religious-government/darshan' }
    ]
  },

  {
    id: 'events',
    title: 'Local Events',
    description: 'Tournaments and classes near you',
    emoji: '📅',
    from: '#34D399',
    to: '#10B981',
    glow: 'rgba(52,211,153,0.30)',
    href: '/search?q=events',
    items: [
      { id: 'e1', title: 'Clay Pottery Class', location: 'Weekend workshop in Chennai', price: '₹400', ratingScore: '4.7', ratingText: 'Great', usersCount: '50+ Users', stars: 4, emoji: '🎨', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&auto=format&fit=crop&q=60', badge: 'Workshop', badgeBg: 'bg-purple-500', link: '/entertainment-events/workshops' },
      { id: 'e2', title: 'IPL Live Turf Screening', location: 'Match screening at Zen Arena', price: '₹299', ratingScore: '4.8', ratingText: 'Awesome', usersCount: '200+ Users', stars: 5, emoji: '⚽', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60', badge: 'Live', badgeBg: 'bg-red-500', link: '/entertainment-events/events' },
      { id: 'e3', title: 'Corporate Badminton League', location: 'Trophies and cash prizes', price: '₹999', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '500+ Users', stars: 5, emoji: '🏸', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60', badge: 'Tournament', badgeBg: 'bg-blue-600', link: '/sports-turf/badminton' },
      { id: 'e4', title: 'Sunburn Arena EDM concert', location: 'Early bird tickets live now', price: '₹1,200', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '1k+ Users', stars: 5, emoji: '🎵', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60', badge: 'Selling Fast', badgeBg: 'bg-pink-500', link: '/entertainment-events/concerts' },
      { id: 'e5', title: 'Street Food Festival', location: 'Marina Beach Seaview', price: '₹150', ratingScore: '4.8', ratingText: 'Awesome', usersCount: '2k+ Users', stars: 5, emoji: '🌮', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60', badge: 'Must Try', badgeBg: 'bg-orange-500', link: '/entertainment-events/events' }
    ]
  },
  {
    id: 'featured',
    title: 'Featured Partners',
    description: 'Elite verified businesses',
    emoji: '⭐',
    from: '#A78BFA',
    to: '#8B5CF6',
    glow: 'rgba(167,139,250,0.30)',
    href: '/search?q=featured',
    items: [
      { id: 'f1', title: 'Elite Spa & Wellness', subtitle: 'Luxury relaxation in T Nagar', tag: 'Verified', rating: '4.9', emoji: '💆', link: '/service/3' },
      { id: 'f2', title: 'Apollo Dental Metro', subtitle: 'Premium dental hospital network', tag: 'Verified', rating: '4.8', emoji: '🏥', link: '/service/1' },
      { id: 'f3', title: 'Zen Sports Turf Arena', subtitle: 'World class turf surface in Chennai', tag: 'Top Rated', rating: '4.9', emoji: '⚽', link: '/sports-turf/football-turf' },
      { id: 'f4', title: 'The Grand Palace Stay', subtitle: 'Super luxury suites & boarding', tag: 'Top Rated', rating: '4.8', emoji: '🏨', link: '/stay-accommodation/hotels' }
    ]
  }
];

export const RECOMMENDED_ITEMS = [
  {
    id: 'r1',
    title: 'Avatar: Fire & Ash (IMAX 3D)',
    location: 'PVR INOX, Phoenix Marketcity, Chennai',
    category: 'Movies & IMAX',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.8',
    ratingText: 'Housefull',
    usersCount: '2.4k+ bookings',
    price: '₹480',
    originalPrice: '₹550',
    badge: 'Selling Fast',
    badgeBg: 'bg-rose-500/90 text-white',
    badgeIcon: 'local_fire_department',
    stars: 5,
    tag: 'Dolby Atmos 7.1',
    link: '/entertainment-events/movies',
  },
  {
    id: 'r2',
    title: 'The Tamara Luxury Villa & Spa',
    location: 'ECR Seafront, Kovalam, Chennai',
    category: 'Resort & Stays',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.6',
    ratingText: 'Superb',
    usersCount: '840+ reviews',
    price: '₹5,800',
    originalPrice: '₹7,500',
    badge: '22% OFF',
    badgeBg: 'bg-emerald-600/90 text-white',
    badgeIcon: 'percent',
    stars: 5,
    tag: 'Private Beach Access',
    link: '/stay-accommodation/hotels',
  },
  {
    id: 'r3',
    title: 'Vande Bharat Express (Exec. Chair)',
    location: 'MGR Chennai Central ➔ Bengaluru',
    category: 'Express Transit',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.4',
    ratingText: 'Punctual',
    usersCount: '5.2k+ trips',
    price: '₹1,465',
    badge: 'Best Value',
    badgeBg: 'bg-sky-600/90 text-white',
    badgeIcon: 'verified',
    stars: 5,
    tag: 'Meals & Wi-Fi Included',
    link: '/travel-transport/trains',
  },
  {
    id: 'r4',
    title: 'Sunburn Arena Live DJ Concert',
    location: 'YMCA Grounds, Nandanam, Chennai',
    category: 'Live Concerts',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.2',
    ratingText: 'Trending',
    usersCount: '1.8k+ passes',
    price: '₹1,299',
    originalPrice: '₹1,800',
    badge: 'Limited Passes',
    badgeBg: 'bg-purple-600/90 text-white',
    badgeIcon: 'confirmation_number',
    stars: 5,
    tag: 'VIP Lounge Access',
    link: '/entertainment-events/events',
  },
  {
    id: 'r5',
    title: 'Zenith FIFA 2-Star Astro Turf',
    location: 'OMR IT Corridor, Thoraipakkam, Chennai',
    category: 'Sports Arena',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.7',
    ratingText: 'Top Rated',
    usersCount: '920+ matches',
    price: '₹1,200',
    originalPrice: '₹1,600',
    badge: 'Floodlights Slot',
    badgeBg: 'bg-teal-600/90 text-white',
    badgeIcon: 'sports_soccer',
    stars: 5,
    tag: 'Bibs & Ball Included',
    link: '/sports-turf/play-arena',
  },
  {
    id: 'r6',
    title: 'Ananda Herbal Ayurvedic Spa',
    location: 'Boat Club Road, R.A Puram, Chennai',
    category: 'Wellness & Spa',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.5',
    ratingText: 'Relaxing',
    usersCount: '630+ guests',
    price: '₹2,199',
    originalPrice: '₹2,800',
    badge: 'Popular',
    badgeBg: 'bg-amber-600/90 text-white',
    badgeIcon: 'spa',
    stars: 5,
    tag: '60 Min Full Body',
    link: '/service/3',
  },
  {
    id: 'r7',
    title: 'Kapaleeshwarar Special Darshan Pass',
    location: 'Mylapore Heritage Precinct, Chennai',
    category: 'Spiritual & Darshan',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.9',
    ratingText: 'Divine',
    usersCount: '12k+ devotees',
    price: '₹100',
    badge: 'Priority Entry',
    badgeBg: 'bg-orange-600/90 text-white',
    badgeIcon: 'temple_hindu',
    stars: 5,
    tag: 'Instant QR Pass',
    link: '/religious-government/darshan',
  },
  {
    id: 'r8',
    title: 'Executive Self-Drive Thar 4x4',
    location: 'Chennai Airport Pickup / Doorstep',
    category: 'Car Rental',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
    ratingScore: '9.3',
    ratingText: 'Seamless',
    usersCount: '780+ trips',
    price: '₹3,400',
    originalPrice: '₹4,000',
    badge: 'Zero Deposit',
    badgeBg: 'bg-indigo-600/90 text-white',
    badgeIcon: 'directions_car',
    stars: 5,
    tag: 'Unlimited KMs',
    link: '/travel-transport/cabs',
  }
];

export const CONCIERGE_JOURNEYS_POOL = [
  {
    trainName: 'Vande Bharat Express (#20608)',
    source: 'SBC (Bengaluru)',
    destination: 'MAS (Chennai)',
    platform: 'Expected PF 7',
    icon: '🚆',
    iconColor: '#ff6325',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.8',
    ratingText: 'Excellent',
    usersCount: '441 Users',
    stars: 4
  },
  {
    trainName: 'Avengers: Secret Wars',
    source: 'Inox: Forum Mall',
    destination: 'Premium Audi 3',
    platform: 'Seat H-14, H-15',
    icon: '🍿',
    iconColor: '#eab308',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.8',
    ratingText: 'Exceptional',
    usersCount: '1k+ Users',
    stars: 5
  },
  {
    trainName: 'Metro High-Speed Rail',
    source: 'Central Metro Station',
    destination: 'Airport Terminal 2',
    platform: 'Platform 2 (South)',
    icon: '🚇',
    iconColor: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1548689816-c399f954f3dd?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.0',
    ratingText: 'Exceptional',
    usersCount: '800+ Users',
    stars: 4
  },
  {
    trainName: 'Sunburn EDM Festival',
    source: 'VGP Golden Beach',
    destination: 'VIP Arena Zone A',
    platform: 'Pass #SB-8920',
    icon: '🎸',
    iconColor: '#ec4899',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.7',
    ratingText: 'Excellent',
    usersCount: '523 Users',
    stars: 5
  },
  {
    trainName: 'ZenFit Yoga Session',
    source: 'ZenFit Health Studio',
    destination: 'Studio Room B',
    platform: 'Starts 07:00 AM',
    icon: '🧘',
    iconColor: '#10b981',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.2',
    ratingText: 'Exceptional',
    usersCount: '120 Users',
    stars: 5
  },
  {
    trainName: 'Kapaleeshwarar Darshan',
    source: 'Mylapore East Gate',
    destination: 'Inner Sanctum Queue',
    platform: 'Special Entry Pass',
    icon: '🛕',
    iconColor: '#f97316',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=60',
    ratingScore: '4.9',
    ratingText: 'Exceptional',
    usersCount: '2k+ Users',
    stars: 5
  },
  {
    trainName: 'IndiGo Flight 6E-204',
    source: 'MAA (Chennai)',
    destination: 'DEL (New Delhi)',
    platform: 'Boarding Gate 4',
    icon: '✈️',
    iconColor: '#2563eb',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.5',
    ratingText: 'Excellent',
    usersCount: '300+ Users',
    stars: 4
  },
  {
    trainName: 'The Grand Temple Dine',
    source: 'Main Dining Hall',
    destination: 'Rooftop Table 12',
    platform: 'Confirmed Booking',
    icon: '🍴',
    iconColor: '#14b8a6',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.5',
    ratingText: 'Exceptional',
    usersCount: '600+ Users',
    stars: 5
  }
];

export const MOCK_ADS = [
  {
    id: 1,
    title: "International Flights Sale",
    desc: "Book your flights now and get up to 30% off.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000&auto=format&fit=crop&q=80",
    tag: "FLIGHT OFFER",
    tagBg: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    actionText: "Book Flight",
    href: "/travel-transport/flights",
  },
  {
    id: 2,
    title: "Vande Bharat Express",
    desc: "Experience high-speed, premium train travel.",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1000&auto=format&fit=crop&q=80",
    tag: "TRAIN UPDATE",
    tagBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    actionText: "Check Slots",
    href: "/travel-transport/trains",
  },
  {
    id: 3,
    title: "Elite Turf Booking",
    desc: "Reserve premium football turfs and cricket nets.",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1000&auto=format&fit=crop&q=80",
    tag: "SPORTS EVENT",
    tagBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    actionText: "Reserve Turf",
    href: "/sports-turf/play-arena",
  },
  {
    id: 4,
    title: "Sunburn EDM Festival",
    desc: "Passes selling fast for the biggest music event.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80",
    tag: "CONCERT PASSES",
    tagBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    actionText: "Buy Tickets",
    href: "/entertainment-events/concerts",
  },
  {
    id: 5,
    title: "Summer Resort Getaway",
    desc: "Luxury beachfront, hill, and forest resorts.",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1000&auto=format&fit=crop&q=80",
    tag: "STAY OFFER",
    tagBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    actionText: "Book Stay",
    href: "/stay-accommodation/resorts",
  }
];

export const MOCK_ACTIVITIES = [
  { user: 'Rohan', city: 'Chennai', action: 'booked', item: 'Root Canal Treatment', merchant: 'Apollo Dental Care', time: '2 mins ago', emoji: '🦷', link: '/service/s1' },
  { user: 'Sneha', city: 'Coimbatore', action: 'booked', item: 'Photography Session', merchant: 'Western Ghats ClickPro', time: '5 mins ago', emoji: '📸', link: '/service/svc-8' },
  { user: 'Amit', city: 'Bangalore', action: 'booked', item: 'Art Workshop', merchant: 'Cubbon ArtHouse', time: '10 mins ago', emoji: '🎨', link: '/service/svc-10' },
  { user: 'Vijay', city: 'Madurai', action: 'reserved a table', item: 'Table Reservation', merchant: 'The Grand Temple Dine', time: '1 min ago', emoji: '🍴', link: '/service/svc-3' },
  { user: 'Vikram', city: 'Delhi', action: 'booked', item: 'Tennis Court Reservation', merchant: 'Connaught SportArena', time: '15 mins ago', emoji: '🎾', link: '/service/svc-12' },
  { user: 'Harini', city: 'Chennai', action: 'booked', item: 'Premium Haircut', merchant: 'Style Studio', time: '4 mins ago', emoji: '💇', link: '/service/svc-1' },
  { user: 'Rahul', city: 'Chennai', action: 'booked', item: 'Yoga Class', merchant: 'ZenFit', time: '7 mins ago', emoji: '🧘', link: '/service/svc-2' }
];

export const mapExploreItemToConcierge = (item: any, sectionId: string) => {
  const mappings: Record<string, { source: string; destination: string; platform: string; icon: string; iconColor: string; image: string }> = {
    'n1': {
      source: 'Chennai Central',
      destination: 'New Metro Routes',
      platform: 'Open Today',
      icon: '🚇',
      iconColor: '#3b82f6',
      image: 'https://images.unsplash.com/photo-1548689816-c399f954f3dd?w=500&auto=format&fit=crop&q=60'
    },
    'n2': {
      source: 'ZenFit Studio',
      destination: 'Morning Yoga Batch',
      platform: 'Starts Mon 7AM',
      icon: '🧘',
      iconColor: '#10b981',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60'
    },
    'n3': {
      source: 'City Gateways',
      destination: 'Hill Station Alert',
      platform: 'Monsoon Guide',
      icon: '🌧️',
      iconColor: '#f59e0b',
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=60'
    },
    'n4': {
      source: 'Mylapore Gate',
      destination: 'Temple Darshan',
      platform: 'Festival Booking',
      icon: '🛕',
      iconColor: '#ec4899',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=60'
    },
    'e1': {
      source: 'Chennai Workshop',
      destination: 'Clay Pottery Class',
      platform: 'Sat 4:00 PM',
      icon: '🎨',
      iconColor: '#a855f7',
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&auto=format&fit=crop&q=60'
    },
    'e2': {
      source: 'Zen Arena Screen',
      destination: 'IPL Live Screening',
      platform: 'Sun 7:00 PM',
      icon: '⚽',
      iconColor: '#ef4444',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'
    },
    'e3': {
      source: 'Arena Courts',
      destination: 'Badminton League',
      platform: 'Starts June 15',
      icon: '🏸',
      iconColor: '#14b8a6',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60'
    },
    'e4': {
      source: 'VGP Beach Stage',
      destination: 'Sunburn EDM Concert',
      platform: 'Gate Open June 20',
      icon: '🎵',
      iconColor: '#ec4899',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60'
    }
  };

  const mapped = mappings[item.id];
  if (mapped) {
    return {
      trainName: item.title,
      source: mapped.source,
      destination: mapped.destination,
      platform: mapped.platform,
      icon: mapped.icon,
      iconColor: mapped.iconColor,
      image: mapped.image,
      ratingScore: item.ratingScore || '4.5',
      ratingText: item.ratingText || 'Good',
      usersCount: item.usersCount || '100+ Users',
      stars: item.stars || 4
    };
  }

  return {
    trainName: item.title,
    source: sectionId === 'news' ? 'Local Update' : 'Local Event',
    destination: item.subtitle,
    platform: item.tag || 'Live Info',
    icon: item.emoji || (sectionId === 'news' ? '📰' : '📅'),
    iconColor: sectionId === 'news' ? '#3b82f6' : '#10b981',
    image: item.image || (sectionId === 'news' ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop&q=60' : 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60'),
    ratingScore: item.ratingScore || '4.5',
    ratingText: item.ratingText || 'Good',
    usersCount: item.usersCount || '100+ Users',
    stars: item.stars || 4
  };
};

export const getCombinedConciergePool = () => {
  const newsSec = EXPLORE_SECTIONS.find(s => s.id === 'news');
  const eventsSec = EXPLORE_SECTIONS.find(s => s.id === 'events');

  const newsItems = newsSec ? newsSec.items.map(item => mapExploreItemToConcierge(item, 'news')) : [];
  const eventItems = eventsSec ? eventsSec.items.map(item => mapExploreItemToConcierge(item, 'events')) : [];

  return [...CONCIERGE_JOURNEYS_POOL, ...newsItems, ...eventItems];
};
