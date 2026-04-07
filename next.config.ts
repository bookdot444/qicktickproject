/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Increase the timeout for fetching images from Supabase
    // Default is usually 7 seconds; 60 seconds is safer for high-res images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hrusjzopebjlgbqeacxy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "bytiwvxkqxcbeywuijpl.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Optimization settings to prevent timeouts
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // If you are deploying to a server like Hostinger or a custom VPS
  // adding standalone output can help with performance
  output: 'standalone', 
};

module.exports = nextConfig;