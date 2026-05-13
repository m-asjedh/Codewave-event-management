"use client";

import { Amplify } from "aws-amplify";

const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "";
const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "";

let configured = false;

export function configureAmplify() {
  if (configured) return;
  configured = true;
  if (!poolId || !clientId) {
    console.warn(
      "Cognito not configured: set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID",
    );
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: poolId,
        userPoolClientId: clientId,
        loginWith: { email: true },
      },
    },
  });
}

export function isCognitoConfigured(): boolean {
  return Boolean(poolId && clientId);
}
