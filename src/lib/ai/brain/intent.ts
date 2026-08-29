import type { SalesIntent } from "./types";

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export function detectIntent(message: string): SalesIntent {
  const text = message.toLocaleLowerCase("ro-RO");

  if (includesAny(text, ["bună", "buna", "salut", "hello", "hi "])) {
    return "greeting";
  }

  if (
    includesAny(text, [
      "rezerv acum",
      "vreau să rezerv",
      "vreau sa rezerv",
      "continuăm rezervarea",
      "continui rezervarea",
      "book now",
    ])
  ) {
    return "booking";
  }

  if (
    includesAny(text, [
      "disponibil",
      "liber",
      "aveți loc",
      "aveti loc",
      "perioada",
      "check-in",
      "check in",
    ])
  ) {
    return "availability";
  }

  if (includesAny(text, ["preț", "pret", "costă", "costa", "tarif", "buget"])) {
    return "price";
  }

  if (
    includesAny(text, [
      "recomanzi",
      "recomandați",
      "recomandati",
      "potrivit",
      "ce apartament",
    ])
  ) {
    return "recommendation";
  }

  if (
    includesAny(text, [
      "card de vacanță",
      "card de vacanta",
      "edenred",
      "pluxee",
      "up românia",
      "plată",
      "plata",
      "avans",
    ])
  ) {
    return "payment";
  }

  if (includesAny(text, ["anulare", "anulez", "ramburs", "refund"])) {
    return "cancellation";
  }

  if (
    includesAny(text, [
      "unde este",
      "adresă",
      "adresa",
      "plajă",
      "plaja",
      "kaufland",
      "distanță",
      "distanta",
    ])
  ) {
    return "location";
  }

  if (
    includesAny(text, [
      "piscină",
      "piscina",
      "parcare",
      "wifi",
      "grătar",
      "gratar",
      "facilități",
      "facilitati",
      "aer condiționat",
      "aer conditionat",
    ])
  ) {
    return "facilities";
  }

  if (includesAny(text, ["compar", "diferența", "diferenta", "mai bun", "versus"])) {
    return "comparison";
  }

  if (
    includesAny(text, [
      "scump",
      "prea mult",
      "mai ieftin",
      "nu sunt sigur",
      "nu sunt hotărât",
      "nu sunt hotarat",
    ])
  ) {
    return "objection";
  }

  return "unknown";
}
