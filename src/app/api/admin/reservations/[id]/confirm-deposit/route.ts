import { NextResponse } from "next/server";
import { confirmReservationDeposit } from "@/lib/reservationStore";
import { sendDepositConfirmedEmail } from "../../../../../../lib/email/depositConfirmed";
import { confirmFolderDepositByLegacyRequestId } from "@/lib/reservation-center/service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const reservation = await confirmReservationDeposit(id);

  if (reservation) {
    await confirmFolderDepositByLegacyRequestId(
      id,
      "Avans confirmat manual din Dashboard Admin."
    );
    const emailResult = await sendDepositConfirmedEmail(reservation);

    if (!emailResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          reservationConfirmed: true,
          message: `Avansul a fost confirmat, dar e-mailul nu a fost trimis: ${emailResult.error ?? emailResult.reason ?? "eroare necunoscută"}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      reservationConfirmed: true,
      emailSent: true,
      message: "Avans confirmat și e-mail trimis.",
    });
  }

  return NextResponse.json(
    { ok: false, message: "Cererea de rezervare nu a fost găsită." },
    { status: 404 }
  );
}
