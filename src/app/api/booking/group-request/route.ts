import { NextResponse } from "next/server";
import { createReservationRequest } from "@/lib/reservationStore";
import { createReservationFolder } from "@/lib/reservation-center/service";

export const runtime = "nodejs";

type Payload = {
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  adults?: number;
  children?: number;
  childAges?: number[];
  total?: number;
  paymentMode?: string;
  depositAmount?: number;
  paymentAmount?: number;
  remainingBalance?: number;
  apartments?: {
    slug: string;
    title: string;
    totalPrice: number;
  }[];
  guest?: {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
  };
};

function valid(payload: Payload) {
  return Boolean(
    payload.checkIn &&
      payload.checkOut &&
      payload.nights &&
      payload.total &&
      payload.apartments?.length &&
      payload.guest?.name &&
      payload.guest?.phone
  );
}

function createGroupCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `BV-GRP-${date}-${random}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;

    if (!valid(payload)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Date incomplete pentru cererea de grup.",
        },
        { status: 400 }
      );
    }

    const code = createGroupCode();
    const apartments = payload.apartments!;
    const total = payload.total!;

    const summary = apartments
      .map((apartment) => `${apartment.title}: ${apartment.totalPrice} lei`)
      .join(" | ");

    const created = [];

    for (const apartment of apartments) {
      created.push(
        await createReservationRequest({
          groupCode: code,
          groupTotal: total,
          apartmentSlug: apartment.slug,
          apartmentTitle: apartment.title,
          checkIn: payload.checkIn!,
          checkOut: payload.checkOut!,
          nights: payload.nights!,
          total: apartment.totalPrice,
          adults: payload.adults ?? 2,
          children: payload.children ?? 0,
          childAges: payload.childAges ?? [],
          guest: {
            name: payload.guest!.name!,
            phone: payload.guest!.phone!,
            email: payload.guest?.email,
            message: [
              `Cerere de grup: ${code}`,
              `Total grup: ${total} lei`,
              `Metodă plată: ${payload.paymentMode ?? "-"}`,
              `Sumă selectată: ${payload.paymentAmount ?? 0} lei`,
              `Sold estimat: ${payload.remainingBalance ?? total} lei`,
              `Copii/vârste: ${(payload.childAges ?? []).join(", ") || "-"}`,
              `Apartamente recomandate: ${summary}`,
              payload.guest?.message
                ? `Mesaj client: ${payload.guest.message}`
                : "",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        })
      );
    }

    await createReservationFolder({
      code,
      checkIn: payload.checkIn!,
      checkOut: payload.checkOut!,
      nights: payload.nights!,
      adults: payload.adults ?? 2,
      childAges: payload.childAges ?? [],
      guest: {
        name: payload.guest!.name!,
        phone: payload.guest!.phone!,
        email: payload.guest?.email,
        message: payload.guest?.message,
      },
      apartments,
      total,
      requiredDeposit: payload.depositAmount ?? 0,
      paymentMode: payload.paymentMode,
      paymentAmount: payload.paymentAmount,
      legacyRequestIds: created.map((item) => item.id),
    });

    return NextResponse.json({
      ok: true,
      groupCode: code,
      requests: created,
      message: "Cererea a fost salvată în Dosarul rezervării.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Nu am putut salva cererea.",
      },
      { status: 500 }
    );
  }
}
