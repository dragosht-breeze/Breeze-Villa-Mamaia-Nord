import { NextResponse } from "next/server";
import { getApartmentBySlug } from "@/data/apartments";
import { listReservationFolders } from "@/lib/reservation-center/store";
import { buildIcalCalendar } from "@/lib/ical";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const apartment = getApartmentBySlug(slug);

  if (!apartment) {
    return NextResponse.json(
      { ok: false, message: "Apartamentul nu există." },
      { status: 404 }
    );
  }

  const folders = await listReservationFolders();
  const activeFolders = folders.filter(
    (folder) =>
      !["cancelled", "expired"].includes(folder.lifecycleStatus) &&
      folder.source !== "booking" &&
      folder.summary.apartments.some((item) => item.slug === slug)
  );

  const events = activeFolders.map((folder) => ({
    uid: `${folder.code}-${slug}@breezevilla.ro`,
    start: folder.summary.checkIn,
    end: folder.summary.checkOut,
    summary: `Breeze Villa - ocupat (${folder.code})`,
  }));

  const ical = buildIcalCalendar({
    calendarName: `Breeze Villa - ${apartment.title}`,
    events,
  });

  return new NextResponse(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
