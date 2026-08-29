"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  X,
} from "lucide-react";
import type {
  BookingCombination,
  BookingSearchResult,
} from "@/lib/booking/types";
import { calculateRequiredDeposit } from "@/lib/payments/payment-policy";
import ReservationStepVacation from "@/components/booking/ReservationStepVacation";
import ReservationStepGuest, {
  type ReservationGuestForm,
} from "@/components/booking/ReservationStepGuest";
import ReservationStepReview from "@/components/booking/ReservationStepReview";
import ReservationStepPayment, {
  type ReservationPaymentChoice,
} from "@/components/booking/ReservationStepPayment";

type Props = {
  result: BookingSearchResult;
  combination: BookingCombination;
  onClose: () => void;
  depositPercent?: number;
};

const steps = [
  "Vacanța ta",
  "Datele tale",
  "Verificare",
  "Confirmare",
];

const emptyGuest: ReservationGuestForm = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

export default function ReservationWizard({
  result,
  combination,
  onClose,
  depositPercent = 30,
}: Props) {
  const [step, setStep] = useState(0);
  const [guest, setGuest] = useState<ReservationGuestForm>(emptyGuest);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ReservationGuestForm, string>>
  >({});
  const [accepted, setAccepted] = useState(false);
  const [paymentChoice, setPaymentChoice] =
    useState<ReservationPaymentChoice>("card_deposit");
  const [vacationPartialAmount, setVacationPartialAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [groupCode, setGroupCode] = useState("");

  const depositBreakdown = useMemo(
    () =>
      calculateRequiredDeposit(
        combination.totalPrice,
        combination.nights,
        depositPercent
      ),
    [
      combination.totalPrice,
      combination.nights,
      depositPercent,
    ]
  );

  const depositAmount = depositBreakdown.requiredDeposit;

  useEffect(() => {
    setVacationPartialAmount((current) =>
      current >= depositAmount && current < combination.totalPrice
        ? current
        : depositAmount
    );
  }, [depositAmount, combination.totalPrice]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSubmitting, onClose]);

  function validateGuest() {
    const nextErrors: typeof errors = {};
    if (guest.name.trim().length < 3) {
      nextErrors.name = "Introdu numele complet.";
    }
    if (guest.phone.replace(/\D/g, "").length < 9) {
      nextErrors.phone = "Introdu un număr de telefon valid.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) {
      nextErrors.email = "Introdu o adresă de email validă.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    setSubmitError("");
    if (step === 1 && !validateGuest()) return;
    if (step === 2 && !accepted) {
      setSubmitError("Confirmă că datele rezervării sunt corecte.");
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submitReservation() {
    setSubmitError("");

    if (
      paymentChoice === "vacation_partial_link" &&
      (vacationPartialAmount < depositAmount ||
        vacationPartialAmount >= combination.totalPrice)
    ) {
      setSubmitError(
        `Plata parțială trebuie să fie de minimum ${depositAmount} lei și mai mică decât totalul rezervării.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/booking/group-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: result.input.checkIn,
          checkOut: result.input.checkOut,
          nights: result.nights,
          adults: result.input.adults,
          children: result.input.childAges.length,
          childAges: result.input.childAges,
          total: combination.totalPrice,
          paymentMode: paymentChoice,
          depositPercent,
          depositAmount,
          paymentAmount:
            paymentChoice === "card_full" ||
            paymentChoice === "vacation_full_link"
              ? combination.totalPrice
              : paymentChoice === "vacation_partial_link"
                ? vacationPartialAmount
                : depositAmount,
          remainingBalance:
            paymentChoice === "card_full" ||
            paymentChoice === "vacation_full_link"
              ? 0
              : combination.totalPrice -
                (paymentChoice === "vacation_partial_link"
                  ? vacationPartialAmount
                  : depositAmount),
          apartments: combination.apartments.map((apartment) => ({
            slug: apartment.slug,
            title: apartment.title,
            totalPrice: apartment.totalPrice,
          })),
          guest,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        groupCode?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Cererea nu a putut fi înregistrată.");
      }

      const reservationCode = data.groupCode ?? "BREEZE";
      const paymentAmount =
        paymentChoice === "card_full" ||
        paymentChoice === "vacation_full_link"
          ? combination.totalPrice
          : paymentChoice === "vacation_partial_link"
            ? vacationPartialAmount
            : depositAmount;

      const method =
        paymentChoice === "vacation_full_link" ||
        paymentChoice === "vacation_partial_link"
          ? "vacation_card_link"
          : paymentChoice === "bank_transfer"
            ? "bank_transfer"
            : "card_online";

      const scope =
        paymentChoice === "card_full" ||
        paymentChoice === "vacation_full_link"
          ? "full"
          : paymentChoice === "vacation_partial_link"
            ? "partial"
            : "deposit";

      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationCode,
          totalAmount: combination.totalPrice,
          nights: combination.nights,
          amount: paymentAmount,
          currency: "RON",
          method,
          scope,
          customer: {
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
          },
          description: `Rezervare Breeze Villa ${reservationCode}`,
          returnUrl: `${window.location.origin}/rezervare/${reservationCode}`,
        }),
      });

      const paymentData = (await paymentResponse.json()) as {
        ok: boolean;
        redirectUrl?: string;
        message?: string;
      };

      if (!paymentResponse.ok || !paymentData.ok) {
        throw new Error(
          paymentData.message ?? "Plata nu a putut fi inițializată."
        );
      }

      if (paymentData.redirectUrl) {
        window.location.assign(paymentData.redirectUrl);
        return;
      }

      setGroupCode(reservationCode);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "A apărut o eroare."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center bg-[#020A12]/75 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[2rem]">
        <div className="shrink-0 bg-[#071B2D] px-5 py-5 text-white sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D9B56D]">
                Rezervare directă Breeze Villa
              </p>
              <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                {groupCode ? "Cererea a fost înregistrată" : steps[step]}
              </h3>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white hover:text-[#071B2D] disabled:opacity-50"
              aria-label="Închide"
            >
              <X size={21} />
            </button>
          </div>

          {!groupCode ? (
            <div className="mt-5 grid grid-cols-4 gap-2">
              {steps.map((label, index) => (
                <div key={label}>
                  <div
                    className={`h-1.5 rounded-full ${
                      index <= step ? "bg-[#D9B56D]" : "bg-white/15"
                    }`}
                  />
                  <p
                    className={`mt-2 hidden text-[10px] font-black uppercase tracking-[0.1em] sm:block ${
                      index <= step ? "text-white" : "text-white/40"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {groupCode ? (
            <div className="mx-auto max-w-xl py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E9F8F8] text-[#158F91]">
                <Check size={30} />
              </div>
              <h4 className="mt-5 text-3xl font-black text-[#071B2D]">
                Mulțumim!
              </h4>
              <p className="mt-3 text-sm font-semibold leading-6 text-gray-600">
                Cererea a fost trimisă. Codul rezervării este:
              </p>
              <p className="mt-3 rounded-2xl bg-[#071B2D] px-5 py-4 text-2xl font-black tracking-[0.15em] text-[#D9B56D]">
                {groupCode}
              </p>
              <p className="mt-4 text-sm font-semibold leading-6 text-gray-600">
                Vei primi instrucțiunile pentru plata avansului. Perioada se
                confirmă după încasarea acestuia.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full bg-[#D9B56D] px-7 py-3.5 text-sm font-black text-[#071B2D]"
              >
                Închide
              </button>
            </div>
          ) : (
            <>
              {step === 0 ? (
                <ReservationStepVacation
                  result={result}
                  combination={combination}
                />
              ) : null}

              {step === 1 ? (
                <ReservationStepGuest
                  value={guest}
                  onChange={(value) => {
                    setGuest(value);
                    setErrors({});
                  }}
                  errors={errors}
                />
              ) : null}

              {step === 2 ? (
                <ReservationStepReview
                  result={result}
                  combination={combination}
                  guest={guest}
                  depositPercent={depositPercent}
                  depositAmount={depositAmount}
                  accepted={accepted}
                  onAcceptedChange={setAccepted}
                />
              ) : null}

              {step === 3 ? (
                <ReservationStepPayment
                  value={paymentChoice}
                  onChange={setPaymentChoice}
                  vacationPartialAmount={vacationPartialAmount}
                  onVacationPartialAmountChange={
                    setVacationPartialAmount
                  }
                  depositAmount={depositAmount}
                  totalAmount={combination.totalPrice}
                />
              ) : null}

              {submitError ? (
                <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                  {submitError}
                </div>
              ) : null}
            </>
          )}
        </div>

        {!groupCode ? (
          <div className="shrink-0 border-t border-black/5 bg-white px-5 py-4 sm:px-7">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={step === 0 || isSubmitting}
                onClick={() => {
                  setSubmitError("");
                  setStep((current) => Math.max(0, current - 1));
                }}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-black text-[#071B2D] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft size={17} />
                Înapoi
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D] shadow-lg"
                >
                  Continuă
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={submitReservation}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D9B56D] px-6 py-3 text-sm font-black text-[#071B2D] shadow-lg disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Check size={17} />
                  )}
                  {isSubmitting ? "Se înregistrează..." : "Trimite cererea"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
