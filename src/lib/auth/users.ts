import { randomUUID } from "node:crypto";
import { JsonFileRepository } from "@/lib/data/json-file-repository";
import { hashPassword } from "./password";
import type { AuthUser, PublicAuthUser, UserRole } from "./types";

const repository = new JsonFileRepository<AuthUser[]>({ fileName: "users.json", createDefault: () => [] });

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }

function configuredAdmin(): AuthUser | null {
  const name = process.env.BREEZE_ADMIN_NAME?.trim();
  const email = process.env.BREEZE_ADMIN_EMAIL?.trim();
  const password = process.env.BREEZE_ADMIN_PASSWORD ?? "";

  if (!name || !email || password.length < 12) return null;

  return {
    id: `env-admin:${normalizeEmail(email)}`,
    name,
    email: normalizeEmail(email),
    role: "ADMIN",
    active: true,
    passwordHash: hashPassword(password),
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
}

function publicUser(user: AuthUser): PublicAuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function ensureInitialAdmin(): Promise<AuthUser[]> {
  const users = await repository.read();
  if (users.length) return users;

  const configuredName = process.env.BREEZE_ADMIN_NAME?.trim();
  const configuredEmail = process.env.BREEZE_ADMIN_EMAIL?.trim();
  const configuredPassword = process.env.BREEZE_ADMIN_PASSWORD ?? "";

  if (!configuredName || !configuredEmail || configuredPassword.length < 12) {
    throw new Error(
      "Contul administrator inițial nu este configurat sigur. Setează BREEZE_ADMIN_NAME, BREEZE_ADMIN_EMAIL și BREEZE_ADMIN_PASSWORD (minimum 12 caractere)."
    );
  }

  const now = new Date().toISOString();
  const admin: AuthUser = {
    id: randomUUID(),
    name: configuredName,
    email: normalizeEmail(configuredEmail),
    role: "ADMIN",
    active: true,
    passwordHash: hashPassword(configuredPassword),
    createdAt: now,
    updatedAt: now,
  };
  await repository.write([admin]);
  return [admin];
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const admin = configuredAdmin();
  if (admin?.email === normalizeEmail(email)) return admin;

  const users = await ensureInitialAdmin();
  return users.find((user) => user.email === normalizeEmail(email)) ?? null;
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const admin = configuredAdmin();
  if (admin?.id === id) return admin;

  const users = await ensureInitialAdmin();
  return users.find((user) => user.id === id) ?? null;
}

export async function listUsers(): Promise<PublicAuthUser[]> {
  return (await ensureInitialAdmin()).map(publicUser);
}

export async function createUser(input: { name: string; email: string; password: string; role: UserRole }): Promise<PublicAuthUser> {
  const users = await ensureInitialAdmin();
  const email = normalizeEmail(input.email);
  if (users.some((user) => user.email === email)) throw new Error("Există deja un utilizator cu acest e-mail.");
  if (input.password.length < 8) throw new Error("Parola trebuie să aibă minimum 8 caractere.");
  const now = new Date().toISOString();
  const user: AuthUser = { id: randomUUID(), name: input.name.trim(), email, role: input.role, active: true, passwordHash: hashPassword(input.password), createdAt: now, updatedAt: now };
  await repository.write([...users, user]);
  return publicUser(user);
}

export async function toggleUserActive(id: string): Promise<PublicAuthUser> {
  const users = await ensureInitialAdmin();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) throw new Error("Utilizatorul nu a fost găsit.");
  const activeAdmins = users.filter((user) => user.role === "ADMIN" && user.active);
  if (users[index].role === "ADMIN" && users[index].active && activeAdmins.length === 1) throw new Error("Ultimul administrator activ nu poate fi dezactivat.");
  users[index] = { ...users[index], active: !users[index].active, updatedAt: new Date().toISOString() };
  await repository.write(users);
  return publicUser(users[index]);
}
