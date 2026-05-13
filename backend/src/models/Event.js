"use strict";

const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startsAt: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    bannerUrl: { type: String, default: "" },
    createdBySub: { type: String, required: true, index: true },
    createdByEmail: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

EventSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    ret.startsAt = ret.startsAt instanceof Date ? ret.startsAt.toISOString() : ret.startsAt;
    ret.createdAt = ret.createdAt instanceof Date ? ret.createdAt.toISOString() : ret.createdAt;
    ret.updatedAt = ret.updatedAt instanceof Date ? ret.updatedAt.toISOString() : ret.updatedAt;
    ret.createdBy = ret.createdByEmail;
    delete ret.createdBySub;
    delete ret.createdByEmail;
    return ret;
  },
});

module.exports =
  mongoose.models.Event || mongoose.model("Event", EventSchema, "events");
