import { searchBookingOptions } from "@/lib/booking/search";

type AvailabilityToolInput = {
  checkIn: string;
  checkOut: string;
  adults: number;
  childAges: number[];
};

type AvailabilityRecommendation = {
  id: string;
  apartmentCount: number;
  apartments: Array<{
    slug: string;
    title: string;
    shortTitle: string;
    guests: number;
    surface: number;
    floor: string;
    view: string;
  }>;
  totalCapacity: number;
  totalPrice: number;
  averageNightPrice: number;
  reason: string;
  isRecommended: boolean;
  bookingUrl: string;
};

export type AvailabilitySummary = {
  ok: boolean;
  checkIn: string;
  checkOut: string;
  adults: number;
  childAges: number[];
  nights: number;
  bookingUrl?: string;
  message?: string;
  recommendations: AvailabilityRecommendation[];
};

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeChildAges(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map(Number)
    .filter((age) => Number.isFinite(age) && age >= 0 && age <= 17)
    .map((age) => Math.floor(age))
    .slice(0, 12);
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://breezevilla.ro"
  );
}

function buildBookingUrl(input: {
  checkIn: string;
  checkOut: string;
  adults: number;
  childAges: number[];
  recommendationId?: string;
}) {
  const params = new URLSearchParams({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: String(input.adults),
    children: String(input.childAges.length),
    ages: input.childAges.join(","),
  });

  if (input.recommendationId) {
    params.set("recommendation", input.recommendationId);
  }

  return `${getSiteUrl()}/rezervare?${params.toString()}`;
}

export async function checkLiveAvailability(
  input: AvailabilityToolInput
): Promise<AvailabilitySummary> {
  const checkIn = String(input.checkIn ?? "").trim();
  const checkOut = String(input.checkOut ?? "").trim();
  const adults = Math.max(
    1,
    Math.min(20, Math.floor(Number(input.adults) || 1))
  );
  const childAges = normalizeChildAges(input.childAges);

  if (!isDateKey(checkIn) || !isDateKey(checkOut)) {
    return {
      ok: false,
      checkIn,
      checkOut,
      adults,
      childAges,
      nights: 0,
      message:
        "Datele trebuie trimise în format YYYY-MM-DD. Cere utilizatorului perioada exactă.",
      recommendations: [],
    };
  }

  const generalBookingUrl = buildBookingUrl({
    checkIn,
    checkOut,
    adults,
    childAges,
  });

  const result = await searchBookingOptions({
    checkIn,
    checkOut,
    adults,
    childAges,
  });

  if (!result.ok) {
    return {
      ok: false,
      checkIn,
      checkOut,
      adults,
      childAges,
      nights: result.nights,
      bookingUrl: generalBookingUrl,
      message: result.message,
      recommendations: [],
    };
  }

  const recommendations = result.combinations
    .slice(0, 3)
    .map((combination) => ({
      id: combination.id,
      apartmentCount: combination.apartments.length,
      apartments: combination.apartments.map((apartment) => ({
        slug: apartment.slug,
        title: apartment.title,
        shortTitle: apartment.shortTitle,
        guests: apartment.guests,
        surface: apartment.surface,
        floor: apartment.floor,
        view: apartment.view,
      })),
      totalCapacity: combination.totalCapacity,
      totalPrice: combination.totalPrice,
      averageNightPrice:
        combination.nights > 0
          ? Math.round(combination.totalPrice / combination.nights)
          : combination.totalPrice,
      reason: combination.reason,
      isRecommended: combination.isRecommended,
      bookingUrl: buildBookingUrl({
        checkIn,
        checkOut,
        adults,
        childAges,
        recommendationId: combination.id,
      }),
    }));

  return {
    ok: true,
    checkIn,
    checkOut,
    adults,
    childAges,
    nights: result.nights,
    bookingUrl: recommendations[0]?.bookingUrl ?? generalBookingUrl,
    recommendations,
  };
}