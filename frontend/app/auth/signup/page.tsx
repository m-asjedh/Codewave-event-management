"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

type Step = "form" | "confirm";

export default function SignupPage() {
  const { signUp, confirmSignUpCode, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signUp(name, email, password);
      if (result.needsConfirmation) {
        setStep("confirm");
        return;
      }
      router.replace("/auth/login?notice=account-created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign up.");
    } finally {
      setPending(false);
    }
  };

  const onSubmitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await confirmSignUpCode(email, code);
      router.replace("/auth/login?notice=confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold text-cw-text">Create your account</h1>
          <p className="mt-1 text-sm text-cw-muted">
            {step === "form"
              ? "We use Amazon Cognito for accounts. If your pool requires email verification, you will enter a code next."
              : `Enter the verification code sent to ${email}.`}
          </p>
        </CardHeader>
        <CardBody>
          {step === "form" ? (
            <form className="space-y-4" onSubmit={onSubmitForm}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? (
                <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              <Button className="w-full rounded-cw py-3 text-base" disabled={pending} type="submit">
                {pending ? "Creating…" : "Create account"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={onSubmitConfirm}>
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                />
              </div>
              {error ? (
                <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              <Button className="w-full rounded-cw py-3 text-base" disabled={pending} type="submit">
                {pending ? "Verifying…" : "Verify and continue"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={pending}
                onClick={() => {
                  setStep("form");
                  setCode("");
                  setError(null);
                }}
              >
                Back
              </Button>
            </form>
          )}
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
