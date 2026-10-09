import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, logEvent } from "../_lib/db";
import { newLicenseKey, sha256 } from "../_lib/crypto";
import { preflight, ok, fail, parseBody, isAdmin } from "../_lib/http";

/**
 * Admin: license management.
 *   POST /api/admin/licenses  { tier?, count?, days?, note? } -> creates keys, returns plaintext once
 *   GET  /api/admin/licenses?limit=50                          -> lists keys (masked)
 * Header: x-admin-secret: <ADMIN_SECRET>
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (!isAdmin(req)) return fail(res, 401, "unauthorized");

  if (req.method === "GET") {
    const limit = Math.min(Number(req.query.limit ?? 50) || 50, 500);
    const rows = await sql`
      select l.id, l.key_prefix, l.tier, l.status, l.hwid, l.expires_at, l.created_at,
             u.username
      from licenses l
      left join users u on u.id = l.user_id
      order by l.created_at desc
      limit ${limit}
    `;
    return ok(res, { success: true, licenses: rows });
  }

  if (req.method === "POST") {
    const b = parseBody(req);
    const tier = String(b.tier ?? "standard");
    const count = Math.min(Math.max(Number(b.count ?? 1) || 1, 1), 100);
    const days = b.days === undefined || b.days === null ? null : Number(b.days);
    const note = b.note ? String(b.note) : null;

    const expiresAt = days ? new Date(Date.now() + days * 86_400_000).toISOString() : null;
    const created: string[] = [];
    for (let i = 0; i < count; i++) {
      const key = newLicenseKey();
      await sql`
        insert into licenses (key_hash, key_prefix, tier, expires_at, note)
        values (${sha256(key)}, ${key.slice(0, 16)}, ${tier}, ${expiresAt}, ${note})
      `;
      created.push(key);
    }
    await logEvent("admin_keys_created", { meta: { count, tier, days, note } });
    return ok(res, { success: true, created });
  }

  return fail(res, 405, "method not allowed");
}
