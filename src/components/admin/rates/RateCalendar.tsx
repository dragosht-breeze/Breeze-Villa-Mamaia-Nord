"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Tags,
} from "lucide-react";
import { publishAdminLiveEvent } from "@/lib/admin/admin-live-events";
import type { AvailabilityDay } from "@/data/availability";

type ApartmentOption = {
  slug: string;
  title: string;
  shortTitle: string;
};

type RatesResponse = {
  ok: boolean;
  month: string;
  apartment: ApartmentOption;
  apartments: ApartmentOption[];
  days: AvailabilityDay[];
  updatedAt: string;
  message?: string;
};

type Selection = {
  startDate: string;
  endDate: string;
};

const WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  const text = new Intl.DateTimeFormat("ro-RO", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function addMonths(value: string, amount: number) {
  const [year, month] = value.split("-").map(Number);
  return monthKey(new Date(year, month - 1 + amount, 1));
}

function getMonthCells(value: string) {
  const [year, month] = value.split("-").map(Number);
  const first = new Date(year, month - 1, 1, 12);
  const firstOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - firstOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      key: dateKey(date),
      currentMonth: date.getMonth() === month - 1,
    };
  });
}

function money(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function isInSelection(date: string, selection: Selection) {
  return Boolean(
    selection.startDate &&
      selection.endDate &&
      date >= selection.startDate &&
      date <= selection.endDate
  );
}

export default function RateCalendar() {
  const [month, setMonth] = useState(monthKey(new Date()));
  const [apartmentSlug, setApartmentSlug] = useState("");
  const [data, setData] = useState<RatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<Selection>({
    startDate: "",
    endDate: "",
  });
  const [applyAll, setApplyAll] = useState(false);
  const [price, setPrice] = useState("");
  const [minNights, setMinNights] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [offerLabel, setOfferLabel] = useState("");

  async function load(nextMonth = month, nextSlug = apartmentSlug) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ month: nextMonth });
      if (nextSlug) params.set("apartment", nextSlug);

      const response = await fetch(`/api/admin/rates?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as RatesResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Calendarul nu a putut fi încărcat.");
      }

      setData(payload);
      setApartmentSlug(payload.apartment.slug);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Calendarul nu a putut fi încărcat."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(month, apartmentSlug);
  }, [month, apartmentSlug]);

  const dayMap = useMemo(
    () => new Map((data?.days || []).map((day) => [day.date, day])),
    [data]
  );

  const cells = useMemo(() => getMonthCells(month), [month]);

  function selectDay(key: string) {
    setMessage("");

    if (!selection.startDate || selection.endDate) {
      setSelection({ startDate: key, endDate: "" });
      const day = dayMap.get(key);
      setPrice(day ? String(day.price) : "");
      setMinNights(day ? String(day.minNights) : "");
      setBlocked(Boolean(day?.manualBlocked));
      setOfferLabel(day?.offerLabel || "");
      return;
    }

    if (key < selection.startDate) {
      setSelection({ startDate: key, endDate: selection.startDate });
      return;
    }

    setSelection({ startDate: selection.startDate, endDate: key });
  }

  async function save(reset = false) {
    const endDate = selection.endDate || selection.startDate;

    if (!selection.startDate || !endDate) {
      setError("Selectează o zi sau un interval.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const apartmentSlugs = applyAll
        ? data?.apartments.map((item) => item.slug) || []
        : [apartmentSlug];

      const response = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartmentSlugs,
          startDate: selection.startDate,
          endDate,
          price: reset || price === "" ? undefined : Number(price),
          minNights: reset || minNights === "" ? undefined : Number(minNights),
          blocked: reset ? undefined : blocked,
          offerLabel: reset ? undefined : offerLabel,
          reset,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Setările nu au putut fi salvate.");
      }

      setMessage(payload.message || "Setările au fost salvate.");
      publishAdminLiveEvent({
        entity: "operation",
        action: "rates_updated",
      });
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Setările nu au putut fi salvate."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="rounded-[2rem] bg-[#071B2D] p-5 text-white shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D9B56D]">
                Breeze PMS • Rate Calendar
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Tarife și reguli pentru site
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/65">
                Prețurile, sejurul minim și ofertele de aici se aplică numai
                rezervărilor directe. Booking.com rămâne independent.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, -1))}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"
              >
                <ChevronLeft size={19} />
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-center sm:min-w-52 sm:flex-none rounded-xl bg-white/10 px-4 text-sm font-black">
                {monthLabel(month)}
              </div>
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, 1))}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"
              >
                <ChevronRight size={19} />
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#158F91]">
                  Apartament
                </p>
                <select
                  value={apartmentSlug}
                  onChange={(event) => {
                    setApartmentSlug(event.target.value);
                    setSelection({ startDate: "", endDate: "" });
                  }}
                  className="mt-2 w-full min-w-0 rounded-xl sm:min-w-72 border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-black text-[#071B2D] outline-none"
                >
                  {(data?.apartments || []).map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-black">
                <span className="rounded-full bg-[#E9F8F8] px-3 py-2 text-[#071B2D]">
                  Liber
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-800">
                  Ofertă
                </span>
                <span className="rounded-full bg-red-50 px-3 py-2 text-red-700">
                  Blocat
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase text-gray-400">
              {WEEK_DAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <Loader2 className="animate-spin text-[#158F91]" size={28} />
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {cells.map((cell) => {
                  const day = dayMap.get(cell.key);
                  const selected = isInSelection(cell.key, {
                    startDate: selection.startDate,
                    endDate: selection.endDate || selection.startDate,
                  });
                  const blockedDay = Boolean(day?.manualBlocked);
                  const hasOffer = Boolean(day?.offerLabel);

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={!cell.currentMonth || !day}
                      onClick={() => selectDay(cell.key)}
                      className={`relative min-h-[72px] rounded-xl border p-1.5 sm:min-h-[102px] sm:p-2 text-left transition disabled:opacity-25 sm:min-h-[102px] ${
                        selected
                          ? "border-[#158F91] bg-[#DFF4F4] ring-2 ring-[#158F91]/20"
                          : blockedDay
                            ? "border-red-200 bg-red-50"
                            : hasOffer
                              ? "border-amber-200 bg-amber-50"
                              : "border-black/5 bg-[#FAFAF7] hover:border-[#158F91]/40"
                      }`}
                    >
                      <span className="text-xs font-black text-[#071B2D]">
                        {cell.date.getDate()}
                      </span>

                      {day ? (
                        <>
                          <p className="mt-1 truncate text-[11px] font-black sm:mt-2 sm:text-sm text-[#071B2D]">
                            {money(day.price)} lei
                          </p>
                          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.06em] text-gray-500">
                            min. {day.minNights} {day.minNights === 1 ? "noapte" : "nopți"}
                          </p>
                          {blockedDay ? (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[8px] font-black uppercase text-red-700">
                              <Ban size={9} /> Blocat
                            </span>
                          ) : day.offerLabel ? (
                            <span className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[8px] font-black uppercase text-amber-800">
                              <Sparkles size={9} />
                              <span className="truncate">{day.offerLabel}</span>
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/5 xl:sticky xl:top-24">
            <div className="flex items-center gap-2 text-[#158F91]">
              <Tags size={18} />
              <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                Editare interval
              </p>
            </div>

            <h2 className="mt-2 text-xl font-black text-[#071B2D]">
              {selection.startDate
                ? `${selection.startDate} → ${selection.endDate || selection.startDate}`
                : "Selectează zilele"}
            </h2>

            <p className="mt-2 text-xs font-semibold leading-5 text-gray-500">
              Primul click stabilește începutul, al doilea click sfârșitul
              intervalului.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-xs font-black text-gray-600">Preț/noapte</span>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Ex.: 650"
                  className="rounded-xl border border-black/10 bg-[#FAFAF7] px-4 py-3 font-black outline-none focus:border-[#158F91]"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-black text-gray-600">Minim nopți</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={minNights}
                  onChange={(event) => setMinNights(event.target.value)}
                  placeholder="Ex.: 3"
                  className="rounded-xl border border-black/10 bg-[#FAFAF7] px-4 py-3 font-black outline-none focus:border-[#158F91]"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-black text-gray-600">Etichetă ofertă</span>
                <input
                  value={offerLabel}
                  onChange={(event) => setOfferLabel(event.target.value)}
                  placeholder="Ex.: Ofertă rezervare directă"
                  className="rounded-xl border border-black/10 bg-[#FAFAF7] px-4 py-3 text-sm font-bold outline-none focus:border-[#158F91]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl bg-[#FAFAF7] p-4 ring-1 ring-black/5">
                <span>
                  <strong className="block text-sm text-[#071B2D]">Blochează perioada</strong>
                  <span className="text-xs font-semibold text-gray-500">Nu va putea fi rezervată pe site.</span>
                </span>
                <input
                  type="checkbox"
                  checked={blocked}
                  onChange={(event) => setBlocked(event.target.checked)}
                  className="h-5 w-5 accent-[#158F91]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl bg-[#E9F8F8] p-4">
                <span>
                  <strong className="block text-sm text-[#071B2D]">Aplică tuturor apartamentelor</strong>
                  <span className="text-xs font-semibold text-gray-500">Aceleași reguli pentru întregul interval.</span>
                </span>
                <input
                  type="checkbox"
                  checked={applyAll}
                  onChange={(event) => setApplyAll(event.target.checked)}
                  className="h-5 w-5 accent-[#158F91]"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => void save(false)}
              disabled={saving || !selection.startDate}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071B2D] px-4 py-3.5 text-sm font-black text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
              Salvează intervalul
            </button>

            <button
              type="button"
              onClick={() => void save(true)}
              disabled={saving || !selection.startDate}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-black text-[#071B2D] disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Revino la tariful implicit
            </button>

            <div className="mt-5 rounded-xl bg-[#FAFAF7] p-4 text-xs font-semibold leading-5 text-gray-500">
              <div className="flex items-center gap-2 font-black text-[#071B2D]">
                <CalendarDays size={15} /> Important
              </div>
              <p className="mt-2">
                Setările modifică doar site-ul Breeze Villa. Tarifele și
                condițiile din Booking.com nu sunt schimbate.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
