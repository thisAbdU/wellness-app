# Wellness Tracker Backend

Backend for the Wellness Tracker app built with FastAPI, Supabase, and Python.

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
   ```powershell
   pip install -r requirements.txt
   ```

4. Create `.env` from `.env.example` and set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

5. Run the server:
   ```powershell
   uvicorn app.main:app --reload
   ```

Swagger docs:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Environment Variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

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
