import { JsonFileRepository } from "@/lib/data";
import type {
  ReservationRequest,
  ReservationStatus,
} from "@/lib/reservationStore";
import { listReservationFolders } from "@/lib/reservation-center/store";

type LegacyStoreShape = {
  requests: ReservationRequest[];
};

export type ReservationBootstrapStatus =
  | "ready"
  | "already_migrated"
  | "partial_match"
  | "blocked";

export type ReservationBootstrapItem = {
  migrationKey: string;
  groupCode?: string;

  legacyRequestIds: string[];

  status: ReservationBootstrapStatus;

  guest: {
    name: string;
    phone: string;
    email?: string;
  };

  stay: {
    checkIn: string;
    checkOut: string;
    nights: number;
  };

  apartments: Array<{
    slug: string;
    title: string;
    totalPrice: number;
  }>;

  financial: {
    total: number;
    requiredDeposit: number | null;
    estimatedPaid: number | null;
    legacyStatuses: ReservationStatus[];
  };

  warnings: string[];
};

export type ReservationBootstrapPreview = {
  generatedAt: string;
  dryRun: true;

  legacyRequests: number;
  legacyGroups: number;

  confirmedGroups: number;
  readyToMigrate: number;
  alreadyMigrated: number;
  partialMatches: number;
  blocked: number;

  existingReservationFolders: number;

  items: ReservationBootstrapItem[];
};

const confirmedStatuses = new Set<ReservationStatus>([
  "confirmed_deposit",
  "paid_full",
]);

/*
 * Citim direct reservation-requests.json.
 *
 * Nu folosim listReservationRequests() aici deoarece acea funcție
 * poate expira automat cereri vechi și poate scrie în storage.
 *
 * Preview-ul trebuie să fie cât mai aproape de read-only.
 */
const legacyRepository =
  new JsonFileRepository<LegacyStoreShape>({
    fileName: "reservation-requests.json",

    createDefault: () => ({
      requests: [],
    }),

    normalize(value) {
      const parsed =
        (value ?? {}) as Partial<LegacyStoreShape>;

      return {
        requests: Array.isArray(parsed.requests)
          ? parsed.requests
          : [],
      };
    },
  });

function isPositiveNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function groupLegacyRequests(
  requests: ReservationRequest[]
) {
  const groups = new Map<
    string,
    ReservationRequest[]
  >();

  for (const request of requests) {
    const key =
      request.groupCode?.trim() ||
      request.id;

    const current =
      groups.get(key) ?? [];

    current.push(request);

    groups.set(key, current);
  }

  return groups;
}

function deriveRequiredDeposit(
  requests: ReservationRequest[]
) {
  const values = requests
    .map(
      (request) =>
        request.payment?.requiredDeposit
    )
    .filter(isPositiveNumber);

  if (values.length === 0) {
    return null;
  }

  /*
   * Pentru o cerere de grup aceeași valoare poate exista
   * pe mai multe request-uri. Nu o însumăm.
   */
  return Math.max(...values);
}

function deriveEstimatedPaid(
  requests: ReservationRequest[],
  total: number,
  requiredDeposit: number | null
) {
  const statuses = requests.map(
    (request) => request.status
  );

  if (
    statuses.length > 0 &&
    statuses.every(
      (status) => status === "paid_full"
    )
  ) {
    return total;
  }

  if (
    statuses.some(
      (status) =>
        status === "confirmed_deposit"
    )
  ) {
    return requiredDeposit;
  }

  return null;
}

function deriveTotal(
  requests: ReservationRequest[]
) {
  const groupTotals = requests
    .map((request) => request.groupTotal)
    .filter(isPositiveNumber);

  if (groupTotals.length > 0) {
    /*
     * groupTotal se repetă de regulă pe request-urile
     * aceleiași rezervări de grup.
     */
    return Math.max(...groupTotals);
  }

  return requests.reduce(
    (sum, request) =>
      sum +
      (isPositiveNumber(request.total)
        ? request.total
        : 0),
    0
  );
}

function buildApartments(
  requests: ReservationRequest[]
) {
  const bySlug = new Map<
    string,
    {
      slug: string;
      title: string;
      totalPrice: number;
    }
  >();

  for (const request of requests) {
    /*
     * Dacă request-ul conține deja lista completă de
     * apartamente, o preferăm.
     */
    if (
      Array.isArray(request.apartments) &&
      request.apartments.length > 0
    ) {
      for (const apartment of request.apartments) {
        if (!apartment.slug) continue;

        bySlug.set(apartment.slug, {
          slug: apartment.slug,
          title:
            apartment.title ||
            apartment.slug,
          totalPrice:
            Number(apartment.totalPrice) ||
            0,
        });
      }

      continue;
    }

    if (!request.apartmentSlug) {
      continue;
    }

    bySlug.set(request.apartmentSlug, {
      slug: request.apartmentSlug,
      title:
        request.apartmentTitle ||
        request.apartmentSlug,
      totalPrice:
        Number(request.total) || 0,
    });
  }

  return [...bySlug.values()];
}

function buildBootstrapItem(
  migrationKey: string,
  requests: ReservationRequest[],
  existingFolders: Awaited<
    ReturnType<typeof listReservationFolders>
  >
): ReservationBootstrapItem {
  const first = requests[0];

  const legacyRequestIds =
    requests.map((request) => request.id);

  const warnings: string[] = [];

  const statuses = requests.map(
    (request) => request.status
  );

  const everyRequestConfirmed =
    statuses.length > 0 &&
    statuses.every((status) =>
      confirmedStatuses.has(status)
    );

  const relatedFolders =
    existingFolders.filter(
      (folder) =>
        folder.code === migrationKey ||
        legacyRequestIds.some((id) =>
          folder.legacyRequestIds.includes(id)
        )
    );

  const matchedLegacyIds = new Set(
    relatedFolders.flatMap(
      (folder) =>
        folder.legacyRequestIds
    )
  );

  const matchedCount =
    legacyRequestIds.filter((id) =>
      matchedLegacyIds.has(id)
    ).length;

  let status: ReservationBootstrapStatus;

  if (
    relatedFolders.some(
      (folder) =>
        folder.code === migrationKey
    ) ||
    matchedCount === legacyRequestIds.length
  ) {
    status = "already_migrated";
  } else if (matchedCount > 0) {
    status = "partial_match";

    warnings.push(
      "O parte din request-urile legacy apar deja într-un Reservation Folder. Migrarea automată trebuie blocată până la verificare."
    );
  } else if (!everyRequestConfirmed) {
    status = "blocked";

    warnings.push(
      "Grupul nu este confirmat integral. Pentru Guest Automation migrăm doar rezervări confirmate."
    );
  } else {
    status = "ready";
  }

  const checkIns = unique(
    requests.map(
      (request) => request.checkIn
    )
  );

  const checkOuts = unique(
    requests.map(
      (request) => request.checkOut
    )
  );

  if (checkIns.length !== 1) {
    status = "blocked";

    warnings.push(
      "Request-urile din grup au date diferite de check-in."
    );
  }

  if (checkOuts.length !== 1) {
    status = "blocked";

    warnings.push(
      "Request-urile din grup au date diferite de check-out."
    );
  }

  const guestPhones = unique(
    requests
      .map(
        (request) =>
          request.guest.phone?.trim()
      )
      .filter(Boolean)
  );

  if (guestPhones.length !== 1) {
    status = "blocked";

    warnings.push(
      "Request-urile din grup nu au un singur număr de telefon identificabil."
    );
  }

  const guestNames = unique(
    requests
      .map(
        (request) =>
          request.guest.name?.trim()
      )
      .filter(Boolean)
  );

  if (guestNames.length !== 1) {
    warnings.push(
      "Numele clientului diferă între request-urile aceluiași grup."
    );
  }

  const apartments =
    buildApartments(requests);

  if (apartments.length === 0) {
    status = "blocked";

    warnings.push(
      "Nu a putut fi identificat niciun apartament pentru migrare."
    );
  }

  const total =
    deriveTotal(requests);

  if (!isPositiveNumber(total)) {
    status = "blocked";

    warnings.push(
      "Totalul rezervării nu poate fi determinat."
    );
  }

  const requiredDeposit =
    deriveRequiredDeposit(requests);

  if (
    statuses.some(
      (legacyStatus) =>
        legacyStatus ===
        "confirmed_deposit"
    ) &&
    requiredDeposit === null
  ) {
    warnings.push(
      "Rezervarea este marcată confirmed_deposit, dar suma avansului nu este disponibilă explicit în câmpurile de plată."
    );
  }

  const estimatedPaid =
    deriveEstimatedPaid(
      requests,
      total,
      requiredDeposit
    );

  return {
    migrationKey,

    groupCode:
      first?.groupCode || undefined,

    legacyRequestIds,

    status,

    guest: {
      name:
        first?.guest.name ?? "",

      phone:
        first?.guest.phone ?? "",

      email:
        first?.guest.email,
    },

    stay: {
      checkIn:
        first?.checkIn ?? "",

      checkOut:
        first?.checkOut ?? "",

      nights:
        first?.nights ?? 0,
    },

    apartments,

    financial: {
      total,

      requiredDeposit,

      estimatedPaid,

      legacyStatuses: unique(statuses),
    },

    warnings,
  };
}

export async function previewReservationCenterBootstrap(): Promise<ReservationBootstrapPreview> {
  const legacyStore =
    await legacyRepository.read();

  const existingFolders =
    await listReservationFolders();

  const groups =
    groupLegacyRequests(
      legacyStore.requests
    );

  const items = [
    ...groups.entries(),
  ]
    .map(([migrationKey, requests]) =>
      buildBootstrapItem(
        migrationKey,
        requests,
        existingFolders
      )
    )
    .sort((left, right) => {
      const priority: Record<
        ReservationBootstrapStatus,
        number
      > = {
        ready: 0,
        partial_match: 1,
        blocked: 2,
        already_migrated: 3,
      };

      return (
        priority[left.status] -
        priority[right.status]
      );
    });

  const confirmedGroups =
    items.filter((item) =>
      item.financial.legacyStatuses.every(
        (status) =>
          confirmedStatuses.has(status)
      )
    ).length;

  const readyToMigrate =
    items.filter(
      (item) =>
        item.status === "ready"
    ).length;

  const alreadyMigrated =
    items.filter(
      (item) =>
        item.status ===
        "already_migrated"
    ).length;

  const partialMatches =
    items.filter(
      (item) =>
        item.status ===
        "partial_match"
    ).length;

  const blocked =
    items.filter(
      (item) =>
        item.status === "blocked"
    ).length;

  return {
    generatedAt:
      new Date().toISOString(),

    dryRun: true,

    legacyRequests:
      legacyStore.requests.length,

    legacyGroups:
      groups.size,

    confirmedGroups,

    readyToMigrate,

    alreadyMigrated,

    partialMatches,

    blocked,

    existingReservationFolders:
      existingFolders.length,

    items,
  };
}