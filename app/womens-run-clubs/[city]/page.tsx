import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seedClubs, cities } from '@/lib/seed-data';
import { citySlug } from '@/lib/slug';
import {
  CityLandingPage,
  landingStaticParams,
  type CityLandingConfig,
} from '@/app/components/CityLandingPage';

const match = (c: (typeof seedClubs)[number]) => c.female_only;

const config: CityLandingConfig = {
  pathPrefix: 'womens-run-clubs',
  label: 'women-only run clubs',
  keyword: "women's run clubs",
  intro:
    "Women-only running groups for anyone who wants a safer, more supportive space to run. Most of these clubs are focused on community first — confidence building, friendship, mental wellbeing — with pace very much secondary. All abilities welcome from couch-to-5k to marathon training.",
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

  const url = `https://findmyrun.club/womens-run-clubs/${params.city}`;
  return {
    title: `${count} Women's Run Clubs in ${cityName} (${year}) | Find My Run`,
    description: `Women-only run clubs in ${cityName}. ${count} supportive groups welcoming runners of all abilities — from first-time joggers to marathon runners.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Women's Run Clubs in ${cityName}`,
      description: `${count} women-only run clubs in ${cityName}.`,
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
