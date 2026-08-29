import { NextResponse } from "next/server";
import {
  createReservationRequest,
  listReservationRequests,
} from "@/lib/reservationStore";
import { createReservationFolder } from "@/lib/reservation-center/service";
import { calculateRequiredDeposit } from "@/lib/payments/payment-policy";

export const runtime = "nodejs";

type ReservationPayload = {
  apartmentSlug?: string;
  apartmentTitle?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  total?: number;
  adults?: number;
  children?: number;
  childAges?: number[];
  guest?: {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
  };
};

function isValidPayload(payload: ReservationPayload) {
  return Boolean(
    payload.apartmentSlug &&
      payload.apartmentTitle &&
      payload.checkIn &&
      payload.checkOut &&
      payload.nights &&
      payload.total &&
      payload.guest?.name &&
      payload.guest?.phone
  );
}

export async function GET() {
  const requests = await listReservationRequests();

  return NextResponse.json({
    ok: true,
    requests,
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReservationPayload;

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Date incomplete pentru cererea de rezervare.",
        },
        { status: 400 }
      );
    }

    const nights = payload.nights!;
    const total = payload.total!;
    const deposit = calculateRequiredDeposit(total, nights);

    const reservationRequest = await createReservationRequest({
      apartmentSlug: payload.apartmentSlug!,
      apartmentTitle: payload.apartmentTitle!,
      checkIn: payload.checkIn!,
      checkOut: payload.checkOut!,
      nights,
      total,
      adults: payload.adults ?? 2,
      children: payload.children ?? 0,
      childAges: payload.childAges ?? [],
      guest: {
        name: payload.guest!.name!,
        phone: payload.guest!.phone!,
        email: payload.guest?.email,
        message: payload.guest?.message,
      },
    });

    await createReservationFolder({
      code: reservationRequest.id,
      checkIn: reservationRequest.checkIn,
      checkOut: reservationRequest.checkOut,
      nights: reservationRequest.nights,
      adults: reservationRequest.adults,
      childAges: reservationRequest.childAges ?? [],
      guest: reservationRequest.guest,
      apartments: [
        {
          slug: reservationRequest.apartmentSlug,
          title: reservationRequest.apartmentTitle,
          totalPrice: reservationRequest.total,
        },
      ],
      total: reservationRequest.total,
      requiredDeposit: deposit.requiredDeposit,
      paymentMode: "deposit_request",
      paymentAmount: deposit.requiredDeposit,
      legacyRequestIds: [reservationRequest.id],
    });

    return NextResponse.json({
      ok: true,
      reservationRequest,
      reservationRequestId: reservationRequest.id,
      message:
        "Cererea de rezervare a fost salvată. Calendarul nu este blocat până la confirmarea avansului.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Nu am putut procesa cererea de rezervare.",
      },
      { status: 500 }
    );
  }
}
