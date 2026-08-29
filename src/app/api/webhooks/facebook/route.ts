import { createHmac, timingSafeEqual } from "node:crypto";

import { after, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MessengerEvent = {
  sender?: {
    id?: string;
  };
  recipient?: {
    id?: string;
  };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
  };
  postback?: {
    title?: string;
    payload?: string;
  };
};

type MessengerWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: MessengerEvent[];
  }>;
};

type GatewayResponse =
  | {
      ok: true;
      answer: string;
    }
  | {
      ok: false;
      error?: string;
      message?: string;
    };

const DEFAULT_GRAPH_VERSION = "v23.0";
const MAX_REPLY_LENGTH = 2_000;

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
    console.error("META_APP_SECRET is not configured.");
    return false;
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const receivedSignature = signatureHeader.slice("sha256=".length);
  const expectedSignature = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  return secureEquals(receivedSignature, expectedSignature);
}

function extractIncomingText(event: MessengerEvent) {
  if (event.message?.is_echo) return "";

  const messageText = event.message?.text?.trim();

  if (messageText) {
    return messageText;
  }

  const postbackText =
    event.postback?.title?.trim() ||
    event.postback?.payload?.trim();

  return postbackText ?? "";
}

async function askAiGateway(
  requestUrl: string,
  senderId: string,
  text: string
) {
  const gatewaySecret = process.env.AI_GATEWAY_SECRET;

  if (!gatewaySecret) {
    throw new Error("AI_GATEWAY_SECRET is not configured.");
  }

  const gatewayUrl = new URL("/api/ai/gateway",  process.env.INTERNAL_APP_URL ?? "http://127.0.0.1:3000");

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ai-gateway-secret": gatewaySecret,
    },
    body: JSON.stringify({
      channel: "messenger",
      conversationId: `messenger-${senderId}`,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      contact: {
        externalUserId: senderId,
      },
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as GatewayResponse;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.ok
        ? "Gateway response invalid."
        : data.message || data.error || "Gateway request failed."
    );
  }

  return data.answer.trim().slice(0, MAX_REPLY_LENGTH);
}

async function sendMessengerReply(recipientId: string, text: string) {
  const pageAccessToken = process.env.MESSENGER_PAGE_ACCESS_TOKEN;

  if (!pageAccessToken) {
    throw new Error("MESSENGER_PAGE_ACCESS_TOKEN is not configured.");
  }

  const graphVersion =
    process.env.META_GRAPH_API_VERSION ?? DEFAULT_GRAPH_VERSION;

  const endpoint = new URL(
    `https://graph.facebook.com/${graphVersion}/me/messages`
  );
  endpoint.searchParams.set("access_token", pageAccessToken);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_type: "RESPONSE",
      recipient: {
        id: recipientId,
      },
      message: {
        text,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Messenger Send API ${response.status}: ${errorText.slice(0, 500)}`
    );
  }
}

async function processMessengerEvent(
  requestUrl: string,
  event: MessengerEvent
) {
  const senderId = event.sender?.id?.trim();
  const text = extractIncomingText(event);

  if (!senderId || !text) {
    return;
  }

  try {
    const answer = await askAiGateway(requestUrl, senderId, text);

    if (!answer) {
      return;
    }

    await sendMessengerReply(senderId, answer);
  } catch (error) {
    console.error("Messenger event processing failed", {
      senderId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode") ?? "";
  const receivedToken = url.searchParams.get("hub.verify_token") ?? "";
  const challenge = url.searchParams.get("hub.challenge") ?? "";
  const configuredToken = process.env.MESSENGER_VERIFY_TOKEN ?? "";

  if (
    mode === "subscribe" &&
    configuredToken &&
    secureEquals(receivedToken, configuredToken)
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.json(
    {
      ok: false,
      message: "Webhook verification failed.",
    },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (
    !verifyMetaSignature(
      rawBody,
      request.headers.get("x-hub-signature-256")
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid Meta signature.",
      },
      { status: 401 }
    );
  }

  let payload: MessengerWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as MessengerWebhookPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid JSON payload.",
      },
      { status: 400 }
    );
  }

  if (payload.object !== "page") {
    return NextResponse.json(
      {
        ok: false,
        message: "Unsupported webhook object.",
      },
      { status: 404 }
    );
  }

  const events =
    payload.entry?.flatMap((entry) => entry.messaging ?? []) ?? [];

  after(async () => {
    for (const event of events) {
      await processMessengerEvent(request.url, event);
    }
  });

  return NextResponse.json({
    ok: true,
    received: events.length,
  });
}