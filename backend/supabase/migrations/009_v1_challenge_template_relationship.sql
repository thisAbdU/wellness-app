-- Keep legacy /challenges rows linked to public.challenges while allowing
-- /api/v1/challenges rows to link to public.challenge_templates.

alter table public.user_challenges
    alter column challenge_id drop not null,
    add column if not exists template_id uuid references public.challenge_templates(id) on delete cascade;

create unique index if not exists user_challenges_user_template_unique
    on public.user_challenges (user_id, template_id);
