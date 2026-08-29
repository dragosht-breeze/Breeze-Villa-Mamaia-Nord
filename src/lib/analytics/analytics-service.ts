import { analyticsEventBus } from "@/lib/analytics/event-bus";
import {
  AnalyticsEvent,
  type AnalyticsMetadata,
} from "@/lib/analytics/analytics-types";
import {
  SafeAnalyticsRepository,
  type AnalyticsRepository,
} from "@/lib/analytics/storage";
import type { AiChannel } from "@/lib/ai/gateway/types";

export type AnalyticsContext = {
  conversationId: string;
  channel: AiChannel;
};

class AnalyticsService {
  private initialized = false;

  constructor(
    private readonly repository: AnalyticsRepository =
      new SafeAnalyticsRepository()
  ) {}

  initialize() {
    if (this.initialized) return;
    this.initialized = true;

    Object.values(AnalyticsEvent).forEach((type) => {
      analyticsEventBus.subscribe(type, (event) =>
        this.repository.save(event)
      );
    });
  }

  async log(
    context: AnalyticsContext,
    type: AnalyticsEvent,
    metadata: AnalyticsMetadata = {}
  ) {
    this.initialize();
    return analyticsEventBus.publish({ ...context, type, metadata });
  }

  logConversationStart(context: AnalyticsContext) {
    return this.log(context, AnalyticsEvent.ConversationStarted);
  }

  logConversationEnd(
    context: AnalyticsContext,
    metadata: AnalyticsMetadata = {}
  ) {
    return this.log(context, AnalyticsEvent.ConversationEnded, metadata);
  }

  logAvailability(
    context: AnalyticsContext,
    metadata: AnalyticsMetadata = {}
  ) {
    return this.log(context, AnalyticsEvent.AvailabilityChecked, metadata);
  }

  logUnknownQuestion(
    context: AnalyticsContext,
    metadata: AnalyticsMetadata = {}
  ) {
    return this.log(context, AnalyticsEvent.UnknownQuestion, metadata);
  }

  logLocalGuide(context: AnalyticsContext) {
    return this.log(context, AnalyticsEvent.LocalGuideRequested);
  }

  logWeather(context: AnalyticsContext) {
    return this.log(context, AnalyticsEvent.WeatherRequested);
  }

  logSupport(context: AnalyticsContext) {
    return this.log(context, AnalyticsEvent.SupportRequested);
  }
}

const globalForAnalytics = globalThis as unknown as {
  breezeAnalyticsService?: AnalyticsService;
};

export const analyticsService =
  globalForAnalytics.breezeAnalyticsService ?? new AnalyticsService();

if (process.env.NODE_ENV !== "production") {
  globalForAnalytics.breezeAnalyticsService = analyticsService;
}
