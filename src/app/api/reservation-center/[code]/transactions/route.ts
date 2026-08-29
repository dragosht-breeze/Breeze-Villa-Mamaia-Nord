import { NextResponse } from "next/server";
import { getReservationFolder } from "@/lib/reservation-center/store";
import { registerPaymentTransaction } from "@/lib/reservation-center/service";
import type { FinancialTransaction } from "@/lib/reservation-center/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ code: string }>;
};

type RequestBody = {
  amount?: number;
  method?: FinancialTransaction["method"];
  note?: string;
};

const allowedMethods: FinancialTransaction["method"][] = [
  "card_online",
  "vacation_card_link",
  "bank_transfer",
  "pos",
  "cash",
  "manual",
];

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { code } = await context.params;
    const folder = await getReservationFolder(
      decodeURIComponent(code)
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

    const body = (await request.json()) as RequestBody;
    const amount = Math.round(Number(body.amount));

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Introdu o sumă validă.",
        },
        { status: 400 }
      );
    }

    if (amount > folder.financial.balance) {
      return NextResponse.json(
        {
          ok: false,
          message: `Suma depășește soldul de ${folder.financial.balance} lei.`,
        },
        { status: 400 }
      );
    }

    const method = body.method ?? "manual";

    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Metoda de plată nu este validă.",
        },
        { status: 400 }
      );
    }

    const missingDeposit = Math.max(
      0,
      folder.financial.requiredDeposit -
        folder.financial.paid
    );

    const scope: FinancialTransaction["scope"] =
      amount === folder.financial.balance
        ? "full"
        : missingDeposit > 0 && amount >= missingDeposit
          ? "deposit"
          : "partial";

    const updatedFolder = await registerPaymentTransaction(
      folder.code,
      {
        kind: "payment",
        method,
        scope,
        amount,
        currency: "RON",
        status: "paid",
        note:
          body.note?.trim() ||
          "Plată înregistrată manual din Reservation Drawer.",
      }
    );

    if (!updatedFolder) {
      return NextResponse.json(
        {
          ok: false,
          message: "Plata nu a putut fi înregistrată.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      folder: updatedFolder,
      message: "Plata a fost înregistrată.",
    });
  } catch (error) {
    console.error("Manual payment error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Plata nu a putut fi înregistrată.",
      },
      { status: 500 }
    );
  }
}
