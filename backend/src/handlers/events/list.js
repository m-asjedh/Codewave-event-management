"use strict";

const { connectMongo } = require("../../lib/mongo");
const Event = require("../../models/Event");
const { json, serverError } = require("../../lib/http");

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

exports.handler = async () => {
  try {
    await connectMongo();
    const rows = await Event.find().sort({ startsAt: 1 }).lean();
    return json(200, rows.map(serialize));
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to list events");
  }
};
