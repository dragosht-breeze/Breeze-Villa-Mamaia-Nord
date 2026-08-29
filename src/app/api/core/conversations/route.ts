import { NextRequest, NextResponse } from "next/server";
import { addUnifiedMessage, listConversations, type AddMessageInput } from "@/lib/communications";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ conversations: await listConversations() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<AddMessageInput>;
  if (!body.channel || !body.channelIdentity || !body.direction || !body.author || !body.text?.trim()) {
    return NextResponse.json({ error: "channel, channelIdentity, direction, author and text are required" }, { status: 400 });
  }
  const conversation = await addUnifiedMessage(body as AddMessageInput);
  return NextResponse.json({ conversation }, { status: 201 });
}
