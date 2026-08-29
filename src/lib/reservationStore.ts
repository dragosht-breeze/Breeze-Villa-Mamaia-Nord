import { JsonFileRepository } from "@/lib/data";
import type {
  PaymentMethod,
  PaymentScope,
  PaymentStatus,
} from "@/lib/payments/types";

export type ReservationStatus =
  | "new_request"
  | "waiting_deposit"
  | "confirmed_deposit"
  | "paid_full"
  | "expired"
  | "cancelled"
  | "cancel_requested"
  | "refund_approved"
  | "refund_rejected";

export type ReservationPaymentChoice =
  | "card_deposit"
  | "card_full"
  | "vacation_full_link"
  | "vacation_partial_link"
  | "bank_transfer";

export type ReservationPaymentDetails = {
  choice: ReservationPaymentChoice;
  method: PaymentMethod;
  scope: PaymentScope;
  requestedAmount: number;
  requiredDeposit: number;
  remainingBalance: number;
  status: PaymentStatus | "selection_saved";
  paymentId?: string;
  message?: string;
  updatedAt: string;
};

export type ReservationRequest = {
  id: string;
  groupCode?: string;
  groupTotal?: number;
  apartmentSlug: string;
  apartmentTitle: string;
  apartments?: {
    slug: string;
    title: string;
    totalPrice: number;
  }[];
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  adults: number;
  children: number;
  childAges?: number[];
  guest: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  };
  status: ReservationStatus;
  paymentMode:
    | "deposit_request"
    | "full_online"
    | ReservationPaymentChoice;
  payment?: ReservationPaymentDetails;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  history: {
    at: string;
    action: string;
    note?: string;
  }[];
};

type StoreShape = {
  requests: ReservationRequest[];
};


function nowIso() {
  return new Date().toISOString();
}

function addHours(date: Date, hours: number) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function generateId() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `BV-REQ-${datePart}-${randomPart}`;
}

const repository = new JsonFileRepository<StoreShape>({
  fileName: "reservation-requests.json",
  createDefault: () => ({ requests: [] }),
  normalize(value) {
    const parsed = (value ?? {}) as Partial<StoreShape>;
    return { requests: Array.isArray(parsed.requests) ? parsed.requests : [] };
  },
});

function readStore(): Promise<StoreShape> {
  return repository.read();
}

function writeStore(store: StoreShape) {
  return repository.write(store);
}

function expireOldRequests(requests: ReservationRequest[]) {
  const now = Date.now();
  let changed = false;

  const nextRequests = requests.map((request) => {
    const canExpire =
      request.status === "new_request" || request.status === "waiting_deposit";

    if (!canExpire) return request;
    if (new Date(request.expiresAt).getTime() > now) return request;

    const expiredAt = nowIso();
    changed = true;

    return {
      ...request,
      status: "expired" as ReservationStatus,
      updatedAt: expiredAt,
      cancelledAt: expiredAt,
      history: [
        ...request.history,
        {
          at: expiredAt,
          action: "expired_automatically",
          note:
            "Cererea a expirat automat după 48 de ore fără confirmarea avansului.",
        },
      ],
    };
  });

  return { requests: nextRequests, changed };
}

export async function listReservationRequests() {
  const store = await readStore();
  const expired = expireOldRequests(store.requests);

  if (expired.changed) {
    await writeStore({ requests: expired.requests });
  }

  return expired.requests.sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function createReservationRequest(input: {
  groupCode?: string;
  groupTotal?: number;
  apartmentSlug: string;
  apartmentTitle: string;
  apartments?: {
    slug: string;
    title: string;
    totalPrice: number;
  }[];
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  adults: number;
  children: number;
  childAges?: number[];
  paymentMode?: ReservationPaymentChoice;
  payment?: Omit<ReservationPaymentDetails, "updatedAt">;
  guest: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  };
}) {
  const store = await readStore();
  const createdAt = new Date();
  const createdAtIso = createdAt.toISOString();

  const request: ReservationRequest = {
    id: generateId(),
    groupCode: input.groupCode,
    groupTotal: input.groupTotal,
    apartmentSlug: input.apartmentSlug,
    apartmentTitle: input.apartmentTitle,
    apartments: input.apartments,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: input.nights,
    total: input.total,
    adults: input.adults,
    children: input.children,
    childAges: input.childAges,
    guest: input.guest,
    status: "new_request",
    paymentMode: input.paymentMode ?? "deposit_request",
    payment: input.payment
      ? {
          ...input.payment,
          updatedAt: createdAtIso,
        }
      : undefined,
    createdAt: createdAtIso,
    expiresAt: addHours(createdAt, 48).toISOString(),
    updatedAt: createdAtIso,
    history: [
      {
        at: createdAtIso,
        action: "created",
        note: "Cerere nouă trimisă de pe site. Calendarul nu este blocat.",
      },
      ...(input.payment
        ? [
            {
              at: createdAtIso,
              action: "payment_option_selected",
              note: `Metodă: ${input.payment.choice}; sumă solicitată: ${input.payment.requestedAmount} lei; sold rămas: ${input.payment.remainingBalance} lei.`,
            },
          ]
        : []),
    ],
  };

  await writeStore({ requests: [request, ...store.requests] });

  return request;
}

export async function updateReservationPaymentByCode(
  reservationCode: string,
  payment: {
    status: PaymentStatus;
    paymentId: string;
    requiredDeposit: number;
    remainingBalance: number;
    message?: string;
  }
) {
  const store = await readStore();
  const updatedAt = nowIso();
  let changed = false;

  const requests = store.requests.map((request) => {
    const matches =
      request.groupCode === reservationCode || request.id === reservationCode;

    if (!matches || !request.payment) return request;

    changed = true;

    return {
      ...request,
      updatedAt,
      payment: {
        ...request.payment,
        status: payment.status,
        paymentId: payment.paymentId,
        requiredDeposit: payment.requiredDeposit,
        remainingBalance: payment.remainingBalance,
        message: payment.message,
        updatedAt,
      },
      history: [
        ...request.history,
        {
          at: updatedAt,
          action: `payment_status_${payment.status}`,
          note: payment.message,
        },
      ],
    };
  });

  if (changed) {
    await writeStore({ requests });
  }

  return changed;
}

export async function updateReservationRequestStatus(
  id: string,
  status: ReservationStatus,
  note?: string
) {
  const requests = await listReservationRequests();
  const request = requests.find((item) => item.id === id);

  if (!request) return null;

  const now = nowIso();

  const updated: ReservationRequest = {
    ...request,
    status,
    updatedAt: now,
    confirmedAt:
      status === "confirmed_deposit" || status === "paid_full"
        ? now
        : request.confirmedAt,
    cancelledAt:
      status === "cancelled" || status === "expired"
        ? now
        : request.cancelledAt,
    history: [
      ...request.history,
      {
        at: now,
        action: `status_changed_to_${status}`,
        note,
      },
    ],
  };

  const nextRequests = requests.map((item) =>
    item.id === id ? updated : item
  );
  await writeStore({ requests: nextRequests });

  return updated;
}

export async function confirmReservationDeposit(id: string) {
  const requests = await listReservationRequests();
  const selected = requests.find((request) => request.id === id);

  if (!selected) return null;

  const now = nowIso();
  const targetGroupCode = selected.groupCode;
  let firstUpdated: ReservationRequest | null = null;

  const nextRequests = requests.map((request) => {
    const matches = targetGroupCode
      ? request.groupCode === targetGroupCode
      : request.id === id;

    if (!matches) return request;

    const updated: ReservationRequest = {
      ...request,
      status: "confirmed_deposit",
      updatedAt: now,
      confirmedAt: now,
      payment: request.payment
        ? {
            ...request.payment,
            status: "paid",
            updatedAt: now,
          }
        : request.payment,
      history: [
        ...request.history,
        {
          at: now,
          action: "status_changed_to_confirmed_deposit",
          note: "Avans confirmat manual din Dashboard Admin.",
        },
      ],
    };

    if (!firstUpdated) firstUpdated = updated;
    return updated;
  });

  await writeStore({ requests: nextRequests });
  return firstUpdated;
}

export async function getConfirmedDirectReservationDays(
  apartmentSlug: string
) {
  const requests = await listReservationRequests();
  const confirmed = requests.filter(
    (request) =>
      request.apartmentSlug === apartmentSlug &&
      (request.status === "confirmed_deposit" ||
        request.status === "paid_full")
  );

  const days: {
    date: string;
    status: "booked" | "checkin" | "checkout";
    source: "direct";
  }[] = [];

  confirmed.forEach((request) => {
    const start = new Date(`${request.checkIn}T12:00:00`);
    const end = new Date(`${request.checkOut}T12:00:00`);

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (key === request.checkIn) {
        days.push({ date: key, status: "checkin", source: "direct" });
      } else if (key === request.checkOut) {
        days.push({ date: key, status: "checkout", source: "direct" });
      } else {
        days.push({ date: key, status: "booked", source: "direct" });
      }
    }
  });

  return days;
}

export async function createPaidFullReservation(input: {
  apartmentSlug: string;
  apartmentTitle: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  adults: number;
  children: number;
  guest: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  };
  paymentProvider?: string;
  paymentReference?: string;
}) {
  const store = await readStore();
  const createdAt = new Date();
  const now = createdAt.toISOString();

  const reservation: ReservationRequest = {
    id: generateId().replace("BV-REQ", "BV-PAID"),
    apartmentSlug: input.apartmentSlug,
    apartmentTitle: input.apartmentTitle,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: input.nights,
    total: input.total,
    adults: input.adults,
    children: input.children,
    guest: input.guest,
    status: "paid_full",
    paymentMode: "full_online",
    createdAt: now,
    expiresAt: addHours(createdAt, 48).toISOString(),
    updatedAt: now,
    confirmedAt: now,
    history: [
      {
        at: now,
        action: "paid_full_created",
        note: `Rezervare confirmată automat prin plată integrală. Provider: ${
          input.paymentProvider ?? "test"
        }. Referință: ${input.paymentReference ?? "test"}.`,
      },
    ],
  };

  await writeStore({ requests: [reservation, ...store.requests] });

  return reservation;
}

export async function getReservationRequestById(id: string) {
  const requests = await listReservationRequests();
  return requests.find((request) => request.id === id) ?? null;
}
