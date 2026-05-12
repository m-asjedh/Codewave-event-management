"use client";

import { EventForm } from "@/components/event-form";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/events-context";

export default function NewEventPage() {
  const { user } = useAuth();
  const { createEvent } = useEvents();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-cw-text">
          Create event
        </h1>
        <p className="mt-2 text-sm text-cw-muted">
          Publish something worth showing up for. You can refine artwork and venue details anytime.
        </p>
      </div>
      <EventForm
        mode="create"
        createdBy={user.email}
        onSubmit={(v) => createEvent({ ...v, createdBy: user.email })}
      />
    </div>
  );
}
