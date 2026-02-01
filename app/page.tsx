'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Clock, X, Heart, Dog, Coffee, Instagram, Check, Plus, ExternalLink, Sparkles, User, Users, Key, CalendarDays } from 'lucide-react';
import { seedClubs as fallbackClubs, cities, Club } from '@/lib/seed-data';

// Helper to get/create visitor ID for attendance tracking
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let visitorId = localStorage.getItem('fmr_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('fmr_visitor_id', visitorId);
  }
  return visitorId;
}

// Helper to get next session date for a club
function getNextSessionDate(day: string): string {
  const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
  const today = new Date();
  const todayIndex = today.getDay();
  let daysUntil = dayIndex - todayIndex;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0 && today.getHours() >= 20) daysUntil = 7; // If it's late, show next week
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  return nextDate.toISOString().split('T')[0];
}

// Brand colours
const colors = {
  coral: '#FF6B5B',
  coralDark: '#E55A4A',
  peach: '#FFAB9F',
  cream: '#FFF5F3',
  charcoal: '#2D2D2D',
};

// Route Path Logo Component
function Logo({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="60" rx="14" fill={colors.cream} />
      <path d="M15 40 Q25 15 35 32 Q45 48 50 25" stroke={colors.coral} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="15" cy="40" r="4" fill={colors.coral} />
      <circle cx="50" cy="25" r="4" fill={colors.charcoal} />
    </svg>
  );
}

// Config
const paceConfig = {
  slow: { label: 'Relaxed', color: 'bg-teal-100 text-teal-700 border border-teal-200' },
  mixed: { label: 'Mixed', color: 'bg-orange-100 text-orange-700 border border-orange-200' },
  fast: { label: 'Fast', color: 'bg-rose-100 text-rose-700 border border-rose-200' },
};

const terrainConfig = {
  road: { label: 'Road', icon: '🛣️' },
  trail: { label: 'Trail', icon: '⛰️' },
  mixed: { label: 'Mixed', icon: '🏃' },
};

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Pace ranges in min/km for filtering
const paceRanges = [
  { label: 'Any pace', value: 'all', minPace: 0, maxPace: Infinity },
  { label: '< 4:30/km', value: 'fast', minPace: 0, maxPace: 4.5, description: 'Fast' },
  { label: '4:30-5:30/km', value: 'moderate', minPace: 4.5, maxPace: 5.5, description: 'Moderate' },
  { label: '5:30-6:30/km', value: 'steady', minPace: 5.5, maxPace: 6.5, description: 'Steady' },
  { label: '6:30-7:30/km', value: 'relaxed', minPace: 6.5, maxPace: 7.5, description: 'Relaxed' },
  { label: '> 7:30/km', value: 'easy', minPace: 7.5, maxPace: Infinity, description: 'Easy' },
];

// Helper to convert 5k time string to min/km pace
function getPaceFromClub(club: Club): number | null {
  // Use pace_5k if available, otherwise estimate from pace category
  if (club.pace_5k) {
    // Parse strings like "25-30 mins" or "sub-20"
    const match = club.pace_5k.match(/(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      // Convert 5k time to min/km (divide by 5)
      return minutes / 5;
    }
  }
  // Fallback to pace category
  switch (club.pace) {
    case 'fast': return 4.5;
    case 'mixed': return 5.5;
    case 'slow': return 7;
    default: return null;
  }
}

// Club Card Component
function ClubCard({ club, onClick, attendanceCount }: { club: Club; onClick: () => void; attendanceCount?: number }) {
  const pace = paceConfig[club.pace];
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#FF6B5B] hover:shadow-lg hover:shadow-[#FF6B5B]/10 transition-all text-left group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-gray-900 group-hover:text-[#FF6B5B] transition-colors">{club.name}</h3>
          {club.verified && (
            <span className="bg-teal-100 text-teal-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
            </span>
          )}
          {club.influencer_led && (
            <span className="bg-[#FF6B5B] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" /> Notable
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {attendanceCount && attendanceCount > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
              <Users className="w-3 h-3" /> {attendanceCount} going
            </span>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pace.color}`}>
            {pace.label}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
        <MapPin className="w-3.5 h-3.5 text-[#FF6B5B]" />
        {club.area}, {club.city}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {club.day}s
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          {club.time}
        </span>
        {club.terrain && (
          <span className="text-gray-400">
            {terrainConfig[club.terrain]?.icon} {terrainConfig[club.terrain]?.label}
          </span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {club.female_only && (
          <span className="text-xs bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full border border-pink-200 flex items-center gap-1">
            <User className="w-3 h-3" /> Women only
          </span>
        )}
        {club.beginner_friendly && (
          <span className="text-xs bg-[#FFF5F3] text-[#FF6B5B] px-2.5 py-1 rounded-full border border-[#FFAB9F]">Beginner friendly</span>
        )}
        {club.dog_friendly && (
          <span className="text-xs bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
            <Dog className="w-3 h-3" /> Dogs OK
          </span>
        )}
        {club.instagram && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Instagram className="w-3 h-3" />
          </span>
        )}
      </div>
    </button>
  );
}

// Club Detail Modal
function ClubDetail({ club, onClose, attendanceCount, onAttendanceUpdate }: {
  club: Club;
  onClose: () => void;
  attendanceCount?: number;
  onAttendanceUpdate?: () => void;
}) {
  const pace = paceConfig[club.pace];
  const [isGoing, setIsGoing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localCount, setLocalCount] = useState(attendanceCount || 0);

  // Check if user already marked as going (from localStorage)
  useEffect(() => {
    const goingClubs = JSON.parse(localStorage.getItem('fmr_going') || '{}');
    const sessionDate = getNextSessionDate(club.day);
    const key = `${club.name}_${sessionDate}`;
    setIsGoing(!!goingClubs[key]);
  }, [club.name, club.day]);

  const handleImGoing = async () => {
    if (isGoing || isLoading) return;
    setIsLoading(true);

    const sessionDate = getNextSessionDate(club.day);
    const visitorId = getVisitorId();

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubName: club.name,
          sessionDate,
          visitorId,
        }),
      });

      if (response.ok) {
        setIsGoing(true);
        setLocalCount(prev => prev + 1);

        // Save to localStorage
        const goingClubs = JSON.parse(localStorage.getItem('fmr_going') || '{}');
        goingClubs[`${club.name}_${sessionDate}`] = true;
        localStorage.setItem('fmr_going', JSON.stringify(goingClubs));

        onAttendanceUpdate?.();
      }
    } catch (error) {
      console.error('Failed to record attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#FF6B5B] to-[#FFAB9F] p-6 text-white rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-2xl font-black">{club.name}</h2>
            {club.verified && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            {club.influencer_led && (
              <span className="bg-white text-[#FF6B5B] text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3" /> Notable Club
              </span>
            )}
          </div>
          <p className="text-white/90 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {club.area}, {club.city}
          </p>
          {localCount > 0 && (
            <p className="text-white/90 flex items-center gap-1 mt-2 text-sm">
              <Users className="w-4 h-4" />
              {localCount} runner{localCount !== 1 ? 's' : ''} going this week
            </p>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-xl font-black text-gray-900">{club.day}s</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Weekly</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-xl font-black text-gray-900">{club.time}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Start</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-xl font-black text-gray-900">{club.distance || '?'}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Distance</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${pace.color}`}>{pace.label} pace</span>
            {club.terrain && (
              <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {terrainConfig[club.terrain]?.icon} {terrainConfig[club.terrain]?.label}
              </span>
            )}
            {club.female_only && <span className="text-sm px-3 py-1.5 rounded-full bg-pink-100 text-pink-600 border border-pink-200">👩 Women only</span>}
            {club.beginner_friendly && <span className="text-sm px-3 py-1.5 rounded-full bg-[#FFF5F3] text-[#FF6B5B] border border-[#FFAB9F]">✓ Beginner friendly</span>}
            {club.dog_friendly && <span className="text-sm px-3 py-1.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">🐕 Dogs welcome</span>}
          </div>

          {club.description && <p className="text-gray-600 mb-5 leading-relaxed">{club.description}</p>}

          <div className="bg-[#FFF5F3] rounded-xl p-4 mb-5 border border-[#FFAB9F]">
            <p className="text-sm font-bold text-[#FF6B5B] mb-1 uppercase tracking-wide">📍 Meeting Point</p>
            <p className="text-gray-800">{club.meeting_point}</p>
          </div>

          {club.post_run && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
              <Coffee className="w-4 h-4 text-[#FF6B5B]" />
              <span>Post-run: <span className="text-gray-800 font-medium">{club.post_run}</span></span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            {club.instagram && (
              <a
                href={`https://instagram.com/${club.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                <Instagram className="w-4 h-4" />
                @{club.instagram}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {club.website && (
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#FF6B5B] hover:text-[#E55A4A] text-sm font-medium"
              >
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Claim this club link */}
          {club.id && (
            <div className="border-t border-gray-100 pt-4 mb-4">
              <Link
                href={`/claim/${club.id}`}
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-[#FF6B5B] text-sm transition-colors"
              >
                <Key className="w-4 h-4" />
                Run this club? Claim ownership
              </Link>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleImGoing}
              disabled={isGoing || isLoading}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isGoing
                  ? 'bg-green-500 text-white'
                  : 'bg-[#FF6B5B] text-white hover:bg-[#E55A4A] shadow-lg shadow-[#FF6B5B]/25'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isGoing ? (
                <>
                  <Check className="w-5 h-5" />
                  You&apos;re going!
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  I&apos;m coming this week
                </>
              )}
            </button>
            <button className="px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// This Week View
function ThisWeekView({ clubs, onSelectClub }: { clubs: Club[]; onSelectClub: (club: Club) => void }) {
  const today = new Date();
  const todayDay = dayOrder[today.getDay() === 0 ? 6 : today.getDay() - 1];

  const sessionsByDay = useMemo(() => {
    const grouped: Record<string, Club[]> = {};
    dayOrder.forEach(day => {
      grouped[day] = clubs.filter(c => c.day === day);
    });
    return grouped;
  }, [clubs]);

  const todayIndex = dayOrder.indexOf(todayDay);
  const orderedDays = [...dayOrder.slice(todayIndex), ...dayOrder.slice(0, todayIndex)];

  return (
    <div className="space-y-6">
      {orderedDays.map((day, idx) => {
        const daySessions = sessionsByDay[day];
        if (daySessions.length === 0) return null;

        return (
          <div key={day}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-gray-900 text-lg">
                {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : day}
              </h3>
              {idx === 0 && (
                <span className="text-xs bg-[#FF6B5B] text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Live</span>
              )}
              <span className="text-sm text-gray-400">
                {daySessions.length} run{daySessions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {daySessions.map(club => (
                <button
                  key={club.name}
                  onClick={() => onSelectClub(club)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-200 hover:border-[#FF6B5B] transition-all text-left group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px] bg-[#FFF5F3] rounded-lg py-2 px-3 border border-[#FFAB9F]">
                      <p className="text-lg font-black text-[#FF6B5B]">{club.time}</p>
                      <p className="text-xs text-gray-500">{club.distance}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 truncate group-hover:text-[#FF6B5B] transition-colors">{club.name}</p>
                        {club.influencer_led && (
                          <span className="bg-[#FF6B5B] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 font-semibold shrink-0">
                            <Sparkles className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{club.area}, {club.city}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${paceConfig[club.pace].color} whitespace-nowrap`}>
                      {paceConfig[club.pace].label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main App
export default function Home() {
  const [view, setView] = useState<'discover' | 'thisweek'>('discover');
  const [searchCity, setSearchCity] = useState('all');
  const [filterPace, setFilterPace] = useState('all');
  const [filterPaceKm, setFilterPaceKm] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [filterTerrain, setFilterTerrain] = useState('all');
  const [filterBeginner, setFilterBeginner] = useState(false);
  const [filterDog, setFilterDog] = useState(false);
  const [filterFemale, setFilterFemale] = useState(false);
  const [filterInfluencer, setFilterInfluencer] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceCounts, setAttendanceCounts] = useState<Record<string, number>>({});
  const [clubs, setClubs] = useState<Club[]>(fallbackClubs);

  // Fetch clubs from database
  const fetchClubs = useCallback(async () => {
    try {
      const response = await fetch('/api/clubs');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setClubs(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    }
  }, []);

  // Fetch attendance counts
  const fetchAttendance = useCallback(async () => {
    try {
      const response = await fetch('/api/attendance');
      if (response.ok) {
        const data = await response.json();
        setAttendanceCounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
    fetchAttendance();
  }, [fetchClubs, fetchAttendance]);

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      if (searchCity !== 'all' && club.city.toLowerCase() !== searchCity.toLowerCase()) return false;
      if (filterPace !== 'all' && club.pace !== filterPace) return false;
      if (filterDay !== 'all' && club.day !== filterDay) return false;
      // Min/km pace filter
      if (filterPaceKm !== 'all') {
        const paceRange = paceRanges.find(p => p.value === filterPaceKm);
        if (paceRange) {
          const clubPace = getPaceFromClub(club);
          if (clubPace === null || clubPace < paceRange.minPace || clubPace >= paceRange.maxPace) {
            return false;
          }
        }
      }
      if (filterTerrain !== 'all' && club.terrain !== filterTerrain) return false;
      if (filterBeginner && !club.beginner_friendly) return false;
      if (filterDog && !club.dog_friendly) return false;
      if (filterFemale && !club.female_only) return false;
      if (filterInfluencer && !club.influencer_led) return false;
      if (searchQuery && !club.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !club.area.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [clubs, searchCity, filterPace, filterDay, filterPaceKm, filterTerrain, filterBeginner, filterDog, filterFemale, filterInfluencer, searchQuery]);

  const clearFilters = () => {
    setFilterPace('all');
    setFilterPaceKm('all');
    setFilterDay('all');
    setFilterTerrain('all');
    setFilterBeginner(false);
    setFilterDog(false);
    setFilterFemale(false);
    setFilterInfluencer(false);
    setSearchCity('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterPace !== 'all' || filterPaceKm !== 'all' || filterDay !== 'all' || filterTerrain !== 'all' || filterBeginner || filterDog || filterFemale || filterInfluencer || searchCity !== 'all' || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">findmyrun</h1>
                <p className="text-xs text-gray-400 font-medium">Run clubs near you</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setView('discover')}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                    view === 'discover' ? 'bg-[#FF6B5B] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Discover
                </button>
                <button
                  onClick={() => setView('thisweek')}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                    view === 'thisweek' ? 'bg-[#FF6B5B] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  This Week
                </button>
              </div>

              {/* Quick Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/events"
                  className="text-gray-500 hover:text-[#FF6B5B] px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <CalendarDays className="w-4 h-4" />
                  Events
                </Link>
              </div>

              <Link
                href="/submit"
                className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Club</span>
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search clubs or areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
              />
            </div>
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city.slug} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
            >
              <option value="all">Any day</option>
              {dayOrder.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              value={filterPaceKm}
              onChange={(e) => setFilterPaceKm(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
            >
              {paceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <select
              value={filterTerrain}
              onChange={(e) => setFilterTerrain(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
            >
              <option value="all">Any terrain</option>
              <option value="road">🛣️ Road</option>
              <option value="trail">⛰️ Trail</option>
              <option value="mixed">🏃 Mixed</option>
            </select>
            <button
              onClick={() => setFilterFemale(!filterFemale)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filterFemale ? 'bg-pink-100 border-pink-300 text-pink-600' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Women only
            </button>
            <button
              onClick={() => setFilterInfluencer(!filterInfluencer)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filterInfluencer ? 'bg-[#FFF5F3] border-[#FFAB9F] text-[#FF6B5B]' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Notable
            </button>
            <button
              onClick={() => setFilterBeginner(!filterBeginner)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filterBeginner ? 'bg-[#FFF5F3] border-[#FFAB9F] text-[#FF6B5B]' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
              }`}
            >
              Beginner friendly
            </button>
            <button
              onClick={() => setFilterDog(!filterDog)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filterDog ? 'bg-amber-100 border-amber-300 text-amber-600' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
              }`}
            >
              <Dog className="w-3.5 h-3.5" />
              Dogs OK
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        {view === 'discover' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="text-gray-900 font-bold">{filteredClubs.length}</span> club{filteredClubs.length !== 1 ? 's' : ''} found
                {searchCity !== 'all' && <span> in <span className="text-[#FF6B5B] font-medium">{searchCity}</span></span>}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#FF6B5B] hover:text-[#E55A4A] font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredClubs.map(club => (
                <ClubCard
                  key={club.name}
                  club={club}
                  onClick={() => setSelectedClub(club)}
                  attendanceCount={attendanceCounts[club.name]}
                />
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏃</div>
                <p className="text-gray-500 mb-2">No clubs match your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-[#FF6B5B] text-sm font-medium hover:text-[#E55A4A]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        ) : (
          <ThisWeekView clubs={filteredClubs} onSelectClub={setSelectedClub} />
        )}

        {/* City Quick Links */}
        <div className="mt-16">
          <h2 className="text-xl font-black text-gray-900 mb-6">Browse by City</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cities.map(city => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#FF6B5B] hover:shadow-md transition-all group"
              >
                <p className="font-bold text-gray-900 group-hover:text-[#FF6B5B] transition-colors">{city.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {clubs.filter(c => c.city === city.name).length} clubs
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">Run a club? <span className="text-gray-900 font-medium">Get listed for free.</span></p>
          <Link
            href="/submit"
            className="bg-[#FF6B5B] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#E55A4A] transition-all shadow-md shadow-[#FF6B5B]/25"
          >
            Add your club
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedClub && (
        <ClubDetail
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          attendanceCount={attendanceCounts[selectedClub.name]}
          onAttendanceUpdate={fetchAttendance}
        />
      )}
    </div>
  );
}
