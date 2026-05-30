import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blocks.mvp-subha.me",
      },
    ],
  },
  transpilePackages: [
    "@tanstack/react-query",
    "@tanstack/react-virtual",
  ],
};

export default nextConfig;
