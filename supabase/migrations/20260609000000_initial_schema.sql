-- Clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  email text,
  phone text,
  address text,
  access_notes text,
  client_notes text,
  status text default 'lead' check (status in ('lead', 'active', 'inactive')),
  frequency text
);

-- Cleans table
create table cleans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  notes text,
  extras text[],
  summary_sent boolean default false,
  summary_sent_at timestamp with time zone
);

-- Clean photos table
create table clean_photos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  clean_id uuid references cleans(id) on delete cascade,
  url text not null,
  caption text
);
