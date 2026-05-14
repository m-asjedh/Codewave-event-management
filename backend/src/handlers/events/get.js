"use strict";

import mongoose from "mongoose";
import { connectMongo } from "../../lib/mongo.js";
import Event from "../../models/Event.js";
import { json, notFound, serverError } from "../../lib/http.js";

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
  const id = event.pathParameters?.id;
  if (!id || !mongoose.isValidObjectId(id)) return notFound("Invalid event id");

  try {
    await connectMongo();
    const doc = await Event.findById(id).lean();
    if (!doc) return notFound("Event not found");
    return json(200, serialize(doc));
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to load event");
  }
};
