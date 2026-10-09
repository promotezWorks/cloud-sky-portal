import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, logEvent } from "../../_lib/db";
import { preflight, ok, fail, parseBody, isAdmin } from "../../_lib/http";

/**
 * Admin: mutate a single license.
 *   POST   /api/admin/licenses/:id  { status?: "active"|"revoked", tier?, clearHwid?: true }
 *   DELETE /api/admin/licenses/:id  -> revoke
 * Header: x-admin-secret
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (!isAdmin(req)) return fail(res, 401, "unauthorized");

  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return fail(res, 400, "bad id");

  if (req.method === "DELETE") {
    await sql`update licenses set status = 'revoked' where id = ${id}`;
    await sql`delete from sessions where license_id = ${id}`;
    await logEvent("admin_key_revoked", { meta: { id } });
    return ok(res, { success: true, message: "revoked" });
  }

  if (req.method === "POST") {
    const b = parseBody(req);
    if (b.status) await sql`update licenses set status = ${String(b.status)} where id = ${id}`;
    if (b.tier) await sql`update licenses set tier = ${String(b.tier)} where id = ${id}`;
    if (b.clearHwid === true) await sql`update licenses set hwid = null where id = ${id}`;
    if (b.status === "revoked") await sql`delete from sessions where license_id = ${id}`;
    await logEvent("admin_key_updated", { meta: { id, ...b } });
    return ok(res, { success: true });
  }

  return fail(res, 405, "method not allowed");
}
