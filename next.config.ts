/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hrusjzopebjlgbqeacxy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Added YouTube thumbnail support for Next.js Image component if needed
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
};

module.exports = nextConfig;