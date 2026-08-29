import { randomUUID } from "node:crypto";
import type {
  GuestAutomationDeliveryItem,
  GuestAutomationDeliveryReport,
  GuestAutomationTrigger,
} from "@/lib/guest-automation/types";
import {
  getReservationFolder,
  listReservationFolders,
  saveReservationFolder,
} from "@/lib/reservation-center/store";
import type {
  ReservationCommunication,
  ReservationFolder,
  ReservationTimelineEvent,
} from "@/lib/reservation-center/types";
import {
  isWhatsAppConfigured,
  sendWhatsAppTemplate,
} from "@/lib/whatsapp";

const INTERNAL_TEMPLATE_PREFIX = "guest_automation:";
const DEFAULT_TEMPLATE_LANGUAGE = "ro";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const META_TEMPLATE_ENV_BY_INTERNAL_TEMPLATE: Record<string, string> = {
  "guest_automation:pre_stay:v1": "WHATSAPP_TEMPLATE_PRE_STAY",
  "guest_automation:check_in_day:v1": "WHATSAPP_TEMPLATE_CHECK_IN_DAY",
  "guest_automation:in_stay:v1": "WHATSAPP_TEMPLATE_IN_STAY",
  "guest_automation:pre_checkout:v1": "WHATSAPP_TEMPLATE_PRE_CHECKOUT",
  "guest_automation:post_stay:v1": "WHATSAPP_TEMPLATE_POST_STAY",
};

function now() {
  return new Date().toISOString();
}

function deliveryEnabled() {
  return process.env.GUEST_AUTOMATION_DELIVERY_ENABLED === "true";
}

function templateLanguage() {
  return (
    process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() ||
    DEFAULT_TEMPLATE_LANGUAGE
  );
}

function normalizeLimit(value?: number) {
  const parsed = Number.isFinite(value) ? Math.floor(Number(value)) : DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, parsed));
}

function getMetaTemplateName(internalTemplate: string) {
  const envName = META_TEMPLATE_ENV_BY_INTERNAL_TEMPLATE[internalTemplate];
  if (!envName) return null;
  return process.env[envName]?.trim() || null;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Oaspete";
}

function apartmentLabel(folder: ReservationFolder) {
  const titles = folder.summary.apartments
    .map((apartment) => apartment.title.trim())
    .filter(Boolean);

  if (titles.length === 0) return "cazarea rezervată";
  if (titles.length === 1) return titles[0];
  return titles.join(" + ");
}

function triggerFromInternalTemplate(
  internalTemplate: string
): GuestAutomationTrigger | null {
  switch (internalTemplate) {
    case "guest_automation:pre_stay:v1":
      return "PRE_STAY";
    case "guest_automation:check_in_day:v1":
      return "CHECK_IN_DAY";
    case "guest_automation:in_stay:v1":
      return "IN_STAY";
    case "guest_automation:pre_checkout:v1":
      return "PRE_CHECKOUT";
    case "guest_automation:post_stay:v1":
      return "POST_STAY";
    default:
      return null;
  }
}

/*
 * Ordinea parametrilor trebuie să coincidă cu template-urile aprobate în Meta.
 * Lista exactă pentru fiecare template este documentată în instrucțiunile RC12.3.
 */
function buildTemplateBodyParameters(
  trigger: GuestAutomationTrigger,
  folder: ReservationFolder
) {
  const name = firstName(folder.summary.guest.name);
  const apartment = apartmentLabel(folder);
  const checkIn = folder.summary.checkIn;
  const checkOut = folder.summary.checkOut;

  switch (trigger) {
    case "PRE_STAY":
      return [name, checkIn, apartment];
    case "CHECK_IN_DAY":
      return [name, apartment];
    case "IN_STAY":
      return [name];
    case "PRE_CHECKOUT":
      return [name, checkOut];
    case "POST_STAY":
      return [name];
  }
}

function createTimelineEvent(
  action: string,
  title: string,
  note?: string
): ReservationTimelineEvent {
  return {
    id: randomUUID(),
    at: now(),
    category: "communication",
    action,
    title,
    note,
    actor: "system",
  };
}

async function claimCommunication(
  reservationCode: string,
  communicationId: string
) {
  const folder = await getReservationFolder(reservationCode);
  if (!folder) return null;

  const current = folder.communications.find(
    (communication) => communication.id === communicationId
  );

  if (!current || current.status !== "queued") {
    return null;
  }

  const timestamp = now();

  const communications = folder.communications.map((communication) =>
    communication.id === communicationId
      ? {
          ...communication,
          status: "sending" as const,
          attempts: (communication.attempts ?? 0) + 1,
          lastAttemptAt: timestamp,
          error: undefined,
        }
      : communication
  );

  const claimed = await saveReservationFolder({
    ...folder,
    communications,
    updatedAt: timestamp,
  });

  return claimed.communications.find(
    (communication) => communication.id === communicationId
  ) ?? null;
}

async function finalizeCommunication(
  reservationCode: string,
  communicationId: string,
  input:
    | { status: "sent"; providerMessageId?: string }
    | { status: "failed"; error: string }
) {
  const folder = await getReservationFolder(reservationCode);
  if (!folder) return null;

  const timestamp = now();
  const communications = folder.communications.map((communication) => {
    if (communication.id !== communicationId) return communication;

    if (input.status === "sent") {
      return {
        ...communication,
        status: "sent" as const,
        sentAt: timestamp,
        providerMessageId: input.providerMessageId,
        error: undefined,
      };
    }

    return {
      ...communication,
      status: "failed" as const,
      error: input.error.slice(0, 1_000),
    };
  });

  const timelineEvent =
    input.status === "sent"
      ? createTimelineEvent(
          "guest_automation_sent",
          "Mesaj automat trimis pe WhatsApp",
          `${communicationId}${
            input.providerMessageId
              ? ` • Meta ID: ${input.providerMessageId}`
              : ""
          }`
        )
      : createTimelineEvent(
          "guest_automation_failed",
          "Trimiterea mesajului automat a eșuat",
          `${communicationId} • ${input.error.slice(0, 500)}`
        );

  return saveReservationFolder({
    ...folder,
    communications,
    timeline: [...folder.timeline, timelineEvent],
    updatedAt: timestamp,
  });
}

function queuedWhatsAppCommunications(folder: ReservationFolder) {
  return folder.communications.filter(
    (communication) =>
      communication.channel === "whatsapp" &&
      communication.status === "queued" &&
      communication.template.startsWith(INTERNAL_TEMPLATE_PREFIX)
  );
}

export async function deliverQueuedGuestAutomations(
  options: {
    limit?: number;
    signal?: AbortSignal;
  } = {}
): Promise<GuestAutomationDeliveryReport> {
  const enabled = deliveryEnabled();
  const whatsappConfigured = isWhatsAppConfigured();
  const limit = normalizeLimit(options.limit);
  const folders = await listReservationFolders();

  const queue = folders.flatMap((folder) =>
    queuedWhatsAppCommunications(folder).map((communication) => ({
      reservationCode: folder.code,
      communication,
    }))
  ).slice(0, limit);

  const items: GuestAutomationDeliveryItem[] = [];

  for (const queued of queue) {
    const base = {
      reservationCode: queued.reservationCode,
      communicationId: queued.communication.id,
      template: queued.communication.template,
      recipient: queued.communication.recipient ?? "",
    };

    if (!enabled) {
      items.push({
        ...base,
        status: "disabled",
        reason:
          "Delivery worker este oprit. Setează GUEST_AUTOMATION_DELIVERY_ENABLED=true numai după configurarea template-urilor Meta.",
      });
      continue;
    }

    if (!whatsappConfigured) {
      items.push({
        ...base,
        status: "skipped",
        reason: "WhatsApp Cloud API nu este configurat.",
      });
      continue;
    }

    if (!queued.communication.recipient?.trim()) {
      items.push({
        ...base,
        status: "skipped",
        reason: "Comunicarea nu are destinatar.",
      });
      continue;
    }

    const metaTemplateName = getMetaTemplateName(
      queued.communication.template
    );

    if (!metaTemplateName) {
      const envName =
        META_TEMPLATE_ENV_BY_INTERNAL_TEMPLATE[queued.communication.template];
      items.push({
        ...base,
        status: "skipped",
        reason: envName
          ? `Template Meta neconfigurat. Lipsește ${envName}.`
          : "Template intern necunoscut pentru delivery worker.",
      });
      continue;
    }

    const trigger = triggerFromInternalTemplate(
      queued.communication.template
    );

    if (!trigger) {
      items.push({
        ...base,
        status: "skipped",
        reason: "Nu poate fi determinat trigger-ul template-ului intern.",
      });
      continue;
    }

    const folder = await getReservationFolder(queued.reservationCode);

    if (!folder) {
      items.push({
        ...base,
        status: "skipped",
        reason: "Reservation Folder nu mai există.",
      });
      continue;
    }

    const claimed = await claimCommunication(
      queued.reservationCode,
      queued.communication.id
    );

    if (!claimed) {
      items.push({
        ...base,
        status: "skipped",
        reason: "Mesajul nu mai este queued sau a fost preluat de alt worker.",
      });
      continue;
    }

    try {
      const result = await sendWhatsAppTemplate(
        queued.communication.recipient,
        metaTemplateName,
        templateLanguage(),
        buildTemplateBodyParameters(trigger, folder),
        options.signal
      );

      await finalizeCommunication(
        queued.reservationCode,
        queued.communication.id,
        {
          status: "sent",
          providerMessageId: result.messageId,
        }
      );

      items.push({
        ...base,
        status: "sent",
        reason: "Mesajul a fost acceptat de WhatsApp Cloud API.",
        providerMessageId: result.messageId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Eroare necunoscută la trimitere.";

      await finalizeCommunication(
        queued.reservationCode,
        queued.communication.id,
        {
          status: "failed",
          error: message,
        }
      );

      items.push({
        ...base,
        status: "failed",
        reason: message,
      });
    }
  }

  return {
    generatedAt: now(),
    deliveryEnabled: enabled,
    whatsappConfigured,
    attempted: items.filter(
      (item) => item.status === "sent" || item.status === "failed"
    ).length,
    sent: items.filter((item) => item.status === "sent").length,
    failed: items.filter((item) => item.status === "failed").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    disabled: items.filter((item) => item.status === "disabled").length,
    items,
  };
}
