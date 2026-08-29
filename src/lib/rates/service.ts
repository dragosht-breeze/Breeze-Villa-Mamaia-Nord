import {
  getAvailabilityDays,
  type AvailabilityDay,
} from "@/data/availability";
import { readRateStore } from "./store";

export async function getRateOverridesByApartment(slug: string) {
  const store = await readRateStore();
  return store.overrides.filter((item) => item.apartmentSlug === slug);
}

export async function getEffectiveAvailabilityDays(
  slug: string
): Promise<AvailabilityDay[]> {
  const baseDays = getAvailabilityDays(slug);
  const overrides = await getRateOverridesByApartment(slug);
  const byDate = new Map(overrides.map((item) => [item.date, item]));

  return baseDays.map((day) => {
    const override = byDate.get(day.date);
    if (!override) return day;

    return {
      ...day,
      price: override.price ?? day.price,
      minNights: override.minNights ?? day.minNights,
      status: override.blocked ? "booked" : day.status,
      source: override.blocked ? "manual" : day.source,
      manualBlocked: Boolean(override.blocked),
      offerLabel: override.offerLabel,
    };
  });
}

export async function getEffectiveBookedRanges(slug: string) {
  const days = (await getEffectiveAvailabilityDays(slug)).filter(
    (item) => item.status !== "available"
  );

  if (days.length === 0) return [];

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const ranges: { start: string; end: string; summary: string }[] = [];

  function addOneDay(dateKey: string) {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }

  let rangeStart = sorted[0].date;
  let previous = sorted[0].date;

  sorted.slice(1).forEach((item) => {
    if (item.date === addOneDay(previous)) {
      previous = item.date;
      return;
    }

    ranges.push({
      start: rangeStart,
      end: addOneDay(previous),
      summary: "Breeze Villa - ocupat",
    });

    rangeStart = item.date;
    previous = item.date;
  });

  ranges.push({
    start: rangeStart,
    end: addOneDay(previous),
    summary: "Breeze Villa - ocupat",
  });

  return ranges;
}
