import { NextResponse } from "next/server";
import { getLaunchReadinessReport } from "@/lib/launch-readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getLaunchReadinessReport(), {
    headers: { "Cache-Control": "no-store" },
  });
}
