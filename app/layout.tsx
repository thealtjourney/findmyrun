import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Find My Run | Discover Local Run Clubs Across the UK',
  description: 'Find your local run club in Manchester, London, Birmingham, Leeds, Bristol, Edinburgh, Glasgow and more. Search by pace, day, and vibe to find your perfect running community.',
  keywords: 'run club, running club, running group, social running, UK running, Manchester run club, London run club',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
