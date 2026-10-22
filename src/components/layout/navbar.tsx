'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Bell, User, Calendar, MapPin, Heart } from 'lucide-react';
import { useUserStore } from '../../lib/store';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useUserStore(state => state.user);

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profile" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
              β
            </div>
          )}
          <span className="text-xl font-bold gradient-text hidden sm:block">BETA</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search services, venues, merchants..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/search" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            Explore
          </Link>
          <Link href="/maps" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-1">
            <MapPin className="h-4 w-4" /> Nearby
          </Link>
          <Link href="/bookings" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-1">
            <Calendar className="h-4 w-4" /> My Bookings
          </Link>
          <button className="relative rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <Link href="/profile" className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity overflow-hidden">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              'U'
            )}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 hover:bg-[var(--bg-tertiary)]">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)]"
          >
            <div className="px-4 py-4 space-y-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input type="text" placeholder="Search..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-4 text-sm outline-none" />
              </div>
              {[
                { href: '/search', icon: Search, label: 'Explore' },
                { href: '/maps', icon: MapPin, label: 'Nearby' },
                { href: '/booking', icon: Calendar, label: 'My Bookings' },
                { href: '/profile', icon: User, label: 'Profile' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
