import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeWave — Events",
    template: "%s · CodeWave",
  },
  description:
    "Discover events, manage registrations, and run a modern event platform on AWS.",
  openGraph: {
    title: "CodeWave — Events",
    description: "Discover events and manage registrations with confidence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen bg-cw-bg font-sans text-cw-text antialiased">
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
