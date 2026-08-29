import { listReservationFolders } from "@/lib/reservation-center/store";
import type {
  ReservationCommunication,
  ReservationFolder,
} from "@/lib/reservation-center/types";
import { renderGuestAutomationMessage } from "@/lib/guest-automation/templates";
import type {
  GuestAutomationCandidate,
  GuestAutomationPreview,
  GuestAutomationTrigger,
} from "@/lib/guest-automation/types";

const TIMEZONE = "Europe/Bucharest";

export const GUEST_AUTOMATION_TEMPLATE_BY_TRIGGER: Record<
  GuestAutomationTrigger,
  string
> = {
  PRE_STAY: "guest_automation:pre_stay:v1",
  CHECK_IN_DAY: "guest_automation:check_in_day:v1",
  IN_STAY: "guest_automation:in_stay:v1",
  PRE_CHECKOUT: "guest_automation:pre_checkout:v1",
  POST_STAY: "guest_automation:post_stay:v1",
};

export function getRomaniaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return Date.UTC(year, month - 1, day);
}

function differenceInCalendarDays(targetDate: string, baseDate: string) {
  const target = parseDateKey(targetDate);
  const base = parseDateKey(baseDate);

  if (target === null || base === null) return Number.NaN;

  return Math.round((target - base) / (24 * 60 * 60 * 1_000));
}

function normalizePhone(value: string) {
  return value.replace(/[^0-9+]/g, "").trim();
}

function hasValidPhone(value: string) {
  const normalized = normalizePhone(value);
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 9;
}

export function communicationExists(
  communications: ReservationCommunication[],
  template: string
) {
  return communications.some(
    (communication) =>
      communication.template === template &&
      (communication.status === "queued" ||
        communication.status === "sending" ||
        communication.status === "sent" ||
        communication.status === "failed")
  );
}

function isInactiveReservation(folder: ReservationFolder) {
  return [
    "new_request",
    "waiting_payment",
    "expired",
    "cancel_requested",
    "cancelled",
  ].includes(folder.lifecycleStatus);
}

function createCandidate(
  folder: ReservationFolder,
  trigger: GuestAutomationTrigger,
  today: string,
  reason: string
): GuestAutomationCandidate {
  const template = GUEST_AUTOMATION_TEMPLATE_BY_TRIGGER[trigger];
  const daysToCheckIn = differenceInCalendarDays(folder.summary.checkIn, today);
  const daysToCheckOut = differenceInCalendarDays(folder.summary.checkOut, today);
  const alreadySent = communicationExists(folder.communications, template);
  const phone = folder.summary.guest.phone?.trim() ?? "";
  const validPhone = hasValidPhone(phone);
  const eligible = !alreadySent && validPhone && !isInactiveReservation(folder);

  let finalReason = reason;

  if (alreadySent) {
    finalReason += " Mesajul este deja înregistrat ca queued/sent.";
  }

  if (!validPhone) {
    finalReason += " Numărul de telefon lipsește sau nu este valid.";
  }

  return {
    reservationCode: folder.code,
    trigger,
    template,
    message: renderGuestAutomationMessage(trigger, folder),
    guest: {
      name: folder.summary.guest.name,
      phone,
      email: folder.summary.guest.email,
    },
    stay: {
      checkIn: folder.summary.checkIn,
      checkOut: folder.summary.checkOut,
      lifecycleStatus: folder.lifecycleStatus,
    },
    channel: "whatsapp",
    eligible,
    alreadySent,
    reason: finalReason,
    daysToCheckIn,
    daysToCheckOut,
  };
}

function detectTriggers(
  folder: ReservationFolder,
  today: string
): GuestAutomationCandidate[] {
  if (isInactiveReservation(folder)) return [];

  const daysToCheckIn = differenceInCalendarDays(folder.summary.checkIn, today);
  const daysToCheckOut = differenceInCalendarDays(folder.summary.checkOut, today);

  if (!Number.isFinite(daysToCheckIn) || !Number.isFinite(daysToCheckOut)) {
    return [];
  }

  const candidates: GuestAutomationCandidate[] = [];

  if (folder.lifecycleStatus === "confirmed" && daysToCheckIn === 1) {
    candidates.push(
      createCandidate(
        folder,
        "PRE_STAY",
        today,
        "Sosirea este mâine; se poate pregăti mesajul pre-stay."
      )
    );
  }

  if (
    folder.lifecycleStatus === "confirmed" &&
    daysToCheckIn === 0 &&
    folder.operations.checkInStatus !== "completed"
  ) {
    candidates.push(
      createCandidate(folder, "CHECK_IN_DAY", today, "Astăzi este ziua de check-in.")
    );
  }

  if (
    folder.lifecycleStatus === "checked_in" &&
    daysToCheckIn < 0 &&
    daysToCheckOut > 1
  ) {
    candidates.push(
      createCandidate(folder, "IN_STAY", today, "Oaspetele este în timpul sejurului.")
    );
  }

  if (folder.lifecycleStatus === "checked_in" && daysToCheckOut === 1) {
    candidates.push(
      createCandidate(folder, "PRE_CHECKOUT", today, "Plecare programată mâine.")
    );
  }

  if (
    ["checked_out", "completed"].includes(folder.lifecycleStatus) &&
    daysToCheckOut === -1
  ) {
    candidates.push(
      createCandidate(folder, "POST_STAY", today, "Sejurul s-a încheiat ieri.")
    );
  }

  return candidates;
}

export async function previewGuestAutomations(
  date = new Date()
): Promise<GuestAutomationPreview> {
  const today = getRomaniaDateKey(date);
  const folders = await listReservationFolders();
  const items = folders.flatMap((folder) => detectTriggers(folder, today));
  const eligible = items.filter((item) => item.eligible).length;

  return {
    generatedAt: new Date().toISOString(),
    today,
    dryRun: true,
    totalReservations: folders.length,
    candidates: items.length,
    eligible,
    skipped: items.length - eligible,
    items,
  };
}
