import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seedClubs, cities } from '@/lib/seed-data';
import { citySlug } from '@/lib/slug';
import {
  CityLandingPage,
  landingStaticParams,
  type CityLandingConfig,
} from '@/app/components/CityLandingPage';

const match = (c: (typeof seedClubs)[number]) => c.terrain === 'trail';

const config: CityLandingConfig = {
  pathPrefix: 'trail-running-clubs',
  label: 'trail running clubs',
  keyword: 'trail running clubs',
  intro:
    'Run clubs that get off the road. Trail routes can mean anything from woodland paths and canal trails to proper hill and fell running. Expect muddy shoes in winter, stunning views year-round, and — usually — a slower pace than road running to account for the terrain. Most welcome trail newcomers; a few are technical enough that some off-road experience helps.',
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

  const url = `https://findmyrun.club/trail-running-clubs/${params.city}`;
  return {
    title: `${count} Trail Running Clubs in ${cityName} (${year}) | Find My Run`,
    description: `Trail and off-road running clubs in ${cityName}. ${count} groups running woodland paths, hills and fells. Find your crew.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Trail Running Clubs in ${cityName}`,
      description: `${count} trail running clubs in ${cityName}.`,
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
