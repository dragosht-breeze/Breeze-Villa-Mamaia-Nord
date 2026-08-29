import { randomUUID } from "node:crypto";

import type {
  AnalyticsEventHandler,
  AnalyticsEventRecord,
  PublishAnalyticsEventInput,
} from "@/lib/analytics/analytics-types";
import { AnalyticsEvent } from "@/lib/analytics/analytics-types";

class AnalyticsEventBus {
  private readonly subscribers = new Map<
    AnalyticsEvent,
    Set<AnalyticsEventHandler>
  >();

  subscribe(type: AnalyticsEvent, handler: AnalyticsEventHandler) {
    const handlers = this.subscribers.get(type) ?? new Set();
    handlers.add(handler);
    this.subscribers.set(type, handlers);

    return () => this.unsubscribe(type, handler);
  }

  unsubscribe(type: AnalyticsEvent, handler: AnalyticsEventHandler) {
    const handlers = this.subscribers.get(type);
    if (!handlers) return;

    handlers.delete(handler);
    if (handlers.size === 0) this.subscribers.delete(type);
  }

  async publish(input: PublishAnalyticsEventInput) {
    const event: AnalyticsEventRecord = {
      ...input,
      id: input.id ?? randomUUID(),
      timestamp: input.timestamp ?? new Date(),
    };

    const handlers = this.subscribers.get(event.type);
    if (!handlers || handlers.size === 0) return event;

    await Promise.allSettled(
      Array.from(handlers).map((handler) => handler(event))
    );

    return event;
  }
}

const globalForAnalytics = globalThis as unknown as {
  breezeAnalyticsEventBus?: AnalyticsEventBus;
};

export const analyticsEventBus =
  globalForAnalytics.breezeAnalyticsEventBus ?? new AnalyticsEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForAnalytics.breezeAnalyticsEventBus = analyticsEventBus;
}
