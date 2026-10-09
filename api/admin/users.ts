import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, logEvent } from "../_lib/db";
import { newLicenseKey, hashPassword, sha256 } from "../_lib/crypto";
import { preflight, ok, fail, parseBody, isAdmin } from "../_lib/http";

interface UserRow {
  id: number;
  username: string;
}

/**
 * Admin: user management.
 *   POST /api/admin/users  { username, password, tier?, days?, email? }
 *        -> creates the account + a license key (returned once)
 *   GET  /api/admin/users?limit=100
 * Header: x-admin-secret
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (!isAdmin(req)) return fail(res, 401, "unauthorized");

  if (req.method === "GET") {
    const limit = Math.min(Number(req.query.limit ?? 100) || 100, 500);
    const rows = await sql`
      select u.id, u.username, u.email, u.banned, u.created_at,
             count(l.id) as licenses
      from users u
      left join licenses l on l.user_id = u.id
      group by u.id
      order by u.created_at desc
      limit ${limit}
    `;
    return ok(res, { success: true, users: rows });
  }

  if (req.method === "POST") {
    const b = parseBody(req);
    const username = String(b.username ?? "").trim();
    const password = String(b.password ?? "");
    const email = b.email ? String(b.email) : null;
    const tier = String(b.tier ?? "standard");
    const days = b.days === undefined || b.days === null ? null : Number(b.days);
    if (!username || !password) return fail(res, 400, "username and password required");

    let user: UserRow;
    try {
      const rows = (await sql`
        insert into users (username, email, pass_hash)
        values (${username}, ${email}, ${hashPassword(password)})
        returning id, username
      `) as UserRow[];
      user = rows[0]!;
    } catch {
      return fail(res, 409, "username already exists");
    }

    const key = newLicenseKey();
    const expiresAt = days ? new Date(Date.now() + days * 86_400_000).toISOString() : null;
    await sql`
      insert into licenses (key_hash, key_prefix, user_id, tier, expires_at)
      values (${sha256(key)}, ${key.slice(0, 16)}, ${user.id}, ${tier}, ${expiresAt})
    `;
    await logEvent("admin_user_created", { userId: user.id, username: user.username, meta: { tier, days } });
    return ok(res, { success: true, id: user.id, username: user.username, key });
  }

  return fail(res, 405, "method not allowed");
}
