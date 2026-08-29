import { NextResponse } from "next/server";
import { listConversations } from "@/lib/communications";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ conversations: await listConversations(), generatedAt: new Date().toISOString() });
}
