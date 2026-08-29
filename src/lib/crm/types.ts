export type CustomerTier = "new" | "returning" | "loyal" | "vip";

export type CustomerStay = {
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  apartmentTitles: string[];
  total: number;
  paid: number;
  balance: number;
  source: "direct" | "booking" | "manual";
  lifecycleStatus: string;
};

import type { CustomerIntelligence } from "@/lib/crm/intelligence";

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  aliases: string[];
  tier: CustomerTier;
  reservationCount: number;
  completedStayCount: number;
  totalNights: number;
  totalValue: number;
  totalPaid: number;
  outstandingBalance: number;
  averageStayNights: number;
  firstStay?: string;
  lastStay?: string;
  nextStay?: string;
  favoriteApartment?: string;
  hasFutureReservation: boolean;
  stays: CustomerStay[];
  intelligence?: CustomerIntelligence;
};

export type CrmSummary = {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  loyalCustomers: number;
  vipCustomers: number;
  totalCustomerValue: number;
  averageCustomerValue: number;
  customersWithBalance: number;
  highReturnProbabilityCustomers: number;
  estimatedPortfolioValue3Years: number;
  eliteCustomers: number;
};
