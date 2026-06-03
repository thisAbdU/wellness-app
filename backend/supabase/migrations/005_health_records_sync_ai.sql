-- Granular health records, offline sync log, and AI insight cache.

create table if not exists public.health_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    local_id text,
    data_type text not null,
    source_device text,
    recorded_at timestamptz not null,
    payload jsonb not null default '{}',
    client_updated_at timestamptz,
    server_updated_at timestamptz not null default now(),
    created_at timestamptz default now(),
    constraint health_records_user_recorded_type unique (user_id, recorded_at, data_type)
);

create unique index if not exists health_records_user_local_id_idx
    on public.health_records (user_id, local_id)
    where local_id is not null;

create table if not exists public.sync_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    device_id text,
    pushed_count int not null default 0,
    pulled_count int not null default 0,
    synced_at timestamptz not null default now()
);

create table if not exists public.ai_insights (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    insight_type text not null,
    content text not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    constraint ai_insights_user_type unique (user_id, insight_type)
);

alter table public.health_records enable row level security;
alter table public.sync_log enable row level security;
alter table public.ai_insights enable row level security;

create policy "Users can view own health records"
on public.health_records for select
using (auth.uid() = user_id);

create policy "Users can view own sync log"
on public.sync_log for select
using (auth.uid() = user_id);

create policy "Users can view own ai insights"
on public.ai_insights for select
using (auth.uid() = user_id);
