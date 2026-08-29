import type { SalesSession } from "./types";

export function calculateLeadScore(session: SalesSession) {
  let score = 5;

  if (session.checkIn && session.checkOut) score += 25;
  if (session.adults) score += 12;
  if (session.childAges.length > 0) score += 8;
  if (session.budget) score += 10;
  if (session.hasLiveAvailability) score += 25;

  if (session.intent === "price") score += 8;
  if (session.intent === "availability") score += 12;
  if (session.intent === "recommendation") score += 8;
  if (session.intent === "booking") score += 25;
  if (session.intent === "objection") score += 5;

  return Math.min(100, score);
}
