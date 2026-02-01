'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft, Heart, X, Target, TrendingUp, Users } from 'lucide-react';
import { cities } from '@/lib/seed-data';

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

interface CharityRun {
  id: string;
  name: string;
  charity_name: string;
  description: string | null;
  city: string;
  area: string | null;
  event_date: string;
  start_time: string;
  distance: string | null;
  meeting_point: string;
  fundraising_url: string | null;
  fundraising_target: number | null;
  fundraising_current: number | null;
  registration_url: string | null;
  organizer_name: string | null;
  instagram: string | null;
  website: string | null;
  verified: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(dateString: string): { day: string; month: string; weekday: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString('en-GB', { month: 'short' }),
    weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
  };
}

function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateString);
  eventDate.setHours(0, 0, 0, 0);
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{formatCurrency(current)} raised</span>
        <span>{formatCurrency(target)} goal</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-[#FF6B5B] to-[#FFAB9F] h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-[#FF6B5B] font-medium mt-1">{Math.round(percentage)}% of goal</p>
    </div>
  );
}

function CharityCard({ charityRun, onClick }: { charityRun: CharityRun; onClick: () => void }) {
  const dateInfo = formatShortDate(charityRun.event_date);
  const daysUntil = getDaysUntil(charityRun.event_date);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-200 hover:border-[#FF6B5B] hover:shadow-lg hover:shadow-[#FF6B5B]/10 transition-all text-left group overflow-hidden"
    >
      <div className="flex">
        {/* Date badge */}
        <div className="bg-gradient-to-b from-pink-100 to-pink-50 p-4 flex flex-col items-center justify-center min-w-[80px] border-r border-gray-100">
          <Heart className="w-4 h-4 text-pink-500 mb-1" />
          <span className="text-2xl font-black text-pink-600">{dateInfo.day}</span>
          <span className="text-xs font-medium text-gray-600">{dateInfo.month}</span>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-[#FF6B5B] transition-colors">
                {charityRun.name}
              </h3>
              <p className="text-sm text-pink-600 font-medium">
                Supporting {charityRun.charity_name}
              </p>
            </div>
            {charityRun.verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                ✓ Verified
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B5B]" />
            {charityRun.area ? `${charityRun.area}, ${charityRun.city}` : charityRun.city}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {charityRun.start_time}
            </span>
            {charityRun.distance && (
              <span className="text-gray-400">
                {charityRun.distance}
              </span>
            )}
          </div>

          {charityRun.fundraising_target && charityRun.fundraising_current !== null && (
            <ProgressBar
              current={charityRun.fundraising_current}
              target={charityRun.fundraising_target}
            />
          )}

          {daysUntil <= 14 && daysUntil >= 0 && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                daysUntil === 0 ? 'bg-red-100 text-red-600' :
                daysUntil <= 3 ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days away`}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function CharityDetail({ charityRun, onClose }: { charityRun: CharityRun; onClose: () => void }) {
  const daysUntil = getDaysUntil(charityRun.event_date);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-pink-500 to-pink-400 p-6 text-white rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Charity Run</span>
          </div>
          <h2 className="text-2xl font-black">{charityRun.name}</h2>
          <p className="text-white/90 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {charityRun.area ? `${charityRun.area}, ${charityRun.city}` : charityRun.city}
          </p>
        </div>

        <div className="p-6">
          {/* Charity highlight */}
          <div className="bg-pink-50 rounded-xl p-4 mb-5 border border-pink-200">
            <p className="text-sm font-bold text-pink-600 mb-1 uppercase tracking-wide">❤️ Supporting</p>
            <p className="text-lg font-bold text-gray-900">{charityRun.charity_name}</p>
          </div>

          {/* Fundraising progress */}
          {charityRun.fundraising_target && (
            <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-[#FF6B5B]" />
                <span className="font-bold text-gray-900">Fundraising Progress</span>
              </div>
              <ProgressBar
                current={charityRun.fundraising_current || 0}
                target={charityRun.fundraising_target}
              />
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-xl font-black text-gray-900">{formatDate(charityRun.event_date).split(',')[0]}</p>
              <p className="text-sm text-gray-500">{formatDate(charityRun.event_date).split(',').slice(1).join(',').trim()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-xl font-black text-gray-900">{charityRun.start_time}</p>
              <p className="text-sm text-gray-500">Start time</p>
            </div>
          </div>

          {daysUntil >= 0 && daysUntil <= 14 && (
            <div className={`rounded-xl p-3 mb-5 text-center ${
              daysUntil === 0 ? 'bg-red-50 text-red-700' :
              daysUntil <= 3 ? 'bg-orange-50 text-orange-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              <p className="font-bold">
                {daysUntil === 0 ? '🏃 Happening today!' :
                 daysUntil === 1 ? '📅 Tomorrow!' :
                 `📅 ${daysUntil} days until the event`}
              </p>
            </div>
          )}

          {charityRun.distance && (
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                🏃 {charityRun.distance}
              </span>
            </div>
          )}

          {charityRun.description && (
            <p className="text-gray-600 mb-5 leading-relaxed">{charityRun.description}</p>
          )}

          <div className="bg-[#FFF5F3] rounded-xl p-4 mb-5 border border-[#FFAB9F]">
            <p className="text-sm font-bold text-[#FF6B5B] mb-1 uppercase tracking-wide">📍 Meeting Point</p>
            <p className="text-gray-800">{charityRun.meeting_point}</p>
          </div>

          {charityRun.organizer_name && (
            <p className="text-sm text-gray-500 mb-5">
              Organised by <span className="font-medium text-gray-700">{charityRun.organizer_name}</span>
            </p>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4 mb-6">
            {charityRun.website && (
              <a
                href={charityRun.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#FF6B5B] hover:text-[#E55A4A] text-sm font-medium"
              >
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {charityRun.fundraising_url ? (
              <a
                href={charityRun.fundraising_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-pink-500 text-white py-3.5 rounded-xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/25 text-center flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Donate Now
              </a>
            ) : charityRun.registration_url ? (
              <a
                href={charityRun.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#FF6B5B] text-white py-3.5 rounded-xl font-bold hover:bg-[#E55A4A] transition-all shadow-lg shadow-[#FF6B5B]/25 text-center flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Sign Up to Run
              </a>
            ) : (
              <button className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-xl font-bold cursor-not-allowed">
                Just Show Up!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample charity runs for display when database is empty
const sampleCharityRuns: CharityRun[] = [
  {
    id: '1',
    name: 'Run for Mental Health',
    charity_name: 'Mind UK',
    description: 'Join us for a 5K run to raise awareness and funds for mental health support. All abilities welcome - walk, jog or run!',
    city: 'Manchester',
    area: 'Heaton Park',
    event_date: '2026-03-22',
    start_time: '10:00',
    distance: '5km',
    meeting_point: 'Heaton Park main entrance',
    fundraising_url: 'https://justgiving.com/example',
    fundraising_target: 10000,
    fundraising_current: 6543,
    registration_url: 'https://example.com/register',
    organizer_name: 'Manchester Run Club',
    instagram: null,
    website: 'https://example.com',
    verified: true,
  },
  {
    id: '2',
    name: 'Rainbow Run',
    charity_name: 'Pride Foundation',
    description: 'A colorful 10K celebrating diversity and inclusion. Get ready to be covered in rainbow powder!',
    city: 'London',
    area: 'Victoria Park',
    event_date: '2026-06-28',
    start_time: '11:00',
    distance: '10km',
    meeting_point: 'Victoria Park East entrance',
    fundraising_url: 'https://justgiving.com/rainbow-run',
    fundraising_target: 25000,
    fundraising_current: 8750,
    registration_url: 'https://example.com/rainbow-run',
    organizer_name: 'London City Runners',
    instagram: null,
    website: null,
    verified: true,
  },
  {
    id: '3',
    name: 'Miles for Macmillan',
    charity_name: 'Macmillan Cancer Support',
    description: 'Run, walk or crawl - every mile counts! Post-run refreshments provided.',
    city: 'Birmingham',
    area: 'Cannon Hill Park',
    event_date: '2026-04-12',
    start_time: '09:30',
    distance: '5km / 10km',
    meeting_point: 'Cannon Hill Park bandstand',
    fundraising_url: 'https://justgiving.com/miles-macmillan',
    fundraising_target: 15000,
    fundraising_current: 12340,
    registration_url: null,
    organizer_name: 'RunBrumCrew',
    instagram: null,
    website: null,
    verified: false,
  },
];

export default function CharityPage() {
  const [charityRuns, setCharityRuns] = useState<CharityRun[]>(sampleCharityRuns);
  const [selectedRun, setSelectedRun] = useState<CharityRun | null>(null);
  const [filterCity, setFilterCity] = useState('all');

  useEffect(() => {
    const fetchCharityRuns = async () => {
      try {
        const response = await fetch('/api/charity-runs');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCharityRuns(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch charity runs:', error);
      }
    };
    fetchCharityRuns();
  }, []);

  const filteredRuns = useMemo(() => {
    return charityRuns.filter(run => {
      if (filterCity !== 'all' && run.city.toLowerCase() !== filterCity.toLowerCase()) return false;
      return true;
    }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [charityRuns, filterCity]);

  // Calculate total raised
  const totalRaised = charityRuns.reduce((sum, run) => sum + (run.fundraising_current || 0), 0);
  const totalTarget = charityRuns.reduce((sum, run) => sum + (run.fundraising_target || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Logo />
                <div>
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">findmyrun</h1>
                  <p className="text-xs text-gray-400 font-medium">Charity Runs</p>
                </div>
              </Link>
            </div>

            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to clubs
            </Link>
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city.slug} value={city.name}>{city.name}</option>
              ))}
            </select>
            {filterCity !== 'all' && (
              <button
                onClick={() => setFilterCity('all')}
                className="text-sm text-[#FF6B5B] hover:text-[#E55A4A] font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6" />
            <h2 className="text-xl font-black">Charity Runs</h2>
          </div>
          <p className="text-white/90 mb-4">Run for a cause. Every step counts.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-black">{formatCurrency(totalRaised)}</p>
              <p className="text-sm text-white/80">Total raised</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-black">{filteredRuns.length}</p>
              <p className="text-sm text-white/80">Upcoming runs</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Upcoming Charity Runs</h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredRuns.length} run{filteredRuns.length !== 1 ? 's' : ''} to support great causes
            </p>
          </div>
        </div>

        {/* Charity Runs List */}
        <div className="space-y-4">
          {filteredRuns.map(run => (
            <CharityCard key={run.id} charityRun={run} onClick={() => setSelectedRun(run)} />
          ))}
        </div>

        {filteredRuns.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-gray-500 mb-2">No charity runs in this city yet</p>
            <button
              onClick={() => setFilterCity('all')}
              className="text-[#FF6B5B] text-sm font-medium hover:text-[#E55A4A]"
            >
              View all cities
            </button>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">Organising a charity run? <span className="text-gray-900 font-medium">Get it listed for free.</span></p>
          <Link
            href="/submit-charity"
            className="bg-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-600 transition-all shadow-md shadow-pink-500/25"
          >
            Submit a charity run
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedRun && (
        <CharityDetail charityRun={selectedRun} onClose={() => setSelectedRun(null)} />
      )}
    </div>
  );
}
