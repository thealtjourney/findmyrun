/**
 * Slug utilities for generating stable, SEO-friendly URLs for clubs and cities.
 *
 * Slugs are deterministic — the same club name in the same city always produces the
 * same slug, regardless of input order. This matters for sitemap stability and for
 * generateStaticParams to line up with live lookups.
 */

import type { Club } from './seed-data';

/** Strip accents, lowercase, collapse non-alphanumeric to hyphens, trim hyphens. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Slug for a city name (e.g. "Newcastle upon Tyne" → "newcastle-upon-tyne"). */
export function citySlug(cityName: string): string {
  return slugify(cityName);
}

/**
 * Build a stable map of club-name → slug for every club in a given city.
 * If two clubs produce the same base slug, later ones (sorted alphabetically
 * by name) get a numeric suffix: "-2", "-3", etc.
 *
 * The alphabetical sort makes this deterministic across reseeds / ordering changes.
 */
export function clubSlugsForCity(clubs: Club[], cityName: string): Map<string, string> {
  const cityClubs = clubs
    .filter((c) => c.city.toLowerCase() === cityName.toLowerCase())
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const result = new Map<string, string>();
  const slugCounts = new Map<string, number>();

  for (const club of cityClubs) {
    const base = slugify(club.name);
    const count = slugCounts.get(base) || 0;
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    slugCounts.set(base, count + 1);
    result.set(club.name, slug);
  }

  return result;
}

/** Get the slug for a specific club within a city's slug map. */
export function getClubSlug(clubs: Club[], club: Club): string | null {
  const map = clubSlugsForCity(clubs, club.city);
  return map.get(club.name) ?? null;
}

/** Find a club by its city slug and its club slug. Returns null if not found. */
export function findClubBySlug(
  clubs: Club[],
  city: string,
  clubSlug: string
): Club | null {
  const cityMatch = clubs.filter(
    (c) => citySlug(c.city) === citySlug(city)
  );
  const slugMap = clubSlugsForCity(cityMatch, cityMatch[0]?.city ?? city);
  for (const club of cityMatch) {
    if (slugMap.get(club.name) === clubSlug) {
      return club;
    }
  }
  return null;
}

/**
 * Flat list of every {citySlug, clubSlug, club} tuple across all clubs.
 * Used for generateStaticParams and sitemap entries.
 */
export function allClubRouteParams(
  clubs: Club[]
): Array<{ citySlug: string; clubSlug: string; club: Club }> {
  const byCity = new Map<string, Club[]>();
  for (const club of clubs) {
    const key = club.city;
    if (!byCity.has(key)) byCity.set(key, []);
    byCity.get(key)!.push(club);
  }

  const out: Array<{ citySlug: string; clubSlug: string; club: Club }> = [];
  Array.from(byCity.entries()).forEach(([city, cityClubs]) => {
    const slugMap = clubSlugsForCity(cityClubs, city);
    for (const club of cityClubs) {
      const slug = slugMap.get(club.name);
      if (slug) {
        out.push({ citySlug: citySlug(city), clubSlug: slug, club });
      }
    }
  });
  return out;
}
