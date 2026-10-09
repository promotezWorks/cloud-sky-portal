-- joyride auth — Neon Postgres schema
-- Run once against your Neon database (Neon console -> SQL editor, or `psql "$DATABASE_URL" -f db/schema.sql`).

create extension if not exists pgcrypto;

-- app users (created via the website / admin API)
create table if not exists users (
  id         bigserial primary key,
  username   text unique not null,
  email      text,
  pass_hash  text not null,
  banned     boolean not null default false,
  created_at timestamptz not null default now()
);

-- license keys. Only a hash is stored; the plaintext key is shown once at creation.
create table if not exists licenses (
  id            bigserial primary key,
  key_hash      text unique not null,
  key_prefix    text not null,
  user_id       bigint references users(id) on delete set null,
  tier          text not null default 'standard',
  status        text not null default 'active',       -- active | revoked
  hwid          text,
  max_hwids     int  not null default 1,
  expires_at    timestamptz,
  hwid_resets   int  not null default 0,
  last_reset_at timestamptz,
  note          text,
  created_at    timestamptz not null default now()
);

-- active sessions (bearer tokens). Only a hash is stored.
create table if not exists sessions (
  id         bigserial primary key,
  token_hash text unique not null,
  user_id    bigint references users(id) on delete cascade,
  license_id bigint references licenses(id) on delete cascade,
  hwid       text,
  ip         text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen  timestamptz not null default now()
);

-- audit log
create table if not exists events (
  id         bigserial primary key,
  type       text not null,
  user_id    bigint,
  username   text,
  ip         text,
  meta       jsonb,
  created_at timestamptz not null default now()
);

-- crude rate limiting for auth endpoints
create table if not exists auth_attempts (
  bucket       text primary key,
  count        int  not null default 0,
  window_start timestamptz not null default now()
);

create index if not exists idx_sessions_token on sessions(token_hash);
create index if not exists idx_licenses_hash on licenses(key_hash);
create index if not exists idx_events_created on events(created_at desc);
