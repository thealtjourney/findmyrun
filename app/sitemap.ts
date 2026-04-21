import type { MetadataRoute } from 'next';
import { seedClubs, cities } from '@/lib/seed-data';
import { allClubRouteParams, citySlug } from '@/lib/slug';

const BASE = 'https://findmyrun.club';

/**
 * Sitemap — generated at build time (and whenever ISR revalidates).
 *
 * Includes:
 *   - Home
 *   - Each featured city page
 *   - Each club page (/[city]/[club])
 *   - Each long-tail landing page (e.g. /beginner-run-clubs/[city])
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static / top-level pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/submit`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // City pages — every city in the featured list
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE}/${city.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Individual club pages
  const clubPages: MetadataRoute.Sitemap = allClubRouteParams(seedClubs).map(
    ({ citySlug: cs, clubSlug }) => ({
      url: `${BASE}/${cs}/${clubSlug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  );

  // Long-tail landing pages — only include where at least one club matches
  type Matcher = (club: typeof seedClubs[number]) => boolean;
  const longTailPaths: Array<{ path: string; match: Matcher }> = [
    { path: 'beginner-run-clubs', match: (c) => c.beginner_friendly },
    { path: 'womens-run-clubs', match: (c) => c.female_only },
    { path: 'dog-friendly-run-clubs', match: (c) => c.dog_friendly },
    { path: 'trail-running-clubs', match: (c) => c.terrain === 'trail' },
  ];

  const longTailPages: MetadataRoute.Sitemap = [];
  for (const { path, match } of longTailPaths) {
    // Group clubs by city and emit one URL per city that has a match.
    const matchedCities = Array.from(
      new Set(seedClubs.filter(match).map((c) => citySlug(c.city)))
    );
    for (const cs of matchedCities) {
      longTailPages.push({
        url: `${BASE}/${path}/${cs}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return [...staticPages, ...cityPages, ...clubPages, ...longTailPages];
}
