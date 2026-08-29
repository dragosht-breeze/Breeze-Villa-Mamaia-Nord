import type { DayStatus } from "@/data/availability";

export type IcalEvent = {
  uid: string;
  start: string;
  end: string;
  summary: string;
  source?: string;
};

export type IcalBookedDay = {
  date: string;
  status: DayStatus;
  source: "booking" | "airbnb" | "direct" | "other";
  summary: string;
};

function unfoldIcal(rawIcal: string) {
  return rawIcal.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function getLineValue(block: string, key: string) {
  const line = block
    .split(/\r?\n/)
    .find((item) => item.toUpperCase().startsWith(key.toUpperCase()));

  if (!line) return null;

  return line.split(":").slice(1).join(":").trim();
}

export function normalizeIcalDate(value: string) {
  const clean = value.trim();

  if (/^\d{8}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }

  if (/^\d{8}T/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }

  const date = new Date(clean);

  if (!Number.isNaN(date.getTime())) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  return clean;
}

function fromDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

export function parseIcalEvents(rawIcal: string): IcalEvent[] {
  const unfolded = unfoldIcal(rawIcal);

  return unfolded
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((block, index) => {
      const startRaw = getLineValue(block, "DTSTART");
      const endRaw = getLineValue(block, "DTEND");

      if (!startRaw || !endRaw) return null;

      return {
        uid: getLineValue(block, "UID") || `imported-${index}`,
        start: normalizeIcalDate(startRaw),
        end: normalizeIcalDate(endRaw),
        summary: getLineValue(block, "SUMMARY") || "Rezervare importată",
      };
    })
    .filter(Boolean) as IcalEvent[];
}

export function eventsToBookedDays(
  events: IcalEvent[],
  source: IcalBookedDay["source"] = "booking"
): IcalBookedDay[] {
  const days: IcalBookedDay[] = [];

  events.forEach((event) => {
    const start = fromDateKey(event.start);
    const end = fromDateKey(event.end);
    let cursor = new Date(start);

    while (cursor < end) {
      const date = toDateKey(cursor);
      const isCheckIn = date === event.start;
      const isCheckout = toDateKey(addDays(cursor, 1)) === event.end;

      days.push({
        date,
        status: isCheckIn ? "checkin" : isCheckout ? "checkout" : "booked",
        source,
        summary: event.summary,
      });

      cursor = addDays(cursor, 1);
    }
  });

  return days;
}

function formatIcalDate(dateKey: string) {
  return dateKey.replaceAll("-", "");
}

export function buildIcalCalendar({
  calendarName,
  events,
}: {
  calendarName: string;
  events: IcalEvent[];
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Breeze Villa//Booking Calendar//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
  ];

  events.forEach((event) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(event.start)}`,
      `DTEND;VALUE=DATE:${formatIcalDate(event.end)}`,
      `SUMMARY:${event.summary}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");

  return `${lines.join("\r\n")}\r\n`;
}
