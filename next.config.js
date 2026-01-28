/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better performance
  // output: 'export', // Uncomment if you want fully static site

  // Image optimization
  images: {
    domains: ['instagram.com', 'scontent.cdninstagram.com'],
  },

  // Redirect www to non-www
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.findmyrun.club' }],
        destination: 'https://findmyrun.club/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
