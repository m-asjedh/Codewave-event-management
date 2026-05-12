"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createId } from "@/lib/id";
import type { EventRecord, RegistrationRecord } from "@/lib/types";

const EVENTS_KEY = "codewave_events_v1";
const REGS_KEY = "codewave_regs_v1";

const DEMO_EVENTS: EventRecord[] = [
  {
    id: "demo-aurora",
    title: "Aurora Design Systems Night",
    description:
      "An evening of talks on tokens, accessibility, and shipping cohesive UI across web and native. Networking afterward.",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    location: "Colombo • Lighthouse Hall",
    bannerUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    createdBy: "hello@codewave.app",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-tide",
    title: "TideStack: Serverless in production",
    description:
      "Patterns for SQS, Lambda, and idempotent workers—plus what breaks when traffic spikes.",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    location: "Virtual • Zoom",
    bannerUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    createdBy: "hello@codewave.app",
    createdAt: new Date().toISOString(),
  },
];

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

type EventsContextValue = {
  events: EventRecord[];
  registrations: RegistrationRecord[];
  getEvent: (id: string) => EventRecord | undefined;
  createEvent: (input: Omit<EventRecord, "id" | "createdAt">) => EventRecord;
  updateEvent: (id: string, patch: Partial<EventRecord>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, userEmail: string, userName: string) => void;
  isRegistered: (eventId: string, userEmail: string) => boolean;
  myEvents: (email: string) => EventRecord[];
};

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let ev = loadJson<EventRecord[]>(EVENTS_KEY, []);
    if (ev.length === 0) {
      ev = DEMO_EVENTS;
      saveJson(EVENTS_KEY, ev);
    }
    setEvents(ev);
    setRegistrations(loadJson<RegistrationRecord[]>(REGS_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(EVENTS_KEY, events);
  }, [events, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(REGS_KEY, registrations);
  }, [registrations, hydrated]);

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events],
  );

  const createEvent = useCallback(
    (input: Omit<EventRecord, "id" | "createdAt">) => {
      const record: EventRecord = {
        ...input,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [record, ...prev]);
      return record;
    },
    [],
  );

  const updateEvent = useCallback((id: string, patch: Partial<EventRecord>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch, id: e.id } : e)),
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
  }, []);

  const registerForEvent = useCallback(
    (eventId: string, userEmail: string, userName: string) => {
      setRegistrations((prev) => {
        if (
          prev.some(
            (r) =>
              r.eventId === eventId && r.userEmail.toLowerCase() === userEmail.toLowerCase(),
          )
        ) {
          return prev;
        }
        const r: RegistrationRecord = {
          id: createId(),
          eventId,
          userEmail: userEmail.trim().toLowerCase(),
          userName: userName.trim(),
          createdAt: new Date().toISOString(),
        };
        return [r, ...prev];
      });
    },
    [],
  );

  const isRegistered = useCallback(
    (eventId: string, userEmail: string) =>
      registrations.some(
        (r) =>
          r.eventId === eventId &&
          r.userEmail.toLowerCase() === userEmail.toLowerCase(),
      ),
    [registrations],
  );

  const myEvents = useCallback(
    (email: string) =>
      events.filter((e) => e.createdBy.toLowerCase() === email.toLowerCase()),
    [events],
  );

  const value = useMemo(
    () => ({
      events,
      registrations,
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
      getEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      registerForEvent,
      isRegistered,
      myEvents,
    ],
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
