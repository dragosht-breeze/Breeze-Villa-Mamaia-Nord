import { NextResponse } from "next/server";
import { apartments } from "@/data/apartments";
import { getAvailabilityDays, type AvailabilityDay, type DayStatus } from "@/data/availability";
import { ensureBookingSyncFresh, getStoredBookingDays } from "@/lib/booking-sync/service";
import { getConfirmedDirectReservationDays } from "@/lib/reservationStore";

export const runtime = "nodejs";

const MAX_LOCATION_PEOPLE = 32;

type Occupancy = {
  adults: number;
  childAges: number[];
  children: number;
  childrenUnder10: number;
  children10Plus: number;
  actualPeople: number;
  countedAdults: number;
  freeChildrenSharingWithAdults: number;
  childPlaceEquivalent: number;
  requiredPlaces: number;
};

type AvailableApartment = {
  slug: string;
  title: string;
  shortTitle: string;
  guests: number;
  bedrooms: number;
  roomsLabel: string;
  surface: number;
  floor: string;
  coverImage: string;
  nights: number;
  total: number;
  averageNight: number;
};

type GroupOption = {
  id: string;
  totalGuests: number;
  requestedGuests: number;
  requiredPlaces: number;
  extraPlaces: number;
  apartmentCount: number;
  total: number;
  averageNight: number;
  nights: number;
  apartments: AvailableApartment[];
};

function fromDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function getNightCount(checkIn: string, checkOut: string) {
  const diff = fromDateKey(checkOut).getTime() - fromDateKey(checkIn).getTime();
  return Math.max(Math.round(diff / 86400000), 0);
}

function getStayDates(checkIn: string, checkOut: string) {
  const dates: string[] = [];
  let cursor = fromDateKey(checkIn);
  const end = fromDateKey(checkOut);

  while (cursor < end) {
    dates.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function isBlockedStatus(status: DayStatus) {
  return status === "booked" || status === "checkin" || status === "checkout";
}

function priority(status: DayStatus) {
  if (status === "booked") return 4;
  if (status === "checkin") return 3;
  if (status === "checkout") return 2;
  return 1;
}

function mergeDayStatus(current: AvailabilityDay, incoming: AvailabilityDay): AvailabilityDay {
  if (priority(incoming.status) >= priority(current.status)) {
    return {
      ...current,
      status: incoming.status,
      source: incoming.source,
    };
  }

  return current;
}

function parseChildAges(value: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((age) => Number.isFinite(age) && age >= 0 && age <= 17);
}

function calculateOccupancy(adults: number, childAges: number[]): Occupancy {
  const safeAdults = Math.max(0, Math.floor(adults));
  const safeChildAges = childAges.map((age) => Math.max(0, Math.min(17, Math.floor(age))));
  const children10Plus = safeChildAges.filter((age) => age >= 10).length;
  const childrenUnder10 = safeChildAges.filter((age) => age < 10).length;
  const countedAdults = safeAdults + children10Plus;

  // Regulă Breeze Villa:
  // - copiii de 10 ani sau peste intră la calcul ca adulți;
  // - copiii sub 10 ani pot sta maximum 1 cu fiecare 2 adulți;
  // - copiii sub 10 ani rămași se calculează 2 copii = 1 loc adult.
  const freeChildrenSharingWithAdults = Math.min(childrenUnder10, Math.floor(countedAdults / 2));
  const remainingSmallChildren = Math.max(childrenUnder10 - freeChildrenSharingWithAdults, 0);
  const childPlaceEquivalent = Math.ceil(remainingSmallChildren / 2);
  const requiredPlaces = countedAdults + childPlaceEquivalent;
  const actualPeople = safeAdults + safeChildAges.length;

  return {
    adults: safeAdults,
    childAges: safeChildAges,
    children: safeChildAges.length,
    childrenUnder10,
    children10Plus,
    actualPeople,
    countedAdults,
    freeChildrenSharingWithAdults,
    childPlaceEquivalent,
    requiredPlaces,
  };
}

async function getMergedAvailabilityDays(slug: string) {
  const manualDays = getAvailabilityDays(slug);
  const merged = new Map<string, AvailabilityDay>();

  manualDays.forEach((day) => {
    merged.set(day.date, day);
  });

  await ensureBookingSyncFresh();
  const bookedDays = await getStoredBookingDays(slug);

  bookedDays.forEach((bookedDay) => {
    const existing = merged.get(bookedDay.date);
    if (!existing) return;

    merged.set(
      bookedDay.date,
      mergeDayStatus(existing, {
        ...existing,
        status: bookedDay.status,
        source: bookedDay.source,
      })
    );
  });

  const directReservationDays = await getConfirmedDirectReservationDays(slug);

  directReservationDays.forEach((directDay) => {
    const existing = merged.get(directDay.date);
    if (!existing) return;

    merged.set(
      directDay.date,
      mergeDayStatus(existing, {
        ...existing,
        status: directDay.status,
        source: directDay.source,
      })
    );
  });

  return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function buildCombinations(items: AvailableApartment[], occupancy: Occupancy) {
  const results: GroupOption[] = [];

  function walk(startIndex: number, selected: AvailableApartment[]) {
    const totalGuests = selected.reduce((sum, item) => sum + item.guests, 0);

    if (selected.length > 0 && totalGuests >= occupancy.requiredPlaces) {
      const total = selected.reduce((sum, item) => sum + item.total, 0);
      const nights = selected[0]?.nights ?? 0;

      results.push({
        id: selected.map((item) => item.slug).join("+"),
        totalGuests,
        requestedGuests: occupancy.actualPeople,
        requiredPlaces: occupancy.requiredPlaces,
        extraPlaces: totalGuests - occupancy.requiredPlaces,
        apartmentCount: selected.length,
        total,
        averageNight: nights > 0 ? Math.round(total / nights) : total,
        nights,
        apartments: selected,
      });

      return;
    }

    for (let index = startIndex; index < items.length; index += 1) {
      walk(index + 1, [...selected, items[index]]);
    }
  }

  walk(0, []);

  return results
    .sort((a, b) => {
      if (a.apartmentCount !== b.apartmentCount) return a.apartmentCount - b.apartmentCount;
      if (a.extraPlaces !== b.extraPlaces) return a.extraPlaces - b.extraPlaces;
      return a.total - b.total;
    })
    .slice(0, 8);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = Number(searchParams.get("adults") ?? "0");
  const childAges = parseChildAges(searchParams.get("childAges"));
  const legacyGuests = Number(searchParams.get("guests") ?? "0");

  const occupancy = adults > 0
    ? calculateOccupancy(adults, childAges)
    : calculateOccupancy(legacyGuests, []);

  if (!checkIn || !checkOut || occupancy.actualPeople < 1) {
    return NextResponse.json(
      {
        ok: false,
        message: "Alege check-in, check-out și numărul de persoane.",
      },
      { status: 400 }
    );
  }

  if (occupancy.actualPeople > MAX_LOCATION_PEOPLE) {
    return NextResponse.json(
      {
        ok: false,
        message: `Capacitatea maximă a locației este de ${MAX_LOCATION_PEOPLE} persoane.`,
      },
      { status: 400 }
    );
  }

  const nights = getNightCount(checkIn, checkOut);

  if (nights < 1) {
    return NextResponse.json(
      {
        ok: false,
        message: "Data de check-out trebuie să fie după check-in.",
      },
      { status: 400 }
    );
  }

  const stayDates = getStayDates(checkIn, checkOut);
  const availableApartments: AvailableApartment[] = [];

  for (const apartment of apartments) {
    const days = await getMergedAvailabilityDays(apartment.slug);
    const byDate = new Map(days.map((day) => [day.date, day]));
    const selectedDays = stayDates.map((date) => byDate.get(date));

    if (selectedDays.some((day) => !day || isBlockedStatus(day.status))) {
      continue;
    }

    const validDays = selectedDays as AvailabilityDay[];
    const minNights = Math.max(...validDays.map((day) => day.minNights));

    if (nights < minNights) {
      continue;
    }

    const total = validDays.reduce((sum, day) => sum + day.price, 0);

    availableApartments.push({
      slug: apartment.slug,
      title: apartment.title,
      shortTitle: apartment.shortTitle,
      guests: apartment.guests,
      bedrooms: apartment.bedrooms,
      roomsLabel: apartment.roomsLabel,
      surface: apartment.surface,
      floor: apartment.floor,
      coverImage: apartment.coverImage,
      nights,
      total,
      averageNight: Math.round(total / nights),
    });
  }

  const options = buildCombinations(
    availableApartments.sort((a, b) => b.guests - a.guests || a.total - b.total),
    occupancy
  );

  return NextResponse.json({
    ok: true,
    checkIn,
    checkOut,
    nights,
    maxPeople: MAX_LOCATION_PEOPLE,
    occupancy,
    guests: occupancy.actualPeople,
    requiredPlaces: occupancy.requiredPlaces,
    availableApartments,
    options,
  });
}
