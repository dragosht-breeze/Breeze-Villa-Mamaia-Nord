"use client";

import { useState } from "react";

type FullPaymentButtonProps = {
  payload: {
    apartmentSlug: string;
    apartmentTitle: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
    adults: number;
    children: number;
    guest: {
      name: string;
      phone: string;
      email?: string;
      message?: string;
    };
  };
};

export default function FullPaymentButton({ payload }: FullPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePayment() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/payments/full-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        ok: boolean;
        redirectUrl?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.redirectUrl) {
        throw new Error(data.message ?? "Plata nu a putut fi inițiată.");
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "A apărut o eroare la plată.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isLoading ? "Se procesează plata..." : `Plătește acum ${payload.total} lei`}
      </button>

      {message && (
        <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold leading-6 text-red-700">
          {message}
        </p>
      )}

      <p className="mt-4 text-center text-xs leading-5 text-white/65">
        În această versiune plata este simulată pentru test. Integrarea reală cu procesatorul de plăți se activează după configurarea contului comerciant.
      </p>
    </div>
  );
}
