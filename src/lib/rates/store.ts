import { JsonFileRepository } from "@/lib/data";
import type { RateBatchInput, RateOverride, RateStore } from "./types";

function emptyStore(): RateStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    overrides: [],
  };
}

const repository = new JsonFileRepository<RateStore>({
  fileName: "rate-rules.json",
  createDefault: emptyStore,
  normalize(value) {
    const parsed = (value ?? {}) as Partial<RateStore>;
    return {
      version: 1,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      overrides: Array.isArray(parsed.overrides) ? parsed.overrides : [],
    };
  },
});

export function readRateStore(): Promise<RateStore> {
  return repository.read();
}

function writeRateStore(store: RateStore) {
  return repository.write(store);
}

function dateRange(startDate: string, endDate: string) {
  const result: string[] = [];
  const cursor = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  while (cursor <= end) {
    result.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(cursor.getDate()).padStart(2, "0")}`
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export async function applyRateBatch(input: RateBatchInput) {
  const store = await readRateStore();
  const dates = dateRange(input.startDate, input.endDate);
  const targetKeys = new Set(
    input.apartmentSlugs.flatMap((slug) =>
      dates.map((date) => `${slug}:${date}`)
    )
  );

  const retained = store.overrides.filter(
    (item) => !targetKeys.has(`${item.apartmentSlug}:${item.date}`)
  );

  if (input.reset) {
    return writeRateStore({
      version: 1,
      updatedAt: new Date().toISOString(),
      overrides: retained,
    });
  }

  const now = new Date().toISOString();
  const next: RateOverride[] = [];

  for (const apartmentSlug of input.apartmentSlugs) {
    for (const date of dates) {
      next.push({
        apartmentSlug,
        date,
        price: input.price,
        minNights: input.minNights,
        blocked: input.blocked,
        offerLabel: input.offerLabel?.trim() || undefined,
        updatedAt: now,
      });
    }
  }

  return writeRateStore({
    version: 1,
    updatedAt: now,
    overrides: [...retained, ...next].sort((a, b) => {
      const apartmentCompare = a.apartmentSlug.localeCompare(
        b.apartmentSlug
      );
      return apartmentCompare || a.date.localeCompare(b.date);
    }),
  });
}
