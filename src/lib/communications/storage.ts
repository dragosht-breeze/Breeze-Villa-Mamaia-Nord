import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AddMessageInput, ConversationMode, ConversationStore, UnifiedConversation, UnifiedMessage } from "./types";

const FILE_PATH = path.join(process.cwd(), "storage", "unified-conversations.json");
const EMPTY: ConversationStore = { version: 1, conversations: [] };
let queue: Promise<unknown> = Promise.resolve();

async function readStore(): Promise<ConversationStore> {
  try {
    const parsed = JSON.parse(await readFile(FILE_PATH, "utf8")) as ConversationStore;
    return parsed?.version === 1 && Array.isArray(parsed.conversations) ? parsed : EMPTY;
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") console.warn("Unified inbox storage could not be read", error);
    return { ...EMPTY, conversations: [] };
  }
}

async function writeStore(store: ConversationStore) {
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  const temporary = `${FILE_PATH}.tmp`;
  await writeFile(temporary, JSON.stringify(store, null, 2), "utf8");
  await rename(temporary, FILE_PATH);
}

function serial<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation, operation);
  queue = result.then(() => undefined, () => undefined);
  return result;
}

export async function listConversations(): Promise<UnifiedConversation[]> {
  const store = await readStore();
  return [...store.conversations].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function addUnifiedMessage(input: AddMessageInput): Promise<UnifiedConversation> {
  return serial(async () => {
    const store = await readStore();
    const now = new Date().toISOString();
    let conversation = input.conversationId
      ? store.conversations.find((item) => item.id === input.conversationId)
      : store.conversations.find((item) => item.channel === input.channel && item.channelIdentity === input.channelIdentity && item.status === "open");

    if (!conversation) {
      conversation = {
        id: input.conversationId || randomUUID(),
        displayName: input.displayName?.trim() || input.channelIdentity,
        channel: input.channel,
        channelIdentity: input.channelIdentity,
        mode: "ai",
        status: "open",
        unreadCount: 0,
        createdAt: now,
        updatedAt: now,
        messages: [],
        metadata: input.metadata,
      };
      store.conversations.push(conversation);
    }

    if (input.externalId && conversation.messages.some((message) => message.externalId === input.externalId)) return conversation;

    const message: UnifiedMessage = {
      id: randomUUID(),
      conversationId: conversation.id,
      channel: input.channel,
      direction: input.direction,
      author: input.author,
      text: input.text.trim().slice(0, 8000),
      createdAt: now,
      externalId: input.externalId,
    };

    conversation.messages.push(message);
    conversation.updatedAt = now;
    conversation.lastMessage = message.text.slice(0, 180);
    if (input.displayName?.trim()) conversation.displayName = input.displayName.trim();
    if (input.metadata) conversation.metadata = { ...(conversation.metadata ?? {}), ...input.metadata };
    if (input.direction === "inbound") conversation.unreadCount += 1;

    await writeStore(store);
    return conversation;
  });
}

export async function setConversationMode(id: string, mode: ConversationMode): Promise<UnifiedConversation | null> {
  return serial(async () => {
    const store = await readStore();
    const conversation = store.conversations.find((item) => item.id === id);
    if (!conversation) return null;
    conversation.mode = mode;
    conversation.updatedAt = new Date().toISOString();
    await writeStore(store);
    return conversation;
  });
}

export async function markConversationRead(id: string): Promise<void> {
  return serial(async () => {
    const store = await readStore();
    const conversation = store.conversations.find((item) => item.id === id);
    if (!conversation || conversation.unreadCount === 0) return;
    conversation.unreadCount = 0;
    await writeStore(store);
  });
}
