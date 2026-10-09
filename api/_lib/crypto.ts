import crypto from "node:crypto";

/** scrypt password hash — no native deps, works on Vercel's Node runtime. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const key = crypto.scryptSync(password, Buffer.from(salt, "hex"), 64);
  const expect = Buffer.from(hash, "hex");
  return key.length === expect.length && crypto.timingSafeEqual(key, expect);
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** 256-bit opaque session token (returned to the client, hashed at rest). */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Human-friendly license key, e.g. JOYRIDE-8F3K2-QW9ZM-... */
export function newLicenseKey(prefix = "JOYRIDE"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const group = () =>
    Array.from({ length: 5 }, () => alphabet[crypto.randomInt(alphabet.length)]).join("");
  return `${prefix}-${group()}-${group()}-${group()}-${group()}`;
}

/** Optional HMAC signature so clients can detect tampered responses. */
export function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
