import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, rateLimit, logEvent } from "../_lib/db";
import { verifyPassword, randomToken, sha256 } from "../_lib/crypto";
import { preflight, ok, fail, parseBody, clientIp } from "../_lib/http";

const SESSION_HOURS = Number(process.env.SESSION_HOURS || 12);

interface UserRow {
  id: number;
  username: string;
  pass_hash: string;
  banned: boolean;
}
interface LicRow {
  id: number;
  tier: string;
  expires_at: string | null;
}

/**
 * POST /api/v1/login  { username, password, hwid? }
 * Authenticates an account and issues a bearer token.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (preflight(req, res)) return;
  if (req.method !== "POST") return fail(res, 405, "method not allowed");

  const ip = clientIp(req);
  const { limited } = await rateLimit(`login:${ip}`, 10, 300);
  if (limited) return fail(res, 429, "too many attempts, slow down");

  const body = parseBody(req);
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const hwid = body.hwid ? String(body.hwid) : null;
  if (!username || !password) return fail(res, 400, "username and password required");

  const users = (await sql`
    select id, username, pass_hash, banned from users where lower(username) = lower(${username}) limit 1
  `) as UserRow[];
  const user = users[0];

  if (!user || !verifyPassword(password, user.pass_hash)) {
    await logEvent("login_fail", { username, ip });
    return fail(res, 401, "invalid username or password");
  }
  if (user.banned) {
    await logEvent("login_banned", { userId: user.id, username, ip });
    return fail(res, 403, "account banned");
  }

  // Attach the user's newest usable license (optional — accounts can exist without one).
  const lics = (await sql`
    select id, tier, expires_at
    from licenses
    where user_id = ${user.id} and status = 'active'
      and (expires_at is null or expires_at > now())
    order by created_at desc limit 1
  `) as LicRow[];
  const lic = lics[0] ?? null;

  const token = randomToken();
  await sql`
    insert into sessions (token_hash, user_id, license_id, hwid, ip, expires_at)
    values (${sha256(token)}, ${user.id}, ${lic?.id ?? null}, ${hwid}, ${ip},
            now() + make_interval(hours => ${SESSION_HOURS}))
  `;
  await logEvent("login_ok", { userId: user.id, username: user.username, ip, meta: { hwid } });

  ok(res, {
    success: true,
    message: "Logged in",
    token,
    info: {
      username: user.username,
      subscriptions: [{ subscription: lic?.tier ?? "standard", expiry: lic?.expires_at ?? null }],
    },
  });
}
