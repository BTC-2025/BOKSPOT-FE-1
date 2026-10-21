'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Camera, Bell, Shield, LogOut, 
  Award, Sparkles, Check, CheckCircle2, Sliders, ShieldCheck, Heart, MapPin,
  Headphones, Settings, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useUserStore, useUIStore } from '../../lib/store';
import { compressImage } from '../../lib/imageUtils';
import { BokspotLoader } from '../../components/ui/BokspotLoader';

const AVATAR_PRESETS = [
  { id: 'jetsetter', label: 'Jetsetter', emoji: '✈️', color: 'from-amber-400 to-yellow-600' },
  { id: 'executive', label: 'Executive', emoji: '💼', color: 'from-blue-500 to-indigo-600' },
  { id: 'creative', label: 'Creative', emoji: '🎨', color: 'from-pink-500 to-rose-600' },
  { id: 'explorer', label: 'Explorer', emoji: '🧗', color: 'from-emerald-400 to-teal-600' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useUserStore();
  const { theme, setTheme } = useUIStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('jetsetter');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Preference Settings
  const [seatPref, setSeatPref] = useState('Window');
  const [dietaryPref, setDietaryPref] = useState('Vegetarian');
  const [travelClass, setTravelClass] = useState('First Class');

  // Toggle checks
  const [promoEmails, setPromoEmails] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // Action status
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state once user mounts
  useEffect(() => {
    if (mounted) {
      if (!user) {
        router.push('/login');
        return;
      }
      setUsername(user.username || '');
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatar(user.avatarPreset || 'jetsetter');
      setProfilePhoto(user.profilePhoto || null);

      if (user.preferences) {
        if (user.preferences.seat) setSeatPref(user.preferences.seat);
        if (user.preferences.dietary) setDietaryPref(user.preferences.dietary);
        if (user.preferences.travelClass) setTravelClass(user.preferences.travelClass);
      }
    }
  }, [mounted, user, router]);

  // Detect form modifications to activate Save button
  useEffect(() => {
    if (!mounted || !user) return;
    setHasChanges(true);
  }, [username, fullName, email, phone, address, avatar, profilePhoto, seatPref, dietaryPref, travelClass, promoEmails, smsAlerts, twoFactor, mounted]);

  // Reset flag on initial mount/load
  useEffect(() => {
    if (mounted) {
      setTimeout(() => setHasChanges(false), 200);
    }
  }, [mounted]);

  if (!mounted) {
    return <BokspotLoader message="Loading Profile..." />;
  }

  // Handle local photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 200, 200, 0.8);
        setProfilePhoto(compressed);
        setHasChanges(true);
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || !email.trim() || !phone.trim()) {
      setToastMessage('Please fill in all details');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setUser({
        ...user,
        username: username.toLowerCase().trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatarPreset: avatar,
        emoji: AVATAR_PRESETS.find(p => p.id === avatar)?.emoji || '🧑',
        profilePhoto: profilePhoto,
        preferences: {
          seat: seatPref,
          dietary: dietaryPref,
          travelClass: travelClass
        }
      });
      setIsSaving(false);
      setHasChanges(false);
      setToastMessage('Profile settings updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1200);
  };

  const handleLogOut = () => {
    logout();
    setToastMessage('Signing out...');
    setShowToast(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const currentPreset = AVATAR_PRESETS.find(p => p.id === avatar) || AVATAR_PRESETS[0];

  return (
    <>
      <main className="page-content px-4 md:px-8 lg:pr-8 pb-24 animate-fade-in">
        <div className="mx-auto max-w-5xl pt-4">
          
          {/* Header section with brand accent */}
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--color-outline)] font-semibold">User Account</p>
            <h1 className="mt-2 text-[30px] md:text-[42px] font-black tracking-tight text-[color:var(--color-on-surface)] leading-none flex items-center gap-3">
              <span>Profile Settings</span>
              <Sliders className="h-8 w-8 text-[color:var(--color-primary)]" />
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[color:var(--color-on-surface-variant)]">
              Manage personal credentials, upload profile photos, specify service preferences, and customize styling.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* SINGLE PROFILE CARD */}
            <div className="card-glass rounded-3xl p-6 md:p-10 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ background: 'radial-gradient(circle at top, var(--color-primary), transparent 60%)' }} />
              
              {/* Profile Avatar Section (Top Centered) */}
              <div className="flex flex-col items-center text-center mb-10 relative z-10">
                {/* Large Circle Avatar Preset */}
                <div className="relative group mb-4">
                  <div className="h-24 w-24 rounded-full flex items-center justify-center text-white text-4xl shadow-xl border-2 border-[color:var(--color-primary)]/45 relative overflow-hidden bg-gradient-to-br from-slate-200 to-slate-350 dark:from-slate-800 dark:to-slate-900 z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile Photo" className="h-full w-full object-cover animate-fade-in" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${currentPreset.color} flex items-center justify-center text-4xl`}>
                        {currentPreset.emoji}
                      </div>
                    )}
                  </div>
                  <label 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] flex items-center justify-center shadow-lg border-2 border-[color:var(--color-surface-container)] cursor-pointer z-20 transition-all active:scale-90"
                    title="Upload Profile Photo"
                  >
                    <Camera className="h-4.5 w-4.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <h2 className="text-xl font-black text-[color:var(--color-on-surface)]">{fullName || 'Guest User'}</h2>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 font-mono">@{username || 'username'}</p>

                {/* Loyalty stats */}
                <div className="flex items-center justify-center gap-10 mt-6 pt-5 border-t border-[color:var(--color-outline-variant)]/30 w-full max-w-md">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Bookings</span>
                    <span className="text-xl font-black text-[color:var(--color-on-surface)] mt-1">12</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Active</span>
                    <span className="text-xl font-black text-[color:var(--color-primary)] mt-1 animate-pulse">1</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Points</span>
                    <span className="text-xl font-black text-[color:var(--color-on-surface)] mt-1">4.8k</span>
                  </div>
                </div>
              </div>

              {/* Loyalty Status Tier Card */}
              <div className="card-glass rounded-3xl p-5 bg-[color:var(--color-surface-container)] border border-[color:var(--color-primary)]/15 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-15">
                  <Award size={64} className="text-[color:var(--color-primary)] animate-pulse" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)] animate-ping" />
                    <span className="text-[9px] uppercase tracking-widest text-[color:var(--color-primary)] font-extrabold bg-[color:var(--color-primary)]/10 px-2 py-0.5 rounded border border-[color:var(--color-primary)]/25">
                      Elite Member
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[color:var(--color-on-surface)] mt-2">Gold Status Member</h3>
                  <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1.5">
                    Unlock VIP lounge gates, complimentary service upgrades, and priority ticket check-ins.
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-[color:var(--color-outline)] font-bold uppercase">
                      <span>Tier Progress</span>
                      <span>12 / 15 bookings to Platinum</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-full overflow-hidden">
                      <div className="h-full bg-[color:var(--color-primary)] rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions: Support Concierge & App Settings Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 relative z-10">
                {/* 1. Support Concierge Tile */}
                <Link
                  href="/support"
                  className="group p-4 rounded-2xl bg-[color:var(--color-surface)]/80 hover:bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30 hover:border-[#ff6325]/40 transition-all flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a3161] to-[#1557bf] dark:from-[#ff6325]/20 dark:to-[#ff8452]/20 text-white dark:text-[#ff6325] flex items-center justify-center shadow-xs">
                      <Headphones size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[color:var(--color-on-surface)] group-hover:text-[#ff6325] transition-colors">
                        24/7 Support Concierge
                      </h4>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">
                        Raise complaints &amp; live chat support
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-[color:var(--color-outline)] group-hover:translate-x-1 group-hover:text-[#ff6325] transition-all" />
                </Link>

                {/* 2. Settings Tile */}
                <a
                  href="#profile-settings"
                  className="group p-4 rounded-2xl bg-[color:var(--color-surface)]/80 hover:bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30 hover:border-[#ff6325]/40 transition-all flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:bg-white/10 text-white flex items-center justify-center shadow-xs">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[color:var(--color-on-surface)] group-hover:text-[#ff6325] transition-colors">
                        Account &amp; App Settings
                      </h4>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">
                        Preferences, appearance &amp; security
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-[color:var(--color-outline)] group-hover:translate-x-1 group-hover:text-[#ff6325] transition-all" />
                </a>
              </div>

              {/* Profile Details Form */}
              <div id="profile-settings" className="relative z-10 scroll-mt-24">
                <h2 className="text-base font-bold text-[color:var(--color-on-surface)] mb-5 flex items-center gap-2">
                  <User size={18} className="text-[color:var(--color-primary)]" />
                  <span>Personal Credentials</span>
                </h2>
                
                <form onSubmit={handleSave} className="space-y-4">
                  
                  {/* Inputs Row */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Username
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5">
                        <span className="text-xs text-[color:var(--color-outline)] font-semibold font-mono">@</span>
                        <input 
                          type="text" 
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] focus:ring-0 font-mono" 
                        />
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Full Legal Name
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5">
                        <User size={16} className="text-[color:var(--color-outline)]" />
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] focus:ring-0" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Email Address
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5">
                        <Mail size={16} className="text-[color:var(--color-outline)]" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] focus:ring-0" 
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Mobile Number
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5">
                        <Phone size={16} className="text-[color:var(--color-outline)]" />
                        <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] focus:ring-0" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-1">
                    {/* Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Home Address
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5">
                        <MapPin size={16} className="text-[color:var(--color-outline)]" />
                        <input 
                          type="text" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="123 Main St, City, Country"
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] focus:ring-0" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* PREFERENCES SECTION */}
                  <div className="pt-4 border-t border-[color:var(--color-outline-variant)]/30">
                    <h3 className="text-xs uppercase tracking-wider text-[color:var(--color-outline)] font-bold mb-3 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[color:var(--color-primary)]" />
                      <span>Luxury Transit Preferences</span>
                    </h3>
                    
                    <div className="grid gap-3 md:grid-cols-3">
                      
                      {/* Seat Preference */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-wide text-[color:var(--color-outline)] font-semibold">Seat Preference</span>
                        <select
                          value={seatPref}
                          onChange={(e) => setSeatPref(e.target.value)}
                          className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-[11px] text-[color:var(--color-on-surface)] outline-none cursor-pointer hover:border-[color:var(--color-primary)]/30 transition-all appearance-none"
                        >
                          <option value="Window" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🪟 Window Seat</option>
                          <option value="Aisle" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">💺 Aisle Seat</option>
                          <option value="Extra Legroom" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🛫 Extra Legroom</option>
                        </select>
                      </div>

                      {/* Dietary Preference */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-wide text-[color:var(--color-outline)] font-semibold">Catering Choice</span>
                        <select
                          value={dietaryPref}
                          onChange={(e) => setDietaryPref(e.target.value)}
                          className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-[11px] text-[color:var(--color-on-surface)] outline-none cursor-pointer hover:border-[color:var(--color-primary)]/30 transition-all appearance-none"
                        >
                          <option value="Vegetarian" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🥗 Vegetarian</option>
                          <option value="Halal" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🥩 Halal Certified</option>
                          <option value="Vegan" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🌱 Vegan Options</option>
                          <option value="None" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🍽️ No Preferences</option>
                        </select>
                      </div>

                      {/* Travel Class Preference */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-wide text-[color:var(--color-outline)] font-semibold">Service Level</span>
                        <select
                          value={travelClass}
                          onChange={(e) => setTravelClass(e.target.value)}
                          className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-[11px] text-[color:var(--color-on-surface)] outline-none cursor-pointer hover:border-[color:var(--color-primary)]/30 transition-all appearance-none"
                        >
                          <option value="First Class" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">👑 First Class VIP</option>
                          <option value="Business Class" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">👔 Business Executive</option>
                          <option value="Premium Economy" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">✈️ Premium Economy</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* APPEARANCE SECTION */}
                  <div className="pt-4 border-t border-[color:var(--color-outline-variant)]/30">
                    <h3 className="text-xs uppercase tracking-wider text-[color:var(--color-outline)] font-bold mb-3 flex items-center gap-1.5">
                      <Sliders size={13} className="text-[color:var(--color-primary)]" />
                      <span>App Appearance</span>
                    </h3>
                    
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-wide text-[color:var(--color-outline)] font-semibold">Theme Mode</span>
                        <div className="relative">
                          <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as 'system' | 'light' | 'dark')}
                            className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-[11px] text-[color:var(--color-on-surface)] outline-none cursor-pointer hover:border-[color:var(--color-primary)]/30 transition-all appearance-none"
                            style={{
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23A8A8C0\' stroke-width=\'2.5\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
                              backgroundPosition: 'right 12px center',
                              backgroundSize: '10px',
                              backgroundRepeat: 'no-repeat'
                            }}
                          >
                            <option value="system" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🖥️ System Default (Auto)</option>
                            <option value="light" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">☀️ Light Theme</option>
                            <option value="dark" className="bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface)]">🌙 Dark Theme</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NOTIFICATION SETTINGS */}
                  <div className="pt-4 border-t border-[color:var(--color-outline-variant)]/30 grid gap-4 md:grid-cols-2">
                    
                    <div className="flex items-center justify-between bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/30 px-4 py-3 rounded-2xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-[color:var(--color-on-surface)]">Promo & Discount Emails</span>
                        <span className="text-[9px] text-[color:var(--color-outline)]">Get lounge voucher sales</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={promoEmails}
                        onChange={(e) => setPromoEmails(e.target.checked)}
                        className="h-4 w-4 accent-[color:var(--color-primary)] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/30 px-4 py-3 rounded-2xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-[color:var(--color-on-surface)]">Live SMS Status Alerts</span>
                        <span className="text-[9px] text-[color:var(--color-outline)]">Receive gate & track updates</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                        className="h-4 w-4 accent-[color:var(--color-primary)] cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Save Changes button with conditional highlighting */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] disabled:opacity-50 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-[color:var(--color-primary-fixed-dim)] shadow-[0_4px_16px_rgba(255,215,0,0.15)] disabled:shadow-none"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-[color:var(--color-on-primary)] border-t-transparent rounded-full animate-spin" />
                        <span>Applying Changes to Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Save Profile Settings</span>
                      </>
                    )}
                  </button>

                </form>
              </div>

              {/* Extra Utilities Menu (Notifications, Privacy, Logout) */}
              <div className="card-glass rounded-3xl bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 divide-y divide-[color:var(--color-outline-variant)]/30">
                
                <div className="flex items-center justify-between px-6 py-4.5 hover:bg-[color:var(--color-on-surface)]/[0.02] transition-colors cursor-pointer select-none">
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[color:var(--color-on-surface)]">Two-Factor Authentication</h4>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Secure your bookings with SMS OTP</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    className="h-4.5 w-9 rounded-full bg-[color:var(--color-surface-dim)] checked:bg-[color:var(--color-primary)] accent-[color:var(--color-primary)] appearance-none cursor-pointer border border-[color:var(--color-outline-variant)]/30 relative transition-all duration-300 after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:bg-[color:var(--color-outline)] checked:after:translate-x-4 checked:after:bg-[color:var(--color-on-primary)] checked:after:left-[4px]"
                  />
                </div>

                <div 
                  onClick={handleLogOut}
                  className="flex items-center justify-between px-6 py-4.5 hover:bg-red-500/5 transition-colors cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                      <LogOut size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-red-400 group-hover:text-red-500">Sign Out of Account</h4>
                      <p className="text-[10px] text-[color:var(--color-outline)] mt-0.5">Sign out of active device sessions securely</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Toast Notification popup */}
          {showToast && (
            <div className="fixed bottom-6 right-6 z-[100] animate-fade-up">
              <div className="bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-primary)]/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={16} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--color-on-surface)]">{toastMessage}</h4>
                  <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Settings synced successfully</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
