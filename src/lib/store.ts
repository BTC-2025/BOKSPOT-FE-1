// ============================================================
// Zustand Stores — Global state management
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1';
import { MockService, MOCK_SERVICES } from './mockData';

interface UserState {
  user: any | null;
  token: string | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        username: 'vinothkumar',
        fullName: 'vinothkumar',
        email: 'gmvinoth@bnxmail.com',
        phone: '+91 99887 76655',
        address: '',
        emoji: '🧑',
        avatarColor: 'from-blue-600 to-indigo-700',
        profilePhoto: null
      },
      token: 'mock-session-token-sssandy_1',
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (typeof window !== 'undefined') localStorage.setItem('auth_token', token);
        set({ token });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
        set({ user: null, token: null });
      },
    }),
    { name: 'user-storage' },
  ),
);

export interface PersistedBooking {
  id: string;
  ref: string;
  serviceId: string;
  serviceName: string;
  merchantName: string;
  category?: string;
  date: string;
  time: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'CHECKED_IN';
  city?: string;
  durationMinutes?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  otp?: string;
  bookedAt?: string;
}

export interface PersistedMerchant {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'SUSPENDED';
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  description?: string;
  rating: number;
  vendorId?: string;
  latitude?: number;
  longitude?: number;
  assignSupervisor?: boolean;
  supervisorName?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  supervisorAddress?: string;
  supervisorBnxMail?: string;
}

export interface VendorRequest {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  assignSupervisor?: boolean;
  supervisorName?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  supervisorAddress?: string;
}

export interface UserTicket {
  id: string;
  targetType: 'ADMIN' | 'BUSINESS';
  merchantId?: string; 
  merchantName?: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  createdAt: string;
}

interface BookingFlowState {
  selectedService: any | null;
  selectedSlot: any | null;
  attendeeCount: number;
  notes: string;
  bookingResult: any | null;
  bookings: PersistedBooking[];
  services: MockService[];
  merchants: PersistedMerchant[];
  vendorRequests: VendorRequest[];
  userTickets: UserTicket[];
  commissionRate: number;
  nextVendorSerial: number;
  setCommissionRate: (rate: number) => void;
  setSelectedService: (service: any) => void;
  setSelectedSlot: (slot: any) => void;
  setAttendeeCount: (count: number) => void;
  setNotes: (notes: string) => void;
  setBookingResult: (result: any) => void;
  fetchBookings: () => Promise<void>;
  addBooking: (booking: PersistedBooking) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<PersistedBooking>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
  addService: (service: MockService) => void;
  updateService: (service: MockService) => void;
  deleteService: (serviceId: string) => void;
  addMerchant: (merchant: PersistedMerchant) => void;
  toggleMerchantStatus: (merchantId: string) => void;
  assignVendorId: (merchantId: string, vendorId: string) => void;
  addVendorRequest: (request: VendorRequest) => void;
  updateVendorRequestStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  addUserTicket: (ticket: Omit<UserTicket, 'id' | 'status' | 'createdAt'>) => void;
  fetchTickets: () => Promise<void>;
  resetFlow: () => void;
}

export const useBookingFlowStore = create<BookingFlowState>()((set, get) => ({
      selectedService: null,
      selectedSlot: null,
      attendeeCount: 1,
      notes: '',
      bookingResult: null,
      bookings: [],
      services: MOCK_SERVICES,
      merchants: [
        { id: '1', name: 'Apollo Dental Care', category: 'Doctor Appointment', status: 'ACTIVE', rating: 4.8, email: 'info@apollodental.com', phone: '+91 98765 43210', city: 'Chennai', address: '42 Anna Nagar Main Road', description: 'Apollo Dental Care is a state-of-the-art dental clinic providing top-tier oral care services.', vendorId: '2026050001', latitude: 13.0827, longitude: 80.2707 },
        { id: '2', name: 'ZenFit', category: 'Gym / Yoga Slot Booking', status: 'ACTIVE', rating: 4.9, email: 'zenfit@fitness.com', phone: '+91 98765 54321', city: 'Chennai', address: '15 T Nagar High Road', description: 'ZenFit is a wellness and fitness club offering personal training and group yoga sessions.', vendorId: '2026050002', latitude: 13.078, longitude: 80.268 },
        { id: '3', name: 'Style Studio', category: 'Salon / Spa Appointment', status: 'ACTIVE', rating: 4.8, email: 'style@studio.com', phone: '+91 98765 12345', city: 'Chennai', address: '15 T Nagar High Road', description: 'Style Studio is a premium beauty salon for haircuts, styling, and bridal makeups.', vendorId: '2026050003', latitude: 13.085, longitude: 80.275 },
        { id: '4', name: 'The Grand temple Dine', category: 'Restaurant Table Reservation', status: 'ACTIVE', rating: 4.7, email: 'dine@grandtemple.com', phone: '+91 98450 12345', city: 'Madurai', address: 'Madurai High Road', description: 'The Grand Temple Dine is an elegant family fine-dining restaurant.', vendorId: '2026050004', latitude: 9.925, longitude: 78.118 }
      ],
      vendorRequests: [
        {
          id: 'req-1',
          name: 'Green Wellness Spa',
          category: 'Salon / Spa Appointment',
          email: 'contact@greenwellness.com',
          phone: '+91 98765 67890',
          city: 'Chennai',
          address: '77 OMR Road, Karapakkam',
          description: 'A pure organic and herbal spa experience focusing on traditional therapies.',
          status: 'PENDING',
          submittedAt: '2026-06-09T10:00:00.000Z'
        },
        {
          id: 'req-2',
          name: 'Royal Stay Villas',
          category: 'Homestay / Villa',
          email: 'bookings@royalvillas.in',
          phone: '+91 99444 88888',
          city: 'Coimbatore',
          address: '44 Hill View Enclave',
          description: 'Luxury heritage homestay experience in the foothills of Western Ghats.',
          status: 'PENDING',
          submittedAt: '2026-06-09T11:30:00.000Z'
        }
      ],
      userTickets: [],
      commissionRate: 10,
      nextVendorSerial: 5,
      setCommissionRate: (rate) => set({ commissionRate: rate }),
      setSelectedService: (service) => set({ selectedService: service }),
      setSelectedSlot: (slot) => set({ selectedSlot: slot }),
      setAttendeeCount: (count) => set({ attendeeCount: count }),
      setNotes: (notes) => set({ notes }),
      setBookingResult: (result) => set({ bookingResult: result }),

      fetchBookings: async () => {
        try {
          const res = await axios.get(`${API_BASE}/bookings/sync`);
          if (res.data && Array.isArray(res.data)) {
            set({ bookings: res.data });
          }
        } catch (error) {
          console.error("Error fetching bookings:", error);
          set({ bookings: [] });
        }
      },

      addBooking: async (booking) => {
        try {
          await axios.post(`${API_BASE}/bookings/sync`, booking);
          const currentBookings = get().bookings;
          set({ bookings: [booking, ...currentBookings] });
        } catch (error) {
          console.error("Failed to add booking to DB", error);
          set((state) => ({ bookings: [booking, ...state.bookings] }));
        }
      },
      
      updateBooking: async (bookingId, updates) => {
        try {
          const current = get().bookings.find(b => b.id === bookingId);
          if (current) {
            const updated = { ...current, ...updates };             
            await axios.post(`${API_BASE}/bookings/sync`, updated);
          }
        } catch (error) {
          console.error("Failed to update booking to DB", error);
        }
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, ...updates } : b
          ),
        }));
      },
      
      cancelBooking: async (bookingId) => {
        try {
          const current = get().bookings.find(b => b.id === bookingId);
          if (current) {
            const updated = { ...current, status: 'CANCELLED' };
            await axios.post(`${API_BASE}/bookings/sync`, updated);
          }
        } catch (error) {
          console.error("Failed to cancel booking in DB", error);
        }
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
          ),
        }));
      },
      
      completeBooking: async (bookingId) => {
        try {
          const current = get().bookings.find(b => b.id === bookingId);
          if (current) {
            const updated = { ...current, status: 'COMPLETED' };
            await axios.post(`${API_BASE}/bookings/sync`, updated);
          }
        } catch (error) {
          console.error("Failed to complete booking in DB", error);
        }
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'COMPLETED' } : b
          ),
        }));
      },
      addService: (service) => set((state) => ({ services: [service, ...state.services] })),
      updateService: (updated) => set((state) => ({
        services: state.services.map((s) => s.id === updated.id ? updated : s)
      })),
      deleteService: (serviceId) => set((state) => ({
        services: state.services.filter((s) => s.id !== serviceId)
      })),
      addMerchant: (merchant) => set((state) => {
        let updatedMerchant = { ...merchant };
        let nextSerial = state.nextVendorSerial;
        if (!updatedMerchant.vendorId) {
          const now = new Date();
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const serialStr = String(nextSerial).padStart(4, '0');
          updatedMerchant.vendorId = `${yyyy}${mm}${serialStr}`;
          nextSerial += 1;
        }
        return {
          merchants: [...state.merchants, updatedMerchant],
          nextVendorSerial: nextSerial
        };
      }),
      toggleMerchantStatus: (merchantId) => set((state) => ({
        merchants: state.merchants.map((m) => m.id === merchantId ? { ...m, status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : m)
      })),
      assignVendorId: (merchantId, vendorId) => set((state) => ({
        merchants: state.merchants.map((m) => m.id === merchantId ? { ...m, vendorId } : m)
      })),
      addVendorRequest: (request) => set((state) => ({
        vendorRequests: [request, ...state.vendorRequests]
      })),
      updateVendorRequestStatus: (id, status) => set((state) => ({
        vendorRequests: state.vendorRequests.map((req) =>
          req.id === id ? { ...req, status } : req
        )
      })),
      fetchTickets: async () => {
        try {
          const res = await fetch('https://bokspot-be.onrender.com/api/v1/tickets');
          if (res.ok) {
            const body = await res.json();
            set({ userTickets: body.data || [] });
          }
        } catch (e) {
          console.error('Failed to fetch tickets from backend', e);
        }
      },
      addUserTicket: async (ticket) => {
        try {
          const res = await fetch('http://localhost:9000/api/v1/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
          });
          if (res.ok) {
            const body = await res.json();
            set((state) => ({ userTickets: [body.data, ...state.userTickets] }));
          }
        } catch (e) {
          console.error('Failed to save ticket to backend', e);
          // Fallback
          set((state) => ({
            userTickets: [
              {
                ...ticket,
                id: 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                status: 'OPEN',
                createdAt: new Date().toISOString()
              },
              ...state.userTickets
            ]
          }));
        }
      },
      resetFlow: () => set({
        selectedService: null,
        selectedSlot: null,
        attendeeCount: 1,
        notes: '',
        bookingResult: null,
      }),
    }));

interface UIState {
  theme: 'system' | 'light' | 'dark';
  sidebarOpen: boolean;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light' 
      })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'ui-storage' },
  ),
);

if (typeof window !== 'undefined') {
  useBookingFlowStore.getState().fetchBookings();
}

export interface LocationState {
  city: string;
  latitude: number | null;
  longitude: number | null;
  status: 'idle' | 'detecting' | 'detected' | 'error';
  setCity: (city: string) => void;
  setLocation: (lat: number, lng: number, city: string) => void;
  setStatus: (status: 'idle' | 'detecting' | 'detected' | 'error') => void;
}

export const POPULAR_CITIES = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Goa', lat: 15.2993, lng: 74.1240 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
];

export const ALL_CITIES = [
  'Abohar', 'Abu Road', 'Achampet', 'Acharapakkam', 'Addanki', 'Adilabad', 'Adipur',
  'Adoni', 'Adoor', 'Agar', 'Agartala', 'Agra', 'Ahmedabad', 'Ahmedgarh', 'Ahmednagar', 'Aizawl',
  'Ajmer', 'Akbarpur', 'Akividu', 'Akola', 'Alakode', 'Alangayam', 'Alangudi', 'Aligarh',
  'Allahabad', 'Alleppey', 'Alwar', 'Ambala', 'Amravati', 'Amritsar', 'Anand', 'Anantapur',
  'Aurangabad', 'Bangalore', 'Bareilly', 'Belgaum', 'Bhavnagar', 'Bhilai', 'Bhiwandi', 'Bhopal',
  'Bhubaneswar', 'Bikaner', 'Bilaspur', 'Bokaro', 'Chandigarh', 'Chennai', 'Coimbatore', 'Cuttack',
  'Dehradun', 'Delhi', 'Dhanbad', 'Durgapur', 'Erode', 'Faridabad', 'Firozabad', 'Ghaziabad',
  'Goa', 'Gorakhpur', 'Gulbarga', 'Guntur', 'Gurgaon', 'Guwahati', 'Gwalior', 'Hubli', 'Hyderabad',
  'Indore', 'Jabalpur', 'Jaipur', 'Jalandhar', 'Jammu', 'Jamnagar', 'Jamshedpur', 'Jhansi', 'Jodhpur',
  'Kakinada', 'Kannur', 'Kanpur', 'Karnal', 'Kochi', 'Kolhapur', 'Kolkata', 'Kollam', 'Kota',
  'Kozhikode', 'Kurnool', 'Lucknow', 'Ludhiana', 'Madurai', 'Mangalore', 'Mathura', 'Meerut',
  'Moradabad', 'Mumbai', 'Mysore', 'Nagpur', 'Nanded', 'Nashik', 'Nellore', 'Noida', 'Patna',
  'Pondicherry', 'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Rohtak', 'Rourkela', 'Salem', 'Sangli',
  'Shimla', 'Siliguri', 'Solapur', 'Srinagar', 'Surat', 'Thiruvananthapuram', 'Thrissur', 'Tiruchirappalli',
  'Tirunelveli', 'Tiruppur', 'Udaipur', 'Ujjain', 'Vadodara', 'Varanasi', 'Vasai', 'Vellore', 'Vijayawada',
  'Visakhapatnam', 'Warangal'
].sort();

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      status: 'idle',
      setCity: (city) => set({ city, status: 'detected' }),
      setLocation: (latitude, longitude, city) => set({ latitude, longitude, city, status: 'detected' }),
      setStatus: (status) => set({ status }),
    }),
    { name: 'location-storage' },
  )
);


export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  icon?: string;
  iconColor?: string;
  date?: string;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      updateQuantity: (id, delta) => set((state) => ({
        items: state.items.map((i) => {
          if (i.id === id) {
            const newQty = Math.max(0, i.quantity + delta);
            return { ...i, quantity: newQty };
          }
          return i;
        }).filter(i => i.quantity > 0)
      })),
      setQuantity: (id, qty) => set((state) => {
        if (qty <= 0) {
          return { items: state.items.filter((i) => i.id !== id) };
        }
        return {
          items: state.items.map((i) => i.id === id ? { ...i, quantity: qty } : i)
        };
      }),
      clearCart: () => set({ items: [] })
    }),
    { name: 'cart-storage' }
  )
);

export interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  tag?: string;
  statusTag?: string;
  icon?: string;
  iconColor?: string;
  image?: string;
}

export interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => set((state) => {
        const exists = state.items.some((i) => i.id === item.id);
        if (exists) {
          return { items: state.items.filter((i) => i.id !== item.id) };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      isInWishlist: (id) => get().items.some((i) => i.id === id)
    }),
    { name: 'wishlist-storage' }
  )
);
