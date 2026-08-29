import { NextResponse } from "next/server";
import { getReservationFolder } from "@/lib/reservation-center/store";
import {
  deriveNextAction,
  deriveReservationHealth,
} from "@/lib/reservation-center/service";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const folder = await getReservationFolder(code);

  if (!folder) {
    return NextResponse.json(
      { ok: false, message: "Rezervarea nu a fost găsită." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    folder,
    health: deriveReservationHealth(folder),
    nextAction: deriveNextAction(folder),
  });
}
