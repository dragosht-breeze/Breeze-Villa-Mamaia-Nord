import type { CustomerProfile, CustomerStay } from "@/lib/crm/types";
import type { DomainReservation } from "@/lib/domain/types";

export type LoyaltyLevel = "new" | "returning" | "loyal" | "vip" | "elite";
export type ReturnProbability = "low" | "medium" | "high" | "very_high";
export type RecommendationPriority = "low" | "medium" | "high";

export type CustomerRecommendation = {
  id: string;
  title: string;
  reason: string;
  action: string;
  priority: RecommendationPriority;
};

export type CustomerIntelligence = {
  guestScore: number;
  relationshipScore: number;
  loyaltyLevel: LoyaltyLevel;
  currentLifetimeValue: number;
  estimatedLifetimeValue3Years: number;
  returnProbability: ReturnProbability;
  returnProbabilityScore: number;
  segments: string[];
  recommendations: CustomerRecommendation[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function roundMoney(value: number) {
  return Math.round(value / 10) * 10;
}

function yearsBetween(first?: string, last?: string) {
  if (!first || !last) return 0;
  const a = new Date(`${first.slice(0, 10)}T12:00:00`).getTime();
  const b = new Date(`${last.slice(0, 10)}T12:00:00`).getTime();
  return Math.max(0, (b - a) / (365.25 * 24 * 60 * 60 * 1000));
}

function completedOrPast(stay: CustomerStay, today: string) {
  return ["checked_out", "completed"].includes(stay.lifecycleStatus) || stay.checkOut < today;
}

function calculateGuestScore(profile: CustomerProfile, directShare: number, paidRatio: number) {
  const reservationPoints = Math.min(30, profile.reservationCount * 6);
  const valuePoints = Math.min(25, (profile.totalValue / 12000) * 25);
  const frequencyPoints = Math.min(20, Math.max(0, profile.reservationCount - 1) * 5);
  const directPoints = clamp(directShare, 0, 1) * 15;
  const paymentPoints = clamp(paidRatio, 0, 1) * 10;
  return Math.round(clamp(reservationPoints + valuePoints + frequencyPoints + directPoints + paymentPoints));
}

function calculateRelationshipScore(profile: CustomerProfile, directShare: number, paidRatio: number, cancelledShare: number) {
  const repeat = Math.min(35, profile.reservationCount * 8);
  const payment = clamp(paidRatio, 0, 1) * 30;
  const direct = clamp(directShare, 0, 1) * 20;
  const continuity = Math.min(15, yearsBetween(profile.firstStay, profile.lastStay) * 7.5);
  const cancellationPenalty = clamp(cancelledShare, 0, 1) * 35;
  return Math.round(clamp(repeat + payment + direct + continuity - cancellationPenalty));
}

function loyaltyLevel(guestScore: number, reservationCount: number, totalValue: number): LoyaltyLevel {
  if (guestScore >= 88 && (reservationCount >= 6 || totalValue >= 18000)) return "elite";
  if (guestScore >= 72 || reservationCount >= 5 || totalValue >= 12000) return "vip";
  if (guestScore >= 52 || reservationCount >= 3 || totalValue >= 7000) return "loyal";
  if (reservationCount >= 2) return "returning";
  return "new";
}

function returnScore(profile: CustomerProfile, today: string) {
  const past = profile.stays.filter((stay) => completedOrPast(stay, today));
  if (profile.hasFutureReservation) return 100;
  if (past.length === 0) return 18;

  const lastDate = profile.lastStay ? new Date(`${profile.lastStay}T12:00:00`) : null;
  const now = new Date(`${today}T12:00:00`);
  const monthsSinceLast = lastDate ? Math.max(0, (now.getTime() - lastDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)) : 24;
  const recency = clamp(45 - monthsSinceLast * 2.5, 0, 45);
  const repeat = Math.min(35, Math.max(0, profile.reservationCount - 1) * 12);
  const annualPattern = yearsBetween(profile.firstStay, profile.lastStay) >= 1 && profile.reservationCount >= 2 ? 12 : 0;
  const value = Math.min(8, profile.totalValue / 2500);
  return Math.round(clamp(recency + repeat + annualPattern + value));
}

function returnLabel(score: number): ReturnProbability {
  if (score >= 80) return "very_high";
  if (score >= 60) return "high";
  if (score >= 38) return "medium";
  return "low";
}

function estimateLifetimeValue(profile: CustomerProfile, probabilityScore: number) {
  const completed = Math.max(1, profile.completedStayCount || profile.reservationCount);
  const averageValue = profile.totalValue / completed;
  const relationshipYears = Math.max(1, yearsBetween(profile.firstStay, profile.lastStay));
  const annualFrequency = Math.max(0.35, profile.reservationCount / relationshipYears);
  const expectedVisits = annualFrequency * 3 * (probabilityScore / 100);
  return roundMoney(profile.totalValue + averageValue * expectedVisits);
}

function buildSegments(profile: CustomerProfile, reservations?: DomainReservation[]) {
  const segments = new Set<string>();
  const directCount = reservations
    ? reservations.filter((item) => item.source === "direct").length
    : profile.stays.filter((item) => item.source === "direct").length;
  const bookingCount = reservations
    ? reservations.filter((item) => item.source === "booking").length
    : profile.stays.filter((item) => item.source === "booking").length;
  const hasChildren = reservations?.some((item) => item.childAges.length > 0) ?? false;
  const vacationCard = reservations?.some((item) => item.selectedPaymentMode?.includes("vacation_card")) ?? false;

  if (hasChildren) segments.add("Familie cu copii");
  if (directCount > bookingCount) segments.add("Preferă rezervarea directă");
  if (bookingCount > directCount) segments.add("Booking.com");
  if (profile.averageStayNights >= 6) segments.add("Sejururi lungi");
  if (profile.totalValue >= 10000) segments.add("Valoare ridicată");
  if (vacationCard) segments.add("Card de vacanță");
  if (profile.favoriteApartment?.toLocaleLowerCase("ro-RO").includes("superior")) segments.add("Preferă Superior");
  if (profile.hasFutureReservation) segments.add("Rezervare viitoare");
  if (profile.outstandingBalance > 0) segments.add("Sold restant");
  return [...segments];
}

function buildRecommendations(profile: CustomerProfile, intelligence: Omit<CustomerIntelligence, "recommendations">, reservations?: DomainReservation[]) {
  const items: CustomerRecommendation[] = [];
  const preferredSuperior = profile.favoriteApartment?.toLocaleLowerCase("ro-RO").includes("superior");
  const currentMonth = new Date().getMonth() + 1;
  const favoriteMonth = profile.stays.length
    ? [...profile.stays.reduce((map, stay) => {
        const month = Number(stay.checkIn.slice(5, 7));
        map.set(month, (map.get(month) ?? 0) + 1);
        return map;
      }, new Map<number, number>()).entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    : undefined;

  if (profile.outstandingBalance > 0) {
    items.push({ id: "collect-balance", title: "Contactează clientul pentru sold", reason: `Există un sold restant de ${Math.round(profile.outstandingBalance)} lei.`, action: "Trimite un reminder de plată înainte de următorul sejur.", priority: "high" });
  }
  if (!profile.hasFutureReservation && intelligence.returnProbabilityScore >= 60) {
    const timing = favoriteMonth && Math.abs(favoriteMonth - currentMonth) <= 3 ? "acum" : "înaintea perioadei preferate";
    items.push({ id: "early-booking", title: "Trimite ofertă Early Booking", reason: `Probabilitate ${intelligence.returnProbability === "very_high" ? "foarte mare" : "mare"} de revenire.`, action: `Contactează clientul ${timing} cu o ofertă personalizată.`, priority: "high" });
  }
  if (preferredSuperior || (profile.reservationCount ? profile.totalValue / profile.reservationCount : 0) >= 3000) {
    items.push({ id: "premium-upgrade", title: "Propune o opțiune premium", reason: preferredSuperior ? "Apartamentul preferat este din categoria Superior." : "Valoarea medie a rezervării este ridicată.", action: "Prezintă întâi apartamentele premium, fără discount automat.", priority: "medium" });
  }
  const directCount = reservations?.filter((item) => item.source === "direct").length ?? profile.stays.filter((item) => item.source === "direct").length;
  if (profile.reservationCount >= 2 && directCount / profile.reservationCount >= 0.7) {
    items.push({ id: "direct-loyalty", title: "Păstrează avantajul rezervării directe", reason: "Majoritatea sejururilor au fost rezervate direct.", action: "Oferă beneficii mici, nu reducere mare: prioritate la alegerea apartamentului sau late check-out când este posibil.", priority: "low" });
  }
  if (intelligence.loyaltyLevel === "elite" || intelligence.loyaltyLevel === "vip") {
    items.push({ id: "recognize-vip", title: "Tratează clientul ca prioritar", reason: `Nivel ${intelligence.loyaltyLevel === "elite" ? "Elite" : "VIP"} și valoare estimată ridicată.`, action: "Marchează preferințele și pregătește o experiență personalizată la următorul sejur.", priority: "medium" });
  }
  if (items.length === 0) {
    items.push({ id: "learn-more", title: "Construiește istoricul clientului", reason: "Nu există încă suficiente date pentru o recomandare comercială puternică.", action: "Păstrează preferințele și observațiile după următorul sejur.", priority: "low" });
  }
  return items.slice(0, 4);
}

export function calculateCustomerIntelligence(profile: CustomerProfile, reservations?: DomainReservation[], today = new Date().toISOString().slice(0, 10)): CustomerIntelligence {
  const sources = reservations ?? profile.stays;
  const directCount = sources.filter((item) => item.source === "direct").length;
  const cancelledCount = sources.filter((item) => item.lifecycleStatus === "cancelled").length;
  const directShare = sources.length ? directCount / sources.length : 0;
  const paidRatio = profile.totalValue > 0 ? profile.totalPaid / profile.totalValue : 1;
  const cancelledShare = sources.length ? cancelledCount / sources.length : 0;
  const guestScore = calculateGuestScore(profile, directShare, paidRatio);
  const relationshipScore = calculateRelationshipScore(profile, directShare, paidRatio, cancelledShare);
  const returnProbabilityScore = returnScore(profile, today);
  const base = {
    guestScore,
    relationshipScore,
    loyaltyLevel: loyaltyLevel(guestScore, profile.reservationCount, profile.totalValue),
    currentLifetimeValue: profile.totalValue,
    estimatedLifetimeValue3Years: estimateLifetimeValue(profile, returnProbabilityScore),
    returnProbability: returnLabel(returnProbabilityScore),
    returnProbabilityScore,
    segments: buildSegments(profile, reservations),
  };
  return { ...base, recommendations: buildRecommendations(profile, base, reservations) };
}
