import { sendWhatsAppTemplate } from "@/lib/whatsapp/service";

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
  const templateName = process.env.WHATSAPP_TEMPLATE_NEW_RESERVATION_ADMIN?.trim();
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "ro";

  if (!recipient || !templateName) {
    return {
      ok: false as const,
      skipped: true as const,
      reason: "admin_alert_not_configured" as const,
    };
  }

  return sendWhatsAppTemplate(recipient, templateName, language, [
    input.code,
    input.guestName,
    input.apartmentNames.join(", "),
    formatDate(input.checkIn),
    formatDate(input.checkOut),
    String(Math.round(input.total)),
  ]);
}

