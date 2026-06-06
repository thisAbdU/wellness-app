# BIRTU Backend

Backend for the BIRTU mobile app built with FastAPI, Supabase, and Python.

## Tech Stack

- FastAPI
- Supabase
- Python

## Setup

1. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```

2. Activate it:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```bash
   pip install --default-timeout=120 -r requirements.txt
   ```

   Optional (voice, FCM push, SMS)  install separately if the full download times out:
   ```bash
   pip install --default-timeout=300 -r requirements-optional.txt
   ```

4. Run the SQL files in `supabase/migrations/` in filename order, including
   `007_emergency_contacts_crud.sql` for emergency contact management.

5. Create `.env` from `.env.example` and set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (required for coach insights and AI nutrition plans)
   - `CORS_ORIGINS` (optional; defaults include Expo dev ports)

6. Run the server (from `backend/`):
   ```bash
   python run.py
   ```

Swagger docs:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Environment Variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `CORS_ORIGINS`

Warning:

- Never commit `.env`
- Never expose the service role key to frontend/mobile clients

## API Overview

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | Health-style root response |
| GET | `/health-check` | Public | Backend health check |
| GET | `/config-check` | Public | Confirms required env vars are loaded |
| GET | `/auth/me` | Bearer token | Returns authenticated user id/email |
| POST | `/wellness/test-score` | Public | Temporary wellness score formula test |
| POST | `/health/sync` | Bearer token | Saves daily health summary and related gamification data |
| GET | `/health/daily` | Bearer token | Fetches a single daily health summary |
| GET | `/analytics/weekly` | Bearer token | Returns 7-day analytics rollups |
| GET | `/analytics/monthly` | Bearer token | Returns 30-day analytics rollups |
| GET | `/streaks/me` | Bearer token | Returns the authenticated user’s streaks |
| GET | `/badges` | Public | Returns all available badges |
| GET | `/badges/me` | Bearer token | Returns the authenticated user’s earned badges |
| GET | `/challenges` | Public | Returns active challenges |
| POST | `/challenges/{challenge_id}/join` | Bearer token | Joins a challenge |
| GET | `/challenges/me` | Bearer token | Returns the authenticated user’s challenges |
| GET | `/leaderboards` | Public | Returns public leaderboard rankings |
| GET | `/health` | Public | Uptime check `{"status": "ok"}` |
| POST | `/api/v1/health/sync` | Bearer token | Batched granular health records + daily aggregation |
| GET | `/api/v1/health/summary?from=&to=` | Bearer token | Precomputed daily summaries (`health_daily_summaries`) |
| POST | `/api/v1/sync/push` | Bearer token | Offline push with conflict resolution |
| GET | `/api/v1/sync/pull?since=` | Bearer token | Delta pull of server-side records |
| POST | `/api/v1/coach/insight` | Bearer token | Cached or fresh Gemini coach insight |

Legacy `POST /health/sync` (daily summary + gamification) is unchanged for existing mobile integration.

## Testing Flow

1. Sign in with Supabase Auth in the mobile app or another client.
2. Copy the Supabase access token.
3. In Swagger, click Authorize and paste `Bearer <supabase_access_token>`.
4. Call `POST /health/sync` with a daily health payload.
5. Call analytics, streaks, badges, challenges, and leaderboard endpoints.
6. Confirm the expected routes are visible in Swagger:
   - `/health/sync`
   - `/analytics/weekly`
   - `/analytics/monthly`
   - `/streaks/me`
   - `/badges`
   - `/badges/me`
   - `/challenges`
   - `/challenges/me`
   - `/leaderboards`
