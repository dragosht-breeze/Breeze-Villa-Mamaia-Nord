"use client";

import { memo, useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import type {
  BookingCombination,
  BookingSearchResult,
} from "@/lib/booking/types";

type BookingSummaryProps = {
  result: BookingSearchResult;
  combination: BookingCombination;
  onContinue: () => void;
  depositPercent?: number;
  className?: string;
};

const moneyFormatter = new Intl.NumberFormat("ro-RO", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

function BookingSummary({
  result,
  combination,
  onContinue,
  depositPercent = 30,
  className = "",
}: BookingSummaryProps) {
  const {
    depositAmount,
    remainingAmount,
    totalGuests,
    formattedCheckIn,
    formattedCheckOut,
    formattedTotalPrice,
  } = useMemo(() => {
    const calculatedDeposit = Math.round(
      (combination.totalPrice * depositPercent) / 100
    );

    return {
      depositAmount: calculatedDeposit,
      remainingAmount:
        combination.totalPrice - calculatedDeposit,
      totalGuests:
        result.input.adults + result.input.childAges.length,
      formattedCheckIn: formatDate(result.input.checkIn),
      formattedCheckOut: formatDate(result.input.checkOut),
      formattedTotalPrice: formatMoney(
        combination.totalPrice
      ),
    };
  }, [
    combination.totalPrice,
    depositPercent,
    result.input.adults,
    result.input.childAges.length,
    result.input.checkIn,
    result.input.checkOut,
  ]);

  return (
    <>
      <aside
        className={`hidden lg:block ${className}`}
        aria-label="Rezumat rezervare"
      >
        <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(7,27,45,0.14)]">
          <div className="bg-[#071B2D] px-6 py-6 text-white">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#D9B56D]">
              <Sparkles size={15} />
              Rezervare directă
            </div>

            <h3 className="mt-3 text-2xl font-black">
              Rezumatul sejurului
            </h3>

            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              Verifică detaliile înainte de a continua rezervarea.
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-2xl bg-[#FAFAF7] p-4">
                <CalendarDays
                  size={19}
                  className="mt-0.5 shrink-0 text-[#158F91]"
                />

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Perioada
                  </p>

                  <p className="mt-1 text-sm font-black text-[#071B2D]">
                    {formattedCheckIn} – {formattedCheckOut}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#FAFAF7] p-4">
                  <Clock3
                    size={18}
                    className="text-[#158F91]"
                  />

                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                    Durată
                  </p>

                  <p className="mt-1 text-sm font-black text-[#071B2D]">
                    {combination.nights}{" "}
                    {combination.nights === 1
                      ? "noapte"
                      : "nopți"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAFAF7] p-4">
                  <Users
                    size={18}
                    className="text-[#158F91]"
                  />

                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                    Oaspeți
                  </p>

                  <p className="mt-1 text-sm font-black text-[#071B2D]">
                    {totalGuests} persoane
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-black/5 pt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#158F91]">
                Unități selectate
              </p>

              <div className="mt-4 grid gap-3">
                {combination.apartments.map((apartment) => (
                  <div
                    key={apartment.slug}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-black/5 p-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9F8F8] text-[#158F91]">
                        <Home size={17} />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#071B2D]">
                          {apartment.title}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          Inclusă în configurația aleasă
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-black text-[#071B2D]">
                      {formatMoney(apartment.totalPrice)} lei
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-[#071B2D] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D9B56D]">
                    Total rezervare
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {formattedTotalPrice} lei
                  </p>
                </div>

                <WalletCards
                  size={28}
                  className="text-[#D9B56D]"
                />
              </div>

              <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-white/75">
                <div className="flex items-center justify-between gap-3">
                  <span>
                    Avans estimat ({depositPercent}%)
                  </span>

                  <strong className="text-white">
                    {formatMoney(depositAmount)} lei
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>Diferență de plată</span>

                  <strong className="text-white">
                    {formatMoney(remainingAmount)} lei
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl bg-[#E9F8F8] p-4 text-xs font-bold text-[#071B2D]">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-[#158F91]"
                />
                Preț calculat pentru grupul declarat
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-[#158F91]"
                />
                Fără comisioane de platformă
              </div>

              <div className="flex items-center gap-2">
                <CreditCard
                  size={16}
                  className="text-[#158F91]"
                />
                Confirmare după plata avansului
              </div>
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D9B56D] px-6 py-4 text-sm font-black text-[#071B2D] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#071B2D] hover:text-white"
            >
              Continuă rezervarea
            </button>

            <p className="mt-3 text-center text-[11px] font-semibold leading-5 text-gray-500">
              Oferta este valabilă pentru numărul și componența
              de oaspeți declarate. Perioada se blochează după
              confirmarea avansului.
            </p>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-10px_35px_rgba(7,27,45,0.14)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#158F91]">
              Total rezervare
            </p>

            <p className="mt-0.5 truncate text-xl font-black text-[#071B2D]">
              {formattedTotalPrice} lei
            </p>

            <p className="mt-0.5 text-[11px] font-bold text-gray-500">
              {combination.nights}{" "}
              {combination.nights === 1
                ? "noapte"
                : "nopți"}{" "}
              • {totalGuests} persoane
            </p>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="shrink-0 rounded-full bg-[#D9B56D] px-5 py-3 text-sm font-black text-[#071B2D] shadow-lg"
          >
            Continuă
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(BookingSummary);