"use strict";

import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userSub: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    userName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

RegistrationSchema.index({ event: 1, userSub: 1 }, { unique: true });

RegistrationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.eventId = ret.event?.toString?.() || String(ret.event);
    delete ret._id;
    delete ret.__v;
    delete ret.event;
    ret.createdAt = ret.createdAt instanceof Date ? ret.createdAt.toISOString() : ret.createdAt;
    ret.updatedAt = ret.updatedAt instanceof Date ? ret.updatedAt.toISOString() : ret.updatedAt;
    return ret;
  },
});

export default (
  mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema, "registrations")
);
