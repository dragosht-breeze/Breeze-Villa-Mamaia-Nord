import { NextResponse } from "next/server";
import { updateReservationRequestStatus, type ReservationStatus } from "@/lib/reservationStore";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatuses: ReservationStatus[] = [
  "new_request",
  "waiting_deposit",
  "confirmed_deposit",
  "paid_full",
  "expired",
  "cancelled",
  "cancel_requested",
  "refund_approved",
  "refund_rejected",
];

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { status?: ReservationStatus; note?: string };

  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Status invalid.",
      },
      { status: 400 }
    );
  }

  const updated = await updateReservationRequestStatus(id, body.status, body.note);

  if (!updated) {
    return NextResponse.json(
      {
        ok: false,
        message: "Cererea nu a fost găsită.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    request: updated,
  });
}
