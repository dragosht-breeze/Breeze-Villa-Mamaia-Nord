import { redirect } from "next/navigation";
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
    await sendDepositConfirmedEmail(reservation);
  }

  redirect("/admin/reservations");
}