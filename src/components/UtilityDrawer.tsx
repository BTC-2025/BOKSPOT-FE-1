'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, Calculator, Sparkles, Plus, Trash2, ArrowLeftRight, 
  ChevronLeft, ChevronRight, ExternalLink, Check, User, 
  Search, MoreVertical, Lightbulb, CheckSquare, Trash,
  CalendarDays, Settings, RotateCcw, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlowStore } from '../lib/store';

interface UtilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isVendor?: boolean;
  activeTab?: 'calendar' | 'calc' | 'tasks' | 'contacts' | null;
  setActiveTab?: (tab: 'calendar' | 'calc' | 'tasks' | 'contacts' | null) => void;
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
  const [localActiveTab, setLocalActiveTab] = useState<'calendar' | 'calc' | 'tasks' | 'contacts' | null>(null);
  
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;

  // Time state for the live red line
  const [now, setNow] = useState(new Date());
  
  // Tasks state
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: 'Check my upcoming appointments', completed: true },
    { id: '2', text: 'Reschedule my dental consult slot', completed: false },
    { id: '3', text: 'Set reminders for yoga training', completed: false },
    { id: '4', text: 'Explore new dining offers in Chennai', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Contacts state (Merchant / Support Contacts for Customer)
  const [searchQuery, setSearchQuery] = useState('');
  const defaultContacts = [
    { name: 'Apollo Dental Support', email: 'help@apollodental.com', phone: '+91 98765 43210', role: 'Medical / Doctor' },
    { name: 'ZenFit Reception Desk', email: 'support@zenfit.com', phone: '+91 98765 54321', role: 'Gym / Fitness' },
    { name: 'Style Studio Frontdesk', email: 'info@stylestudio.com', phone: '+91 98765 12345', role: 'Salon / Spa' },
    { name: 'BokSpot Platform Help', email: 'help@bokspot.com', phone: '+91 1800 123 456', role: 'Tech Support' },
  ];

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
  const dailyBookings = bookings.filter((b) => b.date === selectedDateStr);

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

  // Tasks actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Math.random().toString(), text: newTaskText.trim(), completed: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
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
  const filteredContacts = defaultContacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className={`fixed right-0 bottom-0 z-[40] flex flex-row overflow-hidden border-l border-slate-200/80 dark:border-slate-800 shadow-2xl pointer-events-auto bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-xl text-left transition-all duration-300 ${
            isSecondaryHeaderVisible ? 'top-[96px] lg:top-[102px]' : 'top-[58px] lg:top-[64px]'
          }`}
        >
          {/* Slide-out Left Content Panel (320px) */}
          <AnimatePresence mode="wait">
            {activeTab && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 320 }}
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
                                      ? 'bg-[#1557bf] text-white shadow-md shadow-blue-500/30'
                                      : isToday
                                      ? 'border border-[#1557bf] text-[#1557bf] dark:text-blue-400 font-extrabold'
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
                              const title = prompt('Enter quick task or reminder for this day:');
                              if (title && title.trim()) {
                                setTasks((prev) => [...prev, { id: Math.random().toString(), text: title.trim(), completed: false }]);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>Add</span>
                          </button>
                        </div>

                        {/* Events list / Empty State */}
                        {dailyBookings.length > 0 ? (
                          <div className="space-y-2">
                            {dailyBookings.map((b) => (
                              <div
                                key={b.id}
                                className="p-3 rounded-2xl bg-white dark:bg-[#121722] border border-blue-200 dark:border-blue-900/40 shadow-2xs flex items-center justify-between gap-3"
                              >
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {b.merchantName}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {b.serviceName}
                                  </p>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono shrink-0">
                                  {b.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200/80 dark:border-slate-800 text-center flex items-center justify-center">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              No events, notes, or reminders for this day.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CALCULATOR / KEEP TAB POPUP */}
                {activeTab === 'calc' && (
                  <div className="h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-200 font-sans">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1.5 select-none">
                        <span className="text-emerald-500 font-bold text-sm">#</span>
                        <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest block font-sans">
                          BETA CALC
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCalcHistory([])} 
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650"
                          title="Reset History"
                        >
                          <RotateCcw size={12} />
                        </button>
                        <button 
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650"
                          title="Share Tape"
                        >
                          <Share2 size={12} />
                        </button>
                        <button 
                          onClick={() => {
                            setCalcInput('');
                            setCalcResult(null);
                            setCalcOperator('');
                          }} 
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650"
                          title="Clear Output"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button
                          onClick={() => setActiveTab(null)}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700"
                          title="Close"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar text-left">
                      {compareMode ? (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 p-3 text-[11px] space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-1.5">
                            <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Price Compare Ledger</span>
                            <button
                              type="button"
                              onClick={handleClearCompare}
                              className="text-red-500 hover:text-red-400 font-bold cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>

                          <div className="max-h-28 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {compareItems.length === 0 ? (
                              <p className="text-slate-400 italic text-[10px] text-center py-2">
                                No comparison items yet.
                              </p>
                            ) : (
                              compareItems.map((item) => (
                                <div key={item.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800/40 py-1 text-slate-600 dark:text-slate-300 font-mono">
                                  <span className="truncate max-w-[140px] font-sans">{item.description}</span>
                                  <span>
                                    {currencySymbol}{item.valA} vs {currencySymbol}{item.valB}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>

                          {compareItems.length > 0 && (
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1 font-mono">
                              <div className="flex justify-between text-slate-500 font-bold">
                                <span>Total Side A:</span>
                                <span>{currencySymbol}{totalA.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-slate-500 font-bold">
                                <span>Total Side B:</span>
                                <span>{currencySymbol}{totalB.toFixed(2)}</span>
                              </div>
                              <div className="pt-1 text-[10.5px] font-sans text-emerald-600 dark:text-emerald-400 flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-800">
                                <span>Cheaper Option:</span>
                                <span className="font-black uppercase">
                                  {cheaperSide === 'Equal' ? 'Equal' : `${cheaperSide} (-${currencySymbol}${diffCheaper.toFixed(2)})`}
                                </span>
                              </div>
                            </div>
                          )}

                          <form onSubmit={handleAddCompareItem} className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                            <input
                              type="text"
                              required
                              value={compDesc}
                              onChange={(e) => setCompDesc(e.target.value)}
                              placeholder="Item Description"
                              className="col-span-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[10.5px] outline-none text-slate-800 dark:text-white"
                            />
                            <input
                              type="number"
                              required
                              step="any"
                              value={compValA}
                              onChange={(e) => setCompValA(e.target.value)}
                              placeholder="Side A"
                              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10.5px] outline-none font-mono text-slate-800 dark:text-white"
                            />
                            <input
                              type="number"
                              required
                              step="any"
                              value={compValB}
                              onChange={(e) => setCompValB(e.target.value)}
                              placeholder="Side B"
                              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10.5px] outline-none font-mono text-slate-800 dark:text-white"
                            />
                            <button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center cursor-pointer font-bold"
                            >
                              <Plus size={13} />
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {/* Set Base Display Header */}
                          <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-950/20 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 select-none">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">SET BASE</span>
                            <span className="text-[16px] font-black text-slate-800 dark:text-white font-mono leading-none">
                              {calcInput || '0'}
                            </span>
                          </div>

                          {/* 4 outline segment pill buttons */}
                          <div className="grid grid-cols-4 gap-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={handleAddGst}
                              className="py-1 rounded-lg border border-emerald-500/30 bg-transparent text-emerald-500 hover:bg-emerald-500/10 text-[9px] font-black uppercase transition-all flex items-center justify-center gap-0.5"
                            >
                              % GST
                            </button>
                            <button
                              type="button"
                              onClick={handleAddDiscount}
                              className="py-1 rounded-lg border border-amber-500/30 bg-transparent text-amber-500 hover:bg-amber-500/10 text-[9px] font-black uppercase transition-all flex items-center justify-center gap-0.5"
                            >
                              % Discount
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrencySymbol((prev) => (prev === '₹' ? '$' : '₹'))}
                              className="py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-[9px] font-black uppercase transition-all flex items-center justify-center gap-0.5"
                            >
                              % INR
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompareMode(!compareMode)}
                              className={`py-1 rounded-lg border text-[9px] font-black uppercase transition-all flex items-center justify-center gap-0.5 ${
                                compareMode
                                  ? 'bg-blue-600 border-none text-white shadow'
                                  : 'border-slate-300 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              ↑↓ Compare
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Calculator numeric grid */}
                      {!compareMode && (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {/* Row 1: C, ⌫, ÷, × */}
                          <button
                            type="button"
                            onClick={() => handleCalcBtn('C')}
                            className="h-9 rounded-xl font-mono text-xs font-black border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center"
                          >
                            C
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCalcBtn('⌫')}
                            className="h-9 rounded-xl font-mono text-xs font-bold border border-slate-250 dark:border-slate-750 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center"
                          >
                            ⌫
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCalcBtn('/')}
                            className="h-9 rounded-xl font-mono text-xs font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center justify-center"
                          >
                            ÷
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCalcBtn('*')}
                            className="h-9 rounded-xl font-mono text-xs font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center justify-center"
                          >
                            ×
                          </button>

                          {/* Row 2: 7, 8, 9, - */}
                          {['7', '8', '9'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleCalcBtn(k)}
                              className="h-9 rounded-xl font-mono text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                              {k}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleCalcBtn('-')}
                            className="h-9 rounded-xl font-mono text-xs font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center justify-center"
                          >
                            -
                          </button>

                          {/* Row 3: 4, 5, 6, + */}
                          {['4', '5', '6'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleCalcBtn(k)}
                              className="h-9 rounded-xl font-mono text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                              {k}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleCalcBtn('+')}
                            className="h-9 rounded-xl font-mono text-xs font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center justify-center"
                          >
                            +
                          </button>

                          {/* Row 4 & 5: 1,2,3 / SCI,0,. and '=' spanning 2 rows */}
                          <div className="col-span-3 grid grid-cols-3 gap-2">
                            {['1', '2', '3'].map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleCalcBtn(k)}
                                className="h-9 rounded-xl font-mono text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                              >
                                {k}
                              </button>
                            ))}

                            <button
                              type="button"
                              className="h-9 rounded-xl font-sans text-[8.5px] font-black border border-slate-250 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 uppercase"
                            >
                              SCI
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCalcBtn('0')}
                              className="h-9 rounded-xl font-mono text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                              0
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCalcBtn('.')}
                              className="h-9 rounded-xl font-mono text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                              .
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCalcBtn('=')}
                            className="col-span-1 h-20 rounded-xl bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 text-white font-mono text-sm font-black transition-all active:scale-95 flex items-center justify-center"
                          >
                            =
                          </button>
                        </div>
                      )}

                      {/* TAPE RUNNING TOTAL footer */}
                      {!compareMode && (
                        <div className="flex justify-between items-center px-3.5 py-2.5 bg-slate-100/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-850 font-sans text-xs select-none mt-2">
                          <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">TAPE RUNNING TOTAL</span>
                          <span className="font-extrabold text-[13px] text-emerald-600 dark:text-emerald-400 font-mono">
                            {currencySymbol}{(calcResult !== null ? calcResult : parseFloat(calcInput || '0')).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. TASKS TAB POPUP */}
                {activeTab === 'tasks' && (
                  <div className="h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-200 font-sans">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare size={13} className="text-blue-500" />
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">
                          MY TASKS
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab(null)}
                        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar text-left">
                      <form onSubmit={handleAddTask} className="flex gap-1.5">
                        <input
                          type="text"
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          placeholder="Add new task..."
                          className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] outline-none text-slate-800 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold"
                        >
                          Add
                        </button>
                      </form>

                      <div className="space-y-1.5">
                        {tasks.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 italic text-[10px]">No tasks. Keep it up!</div>
                        ) : (
                          tasks.map((t) => (
                            <div 
                              key={t.id} 
                              className="flex items-start justify-between gap-2.5 p-2 rounded-lg border border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all group"
                            >
                              <button
                                onClick={() => toggleTask(t.id)}
                                className={`mt-0.5 shrink-0 w-3.5 h-3.5 border rounded flex items-center justify-center ${
                                  t.completed
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {t.completed && <Check size={10} strokeWidth={3} />}
                              </button>
                              <span className={`flex-1 text-[11px] leading-tight ${t.completed ? 'line-through text-slate-400 dark:text-slate-650' : 'text-slate-700 dark:text-slate-300'}`}>
                                {t.text}
                              </span>
                              <button 
                                onClick={() => deleteTask(t.id)}
                                className="text-slate-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash size={11} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CONTACTS TAB POPUP */}
                {activeTab === 'contacts' && (
                  <div className="h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-200 font-sans">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-blue-500" />
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">
                          CONTACTS LIST
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab(null)}
                        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar text-left">
                      <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search contacts..."
                          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] outline-none text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        {filteredContacts.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 italic text-[10px]">No contacts found</div>
                        ) : (
                          filteredContacts.map((c, idx) => (
                            <div 
                              key={idx} 
                              className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all"
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-bold text-[11px] text-slate-705 dark:text-slate-202 truncate">{c.name}</span>
                                <span className="text-[7.5px] uppercase font-black tracking-wider px-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded shrink-0">
                                  {c.role}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-400 mt-1 font-mono leading-none">{c.phone}</p>
                              <p className="text-[9.5px] text-slate-400 mt-0.5 font-mono leading-none truncate">{c.email}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Sidebar Rail (50px wide) - BokSpot Signature Glass Rail */}
          <div className="w-[50px] h-full flex flex-col items-center py-4 bg-slate-50/80 dark:bg-[#0e121a]/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-slate-800/80 shrink-0 select-none">
            {/* Top Brand Badge */}
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#ff6325]/20 to-[#033266]/20 border border-[#ff6325]/30 flex items-center justify-center mb-5 shrink-0 shadow-2xs">
              <Sparkles size={13} className="text-[#ff6325] animate-pulse" />
            </div>

            {/* List of active application icons stacked vertically */}
            <div className="flex flex-col gap-3.5 items-center w-full">
              {/* 1. Calendar circular button */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'calendar' ? null : 'calendar')}
                className="relative group focus:outline-hidden cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-gradient-to-br from-[#ff6325] to-[#ea580c] text-white shadow-[0_4px_12px_rgba(255,99,37,0.4)] scale-105'
                    : 'bg-white dark:bg-[#161c27] hover:bg-orange-50/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:scale-105 shadow-2xs'
                }`}>
                  <div className={`relative w-[18px] h-[18px] rounded-[4px] overflow-hidden flex flex-col items-center justify-center shadow-2xs ${
                    activeTab === 'calendar' ? 'bg-white/20' : 'bg-[#ff6325]'
                  }`}>
                    <div className={`w-full h-[5px] ${activeTab === 'calendar' ? 'bg-white/40' : 'bg-[#d94e09]'}`} />
                    <div className={`flex-1 w-full flex items-center justify-center text-[7.5px] font-black leading-none ${
                      activeTab === 'calendar' ? 'text-white' : 'bg-white dark:bg-[#161c27] text-[#ff6325]'
                    }`}>
                      {new Date().getDate()}
                    </div>
                  </div>
                </div>
                {/* Tooltip */}
                {!activeTab && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Calendar Schedule
                  </div>
                )}
              </button>

              {/* 2. Calculator / Smart Split button */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'calc' ? null : 'calc')}
                className="relative group focus:outline-hidden cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                  activeTab === 'calc'
                    ? 'bg-gradient-to-br from-[#ff6325] to-[#ea580c] text-white shadow-[0_4px_12px_rgba(255,99,37,0.4)] scale-105'
                    : 'bg-white dark:bg-[#161c27] hover:bg-orange-50/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:scale-105 shadow-2xs'
                }`}>
                  <Lightbulb size={16} className={activeTab === 'calc' ? 'text-white' : 'text-amber-500'} />
                </div>
                {/* Tooltip */}
                {!activeTab && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Price &amp; Split Calc
                  </div>
                )}
              </button>

              {/* 3. Tasks / Checklist button */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'tasks' ? null : 'tasks')}
                className="relative group focus:outline-hidden cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-gradient-to-br from-[#ff6325] to-[#ea580c] text-white shadow-[0_4px_12px_rgba(255,99,37,0.4)] scale-105'
                    : 'bg-white dark:bg-[#161c27] hover:bg-orange-50/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:scale-105 shadow-2xs'
                }`}>
                  <CheckSquare size={16} className={activeTab === 'tasks' ? 'text-white' : 'text-sky-500'} />
                </div>
                {/* Tooltip */}
                {!activeTab && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Quick Tasks
                  </div>
                )}
              </button>

              {/* 4. Contacts / Hosts button */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'contacts' ? null : 'contacts')}
                className="relative group focus:outline-hidden cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                  activeTab === 'contacts'
                    ? 'bg-gradient-to-br from-[#ff6325] to-[#ea580c] text-white shadow-[0_4px_12px_rgba(255,99,37,0.4)] scale-105'
                    : 'bg-white dark:bg-[#161c27] hover:bg-orange-50/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#ff6325] hover:scale-105 shadow-2xs'
                }`}>
                  <User size={16} className={activeTab === 'contacts' ? 'text-white' : 'text-indigo-500'} />
                </div>
                {/* Tooltip */}
                {!activeTab && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Host &amp; Support Contacts
                  </div>
                )}
              </button>

              <hr className="w-6 border-t border-slate-200 dark:border-slate-800 my-1 shrink-0" />

              {/* Plus button */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'calc' ? null : 'calc')}
                className="w-8 h-8 rounded-xl bg-white dark:bg-[#161c27] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all flex items-center justify-center relative group shadow-2xs focus:outline-hidden cursor-pointer hover:scale-105"
              >
                <Plus size={14} />
                {/* Tooltip */}
                {!activeTab && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    New Utility Entry
                  </div>
                )}
              </button>
            </div>

            {/* Collapse sidebar button at the bottom */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white dark:bg-[#161c27] hover:bg-orange-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-[#ff6325] transition-all flex items-center justify-center mt-auto relative group shadow-2xs focus:outline-hidden cursor-pointer hover:scale-105"
              title="Close panel"
            >
              <ChevronRight size={15} />
              {/* Tooltip */}
              {!activeTab && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Close Panel
                </div>
              )}
            </button>
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
