import { NextResponse } from "next/server";
import { sendReservationCancelledEmail } from "@/lib/email/reservationCancelled";
import { cancelFolderByLegacyRequestId } from "@/lib/reservation-center/service";
import { updateReservationRequestStatus } from "@/lib/reservationStore";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reservation = await updateReservationRequestStatus(
      id,
      "cancelled",
      "Rezervare anulată manual de proprietate."
    );

    if (!reservation) {
      return NextResponse.json({ ok: false, message: "Rezervarea nu a fost găsită." }, { status: 404 });
    }

    await cancelFolderByLegacyRequestId(id, "Rezervare anulată manual de proprietate.");
    const emailResult = await sendReservationCancelledEmail(reservation);

    if (!emailResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          reservationCancelled: true,
          message: `Rezervarea a fost anulată, dar e-mailul nu a fost trimis: ${emailResult.error ?? emailResult.reason ?? "eroare necunoscută"}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      reservationCancelled: true,
      emailSent: true,
      message: "Rezervarea a fost anulată, perioada eliberată și clientul a fost informat prin e-mail.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: `Rezervarea nu a putut fi anulată: ${error instanceof Error ? error.message : "eroare internă"}` },
      { status: 500 }
    );
  }
}
