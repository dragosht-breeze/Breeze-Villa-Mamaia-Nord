"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

import BookingCalendar from "@/components/booking/BookingCalendar";
import GuestSelector from "@/components/booking/GuestSelector";
import BookingSummary from "@/components/booking/BookingSummary";

import type {
  BookingCombination,
  BookingSearchInput,
  BookingSearchResult,
} from "@/lib/booking/types";

const CombinationCard = dynamic(
  () => import("@/components/booking/CombinationCard"),
  {
    loading: () => (
      <div className="min-h-80 animate-pulse rounded-[2rem] bg-white shadow-[0_22px_70px_rgba(7,27,45,0.10)] ring-1 ring-black/5" />
    ),
  }
);

const ReservationWizard = dynamic(
  () => import("@/components/booking/ReservationWizard"),
  {
    loading: () => (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071B2D]/70 p-6 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 font-black text-[#071B2D] shadow-2xl">
          <Loader2 className="animate-spin text-[#158F91]" size={22} />
          Se pregătește rezervarea...
        </div>
      </div>
    ),
  }
);

const searchSteps = [
  "Verificăm disponibilitatea apartamentelor",
  "Calculăm necesarul real de locuri",
  "Căutăm cea mai avantajoasă combinație",
  "Pregătim recomandarea Breeze Villa",
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

type VacationPlannerProps = {
  initialInput?: BookingSearchInput;
  initialResult?: BookingSearchResult | null;
};

export default function VacationPlanner({
  initialInput,
  initialResult = null,
}: VacationPlannerProps) {
  const [checkIn, setCheckIn] = useState(initialInput?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initialInput?.checkOut ?? "");
  const [adults, setAdults] = useState(initialInput?.adults ?? 2);
  const [childAges, setChildAges] = useState<number[]>(
    initialInput?.childAges ?? []
  );
  const [result, setResult] =
    useState<BookingSearchResult | null>(initialResult);
  const [selectedCombination, setSelectedCombination] =
    useState<BookingCombination | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const minDate = useMemo(() => todayKey(), []);

  useEffect(() => {
    if (!result || isSearching) {
      return;
    }

    const timeout = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [result, isSearching]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setResult(null);
    setSelectedCombination(null);

    if (!checkIn || !checkOut) {
      setMessage(
        "Selectează data de check-in și data de check-out din calendar."
      );
      return;
    }

    if (
      new Date(`${checkOut}T12:00:00`) <=
      new Date(`${checkIn}T12:00:00`)
    ) {
      setMessage(
        "Data de check-out trebuie să fie după data de check-in."
      );
      return;
    }

    setIsSearching(true);
    setSearchStep(0);

    let progressInterval: number | undefined;

    try {
      progressInterval = window.setInterval(() => {
        setSearchStep((currentStep) =>
          Math.min(currentStep + 1, searchSteps.length - 1)
        );
      }, 350);

      const response = await fetch("/api/booking/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkIn,
          checkOut,
          adults,
          childAges,
        }),
      });

      const data = (await response.json()) as BookingSearchResult;

      if (!response.ok) {
        throw new Error(
          data.message ?? "Nu am putut calcula oferta."
        );
      }

      setResult(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "A apărut o eroare."
      );
    } finally {
      if (progressInterval !== undefined) {
        window.clearInterval(progressInterval);
      }

      setIsSearching(false);
    }
  }

  function resetSearchResults() {
    setMessage(null);
    setResult(null);
    setSelectedCombination(null);
  }

  return (
    <section
      id="rezervare"
      className="relative overflow-hidden bg-[#FAFAF7] px-6 py-24"
    >
      <div className="absolute left-[-120px] top-10 h-72 w-72 rounded-full bg-[#158F91]/10 blur-3xl" />
      <div className="absolute bottom-0 right-[-120px] h-80 w-80 rounded-full bg-[#D9B56D]/18 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.42em] text-[#158F91]">
            Planificator vacanță
          </p>

          <h2 className="mt-4 text-4xl font-black text-[#071B2D] md:text-6xl">
            Planifică vacanța ta la Breeze Villa
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Alege perioada și componența grupului, iar Planificatorul
            Breeze caută cea mai avantajoasă combinație de apartamente
            disponibile.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          autoComplete="off"
          suppressHydrationWarning
          className="mt-10 rounded-[2.4rem] bg-white p-6 shadow-[0_24px_80px_rgba(7,27,45,0.11)] ring-1 ring-black/5 md:p-8"
        >
          <BookingCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            minDate={minDate}
            onChange={({
              checkIn: nextCheckIn,
              checkOut: nextCheckOut,
            }) => {
              setCheckIn(nextCheckIn);
              setCheckOut(nextCheckOut);
              resetSearchResults();
            }}
          />

          <div className="mt-6">
            <GuestSelector
              adults={adults}
              childAges={childAges}
              maxGuests={32}
              onAdultsChange={(value) => {
                setAdults(value);
                resetSearchResults();
              }}
              onChildAgesChange={(ages) => {
                setChildAges(ages);
                resetSearchResults();
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !checkIn || !checkOut}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#071B2D] px-7 py-5 text-base font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#158F91] disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
          >
            {isSearching ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Sparkles size={20} />
            )}

            {checkIn && checkOut
              ? "Găsește cea mai bună ofertă"
              : "Selectează perioada"}
          </button>
        </form>

        {isSearching && (
          <div
            className="mt-6 rounded-[2rem] bg-white p-6 shadow-[0_22px_70px_rgba(7,27,45,0.10)] ring-1 ring-black/5"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#158F91]">
              Analizăm disponibilitatea
            </p>

            <div className="mt-5 grid gap-3">
              {searchSteps.map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold ${
                    index <= searchStep
                      ? "bg-[#E9F8F8] text-[#071B2D]"
                      : "bg-[#FAFAF7] text-gray-500"
                  }`}
                >
                  {index <= searchStep ? (
                    <CheckCircle2
                      size={18}
                      className="text-[#158F91]"
                    />
                  ) : (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <div
            className="mt-6 rounded-2xl bg-[#E9F8F8] p-5 text-sm font-bold leading-6 text-[#071B2D]"
            role="alert"
          >
            {message}
          </div>
        )}

        {result && !isSearching && (
          <div
            ref={resultsRef}
            className="mt-10 scroll-mt-28 pb-24 lg:pb-0"
          >
            {result.ok ? (
              <>
                <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-bold text-gray-600">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                    <CalendarDays size={16} />

                    {formatDate(result.input.checkIn)} -{" "}
                    {formatDate(result.input.checkOut)}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                    <Users size={16} />

                    {result.input.adults} adulți •{" "}
                    {result.input.childAges.length} copii
                  </span>
                </div>

                {result.combinations.length > 0 ? (
                  <>
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
                      <CombinationCard
                        result={result}
                        combination={result.combinations[0]}
                        onReserve={setSelectedCombination}
                        savings={
                          result.combinations.length > 1
                            ? Math.max(
                                0,
                                result.combinations[1].totalPrice -
                                  result.combinations[0].totalPrice
                              )
                            : 0
                        }
                      />

                      <BookingSummary
                        result={result}
                        combination={result.combinations[0]}
                        onContinue={() =>
                          setSelectedCombination(
                            result.combinations[0]
                          )
                        }
                      />
                    </div>

                    {result.combinations.length > 1 ? (
                      <div className="mt-8">
                        <div className="mb-5">
                          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#158F91]">
                            Alte variante disponibile
                          </p>

                          <h3 className="mt-2 text-2xl font-black text-[#071B2D]">
                            Alte configurații pentru grupul tău
                          </h3>
                        </div>

                        <div className="grid gap-6">
                          {result.combinations
                            .slice(1)
                            .map((combination) => (
                              <CombinationCard
                                key={combination.id}
                                result={result}
                                combination={combination}
                                onReserve={
                                  setSelectedCombination
                                }
                              />
                            ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : (
              <div className="rounded-[2rem] bg-white p-8 shadow-[0_22px_70px_rgba(7,27,45,0.10)] ring-1 ring-black/5">
                <h3 className="text-2xl font-black text-[#071B2D]">
                  Nu am găsit o combinație completă
                </h3>

                <p className="mt-3 text-gray-600">
                  {result.message}
                </p>

                <a
                  href={`https://wa.me/40723253405?text=${encodeURIComponent(
                    "Bună ziua! Doresc ajutor pentru o rezervare de grup la Breeze Villa."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-black text-white"
                >
                  <MessageCircle size={18} />
                  Cere ajutor pe WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {selectedCombination && result ? (
          <ReservationWizard
            result={result}
            combination={selectedCombination}
            onClose={() => setSelectedCombination(null)}
          />
        ) : null}
      </div>
    </section>
  );
}