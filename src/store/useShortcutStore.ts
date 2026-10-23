import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Shortcut {
  id: string;
  label: string;
  icon: string;
  actionType: 'modal' | 'link';
  actionTarget: string; // URL for link, modal ID for modal
}

export const AVAILABLE_SHORTCUTS: Shortcut[] = [
  // Travel & Transport
  { id: 'buses', label: 'Bus Booking', icon: 'directions_bus', actionType: 'link', actionTarget: '/travel-transport/buses' },
  { id: 'trains', label: 'Train Booking', icon: 'train', actionType: 'link', actionTarget: '/travel-transport/trains' },
  { id: 'flights', label: 'Flight Booking', icon: 'flight', actionType: 'link', actionTarget: '/travel-transport/flights' },
  { id: 'ferry', label: 'Ferry / Boat Booking', icon: 'directions_boat', actionType: 'link', actionTarget: '/travel-transport/ferry' },
  { id: 'shuttle', label: 'Shuttle / Van Booking', icon: 'airport_shuttle', actionType: 'link', actionTarget: '/travel-transport/shuttle' },
  { id: 'helicopter', label: 'Helicopter Booking', icon: 'flight_takeoff', actionType: 'link', actionTarget: '/travel-transport/helicopter' },
  { id: 'cabs', label: 'Cab / Taxi Booking', icon: 'local_taxi', actionType: 'link', actionTarget: '/travel-transport/cabs' },
  { id: 'bike-rental', label: 'Bike Rental', icon: 'two_wheeler', actionType: 'link', actionTarget: '/travel-transport/bike-rental' },
  { id: 'car-rental', label: 'Self-Drive Car Rental', icon: 'directions_car', actionType: 'link', actionTarget: '/travel-transport/car-rental' },

  // Stay & Accommodation
  { id: 'hotels', label: 'Hotel Booking', icon: 'hotel', actionType: 'link', actionTarget: '/home/hotels' },
  { id: 'resorts', label: 'Resort Booking', icon: 'beach_access', actionType: 'link', actionTarget: '/stay-accommodation/resorts' },
  { id: 'villas', label: 'Homestay / Villa', icon: 'home', actionType: 'link', actionTarget: '/stay-accommodation/villas' },
  { id: 'hostels', label: 'Hostel Booking', icon: 'bed', actionType: 'link', actionTarget: '/stay-accommodation/hostels' },
  { id: 'camping', label: 'Camping Booking', icon: 'camping', actionType: 'link', actionTarget: '/stay-accommodation/camping' },

  // Entertainment & Events
  { id: 'movies', label: 'Cinema / Movie Tickets', icon: 'movie', actionType: 'link', actionTarget: '/entertainment-events/movies' },
  { id: 'theatre', label: 'Theatre Shows', icon: 'theater_comedy', actionType: 'link', actionTarget: '/entertainment-events/theatre' },
  { id: 'concerts', label: 'Concert Tickets', icon: 'music_note', actionType: 'link', actionTarget: '/entertainment-events/concerts' },
  { id: 'events', label: 'Events & Festivals', icon: 'festival', actionType: 'link', actionTarget: '/entertainment-events/events' },
  { id: 'exhibitions', label: 'Exhibition Entry', icon: 'local_activity', actionType: 'link', actionTarget: '/entertainment-events/exhibitions' },
  { id: 'workshops', label: 'Workshops / Classes', icon: 'palette', actionType: 'link', actionTarget: '/entertainment-events/workshops' },
  { id: 'gaming', label: 'Gaming Arena Booking', icon: 'sports_esports', actionType: 'link', actionTarget: '/entertainment-events/gaming' },

  // Sports & Turf
  { id: 'football-turf', label: 'Football Turf', icon: 'sports_soccer', actionType: 'link', actionTarget: '/sports-turf/football-turf' },
  { id: 'cricket-ground', label: 'Cricket Ground', icon: 'sports_cricket', actionType: 'link', actionTarget: '/sports-turf/cricket-ground' },
  { id: 'badminton', label: 'Badminton Court', icon: 'sports_tennis', actionType: 'link', actionTarget: '/sports-turf/badminton' },
  { id: 'tennis', label: 'Tennis Court', icon: 'sports_tennis', actionType: 'link', actionTarget: '/sports-turf/tennis' },
  { id: 'basketball', label: 'Basketball Court', icon: 'sports_basketball', actionType: 'link', actionTarget: '/sports-turf/basketball' },
  { id: 'swimming', label: 'Swimming Pool Slots', icon: 'pool', actionType: 'link', actionTarget: '/sports-turf/swimming' },
  { id: 'play-arena', label: 'Indoor Play Arena', icon: 'toys', actionType: 'link', actionTarget: '/sports-turf/play-arena' },

  // Lifestyle & Local Services
  { id: 'dining', label: 'Restaurant Table Reservation', icon: 'restaurant', actionType: 'link', actionTarget: '/lifestyle-local/dining' },
  { id: 'salons', label: 'Salon / Spa Appointment', icon: 'content_cut', actionType: 'link', actionTarget: '/lifestyle-local/salons' },
  { id: 'gym-yoga', label: 'Gym / Yoga Slot Booking', icon: 'fitness_center', actionType: 'link', actionTarget: '/lifestyle-local/gym-yoga' },
  { id: 'doctor', label: 'Doctor Appointment', icon: 'medical_services', actionType: 'link', actionTarget: '/lifestyle-local/doctor' },
  { id: 'electrician', label: 'Electrician Booking', icon: 'bolt', actionType: 'link', actionTarget: '/lifestyle-local/electrician' },
  { id: 'plumber', label: 'Plumber Booking', icon: 'plumbing', actionType: 'link', actionTarget: '/lifestyle-local/plumber' },
  { id: 'cleaning', label: 'Cleaning Service', icon: 'mop', actionType: 'link', actionTarget: '/lifestyle-local/cleaning' },
  { id: 'technician', label: 'Technician Service', icon: 'build', actionType: 'link', actionTarget: '/lifestyle-local/technician' },
  { id: 'studio', label: 'Studio Booking', icon: 'photo_camera', actionType: 'link', actionTarget: '/lifestyle-local/studio' },

  // Business & Professional
  { id: 'coworking', label: 'Co-working Space', icon: 'laptop_mac', actionType: 'link', actionTarget: '/business-professional/coworking' },
  { id: 'meeting-room', label: 'Meeting Room', icon: 'groups', actionType: 'link', actionTarget: '/business-professional/meeting-room' },
  { id: 'podcast', label: 'Podcast Studio', icon: 'mic', actionType: 'link', actionTarget: '/business-professional/podcast' },
  { id: 'conference', label: 'Conference Hall', icon: 'co_present', actionType: 'link', actionTarget: '/business-professional/conference' },
  { id: 'training', label: 'Training Sessions', icon: 'school', actionType: 'link', actionTarget: '/business-professional/training' },

  // Religious Services
  { id: 'darshan', label: 'Temple Darshan Booking', icon: 'temple_hindu', actionType: 'link', actionTarget: '/religious-government/darshan' },
  { id: 'pooja', label: 'Pooja Slot Booking', icon: 'self_care', actionType: 'link', actionTarget: '/religious-government/pooja' },
  { id: 'pilgrimage', label: 'Pilgrimage Packages', icon: 'map', actionType: 'link', actionTarget: '/religious-government/pilgrimage' },

  // Rental & Equipment Booking
  { id: 'cycle-rental', label: 'Cycle Rental', icon: 'pedal_bike', actionType: 'link', actionTarget: '/rental-equipment/cycle-rental' },
  { id: 'sports-bike', label: 'Sports Bike Rental', icon: 'motorcycle', actionType: 'link', actionTarget: '/rental-equipment/sports-bike' },
  { id: 'camera', label: 'Camera Rental', icon: 'photo_camera', actionType: 'link', actionTarget: '/rental-equipment/camera' },
  { id: 'sound-system', label: 'Sound System Rental', icon: 'volume_up', actionType: 'link', actionTarget: '/rental-equipment/sound-system' },
  { id: 'event-equip', label: 'Event Equipment Rental', icon: 'chair', actionType: 'link', actionTarget: '/rental-equipment/event-equip' },

  // Personal & Miscellaneous Services
  { id: 'pet-grooming', label: 'Pet Grooming Appointment', icon: 'pets', actionType: 'link', actionTarget: '/personal-misc/pet-grooming' },
  { id: 'babysitting', label: 'Babysitting Service', icon: 'baby_changing_station', actionType: 'link', actionTarget: '/personal-misc/babysitting' },
  { id: 'elder-care', label: 'Elder Care Service', icon: 'elderly', actionType: 'link', actionTarget: '/personal-misc/elder-care' },
  { id: 'event-organizer', label: 'Event Organizer Booking', icon: 'cake', actionType: 'link', actionTarget: '/personal-misc/event-organizer' },
];

export const DEFAULT_8_SHORTCUTS = [
  'buses',
  'trains',
  'flights',
  'hotels',
  'movies',
  'football-turf',
  'dining',
  'cabs',
];

export const SUBNAV_CATEGORIES = [
  { id: 'travel-transport', label: 'Travel & Transport', emoji: '✈️', href: '/travel-transport' },
  { id: 'stay-accommodation', label: 'Stay & Accommodation', emoji: '🏨', href: '/stay-accommodation' },
  { id: 'entertainment-events', label: 'Entertainment & Events', emoji: '🎥', href: '/entertainment-events' },
  { id: 'sports-turf', label: 'Sports & Turf', emoji: '⚽', href: '/sports-turf' },
  { id: 'lifestyle-local', label: 'Lifestyle Services', emoji: '💇', href: '/lifestyle-local' },
  { id: 'business-professional', label: 'Business & Professional', emoji: '🏢', href: '/business-professional' },
  { id: 'religious-government', label: 'Religious Services', emoji: '🛕', href: '/religious-government' },
  { id: 'rental-equipment', label: 'Equipment Rentals', emoji: '🛍️', href: '/rental-equipment' },
  { id: 'personal-misc', label: 'Personal Services', emoji: '🐶', href: '/personal-misc' }
];

interface ShortcutState {
  activeShortcuts: string[]; // Store only the IDs
  shortcutModalOpen: boolean;
  activeActionModal: string | null;
  
  subnavCategories: string[]; // Store category IDs
  subnavModalOpen: boolean;
  
  toggleShortcut: (id: string) => void;
  setShortcutModalOpen: (isOpen: boolean) => void;
  openActionModal: (modalId: string) => void;
  closeActionModal: () => void;
  
  toggleSubnavCategory: (id: string) => void;
  setSubnavModalOpen: (isOpen: boolean) => void;
}

export const useShortcutStore = create<ShortcutState>()(
  persist(
    (set, get) => ({
      activeShortcuts: DEFAULT_8_SHORTCUTS, // 8 Default shortcuts out-of-the-box
      shortcutModalOpen: false,
      activeActionModal: null,
      
      subnavCategories: ['travel-transport', 'stay-accommodation', 'entertainment-events'], // Default
      subnavModalOpen: false,

      toggleShortcut: (id) => set((state) => {
        const isActive = state.activeShortcuts.includes(id);
        if (isActive) {
          return { activeShortcuts: state.activeShortcuts.filter(s => s !== id) };
        } else {
          if (state.activeShortcuts.length >= 8) {
            return {};
          }
          return { activeShortcuts: [...state.activeShortcuts, id] };
        }
      }),

      setShortcutModalOpen: (isOpen) => set({ shortcutModalOpen: isOpen }),
      openActionModal: (modalId) => set({ activeActionModal: modalId }),
      closeActionModal: () => set({ activeActionModal: null }),
      
      toggleSubnavCategory: (id) => set((state) => {
        const isActive = state.subnavCategories.includes(id);
        if (isActive) {
          return { subnavCategories: state.subnavCategories.filter(s => s !== id) };
        } else {
          if (state.subnavCategories.length >= 3) {
            return {}; // Max 3
          }
          return { subnavCategories: [...state.subnavCategories, id] };
        }
      }),
      setSubnavModalOpen: (isOpen) => set({ subnavModalOpen: isOpen }),
    }),
    {
      name: 'lumina-shortcuts', // key in local storage
      partialize: (state) => ({ 
        activeShortcuts: state.activeShortcuts,
        subnavCategories: state.subnavCategories 
      }), // persist both
    }
  )
);
