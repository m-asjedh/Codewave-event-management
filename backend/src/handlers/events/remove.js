"use strict";

import mongoose from "mongoose";
import { connectMongo } from "../../lib/mongo.js";
import Event from "../../models/Event.js";
import Registration from "../../models/Registration.js";
import { json, unauthorized, forbidden, notFound, serverError, getJwtClaims } from "../../lib/http.js";

export const handler = async (event) => {
  const claims = getJwtClaims(event);
  if (!claims) return unauthorized();

  const id = event.pathParameters?.id;
  if (!id || !mongoose.isValidObjectId(id)) return notFound("Invalid event id");

  try {
    await connectMongo();
    const existing = await Event.findById(id);
    if (!existing) return notFound("Event not found");
    if (existing.createdBySub !== claims.sub) return forbidden("You can only delete your own events");

    await Registration.deleteMany({ event: existing._id });
    await existing.deleteOne();
    return { statusCode: 204, headers: {}, body: "" };
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to delete event");
  }
};
