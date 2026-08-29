"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { subscribeAdminLiveEvents } from "@/lib/admin/admin-live-events";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  TicketCheck,
  WalletCards,
} from "lucide-react";
import ReservationDrawer, {
  type CalendarReservationSummary,
} from "@/components/admin/calendar/ReservationDrawer";

type Transaction = {
  id: string;
  kind: "payment" | "refund" | "service" | "adjustment";
  method: string;
  scope: string;
  amount: number;
  currency: "RON";
  status: string;
  providerReference?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

type FinancialReservation = CalendarReservationSummary & {
  apartmentTitles: string[];
  source: string;
  requiredDeposit: number;
  refunded: number;
  selectedPaymentAmount: number;
  selectedPaymentMode: string;
  paymentMethodLabel: string;
  transactions: Transaction[];
  todayPaid: number;
  monthPaid: number;
  monthRefunded: number;
  createdAt: string;
  updatedAt: string;
};

type FinancialData = {
  generatedAt: string;
  stats: {
    todayRevenue: number;
    monthRevenue: number;
    totalRevenue: number;
    outstanding: number;
    requiredDepositsPending: number;
    monthRefunded: number;
    collectionRate: number;
    unpaidReservations: number;
    fullyPaidReservations: number;
  };
  paymentMethods: Array<{ label: string; amount: number }>;
  reservations: FinancialReservation[];
};

type FilterValue =
  | "all"
  | "outstanding"
  | "deposit_pending"
  | "paid"
  | "vacation"
  | "refunds";

function money(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}


function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    unpaid: "Neachitat",
    partially_paid: "Achitat parțial",
    paid: "Achitat integral",
    refunded: "Rambursat",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function paymentStatusClasses(status: string) {
  if (status === "paid") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "refunded") {
    return "bg-violet-50 text-violet-700 ring-violet-200";
  }

  if (status === "partially_paid") {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }

  return "bg-red-50 text-red-700 ring-red-200";
}

function createDrawerReservation(
  reservation: FinancialReservation
): CalendarReservationSummary {
  return {
    id: reservation.code,
    code: reservation.code,
    apartmentSlug: "",
    apartmentTitle: reservation.apartmentTitles.join(" + "),
    guestName: reservation.guestName,
    phone: reservation.phone,
    email: reservation.email,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    adults: reservation.adults,
    children: reservation.children,
    total: reservation.total,
    paid: reservation.paid,
    balance: reservation.balance,
    paymentMode: reservation.selectedPaymentMode,
    lifecycleStatus: reservation.lifecycleStatus,
    paymentStatus: reservation.paymentStatus,
    source: reservation.source,
    requests: reservation.requests,
  };
}

function exportCsv(reservations: FinancialReservation[]) {
  const header = [
    "Cod",
    "Client",
    "Apartament",
    "Check-in",
    "Check-out",
    "Total",
    "Achitat",
    "Rambursat",
    "Sold",
    "Metodă",
    "Status plată",
  ];

  const rows = reservations.map((reservation) => [
    reservation.code,
    reservation.guestName,
    reservation.apartmentTitles.join(" + "),
    reservation.checkIn,
    reservation.checkOut,
    reservation.total,
    reservation.paid,
    reservation.refunded,
    reservation.balance,
    reservation.paymentMethodLabel,
    paymentStatusLabel(reservation.paymentStatus),
  ]);

  const content = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `breeze-financiar-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function FinancialCenter() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedReservation, setSelectedReservation] =
    useState<CalendarReservationSummary | null>(null);

  async function load() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/financial", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Centrul financiar nu a putut fi actualizat.");
      }

      setData((await response.json()) as FinancialData);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "A apărut o eroare necunoscută."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();

    const intervalId = window.setInterval(
      () => void load(),
      30_000
    );

    const unsubscribe = subscribeAdminLiveEvents(
      () => void load()
    );

    const refreshOnFocus = () => void load();
    const refreshOnVisibility = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener(
      "visibilitychange",
      refreshOnVisibility
    );

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
      window.removeEventListener(
        "focus",
        refreshOnFocus
      );
      document.removeEventListener(
        "visibilitychange",
        refreshOnVisibility
      );
    };
  }, []);

  const filteredReservations = useMemo(() => {
    if (!data) return [];

    const needle = query.trim().toLowerCase();

    return data.reservations.filter((reservation) => {
      if (filter === "outstanding" && reservation.balance <= 0) {
        return false;
      }

      if (
        filter === "deposit_pending" &&
        reservation.paid >= reservation.requiredDeposit
      ) {
        return false;
      }

      if (filter === "paid" && reservation.balance > 0) {
        return false;
      }

      if (
        filter === "vacation" &&
        !reservation.selectedPaymentMode.toLowerCase().includes("vacation")
      ) {
        return false;
      }

      if (filter === "refunds" && reservation.refunded <= 0) {
        return false;
      }

      if (!needle) return true;

      return [
        reservation.code,
        reservation.guestName,
        reservation.apartmentTitles.join(" "),
        reservation.phone,
        reservation.email,
        reservation.paymentMethodLabel,
      ].some((value) => value.toLowerCase().includes(needle));
    });
  }, [data, filter, query]);

  if (!data && loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#158F91]" />
          <p className="mt-4 font-black">Se încarcă situația financiară...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] rounded-[2rem] bg-red-50 p-8 text-center text-red-700">
          <p className="font-black">{error || "Datele nu sunt disponibile."}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white"
          >
            Reîncearcă
          </button>
        </div>
      </main>
    );
  }

  const statCards = [
    {
      label: "Încasări azi",
      value: `${money(data.stats.todayRevenue)} lei`,
      icon: ArrowUpRight,
      tone: "bg-emerald-50 text-emerald-700",
      note: "Plăți confirmate astăzi",
    },
    {
      label: "Încasări luna aceasta",
      value: `${money(data.stats.monthRevenue)} lei`,
      icon: CircleDollarSign,
      tone: "bg-[#E9F8F8] text-[#158F91]",
      note: "Total încasat în luna curentă",
    },
    {
      label: "Sold total restant",
      value: `${money(data.stats.outstanding)} lei`,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-800",
      note: `${data.stats.unpaidReservations} rezervări cu sold`,
    },
    {
      label: "Avansuri neacoperite",
      value: `${money(data.stats.requiredDepositsPending)} lei`,
      icon: CreditCard,
      tone: "bg-red-50 text-red-700",
      note: "Sumă necesară pentru confirmări",
    },
    {
      label: "Rambursări luna aceasta",
      value: `${money(data.stats.monthRefunded)} lei`,
      icon: ArrowDownRight,
      tone: "bg-violet-50 text-violet-700",
      note: "Refunduri confirmate",
    },
    {
      label: "Grad de încasare",
      value: `${data.stats.collectionRate}%`,
      icon: CheckCircle2,
      tone: "bg-blue-50 text-blue-700",
      note: `${data.stats.fullyPaidReservations} rezervări achitate integral`,
    },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <section className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-[0_24px_70px_rgba(7,27,45,.18)] sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#D9B56D]">
                <WalletCards size={15} /> Breeze PMS • Financial Center
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Situația financiară
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Încasări, avansuri, solduri și rambursări din toate rezervările,
                într-un singur loc.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => exportCsv(filteredReservations)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#D9B56D] px-5 py-3 text-sm font-black text-[#071B2D]"
              >
                <Download size={17} /> Export CSV
              </button>

              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Actualizează
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}
                >
                  <Icon size={20} />
                </span>
                <p className="mt-4 text-2xl font-black text-[#071B2D]">
                  {card.value}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[.12em] text-gray-500">
                  {card.label}
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-gray-400">
                  {card.note}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">
                  Registru financiar
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                  Rezervări și solduri
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:min-w-[260px] rounded-2xl bg-[#FAFAF7] px-4 py-3 ring-1 ring-black/5">
                  <Search size={16} className="text-gray-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Client, cod, apartament..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["all", "Toate"],
                ["outstanding", "Sold restant"],
                ["deposit_pending", "Avans neacoperit"],
                ["paid", "Achitate integral"],
                ["vacation", "Card vacanță"],
                ["refunds", "Cu rambursări"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value as FilterValue)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-black transition ${
                    filter === value
                      ? "bg-[#071B2D] text-white"
                      : "bg-[#FAFAF7] text-gray-600 hover:bg-[#E9F8F8]"
                  }`}
                >
                  {value === "all" ? null : <Filter size={12} />}
                  {label}
                </button>
              ))}
            </div>

            <div className="mobile-scroll-x mt-5 overflow-x-auto rounded-[1.4rem] border border-black/5">
              <div className="min-w-[1040px]">
                <div className="grid grid-cols-[1.15fr_1fr_.85fr_.75fr_.75fr_.8fr_.65fr] bg-[#071B2D] px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                  <span>Rezervare</span>
                  <span>Sejur</span>
                  <span>Metodă</span>
                  <span className="text-right">Total</span>
                  <span className="text-right">Achitat</span>
                  <span className="text-right">Sold</span>
                  <span className="text-right">Status</span>
                </div>

                {filteredReservations.length === 0 ? (
                  <div className="p-8 text-center text-sm font-semibold text-gray-500">
                    Nu există rezervări pentru filtrul selectat.
                  </div>
                ) : (
                  filteredReservations.map((reservation) => (
                    <button
                      key={reservation.code}
                      type="button"
                      onClick={() =>
                        setSelectedReservation(
                          createDrawerReservation(reservation)
                        )
                      }
                      className="grid w-full grid-cols-[1.15fr_1fr_.85fr_.75fr_.75fr_.8fr_.65fr] items-center gap-3 border-t border-black/5 px-4 py-4 text-left text-sm transition hover:bg-[#FAFAF7]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B2D]">
                          {reservation.guestName}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-gray-500">
                          {reservation.code} • {reservation.apartmentTitles.join(" + ")}
                        </p>
                      </div>

                      <div>
                        <p className="font-black text-[#071B2D]">
                          {formatDate(reservation.checkIn)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          până la {formatDate(reservation.checkOut)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B2D]">
                          {reservation.paymentMethodLabel}
                        </p>
                        {reservation.selectedPaymentMode
                          .toLowerCase()
                          .includes("vacation") ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#158F91]">
                            <TicketCheck size={13} /> Card vacanță
                          </p>
                        ) : null}
                      </div>

                      <p className="text-right font-black text-[#071B2D]">
                        {money(reservation.total)} lei
                      </p>

                      <p className="text-right font-black text-emerald-700">
                        {money(reservation.paid)} lei
                      </p>

                      <p
                        className={`text-right font-black ${
                          reservation.balance > 0
                            ? "text-orange-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {money(reservation.balance)} lei
                      </p>

                      <div className="flex justify-end">
                        <span
                          className={`rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] ring-1 ${paymentStatusClasses(
                            reservation.paymentStatus
                          )}`}
                        >
                          {paymentStatusLabel(reservation.paymentStatus)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-gray-400">
              {filteredReservations.length} rezervări afișate • Click pe un rând
              pentru detalii rapide.
            </p>
          </div>

          <div className="grid content-start gap-5">
            <section className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">
                Încasări pe metode
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                Distribuția plăților
              </h2>

              <div className="mt-5 grid gap-3">
                {data.paymentMethods.length === 0 ? (
                  <div className="rounded-2xl bg-[#FAFAF7] p-5 text-sm font-semibold text-gray-500">
                    Nu există încă plăți confirmate.
                  </div>
                ) : (
                  data.paymentMethods.map((method) => {
                    const share =
                      data.stats.totalRevenue > 0
                        ? Math.round(
                            (method.amount / data.stats.totalRevenue) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={method.label}
                        className="rounded-2xl bg-[#FAFAF7] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#158F91] shadow-sm">
                              {method.label.includes("vacanță") ? (
                                <TicketCheck size={17} />
                              ) : (
                                <CreditCard size={17} />
                              )}
                            </span>
                            <p className="truncate font-black text-[#071B2D]">
                              {method.label}
                            </p>
                          </div>
                          <strong className="shrink-0 text-[#071B2D]">
                            {money(method.amount)} lei
                          </strong>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#158F91]"
                            style={{ width: `${Math.max(2, share)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-right text-[10px] font-black text-gray-400">
                          {share}% din totalul încasat
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#158F91]">
                Prioritate financiară
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                Solduri apropiate de check-in
              </h2>

              <div className="mt-5 grid gap-3">
                {data.reservations
                  .filter((reservation) => reservation.balance > 0)
                  .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
                  .slice(0, 6)
                  .map((reservation) => (
                    <button
                      key={reservation.code}
                      type="button"
                      onClick={() =>
                        setSelectedReservation(
                          createDrawerReservation(reservation)
                        )
                      }
                      className="flex items-center justify-between gap-4 rounded-2xl bg-[#FAFAF7] p-4 text-left transition hover:bg-[#E9F8F8]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B2D]">
                          {reservation.guestName}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-gray-500">
                          {reservation.code} • check-in {formatDate(reservation.checkIn)}
                        </p>
                      </div>
                      <strong className="shrink-0 text-orange-700">
                        {money(reservation.balance)} lei
                      </strong>
                    </button>
                  ))}

                {data.reservations.filter(
                  (reservation) => reservation.balance > 0
                ).length === 0 ? (
                  <div className="rounded-2xl bg-emerald-50 p-5 text-center text-emerald-800">
                    <CheckCircle2 className="mx-auto" />
                    <p className="mt-2 font-black">
                      Nu există solduri restante.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            <Link
              href="/admin/calendar"
              className="inline-flex items-center justify-center gap-2 rounded-[1.4rem] bg-[#071B2D] px-5 py-4 text-sm font-black text-white shadow-sm"
            >
              <CalendarDays size={17} /> Vezi Calendarul Operațional
            </Link>
          </div>
        </section>
      </div>

      <ReservationDrawer
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
      />
    </main>
  );
}
