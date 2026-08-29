"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailabilityDay, DayStatus } from "@/data/availability";

export type CalendarSelection = {
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  total: number;
  minNights: number;
  hasUnavailableDays: boolean;
  canRequest: boolean;
};

type AvailabilityCalendarProps = {
  days: AvailabilityDay[];
  onSelectionChange?: (selection: CalendarSelection) => void;
};

type CalendarCell = {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
};

const monthFormatter = new Intl.DateTimeFormat("ro-RO", {
  month: "long",
  year: "numeric",
});

const dayFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "short",
});

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function getNightCount(start: string | null, end: string | null) {
  if (!start || !end) return 0;

  const startDate = fromDateKey(start);
  const endDate = fromDateKey(end);
  const diff = endDate.getTime() - startDate.getTime();

  return Math.max(Math.round(diff / 86400000), 0);
}

function buildMonthCells(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const startDate = addDays(firstDay, -firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(startDate, index);

    return {
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function isBlockedStatus(status: DayStatus) {
  return status === "booked" || status === "checkin" || status === "checkout";
}

function statusClass(status: DayStatus, isSelected: boolean, isInRange: boolean) {
  if (isSelected) return "bg-[#071B2D] text-white ring-2 ring-[#D9B56D]";
  if (isInRange) return "bg-[#D9B56D]/35 text-[#071B2D]";

  if (status === "booked") return "bg-red-100 text-red-600 line-through opacity-80";
  if (status === "checkin") return "bg-amber-100 text-amber-800 line-through opacity-85";
  if (status === "checkout") return "bg-sky-100 text-sky-800 line-through opacity-85";

  return "bg-[#E9F8F8] text-[#071B2D] hover:bg-[#D9B56D]";
}

function sourceLabel(source?: AvailabilityDay["source"]) {
  if (source === "booking") return "Booking";
  if (source === "airbnb") return "Airbnb";
  if (source === "direct") return "Direct";
  if (source === "manual") return "Manual";
  return "";
}

export default function AvailabilityCalendar({ days, onSelectionChange }: AvailabilityCalendarProps) {
  const availabilityByDate = useMemo(() => {
    return new Map(days.map((day) => [day.date, day]));
  }, [days]);

  const firstDate = days[0]?.date ? fromDateKey(days[0].date) : new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  );
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const cells = useMemo(() => buildMonthCells(currentMonth), [currentMonth]);
  const nights = getNightCount(checkIn, checkOut);

  const selectedRange = useMemo(() => {
    if (!checkIn || !checkOut) return [];

    const range: string[] = [];
    let cursor = fromDateKey(checkIn);
    const end = fromDateKey(checkOut);

    while (cursor < end) {
      range.push(toDateKey(cursor));
      cursor = addDays(cursor, 1);
    }

    return range;
  }, [checkIn, checkOut]);

  const rangeDays = selectedRange
    .map((dateKey) => availabilityByDate.get(dateKey))
    .filter(Boolean) as AvailabilityDay[];

  const total = rangeDays.reduce((sum, day) => sum + day.price, 0);
  const minNights = rangeDays.length > 0
    ? Math.max(...rangeDays.map((day) => day.minNights))
    : days[0]?.minNights ?? 1;
  const hasUnavailableDays = rangeDays.some((day) => isBlockedStatus(day.status));
  const canRequest = Boolean(checkIn && checkOut && nights >= minNights && !hasUnavailableDays);

  useEffect(() => {
    onSelectionChange?.({
      checkIn,
      checkOut,
      nights,
      total,
      minNights,
      hasUnavailableDays,
      canRequest,
    });
  }, [checkIn, checkOut, nights, total, minNights, hasUnavailableDays, canRequest, onSelectionChange]);

  function handleSelect(dateKey: string) {
    const day = availabilityByDate.get(dateKey);

    if (!day || isBlockedStatus(day.status)) return;

    if (!checkIn || checkOut || dateKey <= checkIn) {
      setCheckIn(dateKey);
      setCheckOut(null);
      return;
    }

    const start = fromDateKey(checkIn);
    const end = fromDateKey(dateKey);
    let cursor = new Date(start);
    let containsBlockedDay = false;

    while (cursor < end) {
      const cursorKey = toDateKey(cursor);
      const cursorDay = availabilityByDate.get(cursorKey);

      if (!cursorDay || isBlockedStatus(cursorDay.status)) {
        containsBlockedDay = true;
        break;
      }

      cursor = addDays(cursor, 1);
    }

    if (containsBlockedDay) {
      setCheckIn(dateKey);
      setCheckOut(null);
      return;
    }

    setCheckOut(dateKey);
  }

  function clearSelection() {
    setCheckIn(null);
    setCheckOut(null);
  }

  function changeMonth(amount: number) {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1));
    clearSelection();
  }

  return (
    <div className="rounded-[1.6rem] bg-white p-4 shadow-[0_18px_45px_rgba(7,27,45,0.08)] ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9F8F8] text-lg font-black text-[#071B2D] transition hover:bg-[#D9B56D]"
        >
          ‹
        </button>

        <p className="text-center text-sm font-black capitalize text-[#071B2D]">
          {monthFormatter.format(currentMonth)}
        </p>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9F8F8] text-lg font-black text-[#071B2D] transition hover:bg-[#D9B56D]"
        >
          ›
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wide text-gray-400">
        {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
          <div key={`${label}-${index}`}>{label}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((cell) => {
          const day = availabilityByDate.get(cell.dateKey);
          const status = day?.status ?? "available";
          const isSelected = cell.dateKey === checkIn || cell.dateKey === checkOut;
          const isInRange = selectedRange.includes(cell.dateKey);
          const isBlocked = isBlockedStatus(status);

          return (
            <button
              key={cell.dateKey}
              type="button"
              disabled={!cell.isCurrentMonth || isBlocked || !day}
              onClick={() => handleSelect(cell.dateKey)}
              title={day?.source ? `${cell.dateKey} • ${sourceLabel(day.source)}` : cell.dateKey}
              className={`min-h-12 rounded-2xl p-1 text-center transition disabled:cursor-not-allowed disabled:opacity-70 ${statusClass(status, isSelected, isInRange)}`}
            >
              <span className="block text-xs font-black">{cell.date.getDate()}</span>
              {cell.isCurrentMonth && day && (
                <>
                  {isBlocked ? (
                    <span className="mt-0.5 block text-[8px] font-black uppercase opacity-80">
                      {day.source === "booking" ? "Booking" : "Ocupat"}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[9px] font-bold opacity-80">{day.price} lei</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <div className="text-gray-500">
          {checkIn && checkOut ? (
            <span>
              {dayFormatter.format(fromDateKey(checkIn))} → {dayFormatter.format(fromDateKey(checkOut))}
            </span>
          ) : (
            <span>Alege check-in și check-out</span>
          )}
        </div>

        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={clearSelection}
            className="font-black text-[#158F91] hover:text-[#071B2D]"
          >
            Resetează
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-600">
        <div className="rounded-xl bg-[#E9F8F8] p-3">Liber</div>
        <div className="rounded-xl bg-red-100 p-3 text-red-600">Ocupat</div>
        <div className="rounded-xl bg-amber-100 p-3 text-amber-800">Check-in</div>
        <div className="rounded-xl bg-sky-100 p-3 text-sky-800">Check-out</div>
      </div>
    </div>
  );
}
