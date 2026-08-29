import type { AvailabilitySummary } from "@/lib/ai/availability-tool";

export type AiChannel = "website" | "whatsapp" | "messenger" | "instagram";

export type GatewayMessage = {
  role: "user" | "assistant";
  content: string;
};

export type GatewayRequest = {
  channel: AiChannel;
  conversationId: string;
  messages: GatewayMessage[];
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    externalUserId?: string;
  };
};

export type GatewayResponse = {
  ok: true;
  answer: string;
  availability?: AvailabilitySummary;
  sales: {
    intent: string;
    stage: string;
    profile: string;
    leadScore: number;
  };
};

export type GatewayError = {
  ok: false;
  error: string;
  message: string;
};
