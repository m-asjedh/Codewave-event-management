"use strict";

exports.handler = async () => ({
  statusCode: 200,
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    ok: true,
    service: "codewave-backend",
    stage: process.env.STAGE ?? "unknown",
  }),
});
