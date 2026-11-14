// Sports & Recreation Master Archetype Seed Data & Rules
// Automatically applies to all Sports & Turf categories:
// 22. football-turf (Arena 5 Turf)
// 23. cricket-ground (Pitch Perfect Grounds)
// 24. badminton (Smash Academy)
// 25. tennis (Grand Slam Club)
// 26. basketball (Hoop Kings Arena)
// 27. swimming (Blue Wave Pool)
// 28. play-arena (JumpZone Park)

export interface SportAddon {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
}

export interface SportCourtUnit {
  id: string;
  name: string;
  price: number;
  description: string;
  surface: string;
  badge?: string;
  imageUrl: string;
}

export interface SportCategoryConfig {
  slug: string;
  categoryName: string;
  merchantId: string;
  merchantName: string;
  username: string;
  defaultPrice: number;
  heroImage: string;
  galleryImages: string[];
  mandatoryRule: {
    icon: string;
    title: string;
    desc: string;
  };
  amenities: string[];
  supervisorTitle: string;
  units: SportCourtUnit[];
  addons: SportAddon[];
  includedGear: string;
}

export const SPORTS_MASTER_CONFIGS: Record<string, SportCategoryConfig> = {
  // ── 24. Badminton Court (Smash Academy - T104) ──
  badminton: {
    slug: 'badminton',
    categoryName: 'Badminton Court',
    merchantId: 'de764dbc-2b2b-6079-d829-4633f41fd826',
    merchantName: 'Smash Academy',
    username: 'T104',
    defaultPrice: 350,
    heroImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80',
      'https://images.unsplash.com/photo-1613918431703-aa6325992a7e?w=800&q=80',
      'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=800&q=80',
      'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=800&q=80'
    ],
    mandatoryRule: {
      icon: '👟',
      title: 'Non-Marking Badminton Shoes Mandatory',
      desc: 'Strictly flat non-marking gum-rubber soles required on synthetic/wooden courts. Running shoes strictly prohibited.'
    },
    amenities: [
      'BWF Approved Yonex Synthetic Mat',
      'Glare-Free LED Court Lighting',
      'Changing Rooms with Hot Showers',
      'Players Lounge & Pro Racket Stringing',
      'Purified Water & First-Aid Support',
      'Dedicated Car & Bike Parking'
    ],
    supervisorTitle: 'Certified BAI Court Referee',
    units: [
      {
        id: 'court-1-synthetic',
        name: 'Court 1 — Yonex Mat (Pro Grade)',
        price: 350,
        description: 'BWF standard 4.5mm synthetic mat with tournament level shock absorption & line clarity.',
        surface: 'Yonex Synthetic Mat',
        badge: '👑 Tournament Standard',
        imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80'
      },
      {
        id: 'court-2-wooden',
        name: 'Court 2 — Teak Wood Flooring',
        price: 400,
        description: 'High-rebound seasoned teak wood court preferred by competitive singles and doubles players.',
        surface: 'Teak Wood Floor',
        badge: '⚡ Fast Rebound',
        imageUrl: 'https://images.unsplash.com/photo-1613918431703-aa6325992a7e?w=800&q=80'
      },
      {
        id: 'court-3-synthetic',
        name: 'Court 3 — Cushioned Synthetic Mat',
        price: 350,
        description: 'Multi-layer cushioned vinyl court optimized for joint safety, ideal for recreational matches.',
        surface: 'Cushioned Vinyl Mat',
        badge: '🛡️ Joint Friendly',
        imageUrl: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=800&q=80'
      }
    ],
    addons: [
      { id: 'racket-carbon', name: 'Yonex Carbon Racket Rental', price: 60, icon: '🏸', desc: 'Pre-strung high tension Yonex carbon graphite racket with fresh overgrip.' },
      { id: 'shoes-nonmarking', name: 'Non-Marking Shoes Rental (Pair)', price: 50, icon: '👟', desc: 'Sanitized professional gum-sole badminton shoes in your size.' },
      { id: 'shuttle-nylon', name: 'Yonex Mavis 350 Nylon Shuttles (Tube of 3)', price: 180, icon: '🪶', desc: 'Durable yellow nylon shuttlecocks for medium/fast pace rallies.' },
      { id: 'shuttle-feather', name: 'Tournament Feather Shuttles (Tube of 3)', price: 290, icon: '🪶', desc: 'Premium goose-feather shuttlecocks for authentic flight trajectory.' },
      { id: 'grip-wrap', name: 'Super Tacky Grip Wrap Replacement', price: 40, icon: '🩹', desc: 'Sweat-absorbing anti-slip grip wrap applied on-court.' },
      { id: 'energy-drink', name: 'Electrolyte Energy Drink (Pack of 2)', price: 90, icon: '🥤', desc: 'Chilled hydration drinks ready at court bench.' }
    ],
    includedGear: 'Net set to standard 1.55m height, Court line marking, Referee chair & Digital scoreboard'
  },

  // ── 22. Football Turf (Arena 5 Turf - T102) ──
  'football-turf': {
    slug: 'football-turf',
    categoryName: 'Football Turf',
    merchantId: '7c996ce5-e515-8b61-5039-83c06a21e9e5',
    merchantName: 'Arena 5 Turf',
    username: 'T102',
    defaultPrice: 1200,
    heroImage: 'https://images.unsplash.com/photo-1529900245534-47fbf82a4fbe?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1529900245534-47fbf82a4fbe?w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80'
    ],
    mandatoryRule: {
      icon: '⚡',
      title: 'Moulded Studs / Turf Trainers Only',
      desc: 'Rubber studs or flat turf shoes permitted. Metal studs strictly banned to preserve FIFA grade synthetic turf.'
    },
    amenities: [
      'FIFA Approved Monofilament Astro Turf',
      'High-Mast 200W Floodlight Array',
      'Separate Team Dugouts & Spectator Seating',
      'Changing Rooms with Showers',
      'Chilled RO Water Dispenser',
      'CCTV Monitored Parking'
    ],
    supervisorTitle: 'KFA Certified Ground Marshal',
    units: [
      {
        id: 'pitch-5v5-a',
        name: '5v5 Astro Turf (Pitch A)',
        price: 1200,
        description: 'Compact, high-tempo 5-a-side pitch with rebound boards & soft infill crumb rubber.',
        surface: 'FIFA Astro Turf',
        badge: '⚡ High Tempo',
        imageUrl: 'https://images.unsplash.com/photo-1529900245534-47fbf82a4fbe?w=800&q=80'
      },
      {
        id: 'pitch-7v7-main',
        name: '7v7 Championship Pitch (Full Field)',
        price: 1800,
        description: 'Full-size 7-a-side pitch for competitive team fixtures with corner runoffs.',
        surface: 'FIFA Astro Turf (Pro)',
        badge: '👑 Match Arena',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'
      }
    ],
    addons: [
      { id: 'match-referee', name: 'Qualified Match Referee (60 Mins)', price: 300, icon: '👨‍⚖️', desc: 'Official qualified referee for fair play & match management.' },
      { id: 'hd-recording', name: 'High-Res Full Match Video Recording', price: 500, icon: '📹', desc: 'Overhead camera match footage delivered via cloud link.' },
      { id: 'match-ball', name: 'Pro Match Ball (Size 5 FIFA Standard)', price: 150, icon: '⚽', desc: 'Pumped regulation match ball with ball-boy support.' },
      { id: 'neon-bibs', name: 'Team Training Bibs (14 Neon Pack)', price: 100, icon: '🎽', desc: 'Clean, sanitized breathable neon training bibs.' },
      { id: 'drinks-6pack', name: 'Chilled Energy Drinks (Pack of 6)', price: 250, icon: '🧴', desc: 'Ice-cold electrolyte hydration ready at pitch side.' },
      { id: 'ice-pack-kit', name: 'Ice Pack & Emergency First-Aid Kit', price: 120, icon: '🧊', desc: 'Instant cold compress packs, compression straps & spray.' }
    ],
    includedGear: '2 Practice Balls (Size 5), 14 Team Bibs (Neon Green/Orange), Goalpost Nets & Corner Flags'
  },

  // ── 23. Cricket Ground (Pitch Perfect Grounds - T103) ──
  'cricket-ground': {
    slug: 'cricket-ground',
    categoryName: 'Cricket Ground',
    merchantId: '5a8fe3b6-9787-e911-bd92-12be14cde4e6',
    merchantName: 'Pitch Perfect Grounds',
    username: 'T103',
    defaultPrice: 1500,
    heroImage: 'https://images.unsplash.com/photo-1531415074868-036b1c575351?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1531415074868-036b1c575351?w=1200&q=80',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
      'https://images.unsplash.com/photo-1593766788306-28561086694e?w=800&q=80'
    ],
    mandatoryRule: {
      icon: '🏏',
      title: 'Batting Helmets & Safety Gear Required for Hard Ball',
      desc: 'Helmets mandatory for facing leather balls. Rubber cleats or cricket spikes allowed on turf pitch.'
    },
    amenities: [
      'Standard 22-Yard Concrete & Coir Matting Pitch',
      'Floodlit Box Cricket Nets',
      'Electronic Digital Scoreboard & Siren',
      'Spectator Pavilion & Boundary Rope',
      'Locker & Changing Facilities',
      'Live Streaming Setup Ready'
    ],
    supervisorTitle: 'BCCI Level 1 Cricket Umpire',
    units: [
      {
        id: 'box-cricket-net',
        name: 'Covered Box Cricket Arena (Enclosed Net)',
        price: 1100,
        description: 'Tightly enclosed nylon net arena designed for fast-paced 6-a-side box cricket matches.',
        surface: 'Turf Matting Box',
        badge: '⚡ Fast Pace',
        imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80'
      },
      {
        id: 'main-cricket-ground',
        name: 'Main Turf Cricket Pitch (11-a-side Field)',
        price: 1800,
        description: 'Full 55-meter boundary cricket arena with rollered turf pitch and electronic score display.',
        surface: 'Rolled Turf 22 Yards',
        badge: '👑 Match Ground',
        imageUrl: 'https://images.unsplash.com/photo-1531415074868-036b1c575351?w=800&q=80'
      }
    ],
    addons: [
      { id: 'english-bat', name: 'English Willow Cricket Bat Rental', price: 150, icon: '🏏', desc: 'Grade 1 English willow bat knocked-in with heavy sweet spot.' },
      { id: 'leather-balls', name: 'Red/White 4-Piece Leather Match Balls (2)', price: 280, icon: '⚾', desc: 'Tournament grade seam balls suitable for 20-over matches.' },
      { id: 'full-pad-kit', name: 'Full Batting Kit (Pads, Gloves, Helmet)', price: 200, icon: '🛡️', desc: 'Sanitized leg guards, batting gloves, and safety helmet.' },
      { id: 'cricket-umpire', name: 'Certified Match Umpire (20 Overs)', price: 400, icon: '👨‍⚖️', desc: 'Experienced umpire for wide/no-ball tracking and LBW calls.' },
      { id: 'scoreboard-operator', name: 'Digital Scoreboard Operator', price: 250, icon: '🔢', desc: 'Real-time ball-by-ball score tracking on venue LED screen.' }
    ],
    includedGear: 'Heavy Wooden Stumps (2 Sets), Bails, Boundary Cones & Scoreboard Access'
  },

  // ── 25. Tennis Court (Grand Slam Club - T105) ──
  tennis: {
    slug: 'tennis',
    categoryName: 'Tennis Court',
    merchantId: '1ededc46-c2c0-1e09-a0be-30c4b441bbae',
    merchantName: 'Grand Slam Club',
    username: 'T105',
    defaultPrice: 500,
    heroImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      'https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&q=80'
    ],
    mandatoryRule: {
      icon: '🎾',
      title: 'Flat Non-Marking Tennis Court Shoes Only',
      desc: 'Herringbone tread shoes required on clay courts. Hard court approved non-marking shoes required.'
    },
    amenities: [
      'ITF Approved Clay & Acrylic Hard Courts',
      'Night Floodlights (Daylight Equivalent)',
      'Ball Boy / Retrieval Support on Request',
      'Player Rest Lounge & Energy Bar',
      'Shower & Changing Locker Rooms',
      'Free Parking'
    ],
    supervisorTitle: 'AITA Certified Tennis Coach',
    units: [
      {
        id: 'court-clay-1',
        name: 'Court 1 — Red Clay Court (French Open Style)',
        price: 550,
        description: 'Moisturized red clay court offering high bounce and comfortable slide movement.',
        surface: 'Rolled Red Clay',
        badge: '👑 Roland Garros Vibe',
        imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80'
      },
      {
        id: 'court-hard-2',
        name: 'Court 2 — Acrylic Hard Court (US Open Spec)',
        price: 500,
        description: 'Multi-cushioned 8-layer acrylic court providing consistent true bounce for baseline rallies.',
        surface: 'DecoTurf Acrylic Hard Court',
        badge: '⚡ True Bounce',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'
      }
    ],
    addons: [
      { id: 'tennis-racket', name: 'Wilson / Babolat Racket Rental', price: 90, icon: '🎾', desc: '100 sq.in mid-plus head size racket strung at 52 lbs.' },
      { id: 'pressurized-balls', name: 'Can of 3 Pressurized Tennis Balls (Wilson US Open)', price: 250, icon: '🥫', desc: 'Freshly unsealed pressurized championship balls.' },
      { id: 'ball-boy', name: 'Dedicated Ball Boy / Retrieval Assistant', price: 150, icon: '🏃', desc: 'Save energy between sets with uninterrupted ball feeding.' },
      { id: 'hitting-partner', name: 'Pro Hitting Partner / Sparring Coach (60 mins)', price: 500, icon: '🏅', desc: 'State-ranked competitive player for high-pace rally practice.' }
    ],
    includedGear: 'Regulation Net (36 inch center strap), Court Sweeper, Bench with Umbrella'
  },

  // ── 26. Basketball Court (Hoop Kings Arena - T106) ──
  basketball: {
    slug: 'basketball',
    categoryName: 'Basketball Court',
    merchantId: 'ad72ab0e-4361-aed4-d236-117c907068e9',
    merchantName: 'Hoop Kings Arena',
    username: 'T106',
    defaultPrice: 600,
    heroImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&q=80',
      'https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=800&q=80'
    ],
    mandatoryRule: {
      icon: '🏀',
      title: 'Basketball High-Tops or Clean Court Shoes Mandatory',
      desc: 'Indoor wooden flooring requires dust-free grip soles. Outdoor street shoes strictly prohibited.'
    },
    amenities: [
      'FIBA Certified Hardwood Maple Floor',
      'Spring-Loaded Breakaway Dunk Rims',
      'LED 24-Second Shot Clocks & Electronic Scoreboard',
      'Air-Conditioned Indoor Arena',
      'Locker Rooms & Shower Facilities',
      'Secure Parking'
    ],
    supervisorTitle: 'BFI Certified Court Official',
    units: [
      {
        id: 'court-full-hardwood',
        name: 'Full Court — Maple Hardwood Arena',
        price: 900,
        description: 'Complete 94x50 ft FIBA regulation court with two breakaway dunk hoops and official lines.',
        surface: 'Hardwood Maple Floor',
        badge: '👑 Full Court 5v5',
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'
      },
      {
        id: 'court-half-a',
        name: 'Half Court A — 3x3 Streetball Hub',
        price: 500,
        description: 'Dedicated half-court for 3x3 half-court pick-up games and shooting drill practice.',
        surface: 'Cushioned Polyurethane Floor',
        badge: '⚡ 3v3 Half Court',
        imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&q=80'
      }
    ],
    addons: [
      { id: 'spalding-ball', name: 'Spalding TF-1000 Indoor Game Ball', price: 100, icon: '🏀', desc: 'Composite microfiber leather basketball inflated to 8.5 PSI.' },
      { id: 'team-jerseys', name: 'Team Numbered Reversible Jerseys (10 Pack)', price: 150, icon: '🎽', desc: 'Breathable dry-fit numbered scrimmage pinnies.' },
      { id: 'shotclock-operator', name: 'Shot-clock & Scoreboard Table Official', price: 250, icon: '⏱️', desc: 'Operates 24-second buzzer and live arena scoreboard.' }
    ],
    includedGear: 'Regulation Rims with Anti-Whip Nets, Padded Backboards & Score Table'
  },

  // ── 27. Swimming Pool Slots (Blue Wave Pool - T107) ──
  swimming: {
    slug: 'swimming',
    categoryName: 'Swimming Pool Slots',
    merchantId: '10af45e9-939e-0b14-5bd6-c4b21fb3fe8a',
    merchantName: 'Blue Wave Pool',
    username: 'T107',
    defaultPrice: 200,
    heroImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&q=80',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
      'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&q=80'
    ],
    mandatoryRule: {
      icon: '🩱',
      title: 'Lycra / Nylon Swimwear & Swim Cap Mandatory',
      desc: 'Cotton t-shirts/shorts strictly banned due to chlorine filtration hygiene. Shower mandatory before pool entry.'
    },
    amenities: [
      'Olympic-Length 25m Heated & Ozonated Pool',
      'Certified Life Guards on Deck',
      'Anti-Turbulence Wave-Breaking Lane Ropes',
      'Private Shower Cubicles & Shampoo Station',
      'Digital RFID Lockers',
      'Cafe & Sun Lounge Deck'
    ],
    supervisorTitle: 'RLSS Certified Senior Lifeguard',
    units: [
      {
        id: 'lane-lap-swim',
        name: 'Lap Swimming Lane (Fast/Medium Pace)',
        price: 200,
        description: 'Dedicated 25m continuous swim lane with floating pace line for lap training.',
        surface: 'Ozonated Heated Water (28°C)',
        badge: '🏊 Fitness Lap',
        imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80'
      },
      {
        id: 'zone-leisure-pool',
        name: 'Leisure Pool & Shallow Family Zone',
        price: 180,
        description: 'Gentle 3.5ft shallow heated pool area for leisure swimming and light water exercises.',
        surface: 'Crystal Clear Chlorinated Water',
        badge: '🌊 Leisure & Fun',
        imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80'
      }
    ],
    addons: [
      { id: 'silicone-cap', name: 'Speedo Silicone Swim Cap Rental/Purchase', price: 50, icon: '🧢', desc: 'Snug-fit tear-resistant silicone cap to protect hair.' },
      { id: 'anti-fog-goggles', name: 'Anti-Fog UV Swimming Goggles', price: 80, icon: '🥽', desc: 'Crystal clear anti-leak silicone seal goggles.' },
      { id: 'kickboard-pullbuoy', name: 'Kickboard & Pull Buoy Training Kit', price: 40, icon: '🏊‍♂️', desc: 'High-density EVA foam board for kick isolation practice.' },
      { id: 'towel-rental', name: 'Plush Microfiber Bath Towel Rental', price: 60, icon: '🧖', desc: 'Sanitized quick-dry luxury microfiber bath towel.' }
    ],
    includedGear: 'Life Jacket support on request, Poolside Deck Chairs, Locker Access & Warm Showers'
  },

  // ── 28. Indoor Play Arena (JumpZone Park - G102) ──
  'play-arena': {
    slug: 'play-arena',
    categoryName: 'Indoor Play Arena',
    merchantId: 'bdb9deee-6122-12de-c16b-26fad5fb0028',
    merchantName: 'JumpZone Park',
    username: 'G102',
    defaultPrice: 350,
    heroImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80'
    ],
    mandatoryRule: {
      icon: '🧦',
      title: 'Anti-Skid Grip Socks Mandatory for All Jumpers',
      desc: 'Certified rubber-studded grip socks required for safety on trampoline surfaces. Barefoot or regular socks strictly banned.'
    },
    amenities: [
      'Interconnected Trampoline Freestyle Arena',
      'Foam Pit Jump & Ninja Obstacle Course',
      'Slam Dunk Basketball Trampoline Track',
      'Air-Conditioned Parents Observation Lounge with Free Wi-Fi',
      'First-Aid Station & Trained Court Marshals',
      'Party Rooms & Snack Bar'
    ],
    supervisorTitle: 'Safety Certified Floor Marshal',
    units: [
      {
        id: 'pass-trampoline-1hr',
        name: 'Full Arena Access (1-Hour Jump Pass)',
        price: 350,
        description: 'Unlimited access to Trampoline Freestyle, Ninja Warrior course, Dodgeball & Foam pits.',
        surface: 'Spring Air Trampoline Netting',
        badge: '👑 All-Access Pass',
        imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80'
      },
      {
        id: 'pass-trampoline-2hr',
        name: 'Pro Session Pass (2-Hour Unlimited Jump)',
        price: 599,
        description: 'Extended 120-minute mega session with free locker token and arcade coin voucher.',
        surface: 'High-Rebound Air Bed',
        badge: '⚡ Double Fun',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80'
      }
    ],
    addons: [
      { id: 'grip-socks', name: 'Certified Rubber Grip Socks (Pair)', price: 80, icon: '🧦', desc: 'Reusable custom non-slip safety socks required for jump arena.' },
      { id: 'guardian-pass', name: 'Guardian / Non-Jumper Lounge Pass', price: 100, icon: '☕', desc: 'Access to observation deck with complimentary hot coffee voucher.' },
      { id: 'arcade-card', name: 'Arcade Gaming Card (50 Game Credits)', price: 250, icon: '🎮', desc: 'Rechargeable smart card loaded with credits for arcade simulators.' }
    ],
    includedGear: 'Foam Pit Safety Mats, Lockers with Key, Safety Briefing Video & Wristband'
  }
};

export function getSportCategoryConfig(categorySlug: string): SportCategoryConfig | null {
  const cleanSlug = (categorySlug || '').toLowerCase().trim();
  if (SPORTS_MASTER_CONFIGS[cleanSlug]) {
    return SPORTS_MASTER_CONFIGS[cleanSlug];
  }
  // Keyword matches
  if (cleanSlug.includes('badminton')) return SPORTS_MASTER_CONFIGS['badminton'];
  if (cleanSlug.includes('turf') || cleanSlug.includes('football')) return SPORTS_MASTER_CONFIGS['football-turf'];
  if (cleanSlug.includes('cricket')) return SPORTS_MASTER_CONFIGS['cricket-ground'];
  if (cleanSlug.includes('tennis')) return SPORTS_MASTER_CONFIGS['tennis'];
  if (cleanSlug.includes('basketball')) return SPORTS_MASTER_CONFIGS['basketball'];
  if (cleanSlug.includes('swimming')) return SPORTS_MASTER_CONFIGS['swimming'];
  if (cleanSlug.includes('play') || cleanSlug.includes('arena') || cleanSlug.includes('trampoline')) return SPORTS_MASTER_CONFIGS['play-arena'];

  return null;
}

