'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Globe, Bell, CreditCard, Award, Shield,
  RotateCcw, Check, CheckCircle2, ArrowLeft,
  Mail, Phone, Lock, Moon, Sun, Smartphone, Calendar,
  Download, Trash2, LogOut, AlertTriangle, BadgeCheck,
  Coins, Sparkles, Building, ChevronRight, SlidersHorizontal,
  Camera, UploadCloud, FileText, Printer, Receipt, Users,
  BookOpen, Zap, Crown, Sliders, MapPin, CheckCheck,
  FileCheck, ShieldCheck, Heart, Sparkle, Wallet, KeyRound,
  FileBadge, HelpCircle, ArrowUpRight, Clock, Plus, ExternalLink,
  QrCode, UserPlus
} from 'lucide-react';
import { useUIStore, useUserStore, useLocationStore } from '../../lib/store';
import { BokspotLoader } from '../../components/ui/BokspotLoader';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useUIStore();
  const { user, setUser, logout } = useUserStore();
  const { city, setCity } = useLocationStore();

  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View Mode: 'settings' or 'customization'
  const [viewMode, setViewMode] = useState<'settings' | 'customization'>('settings');

  // =========================================================================
  // VIEW 1: SETTINGS OVERVIEW STATES
  // =========================================================================
  const [fullName, setFullName] = useState(user?.fullName || 'Vishnu Kumar KR');
  const [phone, setPhone] = useState(user?.phone || '+91 99887 76655');
  const [email, setEmail] = useState(user?.email || 'vishnukumar002@bnxmail.com');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const [language, setLanguage] = useState('EN-US (English)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers (km)');

  const [pushNotifications, setPushNotifications] = useState(true);
  const [whatsappTicketAlerts, setWhatsappTicketAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState('60');

  // User Side Wallet & Rewards State
  const [autoApplyRewards, setAutoApplyRewards] = useState(true);
  const [walletBalance, setWalletBalance] = useState(450);
  const [rewardPoints, setRewardPoints] = useState(850);

  // =========================================================================
  // VIEW 2: VALID USER CUSTOMIZATION (Full Real Tabs)
  // =========================================================================
  const [activeTab, setActiveTab] = useState('profile');

  // Top Identity State
  const [photoUploaded, setPhotoUploaded] = useState(true);

  // Column 1: Valid Personal Details
  const [customFullName, setCustomFullName] = useState(user?.fullName || 'Vishnu Kumar KR');
  const [customPhone, setCustomPhone] = useState(user?.phone || '+91 99887 76655');
  const [customEmail, setCustomEmail] = useState(user?.email || 'vishnukumar002@bnxmail.com');
  const [customerUid, setCustomerUid] = useState('BOK-IND-88402');
  const [dob, setDob] = useState('1998-08-15');

  // Column 2: Valid Regional & Preferences
  const [accountTier, setAccountTier] = useState('Individual Verified');
  const [preferredLanguage, setPreferredLanguage] = useState('English (EN-IN)');
  const [registeredState, setRegisteredState] = useState('Tamil Nadu (TN - 33)');
  const [pincode, setPincode] = useState('600040');

  // Column 3: Communication & Invoicing
  const [residentialAddress, setResidentialAddress] = useState('No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 94440 11223');
  const [emergencyName, setEmergencyName] = useState('Ravi Kumar (Brother)');
  const [govIdAttached, setGovIdAttached] = useState(false);

  // Print & Invoice Preferences
  const [companyGst, setCompanyGst] = useState('33AABCB1234F1Z0');
  const [billingLegalName, setBillingLegalName] = useState('Vishnu Technologies & Turf Pvt Ltd');
  const [autoEmailInvoice, setAutoEmailInvoice] = useState(true);

  // Saved Payment Methods
  const [upiVpa, setUpiVpa] = useState('vishnu@okhdfcbank');
  const [preferredPayChannel, setPreferredPayChannel] = useState('upi');

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = () => {
    if (user) {
      setUser({ ...user, fullName, phone, email });
    }
    showToast('Settings saved successfully!');
  };

  const handleSaveCustomization = () => {
    if (user) {
      setUser({ ...user, fullName: customFullName, phone: customPhone, email: customEmail });
    }
    setFullName(customFullName);
    setPhone(customPhone);
    setEmail(customEmail);
    showToast('User profile & customization updated successfully!');
  };

  const handleResetDefaults = () => {
    if (confirm('Restore default settings?')) {
      setLanguage('EN-US (English)');
      setDistanceUnit('Kilometers (km)');
      setPushNotifications(true);
      setWhatsappTicketAlerts(true);
      setEmailDigest(false);
      setReminderMinutes('60');
      setTwoFactorAuth(true);
      setAutoApplyRewards(true);
      setTheme('system');
      showToast('Default settings restored');
    }
  };

  if (!mounted) {
    return <BokspotLoader message="Loading Settings..." />;
  }

  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 pt-36 lg:pt-40 pb-28 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[10000] flex items-center gap-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-white/10 dark:border-black/10 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 1: MAIN SETTINGS OVERVIEW */}
      {/* ============================================================== */}
      {viewMode === 'settings' ? (
        <div className="max-w-4xl mx-auto space-y-7 animate-in fade-in duration-200">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your personal account, notifications, payment preferences, and privacy controls.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* View Digital Pass & Profile Button - Highlighted Interactive Pill */}
              <button
                type="button"
                onClick={() => setViewMode('customization')}
                className="relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6325] via-[#ea580c] to-[#d94e09] hover:brightness-110 active:scale-95 text-white text-xs font-black tracking-wide flex items-center gap-2 shadow-[0_4px_16px_rgba(255,99,37,0.35)] hover:shadow-[0_6px_22px_rgba(255,99,37,0.5)] transition-all cursor-pointer group"
                title="Open Digital Pass & Profile Hub"
              >
                <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span>Profile Hub</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* 1. Account & Security Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-[#ff6325] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Account &amp; Security
              </h2>
            </div>

            <div className="bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6325] to-[#ea580c] text-white flex items-center justify-center text-base font-black shadow-md ring-2 ring-white dark:ring-slate-800 shrink-0">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'V'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Verified Member
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {email} • {phone}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Two-Factor Authentication (2FA)</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Require an SMS OTP when logging into a new device or confirming high-value payments.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={twoFactorAuth}
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${twoFactorAuth ? 'bg-[#ff6325]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Preferences Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                App Preferences &amp; Localization
              </h2>
            </div>

            <div className="bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    Dark Mode
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Use a dark theme for the application interface.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isDarkMode}
                  onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isDarkMode ? 'bg-[#ff6325]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    Language
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    System localization language
                  </p>
                </div>

                <div className="relative shrink-0">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 px-3.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="EN-US (English)">EN-US (English)</option>
                    <option value="TA-IN (தமிழ் - Tamil)">TA-IN (தமிழ் - Tamil)</option>
                    <option value="HI-IN (हिन्दी - Hindi)">HI-IN (हिन्दी - Hindi)</option>
                    <option value="TE-IN (తెలుగు - Telugu)">TE-IN (తెలుగు - Telugu)</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    Default City for Search &amp; Venues
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pre-selects this city when searching for slots, hotels, and services.
                  </p>
                </div>

                <div className="relative shrink-0">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-9 px-3.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="Chennai">Chennai, Tamil Nadu</option>
                    <option value="Coimbatore">Coimbatore, Tamil Nadu</option>
                    <option value="Madurai">Madurai, Tamil Nadu</option>
                    <option value="Tiruchirappalli">Trichy, Tamil Nadu</option>
                    <option value="Bengaluru">Bengaluru, Karnataka</option>
                    <option value="Hyderabad">Hyderabad, Telangana</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    Distance Unit
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Measurement unit for venue and provider radius.
                  </p>
                </div>

                <div className="relative shrink-0">
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                    className="h-9 px-3.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="Kilometers (km)">Kilometers (km)</option>
                    <option value="Miles (mi)">Miles (mi)</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Notifications Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Notifications &amp; Alerts
              </h2>
            </div>

            <div className="bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    Push Notifications
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Receive real-time alerts for updates and activities.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={pushNotifications}
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${pushNotifications ? 'bg-[#ff6325]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${pushNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>WhatsApp Ticket &amp; QR Delivery</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Zero Wait</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Send PDF tickets and entry scan codes to {phone} immediately after booking.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={whatsappTicketAlerts}
                  onClick={() => setWhatsappTicketAlerts(!whatsappTicketAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${whatsappTicketAlerts ? 'bg-[#ff6325]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${whatsappTicketAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    Email Digest
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Receive a weekly summary of your financial activity.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={emailDigest}
                  onClick={() => setEmailDigest(!emailDigest)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${emailDigest ? 'bg-[#ff6325]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${emailDigest ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. USER-SIDE WALLET & REWARDS SUMMARY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-[#ff6325] flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Wallet &amp; Bokspot Rewards
              </h2>
            </div>

            <div className="bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Card 1: Bokspot Coins Balance */}
                <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-500/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-[#ff6325]" />
                      <span>Bokspot Coins Balance</span>
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {rewardPoints}
                      </span>
                      <span className="text-xs font-bold text-[#ff6325]">
                        (Worth ₹{(rewardPoints / 10).toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ff6325]/10 text-[#ff6325]">
                    Active
                  </span>
                </div>

                {/* Card 2: Bokspot Wallet Cash */}
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Wallet Cash Balance</span>
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        ₹{walletBalance.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        100% Usable
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                    Instant Refund
                  </span>
                </div>

              </div>

              {/* Auto-Redeem Toggle at Checkout */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Auto-Apply Coins &amp; Rewards at Checkout</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Automatically deduct available coins to give you the lowest price on every booking pass.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={autoApplyRewards}
                  onClick={() => setAutoApplyRewards(!autoApplyRewards)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${autoApplyRewards ? 'bg-[#ff6325]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${autoApplyRewards ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6325] via-[#ea580c] to-[#d94e09] hover:brightness-110 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_16px_rgba(255,99,37,0.35)] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>

        </div>
      ) : (
        /* ============================================================== */
        /* VIEW 2: VALID USER CUSTOMIZATION (Brand UI Colors & Ref Layout) */
        /* ============================================================== */
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">

          {/* Back Button */}
          <button
            onClick={() => setViewMode('settings')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-[#ff6325] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO SETTINGS</span>
          </button>

          {/* Header Row: Title & Save Profile Button (Bokspot Orange Theme) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Digital Pass &amp; Profile Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                View and manage your verified member badge, booking passes, wallet balances, and contact details.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveCustomization}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6325] via-[#ea580c] to-[#d94e09] hover:brightness-110 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_14px_rgba(255,99,37,0.35)] transition-all cursor-pointer self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>SAVE CHANGES</span>
            </button>
          </div>

          {/* Valid User-Side Tabs with Bokspot UI Theme (#ff6325) */}
          <div className="bg-white dark:bg-[#121722] p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {[
              { id: 'profile', label: 'User Profile', icon: User },
              { id: 'passes', label: 'Bookings & Passes', icon: Receipt },

              { id: 'wallet', label: 'Wallet & Rewards', icon: Wallet },
              { id: 'emergency', label: 'Emergency Contacts', icon: Users },
              { id: 'payment-modes', label: 'Payment Methods', icon: CreditCard },

            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${isActive
                      ? 'bg-gradient-to-r from-[#ff6325] to-[#ea580c] text-white shadow-sm ring-1 ring-[#ff6325]/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:bg-orange-50/50 dark:hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: User Profile Tab Content (3-Col Layout) */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-8 animate-in fade-in duration-150">

              {/* Photo & Profile Identity Header */}
              <div className="flex items-center gap-5">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setPhotoUploaded(!photoUploaded)}
                >
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-orange-300 dark:border-orange-500/40 bg-orange-50/50 dark:bg-orange-950/20 flex flex-col items-center justify-center text-[#ff6325] text-[10px] font-bold gap-1 shadow-xs group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5 text-[#ff6325]" />
                    <span>Add Photo</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-sm font-bold">
                    ✓
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Personal Identity &amp; Digital Pass</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#ff6325] border border-orange-200 dark:border-orange-500/20">
                      ID: {customerUid}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    Your profile photo and verified identity for entry gate verification, booking receipts, and membership recognition.
                  </p>
                </div>
              </div>

              {/* Exact 3-Column Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Column 1: Personal Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#ff6325]" />
                    <span>Personal Details</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customFullName}
                      onChange={(e) => setCustomFullName(e.target.value)}
                      placeholder="e.g. Vishnu Kumar"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Member Identification Code
                    </label>
                    <input
                      type="text"
                      value={customerUid}
                      onChange={(e) => setCustomerUid(e.target.value.toUpperCase())}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-mono font-bold uppercase focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Column 2: Localization & Region */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#ff6325]" />
                    <span>Localization &amp; Region</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Account Membership Tier
                    </label>
                    <div className="relative">
                      <select
                        value={accountTier}
                        onChange={(e) => setAccountTier(e.target.value)}
                        className="w-full h-10 px-3.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] appearance-none shadow-2xs cursor-pointer"
                      >
                        <option value="Individual Verified">Individual Verified Member</option>
                        <option value="Fast Pass VIP">Fast Pass VIP</option>
                        <option value="Corporate Member">Corporate Member</option>
                        <option value="Student Pass">Student Pass Holder</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Regional Language
                    </label>
                    <div className="relative">
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className="w-full h-10 px-3.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] appearance-none shadow-2xs cursor-pointer"
                      >
                        <option value="English (EN-IN)">English (India)</option>
                        <option value="Tamil (TA-IN)">Tamil (தமிழ்)</option>
                        <option value="Hindi (HI-IN)">Hindi (हिन्दी)</option>
                        <option value="Telugu (TE-IN)">Telugu (తెలుగు)</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Registered State
                    </label>
                    <div className="relative">
                      <select
                        value={registeredState}
                        onChange={(e) => setRegisteredState(e.target.value)}
                        className="w-full h-10 px-3.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] appearance-none shadow-2xs cursor-pointer"
                      >
                        <option value="Tamil Nadu (TN - 33)">Tamil Nadu (TN - 33)</option>
                        <option value="Karnataka (KA - 29)">Karnataka (KA - 29)</option>
                        <option value="Maharashtra (MH - 27)">Maharashtra (MH - 27)</option>
                        <option value="Telangana (TS - 36)">Telangana (TS - 36)</option>
                        <option value="Delhi (DL - 07)">Delhi (DL - 07)</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Neighborhood Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6 digit code"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Column 3: Communication & Invoicing */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#ff6325]" />
                    <span>Communication &amp; Invoicing</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Billing / Residential Address
                    </label>
                    <textarea
                      rows={3}
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      placeholder="Enter home/billing address for invoices..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Emergency contact"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Verification Proof (Aadhaar / Passport)
                    </label>
                    <div
                      onClick={() => setGovIdAttached(!govIdAttached)}
                      className={`h-24 rounded-2xl border-2 border-dashed ${govIdAttached
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-orange-300 dark:border-orange-500/30 bg-orange-50/20 dark:bg-orange-950/10'
                        } flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-[#ff6325] transition-colors`}
                    >
                      <UploadCloud className="w-5 h-5 text-[#ff6325] mb-0.5" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {govIdAttached ? 'ID Attached (id_proof.pdf)' : 'Upload Govt ID Proof'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PNG or PDF for fast 1-click check-in
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Bookings & Passes Tab Content */}
          {activeTab === 'passes' && (
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#ff6325]" />
                    <span>Your Active Booking Passes</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fast access QR codes and upcoming reserved slot entry tickets.
                  </p>
                </div>
                <Link
                  href="/bookings"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-[#ff6325] flex items-center gap-1.5"
                >
                  <span>View All Bookings</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Passes List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-orange-200/80 dark:border-orange-500/20 bg-orange-50/30 dark:bg-orange-950/10 flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#ff6325] text-white">
                      Confirmed Today
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Marina Turf Arena • Slot #4
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Today, 06:00 PM - 07:00 PM</span>
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Pass ID: BOK-TRF-99214
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <QrCode className="w-10 h-10 text-slate-900 dark:text-white" />
                    <span className="text-[8px] font-bold text-[#ff6325]">Scan Entry</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02] flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Tomorrow
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Grand Stay Hotel • Deluxe Suite
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Check-in: 02:00 PM</span>
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Pass ID: BOK-HTL-11029
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <QrCode className="w-10 h-10 text-slate-900 dark:text-white" />
                    <span className="text-[8px] font-bold text-slate-500">Scan Entry</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Wallet & Rewards Tab Content */}
          {activeTab === 'wallet' && (
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#ff6325]" />
                  <span>Wallet Balances &amp; Coin Rewards</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage your wallet refunds, cashback points, and auto-redemption settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Bokspot Coins</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6325] text-white">10 Pts = ₹1</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {rewardPoints} <span className="text-xs font-bold text-[#ff6325]">Coins</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Worth ₹{(rewardPoints / 10).toFixed(2)} instant discount on your next slot booking.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Refund Wallet</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">0% Fees</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{walletBalance.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Instant zero-wait balance for swift checkout without bank delays.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Emergency Contacts Tab Content */}
          {activeTab === 'emergency' && (
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#ff6325]" />
                  <span>Emergency SOS &amp; Companion Contacts</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Used by venue managers and organizers in case of turf injuries, hotel incidents, or urgent booking updates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contact Person Name &amp; Relation
                  </label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar (Father)"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Payment Methods Tab Content */}
          {activeTab === 'payment-modes' && (
            <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#ff6325]" />
                  <span>Saved Payment Methods &amp; VPA</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Setup your default UPI ID for 1-click payment requests during peak slot booking rushes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Default UPI VPA / Handle
                  </label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-[#ff6325] shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Preferred Payment Method
                  </label>
                  <div className="relative">
                    <select
                      value={preferredPayChannel}
                      onChange={(e) => setPreferredPayChannel(e.target.value)}
                      className="w-full h-10 px-3.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a202c] text-slate-800 dark:text-white text-xs font-bold focus:outline-hidden focus:border-[#ff6325] appearance-none shadow-2xs cursor-pointer"
                    >
                      <option value="upi">Instant UPI (GPay / PhonePe / Paytm)</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="wallet">Bokspot Wallet</option>
                      <option value="pay_at_venue">Pay at Venue</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-start">
            <button
              type="button"
              onClick={() => setViewMode('settings')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Settings</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
