import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { AnalyticsEvent } from "@/lib/analytics/analytics-types";

type StoredEvent = {
  id: string;
  type: AnalyticsEvent;
  timestamp: string;
  channel: string;
  conversationId: string;
  metadata?: Record<string, unknown>;
};

function startOfTodayBucharest() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return new Date(`${get("year")}-${get("month")}-${get("day")}T00:00:00+03:00`);
}

function metadataLabel(event: StoredEvent) {
  const metadata = event.metadata ?? {};
  const candidate = metadata.question ?? metadata.query ?? metadata.intent ?? metadata.category;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

export async function GET() {
  const filePath = path.join(process.cwd(), "storage", "analytics-events.ndjson");
  let events: StoredEvent[] = [];

  try {
    const content = await readFile(filePath, "utf8");
    events = content
      .split(/\r?\n/)
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as StoredEvent];
        } catch {
          return [];
        }
      })
      .filter((event) => event.timestamp && event.type);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") {
      console.warn("AI dashboard analytics file could not be read", error);
    }
  }

  events.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  const todayStart = startOfTodayBucharest().getTime();
  const today = events.filter((event) => Date.parse(event.timestamp) >= todayStart);
  const count = (type: AnalyticsEvent, source = today) => source.filter((event) => event.type === type).length;
  const activeConversations = Math.max(
    0,
    count(AnalyticsEvent.ConversationStarted) - count(AnalyticsEvent.ConversationEnded)
  );

  const typeCounts = new Map<string, number>();
  events.forEach((event) => typeCounts.set(event.type, (typeCounts.get(event.type) ?? 0) + 1));

  const unknown = events
    .filter((event) => event.type === AnalyticsEvent.UnknownQuestion)
    .slice(0, 20)
    .map((event) => ({
      id: event.id,
      question: metadataLabel(event) ?? "Întrebare neclasificată",
      timestamp: event.timestamp,
      channel: event.channel,
    }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    stats: {
      conversationsToday: count(AnalyticsEvent.ConversationStarted),
      activeConversations,
      availabilityChecksToday: count(AnalyticsEvent.AvailabilityChecked),
      bookingStartedToday: count(AnalyticsEvent.BookingStarted),
      bookingCompletedToday: count(AnalyticsEvent.BookingCompleted),
      unknownQuestionsToday: count(AnalyticsEvent.UnknownQuestion),
    },
    topEvents: Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([type, total]) => ({ type, total })),
    recent: events.slice(0, 30).map((event) => ({
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      channel: event.channel,
      label: metadataLabel(event),
    })),
    unknown,
  });
}
