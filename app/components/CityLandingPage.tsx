import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  Check,
  Dog,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react';
import type { Club } from '@/lib/seed-data';
import { citySlug, clubSlugsForCity } from '@/lib/slug';

export interface CityLandingConfig {
  /** URL path prefix, e.g. 'beginner-run-clubs' */
  pathPrefix: string;
  /** Headline noun, e.g. 'beginner-friendly run clubs' */
  label: string;
  /** Keyword that Google users search for, e.g. 'beginner run clubs' */
  keyword: string;
  /** One-sentence intro (editorial) */
  intro: string;
  /** Predicate to test which clubs qualify */
  match: (club: Club) => boolean;
}

export function CityLandingPage({
  cityName,
  citySlugParam,
  clubs,
  cityDescription,
  config,
}: {
  cityName: string;
  citySlugParam: string;
  clubs: Club[];
  cityDescription?: string;
  config: CityLandingConfig;
}) {
  const matches = clubs.filter(
    (c) =>
      c.city.toLowerCase() === cityName.toLowerCase() && config.match(c)
  );
  const slugMap = clubSlugsForCity(clubs, cityName);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://findmyrun.club' },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Running Clubs in ${cityName}`,
        item: `https://findmyrun.club/${citySlugParam}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${config.label} in ${cityName}`,
        item: `https://findmyrun.club/${config.pathPrefix}/${citySlugParam}`,
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${config.label} in ${cityName}`,
    numberOfItems: matches.length,
    itemListElement: matches.map((club, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://findmyrun.club/${citySlugParam}/${slugMap.get(club.name)}`,
      name: club.name,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {matches.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <nav
          className="max-w-3xl mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-1.5"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#FF6B5B]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <Link href={`/${citySlugParam}`} className="hover:text-[#FF6B5B]">
            {cityName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-700 font-medium">{config.label}</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="bg-gradient-to-r from-[#FF6B5B] to-[#FFAB9F] text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href={`/${citySlugParam}`}
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            All clubs in {cityName}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 capitalize">
            {config.label} in {cityName}
          </h1>
          <p className="text-white/90">
            {matches.length} club{matches.length !== 1 ? 's' : ''}
            {cityDescription ? ` · ${cityDescription}` : ''}
          </p>
        </div>
      </header>

      {/* Intro */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-gray-700 leading-relaxed">{config.intro}</p>
        </div>
      </section>

      {/* Clubs */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {matches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="text-5xl mb-4">🏃</div>
            <p className="text-gray-900 font-bold mb-1">
              No {config.keyword} in {cityName} yet
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Know one? Help us grow the directory.
            </p>
            <Link
              href="/submit"
              className="inline-block bg-[#FF6B5B] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#E55A4A] transition-colors"
            >
              Add a club
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((club) => {
              const slug = slugMap.get(club.name);
              if (!slug) return null;
              return (
                <Link
                  key={club.name}
                  href={`/${citySlugParam}/${slug}`}
                  className="block bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#FF6B5B] hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#FF6B5B] transition-colors">
                        {club.name}
                      </h3>
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
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B5B]" />
                    {club.area}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {club.day}s
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {club.time}
                    </span>
                    {club.distance && (
                      <span className="text-gray-400">{club.distance}</span>
                    )}
                  </div>
                  {club.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {club.description}
                    </p>
                  )}
                  <div className="flex gap-1.5 flex-wrap">
                    {club.female_only && (
                      <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <User className="w-3 h-3" /> Women
                      </span>
                    )}
                    {club.dog_friendly && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Dog className="w-3 h-3" /> Dogs
                      </span>
                    )}
                    {club.beginner_friendly && (
                      <span className="text-xs bg-[#FFF5F3] text-[#FF6B5B] px-2 py-0.5 rounded-full border border-[#FFAB9F]">
                        Beginner
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Back to city */}
        <div className="mt-10 text-center">
          <Link
            href={`/${citySlugParam}`}
            className="inline-flex items-center gap-1 text-[#FF6B5B] hover:text-[#E55A4A] font-medium"
          >
            See all run clubs in {cityName}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Find My Run
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static-params helper — returns cities that have at least one matching club.
// ---------------------------------------------------------------------------

export function landingStaticParams(
  clubs: Club[],
  match: (c: Club) => boolean
): Array<{ city: string }> {
  const matchedCities = new Set(clubs.filter(match).map((c) => citySlug(c.city)));
  return Array.from(matchedCities).map((city) => ({ city }));
}
