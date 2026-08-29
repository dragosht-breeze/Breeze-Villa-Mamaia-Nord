import { JsonFileRepository } from "@/lib/data";
import type { BookingSyncStore } from "@/lib/booking-sync/types";

const emptyStore = (): BookingSyncStore => ({
  events: [],
  conflicts: [],
  history: [],
  updatedAt: null,
});

const repository = new JsonFileRepository<BookingSyncStore>({
  fileName: "booking-sync.json",
  createDefault: emptyStore,
  normalize(value) {
    const parsed = (value ?? {}) as Partial<BookingSyncStore>;
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  },
});

export function readBookingSyncStore(): Promise<BookingSyncStore> {
  return repository.read();
}

export function writeBookingSyncStore(store: BookingSyncStore) {
  return repository.write(store);
}
