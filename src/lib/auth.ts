import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "binapani_session";
const SECRET =
  process.env.SESSION_SECRET || "binapani-atelier-dev-secret-change-in-prod";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function signSessionToken(
  payload: Omit<SessionPayload, "exp">,
  ttlSeconds = 60 * 60 * 24 * 7
): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(encoded)
      .digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const decoded = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}
