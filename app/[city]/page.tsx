import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Clock,
  Check,
  Dog,
  Instagram,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react';
import { seedClubs, cities, Club } from '@/lib/seed-data';
import { citySlug, clubSlugsForCity } from '@/lib/slug';

// Generate static params for all featured cities
export function generateStaticParams() {
  return cities.map((city) => ({
    city: city.slug,
  }));
}

// Rich SEO metadata per city
export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = cities.find((c) => c.slug === params.city);
  if (!city) return { title: 'Not Found' };

  const clubCount = seedClubs.filter((c) => c.city === city.name).length;
  const beginnerCount = seedClubs.filter(
    (c) => c.city === city.name && c.beginner_friendly
  ).length;
  const year = new Date().getFullYear();

  const countSegment = clubCount > 0 ? `${clubCount} ` : '';
  const title = `${countSegment}Running Clubs in ${city.name} (${year}) — Social, Trail & Beginner Groups | Find My Run`;
  const description = `Find ${clubCount || 'the best'} run clubs in ${city.name}. ${beginnerCount} beginner-friendly groups, plus social crews, trail runs and women-only clubs. ${city.description}.`;

  const url = `https://findmyrun.club/${city.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Run Clubs in ${city.name} — Find My Run`,
      description,
      url,
    },
  };
}

const paceConfig = {
  slow: { label: 'Relaxed', color: 'bg-green-100 text-green-700' },
  mixed: { label: 'Mixed', color: 'bg-blue-100 text-blue-700' },
  fast: { label: 'Fast', color: 'bg-orange-100 text-orange-700' },
};

function ClubCard({
  club,
  href,
}: {
  club: Club;
  href: string;
}) {
  const pace = paceConfig[club.pace];

  return (
    <Link
      href={href}
      className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-[#FF6B5B] hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#FF6B5B] transition-colors">
              {club.name}
            </h3>
            {club.verified && (
              <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            {club.influencer_led && (
              <span className="bg-[#FF6B5B] text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                <Sparkles className="w-3 h-3" /> Notable
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
        {club.female_only && (
          <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full flex items-center gap-1">
            <User className="w-3 h-3" /> Women only
          </span>
        )}
        {club.beginner_friendly && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
            Beginner friendly
          </span>
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

      <div className="flex gap-3 items-center">
        {club.instagram && (
          <span className="flex items-center gap-1 text-pink-600 text-sm">
            <Instagram className="w-4 h-4" />@{club.instagram}
          </span>
        )}
        <span className="ml-auto text-[#FF6B5B] group-hover:translate-x-0.5 transition-transform text-sm font-medium inline-flex items-center gap-0.5">
          View club
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = cities.find((c) => c.slug === params.city);
  if (!city) notFound();

  const cityClubs = seedClubs.filter((c) => c.city === city.name);
  const slugMap = clubSlugsForCity(seedClubs, city.name);

  // Group by day
  const clubsByDay: Record<string, Club[]> = {};
  cityClubs.forEach((club) => {
    if (!clubsByDay[club.day]) clubsByDay[club.day] = [];
    clubsByDay[club.day].push(club);
  });

  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const beginnerCount = cityClubs.filter((c) => c.beginner_friendly).length;
  const womenCount = cityClubs.filter((c) => c.female_only).length;
  const dogCount = cityClubs.filter((c) => c.dog_friendly).length;
  const trailCount = cityClubs.filter((c) => c.terrain === 'trail').length;

  // JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://findmyrun.club',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Running Clubs in ${city.name}`,
        item: `https://findmyrun.club/${city.slug}`,
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Running Clubs in ${city.name}`,
    numberOfItems: cityClubs.length,
    itemListElement: cityClubs.map((club, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://findmyrun.club/${city.slug}/${slugMap.get(club.name)}`,
      name: club.name,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {cityClubs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-indigo-200 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            All cities
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            Running Clubs in {city.name}
          </h1>
          <p className="text-indigo-100">{city.description}</p>
          <p className="mt-4 text-white/80">
            {cityClubs.length} club{cityClubs.length !== 1 ? 's' : ''} •{' '}
            {beginnerCount} beginner-friendly
          </p>
        </div>
      </header>

      {/* Editorial intro — placeholder paragraph you can rewrite per city
          to add SEO weight and local colour. */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-gray-700 leading-relaxed">
            Whether you&apos;re new to running or training for your next race,{' '}
            {city.name} has a club for you. From relaxed social groups that finish
            at the pub, to track sessions for serious PB chasers, our directory
            covers {cityClubs.length} club{cityClubs.length !== 1 ? 's' : ''}{' '}
            across the city — including {beginnerCount} beginner-friendly, {womenCount}{' '}
            women-only, {dogCount} dog-friendly and {trailCount} trail-focused
            clubs. All free to try, no affiliation required.
          </p>
        </div>
      </section>

      {/* Quick filter links — long-tail landing pages */}
      {cityClubs.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
              Browse by type
            </p>
            <div className="flex flex-wrap gap-2">
              {beginnerCount > 0 && (
                <Link
                  href={`/beginner-run-clubs/${city.slug}`}
                  className="text-sm bg-white border border-gray-200 hover:border-[#FF6B5B] hover:text-[#FF6B5B] px-3 py-1.5 rounded-full transition-colors"
                >
                  Beginner-friendly ({beginnerCount})
                </Link>
              )}
              {womenCount > 0 && (
                <Link
                  href={`/womens-run-clubs/${city.slug}`}
                  className="text-sm bg-white border border-gray-200 hover:border-[#FF6B5B] hover:text-[#FF6B5B] px-3 py-1.5 rounded-full transition-colors"
                >
                  Women-only ({womenCount})
                </Link>
              )}
              {dogCount > 0 && (
                <Link
                  href={`/dog-friendly-run-clubs/${city.slug}`}
                  className="text-sm bg-white border border-gray-200 hover:border-[#FF6B5B] hover:text-[#FF6B5B] px-3 py-1.5 rounded-full transition-colors"
                >
                  Dog-friendly ({dogCount})
                </Link>
              )}
              {trailCount > 0 && (
                <Link
                  href={`/trail-running-clubs/${city.slug}`}
                  className="text-sm bg-white border border-gray-200 hover:border-[#FF6B5B] hover:text-[#FF6B5B] px-3 py-1.5 rounded-full transition-colors"
                >
                  Trail running ({trailCount})
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {dayOrder.map((day) => {
          const clubs = clubsByDay[day];
          if (!clubs || clubs.length === 0) return null;

          return (
            <section key={day} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                {day}s
                <span className="text-sm font-normal text-gray-500">
                  ({clubs.length} club{clubs.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <div className="grid gap-4">
                {clubs.map((club) => {
                  const slug = slugMap.get(club.name);
                  if (!slug) return null;
                  return (
                    <ClubCard
                      key={club.name}
                      club={club}
                      href={`/${city.slug}/${slug}`}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center mt-8">
          <h3 className="font-semibold text-gray-900 mb-2">
            Know a run club in {city.name}?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Help other runners discover it
          </p>
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
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="hover:text-indigo-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">
            © {new Date().getFullYear()} Find My Run
          </p>
        </div>
      </footer>
    </div>
  );
}
