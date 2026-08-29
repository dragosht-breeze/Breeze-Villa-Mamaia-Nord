import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getReservationFolder,
  listReservationFolders,
  saveReservationFolder,
} from "@/lib/reservation-center/store";
import type { ReservationCommunication } from "@/lib/reservation-center/types";
import { isWhatsAppConfigured } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INTERNAL_PREFIX = "guest_automation:";

function deliveryEnabled() {
  return process.env.GUEST_AUTOMATION_DELIVERY_ENABLED === "true";
}

function metaTemplateConfigured(template: string) {
  const envByTemplate: Record<string, string> = {
    "guest_automation:pre_stay:v1": "WHATSAPP_TEMPLATE_PRE_STAY",
    "guest_automation:check_in_day:v1": "WHATSAPP_TEMPLATE_CHECK_IN_DAY",
    "guest_automation:in_stay:v1": "WHATSAPP_TEMPLATE_IN_STAY",
    "guest_automation:pre_checkout:v1": "WHATSAPP_TEMPLATE_PRE_CHECKOUT",
    "guest_automation:post_stay:v1": "WHATSAPP_TEMPLATE_POST_STAY",
  };

  const envName = envByTemplate[template];
  return envName ? Boolean(process.env[envName]?.trim()) : false;
}

function triggerFromTemplate(template: string) {
  switch (template) {
    case "guest_automation:pre_stay:v1": return "PRE_STAY";
    case "guest_automation:check_in_day:v1": return "CHECK_IN_DAY";
    case "guest_automation:in_stay:v1": return "IN_STAY";
    case "guest_automation:pre_checkout:v1": return "PRE_CHECKOUT";
    case "guest_automation:post_stay:v1": return "POST_STAY";
    default: return "UNKNOWN";
  }
}

function isAutomationCommunication(item: ReservationCommunication) {
  return item.template.startsWith(INTERNAL_PREFIX);
}

export async function GET() {
  const folders = await listReservationFolders();

  const items = folders
    .flatMap((folder) =>
      folder.communications
        .filter(isAutomationCommunication)
        .map((communication) => ({
          reservationCode: folder.code,
          guestName: folder.summary.guest.name,
          apartmentTitles: folder.summary.apartments.map((item) => item.title),
          checkIn: folder.summary.checkIn,
          checkOut: folder.summary.checkOut,
          lifecycleStatus: folder.lifecycleStatus,
          communicationId: communication.id,
          channel: communication.channel,
          template: communication.template,
          trigger: triggerFromTemplate(communication.template),
          status: communication.status,
          recipient: communication.recipient ?? "",
          message: communication.message ?? "",
          attempts: communication.attempts ?? 0,
          error: communication.error,
          providerMessageId: communication.providerMessageId,
          createdAt: communication.createdAt,
          lastAttemptAt: communication.lastAttemptAt,
          sentAt: communication.sentAt,
          metaTemplateConfigured: metaTemplateConfigured(communication.template),
        }))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const count = (status: ReservationCommunication["status"]) =>
    items.filter((item) => item.status === status).length;

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      deliveryEnabled: deliveryEnabled(),
      whatsappConfigured: isWhatsAppConfigured(),
      summary: {
        total: items.length,
        queued: count("queued"),
        sending: count("sending"),
        sent: count("sent"),
        failed: count("failed"),
      },
      items,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as {
    action?: string;
    reservationCode?: string;
    communicationId?: string;
  };

  if (
    payload.action !== "retry" ||
    !payload.reservationCode?.trim() ||
    !payload.communicationId?.trim()
  ) {
    return NextResponse.json(
      { ok: false, message: "Acțiune invalidă." },
      { status: 400 }
    );
  }

  const folder = await getReservationFolder(payload.reservationCode);
  if (!folder) {
    return NextResponse.json(
      { ok: false, message: "Rezervarea nu a fost găsită." },
      { status: 404 }
    );
  }

  const current = folder.communications.find(
    (item) => item.id === payload.communicationId
  );

  if (!current || !isAutomationCommunication(current)) {
    return NextResponse.json(
      { ok: false, message: "Mesajul automat nu a fost găsit." },
      { status: 404 }
    );
  }

  if (current.status !== "failed") {
    return NextResponse.json(
      { ok: false, message: "Doar mesajele eșuate pot fi repuse în coadă." },
      { status: 409 }
    );
  }

  const timestamp = new Date().toISOString();

  await saveReservationFolder({
    ...folder,
    communications: folder.communications.map((item) =>
      item.id === current.id
        ? {
            ...item,
            status: "queued" as const,
            error: undefined,
            providerMessageId: undefined,
            sentAt: undefined,
          }
        : item
    ),
    timeline: [
      ...folder.timeline,
      {
        id: randomUUID(),
        at: timestamp,
        category: "communication",
        action: "guest_automation_retry_queued",
        title: "Mesaj automat repus în coadă",
        note: `${current.template} • ${current.id}`,
        actor: "admin",
      },
    ],
    updatedAt: timestamp,
  });

  return NextResponse.json({
    ok: true,
    message: "Mesajul a fost repus în coadă. Nu este trimis automat dacă delivery este oprit.",
  });
}
