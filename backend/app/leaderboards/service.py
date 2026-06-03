from __future__ import annotations

from datetime import date, timedelta

from fastapi import HTTPException, status

from app.supabase_client import get_supabase_admin_client


SUPPORTED_SCOPES = {"national", "region", "city", "university", "company", "neighborhood"}
SUPPORTED_METRICS = {"wellness_score", "steps", "streak"}


def _extract_records(response: object) -> list[dict]:
    data = getattr(response, "data", [])
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return [data]
    return []


def _validate_filters(scope: str, value: str | None, metric: str) -> None:
    if scope not in SUPPORTED_SCOPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported leaderboard scope")
    if metric not in SUPPORTED_METRICS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported leaderboard metric")
    if scope != "national" and not value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Scope value is required")


def _profile_filter_field(scope: str) -> str | None:
    mapping = {
        "region": "region",
        "city": "city",
        "university": "university",
        "company": "company",
        "neighborhood": "neighborhood",
    }
    return mapping.get(scope)


def _base_profile_select(record: dict) -> dict:
    return {
        "user_id": record.get("user_id"),
        "full_name": record.get("full_name"),
        "avatar_url": record.get("avatar_url"),
        "country": record.get("country"),
        "region": record.get("region"),
        "city": record.get("city"),
        "university": record.get("university"),
        "company": record.get("company"),
        "neighborhood": record.get("neighborhood"),
    }


def _fetch_profiles(scope: str, value: str | None) -> list[dict]:
    supabase_client = get_supabase_admin_client()
    query = supabase_client.table("profiles").select("*")
    if scope != "national":
        field = _profile_filter_field(scope)
        if field is None:
            return []
        query = query.eq(field, value)
    try:
        response = query.execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboard profiles: {exc}",
        )
    return _extract_records(response)


def _fetch_records(table_name: str, user_ids: list[str], date_field: str | None = None, start_date: str | None = None) -> list[dict]:
    supabase_client = get_supabase_admin_client()
    query = supabase_client.table(table_name).select("*")
    if user_ids:
        query = query.in_("user_id", user_ids)
    if date_field and start_date:
        query = query.gte(date_field, start_date)
    try:
        response = query.execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboard data from {table_name}: {exc}",
        )
    return _extract_records(response)


def _aggregate_wellness_scores(rows: list[dict], profile_map: dict[str, dict]) -> list[dict]:
    grouped: dict[str, list[float]] = {}
    for row in rows:
        user_id = str(row.get("user_id"))
        grouped.setdefault(user_id, []).append(float(row.get("total_score", 0) or 0))

    leaderboard: list[dict] = []
    for user_id, scores in grouped.items():
        profile = profile_map.get(user_id, {})
        leaderboard.append(
            {
                **_base_profile_select(profile),
                "metric": "wellness_score",
                "value": round(sum(scores) / len(scores), 2) if scores else 0,
            }
        )
    return leaderboard


def _aggregate_steps(rows: list[dict], profile_map: dict[str, dict]) -> list[dict]:
    grouped: dict[str, int] = {}
    for row in rows:
        user_id = str(row.get("user_id"))
        grouped[user_id] = grouped.get(user_id, 0) + int(row.get("steps", 0) or 0)

    leaderboard: list[dict] = []
    for user_id, total_steps in grouped.items():
        profile = profile_map.get(user_id, {})
        leaderboard.append(
            {
                **_base_profile_select(profile),
                "metric": "steps",
                "value": total_steps,
            }
        )
    return leaderboard


def _aggregate_streaks(rows: list[dict], profile_map: dict[str, dict]) -> list[dict]:
    leaderboard: list[dict] = []
    for row in rows:
        if row.get("streak_type") != "wellness":
            continue
        user_id = str(row.get("user_id"))
        profile = profile_map.get(user_id, {})
        leaderboard.append(
            {
                **_base_profile_select(profile),
                "metric": "streak",
                "value": int(row.get("current_count", 0) or 0),
            }
        )
    return leaderboard


def get_leaderboard(scope: str = "national", value: str | None = None, metric: str = "wellness_score", limit: int = 50) -> list:
    _validate_filters(scope, value, metric)

    profiles = _fetch_profiles(scope, value)
    profile_map = {str(profile.get("user_id")): profile for profile in profiles if profile.get("user_id") is not None}
    user_ids = list(profile_map.keys())

    if not user_ids:
        return []

    end_date = date.today()
    start_date = end_date - timedelta(days=6)
    start_date_text = start_date.isoformat()

    if metric == "wellness_score":
        rows = _fetch_records("wellness_scores", user_ids, "score_date", start_date_text)
        leaderboard = _aggregate_wellness_scores(rows, profile_map)
    elif metric == "steps":
        rows = _fetch_records("health_daily_summaries", user_ids, "summary_date", start_date_text)
        leaderboard = _aggregate_steps(rows, profile_map)
    else:
        rows = _fetch_records("streaks", user_ids)
        leaderboard = _aggregate_streaks(rows, profile_map)

    leaderboard = sorted(leaderboard, key=lambda row: row["value"], reverse=True)
    for index, row in enumerate(leaderboard[:limit], start=1):
        row["rank"] = index
    return leaderboard[:limit]
