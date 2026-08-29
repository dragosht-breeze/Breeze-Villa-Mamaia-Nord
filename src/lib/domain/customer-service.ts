import { getCrmData } from "@/lib/crm/service";
import { listReservationFolders } from "@/lib/reservation-center/store";
import type { CustomerDomainRecord, DomainReservation } from "@/lib/domain/types";

function reservationToDomain(folder: Awaited<ReturnType<typeof listReservationFolders>>[number]): DomainReservation {
  return {
    code: folder.code,
    source: folder.source,
    lifecycleStatus: folder.lifecycleStatus,
    paymentStatus: folder.paymentStatus,
    checkIn: folder.summary.checkIn,
    checkOut: folder.summary.checkOut,
    nights: folder.summary.nights,
    adults: folder.summary.adults,
    childAges: folder.summary.childAges,
    apartments: folder.summary.apartments,
    total: folder.financial.total,
    paid: folder.financial.paid,
    balance: folder.financial.balance,
    selectedPaymentMode: folder.financial.selectedPaymentMode,
    transactions: folder.financial.transactions,
    timeline: folder.timeline,
    internalNotes: folder.operations.internalNotes,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
  };
}

export async function getCustomerDomainRecord(id: string): Promise<CustomerDomainRecord | null> {
  const [{ customers }, folders] = await Promise.all([getCrmData(), listReservationFolders()]);
  const profile = customers.find((customer) => customer.id === id);
  if (!profile) return null;
  const codes = new Set(profile.stays.map((stay) => stay.reservationCode));
  return {
    customer: {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      aliases: profile.aliases,
    },
    reservations: folders
      .filter((folder) => codes.has(folder.code))
      .map(reservationToDomain)
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn)),
  };
}
