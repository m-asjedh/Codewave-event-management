"use client";

import { AuthProvider } from "@/lib/auth-context";
import { EventsProvider } from "@/lib/events-context";
import { LoadingProvider } from "@/lib/loading-context";
import { ThemeProvider } from "@/lib/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <AuthProvider>
          <EventsProvider>{children}</EventsProvider>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}
