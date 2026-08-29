import { NextResponse } from "next/server";
import { createPayment } from "@/lib/payments/payment-service";
import type { CreatePaymentInput } from "@/lib/payments/types";
import { registerPaymentTransaction } from "@/lib/reservation-center/service";

export const runtime = "nodejs";

function isValidInput(value: unknown): value is CreatePaymentInput {
  if (!value || typeof value !== "object") return false;

  const input = value as Partial<CreatePaymentInput>;

  return Boolean(
    input.reservationCode &&
      typeof input.totalAmount === "number" &&
      input.totalAmount > 0 &&
      typeof input.nights === "number" &&
      input.nights > 0 &&
      typeof input.amount === "number" &&
      input.amount > 0 &&
      input.currency === "RON" &&
      input.method &&
      input.scope &&
      input.customer?.name &&
      input.customer?.email &&
      input.customer?.phone &&
      input.description &&
      input.returnUrl
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!isValidInput(body)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datele plății sunt incomplete sau invalide.",
        },
        { status: 400 }
      );
    }

    const result = await createPayment(body);

    await registerPaymentTransaction(body.reservationCode, {
      kind: "payment",
      method: body.method,
      scope: body.scope,
      amount: body.amount,
      currency: body.currency,
      status: result.status,
      providerReference: result.paymentId,
      note: result.message,
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error) {
    console.error("Payment creation error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Plata nu a putut fi inițializată.",
      },
      { status: 500 }
    );
  }
}
