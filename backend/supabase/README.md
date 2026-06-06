# Supabase Migrations

Run these **in order** in the Supabase SQL editor (Dashboard → SQL → New query).

| Order | File | Purpose |
|-------|------|---------|
| 1 | `migrations/001_core_schema.sql` | **Required first.** profiles, emergency_contacts, health_daily_summaries, wellness_scores, streaks, badges, challenges + RLS for mobile writes |
| 2 | `migrations/005_health_records_sync_ai.sql` | health_records, sync_log, ai_insights |
| 3 | `migrations/007_run_after_001.sql` | foods, challenge_templates, behavioral_patterns, etc. |

Migrations `004` and `006` are superseded by `001` + `007` but can still be run safely if you prefer the original files.

## Expected tables (17+)

- `profiles`
- `emergency_contacts`
- `health_daily_summaries`
- `wellness_scores`
- `streaks`
- `badges`
- `user_badges`
- `challenges`
- `user_challenges`
- `user_challenge_daily_progress`
- `health_records`
- `sync_log`
- `ai_insights`
- `behavioral_patterns`
- `burnout_events`
- `foods`
- `alert_log`
- `emergency_log`
- `challenge_templates`

## Verify

After running migrations, Table Editor should show **profiles** and **emergency_contacts**. Profile setup in the mobile app writes to these tables using the authenticated user's JWT.

## Notes

- Backend service code uses the Supabase **service role** for trusted writes.
- Mobile app writes **profiles** and **emergency_contacts** directly (RLS policies in `001`).
- `user_challenge_daily_progress` prevents duplicate challenge progress for the same date.
