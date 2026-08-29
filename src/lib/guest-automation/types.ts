import type { ReservationLifecycleStatus } from "@/lib/reservation-center/types";

export type GuestAutomationTrigger =
  | "PRE_STAY"
  | "CHECK_IN_DAY"
  | "IN_STAY"
  | "PRE_CHECKOUT"
  | "POST_STAY";

export type GuestAutomationChannel =
  | "whatsapp"
  | "email";

export type GuestAutomationCandidate = {
  reservationCode: string;
  trigger: GuestAutomationTrigger;
  template: string;
  message: string;

  guest: {
    name: string;
    phone: string;
    email?: string;
  };

  stay: {
    checkIn: string;
    checkOut: string;
    lifecycleStatus: ReservationLifecycleStatus;
  };

  channel: GuestAutomationChannel;
  eligible: boolean;
  alreadySent: boolean;
  reason: string;
  daysToCheckIn: number;
  daysToCheckOut: number;
};

export type GuestAutomationPreview = {
  generatedAt: string;
  today: string;
  dryRun: true;
  totalReservations: number;
  candidates: number;
  eligible: number;
  skipped: number;
  items: GuestAutomationCandidate[];
};

export type GuestAutomationQueueItem = {
  reservationCode: string;
  trigger: GuestAutomationTrigger;
  template: string;
  channel: GuestAutomationChannel;
  recipient: string;
  status: "queued" | "skipped";
  reason: string;
  communicationId?: string;
};

export type GuestAutomationQueueReport = {
  generatedAt: string;
  today: string;
  dryRun: false;
  deliveryEnabled: false;
  candidates: number;
  queued: number;
  skipped: number;
  items: GuestAutomationQueueItem[];
};

export type GuestAutomationDeliveryItem = {
  reservationCode: string;
  communicationId: string;
  template: string;
  recipient: string;
  status: "sent" | "failed" | "skipped" | "disabled";
  reason: string;
  providerMessageId?: string;
};

export type GuestAutomationDeliveryReport = {
  generatedAt: string;
  deliveryEnabled: boolean;
  whatsappConfigured: boolean;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  disabled: number;
  items: GuestAutomationDeliveryItem[];
};
