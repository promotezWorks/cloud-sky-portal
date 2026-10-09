import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./db";
import { sha256 } from "./crypto";

export function cors(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, x-admin-secret");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
}

export function ok(res: VercelResponse, body: unknown, status = 200): void {
  cors(res);
  res.status(status).json(body as Record<string, unknown>);
}

export function fail(res: VercelResponse, status: number, message: string): void {
  cors(res);
  res.status(status).json({ success: false, message });
}

/** Answer CORS preflight. Returns true if the request was a preflight. */
export function preflight(req: VercelRequest, res: VercelResponse): boolean {
  cors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (!b) return {};
  if (typeof b === "string") {
    try {
      return JSON.parse(b) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return b as Record<string, unknown>;
}

export function clientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0]!.trim();
  if (Array.isArray(fwd) && fwd.length) return fwd[0]!;
  return req.socket?.remoteAddress ?? "unknown";
}

export function bearer(req: VercelRequest): string | null {
  const h = req.headers["authorization"];
  const v = Array.isArray(h) ? h[0] : h;
  if (!v || !v.startsWith("Bearer ")) return null;
  const t = v.slice(7).trim();
  return t.length ? t : null;
}

export function isAdmin(req: VercelRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const h = req.headers["x-admin-secret"];
  const v = Array.isArray(h) ? h[0] : h;
  return v === secret;
}

export interface SessionRow {
  id: number;
  user_id: number | null;
  license_id: number | null;
  hwid: string | null;
  session_ok: boolean;
  username: string | null;
  banned: boolean | null;
  tier: string | null;
  status: string | null;
  lic_time_ok: boolean | null;
}

/** Look up a live session by bearer token (token is hashed at rest). */
export async function getSession(token: string): Promise<SessionRow | null> {
  const rows = (await sql`
    select s.id, s.user_id, s.license_id, s.hwid,
           (s.expires_at > now()) as session_ok,
           u.username, u.banned,
           l.tier, l.status,
           (l.expires_at is null or l.expires_at > now()) as lic_time_ok
    from sessions s
    left join users u on u.id = s.user_id
    left join licenses l on l.id = s.license_id
    where s.token_hash = ${sha256(token)}
    limit 1
  `) as SessionRow[];
  return rows[0] ?? null;
}

/** A session is usable when it is live, the user isn't banned, and the license is active in time. */
export function sessionValid(s: SessionRow): boolean {
  if (!s.session_ok) return false;
  if (s.banned) return false;
  if (s.status && s.status !== "active") return false;
  if (s.lic_time_ok === false) return false;
  return true;
}

export function subscriptionsFor(tier: string | null, username: string | null) {
  return [
    {
      subscription: tier ?? "standard",
      expiry: null,
      key: null,
      username: username ?? undefined,
    },
  ];
}
