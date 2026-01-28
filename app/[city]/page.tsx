import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Calendar, Clock, Check, Dog, Instagram, ArrowLeft } from 'lucide-react';
import { seedClubs, cities, Club } from '@/lib/seed-data';

// Generate static params for all cities
export function generateStaticParams() {
  return cities.map((city) => ({
    city: city.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = cities.find(c => c.slug === params.city);
  if (!city) return { title: 'Not Found' };

  const clubCount = seedClubs.filter(c => c.city === city.name).length;

  return {
    title: `Running Clubs in ${city.name} | Find My Run`,
    description: `Discover ${clubCount} run clubs in ${city.name}. ${city.description}. Find social running groups, beginner-friendly clubs, and more.`,
    openGraph: {
      title: `Running Clubs in ${city.name}`,
      description: `${clubCount} run clubs in ${city.name}. ${city.description}`,
    },
  };
}

const paceConfig = {
  slow: { label: 'Relaxed', color: 'bg-green-100 text-green-700' },
  mixed: { label: 'Mixed', color: 'bg-blue-100 text-blue-700' },
  fast: { label: 'Fast', color: 'bg-orange-100 text-orange-700' },
};

function ClubCard({ club }: { club: Club }) {
  const pace = paceConfig[club.pace];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg">{club.name}</h3>
            {club.verified && (
              <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {club.area}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${pace.color}`}>
          {pace.label}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">{club.description}</p>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">📍 Meeting Point</p>
        <p className="text-sm text-gray-600">{club.meeting_point}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {club.day}s
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {club.time}
        </span>
        {club.distance && <span>{club.distance}</span>}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {club.beginner_friendly && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">Beginner friendly</span>
        )}
        {club.dog_friendly && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
            <Dog className="w-3 h-3" /> Dogs OK
          </span>
        )}
        {club.post_run && (
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
            Post-run: {club.post_run}
          </span>
        )}
      </div>

      <div className="flex gap-3">
        {club.instagram && (
          <a
            href={`https://instagram.com/${club.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm"
          >
            <Instagram className="w-4 h-4" />
            @{club.instagram}
          </a>
        )}
        {club.website && (
          <a
            href={club.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            Website →
          </a>
        )}
      </div>
    </div>
  );
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = cities.find(c => c.slug === params.city);

  if (!city) {
    notFound();
  }

  const cityClubs = seedClubs.filter(c => c.city === city.name);

  // Group by day
  const clubsByDay: Record<string, Club[]> = {};
  cityClubs.forEach(club => {
    if (!clubsByDay[club.day]) clubsByDay[club.day] = [];
    clubsByDay[club.day].push(club);
  });

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-1 text-indigo-200 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" />
            All cities
          </Link>
          <h1 className="text-3xl font-bold mb-2">Running Clubs in {city.name}</h1>
          <p className="text-indigo-100">{city.description}</p>
          <p className="mt-4 text-white/80">
            {cityClubs.length} club{cityClubs.length !== 1 ? 's' : ''} •{' '}
            {cityClubs.filter(c => c.beginner_friendly).length} beginner-friendly
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {dayOrder.map(day => {
          const clubs = clubsByDay[day];
          if (!clubs || clubs.length === 0) return null;

          return (
            <section key={day} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                {day}s
                <span className="text-sm font-normal text-gray-500">({clubs.length} club{clubs.length !== 1 ? 's' : ''})</span>
              </h2>
              <div className="grid gap-4">
                {clubs.map(club => (
                  <ClubCard key={club.name} club={club} />
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center mt-8">
          <h3 className="font-semibold text-gray-900 mb-2">Know a run club in {city.name}?</h3>
          <p className="text-gray-600 text-sm mb-4">Help other runners discover it</p>
          <Link
            href="/submit"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Add a club
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
            {cities.map(c => (
              <Link key={c.slug} href={`/${c.slug}`} className="hover:text-indigo-600">
                {c.name}
              </Link>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">© 2025 Find My Run</p>
        </div>
      </footer>
    </div>
  );
}
