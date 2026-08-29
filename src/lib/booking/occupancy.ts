import { BOOKING_RULES, type OccupancyResult } from "./types";

export function calculateOccupancy(adults: number, childAges: number[]): OccupancyResult {
  const childrenInput = childAges.length;
  const olderChildren = childAges.filter((age) => age >= BOOKING_RULES.childBecomesAdultAt).length;
  const smallChildren = childAges.filter((age) => age < BOOKING_RULES.childBecomesAdultAt).length;
  const adultsForCapacity = adults + olderChildren;
  const smallChildrenWithAdults = Math.min(
    smallChildren,
    Math.floor(adultsForCapacity / BOOKING_RULES.maxSmallChildrenWithAdultsRatio)
  );
  const smallChildrenNeedingPlaces = Math.max(0, smallChildren - smallChildrenWithAdults);
  const extraPlacesForSmallChildren = Math.ceil(
    smallChildrenNeedingPlaces / BOOKING_RULES.smallChildrenPerAdultPlace
  );

  return {
    requestedGuests: adults + childrenInput,
    adultsInput: adults,
    childrenInput,
    adultsForCapacity,
    smallChildren,
    smallChildrenWithAdults,
    smallChildrenNeedingPlaces,
    effectivePlaces: adultsForCapacity + extraPlacesForSmallChildren,
  };
}

export function validateGuestCount(adults: number, childAges: number[]) {
  const totalGuests = adults + childAges.length;

  if (adults < 1) return "Trebuie selectat cel puțin un adult.";
  if (totalGuests > BOOKING_RULES.maxLocationGuests) {
    return `Capacitatea maximă a locației este de ${BOOKING_RULES.maxLocationGuests} persoane.`;
  }
  if (childAges.some((age) => age < 0 || age > 17)) {
    return "Vârsta copiilor trebuie să fie între 0 și 17 ani.";
  }

  return null;
}
