export type SalesIntent =
  | "greeting"
  | "availability"
  | "price"
  | "recommendation"
  | "booking"
  | "payment"
  | "cancellation"
  | "location"
  | "facilities"
  | "comparison"
  | "objection"
  | "unknown";

export type ConversationStage =
  | "discovery"
  | "interest"
  | "comparison"
  | "booking";

export type GuestProfile = "family" | "couple" | "group" | "unknown";

export type SalesSession = {
  intent: SalesIntent;
  stage: ConversationStage;
  profile: GuestProfile;
  leadScore: number;
  adults?: number;
  childAges: number[];
  checkIn?: string;
  checkOut?: string;
  preferredApartment?: string;
  budget?: number;
  hasLiveAvailability: boolean;
};
