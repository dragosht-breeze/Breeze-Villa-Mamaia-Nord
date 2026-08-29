"use client";

import { CalendarDays, CheckCircle2, Home, Users } from "lucide-react";
import type {
  BookingCombination,
  BookingSearchResult,
} from "@/lib/booking/types";

type Props = {
  result: BookingSearchResult;
  combination: BookingCombination;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

export default function ReservationStepVacation({
  result,
  combination,
}: Props) {
  const children = result.input.childAges.length;
  const guestText = `${result.input.adults} ${
    result.input.adults === 1 ? "adult" : "adulți"
  }${children ? ` • ${children} ${children === 1 ? "copil" : "copii"}` : ""}`;

  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-gray-600">
        Am pregătit configurația potrivită pentru vacanța ta. Verifică
        detaliile înainte să continuăm.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#FAFAF7] p-5">
          <CalendarDays className="text-[#158F91]" size={20} />
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
            Perioada
          </p>
          <p className="mt-1 font-black text-[#071B2D]">
            {formatDate(result.input.checkIn)} – {formatDate(result.input.checkOut)}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {combination.nights} {combination.nights === 1 ? "noapte" : "nopți"}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAFAF7] p-5">
          <Users className="text-[#158F91]" size={20} />
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
            Grup declarat
          </p>
          <p className="mt-1 font-black text-[#071B2D]">{guestText}</p>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Prețul este calculat pentru această componență.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-black/5 p-5">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#158F91]">
          <Home size={17} />
          Configurația rezervării
        </div>

        <div className="mt-4 grid gap-3">
          {combination.apartments.map((apartment) => (
            <div
              key={apartment.slug}
              className="flex items-start justify-between gap-4 rounded-2xl bg-[#FAFAF7] p-4"
            >
              <div>
                <p className="font-black text-[#071B2D]">{apartment.title}</p>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Inclusă în configurația aleasă
                </p>
              </div>
              <p className="shrink-0 text-sm font-black text-[#158F91]">
                {formatMoney(apartment.totalPrice)} lei
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#E9F8F8] p-4 text-sm font-bold leading-6 text-[#071B2D]">
        <CheckCircle2 className="mt-0.5 shrink-0 text-[#158F91]" size={18} />
        Rezervarea este valabilă exclusiv pentru numărul și componența de
        oaspeți declarate.
      </div>
    </div>
  );
}
