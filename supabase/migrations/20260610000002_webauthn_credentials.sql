create table if not exists webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  created_at timestamptz default now()
);
