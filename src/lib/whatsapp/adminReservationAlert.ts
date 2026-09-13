import { sendWhatsAppText } from "@/lib/whatsapp/service";

type NewReservationAlert = {
  code: string;
  guestName: string;
  apartmentNames: string[];
  checkIn: string;
  checkOut: string;
  total: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export async function sendNewReservationAdminAlert(input: NewReservationAlert) {
  const recipient = process.env.WHATSAPP_ADMIN_PHONE?.trim();

  if (!recipient) {
    return {
      ok: false as const,
      skipped: true as const,
      reason: "admin_alert_not_configured" as const,
    };
  }

  const message = [
    "Rezervare noua Breeze Villa",
    `Cod: ${input.code}`,
    `Oaspete: ${input.guestName}`,
    `Apartament: ${input.apartmentNames.join(", ")}`,
    `Perioada: ${formatDate(input.checkIn)} - ${formatDate(input.checkOut)}`,
    `Total: ${Math.round(input.total)} RON`,
  ].join("\n");

  return sendWhatsAppText(recipient, message);
}
