"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiFetch } from "@/lib/api";
import { withTrailingSlash } from "@/lib/app-path";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/events-context";
import { formatEventDate } from "@/lib/format-date";
import type { EventRecord } from "@/lib/types";

type EventFetchState =
  | { phase: "idle" }
  | { phase: "loading"; eventId: string }
  | { phase: "success"; eventId: string; event: EventRecord }
  | { phase: "error"; eventId: string; message: string };

export default function EventDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const router = useRouter();
  const { events, loading: listLoading, registerForEvent, isRegistered } = useEvents();
  const { user } = useAuth();
  const localEvent = id ? events.find((e) => e.id === id) : undefined;
  const [fetchState, setFetchState] = useState<EventFetchState>({ phase: "idle" });
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id || localEvent || listLoading) return;

    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setFetchState({ phase: "loading", eventId: id });
      try {
        const e = await apiFetch<EventRecord>(`/events/${id}`, { method: "GET", auth: false });
        if (!cancelled) setFetchState({ phase: "success", eventId: id, event: e });
      } catch (err) {
        const msg =
          err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to load";
        if (!cancelled) setFetchState({ phase: "error", eventId: id, message: msg });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, localEvent, listLoading]);

  const { event, loading, fetchError } = useMemo(() => {
    if (!id) {
      return { event: undefined as EventRecord | null | undefined, loading: false, fetchError: null as string | null };
    }
    if (localEvent) {
      return { event: localEvent, loading: false, fetchError: null };
    }
    if (listLoading) {
      return { event: undefined, loading: true, fetchError: null };
    }
    if (fetchState.phase === "idle") {
      return { event: undefined, loading: true, fetchError: null };
    }
    if (fetchState.eventId !== id) {
      return { event: undefined, loading: true, fetchError: null };
    }
    if (fetchState.phase === "loading") {
      return { event: undefined, loading: true, fetchError: null };
    }
    if (fetchState.phase === "success") {
      return { event: fetchState.event, loading: false, fetchError: null };
    }
    return { event: null, loading: false, fetchError: fetchState.message };
  }, [id, localEvent, listLoading, fetchState]);

  if (!id) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-cw-text">Invalid link</h1>
        <Button
          className="mt-6"
          variant="secondary"
          onClick={() => router.push(withTrailingSlash("/events"))}
        >
          Back to events
        </Button>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-cw-muted">Loading event…</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-cw-text">Event not found</h1>
        <p className="mt-2 text-sm text-cw-muted">
          {fetchError ?? "It may have been removed or the link is wrong."}
        </p>
        <Button
          className="mt-6"
          variant="secondary"
          onClick={() => router.push(withTrailingSlash("/events"))}
        >
          Back to events
        </Button>
      </main>
    );
  }

  const registered = user ? isRegistered(event.id) : false;
  const banner = event.bannerUrl?.trim() ?? "";

  const onRegister = async () => {
    if (!user) {
      router.push(
        `/auth/login/?next=${encodeURIComponent(withTrailingSlash(`/events/${event.id}`))}`,
      );
      return;
    }
    try {
      await registerForEvent(event.id);
      setDone(true);
      setOpen(false);
    } catch {
      setOpen(false);
    }
  };

  return (
    <main>
      <div className="relative h-[min(52vh,420px)] w-full overflow-hidden bg-cw-surface-2">
        {banner ? (
          <Image src={banner} alt={event.title} fill priority className="object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-cw-bg via-cw-bg/40 to-transparent dark:from-[#070b12] dark:via-[#070b12]/50" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 pb-10 sm:px-6">
          <Badge className="border-0 bg-white/20 text-white backdrop-blur-md dark:bg-white/10">
            {formatEventDate(event.startsAt)}
          </Badge>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 text-sm font-medium text-white/90">{event.location}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1fr_280px]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 text-xs text-cw-muted">
            <span>Hosted on CodeWave</span>
            <span aria-hidden>·</span>
            <span>Organizer: {event.createdBy}</span>
          </div>
          <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-cw-muted">
            {event.description}
          </p>
        </article>

        <aside className="h-fit space-y-4 rounded-cw border border-cw-border bg-cw-surface p-5 shadow-cw-sm">
          {done || registered ? (
            <div className="rounded-cw-sm border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100">
              You&apos;re registered. Check your email for a confirmation from SES (if the queue worker ran).
            </div>
          ) : null}
          <Button className="w-full rounded-cw py-3 text-base" onClick={() => setOpen(true)}>
            Register for this event
          </Button>
          <p className="text-xs leading-relaxed text-cw-muted">
            {user
              ? "Confirm to save your registration and queue a confirmation email (SES + SQS)."
              : "Log in with your Cognito account to register."}
          </p>
          <Link
            href="/events/"
            className="block text-center text-sm font-semibold text-cw-accent hover:text-cw-accent-hover"
          >
            ← Back to all events
          </Link>
        </aside>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm registration"
        description="You can adjust copy and add payment later—this is the attendee commitment step."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Not now
            </Button>
            <Button onClick={onRegister}>{user ? "Confirm" : "Log in to continue"}</Button>
          </>
        }
      >
        <ul className="space-y-2 text-sm text-cw-muted">
          <li>
            <span className="font-semibold text-cw-text">Event:</span> {event.title}
          </li>
          <li>
            <span className="font-semibold text-cw-text">When:</span> {formatEventDate(event.startsAt)}
          </li>
          <li>
            <span className="font-semibold text-cw-text">Where:</span> {event.location}
          </li>
          {user ? (
            <li>
              <span className="font-semibold text-cw-text">Account:</span> {user.email}
            </li>
          ) : null}
        </ul>
      </Modal>
    </main>
  );
}
