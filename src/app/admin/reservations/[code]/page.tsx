import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deriveNextAction,
  deriveReservationHealth,
} from "@/lib/reservation-center/service";
import { getReservationFolder } from "@/lib/reservation-center/store";

function money(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const healthClasses = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  attention: "bg-amber-50 text-amber-700 ring-amber-200",
  critical: "bg-red-50 text-red-700 ring-red-200",
};

export default async function ReservationFolderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const folder = await getReservationFolder(code);
  if (!folder) notFound();

  const health = deriveReservationHealth(folder);
  const nextAction = deriveNextAction(folder);

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/reservations"
          className="text-sm font-black text-[#158F91]"
        >
          ← Înapoi la rezervări
        </Link>

        <div className="mt-5 rounded-[2rem] bg-[#071B2D] p-8 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#D9B56D]">
                Dosarul rezervării
              </p>
              <h1 className="mt-3 text-4xl font-black">{folder.code}</h1>
              <p className="mt-3 text-white/70">
                {folder.summary.guest.name} • {date(folder.summary.checkIn)} – {date(folder.summary.checkOut)}
              </p>
            </div>
            <span className={`w-fit rounded-full px-4 py-2 text-sm font-black ring-1 ${healthClasses[health.level]}`}>
              {health.label}
            </span>
          </div>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D9B56D]">Acțiunea următoare</p>
            <p className="mt-2 text-xl font-black">{nextAction.label}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2">
            <h2 className="text-xl font-black text-[#071B2D]">Rezumat</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#FAFAF7] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#158F91]">Client</p>
                <p className="mt-2 font-black text-[#071B2D]">{folder.summary.guest.name}</p>
                <p className="text-sm text-gray-600">{folder.summary.guest.phone}</p>
                {folder.summary.guest.email ? <p className="text-sm text-gray-600">{folder.summary.guest.email}</p> : null}
              </div>
              <div className="rounded-2xl bg-[#FAFAF7] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#158F91]">Configurație</p>
                {folder.summary.apartments.map((apartment) => (
                  <p key={apartment.slug} className="mt-2 font-black text-[#071B2D]">{apartment.title}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-black text-[#071B2D]">Financiar</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between"><dt>Total</dt><dd className="font-black">{money(folder.financial.total)} lei</dd></div>
              <div className="flex justify-between"><dt>Avans minim</dt><dd className="font-black">{money(folder.financial.requiredDeposit)} lei</dd></div>
              <div className="flex justify-between"><dt>Încasat</dt><dd className="font-black text-emerald-700">{money(folder.financial.paid)} lei</dd></div>
              <div className="flex justify-between border-t pt-3"><dt>Sold</dt><dd className="font-black text-orange-700">{money(folder.financial.balance)} lei</dd></div>
            </dl>
          </section>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-black text-[#071B2D]">Tranzacții</h2>
            <div className="mt-5 grid gap-3">
              {folder.financial.transactions.length === 0 ? <p className="text-sm text-gray-500">Nu există tranzacții înregistrate.</p> : folder.financial.transactions.map((transaction) => (
                <div key={transaction.id} className="rounded-2xl bg-[#FAFAF7] p-4 text-sm">
                  <div className="flex justify-between gap-4"><strong>{transaction.method} • {transaction.scope}</strong><strong>{money(transaction.amount)} lei</strong></div>
                  <p className="mt-1 text-gray-500">{transaction.status} • {dateTime(transaction.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-black text-[#071B2D]">Timeline</h2>
            <div className="mt-5 grid gap-3">
              {folder.timeline.slice().reverse().map((item) => (
                <div key={item.id} className="border-l-2 border-[#D9B56D] pl-4">
                  <p className="font-black text-[#071B2D]">{item.title}</p>
                  <p className="text-xs text-gray-500">{dateTime(item.at)} • {item.actor}</p>
                  {item.note ? <p className="mt-1 text-sm text-gray-600">{item.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
