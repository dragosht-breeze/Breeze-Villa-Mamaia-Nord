import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createUser, listUsers, toggleUserActive } from "@/lib/auth/users";
import { USER_ROLES, type UserRole } from "@/lib/auth/types";

async function adminSession() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await adminSession())) return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request: Request) {
  if (!(await adminSession())) return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const role = body.role as UserRole;
  if (!body.name || !body.email || !body.password || !USER_ROLES.includes(role)) return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
  try { return NextResponse.json({ user: await createUser({ name: body.name, email: body.email, password: body.password, role }) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Nu s-a putut crea utilizatorul." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  if (!(await adminSession())) return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "ID lipsă." }, { status: 400 });
  try { return NextResponse.json({ user: await toggleUserActive(body.id) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Actualizarea a eșuat." }, { status: 400 }); }
}
