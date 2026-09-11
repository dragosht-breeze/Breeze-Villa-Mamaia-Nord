import { NextResponse } from "next/server";
import { sendReservationCancelledEmail } from "@/lib/email/reservationCancelled";
import { listReservationRequests } from "@/lib/reservationStore";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const requests = await listReservationRequests();
    const reservation = requests.find((item) => item.id === id);

    if (!reservation) {
      return NextResponse.json({ ok: false, message: "Rezervarea nu a fost găsită." }, { status: 404 });
    }

    if (reservation.status !== "cancelled") {
      return NextResponse.json(
        { ok: false, message: "E-mailul de anulare poate fi trimis numai pentru o rezervare anulată." },
        { status: 409 }
      );
    }

    const result = await sendReservationCancelledEmail(reservation);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: `E-mailul nu a fost trimis: ${result.error ?? result.reason ?? "eroare necunoscută"}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, message: "E-mailul de anulare a fost trimis clientului." });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: `E-mailul nu a fost trimis: ${error instanceof Error ? error.message : "eroare internă"}` },
      { status: 500 }
    );
  }
}
