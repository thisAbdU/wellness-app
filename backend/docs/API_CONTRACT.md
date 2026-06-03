# API Contract

Base URL: `http://127.0.0.1:8000`

## Auth / Config

### GET `/`
- Auth required: No
- Request body: None
- Query params: None
- Example response:
  ```json
  {"message": "Wellness Tracker Backend is running"}
  ```

### GET `/health-check`
- Auth required: No
- Request body: None
- Query params: None
- Example response:
  ```json
  {"message": "Health check successful"}
  ```

### GET `/config-check`
- Auth required: No
- Request body: None
- Query params: None
- Example response:
  ```json
  {
    "success": true,
    "message": "Configuration loaded successfully",
    "supabase_url_configured": true,
    "anon_key_configured": true,
    "service_role_key_configured": true
  }
  ```

### GET `/auth/me`
- Auth required: Yes
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Authenticated user fetched successfully", "data": {"id": "...", "email": "..."}}
  ```

## Health

### POST `/health/sync`
- Auth required: Yes
- Request body: `HealthSyncRequest`
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Health data synced successfully", "data": {"health_summary": {}, "wellness_score": {}, "streaks": {}, "awarded_badges": [], "challenges": {}}}
  ```

### GET `/health/daily`
- Auth required: Yes
- Request body: None
- Query params:
  - `summary_date` (string, required)
- Example response:
  ```json
  {"success": true, "message": "Daily health data fetched successfully", "data": {}}
  ```

## Analytics

### GET `/analytics/weekly`
- Auth required: Yes
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Weekly analytics fetched successfully", "data": {"days": [], "steps": [], "sleep_minutes": [], "active_minutes": [], "calories_burned": [], "wellness_scores": []}}
  ```

### GET `/analytics/monthly`
- Auth required: Yes
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Monthly analytics fetched successfully", "data": {}}
  ```

## Streaks

### GET `/streaks/me`
- Auth required: Yes
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Streaks fetched successfully", "data": []}
  ```

## Badges

### GET `/badges`
- Auth required: No
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Badges fetched successfully", "data": []}
  ```

### GET `/badges/me`
- Auth required: Yes
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Earned badges fetched successfully", "data": []}
  ```

## Challenges

### GET `/challenges`
- Auth required: No
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "Challenges fetched successfully", "data": []}
  ```

### POST `/challenges/{challenge_id}/join`
- Auth required: Yes
- Request body: None
- Query params: `challenge_id` in path
- Example response:
  ```json
  {"success": true, "message": "Challenge joined successfully", "data": {}}
  ```

### GET `/challenges/me`
- Auth required: Yes
- Request body: None
- Query params: None
- Example response:
  ```json
  {"success": true, "message": "User challenges fetched successfully", "data": []}
  ```

## Leaderboards

### GET `/leaderboards`
- Auth required: No
- Request body: None
- Query params:
  - `scope` (string, optional, default `national`)
  - `value` (string, optional)
  - `metric` (string, optional, default `wellness_score`)
  - `limit` (int, optional, default `50`)
- Example response:
  ```json
  {"success": true, "message": "Leaderboard fetched successfully", "data": []}
  ```
