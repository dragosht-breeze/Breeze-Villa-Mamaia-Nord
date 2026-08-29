import { NextResponse } from "next/server";
import { listNotifications, markAllNotificationsRead, summarizeNotifications } from "@/lib/notifications/service";
export const dynamic = "force-dynamic";
export async function GET() { const notifications = await listNotifications(); return NextResponse.json({ notifications, summary: summarizeNotifications(notifications) }); }
export async function PATCH() { await markAllNotificationsRead(); const notifications = await listNotifications(); return NextResponse.json({ notifications, summary: summarizeNotifications(notifications) }); }
