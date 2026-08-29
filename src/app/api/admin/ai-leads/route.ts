import { NextResponse } from "next/server";

import { listAiLeads } from "@/lib/ai/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      ...(await listAiLeads()),
    });
  } catch (error) {
    console.error("[AI Leads] Lista nu a putut fi încărcată", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Lead-urile AI nu au putut fi încărcate.",
      },
      { status: 500 }
    );
  }
}
