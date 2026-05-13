"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

const AUTH_NEXT_KEY = "codewave_auth_next";

export default function SignupPage() {
  const { signUp, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const onCognito = async () => {
    setError(null);
    setPending(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(AUTH_NEXT_KEY, "/dashboard");
      }
      await signUp("", "", "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start sign-up.");
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold text-cw-text">Create your account</h1>
          <p className="mt-1 text-sm text-cw-muted">
            Cognito opens in a secure page. Use <strong>Sign up</strong> there if self-registration is enabled, then
            sign in.
          </p>
        </CardHeader>
        <CardBody>
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
            Already have an account?{" "}
            <Link className="font-semibold text-cw-accent hover:text-cw-accent-hover" href="/auth/login">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
