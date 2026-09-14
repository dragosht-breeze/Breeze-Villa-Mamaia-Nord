import { NextResponse } from "next/server";
import { applyNetopiaPaymentNotification } from "@/lib/reservation-center/service";
import { verifyNetopiaIpn } from "@/lib/payments/netopia-ipn";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const certificate = process.env.NETOPIA_PUBLIC_CERTIFICATE;
  const expectedPosSignature = process.env.NETOPIA_POS_ID;
  const verificationToken = request.headers.get("verification-token");

  if (!certificate || !expectedPosSignature) {
    console.error("NETOPIA IPN configuration is incomplete");
    return NextResponse.json(
      { errorType: 1, errorCode: 500, errorMessage: "Configuration incomplete" },
      { status: 500 }
    );
  }
  if (!verificationToken) {
    return NextResponse.json(
      { errorType: 1, errorCode: 400, errorMessage: "Verification token missing" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  try {
    const { payload } = verifyNetopiaIpn({
      rawBody,
      verificationToken,
      certificate,
      expectedPosSignature,
    });

    const code = payload.order?.orderID;
    const amount = payload.order?.amount;
    const currency = payload.order?.currency;
    const providerReference = payload.payment?.ntpID;
    const providerStatus = payload.payment?.status;

    if (!code || typeof amount !== "number" || !currency || typeof providerStatus !== "number") {
      throw new Error("Incomplete notification payload");
    }

    const status =
      providerStatus === 3 || providerStatus === 5
        ? "paid"
        : providerStatus === 4 || providerStatus === 12 || providerStatus === 23
          ? "cancelled"
          : providerStatus === 8 || providerStatus === 17
            ? "refunded"
            : providerStatus === 11 || providerStatus === 13
              ? "failed"
              : "processing";

    await applyNetopiaPaymentNotification({
      code,
      providerReference:
        providerReference === undefined ? undefined : String(providerReference),
      amount,
      currency,
      status,
    });

    console.info("NETOPIA IPN verified", { code, providerStatus, status });
    return NextResponse.json({ errorType: 0, errorCode: 0, errorMessage: "" });
  } catch (error) {
    console.error("NETOPIA IPN rejected", {
      reason: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { errorType: 1, errorCode: 400, errorMessage: "Invalid notification" },
      { status: 400 }
    );
  }
}
