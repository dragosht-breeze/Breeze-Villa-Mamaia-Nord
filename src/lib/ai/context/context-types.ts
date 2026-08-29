import type { GatewayMessage } from "@/lib/ai/gateway/types";

export type ConversationContextType =
  | "UNKNOWN"
  | "SEARCHING"
  | "BOOKING"
  | "HAS_RESERVATION"
  | "PRE_STAY"
  | "CHECKING_IN"
  | "IN_STAY"
  | "CHECK_OUT"
  | "POST_STAY"
  | "SUPPORT"
  | "LOCAL_GUIDE"
  | "HUMAN_HANDOFF";

export type ConversationContext = {
  type: ConversationContextType;
  confidence: number;
  matchedSignals: string[];
  latestUserMessage: string;
};

export type ContextDetectionInput = Pick<
  GatewayMessage,
  "role" | "content"
>[];