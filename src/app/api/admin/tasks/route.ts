import { NextResponse } from "next/server";
import { createManualTask, listTasks, summarizeTasks } from "@/lib/tasks/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json({ ok: true, tasks, summary: summarizeTasks(tasks) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { title?: string; dueAt?: string; [key: string]: unknown } | null;
  if (!body?.title?.trim() || !body.dueAt || Number.isNaN(Date.parse(body.dueAt))) {
    return NextResponse.json({ ok: false, message: "Titlul și termenul sunt obligatorii." }, { status: 400 });
  }
  const task = await createManualTask(body as Parameters<typeof createManualTask>[0]);
  return NextResponse.json({ ok: true, task }, { status: 201 });
}
