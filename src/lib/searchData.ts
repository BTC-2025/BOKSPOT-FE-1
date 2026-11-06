export interface SearchableService {
  name: string;
  emoji: string;
  groupTitle: string;
  href: string;
}

export const GROUP_EMOJIS: Record<string, string> = {
  'Travel': '✈️',
  'Stay & Accommodation': '🏨',
  'Entertainment': '🎬',
  'Sports': '⚽',
  'Lifestyle Services': '💇',
  'Business': '🧑‍💻',
  'Religious Services': '🛕',
  'Equipment Rentals': '🚲',
  'Personal Services': '🐶'
};

export const SERVICE_GROUPS = [
  {
    title: 'Travel',
    description: 'Flight, Train, Bus, Cab/Taxi, Ferry, Shuttle, Helicopter, and Rental vehicle bookings',
    icon: 'directions_car',
    subcategories: [
      {
        name: 'Public Transport',
        items: [
          { name: 'Bus Booking', emoji: '🚌' },
          { name: 'Train Booking', emoji: '🚆' },
          { name: 'Flight Booking', emoji: '✈️' },
          { name: 'Ferry / Boat Booking', emoji: '⛴️' },
          { name: 'Shuttle / Van Booking', emoji: '🚐' },
          { name: 'Helicopter Booking (Premium)', emoji: '🚁' }
        ]
      },
      {
        name: 'Personal Transport',
        items: [
          { name: 'Cab / Taxi Booking', emoji: '🚖' },
          { name: 'Bike Rental', emoji: '🛵' },
          { name: 'Self-Drive Car Rental', emoji: '🚗' }
        ]
      }
    ]
  },
  {
    title: 'Stay & Accommodation',
    description: 'Hotels, resorts, villas, hostels, homestays, and camping options',
    icon: 'hotel',
    subcategories: [
      {
        name: 'Hotels & Rooms',
        items: [
          { name: 'Hotel Booking', emoji: '🏨' },
          { name: 'Resort Booking', emoji: '🏖️' },
          { name: 'Homestay / Villa', emoji: '🏡' },
          { name: 'PG & Co-Living Stays', emoji: '🏢' },
          { name: 'Hostel Booking', emoji: '🛌' },
          { name: 'Camping Booking', emoji: '🏕️' }
        ]
      }
    ]
  },
  {
    title: 'Entertainment',
    description: 'Cinema, theatre, concerts, festivals, gaming, and workshops',
    icon: 'movie',
    subcategories: [
      {
        name: 'Movies & Shows',
        items: [
          { name: 'Cinema / Movie Tickets', emoji: '🎥' },
          { name: 'Theatre Shows', emoji: '🎭' }
        ]
      },
      {
        name: 'Events',
        items: [
          { name: 'Concert Tickets', emoji: '🎤' },
          { name: 'Events & Festivals', emoji: '🎪' },
          { name: 'Exhibition Entry', emoji: '🎟️' }
        ]
      },
      {
        name: 'Learning & Fun',
        items: [
          { name: 'Workshops / Classes', emoji: '🎨' },
          { name: 'Gaming Arena Booking', emoji: '🎮' }
        ]
      }
    ]
  },
  {
    title: 'Sports',
    description: 'Turfs, grounds, indoor courts, swimming pools, and play arenas',
    icon: 'sports_soccer',
    subcategories: [
      {
        name: 'Outdoor Sports',
        items: [
          { name: 'Football Turf', emoji: '⚽' },
          { name: 'Cricket Ground', emoji: '🏏' }
        ]
      },
      {
        name: 'Indoor Sports',
        items: [
          { name: 'Badminton Court', emoji: '🏸' },
          { name: 'Tennis Court', emoji: '🎾' },
          { name: 'Basketball Court', emoji: '🏀' }
        ]
      },
      {
        name: 'Fitness & Activity',
        items: [
          { name: 'Swimming Pool Slots', emoji: '🏊' },
          { name: 'Indoor Play Arena', emoji: '🧗' }
        ]
      }
    ]
  },
  {
    title: 'Lifestyle Services',
    description: 'Dining, wellness, beauty, medical, and home technician/creative services',
    icon: 'restaurant',
    subcategories: [
      {
        name: 'Food & Dining',
        items: [
          { name: 'Restaurant Table Reservation', emoji: '🍴' }
        ]
      },
      {
        name: 'Beauty & Wellness',
        items: [
          { name: 'Salon / Spa Appointment', emoji: '💇' },
          { name: 'Gym / Yoga Slot Booking', emoji: '🧘' }
        ]
      },
      {
        name: 'Healthcare',
        items: [
          { name: 'Doctor Appointment', emoji: '🩺' }
        ]
      },
      {
        name: 'Home Services',
        items: [
          { name: 'Electrician Booking', emoji: '⚡' },
          { name: 'Plumber Booking', emoji: '🚰' },
          { name: 'Cleaning Service', emoji: '🧹' },
          { name: 'Technician Service', emoji: '🛠️' }
        ]
      },
      {
        name: 'Creative Services',
        items: [
          { name: 'Studio Booking', emoji: '📸' }
        ]
      }
    ]
  },
  {
    title: 'Business',
    description: 'Co-working spaces, meeting rooms, podcast studios, and conference halls',
    icon: 'business',
    subcategories: [
      {
        name: 'Workspace',
        items: [
          { name: 'Co-working Space', emoji: '🧑‍💻' },
          { name: 'Meeting Room', emoji: '🤝' }
        ]
      },
      {
        name: 'Media & Production',
        items: [
          { name: 'Podcast Studio', emoji: '🎙️' },
          { name: 'Conference Hall', emoji: '📽️' }
        ]
      },
      {
        name: 'Education & Training',
        items: [
          { name: 'Training Sessions', emoji: '🏫' }
        ]
      }
    ]
  },
  {
    title: 'Religious Services',
    description: 'Temple darshan passes, pooja slot bookings, and pilgrimage tour packages',
    icon: 'account_balance',
    subcategories: [
      {
        name: 'Temple & Religious',
        items: [
          { name: 'Temple Darshan Booking', emoji: '🛕' },
          { name: 'Pooja Slot Booking', emoji: '🪔' },
          { name: 'Pilgrimage Packages', emoji: '📿' }
        ]
      }
    ]
  },
  {
    title: 'Equipment Rentals',
    description: 'Rent cycles, sports bikes, cameras, sound systems, and event equipment',
    icon: 'shopping_bag',
    subcategories: [
      {
        name: 'Rental Items',
        items: [
          { name: 'Cycle Rental', emoji: '🚲' },
          { name: 'Sports Bike Rental', emoji: '🏍️' },
          { name: 'Camera Rental', emoji: '📷' },
          { name: 'Sound System Rental', emoji: '🔊' },
          { name: 'Event Equipment Rental', emoji: '🪑' }
        ]
      }
    ]
  },
  {
    title: 'Personal Services',
    description: 'Pet grooming, babysitting, elder care, and event organizers',
    icon: 'pets',
    subcategories: [
      {
        name: 'Personal Services',
        items: [
          { name: 'Pet Grooming Appointment', emoji: '🐶' },
          { name: 'Babysitting Service', emoji: '🍼' },
          { name: 'Elder Care Service', emoji: '👴' },
          { name: 'Event Organizer Booking', emoji: '🎂' }
        ]
      }
    ]
  }
];

export function getHrefForCategoryItem(groupTitle: string, item: string): string {
  const titleLower = groupTitle.toLowerCase();
  let groupKey = '';
  if (titleLower.includes('travel') || titleLower.includes('transport')) groupKey = 'travel-transport';
  else if (titleLower.includes('stay') || titleLower.includes('accommodation') || titleLower.includes('accomodation')) groupKey = 'stay-accommodation';
  else if (titleLower.includes('entertainment') || titleLower.includes('events')) groupKey = 'entertainment-events';
  else if (titleLower.includes('sports') || titleLower.includes('turf')) groupKey = 'sports-turf';
  else if (titleLower.includes('lifestyle') || titleLower.includes('local')) groupKey = 'lifestyle-local';
  else if (titleLower.includes('business') || titleLower.includes('professional')) groupKey = 'business-professional';
  else if (titleLower.includes('religious') || titleLower.includes('government')) groupKey = 'religious-government';
  else if (titleLower.includes('rental') || titleLower.includes('equipment')) groupKey = 'rental-equipment';
  else if (titleLower.includes('personal') || titleLower.includes('misc') || titleLower.includes('miscellaneous')) groupKey = 'personal-misc';
  else groupKey = titleLower.replace(/\s+/g, '-');

  const itemLower = item.toLowerCase();
  let slug = '';
  
  // Travel & Transport
  if (itemLower.includes('flight')) slug = 'flights';
  else if (itemLower.includes('train')) slug = 'trains';
  else if (itemLower.includes('bus')) slug = 'buses';
  else if (itemLower.includes('ferry') || itemLower.includes('boat')) slug = 'ferry';
  else if (itemLower.includes('shuttle') || itemLower.includes('van')) slug = 'shuttle';
  else if (itemLower.includes('helicopter')) slug = 'helicopter';
  else if (itemLower.includes('cab') || itemLower.includes('taxi')) slug = 'cabs';
  else if (itemLower.includes('bike rental')) slug = 'bike-rental';
  else if (itemLower.includes('self-drive') || itemLower.includes('car rental')) slug = 'car-rental';
  
  // Stay & Accommodation
  else if (itemLower.includes('pg') || itemLower.includes('coliving') || itemLower.includes('co-living')) slug = 'pg-hostels';
  else if (itemLower.includes('hotel') && !itemLower.includes('hostel')) slug = 'hotels';
  else if (itemLower.includes('resort')) slug = 'resorts';
  else if (itemLower.includes('villa') || itemLower.includes('homestay')) slug = 'villas';
  else if (itemLower.includes('hostel')) slug = 'pg-hostels';
  else if (itemLower.includes('camping')) slug = 'camping';
  
  // Entertainment & Events
  else if (itemLower.includes('cinema') || itemLower.includes('movie')) slug = 'movies';
  else if (itemLower.includes('theatre')) slug = 'theatre';
  else if (itemLower.includes('concert')) slug = 'concerts';
  else if (itemLower.includes('event') || itemLower.includes('festival')) slug = 'events';
  else if (itemLower.includes('exhibition')) slug = 'exhibitions';
  else if (itemLower.includes('workshop') || itemLower.includes('class')) slug = 'workshops';
  else if (itemLower.includes('gaming')) slug = 'gaming';
  
  // Sports & Turf
  else if (itemLower.includes('football') || itemLower.includes('turf')) slug = 'football-turf';
  else if (itemLower.includes('cricket')) slug = 'cricket-ground';
  else if (itemLower.includes('badminton')) slug = 'badminton';
  else if (itemLower.includes('tennis')) slug = 'tennis';
  else if (itemLower.includes('basketball')) slug = 'basketball';
  else if (itemLower.includes('swimming') || itemLower.includes('pool')) slug = 'swimming';
  else if (itemLower.includes('indoor play') || itemLower.includes('arena')) slug = 'play-arena';
  
  // Lifestyle & Local Services
  else if (itemLower.includes('restaurant') || itemLower.includes('dining')) slug = 'dining';
  else if (itemLower.includes('salon') || itemLower.includes('spa')) slug = 'salons';
  else if (itemLower.includes('gym') || itemLower.includes('yoga')) slug = 'gym-yoga';
  else if (itemLower.includes('doctor')) slug = 'doctor';
  else if (itemLower.includes('electrician')) slug = 'electrician';
  else if (itemLower.includes('plumber')) slug = 'plumber';
  else if (itemLower.includes('cleaning')) slug = 'cleaning';
  else if (itemLower.includes('technician')) slug = 'technician';
  else if (itemLower.includes('studio') && !itemLower.includes('podcast')) slug = 'studio';
  
  // Business & Professional
  else if (itemLower.includes('co-working') || itemLower.includes('coworking')) slug = 'coworking';
  else if (itemLower.includes('meeting')) slug = 'meeting-room';
  else if (itemLower.includes('podcast')) slug = 'podcast';
  else if (itemLower.includes('conference')) slug = 'conference';
  else if (itemLower.includes('training')) slug = 'training';
  
  // Religious Services
  else if (itemLower.includes('darshan')) slug = 'darshan';
  else if (itemLower.includes('pooja')) slug = 'pooja';
  else if (itemLower.includes('pilgrimage')) slug = 'pilgrimage';
  
  // Rental & Equipment Booking
  else if (itemLower.includes('cycle')) slug = 'cycle-rental';
  else if (itemLower.includes('sports bike')) slug = 'sports-bike-rental';
  else if (itemLower.includes('camera')) slug = 'camera';
  else if (itemLower.includes('sound')) slug = 'sound-system';
  else if (itemLower.includes('equipment') || itemLower.includes('event equip')) slug = 'event-equip';
  
  // Personal & Miscellaneous Services
  else if (itemLower.includes('pet')) slug = 'pet-grooming';
  else if (itemLower.includes('babysitting')) slug = 'babysitting';
  else if (itemLower.includes('elder')) slug = 'elder-care';
  else if (itemLower.includes('organizer')) slug = 'event-organizer';
  
  else slug = itemLower.replace(/\s+/g, '-');

  return `/${groupKey}/${slug}`;
}

export function getGroupHref(title: string): string {
  const cleanTitle = title.toLowerCase();
  if (cleanTitle.includes('travel') || cleanTitle.includes('transport')) return '/travel-transport';
  if (cleanTitle.includes('stay') || cleanTitle.includes('accommodation') || cleanTitle.includes('accomodation')) return '/stay-accommodation';
  if (cleanTitle.includes('entertainment') || cleanTitle.includes('events')) return '/entertainment-events';
  if (cleanTitle.includes('sports') || cleanTitle.includes('turf')) return '/sports-turf';
  if (cleanTitle.includes('lifestyle') || cleanTitle.includes('local')) return '/lifestyle-local';
  if (cleanTitle.includes('business') || cleanTitle.includes('professional')) return '/business-professional';
  if (cleanTitle.includes('religious') || cleanTitle.includes('government')) return '/religious-government';
  if (cleanTitle.includes('rental') || cleanTitle.includes('equipment')) return '/rental-equipment';
  if (cleanTitle.includes('personal') || cleanTitle.includes('misc') || cleanTitle.includes('miscellaneous')) return '/personal-misc';
  return '/travel-transport';
}

// Flat list of all categories for autocomplete search
export const ALL_SEARCHABLE_SERVICES: SearchableService[] = SERVICE_GROUPS.flatMap((group) =>
  group.subcategories.flatMap((subcat) =>
    subcat.items.map((item) => ({
      name: item.name,
      emoji: item.emoji,
      groupTitle: group.title,
      href: getHrefForCategoryItem(group.title, item.name),
    }))
  )
);
