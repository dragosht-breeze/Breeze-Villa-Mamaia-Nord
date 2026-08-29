import { NextResponse } from "next/server";
import { apartments } from "@/data/apartments";
import { listReservationFolders } from "@/lib/reservation-center/store";

export const dynamic = "force-dynamic";

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${map.year}-${map.month}-${map.day}`;
}

function requestTime(
  requests: Array<{
    type: string;
    status: string;
    requestedTime?: string;
  }>,
  type: string,
  fallback: string
) {
  const request = requests.find(
    (item) =>
      item.type === type &&
      !["rejected", "cancelled"].includes(item.status)
  );

  return request?.requestedTime || fallback;
}

function isSelfCheckIn(
  requests: Array<{
    type: string;
    status: string;
    requestedTime?: string;
  }>
) {
  return requests.some(
    (request) =>
      request.type === "self_checkin" &&
      !["rejected", "cancelled"].includes(request.status)
  );
}

function hasTransfer(
  requests: Array<{
    type: string;
    status: string;
    requestedTime?: string;
  }>
) {
  return requests.some(
    (request) =>
      request.type === "transfer" &&
      !["rejected", "cancelled"].includes(request.status)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const selectedDate = url.searchParams.get("date") || dateKey();
  const folders = await listReservationFolders();

  const active = folders.filter(
    (folder) =>
      !["cancelled", "expired"].includes(folder.lifecycleStatus)
  );

  const reservations = active.map((folder) => {
    const requests = folder.requests.map((request) => ({
      type: request.type,
      status: request.status,
      requestedTime: request.requestedTime,
    }));

    const arrivalTime = requestTime(
      requests,
      "early_checkin",
      isSelfCheckIn(requests) ? "18:00+" : "15:00"
    );

    const departureTime = requestTime(
      requests,
      "late_checkout",
      "10:00"
    );

    return {
      code: folder.code,
      lifecycleStatus: folder.lifecycleStatus,
      paymentStatus: folder.paymentStatus,
      guestName: folder.summary.guest.name,
      phone: folder.summary.guest.phone,
      email: folder.summary.guest.email ?? "",
      apartmentTitles: folder.summary.apartments.map(
        (item) => item.title
      ),
      checkIn: folder.summary.checkIn,
      checkOut: folder.summary.checkOut,
      adults: folder.summary.adults,
      children: folder.summary.childAges.length,
      total: folder.financial.total,
      paid: folder.financial.paid,
      balance: folder.financial.balance,
      paymentMode:
        folder.financial.selectedPaymentMode ?? "",
      requests,
      arrivalTime,
      departureTime,
      selfCheckIn: isSelfCheckIn(requests),
      transfer: hasTransfer(requests),
      operations: folder.operations,
      updatedAt: folder.updatedAt,
    };
  });

  const arrivals = reservations
    .filter((item) => item.checkIn === selectedDate)
    .sort((a, b) =>
      a.arrivalTime.localeCompare(b.arrivalTime)
    );

  const departures = reservations
    .filter((item) => item.checkOut === selectedDate)
    .sort((a, b) =>
      a.departureTime.localeCompare(b.departureTime)
    );

  const cleaning = departmentsToCleaning(departures);

  const outstanding = reservations
    .filter(
      (item) =>
        item.balance > 0 &&
        item.checkIn <= selectedDate &&
        item.checkOut >= selectedDate
    )
    .sort((a, b) => b.balance - a.balance);

  const apartmentState = apartments.map((apartment) => {
    const current = reservations.find(
      (item) =>
        item.apartmentTitles.includes(apartment.title) &&
        item.checkIn <= selectedDate &&
        item.checkOut > selectedDate
    );

    const arrival = arrivals.find((item) =>
      item.apartmentTitles.includes(apartment.title)
    );

    const departure = departures.find((item) =>
      item.apartmentTitles.includes(apartment.title)
    );

    if (departure) {
      return {
        slug: apartment.slug,
        title: apartment.shortTitle,
        status: "check_out",
        label: "Check-out azi",
        code: departure.code,
      };
    }

    if (arrival) {
      return {
        slug: apartment.slug,
        title: apartment.shortTitle,
        status: "check_in",
        label: `Check-in ${arrival.arrivalTime}`,
        code: arrival.code,
      };
    }

    if (current) {
      return {
        slug: apartment.slug,
        title: apartment.shortTitle,
        status: "occupied",
        label: `Ocupat • ${current.guestName}`,
        code: current.code,
      };
    }

    return {
      slug: apartment.slug,
      title: apartment.shortTitle,
      status: "free",
      label: "Liber",
      code: null,
    };
  });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    selectedDate,
    stats: {
      arrivals: arrivals.length,
      departures: departures.length,
      cleaning: cleaning.length,
      cleaningPending: cleaning.filter(
        (item) =>
          item.operations.cleaningStatus === "not_scheduled" ||
          item.operations.cleaningStatus === "scheduled"
      ).length,
      cleaningInProgress: cleaning.filter(
        (item) =>
          item.operations.cleaningStatus === "in_progress"
      ).length,
      cleaningReady: cleaning.filter(
        (item) => item.operations.cleaningStatus === "ready"
      ).length,
      outstandingCount: outstanding.length,
      outstandingAmount: outstanding.reduce(
        (sum, item) => sum + item.balance,
        0
      ),
    },
    arrivals,
    departures,
    cleaning,
    outstanding,
    apartmentState,
  });
}

function departmentsToCleaning<
  T extends {
    operations: {
      cleaningStatus:
        | "not_scheduled"
        | "scheduled"
        | "in_progress"
        | "ready";
    };
  },
>(departures: T[]) {
  return departures;
}
