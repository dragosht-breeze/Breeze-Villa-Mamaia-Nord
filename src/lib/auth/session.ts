import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionPayload } from "./types";

export const SESSION_COOKIE = "breeze_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
function getSessionSecret(): string {
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
    "BREEZE_AUTH_SECRET lipsește. Configurează un secret unic înainte de pornire."
  );
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(
  payload: Omit<SessionPayload, "exp">
): string {
  const data = encode(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  );

  return `${data}.${sign(data)}`;
}

export function verifySessionToken(
  token?: string | null
): SessionPayload | null {
  if (!token) return null;

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = Buffer.from(sign(data));
  const actual = Buffer.from(signature);

  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(data)) as SessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
