"use strict";

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function badRequest(message) {
  return json(400, { error: message });
}

function unauthorized(message = "Unauthorized") {
  return json(401, { error: message });
}

function forbidden(message = "Forbidden") {
  return json(403, { error: message });
}

function notFound(message = "Not found") {
  return json(404, { error: message });
}

function serverError(message = "Internal server error") {
  return json(500, { error: message });
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}

/** Claims from HTTP API JWT authorizer (Cognito ID or access token). */
function getJwtClaims(event) {
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (!claims?.sub) return null;
  return {
    sub: claims.sub,
    email: (claims.email || claims["cognito:username"] || "").trim(),
    name: (claims.name || claims["given_name"] || claims.email || claims.sub).trim(),
  };
}

export {
  json,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  parseBody,
  getJwtClaims,
};
