"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Baby,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  KeyRound,
  Loader2,
  MessageCircle,
  Phone,
  RefreshCw,
  Sparkles,
  TicketCheck,
  UserCheck,
  WalletCards,
} from "lucide-react";
import ReservationDrawer, {
  type CalendarReservationSummary,
} from "@/components/admin/calendar/ReservationDrawer";
import {
  publishAdminLiveEvent,
  subscribeAdminLiveEvents,
} from "@/lib/admin/admin-live-events";

type OperationStatus = {
  cleaningStatus:
    | "not_scheduled"
    | "scheduled"
    | "in_progress"
    | "ready";
  checkInStatus: "pending" | "ready" | "completed";
  checkOutStatus: "pending" | "completed";
  internalNotes: string[];
};

type OperationReservation = {
  code: string;
  lifecycleStatus: string;
  paymentStatus: string;
  guestName: string;
  phone: string;
  email: string;
  apartmentTitles: string[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  total: number;
  paid: number;
  balance: number;
  paymentMode: string;
  requests: Array<{
    type: string;
    status: string;
    requestedTime?: string;
  }>;
  arrivalTime: string;
  departureTime: string;
  selfCheckIn: boolean;
  transfer: boolean;
  operations: OperationStatus;
  updatedAt: string;
};

type ApartmentState = {
  slug: string;
  title: string;
  status: "check_out" | "check_in" | "occupied" | "free";
  label: string;
  code: string | null;
};

type OperationsResponse = {
  generatedAt: string;
  selectedDate: string;
  stats: {
    arrivals: number;
    departures: number;
    cleaning: number;
    cleaningPending: number;
    cleaningInProgress: number;
    cleaningReady: number;
    outstandingCount: number;
    outstandingAmount: number;
  };
  arrivals: OperationReservation[];
  departures: OperationReservation[];
  cleaning: OperationReservation[];
  outstanding: OperationReservation[];
  apartmentState: ApartmentState[];
};

type ViewFilter =
  | "all"
  | "arrivals"
  | "departures"
  | "cleaning"
  | "payments";

function money(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  return digits.startsWith("40") ? digits : `40${digits}`;
}

function asDrawerReservation(
  item: OperationReservation
): CalendarReservationSummary {
  return {
    id: item.code,
    code: item.code,
    apartmentSlug: "",
    apartmentTitle: item.apartmentTitles.join(" • "),
    guestName: item.guestName,
    phone: item.phone,
    email: item.email,
    checkIn: item.checkIn,
    checkOut: item.checkOut,
    adults: item.adults,
    children: item.children,
    total: item.total,
    paid: item.paid,
    balance: item.balance,
    paymentMode: item.paymentMode,
    lifecycleStatus: item.lifecycleStatus,
    paymentStatus: item.paymentStatus,
    source: "direct",
    requests: item.requests.map((request) => ({
      type: request.type,
      status: request.status,
      desiredTime: request.requestedTime,
    })),
  };
}

function cleaningLabel(status: OperationStatus["cleaningStatus"]) {
  const labels = {
    not_scheduled: "De făcut",
    scheduled: "Programată",
    in_progress: "În lucru",
    ready: "Finalizată",
  };

  return labels[status];
}

function cleaningClasses(
  status: OperationStatus["cleaningStatus"]
) {
  if (status === "ready") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "in_progress") {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }

  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function Section({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#158F91]">
            {subtitle}
          </p>
          <h2 className="mt-1 text-xl font-black text-[#071B2D]">
            {title}
          </h2>
        </div>

        <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#071B2D] px-3 text-sm font-black text-white">
          {count}
        </span>
      </div>

      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-[#FAFAF7] p-5 text-center text-sm font-bold text-gray-500">
      {text}
    </div>
  );
}

export default function OperationsCenter() {
  const [data, setData] = useState<OperationsResponse | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [selectedReservation, setSelectedReservation] =
    useState<CalendarReservationSummary | null>(null);
  const [savingCode, setSavingCode] = useState("");

  async function load(date = selectedDate) {
    setError("");

    try {
      const query = date
        ? `?date=${encodeURIComponent(date)}`
        : "";

      const response = await fetch(
        `/api/admin/operations${query}`,
        {
          cache: "no-store",
        }
      );

      const payload =
        (await response.json()) as OperationsResponse & {
          message?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.message ??
            "Operations Center nu a putut fi încărcat."
        );
      }

      setData(payload);

      if (!selectedDate) {
        setSelectedDate(payload.selectedDate);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Operations Center nu a putut fi încărcat."
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

    const onFocus = () => void load();

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function updateOperation(
    code: string,
    patch: {
      cleaningStatus?: OperationStatus["cleaningStatus"];
      checkInStatus?: OperationStatus["checkInStatus"];
      checkOutStatus?: OperationStatus["checkOutStatus"];
      internalNote?: string;
    }
  ) {
    setSavingCode(code);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/operations/${encodeURIComponent(code)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch),
        }
      );

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ??
            "Statusul nu a putut fi actualizat."
        );
      }

      publishAdminLiveEvent({
        entity: "operation",
        code,
        action: "operations_updated",
      });

      await load();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Statusul nu a putut fi actualizat."
      );
    } finally {
      setSavingCode("");
    }
  }

  const visible = useMemo(() => {
    if (!data) {
      return {
        arrivals: [],
        departures: [],
        cleaning: [],
        outstanding: [],
      };
    }

    return {
      arrivals:
        filter === "all" || filter === "arrivals"
          ? data.arrivals
          : [],
      departures:
        filter === "all" || filter === "departures"
          ? data.departures
          : [],
      cleaning:
        filter === "all" || filter === "cleaning"
          ? data.cleaning
          : [],
      outstanding:
        filter === "all" || filter === "payments"
          ? data.outstanding
          : [],
    };
  }, [data, filter]);

  if (loading && !data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 font-black text-[#071B2D] shadow-sm ring-1 ring-black/5">
          <Loader2 className="animate-spin" size={20} />
          Se încarcă Operations Center...
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1800px]">
        <header className="rounded-[2rem] bg-[#071B2D] p-5 text-white shadow-xl sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D9B56D]">
                Breeze PMS • Operations Center
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Ziua operațională
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Sosiri, plecări, curățenie și încasări într-un
                singur loc.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="grid gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  Ziua
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedDate(value);
                    setLoading(true);
                    void load(value);
                  }}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white outline-none"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void load();
                }}
                className="mt-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white hover:text-[#071B2D]"
                aria-label="Actualizează"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {data ? (
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "Sosiri",
                  value: data.stats.arrivals,
                  icon: UserCheck,
                },
                {
                  label: "Plecări",
                  value: data.stats.departures,
                  icon: CalendarDays,
                },
                {
                  label: "Curățenii",
                  value: data.stats.cleaning,
                  icon: Sparkles,
                },
                {
                  label: "De încasat",
                  value: `${money(
                    data.stats.outstandingAmount
                  )} lei`,
                  icon: WalletCards,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10"
                  >
                    <div className="flex items-center gap-2 text-white/55">
                      <Icon size={16} />
                      <span className="text-[9px] font-black uppercase tracking-[0.12em]">
                        {item.label}
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-black text-white">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </header>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "Toate"],
            ["arrivals", "Sosiri"],
            ["departures", "Plecări"],
            ["cleaning", "Curățenie"],
            ["payments", "Încasări"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFilter(value as ViewFilter)
              }
              className={`rounded-full px-4 py-2.5 text-xs font-black transition ${
                filter === value
                  ? "bg-[#071B2D] text-white"
                  : "bg-white text-gray-600 ring-1 ring-black/5 hover:bg-[#E9F8F8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
          {filter === "all" || filter === "arrivals" ? (
            <Section
              title="Sosiri"
              subtitle="Check-in"
              count={visible.arrivals.length}
            >
              {visible.arrivals.length === 0 ? (
                <EmptyCard text="Nu există sosiri pentru această zi." />
              ) : (
                visible.arrivals.map((item) => (
                  <article
                    key={item.code}
                    className="rounded-2xl bg-[#FAFAF7] p-4 ring-1 ring-black/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B2D]">
                          {item.guestName}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-gray-500">
                          {item.apartmentTitles.join(" • ")}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#071B2D] px-3 py-1.5 text-xs font-black text-white">
                        {item.arrivalTime}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.selfCheckIn ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-700 ring-1 ring-blue-200">
                          <KeyRound size={11} />
                          Self check-in
                        </span>
                      ) : null}

                      {item.transfer ? (
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black text-violet-700 ring-1 ring-violet-200">
                          Transfer
                        </span>
                      ) : null}

                      {item.children > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black text-amber-800 ring-1 ring-amber-200">
                          <Baby size={11} />
                          {item.children}
                        </span>
                      ) : null}

                      {item.paymentMode
                        .toLowerCase()
                        .includes("vacation") ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[9px] font-black text-cyan-800 ring-1 ring-cyan-200">
                          <TicketCheck size={11} />
                          Card vacanță
                        </span>
                      ) : null}
                    </div>

                    {item.balance > 0 ? (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-800 ring-1 ring-orange-200">
                        <span>Sold de încasat</span>
                        <span>{money(item.balance)} lei</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 size={14} />
                        Achitat integral
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-4 gap-2">
                      <a
                        href={`tel:${item.phone}`}
                        className="flex h-10 items-center justify-center rounded-xl bg-white text-[#071B2D] ring-1 ring-black/5"
                      >
                        <Phone size={15} />
                      </a>
                      <a
                        href={`https://wa.me/${phoneDigits(
                          item.phone
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-10 items-center justify-center rounded-xl bg-[#E9F8F8] text-[#071B2D]"
                      >
                        <MessageCircle size={15} />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReservation(
                            asDrawerReservation(item)
                          )
                        }
                        className="flex h-10 items-center justify-center rounded-xl bg-[#D9B56D] text-[#071B2D]"
                      >
                        <CreditCard size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={
                          savingCode === item.code ||
                          item.operations.checkInStatus ===
                            "completed"
                        }
                        onClick={() =>
                          void updateOperation(item.code, {
                            checkInStatus: "completed",
                          })
                        }
                        className="flex h-10 items-center justify-center rounded-xl bg-[#071B2D] text-white disabled:opacity-50"
                      >
                        {savingCode === item.code ? (
                          <Loader2
                            className="animate-spin"
                            size={15}
                          />
                        ) : (
                          <UserCheck size={15} />
                        )}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </Section>
          ) : null}

          {filter === "all" || filter === "departures" ? (
            <Section
              title="Plecări"
              subtitle="Check-out"
              count={visible.departures.length}
            >
              {visible.departures.length === 0 ? (
                <EmptyCard text="Nu există plecări pentru această zi." />
              ) : (
                visible.departures.map((item) => (
                  <article
                    key={item.code}
                    className="rounded-2xl bg-[#FAFAF7] p-4 ring-1 ring-black/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B2D]">
                          {item.guestName}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-gray-500">
                          {item.apartmentTitles.join(" • ")}
                        </p>
                      </div>

                      <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 ring-1 ring-violet-200">
                        {item.departureTime}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        disabled={
                          savingCode === item.code ||
                          item.operations.checkOutStatus ===
                            "completed"
                        }
                        onClick={() =>
                          void updateOperation(item.code, {
                            checkOutStatus: "completed",
                            cleaningStatus: "scheduled",
                          })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071B2D] px-3 py-3 text-xs font-black text-white disabled:opacity-50"
                      >
                        {savingCode === item.code ? (
                          <Loader2
                            className="animate-spin"
                            size={15}
                          />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        Finalizează check-out
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReservation(
                            asDrawerReservation(item)
                          )
                        }
                        className="rounded-xl bg-white px-3 py-3 text-xs font-black text-[#071B2D] ring-1 ring-black/5"
                      >
                        Deschide rezervarea
                      </button>
                    </div>
                  </article>
                ))
              )}
            </Section>
          ) : null}

          {filter === "all" || filter === "cleaning" ? (
            <Section
              title="Curățenie"
              subtitle="Housekeeping"
              count={visible.cleaning.length}
            >
              {visible.cleaning.length === 0 ? (
                <EmptyCard text="Nu există apartamente de pregătit." />
              ) : (
                visible.cleaning.map((item) => (
                  <article
                    key={item.code}
                    className="rounded-2xl bg-[#FAFAF7] p-4 ring-1 ring-black/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B2D]">
                          {item.apartmentTitles.join(" • ")}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-gray-500">
                          După {item.guestName}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] ring-1 ${cleaningClasses(
                          item.operations.cleaningStatus
                        )}`}
                      >
                        {cleaningLabel(
                          item.operations.cleaningStatus
                        )}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {item.operations.cleaningStatus !==
                      "in_progress" ? (
                        <button
                          type="button"
                          disabled={
                            savingCode === item.code ||
                            item.operations.cleaningStatus ===
                              "ready"
                          }
                          onClick={() =>
                            void updateOperation(item.code, {
                              cleaningStatus: "in_progress",
                            })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-3 text-xs font-black text-amber-800 ring-1 ring-amber-200 disabled:opacity-50"
                        >
                          <Clock3 size={14} />
                          Începe
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={savingCode === item.code}
                          onClick={() =>
                            void updateOperation(item.code, {
                              cleaningStatus: "ready",
                            })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-black text-emerald-700 ring-1 ring-emerald-200"
                        >
                          <Sparkles size={14} />
                          Finalizează
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReservation(
                            asDrawerReservation(item)
                          )
                        }
                        className="rounded-xl bg-white px-3 py-3 text-xs font-black text-[#071B2D] ring-1 ring-black/5"
                      >
                        Detalii
                      </button>
                    </div>
                  </article>
                ))
              )}
            </Section>
          ) : null}

          {filter === "all" || filter === "payments" ? (
            <Section
              title="Încasări"
              subtitle="Solduri active"
              count={visible.outstanding.length}
            >
              {visible.outstanding.length === 0 ? (
                <EmptyCard text="Nu există solduri active pentru această zi." />
              ) : (
                visible.outstanding.map((item) => (
                  <article
                    key={item.code}
                    className="rounded-2xl bg-[#FAFAF7] p-4 ring-1 ring-black/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#071B2D]">
                          {item.guestName}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-gray-500">
                          {item.apartmentTitles.join(" • ")}
                        </p>
                      </div>

                      <span className="text-lg font-black text-orange-700">
                        {money(item.balance)} lei
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedReservation(
                          asDrawerReservation(item)
                        )
                      }
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D9B56D] px-3 py-3 text-xs font-black text-[#071B2D]"
                    >
                      <CreditCard size={15} />
                      Încasează
                    </button>
                  </article>
                ))
              )}
            </Section>
          ) : null}
        </div>

        {data ? (
          <section className="mt-5 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2">
              <BedDouble size={18} className="text-[#158F91]" />
              <h2 className="text-lg font-black text-[#071B2D]">
                Locația acum
              </h2>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              {data.apartmentState.map((apartment) => (
                <div
                  key={apartment.slug}
                  className="rounded-2xl bg-[#FAFAF7] p-3 ring-1 ring-black/5"
                >
                  <p className="truncate text-xs font-black text-[#071B2D]">
                    {apartment.title}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-bold text-gray-500">
                    {apartment.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <ReservationDrawer
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
      />
    </main>
  );
}
