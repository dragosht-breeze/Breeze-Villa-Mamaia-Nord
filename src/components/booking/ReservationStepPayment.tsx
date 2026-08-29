"use client";

import {
  Building2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  TicketCheck,
  WalletCards,
} from "lucide-react";

export type ReservationPaymentChoice =
  | "card_deposit"
  | "card_full"
  | "vacation_full_link"
  | "vacation_partial_link"
  | "bank_transfer";

type Props = {
  value: ReservationPaymentChoice;
  onChange: (value: ReservationPaymentChoice) => void;
  vacationPartialAmount: number;
  onVacationPartialAmountChange: (value: number) => void;
  depositAmount: number;
  totalAmount: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function optionClass(active: boolean) {
  return `rounded-[1.5rem] border p-5 text-left transition ${
    active
      ? "border-[#D9B56D] bg-[#FFF8E8] ring-2 ring-[#D9B56D]/30"
      : "border-black/10 bg-white hover:border-[#D9B56D]/60"
  }`;
}

export default function ReservationStepPayment({
  value,
  onChange,
  vacationPartialAmount,
  onVacationPartialAmountChange,
  depositAmount,
  totalAmount,
}: Props) {
  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-gray-600">
        Alege metoda de plată. Avansul minim este de{" "}
        <strong className="text-[#071B2D]">
          {formatMoney(depositAmount)} lei
        </strong>
        , reprezentând valoarea mai mare dintre 30% din total și o noapte de
        cazare.
      </p>

      <div className="mt-6 grid gap-4">
        <button
          type="button"
          onClick={() => onChange("card_deposit")}
          className={optionClass(value === "card_deposit")}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071B2D] text-[#D9B56D]">
              <CreditCard size={22} />
            </span>
            <div>
              <p className="font-black text-[#071B2D]">
                Card bancar — avans online
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-gray-600">
                Achită {formatMoney(depositAmount)} lei online. Diferența poate
                fi achitată la sosire, inclusiv cu cardul de vacanță la POS.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("card_full")}
          className={optionClass(value === "card_full")}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D9B56D] text-[#071B2D]">
              <WalletCards size={22} />
            </span>
            <div>
              <p className="font-black text-[#071B2D]">
                Card bancar — plată integrală
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-gray-600">
                Achită integral {formatMoney(totalAmount)} lei online.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("vacation_full_link")}
          className={optionClass(value === "vacation_full_link")}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]">
              <TicketCheck size={22} />
            </span>
            <div>
              <p className="font-black text-[#071B2D]">
                Card de vacanță — plată integrală prin link
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-gray-600">
                Vei primi un link pentru plata integrală a sumei de{" "}
                {formatMoney(totalAmount)} lei.
              </p>
            </div>
          </div>
        </button>

        <div
          className={optionClass(value === "vacation_partial_link")}
          onClick={() => onChange("vacation_partial_link")}
        >
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onChange("vacation_partial_link")}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F8F8] text-[#158F91]">
                <TicketCheck size={22} />
              </span>
              <div>
                <p className="font-black text-[#071B2D]">
                  Card de vacanță — plată parțială prin link
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-gray-600">
                  Achită prin link suma disponibilă pe card. Diferența se
                  achită la locație.
                </p>
              </div>
            </div>
          </button>

          {value === "vacation_partial_link" ? (
            <label
              className="mt-4 grid gap-2 border-t border-black/5 pt-4"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="text-sm font-black text-[#071B2D]">
                Suma dorită prin link
              </span>
              <input
                type="number"
                min={depositAmount}
                max={Math.max(depositAmount, totalAmount - 1)}
                step={1}
                value={vacationPartialAmount}
                onChange={(event) =>
                  onVacationPartialAmountChange(
                    Math.max(0, Number(event.target.value) || 0)
                  )
                }
                className="rounded-2xl border border-black/10 bg-white px-4 py-4 font-black text-[#071B2D] outline-none focus:border-[#158F91]"
              />
              <span className="text-xs font-semibold leading-5 text-gray-500">
                Minimum {formatMoney(depositAmount)} lei și mai puțin decât
                totalul de {formatMoney(totalAmount)} lei.
              </span>
            </label>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onChange("bank_transfer")}
          className={optionClass(value === "bank_transfer")}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAFAF7] text-[#071B2D]">
              <Building2 size={22} />
            </span>
            <div>
              <p className="font-black text-[#071B2D]">
                Transfer bancar — avans
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-gray-600">
                Datele pentru plata avansului vor fi transmise după
                înregistrarea rezervării.
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl bg-[#E9F8F8] p-4 text-sm font-bold text-[#071B2D]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={17} className="text-[#158F91]" />
          Datele cardului nu sunt stocate de Breeze Villa.
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={17} className="text-[#158F91]" />
          Rezervarea se confirmă după încasarea avansului minim sau a plății
          integrale.
        </div>
      </div>
    </div>
  );
}
