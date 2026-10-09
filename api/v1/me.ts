import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, ok, fail, bearer, getSession, sessionValid, subscriptionsFor } from "../_lib/http";

/**
 * GET /api/v1/me   (Authorization: Bearer <token>)
 * Returns the current user, tier and bound HWID.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (req.method !== "GET" && req.method !== "POST") return fail(res, 405, "method not allowed");

  const token = bearer(req);
  if (!token) return fail(res, 401, "missing token");

  const s = await getSession(token);
  if (!s || !sessionValid(s)) return fail(res, 401, "session invalid");

  ok(res, {
    success: true,
    username: s.username ?? "guest",
    hwid: s.hwid ?? null,
    tier: s.tier ?? "standard",
    subscriptions: subscriptionsFor(s.tier, s.username),
  });
}
