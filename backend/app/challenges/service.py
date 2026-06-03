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


def _merge_user_challenge(user_challenge: dict, challenge: dict | None) -> dict:
    merged = dict(user_challenge)
    if challenge is not None:
        merged.update(
            {
                "title": challenge.get("title"),
                "description": challenge.get("description"),
                "challenge_type": challenge.get("challenge_type"),
                "target_value": challenge.get("target_value"),
                "duration_days": challenge.get("duration_days"),
            }
        )
    return merged


def _challenge_lookup(challenges: list[dict]) -> dict[str, dict]:
    return {str(row.get("id")): row for row in challenges if row.get("id") is not None}


def get_available_challenges() -> list[dict]:
    supabase_client = get_supabase_admin_client()

    try:
        response = (
            supabase_client.table("challenges")
            .select("*")
            .eq("is_active", True)
            .order("created_at")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch available challenges: {exc}",
        )

    return _extract_records(response)


def get_my_challenges(user_id: str) -> list[dict]:
    supabase_client = get_supabase_admin_client()

    try:
        user_challenges_response = (
            supabase_client.table("user_challenges")
            .select("*")
            .eq("user_id", user_id)
            .order("started_at")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user challenges: {exc}",
        )

    user_challenges = _extract_records(user_challenges_response)
    challenge_ids = [row.get("challenge_id") for row in user_challenges if row.get("challenge_id") is not None]
    if not user_challenges or not challenge_ids:
        return []

    try:
        challenges_response = (
            supabase_client.table("challenges")
            .select("*")
            .in_("id", challenge_ids)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch challenge details: {exc}",
        )

    challenges_by_id = _challenge_lookup(_extract_records(challenges_response))
    return [_merge_user_challenge(row, challenges_by_id.get(str(row.get("challenge_id")))) for row in user_challenges]


def join_challenge(user_id: str, challenge_id: str) -> dict:
    supabase_client = get_supabase_admin_client()

    try:
        challenge_response = (
            supabase_client.table("challenges")
            .select("*")
            .eq("id", challenge_id)
            .eq("is_active", True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load challenge: {exc}",
        )

    challenge = _first_record(challenge_response)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found or inactive")

    try:
        existing_response = (
            supabase_client.table("user_challenges")
            .select("*")
            .eq("user_id", user_id)
            .eq("challenge_id", challenge_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check existing user challenge: {exc}",
        )

    existing = _first_record(existing_response)
    if existing is not None:
        return _merge_user_challenge(existing, challenge)

    joined_record = {
        "user_id": user_id,
        "challenge_id": challenge_id,
        "progress": 0,
        "status": "active",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
    }

    try:
        response = (
            supabase_client.table("user_challenges")
            .upsert(joined_record, on_conflict="user_id,challenge_id")
            .select("*")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join challenge: {exc}",
        )

    saved_record = _first_record(response)
    if saved_record is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save joined challenge")

    return _merge_user_challenge(saved_record, challenge)


def update_user_challenges(user_id: str, summary_date: str) -> dict:
    supabase_client = get_supabase_admin_client()

    try:
        user_challenges_response = (
            supabase_client.table("user_challenges")
            .select("*")
            .eq("user_id", user_id)
            .eq("status", "active")
            .execute()
        )
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
        challenge_lookup_response = (
            supabase_client.table("challenges").select("*").execute()
        )
        daily_progress_response = (
            supabase_client.table("user_challenge_daily_progress")
            .select("*")
            .eq("user_id", user_id)
            .eq("progress_date", summary_date)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load challenge progress data: {exc}",
        )

    user_challenges = _extract_records(user_challenges_response)
    health_record = _first_record(health_response) or {}
    wellness_record = _first_record(wellness_response) or {}
    challenges_by_id = _challenge_lookup(_extract_records(challenge_lookup_response))
    existing_progress_rows = _extract_records(daily_progress_response)

    existing_progress_keys = {
        f"{row.get('challenge_id')}::{row.get('progress_date')}"
        for row in existing_progress_rows
    }

    updated_challenges: list[dict] = []
    completed_challenges: list[dict] = []

    for user_challenge in user_challenges:
        challenge_id = user_challenge.get("challenge_id")
        if challenge_id is None:
            continue

        challenge = challenges_by_id.get(str(challenge_id))
        if challenge is None:
            continue

        challenge_type = challenge.get("challenge_type")
        target_value = int(challenge.get("target_value", 0) or 0)
        duration_days = int(challenge.get("duration_days", 0) or 0)
        current_progress = int(user_challenge.get("progress", 0) or 0)
        status_value = str(user_challenge.get("status", "active"))

        qualifies = False
        if challenge_type == "steps":
            qualifies = int(health_record.get("steps", 0) or 0) >= target_value
        elif challenge_type == "sleep_minutes":
            qualifies = int(health_record.get("sleep_minutes", 0) or 0) >= target_value
        elif challenge_type == "workout_days":
            qualifies = int(health_record.get("workout_count", 0) or 0) > 0 or int(health_record.get("active_minutes", 0) or 0) >= 20
        elif challenge_type == "wellness_score":
            qualifies = int(wellness_record.get("total_score", 0) or 0) >= target_value

        progress_key = f"{challenge_id}::{summary_date}"
        if not qualifies or progress_key in existing_progress_keys or status_value != "active":
            updated_challenges.append(_merge_user_challenge(user_challenge, challenge))
            continue

        new_progress = current_progress + 1
        completed_at = user_challenge.get("completed_at")
        new_status = status_value
        if duration_days > 0 and new_progress >= duration_days:
            new_status = "completed"
            completed_at = datetime.now(timezone.utc).isoformat()

        try:
            progress_insert_response = (
                supabase_client.table("user_challenge_daily_progress")
                .insert(
                    {
                        "user_id": user_id,
                        "challenge_id": challenge_id,
                        "progress_date": summary_date,
                    }
                )
                .select("*")
                .execute()
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to record challenge daily progress: {exc}",
            )

        if _first_record(progress_insert_response) is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save challenge daily progress",
            )

        updated_record = {
            "user_id": user_id,
            "challenge_id": challenge_id,
            "progress": new_progress,
            "status": new_status,
            "started_at": user_challenge.get("started_at"),
            "completed_at": completed_at,
        }

        try:
            saved_response = (
                supabase_client.table("user_challenges")
                .upsert(updated_record, on_conflict="user_id,challenge_id")
                .select("*")
                .execute()
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update user challenge: {exc}",
            )

        saved_record = _first_record(saved_response)
        if saved_record is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to persist updated challenge",
            )

        merged = _merge_user_challenge(saved_record, challenge)
        updated_challenges.append(merged)
        if new_status == "completed":
            completed_challenges.append(merged)

    return {
        "updated_challenges": updated_challenges,
        "completed_challenges": completed_challenges,
    }