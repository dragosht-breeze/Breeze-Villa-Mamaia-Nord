import type { IcalProvider } from "@/data/ical";

export type BookingSyncEvent = {
  id: string;
  providerUid: string;
  apartmentSlug: string;
  provider: IcalProvider;
  start: string;
  end: string;
  summary: string;
  importedAt: string;
};

export type BookingSyncConflict = {
  id: string;
  apartmentSlug: string;
  externalEventId: string;
  externalStart: string;
  externalEnd: string;
  directReservationCode: string;
  directGuestName: string;
  directStart: string;
  directEnd: string;
  detectedAt: string;
};

export type BookingSyncConnectionResult = {
  apartmentSlug: string;
  provider: IcalProvider;
  label: string;
  ok: boolean;
  eventCount: number;
  importedCount: number;
  removedCount: number;
  durationMs: number;
  message?: string;
};

export type BookingSyncHistoryEntry = {
  id: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  ok: boolean;
  requestedApartmentSlug?: string;
  totalEvents: number;
  totalImported: number;
  totalRemoved: number;
  conflictCount: number;
  results: BookingSyncConnectionResult[];
};

export type BookingSyncStore = {
  events: BookingSyncEvent[];
  conflicts: BookingSyncConflict[];
  history: BookingSyncHistoryEntry[];
  updatedAt: string | null;
};
