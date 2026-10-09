import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, logEvent } from "../../_lib/db";
import { preflight, ok, fail, bearer, getSession, clientIp } from "../../_lib/http";

const COOLDOWN_DAYS = Number(process.env.HWID_RESET_COOLDOWN_DAYS || 7);

/**
 * POST /api/v1/hwid/reset   (Authorization: Bearer <token>)
 * Clears the HWID bound to the session's license so the user can log in elsewhere.
 * Rate-limited by a cooldown.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (req.method !== "POST") return fail(res, 405, "method not allowed");

  const token = bearer(req);
  if (!token) return fail(res, 401, "missing token");

  const s = await getSession(token);
  if (!s) return fail(res, 401, "session invalid");
  if (!s.license_id) return fail(res, 400, "no license bound to this session");

  // Only allow if the last reset is older than the cooldown.
  const rows = (await sql`
    update licenses
    set hwid = null, hwid_resets = hwid_resets + 1, last_reset_at = now()
    where id = ${s.license_id}
      and (last_reset_at is null or last_reset_at < now() - make_interval(days => ${COOLDOWN_DAYS}))
    returning id
  `) as Array<{ id: number }>;

  if (!rows.length) {
    return fail(res, 429, `HWID already reset recently — try again in ${COOLDOWN_DAYS} days`);
  }

  await logEvent("hwid_reset", { userId: s.user_id, ip: clientIp(req) });
  ok(res, { success: true, message: "HWID reset" });
}
