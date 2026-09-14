import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json().catch(() => null)
    : await request.text().catch(() => "");

  // În Sandbox păstrăm notificarea doar pentru diagnostic. O plată va fi
  // confirmată în sistem numai după adăugarea verificării criptografice IPN.
  console.info("NETOPIA Sandbox IPN received", {
    received: Boolean(payload),
    contentType,
  });

  return NextResponse.json({ errorCode: 0 });
}

