import { NextResponse } from "next/server";
import { updateReservationOperations } from "@/lib/reservation-center/service";
import type { ReservationFolder } from "@/lib/reservation-center/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ code: string }>;
};

type Body = {
  cleaningStatus?: ReservationFolder["operations"]["cleaningStatus"];
  checkInStatus?: ReservationFolder["operations"]["checkInStatus"];
  checkOutStatus?: ReservationFolder["operations"]["checkOutStatus"];
  internalNote?: string;
  maintenanceRequired?: boolean;
  maintenanceNote?: string;
};

const cleaningStatuses = [
  "not_scheduled",
  "scheduled",
  "in_progress",
  "ready",
] as const;

const checkInStatuses = [
  "pending",
  "ready",
  "completed",
] as const;

const checkOutStatuses = [
  "pending",
  "completed",
] as const;

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { code } = await context.params;
    const body = (await request.json()) as Body;

    if (
      body.cleaningStatus &&
      !cleaningStatuses.includes(body.cleaningStatus)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Statusul curățeniei nu este valid.",
        },
        { status: 400 }
      );
    }

    if (
      body.checkInStatus &&
      !checkInStatuses.includes(body.checkInStatus)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Statusul check-in-ului nu este valid.",
        },
        { status: 400 }
      );
    }

    if (
      body.checkOutStatus &&
      !checkOutStatuses.includes(body.checkOutStatus)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Statusul check-out-ului nu este valid.",
        },
        { status: 400 }
      );
    }

    const folder = await updateReservationOperations(
      decodeURIComponent(code),
      {
        cleaningStatus: body.cleaningStatus,
        checkInStatus: body.checkInStatus,
        checkOutStatus: body.checkOutStatus,
        internalNote: body.internalNote,
        maintenanceRequired: body.maintenanceRequired,
        maintenanceNote: body.maintenanceNote,
        actor: "admin",
      }
    );

    if (!folder) {
      return NextResponse.json(
        {
          ok: false,
          message: "Rezervarea nu a fost găsită.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      folder,
      message: "Statusul operațional a fost actualizat.",
    });
  } catch (error) {
    console.error("Operations update error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Statusul nu a putut fi actualizat.",
      },
      { status: 500 }
    );
  }
}
