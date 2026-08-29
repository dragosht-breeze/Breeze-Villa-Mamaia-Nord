import { NextRequest, NextResponse } from "next/server";
import { addUnifiedMessage, listConversations } from "@/lib/communications";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as { text?: string };
  const existing = (await listConversations()).find((item) => item.id === id);
  if (!existing) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  if (!body.text?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const conversation = await addUnifiedMessage({
    conversationId: id,
    channel: existing.channel,
    channelIdentity: existing.channelIdentity,
    direction: "outbound",
    author: "operator",
    text: body.text,
  });
  return NextResponse.json({ conversation });
}
