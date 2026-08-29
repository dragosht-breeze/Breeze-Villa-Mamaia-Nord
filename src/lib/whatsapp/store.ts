import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { WhatsAppHistoryMessage } from "@/lib/whatsapp/types";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const HISTORY_FILE = path.join(STORAGE_DIR, "whatsapp-history.json");
const DEDUPE_FILE = path.join(STORAGE_DIR, "whatsapp-processed-ids.json");
const MAX_MESSAGES_PER_CONVERSATION = 20;
const MAX_PROCESSED_IDS = 2_000;

type HistoryStore = Record<string, WhatsAppHistoryMessage[]>;

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
    if (code !== "ENOENT") {
      console.warn("WhatsApp storage read failed", { filePath, error });
    }
    return fallback;
  }
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function getWhatsAppHistory(phone: string) {
  const store = await readJson<HistoryStore>(HISTORY_FILE, {});
  return store[phone] ?? [];
}

export async function appendWhatsAppHistory(
  phone: string,
  messages: WhatsAppHistoryMessage[]
) {
  const store = await readJson<HistoryStore>(HISTORY_FILE, {});
  store[phone] = [...(store[phone] ?? []), ...messages].slice(
    -MAX_MESSAGES_PER_CONVERSATION
  );
  await writeJson(HISTORY_FILE, store);
}

export async function claimWhatsAppMessage(messageId: string) {
  const ids = await readJson<string[]>(DEDUPE_FILE, []);

  if (ids.includes(messageId)) {
    return false;
  }

  ids.push(messageId);
  await writeJson(DEDUPE_FILE, ids.slice(-MAX_PROCESSED_IDS));
  return true;
}
