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
  Coffee,
  Sparkles,
  User,
  Users,
  ExternalLink,
  Key,
  ChevronRight,
} from 'lucide-react';
import { seedClubs, cities, Club } from '@/lib/seed-data';
import {
  citySlug,
  clubSlugsForCity,
  findClubBySlug,
  allClubRouteParams,
} from '@/lib/slug';

// ---------------------------------------------------------------------------
// Static generation — one page per club, across every city we have data for.
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return allClubRouteParams(seedClubs).map(({ citySlug, clubSlug }) => ({
    city: citySlug,
    club: clubSlug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata — title, description, OG, canonical, per-club.
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: { city: string; club: string };
}): Promise<Metadata> {
  const club = findClubBySlug(seedClubs, params.city, params.club);
  if (!club) return { title: 'Club not found | Find My Run' };

  const paceLabel =
    club.pace === 'slow' ? 'Relaxed' : club.pace === 'fast' ? 'Fast' : 'Mixed pace';
  const beginner = club.beginner_friendly ? ' Beginner friendly.' : '';
  const description = `${club.name} meets ${club.day}s at ${club.time} in ${club.area}, ${club.city}. ${paceLabel}, ${club.distance || 'varied distance'}.${beginner} ${club.description?.slice(0, 110) ?? ''}`.trim();

  const url = `https://findmyrun.club/${citySlug(club.city)}/${params.club}`;

  return {
    title: `${club.name} — Run Club in ${club.city} (${club.day}s ${club.time}) | Find My Run`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${club.name} — ${club.city} Run Club`,
      description,
      url,
      siteName: 'Find My Run',
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${club.name} — ${club.city} Run Club`,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Tiny UI helpers shared with the page.
// ---------------------------------------------------------------------------

const paceConfig = {
  slow: { label: 'Relaxed', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  mixed: { label: 'Mixed', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  fast: { label: 'Fast', color: 'bg-rose-100 text-rose-700 border-rose-200' },
} as const;

const terrainLabel = {
  road: '🛣️ Road',
  trail: '⛰️ Trail',
  mixed: '🏃 Mixed',
} as const;

function RelatedClubCard({
  club,
  citySlug: cSlug,
  clubSlug,
}: {
  club: Club;
  citySlug: string;
  clubSlug: string;
}) {
  return (
    <Link
      href={`/${cSlug}/${clubSlug}`}
      className="block bg-white rounded-xl p-4 border border-gray-200 hover:border-[#FF6B5B] hover:shadow-md transition-all"
    >
      <p className="font-bold text-gray-900 mb-1">{club.name}</p>
      <p className="text-xs text-gray-500 mb-2">
        {club.area} · {club.day}s {club.time}
      </p>
      <span
        className={`inline-block text-xs px-2 py-0.5 rounded-full border ${paceConfig[club.pace].color}`}
      >
        {paceConfig[club.pace].label}
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClubPage({
  params,
}: {
  params: { city: string; club: string };
}) {
  const club = findClubBySlug(seedClubs, params.city, params.club);
  if (!club) notFound();

  const cityMeta = cities.find(
    (c) => citySlug(c.name) === citySlug(club.city)
  );
  const cSlug = citySlug(club.city);
  const slugMap = clubSlugsForCity(seedClubs, club.city);

  // Related clubs: same city, not this one. Up to 4.
  const related = seedClubs
    .filter((c) => c.city === club.city && c.name !== club.name)
    .slice(0, 4);

  const pace = paceConfig[club.pace];

  // Google Maps deep link for the meeting point
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${club.lat},${club.lng}`;

  // JSON-LD: SportsClub + BreadcrumbList
  const clubJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name: club.name,
    url: `https://findmyrun.club/${cSlug}/${params.club}`,
    description: club.description,
    sport: 'Running',
    address: {
      '@type': 'PostalAddress',
      addressLocality: club.city,
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: club.lat,
      longitude: club.lng,
    },
    ...(club.instagram && {
      sameAs: [
        `https://instagram.com/${club.instagram}`,
        ...(club.website ? [club.website] : []),
      ],
    }),
    event: {
      '@type': 'Event',
      name: `${club.name} weekly run`,
      eventSchedule: {
        '@type': 'Schedule',
        repeatFrequency: 'P1W',
        byDay: `https://schema.org/${club.day}`,
        startTime: club.time,
      },
      location: {
        '@type': 'Place',
        name: club.meeting_point,
        address: `${club.area}, ${club.city}, UK`,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: club.lat,
          longitude: club.lng,
        },
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'GBP',
      },
    },
  };

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
        name: `Running Clubs in ${club.city}`,
        item: `https://findmyrun.club/${cSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: club.name,
        item: `https://findmyrun.club/${cSlug}/${params.club}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clubJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb nav */}
      <div className="bg-white border-b border-gray-200">
        <nav
          className="max-w-3xl mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-1.5"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#FF6B5B]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <Link href={`/${cSlug}`} className="hover:text-[#FF6B5B]">
            {club.city}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-700 font-medium truncate">{club.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="bg-gradient-to-r from-[#FF6B5B] to-[#FFAB9F] text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href={`/${cSlug}`}
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            All clubs in {club.city}
          </Link>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black">{club.name}</h1>
            {club.verified && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            {club.influencer_led && (
              <span className="bg-white text-[#FF6B5B] text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3" /> Notable
              </span>
            )}
          </div>

          <p className="text-white/90 flex items-center gap-1.5 text-lg">
            <MapPin className="w-4 h-4" />
            {club.area}, {club.city}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Key facts */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <p className="text-lg sm:text-xl font-black text-gray-900">{club.day}s</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Weekly</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <p className="text-lg sm:text-xl font-black text-gray-900">{club.time}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Start</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <p className="text-lg sm:text-xl font-black text-gray-900">
              {club.distance || '?'}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Distance</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span
            className={`text-sm px-3 py-1.5 rounded-full font-medium border ${pace.color}`}
          >
            {pace.label} pace
          </span>
          {club.terrain && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {terrainLabel[club.terrain]}
            </span>
          )}
          {club.female_only && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-pink-100 text-pink-600 border border-pink-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Women only
            </span>
          )}
          {club.beginner_friendly && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-[#FFF5F3] text-[#FF6B5B] border border-[#FFAB9F]">
              ✓ Beginner friendly
            </span>
          )}
          {club.dog_friendly && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex items-center gap-1.5">
              <Dog className="w-3.5 h-3.5" /> Dogs welcome
            </span>
          )}
          {club.under_18s && (
            <span className="text-sm px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Under 18s welcome
            </span>
          )}
        </div>

        {/* Description */}
        {club.description && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About {club.name}</h2>
            <p className="text-gray-700 leading-relaxed">{club.description}</p>
          </div>
        )}

        {/* Meeting point */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6B5B]" />
            Meeting point
          </h2>
          <p className="text-gray-800 mb-4">{club.meeting_point}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#FF6B5B] hover:text-[#E55A4A] text-sm font-medium"
          >
            Open in Google Maps
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Post-run */}
        {club.post_run && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 flex items-center gap-3">
            <Coffee className="w-5 h-5 text-[#FF6B5B] shrink-0" />
            <p className="text-gray-700">
              <span className="font-semibold text-gray-900">Post-run:</span>{' '}
              {club.post_run}
            </p>
          </div>
        )}

        {/* Links */}
        {(club.instagram || club.website) && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Find them online</h2>
            <div className="flex flex-wrap gap-4">
              {club.instagram && (
                <a
                  href={`https://instagram.com/${club.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-500 hover:text-pink-600 text-sm font-medium"
                >
                  <Instagram className="w-4 h-4" />@{club.instagram}
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
          </div>
        )}

        {/* Claim CTA */}
        {club.id && (
          <div className="bg-[#FFF5F3] border border-[#FFAB9F] rounded-2xl p-6 mb-8 text-center">
            <div className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-white mb-3">
              <Key className="w-5 h-5 text-[#FF6B5B]" />
            </div>
            <h2 className="font-bold text-gray-900 mb-1">Run this club?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Claim the listing to keep the details up to date and see who&apos;s
              coming.
            </p>
            <Link
              href={`/claim/${club.id}`}
              className="inline-block bg-[#FF6B5B] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#E55A4A] transition-colors"
            >
              Claim this club
            </Link>
          </div>
        )}

        {/* Related clubs */}
        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-black text-gray-900 mb-4">
              More run clubs in {club.city}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => {
                const slug = slugMap.get(r.name);
                if (!slug) return null;
                return (
                  <RelatedClubCard
                    key={r.name}
                    club={r}
                    citySlug={cSlug}
                    clubSlug={slug}
                  />
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/${cSlug}`}
                className="inline-flex items-center gap-1 text-[#FF6B5B] hover:text-[#E55A4A] font-medium text-sm"
              >
                See all clubs in {club.city}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* City context */}
        {cityMeta && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 text-center">
            <h3 className="font-bold text-gray-900 mb-1">
              Running in {club.city}
            </h3>
            <p className="text-sm text-gray-600">{cityMeta.description}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="hover:text-[#FF6B5B]"
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
