import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /** Emit `auth/callback/index.html` (not only `auth/callback.html`) so static hosts resolve `/auth/callback/` and legacy `/auth/callback/index.html`. */
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
