import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seedClubs, cities } from '@/lib/seed-data';
import { citySlug } from '@/lib/slug';
import {
  CityLandingPage,
  landingStaticParams,
  type CityLandingConfig,
} from '@/app/components/CityLandingPage';

const match = (c: (typeof seedClubs)[number]) => c.dog_friendly;

const config: CityLandingConfig = {
  pathPrefix: 'dog-friendly-run-clubs',
  label: 'dog-friendly run clubs',
  keyword: 'dog-friendly run clubs',
  intro:
    "Run clubs that let you bring your four-legged training partner along. Perfect for anyone who'd rather not leave the dog at home. Most of these groups meet somewhere your dog can run off-lead safely — parks, trails, canal paths. Check with the organiser before your first run so they know to expect you both.",
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

  const url = `https://findmyrun.club/dog-friendly-run-clubs/${params.city}`;
  return {
    title: `${count} Dog-Friendly Run Clubs in ${cityName} (${year}) | Find My Run`,
    description: `Run clubs in ${cityName} that welcome dogs. ${count} groups where you can bring your four-legged training buddy along for the run.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Dog-Friendly Run Clubs in ${cityName}`,
      description: `${count} run clubs in ${cityName} where dogs are welcome.`,
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
