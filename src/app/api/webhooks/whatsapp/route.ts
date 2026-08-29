import { createHmac, timingSafeEqual } from "node:crypto";

import { after, NextResponse } from "next/server";

import { processAiGatewayMessage } from "@/lib/ai/gateway/service";
import {
  appendWhatsAppHistory,
  claimWhatsAppMessage,
  extractWhatsAppTextMessages,
  getWhatsAppHistory,
  sendWhatsAppText,
} from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secureEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("META_APP_SECRET is not configured for WhatsApp webhook.");
    return false;
  }
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  return secureEquals(signatureHeader.slice(7), expected);
}

async function processIncomingMessage(message: {
  from: string;
  messageId: string;
  text: string;
  contactName?: string;
}) {
  if (!(await claimWhatsAppMessage(message.messageId))) return;

  try {
    const history = await getWhatsAppHistory(message.from);
    const userMessage = {
      role: "user" as const,
      content: message.text,
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35_000);

    try {
      const response = await processAiGatewayMessage(
        {
          channel: "whatsapp",
          conversationId: `whatsapp-${message.from}`,
          messages: [...history, userMessage],
          contact: {
            name: message.contactName,
            phone: message.from,
            externalUserId: message.from,
          },
        },
        controller.signal
      );

      await sendWhatsAppText(message.from, response.answer, controller.signal);
      await appendWhatsAppHistory(message.from, [
        {
          ...userMessage,
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant",
          content: response.answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("WhatsApp message processing failed", {
      from: message.from,
      messageId: message.messageId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode") ?? "";
  const token = url.searchParams.get("hub.verify_token") ?? "";
  const challenge = url.searchParams.get("hub.challenge") ?? "";
  const configuredToken = process.env.WHATSAPP_VERIFY_TOKEN ?? "";

  if (
    mode === "subscribe" &&
    configuredToken &&
    secureEquals(token, configuredToken)
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.json(
    { ok: false, message: "Webhook verification failed." },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyMetaSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json(
      { ok: false, message: "Invalid Meta signature." },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const object =
    payload && typeof payload === "object" && "object" in payload
      ? (payload as { object?: unknown }).object
      : undefined;

  if (object !== "whatsapp_business_account") {
    return NextResponse.json(
      { ok: false, message: "Unsupported webhook object." },
      { status: 404 }
    );
  }

  const messages = extractWhatsAppTextMessages(
    payload as Parameters<typeof extractWhatsAppTextMessages>[0]
  );

  after(async () => {
    for (const message of messages) {
      await processIncomingMessage(message);
    }
  });

  return NextResponse.json({ ok: true, received: messages.length });
}
