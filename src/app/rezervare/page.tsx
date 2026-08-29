import type { Metadata } from "next";

import VacationPlanner from "@/components/booking/VacationPlanner";
import { searchBookingOptions } from "@/lib/booking/search";
import type {
  BookingSearchInput,
  BookingSearchResult,
} from "@/lib/booking/types";

export const metadata: Metadata = {
  title: "Rezervare directă",
  description:
    "Planifică vacanța la Breeze Villa Mamaia Nord. Alege perioada, adulții și copiii, iar sistemul caută automat cea mai avantajoasă combinație de apartamente disponibile.",
  alternates: {
    canonical: "/rezervare",
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "/rezervare",
    title: "Rezervare directă | Breeze Villa Mamaia Nord",
    description:
      "Verifică disponibilitatea și găsește rapid combinația potrivită de apartamente pentru familia ta.",
    images: [
      {
        url: "/branding/breeze-villa-logo.png",
        alt: "Rezervare directă la Breeze Villa Mamaia Nord",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rezervare directă | Breeze Villa Mamaia Nord",
    description:
      "Verifică disponibilitatea și găsește rapid combinația potrivită de apartamente pentru familia ta.",
    images: ["/branding/breeze-villa-logo.png"],
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

type RezervarePageProps = {
  searchParams: Promise<SearchParams>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function validDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parsePositiveInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseChildAges(value: string) {
  if (!value) return [];

  return value
    .split(",")
    .map((age) => Number.parseInt(age.trim(), 10))
    .filter((age) => Number.isFinite(age) && age >= 0 && age <= 17)
    .slice(0, 12);
}

function prioritizeRecommendation(
  result: BookingSearchResult,
  recommendationId: string
): BookingSearchResult {
  if (!result.ok || !recommendationId) return result;

  const recommended = result.combinations.find(
    (combination) => combination.id === recommendationId
  );

  if (!recommended) return result;

  return {
    ...result,
    combinations: [
      recommended,
      ...result.combinations.filter(
        (combination) => combination.id !== recommendationId
      ),
    ],
  };
}

function getInitialSearchInput(params: SearchParams): BookingSearchInput | null {
  const checkIn = firstValue(params.checkIn);
  const checkOut = firstValue(params.checkOut);
  const adults = Math.min(20, parsePositiveInteger(firstValue(params.adults), 2));
  const childAges = parseChildAges(firstValue(params.ages));

  if (!validDateKey(checkIn) || !validDateKey(checkOut)) {
    return null;
  }

  return {
    checkIn,
    checkOut,
    adults,
    childAges,
  };
}

export default async function RezervarePage({
  searchParams,
}: RezervarePageProps) {
  const params = await searchParams;
  const initialInput = getInitialSearchInput(params);
  const recommendationId = firstValue(params.recommendation);
  const searchResult = initialInput
    ? await searchBookingOptions(initialInput)
    : null;
  const initialResult = searchResult
    ? prioritizeRecommendation(searchResult, recommendationId)
    : null;
  const plannerKey = initialInput
    ? [
        initialInput.checkIn,
        initialInput.checkOut,
        initialInput.adults,
        initialInput.childAges.join(","),
        recommendationId,
      ].join("|")
    : "empty";

  return (
    <main className="min-h-screen bg-[#FAFAF7] pt-10">
      <VacationPlanner
        key={plannerKey}
        initialInput={initialInput ?? undefined}
        initialResult={initialResult}
      />
    </main>
  );
}
