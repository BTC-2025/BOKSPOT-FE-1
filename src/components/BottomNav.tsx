'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',           icon: 'home',      label: 'Home'       },
  { href: '/categories', icon: 'grid_view', label: 'Categories' },
  { href: '/bookings',   icon: 'calendar_month', label: 'Bookings'   },
  { href: '/profile',    icon: 'person',       label: 'Profile'    },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 lg:hidden
                 border-t border-[color:var(--color-outline-variant)]/40
                 backdrop-blur-2xl"
      style={{
        background: 'color-mix(in srgb, var(--color-surface-dim) 92%, transparent)',
        boxShadow: '0 -1px 0 color-mix(in srgb, var(--color-primary) 12%, transparent), 0 -8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex justify-around items-center h-[66px] max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? (pathname === '/' || pathname === '/home' || pathname.startsWith('/home/'))
            : item.href === '/booking'
              ? (pathname === '/booking' || pathname === '/bookings' || pathname === '/tracks' || pathname.startsWith('/booking/') || pathname.startsWith('/split'))
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5
                         py-2 px-5 rounded-2xl transition-all duration-300
                         ${isActive
                           ? 'text-[color:var(--color-primary)]'
                           : 'text-[color:var(--color-outline)] hover:text-[color:var(--color-on-surface-variant)]'
                         }`}
            >
              {/* Active: neon gold glow pill at top */}
              {isActive && (
                <span
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #FFE066, #FFD700, #FFA500)',
                    boxShadow: '0 0 10px rgba(255,215,0,0.7), 0 0 24px rgba(255,215,0,0.3)',
                  }}
                />
              )}

              {/* Icon */}
              <span
                className={`material-symbols-outlined text-[24px] transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span className="text-[10px] font-semibold tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
