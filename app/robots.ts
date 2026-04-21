import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/owner',
          '/owner/',
          '/claim/*/verify',
          '/submission-result',
        ],
      },
    ],
    sitemap: 'https://findmyrun.club/sitemap.xml',
    host: 'https://findmyrun.club',
  };
}
