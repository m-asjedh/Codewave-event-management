"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/auth/login?next=${next}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-sm text-cw-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cw-border border-t-cw-accent" />
        <span>Preparing your workspace…</span>
        {!loading && !user ? (
          <Link href="/auth/login" className="text-cw-accent hover:underline">
            Go to log in
          </Link>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
