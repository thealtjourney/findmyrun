import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seedClubs, cities } from '@/lib/seed-data';
import { citySlug } from '@/lib/slug';
import {
  CityLandingPage,
  landingStaticParams,
  type CityLandingConfig,
} from '@/app/components/CityLandingPage';

const match = (c: (typeof seedClubs)[number]) => c.beginner_friendly;

const config: CityLandingConfig = {
  pathPrefix: 'beginner-run-clubs',
  label: 'beginner-friendly run clubs',
  keyword: 'beginner run clubs',
  intro:
    'New to running? These are the friendliest run clubs in the city for anyone starting out. No minimum pace, no pressure to keep up — the whole point is to have people to run with at a conversational pace. Most groups have run leaders on hand to make sure no-one gets left behind. All free to turn up and try.',
  match,
};

export function generateStaticParams() {
  return landingStaticParams(seedClubs, match);
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = cities.find((c) => c.slug === params.city);
  const cityName =
    city?.name ||
    seedClubs.find((c) => citySlug(c.city) === params.city)?.city;
  if (!cityName) return { title: 'Not Found' };

  const count = seedClubs.filter(
    (c) => c.city === cityName && match(c)
  ).length;
  const year = new Date().getFullYear();

  const url = `https://findmyrun.club/beginner-run-clubs/${params.city}`;
  return {
    title: `${count} Beginner-Friendly Run Clubs in ${cityName} (${year}) | Find My Run`,
    description: `Find beginner-friendly run clubs in ${cityName}. ${count} welcoming groups for first-time runners — no minimum pace, no experience needed. Free to turn up.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Beginner Run Clubs in ${cityName}`,
      description: `${count} welcoming run clubs for beginners in ${cityName}.`,
      url,
    },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const city = cities.find((c) => c.slug === params.city);
  const cityName =
    city?.name ||
    seedClubs.find((c) => citySlug(c.city) === params.city)?.city;
  if (!cityName) notFound();

  return (
    <CityLandingPage
      cityName={cityName}
      citySlugParam={params.city}
      clubs={seedClubs}
      cityDescription={city?.description}
      config={config}
    />
  );
}
