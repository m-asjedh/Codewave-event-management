"use client";

import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { LinkButton } from "@/components/ui/button";
import { useEvents } from "@/lib/events-context";

export default function HomePage() {
  const { events } = useEvents();
  const featured = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return (
    <main>
      <section className="relative overflow-hidden border-b border-cw-border">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cw-accent/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-cw-border bg-cw-surface/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cw-muted shadow-cw-sm backdrop-blur">
            Events · Registrations · AWS-ready UI
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-cw-text sm:text-5xl md:text-6xl">
            Ship unforgettable events with a calm, modern experience.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cw-muted">
            CodeWave is your venue for discovery and management—beautiful listings, confident
            registration, and a dashboard that stays out of your way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/events/" className="rounded-cw px-5 py-3 text-base">
              Browse events
            </LinkButton>
            <LinkButton
              href="/dashboard/events/new/"
              variant="secondary"
              className="rounded-cw px-5 py-3 text-base"
            >
              Create an event
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-cw-text">
              Featured & upcoming
            </h2>
            <p className="mt-1 text-sm text-cw-muted">
              Curated from your workspace—demo data seeds on first visit.
            </p>
          </div>
          <Link
            href="/events/"
            className="text-sm font-semibold text-cw-accent hover:text-cw-accent-hover"
          >
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} href={`/events/${e.id}/`} />
          ))}
        </div>
      </section>

      <section className="border-t border-cw-border bg-cw-surface-2/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6 sm:py-16">
          {[
            {
              title: "Designed for clarity",
              body: "Typography, spacing, and motion tuned for long reading sessions and quick scans.",
            },
            {
              title: "Registration-ready",
              body: "Flows mirror the async email pipeline—confirmations feel instant to attendees.",
            },
            {
              title: "Plays well with AWS",
              body: "Swap local persistence for API routes when your Lambdas and Cognito are wired.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-cw border border-cw-border bg-cw-surface p-6 shadow-cw-sm">
              <h3 className="font-display text-lg font-semibold text-cw-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cw-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
