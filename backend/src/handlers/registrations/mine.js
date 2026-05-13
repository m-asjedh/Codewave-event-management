"use strict";

const { connectMongo } = require("../../lib/mongo");
const Registration = require("../../models/Registration");
const { json, unauthorized, serverError, getJwtClaims } = require("../../lib/http");

exports.handler = async (event) => {
  const claims = getJwtClaims(event);
  if (!claims) return unauthorized();

  try {
    await connectMongo();
    const rows = await Registration.find({ userSub: claims.sub }).select("event").lean();
    const eventIds = rows.map((r) => r.event.toString());
    return json(200, { eventIds });
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to list registrations");
  }
};
