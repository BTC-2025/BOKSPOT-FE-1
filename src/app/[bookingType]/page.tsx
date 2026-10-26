'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocationStore } from '../../lib/store';
import { getProvidersByCategory } from '../../lib/mockData';

const CATEGORY_DATA: Record<string, {
  name: string; emoji: string; gradient: string; desc: string;
  sections: {
    subheading: string;
    categories: { name: string; emoji: string; slug: string; desc: string }[];
  }[];
}> = {
  'travel-transport': {
    name: 'Travel', emoji: '🌍', gradient: 'from-blue-500 to-cyan-400',
    desc: 'All movement and travel-related bookings, including public transit and personal rentals',
    sections: [
      {
        subheading: 'Public Transport',
        categories: [
          { name: 'Bus Booking', emoji: '🚌', slug: 'buses', desc: 'Book intercity and local sleeper/seated bus tickets' },
          { name: 'Train Booking', emoji: '🚆', slug: 'trains', desc: 'Book express and passenger train tickets' },
          { name: 'Flight Booking', emoji: '✈️', slug: 'flights', desc: 'Book domestic and international flight tickets' },
          { name: 'Ferry / Boat Booking', emoji: '⛴️', slug: 'ferry', desc: 'Book passenger ferry and boat tickets' },
          { name: 'Shuttle / Van Booking', emoji: '🚐', slug: 'shuttle', desc: 'Shared shuttle and passenger van transfers' },
          { name: 'Helicopter Booking (Premium)', emoji: '🚁', slug: 'helicopter', desc: 'Premium private helicopter transfers & tours' },
        ]
      },
      {
        subheading: 'Personal Transport',
        categories: [
          { name: 'Cab / Taxi Booking', emoji: '🚖', slug: 'cabs', desc: 'Book local on-demand cabs and outstation taxis' },
          { name: 'Bike Rental', emoji: '🛵', slug: 'bike-rental', desc: 'Hourly or daily two-wheeler and scooter rentals' },
          { name: 'Self-Drive Car Rental', emoji: '🚗', slug: 'car-rental', desc: 'Rent a self-drive car for trips and commutes' },
        ]
      }
    ],
  },
  'stay-accommodation': {
    name: 'Stay & Accomodation', emoji: '🏨', gradient: 'from-amber-400 to-amber-600',
    desc: 'Hotels, resorts, luxury villas, homestays, and outdoor camping experiences',
    sections: [
      {
        subheading: 'Hotels & Rooms',
        categories: [
          { name: 'Hotel Booking', emoji: '🏨', slug: 'hotels', desc: 'Book premium, boutique, and budget hotels' },
          { name: 'Resort Booking', emoji: '🏖️', slug: 'resorts', desc: 'Luxury beachfront, hill, and forest resorts' },
          { name: 'Homestay / Villa', emoji: '🏡', slug: 'villas', desc: 'Book private villas, homestays, and estates' },
          { name: 'Hostel Booking', emoji: '🛌', slug: 'hostels', desc: 'Shared rooms and budget hostel stays' },
          { name: 'Camping Booking', emoji: '🏕️', slug: 'camping', desc: 'Rent campsites, tents, and glamping spots' },
        ]
      }
    ],
  },
  'entertainment-events': {
    name: 'Entertainment', emoji: '🎬', gradient: 'from-pink-500 to-rose-600',
    desc: 'Movies, concerts, live plays, festivals, workshops, and gaming slots',
    sections: [
      {
        subheading: 'Movies & Shows',
        categories: [
          { name: 'Cinema / Movie Tickets', emoji: '🎥', slug: 'movies', desc: 'Book tickets for the latest cinema releases' },
          { name: 'Theatre Shows', emoji: '🎭', slug: 'theatre', desc: 'Book live plays and drama theatre acts' },
        ]
      },
      {
        subheading: 'Events',
        categories: [
          { name: 'Concert Tickets', emoji: '🎤', slug: 'concerts', desc: 'Live music concerts, DJs, and music events' },
          { name: 'Events & Festivals', emoji: '🎪', slug: 'events', desc: 'Festivals, stand-up comedy, and cultural events' },
          { name: 'Exhibition Entry', emoji: '🎟️', slug: 'exhibitions', desc: 'Art galleries, trade expos, and museum passes' },
        ]
      },
      {
        subheading: 'Learning & Fun',
        categories: [
          { name: 'Workshops / Classes', emoji: '🎨', slug: 'workshops', desc: 'Interactive classes in arts, crafts, and hobbies' },
          { name: 'Gaming Arena Booking', emoji: '🎮', slug: 'gaming', desc: 'Reserve console, PC, and VR gaming slots' },
        ]
      }
    ],
  },
  'sports-turf': {
    name: 'Sports', emoji: '⚽', gradient: 'from-emerald-500 to-teal-600',
    desc: 'Sports turfs, courts, grounds, swimming, and indoor recreation zones',
    sections: [
      {
        subheading: 'Outdoor Sports',
        categories: [
          { name: 'Football Turf', emoji: '⚽', slug: 'football-turf', desc: 'Book slots for 5-a-side and 7-a-side turfs' },
          { name: 'Cricket Ground', emoji: '🏏', slug: 'cricket-ground', desc: 'Reserve net practice slots and full grounds' },
        ]
      },
      {
        subheading: 'Indoor Sports',
        categories: [
          { name: 'Badminton Court', emoji: '🏸', slug: 'badminton', desc: 'Book indoor synthetic and wooden courts' },
          { name: 'Tennis Court', emoji: '🎾', slug: 'tennis', desc: 'Reserve clay and hard-court tennis slots' },
          { name: 'Basketball Court', emoji: '🏀', slug: 'basketball', desc: 'Book half or full court indoor/outdoor slots' },
        ]
      },
      {
        subheading: 'Fitness & Activity',
        categories: [
          { name: 'Swimming Pool Slots', emoji: '🏊', slug: 'swimming', desc: 'Reserve hourly lap swimming pool slots' },
          { name: 'Indoor Play Arena', emoji: '🧗', slug: 'play-arena', desc: 'Book trampoline parks, bowling, and climbing slots' },
        ]
      }
    ],
  },
  'lifestyle-local': {
    name: 'Lifestyle Services', emoji: '🍽️', gradient: 'from-purple-500 to-pink-500',
    desc: 'Restaurant reservations, wellness appointments, clinical care, and home utilities',
    sections: [
      {
        subheading: 'Food & Dining',
        categories: [
          { name: 'Restaurant Table Reservation', emoji: '🍴', slug: 'dining', desc: 'Reserve tables at top-rated local dining spots' },
        ]
      },
      {
        subheading: 'Beauty & Wellness',
        categories: [
          { name: 'Salon / Spa Appointment', emoji: '💇', slug: 'salons', desc: 'Book haircuts, spa therapies, and massages' },
          { name: 'Gym / Yoga Slot Booking', emoji: '🧘', slug: 'gym-yoga', desc: 'Book daily or monthly slots at gyms and yoga studios' },
        ]
      },
      {
        subheading: 'Healthcare',
        categories: [
          { name: 'Doctor Appointment', emoji: '🏥', slug: 'doctor', desc: 'Schedule check-ups at dental and medical clinics' },
        ]
      },
      {
        subheading: 'Home Services',
        categories: [
          { name: 'Electrician Booking', emoji: '🧾', slug: 'electrician', desc: 'Book verified electricians for home repairs' },
          { name: 'Plumber Booking', emoji: '🔧', slug: 'plumber', desc: 'Schedule plumber visits for leakages and fittings' },
          { name: 'Cleaning Service', emoji: '🧹', slug: 'cleaning', desc: 'Book deep home, kitchen, and bathroom cleaning' },
          { name: 'Technician Service', emoji: '🛠️', slug: 'technician', desc: 'Book AC repairs, appliances fix, and technicians' },
        ]
      },
      {
        subheading: 'Creative Services',
        categories: [
          { name: 'Studio Booking', emoji: '📸', slug: 'studio', desc: 'Rent photo studios, equipment, and production sets' },
        ]
      }
    ],
  },
  'business-professional': {
    name: 'Business', emoji: '🏢', gradient: 'from-indigo-500 to-violet-600',
    desc: 'Workspaces, professional podcast studios, conference halls, and training sessions',
    sections: [
      {
        subheading: 'Workspace',
        categories: [
          { name: 'Co-working Space', emoji: '🧑‍💻', slug: 'coworking', desc: 'Reserve hot desks and dedicated office space' },
          { name: 'Meeting Room', emoji: '🏛️', slug: 'meeting-room', desc: 'Book professional meeting rooms with screens' },
        ]
      },
      {
        subheading: 'Media & Production',
        categories: [
          { name: 'Podcast Studio', emoji: '🎙️', slug: 'podcast', desc: 'Reserve audio-isolated recording studios' },
          { name: 'Conference Hall', emoji: '📽️', slug: 'conference', desc: 'Book large halls for corporate events' },
        ]
      },
      {
        subheading: 'Education & Training',
        categories: [
          { name: 'Training Sessions', emoji: '🏫', slug: 'training', desc: 'Book dynamic corporate training spaces' },
        ]
      }
    ],
  },
  'religious-government': {
    name: 'Religious Services', emoji: '🛕', gradient: 'from-orange-500 to-amber-500',
    desc: 'Temple darshan passes, pooja bookings, and specialized pilgrimage packages',
    sections: [
      {
        subheading: 'Temple & Religious',
        categories: [
          { name: 'Temple Darshan Booking', emoji: '🛕', slug: 'darshan', desc: 'Book special darshan passes and entry tickets' },
          { name: 'Pooja Slot Booking', emoji: '🪔', slug: 'pooja', desc: 'Book slots for specific temple rituals and poojas' },
          { name: 'Pilgrimage Packages', emoji: '🚕', slug: 'pilgrimage', desc: 'Book specialized travel packages for pilgrimage sites' },
        ]
      }
    ],
  },
  'rental-equipment': {
    name: 'Equipment Rentals', emoji: '🛍️', gradient: 'from-teal-500 to-cyan-600',
    desc: 'Rent cycles, sports bikes, cameras, sound systems, and event items',
    sections: [
      {
        subheading: 'Rental Items',
        categories: [
          { name: 'Cycle Rental', emoji: '🚲', slug: 'cycle-rental', desc: 'Rent geared, non-geared, and mountain cycles' },
          { name: 'Sports Bike Rental', emoji: '🏍️', slug: 'sports-bike', desc: 'Rent sports bikes and cruisers for road trips' },
          { name: 'Camera Rental', emoji: '🎥', slug: 'camera', desc: 'Rent high-end DSLRs, mirrorless cameras, and lenses' },
          { name: 'Sound System Rental', emoji: '🔊', slug: 'sound-system', desc: 'Rent audio systems, mics, and mixers' },
          { name: 'Event Equipment Rental', emoji: '🪑', slug: 'event-equip', desc: 'Rent stage setups, chairs, tents, and projectors' },
        ]
      }
    ],
  },
  'personal-misc': {
    name: 'Personal Services', emoji: '🐶', gradient: 'from-red-500 to-rose-600',
    desc: 'Grooming, elder care, babysitting, and event planning specialists',
    sections: [
      {
        subheading: 'Personal Services',
        categories: [
          { name: 'Pet Grooming Appointment', emoji: '🐶', slug: 'pet-grooming', desc: 'Book professional grooming, spa, and check-ups for pets' },
          { name: 'Babysitting Service', emoji: '🍼', slug: 'babysitting', desc: 'Book experienced babysitters and nannies' },
          { name: 'Elder Care Service', emoji: '👴', slug: 'elder-care', desc: 'Book elder care services, medical check-ups, and support' },
          { name: 'Event Organizer Booking', emoji: '🎂', slug: 'event-organizer', desc: 'Book event planners, birthday organizers, and decorators' },
        ]
      }
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const bookingType = params?.bookingType as string;
  const { city } = useLocationStore();
  const data = CATEGORY_DATA[bookingType];

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <Link href="/" className="btn-primary mt-4 inline-flex">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 pt-[98px] lg:pt-[104px]">
      {/* Hero banner */}
      <section>
        <div className={`bg-gradient-to-br ${data.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Inline Breadcrumb */}
          <div className="container-main relative z-10 pt-2 pb-1.5 flex items-center gap-4">
            <Link href="/categories" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
              <ChevronRight size={14} opacity={0.6} />
              <span className="text-white font-bold">{data.name}</span>
            </div>
          </div>

          <div className="container-main relative z-10 py-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-start gap-4 mb-2">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-3">{data.name}</h1>
                  <p className="text-white/80 text-sm md:text-base max-w-xl leading-snug">{data.desc}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-white/70 text-xs font-semibold">
                    <MapPin size={12} />
                    <span>Showing providers near {city}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subcategories sections */}
      <section className="py-12">
        <div className="container-main space-y-12">
          {data.sections.map((section, sIdx) => (
            <div key={section.subheading} className="space-y-5">
              <h2 className="text-lg font-black text-[color:var(--color-on-surface)] border-b border-[color:var(--color-outline-variant)]/20 pb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                {section.subheading}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.categories.map((cat, i) => (
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sIdx * 4 + i) * 0.05 }}
                  >
                    <Link href={`/${bookingType}/${cat.slug}`}>
                      <div className="group flex flex-col justify-between rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/30 hover:bg-[color:var(--color-surface-container-high)] p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[color:var(--color-primary)]/30 w-full h-full">
                        <div>
                          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm origin-bottom-left">
                            {cat.emoji}
                          </div>
                          <h3 className="font-extrabold text-[14px] text-[color:var(--color-on-surface)] group-hover:text-[color:var(--color-primary)] transition-colors mb-1">
                            {cat.name}
                          </h3>
                          <p className="text-[12px] text-[color:var(--color-on-surface-variant)] leading-snug">
                            {cat.desc}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <span>Find nearby</span>
                          <ChevronRight size={12} strokeWidth={3} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
