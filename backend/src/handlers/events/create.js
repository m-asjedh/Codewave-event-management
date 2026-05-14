"use strict";

import { connectMongo } from "../../lib/mongo.js";
import Event from "../../models/Event.js";
import {
  json,
  badRequest,
  unauthorized,
  serverError,
  parseBody,
  getJwtClaims,
} from "../../lib/http.js";

function isOurS3BannerUrl(url, bucket, region) {
  if (!url || typeof url !== "string") return false;
  const prefix = `https://${bucket}.s3.${region}.amazonaws.com/banners/`;
  return url.trim().startsWith(prefix);
}

function serialize(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    startsAt: doc.startsAt instanceof Date ? doc.startsAt.toISOString() : doc.startsAt,
    location: doc.location,
    bannerUrl: doc.bannerUrl || "",
    createdBy: doc.createdByEmail,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  };
}

export const handler = async (event) => {
  const claims = getJwtClaims(event);
  if (!claims) return unauthorized();

  const body = parseBody(event);
  if (body === null) return badRequest("Invalid JSON body");

  const { title, description, startsAt, location, bannerUrl } = body;
  if (!title || typeof title !== "string") return badRequest("title is required");
  if (!startsAt) return badRequest("startsAt is required");
  if (!location || typeof location !== "string") return badRequest("location is required");

  const startDate = new Date(startsAt);
  if (Number.isNaN(startDate.getTime())) return badRequest("startsAt must be a valid ISO date");

  const bucket = process.env.S3_BUCKET_NAME?.trim();
  const region = process.env.AWS_REGION || "ap-southeast-1";
  const trimmedBanner =
    typeof bannerUrl === "string" ? bannerUrl.trim() : "";
  if (!bucket) {
    return badRequest("S3_BUCKET_NAME is not configured; banner uploads are unavailable.");
  }
  if (!isOurS3BannerUrl(trimmedBanner, bucket, region)) {
    return badRequest("Upload a banner image (S3) before publishing.");
  }

  try {
    await connectMongo();
    const doc = await Event.create({
      title: title.trim(),
      description: typeof description === "string" ? description : "",
      startsAt: startDate,
      location: location.trim(),
      bannerUrl: trimmedBanner,
      createdBySub: claims.sub,
      createdByEmail: claims.email || claims.sub,
    });
    const lean = doc.toObject();
    return json(201, serialize(lean));
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to create event");
  }
};
