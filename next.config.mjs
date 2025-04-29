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
};

export default nextConfig;
