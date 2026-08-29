"use client";

import Image from "next/image";
import { CheckCircle2, CreditCard } from "lucide-react";

type VacationCardsProps = {
  className?: string;
  compact?: boolean;
  showBenefits?: boolean;
  dark?: boolean;
};

const providers = [
  {
    name: "Edenred",
    src: "/branding/vacation-cards/edenred.svg",
    width: 420,
    height: 150,
  },
  {
    name: "Pluxee",
    src: "/branding/vacation-cards/pluxee.svg",
    width: 420,
    height: 150,
  },
  {
    name: "UP România",
    src: "/branding/vacation-cards/up-romania.svg",
    width: 420,
    height: 150,
  },
];

const benefits = [
  "Plată integrală sau avans",
  "Rezervare directă",
  "Proces rapid și sigur",
];

export default function VacationCards({
  className = "",
  compact = false,
  showBenefits = true,
  dark = false,
}: VacationCardsProps) {
  return (
    <section
      aria-label="Carduri de vacanță acceptate"
      className={`rounded-[1.6rem] border p-5 ${
        dark
          ? "border-white/10 bg-white/[0.05] text-white"
          : "border-black/5 bg-white text-[#071B2D] shadow-[0_16px_45px_rgba(7,27,45,0.08)]"
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            dark
              ? "bg-[#D9B56D]/15 text-[#D9B56D]"
              : "bg-[#E9F8F8] text-[#158F91]"
          }`}
        >
          <CreditCard aria-hidden="true" size={20} />
        </span>

        <div>
          <p className="text-sm font-black">
            Acceptăm carduri de vacanță
          </p>

          {!compact && (
            <p
              className={`mt-1 text-xs leading-5 ${
                dark ? "text-white/60" : "text-gray-500"
              }`}
            >
              Edenred, Pluxee și UP România
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex min-h-16 items-center justify-center overflow-hidden rounded-xl bg-white px-2 py-2 ring-1 ring-black/5"
          >
            <Image
              src={provider.src}
              alt={`${provider.name} – card de vacanță acceptat`}
              width={provider.width}
              height={provider.height}
              className="h-9 w-auto max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      {showBenefits && !compact && (
        <div className="mt-4 grid gap-2">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className={`flex items-center gap-2 text-xs font-semibold ${
                dark ? "text-white/70" : "text-gray-600"
              }`}
            >
              <CheckCircle2
                aria-hidden="true"
                size={15}
                className={dark ? "text-[#7FE7E6]" : "text-[#158F91]"}
              />
              {benefit}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
