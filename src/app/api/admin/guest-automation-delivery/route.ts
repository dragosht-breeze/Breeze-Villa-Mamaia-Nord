import { NextResponse } from "next/server";
import { deliverQueuedGuestAutomations } from "@/lib/guest-automation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseLimit(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) return null;
  return parsed;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));

  if (limit === null) {
    return NextResponse.json(
      {
        ok: false,
        message: "Parametrul limit trebuie să fie un număr întreg între 1 și 50.",
      },
      { status: 400 }
    );
  }

  const report = await deliverQueuedGuestAutomations({
    limit,
    signal: request.signal,
  });

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
