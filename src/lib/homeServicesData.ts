// Doorstep Home Services Dynamic Registry & Schemas
// Benchmark: Urban Company, Housejoy
// Categories: electrician, plumber, cleaning, technician (AC / Appliance repair)

export interface HomeServiceItem {
  id: string;
  name: string;
  category: 'electrician' | 'plumber' | 'cleaning' | 'technician';
  icon: string;
  inspectionFee: number;
  estDurationMinutes: number;
  description: string;
  popularAddons: { name: string; price: number }[];
}

export interface HomeMerchantConfig {
  slug: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: string;
  city: string;
  locality: string;
  coverageAreas: string[];
  warrantyDays: number;
  technicianSafetyChecked: boolean;
  services: HomeServiceItem[];
  arrivalWindows: string[];
}

export const MASTER_HOME_SERVICES_CONFIG: Record<string, HomeMerchantConfig> = {
  'fixit-pro': {
    slug: 'fixit-pro',
    name: 'FixIt Pro Home Services & Maintenance',
    category: 'Home Doorstep Services',
    rating: 4.88,
    reviewsCount: '890+ completed jobs',
    city: 'Chennai',
    locality: 'T. Nagar & Central Chennai',
    coverageAreas: ['T. Nagar', 'Alwarpet', 'Mylapore', 'Nungambakkam', 'Anna Nagar', 'Velachery', 'OMR'],
    warrantyDays: 30,
    technicianSafetyChecked: true,
    arrivalWindows: [
      'Morning (09:00 AM – 12:00 PM)',
      'Afternoon (01:00 PM – 04:00 PM)',
      'Evening (04:30 PM – 07:30 PM)'
    ],
    services: [
      {
        id: 'svc-elec-diag',
        name: 'Electrical Inspection & Short Circuit Check',
        category: 'electrician',
        icon: '⚡',
        inspectionFee: 199,
        estDurationMinutes: 45,
        description: 'Comprehensive electrical safety check, MCB tripping diagnosis, switchboard repair, or meter wiring check.',
        popularAddons: [
          { name: 'Switchboard / Socket Replacement', price: 149 },
          { name: 'Ceiling Fan Installation / Uninstallation', price: 199 },
          { name: 'MCB Tripping Fix & Rewiring', price: 299 }
        ]
      },
      {
        id: 'svc-plumb-diag',
        name: 'Plumbing Leakage & Pipe Block Inspection',
        category: 'plumber',
        icon: '🔧',
        inspectionFee: 199,
        estDurationMinutes: 45,
        description: 'Complete inspection of bathroom water leakage, drain pipe clogs, tap cartridge fix, and flush tank repair.',
        popularAddons: [
          { name: 'Tap / Mixer Cartridge Replacement', price: 199 },
          { name: 'Drainage Pipe Block Clearing', price: 249 },
          { name: 'Flush Tank / Jet Spray Repair', price: 149 }
        ]
      },
      {
        id: 'svc-clean-deep',
        name: 'Intensive Deep Cleaning & Sanitization',
        category: 'cleaning',
        icon: '🧹',
        inspectionFee: 299,
        estDurationMinutes: 120,
        description: 'Professional high-pressure machine deep scrub of bathrooms, kitchen chimney de-greasing, or sofa shampooing.',
        popularAddons: [
          { name: 'Single Bathroom Anti-Bacterial Deep Clean', price: 499 },
          { name: 'Kitchen Oil / Grease De-carbonization', price: 699 },
          { name: 'Balcony Jet Wash', price: 299 }
        ]
      },
      {
        id: 'svc-ac-repair',
        name: 'AC Jet Servicing & Gas Leakage Check',
        category: 'technician',
        icon: '❄️',
        inspectionFee: 249,
        estDurationMinutes: 60,
        description: 'High-pressure foam jet wash of split/window AC coils, cooling diagnosis, drain tray cleaning, and gas leak check.',
        popularAddons: [
          { name: 'AC Gas Top-Up (R32 / R410A)', price: 1499 },
          { name: 'Water Leakage Drain Pipe Replacement', price: 299 },
          { name: 'Capacitor / PCB Board Repair', price: 799 }
        ]
      }
    ]
  }
};

export function getHomeServiceConfig(categoryOrSlug?: string): HomeMerchantConfig {
  return MASTER_HOME_SERVICES_CONFIG['fixit-pro'];
}

