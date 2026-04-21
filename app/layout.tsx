import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://findmyrun.club'),
  title: 'Find My Run | Discover Local Run Clubs Across the UK',
  description:
    'Find your local run club in Manchester, London, Birmingham, Leeds, Bristol, Edinburgh, Glasgow and more. Search by pace, day, and vibe to find your perfect running community.',
  keywords:
    'run club, running club, running group, social running, UK running, Manchester run club, London run club',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Find My Run | Discover Local Run Clubs',
    description: 'The easiest way to find a local run club in the UK',
    url: 'https://findmyrun.club',
    siteName: 'Find My Run',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find My Run | Discover Local Run Clubs',
    description: 'The easiest way to find a local run club in the UK',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Organization + WebSite JSON-LD. Lives in the root layout so it applies sitewide.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Find My Run',
  url: 'https://findmyrun.club',
  logo: 'https://findmyrun.club/favicon.svg',
  description:
    'Directory of run clubs and running groups across the UK. Find local, social, beginner-friendly, trail and women-only run clubs in every major city.',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Find My Run',
  url: 'https://findmyrun.club',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://findmyrun.club/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
