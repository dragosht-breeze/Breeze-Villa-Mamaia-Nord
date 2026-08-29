"use client";

import { CalendarDays, Home, UserRound, WalletCards } from "lucide-react";
import type {
  BookingCombination,
  BookingSearchResult,
} from "@/lib/booking/types";
import type { ReservationGuestForm } from "@/components/booking/ReservationStepGuest";

type Props = {
  result: BookingSearchResult;
  combination: BookingCombination;
  guest: ReservationGuestForm;
  depositPercent: number;
  depositAmount: number;
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default function ReservationStepReview({
  result,
  combination,
  guest,
  depositPercent,
  depositAmount,
  accepted,
  onAcceptedChange,
}: Props) {
  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-gray-600">
        Verifică informațiile. După trimiterea cererii, perioada va fi
        confirmată după plata avansului.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#FAFAF7] p-5">
          <CalendarDays className="text-[#158F91]" size={20} />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-gray-400">
            Sejur
          </p>
          <p className="mt-1 font-black text-[#071B2D]">
            {formatDate(result.input.checkIn)} – {formatDate(result.input.checkOut)}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {combination.nights} {combination.nights === 1 ? "noapte" : "nopți"}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAFAF7] p-5">
          <UserRound className="text-[#158F91]" size={20} />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-gray-400">
            Titular rezervare
          </p>
          <p className="mt-1 font-black text-[#071B2D]">{guest.name}</p>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {guest.phone} • {guest.email}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-black/5 p-5">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#158F91]">
          <Home size={17} />
          Configurație
        </div>
        <div className="mt-3 grid gap-2">
          {combination.apartments.map((apartment) => (
            <div
              key={apartment.slug}
              className="flex justify-between gap-4 text-sm"
            >
              <span className="font-bold text-[#071B2D]">{apartment.title}</span>
              <strong className="shrink-0 text-[#071B2D]">
                {formatMoney(apartment.totalPrice)} lei
              </strong>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-[#071B2D] p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D9B56D]">
              Total sejur
            </p>
            <p className="mt-1 text-3xl font-black">
              {formatMoney(combination.totalPrice)} lei
            </p>
          </div>
          <WalletCards className="text-[#D9B56D]" size={28} />
        </div>
        <p className="mt-3 border-t border-white/10 pt-3 text-sm font-semibold text-white/75">
          Avans pentru confirmare:{" "}
          <strong className="text-white">
            {formatMoney(depositAmount)} lei
          </strong>
          <span className="mt-1 block text-xs text-white/60">
            Valoarea mai mare dintre {depositPercent}% din total și o noapte de cazare.
          </span>
        </p>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 p-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          className="mt-1 h-4 w-4 accent-[#158F91]"
        />
        <span className="text-sm font-semibold leading-6 text-gray-600">
          Confirm că datele sunt corecte, că rezervarea este valabilă numai
          pentru numărul și componența de oaspeți declarate și că am luat la
          cunoștință politica de anulare: <strong className="text-[#071B2D]">
          Sumele achitate nu sunt rambursabile în cazul anulării.</strong>
        </span>
      </label>
    </div>
  );
}
