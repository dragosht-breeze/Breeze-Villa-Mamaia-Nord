import { NextResponse } from "next/server";
import { getCustomerProfileDetails } from "@/lib/crm/profile-service";
import { updateCustomerMetadata } from "@/lib/crm/metadata-store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const customer = await getCustomerProfileDetails(id);
  if (!customer) return NextResponse.json({ ok: false, message: "Clientul nu a fost găsit." }, { status: 404 });
  return NextResponse.json({ ok: true, customer });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { tags?: unknown; notes?: unknown };
  const metadata = await updateCustomerMetadata(id, {
    tags: Array.isArray(body.tags) ? body.tags.filter((value): value is string => typeof value === "string") : undefined,
    notes: Array.isArray(body.notes) ? body.notes.filter((value): value is string => typeof value === "string") : undefined,
  });
  return NextResponse.json({ ok: true, metadata });
}
