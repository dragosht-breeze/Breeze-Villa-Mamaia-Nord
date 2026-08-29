import { Buffer } from "node:buffer";
import type { ReservationRequest } from "@/lib/reservationStore";
import { generatePdfFromHtml } from "@/lib/pdf/generatePdf";
import { createBookingConfirmationHtml } from "@/lib/templates/bookingConfirmation";
import { sendEmail } from "./sendEmail";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export async function sendDepositConfirmedEmail(reservation: ReservationRequest) {
  const subject = `Confirmare rezervare Breeze Villa - ${reservation.id}`;

  const confirmationHtml = createBookingConfirmationHtml(reservation);
  const pdfBuffer = await generatePdfFromHtml(confirmationHtml);
  const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

  const html = `
    <div style="font-family: Arial, sans-serif; background:#FAFAF7; padding:30px;">
      <div style="max-width:720px; margin:auto; background:#ffffff; border-radius:26px; overflow:hidden; border:1px solid #ead8a8; box-shadow:0 18px 55px rgba(7,27,45,0.10);">
        <div style="background:#0A1E36; color:white; padding:30px; border-bottom:4px solid #C8A34D;">
          <p style="margin:0; color:#C8A34D; font-weight:bold; letter-spacing:3px; font-size:12px; text-transform:uppercase;">Breeze Villa Mamaia Nord</p>
          <h1 style="margin:10px 0 0; font-size:30px; font-family: Georgia, serif;">Confirmare rezervare</h1>
        </div>

        <div style="padding:30px; color:#071B2D;">
          <h2 style="margin-top:0; font-family: Georgia, serif;">Bună, ${reservation.guest.name}!</h2>

          <p style="font-size:16px; line-height:1.7;">
            Îți confirmăm că avansul pentru rezervarea ta a fost înregistrat cu succes.
          </p>

          <p style="font-size:16px; line-height:1.7;">
            Am atașat acestui email confirmarea oficială Breeze Villa în format PDF.
          </p>

          <div style="background:#FAFAF7; border:1px solid #ead8a8; border-radius:18px; padding:22px; margin:24px 0;">
            <p><strong>Număr rezervare:</strong> ${reservation.id}</p>
            <p><strong>Apartament:</strong> ${reservation.apartmentTitle}</p>
            <p><strong>Perioadă:</strong> ${formatDate(reservation.checkIn)} - ${formatDate(reservation.checkOut)}</p>
            <p><strong>Nopți:</strong> ${reservation.nights}</p>
            <p><strong>Total estimativ:</strong> ${reservation.total} lei</p>
          </div>

          <p style="font-size:16px; line-height:1.7;">
            Te așteptăm cu drag la Breeze Villa Mamaia Nord!
          </p>

          <p style="margin-top:30px; font-size:14px; color:#555;">
            Cu drag,<br />
            Echipa Breeze Villa Mamaia Nord
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: reservation.guest.email,
    subject,
    html,
    attachments: [
      {
        filename: `Confirmare-${reservation.id}.pdf`,
        content: pdfBase64,
      },
    ],
  });
}
