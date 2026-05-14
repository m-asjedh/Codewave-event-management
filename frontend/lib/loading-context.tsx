"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

type LoadingContextValue = {
  /** Wrap async API work (create/update/delete, refresh, etc.). */
  runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
  /** Call when starting a client-side navigation (e.g. Link click). Clears on route change or timeout. */
  beginNavigation: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [taskDepth, setTaskDepth] = useState(0);
  const [navPending, setNavPending] = useState(false);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const clearNavTimeout = useCallback(() => {
    if (navTimeoutRef.current != null) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }
  }, []);

  const beginNavigation = useCallback(() => {
    clearNavTimeout();
    setNavPending(true);
    navTimeoutRef.current = setTimeout(() => {
      setNavPending(false);
      navTimeoutRef.current = null;
    }, 12_000);
  }, [clearNavTimeout]);

  useEffect(() => {
    setNavPending(false);
    clearNavTimeout();
  }, [pathname, clearNavTimeout]);

  const runWithLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setTaskDepth((d) => d + 1);
    try {
      return await fn();
    } finally {
      setTaskDepth((d) => Math.max(0, d - 1));
    }
  }, []);

  const value = useMemo(
    () => ({
      runWithLoading,
      beginNavigation,
    }),
    [runWithLoading, beginNavigation],
  );

  const visible = taskDepth > 0 || navPending;

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {visible ? (
        <div
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-cw-bg/55 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="pointer-events-none flex flex-col items-center gap-3 rounded-cw border border-cw-border bg-cw-surface px-8 py-6 shadow-cw-md">
            <Spinner className="h-9 w-9 text-cw-accent" />
            <p className="text-sm font-medium text-cw-muted">Loading…</p>
          </div>
        </div>
      ) : null}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}
