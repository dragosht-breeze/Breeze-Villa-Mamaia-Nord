import { NextResponse } from "next/server";
import { runBookingSync } from "@/lib/booking-sync/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || undefined;

  try {
    const result = await runBookingSync(slug);

    return NextResponse.json({
      ok: result.historyEntry.ok,
      slug,
      eventCount: result.historyEntry.totalEvents,
      importedCount: result.historyEntry.totalImported,
      removedCount: result.historyEntry.totalRemoved,
      conflictCount: result.historyEntry.conflictCount,
      results: result.historyEntry.results,
      message: result.historyEntry.ok
        ? "Importul iCal a fost salvat permanent."
        : "Importul a fost salvat, dar unele conexiuni au avut erori.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Eroare la importul iCal.",
        error:
          error instanceof Error ? error.message : "Eroare necunoscută",
      },
      { status: 500 }
    );
  }
}
