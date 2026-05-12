"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createId } from "@/lib/id";
import type { User } from "@/lib/types";

const STORAGE_KEY = "codewave_auth_v1";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (!user) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/** Demo auth until Cognito + API are wired. Password is ignored. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage after mount (avoids SSR/client HTML mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot hydration
    setUser(loadUser());
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    void password;
    const normalized = email.trim().toLowerCase();
    if (!normalized) throw new Error("Email is required.");
    const u: User = {
      id: createId(),
      email: normalized,
      name: normalized.split("@")[0] ?? "Guest",
      createdAt: new Date().toISOString(),
    };
    setUser(u);
    saveUser(u);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    void password;
    const normalized = email.trim().toLowerCase();
    if (!name.trim()) throw new Error("Name is required.");
    if (!normalized) throw new Error("Email is required.");
    const u: User = {
      id: createId(),
      email: normalized,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setUser(u);
    saveUser(u);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
