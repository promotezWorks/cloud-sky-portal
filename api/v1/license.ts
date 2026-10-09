import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, rateLimit, logEvent } from "../_lib/db";
import { randomToken, sha256 } from "../_lib/crypto";
import { preflight, ok, fail, parseBody, clientIp } from "../_lib/http";

const SESSION_HOURS = Number(process.env.SESSION_HOURS || 12);

interface LicRow {
  id: number;
  user_id: number | null;
  tier: string;
  status: string;
  hwid: string | null;
  expires_at: string | null;
  lic_ok: boolean;
}

/**
 * POST /api/v1/license  { key, hwid? }
 * Logs in with a license key; binds HWID on first use.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (req.method !== "POST") return fail(res, 405, "method not allowed");

  const ip = clientIp(req);
  const { limited } = await rateLimit(`license:${ip}`, 12, 300);
  if (limited) return fail(res, 429, "too many attempts, slow down");

  const body = parseBody(req);
  const key = String(body.key ?? "").trim();
  const hwid = body.hwid ? String(body.hwid) : null;
  if (!key) return fail(res, 400, "license key required");

  const rows = (await sql`
    select id, user_id, tier, status, hwid, expires_at,
           (expires_at is null or expires_at > now()) as lic_ok
    from licenses where key_hash = ${sha256(key)} limit 1
  `) as LicRow[];
  const lic = rows[0];

  if (!lic) {
    await logEvent("license_fail", { ip, meta: { reason: "not_found" } });
    return fail(res, 401, "invalid license key");
  }
  if (lic.status !== "active") return fail(res, 403, "license revoked");
  if (!lic.lic_ok) return fail(res, 403, "license expired");

  // HWID binding: first use binds, later uses must match.
  if (hwid) {
    if (!lic.hwid) {
      await sql`update licenses set hwid = ${hwid} where id = ${lic.id}`;
    } else if (lic.hwid !== hwid) {
      await logEvent("license_fail", { ip, meta: { reason: "hwid_mismatch" } });
      return fail(res, 403, "HWID mismatch — use HWID reset to move this key");
    }
  }

  const token = randomToken();
  await sql`
    insert into sessions (token_hash, user_id, license_id, hwid, ip, expires_at)
    values (${sha256(token)}, ${lic.user_id}, ${lic.id}, ${hwid}, ${ip},
            now() + make_interval(hours => ${SESSION_HOURS}))
  `;
  await logEvent("license_ok", { userId: lic.user_id, ip, meta: { tier: lic.tier, hwid } });

  ok(res, {
    success: true,
    message: "Licensed",
    token,
    info: {
      username: `license:${key.slice(0, 12)}`,
      subscriptions: [{ subscription: lic.tier, expiry: lic.expires_at }],
    },
  });
}
