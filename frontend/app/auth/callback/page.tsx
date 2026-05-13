"use client";

/**
 * OAuth redirect target. react-oidc-context completes the code exchange in the root AuthProvider;
 * this page only needs to exist so `/auth/callback` is a valid route.
 */
export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      <p className="text-sm text-cw-muted">Finishing sign-in…</p>
    </main>
  );
}
