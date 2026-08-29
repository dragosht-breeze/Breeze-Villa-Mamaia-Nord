import { randomUUID } from "node:crypto";
import { previewGuestAutomations, communicationExists } from "@/lib/guest-automation/engine";
import type {
  GuestAutomationQueueItem,
  GuestAutomationQueueReport,
} from "@/lib/guest-automation/types";
import { getReservationFolder, saveReservationFolder } from "@/lib/reservation-center/store";
import type {
  ReservationCommunication,
  ReservationTimelineEvent,
} from "@/lib/reservation-center/types";

function now() {
  return new Date().toISOString();
}

export async function queueGuestAutomations(
  date = new Date()
): Promise<GuestAutomationQueueReport> {
  const preview = await previewGuestAutomations(date);
  const items: GuestAutomationQueueItem[] = [];

  for (const candidate of preview.items) {
    if (!candidate.eligible) {
      items.push({
        reservationCode: candidate.reservationCode,
        trigger: candidate.trigger,
        template: candidate.template,
        channel: candidate.channel,
        recipient: candidate.guest.phone,
        status: "skipped",
        reason: candidate.reason,
      });
      continue;
    }

    const folder = await getReservationFolder(candidate.reservationCode);

    if (!folder) {
      items.push({
        reservationCode: candidate.reservationCode,
        trigger: candidate.trigger,
        template: candidate.template,
        channel: candidate.channel,
        recipient: candidate.guest.phone,
        status: "skipped",
        reason: "Reservation Folder nu mai există.",
      });
      continue;
    }

    if (communicationExists(folder.communications, candidate.template)) {
      items.push({
        reservationCode: candidate.reservationCode,
        trigger: candidate.trigger,
        template: candidate.template,
        channel: candidate.channel,
        recipient: candidate.guest.phone,
        status: "skipped",
        reason: "Mesajul este deja queued sau sent.",
      });
      continue;
    }

    const createdAt = now();
    const communicationId = randomUUID();

    const communication: ReservationCommunication = {
      id: communicationId,
      channel: candidate.channel,
      template: candidate.template,
      status: "queued",
      recipient: candidate.guest.phone,
      message: candidate.message,
      createdAt,
    };

    const timelineEvent: ReservationTimelineEvent = {
      id: randomUUID(),
      at: createdAt,
      category: "communication",
      action: "guest_automation_queued",
      title: `Mesaj automat pregătit: ${candidate.trigger}`,
      note: `${candidate.template} • ${candidate.channel} • ${candidate.guest.phone}`,
      actor: "system",
    };

    await saveReservationFolder({
      ...folder,
      communications: [...folder.communications, communication],
      timeline: [...folder.timeline, timelineEvent],
      updatedAt: createdAt,
    });

    items.push({
      reservationCode: candidate.reservationCode,
      trigger: candidate.trigger,
      template: candidate.template,
      channel: candidate.channel,
      recipient: candidate.guest.phone,
      status: "queued",
      reason: "Mesajul a fost pus în coadă. Trimiterea externă este dezactivată.",
      communicationId,
    });
  }

  const queued = items.filter((item) => item.status === "queued").length;

  return {
    generatedAt: new Date().toISOString(),
    today: preview.today,
    dryRun: false,
    deliveryEnabled: false,
    candidates: preview.candidates,
    queued,
    skipped: items.length - queued,
    items,
  };
}
