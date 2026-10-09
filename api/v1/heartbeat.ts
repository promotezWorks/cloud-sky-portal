import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_lib/db";
import { sha256 } from "../_lib/crypto";
import { preflight, ok, fail, bearer, getSession, sessionValid } from "../_lib/http";

const SESSION_HOURS = Number(process.env.SESSION_HOURS || 12);

/**
 * POST /api/v1/heartbeat   (Authorization: Bearer <token>)
 * Revalidates the session and slides its expiry. Clients should call this every few minutes.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (req.method !== "POST" && req.method !== "GET") return fail(res, 405, "method not allowed");

  const token = bearer(req);
  if (!token) return fail(res, 401, "missing token");

  const s = await getSession(token);
  if (!s || !sessionValid(s)) return fail(res, 401, "session invalid");

  await sql`
    update sessions
    set last_seen = now(), expires_at = now() + make_interval(hours => ${SESSION_HOURS})
    where token_hash = ${sha256(token)}
  `;

  ok(res, {
    success: true,
    valid: true,
    tier: s.tier ?? "standard",
    expiresAt: null,
  });
}
