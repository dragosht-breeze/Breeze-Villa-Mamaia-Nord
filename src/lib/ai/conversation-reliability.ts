import type { GatewayMessage } from "@/lib/ai/gateway/types";

const AFFIRMATIVE_REPLIES = new Set([
  "da",
  "da te rog",
  "da va rog",
  "ok",
  "okay",
  "sigur",
  "perfect",
  "te rog",
  "va rog",
  "hai",
  "bine",
  "desigur",
]);

const NEGATIVE_REPLIES = new Set(["nu", "nu multumesc", "nu merci"]);

const GENERIC_LOCAL_CATEGORIES: Array<{
  patterns: RegExp[];
  label: string;
  searchQuery: string;
}> = [
  {
    patterns: [
      /\bsaorm(?:a|e|erie|erii)\b/i,
      /\bshaorm(?:a|e|erie|erii)\b/i,
      /\bshawarma\b/i,
      /\bkebab\b/i,
    ],
    label: "șaormerii",
    searchQuery: "șaormerie Mamaia Nord Năvodari",
  },
  {
    patterns: [/\bpizzeri(?:e|i)\b/i, /\bpizza\b/i],
    label: "pizzerii",
    searchQuery: "pizzerie Mamaia Nord Năvodari",
  },
  {
    patterns: [/\bburger(?:i|ie)?\b/i],
    label: "burgeri",
    searchQuery: "burger Mamaia Nord Năvodari",
  },
  {
    patterns: [/\bcofetari(?:e|i)\b/i, /\bprajitur/i],
    label: "cofetării",
    searchQuery: "cofetărie Mamaia Nord Năvodari",
  },
  {
    patterns: [/\bpatiseri(?:e|i)\b/i],
    label: "patiserii",
    searchQuery: "patiserie Mamaia Nord Năvodari",
  },
  {
    patterns: [/\bspalatori(?:e|i)\b/i, /\bspalat masina\b/i],
    label: "spălătorii auto",
    searchQuery: "spălătorie auto Mamaia Nord Năvodari",
  },
  {
    patterns: [/\bbancomat\b/i, /\batm\b/i],
    label: "bancomate",
    searchQuery: "bancomat Mamaia Nord Năvodari",
  },
  {
    patterns: [/\bcafenea\b/i, /\bcafea\b/i],
    label: "cafenele",
    searchQuery: "cafenea Mamaia Nord Năvodari",
  },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[!?.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function isAffirmativeReply(value: string) {
  return AFFIRMATIVE_REPLIES.has(normalize(value));
}

export function isNegativeReply(value: string) {
  return NEGATIVE_REPLIES.has(normalize(value));
}

export function isShortFollowUp(value: string) {
  const normalized = normalize(value);

  return (
    normalized.split(" ").length <= 4 &&
    (isAffirmativeReply(normalized) ||
      isNegativeReply(normalized) ||
      /^(prima|primul|prima varianta|cea mai apropiata|cel mai apropiat|a doua|al doilea)$/.test(
        normalized
      ))
  );
}

export function detectGenericLocalCategory(value: string) {
  const normalized = normalize(value);

  return GENERIC_LOCAL_CATEGORIES.find((category) =>
    category.patterns.some((pattern) => pattern.test(normalized))
  );
}

function previousMeaningfulUserMessage(messages: GatewayMessage[]) {
  const userMessages = messages.filter((message) => message.role === "user");

  return userMessages.slice(0, -1).reverse().find((message) => {
    const normalized = normalize(message.content);
    return normalized.length > 2 && !isShortFollowUp(normalized);
  });
}

function lastAssistantMessage(messages: GatewayMessage[]) {
  return messages
    .slice(0, -1)
    .reverse()
    .find((message) => message.role === "assistant");
}

export function resolveDeterministicLocalGuideAnswer(
  messages: GatewayMessage[],
  channel: "website" | "whatsapp" | "messenger" | "instagram"
) {
  const latest = messages.at(-1);

  if (!latest || latest.role !== "user") return null;

  let category = detectGenericLocalCategory(latest.content);
  const affirmative = isAffirmativeReply(latest.content);

  if (!category && affirmative) {
    const previousUser = previousMeaningfulUserMessage(messages);
    const previousAssistant = lastAssistantMessage(messages);
    const assistantOfferedMap = previousAssistant
      ? /google maps|deschid(?:e|em)|loca(?:t|ț)ia|hart/i.test(
          previousAssistant.content
        )
      : false;

    if (previousUser && assistantOfferedMap) {
      category = detectGenericLocalCategory(previousUser.content);
    }
  }

  if (!category) return null;

  const url = mapsSearchUrl(category.searchQuery);
  const link =
    channel === "website"
      ? `[Vezi ${category.label} în Google Maps](${url})`
      : `${url}`;

  if (affirmative) {
    return `Sigur — aici poți vedea opțiunile actuale din Mamaia Nord și poți porni navigarea direct din telefon:\n\n${link}`;
  }

  return `Nu am încă o recomandare verificată de Breeze Villa pentru această categorie, așa că nu vreau să inventez un local. Poți vedea opțiunile actuale din Mamaia Nord, împreună cu programul, recenziile și traseul calculat de Google Maps:\n\n${link}`;
}

export function mergeConversationHistory(
  storedMessages: GatewayMessage[],
  incomingMessages: GatewayMessage[],
  maxMessages: number
) {
  const stored = storedMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  const incoming = incomingMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const maxOverlap = Math.min(stored.length, incoming.length);
  let overlap = 0;

  for (let size = maxOverlap; size > 0; size -= 1) {
    const storedTail = stored.slice(-size);
    const incomingHead = incoming.slice(0, size);
    const matches = storedTail.every(
      (message, index) =>
        message.role === incomingHead[index]?.role &&
        message.content === incomingHead[index]?.content
    );

    if (matches) {
      overlap = size;
      break;
    }
  }

  return [...stored, ...incoming.slice(overlap)].slice(-maxMessages);
}

export function buildConversationReliabilityPrompt(messages: GatewayMessage[]) {
  const userMessageCount = messages.filter(
    (message) => message.role === "user"
  ).length;
  const latest = messages.at(-1)?.content ?? "";

  return `CONTINUITATEA CONVERSAȚIEI
- Număr de intervenții ale utilizatorului în conversația disponibilă: ${userMessageCount}.
- Ultimul mesaj este un follow-up scurt: ${isShortFollowUp(latest) ? "da" : "nu"}.
- Salută numai când răspunzi primului mesaj real al utilizatorului. Nu repeta niciodată salutul într-o conversație deja începută.
- Pentru răspunsuri precum „da”, „ok”, „sigur”, „prima” sau „cea mai apropiată”, leagă răspunsul de ultima întrebare și de ultima acțiune propusă.
- Nu promite „cel mai scurt drum”, trafic live sau distanță exactă. Spune că Google Maps calculează traseul de la locația utilizatorului.
- Dacă o categorie locală nu este în ghidul verificat, nu inventa nume de localuri. Oferă o căutare Google Maps sau cere o preferință relevantă.
- Nu răspunde cu mesajul generic de întâmpinare când există deja mesaje anterioare.`;
}
