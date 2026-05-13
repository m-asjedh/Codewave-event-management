"use strict";

const mongoose = require("mongoose");
const { connectMongo } = require("../../lib/mongo");
const Registration = require("../../models/Registration");
const { json, unauthorized, badRequest, serverError, getJwtClaims } = require("../../lib/http");

exports.handler = async (event) => {
  const claims = getJwtClaims(event);
  if (!claims) return unauthorized();

  const eventId = event.pathParameters?.id;
  if (!eventId || !mongoose.isValidObjectId(eventId)) return badRequest("Invalid event id");

  try {
    await connectMongo();
    const reg = await Registration.findOne({
      event: new mongoose.Types.ObjectId(eventId),
      userSub: claims.sub,
    }).lean();

    return json(200, { registered: Boolean(reg) });
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to check registration");
  }
};
