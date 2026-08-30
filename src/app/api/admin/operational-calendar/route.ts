import { NextResponse } from "next/server";
import { apartments } from "@/data/apartments";
import { listReservationFolders } from "@/lib/reservation-center/store";
import { listReservationRequests } from "@/lib/reservationStore";
import { readBookingSyncStore } from "@/lib/booking-sync/store";

export const runtime = "nodejs";

const calendarApartmentOrder = [
  "studio",
  "apartament-superior",
  "apartament-3-etaj-1",
  "apartament-2",
  "apartament-3-etaj-2",
  "apartament-3-premium",
  "apartament-2-etaj-3",
];

export async function GET() {
  const [folders, requests, bookingSync] = await Promise.all([
    listReservationFolders(),
    listReservationRequests(),
    readBookingSyncStore(),
  ]);

  const folderLegacyIds = new Set(
    folders.flatMap((folder) => folder.legacyRequestIds)
  );

  const reservations = [
    ...folders.flatMap((folder) =>
      folder.summary.apartments.map((apartment) => ({
        id: `${folder.code}:${apartment.slug}`,
        code: folder.code,
        apartmentSlug: apartment.slug,
        apartmentTitle: apartment.title,
        guestName: folder.summary.guest.name,
        phone: folder.summary.guest.phone,
        email: folder.summary.guest.email ?? "",
        checkIn: folder.summary.checkIn,
        checkOut: folder.summary.checkOut,
        adults: folder.summary.adults,
        children: folder.summary.childAges.length,
        total: folder.financial.total,
        paid: folder.financial.paid,
        balance: folder.financial.balance,
        paymentMode: folder.financial.selectedPaymentMode ?? "",
        lifecycleStatus: folder.lifecycleStatus,
        paymentStatus: folder.paymentStatus,
        source: folder.source,
        requests: folder.requests.filter((request) => request.status === "pending"),
      }))
    ),
    ...requests
      .filter((request) => !folderLegacyIds.has(request.id))
      .filter((request) => !["expired", "cancelled"].includes(request.status))
      .map((request) => ({
        id: request.id,
        code: request.groupCode ?? request.id,
        apartmentSlug: request.apartmentSlug,
        apartmentTitle: request.apartmentTitle,
        guestName: request.guest.name,
        phone: request.guest.phone,
        email: request.guest.email ?? "",
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        adults: request.adults,
        children: request.children,
        total: request.groupTotal ?? request.total,
        paid: request.status === "paid_full" ? request.total : 0,
        balance: request.payment?.remainingBalance ?? request.total,
        paymentMode: request.payment?.choice ?? request.paymentMode,
        lifecycleStatus:
          request.status === "confirmed_deposit" || request.status === "paid_full"
            ? "confirmed"
            : "waiting_payment",
        paymentStatus:
          request.status === "paid_full"
            ? "paid"
            : request.status === "confirmed_deposit"
              ? "partially_paid"
              : "unpaid",
        source: "direct",
        requests: [],
      })),
  ];

  return NextResponse.json({
    ok: true,
    apartments: [...apartments]
      .sort(
        (left, right) =>
          calendarApartmentOrder.indexOf(left.slug) -
          calendarApartmentOrder.indexOf(right.slug)
      )
      .map((apartment) => ({
      slug: apartment.slug,
      title: apartment.title,
      shortTitle: apartment.shortTitle,
      floor: apartment.floor,
      guests: apartment.guests,
      })),
    reservations,
    bookingEvents: bookingSync.events.map((event) => ({
      id: event.id,
      apartmentSlug: event.apartmentSlug,
      start: event.start,
      end: event.end,
      summary: event.summary || "Rezervare Booking",
      provider: event.provider,
    })),
  });
}
