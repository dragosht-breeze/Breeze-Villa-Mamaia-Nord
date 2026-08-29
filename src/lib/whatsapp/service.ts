import type { WhatsAppSendResult } from "@/lib/whatsapp/types";

const DEFAULT_GRAPH_VERSION = "v23.0";

function normalizePhone(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

async function postWhatsAppMessage(
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<WhatsAppSendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp Cloud API is not configured.");
  }

  const graphVersion =
    process.env.META_GRAPH_API_VERSION ?? DEFAULT_GRAPH_VERSION;
  const endpoint = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
  });

  const raw = await response.text();
  let data: {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  } = {};

  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      `WhatsApp Cloud API ${response.status}: ${
        data.error?.message ?? raw.slice(0, 500) ?? "Unknown error"
      }`
    );
  }

  return {
    ok: true,
    messageId: data.messages?.[0]?.id,
  };
}

export async function sendWhatsAppText(
  recipient: string,
  text: string,
  signal?: AbortSignal
): Promise<WhatsAppSendResult> {
  const to = normalizePhone(recipient);
  const message = text.trim();

  if (!to || message.length === 0) {
    throw new Error("Recipient and message are required.");
  }

  return postWhatsAppMessage(
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: true,
        body: message.slice(0, 4_000),
      },
    },
    signal
  );
}

export async function sendWhatsAppTemplate(
  recipient: string,
  templateName: string,
  languageCode: string,
  bodyParameters: string[] = [],
  signal?: AbortSignal
): Promise<WhatsAppSendResult> {
  const to = normalizePhone(recipient);
  const name = templateName.trim();
  const language = languageCode.trim() || "ro";

  if (!to || !name) {
    throw new Error("Recipient and WhatsApp template name are required.");
  }

  const components =
    bodyParameters.length > 0
      ? [
          {
            type: "body",
            parameters: bodyParameters.map((value) => ({
              type: "text",
              text: String(value).slice(0, 1_000),
            })),
          },
        ]
      : undefined;

  return postWhatsAppMessage(
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name,
        language: {
          code: language,
        },
        ...(components ? { components } : {}),
      },
    },
    signal
  );
}
