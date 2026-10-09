# joyride auth API

Self-hosted replacement for KeyAuth. Runs as Vercel Functions alongside the site (`api/`),
backed by Neon Postgres.

## Deploy

1. **Create the database.** In Vercel → your project → Storage → Marketplace → **Neon**, or at
   neon.tech. Copy the connection string.
2. **Run the schema.** Paste `db/schema.sql` into the Neon SQL editor (or
   `psql "$DATABASE_URL" -f db/schema.sql`).
3. **Set env vars** in Vercel → Settings → Environment Variables (see `.env.example`):
   `DATABASE_URL`, `ADMIN_SECRET`, `ALLOWED_ORIGIN`, `SESSION_HOURS`,
   `HWID_RESET_COOLDOWN_DAYS`, `AUTH_VERSION`.
4. **Deploy.** Vercel picks up everything under `api/` automatically — no config needed.

## Client endpoints

Base: `https://<your-site>/api/v1`

| Method | Path | Body / Auth | Returns |
|---|---|---|---|
| POST | `/init` | `{}` | `{ success, serverTime, nonce, version }` |
| POST | `/login` | `{ username, password, hwid? }` | `{ success, token, info:{ username, subscriptions } }` |
| POST | `/license` | `{ key, hwid? }` | `{ success, token, info:{ username, subscriptions } }` |
| POST | `/heartbeat` | Bearer | `{ success, valid, tier }` |
| GET | `/me` | Bearer | `{ success, username, hwid, tier, subscriptions }` |
| POST | `/logout` | Bearer | `{ success }` |
| POST | `/hwid/reset` | Bearer | `{ success }` (cooldown-limited) |

Errors return a non-2xx status with `{ success: false, message }`.

## Admin endpoints

Header `x-admin-secret: <ADMIN_SECRET>` on every call.

| Method | Path | Body | Purpose |
|---|---|---|---|
| POST | `/api/admin/licenses` | `{ tier?, count?, days?, note? }` | Create keys (returns plaintext **once**) |
| GET | `/api/admin/licenses?limit=` | — | List keys (masked) |
| POST | `/api/admin/licenses/:id` | `{ status?, tier?, clearHwid? }` | Update / revoke a key |
| DELETE | `/api/admin/licenses/:id` | — | Revoke a key |
| POST | `/api/admin/users` | `{ username, password, tier?, days?, email? }` | Create user + key |
| GET | `/api/admin/users?limit=` | — | List users |
| POST | `/api/admin/users/:id` | `{ banned?, password? }` | Ban / reset password |

### Examples

```bash
BASE=https://your-site; SECRET=...

# 25 standard keys, 30 days
curl -s -X POST "$BASE/api/admin/licenses" -H "x-admin-secret: $SECRET" \
  -H 'content-type: application/json' \
  -d '{"tier":"pro","count":25,"days":30}'

# create a user + key
curl -s -X POST "$BASE/api/admin/users" -H "x-admin-secret: $SECRET" \
  -H 'content-type: application/json' \
  -d '{"username":"broyl","password":"hunter2","tier":"pro","days":365}'
```

## Security notes

- Passwords: **scrypt** (Node built-in). License keys and session tokens are stored **hashed**
  (SHA-256) — plaintext is only ever shown once at creation.
- Sessions slide forward on `/heartbeat`; revoking a license or banning a user deletes its sessions.
- HWID binds on first license use; mismatch is rejected until an HWID reset (cooldown).
- Rate limiting is a simple fixed-window table (`auth_attempts`). Swap for Upstash if you need
  distributed limits.
- Add response signing with `signPayload()` (HMAC-SHA256) if you want clients to verify integrity.
- Client-side checks can be bypassed — always enforce entitlements here on the server.
