"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { isOidcConfigured } from "@/lib/cognito-oidc";
import type { EventRecord, RegistrationRecord } from "@/lib/types";

type EventsContextValue = {
  events: EventRecord[];
  registrations: RegistrationRecord[];
  /** Count of events the signed-in user has registered for (from `/me/registrations`). */
  registeredCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getEvent: (id: string) => EventRecord | undefined;
  createEvent: (input: Omit<EventRecord, "id" | "createdAt">) => Promise<EventRecord>;
  updateEvent: (id: string, patch: Partial<EventRecord>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  isRegistered: (eventId: string) => boolean;
  myEvents: (email: string) => EventRecord[];
};

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
    if (!apiConfigured) {
      setEvents([]);
      setRegisteredIds(new Set());
      setLoading(false);
      setError("Set NEXT_PUBLIC_API_URL to load events from the API.");
      return;
    }

    setLoading(true);
    try {
      const list = await apiFetch<EventRecord[]>("/events", { method: "GET", auth: false });
      setEvents(Array.isArray(list) ? list : []);

      if (isOidcConfigured() && user) {
        try {
          const mine = await apiFetch<{ eventIds: string[] }>("/me/registrations", {
            method: "GET",
            auth: true,
          });
          setRegisteredIds(new Set(mine.eventIds ?? []));
        } catch {
          setRegisteredIds(new Set());
        }
      } else {
        setRegisteredIds(new Set());
      }
    } catch (e) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as Error).message) : "Failed to load events";
      setError(msg);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events],
  );

  const createEvent = useCallback(
    async (input: Omit<EventRecord, "id" | "createdAt">) => {
      const created = await apiFetch<EventRecord>("/events", {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          startsAt: input.startsAt,
          location: input.location,
          bannerUrl: input.bannerUrl,
        }),
      });
      setEvents((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateEvent = useCallback(async (id: string, patch: Partial<EventRecord>) => {
    const body: Record<string, string> = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.description !== undefined) body.description = patch.description;
    if (patch.startsAt !== undefined) body.startsAt = patch.startsAt;
    if (patch.location !== undefined) body.location = patch.location;
    if (patch.bannerUrl !== undefined) body.bannerUrl = patch.bannerUrl;

    const updated = await apiFetch<EventRecord>(`/events/${id}`, {
      method: "PUT",
      auth: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await apiFetch(`/events/${id}`, { method: "DELETE", auth: true });
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegisteredIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const registerForEvent = useCallback(
    async (eventId: string) => {
      await apiFetch(`/events/${eventId}/register`, {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setRegisteredIds((prev) => new Set(prev).add(eventId));
    },
    [],
  );

  const isRegistered = useCallback(
    (eventId: string) => registeredIds.has(eventId),
    [registeredIds],
  );

  const myEvents = useCallback(
    (email: string) =>
      events.filter((e) => e.createdBy.toLowerCase() === email.toLowerCase()),
    [events],
  );

  const registrations: RegistrationRecord[] = useMemo(() => [], []);

  const value = useMemo(
    () => ({
      events,
      registrations,
      registeredCount: registeredIds.size,
      loading,
      error,
      refresh,
      getEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      registerForEvent,
      isRegistered,
      myEvents,
    }),
    [
      events,
      registrations,
      registeredIds,
      loading,
      error,
      refresh,
      getEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      registerForEvent,
      isRegistered,
      myEvents,
    ],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
