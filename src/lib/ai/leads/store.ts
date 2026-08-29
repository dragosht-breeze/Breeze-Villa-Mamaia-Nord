import { createHash } from "node:crypto";

import { JsonFileRepository } from "@/lib/data";
import type { AvailabilitySummary } from "@/lib/ai/availability-tool";
import type { SalesSession } from "@/lib/ai/brain/types";
import type {
  AiLeadMessage,
  AiLeadRecord,
  AiLeadStatus,
  AiLeadSummary,
} from "@/lib/ai/leads/types";

type StoreShape = {
  leads: Record<string, AiLeadRecord>;
};

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_STORED_MESSAGES = 100;

const repository = new JsonFileRepository<StoreShape>({
  fileName: "ai-leads.json",
  createDefault: () => ({ leads: {} }),
  normalize(value) {
    const parsed = (value ?? {}) as Partial<StoreShape>;

    return {
      leads:
        parsed.leads && typeof parsed.leads === "object"
          ? parsed.leads
          : {},
    };
  },
});

function cleanConversationId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}

function leadId(conversationId: string) {
  return createHash("sha1")
    .update(conversationId)
    .digest("hex")
    .slice(0, 18);
}

function cleanIncomingMessages(messages: IncomingMessage[]) {
  return messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 2_000),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-30);
}

function messagesMatch(
  left: Pick<AiLeadMessage, "role" | "content">,
  right: IncomingMessage
) {
  return left.role === right.role && left.content === right.content;
}

function findOverlap(
  existing: AiLeadMessage[],
  incoming: IncomingMessage[]
) {
  const maxOverlap = Math.min(existing.length, incoming.length);

  for (let size = maxOverlap; size > 0; size -= 1) {
    let matches = true;

    for (let index = 0; index < size; index += 1) {
      const existingMessage = existing[existing.length - size + index];
      const incomingMessage = incoming[index];

      if (!messagesMatch(existingMessage, incomingMessage)) {
        matches = false;
        break;
      }
    }

    if (matches) return size;
  }

  return 0;
}

function mergeMessages(
  existing: AiLeadMessage[],
  incomingValue: IncomingMessage[],
  now: string
) {
  const incoming = cleanIncomingMessages(incomingValue);

  if (existing.length === 0) {
    return incoming.map((message) => ({
      ...message,
      createdAt: now,
    }));
  }

  const overlap = findOverlap(existing, incoming);
  const newMessages = incoming.slice(overlap).map((message) => ({
    ...message,
    createdAt: now,
  }));

  return [...existing, ...newMessages].slice(-MAX_STORED_MESSAGES);
}

function inferInitialStatus(session: SalesSession): AiLeadStatus {
  if (session.leadScore >= 70 || session.stage === "booking") {
    return "qualified";
  }

  return "new";
}

export async function upsertAiLead(input: {
  conversationId: string;
  messages: IncomingMessage[];
  sales: SalesSession;
  availability?: AvailabilitySummary;
}) {
  const conversationId = cleanConversationId(input.conversationId);

  if (!conversationId) return null;

  const now = new Date().toISOString();
  const id = leadId(conversationId);
  let next!: AiLeadRecord;

  await repository.update((store) => {
    const current = store.leads[id];
    const messages = mergeMessages(
      current?.messages ?? [],
      input.messages,
      now
    );
    const userMessages = messages.filter(
      (message) => message.role === "user"
    );

    next = {
      id,
      conversationId,
      status:
        current?.status && current.status !== "new"
          ? current.status
          : inferInitialStatus(input.sales),
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
      firstUserMessage:
        current?.firstUserMessage ?? userMessages[0]?.content ?? "",
      lastUserMessage: userMessages.at(-1)?.content ?? "",
      messageCount: messages.length,
      sales: input.sales,
      availability: input.availability ?? current?.availability,
      messages,
    };

    return {
      leads: {
        ...store.leads,
        [id]: next,
      },
    };
  });

  return next;
}


export async function getAiLeadByConversationId(
  value: string
) {
  const conversationId = cleanConversationId(value);

  if (!conversationId) return null;

  const store = await repository.read();
  return store.leads[leadId(conversationId)] ?? null;
}

export async function listAiLeads() {
  const store = await repository.read();
  const leads = Object.values(store.leads).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  const summary: AiLeadSummary = {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    qualified: leads.filter((lead) => lead.status === "qualified").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    converted: leads.filter((lead) => lead.status === "converted").length,
    dismissed: leads.filter((lead) => lead.status === "dismissed").length,
    highIntent: leads.filter((lead) => lead.sales.leadScore >= 70).length,
  };

  return {
    leads,
    summary,
    generatedAt: new Date().toISOString(),
  };
}

export async function updateAiLeadStatus(
  id: string,
  status: AiLeadStatus
) {
  let updated: AiLeadRecord | null = null;

  await repository.update((store) => {
    const current = store.leads[id];

    if (!current) return store;

    updated = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
    };

    return {
      leads: {
        ...store.leads,
        [id]: updated,
      },
    };
  });

  return updated;
}
