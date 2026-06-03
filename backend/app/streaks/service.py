from __future__ import annotations

from datetime import date, datetime, timedelta

from fastapi import HTTPException, status

from app.supabase_client import get_supabase_admin_client


def _extract_records(response: object) -> list[dict]:
    data = getattr(response, "data", [])
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return [data]
    return []


def _first_record(response: object) -> dict | None:
    records = _extract_records(response)
    return records[0] if records else None


def _parse_date(value: str) -> date:
    return date.fromisoformat(value)


def _is_yesterday(last_completed_date: str, summary_date: str) -> bool:
    return _parse_date(last_completed_date) == _parse_date(summary_date) - timedelta(days=1)


def _is_true(value: object) -> bool:
    return bool(value)


def update_user_streaks(user_id: str, summary_date: str) -> dict:
    supabase_client = get_supabase_admin_client()

    try:
        health_response = (
            supabase_client.table("health_daily_summaries")
            .select("*")
            .eq("user_id", user_id)
            .eq("summary_date", summary_date)
            .execute()
        )
        wellness_response = (
            supabase_client.table("wellness_scores")
            .select("*")
            .eq("user_id", user_id)
            .eq("score_date", summary_date)
            .execute()
        )
        existing_streaks_response = (
            supabase_client.table("streaks")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch streak data: {exc}",
        )

    health_record = _first_record(health_response) or {}
    wellness_record = _first_record(wellness_response) or {}
    existing_streaks = {row.get("streak_type"): row for row in _extract_records(existing_streaks_response)}

    conditions = {
        "daily": _is_true(
            health_record.get("steps", 0) > 0
            or health_record.get("active_minutes", 0) > 0
            or health_record.get("sleep_minutes", 0) > 0
            or health_record.get("workout_count", 0) > 0
        ),
        "activity": _is_true(
            health_record.get("steps", 0) >= 7000
            or health_record.get("active_minutes", 0) >= 30
            or health_record.get("workout_count", 0) > 0
        ),
        "sleep": _is_true(health_record.get("sleep_minutes", 0) >= 420),
        "wellness": _is_true(wellness_record.get("total_score", 0) >= 70),
    }

    updated_streaks: dict[str, dict] = {}

    for streak_type, should_increment in conditions.items():
        existing = existing_streaks.get(streak_type)

        if not should_increment:
            if existing is not None:
                updated_streaks[streak_type] = existing
            continue

        current_count = 1
        longest_count = 1
        last_completed_date = summary_date

        if existing is not None:
            existing_last_completed_date = existing.get("last_completed_date")
            existing_current_count = int(existing.get("current_count", 0) or 0)
            existing_longest_count = int(existing.get("longest_count", 0) or 0)

            if existing_last_completed_date == summary_date:
                updated_streaks[streak_type] = existing
                continue

            if existing_last_completed_date and _is_yesterday(existing_last_completed_date, summary_date):
                current_count = existing_current_count + 1
            else:
                current_count = 1

            longest_count = max(existing_longest_count, current_count)

        streak_record = {
            "user_id": user_id,
            "streak_type": streak_type,
            "current_count": current_count,
            "longest_count": longest_count,
            "last_completed_date": last_completed_date,
        }

        try:
            response = (
                supabase_client.table("streaks")
                .upsert(streak_record, on_conflict="user_id,streak_type")
                .select("*")
                .execute()
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update {streak_type} streak: {exc}",
            )

        saved_streak = _first_record(response)
        if saved_streak is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save {streak_type} streak",
            )

        updated_streaks[streak_type] = saved_streak

    return updated_streaks


def get_user_streaks(user_id: str) -> list[dict]:
    supabase_client = get_supabase_admin_client()

    try:
        response = (
            supabase_client.table("streaks")
            .select("*")
            .eq("user_id", user_id)
            .order("streak_type")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch streaks: {exc}",
        )

    return _extract_records(response)