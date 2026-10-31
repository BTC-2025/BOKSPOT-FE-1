'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, Calculator, Sparkles, Plus, Trash2, ArrowLeftRight, 
  ChevronLeft, ChevronRight, ExternalLink, Check, User, 
  Search, MoreVertical, Lightbulb, CheckSquare, Trash,
  CalendarDays, Settings, RotateCcw, Share2, Edit3, Sliders,
  CloudSun, Keyboard, FileText, MapPin, ShieldCheck, Mail, Send, CheckCircle2, Bookmark,
  History, Tag, Globe, ArrowUpDown, Delete
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlowStore } from '../lib/store';

interface UtilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isVendor?: boolean;
  activeTab?: 'beta' | 'calendar' | 'calc' | 'tasks' | 'contacts' | 'weather' | 'keyboard' | null;
  setActiveTab?: (tab: 'beta' | 'calendar' | 'calc' | 'tasks' | 'contacts' | 'weather' | 'keyboard' | null) => void;
  isSecondaryHeaderVisible?: boolean;
}

interface CompareItem {
  id: string;
  description: string;
  valA: number;
  valB: number;
}

export function UtilityDrawer({ 
  isOpen, 
  onClose, 
  isVendor = false,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  isSecondaryHeaderVisible = false,
}: UtilityDrawerProps) {
  const { bookings } = useBookingFlowStore();
  const currentMerchant: { merchantName?: string; city?: string } | null = null;
  const [localActiveTab, setLocalActiveTab] = useState<'beta' | 'calendar' | 'calc' | 'tasks' | 'contacts' | 'weather' | 'keyboard' | null>(null);
  
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;

  // Time state for the live red line
  const [now, setNow] = useState(new Date());
  
  // Notes state (matching bit-tool.com NOTES screenshot)
  const [notesList, setNotesList] = useState<Array<{ id: string; title: string; content: string; date: string }>>([]);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Contacts state (Global Contacts from bit-tool.com)
  const [searchQuery, setSearchQuery] = useState('');
  const [contactsList, setContactsList] = useState<Array<{ id: string; name: string; email?: string; phone?: string; role?: string }>>([]);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  // Calculator states
  const [calcInput, setCalcInput] = useState('');
  const [calcOperator, setCalcOperator] = useState('');
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState<'₹' | '$'>('₹');
  const [compareMode, setCompareMode] = useState(false);

  // Compare states
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [compDesc, setCompDesc] = useState('');
  const [compValA, setCompValA] = useState('');
  const [compValB, setCompValB] = useState('');

  // Calendar states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Beta Ecosystem states
  const [betaSubTab, setBetaSubTab] = useState<'favorites' | 'recent'>('favorites');
  const [baseFilter, setBaseFilter] = useState<'all' | 'public' | 'business'>('all');
  const [isEditingBeta, setIsEditingBeta] = useState(false);
  const [favoriteAppIds, setFavoriteAppIds] = useState<string[]>(['cliks', 'bnxmail', 'bit-tool', 'b2auth']);
  const [recentApps, setRecentApps] = useState<Array<{ id: string; name: string; url: string; icon: string; bg: string; color: string }>>([
    { id: 'bit-tool', name: 'Bit-Tool', url: 'https://bit-tool.com', icon: 'sliders', bg: 'bg-blue-500/10', color: 'text-[#2563eb]' }
  ]);

  const toggleFavorite = (appId: string) => {
    setFavoriteAppIds((prev) => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleAppLaunch = (app: { id: string; name: string; url: string; icon: string; bg: string; color: string }) => {
    setRecentApps((prev) => {
      const filtered = prev.filter(a => a.id !== app.id);
      return [app, ...filtered];
    });
  };

  // Rail Pin Customization State (matching screenshot "EDIT PINS")
  const [isEditingPins, setIsEditingPins] = useState(false);
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>(['calendar', 'calc', 'contacts']);

  const togglePin = (toolId: string) => {
    setPinnedToolIds((prev) => {
      if (prev.includes(toolId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter(id => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  // Update live red line every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Format date to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Get customer bookings for selected date
  const selectedDateStr = formatDateString(selectedDate);
  const dailyBookings = bookings.filter((b: any) => {
    return b.date === selectedDateStr;
  });

  // Calculate local timezone string, e.g. "GMT+05:30"
  const getTimezoneOffsetString = () => {
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    return `GMT${sign}${hours}:${minutes}`;
  };

  // Calendar timeline configuration
  const startHour = 8; // 8 AM
  const endHour = 20;  // 8 PM (20:00)
  const hourHeight = 64; // px

  const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const formatHourLabel = (h: number) => {
    if (h === 12) return '12 PM';
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  // Parse time string "10:00 AM" or "02:30 PM" to decimal hours
  const parseTimeToDecimal = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 8;
    let [_, hrStr, minStr, ampm] = match;
    let hr = parseInt(hrStr, 10);
    const min = parseInt(minStr, 10);
    if (ampm.toUpperCase() === 'PM' && hr < 12) hr += 12;
    if (ampm.toUpperCase() === 'AM' && hr === 12) hr = 0;
    return hr + min / 60;
  };



  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const newNote = {
      id: Math.random().toString(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    setNotesList((prev) => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setShowAddNoteModal(false);
  };

  // Calculator logic
  const handleCalcBtn = (val: string) => {
    if (val === 'C' || val === '↺') {
      setCalcInput('');
      setCalcOperator('');
      setCalcResult(null);
      setCalcHistory([]);
    } else if (val === '⌫') {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (['+', '-', '*', '/'].includes(val)) {
      if (!calcInput && calcResult !== null) {
        setCalcOperator(val);
      } else if (calcInput) {
        const num = parseFloat(calcInput);
        if (calcResult === null) {
          setCalcResult(num);
        } else {
          const res = evaluate(calcResult, num, calcOperator);
          setCalcResult(res);
        }
        setCalcOperator(val);
        setCalcInput('');
      }
    } else if (val === '=') {
      if (calcInput && calcOperator && calcResult !== null) {
        const num = parseFloat(calcInput);
        const res = evaluate(calcResult, num, calcOperator);
        const formula = `${calcResult} ${calcOperator} ${num} = ${res}`;
        setCalcHistory((prev) => [formula, ...prev].slice(0, 8));
        setCalcInput(String(res));
        setCalcResult(null);
        setCalcOperator('');
      }
    } else if (val === '.') {
      if (!calcInput.includes('.')) {
        setCalcInput((prev) => (prev || '0') + '.');
      }
    } else {
      setCalcInput((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const evaluate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleAddGst = () => {
    if (!calcInput) return;
    const num = parseFloat(calcInput);
    const withGst = Number((num * 1.18).toFixed(2));
    setCalcHistory((prev) => [`${num} + 18% GST = ${withGst}`, ...prev]);
    setCalcInput(String(withGst));
  };

  const handleAddDiscount = () => {
    if (!calcInput) return;
    const num = parseFloat(calcInput);
    const withDisc = Number((num * 0.9).toFixed(2));
    setCalcHistory((prev) => [`${num} - 10% Disc = ${withDisc}`, ...prev]);
    setCalcInput(String(withDisc));
  };

  const handleAddCompareItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compDesc.trim() || !compValA || !compValB) return;
    const newItem: CompareItem = {
      id: Math.random().toString(),
      description: compDesc.trim(),
      valA: parseFloat(compValA) || 0,
      valB: parseFloat(compValB) || 0,
    };
    setCompareItems((prev) => [...prev, newItem]);
    setCompDesc('');
    setCompValA('');
    setCompValB('');
  };

  const handleClearCompare = () => {
    setCompareItems([]);
  };

  const totalA = compareItems.reduce((sum, item) => sum + item.valA, 0);
  const totalB = compareItems.reduce((sum, item) => sum + item.valB, 0);
  const cheaperSide = totalA === totalB ? 'Equal' : totalA < totalB ? 'Side A' : 'Side B';
  const diffCheaper = Math.abs(totalA - totalB);

  // Month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonthDate((prev) => {
      const offset = direction === 'prev' ? -1 : 1;
      return new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonthDate);
  const firstDay = getFirstDayOfMonth(currentMonthDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDay }, () => null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDate((prev) => {
      const offset = direction === 'prev' ? -1 : 1;
      return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + offset);
    });
  };

  const jumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonthDate(today);
  };

  // Contacts filtered list
  const filteredContacts = contactsList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.role && c.role.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    const newContact = {
      id: Math.random().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      email: newContactEmail.trim(),
      role: 'Client',
    };
    setContactsList(prev => [newContact, ...prev]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
    setShowAddContactModal(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="fixed right-0 top-16 bottom-0 z-[40] flex flex-row overflow-hidden border-l border-slate-200 dark:border-slate-850 shadow-2xl pointer-events-auto bg-slate-50 dark:bg-[#0b0e14]/90 backdrop-blur-md"
        >
          {/* Slide-out Left Content Panel (320px) */}
          <AnimatePresence mode="wait">
            {activeTab && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: activeTab === 'beta' ? 340 : 320 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="h-full bg-white dark:bg-[#0b0e14] border-l border-slate-200 dark:border-slate-850 flex flex-col overflow-hidden select-none shrink-0"
              >
                {/* 1. CALENDAR TAB POPUP */}
                {activeTab === 'calendar' && (
                  <div className="h-full flex flex-col overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 font-sans bg-[#fbfcfd] dark:bg-[#0b0e14]">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0e121a]">
                      <h3 className="text-xs font-black tracking-widest text-[#0a192f] dark:text-white uppercase">
                        CALENDAR
                      </h3>
                      <button
                        onClick={() => setActiveTab(null)}
                        className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Month Navigation Pill Card */}
                      <div className="bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/70 dark:border-slate-800 p-2.5 flex items-center justify-between shadow-2xs">
                        <button
                          type="button"
                          onClick={() => navigateMonth('prev')}
                          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                          {months[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                        </h4>

                        <button
                          type="button"
                          onClick={() => navigateMonth('next')}
                          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Clean Month Grid Card */}
                      <div className="bg-white dark:bg-[#121722] rounded-3xl border border-slate-200/70 dark:border-slate-800 p-4 shadow-2xs space-y-3">
                        {/* Day of Week Headers */}
                        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <div key={d} className="py-1">{d}</div>
                          ))}
                        </div>

                        {/* Calendar Day Numbers Grid */}
                        <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
                          {emptyCells.map((_, i) => (
                            <div key={`empty-${i}`} className="h-8" />
                          ))}
                          {daysArray.map((day) => {
                            const isSelected = selectedDate.getDate() === day &&
                              selectedDate.getMonth() === currentMonthDate.getMonth() &&
                              selectedDate.getFullYear() === currentMonthDate.getFullYear();
                            const isToday = new Date().getDate() === day &&
                              new Date().getMonth() === currentMonthDate.getMonth() &&
                              new Date().getFullYear() === currentMonthDate.getFullYear();

                            return (
                              <div key={day} className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newD = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day);
                                    setSelectedDate(newD);
                                  }}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#ff6325] text-white shadow-md shadow-orange-500/30'
                                      : isToday
                                      ? 'border border-[#ff6325] text-[#ff6325] font-extrabold'
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  {day}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Schedule for Selected Date Section */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            SCHEDULE FOR {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const title = prompt('Enter quick booking note or schedule reminder:');
                              if (title && title.trim()) {
                                setNotesList((prev) => [
                                  {
                                    id: Math.random().toString(),
                                    title: title.trim(),
                                    content: `Scheduled for ${selectedDate.toLocaleDateString()}`,
                                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  },
                                  ...prev
                                ]);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#ff6325] hover:bg-orange-100 dark:hover:bg-orange-900/50 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>Add</span>
                          </button>
                        </div>

                        {/* Events list / Bookings list */}
                        {dailyBookings.length > 0 ? (
                          <div className="space-y-2">
                            {dailyBookings.map((b) => (
                              <div
                                key={b.id}
                                className="p-3 rounded-2xl bg-white dark:bg-[#121722] border border-orange-200/70 dark:border-orange-900/30 shadow-2xs flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {b.customerName || b.merchantName}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {b.serviceName}
                                  </p>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-[#ff6325] text-[10px] font-bold font-mono shrink-0">
                                  {b.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200/80 dark:border-slate-800 text-center flex items-center justify-center">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              No customer appointments on this day.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CALCULATOR / KEEP TAB POPUP (BETA CALC from bit-tool.com) */}
                {activeTab === 'calc' && (
                  <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-[#0c121e] text-slate-800 dark:text-slate-100 font-sans select-none">
                    {/* Header: # BETA CALC with circular action pills */}
                    <div className="px-4 py-3 bg-white dark:bg-[#0c121e] flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[#00875a] dark:text-[#00a86b] font-black text-lg leading-none">#</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                          BETA CALC
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button"
                          onClick={() => setCalcHistory([])} 
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="History"
                        >
                          <History size={14} className="stroke-[2.2]" />
                        </button>
                        <button 
                          type="button"
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Share"
                        >
                          <Share2 size={14} className="stroke-[2.2]" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setCalcInput('');
                            setCalcResult(null);
                            setCalcOperator('');
                          }} 
                          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-500 transition-colors cursor-pointer"
                          title="Clear Output"
                        >
                          <Trash2 size={14} className="stroke-[2.2]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab(null)}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                          title="Close"
                        >
                          <X size={16} className="stroke-[2.2]" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Scrollable Section: Tape / Recording area */}
                    <div className="flex-1 flex flex-col justify-center items-center px-4 py-3 bg-[#f8fafc]/50 dark:bg-slate-950/20 border-t border-b border-slate-100 dark:border-white/5 overflow-y-auto">
                      {calcHistory.length > 0 ? (
                        <div className="w-full h-full max-h-32 overflow-y-auto space-y-1.5 custom-scrollbar text-right font-mono text-xs pr-1">
                          {calcHistory.map((h, i) => (
                            <div key={i} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 transition-colors">
                              {h}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-6 select-none">
                          <RotateCcw size={22} className="text-slate-300 dark:text-slate-600 mb-2 stroke-[2]" />
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            Start typing to record Tape
                          </p>
                        </div>
                      )}
                    </div>

                    {/* SET BASE & Main Screen Display */}
                    <div className="px-5 py-3 bg-[#f1f5f9]/50 dark:bg-slate-900/30 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        SET BASE
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        {calcInput || (calcResult !== null ? calcResult : '0')}
                      </span>
                    </div>

                    {/* Quick Formula Pills: % GST, Discount, INR, Compare */}
                    <div className="px-4 py-2.5 grid grid-cols-4 gap-2 bg-white dark:bg-[#0c121e]">
                      <button
                        type="button"
                        onClick={handleAddGst}
                        className="py-1.5 px-2 rounded-xl border border-[#00875a]/30 hover:border-[#00875a] bg-white dark:bg-slate-900 text-[#00875a] dark:text-[#00a86b] text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <span className="text-[10px] font-black">%</span> GST
                      </button>
                      <button
                        type="button"
                        onClick={handleAddDiscount}
                        className="py-1.5 px-2 rounded-xl border border-amber-400/40 hover:border-amber-500 bg-white dark:bg-slate-900 text-amber-500 dark:text-amber-400 text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <Tag size={11} className="stroke-[2.5]" /> Discount
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrencySymbol((prev) => (prev === '₹' ? '$' : '₹'))}
                        className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <Globe size={11} className="stroke-[2.5]" /> INR
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompareMode(!compareMode)}
                        className={`py-1.5 px-2 rounded-xl border text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs hover:scale-[1.02] cursor-pointer ${
                          compareMode
                            ? 'bg-[#00875a] text-white border-[#00875a]'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <ArrowUpDown size={11} className="stroke-[2.5]" /> Compare
                      </button>
                    </div>

                    {/* Compare Ledger if active */}
                    {compareMode && (
                      <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 max-h-40 overflow-y-auto">
                        <div className="flex justify-between items-center pb-1">
                          <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Price Compare Ledger</span>
                          <button
                            type="button"
                            onClick={handleClearCompare}
                            className="text-red-500 hover:text-red-400 font-bold text-[10px] cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-1 font-mono text-[11px]">
                          {compareItems.map((item) => (
                            <div key={item.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800/40 py-0.5">
                              <span>{item.description}</span>
                              <span>{currencySymbol}{item.valA} vs {currencySymbol}{item.valB}</span>
                            </div>
                          ))}
                        </div>
                        <form onSubmit={handleAddCompareItem} className="grid grid-cols-3 gap-1 pt-1.5">
                          <input
                            type="text"
                            required
                            value={compDesc}
                            onChange={(e) => setCompDesc(e.target.value)}
                            placeholder="Item"
                            className="col-span-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5 text-[10px]"
                          />
                          <input
                            type="number"
                            required
                            step="any"
                            value={compValA}
                            onChange={(e) => setCompValA(e.target.value)}
                            placeholder="Side A"
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono"
                          />
                          <input
                            type="number"
                            required
                            step="any"
                            value={compValB}
                            onChange={(e) => setCompValB(e.target.value)}
                            placeholder="Side B"
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono"
                          />
                          <button
                            type="submit"
                            className="bg-[#00875a] text-white rounded flex items-center justify-center font-bold"
                          >
                            <Plus size={12} />
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Numeric Keypad Matrix (clean medium font weight matching screenshot) */}
                    <div className="p-4 pt-1 grid grid-cols-4 gap-2.5 bg-white dark:bg-[#0c121e]">
                      {/* Row 1: ↺, ⌫, /, x */}
                      <button
                        type="button"
                        onClick={() => handleCalcBtn('C')}
                        className="h-12 rounded-[16px] bg-[#fff1f2] dark:bg-rose-950/20 text-[#f43f5e] hover:bg-[#ffe4e6] flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
                        title="Clear / Reset"
                      >
                        <RotateCcw size={16} className="stroke-[2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCalcBtn('⌫')}
                        className="h-12 rounded-[16px] bg-[#f0f4f8] dark:bg-slate-800/60 text-[#334155] dark:text-slate-300 hover:bg-[#e2e8f0] flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
                        title="Backspace"
                      >
                        <Delete size={17} className="stroke-[1.8]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCalcBtn('/')}
                        className="h-12 rounded-[16px] bg-[#e6fbf2] dark:bg-emerald-950/30 text-[#00875a] dark:text-[#00a86b] hover:bg-[#cbf7e3] text-lg font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                      >
                        /
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCalcBtn('*')}
                        className="h-12 rounded-[16px] bg-[#e6fbf2] dark:bg-emerald-950/30 text-[#00875a] dark:text-[#00a86b] hover:bg-[#cbf7e3] text-base font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                      >
                        x
                      </button>

                      {/* Row 2: 7, 8, 9, - */}
                      {['7', '8', '9'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleCalcBtn(k)}
                          className="h-12 rounded-[16px] bg-[#f8fafc] dark:bg-slate-900 hover:bg-[#f1f5f9] text-[#1e293b] dark:text-slate-100 text-lg font-bold font-sans transition-all active:scale-95 shadow-2xs cursor-pointer"
                        >
                          {k}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleCalcBtn('-')}
                        className="h-12 rounded-[16px] bg-[#e6fbf2] dark:bg-emerald-950/30 text-[#00875a] dark:text-[#00a86b] hover:bg-[#cbf7e3] text-xl font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                      >
                        -
                      </button>

                      {/* Row 3: 4, 5, 6, + */}
                      {['4', '5', '6'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleCalcBtn(k)}
                          className="h-12 rounded-[16px] bg-[#f8fafc] dark:bg-slate-900 hover:bg-[#f1f5f9] text-[#1e293b] dark:text-slate-100 text-lg font-bold font-sans transition-all active:scale-95 shadow-2xs cursor-pointer"
                        >
                          {k}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleCalcBtn('+')}
                        className="h-12 rounded-[16px] bg-[#e6fbf2] dark:bg-emerald-950/30 text-[#00875a] dark:text-[#00a86b] hover:bg-[#cbf7e3] text-xl font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                      >
                        +
                      </button>

                      {/* Row 4 & 5: 1, 2, 3 and '=' spanning 2 rows */}
                      <div className="col-span-3 grid grid-cols-3 gap-2.5">
                        {['1', '2', '3'].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => handleCalcBtn(k)}
                            className="h-12 rounded-[16px] bg-[#f8fafc] dark:bg-slate-900 hover:bg-[#f1f5f9] text-[#1e293b] dark:text-slate-100 text-lg font-bold font-sans transition-all active:scale-95 shadow-2xs cursor-pointer"
                          >
                            {k}
                          </button>
                        ))}

                        <button
                          type="button"
                          className="h-12 rounded-[16px] bg-[#f0f4f8] dark:bg-slate-800/60 text-[#334155] dark:text-slate-300 hover:bg-[#e2e8f0] text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-2xs cursor-pointer flex items-center justify-center"
                        >
                          SCI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCalcBtn('0')}
                          className="h-12 rounded-[16px] bg-[#f8fafc] dark:bg-slate-900 hover:bg-[#f1f5f9] text-[#1e293b] dark:text-slate-100 text-lg font-bold font-sans transition-all active:scale-95 shadow-2xs cursor-pointer"
                        >
                          0
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCalcBtn('.')}
                          className="h-12 rounded-[16px] bg-[#f8fafc] dark:bg-slate-900 hover:bg-[#f1f5f9] text-[#1e293b] dark:text-slate-100 text-lg font-bold font-sans transition-all active:scale-95 shadow-2xs cursor-pointer"
                        >
                          .
                        </button>
                      </div>

                      {/* Equal Button: Tall Solid Green Button matching screenshot */}
                      <button
                        type="button"
                        onClick={() => handleCalcBtn('=')}
                        className="col-span-1 h-[106px] rounded-[18px] bg-[#00875a] hover:bg-[#00704a] text-white text-2xl font-bold transition-all active:scale-95 flex items-center justify-center shadow-[0_4px_14px_rgba(0,135,90,0.35)] cursor-pointer"
                      >
                        =
                      </button>
                    </div>

                    {/* Dark Solid Navy Tape Running Total Footer matching screenshot */}
                    <div className="mt-auto bg-[#0a1120] text-white px-5 py-3.5 flex flex-col justify-center border-t border-slate-800">
                      <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">
                        TAPE RUNNING TOTAL
                      </span>
                      <span className="text-xl font-black font-mono text-[#00c781] tracking-tight leading-tight mt-0.5">
                        {currencySymbol}{(calcResult !== null ? calcResult : parseFloat(calcInput || '0')).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. NOTES TAB POPUP (NOTES from bit-tool.com) */}
                {activeTab === 'tasks' && (
                  <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-[#0c121e] text-slate-800 dark:text-slate-100 font-sans select-none relative">
                    {/* Top App Header: NOTES & Close X */}
                    <div className="px-5 py-3.5 bg-white dark:bg-[#0c121e] border-b border-emerald-500/20 flex items-center justify-between shrink-0">
                      <span className="text-xs font-black tracking-wider text-[#0a1120] dark:text-white uppercase font-sans">
                        NOTES
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab(null)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X size={15} className="stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Subheader: My Notes title + blue '+ New Note' button */}
                    <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
                      <h3 className="text-lg font-black text-[#0a3161] dark:text-white font-sans tracking-tight">
                        My Notes
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddNoteModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all shadow-[0_2px_8px_rgba(37,99,235,0.3)] flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        <Plus size={15} className="stroke-[2.8]" /> New Note
                      </button>
                    </div>

                    {/* Content Section: Dashed empty state box or notes list */}
                    <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
                      {notesList.length === 0 ? (
                        <div className="mt-3 p-8 rounded-[22px] border-2 border-dashed border-[#cbd5e1] dark:border-slate-800 flex items-center justify-center text-center">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                            No notes yet. Click the button above to create one.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2">
                          {notesList.map((n) => (
                            <div 
                              key={n.id}
                              className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 space-y-1 shadow-2xs group hover:border-[#ff6325] transition-all"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xs text-[#0a3161] dark:text-white">
                                  {n.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {n.date}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {n.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* New Note Modal Popup */}
                    {showAddNoteModal && (
                      <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-2xl space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/5">
                            <h4 className="font-bold text-xs text-[#0a3161] dark:text-white uppercase tracking-wider">
                              Create New Note
                            </h4>
                            <button
                              type="button"
                              onClick={() => setShowAddNoteModal(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                              <X size={15} />
                            </button>
                          </div>
                          <form onSubmit={handleAddNoteSubmit} className="space-y-2.5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Note Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                placeholder="e.g. Booking guidelines"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Note Content
                              </label>
                              <textarea
                                rows={3}
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                placeholder="Write details here..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAddNoteModal(false)}
                                className="flex-1 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex-1 py-1.5 rounded-xl bg-[#ff6325] hover:bg-[#e0531c] text-white text-xs font-bold shadow-xs"
                              >
                                Save Note
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. CONTACTS TAB POPUP (GLOBAL CONTACTS from bit-tool.com) */}
                {activeTab === 'contacts' && (
                  <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-[#0c121e] text-slate-800 dark:text-slate-100 font-sans select-none relative">
                    {/* Top App Header: GLOBAL CONTACTS & Close X */}
                    <div className="px-5 py-3.5 bg-white dark:bg-[#0c121e] border-b border-emerald-500/20 flex items-center justify-between shrink-0">
                      <span className="text-xs font-black tracking-wider text-[#0a1120] dark:text-white uppercase font-sans">
                        GLOBAL CONTACTS
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab(null)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X size={15} className="stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Subheader: Global Contacts title + blue '+ Add Contact' button */}
                    <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white font-sans tracking-tight">
                        Global Contacts
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddContactModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all shadow-[0_2px_8px_rgba(37,99,235,0.3)] flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        <Plus size={15} className="stroke-[2.8]" /> Add Contact
                      </button>
                    </div>

                    {/* Search Bar matching screenshot */}
                    <div className="px-5 pb-4 shrink-0">
                      <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search global contacts..."
                          className="w-full bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-white/10 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs outline-none text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#2563eb] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Contacts List or Empty State matching screenshot */}
                    <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
                      {filteredContacts.length === 0 ? (
                        <div className="h-full min-h-[220px] flex items-center justify-center text-center">
                          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                            No contacts found.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredContacts.map((c) => (
                            <div 
                              key={c.id} 
                              className="p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-white/5 transition-all shadow-2xs group"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {c.name}
                                </h4>
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-400">
                                  {c.role || 'Contact'}
                                </span>
                              </div>
                              {c.phone && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                  {c.phone}
                                </p>
                              )}
                              {c.email && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                  {c.email}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Contact Modal Popup */}
                    {showAddContactModal && (
                      <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-2xl space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/5">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                              New Global Contact
                            </h4>
                            <button
                              type="button"
                              onClick={() => setShowAddContactModal(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                              <X size={15} />
                            </button>
                          </div>
                          <form onSubmit={handleAddContactSubmit} className="space-y-2.5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                                placeholder="e.g. Ramesh Kumar"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={newContactPhone}
                                onChange={(e) => setNewContactPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={newContactEmail}
                                onChange={(e) => setNewContactEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAddContactModal(false)}
                                className="flex-1 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex-1 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] shadow-xs"
                              >
                                Save Contact
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Weather Panel (from bit-tool.com) */}
                {activeTab === 'weather' && (
                  <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0c121e]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                          <CloudSun size={14} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                          LOCAL WEATHER FORECAST
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab(null)}
                        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-left">
                      {/* Main Weather Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-sky-500/5 to-transparent border border-teal-550/20 text-center relative overflow-hidden">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 mb-1">
                          <MapPin size={12} />
                          <span>Chennai, India</span>
                        </div>
                        <div className="text-4xl font-black text-slate-800 dark:text-white tracking-tight my-2">
                          31°C
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Partly Cloudy • Optimal for Outdoor Turf & Pool
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Humidity</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">68%</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Wind</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">14 km/h</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">UV Index</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Moderate</span>
                          </div>
                        </div>
                      </div>

                      {/* 3-Day Forecast */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Upcoming Forecast</span>
                        {[
                          { day: 'Tomorrow', temp: '32°C / 26°C', cond: 'Sunny & Clear' },
                          { day: 'Sunday', temp: '30°C / 25°C', cond: 'Passing Showers' },
                          { day: 'Monday', temp: '31°C / 25°C', cond: 'Clear Skies' }
                        ].map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-white/[0.02]">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{f.day}</span>
                            <span className="text-[11px] text-slate-500">{f.cond}</span>
                            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{f.temp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Keyboard Shortcuts & Input Tools Panel (KEYBOARD from bit-tool.com) */}
                {activeTab === 'keyboard' && (
                  <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0c121e] text-slate-800 dark:text-slate-100 font-sans select-none">
                    {/* Header: KEYBOARD with top subtle border and close X */}
                    <div className="px-5 py-3.5 bg-white dark:bg-[#0c121e] border-b border-emerald-500/20 flex items-center justify-between shrink-0">
                      <span className="text-xs font-black tracking-wider text-[#0a1120] dark:text-white uppercase font-sans">
                        KEYBOARD
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab(null)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X size={15} className="stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Dedicated Business View Center Body matching screenshot */}
                    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                      {/* BokSpot themed rounded squircle badge with building icon */}
                      <div className="w-20 h-20 rounded-[28px] bg-[#0a3161]/10 dark:bg-white/5 border border-[#0a3161]/15 flex items-center justify-center mb-6 shadow-xs">
                        <span className="text-3xl select-none" role="img" aria-label="Building">
                          🏢
                        </span>
                      </div>

                      {/* Title: Keyboard with BokSpot theme navy */}
                      <h2 className="text-2xl font-black text-[#0a3161] dark:text-white font-sans tracking-tight mb-3">
                        Keyboard
                      </h2>

                      {/* Description */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed mb-6 font-normal">
                        This is the dedicated business view for <span className="font-bold text-[#ff6325] dark:text-[#ff6325]">Keyboard</span>. Full feature integration is coming soon.
                      </p>

                      {/* Pill Badge: Path: /dashboard */}
                      <div className="px-5 py-2.5 rounded-2xl bg-[#0a3161]/5 dark:bg-white/5 border border-[#0a3161]/15 dark:border-white/5 text-xs font-bold text-[#0a3161] dark:text-slate-300 font-sans shadow-2xs">
                        Path: /dashboard
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. BETA APP LAUNCHER PANEL (Exact match to Beta Ecosystem screenshot) */}
                {activeTab === 'beta' && (
                  <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0c121e] text-left font-sans select-none overflow-hidden">
                    {/* Header: BETA Logo + Edit Button + Close */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-[#0052cc] dark:text-[#38bdf8] tracking-wider font-sans">
                          BETA
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsEditingBeta(!isEditingBeta)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-[11px] font-bold shadow-2xs transition-all cursor-pointer ${
                            isEditingBeta
                              ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isEditingBeta ? (
                            <>
                              <Check size={12} className="stroke-[3] text-emerald-600 dark:text-emerald-400" />
                              <span className="font-black text-[#00875a] dark:text-[#00c781]">Done</span>
                            </>
                          ) : (
                            <>
                              <Edit3 size={11} />
                              <span>Edit</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingBeta(false);
                            setActiveTab(null);
                          }}
                          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-3 custom-scrollbar flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Favorites / Recent Card Container */}
                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/40 shadow-xs space-y-2.5">
                          {/* Tabs: FAVORITES | RECENT with underline indicator */}
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-1.5">
                            <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-wider">
                              <button
                                type="button"
                                onClick={() => setBetaSubTab('favorites')}
                                className={`transition-all cursor-pointer pb-1 ${
                                  betaSubTab === 'favorites'
                                    ? 'text-[#00875a] border-b-2 border-[#00875a] font-black'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-b-2 border-transparent'
                                }`}
                              >
                                FAVORITES
                              </button>
                              <span className="text-slate-300 dark:text-slate-700 font-normal pb-1">|</span>
                              <button
                                type="button"
                                onClick={() => setBetaSubTab('recent')}
                                className={`transition-all cursor-pointer pb-1 ${
                                  betaSubTab === 'recent'
                                    ? 'text-[#00875a] border-b-2 border-[#00875a] font-black'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-b-2 border-transparent'
                                }`}
                              >
                                RECENT
                              </button>
                            </div>
                          </div>

                          {/* Top Content: FAVORITES vs RECENT */}
                          {betaSubTab === 'favorites' ? (
                            <div className="grid grid-cols-3 gap-y-3 gap-x-2 pt-0.5 text-center">
                              {/* Cliks */}
                              {favoriteAppIds.includes('cliks') && (
                                <div className={`relative flex flex-col items-center gap-1 group ${isEditingBeta ? 'animate-jiggle' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('cliks')}
                                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-md z-20 hover:scale-110 cursor-pointer animate-in zoom-in-75 duration-150"
                                      title="Remove from favorites"
                                    >
                                      <X size={12} className="stroke-[3]" />
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://cliks.co.in"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'cliks', name: 'Cliks', url: 'https://cliks.co.in', icon: 'cliks', bg: 'bg-[#00875a]/10', color: 'text-[#00875a]' })}
                                    className="flex flex-col items-center gap-1 cursor-pointer w-full"
                                  >
                                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs">
                                      <svg className="w-6 h-6 text-[#00875a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                      </svg>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Cliks</span>
                                  </a>
                                </div>
                              )}

                              {/* BNXmail */}
                              {favoriteAppIds.includes('bnxmail') && (
                                <div className={`relative flex flex-col items-center gap-1 group ${isEditingBeta ? 'animate-jiggle-reverse' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('bnxmail')}
                                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-md z-20 hover:scale-110 cursor-pointer animate-in zoom-in-75 duration-150"
                                      title="Remove from favorites"
                                    >
                                      <X size={12} className="stroke-[3]" />
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://bnxmail.com"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'bnxmail', name: 'BNXmail', url: 'https://bnxmail.com', icon: 'bnxmail', bg: 'bg-sky-500/10', color: 'text-[#0052cc]' })}
                                    className="flex flex-col items-center gap-1 cursor-pointer w-full"
                                  >
                                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs">
                                      <svg className="w-7 h-7 text-[#0052cc]" viewBox="0 0 32 32" fill="none">
                                        <path 
                                          d="M7 16.5L16 22.5L25 16.5M6 14.5V23C6 24.1 6.9 25 8 25H24C25.1 25 26 24.1 26 23V14.5" 
                                          stroke="#0052cc" 
                                          strokeWidth="1.8" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                        />
                                        <path 
                                          d="M7.5 12C9 12 11.5 10 13 8C14.5 6 17 5 19 6C18 7.5 17 9.5 17 11C18.5 10.5 21 10 23.5 11C21 12 18.5 13.5 17 14.5C15.5 15.5 13 16 11 15C9.5 14.2 8.5 13 7.5 12Z" 
                                          fill="#0052cc" 
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">BNXmail</span>
                                  </a>
                                </div>
                              )}

                              {/* Bit-Tool */}
                              {favoriteAppIds.includes('bit-tool') && (
                                <div className={`relative flex flex-col items-center gap-1 group ${isEditingBeta ? 'animate-jiggle' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('bit-tool')}
                                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-md z-20 hover:scale-110 cursor-pointer animate-in zoom-in-75 duration-150"
                                      title="Remove from favorites"
                                    >
                                      <X size={12} className="stroke-[3]" />
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://bit-tool.com"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'bit-tool', name: 'Bit-Tool', url: 'https://bit-tool.com', icon: 'sliders', bg: 'bg-blue-500/10', color: 'text-[#0052cc]' })}
                                    className="flex flex-col items-center gap-1 cursor-pointer w-full"
                                  >
                                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs">
                                      <svg className="w-6 h-6 text-[#0052cc]" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="5" cy="5.5" r="1.8" />
                                        <rect x="3.4" y="9.5" width="3.2" height="11.5" rx="1.6" />
                                        <rect x="10.4" y="4.5" width="3.2" height="15.5" rx="1.6" />
                                        <rect x="17.4" y="9.5" width="3.2" height="11.5" rx="1.6" />
                                        <circle cx="19" cy="23.5" r="1.8" />
                                      </svg>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Bit-Tool</span>
                                  </a>
                                </div>
                              )}

                              {/* B2Auth */}
                              {favoriteAppIds.includes('b2auth') && (
                                <div className={`relative flex flex-col items-center gap-1 group ${isEditingBeta ? 'animate-jiggle-reverse' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('b2auth')}
                                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-md z-20 hover:scale-110 cursor-pointer animate-in zoom-in-75 duration-150"
                                      title="Remove from favorites"
                                    >
                                      <X size={12} className="stroke-[3]" />
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://b2auth.com"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'b2auth', name: 'B2Auth', url: 'https://b2auth.com', icon: 'b2auth', bg: 'bg-slate-100', color: 'text-slate-700' })}
                                    className="flex flex-col items-center gap-1 cursor-pointer w-full"
                                  >
                                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs">
                                      <ShieldCheck size={22} className="text-slate-700 dark:text-slate-300" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">B2Auth</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* RECENT Apps view - Exactly matching the screenshot */
                            <div className="pt-0.5">
                              {recentApps.length === 0 ? (
                                <div className="py-4 text-center text-[11px] text-slate-400">
                                  No recent applications
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-center">
                                  {recentApps.map((app) => (
                                    <a
                                      key={app.id}
                                      href={app.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex flex-col items-center gap-1 group cursor-pointer"
                                    >
                                      <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs">
                                        {app.id === 'bit-tool' ? (
                                          <svg className="w-6 h-6 text-[#0052cc]" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="5" cy="5.5" r="1.8" />
                                            <rect x="3.4" y="9.5" width="3.2" height="11.5" rx="1.6" />
                                            <rect x="10.4" y="4.5" width="3.2" height="15.5" rx="1.6" />
                                            <rect x="17.4" y="9.5" width="3.2" height="11.5" rx="1.6" />
                                            <circle cx="19" cy="23.5" r="1.8" />
                                          </svg>
                                        ) : app.id === 'cliks' ? (
                                          <CheckCircle2 size={22} className="text-[#00875a]" />
                                        ) : app.id === 'bnxmail' ? (
                                          <svg className="w-7 h-7 text-[#0052cc]" viewBox="0 0 32 32" fill="none">
                                            <path 
                                              d="M7 16.5L16 22.5L25 16.5M6 14.5V23C6 24.1 6.9 25 8 25H24C25.1 25 26 24.1 26 23V14.5" 
                                              stroke="#0052cc" 
                                              strokeWidth="1.8" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                            />
                                            <path 
                                              d="M7.5 12C9 12 11.5 10 13 8C14.5 6 17 5 19 6C18 7.5 17 9.5 17 11C18.5 10.5 21 10 23.5 11C21 12 18.5 13.5 17 14.5C15.5 15.5 13 16 11 15C9.5 14.2 8.5 13 7.5 12Z" 
                                              fill="#0052cc" 
                                            />
                                          </svg>
                                        ) : (
                                          <ShieldCheck size={20} className="text-slate-700 dark:text-slate-300" />
                                        )}
                                      </div>
                                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                                        {app.name}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* BASE Section (Exact match to PUBLIC screenshot) */}
                        {/* BASE Section (Exact match to all 3 screenshots: BASE, PUBLIC, and BUSINESS) */}
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                            <span 
                              onClick={() => setBaseFilter('all')}
                              className="text-[#0a1120] dark:text-slate-100 font-black tracking-wide text-xs cursor-pointer select-none"
                              title="Show all BASE apps"
                            >
                              BASE
                            </span>
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => setBaseFilter(prev => prev === 'public' ? 'all' : 'public')}
                                className={`cursor-pointer transition-all pb-1 text-[11px] ${
                                  baseFilter === 'public'
                                    ? 'text-[#00875a] dark:text-[#00c781] border-b-2 border-[#00875a] font-black'
                                    : 'text-[#94a3b8] hover:text-slate-600 font-extrabold border-b-2 border-transparent'
                                }`}
                              >
                                PUBLIC
                              </button>
                              <span className="text-[#cbd5e1] dark:text-slate-700 font-normal pb-1">|</span>
                              <button
                                type="button"
                                onClick={() => setBaseFilter(prev => prev === 'business' ? 'all' : 'business')}
                                className={`cursor-pointer transition-all pb-1 text-[11px] ${
                                  baseFilter === 'business'
                                    ? 'text-[#00875a] dark:text-[#00c781] border-b-2 border-[#00875a] font-black'
                                    : 'text-[#94a3b8] hover:text-slate-600 font-extrabold border-b-2 border-transparent'
                                }`}
                              >
                                BUSINESS
                              </button>
                            </div>
                          </div>

                          {/* Base Apps Grid: When baseFilter is 'all', show Row 1 (4 apps) + Row 2 (CliksBus...) exactly matching screenshot */}
                          {baseFilter === 'business' ? (
                            <div className="grid grid-cols-4 gap-2.5 text-center">
                              {/* Cliks Business */}
                              <a
                                href="https://business.cliks.co.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleAppLaunch({ id: 'cliks-bus', name: 'CliksBusiness', url: 'https://business.cliks.co.in', icon: 'cliks', bg: 'bg-[#00875a]/10', color: 'text-[#00875a]' })}
                                className="p-2.5 rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-xs transition-all group hover:scale-[1.03] cursor-pointer"
                              >
                                <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                  <CheckCircle2 size={22} className="text-[#00875a]" />
                                </div>
                                <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate w-full tracking-tight">CliksBus...</span>
                              </a>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {/* Row 1: Cliks, BNXmail, Bit-Tool, B2Auth */}
                              <div className="grid grid-cols-4 gap-2.5 text-center">
                                {/* Cliks */}
                                <div className={`relative group ${isEditingBeta ? 'animate-jiggle' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('cliks')}
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center z-20 hover:scale-110 cursor-pointer transition-transform"
                                      title={favoriteAppIds.includes('cliks') ? "Remove from Favorites" : "Add to Favorites"}
                                    >
                                      <span className="text-[#f59e0b] text-xs leading-none select-none">★</span>
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://cliks.co.in"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'cliks', name: 'Cliks', url: 'https://cliks.co.in', icon: 'cliks', bg: 'bg-[#00875a]/10', color: 'text-[#00875a]' })}
                                    className="p-2.5 rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-xs transition-all group hover:scale-[1.03] cursor-pointer w-full"
                                  >
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                      <CheckCircle2 size={22} className="text-[#00875a]" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate w-full">Cliks</span>
                                  </a>
                                </div>

                                {/* BNXmail */}
                                <div className={`relative group ${isEditingBeta ? 'animate-jiggle-reverse' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('bnxmail')}
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center z-20 hover:scale-110 cursor-pointer transition-transform"
                                      title={favoriteAppIds.includes('bnxmail') ? "Remove from Favorites" : "Add to Favorites"}
                                    >
                                      <span className="text-[#f59e0b] text-xs leading-none select-none">★</span>
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://bnxmail.com"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'bnxmail', name: 'BNXmail', url: 'https://bnxmail.com', icon: 'bnxmail', bg: 'bg-sky-500/10', color: 'text-[#0052cc]' })}
                                    className="p-2.5 rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-xs transition-all group hover:scale-[1.03] cursor-pointer w-full"
                                  >
                                    <div className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                      <svg className="w-6 h-6 text-[#0052cc]" viewBox="0 0 32 32" fill="none">
                                        <path 
                                          d="M7 16.5L16 22.5L25 16.5M6 14.5V23C6 24.1 6.9 25 8 25H24C25.1 25 26 24.1 26 23V14.5" 
                                          stroke="#0052cc" 
                                          strokeWidth="1.8" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                        />
                                        <path 
                                          d="M7.5 12C9 12 11.5 10 13 8C14.5 6 17 5 19 6C18 7.5 17 9.5 17 11C18.5 10.5 21 10 23.5 11C21 12 18.5 13.5 17 14.5C15.5 15.5 13 16 11 15C9.5 14.2 8.5 13 7.5 12Z" 
                                          fill="#0052cc" 
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate w-full">BNXmail</span>
                                  </a>
                                </div>

                                {/* Bit-Tool */}
                                <div className={`relative group ${isEditingBeta ? 'animate-jiggle' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('bit-tool')}
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center z-20 hover:scale-110 cursor-pointer transition-transform"
                                      title={favoriteAppIds.includes('bit-tool') ? "Remove from Favorites" : "Add to Favorites"}
                                    >
                                      <span className="text-[#f59e0b] text-xs leading-none select-none">★</span>
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://bit-tool.com"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'bit-tool', name: 'Bit-Tool', url: 'https://bit-tool.com', icon: 'sliders', bg: 'bg-blue-500/10', color: 'text-[#0052cc]' })}
                                    className="p-2.5 rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-xs transition-all group hover:scale-[1.03] cursor-pointer w-full"
                                  >
                                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                      <svg className="w-5 h-5 text-[#0052cc]" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="5" cy="5.5" r="1.8" />
                                        <rect x="3.4" y="9.5" width="3.2" height="11.5" rx="1.6" />
                                        <rect x="10.4" y="4.5" width="3.2" height="15.5" rx="1.6" />
                                        <rect x="17.4" y="9.5" width="3.2" height="11.5" rx="1.6" />
                                        <circle cx="19" cy="23.5" r="1.8" />
                                      </svg>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate w-full">Bit-Tool</span>
                                  </a>
                                </div>

                                {/* B2Auth */}
                                <div className={`relative group ${isEditingBeta ? 'animate-jiggle-reverse' : ''}`}>
                                  {isEditingBeta && (
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite('b2auth')}
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center z-20 hover:scale-110 cursor-pointer transition-transform"
                                      title={favoriteAppIds.includes('b2auth') ? "Remove from Favorites" : "Add to Favorites"}
                                    >
                                      <span className="text-[#f59e0b] text-xs leading-none select-none">★</span>
                                    </button>
                                  )}
                                  <a
                                    href={isEditingBeta ? undefined : "https://b2auth.com"}
                                    target={isEditingBeta ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={() => !isEditingBeta && handleAppLaunch({ id: 'b2auth', name: 'B2Auth', url: 'https://b2auth.com', icon: 'b2auth', bg: 'bg-slate-100', color: 'text-slate-700' })}
                                    className="p-2.5 rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-xs transition-all group hover:scale-[1.03] cursor-pointer w-full"
                                  >
                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                                      <ShieldCheck size={20} className="text-slate-800 dark:text-slate-200" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate w-full">B2Auth</span>
                                  </a>
                                </div>
                              </div>

                              {/* Row 2: CliksBusiness (Visible when 'all' matching user screenshot) */}
                              {baseFilter === 'all' && (
                                <div className="grid grid-cols-4 gap-2.5 text-center">
                                  <div className={`relative group ${isEditingBeta ? 'animate-jiggle' : ''}`}>
                                    {isEditingBeta && (
                                      <button
                                        type="button"
                                        onClick={() => toggleFavorite('cliks-bus')}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center z-20 hover:scale-110 cursor-pointer transition-transform"
                                        title={favoriteAppIds.includes('cliks-bus') ? "Remove from Favorites" : "Add to Favorites"}
                                      >
                                        <span className="text-[#f59e0b] text-xs leading-none select-none">★</span>
                                      </button>
                                    )}
                                    <a
                                      href={isEditingBeta ? undefined : "https://business.cliks.co.in"}
                                      target={isEditingBeta ? undefined : "_blank"}
                                      rel="noopener noreferrer"
                                      onClick={() => !isEditingBeta && handleAppLaunch({ id: 'cliks-bus', name: 'CliksBusiness', url: 'https://business.cliks.co.in', icon: 'cliks', bg: 'bg-[#00875a]/10', color: 'text-[#00875a]' })}
                                      className="p-2.5 rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-xs transition-all group hover:scale-[1.03] cursor-pointer w-full"
                                    >
                                      <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <CheckCircle2 size={22} className="text-[#00875a]" />
                                      </div>
                                      <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate w-full tracking-tight">
                                        CliksBus...
                                      </span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Coming Soon Beta Labs Card - Centered with rolling spinning star */}
                      <div className="relative pt-6 pb-2 my-auto">
                        {/* Rolling/Spinning 4-pointed Ninja Star Sparkle Icon Badge */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/60 shadow-md flex items-center justify-center text-purple-600 z-10">
                          <svg 
                            className="w-4 h-4 text-[#7c3aed] animate-spin" 
                            style={{ animationDuration: '3s' }}
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            {/* 4-pointed Ninja Star / Sparkle blade */}
                            <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="currentColor" fillOpacity="0.15" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                          </svg>
                        </div>

                        {/* Coming Soon Card Body */}
                        <div className="rounded-[22px] border border-purple-100 dark:border-purple-900/40 p-4 pt-5 text-center bg-gradient-to-b from-purple-50/50 via-white to-purple-50/30 dark:from-purple-950/20 dark:via-slate-900/40 dark:to-transparent space-y-2 shadow-xs">
                          <div>
                            <span className="px-3 py-1 rounded-full bg-[#f3e8ff] dark:bg-purple-900/60 text-[#7c3aed] dark:text-purple-300 text-[9.5px] font-black uppercase tracking-wider inline-block">
                              BETA LABS RELEASE
                            </span>
                          </div>
                          <h4 className="text-base font-black text-[#8b5cf6] dark:text-purple-400 tracking-wide uppercase font-sans">
                            COMING SOON
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed font-normal">
                            Building the next generation of Beta applications.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Permanently Settled Bottom Footer - Exact match to screenshot */}
                    <div className="py-3 px-4 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-white/5 shrink-0 text-center select-none">
                      <span className="text-[10px] font-black tracking-widest text-[#94a3b8] dark:text-slate-500 uppercase">
                        BETA ECOSYSTEM • FUTURE READY
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Sidebar (60px wide) - Beta signature modern utility rail */}
          <div className="w-[60px] h-full flex flex-col items-center py-3 bg-white/95 dark:bg-[#0a0f1d] border-l border-slate-200/80 dark:border-white/10 shrink-0 select-none shadow-xs">
            {/* 1. Top Beta "B" Monogram Button - Exact match to user screenshot */}
            <button
              type="button"
              onClick={() => {
                if (isEditingPins) setIsEditingPins(false);
                setActiveTab(activeTab === 'beta' ? null : 'beta');
              }}
              className="relative group focus:outline-hidden cursor-pointer"
              title="Beta Ecosystem Apps"
            >
              <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0 transition-all bg-white hover:bg-slate-50 border border-[#b8c9dc] dark:border-slate-700 shadow-2xs hover:scale-105 ${
                activeTab === 'beta' ? 'ring-2 ring-[#0052cc] border-transparent scale-105' : ''
              }`}>
                <img 
                  src="/beta-logo.png" 
                  alt="Beta" 
                  className="w-5 h-5 object-contain select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,82,204,0.3)] contrast-125 brightness-95" 
                />
              </div>
              {!activeTab && (
                <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Beta Apps Hub
                </div>
              )}
            </button>

            {/* Subtle Horizontal Divider */}
            <div className="w-9 h-[1.5px] bg-[#dbe3eb] dark:bg-white/10 my-2 shrink-0" />

            {/* EDIT PINS Header Label - Only visible when editing pins */}
            {isEditingPins && (
              <div className="text-[8.5px] font-extrabold tracking-tight text-[#8392a5] dark:text-slate-400 uppercase text-center mb-1.5 whitespace-nowrap select-none font-sans leading-none animate-in fade-in duration-200">
                EDIT PINS
              </div>
            )}

            {/* List of active application icons stacked vertically */}
            <div className="flex flex-col gap-2 items-center w-full">
              {/* All available tools that can be pinned/unpinned */}
              {[
                {
                  id: 'calendar',
                  label: 'Calendar',
                  icon: <CalendarDays size={20} className="stroke-[2.2]" />,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 dark:bg-amber-950/30',
                  border: 'border-amber-400 dark:border-amber-500',
                  activeBg: 'bg-amber-500 text-white',
                },
                {
                  id: 'calc',
                  label: 'Calculator',
                  icon: <Calculator size={20} className="stroke-[2.2]" />,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                  border: 'border-emerald-500',
                  activeBg: 'bg-emerald-600 text-white',
                },
                {
                  id: 'contacts',
                  label: 'Contacts',
                  icon: <User size={20} className="stroke-[2.2]" />,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-950/30',
                  border: 'border-blue-400 dark:border-blue-500',
                  activeBg: 'bg-blue-600 text-white',
                },
                {
                  id: 'keyboard',
                  label: 'Keyboard & Hotkeys',
                  icon: <Keyboard size={18} className="stroke-[2.2]" />,
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-50 dark:bg-indigo-950/30',
                  border: 'border-indigo-400 dark:border-indigo-500',
                  activeBg: 'bg-indigo-600 text-white',
                },
                {
                  id: 'tasks',
                  label: 'Notes & Tasks',
                  icon: <FileText size={18} className="stroke-[2.2]" />,
                  color: 'text-[#ff6325]',
                  bg: 'bg-orange-50 dark:bg-orange-950/30',
                  border: 'border-[#ff6325]',
                  activeBg: 'bg-[#ff6325] text-white',
                },
                {
                  id: 'weather',
                  label: 'Weather',
                  icon: <CloudSun size={19} className="stroke-[2.2]" />,
                  color: 'text-teal-500',
                  bg: 'bg-teal-50 dark:bg-teal-950/30',
                  border: 'border-teal-400 dark:border-teal-500',
                  activeBg: 'bg-teal-600 text-white',
                },
              ].map((tool) => {
                const isPinned = pinnedToolIds.includes(tool.id);
                // When not in edit mode, STRICTLY ONLY show pinned items! Unpinned items are completely hidden!
                if (!isEditingPins && !isPinned) return null;

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      if (isEditingPins) {
                        togglePin(tool.id);
                      } else {
                        setActiveTab(activeTab === tool.id ? null : (tool.id as any));
                      }
                    }}
                    className="relative group focus:outline-hidden cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-[18px] flex items-center justify-center transition-all ${
                        isEditingPins
                          ? isPinned
                            ? `${tool.bg} border-2 ${tool.border} ${tool.color} shadow-xs scale-100 ring-2 ring-[#0a3161]/20`
                            : 'bg-transparent border-2 border-dashed border-[#b8c2cc] dark:border-slate-700 text-[#64748b] dark:text-slate-400 hover:border-[#ff6325] hover:text-[#ff6325]'
                          : activeTab === tool.id
                            ? `${tool.activeBg} shadow-[0_4px_14px_rgba(0,0,0,0.15)] scale-105 border-2 border-transparent`
                            : `${tool.bg} border-2 ${tool.border} ${tool.color} hover:scale-105 shadow-2xs`
                      }`}
                    >
                      {tool.icon}
                    </div>

                    {/* Tooltip */}
                    {!activeTab && (
                      <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {isEditingPins ? (isPinned ? `Remove ${tool.label}` : `Add ${tool.label}`) : tool.label}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Single morphing button: '+' when closed, '✓' when editing pins */}
              <button
                type="button"
                onClick={() => setIsEditingPins(!isEditingPins)}
                className={`w-10 h-10 rounded-[18px] flex items-center justify-center transition-all cursor-pointer hover:scale-105 relative group mt-0.5 ${
                  isEditingPins
                    ? 'bg-[#ff6325] hover:bg-[#e0531c] text-white shadow-[0_4px_14px_rgba(255,99,37,0.4)]'
                    : 'border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#ff6325] dark:hover:border-[#ff6325] bg-transparent text-slate-400 hover:text-[#ff6325] dark:hover:text-[#ff6325] shadow-2xs'
                }`}
                title={isEditingPins ? "Save Pinned Tools" : "Customize Pinned Tools"}
              >
                {isEditingPins ? (
                  <Check size={22} className="stroke-[3.5]" />
                ) : (
                  <Plus size={18} className="stroke-[2.2]" />
                )}
                {!activeTab && (
                  <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {isEditingPins ? "Done / Save Pins" : "Customize Pins"}
                  </div>
                )}
              </button>
            </div>

            {/* Bottom Actions: Pencil Icon to Edit Pins + Controls */}
            <div className="mt-auto flex flex-col gap-2 items-center w-full">
              {/* Subtle Divider */}
              <div className="w-8 h-[1px] bg-slate-200/80 dark:bg-white/10 mb-0.5 shrink-0" />

              {/* Pencil Icon Button: Toggles EDIT PINS Customize mode matching BokSpot theme */}
              <button
                type="button"
                onClick={() => setIsEditingPins(!isEditingPins)}
                className={`w-10 h-10 rounded-[16px] flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 relative group ${
                  isEditingPins
                    ? 'bg-[#0a3161] text-white shadow-[0_4px_12px_rgba(10,49,97,0.35)]'
                    : 'bg-[#f4f7fa] dark:bg-white/5 hover:bg-[#eef2f6] dark:hover:bg-white/10 border border-[#e2e8f0] dark:border-white/10 text-[#475569] dark:text-slate-300 hover:text-[#ff6325]'
                }`}
                title={isEditingPins ? "Save Pins" : "Edit Pinned Icons"}
              >
                <svg className="w-5 h-5 stroke-[2] text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                {!activeTab && (
                  <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {isEditingPins ? "Done Editing" : "Edit Pins"}
                  </div>
                )}
              </button>

              {/* Sliders / Utility Settings Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-[16px] bg-[#f4f7fa] dark:bg-white/5 hover:bg-[#eef2f6] dark:hover:bg-white/10 border border-[#e2e8f0] dark:border-white/10 flex items-center justify-center text-[#475569] dark:text-slate-300 hover:text-[#ff6325] transition-all cursor-pointer shadow-2xs hover:scale-105 relative group"
                title="Toggle Utility Panel"
              >
                <Sliders size={17} className="stroke-[2]" />
                {!activeTab && (
                  <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Close Rails
                  </div>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple internal icon to avoid Lucide resolution differences
function ChevronDownIcon({ size = 16, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
