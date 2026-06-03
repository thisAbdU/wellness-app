# Supabase Migration Summary

Run Supabase migrations before backend testing.

Expected tables:

- `profiles`
- `health_daily_summaries`
- `wellness_scores`
- `streaks`
- `badges`
- `user_badges`
- `challenges`
- `user_challenges`
- `user_challenge_daily_progress`
- `emergency_contacts`
- `health_records`
- `sync_log`
- `ai_insights`
- `behavioral_patterns`
- `burnout_events`
- `foods`
- `alert_log`
- `emergency_log`
- `challenge_templates`

Notes:

- `user_challenge_daily_progress` is required to prevent duplicate challenge progress for the same date.
- Backend service code uses the Supabase service role client for trusted write operations.
