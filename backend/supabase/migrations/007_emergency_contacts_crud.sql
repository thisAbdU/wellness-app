create extension if not exists pgcrypto;

create table if not exists public.emergency_contacts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    phone text not null,
    relationship text not null default 'Family',
    is_primary boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.emergency_contacts add column if not exists relationship text not null default 'Family';
alter table public.emergency_contacts add column if not exists is_primary boolean not null default false;
alter table public.emergency_contacts add column if not exists created_at timestamptz not null default now();
alter table public.emergency_contacts add column if not exists updated_at timestamptz not null default now();

alter table public.emergency_contacts drop constraint if exists emergency_contacts_user_id_key;

create index if not exists emergency_contacts_user_id_idx
    on public.emergency_contacts(user_id);

create unique index if not exists emergency_contacts_one_primary_per_user_idx
    on public.emergency_contacts(user_id)
    where is_primary = true;

alter table public.emergency_contacts enable row level security;

drop policy if exists "Users manage own emergency contacts" on public.emergency_contacts;
create policy "Users manage own emergency contacts"
    on public.emergency_contacts
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
