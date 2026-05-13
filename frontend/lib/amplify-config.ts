"use client";

import { Amplify } from "aws-amplify";

const poolId = process.env.COGNITO_USER_POOL_ID ?? "";
const clientId = process.env.COGNITO_CLIENT_ID ?? "";

let configured = false;

export function configureAmplify() {
  if (configured) return;
  configured = true;
  if (!poolId || !clientId) {
    console.warn(
      "Cognito not configured: set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID (see next.config env)",
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
