import { NextResponse } from "next/server";
import { previewGuestAutomations } from "@/lib/guest-automation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseSimulationDate(value: string | null) {
  if (!value) return undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T12:00:00+03:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const simulationDate = parseSimulationDate(
    url.searchParams.get("date")
  );

  if (simulationDate === null) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Parametrul date trebuie să fie în format YYYY-MM-DD.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const preview =
    await previewGuestAutomations(
      simulationDate
    );

  return NextResponse.json(preview, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}