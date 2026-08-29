import { NextResponse } from "next/server";
import { listReservationFolderSummaries } from "@/lib/reservation-center/service";

export const runtime = "nodejs";

export async function GET() {
  const folders = await listReservationFolderSummaries();
  return NextResponse.json({ ok: true, folders });
}
