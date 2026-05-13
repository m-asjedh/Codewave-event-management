"use strict";

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({});

exports.handler = async (event) => {
  const from = process.env.SES_EMAIL_FROM;
  if (!from) {
    console.error("SES_EMAIL_FROM missing");
    return {};
  }

  for (const record of event.Records || []) {
    let msg;
    try {
      msg = JSON.parse(record.body);
    } catch {
      console.error("Invalid SQS body", record.body);
      continue;
    }

    if (msg.type !== "registration_confirmation") continue;

    const to = msg.userEmail;
    if (!to) continue;

    const subject = `You're registered: ${msg.eventTitle || "Event"}`;
    const text = [
      `Hi ${msg.userName || "there"},`,
      "",
      `You're registered for: ${msg.eventTitle}`,
      `When: ${msg.eventStartsAt}`,
      `Where: ${msg.eventLocation}`,
      "",
      "See you there!",
      "",
      "— CodeWave",
    ].join("\n");

    try {
      await ses.send(
        new SendEmailCommand({
          Source: from,
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: { Text: { Data: text, Charset: "UTF-8" } },
          },
        }),
      );
    } catch (e) {
      console.error("SES send failed", e);
      throw e;
    }
  }

  return {};
};
