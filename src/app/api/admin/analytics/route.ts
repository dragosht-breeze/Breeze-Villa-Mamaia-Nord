import { NextResponse } from "next/server";
import { apartments } from "@/data/apartments";
import { readBookingSyncStore } from "@/lib/booking-sync/store";
import { listReservationFolders } from "@/lib/reservation-center/store";

export const dynamic = "force-dynamic";

type PeriodKey = "30d" | "90d" | "season" | "all";

type DateRange = {
  start: string;
  end: string;
};

const DAY_MS = 86_400_000;

function bucharestDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${map.year}-${map.month}-${map.day}`;
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function addDays(value: string, days: number) {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function diffDays(start: string, end: string) {
  return Math.max(
    0,
    Math.round(
      (parseDate(end).getTime() - parseDate(start).getTime()) /
        DAY_MS
    )
  );
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return startA < endB && endA > startB;
}

function clampRange(
  start: string,
  end: string,
  range: DateRange
): DateRange | null {
  if (!overlaps(start, end, range.start, range.end)) return null;

  return {
    start: start < range.start ? range.start : start,
    end: end > range.end ? range.end : end,
  };
}

function eachNight(start: string, end: string) {
  return Array.from(
    { length: diffDays(start, end) },
    (_, index) => addDays(start, index)
  );
}

function rangeFor(period: PeriodKey, today: string): DateRange {
  if (period === "90d") {
    return { start: addDays(today, -89), end: addDays(today, 1) };
  }

  if (period === "season") {
    const year = Number(today.slice(0, 4));
    return {
      start: `${year}-06-01`,
      end: `${year}-10-01`,
    };
  }

  if (period === "all") {
    return { start: "2020-01-01", end: addDays(today, 1) };
  }

  return { start: addDays(today, -29), end: addDays(today, 1) };
}

function monthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    month: "short",
  }).format(new Date(`${monthKey}-01T12:00:00Z`));
}

function monthKeys(count: number, today: string) {
  const anchor = parseDate(`${today.slice(0, 7)}-01`);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(anchor);
    date.setUTCMonth(date.getUTCMonth() - (count - 1 - index));
    return date.toISOString().slice(0, 7);
  });
}

function normalizePeriod(value: string | null): PeriodKey {
  if (
    value === "90d" ||
    value === "season" ||
    value === "all"
  ) {
    return value;
  }

  return "30d";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const period = normalizePeriod(url.searchParams.get("period"));
  const today = bucharestDateKey();
  const selectedRange = rangeFor(period, today);
  const folders = await listReservationFolders();
  const bookingSync = await readBookingSyncStore();

  const validFolders = folders.filter(
    (folder) => !["cancelled", "expired"].includes(folder.lifecycleStatus)
  );

  const paidTransactions = folders.flatMap((folder) =>
    folder.financial.transactions
      .filter(
        (transaction) =>
          transaction.kind === "payment" &&
          transaction.status === "paid"
      )
      .map((transaction) => ({
        ...transaction,
        reservationCode: folder.code,
      }))
  );

  const refundedTransactions = folders.flatMap((folder) =>
    folder.financial.transactions.filter(
      (transaction) =>
        transaction.kind === "refund" &&
        transaction.status === "refunded"
    )
  );

  const transactionInRange = paidTransactions.filter((transaction) => {
    const key = transaction.createdAt.slice(0, 10);
    return key >= selectedRange.start && key < selectedRange.end;
  });

  const revenueInRange = transactionInRange.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const todayRevenue = paidTransactions
    .filter((transaction) => transaction.createdAt.slice(0, 10) === today)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const currentMonth = today.slice(0, 7);
  const monthRevenue = paidTransactions
    .filter((transaction) => transaction.createdAt.startsWith(currentMonth))
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const currentYear = today.slice(0, 4);
  const yearRevenue = paidTransactions
    .filter((transaction) => transaction.createdAt.startsWith(currentYear))
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const refundsInRange = refundedTransactions
    .filter((transaction) => {
      const key = transaction.updatedAt.slice(0, 10);
      return key >= selectedRange.start && key < selectedRange.end;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const activeFolders = validFolders.filter(
    (folder) =>
      folder.summary.checkOut >= today &&
      !["completed", "checked_out"].includes(folder.lifecycleStatus)
  );

  const outstanding = activeFolders.reduce(
    (sum, folder) => sum + folder.financial.balance,
    0
  );

  const checkInsToday = activeFolders.filter(
    (folder) => folder.summary.checkIn === today
  ).length;

  const checkOutsToday = validFolders.filter(
    (folder) => folder.summary.checkOut === today
  ).length;

  const selectedReservations = validFolders.filter((folder) =>
    overlaps(
      folder.summary.checkIn,
      folder.summary.checkOut,
      selectedRange.start,
      selectedRange.end
    )
  );

  const occupancyByApartment = new Map<string, Set<string>>();
  const directNightsByApartment = new Map<string, number>();
  const bookingNightsByApartment = new Map<string, number>();

  apartments.forEach((apartment) => {
    occupancyByApartment.set(apartment.slug, new Set());
    directNightsByApartment.set(apartment.slug, 0);
    bookingNightsByApartment.set(apartment.slug, 0);
  });

  selectedReservations.forEach((folder) => {
    const clamped = clampRange(
      folder.summary.checkIn,
      folder.summary.checkOut,
      selectedRange
    );

    if (!clamped) return;

    folder.summary.apartments.forEach((apartment) => {
      const occupied = occupancyByApartment.get(apartment.slug);
      if (!occupied) return;

      eachNight(clamped.start, clamped.end).forEach((night) =>
        occupied.add(night)
      );

      directNightsByApartment.set(
        apartment.slug,
        (directNightsByApartment.get(apartment.slug) ?? 0) +
          diffDays(clamped.start, clamped.end)
      );
    });
  });

  bookingSync.events.forEach((event) => {
    const clamped = clampRange(event.start, event.end, selectedRange);
    if (!clamped) return;

    const occupied = occupancyByApartment.get(event.apartmentSlug);
    if (!occupied) return;

    eachNight(clamped.start, clamped.end).forEach((night) =>
      occupied.add(night)
    );

    bookingNightsByApartment.set(
      event.apartmentSlug,
      (bookingNightsByApartment.get(event.apartmentSlug) ?? 0) +
        diffDays(clamped.start, clamped.end)
    );
  });

  const periodNights = Math.max(
    1,
    diffDays(selectedRange.start, selectedRange.end)
  );
  const totalAvailableNights = periodNights * apartments.length;
  const occupiedNights = Array.from(occupancyByApartment.values()).reduce(
    (sum, nights) => sum + nights.size,
    0
  );
  const occupancyRate = Math.round(
    (occupiedNights / Math.max(1, totalAvailableNights)) * 100
  );

  const apartmentRevenue = new Map<string, number>();
  const apartmentReservations = new Map<string, number>();

  apartments.forEach((apartment) => {
    apartmentRevenue.set(apartment.slug, 0);
    apartmentReservations.set(apartment.slug, 0);
  });

  selectedReservations.forEach((folder) => {
    folder.summary.apartments.forEach((apartment) => {
      apartmentRevenue.set(
        apartment.slug,
        (apartmentRevenue.get(apartment.slug) ?? 0) +
          apartment.totalPrice
      );
      apartmentReservations.set(
        apartment.slug,
        (apartmentReservations.get(apartment.slug) ?? 0) + 1
      );
    });
  });

  const apartmentPerformance = apartments
    .map((apartment) => {
      const nights = occupancyByApartment.get(apartment.slug)?.size ?? 0;
      const revenue = apartmentRevenue.get(apartment.slug) ?? 0;
      const directNights = directNightsByApartment.get(apartment.slug) ?? 0;
      const bookingNights = bookingNightsByApartment.get(apartment.slug) ?? 0;

      return {
        slug: apartment.slug,
        title: apartment.shortTitle,
        revenue,
        reservations: apartmentReservations.get(apartment.slug) ?? 0,
        occupiedNights: nights,
        occupancyRate: Math.round((nights / periodNights) * 100),
        adr:
          directNights > 0 ? Math.round(revenue / directNights) : 0,
        directNights,
        bookingNights,
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.occupiedNights - a.occupiedNights);

  const totalDirectNights = apartmentPerformance.reduce(
    (sum, item) => sum + item.directNights,
    0
  );
  const totalBookingNights = apartmentPerformance.reduce(
    (sum, item) => sum + item.bookingNights,
    0
  );

  const reservationSourceCounts = validFolders.reduce(
    (accumulator, folder) => {
      accumulator[folder.source] += 1;
      return accumulator;
    },
    { direct: 0, booking: 0, manual: 0 }
  );

  const trendMonths = monthKeys(6, today);
  const monthlyTrend = trendMonths.map((month) => {
    const revenue = paidTransactions
      .filter((transaction) => transaction.createdAt.startsWith(month))
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const reservations = folders.filter((folder) =>
      folder.createdAt.startsWith(month)
    ).length;

    return {
      key: month,
      label: monthLabel(month),
      revenue,
      reservations,
    };
  });

  const next30Range = {
    start: today,
    end: addDays(today, 30),
  };

  const forecastFolders = activeFolders.filter((folder) =>
    overlaps(
      folder.summary.checkIn,
      folder.summary.checkOut,
      next30Range.start,
      next30Range.end
    )
  );

  const forecastValue = forecastFolders.reduce(
    (sum, folder) => sum + folder.financial.total,
    0
  );
  const forecastToCollect = forecastFolders.reduce(
    (sum, folder) => sum + folder.financial.balance,
    0
  );

  const next30Occupied = new Map<string, Set<string>>();
  apartments.forEach((apartment) =>
    next30Occupied.set(apartment.slug, new Set())
  );

  forecastFolders.forEach((folder) => {
    const clamped = clampRange(
      folder.summary.checkIn,
      folder.summary.checkOut,
      next30Range
    );
    if (!clamped) return;

    folder.summary.apartments.forEach((apartment) => {
      const set = next30Occupied.get(apartment.slug);
      if (!set) return;
      eachNight(clamped.start, clamped.end).forEach((night) => set.add(night));
    });
  });

  bookingSync.events.forEach((event) => {
    const clamped = clampRange(event.start, event.end, next30Range);
    if (!clamped) return;
    const set = next30Occupied.get(event.apartmentSlug);
    if (!set) return;
    eachNight(clamped.start, clamped.end).forEach((night) => set.add(night));
  });

  const next30OccupiedNights = Array.from(next30Occupied.values()).reduce(
    (sum, set) => sum + set.size,
    0
  );
  const next30Occupancy = Math.round(
    (next30OccupiedNights / (apartments.length * 30)) * 100
  );

  const opportunities: Array<{
    level: "info" | "attention" | "critical";
    title: string;
    detail: string;
    href: string;
  }> = [];

  if (outstanding > 0) {
    opportunities.push({
      level: outstanding >= 5000 ? "critical" : "attention",
      title: `${outstanding.toLocaleString("ro-RO")} lei sold restant`,
      detail: `${activeFolders.filter((folder) => folder.financial.balance > 0).length} rezervări au sume de încasat.`,
      href: "/admin/payments",
    });
  }

  const lowestNext30 = apartments
    .map((apartment) => ({
      title: apartment.shortTitle,
      occupancy: Math.round(
        ((next30Occupied.get(apartment.slug)?.size ?? 0) / 30) * 100
      ),
    }))
    .sort((a, b) => a.occupancy - b.occupancy)[0];

  if (lowestNext30 && lowestNext30.occupancy < 45) {
    opportunities.push({
      level: "info",
      title: `${lowestNext30.title}: ocupare ${lowestNext30.occupancy}%`,
      detail: "În următoarele 30 de zile există spațiu pentru o ofertă directă sau o campanie.",
      href: "/admin/rates",
    });
  }

  if (bookingSync.conflicts.length > 0) {
    opportunities.push({
      level: "critical",
      title: `${bookingSync.conflicts.length} conflicte Booking`,
      detail: "Verifică suprapunerile înainte de confirmarea altor rezervări.",
      href: "/admin/booking-sync",
    });
  }

  if (!bookingSync.updatedAt) {
    opportunities.push({
      level: "attention",
      title: "Booking Sync nu a fost rulat",
      detail: "Rulează sincronizarea pentru a actualiza ocuparea externă.",
      href: "/admin/booking-sync",
    });
  } else {
    const ageMinutes = Math.round(
      (Date.now() - new Date(bookingSync.updatedAt).getTime()) / 60_000
    );

    if (ageMinutes > 60) {
      opportunities.push({
        level: "attention",
        title: `Booking Sync vechi de ${ageMinutes} minute`,
        detail: "O sincronizare nouă reduce riscul de overbooking.",
        href: "/admin/booking-sync",
      });
    }
  }

  if (opportunities.length === 0) {
    opportunities.push({
      level: "info",
      title: "Operațiunile sunt sub control",
      detail: "Nu există conflicte sau alerte financiare importante.",
      href: "/admin/operations",
    });
  }

  const averageStay =
    selectedReservations.length > 0
      ? Math.round(
          (selectedReservations.reduce(
            (sum, folder) => sum + folder.summary.nights,
            0
          ) /
            selectedReservations.length) *
            10
        ) / 10
      : 0;

  const directRevenueValue = selectedReservations
    .filter((folder) => folder.source === "direct")
    .reduce((sum, folder) => sum + folder.financial.total, 0);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    period,
    range: selectedRange,
    stats: {
      todayRevenue,
      monthRevenue,
      yearRevenue,
      periodRevenue: revenueInRange,
      refundsInRange,
      outstanding,
      occupancyRate,
      occupiedNights,
      availableNights: totalAvailableNights,
      checkInsToday,
      checkOutsToday,
      reservationsInPeriod: selectedReservations.length,
      averageStay,
      directRevenueValue,
    },
    forecast: {
      days: 30,
      value: forecastValue,
      toCollect: forecastToCollect,
      occupancyRate: next30Occupancy,
      reservations: forecastFolders.length,
    },
    apartmentPerformance,
    monthlyTrend,
    sources: {
      reservationCounts: reservationSourceCounts,
      occupiedNights: {
        direct: totalDirectNights,
        booking: totalBookingNights,
      },
    },
    opportunities: opportunities.slice(0, 4),
    bookingSync: {
      updatedAt: bookingSync.updatedAt,
      conflicts: bookingSync.conflicts.length,
      externalEvents: bookingSync.events.length,
    },
  });
}
