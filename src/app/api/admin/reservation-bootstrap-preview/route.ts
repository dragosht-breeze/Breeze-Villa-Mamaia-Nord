import { NextResponse } from "next/server";
import { previewReservationCenterBootstrap } from "@/lib/reservation-center/bootstrap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const preview =
    await previewReservationCenterBootstrap();

  return NextResponse.json(preview, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}