"use client";

/**
 * OAuth redirect target. Do not `window.location.replace` here — `react-oidc-context`
 * exchanges the `code` in the root `AuthProvider` and `onSigninCallback` performs a full
 * `location.replace` to the post-login path (with trailing slash for static export).
 */
export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      <p className="text-sm text-cw-muted">Finishing sign-in…</p>
    </main>
  );
}
