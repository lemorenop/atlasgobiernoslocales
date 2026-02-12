/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Configure rewrites to handle static files without language prefix
  async rewrites() {
    return [
      {
        source: '/maps/:path*',
        destination: '/maps/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/es',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/cache',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
