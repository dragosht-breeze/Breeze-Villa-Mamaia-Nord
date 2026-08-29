export type ReservationLifecycleStatus =
  | "new_request"
  | "waiting_payment"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "expired"
  | "cancel_requested"
  | "cancelled";

export type FinancialTransactionStatus =
  | "pending"
  | "link_pending"
  | "redirect_required"
  | "processing"
  | "paid"
  | "failed"
  | "refund_pending"
  | "refunded"
  | "cancelled";

export type FinancialTransaction = {
  id: string;
  kind: "payment" | "refund" | "service" | "adjustment";
  method: "card_online" | "vacation_card_link" | "bank_transfer" | "pos" | "cash" | "manual";
  scope: "deposit" | "partial" | "full" | "refund" | "service" | "adjustment";
  amount: number;
  currency: "RON";
  status: FinancialTransactionStatus;
  providerReference?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type GuestRequest = {
  id: string;
  type: "early_checkin" | "late_checkout" | "transfer" | "free_cancellation" | "other";
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestedTime?: string;
  details?: string;
  approvedCost?: number;
  createdAt: string;
  updatedAt: string;
};

export type ReservationTimelineEvent = {
  id: string;
  at: string;
  category: "reservation" | "payment" | "communication" | "request" | "operation" | "document" | "system";
  action: string;
  title: string;
  note?: string;
  actor: "guest" | "admin" | "system";
};

export type ReservationCommunication = {
  id: string;
  channel: "email" | "whatsapp" | "sms" | "system";
  template: string;
  status: "queued" | "sending" | "sent" | "failed";
  recipient?: string;
  message?: string;
  providerMessageId?: string;
  attempts?: number;
  lastAttemptAt?: string;
  error?: string;
  createdAt: string;
  sentAt?: string;
};

export type ReservationDocument = {
  id: string;
  type: "confirmation" | "invoice" | "receipt" | "contract" | "other";
  status: "pending" | "generated" | "sent" | "failed";
  url?: string;
  createdAt: string;
};

export type ReservationFolder = {
  code: string;
  lifecycleStatus: ReservationLifecycleStatus;
  paymentStatus: "unpaid" | "partially_paid" | "paid" | "refunded";
  source: "direct" | "booking" | "manual";
  summary: {
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    childAges: number[];
    guest: { name: string; phone: string; email?: string; message?: string };
    apartments: { slug: string; title: string; totalPrice: number }[];
    total: number;
  };
  financial: {
    total: number;
    requiredDeposit: number;
    paid: number;
    refunded: number;
    balance: number;
    selectedPaymentMode?: string;
    selectedPaymentAmount?: number;
    transactions: FinancialTransaction[];
  };
  communications: ReservationCommunication[];
  requests: GuestRequest[];
  operations: {
    cleaningStatus: "not_scheduled" | "scheduled" | "in_progress" | "ready";
    checkInStatus: "pending" | "ready" | "completed";
    checkOutStatus: "pending" | "completed";
    internalNotes: string[];
    maintenanceRequired?: boolean;
    maintenanceNote?: string;
  };
  timeline: ReservationTimelineEvent[];
  documents: ReservationDocument[];
  legacyRequestIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ReservationHealthLevel = "ok" | "attention" | "critical";

export type ReservationHealth = {
  level: ReservationHealthLevel;
  label: string;
  reasons: string[];
};

export type ReservationNextAction = {
  code:
    | "await_payment"
    | "send_payment_link"
    | "review_request"
    | "prepare_checkin"
    | "complete_checkin"
    | "prepare_checkout"
    | "complete_checkout"
    | "none";
  label: string;
  priority: "low" | "medium" | "high";
};

export type ReservationFolderSummary = {
  code: string;
  lifecycleStatus: ReservationLifecycleStatus;
  paymentStatus: ReservationFolder["paymentStatus"];
  guestName: string;
  apartmentTitles: string[];
  checkIn: string;
  checkOut: string;
  total: number;
  paid: number;
  balance: number;
  selectedPaymentMode?: string;
  selectedPaymentAmount?: number;
  health: ReservationHealth;
  nextAction: ReservationNextAction;
  createdAt: string;
  updatedAt: string;
};
