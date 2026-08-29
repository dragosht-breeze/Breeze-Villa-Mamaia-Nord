import { NextResponse } from "next/server";

import {
  AiGatewayError,
  processAiGatewayMessage,
} from "@/lib/ai/gateway/service";
import type { GatewayMessage } from "@/lib/ai/gateway/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isGatewayMessage(value: unknown): value is GatewayMessage {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<GatewayMessage>;

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

export async function POST(request: Request) {
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
    messages?: unknown;
    conversationId?: unknown;
  };

  const messages = Array.isArray(body.messages)
    ? body.messages.filter(isGatewayMessage)
    : [];
  const conversationId =
    typeof body.conversationId === "string"
      ? body.conversationId
      : "";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35_000);

  try {
    const response = await processAiGatewayMessage(
      {
        channel: "website",
        conversationId,
        messages,
      },
      controller.signal
    );

    return NextResponse.json(response);
  } catch (error) {
    const aborted =
      error instanceof Error && error.name === "AbortError";

    if (error instanceof AiGatewayError) {
      console.error("AI gateway receptionist error", {
        code: error.code,
        message: error.message,
      });

      return NextResponse.json(
        {
          ok: false,
          error: error.code,
          message:
            error.code === "AI_NOT_CONFIGURED"
              ? "Asistentul AI nu este încă activat."
              : "Momentan nu pot genera răspunsul. Pentru ajutor rapid, folosește pagina de rezervare sau scrie-ne pe WhatsApp la 0723 253 405.",
        },
        { status: error.status }
      );
    }

    console.error("AI gateway receptionist failed", {
      aborted,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        error: aborted ? "AI_TIMEOUT" : "AI_UNAVAILABLE",
        message:
          "Momentan nu pot genera răspunsul. Pentru ajutor rapid, folosește pagina de rezervare sau scrie-ne pe WhatsApp la 0723 253 405.",
      },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
