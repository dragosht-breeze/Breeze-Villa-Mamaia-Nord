import { NextResponse } from "next/server";
import { getAvailabilityDays, type AvailabilityDay, type DayStatus } from "@/data/availability";
import { ensureBookingSyncFresh, getStoredBookingDays } from "@/lib/booking-sync/service";
import { getConfirmedDirectReservationDays } from "@/lib/reservationStore";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function priority(status: DayStatus) {
  if (status === "booked") return 4;
  if (status === "checkin") return 3;
  if (status === "checkout") return 2;
  return 1;
}

function mergeDayStatus(current: AvailabilityDay, incoming: AvailabilityDay): AvailabilityDay {
  if (priority(incoming.status) >= priority(current.status)) {
    return {
      ...current,
      status: incoming.status,
      source: incoming.source,
    };
  }

  return current;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const manualDays = getAvailabilityDays(slug);
  const merged = new Map<string, AvailabilityDay>();

  manualDays.forEach((day) => {
    merged.set(day.date, day);
  });

  await ensureBookingSyncFresh();
  const bookedDays = await getStoredBookingDays(slug);

  bookedDays.forEach((bookedDay) => {
    const existing = merged.get(bookedDay.date);

    if (!existing) return;

    merged.set(
      bookedDay.date,
      mergeDayStatus(existing, {
        ...existing,
        status: bookedDay.status,
        source: bookedDay.source,
      })
    );
  });

  const syncResults = [
    {
      label: "Booking Sync persistent",
      provider: "booking",
      ok: true,
      eventCount: bookedDays.length,
    },
  ];

  const directReservationDays = await getConfirmedDirectReservationDays(slug);

  directReservationDays.forEach((directDay) => {
    const existing = merged.get(directDay.date);

    if (!existing) return;

    merged.set(
      directDay.date,
      mergeDayStatus(existing, {
        ...existing,
        status: directDay.status,
        source: directDay.source,
      })
    );
  });

  const days = Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    ok: true,
    slug,
    syncEnabled: true,
    syncResults,
    directConfirmedDays: directReservationDays.length,
    days,
  });
}
