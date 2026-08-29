import { NextResponse } from "next/server";
import { searchBookingOptions } from "@/lib/booking/search";
import type { BookingSearchInput } from "@/lib/booking/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingSearchInput;

    const result = await searchBookingOptions({
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      adults: Number(payload.adults ?? 2),
      childAges: Array.isArray(payload.childAges) ? payload.childAges.map(Number) : [],
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Nu am putut calcula disponibilitatea.",
      },
      { status: 500 }
    );
  }
}
