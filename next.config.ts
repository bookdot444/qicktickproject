/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hrusjzopebjlgbqeacxy.supabase.co",
      },
      {
        protocol: "https",
        hostname: "bytiwvxkqxcbeywuijpl.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
