create table if not exists public.user_challenge_daily_progress (
id uuid primary key default gen_random_uuid(),
user_id uuid not null references auth.users(id) on delete cascade,
challenge_id uuid not null references public.challenges(id) on delete cascade,
progress_date date not null,
created_at timestamptz default now(),
constraint user_challenge_daily_progress_unique unique(user_id, challenge_id, progress_date)
);

alter table public.user_challenge_daily_progress enable row level security;

create policy "Users can view own challenge daily progress"
on public.user_challenge_daily_progress
for select
using (auth.uid() = user_id);