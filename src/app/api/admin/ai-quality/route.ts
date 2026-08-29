import { NextResponse } from "next/server";
import { runAiQualitySuite } from "@/lib/ai/quality";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAiQualitySuite(), {
    headers: { "Cache-Control": "no-store" },
  });
}
