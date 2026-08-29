"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BedDouble,
  CalendarCheck2,
  CalendarRange,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Gauge,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { subscribeAdminLiveEvents } from "@/lib/admin/admin-live-events";

type PeriodKey = "30d" | "90d" | "season" | "all";

type AnalyticsData = {
  generatedAt: string;
  period: PeriodKey;
  range: { start: string; end: string };
  stats: {
    todayRevenue: number;
    monthRevenue: number;
    yearRevenue: number;
    periodRevenue: number;
    refundsInRange: number;
    outstanding: number;
    occupancyRate: number;
    occupiedNights: number;
    availableNights: number;
    checkInsToday: number;
    checkOutsToday: number;
    reservationsInPeriod: number;
    averageStay: number;
    directRevenueValue: number;
  };
  forecast: {
    days: number;
    value: number;
    toCollect: number;
    occupancyRate: number;
    reservations: number;
  };
  apartmentPerformance: Array<{
    slug: string;
    title: string;
    revenue: number;
    reservations: number;
    occupiedNights: number;
    occupancyRate: number;
    adr: number;
    directNights: number;
    bookingNights: number;
  }>;
  monthlyTrend: Array<{
    key: string;
    label: string;
    revenue: number;
    reservations: number;
  }>;
  sources: {
    reservationCounts: {
      direct: number;
      booking: number;
      manual: number;
    };
    occupiedNights: {
      direct: number;
      booking: number;
    };
  };
  opportunities: Array<{
    level: "info" | "attention" | "critical";
    title: string;
    detail: string;
    href: string;
  }>;
  bookingSync: {
    updatedAt: string | null;
    conflicts: number;
    externalEvents: number;
  };
};

const periodOptions: Array<{ value: PeriodKey; label: string }> = [
  { value: "30d", label: "30 zile" },
  { value: "90d", label: "90 zile" },
  { value: "season", label: "Sezon" },
  { value: "all", label: "Tot istoricul" },
];

function money(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function periodLabel(period: PeriodKey) {
  return periodOptions.find((item) => item.value === period)?.label ?? "30 zile";
}

function dateTime(value: string | null) {
  if (!value) return "Niciodată";

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Bucharest",
  }).format(new Date(value));
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof WalletCards;
  tone: string;
}) {
  return (
    <article className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon size={20} />
        </span>
        <span className="rounded-full bg-[#FAFAF7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-gray-400">
          live
        </span>
      </div>
      <p className="mt-4 text-2xl font-black text-[#071B2D]">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-gray-500">{detail}</p>
    </article>
  );
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(selectedPeriod = period) {
    setError("");

    try {
      const response = await fetch(
        `/api/admin/analytics?period=${selectedPeriod}`,
        { cache: "no-store" }
      );

      const payload = (await response.json()) as AnalyticsData & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Analytics nu a putut fi încărcat.");
      }

      setData(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Analytics nu a putut fi încărcat."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(period);

    const intervalId = window.setInterval(() => void load(period), 60_000);
    const unsubscribe = subscribeAdminLiveEvents(() => void load(period));
    const onFocus = () => void load(period);

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [period]);

  const maxMonthlyRevenue = useMemo(
    () => Math.max(1, ...(data?.monthlyTrend.map((item) => item.revenue) ?? [1])),
    [data]
  );

  const maxApartmentRevenue = useMemo(
    () =>
      Math.max(
        1,
        ...(data?.apartmentPerformance.map((item) => item.revenue) ?? [1])
      ),
    [data]
  );

  if (loading && !data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 font-black text-[#071B2D] shadow-sm ring-1 ring-black/5">
          <Loader2 className="animate-spin" size={20} />
          Se calculează indicatorii...
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1700px]">
        <header className="rounded-[2rem] bg-[#071B2D] p-6 text-white shadow-[0_24px_70px_rgba(7,27,45,.18)] sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#D9B56D]">
                <BarChart3 size={15} /> Breeze PMS • Business Analytics
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Cum performează Breeze Villa
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Venituri, ocupare, apartamente și oportunități calculate din rezervările reale și Booking Sync.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setPeriod(option.value);
                  }}
                  className={`rounded-full px-4 py-2.5 text-xs font-black transition ${
                    period === option.value
                      ? "bg-[#D9B56D] text-[#071B2D]"
                      : "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15"
                  }`}
                >
                  {option.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => void load()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15"
                aria-label="Actualizează"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {data ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  Forecast 30 zile
                </p>
                <p className="mt-2 text-2xl font-black">
                  {money(data.forecast.value)} lei
                </p>
                <p className="mt-1 text-xs font-semibold text-white/55">
                  {data.forecast.reservations} rezervări confirmate
                </p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  Ocupare viitoare
                </p>
                <p className="mt-2 text-2xl font-black">
                  {percent(data.forecast.occupancyRate)}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/55">
                  următoarele 30 de zile
                </p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  De încasat în forecast
                </p>
                <p className="mt-2 text-2xl font-black">
                  {money(data.forecast.toCollect)} lei
                </p>
                <p className="mt-1 text-xs font-semibold text-white/55">
                  sold din rezervările viitoare
                </p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  Booking Sync
                </p>
                <p className="mt-2 text-lg font-black">
                  {data.bookingSync.conflicts > 0
                    ? `${data.bookingSync.conflicts} conflicte`
                    : "Sincronizat"}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/55">
                  {dateTime(data.bookingSync.updatedAt)}
                </p>
              </div>
            </div>
          ) : null}
        </header>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        {data ? (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
              <KpiCard
                label="Încasări azi"
                value={`${money(data.stats.todayRevenue)} lei`}
                detail="Plăți înregistrate astăzi."
                icon={CircleDollarSign}
                tone="bg-emerald-50 text-emerald-700"
              />
              <KpiCard
                label="Încasări luna aceasta"
                value={`${money(data.stats.monthRevenue)} lei`}
                detail="Sume efectiv încasate, nu doar rezervate."
                icon={WalletCards}
                tone="bg-[#E9F8F8] text-[#158F91]"
              />
              <KpiCard
                label={`Încasări • ${periodLabel(period)}`}
                value={`${money(data.stats.periodRevenue)} lei`}
                detail={`${data.stats.reservationsInPeriod} rezervări în perioada selectată.`}
                icon={TrendingUp}
                tone="bg-blue-50 text-blue-700"
              />
              <KpiCard
                label="Grad de ocupare"
                value={percent(data.stats.occupancyRate)}
                detail={`${data.stats.occupiedNights} din ${data.stats.availableNights} nopți-unitate.`}
                icon={Gauge}
                tone="bg-violet-50 text-violet-700"
              />
              <KpiCard
                label="Sold restant"
                value={`${money(data.stats.outstanding)} lei`}
                detail="Rezervări active și viitoare."
                icon={CreditCard}
                tone="bg-orange-50 text-orange-700"
              />
              <KpiCard
                label="Durată medie sejur"
                value={`${data.stats.averageStay} nopți`}
                detail="Calculată pentru perioada selectată."
                icon={Clock3}
                tone="bg-amber-50 text-amber-800"
              />
              <KpiCard
                label="Check-in azi"
                value={String(data.stats.checkInsToday)}
                detail="Sosiri programate pentru astăzi."
                icon={CalendarCheck2}
                tone="bg-cyan-50 text-cyan-700"
              />
              <KpiCard
                label="Check-out azi"
                value={String(data.stats.checkOutsToday)}
                detail="Apartamente ce intră în fluxul de curățenie."
                icon={CalendarRange}
                tone="bg-slate-100 text-slate-700"
              />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#158F91]">
                      Evoluție financiară
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                      Încasări în ultimele 6 luni
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#FAFAF7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                    tranzacții plătite
                  </span>
                </div>

                <div className="mt-7 grid h-64 grid-cols-6 items-end gap-3">
                  {data.monthlyTrend.map((item) => {
                    const height = Math.max(5, Math.round((item.revenue / maxMonthlyRevenue) * 100));
                    return (
                      <div key={item.key} className="flex h-full flex-col justify-end">
                        <div className="mb-2 text-center">
                          <p className="text-[10px] font-black text-[#071B2D]">
                            {money(item.revenue)}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400">
                            {item.reservations} rez.
                          </p>
                        </div>
                        <div className="flex h-44 items-end rounded-2xl bg-[#FAFAF7] p-1.5">
                          <div
                            className="w-full rounded-xl bg-[#158F91] transition-all"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <p className="mt-2 text-center text-[10px] font-black uppercase text-gray-500">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#158F91]">
                  Canale de vânzare
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                  Direct vs. Booking
                </h2>

                {(() => {
                  const direct = data.sources.occupiedNights.direct;
                  const booking = data.sources.occupiedNights.booking;
                  const total = Math.max(1, direct + booking);
                  const directShare = Math.round((direct / total) * 100);
                  const bookingShare = 100 - directShare;

                  return (
                    <div className="mt-6">
                      <div className="overflow-hidden rounded-full bg-gray-100">
                        <div className="flex h-5 w-full">
                          <div className="bg-[#158F91]" style={{ width: `${directShare}%` }} />
                          <div className="bg-[#D9B56D]" style={{ width: `${bookingShare}%` }} />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[#E9F8F8] p-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#158F91]">
                            Direct
                          </p>
                          <p className="mt-2 text-2xl font-black text-[#071B2D]">
                            {directShare}%
                          </p>
                          <p className="mt-1 text-xs font-bold text-gray-500">
                            {direct} nopți rezervate
                          </p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-800">
                            Booking / iCal
                          </p>
                          <p className="mt-2 text-2xl font-black text-[#071B2D]">
                            {bookingShare}%
                          </p>
                          <p className="mt-1 text-xs font-bold text-gray-500">
                            {booking} nopți externe
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-[#FAFAF7] p-4 text-xs font-semibold leading-5 text-gray-500">
                        Booking iCal oferă perioade ocupate, dar nu transmite valoarea rezervării. Venitul Booking apare doar când rezervarea este introdusă și în Reservation Center.
                      </div>
                    </div>
                  );
                })()}
              </article>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#158F91]">
                      Performanță pe unitate
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                      Apartamente
                    </h2>
                  </div>
                  <BedDouble className="text-[#D9B56D]" size={24} />
                </div>

                <div className="mt-5 grid gap-3">
                  {data.apartmentPerformance.map((item, index) => (
                    <div key={item.slug} className="rounded-2xl bg-[#FAFAF7] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-black shadow-sm">
                              {index + 1}
                            </span>
                            <p className="truncate font-black text-[#071B2D]">{item.title}</p>
                          </div>
                          <p className="mt-2 text-xs font-semibold text-gray-500">
                            {item.occupiedNights} nopți • {item.reservations} rezervări • ADR {money(item.adr)} lei
                          </p>
                        </div>
                        <div className="flex shrink-0 items-end gap-5 sm:text-right">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400">
                              Ocupare
                            </p>
                            <p className="mt-1 font-black text-[#158F91]">{percent(item.occupancyRate)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400">
                              Valoare
                            </p>
                            <p className="mt-1 font-black text-[#071B2D]">{money(item.revenue)} lei</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-[#158F91]"
                          style={{ width: `${Math.max(2, Math.round((item.revenue / maxApartmentRevenue) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={19} className="text-[#D9B56D]" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#158F91]">
                      Business insights
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#071B2D]">
                      Oportunități
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {data.opportunities.map((item) => {
                    const classes =
                      item.level === "critical"
                        ? "bg-red-50 text-red-800 ring-red-200"
                        : item.level === "attention"
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-[#E9F8F8] text-[#0F696A] ring-[#158F91]/20";

                    return (
                      <Link
                        key={`${item.title}-${item.href}`}
                        href={item.href}
                        className={`group rounded-2xl p-4 ring-1 transition hover:-translate-y-0.5 ${classes}`}
                      >
                        <div className="flex items-start gap-3">
                          {item.level === "critical" ? (
                            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                          ) : (
                            <TrendingUp size={18} className="mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-black">{item.title}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 opacity-75">
                              {item.detail}
                            </p>
                          </div>
                          <ArrowRight size={15} className="mt-1 shrink-0 transition group-hover:translate-x-1" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
