import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type {
  CreateLearnedAnswerInput,
  LearnedAnswer,
  UpdateLearnedAnswerInput,
} from "@/lib/ai/learning/types";

const FILE_PATH = path.join(process.cwd(), "storage", "ai-learned-answers.json");

let writeQueue: Promise<void> = Promise.resolve();

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function sanitizeAliases(values: string[] | undefined) {
  return Array.from(
    new Set(
      (values ?? [])
        .map(normalizeText)
        .filter(Boolean)
        .slice(0, 12)
    )
  );
}

async function readAll(): Promise<LearnedAnswer[]> {
  try {
    const content = await readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is LearnedAnswer => {
      if (!item || typeof item !== "object") return false;
      const value = item as Partial<LearnedAnswer>;
      return (
        typeof value.id === "string" &&
        typeof value.question === "string" &&
        typeof value.answer === "string" &&
        Array.isArray(value.aliases) &&
        typeof value.approved === "boolean" &&
        typeof value.createdAt === "string" &&
        typeof value.updatedAt === "string"
      );
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (code !== "ENOENT") {
      console.warn("AI learned answers could not be read", error);
    }
    return [];
  }
}

async function persist(items: LearnedAnswer[]) {
  writeQueue = writeQueue.then(async () => {
    await mkdir(path.dirname(FILE_PATH), { recursive: true });
    await writeFile(FILE_PATH, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  });
  return writeQueue;
}

export async function listLearnedAnswers() {
  const items = await readAll();
  return items.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function listApprovedLearnedAnswers() {
  return (await listLearnedAnswers()).filter((item) => item.approved);
}

export async function createLearnedAnswer(input: CreateLearnedAnswerInput) {
  const question = normalizeText(input.question);
  const answer = normalizeText(input.answer);

  if (question.length < 3 || answer.length < 3) {
    throw new Error("Întrebarea și răspunsul trebuie completate.");
  }

  const items = await readAll();
  const now = new Date().toISOString();
  const existingIndex = items.findIndex(
    (item) => normalizeText(item.question).toLocaleLowerCase("ro-RO") === question.toLocaleLowerCase("ro-RO")
  );

  if (existingIndex >= 0) {
    const updated: LearnedAnswer = {
      ...items[existingIndex],
      answer: answer.slice(0, 2_000),
      aliases: sanitizeAliases(input.aliases),
      approved: true,
      updatedAt: now,
    };
    items[existingIndex] = updated;
    await persist(items);
    return updated;
  }

  const item: LearnedAnswer = {
    id: randomUUID(),
    question: question.slice(0, 500),
    answer: answer.slice(0, 2_000),
    aliases: sanitizeAliases(input.aliases),
    approved: true,
    createdAt: now,
    updatedAt: now,
  };

  items.push(item);
  await persist(items);
  return item;
}

export async function updateLearnedAnswer(
  id: string,
  input: UpdateLearnedAnswerInput
) {
  const items = await readAll();
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const current = items[index];
  const next: LearnedAnswer = {
    ...current,
    question:
      typeof input.question === "string"
        ? normalizeText(input.question).slice(0, 500)
        : current.question,
    answer:
      typeof input.answer === "string"
        ? normalizeText(input.answer).slice(0, 2_000)
        : current.answer,
    aliases: Array.isArray(input.aliases)
      ? sanitizeAliases(input.aliases)
      : current.aliases,
    approved:
      typeof input.approved === "boolean" ? input.approved : current.approved,
    updatedAt: new Date().toISOString(),
  };

  if (next.question.length < 3 || next.answer.length < 3) {
    throw new Error("Întrebarea și răspunsul trebuie completate.");
  }

  items[index] = next;
  await persist(items);
  return next;
}

export async function deleteLearnedAnswer(id: string) {
  const items = await readAll();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await persist(next);
  return true;
}
