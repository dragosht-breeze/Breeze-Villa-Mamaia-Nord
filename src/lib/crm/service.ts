import { createHash } from "node:crypto";
import { listReservationFolders } from "@/lib/reservation-center/store";
import type { ReservationFolder } from "@/lib/reservation-center/types";
import type { CrmSummary, CustomerProfile, CustomerStay, CustomerTier } from "@/lib/crm/types";
import { calculateCustomerIntelligence } from "@/lib/crm/intelligence";

function normalizeText(value?: string | null) {
  return (value ?? "")
    .toLocaleLowerCase("ro-RO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePhone(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10 && digits.startsWith("0")) return `40${digits.slice(1)}`;
  if (digits.length === 9) return `40${digits}`;
  return digits;
}

function normalizeEmail(value?: string | null) {
  return normalizeText(value);
}

function customerTier(reservations: number, totalValue: number): CustomerTier {
  if (reservations >= 5 || totalValue >= 12000) return "vip";
  if (reservations >= 3 || totalValue >= 7000) return "loyal";
  if (reservations >= 2) return "returning";
  return "new";
}

function pickDisplayName(folders: ReservationFolder[]) {
  return [...folders]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((folder) => folder.summary.guest.name.trim())
    .find(Boolean) ?? "Client fără nume";
}

function buildGroups(folders: ReservationFolder[]) {
  const parent = folders.map((_, index) => index);
  const find = (value: number): number => {
    if (parent[value] !== value) parent[value] = find(parent[value]);
    return parent[value];
  };
  const union = (a: number, b: number) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };

  const tokenOwner = new Map<string, number>();
  folders.forEach((folder, index) => {
    const phone = normalizePhone(folder.summary.guest.phone);
    const email = normalizeEmail(folder.summary.guest.email);
    const tokens = [phone ? `p:${phone}` : "", email ? `e:${email}` : ""].filter(Boolean);
    if (tokens.length === 0) tokens.push(`n:${normalizeText(folder.summary.guest.name)}:${folder.code}`);
    for (const token of tokens) {
      const owner = tokenOwner.get(token);
      if (owner === undefined) tokenOwner.set(token, index);
      else union(index, owner);
    }
  });

  const groups = new Map<number, ReservationFolder[]>();
  folders.forEach((folder, index) => {
    const root = find(index);
    groups.set(root, [...(groups.get(root) ?? []), folder]);
  });
  return [...groups.values()];
}

function profileFromFolders(folders: ReservationFolder[], today: string): CustomerProfile {
  const ordered = [...folders].sort((a, b) => a.summary.checkIn.localeCompare(b.summary.checkIn));
  const name = pickDisplayName(folders);
  const phone = [...folders].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(f=>f.summary.guest.phone.trim()).find(Boolean) ?? "";
  const email = [...folders].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(f=>f.summary.guest.email?.trim()).find(Boolean);
  const aliases = [...new Set(folders.map((folder) => folder.summary.guest.name.trim()).filter(Boolean))].filter(alias => alias !== name);

  const stays: CustomerStay[] = ordered.map((folder) => ({
    reservationCode: folder.code,
    checkIn: folder.summary.checkIn,
    checkOut: folder.summary.checkOut,
    nights: folder.summary.nights,
    apartmentTitles: folder.summary.apartments.map((apartment) => apartment.title),
    total: folder.financial.total,
    paid: folder.financial.paid,
    balance: folder.financial.balance,
    source: folder.source,
    lifecycleStatus: folder.lifecycleStatus,
  }));

  const totalValue = folders.reduce((sum, folder) => sum + folder.financial.total, 0);
  const totalPaid = folders.reduce((sum, folder) => sum + folder.financial.paid, 0);
  const outstandingBalance = folders.reduce((sum, folder) => sum + folder.financial.balance, 0);
  const totalNights = folders.reduce((sum, folder) => sum + folder.summary.nights, 0);
  const completedStayCount = folders.filter(folder => ["checked_out", "completed"].includes(folder.lifecycleStatus) || folder.summary.checkOut < today).length;
  const past = ordered.filter(folder => folder.summary.checkIn <= today);
  const future = ordered.filter(folder => folder.summary.checkIn > today);

  const apartmentFrequency = new Map<string, number>();
  folders.forEach(folder => folder.summary.apartments.forEach(apartment => apartmentFrequency.set(apartment.title, (apartmentFrequency.get(apartment.title) ?? 0) + 1)));
  const favoriteApartment = [...apartmentFrequency.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];

  const identity = normalizePhone(phone) || normalizeEmail(email) || `${normalizeText(name)}:${ordered[0]?.code ?? "customer"}`;
  const id = createHash("sha1").update(identity).digest("hex").slice(0, 16);

  return {
    id,
    name,
    phone,
    email,
    aliases,
    tier: customerTier(folders.length, totalValue),
    reservationCount: folders.length,
    completedStayCount,
    totalNights,
    totalValue,
    totalPaid,
    outstandingBalance,
    averageStayNights: folders.length ? Math.round((totalNights / folders.length) * 10) / 10 : 0,
    firstStay: ordered[0]?.summary.checkIn,
    lastStay: past.at(-1)?.summary.checkIn,
    nextStay: future[0]?.summary.checkIn,
    favoriteApartment,
    hasFutureReservation: future.length > 0,
    stays: stays.sort((a,b) => b.checkIn.localeCompare(a.checkIn)),
  };
}

export async function getCrmData() {
  const folders = await listReservationFolders();
  const today = new Date().toISOString().slice(0, 10);
  const customers = buildGroups(folders)
    .map(group => profileFromFolders(group, today))
    .map(customer => ({ ...customer, intelligence: calculateCustomerIntelligence(customer, undefined, today) }))
    .sort((a,b) => b.totalValue - a.totalValue || b.reservationCount - a.reservationCount || a.name.localeCompare(b.name, "ro"));

  const summary: CrmSummary = {
    totalCustomers: customers.length,
    newCustomers: customers.filter(customer => customer.tier === "new").length,
    returningCustomers: customers.filter(customer => customer.tier === "returning").length,
    loyalCustomers: customers.filter(customer => customer.tier === "loyal").length,
    vipCustomers: customers.filter(customer => customer.tier === "vip").length,
    totalCustomerValue: customers.reduce((sum, customer) => sum + customer.totalValue, 0),
    averageCustomerValue: customers.length ? Math.round(customers.reduce((sum, customer) => sum + customer.totalValue, 0) / customers.length) : 0,
    customersWithBalance: customers.filter(customer => customer.outstandingBalance > 0).length,
    highReturnProbabilityCustomers: customers.filter(customer => (customer.intelligence?.returnProbabilityScore ?? 0) >= 60).length,
    estimatedPortfolioValue3Years: customers.reduce((sum, customer) => sum + (customer.intelligence?.estimatedLifetimeValue3Years ?? customer.totalValue), 0),
    eliteCustomers: customers.filter(customer => customer.intelligence?.loyaltyLevel === "elite").length,
  };

  return { customers, summary, generatedAt: new Date().toISOString() };
}
