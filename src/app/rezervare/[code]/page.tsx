import type { Metadata } from "next";
import Link from "next/link";

import { getReservationFolder } from "@/lib/reservation-center/store";

export const metadata: Metadata = {
  title: "Confirmare plată rezervare",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ orderId?: string | string[] }>;
};

function safeCode(value: string) {
  return /^[A-Z0-9-]{6,64}$/i.test(value) ? value : "Rezervare Breeze Villa";
}

export default async function ReservationReturnPage({
  params,
  searchParams,
}: PageProps) {
  const { code: rawCode } = await params;
  const query = await searchParams;
  const code = safeCode(rawCode);
  const orderId = Array.isArray(query.orderId) ? query.orderId[0] : query.orderId;
  const folder = code === rawCode ? await getReservationFolder(code) : null;
  const paymentStatus = folder?.paymentStatus ?? "unpaid";
  const isConfirmed = paymentStatus === "paid" || paymentStatus === "partially_paid";

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-5 py-16 sm:py-24">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(7,27,45,0.12)]">
        <div className="bg-[#071B2D] px-6 py-10 text-center text-white sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-3xl text-emerald-300">
            ✓
          </div>
          <p className="mt-5 text-[11px] font-black uppercase tracking-[0.3em] text-[#D9B56D]">
            NETOPIA Payments · Sandbox
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Plata de test a fost procesată
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-6 text-white/75 sm:text-base">
            Ai revenit cu succes la Breeze Villa. Tranzacția Sandbox nu a
            retras bani de pe un card real.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="rounded-2xl bg-[#E9F8F8] p-5 text-[#071B2D]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#158F91]">
              Cod rezervare
            </p>
            <p className="mt-2 break-all text-xl font-black">{code}</p>
            {orderId && orderId !== code ? (
              <p className="mt-3 text-xs font-bold text-amber-700">
                Referința returnată de procesator diferă de codul paginii.
              </p>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 p-5">
            <p className="font-black text-[#071B2D]">
              {isConfirmed
                ? "Plata este înregistrată în sistem."
                : "Confirmarea automată este în curs de verificare."}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">
              Înainte de activarea plăților reale vom valida criptografic
              notificarea NETOPIA și vom confirma rezervarea numai după
              răspunsul autentic al procesatorului.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-full bg-[#071B2D] px-7 py-3.5 text-center text-sm font-black text-white"
            >
              Înapoi la pagina principală
            </Link>
            <a
              href="https://wa.me/40723253405"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#D9B56D] px-7 py-3.5 text-center text-sm font-black text-[#071B2D]"
            >
              Contact WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

