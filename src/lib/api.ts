// ============================================================
// API Client — BETA Universal Service Marketplace
// ============================================================

const isProd = process.env.NODE_ENV === 'production' || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));
const API_BASE = isProd ? 'https://bokspot-be.onrender.com/api/v1' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1');

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

import { MOCK_SERVICES } from './mockData';

// ---- Category Mappings & Mock Generators ----
const SLUG_TO_CATEGORY: Record<string, string> = {
  // Travel & Transport
  flights: 'Flight Booking',
  trains: 'Train Booking',
  buses: 'Bus Booking',
  ferry: 'Ferry / Boat Booking',
  shuttle: 'Shuttle / Van Booking',
  helicopter: 'Helicopter Booking',
  cabs: 'Cab / Taxi Booking',
  'bike-rental': 'Bike Rental',
  'car-rental': 'Self-Drive Car Rental',

  // Stay & Accommodation
  hotels: 'Hotel Booking',
  resorts: 'Resort Booking',
  villas: 'Homestay / Villa',
  hostels: 'Hostel Booking',
  camping: 'Camping Booking',

  // Entertainment & Events
  movies: 'Cinema / Movie Tickets',
  theatre: 'Theatre Shows',
  concerts: 'Concert Tickets',
  events: 'Events & Festivals',
  exhibitions: 'Exhibition Entry',
  workshops: 'Workshops / Classes',
  gaming: 'Gaming Arena Booking',

  // Sports & Turf
  'football-turf': 'Football Turf',
  'cricket-ground': 'Cricket Ground',
  badminton: 'Badminton Court',
  tennis: 'Tennis Court',
  basketball: 'Basketball Court',
  swimming: 'Swimming Pool Slots',
  'play-arena': 'Indoor Play Arena',

  // Lifestyle & Local Services
  dining: 'Restaurant Table Reservation',
  salons: 'Salon / Spa Appointment',
  'gym-yoga': 'Gym / Yoga Slot Booking',
  doctor: 'Doctor Appointment',
  electrician: 'Electrician Booking',
  plumber: 'Plumber Booking',
  cleaning: 'Cleaning Service',
  technician: 'Technician Service',
  studio: 'Studio Booking',

  // Business & Professional
  coworking: 'Co-working Space',
  'meeting-room': 'Meeting Room',
  podcast: 'Podcast Studio',
  conference: 'Conference Hall',
  training: 'Training Sessions',

  // Religious Services
  darshan: 'Temple Darshan Booking',
  pooja: 'Pooja Slot Booking',
  pilgrimage: 'Pilgrimage Packages',

  // Rental & Equipment Booking
  'cycle-rental': 'Cycle Rental',
  'sports-bike': 'Sports Bike Rental',
  camera: 'Camera Rental',
  'sound-system': 'Sound System Rental',
  'event-equip': 'Event Equipment Rental',

  // Personal & Miscellaneous Services
  'pet-grooming': 'Pet Grooming Appointment',
  babysitting: 'Babysitting Service',
  'elder-care': 'Elder Care Service',
  'event-organizer': 'Event Organizer Booking',
};

function formatSlug(slug: string): string {
  if (SLUG_TO_CATEGORY[slug]) return SLUG_TO_CATEGORY[slug];
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getMockServicesByCategory(slug: string, city: string = 'Chennai'): Service[] {
  const formatted = formatSlug(slug);
  const merchantName = `${formatted} Care Hub`;
  const merchantSlug = `${slug}-care-hub`;

  const merchant: Merchant = {
    id: `mer-${slug}`,
    name: merchantName,
    slug: merchantSlug,
    description: `Premium provider for ${formatted} services, verified and licensed in ${city}.`,
    images: ['🏢'],
    city: city,
    address: `42 Main High Road, ${city}`,
    rating: 4.7,
    reviewCount: 120,
    isVerified: true,
    amenities: ['Parking', 'AC', 'Card Accepted'],
    tags: [formatted, 'Best Price'],
    latitude: 13.0827,
    longitude: 80.2707,
  };

  const category: Category = {
    id: `cat-${slug}`,
    name: formatted,
    slug: slug,
  };

  return [
    {
      id: `ds-${slug}-1`,
      name: `Standard ${formatted} Service`,
      slug: `std-${slug}`,
      description: `Get professional, top-rated standard ${formatted} services with guaranteed satisfaction.`,
      shortDescription: `Standard evaluation and basic package for ${formatted}.`,
      serviceType: 'Standard',
      basePrice: '499',
      currency: 'INR',
      durationMinutes: 45,
      images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'],
      rating: 4.6,
      reviewCount: 95,
      isFeatured: true,
      merchant,
      category,
    },
    {
      id: `ds-${slug}-2`,
      name: `Premium ${formatted} Package`,
      slug: `prem-${slug}`,
      description: `Complete, priority-level premium package for ${formatted} services including advanced benefits.`,
      shortDescription: `Full comprehensive treatment and priority support for ${formatted}.`,
      serviceType: 'Premium',
      basePrice: '1499',
      currency: 'INR',
      durationMinutes: 90,
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80'],
      rating: 4.9,
      reviewCount: 42,
      isFeatured: true,
      merchant,
      category,
    }
  ];
}

// ---- Booking Types ----
export const api = {
  bookingTypes: {
    list: () => apiFetch<BookingType[]>('/booking-types'),
    featured: () => apiFetch<BookingType[]>('/booking-types?featured=true'),
    bySlug: (slug: string) => apiFetch<BookingTypeDetail>(`/booking-types/${slug}`),
  },
  categories: {
    list: () => apiFetch<Category[]>('/services/categories'),
  },
  services: {
    featured: async (limit = 8) => {
      try {
        const res = await apiFetch<any>(`/services/featured?limit=${limit}`);
        if (res && res.success && res.data) {
          return res.data;
        }
      } catch (err) {
        console.warn('Backend featured services error:', err);
      }
      return [];
    },
    list: async (params?: Record<string, string>) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for Render cold start
        const baseUrl = API_BASE;

        // Build query string
        const queryParams = new URLSearchParams();
        if (params?.categorySlug) queryParams.append('categorySlug', params.categorySlug);
        if (params?.city) queryParams.append('city', params.city);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.merchantId) queryParams.append('merchantId', params.merchantId);

        const res = await fetch(`${baseUrl}/services?${queryParams.toString()}`, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        if (res.ok) {
          const body = await res.json();
          // Map Prisma Backend output to the frontend interface
          const servicesArray = body.data?.data || [];
          const mappedServices = servicesArray.map((srv: any) => ({
            id: srv.id,
            name: srv.name,
            slug: srv.slug || srv.id,
            description: srv.description,
            shortDescription: srv.shortDescription || srv.description?.substring(0, 50),
            serviceType: srv.serviceType || srv.name,
            basePrice: srv.basePrice || 0,
            currency: srv.currency || 'INR',
            durationMinutes: srv.durationMinutes || 60,
            images: (srv.images && srv.images.length > 0 && srv.images[0]) ? srv.images : (srv.metadata?.images && srv.metadata.images.length > 0) ? srv.metadata.images : (srv.metadata?.mainImageUrl ? [srv.metadata.mainImageUrl] : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80']),
            image: (srv.images && srv.images.length > 0 && srv.images[0]) ? srv.images[0] : (srv.metadata?.mainImageUrl || srv.metadata?.images?.[0] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'),
            rating: srv.rating || 5,
            reviewCount: srv.reviewCount || 10,
            isFeatured: srv.isFeatured || false,
            metadata: srv.metadata || {},
            merchant: srv.metadata?.merchantName || srv.merchant?.name || 'Merchant',
            merchantObj: srv.merchant ? {
              id: srv.merchant.id,
              name: srv.metadata?.merchantName || srv.merchant.name,
              city: srv.merchant.city,
              address: `${srv.merchant.city} Main Road`,
              rating: srv.merchant.rating || 5,
              reviewCount: srv.merchant.reviewCount || 10,
              images: srv.images && srv.images.length > 0 ? srv.images : [],
              tags: [],
              amenities: [],
              allCategories: srv.merchant.allCategories || []
            } : undefined,
            categoryObj: srv.category ? {
              id: srv.category.id,
              name: srv.category.name,
              slug: srv.category.slug
            } : undefined,
            city: srv.merchant?.city || 'Chennai',
            category: srv.category?.name || 'Category',
            // Pass the dynamic configurations straight to UI
            rawConfig: srv
          }));
          // Return actual data, even if empty, so the UI can show an empty state instead of dummy cards
          return {
            data: mappedServices,
            meta: { total: body.data?.meta?.total || mappedServices.length, page: 1, limit: 100, totalPages: 1 }
          };
        }
      } catch (err) {
        console.warn('Backend services list error:', err);
      }

      // If backend fails completely, return empty
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
      };
    },
    calculatePricing: async (payload: any) => {
      try {
        const baseUrl = API_BASE;
        const res = await fetch(`${baseUrl}/services/calculate-pricing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const body = await res.json();
          return body.data?.data || body.data;
        }
      } catch (err) {
        console.warn('Backend calculatePricing error, calculating locally:', err);
      }
      // Fallback local calculator if backend is offline
      const qty = payload.quantity || 1;
      const hours = payload.durationHours || 1;
      const nights = payload.nights || 1;
      const bp = payload.basePrice || 0;
      let total = bp * qty;
      if (payload.archetype === 'FacilityHourly') {
        total = (bp * hours * qty) + (payload.isNightPeak ? 200 * hours : 0);
      } else if (payload.archetype === 'OvernightStay') {
        total = bp * nights * qty;
      }
      return {
        baseTotal: total,
        addonsTotal: 0,
        securityDeposit: payload.securityDeposit || 0,
        subtotal: total,
        finalPayable: total + (payload.securityDeposit || 0),
        multiplierText: `₹${bp}`
      };
    },
    byId: async (id: string) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const baseUrl = API_BASE;
        const res = await fetch(`${baseUrl}/services/${id}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(errorData.error?.message || 'Failed to fetch service');
          } else {
            throw new Error(`Server Error: ${res.status} ${res.statusText}`);
          }
        }

        const body = await res.json();
        if (body.data) {
          const srv = body.data;
          return {
            id: srv.id,
            name: srv.name,
            slug: srv.slug || srv.id,
            description: srv.description,
            shortDescription: srv.shortDescription || srv.description?.substring(0, 50),
            serviceType: srv.serviceType || srv.name,
            basePrice: srv.basePrice || 0,
            currency: srv.currency || 'INR',
            durationMinutes: srv.durationMinutes || 60,
            images: (srv.images && srv.images.length > 0) ? srv.images : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'],
            image: (srv.images && srv.images.length > 0 && srv.images[0]) ? srv.images[0] : 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
            rating: srv.rating || 5,
            reviewCount: srv.reviewCount || 10,
            isFeatured: srv.isFeatured || false,
            metadata: srv.metadata || {},
            merchant: srv.metadata?.merchantName || srv.merchant?.name || 'Merchant',
            merchantObj: srv.merchant ? {
              ...srv.merchant,
              name: srv.metadata?.merchantName || srv.merchant.name,
              images: srv.images && srv.images.length > 0 ? srv.images : []
            } : undefined,
            categoryObj: srv.category,
            city: srv.merchant?.city || 'Chennai',
            category: srv.category?.name || 'Category',
            rawConfig: srv
          };
        }
      } catch (err) {
        console.warn('Backend service details error, falling back to static parser:', err);
      }

      if (id.startsWith('ds-')) {
        const parts = id.split('-');
        const indexStr = parts[parts.length - 1];
        const slugParts = parts.slice(1, parts.length - 1);
        const categorySlug = slugParts.join('-');

        const mocks = getMockServicesByCategory(categorySlug);
        const found = mocks.find(s => s.id === id);
        if (found) return found;
      }

      if (id.startsWith('prov-')) {
        const parts = id.split('-');
        const indexStr = parts[parts.length - 1];
        const categorySlug = parts.slice(1, parts.length - 1).join('-');

        const categoryName = formatSlug(categorySlug);
        const names = ['Care', 'Studio', 'Pro', 'Express', 'Hub', 'Specialists'];
        const nameIdx = categorySlug.length % names.length;
        const merchantName = `${categoryName} ${names[nameIdx]}`;
        const merchantSlug = `${categorySlug}-${indexStr}`;

        const merchant: Merchant = {
          id: `mer-${merchantSlug}`,
          name: merchantName,
          slug: merchantSlug,
          description: `Welcome to ${merchantName}, your trusted premium partner in Chennai. We guarantee expert consultations, absolute hygiene, and top-tier services tailored to you.`,
          images: ['🏢'],
          city: 'Chennai',
          address: `${Math.floor(categorySlug.length * 7)} Main Road, Block ${indexStr}`,
          rating: 4.6,
          reviewCount: 145,
          isVerified: true,
          amenities: ['AC', 'Card Accepted', 'Parking'],
          tags: [categoryName, 'Verified'],
          latitude: 13.0827 + (Math.sin(categorySlug.length + parseInt(indexStr)) * 0.05),
          longitude: 80.2707 + (Math.cos(categorySlug.length + parseInt(indexStr)) * 0.05),
        };

        const category: Category = {
          id: `cat-${categorySlug}`,
          name: categoryName,
          slug: categorySlug,
        };

        return {
          id,
          name: `${categoryName} Premium Package`,
          slug: `prem-${categorySlug}-${indexStr}`,
          description: `Complete, priority-level premium package for ${categoryName} services including advanced benefits and expert support.`,
          shortDescription: `Full comprehensive treatment and priority support for ${categoryName}.`,
          serviceType: 'Premium',
          basePrice: String(400 + parseInt(indexStr) * 200),
          currency: 'INR',
          durationMinutes: 60,
          images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80'],
          rating: 4.6,
          reviewCount: 145,
          isFeatured: true,
          merchant,
          category,
        };
      }

      // Check client-side storage / zustand stores if available in browser
      if (typeof window !== 'undefined') {
        try {
          // Check booking-flow-storage
          const bFlowRaw = localStorage.getItem('booking-flow-storage');
          if (bFlowRaw) {
            const parsed = JSON.parse(bFlowRaw);
            if (parsed.state?.selectedService?.id === id) {
              const s = parsed.state.selectedService;
              return {
                id: s.id,
                name: s.name,
                slug: s.slug || s.id,
                description: s.description || '',
                shortDescription: s.shortDescription || s.description?.substring(0, 50) || '',
                serviceType: s.serviceType || s.name,
                basePrice: s.basePrice || s.price || 0,
                currency: s.currency || 'INR',
                durationMinutes: s.durationMinutes || 60,
                images: s.images || (s.image ? [s.image] : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80']),
                image: (s.images && s.images[0]) || s.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
                rating: s.rating || 5,
                reviewCount: s.reviewCount || 10,
                isFeatured: s.isFeatured || false,
                metadata: s.metadata || {},
                merchant: s.merchant?.name || (typeof s.merchant === 'string' ? s.merchant : 'Grand Hotel'),
                merchantObj: typeof s.merchant === 'object' ? s.merchant : { name: s.merchant || 'Grand Hotel' },
                categoryObj: typeof s.category === 'object' ? s.category : { name: s.category || 'Hotel Booking' },
                city: s.city || 'Chennai',
                category: typeof s.category === 'object' ? s.category.name : (s.category || 'Hotel Booking'),
                rawConfig: s
              };
            }
          }

          // Check vendor-portal-storage-v9
          const vPortRaw = localStorage.getItem('vendor-portal-storage-v9');
          if (vPortRaw) {
            const vPort = JSON.parse(vPortRaw);
            const vendorServices = vPort.state?.services || [];
            const foundS = vendorServices.find((s: any) => s.id === id);
            if (foundS) {
              return {
                id: foundS.id,
                name: foundS.name,
                slug: foundS.slug || foundS.id,
                description: foundS.description || '',
                shortDescription: foundS.description?.substring(0, 50) || '',
                serviceType: foundS.serviceType || foundS.name,
                basePrice: foundS.basePrice || foundS.price || 0,
                currency: foundS.currency || 'INR',
                durationMinutes: foundS.durationMinutes || 60,
                images: foundS.images || ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'],
                rating: foundS.rating || 5,
                reviewCount: foundS.reviewCount || 10,
                isFeatured: false,
                metadata: foundS.metadata || {},
                merchant: foundS.merchant?.name || 'Grand Hotel',
                city: 'Chennai',
                category: foundS.category || 'Hotel Booking',
                rawConfig: foundS
              };
            }
          }
        } catch (storageErr) {
          console.warn('Local storage service lookup error:', storageErr);
        }
      }

      // Check mock services
      const mockFound = MOCK_SERVICES.find(s => s.id === id);
      if (mockFound) {
        return {
          id: mockFound.id,
          name: mockFound.name,
          slug: mockFound.id,
          description: (mockFound as any).description || mockFound.name,
          shortDescription: mockFound.name,
          serviceType: mockFound.category,
          basePrice: String(mockFound.price),
          currency: 'INR',
          durationMinutes: mockFound.duration,
          images: [mockFound.image],
          image: mockFound.image,
          rating: mockFound.rating,
          reviewCount: mockFound.reviews,
          isFeatured: true,
          merchant: {
            id: `mer-${mockFound.merchant.toLowerCase().replace(/\s+/g, '-')}`,
            name: mockFound.merchant,
            slug: mockFound.merchant.toLowerCase().replace(/\s+/g, '-'),
            city: mockFound.city,
            rating: mockFound.rating,
            images: [mockFound.image],
            latitude: mockFound.lat || 13.0827,
            longitude: mockFound.lng || 80.2707
          },
          category: {
            id: `cat-${mockFound.category.toLowerCase().replace(/\s+/g, '-')}`,
            name: mockFound.category,
            slug: mockFound.category.toLowerCase().replace(/\s+/g, '-')
          },
          metadata: mockFound.metadata || {}
        };
      }

      // Dynamic fallback for any svc-* to never break customer experience
      if (id.startsWith('svc-')) {
        return {
          id,
          name: 'Accommodations & Room Reservation',
          slug: id,
          description: 'Premium suite and room reservation with full amenities, complimentary breakfast, and verified luxury support.',
          shortDescription: 'Deluxe comfort suite with complete amenities.',
          serviceType: 'Accommodation',
          basePrice: '2500',
          currency: 'INR',
          durationMinutes: 1440,
          images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'],
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
          rating: 4.9,
          reviewCount: 48,
          isFeatured: true,
          merchant: {
            id: 'mer-grand-hotel',
            name: 'Grand Hotel & Suites',
            slug: 'grand-hotel',
            city: 'Chennai',
            rating: 4.9,
            address: '14 Anna Salai, Chennai',
            images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80']
          },
          category: {
            id: 'cat-hotels',
            name: 'Hotel Booking',
            slug: 'hotels'
          },
          metadata: {
            originalCategory: 'Hotel Booking',
            bedType: 'King Bed',
            bathroomType: 'Attached Luxury Bathroom'
          }
        };
      }

      throw new Error(`Service not found: ${id}`);
    },
  },
  merchants: {
    nearby: (lat: number, lng: number, params?: Record<string, string>) => {
      const qs = new URLSearchParams({ lat: String(lat), lng: String(lng), ...params }).toString();
      return apiFetch<Merchant[]>(`/geo/nearby?${qs}`);
    },
    bySlug: (slug: string) => apiFetch<Merchant>(`/merchants/slug/${slug}`),
    get: (id: string) => apiFetch<Merchant>(`/merchants/${id}`),
  },
};

// ---- Types ----
export interface BookingType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  coverImage?: string;
  color?: string;
  gradient?: string;
  sortOrder: number;
  isFeatured: boolean;
  _count?: { categories: number; merchants: number };
}

export interface BookingTypeDetail extends BookingType {
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  iconUrl?: string;
  coverImage?: string;
  color?: string;
  bookingTypeId?: string;
  _count?: { services: number };
  children?: Category[];
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  images: string[];
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  amenities: string[];
  tags: string[];
  latitude?: number;
  longitude?: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  serviceType: string;
  basePrice: string;
  currency: string;
  durationMinutes: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  merchant: Merchant;
  category: Category;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
