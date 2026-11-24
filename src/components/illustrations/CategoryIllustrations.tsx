import React from 'react';

// ============================================================================
// BOKSPOT PREMIUM 3D / DUOTONE VECTOR ILLUSTRATIONS
// Custom crafted vector artwork with realistic lighting, depth, highlights,
// and soft gradient shadows specifically engineered for high-end SaaS UX.
// ============================================================================

export function IllustrationAllServices({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="all-glow" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8A00" />
          <stop offset="1" stopColor="#FF4500" />
        </linearGradient>
        <linearGradient id="cube-top" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFB370" />
          <stop offset="1" stopColor="#FF7A1A" />
        </linearGradient>
        <linearGradient id="cube-side" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#E64A00" />
          <stop offset="1" stopColor="#B33600" />
        </linearGradient>
        <filter id="shadow-all" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#FF6325" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* 3D Isometric / Matrix Grid Layout */}
      <rect x="6" y="6" width="15" height="15" rx="4.5" fill="url(#all-glow)" filter="url(#shadow-all)" />
      <rect x="7" y="7" width="13" height="5" rx="2.5" fill="url(#cube-top)" opacity="0.8" />
      <circle cx="13.5" cy="13.5" r="2.5" fill="#FFFFFF" opacity="0.9" />

      <rect x="27" y="6" width="15" height="15" rx="4.5" fill="url(#all-glow)" filter="url(#shadow-all)" />
      <rect x="28" y="7" width="13" height="5" rx="2.5" fill="url(#cube-top)" opacity="0.8" />
      <circle cx="34.5" cy="13.5" r="2.5" fill="#FFFFFF" opacity="0.9" />

      <rect x="6" y="27" width="15" height="15" rx="4.5" fill="url(#all-glow)" filter="url(#shadow-all)" />
      <rect x="7" y="28" width="13" height="5" rx="2.5" fill="url(#cube-top)" opacity="0.8" />
      <circle cx="13.5" cy="34.5" r="2.5" fill="#FFFFFF" opacity="0.9" />

      <rect x="27" y="27" width="15" height="15" rx="4.5" fill="url(#all-glow)" filter="url(#shadow-all)" />
      <rect x="28" y="28" width="13" height="5" rx="2.5" fill="url(#cube-top)" opacity="0.8" />
      <circle cx="34.5" cy="34.5" r="2.5" fill="#FFFFFF" opacity="0.9" />

      {/* Central Sparkle */}
      <path d="M24 19L25.2 22.8L29 24L25.2 25.2L24 29L22.8 25.2L19 24L22.8 22.8L24 19Z" fill="#FFF4E6" />
    </svg>
  );
}

export function IllustrationTravel({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="plane-body" x1="12" y1="12" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="wing-top" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#93C5FD" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="cloud-glow" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#E0F2FE" />
          <stop offset="1" stopColor="#BAE6FD" />
        </linearGradient>
        <filter id="shadow-plane" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#2563EB" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Dynamic Flight Cloud Backdrop */}
      <path d="M8 36C8 33 11 31 14 31C15 28 18 26 22 26C27 26 29 29 30 32C32 32 34 33.5 34 36C34 38 32 40 30 40H14C10.5 40 8 38 8 36Z" fill="url(#cloud-glow)" opacity="0.75" />
      {/* 3D Modern Jet Airliner */}
      <g filter="url(#shadow-plane)">
        {/* Fuselage */}
        <path d="M38 10C40 8 41 8 41 10C41 13 36 24 30 30L26 40L23 38L25 31L18 25L13 27L11 25L15 20L23 20L31 13C35 9 37 9 38 10Z" fill="url(#plane-body)" />
        {/* Upper Wing with Lighting Depth */}
        <path d="M23 20L34 7C35.5 5.5 38 6.5 37 9L29 22L23 20Z" fill="url(#wing-top)" />
        {/* Underwing Jet Engine */}
        <rect x="20" y="24" width="6" height="3" rx="1.5" fill="#1E3A8A" />
        {/* Cockpit Window */}
        <path d="M37 11L38.5 12.5C39 13 38.5 14 37.5 14L35.5 13L37 11Z" fill="#E0F2FE" />
      </g>
      {/* Contrail Speed Lines */}
      <circle cx="8" cy="33" r="1.5" fill="#38BDF8" opacity="0.6" />
      <circle cx="5" cy="36" r="1" fill="#38BDF8" opacity="0.4" />
    </svg>
  );
}

export function IllustrationStay({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="headboard" x1="6" y1="16" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="quilt" x1="10" y1="26" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="pillow" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="lamp-shade" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#EAB308" />
        </linearGradient>
        <filter id="shadow-stay" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Cozy Lamp on Bedside Stand */}
      <path d="M35 15L41 15L39.5 21L36.5 21L35 15Z" fill="url(#lamp-shade)" />
      <circle cx="38" cy="18" r="4.5" fill="#FEF08A" opacity="0.4" filter="blur(2px)" />
      <line x1="38" y1="21" x2="38" y2="28" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="34" y="27" width="8" height="9" rx="2" fill="#C7D2FE" />
      {/* 3D King Bed */}
      <g filter="url(#shadow-stay)">
        {/* Headboard */}
        <rect x="6" y="16" width="26" height="20" rx="3.5" fill="url(#headboard)" />
        {/* Pillows */}
        <rect x="9" y="20" width="8" height="6" rx="2" fill="url(#pillow)" />
        <rect x="19" y="20" width="8" height="6" rx="2" fill="url(#pillow)" />
        {/* Mattress Base & Luxury Folded Quilt */}
        <rect x="6" y="25" width="28" height="13" rx="3" fill="#EEF2FF" />
        <path d="M6 28C6 26.5 7.5 25.5 9 25.5H31C32.5 25.5 34 26.5 34 28V37C34 38 33 39 32 39H8C7 39 6 38 6 37V28Z" fill="url(#quilt)" />
        {/* Fold detail */}
        <path d="M6 28C8 29.5 12 30.5 20 30.5C28 30.5 32 29.5 34 28" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
        {/* Bed Legs */}
        <rect x="7" y="38" width="2.5" height="4" rx="1" fill="#312E81" />
        <rect x="31" y="38" width="2.5" height="4" rx="1" fill="#312E81" />
      </g>
    </svg>
  );
}

export function IllustrationSports({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bat-wood" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ball-red" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F87171" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <filter id="shadow-sports" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#059669" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#shadow-sports)">
        {/* 3D Soccer Football */}
        <circle cx="18" cy="28" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
        {/* Soccer Pentagons */}
        <polygon points="18,24 21,26.5 20,30 16,30 15,26.5" fill="#0F172A" />
        <path d="M18 24L18 20" stroke="#0F172A" strokeWidth="1.2" />
        <path d="M21 26.5L25 25" stroke="#0F172A" strokeWidth="1.2" />
        <path d="M20 30L23 34" stroke="#0F172A" strokeWidth="1.2" />
        <path d="M16 30L13 34" stroke="#0F172A" strokeWidth="1.2" />
        <path d="M15 26.5L11 25" stroke="#0F172A" strokeWidth="1.2" />
        {/* Ball 3D Lighting Highlight */}
        <circle cx="14" cy="24" r="3.5" fill="#FFFFFF" opacity="0.6" filter="blur(1px)" />

        {/* Cricket Bat (Trophy Diagonal) */}
        <g transform="rotate(-35 32 20)">
          {/* Bat Handle & Grip */}
          <rect x="30.5" y="4" width="3" height="10" rx="1.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.5" />
          <line x1="30.5" y1="7" x2="33.5" y2="7" stroke="#FFFFFF" strokeWidth="0.8" />
          <line x1="30.5" y1="10" x2="33.5" y2="10" stroke="#FFFFFF" strokeWidth="0.8" />
          {/* Bat Blade */}
          <path d="M29 14C29 13.5 30 13 32 13C34 13 35 13.5 35 14V34C35 35.5 33.5 36.5 32 36.5C30.5 36.5 29 35.5 29 34V14Z" fill="url(#bat-wood)" />
          {/* Sweetspot ridge */}
          <line x1="32" y1="16" x2="32" y2="33" stroke="#B45309" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Red Cricket Ball with Seam */}
        <circle cx="36" cy="33" r="5" fill="url(#ball-red)" />
        <path d="M33 30.5C34.5 32 37.5 34 39 35.5" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="1 1" />
      </g>
    </svg>
  );
}

export function IllustrationEntertainment({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="clapper-body" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#475569" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="popcorn-tub" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#BE123C" />
        </linearGradient>
        <filter id="shadow-ent" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#E11D48" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#shadow-ent)">
        {/* Cinema Clapperboard */}
        <rect x="6" y="14" width="22" height="18" rx="3" fill="url(#clapper-body)" />
        <rect x="6" y="9" width="22" height="6" rx="2" fill="#1E293B" />
        {/* Slanted Stripes */}
        <path d="M9 9L12 15H15L12 9H9Z" fill="#FFFFFF" />
        <path d="M17 9L20 15H23L20 9H17Z" fill="#FFFFFF" />
        <circle cx="17" cy="23" r="2.5" fill="#E2E8F0" opacity="0.8" />
        <line x1="10" y1="27" x2="24" y2="27" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />

        {/* 3D Striped Popcorn Tub */}
        <path d="M26 22L29 40H41L44 22H26Z" fill="url(#popcorn-tub)" />
        {/* White vertical stripes */}
        <path d="M30 22L32 40H35L33 22H30Z" fill="#FFFFFF" />
        <path d="M37 22L38 40H41L40 22H37Z" fill="#FFFFFF" />
        {/* Fluffy Butter Popcorn on top */}
        <circle cx="29" cy="20" r="3" fill="#FDE047" />
        <circle cx="34" cy="18" r="3.5" fill="#FEF08A" />
        <circle cx="39" cy="19" r="3.2" fill="#FDE047" />
        <circle cx="32" cy="21" r="2.8" fill="#FACC15" />
        <circle cx="37" cy="22" r="2.5" fill="#EAB308" />
      </g>
    </svg>
  );
}

export function IllustrationSpa({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="zen-stone1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#64748B" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="zen-stone2" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#475569" />
          <stop offset="1" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="lotus-petal" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
        <filter id="shadow-spa" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#0D9488" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#shadow-spa)">
        {/* Zen Meditation Stacked River Stones */}
        <ellipse cx="19" cy="36" rx="13" ry="5.5" fill="url(#zen-stone1)" />
        <ellipse cx="19" cy="29" rx="10" ry="4.5" fill="url(#zen-stone2)" />
        <ellipse cx="19" cy="23" rx="7" ry="3.5" fill="url(#zen-stone1)" />
        {/* Soft highlight reflections */}
        <ellipse cx="18" cy="22" rx="4" ry="1.5" fill="#94A3B8" opacity="0.6" />
        <ellipse cx="17" cy="28" rx="6" ry="1.8" fill="#94A3B8" opacity="0.5" />

        {/* Blooming Pink Lotus Flower & Frangipani */}
        <g transform="translate(18, 12)">
          {/* Petals */}
          <path d="M12 18C12 12 7 10 7 10C7 10 2 12 2 18C2 22 7 24 7 24C7 24 12 22 12 18Z" fill="url(#lotus-petal)" />
          <path d="M17 19C17 15 13 13 13 13C13 13 9 15 9 19C9 23 13 24 13 24C13 24 17 23 17 19Z" fill="#F43F5E" opacity="0.8" />
          <path d="M5 19C5 15 1 13 1 13C1 13 -3 15 -3 19C-3 23 1 24 1 24C1 24 5 23 5 19Z" fill="#FB7185" opacity="0.8" />
          {/* Golden Center */}
          <circle cx="7" cy="19" r="2.2" fill="#FDE047" />
        </g>
        {/* Fresh Green Bamboo Sprig */}
        <path d="M37 13C34 16 33 21 33 25" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 17C37 15 41 15 41 15C41 15 40 19 37 19" fill="#34D399" />
        <path d="M34 22C36 21 39 22 39 22C39 22 38 25 35 25" fill="#34D399" />
      </g>
    </svg>
  );
}

export function IllustrationCoworking({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="macbook-screen" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="chair-cushion" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <filter id="shadow-cowork" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#7C3AED" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#shadow-cowork)">
        {/* Modern Wooden Desk Tabletop */}
        <rect x="6" y="27" width="36" height="3.5" rx="1.5" fill="#D97706" />
        <rect x="8" y="30.5" width="2" height="11" rx="1" fill="#78350F" />
        <rect x="38" y="30.5" width="2" height="11" rx="1" fill="#78350F" />

        {/* Ergonomic Office Chair */}
        <rect x="20" y="19" width="8" height="9" rx="2" fill="url(#chair-cushion)" />
        <rect x="18" y="28" width="12" height="3" rx="1.5" fill="#4338CA" />
        <line x1="24" y1="31" x2="24" y2="38" stroke="#64748B" strokeWidth="2" />
        <path d="M20 38L24 38L28 38" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

        {/* Laptop with Radiant Display */}
        <rect x="14" y="15" width="12" height="8" rx="1.5" fill="url(#macbook-screen)" stroke="#0F172A" strokeWidth="1" />
        <rect x="12" y="23" width="16" height="2" rx="1" fill="#94A3B8" />
        <path d="M19 18L21 20" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

        {/* Desk Plant in Terracotta Pot */}
        <rect x="33" y="23" width="4" height="4" rx="1" fill="#EA580C" />
        <circle cx="35" cy="20" r="2.5" fill="#22C55E" />
        <circle cx="33" cy="21" r="2" fill="#16A34A" />
      </g>
    </svg>
  );
}

export function IllustrationDarshan({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="temple-gold" x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.4" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="temple-saffron" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFedd5" />
          <stop offset="1" stopColor="#FDBA74" />
        </linearGradient>
        <filter id="shadow-temple" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#EA580C" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Sacred Sun Aura Glow */}
      <circle cx="24" cy="20" r="14" fill="#FEF08A" opacity="0.4" filter="blur(3px)" />
      {/* Detailed Dravidian Gopuram / Sanctum Temple */}
      <g filter="url(#shadow-temple)">
        {/* Kalasam Peak */}
        <path d="M24 7L25.5 10H22.5L24 7Z" fill="#FEF08A" />
        <circle cx="24" cy="6" r="1.5" fill="#F59E0B" />

        {/* Tier 1 - Top Sanctum */}
        <path d="M20 10H28L29 14H19L20 10Z" fill="url(#temple-gold)" />
        {/* Tier 2 */}
        <path d="M17 14H31L33 19H15L17 14Z" fill="url(#temple-gold)" />
        <rect x="22.5" y="15" width="3" height="3" rx="0.5" fill="#78350F" />
        {/* Tier 3 */}
        <path d="M14 19H34L36 26H12L14 19Z" fill="url(#temple-gold)" />
        <circle cx="19" cy="22.5" r="1.2" fill="#78350F" />
        <circle cx="24" cy="22.5" r="1.2" fill="#78350F" />
        <circle cx="29" cy="22.5" r="1.2" fill="#78350F" />

        {/* Main Base Pillars & Holy Sanctum Gateway */}
        <rect x="10" y="26" width="28" height="14" rx="2" fill="url(#temple-gold)" />
        {/* Sanctum Garbhagriha Archway */}
        <path d="M19 40V32C19 29.5 21 28 24 28C27 28 29 29.5 29 32V40H19Z" fill="#78350F" />
        {/* Diya Lamp Glow inside */}
        <circle cx="24" cy="34" r="2.2" fill="#FDE047" />
        <path d="M24 31C24.5 32 25 33 24 34C23 33 23.5 32 24 31Z" fill="#EF4444" />

        {/* Temple Base Steps */}
        <rect x="7" y="40" width="34" height="2.5" rx="1" fill="#B45309" />
      </g>
    </svg>
  );
}

export function IllustrationRentals({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bike-frame" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#06B6D4" />
          <stop offset="1" stopColor="#0E7490" />
        </linearGradient>
        <filter id="shadow-rent" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#0891B2" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#shadow-rent)">
        {/* Back Wheel */}
        <circle cx="13" cy="31" r="7" stroke="#334155" strokeWidth="2.5" fill="#F8FAFC" />
        <circle cx="13" cy="31" r="2" fill="#0891B2" />
        {/* Spokes */}
        <line x1="13" y1="24" x2="13" y2="38" stroke="#94A3B8" strokeWidth="0.8" />
        <line x1="6" y1="31" x2="20" y2="31" stroke="#94A3B8" strokeWidth="0.8" />

        {/* Front Wheel */}
        <circle cx="35" cy="31" r="7" stroke="#334155" strokeWidth="2.5" fill="#F8FAFC" />
        <circle cx="35" cy="31" r="2" fill="#0891B2" />
        {/* Spokes */}
        <line x1="35" y1="24" x2="35" y2="38" stroke="#94A3B8" strokeWidth="0.8" />
        <line x1="28" y1="31" x2="42" y2="31" stroke="#94A3B8" strokeWidth="0.8" />

        {/* Lightweight Sports Cycle Frame */}
        {/* Chainstay */}
        <line x1="13" y1="31" x2="23" y2="31" stroke="url(#bike-frame)" strokeWidth="2" strokeLinecap="round" />
        {/* Seat tube */}
        <line x1="23" y1="31" x2="19" y2="18" stroke="url(#bike-frame)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Seat Stays */}
        <line x1="13" y1="31" x2="19" y2="18" stroke="url(#bike-frame)" strokeWidth="1.8" strokeLinecap="round" />
        {/* Down tube */}
        <line x1="23" y1="31" x2="31" y2="19" stroke="url(#bike-frame)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Top tube */}
        <line x1="19" y1="18" x2="31" y2="19" stroke="url(#bike-frame)" strokeWidth="2" strokeLinecap="round" />
        {/* Fork */}
        <line x1="31" y1="19" x2="35" y2="31" stroke="url(#bike-frame)" strokeWidth="2" strokeLinecap="round" />

        {/* Saddle Seat */}
        <path d="M15 17C17 17 21 17 22 18L18 19L15 17Z" fill="#0F172A" />
        {/* Handlebars */}
        <path d="M30 14L32 18H34" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        {/* Pedal Gear */}
        <circle cx="23" cy="31" r="3" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function IllustrationPersonalServices({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="paw-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#E879F9" />
          <stop offset="1" stopColor="#C026D3" />
        </linearGradient>
        <linearGradient id="heart-glow" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>
        <filter id="shadow-paw" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#C026D3" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#shadow-paw)">
        {/* Big Central Paw Pad with 3D Depth */}
        <path d="M22 25C17 25 14 29 16 34C18 38 26 38 28 34C30 29 27 25 22 25Z" fill="url(#paw-gradient)" />
        <ellipse cx="22" cy="29" rx="5" ry="2" fill="#FFFFFF" opacity="0.3" />

        {/* 4 Rounded Toe Beans */}
        <ellipse cx="14" cy="22" rx="3" ry="4" transform="rotate(-20 14 22)" fill="url(#paw-gradient)" />
        <ellipse cx="19" cy="17" rx="3.2" ry="4.2" transform="rotate(-5 19 17)" fill="url(#paw-gradient)" />
        <ellipse cx="26" cy="17" rx="3.2" ry="4.2" transform="rotate(5 26 17)" fill="url(#paw-gradient)" />
        <ellipse cx="31" cy="22" rx="3" ry="4" transform="rotate(20 31 22)" fill="url(#paw-gradient)" />

        {/* Loving Care Heart Badge */}
        <path d="M36 29C34 27 31 28 31 30.5C31 33.5 35 37 36 37C37 37 41 33.5 41 30.5C41 28 38 27 36 29Z" fill="url(#heart-glow)" />
      </g>
    </svg>
  );
}

