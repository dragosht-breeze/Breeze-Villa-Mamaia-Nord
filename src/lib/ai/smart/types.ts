import type { ConversationContextType } from "@/lib/ai/context";

export type TravelStyle =
  | "family"
  | "couple"
  | "group"
  | "solo"
  | "unknown";

export type ConciergeNeed =
  | "accommodation"
  | "children"
  | "food"
  | "beach"
  | "shopping"
  | "transport"
  | "arrival"
  | "departure"
  | "support"
  | "local_activity";

export type GuestPreferences = {
  travelStyle: TravelStyle;
  adults?: number;
  childAges: number[];
  hasSmallChildren: boolean;
  budget?: number;
  wantsQuiet: boolean;
  wantsSeaView: boolean;
  wantsPool: boolean;
  wantsWalkableOptions: boolean;
  wantsPremiumComfort: boolean;
  needs: ConciergeNeed[];
};

export type SmartConciergeContext = {
  conversationContext: ConversationContextType;
  preferences: GuestPreferences;
  responseStrategy: string[];
  suitableUpsells: string[];
  avoid: string[];
};
