import { NextRequest, NextResponse } from "next/server";
import { setConversationMode, type ConversationMode } from "@/lib/communications";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as { mode?: ConversationMode };
  if (body.mode !== "ai" && body.mode !== "operator") return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  const conversation = await setConversationMode(id, body.mode);
  return conversation ? NextResponse.json({ conversation }) : NextResponse.json({ error: "Conversation not found" }, { status: 404 });
}
