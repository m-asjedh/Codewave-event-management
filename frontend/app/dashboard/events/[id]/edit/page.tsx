"use client";

import { useParams } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/events-context";

export default function EditEventPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const { user } = useAuth();
  const { getEvent, updateEvent } = useEvents();
  const event = getEvent(id);

  if (!user) return null;

  if (!event) {
    return (
      <div className="space-y-4 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold text-cw-text">Event not found</h1>
        <LinkButton href="/dashboard/events" variant="secondary">
          Back to my events
        </LinkButton>
      </div>
    );
  }

  if (event.createdBy.toLowerCase() !== user.email.toLowerCase()) {
    return (
      <div className="space-y-4 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold text-cw-text">Not your event</h1>
        <p className="text-sm text-cw-muted">You can only edit events you created.</p>
        <LinkButton href="/dashboard/events" variant="secondary">
          Back to my events
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-cw-text">
          Edit event
        </h1>
        <p className="mt-2 text-sm text-cw-muted">Update the story, schedule, or hero image.</p>
      </div>
      <EventForm
        mode="edit"
        initial={event}
        createdBy={user.email}
        onSubmit={(v) => updateEvent(event.id, v)}
      />
    </div>
  );
}
