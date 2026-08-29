import { NextResponse } from "next/server";
import {
  getGuestAutomationSchedulerState,
  runGuestAutomationScheduler,
} from "@/lib/guest-automation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseSimulationDate(value: string | null) {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T12:00:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      state: await getGuestAutomationSchedulerState(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const simulationDate = parseSimulationDate(url.searchParams.get("date"));

  if (simulationDate === null) {
    return NextResponse.json(
      { ok: false, message: "Parametrul date trebuie să fie YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const result = await runGuestAutomationScheduler({
    date: simulationDate,
    deliveryLimit: 25,
  });

  return NextResponse.json(
    {
      ok: result.state.lastStatus !== "failed",
      alreadyRunning: result.alreadyRunning,
      state: result.state,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
