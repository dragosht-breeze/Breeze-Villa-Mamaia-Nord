import type { SalesSession } from "@/lib/ai/brain/types";
import type { AvailabilitySummary } from "@/lib/ai/availability-tool";

export type AiLeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "converted"
  | "dismissed";

export type AiLeadMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AiLeadRecord = {
  id: string;
  conversationId: string;
  status: AiLeadStatus;
  createdAt: string;
  updatedAt: string;
  firstUserMessage: string;
  lastUserMessage: string;
  messageCount: number;
  sales: SalesSession;
  availability?: AvailabilitySummary;
  messages: AiLeadMessage[];
};

export type AiLeadSummary = {
  total: number;
  new: number;
  qualified: number;
  contacted: number;
  converted: number;
  dismissed: number;
  highIntent: number;
};
