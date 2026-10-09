import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, logEvent } from "../../_lib/db";
import { hashPassword } from "../../_lib/crypto";
import { preflight, ok, fail, parseBody, isAdmin } from "../../_lib/http";

/**
 * Admin: mutate a single user.
 *   POST /api/admin/users/:id  { banned?: boolean, password?: string }
 * Header: x-admin-secret
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (!isAdmin(req)) return fail(res, 401, "unauthorized");

  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return fail(res, 400, "bad id");
  if (req.method !== "POST") return fail(res, 405, "method not allowed");

  const b = parseBody(req);
  if (typeof b.banned === "boolean") {
    await sql`update users set banned = ${b.banned} where id = ${id}`;
    if (b.banned) await sql`delete from sessions where user_id = ${id}`;
  }
  if (b.password) await sql`update users set pass_hash = ${hashPassword(String(b.password))} where id = ${id}`;
  await logEvent("admin_user_updated", { meta: { id, banned: b.banned } });
  ok(res, { success: true });
}
