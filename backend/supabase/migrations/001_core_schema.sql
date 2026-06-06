-- Core schema: run FIRST in Supabase SQL editor (before 004–006).
-- Creates all base tables the backend and mobile app expect.

-- ── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    display_name text,
    avatar_url text,
    country text default 'Ethiopia',
    region text,
    city text,
    university text,
    company text,
    neighborhood text,
    preferred_language text default 'en',
    fcm_token text,
    weight_kg numeric,
    height_cm numeric,
    age int,
    gender text,
    fitness_goal text default 'maintain',
    activity_level text,
    health_conditions jsonb not null default '[]'::jsonb,
    notification_prefs jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ── Emergency contacts ───────────────────────────────────────────────────────
create table if not exists public.emergency_contacts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    phone text not null,
    relationship text,
    created_at timestamptz not null default now(),
    constraint emergency_contacts_user_unique unique (user_id)
);

-- ── Daily health & wellness ────────────────────────────────────────────────
create table if not exists public.health_daily_summaries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    summary_date date not null,
    steps int not null default 0,
    calories_burned numeric not null default 0,
    active_minutes int not null default 0,
    sleep_minutes int not null default 0,
    sleep_quality_score numeric not null default 0,
    resting_heart_rate int,
    workout_count int not null default 0,
    data_source text default 'health_connect',
    synced_at timestamptz,
    constraint health_daily_summaries_user_date unique (user_id, summary_date)
);

create table if not exists public.wellness_scores (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    score_date date not null,
    activity_score int not null default 0,
    sleep_score int not null default 0,
    recovery_score int not null default 0,
    consistency_score int not null default 0,
    total_score int not null default 0,
    constraint wellness_scores_user_date unique (user_id, score_date)
);

-- ── Streaks ──────────────────────────────────────────────────────────────────
create table if not exists public.streaks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    streak_type text not null,
    current_count int not null default 0,
    longest_count int not null default 0,
    last_completed_date date,
    constraint streaks_user_type unique (user_id, streak_type)
);

-- ── Badges ───────────────────────────────────────────────────────────────────
create table if not exists public.badges (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    icon text,
    condition_type text not null,
    condition_value int not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    badge_id uuid not null references public.badges(id) on delete cascade,
    earned_at timestamptz not null default now(),
    constraint user_badges_user_badge unique (user_id, badge_id)
);

-- ── Legacy challenges (used by /challenges routes) ───────────────────────────
create table if not exists public.challenges (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    challenge_type text,
    target_value numeric,
    duration_days int,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.user_challenges (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    challenge_id uuid not null references public.challenges(id) on delete cascade,
    progress numeric not null default 0,
    status text not null default 'active',
    started_at timestamptz,
    completed_at timestamptz,
    progress_json jsonb not null default '{}'::jsonb,
    start_date date,
    constraint user_challenges_user_challenge unique (user_id, challenge_id)
);

-- ── RLS: profiles & emergency (mobile client writes) ─────────────────────────
alter table public.profiles enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.health_daily_summaries enable row level security;
alter table public.wellness_scores enable row level security;
alter table public.streaks enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenges enable row level security;

drop policy if exists "Users select own profile" on public.profiles;
create policy "Users select own profile"
    on public.profiles for select using (auth.uid() = user_id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
    on public.profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
    on public.profiles for update using (auth.uid() = user_id);

drop policy if exists "Users select own emergency contacts" on public.emergency_contacts;
create policy "Users select own emergency contacts"
    on public.emergency_contacts for select using (auth.uid() = user_id);

drop policy if exists "Users insert own emergency contacts" on public.emergency_contacts;
create policy "Users insert own emergency contacts"
    on public.emergency_contacts for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own emergency contacts" on public.emergency_contacts;
create policy "Users update own emergency contacts"
    on public.emergency_contacts for update using (auth.uid() = user_id);

drop policy if exists "Users select own health summaries" on public.health_daily_summaries;
create policy "Users select own health summaries"
    on public.health_daily_summaries for select using (auth.uid() = user_id);

drop policy if exists "Users select own wellness scores" on public.wellness_scores;
create policy "Users select own wellness scores"
    on public.wellness_scores for select using (auth.uid() = user_id);

drop policy if exists "Users select own streaks" on public.streaks;
create policy "Users select own streaks"
    on public.streaks for select using (auth.uid() = user_id);

drop policy if exists "Badges are public read" on public.badges;
create policy "Badges are public read"
    on public.badges for select using (true);

drop policy if exists "Users select own badges" on public.user_badges;
create policy "Users select own badges"
    on public.user_badges for select using (auth.uid() = user_id);

drop policy if exists "Challenges are public read" on public.challenges;
create policy "Challenges are public read"
    on public.challenges for select using (true);

drop policy if exists "Users select own challenges" on public.user_challenges;
create policy "Users select own challenges"
    on public.user_challenges for select using (auth.uid() = user_id);

-- ── Seed badges ──────────────────────────────────────────────────────────────
insert into public.badges (name, description, icon, condition_type, condition_value)
select * from (values
    ('First 10K Steps', 'Walk 10,000 steps in a day', '👟', 'daily_steps', 10000),
    ('Week Warrior', '7-day activity streak', '🔥', 'streak_days', 7),
    ('Sleep Champion', '5-day sleep streak', '🌙', 'sleep_days', 5),
    ('BIRTU Star', '14-day BIRTU score streak', '⭐', 'wellness_score_days', 14),
    ('Early Bird', 'Log morning activity', '🌅', 'early_activity', 1)
) as v(name, description, icon, condition_type, condition_value)
where not exists (select 1 from public.badges limit 1);

-- ── Seed sample challenges ───────────────────────────────────────────────────
insert into public.challenges (title, description, challenge_type, target_value, duration_days, is_active)
select * from (values
    ('10K Steps Daily', 'Hit 10,000 steps every day for 2 weeks', 'steps', 10000::numeric, 14, true),
    ('Sleep 7+ Hours', 'Get at least 7 hours of sleep for 7 days', 'sleep', 7::numeric, 7, true),
    ('Hydration Hero', 'Log water intake daily for 10 days', 'water', 8::numeric, 10, true)
) as v(title, description, challenge_type, target_value, duration_days, is_active)
where not exists (select 1 from public.challenges limit 1);

-- Auto-create empty profile row on sign-up (optional safety net)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
