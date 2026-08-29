import type { FinancialTransaction, ReservationFolder, ReservationTimelineEvent } from "@/lib/reservation-center/types";

export type DomainCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  aliases: string[];
};

export type DomainReservation = {
  code: string;
  source: ReservationFolder["source"];
  lifecycleStatus: ReservationFolder["lifecycleStatus"];
  paymentStatus: ReservationFolder["paymentStatus"];
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  childAges: number[];
  apartments: ReservationFolder["summary"]["apartments"];
  total: number;
  paid: number;
  balance: number;
  selectedPaymentMode?: string;
  transactions: FinancialTransaction[];
  timeline: ReservationTimelineEvent[];
  internalNotes: string[];
  createdAt: string;
  updatedAt: string;
};

export type CustomerDomainRecord = {
  customer: DomainCustomer;
  reservations: DomainReservation[];
};
