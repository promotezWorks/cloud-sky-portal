import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_lib/db";
import { sha256 } from "../_lib/crypto";
import { preflight, ok, fail, bearer } from "../_lib/http";

/**
 * POST /api/v1/logout   (Authorization: Bearer <token>)
 * Revokes the current session.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (req.method !== "POST" && req.method !== "DELETE") return fail(res, 405, "method not allowed");

  const token = bearer(req);
  if (!token) return fail(res, 401, "missing token");

  await sql`delete from sessions where token_hash = ${sha256(token)}`;
  ok(res, { success: true, message: "Logged out" });
}
