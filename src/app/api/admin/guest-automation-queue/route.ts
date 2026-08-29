import { NextResponse } from "next/server";
import { queueGuestAutomations } from "@/lib/guest-automation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseSimulationDate(value: string | null) {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T12:00:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const simulationDate = parseSimulationDate(url.searchParams.get("date"));

  if (simulationDate === null) {
    return NextResponse.json(
      {
        ok: false,
        message: "Parametrul date trebuie să fie în format YYYY-MM-DD.",
      },
      { status: 400 }
    );
  }

  const report = await queueGuestAutomations(simulationDate);

  return NextResponse.json(
    {
      ok: true,
      ...report,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
