import type { LearnedAnswer } from "@/lib/ai/learning/types";

const STOP_WORDS = new Set([
  "a", "ai", "al", "ale", "am", "ar", "aveți", "aveti", "cu", "de", "din",
  "este", "exista", "există", "fi", "in", "în", "la", "mai", "ne", "o", "pe",
  "pentru", "pot", "se", "si", "și", "sunt", "un", "una", "unde", "vă", "va",
]);

function normalize(value: string) {
  return value
    .toLocaleLowerCase("ro-RO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return new Set(
    normalize(value)
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

function similarity(left: string, right: string) {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;
  if (
    normalizedLeft.length >= 8 &&
    (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))
  ) {
    return 0.9;
  }

  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  if (leftTokens.size < 2 || rightTokens.size < 2) return 0;

  let common = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) common += 1;
  });
  return common / Math.max(leftTokens.size, rightTokens.size);
}

export function findLearnedAnswer(
  message: string,
  answers: LearnedAnswer[]
): LearnedAnswer | null {
  let best: { answer: LearnedAnswer; score: number } | null = null;

  for (const answer of answers) {
    if (!answer.approved) continue;
    const candidates = [answer.question, ...answer.aliases];
    const score = Math.max(...candidates.map((candidate) => similarity(message, candidate)));
    if (score >= 0.72 && (!best || score > best.score)) {
      best = { answer, score };
    }
  }

  return best?.answer ?? null;
}
