"use strict";

import mongoose from "mongoose";
import { connectMongo } from "../../lib/mongo.js";
import Event from "../../models/Event.js";
import {
  json,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  parseBody,
  getJwtClaims,
} from "../../lib/http.js";

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

  const id = event.pathParameters?.id;
  if (!id || !mongoose.isValidObjectId(id)) return notFound("Invalid event id");

  const body = parseBody(event);
  if (body === null) return badRequest("Invalid JSON body");

  try {
    await connectMongo();
    const existing = await Event.findById(id);
    if (!existing) return notFound("Event not found");
    if (existing.createdBySub !== claims.sub) return forbidden("You can only edit your own events");

    const { title, description, startsAt, location, bannerUrl } = body;
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) return badRequest("title invalid");
      existing.title = title.trim();
    }
    if (description !== undefined)
      existing.description = typeof description === "string" ? description : "";
    if (startsAt !== undefined) {
      const d = new Date(startsAt);
      if (Number.isNaN(d.getTime())) return badRequest("startsAt invalid");
      existing.startsAt = d;
    }
    if (location !== undefined) {
      if (typeof location !== "string" || !location.trim()) return badRequest("location invalid");
      existing.location = location.trim();
    }
    if (bannerUrl !== undefined)
      existing.bannerUrl = typeof bannerUrl === "string" ? bannerUrl : "";

    await existing.save();
    return json(200, serialize(existing.toObject()));
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to update event");
  }
};
