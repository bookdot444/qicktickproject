/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
images: {
    unoptimized: true, // Add this to fix the live site timeout
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
    dangerouslyAllowSVG: true,
  },
  output: 'standalone', 
};

module.exports = nextConfig;