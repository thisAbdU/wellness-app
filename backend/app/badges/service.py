from __future__ import annotations

from datetime import datetime, timezone

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


def _badge_already_earned(user_badges: list[dict], badge_id: object) -> bool:
    return any(str(row.get("badge_id")) == str(badge_id) for row in user_badges)


def check_and_award_badges(user_id: str, summary_date: str) -> dict:
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
        streaks_response = (
            supabase_client.table("streaks")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        badges_response = supabase_client.table("badges").select("*").execute()
        user_badges_response = (
            supabase_client.table("user_badges")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch badge data: {exc}",
        )

    health_record = _first_record(health_response) or {}
    wellness_record = _first_record(wellness_response) or {}
    streaks = _extract_records(streaks_response)
    badges = _extract_records(badges_response)
    user_badges = _extract_records(user_badges_response)

    streak_longest = max((int(row.get("longest_count", 0) or 0) for row in streaks), default=0)
    sleep_streak_longest = max(
        (int(row.get("longest_count", 0) or 0) for row in streaks if row.get("streak_type") == "sleep"),
        default=0,
    )
    wellness_streak_longest = max(
        (int(row.get("longest_count", 0) or 0) for row in streaks if row.get("streak_type") == "wellness"),
        default=0,
    )

    awarded_badges: list[dict] = []

    for badge in badges:
        badge_id = badge.get("id")
        if badge_id is None or _badge_already_earned(user_badges, badge_id):
            continue

        condition_type = badge.get("condition_type")
        condition_value = int(badge.get("condition_value", 0) or 0)
        qualifies = False

        if condition_type == "daily_steps":
            qualifies = int(health_record.get("steps", 0) or 0) >= condition_value
        elif condition_type == "streak_days":
            qualifies = streak_longest >= condition_value
        elif condition_type == "sleep_days":
            qualifies = sleep_streak_longest >= condition_value
        elif condition_type == "wellness_score_days":
            qualifies = wellness_streak_longest >= condition_value
        elif condition_type == "early_activity":
            qualifies = int(health_record.get("active_minutes", 0) or 0) > 0 or int(health_record.get("workout_count", 0) or 0) > 0

        if not qualifies:
            continue

        user_badge_record = {
            "user_id": user_id,
            "badge_id": badge_id,
            "earned_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            response = (
                supabase_client.table("user_badges")
                .insert(user_badge_record)
                .select("*")
                .execute()
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to award badge {badge.get('name', badge_id)}: {exc}",
            )

        awarded_record = _first_record(response)
        if awarded_record is not None:
            awarded_badges.append({**badge, "earned": awarded_record})

    return {"awarded_badges": awarded_badges}


def get_all_badges() -> list[dict]:
    supabase_client = get_supabase_admin_client()

    try:
        response = supabase_client.table("badges").select("*").order("created_at").execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch badges: {exc}",
        )

    return _extract_records(response)


def get_user_badges(user_id: str) -> list[dict]:
    supabase_client = get_supabase_admin_client()

    try:
        response = (
            supabase_client.table("user_badges")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch earned badges: {exc}",
        )

    user_badges = _extract_records(response)
    badge_ids = [row.get("badge_id") for row in user_badges if row.get("badge_id") is not None]
    if not badge_ids:
        return []

    try:
        badges_response = (
            supabase_client.table("badges")
            .select("*")
            .in_("id", badge_ids)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resolve earned badges: {exc}",
        )

    badges_by_id = {str(row.get("id")): row for row in _extract_records(badges_response)}
    earned_badges: list[dict] = []
    for user_badge in user_badges:
        badge = badges_by_id.get(str(user_badge.get("badge_id")))
        if badge is None:
            continue
        earned_badges.append({**badge, "earned_at": user_badge.get("earned_at")})

    return earned_badges