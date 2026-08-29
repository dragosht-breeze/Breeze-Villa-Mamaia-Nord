import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const user = await findUserByEmail(email);
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "E-mail sau parolă incorectă." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  response.cookies.set(SESSION_COOKIE, createSessionToken({ sub: user.id, name: user.name, email: user.email, role: user.role }), sessionCookieOptions);
  return response;
}
