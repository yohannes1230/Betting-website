import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for efficient deployment (Replit, Docker, etc.)
  output: "standalone",

  // Allow external images from team badge providers
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.thesportsdb.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    unoptimized: true, // Replit doesn't support Next.js image optimization
  },

  // Disable eslint errors from blocking build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable type errors from blocking build (we validate separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
