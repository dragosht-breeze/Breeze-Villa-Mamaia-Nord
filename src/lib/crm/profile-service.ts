import { getCrmData } from "@/lib/crm/service";
import { getCustomerDomainRecord } from "@/lib/domain/customer-service";
import { getCustomerMetadata } from "@/lib/crm/metadata-store";
import { calculateCustomerIntelligence } from "@/lib/crm/intelligence";

function modeLabel(mode?: string) {
  const labels: Record<string, string> = {
    deposit_request: "Avans online",
    full_payment: "Plată integrală",
    vacation_card_full: "Card de vacanță",
    vacation_card_partial: "Card de vacanță + diferență",
    bank_transfer: "Transfer bancar",
    card_online: "Card online",
    cash: "Numerar",
    pos: "POS",
  };
  return mode ? labels[mode] ?? mode.replaceAll("_", " ") : "Nedeterminată";
}

export async function getCustomerProfileDetails(id: string) {
  const [{ customers }, domain, metadata] = await Promise.all([getCrmData(), getCustomerDomainRecord(id), getCustomerMetadata(id)]);
  const profile = customers.find((customer) => customer.id === id);
  if (!profile || !domain) return null;

  const reservations = domain.reservations;
  const directCount = reservations.filter((reservation) => reservation.source === "direct").length;
  const intelligence = calculateCustomerIntelligence(profile, reservations);
  const score = intelligence.guestScore;

  const monthCounts = new Map<number, number>();
  const paymentCounts = new Map<string, number>();
  reservations.forEach((reservation) => {
    const month = Number(reservation.checkIn.slice(5, 7));
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
    paymentCounts.set(modeLabel(reservation.selectedPaymentMode), (paymentCounts.get(modeLabel(reservation.selectedPaymentMode)) ?? 0) + 1);
  });
  const favoriteMonth = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const preferredPaymentMethod = [...paymentCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Nedeterminată";
  const comesWithChildren = reservations.some((reservation) => reservation.childAges.length > 0);

  const autoTags = [
    profile.tier === "vip" ? "VIP Breeze" : "",
    profile.reservationCount > 1 ? "Client recurent" : "",
    comesWithChildren ? "Familie cu copii" : "",
    directCount === profile.reservationCount && profile.reservationCount > 0 ? "Rezervă direct" : "",
    preferredPaymentMethod.toLocaleLowerCase("ro-RO").includes("vacanță") ? "Card de vacanță" : "",
  ].filter(Boolean);

  const timeline = reservations.flatMap((reservation) => [
    {
      id: `stay-${reservation.code}`,
      at: `${reservation.checkIn}T12:00:00.000Z`,
      category: "reservation" as const,
      title: `Sejur ${reservation.apartments.map((apartment) => apartment.title).join(", ")}`,
      note: `${reservation.nights} nopți · ${reservation.total} lei · ${reservation.source === "booking" ? "Booking" : "Direct"}`,
      reservationCode: reservation.code,
    },
    ...reservation.timeline.map((event) => ({ ...event, reservationCode: reservation.code })),
    ...reservation.transactions.map((transaction) => ({
      id: transaction.id,
      at: transaction.updatedAt,
      category: "payment" as const,
      title: transaction.status === "paid" ? `Plată încasată: ${transaction.amount} lei` : `Tranzacție: ${transaction.amount} lei`,
      note: `${transaction.method.replaceAll("_", " ")} · ${transaction.status}`,
      reservationCode: reservation.code,
    })),
  ]).sort((a, b) => b.at.localeCompare(a.at));

  return {
    ...profile,
    score,
    directReservationCount: directCount,
    bookingReservationCount: reservations.filter((reservation) => reservation.source === "booking").length,
    averageReservationValue: profile.reservationCount ? Math.round(profile.totalValue / profile.reservationCount) : 0,
    preferredPaymentMethod,
    favoriteMonth,
    comesWithChildren,
    tags: [...new Set([...autoTags, ...metadata.tags])],
    manualTags: metadata.tags,
    notes: metadata.notes,
    reservations,
    timeline,
    intelligence,
  };
}
