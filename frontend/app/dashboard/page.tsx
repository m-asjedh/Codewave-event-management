"use client";

import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/events-context";
import { formatEventDate } from "@/lib/format-date";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { events, registrations, myEvents } = useEvents();
  const mine = user ? myEvents(user.email) : [];

  const upcoming = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )[0];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-cw-text">
          Hello, {user?.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-cw-muted">
          This dashboard mirrors what you’ll ship: events you own, registrations across the
          catalog, and quick actions to publish something new.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Your events", value: String(mine.length) },
          { label: "Total live", value: String(events.length) },
          { label: "Registrations", value: String(registrations.length) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-cw border border-cw-border bg-cw-surface p-5 shadow-cw-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-cw-muted">
              {s.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-cw-text">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-cw border border-cw-border bg-cw-surface p-6 shadow-cw-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cw-text">Next on the calendar</p>
          {upcoming ? (
            <p className="mt-1 text-sm text-cw-muted">
              <span className="font-medium text-cw-text">{upcoming.title}</span>
              <span aria-hidden> · </span>
              {formatEventDate(upcoming.startsAt)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-cw-muted">No events yet—create one to get started.</p>
          )}
        </div>
        <LinkButton href="/dashboard/events/new" className="rounded-cw px-5 py-3">
          New event
        </LinkButton>
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-cw-text">Your events</h2>
          <Link
            href="/dashboard/events"
            className="text-sm font-semibold text-cw-accent hover:text-cw-accent-hover"
          >
            Manage all →
          </Link>
        </div>
        {mine.length === 0 ? (
          <p className="mt-4 text-sm text-cw-muted">
            You haven&apos;t published anything yet. Events you create will appear here.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-cw-border rounded-cw border border-cw-border bg-cw-surface">
            {mine.slice(0, 5).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-cw-text">{e.title}</p>
                  <p className="text-xs text-cw-muted">{formatEventDate(e.startsAt)}</p>
                </div>
                <Link
                  href={`/dashboard/events/${e.id}/edit`}
                  className="text-sm font-semibold text-cw-accent hover:text-cw-accent-hover"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
