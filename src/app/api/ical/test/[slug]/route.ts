import { NextResponse } from "next/server";
import { getEnabledIcalConnectionsByApartment, getIcalConnectionsByApartment } from "@/data/ical";
import { eventsToBookedDays, parseIcalEvents } from "@/lib/ical";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const allConnections = getIcalConnectionsByApartment(slug);
  const connections = getEnabledIcalConnectionsByApartment(slug);

  if (allConnections.length === 0) {
    return NextResponse.json({
      ok: false,
      slug,
      message: "Nu există conexiune iCal configurată pentru acest apartament.",
    }, { status: 404 });
  }

  if (connections.length === 0) {
    return NextResponse.json({
      ok: false,
      slug,
      message: "Conexiunea există, dar nu are link iCal sau nu este activă. Completează .env.local și repornește serverul.",
      configuredConnections: allConnections.map((connection) => ({
        label: connection.label,
        provider: connection.provider,
        enabled: connection.enabled,
        hasUrl: Boolean(connection.importUrl),
      })),
    });
  }

  const results = [];

  for (const connection of connections) {
    try {
      const response = await fetch(connection.importUrl, { cache: "no-store" });

      if (!response.ok) {
        results.push({
          label: connection.label,
          provider: connection.provider,
          ok: false,
          status: response.status,
          eventCount: 0,
          bookedDaysCount: 0,
          message: "Linkul iCal nu a putut fi citit.",
        });
        continue;
      }

      const raw = await response.text();
      const events = parseIcalEvents(raw);
      const bookedDays = eventsToBookedDays(events, connection.provider);

      results.push({
        label: connection.label,
        provider: connection.provider,
        ok: true,
        eventCount: events.length,
        bookedDaysCount: bookedDays.length,
        firstEvents: events.slice(0, 5),
      });
    } catch (error) {
      results.push({
        label: connection.label,
        provider: connection.provider,
        ok: false,
        eventCount: 0,
        bookedDaysCount: 0,
        message: error instanceof Error ? error.message : "Eroare necunoscută.",
      });
    }
  }

  return NextResponse.json({
    ok: results.every((item) => item.ok),
    slug,
    results,
  });
}
