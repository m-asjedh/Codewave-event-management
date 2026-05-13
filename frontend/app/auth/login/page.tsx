"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { withTrailingSlash } from "@/lib/app-path";
import { useAuth } from "@/lib/auth-context";

const AUTH_NEXT_KEY = "codewave_auth_next";

function LoginForm() {
  const { signIn, user } = useAuth();
  const searchParams = useSearchParams();
  const next = withTrailingSlash(searchParams.get("next") ?? "/dashboard/");
  const notice = searchParams.get("notice");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      window.location.replace(next);
    }
  }, [user, next]);

  const onCognito = async () => {
    setError(null);
    setPending(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(AUTH_NEXT_KEY, next);
      }
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start sign-in.");
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold text-cw-text">Welcome back</h1>
          <p className="mt-1 text-sm text-cw-muted">
            Sign in with Amazon Cognito (Hosted UI). After login you return here with a session.
          </p>
        </CardHeader>
        <CardBody>
          {notice === "account-created" || notice === "confirmed" ? (
            <p className="mb-4 rounded-cw-sm border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100">
              {notice === "confirmed"
                ? "Email verified. Continue with Cognito to sign in."
                : "Account ready. Continue with Cognito to sign in."}
            </p>
          ) : null}
          {error ? (
            <p className="mb-4 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            className="w-full rounded-cw py-3 text-base"
            disabled={pending}
            type="button"
            onClick={() => void onCognito()}
          >
            {pending ? "Redirecting…" : "Continue with Cognito"}
          </Button>
          <p className="mt-6 text-center text-sm text-cw-muted">
            New here?{" "}
            <Link className="font-semibold text-cw-accent hover:text-cw-accent-hover" href="/auth/signup/">
              Create an account
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-24 text-sm text-cw-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
