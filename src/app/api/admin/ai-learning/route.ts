import { NextRequest, NextResponse } from "next/server";

import {
  createLearnedAnswer,
  deleteLearnedAnswer,
  listLearnedAnswers,
  updateLearnedAnswer,
} from "@/lib/ai/learning";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await listLearnedAnswers() });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      question?: unknown;
      answer?: unknown;
      aliases?: unknown;
    };
    const item = await createLearnedAnswer({
      question: typeof body.question === "string" ? body.question : "",
      answer: typeof body.answer === "string" ? body.answer : "",
      aliases: Array.isArray(body.aliases)
        ? body.aliases.filter((value): value is string => typeof value === "string")
        : [],
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Răspunsul nu a putut fi salvat." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Lipsește identificatorul." }, { status: 400 });

    const item = await updateLearnedAnswer(id, {
      question: typeof body.question === "string" ? body.question : undefined,
      answer: typeof body.answer === "string" ? body.answer : undefined,
      aliases: Array.isArray(body.aliases)
        ? body.aliases.filter((value): value is string => typeof value === "string")
        : undefined,
      approved: typeof body.approved === "boolean" ? body.approved : undefined,
    });
    if (!item) return NextResponse.json({ error: "Răspunsul nu există." }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Răspunsul nu a putut fi actualizat." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Lipsește identificatorul." }, { status: 400 });
  const deleted = await deleteLearnedAnswer(id);
  return deleted
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Răspunsul nu există." }, { status: 404 });
}
