import { NextResponse } from "next/server";
import { apartments } from "@/data/apartments";
import { listReservationFolderSummaries } from "@/lib/reservation-center/service";

export const dynamic = "force-dynamic";

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export async function GET() {
  const folders = await listReservationFolderSummaries();
  const today = dateKey();
  const active = folders.filter((item) => !["cancelled", "expired", "completed"].includes(item.lifecycleStatus));
  const checkIns = active.filter((item) => item.checkIn === today);
  const checkOuts = active.filter((item) => item.checkOut === today);
  const newToday = folders.filter((item) => item.createdAt.slice(0, 10) === today);
  const unpaid = active.filter((item) => item.paymentStatus === "unpaid" || item.paymentStatus === "partially_paid");
  const priorities = active
    .filter((item) => item.health.level !== "ok" || item.nextAction.code !== "none")
    .sort((a, b) => (a.health.level === "critical" ? -1 : 1) - (b.health.level === "critical" ? -1 : 1))
    .slice(0, 6);
  const tasks = active.filter((item) => item.nextAction.code !== "none").slice(0, 8);

  const apartmentStatus = apartments.map((apartment) => {
    const occupying = active.find((item) => item.apartmentTitles.includes(apartment.title) && item.checkIn <= today && item.checkOut > today);
    const arrival = checkIns.find((item) => item.apartmentTitles.includes(apartment.title));
    const departure = checkOuts.find((item) => item.apartmentTitles.includes(apartment.title));
    if (departure) return { slug: apartment.slug, title: apartment.shortTitle, status: "check_out", label: "Check-out azi", reservationCode: departure.code };
    if (arrival) return { slug: apartment.slug, title: apartment.shortTitle, status: "check_in", label: "Check-in 15:00", reservationCode: arrival.code };
    if (occupying) return { slug: apartment.slug, title: apartment.shortTitle, status: "occupied", label: `Ocupat • ${occupying.guestName}`, reservationCode: occupying.code };
    return { slug: apartment.slug, title: apartment.shortTitle, status: "free", label: "Liber", reservationCode: null };
  });

  const recent = folders
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)
    .map((item) => ({ code: item.code, guestName: item.guestName, action: item.nextAction.label, at: item.updatedAt, paymentStatus: item.paymentStatus }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    stats: {
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      newReservations: newToday.length,
      unpaid: unpaid.length,
      outstanding: active.reduce((sum, item) => sum + item.balance, 0),
      active: active.length,
    },
    priorities,
    tasks,
    apartmentStatus,
    recent,
  });
}
