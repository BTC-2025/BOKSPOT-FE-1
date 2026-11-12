import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, LocateFixed } from 'lucide-react';
import { useLocationStore, POPULAR_CITIES, ALL_CITIES } from '../lib/store';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationSelectorModal({ isOpen, onClose }: LocationSelectorModalProps) {
  const { city, setLocation, setStatus } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Group cities by first letter for A-Z
  const groupedCities = useMemo(() => {
    const groups: Record<string, string[]> = {};
    const filtered = ALL_CITIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    filtered.forEach(c => {
      const firstLetter = c.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(c);
    });
    return groups;
  }, [searchQuery]);

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleCitySelect = (selectedCity: string, lat?: number, lng?: number) => {
    // If lat/lng not provided, we can either use a geocoding API or fallback to dummy coords
    // For this implementation, we will use some dummy coordinates if not found in POPULAR_CITIES
    let finalLat = lat || 20.5937; // Center of India fallback
    let finalLng = lng || 78.9629;
    
    if (!lat || !lng) {
      const popularMatch = POPULAR_CITIES.find(p => p.name === selectedCity);
      if (popularMatch) {
        finalLat = popularMatch.lat;
        finalLng = popularMatch.lng;
      }
    }
    
    setLocation(finalLat, finalLng, selectedCity);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    setStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
            headers: { 'User-Agent': 'BetaBookingApp/1.0' }
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const address = data.address;
                const cityOrTown = address.city || address.town || address.municipality || 'Current Location';
                setLocation(lat, lng, cityOrTown);
              } else {
                setLocation(lat, lng, 'Current Location');
              }
              onClose();
            })
            .catch(err => {
              console.warn('Reverse geocode failed:', err);
              setLocation(lat, lng, 'Current Location');
              onClose();
            });
        },
        (error) => {
          console.error('GPS Geolocation error:', error);
          alert('Could not access your location automatically. Please allow location permissions in your browser or search for your city manually.');
          setStatus('error');
        }
      );
    } else {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[color:var(--color-surface)] rounded-[2rem] shadow-2xl z-[10001] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header & Search */}
            <div className="p-6 pb-4 border-b border-[color:var(--color-outline-variant)]/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Select Location</h2>
                <button onClick={onClose} className="p-2 hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-outline)]" />
                <input
                  type="text"
                  placeholder="Search city, area or locality"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-[color:var(--color-outline-variant)] rounded-xl py-3 pl-12 pr-4 outline-none focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)] transition-all"
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
              {/* Use Current Location */}
              {!searchQuery && (
                <button 
                  onClick={handleUseCurrentLocation}
                  className="w-full flex items-center gap-3 text-[color:var(--color-primary)] font-bold mb-8 hover:bg-[color:var(--color-primary)]/5 p-3 rounded-xl transition-colors"
                >
                  <LocateFixed size={20} />
                  <span>Use Current Location</span>
                </button>
              )}

              {/* Popular Cities */}
              {!searchQuery && (
                <div className="mb-8">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {POPULAR_CITIES.map(c => (
                      <button
                        key={c.name}
                        onClick={() => handleCitySelect(c.name, c.lat, c.lng)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                          city === c.name 
                            ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 shadow-sm' 
                            : 'border-[color:var(--color-outline-variant)]/30 hover:border-[color:var(--color-outline)] hover:shadow-sm'
                        }`}
                      >
                        <MapPin size={24} className={`mb-2 ${city === c.name ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-outline)]'}`} />
                        <span className="text-xs font-semibold text-center">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Cities (A-Z) */}
              <div>
                {!searchQuery && <h3 className="text-sm font-bold text-[color:var(--color-outline)] mb-4">All Cities</h3>}
                
                {/* A-Z Index */}
                {!searchQuery && (
                  <div className="flex flex-wrap gap-1 mb-6">
                    {alphabets.map(letter => (
                      <a 
                        key={letter} 
                        href={`#city-group-${letter}`}
                        className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
                          groupedCities[letter] 
                            ? 'text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10' 
                            : 'text-[color:var(--color-outline-variant)] cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (!groupedCities[letter]) e.preventDefault();
                        }}
                      >
                        {letter}
                      </a>
                    ))}
                  </div>
                )}

                {/* City List */}
                <div className="space-y-6">
                  {Object.keys(groupedCities).sort().map(letter => (
                    <div key={letter} id={`city-group-${letter}`}>
                      <h4 className="text-xs font-black text-[color:var(--color-outline)] mb-3 pl-2">{letter}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                        {groupedCities[letter].map(c => (
                          <button
                            key={c}
                            onClick={() => handleCitySelect(c)}
                            className={`text-left text-sm px-2 py-1 rounded-md hover:bg-[color:var(--color-surface-variant)] transition-colors ${
                              city === c ? 'font-bold text-[color:var(--color-primary)]' : 'text-[color:var(--color-on-surface-variant)]'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(groupedCities).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-center text-[color:var(--color-outline)] text-sm mb-4">No predefined cities found matching "{searchQuery}"</p>
                      <button
                        onClick={() => handleCitySelect(searchQuery)}
                        className="px-6 py-2 bg-[color:var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                      >
                        Use "{searchQuery}" anyway
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
