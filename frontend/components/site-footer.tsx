"use client";

import Link from "next/link";
import { useLoading } from "@/lib/loading-context";

export function SiteFooter() {
  const { beginNavigation } = useLoading();
  return (
    <footer className="mt-auto border-t border-cw-border bg-cw-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-sm font-semibold text-cw-text">CodeWave</p>
          <p className="mt-1 max-w-md text-sm text-cw-muted">
            Event discovery, registrations, and confirmations—wired for Cognito, SQS, and SES when
            your API is live.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-cw-muted">
          <Link href="/events/" className="hover:text-cw-text" onClick={() => beginNavigation()}>
            Events
          </Link>
          <Link href="/dashboard/" className="hover:text-cw-text" onClick={() => beginNavigation()}>
            Dashboard
          </Link>
          <Link href="/auth/login/" className="hover:text-cw-text" onClick={() => beginNavigation()}>
            Log in
          </Link>
        </div>
      </div>
      <div className="border-t border-cw-border py-4 text-center text-xs text-cw-muted">
        © {new Date().getFullYear()} CodeWave · UI preview with local persistence
      </div>
    </footer>
  );
}
