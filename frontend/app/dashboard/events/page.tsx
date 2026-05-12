"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/events-context";
import { formatEventDate } from "@/lib/format-date";

export default function DashboardEventsPage() {
  const { user } = useAuth();
  const { myEvents, deleteEvent } = useEvents();
  const list = user ? myEvents(user.email) : [];
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const deleteTarget = pendingDelete ? list.find((e) => e.id === pendingDelete) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-cw-text">
            My events
          </h1>
          <p className="mt-2 text-sm text-cw-muted">
            Edit copy, timing, and artwork. Deleting removes local registrations too.
          </p>
        </div>
        <LinkButton href="/dashboard/events/new" className="rounded-cw px-5 py-3">
          New event
        </LinkButton>
      </div>

      {list.length === 0 ? (
        <div className="rounded-cw border border-dashed border-cw-border bg-cw-surface-2/50 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-cw-text">No events yet</p>
          <p className="mt-2 text-sm text-cw-muted">Create your first event to see it listed here.</p>
          <LinkButton href="/dashboard/events/new" className="mt-6 rounded-cw px-6 py-3">
            Create event
          </LinkButton>
        </div>
      ) : (
        <div className="overflow-hidden rounded-cw border border-cw-border bg-cw-surface shadow-cw-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cw-border bg-cw-surface-2 text-xs uppercase tracking-wider text-cw-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">When</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cw-border">
              {list.map((e) => (
                <tr key={e.id} className="hover:bg-cw-surface-2/50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-cw-text">{e.title}</p>
                    <p className="text-xs text-cw-muted sm:hidden">{formatEventDate(e.startsAt)}</p>
                  </td>
                  <td className="hidden px-4 py-4 text-cw-muted sm:table-cell">
                    {formatEventDate(e.startsAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/events/${e.id}`}
                        className="rounded-cw-sm px-2 py-1 text-xs font-semibold text-cw-accent hover:bg-cw-surface-2"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/events/${e.id}/edit`}
                        className="rounded-cw-sm px-2 py-1 text-xs font-semibold text-cw-text hover:bg-cw-surface-2"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="rounded-cw-sm px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400"
                        onClick={() => setPendingDelete(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this event?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be removed from your workspace along with its registrations.`
            : "This removes the event and its registrations from your local workspace."
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingDelete) deleteEvent(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
