import { NextResponse } from "next/server";
import { apartments } from "@/data/apartments";
import { readBookingSyncStore } from "@/lib/booking-sync/store";
import { listReservationFolders } from "@/lib/reservation-center/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchResult = {
  id: string;
  type: "reservation" | "guest" | "apartment" | "payment" | "booking";
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
  score: number;
};

type PublicSearchResult = Omit<SearchResult, "score">;

function normalize(value: string | undefined | null) {
  return (value ?? "")
    .toLocaleLowerCase("ro-RO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function digits(value: string | undefined | null) {
  return (value ?? "").replace(/\D/g, "");
}

function scoreText(value: string | undefined | null, query: string) {
  const normalized = normalize(value);

  if (!normalized || !query) return 0;
  if (normalized === query) return 120;
  if (normalized.startsWith(query)) return 90;
  if (normalized.includes(query)) return 60;

  const words = normalized.split(" ");

  if (words.some((word) => word.startsWith(query))) return 70;

  return 0;
}

function money(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function dateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toPublicSearchResult(result: SearchResult): PublicSearchResult {
  return {
    id: result.id,
    type: result.type,
    title: result.title,
    subtitle: result.subtitle,
    meta: result.meta,
    href: result.href,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("q") ?? "";
  const query = normalize(rawQuery);
  const queryDigits = digits(rawQuery);

  if (query.length < 2 && queryDigits.length < 3) {
    return NextResponse.json({
      ok: true,
      query: rawQuery,
      results: [],
    });
  }

  const [folders, bookingStore] = await Promise.all([
    listReservationFolders(),
    readBookingSyncStore(),
  ]);

  const results: SearchResult[] = [];

  for (const folder of folders) {
    const guest = folder.summary.guest;
    const apartmentTitles = folder.summary.apartments
      .map((item) => item.title)
      .join(" • ");

    const transactionText = folder.financial.transactions
      .map(
        (item) =>
          `${item.method} ${item.scope} ${item.note ?? ""} ${
            item.providerReference ?? ""
          }`
      )
      .join(" ");

    const phoneMatch =
      queryDigits.length >= 3 && digits(guest.phone).includes(queryDigits)
        ? 100
        : 0;

    const reservationScore = Math.max(
      scoreText(folder.code, query) + 20,
      scoreText(guest.name, query),
      scoreText(guest.email, query),
      scoreText(apartmentTitles, query),
      scoreText(folder.financial.selectedPaymentMode, query),
      scoreText(folder.lifecycleStatus, query),
      scoreText(folder.paymentStatus, query),
      phoneMatch
    );

    if (reservationScore > 0) {
      results.push({
        id: `reservation:${folder.code}`,
        type: "reservation",
        title: `${folder.code} · ${guest.name}`,
        subtitle: `${apartmentTitles} · ${dateLabel(
          folder.summary.checkIn
        )} → ${dateLabel(folder.summary.checkOut)}`,
        meta:
          folder.financial.balance > 0
            ? `Sold ${money(folder.financial.balance)} lei`
            : "Achitat integral",
        href: `/admin/reservations/${encodeURIComponent(folder.code)}`,
        score: reservationScore + 30,
      });
    }

    const paymentScore = Math.max(
      scoreText(transactionText, query),
      scoreText(folder.financial.selectedPaymentMode, query),
      phoneMatch > 0 ? phoneMatch - 20 : 0
    );

    if (paymentScore > 0 && folder.financial.transactions.length > 0) {
      results.push({
        id: `payment:${folder.code}`,
        type: "payment",
        title: `${guest.name} · ${money(folder.financial.paid)} lei încasați`,
        subtitle: `${folder.code} · ${folder.financial.transactions.length} tranzacții`,
        meta:
          folder.financial.balance > 0
            ? `Sold ${money(folder.financial.balance)} lei`
            : "Fără sold",
        href: `/admin/reservations/${encodeURIComponent(folder.code)}`,
        score: paymentScore,
      });
    }
  }

  const guests = new Map<
    string,
    {
      name: string;
      phone: string;
      email: string;
      codes: string[];
      total: number;
      lastCheckIn: string;
    }
  >();

  for (const folder of folders) {
    const guest = folder.summary.guest;
    const key =
      digits(guest.phone) || normalize(guest.email) || normalize(guest.name);

    if (!key) continue;

    const existing = guests.get(key);

    if (!existing) {
      guests.set(key, {
        name: guest.name,
        phone: guest.phone,
        email: guest.email ?? "",
        codes: [folder.code],
        total: folder.financial.total,
        lastCheckIn: folder.summary.checkIn,
      });

      continue;
    }

    existing.codes.push(folder.code);
    existing.total += folder.financial.total;

    if (folder.summary.checkIn > existing.lastCheckIn) {
      existing.lastCheckIn = folder.summary.checkIn;
      existing.name = guest.name;
      existing.phone = guest.phone;
      existing.email = guest.email ?? existing.email;
    }
  }

  for (const guest of guests.values()) {
    const phoneMatch =
      queryDigits.length >= 3 && digits(guest.phone).includes(queryDigits)
        ? 110
        : 0;

    const guestScore = Math.max(
      scoreText(guest.name, query),
      scoreText(guest.email, query),
      phoneMatch
    );

    if (guestScore > 0) {
      results.push({
        id: `guest:${
          digits(guest.phone) || normalize(guest.email) || normalize(guest.name)
        }`,
        type: "guest",
        title: guest.name,
        subtitle: [guest.phone, guest.email].filter(Boolean).join(" · "),
        meta: `${guest.codes.length} ${
          guest.codes.length === 1 ? "sejur" : "sejururi"
        } · ${money(guest.total)} lei`,
        href: "/admin/crm",
        score: guestScore + 15,
      });
    }
  }

  for (const apartment of apartments) {
    const apartmentText = [
      apartment.title,
      apartment.shortTitle,
      apartment.badge,
      apartment.floor,
      apartment.view,
      apartment.roomsLabel,
    ].join(" ");

    const apartmentScore = scoreText(apartmentText, query);

    if (apartmentScore > 0) {
      results.push({
        id: `apartment:${apartment.slug}`,
        type: "apartment",
        title: apartment.title,
        subtitle: `${apartment.floor} · ${apartment.surface} mp · ${apartment.view}`,
        meta: apartment.badge,
        href: `/admin/rates?apartment=${encodeURIComponent(apartment.slug)}`,
        score: apartmentScore,
      });
    }
  }

  for (const event of bookingStore.events) {
    const eventScore = Math.max(
      scoreText(event.summary, query),
      scoreText(event.apartmentSlug, query),
      scoreText(event.provider, query)
    );

    if (eventScore > 0) {
      results.push({
        id: `booking:${event.id}`,
        type: "booking",
        title: event.summary || "Rezervare Booking",
        subtitle: `${dateLabel(event.start)} → ${dateLabel(event.end)}`,
        meta: `${event.provider} · ${event.apartmentSlug}`,
        href: `/admin/calendar?date=${encodeURIComponent(event.start)}`,
        score: eventScore,
      });
    }
  }

  const unique = new Map<string, SearchResult>();

  for (const result of results) {
    const existing = unique.get(result.id);

    if (!existing || result.score > existing.score) {
      unique.set(result.id, result);
    }
  }

  const publicResults = [...unique.values()]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ro"))
    .slice(0, 30)
    .map(toPublicSearchResult);

  return NextResponse.json({
    ok: true,
    query: rawQuery,
    results: publicResults,
  });
}