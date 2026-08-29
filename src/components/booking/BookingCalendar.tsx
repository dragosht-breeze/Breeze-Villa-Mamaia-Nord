"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  MoonStar,
  Sparkles,
} from "lucide-react";

export type BookingCalendarDay = {
  date: string;
  available?: boolean;
  price?: number;
  minimumStay?: number;
  checkoutOnly?: boolean;
  checkinOnly?: boolean;
};

type BookingCalendarProps = {
  checkIn: string;
  checkOut: string;
  onChange: (dates: { checkIn: string; checkOut: string }) => void;
  days?: BookingCalendarDay[];
  minDate?: string;
  maxDate?: string;
  currencyLabel?: string;
  defaultMinimumStay?: number;
  disabled?: boolean;
};

type CalendarCell = {
  date: Date;
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};

const WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

function dateToKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function keyToDate(key: string) {
  return new Date(`${key}T12:00:00`);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function differenceInNights(startKey: string, endKey: string) {
  const start = keyToDate(startKey).getTime();
  const end = keyToDate(endKey).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function isBeforeKey(first: string, second: string) {
  return keyToDate(first).getTime() < keyToDate(second).getTime();
}

function isAfterKey(first: string, second: string) {
  return keyToDate(first).getTime() > keyToDate(second).getTime();
}

function isBetweenInclusive(dateKey: string, startKey: string, endKey: string) {
  const value = keyToDate(dateKey).getTime();
  return value >= keyToDate(startKey).getTime() && value <= keyToDate(endKey).getTime();
}

function formatMonth(date: Date) {
  const text = new Intl.DateTimeFormat("ro-RO", {
    month: "long",
    year: "numeric",
  }).format(date);

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(keyToDate(dateKey));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getMonthCells(month: Date): CalendarCell[] {
  const firstDay = startOfMonth(month);
  const mondayBasedDay = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -mondayBasedDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);

    return {
      date,
      key: dateToKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}

function todayKey() {
  return dateToKey(new Date());
}

export default function BookingCalendar({
  checkIn,
  checkOut,
  onChange,
  days = [],
  minDate = todayKey(),
  maxDate,
  currencyLabel = "lei",
  defaultMinimumStay = 1,
  disabled = false,
}: BookingCalendarProps) {
  const initialMonth = useMemo(() => {
    if (checkIn) return startOfMonth(keyToDate(checkIn));
    return startOfMonth(keyToDate(minDate));
  }, [checkIn, minDate]);

  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [hoveredDate, setHoveredDate] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");

  const dayMap = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days]
  );

  const firstMonthCells = useMemo(
    () => getMonthCells(visibleMonth),
    [visibleMonth]
  );

  const secondVisibleMonth = useMemo(
    () => addMonths(visibleMonth, 1),
    [visibleMonth]
  );

  const secondMonthCells = useMemo(
    () => getMonthCells(secondVisibleMonth),
    [secondVisibleMonth]
  );

  const selectedNights =
    checkIn && checkOut ? differenceInNights(checkIn, checkOut) : 0;

  useEffect(() => {
    if (!checkIn) return;
    setVisibleMonth(startOfMonth(keyToDate(checkIn)));
  }, [checkIn]);

  function isDateOutsideLimits(dateKey: string) {
    if (isBeforeKey(dateKey, minDate)) return true;
    if (maxDate && isAfterKey(dateKey, maxDate)) return true;
    return false;
  }

  function isUnavailable(dateKey: string) {
    const day = dayMap.get(dateKey);
    return day?.available === false;
  }

  function isDateDisabled(dateKey: string, mode: "checkin" | "checkout") {
    if (disabled || isDateOutsideLimits(dateKey)) return true;

    const day = dayMap.get(dateKey);

    if (day?.available === false) return true;
    if (mode === "checkin" && day?.checkoutOnly) return true;
    if (mode === "checkout" && day?.checkinOnly) return true;

    return false;
  }

  function rangeContainsUnavailable(startKey: string, endKey: string) {
    let current = keyToDate(startKey);
    const end = keyToDate(endKey);

    while (current < end) {
      const key = dateToKey(current);
      if (key !== startKey && isUnavailable(key)) return true;
      current = addDays(current, 1);
    }

    return false;
  }

  function handleDateSelect(dateKey: string) {
    setSelectionMessage("");

    if (!checkIn || checkOut) {
      if (isDateDisabled(dateKey, "checkin")) return;
      onChange({ checkIn: dateKey, checkOut: "" });
      setHoveredDate("");
      return;
    }

    if (isDateDisabled(dateKey, "checkout")) return;

    if (!isAfterKey(dateKey, checkIn)) {
      onChange({ checkIn: dateKey, checkOut: "" });
      setHoveredDate("");
      return;
    }

    const minimumStay =
      dayMap.get(checkIn)?.minimumStay ?? defaultMinimumStay;
    const nights = differenceInNights(checkIn, dateKey);

    if (nights < minimumStay) {
      setSelectionMessage(
        `Pentru această dată este necesar un sejur de minimum ${minimumStay} ${
          minimumStay === 1 ? "noapte" : "nopți"
        }.`
      );
      return;
    }

    if (rangeContainsUnavailable(checkIn, dateKey)) {
      setSelectionMessage(
        "Intervalul selectat conține cel puțin o noapte indisponibilă."
      );
      return;
    }

    onChange({ checkIn, checkOut: dateKey });
    setHoveredDate("");
  }

  function clearSelection() {
    setSelectionMessage("");
    setHoveredDate("");
    onChange({ checkIn: "", checkOut: "" });
  }

  function renderMonth(month: Date, cells: CalendarCell[]) {
    return (
      <div className="min-w-0">
        <h4 className="mb-5 text-center text-lg font-black text-[#071B2D]">
          {formatMonth(month)}
        </h4>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="pb-2 text-[11px] font-black uppercase tracking-[0.12em] text-gray-400"
            >
              {day}
            </div>
          ))}

          {cells.map((cell) => {
            const meta = dayMap.get(cell.key);
            const choosingCheckout = Boolean(checkIn && !checkOut);
            const dateDisabled = isDateDisabled(
              cell.key,
              choosingCheckout ? "checkout" : "checkin"
            );

            const previewEnd =
              choosingCheckout &&
              hoveredDate &&
              isAfterKey(hoveredDate, checkIn)
                ? hoveredDate
                : "";

            const isCheckIn = cell.key === checkIn;
            const isCheckOut = cell.key === checkOut;
            const isSelectedRange =
              checkIn &&
              checkOut &&
              isBetweenInclusive(cell.key, checkIn, checkOut);
            const isPreviewRange =
              checkIn &&
              previewEnd &&
              isBetweenInclusive(cell.key, checkIn, previewEnd);

            const isRangeStart = isCheckIn;
            const isRangeEnd = isCheckOut || cell.key === previewEnd;
            const isInRange = isSelectedRange || isPreviewRange;
            const isToday = cell.key === todayKey();

            return (
              <button
                key={cell.key}
                type="button"
                disabled={dateDisabled}
                onClick={() => handleDateSelect(cell.key)}
                onMouseEnter={() => {
                  if (choosingCheckout && !dateDisabled) {
                    setHoveredDate(cell.key);
                  }
                }}
                onMouseLeave={() => setHoveredDate("")}
                aria-label={`${formatDate(cell.key)}${
                  meta?.price ? `, ${meta.price} ${currencyLabel}` : ""
                }`}
                className={[
                  "relative min-h-[58px] rounded-xl border px-1 py-1.5 text-center transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#158F91]",
                  !cell.isCurrentMonth ? "opacity-30" : "",
                  dateDisabled
                    ? "cursor-not-allowed border-transparent bg-transparent text-gray-300 line-through"
                    : "border-transparent bg-white text-[#071B2D] hover:border-[#D9B56D] hover:bg-[#FFF9ED]",
                  isInRange && !isRangeStart && !isRangeEnd
                    ? "!rounded-none !border-[#D9B56D]/20 !bg-[#FFF5DE]"
                    : "",
                  isRangeStart
                    ? "!rounded-l-xl !rounded-r-none !border-[#071B2D] !bg-[#071B2D] !text-white"
                    : "",
                  isRangeEnd
                    ? "!rounded-l-none !rounded-r-xl !border-[#D9B56D] !bg-[#D9B56D] !text-[#071B2D]"
                    : "",
                  isCheckIn && isCheckOut
                    ? "!rounded-xl"
                    : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "block text-sm font-black",
                    isToday && !isRangeStart && !isRangeEnd
                      ? "text-[#158F91]"
                      : "",
                  ].join(" ")}
                >
                  {cell.dayNumber}
                </span>

                {meta?.price && cell.isCurrentMonth && !dateDisabled ? (
                  <span
                    className={[
                      "mt-1 block truncate text-[9px] font-black",
                      isRangeStart ? "text-white/75" : "text-[#158F91]",
                    ].join(" ")}
                  >
                    {formatMoney(meta.price)} {currencyLabel}
                  </span>
                ) : (
                  <span className="mt-1 block h-[12px]" />
                )}

                {meta?.minimumStay &&
                meta.minimumStay > 1 &&
                cell.isCurrentMonth &&
                !dateDisabled ? (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#D9B56D]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(7,27,45,0.12)]">
      <div className="border-b border-black/5 bg-[#071B2D] px-5 py-5 text-white sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#D9B56D]">
              <Sparkles size={15} />
              Calendar Breeze Luxury
            </div>
            <h3 className="mt-2 text-2xl font-black">
              Alege perioada sejurului
            </h3>
            <p className="mt-1 text-sm font-semibold text-white/70">
              Selectează mai întâi data sosirii, apoi data plecării.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D9B56D]">
                Check-in
              </p>
              <p className="mt-1 text-sm font-black">
                {checkIn ? formatDate(checkIn) : "Alege data"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D9B56D]">
                Check-out
              </p>
              <p className="mt-1 text-sm font-black">
                {checkOut ? formatDate(checkOut) : "Alege data"}
              </p>
            </div>

            {selectedNights > 0 ? (
              <div className="col-span-2 rounded-2xl bg-[#D9B56D] px-4 py-3 text-[#071B2D] sm:col-span-1">
                <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                  Durată
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-black">
                  <MoonStar size={15} />
                  {selectedNights} {selectedNights === 1 ? "noapte" : "nopți"}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-7">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
            disabled={
              startOfMonth(visibleMonth).getTime() <=
              startOfMonth(keyToDate(minDate)).getTime()
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[#071B2D] transition hover:border-[#071B2D] hover:bg-[#071B2D] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Luna anterioară"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#158F91]">
            <CalendarDays size={16} />
            Tarife și disponibilitate
          </div>

          <button
            type="button"
            onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[#071B2D] transition hover:border-[#071B2D] hover:bg-[#071B2D] hover:text-white"
            aria-label="Luna următoare"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {renderMonth(visibleMonth, firstMonthCells)}
          <div className="hidden lg:block">
            {renderMonth(secondVisibleMonth, secondMonthCells)}
          </div>
        </div>

        {selectionMessage ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#FFF2D8] p-4 text-sm font-bold leading-6 text-[#7A4A00]">
            <Info className="mt-0.5 shrink-0" size={18} />
            {selectionMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#071B2D]" />
              Check-in
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#D9B56D]" />
              Check-out
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#FFF5DE]" />
              Perioadă selectată
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D9B56D]" />
              Sejur minim special
            </span>
          </div>

          {checkIn || checkOut ? (
            <button
              type="button"
              onClick={clearSelection}
              className="shrink-0 text-sm font-black text-[#071B2D] underline decoration-[#D9B56D] decoration-2 underline-offset-4"
            >
              Resetează perioada
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
