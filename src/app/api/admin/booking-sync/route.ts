import { NextResponse } from "next/server";
import {
  getIcalSetupRows,
  getIcalConnectionsByApartment,
} from "@/data/ical";
import { readBookingSyncStore } from "@/lib/booking-sync/store";
import { runBookingSync } from "@/lib/booking-sync/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function connectionRows() {
  return getIcalSetupRows().map((row) => {
    const connection = getIcalConnectionsByApartment(
      row.apartmentSlug
    )[0];

    return {
      ...row,
      provider: connection?.provider ?? "booking",
      label: connection?.label ?? row.apartmentName,
      enabled: Boolean(connection?.enabled),
      hasUrl: Boolean(connection?.importUrl),
    };
  });
}

export async function GET() {
  const store = await readBookingSyncStore();

  return NextResponse.json({
    ok: true,
    connections: connectionRows(),
    updatedAt: store.updatedAt,
    eventCount: store.events.length,
    conflicts: store.conflicts,
    history: store.history.slice(0, 20),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      apartmentSlug?: string;
    };
    const result = await runBookingSync(body.apartmentSlug);

    return NextResponse.json({
      ok: true,
      updatedAt: result.store.updatedAt,
      eventCount: result.store.events.length,
      conflicts: result.store.conflicts,
      historyEntry: result.historyEntry,
      message: result.historyEntry.ok
        ? "Sincronizarea a fost finalizată."
        : "Sincronizarea s-a încheiat cu unele erori.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Sincronizarea nu a putut fi efectuată.",
      },
      { status: 500 }
    );
  }
}
