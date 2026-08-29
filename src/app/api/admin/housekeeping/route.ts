import { NextResponse } from "next/server";
import { listReservationFolders } from "@/lib/reservation-center/store";

export const dynamic = "force-dynamic";

function bucharestDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${map.year}-${map.month}-${map.day}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const selectedDate =
    url.searchParams.get("date") || bucharestDateKey();

  const folders = await listReservationFolders();

  const tasks = folders
    .filter(
      (folder) =>
        !["cancelled", "expired"].includes(
          folder.lifecycleStatus
        )
    )
    .filter((folder) => {
      const status = folder.operations.cleaningStatus;
      const isTodayDeparture =
        folder.summary.checkOut === selectedDate;
      const unresolvedFromPast =
        folder.summary.checkOut < selectedDate &&
        ["scheduled", "in_progress"].includes(status);
      const readyToday =
        isTodayDeparture && status === "ready";

      return (
        isTodayDeparture || unresolvedFromPast || readyToday
      );
    })
    .map((folder) => ({
      code: folder.code,
      guestName: folder.summary.guest.name,
      phone: folder.summary.guest.phone,
      apartmentTitles: folder.summary.apartments.map(
        (item) => item.title
      ),
      checkOut: folder.summary.checkOut,
      cleaningStatus:
        folder.operations.cleaningStatus === "not_scheduled"
          ? "scheduled"
          : folder.operations.cleaningStatus,
      internalNotes: folder.operations.internalNotes,
      maintenanceRequired:
        folder.operations.maintenanceRequired ?? false,
      maintenanceNote:
        folder.operations.maintenanceNote ?? "",
      updatedAt: folder.updatedAt,
    }))
    .sort((a, b) => {
      const rank = {
        scheduled: 0,
        in_progress: 1,
        ready: 2,
        not_scheduled: 0,
      } as const;

      return (
        rank[a.cleaningStatus] - rank[b.cleaningStatus] ||
        a.apartmentTitles.join(" ").localeCompare(
          b.apartmentTitles.join(" "),
          "ro"
        )
      );
    });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    selectedDate,
    tasks,
    stats: {
      pending: tasks.filter(
        (task) => task.cleaningStatus === "scheduled"
      ).length,
      inProgress: tasks.filter(
        (task) => task.cleaningStatus === "in_progress"
      ).length,
      ready: tasks.filter(
        (task) => task.cleaningStatus === "ready"
      ).length,
      maintenance: tasks.filter(
        (task) => task.maintenanceRequired
      ).length,
    },
  });
}
