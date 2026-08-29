import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  AiGatewayError,
  processAiGatewayMessage,
} from "@/lib/ai/gateway/service";
import type {
  AiChannel,
  GatewayMessage,
} from "@/lib/ai/gateway/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedChannels: AiChannel[] = [
  "website",
  "whatsapp",
  "messenger",
  "instagram",
];

function isChannel(value: unknown): value is AiChannel {
  return allowedChannels.includes(value as AiChannel);
}

function isGatewayMessage(value: unknown): value is GatewayMessage {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<GatewayMessage>;

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

function secureEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function isAuthorized(request: Request) {
  const configuredSecret = process.env.AI_GATEWAY_SECRET;

  if (!configuredSecret) return false;

  const receivedSecret = request.headers.get("x-ai-gateway-secret") ?? "";

  return secureEquals(receivedSecret, configuredSecret);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHORIZED",
        message: "Gateway neautorizat.",
      },
      { status: 401 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
        message: "Cererea trimisă nu este validă.",
      },
      { status: 400 }
    );
  }

  const body = payload as {
    channel?: unknown;
    conversationId?: unknown;
    messages?: unknown;
    contact?: unknown;
  };

  if (!isChannel(body.channel)) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_CHANNEL",
        message: "Canalul nu este acceptat.",
      },
      { status: 400 }
    );
  }

  const conversationId =
    typeof body.conversationId === "string"
      ? body.conversationId
      : "";
  const messages = Array.isArray(body.messages)
    ? body.messages.filter(isGatewayMessage)
    : [];
  const contact =
    body.contact && typeof body.contact === "object"
      ? (body.contact as {
          name?: string;
          phone?: string;
          email?: string;
          externalUserId?: string;
        })
      : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35_000);

  try {
    const response = await processAiGatewayMessage(
      {
        channel: body.channel,
        conversationId,
        messages,
        contact,
      },
      controller.signal
    );

    return NextResponse.json(response);
  } catch (error) {
    const aborted =
      error instanceof Error && error.name === "AbortError";

    if (error instanceof AiGatewayError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.code,
          message: error.message,
        },
        { status: error.status }
      );
    }

    console.error("AI gateway request failed", {
      aborted,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        error: aborted ? "AI_TIMEOUT" : "AI_UNAVAILABLE",
        message: "Gateway-ul AI nu este disponibil momentan.",
      },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
