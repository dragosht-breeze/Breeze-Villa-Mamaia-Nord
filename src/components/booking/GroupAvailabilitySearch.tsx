"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Baby, CheckCircle2, Loader2, Search, Users } from "lucide-react";

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

type SearchResponse = {
  ok: boolean;
  message?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  requiredPlaces: number;
  maxPeople: number;
  nights: number;
  occupancy: Occupancy;
  availableApartments: AvailableApartment[];
  options: GroupOption[];
};

function todayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function addDaysKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function calculateOccupancy(adults: number, childAges: number[]): Occupancy {
  const children10Plus = childAges.filter((age) => age >= 10).length;
  const childrenUnder10 = childAges.filter((age) => age < 10).length;
  const countedAdults = adults + children10Plus;
  const freeChildrenSharingWithAdults = Math.min(childrenUnder10, Math.floor(countedAdults / 2));
  const remainingSmallChildren = Math.max(childrenUnder10 - freeChildrenSharingWithAdults, 0);
  const childPlaceEquivalent = Math.ceil(remainingSmallChildren / 2);
  const requiredPlaces = countedAdults + childPlaceEquivalent;

  return {
    adults,
    childAges,
    children: childAges.length,
    childrenUnder10,
    children10Plus,
    actualPeople: adults + childAges.length,
    countedAdults,
    freeChildrenSharingWithAdults,
    childPlaceEquivalent,
    requiredPlaces,
  };
}

function buildWhatsappMessage(option: GroupOption, checkIn: string, checkOut: string, occupancy: Occupancy) {
  const apartmentLines = option.apartments
    .map((apartment, index) => `${index + 1}. ${apartment.title} - max. ${apartment.guests} locuri`)
    .join("\n");

  return `Bună ziua! Doresc să verific oferta pentru Breeze Villa Mamaia Nord.\n\nPerioada: ${formatDate(checkIn)} - ${formatDate(checkOut)}\nNopți: ${option.nights}\nAdulți: ${occupancy.adults}\nCopii: ${occupancy.children}${occupancy.children ? ` (${occupancy.childAges.join(", ")} ani)` : ""}\nTotal persoane: ${occupancy.actualPeople}\nLocuri necesare calculate: ${occupancy.requiredPlaces}\n\nSoluție propusă:\n${apartmentLines}\n\nCapacitate totală soluție: ${option.totalGuests} locuri\nTotal estimativ: ${option.total} lei\n\nAștept confirmarea disponibilității și detaliile pentru avans.`;
}

function OptionCard({ option, checkIn, checkOut, index, occupancy }: { option: GroupOption; checkIn: string; checkOut: string; index: number; occupancy: Occupancy }) {
  const whatsappMessage = buildWhatsappMessage(option, checkIn, checkOut, occupancy);

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_22px_65px_rgba(7,27,45,0.10)] ring-1 ring-black/5">
      <div className="flex flex-col gap-5 border-b border-black/5 bg-[#071B2D] p-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#D9B56D]">
            Soluția {index + 1}
          </p>
          <h3 className="mt-2 text-2xl font-black">
            {option.apartmentCount} {option.apartmentCount === 1 ? "apartament" : "apartamente"} pentru {option.requestedGuests} persoane
          </h3>
          <p className="mt-2 text-sm text-white/75">
            Necesar calculat: {option.requiredPlaces} locuri • Capacitate soluție: {option.totalGuests} locuri{option.extraPlaces > 0 ? ` • ${option.extraPlaces} locuri libere în plus` : ""}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-4 text-right">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D9B56D]">Total estimativ</p>
          <p className="mt-1 text-3xl font-black">{option.total} lei</p>
          <p className="text-xs text-white/70">{option.nights} nopți • {option.averageNight} lei/noapte</p>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {option.apartments.map((apartment) => (
          <div key={apartment.slug} className="overflow-hidden rounded-[1.4rem] border border-black/5 bg-[#FAFAF7]">
            <div className="relative h-40">
              <Image src={apartment.coverImage} alt={apartment.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071B2D]/72 to-transparent" />
              <p className="absolute bottom-3 left-3 rounded-full bg-[#D9B56D] px-3 py-1 text-[11px] font-black text-[#071B2D]">
                max. {apartment.guests} locuri
              </p>
            </div>

            <div className="p-4">
              <h4 className="font-black text-[#071B2D]">{apartment.title}</h4>
              <p className="mt-1 text-sm text-gray-600">
                {apartment.roomsLabel} • {apartment.surface} mp • {apartment.floor}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-black text-[#158F91]">{apartment.total} lei</span>
                <Link href={`/apartamente/${apartment.slug}`} className="font-black text-[#071B2D] underline underline-offset-4">
                  Detalii
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-black/5 bg-[#FAFAF7] p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-gray-600">
          Perioada devine blocată doar după confirmarea avansului.
        </p>
        <a
          href={`https://wa.me/40723253405?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex justify-center rounded-full bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D] shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
        >
          Cere oferta pe WhatsApp
        </a>
      </div>
    </article>
  );
}

export default function GroupAvailabilitySearch() {
  const firstDay = addDaysKey(todayKey(), 1);
  const [checkIn, setCheckIn] = useState(firstDay);
  const [checkOut, setCheckOut] = useState(addDaysKey(firstDay, 3));
  const [adults, setAdults] = useState(2);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const occupancy = useMemo(() => calculateOccupancy(adults, childAges), [adults, childAges]);
  const hasResults = Boolean(results?.ok && results.options.length > 0);
  const noResults = Boolean(results?.ok && results.options.length === 0);

  const adultOptions = useMemo(() => Array.from({ length: MAX_LOCATION_PEOPLE }, (_, index) => index + 1), []);
  const childCountOptions = useMemo(() => Array.from({ length: MAX_LOCATION_PEOPLE + 1 }, (_, index) => index), []);
  const ageOptions = useMemo(() => Array.from({ length: 18 }, (_, index) => index), []);

  function updateChildCount(nextCount: number) {
    setChildAges((current) => {
      if (nextCount <= current.length) return current.slice(0, nextCount);
      return [...current, ...Array.from({ length: nextCount - current.length }, () => 6)];
    });
  }

  function updateChildAge(index: number, age: number) {
    setChildAges((current) => current.map((item, currentIndex) => (currentIndex === index ? age : item)));
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setResults(null);

    if (occupancy.actualPeople > MAX_LOCATION_PEOPLE) {
      setMessage(`Capacitatea maximă a locației este de ${MAX_LOCATION_PEOPLE} persoane. Redu numărul de adulți sau copii.`);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        adults: String(adults),
        childAges: childAges.join(","),
      });
      const response = await fetch(`/api/group-availability?${params.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as SearchResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Nu am putut verifica disponibilitatea.");
      }

      setResults(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "A apărut o eroare la verificare.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="rezervare" className="relative overflow-hidden bg-[#071B2D] px-6 py-24 text-white">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#27C5C3]/15 blur-3xl" />
      <div className="absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[#D9B56D]/18 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#D9B56D]">
              Rezervare directă Breeze Villa
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              Caută ca pe Booking, dar rezervă direct.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/78">
              Alege perioada, adulții și vârstele copiilor. Motorul verifică toate apartamentele și îți propune automat combinațiile disponibile pentru grupul tău.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-white/82">
              <div className="flex items-center gap-3"><CheckCircle2 className="text-[#D9B56D]" size={20} /> capacitate maximă locație: 32 persoane</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="text-[#D9B56D]" size={20} /> copiii de 10 ani sau peste sunt calculați ca adulți</div>
              <div className="flex items-center gap-3"><CheckCircle2 className="text-[#D9B56D]" size={20} /> copiii sub 10 ani sunt calculați după regulile de ocupare ale locației</div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="rounded-[2rem] bg-white p-5 text-[#071B2D] shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:p-7">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">Check-in</span>
                <input
                  type="date"
                  value={checkIn}
                  min={todayKey()}
                  onChange={(event) => setCheckIn(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-black outline-none focus:border-[#158F91]"
                />
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">Check-out</span>
                <input
                  type="date"
                  value={checkOut}
                  min={addDaysKey(checkIn, 1)}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-black outline-none focus:border-[#158F91]"
                />
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">Adulți</span>
                <select
                  value={adults}
                  onChange={(event) => setAdults(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-black outline-none focus:border-[#158F91]"
                >
                  {adultOptions.map((value) => (
                    <option key={value} value={value}>{value} {value === 1 ? "adult" : "adulți"}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">Copii</span>
                <select
                  value={childAges.length}
                  onChange={(event) => updateChildCount(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-black outline-none focus:border-[#158F91]"
                >
                  {childCountOptions.map((value) => (
                    <option key={value} value={value}>{value} {value === 1 ? "copil" : "copii"}</option>
                  ))}
                </select>
              </label>
            </div>

            {childAges.length > 0 && (
              <div className="mt-5 rounded-[1.4rem] border border-[#158F91]/15 bg-[#E9F8F8] p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#158F91]">
                  <Baby size={16} /> Vârsta copiilor
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {childAges.map((age, index) => (
                    <label key={`child-${index}`}>
                      <span className="text-xs font-black text-[#071B2D]">Copil {index + 1}</span>
                      <select
                        value={age}
                        onChange={(event) => updateChildAge(index, Number(event.target.value))}
                        className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black outline-none focus:border-[#158F91]"
                      >
                        {ageOptions.map((value) => (
                          <option key={value} value={value}>{value} {value === 1 ? "an" : "ani"}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4 rounded-2xl bg-[#FAFAF7] p-4 text-sm font-bold leading-6 text-[#071B2D] md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p>Total persoane: <strong>{occupancy.actualPeople}</strong> / {MAX_LOCATION_PEOPLE}</p>
                <p>Locuri necesare calculate: <strong>{occupancy.requiredPlaces}</strong></p>
                {occupancy.childrenUnder10 > 0 && (
                  <p className="text-xs text-gray-600">
                    {occupancy.freeChildrenSharingWithAdults} copil/copii sub 10 ani pot sta cu adulții, iar restul se calculează 2 copii = 1 loc.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || occupancy.actualPeople > MAX_LOCATION_PEOPLE}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#071B2D] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                Verifică disponibilitatea
              </button>
            </div>
          </form>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl bg-red-50 p-5 text-sm font-bold text-red-700">
            {message}
          </div>
        )}

        {hasResults && results && (
          <div className="mt-10">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.32em] text-[#D9B56D]">Rezultate disponibile</p>
                <h3 className="mt-2 text-3xl font-black">
                  Am găsit {results.options.length} {results.options.length === 1 ? "soluție" : "soluții"} pentru {results.occupancy.actualPeople} persoane
                </h3>
                <p className="mt-2 text-sm font-bold text-white/72">
                  Calcul ocupare: {results.occupancy.requiredPlaces} locuri necesare • {results.occupancy.adults} adulți • {results.occupancy.children} copii
                </p>
              </div>
              <p className="text-sm font-bold text-white/75">
                {formatDate(results.checkIn)} - {formatDate(results.checkOut)} • {results.nights} nopți
              </p>
            </div>

            <div className="grid gap-6">
              {results.options.map((option, index) => (
                <OptionCard key={option.id} option={option} checkIn={results.checkIn} checkOut={results.checkOut} index={index} occupancy={results.occupancy} />
              ))}
            </div>
          </div>
        )}

        {noResults && results && (
          <div className="mt-10 rounded-[2rem] bg-white p-7 text-[#071B2D] shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFE7C2] text-[#8A4A00]"><Users size={24} /></div>
              <div>
                <h3 className="text-2xl font-black">Nu avem o combinație disponibilă pentru această căutare.</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Încearcă alte date sau contactează-ne pe WhatsApp. Putem verifica manual soluții apropiate pentru grupul tău.
                </p>
                <a
                  href={`https://wa.me/40723253405?text=${encodeURIComponent(`Bună ziua! Caut cazare pentru ${results.occupancy.actualPeople} persoane (${results.occupancy.adults} adulți și ${results.occupancy.children} copii) în perioada ${formatDate(results.checkIn)} - ${formatDate(results.checkOut)} la Breeze Villa Mamaia Nord. Aveți o soluție disponibilă?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-full bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D]"
                >
                  Întreabă pe WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
