"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { subscribeAdminLiveEvents } from "@/lib/admin/admin-live-events";
import ReservationDrawer, {
  type CalendarReservationSummary,
} from "@/components/admin/calendar/ReservationDrawer";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Filter,
  KeyRound,
  RotateCcw,
  Search,
  TicketCheck,
  WalletCards,
} from "lucide-react";

type Apartment = {
  slug: string;
  title: string;
  shortTitle: string;
  floor: string;
  guests: number;
};

type Reservation = CalendarReservationSummary;

type BookingEvent = {
  id: string;
  apartmentSlug: string;
  start: string;
  end: string;
  summary: string;
  provider: string;
};

type ApiData = {
  ok: boolean;
  apartments: Apartment[];
  reservations: Reservation[];
  bookingEvents: BookingEvent[];
};

const DAY_WIDTHS = {
  7: 92,
  14: 58,
  month: 34,
} as const;



type CalendarView = 7 | 14 | "month";


type CalendarFilter =
  | "all"
  | "arrivals"
  | "departures"
  | "balance"
  | "vacation"
  | "children"
  | "self_checkin"
  | "transfer";

function hasRequest(reservation: Reservation, type: string) {
  return reservation.requests.some((request) => request.type === type);
}

function isVacationPayment(reservation: Reservation) {
  return reservation.paymentMode.toLowerCase().includes("vacation");
}


function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shortDate(value: string) {
  const [, month, day] = value.split("-");
  return `${day}.${month}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(a: string, b: string) {
  return Math.round(
    (new Date(`${b}T12:00:00`).getTime() -
      new Date(`${a}T12:00:00`).getTime()) /
      86_400_000
  );
}

function money(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function paymentLabel(mode: string) {
  if (mode.includes("vacation")) return "Card vacanță";
  if (mode.includes("bank")) return "Transfer";
  if (mode.includes("full")) return "Card integral";
  if (mode.includes("card")) return "Card bancar";
  return "Plată";
}

function reservationStyle(reservation: Reservation) {
  if (reservation.lifecycleStatus === "cancel_requested") {
    return "border-red-300 bg-red-100 text-red-950";
  }
  if (reservation.paymentStatus === "paid") {
    return "border-emerald-300 bg-emerald-100 text-emerald-950";
  }
  if (reservation.paymentStatus === "partially_paid") {
    return "border-amber-300 bg-amber-100 text-amber-950";
  }
  return "border-orange-300 bg-orange-100 text-orange-950";
}

export default function OperationalCalendar() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<CalendarView>(14);
  const [startDate, setStartDate] = useState(() => startOfDay(new Date()));
  const [query, setQuery] = useState("");
  const [onlyBalance, setOnlyBalance] = useState(false);
  const [activeFilter, setActiveFilter] =
    useState<CalendarFilter>("all");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  async function load() {
    try {
      const response = await fetch("/api/admin/operational-calendar", {
        cache: "no-store",
      });
      const next = (await response.json()) as ApiData;
      if (!response.ok || !next.ok) throw new Error("Calendarul nu a putut fi încărcat.");
      setData(next);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "A apărut o eroare.");
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

  const days = useMemo(() => {
    if (view !== "month") return view;

    return new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ).getDate();
  }, [startDate, view]);

  const calendarStart = useMemo(() => {
    if (view !== "month") return startDate;

    return new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );
  }, [startDate, view]);

  const visibleDates = useMemo(
    () =>
      Array.from(
        { length: days },
        (_, index) => addDays(calendarStart, index)
      ),
    [calendarStart, days]
  );

  const sidebarWidth = view === "month" ? 138 : 176;

  const dayWidth =
    view === "month"
      ? `calc((100vw - ${sidebarWidth + 44}px) / ${days})`
      : `${DAY_WIDTHS[view]}px`;

  const rowHeight =
    view === "month" ? 48 : view === 14 ? 60 : 68;

  const headerHeight =
    view === "month" ? 44 : view === 14 ? 52 : 58;

  const today = dateKey(new Date());

  const filteredReservations = useMemo(() => {
    if (!data) return [];

    const needle = query.trim().toLowerCase();

    return data.reservations.filter((reservation) => {
      if (onlyBalance && reservation.balance <= 0) return false;

      if (activeFilter === "arrivals" && reservation.checkIn !== today) {
        return false;
      }

      if (
        activeFilter === "departures" &&
        reservation.checkOut !== today
      ) {
        return false;
      }

      if (activeFilter === "balance" && reservation.balance <= 0) {
        return false;
      }

      if (
        activeFilter === "vacation" &&
        !isVacationPayment(reservation)
      ) {
        return false;
      }

      if (
        activeFilter === "children" &&
        reservation.children <= 0
      ) {
        return false;
      }

      if (
        activeFilter === "self_checkin" &&
        !hasRequest(reservation, "self_checkin")
      ) {
        return false;
      }

      if (
        activeFilter === "transfer" &&
        !hasRequest(reservation, "transfer")
      ) {
        return false;
      }

      if (!needle) return true;

      return [
        reservation.guestName,
        reservation.code,
        reservation.apartmentTitle,
        reservation.phone,
      ].some((value) =>
        value.toLowerCase().includes(needle)
      );
    });
  }, [activeFilter, data, onlyBalance, query, today]);

  const filteredBookingEvents = useMemo(() => {
    if (!data || onlyBalance || activeFilter !== "all") return [];

    const needle = query.trim().toLowerCase();
    if (!needle) return data.bookingEvents;

    return data.bookingEvents.filter((event) =>
      [event.summary, event.provider, "booking"].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [activeFilter, data, onlyBalance, query]);

  const rangeEnd = dateKey(addDays(calendarStart, days));
  const totalWidth =
    view === "month" ? "100%" : days * Number.parseInt(dayWidth, 10);
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1800px]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#158F91]">
              Operațiuni
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#071B2D] sm:text-4xl">
              Calendar operațional
            </h1>
            <p className="mt-2 text-sm font-semibold text-gray-500">
              Rezervări, plăți și sosiri pentru toate apartamentele.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/rezervare"
              className="rounded-full bg-[#D9B56D] px-5 py-3 text-sm font-black text-[#071B2D] shadow-lg"
            >
              + Rezervare nouă
            </Link>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-[#071B2D]"
            >
              <RotateCcw size={16} /> Actualizează
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-[2rem] border border-black/5 bg-white p-4 shadow-[0_24px_80px_rgba(7,27,45,0.08)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setStartDate(
                    view === "month"
                      ? new Date(
                          startDate.getFullYear(),
                          startDate.getMonth() - 1,
                          1
                        )
                      : addDays(startDate, -days)
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/10"
                aria-label="Perioada anterioară"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setStartDate(
                    view === "month"
                      ? new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          1
                        )
                      : startOfDay(new Date())
                  )
                }
                className="rounded-xl bg-[#071B2D] px-5 py-3 text-sm font-black text-white"
              >
                Astăzi
              </button>
              <button
                type="button"
                onClick={() =>
                  setStartDate(
                    view === "month"
                      ? new Date(
                          startDate.getFullYear(),
                          startDate.getMonth() + 1,
                          1
                        )
                      : addDays(startDate, days)
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/10"
                aria-label="Perioada următoare"
              >
                <ArrowRight size={18} />
              </button>
              {([7, 14, "month"] as CalendarView[]).map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => {
                    setView(value);

                    if (value === "month") {
                      setStartDate(
                        new Date(
                          startDate.getFullYear(),
                          startDate.getMonth(),
                          1
                        )
                      );
                    }
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-black ${
                    view === value
                      ? "bg-[#E9F8F8] text-[#071B2D] ring-1 ring-[#158F91]/30"
                      : "bg-[#FAFAF7] text-gray-500"
                  }`}
                >
                  {value === "month" ? "Lună" : `${value} zile`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative w-full min-w-0 sm:w-auto sm:min-w-[260px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nume, cod, telefon..."
                  className="w-full rounded-xl border border-black/10 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#158F91]"
                />
              </label>
              <button
                type="button"
                onClick={() => setOnlyBalance((value) => !value)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${
                  onlyBalance
                    ? "bg-amber-100 text-amber-950 ring-1 ring-amber-300"
                    : "border border-black/10 bg-white text-[#071B2D]"
                }`}
              >
                <Filter size={16} /> Sold restant
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", "Toate"],
              ["arrivals", "Sosiri azi"],
              ["departures", "Plecări azi"],
              ["balance", "Sold restant"],
              ["vacation", "Card vacanță"],
              ["children", "Cu copii"],
              ["self_checkin", "Self check-in"],
              ["transfer", "Transfer"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setActiveFilter(value as CalendarFilter)
                }
                className={`rounded-full px-3 py-2 text-[11px] font-black transition ${
                  activeFilter === value
                    ? "bg-[#071B2D] text-white"
                    : "bg-[#FAFAF7] text-gray-600 hover:bg-[#E9F8F8]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-gray-600">
            <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-emerald-300" /> Achitat</span>
            <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-amber-300" /> Avans plătit</span>
            <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-orange-300" /> În așteptarea plății</span>
            <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-red-300" /> Necesită intervenție</span>
            <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-violet-400" /> Booking.com</span>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl bg-red-50 p-5 text-sm font-bold text-red-700">{error}</div>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(7,27,45,0.08)]">
          {loading ? (
            <div className="p-10 text-center text-sm font-bold text-gray-500">Se încarcă calendarul...</div>
          ) : (
            <div className="max-h-[72vh] overflow-auto">
              <div
                className="relative grid"
                style={{
                  gridTemplateColumns:
                    view === "month"
                      ? `${sidebarWidth}px minmax(0, 1fr)`
                      : `${sidebarWidth}px ${totalWidth}px`,
                  minWidth:
                    view === "month"
                      ? "100%"
                      : sidebarWidth + (totalWidth as number),
                }}
              >
                <div className="sticky left-0 top-0 z-40 flex items-center border-b border-r border-black/5 bg-[#071B2D] px-4 text-white" style={{ height: headerHeight }}>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#D9B56D]">Unități</p>
                    <p className="mt-1 font-black">Breeze Villa</p>
                  </div>
                </div>

                <div className="sticky top-0 z-30 grid border-b border-black/5 bg-white" style={{ gridTemplateColumns: `repeat(${days}, ${dayWidth})`, height: headerHeight }}>
                  {visibleDates.map((date) => {
                    const key = dateKey(date);
                    const isToday = key === today;
                    return (
                      <div key={key} className={`flex flex-col items-center justify-center border-r border-black/5 ${isToday ? "bg-[#FFF8E8]" : ""}`}>
                        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-400">
                          {new Intl.DateTimeFormat("ro-RO", { weekday: "short" }).format(date)}
                        </span>
                        <strong
                          className={`${
                            view === "month"
                              ? "mt-0 text-[11px]"
                              : "mt-1 text-lg"
                          } ${
                            isToday
                              ? "text-[#B7791F]"
                              : "text-[#071B2D]"
                          }`}
                        >
                          {date.getDate()}
                        </strong>
                        {view !== "month" ? (
                          <span className="text-[10px] font-bold uppercase text-gray-400">
                            {new Intl.DateTimeFormat("ro-RO", {
                              month: "short",
                            }).format(date)}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {(data?.apartments ?? []).map((apartment, rowIndex) => {
                  const rowReservations = filteredReservations.filter(
                    (reservation) => reservation.apartmentSlug === apartment.slug &&
                      reservation.checkIn < rangeEnd &&
                      reservation.checkOut > dateKey(calendarStart)
                  );
                  const rowBookingEvents = filteredBookingEvents.filter(
                    (event) => event.apartmentSlug === apartment.slug &&
                      event.start < rangeEnd &&
                      event.end > dateKey(calendarStart)
                  );

                  return (
                    <div key={apartment.slug} className="contents">
                      <div className={`sticky left-0 z-20 border-b border-r border-black/5 px-3 py-1.5 ${rowIndex % 2 ? "bg-[#FAFAF7]" : "bg-white"}`} style={{ minHeight: rowHeight }}>
                        <p className="font-black leading-5 text-[#071B2D]">{apartment.shortTitle}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">{apartment.floor}</p>
                      </div>

                      <div className={`relative border-b border-black/5 ${rowIndex % 2 ? "bg-[#FAFAF7]" : "bg-white"}`} style={{ minHeight: rowHeight }}>
                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${days}, ${dayWidth})` }}>
                          {visibleDates.map((date) => (
                            <div key={dateKey(date)} className={`border-r border-black/5 ${dateKey(date) === today ? "bg-[#FFF8E8]/55" : ""}`} />
                          ))}
                        </div>

                        {today >= dateKey(calendarStart) && today < rangeEnd ? (
                          <div
                            className="pointer-events-none absolute inset-y-0 z-10 w-px bg-red-400"
                            style={{ left: view === "month"
                    ? `calc(${diffDays(dateKey(calendarStart), today)} * ${dayWidth} + (${dayWidth} / 2))`
                    : diffDays(dateKey(calendarStart), today) *
                        Number.parseInt(dayWidth, 10) +
                      Number.parseInt(dayWidth, 10) / 2 }}
                          />
                        ) : null}

                        {rowReservations.map((reservation) => {
                          const visibleStart = reservation.checkIn < dateKey(calendarStart) ? dateKey(calendarStart) : reservation.checkIn;
                          const visibleEnd = reservation.checkOut > rangeEnd ? rangeEnd : reservation.checkOut;
                          const startOffset = diffDays(
                            dateKey(calendarStart),
                            visibleStart
                          );
                          const spanDays = Math.max(
                            1,
                            diffDays(visibleStart, visibleEnd)
                          );

                          const left =
                            view === "month"
                              ? `calc(${startOffset} * ${dayWidth} + 2px)`
                              : startOffset *
                                  Number.parseInt(dayWidth, 10) +
                                3;

                          const width =
                            view === "month"
                              ? `calc(${spanDays} * ${dayWidth} - 4px)`
                              : spanDays *
                                  Number.parseInt(dayWidth, 10) -
                                6;

                          return (
                            <button
                              key={reservation.id}
                              type="button"
                              onClick={() =>
                                setSelectedReservation(reservation)
                              }
                              onDoubleClick={() => {
                                window.location.assign(
                                  `/admin/reservations/${reservation.code}`
                                );
                              }}
                              className={`group absolute z-20 overflow-visible rounded-lg border px-2 py-1.5 text-left shadow-sm transition hover:z-50 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#158F91] ${reservationStyle(reservation)}`}
                              title="Click: detalii rapide • Dublu click: dosarul complet"
                              style={{
                                left,
                                width,
                                top: view === "month" ? 6 : 8,
                                height: view === "month" ? 36 : 46,
                              }}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-xs font-black">
                                    {reservation.guestName}
                                  </p>
                                  {view !== "month" ? (
                                    <span className="shrink-0 text-[9px] font-black">
                                      {reservation.code}
                                    </span>
                                  ) : null}
                                </div>
                                {view !== "month" ? (
                                  <>
                                    <p className="mt-0.5 truncate text-[9px] font-bold opacity-75">
                                      {reservation.checkIn.slice(5)} →{" "}
                                      {reservation.checkOut.slice(5)}
                                    </p>

                                    <div className="mt-0.5 flex min-w-0 items-center gap-1 overflow-hidden text-[9px] font-black">
                                      {reservation.balance > 0 ? (
                                        <>
                                          <WalletCards size={10} />
                                          <span className="truncate">
                                            Sold {money(reservation.balance)}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 size={10} />
                                          <span>Achitat</span>
                                        </>
                                      )}

                                      {isVacationPayment(reservation) ? (
                                        <TicketCheck
                                          size={10}
                                          aria-label="Card de vacanță"
                                        />
                                      ) : null}

                                      {reservation.children > 0 ? (
                                        <Baby
                                          size={10}
                                          aria-label="Copii"
                                        />
                                      ) : null}

                                      {hasRequest(
                                        reservation,
                                        "self_checkin"
                                      ) ? (
                                        <KeyRound
                                          size={10}
                                          aria-label="Self check-in"
                                        />
                                      ) : null}

                                      {hasRequest(
                                        reservation,
                                        "early_checkin"
                                      ) ||
                                      hasRequest(
                                        reservation,
                                        "late_checkout"
                                      ) ? (
                                        <Clock3
                                          size={10}
                                          aria-label="Oră specială"
                                        />
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                              </div>

                              <div className="invisible absolute left-1/2 top-[88px] z-[100] w-80 -translate-x-1/2 rounded-2xl bg-[#071B2D] p-5 text-white opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#D9B56D]">{reservation.code}</p>
                                <p className="mt-2 text-lg font-black">{reservation.guestName}</p>
                                <div className="mt-4 grid gap-2 text-xs font-semibold text-white/75">
                                  <p>
                                    {reservation.checkIn} →{" "}
                                    {reservation.checkOut}
                                  </p>
                                  <p>
                                    {reservation.adults} adulți •{" "}
                                    {reservation.children} copii
                                  </p>
                                  <p>
                                    Metodă:{" "}
                                    {paymentLabel(
                                      reservation.paymentMode
                                    )}
                                  </p>
                                  <p>
                                    Total: {money(reservation.total)} lei
                                  </p>
                                  <p>
                                    Încasat: {money(reservation.paid)} lei
                                  </p>
                                  <p>
                                    Sold: {money(reservation.balance)} lei
                                  </p>

                                  {reservation.requests.length > 0 ? (
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                      {reservation.requests.map(
                                        (request, index) => (
                                          <span
                                            key={`${request.type}-${index}`}
                                            className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white"
                                          >
                                            {request.type.replaceAll(
                                              "_",
                                              " "
                                            )}
                                            {request.desiredTime
                                              ? ` ${request.desiredTime}`
                                              : ""}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-center text-[10px] font-black text-white">
                                  Click pentru detalii rapide
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {rowBookingEvents.map((event) => {
                          const visibleStart = event.start < dateKey(calendarStart) ? dateKey(calendarStart) : event.start;
                          const visibleEnd = event.end > rangeEnd ? rangeEnd : event.end;
                          const startOffset = diffDays(dateKey(calendarStart), visibleStart);
                          const spanDays = Math.max(1, diffDays(visibleStart, visibleEnd));
                          const left = view === "month"
                            ? `calc(${startOffset} * ${dayWidth} + 2px)`
                            : startOffset * Number.parseInt(dayWidth, 10) + 3;
                          const width = view === "month"
                            ? `calc(${spanDays} * ${dayWidth} - 10px)`
                            : spanDays * Number.parseInt(dayWidth, 10) - 6;

                          return (
                            <div
                              key={`booking:${event.id}`}
                              className="absolute z-30 overflow-hidden rounded-lg border border-violet-400 bg-violet-100 px-2 py-1.5 text-left text-violet-950 shadow-sm"
                              title={`Booking.com • ${event.summary} • ocupat ${event.start} – ${event.end} (check-out) • liber din ${event.end}`}
                              style={{
                                left,
                                width,
                                top: view === "month" ? 6 : 8,
                                height: view === "month" ? 36 : 46,
                              }}
                            >
                              <p className="truncate text-xs font-black">Booking.com</p>
                              {view !== "month" ? (
                                <p className="mt-0.5 truncate text-[9px] font-bold opacity-75">
                                  {shortDate(event.start)} → check-out {shortDate(event.end)} · liber din {shortDate(event.end)}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><CalendarDays className="text-[#158F91]" size={19} /><p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-gray-400">Rezervări vizibile</p><p className="mt-1 text-2xl font-black text-[#071B2D]">{filteredReservations.filter((item) => item.checkIn < rangeEnd && item.checkOut > dateKey(calendarStart)).length}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><CreditCard className="text-[#158F91]" size={19} /><p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-gray-400">Sold în perioada afișată</p><p className="mt-1 text-2xl font-black text-[#071B2D]">{money(filteredReservations.filter((item) => item.checkIn < rangeEnd && item.checkOut > dateKey(calendarStart)).reduce((sum, item) => sum + item.balance, 0))} lei</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><Filter className="text-[#158F91]" size={19} /><p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-gray-400">Filtru activ</p><p className="mt-1 text-lg font-black text-[#071B2D]">{onlyBalance
                ? "Doar sold restant"
                : activeFilter !== "all"
                  ? "Filtru rapid activ"
                  : query
                    ? "Căutare activă"
                    : "Toate rezervările"}</p></div>
        </div>
      </div>

      <ReservationDrawer
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
      />
    </main>
  );
}
