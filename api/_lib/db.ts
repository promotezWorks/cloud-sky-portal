import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Add your Neon connection string in Vercel env vars.");
}

/** Tagged-template SQL over Neon's HTTP driver (serverless friendly). */
export const sql = neon(url);

export interface RateResult {
  limited: boolean;
  count: number;
}

/** Fixed-window limiter keyed by an arbitrary bucket string. */
export async function rateLimit(bucket: string, max: number, windowSec: number): Promise<RateResult> {
  const rows = (await sql`
    insert into auth_attempts (bucket, count, window_start)
    values (${bucket}, 1, now())
    on conflict (bucket) do update set
      count = case
        when auth_attempts.window_start < now() - make_interval(secs => ${windowSec}) then 1
        else auth_attempts.count + 1
      end,
      window_start = case
        when auth_attempts.window_start < now() - make_interval(secs => ${windowSec}) then now()
        else auth_attempts.window_start
      end
    returning count
  `) as Array<{ count: number }>;
  const count = rows[0]?.count ?? 1;
  return { limited: count > max, count };
}

export async function logEvent(
  type: string,
  opts: { userId?: number | null; username?: string | null; ip?: string | null; meta?: unknown } = {},
): Promise<void> {
  try {
    await sql`
      insert into events (type, user_id, username, ip, meta)
      values (${type}, ${opts.userId ?? null}, ${opts.username ?? null}, ${opts.ip ?? null},
              ${opts.meta ? JSON.stringify(opts.meta) : null}::jsonb)
    `;
  } catch {
    /* logging must never break auth */
  }
}
