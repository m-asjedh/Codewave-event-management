"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
} | null>(null);

const STORAGE_KEY = "codewave_theme_v1";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useLayoutEffect(() => {
    /* One-time hydration from localStorage / system preference (avoids SSR/client mismatch if we read window in useState). */
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
