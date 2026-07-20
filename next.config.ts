import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

if (process.env.VERCEL === "1" && process.env.NEXT_PUBLIC_AUTH_ENABLED !== "true") {
  console.warn(
    "[bandforge-web] NEXT_PUBLIC_AUTH_ENABLED is not true — deploy will run in guest mode. " +
      "Set NEXT_PUBLIC_AUTH_ENABLED=true in Vercel Production and Preview env, then redeploy.",
  );
}

if (process.env.VERCEL === "1" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "[bandforge-web] NEXT_PUBLIC_API_URL is missing — BFF cannot reach Railway API. " +
      "Set it for Production and Preview in Vercel env, then redeploy.",
  );
}

const nextConfig: NextConfig = {
  devIndicators: false,
  // Admin listening MP3 uploads proxy through /api/admin — default 10MB truncates part audio.
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default withSerwist(nextConfig);
