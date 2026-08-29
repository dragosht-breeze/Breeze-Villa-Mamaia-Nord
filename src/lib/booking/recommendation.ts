import type { BookingCombination } from "./types";

function describeCombination(combination: BookingCombination, index: number) {
  if (index === 0) {
    return "Cea mai avantajoasă variantă ca preț pentru grupul dumneavoastră.";
  }

  return "Variantă disponibilă pentru perioada și grupul selectat.";
}

export function rankBookingCombinations(combinations: BookingCombination[]) {
  const ranked = [...combinations].sort((a, b) => {
    if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
    if (a.apartments.length !== b.apartments.length) return a.apartments.length - b.apartments.length;
    return a.wastedPlaces - b.wastedPlaces;
  });

  return ranked.slice(0, 8).map((combination, index) => ({
    ...combination,
    isRecommended: index === 0,
    reason: describeCombination(combination, index),
  }));
}
