"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { useLoading } from "@/lib/loading-context";

const nav = [
  { href: "/events/", label: "Discover" },
  { href: "/dashboard/", label: "Dashboard" },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { beginNavigation } = useLoading();
  const [menuOpen, setMenuOpen] = useState(false);

  const navClick = () => beginNavigation();

  return (
    <header className="sticky top-0 z-40 border-b border-cw-border/80 bg-cw-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2"
          onClick={() => {
            navClick();
            setMenuOpen(false);
          }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-cw-sm bg-gradient-to-br from-cw-accent to-teal-600 text-lg font-bold text-white shadow-cw-sm dark:from-cyan-300 dark:to-cw-accent dark:text-cw-text">
            C
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-cw-text">
            Code<span className="text-cw-accent">Wave</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-cw-sm px-3 py-2 text-sm font-medium text-cw-muted transition hover:bg-cw-surface-2 hover:text-cw-text"
              onClick={navClick}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-cw-sm border border-cw-border bg-cw-surface text-cw-text md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard/"
                className="hidden max-w-[10rem] truncate rounded-cw-sm border border-cw-border bg-cw-surface px-3 py-2 text-xs font-medium text-cw-text sm:inline-block"
                onClick={navClick}
              >
                {user.name}
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="rounded-cw-sm border border-cw-border bg-transparent px-3 py-2 text-sm font-semibold text-cw-muted transition hover:border-cw-border hover:text-cw-text"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login/"
                className="hidden rounded-cw-sm px-3 py-2 text-sm font-semibold text-cw-muted transition hover:text-cw-text sm:inline-block"
                onClick={navClick}
              >
                Log in
              </Link>
              <Link
                href="/auth/signup/"
                className="hidden rounded-cw-sm bg-cw-accent px-3 py-2 text-sm font-semibold text-white shadow-cw-sm transition hover:bg-cw-accent-hover sm:inline-block"
                onClick={navClick}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      {menuOpen ? (
        <div id="mobile-nav" className="border-t border-cw-border bg-cw-bg px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-cw-sm px-3 py-2 text-sm font-medium text-cw-muted hover:bg-cw-surface-2 hover:text-cw-text"
                onClick={() => {
                  navClick();
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
            {!user ? (
              <>
                <Link
                  href="/auth/login/"
                  className="rounded-cw-sm px-3 py-2 text-sm font-semibold text-cw-text hover:bg-cw-surface-2"
                  onClick={() => {
                    navClick();
                    setMenuOpen(false);
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup/"
                  className="rounded-cw-sm bg-cw-accent px-3 py-2 text-center text-sm font-semibold text-white"
                  onClick={() => {
                    navClick();
                    setMenuOpen(false);
                  }}
                >
                  Sign up
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
