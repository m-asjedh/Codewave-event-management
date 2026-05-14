"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ApiError } from "@/lib/api";
import { apiFetch } from "@/lib/api";
import { withTrailingSlash } from "@/lib/app-path";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime-local";
import type { EventRecord } from "@/lib/types";
import Image from "next/image";

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
  bannerUrl: "",
};

const MAX_BANNER_BYTES = 5 * 1024 * 1024;
const ALLOWED_BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function looksLikeS3BannerUrl(url: string) {
  const u = url.trim();
  return u.startsWith("https://") && u.includes(".s3.") && u.includes("/banners/");
}

type BannerPresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
  contentType: string;
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
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const onBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (!ALLOWED_BANNER_TYPES.includes(file.type as (typeof ALLOWED_BANNER_TYPES)[number])) {
      setError("Banner must be JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_BANNER_BYTES) {
      setError("Banner image must be 5 MB or smaller.");
      return;
    }

    setUploadingBanner(true);
    try {
      const presign = await apiFetch<BannerPresignResponse>("/uploads/banner-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      const putRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": presign.contentType },
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed (${putRes.status}). Check S3 bucket CORS and policy.`);
      }
      setValues((v) => ({ ...v, bannerUrl: presign.publicUrl }));
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as ApiError).message)
          : "Upload failed.";
      setError(msg);
    } finally {
      setUploadingBanner(false);
    }
  };

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
    if (!values.bannerUrl.trim() || !looksLikeS3BannerUrl(values.bannerUrl)) {
      setError("Upload a banner image to S3 (JPEG, PNG, or WebP) before saving.");
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
          bannerUrl: values.bannerUrl.trim(),
        }),
      );
      router.push(withTrailingSlash("/dashboard/events"));
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
            <span className="text-sm font-medium text-cw-text">Banner image</span>
            <p className="text-xs text-cw-muted">
              Required. After upload, the S3 object URL is saved as <code className="text-cw-text">bannerUrl</code>.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={bannerFileRef}
                id="banner-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={onBannerFile}
                disabled={uploadingBanner}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={uploadingBanner}
                onClick={() => bannerFileRef.current?.click()}
                className="rounded-cw"
              >
                {uploadingBanner ? "Uploading…" : "Upload to S3"}
              </Button>
              <span className="text-xs text-cw-muted">JPEG, PNG, or WebP · max 5 MB</span>
            </div>
            {values.bannerUrl.trim() ? (
              <div className="relative mt-2 aspect-[16/10] w-full max-w-md overflow-hidden rounded-cw border border-cw-border bg-cw-surface-2">
                <Image
                  src={values.bannerUrl.trim()}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                  sizes="448px"
                />
              </div>
            ) : null}
          </div>
          {error ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-cw px-6" disabled={uploadingBanner}>
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
