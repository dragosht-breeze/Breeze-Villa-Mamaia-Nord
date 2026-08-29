import type { AiChannel } from "@/lib/ai/gateway/types";

export enum AnalyticsEvent {
  ConversationStarted = "ConversationStarted",
  ConversationEnded = "ConversationEnded",
  AvailabilityChecked = "AvailabilityChecked",
  BookingStarted = "BookingStarted",
  BookingCompleted = "BookingCompleted",
  UnknownQuestion = "UnknownQuestion",
  LocalGuideRequested = "LocalGuideRequested",
  WeatherRequested = "WeatherRequested",
  SupportRequested = "SupportRequested",
  PaymentRequested = "PaymentRequested",
  PaymentCompleted = "PaymentCompleted",
  TransferRequested = "TransferRequested",
  LateCheckoutRequested = "LateCheckoutRequested",
  EarlyCheckinRequested = "EarlyCheckinRequested",
}

export type AnalyticsMetadata = Record<
  string,
  string | number | boolean | null | string[] | number[]
>;

export type AnalyticsEventRecord = {
  id: string;
  type: AnalyticsEvent;
  timestamp: Date;
  channel: AiChannel;
  conversationId: string;
  metadata: AnalyticsMetadata;
};

export type PublishAnalyticsEventInput = Omit<
  AnalyticsEventRecord,
  "id" | "timestamp"
> & {
  id?: string;
  timestamp?: Date;
};

export type AnalyticsEventHandler = (
  event: AnalyticsEventRecord
) => void | Promise<void>;
