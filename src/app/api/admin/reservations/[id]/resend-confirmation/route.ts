import { NextResponse } from "next/server";
import { sendDepositConfirmedEmail } from "@/lib/email/depositConfirmed";
import { listReservationRequests } from "@/lib/reservationStore";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const requests = await listReservationRequests();
  const reservation = requests.find((item) => item.id === id);

  if (!reservation) {
    return NextResponse.json({ ok: false, message: "Cererea nu a fost găsită." }, { status: 404 });
  }

  if (reservation.status !== "confirmed_deposit" && reservation.status !== "paid_full") {
    return NextResponse.json(
      { ok: false, message: "Confirmarea poate fi trimisă numai pentru o rezervare confirmată." },
      { status: 409 }
    );
  }

  const result = await sendDepositConfirmedEmail(reservation);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: `E-mailul nu a fost trimis: ${result.error ?? result.reason ?? "eroare necunoscută"}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, message: "E-mailul de confirmare a fost retrimis." });
}
