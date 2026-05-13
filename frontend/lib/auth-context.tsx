"use client";

import { createContext, useContext, useMemo } from "react";
import {
  AuthProvider as OidcAuthProvider,
  useAuth as useOidcAuth,
} from "react-oidc-context";
import { getOidcUserManagerSettings } from "@/lib/cognito-oidc";
import type { User } from "@/lib/types";

export type SignUpResult = { needsConfirmation: boolean };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  confirmSignUpCode: (email: string, code: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_NEXT_KEY = "codewave_auth_next";

function mapProfile(oidcUser: ReturnType<typeof useOidcAuth>["user"]): User | null {
  if (!oidcUser?.profile?.sub) return null;
  const sub = String(oidcUser.profile.sub);
  const email = String(
    oidcUser.profile.email ?? oidcUser.profile.preferred_username ?? "",
  ).trim();
  const name = String(oidcUser.profile.name ?? email.split("@")[0] ?? sub).trim();
  return {
    id: sub,
    email: email || sub,
    name: name || email || sub,
    createdAt: new Date().toISOString(),
  };
}

function OidcBridge({ children }: { children: React.ReactNode }) {
  const oidc = useOidcAuth();
  const user = mapProfile(oidc.user);

  const value: AuthContextValue = {
    user,
    loading: oidc.isLoading,
    signIn: async () => {
      await oidc.signinRedirect();
    },
    signUp: async () => {
      await oidc.signinRedirect();
      return { needsConfirmation: false };
    },
    confirmSignUpCode: async () => {
      throw new Error("Use the email link from Cognito to verify, then sign in here.");
    },
    signOut: () => {
      void oidc.signoutRedirect();
    },
    refreshUser: async () => {
      try {
        await oidc.signinSilent();
      } catch {
        /* ignore */
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function unconfiguredValue(): AuthContextValue {
  return {
    user: null,
    loading: false,
    signIn: async () => {
      throw new Error(
        "Set COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, and NEXT_PUBLIC_SITE_URL in .env",
      );
    },
    signUp: async () => {
      throw new Error(
        "Set COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, and NEXT_PUBLIC_SITE_URL in .env",
      );
    },
    confirmSignUpCode: async () => {
      throw new Error("Cognito is not configured.");
    },
    signOut: () => {},
    refreshUser: async () => {},
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const settings = useMemo(() => getOidcUserManagerSettings(), []);

  if (!settings) {
    return (
      <AuthContext.Provider value={unconfiguredValue()}>{children}</AuthContext.Provider>
    );
  }

  return (
    <OidcAuthProvider
      {...settings}
      onSigninCallback={() => {
        const next =
          typeof window !== "undefined"
            ? sessionStorage.getItem(AUTH_NEXT_KEY) ?? "/dashboard"
            : "/dashboard";
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(AUTH_NEXT_KEY);
          window.history.replaceState({}, document.title, "/auth/callback/");
          window.location.replace(next);
        }
      }}
      onSignoutCallback={() => {
        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, "/");
          window.location.replace("/");
        }
      }}
    >
      <OidcBridge>{children}</OidcBridge>
    </OidcAuthProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { isOidcConfigured } from "@/lib/cognito-oidc";
