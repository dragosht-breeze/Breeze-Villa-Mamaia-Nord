import crypto from "node:crypto";
import {
  getEnabledIcalConnectionsByApartment,
  icalConnections,
} from "@/data/ical";
import { eventsToBookedDays, parseIcalEvents } from "@/lib/ical";
import { listReservationFolders } from "@/lib/reservation-center/store";
import {
  readBookingSyncStore,
  writeBookingSyncStore,
} from "@/lib/booking-sync/store";
import type {
  BookingSyncConflict,
  BookingSyncConnectionResult,
  BookingSyncEvent,
  BookingSyncHistoryEntry,
} from "@/lib/booking-sync/types";

let activeSync: Promise<Awaited<ReturnType<typeof syncBookingCalendars>>> | null = null;

function id(parts: string[]) {
  return crypto
    .createHash("sha1")
    .update(parts.join("|"))
    .digest("hex");
}

function overlaps(
  leftStart: string,
  leftEnd: string,
  rightStart: string,
  rightEnd: string
) {
  return leftStart < rightEnd && leftEnd > rightStart;
}

async function detectConflicts(events: BookingSyncEvent[]) {
  const folders = await listReservationFolders();
  const activeFolders = folders.filter(
    (folder) =>
      !["cancelled", "expired"].includes(folder.lifecycleStatus) &&
      folder.source !== "booking"
  );

  const detectedAt = new Date().toISOString();
  const conflicts: BookingSyncConflict[] = [];

  for (const event of events) {
    for (const folder of activeFolders) {
      const hasApartment = folder.summary.apartments.some(
        (apartment) => apartment.slug === event.apartmentSlug
      );

      if (!hasApartment) continue;
      if (
        !overlaps(
          event.start,
          event.end,
          folder.summary.checkIn,
          folder.summary.checkOut
        )
      ) {
        continue;
      }

      conflicts.push({
        id: id([event.id, folder.code]),
        apartmentSlug: event.apartmentSlug,
        externalEventId: event.id,
        externalStart: event.start,
        externalEnd: event.end,
        directReservationCode: folder.code,
        directGuestName: folder.summary.guest.name,
        directStart: folder.summary.checkIn,
        directEnd: folder.summary.checkOut,
        detectedAt,
      });
    }
  }

  return conflicts;
}

export async function syncBookingCalendars(apartmentSlug?: string) {
  const startedAt = new Date();
  const previous = await readBookingSyncStore();
  const targetConnections = apartmentSlug
    ? getEnabledIcalConnectionsByApartment(apartmentSlug)
    : icalConnections.filter(
        (connection) => connection.enabled && connection.importUrl
      );

  const nextEvents = apartmentSlug
    ? previous.events.filter(
        (event) => event.apartmentSlug !== apartmentSlug
      )
    : [];

  const results: BookingSyncConnectionResult[] = [];

  for (const connection of targetConnections) {
    const connectionStartedAt = Date.now();
    const previousConnectionEvents = previous.events.filter(
      (event) =>
        event.apartmentSlug === connection.apartmentSlug &&
        event.provider === connection.provider
    );

    try {
      const response = await fetch(connection.importUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawIcal = await response.text();
      const parsedEvents = parseIcalEvents(rawIcal);
      const importedAt = new Date().toISOString();
      const importedEvents: BookingSyncEvent[] = parsedEvents.map(
        (event) => ({
          id: id([
            connection.apartmentSlug,
            connection.provider,
            event.uid,
            event.start,
            event.end,
          ]),
          providerUid: event.uid,
          apartmentSlug: connection.apartmentSlug,
          provider: connection.provider,
          start: event.start,
          end: event.end,
          summary: event.summary,
          importedAt,
        })
      );

      nextEvents.push(...importedEvents);

      const previousIds = new Set(
        previousConnectionEvents.map((event) => event.id)
      );
      const importedIds = new Set(
        importedEvents.map((event) => event.id)
      );

      results.push({
        apartmentSlug: connection.apartmentSlug,
        provider: connection.provider,
        label: connection.label,
        ok: true,
        eventCount: importedEvents.length,
        importedCount: importedEvents.filter(
          (event) => !previousIds.has(event.id)
        ).length,
        removedCount: previousConnectionEvents.filter(
          (event) => !importedIds.has(event.id)
        ).length,
        durationMs: Date.now() - connectionStartedAt,
      });
    } catch (error) {
      nextEvents.push(...previousConnectionEvents);
      results.push({
        apartmentSlug: connection.apartmentSlug,
        provider: connection.provider,
        label: connection.label,
        ok: false,
        eventCount: previousConnectionEvents.length,
        importedCount: 0,
        removedCount: 0,
        durationMs: Date.now() - connectionStartedAt,
        message:
          error instanceof Error ? error.message : "Eroare necunoscută",
      });
    }
  }

  if (targetConnections.length === 0) {
    if (apartmentSlug) {
      nextEvents.push(
        ...previous.events.filter(
          (event) => event.apartmentSlug === apartmentSlug
        )
      );
    } else {
      nextEvents.push(...previous.events);
    }
  }

  const uniqueEvents = Array.from(
    new Map(nextEvents.map((event) => [event.id, event])).values()
  ).sort((a, b) => a.start.localeCompare(b.start));

  const conflicts = await detectConflicts(uniqueEvents);
  const completedAt = new Date();

  const historyEntry: BookingSyncHistoryEntry = {
    id: crypto.randomUUID(),
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    ok: results.length > 0 && results.every((result) => result.ok),
    requestedApartmentSlug: apartmentSlug,
    totalEvents: uniqueEvents.length,
    totalImported: results.reduce(
      (sum, result) => sum + result.importedCount,
      0
    ),
    totalRemoved: results.reduce(
      (sum, result) => sum + result.removedCount,
      0
    ),
    conflictCount: conflicts.length,
    results,
  };

  const store = await writeBookingSyncStore({
    events: uniqueEvents,
    conflicts,
    history: [historyEntry, ...previous.history].slice(0, 100),
    updatedAt: completedAt.toISOString(),
  });

  return { store, historyEntry };
}

export async function runBookingSync(apartmentSlug?: string) {
  if (!apartmentSlug && activeSync) return activeSync;

  const task = syncBookingCalendars(apartmentSlug);

  if (!apartmentSlug) {
    activeSync = task;
  }

  try {
    return await task;
  } finally {
    if (!apartmentSlug) activeSync = null;
  }
}

export async function ensureBookingSyncFresh(maxAgeMinutes = 15) {
  const store = await readBookingSyncStore();
  const updatedAt = store.updatedAt
    ? new Date(store.updatedAt).getTime()
    : 0;
  const isFresh =
    updatedAt > 0 && Date.now() - updatedAt < maxAgeMinutes * 60_000;

  if (isFresh) return store;

  try {
    const result = await runBookingSync();
    return result.store;
  } catch {
    return store;
  }
}

export async function getStoredBookingEvents(apartmentSlug?: string) {
  const store = await readBookingSyncStore();
  return apartmentSlug
    ? store.events.filter(
        (event) => event.apartmentSlug === apartmentSlug
      )
    : store.events;
}

export async function getStoredBookingDays(apartmentSlug: string) {
  const events = await getStoredBookingEvents(apartmentSlug);
  return eventsToBookedDays(
    events.map((event) => ({
      uid: event.providerUid,
      start: event.start,
      end: event.end,
      summary: event.summary,
      source: event.provider,
    })),
    "booking"
  );
}
