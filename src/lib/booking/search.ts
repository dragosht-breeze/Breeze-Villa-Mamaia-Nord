import { getAvailableApartmentsForStay } from "./availability";
import { generateBookingCombinations } from "./combination";
import { getNights } from "./dateUtils";
import { calculateOccupancy, validateGuestCount } from "./occupancy";
import { rankBookingCombinations } from "./recommendation";
import type { BookingSearchInput, BookingSearchResult } from "./types";

export async function searchBookingOptions(input: BookingSearchInput): Promise<BookingSearchResult> {
  const nights = getNights(input.checkIn, input.checkOut);

  if (!input.checkIn || !input.checkOut || nights <= 0) {
    return {
      ok: false,
      input,
      nights: 0,
      occupancy: calculateOccupancy(input.adults, input.childAges),
      combinations: [],
      message: "Alegeți o perioadă validă pentru sejur.",
    };
  }

  const guestError = validateGuestCount(input.adults, input.childAges);
  const occupancy = calculateOccupancy(input.adults, input.childAges);

  if (guestError) {
    return {
      ok: false,
      input,
      nights,
      occupancy,
      combinations: [],
      message: guestError,
    };
  }

  const availableApartments = await getAvailableApartmentsForStay(input.checkIn, input.checkOut);
  const maxAvailableCapacity = availableApartments.reduce((sum, apartment) => sum + apartment.guests, 0);
  const combinations = rankBookingCombinations(
    generateBookingCombinations({ availableApartments, occupancy, nights })
  );

  if (combinations.length === 0) {
    return {
      ok: false,
      input,
      nights,
      occupancy,
      combinations: [],
      maxAvailableCapacity,
      message:
        maxAvailableCapacity > 0
          ? `Pentru perioada aleasă putem acoperi maximum ${maxAvailableCapacity} locuri standard. Încercați o perioadă apropiată sau contactați-ne pe WhatsApp.`
          : "Pentru perioada aleasă nu avem disponibilitate. Încercați o altă perioadă sau contactați-ne pe WhatsApp.",
    };
  }

  return {
    ok: true,
    input,
    nights,
    occupancy,
    combinations,
  };
}
