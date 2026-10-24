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
      <main className="page-content px-4 md:px-8 lg:pr-8 pb-16 animate-fade-in">
        <div className="mx-auto max-w-6xl pt-2">
          
          {/* Header section with clean executive badges */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[color:var(--color-outline-variant)]/20">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff6325]/10 text-[#ff6325] border border-[#ff6325]/20 mb-1.5 shadow-2xs">
                <span>User Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[color:var(--color-on-surface)] flex items-center gap-2.5">
                <span>Profile Settings</span>
                <Sliders className="h-5 w-5 text-[#ff6325]" />
              </h1>
              <p className="mt-1 text-xs text-[color:var(--color-on-surface-variant)] font-medium max-w-xl">
                Manage personal credentials, preferences, verified contacts, and loyalty tier privileges.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
              <span className="text-[11px] font-bold text-[color:var(--color-outline)] px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                Member ID: #BOK-2026-KR
              </span>
            </div>
          </div>

          {/* 2-COLUMN FILLED EXECUTIVE GRID (No Empty Space) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT COLUMN: Identity, Avatar, Loyalty & Quick Shortcuts (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Identity & Avatar Card */}
              <div className="rounded-2xl p-5 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 shadow-xs relative overflow-hidden backdrop-blur-xl">
                <div className="flex flex-col items-center text-center">
                  
                  {/* Large Avatar with camera pill */}
                  <div className="relative group mb-3">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center text-white text-3xl shadow-md border-2 border-[#ff6325]/40 relative overflow-hidden bg-gradient-to-br from-slate-200 to-slate-350 dark:from-slate-800 dark:to-slate-900 z-10 transition-transform duration-200 group-hover:scale-[1.02]">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile Photo" className="h-full w-full object-cover animate-fade-in" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${currentPreset.color} flex items-center justify-center text-3xl`}>
                          {currentPreset.emoji}
                        </div>
                      )}
                    </div>
                    <label 
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#ff6325] text-white hover:bg-[#ff7b47] flex items-center justify-center shadow-md border-2 border-[color:var(--color-surface-container)] cursor-pointer z-20 transition-all active:scale-90"
                      title="Upload Profile Photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <h2 className="text-base font-extrabold text-[color:var(--color-on-surface)]">{fullName || 'Guest User'}</h2>
                  <p className="text-xs text-[color:var(--color-outline)] font-mono mt-0.5">@{username || 'username'}</p>

                  {/* Filled Stats Row */}
                  <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-[color:var(--color-outline-variant)]/20">
                    <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                      <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-black block">Bookings</span>
                      <span className="text-base font-black text-[color:var(--color-on-surface)] mt-0.5 block">12</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#ff6325]/10 border border-[#ff6325]/20">
                      <span className="text-[9px] uppercase tracking-wider text-[#ff6325] font-black block">Active</span>
                      <span className="text-base font-black text-[#ff6325] mt-0.5 block">1</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                      <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-black block">Points</span>
                      <span className="text-base font-black text-[color:var(--color-on-surface)] mt-0.5 block">4.8k</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loyalty Status Tier Card */}
              <div className="rounded-2xl p-4.5 bg-[color:var(--color-surface-container)] border border-[#ff6325]/20 shadow-xs relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Award size={64} className="text-[#ff6325]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-[#ff6325] font-black bg-[#ff6325]/15 px-2 py-0.5 rounded border border-[#ff6325]/30">
                      Elite Tier
                    </span>
                    <span className="text-[10px] font-bold text-[color:var(--color-outline)]">VIP Lounge Access</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[color:var(--color-on-surface)] mt-2">Gold Status Member</h3>
                  <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">
                    Complimentary slot priority upgrades &amp; express desk check-ins.
                  </p>

                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-[color:var(--color-outline)] font-bold uppercase">
                      <span>Tier Progress</span>
                      <span>12 / 15 bookings</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff6325] rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Support & App Settings Quick Links */}
              <div className="space-y-2">
                <Link
                  href="/support"
                  className="group p-3 rounded-xl bg-[color:var(--color-surface-container)] hover:bg-[#ff6325] text-[color:var(--color-on-surface)] hover:text-white border border-[color:var(--color-outline-variant)]/30 hover:border-[#ff6325] transition-all flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ff6325]/15 group-hover:bg-white/20 text-[#ff6325] group-hover:text-white flex items-center justify-center transition-colors">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs">24/7 Support Concierge</h4>
                      <p className="text-[10px] text-[color:var(--color-outline)] group-hover:text-white/80">Submit tickets &amp; inquiries</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <div 
                  onClick={handleLogOut}
                  className="p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 transition-colors flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                      <LogOut size={15} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs">Sign Out</h4>
                      <p className="text-[10px] text-red-400">End active session securely</p>
                    </div>
                  </div>
                  <ChevronRight size={14} />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Personal Credentials & Preferences Form (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="rounded-2xl p-5 sm:p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 shadow-xs relative overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[color:var(--color-outline-variant)]/20">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#ff6325]" />
                    <h3 className="text-sm font-extrabold text-[color:var(--color-on-surface)]">Personal Credentials</h3>
                  </div>
                  <span className="text-[10px] font-bold text-[color:var(--color-outline)] uppercase tracking-wider">
                    Auto-synced with Bookings
                  </span>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Inputs Row 1 */}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Username
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2">
                        <span className="text-xs text-[color:var(--color-outline)] font-bold font-mono">@</span>
                        <input 
                          type="text" 
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] font-mono" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Full Legal Name
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2">
                        <User size={14} className="text-[color:var(--color-outline)]" />
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] font-medium" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inputs Row 2 */}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2">
                        <Mail size={14} className="text-[color:var(--color-outline)]" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] font-medium" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                        Mobile Number
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2">
                        <Phone size={14} className="text-[color:var(--color-outline)]" />
                        <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] font-medium" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                      Default Billing / Home Address
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2">
                      <MapPin size={14} className="text-[color:var(--color-outline)] shrink-0" />
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g., 42 Richmond Park, Chennai, Tamil Nadu"
                        className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)] font-medium placeholder-[color:var(--color-outline)]/50" 
                      />
                    </div>
                  </div>

                  {/* Service Booking Preferences */}
                  <div className="pt-2">
                    <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold block mb-2">
                      Travel &amp; Stay Service Preferences
                    </label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[color:var(--color-outline)]">Seat Choice</span>
                        <select
                          value={seatPref}
                          onChange={(e) => setSeatPref(e.target.value)}
                          className="bg-black/[0.02] dark:bg-white/[0.03] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-2.5 py-1.5 text-xs text-[color:var(--color-on-surface)] outline-none font-medium cursor-pointer"
                        >
                          <option value="window">Window Seat</option>
                          <option value="aisle">Aisle Seat</option>
                          <option value="middle">No Preference</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[color:var(--color-outline)]">Dietary Preference</span>
                        <select
                          value={dietaryPref}
                          onChange={(e) => setDietaryPref(e.target.value)}
                          className="bg-black/[0.02] dark:bg-white/[0.03] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-2.5 py-1.5 text-xs text-[color:var(--color-on-surface)] outline-none font-medium cursor-pointer"
                        >
                          <option value="vegetarian">Vegetarian</option>
                          <option value="non-vegetarian">Non-Vegetarian</option>
                          <option value="vegan">Vegan</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[color:var(--color-outline)]">Booking Class</span>
                        <select
                          value={travelClass}
                          onChange={(e) => setTravelClass(e.target.value)}
                          className="bg-black/[0.02] dark:bg-white/[0.03] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-2.5 py-1.5 text-xs text-[color:var(--color-on-surface)] outline-none font-medium cursor-pointer"
                        >
                          <option value="economy">Standard Economy</option>
                          <option value="premium">Executive Premium</option>
                          <option value="business">First Class VIP</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notification Toggles (Filled Row) */}
                  <div className="grid gap-2 sm:grid-cols-2 pt-2">
                    <div className="flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.03] border border-[color:var(--color-outline-variant)]/25 px-3 py-2 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-[color:var(--color-on-surface)] block">Promotional Discounts</span>
                        <span className="text-[9px] text-[color:var(--color-outline)]">Exclusive booking deals</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={promoEmails}
                        onChange={(e) => setPromoEmails(e.target.checked)}
                        className="h-4 w-4 accent-[#ff6325] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.03] border border-[color:var(--color-outline-variant)]/25 px-3 py-2 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-[color:var(--color-on-surface)] block">Live SMS Status Alerts</span>
                        <span className="text-[9px] text-[color:var(--color-outline)]">Gate &amp; booking updates</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                        className="h-4 w-4 accent-[#ff6325] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-[#ff6325] hover:bg-[#ff7b47] active:scale-[0.99] text-white disabled:opacity-50 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#ff6325]/20"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Save Profile Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
