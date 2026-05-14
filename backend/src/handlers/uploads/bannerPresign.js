"use strict";

import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  json,
  badRequest,
  unauthorized,
  serverError,
  parseBody,
  getJwtClaims,
} from "../../lib/http.js";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function publicObjectUrl(bucket, region, key) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export const handler = async (event) => {
  const claims = getJwtClaims(event);
  if (!claims) return unauthorized();

  const bucket = process.env.S3_BUCKET_NAME?.trim();
  if (!bucket) {
    return serverError("S3_BUCKET_NAME is not configured");
  }

  const region = process.env.AWS_REGION || "ap-southeast-1";
  const body = parseBody(event);
  if (body === null) return badRequest("Invalid JSON body");

  const contentType = typeof body.contentType === "string" ? body.contentType.trim() : "";
  const ext = ALLOWED.get(contentType);
  if (!ext) {
    return badRequest("contentType must be one of: image/jpeg, image/png, image/webp");
  }

  const safeSub = (claims.sub || "anon").replace(/[^a-zA-Z0-9-_]/g, "");
  const key = `banners/${safeSub}/${randomUUID()}.${ext}`;

  const client = new S3Client({ region });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000",
  });

  try {
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    const publicUrl = publicObjectUrl(bucket, region, key);
    return json(200, {
      uploadUrl,
      publicUrl,
      key,
      expiresIn: 300,
      contentType,
    });
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to create upload URL");
  }
};
