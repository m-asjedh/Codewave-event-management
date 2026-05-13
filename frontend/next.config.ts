import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Static HTML/CSS/JS in `out/` — upload to S3 and serve behind CloudFront */
  output: "export",
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
