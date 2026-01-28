'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Clock, Users, Filter, X, Heart, Dog, Coffee, Navigation, Instagram, Check, Plus, ExternalLink, Mountain, Sparkles, User } from 'lucide-react';
import { seedClubs, cities, Club } from '@/lib/seed-data';

// Config - Bold Strava/Nike style colors
const paceConfig = {
  slow: { label: 'Relaxed', color: 'bg-teal-500/20 text-teal-400 border border-teal-500/30', mapColor: '#14b8a6' },
  mixed: { label: 'Mixed', color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', mapColor: '#f97316' },
  fast: { label: 'Fast', color: 'bg-rose-500/20 text-rose-400 border border-rose-500/30', mapColor: '#f43f5e' },
};

const terrainConfig = {
  road: { label: 'Road', icon: '🛣️' },
  trail: { label: 'Trail', icon: '⛰️' },
  mixed: { label: 'Mixed', icon: '🏃' },
};

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Club Card Component
function ClubCard({ club, onClick }: { club: Club; onClick: () => void }) {
  const pace = paceConfig[club.pace];
  return (
    <button
      onClick={onClick}
      className="w-full bg-zinc-900 rounded-2xl p-5 border border-zinc-800 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all text-left group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors">{club.name}</h3>
          {club.verified && (
            <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
            </span>
          )}
          {club.influencer_led && (
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" /> Notable
            </span>
          )}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pace.color}`}>
          {pace.label}
        </span>
      </div>

      <p className="text-sm text-zinc-400 flex items-center gap-1.5 mb-3">
        <MapPin className="w-3.5 h-3.5 text-orange-500" />
        {club.area}, {club.city}
      </p>

      <div className="flex items-center gap-4 text-sm text-zinc-300 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          {club.day}s
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          {club.time}
        </span>
        <span className="text-zinc-600">
          {terrainConfig[club.terrain]?.icon} {terrainConfig[club.terrain]?.label}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {club.female_only && (
          <span className="text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full border border-pink-500/30 flex items-center gap-1">
            <User className="w-3 h-3" /> Women only
          </span>
        )}
        {club.beginner_friendly && (
          <span className="text-xs bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20">Beginner friendly</span>
        )}
        {club.dog_friendly && (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
            <Dog className="w-3 h-3" /> Dogs OK
          </span>
        )}
        {club.instagram && (
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full flex items-center gap-1">
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-zinc-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 p-6 text-white rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 rounded-full p-1">
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
              <span className="bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3" /> Notable Club
              </span>
            )}
          </div>
          <p className="text-white/80 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {club.area}, {club.city}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center border border-zinc-700/50">
              <p className="text-xl font-black text-white">{club.day}s</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Weekly</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center border border-zinc-700/50">
              <p className="text-xl font-black text-white">{club.time}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Start</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center border border-zinc-700/50">
              <p className="text-xl font-black text-white">{club.distance || '?'}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Distance</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${pace.color}`}>{pace.label} pace</span>
            {club.terrain && (
              <span className="text-sm px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {terrainConfig[club.terrain]?.icon} {terrainConfig[club.terrain]?.label}
              </span>
            )}
            {club.female_only && <span className="text-sm px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">👩 Women only</span>}
            {club.beginner_friendly && <span className="text-sm px-3 py-1.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">✓ Beginner friendly</span>}
            {club.dog_friendly && <span className="text-sm px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">🐕 Dogs welcome</span>}
          </div>

          {club.description && <p className="text-zinc-300 mb-5 leading-relaxed">{club.description}</p>}

          <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-xl p-4 mb-5 border border-orange-500/20">
            <p className="text-sm font-bold text-orange-400 mb-1 uppercase tracking-wide">📍 Meeting Point</p>
            <p className="text-white">{club.meeting_point}</p>
          </div>

          {club.post_run && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-5">
              <Coffee className="w-4 h-4 text-orange-500" />
              <span>Post-run: <span className="text-white">{club.post_run}</span></span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            {club.instagram && (
              <a
                href={`https://instagram.com/${club.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm font-medium"
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
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium"
              >
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3.5 rounded-xl font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg shadow-orange-500/25">
              I&apos;m coming this week
            </button>
            <button className="px-4 py-3.5 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-colors">
              <Heart className="w-5 h-5 text-zinc-400" />
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
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-white text-lg">
                {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : day}
              </h3>
              {idx === 0 && (
                <span className="text-xs bg-gradient-to-r from-orange-500 to-rose-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Live</span>
              )}
              <span className="text-sm text-zinc-500">
                {daySessions.length} run{daySessions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {daySessions.map(club => (
                <button
                  key={club.name}
                  onClick={() => onSelectClub(club)}
                  className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-orange-500/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px] bg-zinc-800 rounded-lg py-2 px-3">
                      <p className="text-lg font-black text-white">{club.time}</p>
                      <p className="text-xs text-zinc-500">{club.distance}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate group-hover:text-orange-400 transition-colors">{club.name}</p>
                        {club.influencer_led && (
                          <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 font-semibold shrink-0">
                            <Sparkles className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">{club.area}, {club.city}</p>
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
  const [filterTerrain, setFilterTerrain] = useState('all');
  const [filterBeginner, setFilterBeginner] = useState(false);
  const [filterDog, setFilterDog] = useState(false);
  const [filterFemale, setFilterFemale] = useState(false);
  const [filterInfluencer, setFilterInfluencer] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClubs = useMemo(() => {
    return seedClubs.filter(club => {
      if (searchCity !== 'all' && club.city.toLowerCase() !== searchCity.toLowerCase()) return false;
      if (filterPace !== 'all' && club.pace !== filterPace) return false;
      if (filterTerrain !== 'all' && club.terrain !== filterTerrain) return false;
      if (filterBeginner && !club.beginner_friendly) return false;
      if (filterDog && !club.dog_friendly) return false;
      if (filterFemale && !club.female_only) return false;
      if (filterInfluencer && !club.influencer_led) return false;
      if (searchQuery && !club.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !club.area.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [searchCity, filterPace, filterTerrain, filterBeginner, filterDog, filterFemale, filterInfluencer, searchQuery]);

  const clearFilters = () => {
    setFilterPace('all');
    setFilterTerrain('all');
    setFilterBeginner(false);
    setFilterDog(false);
    setFilterFemale(false);
    setFilterInfluencer(false);
    setSearchCity('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterPace !== 'all' || filterTerrain !== 'all' || filterBeginner || filterDog || filterFemale || filterInfluencer || searchCity !== 'all' || searchQuery;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white p-2.5 rounded-xl shadow-lg shadow-orange-500/25">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">FIND MY RUN</h1>
                <p className="text-xs text-zinc-500 font-medium">findmyrun.club</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                <button
                  onClick={() => setView('discover')}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                    view === 'discover' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Discover
                </button>
                <button
                  onClick={() => setView('thisweek')}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                    view === 'thisweek' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  This Week
                </button>
              </div>

              <Link
                href="/submit"
                className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Club</span>
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search clubs or areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Any pace</option>
              <option value="slow">Relaxed</option>
              <option value="mixed">Mixed</option>
              <option value="fast">Fast</option>
            </select>
            <select
              value={filterTerrain}
              onChange={(e) => setFilterTerrain(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Any terrain</option>
              <option value="road">🛣️ Road</option>
              <option value="trail">⛰️ Trail</option>
              <option value="mixed">🏃 Mixed</option>
            </select>
            <button
              onClick={() => setFilterFemale(!filterFemale)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filterFemale ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Women only
            </button>
            <button
              onClick={() => setFilterInfluencer(!filterInfluencer)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filterInfluencer ? 'bg-gradient-to-r from-orange-500/20 to-rose-500/20 border-orange-500/50 text-orange-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Notable
            </button>
            <button
              onClick={() => setFilterBeginner(!filterBeginner)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filterBeginner ? 'bg-teal-500/20 border-teal-500/50 text-teal-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              Beginner friendly
            </button>
            <button
              onClick={() => setFilterDog(!filterDog)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filterDog ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
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
              <p className="text-sm text-zinc-500">
                <span className="text-white font-bold">{filteredClubs.length}</span> club{filteredClubs.length !== 1 ? 's' : ''} found
                {searchCity !== 'all' && <span> in <span className="text-orange-400">{searchCity}</span></span>}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-400 hover:text-orange-300 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredClubs.map(club => (
                <ClubCard key={club.name} club={club} onClick={() => setSelectedClub(club)} />
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏃</div>
                <p className="text-zinc-400 mb-2">No clubs match your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-orange-400 text-sm font-medium hover:text-orange-300"
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
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wide">Browse by City</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cities.map(city => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all group"
              >
                <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{city.name}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {seedClubs.filter(c => c.city === city.name).length} clubs
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-zinc-400">Run a club? <span className="text-white font-medium">Get listed for free.</span></p>
          <Link
            href="/submit"
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg shadow-orange-500/25"
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
