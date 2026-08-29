export type DayStatus = "available" | "booked" | "checkin" | "checkout";

export type AvailabilityDay = {
  date: string;
  status: DayStatus;
  price: number;
  minNights: number;
  source?: "manual" | "booking" | "airbnb" | "direct" | "other";
  manualBlocked?: boolean;
  offerLabel?: string;
};

export type ApartmentAvailability = {
  apartmentSlug: string;
  days: AvailabilityDay[];
};

function day(date: string, status: DayStatus, price: number, minNights = 3): AvailabilityDay {
  return {
    date,
    status,
    price,
    minNights,
    source: "manual",
  };
}

function getSeasonPrice(month: number, basePrice: number) {
  if (month === 7) return basePrice;
  if (month === 8) return Math.round(basePrice * 1.18);
  if (month === 6 || month === 9) return Math.round(basePrice * 0.82);
  return Math.round(basePrice * 0.62);
}

function getSeasonMinNights(month: number, baseMinNights: number) {
  if (month === 7 || month === 8) return Math.max(baseMinNights, 3);
  if (month === 6 || month === 9) return Math.max(2, Math.min(baseMinNights, 3));
  return 2;
}

function generateMonthDays({
  year,
  month,
  basePrice,
  baseMinNights,
  booked = [],
  checkin = [],
  checkout = [],
}: {
  year: number;
  month: number;
  basePrice: number;
  baseMinNights: number;
  booked?: string[];
  checkin?: string[];
  checkout?: string[];
}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const price = getSeasonPrice(month, basePrice);
  const minNights = getSeasonMinNights(month, baseMinNights);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;

    if (checkin.includes(date)) return day(date, "checkin", price, minNights);
    if (checkout.includes(date)) return day(date, "checkout", price, minNights);
    if (booked.includes(date)) return day(date, "booked", price, minNights);

    return day(date, "available", price, minNights);
  });
}

function generateCalendar({
  basePrice,
  baseMinNights,
  booked = [],
  checkin = [],
  checkout = [],
}: {
  basePrice: number;
  baseMinNights: number;
  booked?: string[];
  checkin?: string[];
  checkout?: string[];
}) {
  const months = [
    { year: 2026, month: 7 },
    { year: 2026, month: 8 },
    { year: 2026, month: 9 },
    { year: 2026, month: 10 },
    { year: 2026, month: 11 },
    { year: 2026, month: 12 },
    { year: 2027, month: 1 },
    { year: 2027, month: 2 },
    { year: 2027, month: 3 },
    { year: 2027, month: 4 },
    { year: 2027, month: 5 },
    { year: 2027, month: 6 },
    { year: 2027, month: 7 },
    { year: 2027, month: 8 },
    { year: 2027, month: 9 },
  ];

  return months.flatMap(({ year, month }) =>
    generateMonthDays({
      year,
      month,
      basePrice,
      baseMinNights,
      booked,
      checkin,
      checkout,
    })
  );
}

const premiumBooked = ["2026-07-12", "2026-07-13", "2026-07-14", "2026-07-22", "2026-07-23"];
const superiorBooked = ["2026-07-18", "2026-07-19", "2026-07-20"];
const familyBooked = ["2026-07-10", "2026-07-11", "2026-07-26", "2026-07-27"];

export const availability: ApartmentAvailability[] = [
  {
    apartmentSlug: "apartament-3-premium",
    days: generateCalendar({
      basePrice: 650,
      baseMinNights: 3,
      booked: premiumBooked,
      checkin: ["2026-07-12", "2026-07-22"],
      checkout: ["2026-07-15", "2026-07-24"],
    }),
  },
  {
    apartmentSlug: "apartament-superior",
    days: generateCalendar({
      basePrice: 620,
      baseMinNights: 3,
      booked: superiorBooked,
      checkin: ["2026-07-18"],
      checkout: ["2026-07-21"],
    }),
  },
  {
    apartmentSlug: "apartament-3-etaj-2",
    days: generateCalendar({
      basePrice: 590,
      baseMinNights: 3,
      booked: familyBooked,
      checkin: ["2026-07-10", "2026-07-26"],
      checkout: ["2026-07-12", "2026-07-28"],
    }),
  },
  {
    apartmentSlug: "apartament-3-etaj-1",
    days: generateCalendar({ basePrice: 590, baseMinNights: 3 }),
  },
  {
    apartmentSlug: "apartament-2-etaj-3",
    days: generateCalendar({ basePrice: 480, baseMinNights: 3 }),
  },
  {
    apartmentSlug: "apartament-2",
    days: generateCalendar({ basePrice: 460, baseMinNights: 3 }),
  },
  {
    apartmentSlug: "studio",
    days: generateCalendar({ basePrice: 320, baseMinNights: 2 }),
  },
];

export function getAvailabilityByApartment(slug: string) {
  return availability.find((item) => item.apartmentSlug === slug);
}

export function getAvailabilityDays(slug: string) {
  return getAvailabilityByApartment(slug)?.days ?? [];
}

export function getBookedRangesForIcal(slug: string) {
  const days = getAvailabilityDays(slug).filter((item) => item.status !== "available");

  if (days.length === 0) return [];

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const ranges: { start: string; end: string; summary: string }[] = [];

  function addOneDay(dateKey: string) {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  let rangeStart = sorted[0].date;
  let previous = sorted[0].date;

  sorted.slice(1).forEach((item) => {
    if (item.date === addOneDay(previous)) {
      previous = item.date;
      return;
    }

    ranges.push({
      start: rangeStart,
      end: addOneDay(previous),
      summary: "Breeze Villa - ocupat",
    });

    rangeStart = item.date;
    previous = item.date;
  });

  ranges.push({
    start: rangeStart,
    end: addOneDay(previous),
    summary: "Breeze Villa - ocupat",
  });

  return ranges;
}
