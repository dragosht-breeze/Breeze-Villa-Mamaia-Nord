import { NextResponse } from "next/server";

import { isWhatsAppConfigured, sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: isWhatsAppConfigured(),
    phoneNumberIdConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    businessAccountIdConfigured: Boolean(
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    ),
    verifyTokenConfigured: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
    appSecretConfigured: Boolean(process.env.META_APP_SECRET),
    webhookPath: "/api/webhooks/whatsapp",
  });
}

export async function POST(request: Request) {
  let body: { phone?: unknown; message?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Datele trimise nu sunt valide." },
      { status: 400 }
    );
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (!phone || !message) {
    return NextResponse.json(
      { ok: false, message: "Completează numărul și mesajul." },
      { status: 400 }
    );
  }

  try {
    const result = await sendWhatsAppText(phone, message);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin WhatsApp test failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Mesajul WhatsApp nu a putut fi trimis.",
      },
      { status: 502 }
    );
  }
}
