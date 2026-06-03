-- Sprint 2 & 3: coach patterns, burnout, foods, alerts, challenge templates, logs.

create table if not exists public.behavioral_patterns (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    pattern_type text not null,
    detail_json jsonb not null default '{}',
    detected_at timestamptz not null default now(),
    dismissed boolean not null default false
);

create table if not exists public.burnout_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    score int not null,
    signals_json jsonb not null default '{}',
    insight_text text,
    detected_at timestamptz not null default now()
);

create table if not exists public.foods (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    name_am text,
    calories numeric not null,
    protein_g numeric not null default 0,
    carbs_g numeric not null default 0,
    fat_g numeric not null default 0,
    fiber_g numeric default 0,
    meal_type jsonb not null default '[]',
    category text,
    unique (name)
);

create table if not exists public.alert_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    alert_type text not null,
    title text,
    body text,
    sent_at timestamptz not null default now(),
    delivered boolean default false
);

create table if not exists public.emergency_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    contact_name text,
    contact_phone text,
    fcm_sent boolean default false,
    sms_sent boolean default false,
    gps_lat numeric,
    gps_lng numeric,
    created_at timestamptz not null default now()
);

create table if not exists public.challenge_templates (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    title_am text,
    metric text not null,
    target_value numeric not null,
    duration_days int not null,
    description text,
    is_active boolean default true
);

alter table public.user_challenges
    add column if not exists progress_json jsonb default '{}',
    add column if not exists start_date date;

alter table public.profiles
    add column if not exists fcm_token text,
    add column if not exists preferred_language text default 'en',
    add column if not exists weight_kg numeric,
    add column if not exists height_cm numeric,
    add column if not exists age int,
    add column if not exists gender text,
    add column if not exists fitness_goal text,
    add column if not exists activity_level text,
    add column if not exists health_conditions jsonb default '[]',
    add column if not exists city text;

alter table public.behavioral_patterns enable row level security;
alter table public.burnout_events enable row level security;
alter table public.foods enable row level security;
alter table public.alert_log enable row level security;
alter table public.emergency_log enable row level security;
alter table public.challenge_templates enable row level security;

create policy "Users view own behavioral patterns"
on public.behavioral_patterns for select using (auth.uid() = user_id);

create policy "Foods are readable by authenticated users"
on public.foods for select to authenticated using (true);

create policy "Users view own alert log"
on public.alert_log for select using (auth.uid() = user_id);

create policy "Challenge templates public read"
on public.challenge_templates for select using (true);

insert into public.challenge_templates (title, title_am, metric, target_value, duration_days, description)
select * from (values
    ('Walk 10,000 steps for 7 days', '7 ቀን 10,000 እርምጃ', 'steps', 10000::numeric, 7, 'Hit 10k steps on 7 separate days'),
    ('Sleep 8 hours for 5 days', '5 ቀን 8 ሰዓት እንቅልፍ', 'sleep_hrs', 8::numeric, 5, 'At least 8 hours sleep on 5 days'),
    ('Exercise 20 days this month', 'በወሩ 20 ቀን ስፖርት', 'workout_days', 1::numeric, 20, 'Log a workout on 20 days within 30 days')
) as v(title, title_am, metric, target_value, duration_days, description)
where not exists (select 1 from public.challenge_templates limit 1);
