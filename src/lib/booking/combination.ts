import type { AvailableApartment, BookingCombination, OccupancyResult } from "./types";

function buildCombinationId(apartments: AvailableApartment[]) {
  return apartments.map((apartment) => apartment.slug).sort().join("__");
}

export function generateBookingCombinations({
  availableApartments,
  occupancy,
  nights,
}: {
  availableApartments: AvailableApartment[];
  occupancy: OccupancyResult;
  nights: number;
}): BookingCombination[] {
  const combinations: BookingCombination[] = [];
  const totalSubsets = 1 << availableApartments.length;

  for (let mask = 1; mask < totalSubsets; mask += 1) {
    const selected = availableApartments.filter((_, index) => (mask & (1 << index)) !== 0);
    const totalCapacity = selected.reduce((sum, apartment) => sum + apartment.guests, 0);

    if (totalCapacity < occupancy.effectivePlaces) continue;

    const totalPrice = selected.reduce((sum, apartment) => sum + apartment.totalPrice, 0);
    const wastedPlaces = totalCapacity - occupancy.effectivePlaces;
    const pricePerPerson = Math.round(totalPrice / Math.max(1, occupancy.requestedGuests));
    const pricePerPersonPerNight = Math.round(totalPrice / Math.max(1, occupancy.requestedGuests * nights));

    combinations.push({
      id: buildCombinationId(selected),
      apartments: selected,
      totalCapacity,
      totalPrice,
      nights,
      wastedPlaces,
      occupancy,
      isRecommended: false,
      reason: "",
      pricePerPerson,
      pricePerPersonPerNight,
    });
  }

  return combinations;
}
