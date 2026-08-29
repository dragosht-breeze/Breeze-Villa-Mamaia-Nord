import { NextResponse } from "next/server";
import { markNotification } from "@/lib/notifications/service";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const body = await request.json() as { action?: "read" | "unread" | "dismiss" };
  if (!body.action || !["read","unread","dismiss"].includes(body.action)) return NextResponse.json({ error: "Acțiune invalidă." }, { status: 400 });
  await markNotification(decodeURIComponent(id), body.action); return NextResponse.json({ ok: true });
}
