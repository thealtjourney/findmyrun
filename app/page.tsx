'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Clock, Users, Filter, X, Heart, Dog, Coffee, Navigation, Instagram, Check, Plus, ExternalLink } from 'lucide-react';
import { seedClubs, cities, Club } from '@/lib/seed-data';

// Config
const paceConfig = {
  slow: { label: 'Relaxed', color: 'bg-green-100 text-green-700', mapColor: '#22c55e' },
  mixed: { label: 'Mixed', color: 'bg-blue-100 text-blue-700', mapColor: '#3b82f6' },
  fast: { label: 'Fast', color: 'bg-orange-100 text-orange-700', mapColor: '#f97316' },
};

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Club Card Component
function ClubCard({ club, onClick }: { club: Club; onClick: () => void }) {
  const pace = paceConfig[club.pace];
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-left"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{club.name}</h3>
          {club.verified && (
            <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Check className="w-3 h-3" />
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${pace.color}`}>
          {pace.label}
        </span>
      </div>

      <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3" />
        {club.area}, {club.city}
      </p>

      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {club.day}s
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {club.time}
        </span>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {club.beginner_friendly && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Beginner friendly</span>
        )}
        {club.dog_friendly && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Dog className="w-3 h-3" /> Dogs OK
          </span>
        )}
        {club.instagram && (
          <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Instagram className="w-3 h-3" />
          </span>
        )}
      </div>
    </button>
  );
}

// Club Detail Modal
function ClubDetail({ club, onClose }: { club: Club; onClose: () => void }) {
  const pace = paceConfig[club.pace];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{club.name}</h2>
            {club.verified && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-indigo-100 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {club.area}, {club.city}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{club.day}s</p>
              <p className="text-xs text-gray-500">Weekly</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{club.time}</p>
              <p className="text-xs text-gray-500">Start time</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{club.distance || '?'}</p>
              <p className="text-xs text-gray-500">Distance</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-sm px-3 py-1 rounded-full ${pace.color}`}>{pace.label} pace</span>
            {club.beginner_friendly && <span className="text-sm px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">✓ Beginner friendly</span>}
            {club.dog_friendly && <span className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700">🐕 Dogs welcome</span>}
          </div>

          {club.description && <p className="text-gray-700 mb-4">{club.description}</p>}

          <div className="bg-indigo-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-indigo-900 mb-1">📍 Meeting Point</p>
            <p className="text-indigo-800">{club.meeting_point}</p>
          </div>

          {club.post_run && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Coffee className="w-4 h-4" />
              <span>Post-run: {club.post_run}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            {club.instagram && (
              <a
                href={`https://instagram.com/${club.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm"
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
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
              >
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              I&apos;m coming this week
            </button>
            <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
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

  // Reorder to start from today
  const todayIndex = dayOrder.indexOf(todayDay);
  const orderedDays = [...dayOrder.slice(todayIndex), ...dayOrder.slice(0, todayIndex)];

  return (
    <div className="space-y-6">
      {orderedDays.map((day, idx) => {
        const daySessions = sessionsByDay[day];
        if (daySessions.length === 0) return null;

        return (
          <div key={day}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-gray-900">
                {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : day}
              </h3>
              {idx === 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Today</span>
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
                  className="w-full bg-white rounded-lg p-3 border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold text-gray-900">{club.time}</p>
                      <p className="text-xs text-gray-500">{club.distance}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{club.name}</p>
                      <p className="text-sm text-gray-500">{club.area}, {club.city}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${paceConfig[club.pace].color} whitespace-nowrap`}>
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
  const [filterBeginner, setFilterBeginner] = useState(false);
  const [filterDog, setFilterDog] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClubs = useMemo(() => {
    return seedClubs.filter(club => {
      if (searchCity !== 'all' && club.city.toLowerCase() !== searchCity.toLowerCase()) return false;
      if (filterPace !== 'all' && club.pace !== filterPace) return false;
      if (filterBeginner && !club.beginner_friendly) return false;
      if (filterDog && !club.dog_friendly) return false;
      if (searchQuery && !club.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !club.area.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [searchCity, filterPace, filterBeginner, filterDog, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-xl">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Find My Run</h1>
                <p className="text-xs text-gray-500">findmyrun.club</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('discover')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    view === 'discover' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Discover
                </button>
                <button
                  onClick={() => setView('thisweek')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    view === 'thisweek' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  This Week
                </button>
              </div>

              <Link
                href="/submit"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1"
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
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
              value={filterPace}
              onChange={(e) => setFilterPace(e.target.value)}
              className="border border-gray-200 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Any pace</option>
              <option value="slow">Relaxed</option>
              <option value="mixed">Mixed</option>
              <option value="fast">Fast</option>
            </select>
            <button
              onClick={() => setFilterBeginner(!filterBeginner)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${
                filterBeginner ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Beginner friendly
            </button>
            <button
              onClick={() => setFilterDog(!filterDog)}
              className={`px-3 py-1 rounded-full text-sm border transition-all flex items-center gap-1 ${
                filterDog ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Dog className="w-3.5 h-3.5" />
              Dog friendly
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {view === 'discover' ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} found
              {searchCity !== 'all' && ` in ${searchCity}`}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredClubs.map(club => (
                <ClubCard key={club.name} club={club} onClick={() => setSelectedClub(club)} />
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No clubs match your filters</p>
                <button
                  onClick={() => { setFilterPace('all'); setFilterBeginner(false); setFilterDog(false); setSearchCity('all'); setSearchQuery(''); }}
                  className="text-indigo-600 text-sm mt-2 hover:underline"
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
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by City</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cities.map(city => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="bg-white rounded-lg p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                <p className="font-medium text-gray-900">{city.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seedClubs.filter(c => c.city === city.name).length} clubs
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-600">Run a club? Get listed for free.</p>
          <Link
            href="/submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Add your club
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedClub && <ClubDetail club={selectedClub} onClose={() => setSelectedClub(null)} />}
    </div>
  );
}
