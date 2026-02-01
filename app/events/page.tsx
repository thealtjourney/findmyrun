'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ExternalLink, ArrowLeft, Ticket, Tag, Filter, X, Heart } from 'lucide-react';
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

interface Event {
  id: string;
  name: string;
  description: string | null;
  city: string;
  area: string | null;
  event_date: string;
  start_time: string;
  distance: string | null;
  meeting_point: string;
  event_type: 'race' | 'fun_run' | 'special_session' | 'parkrun' | 'social' | 'other';
  is_free: boolean;
  price: number | null;
  price_currency: string;
  registration_url: string | null;
  registration_deadline: string | null;
  max_participants: number | null;
  organizer_name: string | null;
  club_name?: string;
  instagram: string | null;
  website: string | null;
  featured: boolean;
}

const eventTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  race: { label: 'Race', color: 'bg-red-100 text-red-700 border-red-200', icon: '🏆' },
  fun_run: { label: 'Fun Run', color: 'bg-green-100 text-green-700 border-green-200', icon: '🎉' },
  special_session: { label: 'Special Session', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⭐' },
  parkrun: { label: 'Parkrun', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🌳' },
  social: { label: 'Social Run', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🍻' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '🏃' },
};

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

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const typeConfig = eventTypeConfig[event.event_type] || eventTypeConfig.other;
  const dateInfo = formatShortDate(event.event_date);
  const daysUntil = getDaysUntil(event.event_date);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-200 hover:border-[#FF6B5B] hover:shadow-lg hover:shadow-[#FF6B5B]/10 transition-all text-left group overflow-hidden"
    >
      <div className="flex">
        {/* Date badge */}
        <div className="bg-[#FFF5F3] p-4 flex flex-col items-center justify-center min-w-[80px] border-r border-gray-100">
          <span className="text-xs text-gray-500 uppercase">{dateInfo.weekday}</span>
          <span className="text-2xl font-black text-[#FF6B5B]">{dateInfo.day}</span>
          <span className="text-xs font-medium text-gray-600">{dateInfo.month}</span>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-[#FF6B5B] transition-colors">
                {event.name}
              </h3>
              {event.club_name && (
                <p className="text-xs text-gray-500">by {event.club_name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {event.featured && (
                <span className="text-xs bg-[#FF6B5B] text-white px-2 py-0.5 rounded-full font-semibold">
                  Featured
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeConfig.color}`}>
                {typeConfig.icon} {typeConfig.label}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B5B]" />
            {event.area ? `${event.area}, ${event.city}` : event.city}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {event.start_time}
            </span>
            {event.distance && (
              <span className="text-gray-400">
                {event.distance}
              </span>
            )}
            <span className={`flex items-center gap-1 ${event.is_free ? 'text-green-600' : 'text-gray-600'}`}>
              <Ticket className="w-3.5 h-3.5" />
              {event.is_free ? 'Free' : `£${event.price}`}
            </span>
          </div>

          {daysUntil <= 7 && daysUntil >= 0 && (
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

function EventDetail({ event, onClose }: { event: Event; onClose: () => void }) {
  const typeConfig = eventTypeConfig[event.event_type] || eventTypeConfig.other;
  const daysUntil = getDaysUntil(event.event_date);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#FF6B5B] to-[#FFAB9F] p-6 text-white rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {typeConfig.icon} {typeConfig.label}
            </span>
            {event.featured && (
              <span className="bg-white text-[#FF6B5B] text-xs px-2 py-0.5 rounded-full font-bold">
                ⭐ Featured
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black mt-2">{event.name}</h2>
          <p className="text-white/90 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {event.area ? `${event.area}, ${event.city}` : event.city}
          </p>
          {event.club_name && (
            <p className="text-white/80 text-sm mt-1">Organised by {event.club_name}</p>
          )}
        </div>

        <div className="p-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-xl font-black text-gray-900">{formatDate(event.event_date).split(',')[0]}</p>
              <p className="text-sm text-gray-500">{formatDate(event.event_date).split(',').slice(1).join(',').trim()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-xl font-black text-gray-900">{event.start_time}</p>
              <p className="text-sm text-gray-500">Start time</p>
            </div>
          </div>

          {daysUntil >= 0 && (
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

          {/* Event details */}
          <div className="flex flex-wrap gap-2 mb-5">
            {event.distance && (
              <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                🏃 {event.distance}
              </span>
            )}
            <span className={`text-sm px-3 py-1.5 rounded-full ${
              event.is_free ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {event.is_free ? '✓ Free entry' : `💷 £${event.price}`}
            </span>
            {event.max_participants && (
              <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <Users className="w-3.5 h-3.5 inline mr-1" />
                {event.max_participants} max
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-gray-600 mb-5 leading-relaxed">{event.description}</p>
          )}

          <div className="bg-[#FFF5F3] rounded-xl p-4 mb-5 border border-[#FFAB9F]">
            <p className="text-sm font-bold text-[#FF6B5B] mb-1 uppercase tracking-wide">📍 Meeting Point</p>
            <p className="text-gray-800">{event.meeting_point}</p>
          </div>

          {event.registration_deadline && (
            <div className="bg-amber-50 rounded-xl p-3 mb-5 border border-amber-200">
              <p className="text-sm text-amber-700">
                <strong>Registration deadline:</strong> {formatDate(event.registration_deadline)}
              </p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4 mb-6">
            {event.website && (
              <a
                href={event.website}
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
            {event.registration_url ? (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#FF6B5B] text-white py-3.5 rounded-xl font-bold hover:bg-[#E55A4A] transition-all shadow-lg shadow-[#FF6B5B]/25 text-center flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                Register Now
              </a>
            ) : (
              <button className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-xl font-bold cursor-not-allowed">
                No Registration Required
              </button>
            )}
            <button className="px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample events for display when database is empty
const sampleEvents: Event[] = [
  {
    id: '1',
    name: 'Manchester Spring 10K',
    description: 'A scenic 10K through the heart of Manchester, passing iconic landmarks. All abilities welcome!',
    city: 'Manchester',
    area: 'City Centre',
    event_date: '2026-03-15',
    start_time: '09:00',
    distance: '10km',
    meeting_point: 'Piccadilly Gardens',
    event_type: 'race',
    is_free: false,
    price: 15,
    price_currency: 'GBP',
    registration_url: 'https://example.com/register',
    registration_deadline: '2026-03-10',
    max_participants: 500,
    organizer_name: 'Manchester Run Club',
    club_name: 'Manchester Run Club',
    instagram: null,
    website: 'https://example.com',
    featured: true,
  },
  {
    id: '2',
    name: 'London Sunrise Run',
    description: 'Watch the sunrise over the Thames on this early morning social run. Coffee afterwards!',
    city: 'London',
    area: 'South Bank',
    event_date: '2026-02-22',
    start_time: '06:30',
    distance: '5km',
    meeting_point: 'The Tate Modern',
    event_type: 'social',
    is_free: true,
    price: null,
    price_currency: 'GBP',
    registration_url: null,
    registration_deadline: null,
    max_participants: null,
    organizer_name: null,
    club_name: 'London City Runners',
    instagram: null,
    website: null,
    featured: false,
  },
  {
    id: '3',
    name: 'Bristol Half Marathon',
    description: 'The famous Bristol Half Marathon returns! Flat, fast course perfect for PBs.',
    city: 'Bristol',
    area: 'Harbourside',
    event_date: '2026-05-10',
    start_time: '09:00',
    distance: 'Half Marathon',
    meeting_point: 'Millennium Square',
    event_type: 'race',
    is_free: false,
    price: 35,
    price_currency: 'GBP',
    registration_url: 'https://example.com/bristol-half',
    registration_deadline: '2026-04-30',
    max_participants: 10000,
    organizer_name: 'Great Run',
    instagram: null,
    website: 'https://example.com',
    featured: true,
  },
  {
    id: '4',
    name: 'Edinburgh Trail Adventure',
    description: 'Explore the stunning Pentland Hills on this guided trail run. All abilities welcome.',
    city: 'Edinburgh',
    area: 'Pentland Hills',
    event_date: '2026-04-05',
    start_time: '10:00',
    distance: '12km',
    meeting_point: 'Flotterstone Car Park',
    event_type: 'fun_run',
    is_free: true,
    price: null,
    price_currency: 'GBP',
    registration_url: 'https://example.com/edinburgh-trail',
    registration_deadline: null,
    max_participants: 50,
    organizer_name: null,
    club_name: 'Carnethy Hill Running Club',
    instagram: null,
    website: null,
    featured: false,
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterCity, setFilterCity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setEvents(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterCity !== 'all' && event.city.toLowerCase() !== filterCity.toLowerCase()) return false;
      if (filterType !== 'all' && event.event_type !== filterType) return false;
      return true;
    }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [events, filterCity, filterType]);

  const hasActiveFilters = filterCity !== 'all' || filterType !== 'all';

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
                  <p className="text-xs text-gray-400 font-medium">Events</p>
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

          {/* Filters */}
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
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
            >
              <option value="all">All Types</option>
              {Object.entries(eventTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.icon} {config.label}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={() => { setFilterCity('all'); setFilterType('all'); }}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Upcoming Events</h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} coming up
            </p>
          </div>
        </div>

        {/* Featured Events */}
        {filteredEvents.filter(e => e.featured).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#FF6B5B]">⭐</span> Featured
            </h3>
            <div className="space-y-3">
              {filteredEvents.filter(e => e.featured).map(event => (
                <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div className="space-y-3">
          {filteredEvents.filter(e => !e.featured).map(event => (
            <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 mb-2">No events match your filters</p>
            <button
              onClick={() => { setFilterCity('all'); setFilterType('all'); }}
              className="text-[#FF6B5B] text-sm font-medium hover:text-[#E55A4A]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">Organising an event? <span className="text-gray-900 font-medium">Get it listed for free.</span></p>
          <Link
            href="/submit-event"
            className="bg-[#FF6B5B] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#E55A4A] transition-all shadow-md shadow-[#FF6B5B]/25"
          >
            Submit an event
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
