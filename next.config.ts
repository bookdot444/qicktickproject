/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hrusjzopebjlgbqeacxy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "bytiwvxkqxcbeywuijpl.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
  output: 'standalone', 
};

module.exports = nextConfig;