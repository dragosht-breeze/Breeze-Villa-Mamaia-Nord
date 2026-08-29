import { NextRequest, NextResponse } from "next/server";

const COOKIE = "breeze_session";
function getSecret() {
  const configuredSecret = process.env.BREEZE_AUTH_SECRET?.trim();

  if (configuredSecret) {
    if (process.env.NODE_ENV === "production" && configuredSecret.length < 32) {
      throw new Error(
        "BREEZE_AUTH_SECRET trebuie să aibă minimum 32 de caractere în producție."
      );
    }

    return configuredSecret;
  }

  throw new Error(
    "BREEZE_AUTH_SECRET lipsește. Configurează secretul înainte de pornire."
  );
}

async function verify(token: string | undefined) {
  if (!token) return null;

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  const expected = Buffer.from(signed).toString("base64url");

  if (expected.length !== signature.length) return null;

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }
  if (difference !== 0) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );

    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

function allowed(role: string, pathname: string) {
  if (role === "ADMIN") return true;

  const rules: Record<string, string[]> = {
    MANAGER: [
      "/admin",
      "/admin/analytics",
      "/admin/operations",
      "/admin/calendar",
      "/admin/reservations",
      "/admin/crm",
      "/admin/rates",
      "/admin/payments",
      "/admin/housekeeping",
      "/admin/booking-sync",
      "/api/admin",
    ],
    RECEPTION: [
      "/admin",
      "/admin/operations",
      "/admin/calendar",
      "/admin/reservations",
      "/admin/crm",
      "/admin/payments",
      "/api/admin/dashboard",
      "/api/admin/operations",
      "/api/admin/operational-calendar",
      "/api/admin/crm",
      "/api/admin/financial",
      "/api/admin/search",
    ],
    HOUSEKEEPING: [
      "/admin",
      "/admin/operations",
      "/admin/calendar",
      "/admin/housekeeping",
      "/api/admin/dashboard",
      "/api/admin/operations",
      "/api/admin/operational-calendar",
      "/api/admin/housekeeping",
    ],
  };

  return (rules[role] || []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const session = await verify(request.cookies.get(COOKIE)?.value);
  const pathname = request.nextUrl.pathname;

  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!allowed(session.role, pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
