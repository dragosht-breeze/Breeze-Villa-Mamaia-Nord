import { detectIntent } from "./intent";
import type {
  ConversationStage,
  GuestProfile,
  SalesSession,
} from "./types";

type MessageLike = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_SESSION: SalesSession = {
  intent: "unknown",
  stage: "discovery",
  profile: "unknown",
  leadScore: 0,
  childAges: [],
  hasLiveAvailability: false,
};

function lastNumberBefore(text: string, words: string[]) {
  for (const word of words) {
    const pattern = new RegExp(`(\\d{1,2})\\s+${word}`, "i");
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }

  return undefined;
}

function extractChildAges(text: string) {
  const ages = new Set<number>();
  const patterns = [
    /(?:copii|copil|vârste|varste|ani)(?:\s+de)?\s+([\d,\sși]+)/gi,
    /(\d{1,2})\s*(?:ani|an)(?=\D|$)/gi,
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const values = match[1]?.match(/\d{1,2}/g) ?? [];
      for (const value of values) {
        const age = Number(value);
        if (age >= 0 && age <= 17) ages.add(age);
      }
    }
  }

  return [...ages].slice(0, 12);
}

function extractBudget(text: string) {
  const match = text.match(/(?:buget|maximum|maxim|până la|pana la)\s*(?:de)?\s*(\d{3,6})\s*(?:lei|ron)?/i);
  return match ? Number(match[1]) : undefined;
}

function inferProfile(adults?: number, childAges: number[] = []): GuestProfile {
  if (childAges.length > 0) return "family";
  if (adults === 2) return "couple";
  if (adults && adults >= 3) return "group";
  return "unknown";
}

function inferStage(session: SalesSession): ConversationStage {
  if (session.intent === "booking" || session.hasLiveAvailability) return "booking";
  if (session.intent === "comparison" || session.intent === "objection") {
    return "comparison";
  }
  if (
    session.intent === "availability" ||
    session.intent === "price" ||
    session.intent === "recommendation" ||
    session.checkIn ||
    session.adults
  ) {
    return "interest";
  }
  return "discovery";
}

export function buildSalesSession(messages: MessageLike[]): SalesSession {
  const userMessages = messages.filter((message) => message.role === "user");
  const latest = userMessages.at(-1)?.content ?? "";
  const combined = userMessages.map((message) => message.content).join(" ");

  const adults = lastNumberBefore(combined, ["adulți", "adulti", "adult"]);
  const childAges = extractChildAges(combined);
  const budget = extractBudget(combined);

  const session: SalesSession = {
    ...DEFAULT_SESSION,
    intent: detectIntent(latest),
    adults,
    childAges,
    budget,
    profile: inferProfile(adults, childAges),
  };

  session.stage = inferStage(session);
  return session;
}

export function mergeAvailabilityIntoSession(
  session: SalesSession,
  availability: {
    ok: boolean;
    checkIn: string;
    checkOut: string;
    adults: number;
    childAges: number[];
    recommendations: Array<{ apartments: Array<{ slug: string }> }>;
  }
): SalesSession {
  return {
    ...session,
    checkIn: availability.checkIn || session.checkIn,
    checkOut: availability.checkOut || session.checkOut,
    adults: availability.adults || session.adults,
    childAges:
      availability.childAges.length > 0
        ? availability.childAges
        : session.childAges,
    preferredApartment:
      availability.recommendations[0]?.apartments[0]?.slug ??
      session.preferredApartment,
    hasLiveAvailability: availability.ok,
    stage: availability.ok ? "booking" : session.stage,
  };
}
