from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.health.schemas import HealthSyncRequest
from app.supabase_client import get_supabase_admin_client
from app.wellness.service import calculate_wellness_score


def _extract_single_record(response: object) -> dict | None:
	data = getattr(response, "data", None)
	if isinstance(data, list):
		return data[0] if data else None
	if isinstance(data, dict):
		return data
	return None


def sync_health_data(user_id: str, payload: HealthSyncRequest) -> dict:
	supabase_client = get_supabase_admin_client()
	summary_date = payload.summary_date.isoformat()
	synced_at = datetime.now(timezone.utc).isoformat()

	health_record = {
		"user_id": user_id,
		"summary_date": summary_date,
		"steps": payload.steps,
		"calories_burned": payload.calories_burned,
		"active_minutes": payload.active_minutes,
		"sleep_minutes": payload.sleep_minutes,
		"sleep_quality_score": payload.sleep_quality_score,
		"resting_heart_rate": payload.resting_heart_rate,
		"workout_count": payload.workout_count,
		"data_source": payload.data_source,
		"synced_at": synced_at,
	}

	wellness_score = calculate_wellness_score(
		steps=payload.steps,
		sleep_minutes=payload.sleep_minutes,
		active_minutes=payload.active_minutes,
		resting_heart_rate=payload.resting_heart_rate,
		workout_count=payload.workout_count,
	)

	wellness_record = {
		"user_id": user_id,
		"score_date": summary_date,
		**wellness_score,
	}

	try:
		health_response = (
			supabase_client.table("health_daily_summaries")
			.upsert(health_record, on_conflict="user_id,summary_date")
			.select("*")
			.execute()
		)
		saved_health_summary = _extract_single_record(health_response)

		if saved_health_summary is None:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail="Failed to save health summary",
			)

		wellness_response = (
			supabase_client.table("wellness_scores")
			.upsert(wellness_record, on_conflict="user_id,score_date")
			.select("*")
			.execute()
		)
		saved_wellness_score = _extract_single_record(wellness_response)

		if saved_wellness_score is None:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail="Failed to save wellness score",
			)

		from app.badges.service import check_and_award_badges
		from app.challenges.service import update_user_challenges
		from app.streaks.service import update_user_streaks

		updated_streaks = update_user_streaks(user_id=user_id, summary_date=summary_date)
		awarded_badges_result = check_and_award_badges(user_id=user_id, summary_date=summary_date)
		challenge_updates = update_user_challenges(user_id=user_id, summary_date=summary_date)

		return {
			"health_summary": saved_health_summary,
			"wellness_score": saved_wellness_score,
			"streaks": updated_streaks,
			"awarded_badges": awarded_badges_result.get("awarded_badges", []),
			"challenges": challenge_updates,
		}
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to sync health data: {exc}",
		)


def get_daily_health_data(user_id: str, summary_date: str) -> dict | None:
	supabase_client = get_supabase_admin_client()

	try:
		response = (
			supabase_client.table("health_daily_summaries")
			.select("*")
			.eq("user_id", user_id)
			.eq("summary_date", summary_date)
			.execute()
		)
		record = _extract_single_record(response)
		return record
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch daily health data: {exc}",
		)
