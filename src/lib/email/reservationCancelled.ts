import type { ReservationRequest } from "@/lib/reservationStore";
import { sendEmail } from "./sendEmail";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export async function sendReservationCancelledEmail(reservation: ReservationRequest) {
  return sendEmail({
    to: reservation.guest.email,
    subject: `Anulare rezervare Breeze Villa - ${reservation.id}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#fafaf7;padding:30px">
        <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #ead8a8;border-radius:26px;overflow:hidden">
          <div style="background:#0a1e36;color:#fff;padding:30px;border-bottom:4px solid #c8a34d">
            <p style="margin:0;color:#c8a34d;font-weight:bold;letter-spacing:3px;font-size:12px;text-transform:uppercase">Breeze Villa Mamaia Nord</p>
            <h1 style="margin:10px 0 0;font-size:30px;font-family:Georgia,serif">Rezervare anulată</h1>
          </div>
          <div style="padding:30px;color:#071b2d">
            <h2 style="margin-top:0;font-family:Georgia,serif">Bună, ${reservation.guest.name}!</h2>
            <p style="font-size:16px;line-height:1.7">Te informăm că rezervarea de mai jos a fost anulată.</p>
            <div style="background:#fafaf7;border:1px solid #ead8a8;border-radius:18px;padding:22px;margin:24px 0">
              <p><strong>Număr rezervare:</strong> ${reservation.id}</p>
              <p><strong>Apartament:</strong> ${reservation.apartmentTitle}</p>
              <p><strong>Perioadă:</strong> ${formatDate(reservation.checkIn)} – ${formatDate(reservation.checkOut)}</p>
            </div>
            <p style="font-size:16px;line-height:1.7">Dacă a fost înregistrată o plată, echipa Breeze Villa te va contacta separat privind situația acesteia, conform condițiilor rezervării.</p>
            <p style="margin-top:30px;font-size:14px;color:#555">Cu drag,<br>Echipa Breeze Villa Mamaia Nord</p>
          </div>
        </div>
      </div>
    `,
  });
}
