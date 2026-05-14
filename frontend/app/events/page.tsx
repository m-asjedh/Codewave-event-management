"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import { Input } from "@/components/ui/input";
import { useEvents } from "@/lib/events-context";

export default function EventsPage() {
  const { events, loading, error } = useEvents();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.description.toLowerCase().includes(s) ||
        e.location.toLowerCase().includes(s),
    );
  }, [events, q]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      ),
    [filtered],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-cw-text sm:text-4xl">
            Discover events
          </h1>
          <p className="mt-2 max-w-xl text-sm text-cw-muted">
            Search by title, venue, or keywords. Events load from the API configured with{" "}
            <code className="rounded bg-cw-surface-2 px-1 py-0.5 text-xs">NEXT_PUBLIC_API_URL</code>.
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events…"
            aria-label="Search events"
            className="h-11"
          />
        </div>
      </div>

      {loading ? <div className="mt-10 min-h-[200px]" aria-hidden /> : null}

      {error && !loading ? (
        <div
          className="mt-10 rounded-cw border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {!loading && !error && sorted.length === 0 ? (
        <div className="mt-16 rounded-cw border border-dashed border-cw-border bg-cw-surface-2/50 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-cw-text">No matches</p>
          <p className="mt-2 text-sm text-cw-muted">Try a different keyword or clear the search.</p>
        </div>
      ) : !loading && !error ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((e) => (
            <EventCard key={e.id} event={e} href={`/events/${e.id}/`} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
