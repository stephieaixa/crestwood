-- Run this in the Supabase SQL editor (project > SQL Editor)

-- Registrations table
create table registrations (
  id                 uuid        primary key default gen_random_uuid(),
  session_date       date        not null,
  day_of_week        smallint    not null,
  disciplines        text[]      not null,
  name               text        not null,
  email              text        not null,
  adults             int         not null default 1,
  children           int         not null default 0,
  confirmation_token uuid        not null default gen_random_uuid(),
  reminder_sent      boolean     not null default false,
  cancelled          boolean     not null default false,
  created_at         timestamptz not null default now()
);

-- Index for fast capacity queries
create index idx_reg_date on registrations (session_date) where not cancelled;

-- Row Level Security (all DB access goes through service role, so no public policies needed)
alter table registrations enable row level security;
