'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Sparkles, ArrowRight, 
  CheckCircle2, AlertCircle, RefreshCw, KeyRound
} from 'lucide-react';
import { BokspotLoader } from '../../components/ui/BokspotLoader';
import { useUserStore } from '../../lib/store';

const GOOGLE_ACCOUNTS = [
  { name: 'Ramesh Kumar', email: 'ramesh.kumar@betasoftnet.com', emoji: '🧑', avatarColor: 'from-amber-400 to-yellow-600' },
  { name: 'Priya Raj', email: 'priya.raj@zenfit.com', emoji: '👩', avatarColor: 'from-pink-500 to-rose-600' },
  { name: 'Ananth Subramanian', email: 'ananth.sub@dine.com', emoji: '🧔', avatarColor: 'from-blue-500 to-indigo-600' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useUserStore();

  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // toggle between login & register
  const [isAdminMode, setIsAdminMode] = useState(false); // toggle admin mode
  
  // Custom Registration Form State
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <BokspotLoader message="Initializing Login..." />;
  }

  // Handle local credential submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (isLogin) {
      // Login validation
      if (!loginIdentifier || !loginPassword) {
        setError('Please enter your username/email and password');
        setIsLoading(false);
        return;
      }

      if (loginIdentifier === 'Admin' && loginPassword === 'Admin123') {
        setSuccess('Super Admin access granted. Redirecting to admin console...');
        setTimeout(() => {
          window.location.href = 'http://localhost:4001/admin';
        }, 1000);
        return;
      }

      setTimeout(() => {
        setIsLoading(false);
        const resolvedUsername = loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : loginIdentifier;
        const mockUser = {
          username: resolvedUsername,
          fullName: resolvedUsername.charAt(0).toUpperCase() + resolvedUsername.slice(1),
          email: loginIdentifier.includes('@') ? loginIdentifier : `${resolvedUsername}@bnxmail.com`,
          phone: '+91 99887 76655',
          emoji: '🧑',
          avatarColor: 'from-amber-400 to-yellow-600',
          profilePhoto: null
        };
        setUser(mockUser);
        setToken(`mock-token-${Date.now()}`);
        setSuccess('Logged in successfully!');
        setTimeout(() => router.push('/'), 800);
      }, 1200);
    } else {
      // Registration validation
      if (!regUsername || !regFullName || !regEmail || !regPhone || !regPassword) {
        setError('Please fill in all registration fields');
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        setIsLoading(false);
        const newUser = {
          username: regUsername.toLowerCase(),
          fullName: regFullName,
          email: regEmail,
          phone: regPhone,
          emoji: '🧑',
          avatarColor: 'from-emerald-400 to-teal-600',
          profilePhoto: null
        };
        setUser(newUser);
        setToken(`mock-token-${Date.now()}`);
        setSuccess('Account registered successfully!');
        setTimeout(() => router.push('/'), 800);
      }, 1500);
    }
  };

  // Handle Google OAuth Selection
  const handleGoogleSelect = (acc: typeof GOOGLE_ACCOUNTS[0]) => {
    setIsLoading(true);
    setShowGoogleModal(false);
    setTimeout(() => {
      setIsLoading(false);
      const mockUser = {
        username: acc.email.split('@')[0],
        fullName: acc.name,
        email: acc.email,
        phone: '+91 99887 76655',
        emoji: acc.emoji,
        avatarColor: acc.avatarColor,
        profilePhoto: null
      };
      setUser(mockUser);
      setToken(`google-token-${Date.now()}`);
      setSuccess(`Signed in as ${acc.name}!`);
      setTimeout(() => router.push('/'), 800);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[color:var(--color-surface)] text-[color:var(--color-on-surface)] flex items-center justify-center p-4 md:p-8 select-none relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[color:var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 pt-16">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 select-none">
            <span className="text-[14px] uppercase tracking-[0.25em] text-[color:var(--color-primary)] font-bold">BokSpot</span>
            <Sparkles className="h-4 w-4 text-[color:var(--color-primary)] animate-pulse" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight">
            {isAdminMode ? 'Super Admin Access' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1.5">
            {isAdminMode ? 'Authenticate to access platform-wide controls.' : isLogin ? 'Access your custom bookings and luxury profiles' : 'Register to manage and reserve services globally'}
          </p>
        </div>

        {/* Form Card */}
        <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 shadow-2xl">
          {/* Status feedback */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2.5"
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2.5"
              >
                <CheckCircle2 size={15} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Custom fields when registering */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Full Name</label>
                    <div className="flex items-center gap-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3 py-2">
                      <User size={14} className="text-[color:var(--color-outline)]" />
                      <input 
                        type="text"
                        required={!isLogin}
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="John Doe"
                        className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Email Address</label>
                    <div className="flex items-center gap-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3 py-2">
                      <Mail size={14} className="text-[color:var(--color-outline)]" />
                      <input 
                        type="email"
                        required={!isLogin}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Phone Number</label>
                    <div className="flex items-center gap-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3 py-2">
                      <Phone size={14} className="text-[color:var(--color-outline)]" />
                      <input 
                        type="text"
                        required={!isLogin}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username/Identifier Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">
                {isLogin ? 'Username or Email' : 'Username'}
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3 py-2">
                <User size={14} className="text-[color:var(--color-outline)]" />
                <input 
                  type="text"
                  required
                  value={isLogin ? loginIdentifier : regUsername}
                  onChange={(e) => isLogin ? setLoginIdentifier(e.target.value) : setRegUsername(e.target.value)}
                  placeholder={isLogin ? "username or email" : "john_doe"}
                  className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Password</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)] px-3 py-2">
                <Lock size={14} className="text-[color:var(--color-outline)]" />
                <input 
                  type="password"
                  required
                  value={isLogin ? loginPassword : regPassword}
                  onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-grow bg-transparent outline-none text-xs text-[color:var(--color-on-surface)]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] text-[color:var(--color-on-primary)] rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[color:var(--color-primary)]/10 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[color:var(--color-outline-variant)]/20" />
            </div>
            <span className="relative bg-[color:var(--color-surface-container)] px-2 text-[10px] text-[color:var(--color-outline)] uppercase font-semibold">
              or continue with
            </span>
          </div>

          {/* Social Sign-in Options */}
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setShowGoogleModal(true)}
              className="flex items-center justify-center gap-2 border border-[color:var(--color-outline-variant)]/40 rounded-xl py-2 hover:bg-[color:var(--color-on-surface)]/[0.05] transition-all cursor-pointer font-bold text-xs"
            >
              {/* Google Brand Logo Icon */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Gmail / Google Account</span>
            </button>
          </div>

          {/* Form switcher */}
          <div className="mt-5 text-center text-xs text-[color:var(--color-on-surface-variant)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-[color:var(--color-primary)] font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Admin Login Option */}
          <div className="mt-4 pt-4 border-t border-[color:var(--color-outline-variant)]/20 text-center">
            <p className="text-[10px] text-[color:var(--color-outline)] font-semibold">
              {isAdminMode ? (
                <>Are you a user? <button onClick={(e) => { e.preventDefault(); setIsAdminMode(false); }} className="text-indigo-400 font-bold hover:underline">User Login</button></>
              ) : (
                <>Platform Administrator? <button onClick={(e) => { e.preventDefault(); setIsAdminMode(true); setIsLogin(true); setLoginIdentifier(''); setLoginPassword(''); }} className="text-[color:var(--color-primary)] font-bold hover:underline">Admin Login</button></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Google Accounts Dialog Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 text-center animate-fade-up">
            <div className="flex flex-col items-center mb-4">
              <svg className="h-10 w-10 mb-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <h3 className="font-extrabold text-base text-[color:var(--color-on-surface)]">Sign In with Google</h3>
              <p className="text-[11px] text-[color:var(--color-outline)]">Select a Google Account to sign in to BokSpot</p>
            </div>

            <div className="space-y-2.5">
              {GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleGoogleSelect(acc)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 hover:bg-[color:var(--color-on-surface)]/[0.05] transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${acc.avatarColor} flex items-center justify-center text-white text-base shadow`}>
                      {acc.emoji}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[color:var(--color-on-surface)]">{acc.name}</span>
                      <span className="block text-[10px] text-[color:var(--color-outline)] truncate">{acc.email}</span>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-[color:var(--color-outline)]" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowGoogleModal(false)}
              className="mt-4 text-xs font-bold text-red-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
