import { NextResponse } from "next/server";

import { updateAiLeadStatus } from "@/lib/ai/leads/store";
import type { AiLeadStatus } from "@/lib/ai/leads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statuses = new Set<AiLeadStatus>([
  "new",
  "qualified",
  "contacted",
  "converted",
  "dismissed",
]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as { status?: AiLeadStatus };

  if (!body.status || !statuses.has(body.status)) {
    return NextResponse.json(
      { ok: false, message: "Status invalid." },
      { status: 400 }
    );
  }

  const lead = await updateAiLeadStatus(id, body.status);

  if (!lead) {
    return NextResponse.json(
      { ok: false, message: "Lead-ul nu a fost găsit." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, lead });
}
