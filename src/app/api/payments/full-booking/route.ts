import { NextResponse } from "next/server";
import { createPaidFullReservation } from "@/lib/reservationStore";
import {
  createReservationFolder,
  registerPaymentTransaction,
} from "@/lib/reservation-center/service";

export const runtime = "nodejs";

type FullBookingPaymentPayload = {
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

function isValidPayload(payload: FullBookingPaymentPayload) {
  return Boolean(
    payload.apartmentSlug &&
      payload.apartmentTitle &&
      payload.checkIn &&
      payload.checkOut &&
      payload.nights &&
      payload.total &&
      payload.total > 0 &&
      payload.guest?.name &&
      payload.guest?.phone
  );
}

function generatePaymentReference() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(Math.random() * 900000 + 100000);
  return `PAY-${datePart}-${randomPart}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as FullBookingPaymentPayload;

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Date incomplete pentru plata integrală.",
        },
        { status: 400 }
      );
    }

    const paymentReference = generatePaymentReference();

    /*
      IMPORTANT:
      În această etapă plata este simulată local, ca să putem testa fluxul complet:
      checkout -> rezervare confirmată -> blocare calendar -> pagină succes.

      În pasul următor, aici se conectează procesatorul real de plăți
      (Netopia / Stripe / alt procesator) și rezervarea va fi confirmată
      doar după callback-ul real de plată cu status successful.
    */
    const reservation = await createPaidFullReservation({
      apartmentSlug: payload.apartmentSlug!,
      apartmentTitle: payload.apartmentTitle!,
      checkIn: payload.checkIn!,
      checkOut: payload.checkOut!,
      nights: payload.nights!,
      total: payload.total!,
      adults: payload.adults ?? 2,
      children: payload.children ?? 0,
      guest: {
        name: payload.guest!.name!,
        phone: payload.guest!.phone!,
        email: payload.guest?.email,
        message: payload.guest?.message,
      },
      paymentProvider: "sandbox",
      paymentReference,
    });

    await createReservationFolder({
      code: reservation.id,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      adults: reservation.adults,
      childAges: payload.childAges ?? [],
      guest: reservation.guest,
      apartments: [
        {
          slug: reservation.apartmentSlug,
          title: reservation.apartmentTitle,
          totalPrice: reservation.total,
        },
      ],
      total: reservation.total,
      requiredDeposit: reservation.total,
      paymentMode: "full_online",
      paymentAmount: reservation.total,
      legacyRequestIds: [reservation.id],
    });

    await registerPaymentTransaction(reservation.id, {
      kind: "payment",
      method: "card_online",
      scope: "full",
      amount: reservation.total,
      currency: "RON",
      status: "paid",
      providerReference: paymentReference,
      note: "Plată integrală confirmată în fluxul full-booking sandbox.",
    });

    return NextResponse.json({
      ok: true,
      paymentReference,
      reservationId: reservation.id,
      redirectUrl: `/checkout/success?reservationId=${encodeURIComponent(
        reservation.id
      )}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Nu am putut procesa plata integrală.",
      },
      { status: 500 }
    );
  }
}
