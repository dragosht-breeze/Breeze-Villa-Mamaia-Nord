CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "analytics_events_created_at_idx"
ON "analytics_events"("created_at");

CREATE INDEX "analytics_events_type_created_at_idx"
ON "analytics_events"("type", "created_at");

CREATE INDEX "analytics_events_conversation_id_idx"
ON "analytics_events"("conversation_id");

CREATE INDEX "analytics_events_channel_created_at_idx"
ON "analytics_events"("channel", "created_at");
