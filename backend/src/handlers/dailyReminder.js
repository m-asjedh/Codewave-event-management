"use strict";

const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { connectMongo } = require("../lib/mongo");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const sqs = new SQSClient({});

exports.handler = async () => {
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    console.error("SQS_QUEUE_URL missing");
    return { ok: false, error: "SQS_QUEUE_URL missing" };
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await connectMongo();

  const upcoming = await Event.find({
    startsAt: { $gte: now, $lte: in24h },
  }).lean();

  let queued = 0;
  for (const ev of upcoming) {
    const regs = await Registration.find({ event: ev._id }).lean();
    const startsAt =
      ev.startsAt instanceof Date ? ev.startsAt : new Date(ev.startsAt);
    for (const reg of regs) {
      const payload = {
        type: "event_reminder",
        eventId: ev._id.toString(),
        eventTitle: ev.title,
        eventStartsAt: startsAt.toISOString(),
        eventLocation: ev.location,
        userEmail: reg.userEmail,
        userName: reg.userName,
      };
      try {
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(payload),
          }),
        );
        queued += 1;
      } catch (e) {
        console.error("Failed to queue reminder", e);
      }
    }
  }

  console.log(`dailyReminder: ${upcoming.length} events, ${queued} messages queued`);
  return { ok: true, events: upcoming.length, queued };
};
