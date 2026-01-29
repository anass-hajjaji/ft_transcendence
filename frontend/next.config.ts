import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // i18n config is unsupported in App Router and causes build errors
  // i18n: {
  //   locales: ['en', 'fr'],
  //   defaultLocale: 'en'
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: '4000',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all https domains for external avatars (like 42/Google)
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;