import { apartments } from "@/data/apartments";
import { getAvailabilityDays, type AvailabilityDay } from "@/data/availability";
import { getConfirmedDirectReservationDays } from "@/lib/reservationStore";
import { ensureBookingSyncFresh, getStoredBookingDays } from "@/lib/booking-sync/service";
import { getNights, getStayNightKeys } from "./dateUtils";
import type { AvailableApartment } from "./types";

function mergeDays(
  staticDays: AvailabilityDay[],
  directDays: Awaited<ReturnType<typeof getConfirmedDirectReservationDays>>,
  bookingDays: Awaited<ReturnType<typeof getStoredBookingDays>>
) {
  const directByDate = new Map(directDays.map((day) => [day.date, day]));
  const bookingByDate = new Map(bookingDays.map((day) => [day.date, day]));

  return staticDays.map((day) => {
    const direct = directByDate.get(day.date);
    const booking = bookingByDate.get(day.date);
    const occupied = direct ?? booking;

    if (!occupied) return day;

    return {
      ...day,
      status: occupied.status,
      source: direct ? ("direct" as const) : ("booking" as const),
    };
  });
}

function isNightAvailable(day?: AvailabilityDay) {
  if (!day) return false;
  return day.status === "available" || day.status === "checkout";
}

export async function getAvailableApartmentsForStay(checkIn: string, checkOut: string): Promise<AvailableApartment[]> {
  const nightKeys = getStayNightKeys(checkIn, checkOut);
  const nights = getNights(checkIn, checkOut);

  if (nights <= 0) return [];

  await ensureBookingSyncFresh();

  const results = await Promise.all(
    apartments.map(async (apartment) => {
      const staticDays = getAvailabilityDays(apartment.slug);
      const [directDays, bookingDays] = await Promise.all([
        getConfirmedDirectReservationDays(apartment.slug),
        getStoredBookingDays(apartment.slug),
      ]);
      const mergedDays = mergeDays(staticDays, directDays, bookingDays);
      const daysByDate = new Map(mergedDays.map((day) => [day.date, day]));
      const selectedDays = nightKeys.map((key) => daysByDate.get(key));

      if (!selectedDays.every(isNightAvailable)) return null;

      const maxMinNights = Math.max(...selectedDays.map((day) => day?.minNights ?? 1));
      if (nights < maxMinNights) return null;

      const totalPrice = selectedDays.reduce((sum, day) => sum + (day?.price ?? 0), 0);

      return {
        ...apartment,
        totalPrice,
        averageNightPrice: Math.round(totalPrice / nights),
        maxMinNights,
      } satisfies AvailableApartment;
    })
  );

  return results.filter(Boolean) as AvailableApartment[];
}
