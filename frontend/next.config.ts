import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Inlined for client code — same exposure as NEXT_PUBLIC_*; use .env names COGNITO_USER_POOL_ID / COGNITO_CLIENT_ID */
  env: {
    COGNITO_USER_POOL_ID:
      process.env.COGNITO_USER_POOL_ID ?? process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
    COGNITO_CLIENT_ID:
      process.env.COGNITO_CLIENT_ID ?? process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "",
  },
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
