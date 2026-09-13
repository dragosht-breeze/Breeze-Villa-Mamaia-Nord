import { sendEmail } from "./sendEmail";

type NewReservationAdminEmail = {
  code: string;
  guestName: string;
  apartmentNames: string[];
  checkIn: string;
  checkOut: string;
  total: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export async function sendNewReservationAdminEmail(
  input: NewReservationAdminEmail
) {
  const recipient = process.env.BREEZE_ADMIN_EMAIL?.trim();
  const code = escapeHtml(input.code);
  const guestName = escapeHtml(input.guestName);
  const apartments = escapeHtml(input.apartmentNames.join(", "));

  return sendEmail({
    to: recipient,
    subject: `Rezervare noua Breeze Villa - ${input.code}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#fafaf7;padding:28px;color:#071b2d">
        <div style="max-width:680px;margin:auto;background:#fff;border:1px solid #ead8a8;border-radius:20px;overflow:hidden">
          <div style="background:#0a1e36;color:#fff;padding:24px 28px">
            <div style="color:#c8a34d;font-size:12px;font-weight:700;letter-spacing:2px">BREEZE VILLA MAMAIA NORD</div>
            <h1 style="margin:10px 0 0;font-size:26px">Rezervare noua primita</h1>
          </div>
          <div style="padding:28px;font-size:16px;line-height:1.6">
            <p><strong>Cod:</strong> ${code}</p>
            <p><strong>Oaspete:</strong> ${guestName}</p>
            <p><strong>Apartament:</strong> ${apartments}</p>
            <p><strong>Perioada:</strong> ${formatDate(input.checkIn)} - ${formatDate(input.checkOut)}</p>
            <p><strong>Total:</strong> ${Math.round(input.total)} RON</p>
            <p style="margin-top:24px">Deschide centrul de administrare Breeze Villa pentru detalii si confirmarea avansului.</p>
          </div>
        </div>
      </div>
    `,
  });
}
