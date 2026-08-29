"use client";

import { memo, useCallback, useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Home,
  MessageCircle,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import ApartmentResultCard from "@/components/booking/ApartmentResultCard";

import type {
  BookingCombination,
  BookingSearchResult,
} from "@/lib/booking/types";

type CombinationCardProps = {
  result: BookingSearchResult;
  combination: BookingCombination;
  onReserve: (combination: BookingCombination) => void;
  savings?: number;
};

const moneyFormatter = new Intl.NumberFormat("ro-RO");

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

function buildGuestSummary(adults: number, children: number) {
  const adultLabel =
    adults === 1 ? "1 adult" : `${adults} adulți`;

  if (children === 0) {
    return adultLabel;
  }

  return `${adultLabel} • ${children} ${
    children === 1 ? "copil" : "copii"
  }`;
}

function buildWhatsappText(
  result: BookingSearchResult,
  combination: BookingCombination
) {
  const apartments = combination.apartments
    .map(
      (apartment) =>
        `• ${apartment.title} - ${formatMoney(
          apartment.totalPrice
        )} lei`
    )
    .join("\n");

  return encodeURIComponent(
    `Bună ziua! Doresc să rezerv direct la Breeze Villa.

Perioada: ${formatDate(
      result.input.checkIn
    )} - ${formatDate(result.input.checkOut)}
Nopți: ${result.nights}
Adulți: ${result.input.adults}
Copii: ${result.input.childAges.length}
Vârste copii: ${result.input.childAges.join(", ") || "-"}

Configurația aleasă:
${apartments}

Total pentru grupul declarat: ${formatMoney(
      combination.totalPrice
    )} lei`
  );
}

function CombinationCard({
  result,
  combination,
  onReserve,
  savings = 0,
}: CombinationCardProps) {
  const {
    guests,
    apartmentCount,
    formattedSavings,
    formattedTotalPrice,
    formattedPricePerPerson,
    formattedPricePerPersonPerNight,
    whatsappHref,
  } = useMemo(() => {
    const children = result.input.childAges.length;

    return {
      guests: buildGuestSummary(
        result.input.adults,
        children
      ),
      apartmentCount: combination.apartments.length,
      formattedSavings: formatMoney(savings),
      formattedTotalPrice: formatMoney(
        combination.totalPrice
      ),
      formattedPricePerPerson: formatMoney(
        combination.pricePerPerson
      ),
      formattedPricePerPersonPerNight: formatMoney(
        combination.pricePerPersonPerNight
      ),
      whatsappHref: `https://wa.me/40723253405?text=${buildWhatsappText(
        result,
        combination
      )}`,
    };
  }, [
    combination,
    result,
    savings,
  ]);

  const handleReserve = useCallback(() => {
    onReserve(combination);
  }, [combination, onReserve]);

  return (
    <article
      className={`overflow-hidden rounded-[2.2rem] bg-white shadow-[0_24px_80px_rgba(7,27,45,0.12)] ring-1 ${
        combination.isRecommended
          ? "ring-[#D9B56D]/90"
          : "ring-black/5"
      }`}
    >
      <div
        className={`p-6 text-white sm:p-7 ${
          combination.isRecommended
            ? "bg-[#071B2D]"
            : "bg-[#0F4C81]"
        }`}
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#D9B56D] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#071B2D]">
                <Sparkles size={14} />

                {combination.isRecommended
                  ? "Cea mai avantajoasă pentru grupul tău"
                  : "Variantă alternativă"}
              </span>

              {savings > 0 ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                  Economisești {formattedSavings} lei
                </span>
              ) : null}
            </div>

            <h3 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">
              {combination.isRecommended
                ? "Configurația recomandată pentru sejurul ales"
                : "O altă configurație potrivită pentru grup"}
            </h3>

            <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
              Oferta este calculată exclusiv pentru {guests},
              în perioada selectată. Orice modificare a
              numărului de oaspeți trebuie confirmată în
              prealabil de Breeze Villa.
            </p>
          </div>

          <div className="w-full rounded-[1.5rem] bg-white px-5 py-5 text-[#071B2D] shadow-2xl sm:w-auto sm:min-w-[260px] sm:px-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#158F91]">
              Total pentru grup
            </p>

            <p className="mt-1 text-3xl font-black sm:text-4xl">
              {formattedTotalPrice} lei
            </p>

            <p className="mt-2 text-xs font-bold text-gray-500">
              {formattedPricePerPerson} lei / persoană
            </p>

            <p className="text-xs font-bold text-gray-500">
              {formattedPricePerPersonPerNight} lei /
              persoană / noapte
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-3 rounded-[1.5rem] bg-[#FAFAF7] p-5 text-sm font-bold leading-6 text-[#071B2D] md:grid-cols-3">
          <div className="flex gap-3">
            <Users
              className="mt-0.5 shrink-0 text-[#158F91]"
              size={18}
            />

            <span>Ofertă calculată pentru {guests}.</span>
          </div>

          <div className="flex gap-3">
            <Home
              className="mt-0.5 shrink-0 text-[#158F91]"
              size={18}
            />

            <span>
              {apartmentCount}{" "}
              {apartmentCount === 1
                ? "unitate selectată"
                : "unități selectate"}
              .
            </span>
          </div>

          <div className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#158F91]"
              size={18}
            />

            <span>
              Preț final pentru configurația declarată.
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {combination.apartments.map((apartment) => (
            <ApartmentResultCard
              key={apartment.slug}
              apartment={apartment}
              formatMoney={formatMoney}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-[#E9F8F8] p-5 text-sm font-black text-[#071B2D] md:grid-cols-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={17} />

            {combination.nights}{" "}
            {combination.nights === 1
              ? "noapte"
              : "nopți"}
          </div>

          <div className="flex items-center gap-2">
            <WalletCards size={17} />

            {formattedPricePerPerson} lei / persoană
          </div>

          <div className="flex items-center gap-2">
            <Clock size={17} />

            {formattedPricePerPersonPerNight} lei /
            persoană / noapte
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleReserve}
            className="inline-flex items-center justify-center rounded-full bg-[#D9B56D] px-7 py-3.5 text-sm font-black text-[#071B2D] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#071B2D] hover:text-white"
          >
            Confirmă această variantă
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#071B2D]/15 px-7 py-3.5 text-sm font-black text-[#071B2D] transition hover:bg-[#071B2D] hover:text-white"
          >
            <MessageCircle size={17} />
            Trimite pe WhatsApp
          </a>
        </div>

        <p className="mt-4 text-xs font-semibold leading-5 text-gray-500">
          Rezervarea este valabilă exclusiv pentru numărul și
          componența de oaspeți declarate în căutare.
        </p>
      </div>
    </article>
  );
}

export default memo(CombinationCard);