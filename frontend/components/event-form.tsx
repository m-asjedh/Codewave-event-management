"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime-local";
import type { EventRecord } from "@/lib/types";

export type EventFormValues = {
  title: string;
  description: string;
  startsAt: string;
  location: string;
  bannerUrl: string;
};

const defaults: EventFormValues = {
  title: "",
  description: "",
  startsAt: toDatetimeLocalValue(new Date(Date.now() + 86400000)),
  location: "",
  bannerUrl:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
};

export function EventForm({
  mode,
  initial,
  createdBy,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: EventRecord;
  /** Shown for context; the API sets organizer from the signed-in user. */
  createdBy: string;
  onSubmit: (values: {
    title: string;
    description: string;
    startsAt: string;
    location: string;
    bannerUrl: string;
  }) => void | Promise<void>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<EventFormValues>(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description,
          startsAt: toDatetimeLocalValue(new Date(initial.startsAt)),
          location: initial.location,
          bannerUrl: initial.bannerUrl,
        }
      : defaults,
  );
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!values.location.trim()) {
      setError("Location is required.");
      return;
    }
    try {
      const startsAt = fromDatetimeLocalValue(values.startsAt);
      await Promise.resolve(
        onSubmit({
          title: values.title.trim(),
          description: values.description.trim(),
          startsAt,
          location: values.location.trim(),
          bannerUrl: values.bannerUrl.trim() || defaults.bannerUrl,
        }),
      );
      router.push("/dashboard/events");
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as ApiError).message)
          : "Failed to save.";
      setError(msg);
    }
  };

  return (
    <Card>
      <CardBody>
        <form className="space-y-5" onSubmit={submit}>
          <p className="text-xs text-cw-muted">
            Organizer account: <span className="font-medium text-cw-text">{createdBy}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              rows={6}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts">Starts</Label>
              <Input
                id="starts"
                type="datetime-local"
                value={values.startsAt}
                onChange={(e) => setValues((v) => ({ ...v, startsAt: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={values.location}
                onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner">Banner image URL</Label>
            <Input
              id="banner"
              type="url"
              value={values.bannerUrl}
              onChange={(e) => setValues((v) => ({ ...v, bannerUrl: e.target.value }))}
              placeholder="https://…"
            />
            <p className="text-xs text-cw-muted">
              Swap for S3 presigned uploads when the media API is ready.
            </p>
          </div>
          {error ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-cw px-6">
              {mode === "create" ? "Publish event" : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
