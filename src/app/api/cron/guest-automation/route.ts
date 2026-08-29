import { NextResponse } from "next/server";
import { runGuestAutomationScheduler } from "@/lib/guest-automation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cronSecret() {
  return (
    process.env.GUEST_AUTOMATION_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ""
  );
}

function authorized(request: Request) {
  const secret = cronSecret();

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized cron request." },
      { status: 401 }
    );
  }

  const result = await runGuestAutomationScheduler({ deliveryLimit: 25 });

  return NextResponse.json(
    {
      ok: result.state.lastStatus !== "failed",
      alreadyRunning: result.alreadyRunning,
      state: result.state,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
