import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

type ReservationPayload = {
  apartmentSlug?: string;
  apartmentTitle?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  total?: number;
  adults?: number;
  children?: number;
  guest?: {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
  };
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isValidDateKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T12:00:00`).getTime())
  );
}

function isValidPayload(payload: ReservationPayload) {
  if (
    !payload.apartmentSlug?.trim() ||
    !payload.apartmentTitle?.trim() ||
    !isValidDateKey(payload.checkIn) ||
    !isValidDateKey(payload.checkOut) ||
    !isPositiveNumber(payload.nights) ||
    !isPositiveNumber(payload.total) ||
    !payload.guest?.name?.trim() ||
    !payload.guest?.phone?.trim()
  ) {
    return false;
  }

  return (
    new Date(`${payload.checkOut}T12:00:00`) >
    new Date(`${payload.checkIn}T12:00:00`)
  );
}

function createRequestId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `BV-${date}-${randomInt(1000, 10000)}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReservationPayload;

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Date incomplete sau invalide pentru cererea de rezervare.",
        },
        { status: 400 }
      );
    }

    const reservationRequestId = createRequestId();

    logger.audit("Cerere de rezervare pregătită.", {
      reservationRequestId,
      apartmentSlug: payload.apartmentSlug,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      nights: payload.nights,
      adults: payload.adults ?? 0,
      children: payload.children ?? 0,
    });

    return NextResponse.json({
      ok: true,
      reservationRequestId,
      message: "Cererea de rezervare a fost pregătită.",
    });
  } catch (error) {
    logger.error("Cererea de rezervare nu a putut fi procesată.", {
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Nu am putut procesa cererea de rezervare.",
      },
      { status: 500 }
    );
  }
}
