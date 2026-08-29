import { NextResponse } from "next/server";
import { deleteManualTask, updateTask } from "@/lib/tasks/service";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false, message: "Date invalide." }, { status: 400 });
  const task = await updateTask(id, body);
  if (!task) return NextResponse.json({ ok: false, message: "Taskul nu a fost găsit." }, { status: 404 });
  return NextResponse.json({ ok: true, task });
}

export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;
  const deleted = await deleteManualTask(id);
  if (!deleted) return NextResponse.json({ ok: false, message: "Doar taskurile manuale pot fi șterse." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
