import type { GatewayMessage } from "@/lib/ai/gateway/types";
import type {
  ConciergeNeed,
  GuestPreferences,
  TravelStyle,
} from "./types";

type MessageLike = Pick<GatewayMessage, "role" | "content">;

function normalize(value: string) {
  return value
    .toLocaleLowerCase("ro-RO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, signals: string[]) {
  return signals.some((signal) => text.includes(signal));
}

function extractNumberBefore(text: string, labels: string[]) {
  for (const label of labels) {
    const match = text.match(new RegExp(`(\\d{1,2})\\s*${label}`, "i"));
    if (match) return Number(match[1]);
  }
  return undefined;
}

function extractChildAges(text: string) {
  const ages = new Set<number>();
  const patterns = [
    /(?:copii|copil|varste|ani)(?:\s+de)?\s+([\d,\s+si]+)/gi,
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

function inferTravelStyle(
  text: string,
  adults?: number,
  childAges: number[] = []
): TravelStyle {
  if (childAges.length > 0 || includesAny(text, ["cu copiii", "familie", "copil"])) {
    return "family";
  }
  if (includesAny(text, ["singur", "singura", "solo"])) return "solo";
  if (adults === 2 || includesAny(text, ["cuplu", "doi adulti", "2 adulti"])) {
    return "couple";
  }
  if ((adults && adults >= 3) || includesAny(text, ["grup", "prieteni"])) {
    return "group";
  }
  return "unknown";
}

function detectNeeds(text: string): ConciergeNeed[] {
  const needs = new Set<ConciergeNeed>();

  if (includesAny(text, ["apartament", "cazare", "rezerv", "disponibil", "pret"])) {
    needs.add("accommodation");
  }
  if (includesAny(text, ["copil", "copii", "loc de joaca", "patut"])) {
    needs.add("children");
  }
  if (includesAny(text, ["manc", "restaurant", "peste", "cafea", "livrare"])) {
    needs.add("food");
  }
  if (includesAny(text, ["plaja", "mare", "sezlong"])) needs.add("beach");
  if (includesAny(text, ["magazin", "supermarket", "farmacie", "bancomat"])) {
    needs.add("shopping");
  }
  if (includesAny(text, ["transport", "transfer", "taxi", "autobuz", "parcare"])) {
    needs.add("transport");
  }
  if (includesAny(text, ["ajung", "sosim", "check-in", "check in", "intram"])) {
    needs.add("arrival");
  }
  if (includesAny(text, ["plecam", "check-out", "check out", "eliberam"])) {
    needs.add("departure");
  }
  if (includesAny(text, ["nu merge", "defect", "problema", "stricat", "ajutor"])) {
    needs.add("support");
  }
  if (includesAny(text, ["ce facem", "activitati", "delfinariu", "aqua", "vizitam"])) {
    needs.add("local_activity");
  }

  return [...needs];
}

export function detectGuestPreferences(messages: MessageLike[]): GuestPreferences {
  const text = normalize(
    messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join(" ")
  );

  const adults = extractNumberBefore(text, ["adulti", "adult"]);
  const childAges = extractChildAges(text);
  const budgetMatch = text.match(
    /(?:buget|maximum|maxim|pana la)\s*(?:de)?\s*(\d{3,6})\s*(?:lei|ron)?/i
  );

  return {
    travelStyle: inferTravelStyle(text, adults, childAges),
    adults,
    childAges,
    hasSmallChildren:
      childAges.some((age) => age <= 6) ||
      includesAny(text, ["bebelus", "bebe", "copil mic", "patut"]),
    budget: budgetMatch ? Number(budgetMatch[1]) : undefined,
    wantsQuiet: includesAny(text, ["liniste", "linistit", "fara zgomot", "relaxare"]),
    wantsSeaView: includesAny(text, ["vedere la mare", "sea view", "spre mare"]),
    wantsPool: includesAny(text, ["piscina", "pool"]),
    wantsWalkableOptions: includesAny(text, ["aproape", "pe jos", "fara masina"]),
    wantsPremiumComfort: includesAny(text, ["premium", "lux", "spatios", "confort", "superior"]),
    needs: detectNeeds(text),
  };
}
