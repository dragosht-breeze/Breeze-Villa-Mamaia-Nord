import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { AnalyticsEventRecord } from "@/lib/analytics/analytics-types";

export interface AnalyticsRepository {
  save(event: AnalyticsEventRecord): Promise<void>;
}

/**
 * Append-only local analytics storage.
 *
 * NDJSON keeps each event on a separate line, so writing a new event does not
 * require reading or rewriting the existing file. This is sufficient for the
 * current single-instance Breeze Villa deployment and can later be replaced by
 * a database repository without changing the AI gateway or event bus.
 */
export class LocalFileAnalyticsRepository implements AnalyticsRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly filePath = path.join(
      process.cwd(),
      "storage",
      "analytics-events.ndjson"
    )
  ) {}

  save(event: AnalyticsEventRecord): Promise<void> {
    const serializedEvent = JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    this.writeQueue = this.writeQueue.then(async () => {
      await mkdir(path.dirname(this.filePath), { recursive: true });
      await appendFile(this.filePath, `${serializedEvent}\n`, "utf8");
    });

    return this.writeQueue;
  }
}

export class SafeAnalyticsRepository implements AnalyticsRepository {
  constructor(
    private readonly repository: AnalyticsRepository =
      new LocalFileAnalyticsRepository()
  ) {}

  async save(event: AnalyticsEventRecord) {
    try {
      await this.repository.save(event);
    } catch (error) {
      // Analytics must never interrupt a guest conversation.
      console.warn("Analytics event was not persisted", {
        type: event.type,
        conversationId: event.conversationId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
