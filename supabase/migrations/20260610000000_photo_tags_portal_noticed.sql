-- Add property type to clients
alter table clients add column if not exists property_type text default 'residential' check (property_type in ('residential', 'commercial'));

-- Add photo tagging fields
alter table clean_photos add column if not exists room text;
alter table clean_photos add column if not exists photo_type text check (photo_type in ('before', 'after'));

-- Add noticed field to cleans
alter table cleans add column if not exists noticed text;

-- Client portal tokens
create table if not exists client_tokens (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  token text not null unique
);

create index if not exists client_tokens_token_idx on client_tokens(token);
