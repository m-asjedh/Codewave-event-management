"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  confirmSignUp,
  fetchAuthSession,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";
import { configureAmplify, isCognitoConfigured } from "@/lib/amplify-config";
import type { User } from "@/lib/types";

configureAmplify();

export type SignUpResult = { needsConfirmation: boolean };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  confirmSignUpCode: (email: string, code: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUserFromSession(): Promise<User | null> {
  if (!isCognitoConfigured()) return null;
  try {
    const { tokens } = await fetchAuthSession();
    const payload = tokens?.idToken?.payload as Record<string, unknown> | undefined;
    if (!payload?.sub) return null;
    const sub = String(payload.sub);
    const email = String(payload.email ?? payload["cognito:username"] ?? "").trim();
    const name = String(payload.name ?? payload["given_name"] ?? email.split("@")[0] ?? sub).trim();
    return {
      id: sub,
      email: email || sub,
      name: name || email || sub,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isCognitoConfigured()) {
      setUser(null);
      return;
    }
    const u = await loadUserFromSession();
    setUser(u);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshUser();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      if (!isCognitoConfigured()) throw new Error("Cognito is not configured.");
      await signIn({ username: email.trim().toLowerCase(), password });
      await refreshUser();
    },
    [refreshUser],
  );

  const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isCognitoConfigured()) throw new Error("Cognito is not configured.");
    const out = await signUp({
      username: email.trim().toLowerCase(),
      password,
      options: {
        userAttributes: {
          email: email.trim().toLowerCase(),
          name: name.trim(),
        },
      },
    });
    const step = out.nextStep.signUpStep;
    const needsConfirmation = !out.isSignUpComplete && step === "CONFIRM_SIGN_UP";
    return { needsConfirmation };
  }, []);

  const confirmSignUpCode = useCallback(async (email: string, code: string) => {
    if (!isCognitoConfigured()) throw new Error("Cognito is not configured.");
    await confirmSignUp({
      username: email.trim().toLowerCase(),
      confirmationCode: code.trim(),
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!isCognitoConfigured()) return;
    await signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: handleSignIn,
      signUp: handleSignUp,
      confirmSignUpCode,
      signOut: handleSignOut,
      refreshUser,
    }),
    [user, loading, handleSignIn, handleSignUp, confirmSignUpCode, handleSignOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
