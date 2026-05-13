"use strict";

const mongoose = require("mongoose");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { connectMongo } = require("../../lib/mongo");
const Event = require("../../models/Event");
const Registration = require("../../models/Registration");
const {
  json,
  badRequest,
  unauthorized,
  serverError,
  getJwtClaims,
} = require("../../lib/http");

const sqs = new SQSClient({});

exports.handler = async (event) => {
  const claims = getJwtClaims(event);
  if (!claims) return unauthorized();

  const eventId = event.pathParameters?.id;
  if (!eventId || !mongoose.isValidObjectId(eventId)) {
    return badRequest("Invalid event id in path");
  }

  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) return serverError("SQS_QUEUE_URL is not configured");

  try {
    await connectMongo();
    const ev = await Event.findById(eventId);
    if (!ev) return json(404, { error: "Event not found" });

    let reg;
    try {
      reg = await Registration.create({
        event: ev._id,
        userSub: claims.sub,
        userEmail: claims.email || claims.sub,
        userName: claims.name || claims.email || claims.sub,
      });
    } catch (e) {
      if (e && e.code === 11000) {
        return json(200, {
          ok: true,
          duplicate: true,
          registrationId: null,
          message: "Already registered",
        });
      }
      throw e;
    }

    const payload = {
      type: "registration_confirmation",
      registrationId: reg._id.toString(),
      eventId: ev._id.toString(),
      eventTitle: ev.title,
      eventStartsAt: ev.startsAt.toISOString(),
      eventLocation: ev.location,
      userEmail: reg.userEmail,
      userName: reg.userName,
    };

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(payload),
      }),
    );

    return json(201, {
      ok: true,
      duplicate: false,
      registrationId: reg._id.toString(),
    });
  } catch (e) {
    console.error(e);
    return serverError(e.message || "Failed to register");
  }
};
