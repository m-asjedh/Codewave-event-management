import type { UserManagerSettings } from "oidc-client-ts";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";

function regionFromPoolId(poolId: string): string {
  const i = poolId.indexOf("_");
  return i > 0 ? poolId.slice(0, i) : "ap-southeast-1";
}

function cognitoDomain(poolId: string, region: string): string {
  const suffix = poolId.slice(poolId.indexOf("_") + 1).toLowerCase();
  return `https://${region}-${suffix}.auth.${region}.amazoncognito.com`;
}

export function getOidcUserManagerSettings(): UserManagerSettings | null {
  const poolId =
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ??
    process.env.COGNITO_USER_POOL_ID ??
    "";
  const clientId =
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ??
    process.env.COGNITO_CLIENT_ID ??
    "";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!poolId || !clientId || !siteUrl) return null;
  const region = regionFromPoolId(poolId);
  const domain = cognitoDomain(poolId, region);

  return {
    authority: `https://cognito-idp.${region}.amazonaws.com/${poolId}`,
    client_id: clientId,
    redirect_uri: `${siteUrl}/auth/callback/`,
    post_logout_redirect_uri: `${siteUrl}/`,
    response_type: "code",
    scope: "openid email",
    automaticSilentRenew: true,
    metadata: {
      issuer: `https://cognito-idp.${region}.amazonaws.com/${poolId}`,
      authorization_endpoint: `${domain}/oauth2/authorize`,
      token_endpoint: `${domain}/oauth2/token`,
      end_session_endpoint: `${domain}/logout`,
      jwks_uri: `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`,
    },
    userStore:
      typeof window !== "undefined"
        ? new WebStorageStateStore({ store: window.localStorage })
        : undefined,
  };
}

export function isOidcConfigured(): boolean {
  return getOidcUserManagerSettings() !== null;
}

let userManager: UserManager | null = null;

export function getOidcUserManager(): UserManager | null {
  const settings = getOidcUserManagerSettings();
  if (!settings) return null;
  if (typeof window === "undefined") return null;
  if (!userManager) userManager = new UserManager(settings);
  return userManager;
}
