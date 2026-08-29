export type WhatsAppTextMessage = {
  from: string;
  messageId: string;
  timestamp?: string;
  text: string;
  contactName?: string;
};

export type WhatsAppSendResult = {
  ok: true;
  messageId?: string;
};

export type WhatsAppHistoryMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};
