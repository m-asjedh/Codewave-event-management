import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Inlined for client code — same exposure as NEXT_PUBLIC_*; use .env names COGNITO_USER_POOL_ID / COGNITO_CLIENT_ID */
  env: {
    COGNITO_USER_POOL_ID:
      process.env.COGNITO_USER_POOL_ID ?? process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
    COGNITO_CLIENT_ID:
      process.env.COGNITO_CLIENT_ID ?? process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  },
  /** Static HTML/CSS/JS in `out/` — upload to S3 and serve behind CloudFront */
  output: "export",
  /** Emit `auth/callback/index.html` so `/auth/callback` works on S3/CloudFront (not only `callback.html`). */
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
