import type { WhatsAppTextMessage } from "@/lib/whatsapp/types";

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
          button?: { text?: string };
          interactive?: {
            button_reply?: { title?: string };
            list_reply?: { title?: string };
          };
        }>;
      };
    }>;
  }>;
};

export function extractWhatsAppTextMessages(
  payload: WhatsAppWebhookPayload
): WhatsAppTextMessage[] {
  const result: WhatsAppTextMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value;
      const contacts = value?.contacts ?? [];

      for (const message of value?.messages ?? []) {
        const from = message.from?.trim();
        const messageId = message.id?.trim();
        const text =
          message.text?.body?.trim() ||
          message.button?.text?.trim() ||
          message.interactive?.button_reply?.title?.trim() ||
          message.interactive?.list_reply?.title?.trim() ||
          "";

        if (!from || !messageId || !text) continue;

        const contactName = contacts.find(
          (contact) => contact.wa_id === from
        )?.profile?.name;

        result.push({
          from,
          messageId,
          timestamp: message.timestamp,
          text,
          contactName,
        });
      }
    }
  }

  return result;
}
