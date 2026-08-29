import { NextResponse } from "next/server";
import { getCrmData } from "@/lib/crm/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, ...(await getCrmData()) });
  } catch (error) {
    console.error("[CRM] Nu am putut genera lista clienților", error);
    return NextResponse.json({ ok: false, message: "CRM-ul nu a putut fi încărcat." }, { status: 500 });
  }
}
