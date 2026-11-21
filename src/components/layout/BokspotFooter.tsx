'use client';

import React from 'react';
import Link from 'next/link';

export function BokspotFooter() {
  return (
    <footer className="w-full mt-20 bg-[#eef3f8] dark:bg-[#0c121e] border-t border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      
      {/* ── TOP SECTION: BRAND IDENTITY, 9-CATEGORY DISCOVERY MAP & GLASS APP BADGES ── */}
      <div className="w-full px-6 sm:px-10 lg:px-16 pt-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Brand Logo & Mission Statement */}
          <div className="lg:col-span-4 space-y-3.5">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <img
                src="/logo.png?v=3"
                alt="BOKSPOT"
                className="h-10 sm:h-12 object-contain"
              />
            </Link>
            
            <h3 className="text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              One Spot. Every Experience.
            </h3>
            
            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-sm">
              Discover, connect, and instantly book verified slots across stays, sports, events, and everyday services.
            </p>
          </div>

          {/* Center: Futuristic 9-Category Discovery Network Map with Borderless Bokspot Logo Hub */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 self-start sm:self-center">
              Discovery Map
            </div>
            
            <div className="relative w-full max-w-[440px] h-[165px] flex items-center justify-center">
              {/* Subtle world mesh background */}
              <svg className="absolute inset-0 w-full h-full opacity-25 dark:opacity-15 text-slate-400 pointer-events-none" viewBox="0 0 440 165" fill="none">
                <path d="M30 80 Q110 20 220 80 T410 80" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M40 130 Q160 50 270 130 T420 120" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                <circle cx="65" cy="50" r="1.5" fill="currentColor" />
                <circle cx="130" cy="35" r="1.5" fill="currentColor" />
                <circle cx="310" cy="45" r="1.5" fill="currentColor" />
                <circle cx="375" cy="100" r="1.5" fill="currentColor" />
              </svg>

              {/* Connecting network lines to central BokSpot logo node (hub is at x=220, y=82) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 440 165">
                {/* 1. Stays */}
                <line x1="55" y1="42" x2="220" y2="82" stroke="#ff6325" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="2 3" />
                {/* 2. Travel */}
                <line x1="135" y1="26" x2="220" y2="82" stroke="#0A3161" strokeWidth="1.2" strokeOpacity="0.35" />
                {/* 3. Darshan */}
                <line x1="220" y1="20" x2="220" y2="82" stroke="#ff6325" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="2 3" />
                {/* 4. Entertainment */}
                <line x1="305" y1="26" x2="220" y2="82" stroke="#0A3161" strokeWidth="1.2" strokeOpacity="0.35" />
                {/* 5. Dining */}
                <line x1="385" y1="42" x2="220" y2="82" stroke="#ff6325" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="2 3" />
                {/* 6. Sports */}
                <line x1="60" y1="128" x2="220" y2="82" stroke="#0A3161" strokeWidth="1.2" strokeOpacity="0.35" />
                {/* 7. Wellness */}
                <line x1="145" y1="142" x2="220" y2="82" stroke="#ff6325" strokeWidth="1.2" strokeOpacity="0.45" />
                {/* 8. Rentals */}
                <line x1="295" y1="142" x2="220" y2="82" stroke="#ff6325" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="2 3" />
                {/* 9. Personal */}
                <line x1="380" y1="128" x2="220" y2="82" stroke="#0A3161" strokeWidth="1.2" strokeOpacity="0.35" />
              </svg>

              {/* ── 9 OFFICIAL CATEGORY NODES ── */}
              
              {/* Node 1: Stay & Accommodation */}
              <div className="absolute top-2 left-4 flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#ff6325] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-[#ff6325]">hotel</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Stays</span>
              </div>

              {/* Node 2: Travel & Transport */}
              <div className="absolute top-0 left-[26%] flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#0A3161] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-[#0A3161] dark:text-blue-400">flight</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Travel</span>
              </div>

              {/* Node 3: Religious & Darshan */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#ff6325] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-amber-500">temple_hindu</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Darshan</span>
              </div>

              {/* Node 4: Entertainment & Events */}
              <div className="absolute top-0 right-[25%] flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#0A3161] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-indigo-500">movie</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Movies</span>
              </div>

              {/* Node 5: Dining & Restaurants */}
              <div className="absolute top-2 right-4 flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#ff6325] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-[#ff6325]">restaurant</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Dining</span>
              </div>

              {/* Central BOKSPOT Hub Node: PURE CLEAN LOGO ONLY (NO BORDER, NO BOX CONTAINER) */}
              <div className="z-10 hover:scale-108 transition-transform cursor-pointer filter drop-shadow-sm flex items-center justify-center">
                <img
                  src="/logo.png?v=3"
                  alt="BOKSPOT"
                  className="h-7 sm:h-8 object-contain pointer-events-none select-none"
                />
              </div>

              {/* Node 6: Sports & Turf */}
              <div className="absolute bottom-1 left-5 flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#0A3161] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-[#0A3161] dark:text-blue-400">sports_soccer</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Sports</span>
              </div>

              {/* Node 7: Lifestyle & Wellness */}
              <div className="absolute bottom-0 left-[28%] flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#ff6325] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-emerald-500">spa</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Wellness</span>
              </div>

              {/* Node 8: Equipment Rentals */}
              <div className="absolute bottom-0 right-[27%] flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#0A3161] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-teal-600">pedal_bike</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Rentals</span>
              </div>

              {/* Node 9: Personal Services */}
              <div className="absolute bottom-1 right-5 flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:border-[#ff6325] transition-all">
                  <span className="material-symbols-outlined text-[15px] text-[#ff6325]">pets</span>
                </div>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Personal</span>
              </div>

            </div>
          </div>

          {/* Right: Premium Dark Smoked Glass Apple App Store & Google Play Badges (Exact Screenshot Match) */}
          <div className="lg:col-span-3 flex flex-row items-center justify-start lg:justify-end gap-2.5">
            {/* Apple App Store Dark Glass Badge */}
            <a
              href="#app-store"
              onClick={(e) => { e.preventDefault(); alert('BOKSPOT iOS App arriving soon on Apple App Store!'); }}
              className="h-[44px] px-3.5 rounded-[13px] bg-[#1c1d22]/85 hover:bg-[#25262c] text-white active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.35)] cursor-pointer border border-white/20 backdrop-blur-md flex items-center gap-2.5 shrink-0 group"
              title="Download on the App Store"
            >
              <svg className="w-[23px] h-[23px] fill-current text-white shrink-0 group-hover:scale-105 transition-transform -mt-0.5" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.08 1.73-.95 2.76 1.01.08 2.05-.51 2.67-1.26z" />
              </svg>
              <div className="text-left leading-tight">
                <span className="text-[8px] uppercase tracking-wider text-slate-300/80 font-medium block">Download on the</span>
                <span className="text-[12px] font-bold tracking-tight text-white block whitespace-nowrap">App Store</span>
              </div>
            </a>

            {/* Google Play Dark Glass Badge */}
            <a
              href="#google-play"
              onClick={(e) => { e.preventDefault(); alert('BOKSPOT Android App arriving soon on Google Play Store!'); }}
              className="h-[44px] px-3.5 rounded-[13px] bg-[#1c1d22]/85 hover:bg-[#25262c] text-white active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.35)] cursor-pointer border border-white/20 backdrop-blur-md flex items-center gap-2.5 shrink-0 group"
              title="Get it on Google Play"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 512 512">
                <path fill="#4285F4" d="M32.3 18.2C29.6 21.1 28 25.6 28 31.4v449.2c0 5.8 1.6 10.3 4.3 13.2l1.5 1.5 251.6-251.6v-5.8L33.8 16.7l-1.5 1.5z"/>
                <path fill="#FBBC04" d="M368.5 329.8l-83.1-83.1v-5.8l83.1-83.1 1.9 1.1 98.4 55.9c28.1 16 28.1 42.1 0 58.1l-98.4 55.8-1.9 1.1z"/>
                <path fill="#EA4335" d="M285.4 246.7L33.8 495.3c9.3 9.8 24.5 11 41.5 1.4l293.2-166.9-83.1-83.1z"/>
                <path fill="#34A853" d="M285.4 240.9l83.1-83.1L75.3 1.4C58.3-8.2 43.1-7 33.8 2.8l251.6 238.1z"/>
              </svg>
              <div className="text-left leading-tight">
                <span className="text-[8px] uppercase tracking-wider text-slate-300/80 font-medium block">GET IT ON</span>
                <span className="text-[12px] font-bold tracking-tight text-white block whitespace-nowrap">Google Play</span>
              </div>
            </a>
          </div>

        </div>
      </div>

      <div className="w-full border-t border-slate-200/90 dark:border-slate-800" />

      {/* ── 5-COLUMN STRUCTURED NAVIGATION GRID ── */}
      <div className="w-full px-6 sm:px-10 lg:px-16 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
          
          {/* Column 1: Explore (All 9 Core Categories as configured) */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Explore
            </h4>
            <ul className="space-y-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
              {[
                { label: 'Stay & Accommodation', href: '/stay-accommodation' },
                { label: 'Sports & Turf', href: '/sports-turf' },
                { label: 'Entertainment & Events', href: '/entertainment-events' },
                { label: 'Dining & Restaurants', href: '/lifestyle-local/dining' },
                { label: 'Travel & Transport', href: '/travel-transport' },
                { label: 'Lifestyle & Wellness', href: '/lifestyle-local' },
                { label: 'Religious & Darshan', href: '/religious-government' },
                { label: 'Equipment Rentals', href: '/rental-equipment' },
                { label: 'Personal Services', href: '/personal-misc' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#ff6325] dark:hover:text-[#ff6325] transition-colors block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Customer Zone */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Customer Zone
            </h4>
            <ul className="space-y-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
              {[
                { label: 'My Bookings', href: '/bookings' },
                { label: 'Booking History', href: '/bookings' },
                { label: 'Cancellation & Refunds', href: '/support' },
                { label: 'Help Centre', href: '/support' },
                { label: 'FAQs', href: '/support' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#ff6325] dark:hover:text-[#ff6325] transition-colors block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Business Partners */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Business Partners
            </h4>
            <ul className="space-y-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
              {[
                { label: 'List Your Business', href: '/vendor/register' },
                { label: 'Partner Dashboard', href: '/vendor/register' },
                { label: 'Business Solutions', href: '/vendor/register' },
                { label: 'Partner Support', href: '/support' },
                { label: 'Become a Partner', href: '/vendor/register' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#ff6325] dark:hover:text-[#ff6325] transition-colors block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Company
            </h4>
            <ul className="space-y-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
              {[
                { label: 'About Bokspot', href: '/about' },
                { label: 'Contact Us', href: '/support' },
                { label: 'Privacy Policy', href: '/support' },
                { label: 'Terms & Conditions', href: '/support' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#ff6325] dark:hover:text-[#ff6325] transition-colors block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Support */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Support
            </h4>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              24/7 Customer Assistance
            </p>
            <div className="pt-1">
              <Link
                href="/support"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#ff6325] hover:bg-[#ea580c] active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Live Chat CTA
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── HIGH-IMPACT PROMO RIBBON (NAVY BLUE BAR WITH ORANGE CTA) - FULL WIDTH ── */}
      <div className="w-full bg-[#0A3161] py-4 px-6 sm:px-10 lg:px-16">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white text-base sm:text-lg font-bold tracking-tight text-center sm:text-left">
            Grow Your Business with Bokspot. Reach millions of active bookers.
          </p>
          <Link
            href="/vendor/register"
            className="px-6 py-2 rounded-xl bg-[#ff6325] hover:bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            Partner With Us
          </Link>
        </div>
      </div>

      {/* ── BOTTOM UTILITY BAR: SOCIAL, INDIA LOCALE & OFFICIAL COPYRIGHT ── */}
      <div className="w-full px-6 sm:px-10 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        
        {/* Social Icons */}
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
          {/* LinkedIn */}
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0A3161] dark:hover:text-blue-400 transition-colors" title="LinkedIn">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.76v8.37H6.46v-8.37M7.84 6.2a1.61 1.61 0 1 0 0 3.22 1.61 1.61 0 0 0 0-3.22z"/>
            </svg>
          </a>
          {/* Twitter / X */}
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0A3161] dark:hover:text-blue-400 transition-colors" title="Twitter / X">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff6325] transition-colors" title="Instagram">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0A3161] dark:hover:text-blue-400 transition-colors" title="Facebook">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>

        {/* Right: India Currency/Locale & Real Official Entity Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-right">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <span>🇮🇳</span>
            <span>India (EN)</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>INR (₹)</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
          <div className="font-semibold text-slate-600 dark:text-slate-400">
            &copy; 2026 BETA SOFTNET (OPC) PRIVATE LIMITED &bull; TIRUVALLUR, INDIA
          </div>
        </div>

      </div>

    </footer>
  );
}
