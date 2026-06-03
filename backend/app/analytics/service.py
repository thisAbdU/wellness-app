from __future__ import annotations

from datetime import date, timedelta

from fastapi import HTTPException, status

from app.supabase_client import get_supabase_admin_client


def _date_strings(start_date: date, end_date: date) -> list[str]:
	total_days = (end_date - start_date).days + 1
	return [(start_date + timedelta(days=offset)).isoformat() for offset in range(total_days)]


def _safe_float(value: object) -> float:
	if value is None:
		return 0.0
	return float(value)


def _safe_int(value: object) -> int:
	if value is None:
		return 0
	return int(value)


def _records_by_date(records: list[dict], date_field: str) -> dict[str, dict]:
	mapped: dict[str, dict] = {}
	for record in records:
		raw_date = record.get(date_field)
		if raw_date is None:
			continue
		mapped[str(raw_date)] = record
	return mapped


def _average(values: list[float | int]) -> float:
	if not values:
		return 0.0
	return round(sum(values) / len(values), 2)


def get_weekly_analytics(user_id: str) -> dict:
	supabase_client = get_supabase_admin_client()
	end_date = date.today()
	start_date = end_date - timedelta(days=6)
	days = _date_strings(start_date, end_date)

	try:
		health_response = (
			supabase_client.table("health_daily_summaries")
			.select("*")
			.eq("user_id", user_id)
			.gte("summary_date", start_date.isoformat())
			.lte("summary_date", end_date.isoformat())
			.order("summary_date")
			.execute()
		)
		wellness_response = (
			supabase_client.table("wellness_scores")
			.select("*")
			.eq("user_id", user_id)
			.gte("score_date", start_date.isoformat())
			.lte("score_date", end_date.isoformat())
			.order("score_date")
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch weekly analytics: {exc}",
		)

	health_records = getattr(health_response, "data", []) or []
	wellness_records = getattr(wellness_response, "data", []) or []

	health_by_date = _records_by_date(health_records, "summary_date")
	wellness_by_date = _records_by_date(wellness_records, "score_date")

	steps: list[int] = []
	sleep_minutes: list[int] = []
	active_minutes: list[int] = []
	calories_burned: list[float] = []
	wellness_scores: list[int] = []

	for day in days:
		health_record = health_by_date.get(day, {})
		wellness_record = wellness_by_date.get(day, {})

		steps.append(_safe_int(health_record.get("steps")))
		sleep_minutes.append(_safe_int(health_record.get("sleep_minutes")))
		active_minutes.append(_safe_int(health_record.get("active_minutes")))
		calories_burned.append(_safe_float(health_record.get("calories_burned")))
		wellness_scores.append(_safe_int(wellness_record.get("total_score")))

	return {
		"days": days,
		"steps": steps,
		"sleep_minutes": sleep_minutes,
		"active_minutes": active_minutes,
		"calories_burned": calories_burned,
		"wellness_scores": wellness_scores,
		"average_steps": _average(steps),
		"average_sleep_minutes": _average(sleep_minutes),
		"average_wellness_score": _average(wellness_scores),
	}


def get_monthly_analytics(user_id: str) -> dict:
	supabase_client = get_supabase_admin_client()
	end_date = date.today()
	start_date = end_date - timedelta(days=29)
	days = _date_strings(start_date, end_date)

	try:
		health_response = (
			supabase_client.table("health_daily_summaries")
			.select("*")
			.eq("user_id", user_id)
			.gte("summary_date", start_date.isoformat())
			.lte("summary_date", end_date.isoformat())
			.order("summary_date")
			.execute()
		)
		wellness_response = (
			supabase_client.table("wellness_scores")
			.select("*")
			.eq("user_id", user_id)
			.gte("score_date", start_date.isoformat())
			.lte("score_date", end_date.isoformat())
			.order("score_date")
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch monthly analytics: {exc}",
		)

	health_records = getattr(health_response, "data", []) or []
	wellness_records = getattr(wellness_response, "data", []) or []

	health_by_date = _records_by_date(health_records, "summary_date")
	wellness_by_date = _records_by_date(wellness_records, "score_date")

	steps: list[int] = []
	sleep_minutes: list[int] = []
	active_minutes: list[int] = []
	wellness_scores: list[int] = []
	workouts_by_day: list[int] = []

	for day in days:
		health_record = health_by_date.get(day, {})
		wellness_record = wellness_by_date.get(day, {})

		steps_value = _safe_int(health_record.get("steps"))
		sleep_value = _safe_int(health_record.get("sleep_minutes"))
		active_value = _safe_int(health_record.get("active_minutes"))
		wellness_value = _safe_int(wellness_record.get("total_score"))
		workout_value = _safe_int(health_record.get("workout_count"))

		steps.append(steps_value)
		sleep_minutes.append(sleep_value)
		active_minutes.append(active_value)
		wellness_scores.append(wellness_value)
		workouts_by_day.append(workout_value)

	wellness_day_pairs = [
		(day, wellness_scores[index])
		for index, day in enumerate(days)
	]
	scored_days = [pair for pair in wellness_day_pairs if pair[1] > 0]

	recent_window = wellness_scores[-7:]
	previous_window = wellness_scores[-14:-7]
	recent_avg = _average(recent_window)
	previous_avg = _average(previous_window)
	improvement_percentage = 0.0
	if previous_avg != 0:
		improvement_percentage = round(((recent_avg - previous_avg) / previous_avg) * 100, 2)

	best_wellness_day = None
	worst_wellness_day = None
	if scored_days:
		best_wellness_day = max(scored_days, key=lambda item: item[1])[0]
		worst_wellness_day = min(scored_days, key=lambda item: item[1])[0]

	return {
		"start_date": start_date.isoformat(),
		"end_date": end_date.isoformat(),
		"average_steps": _average(steps),
		"average_sleep_minutes": _average(sleep_minutes),
		"average_active_minutes": _average(active_minutes),
		"average_wellness_score": _average(wellness_scores),
		"total_workouts": sum(workouts_by_day),
		"best_wellness_day": best_wellness_day,
		"worst_wellness_day": worst_wellness_day,
		"improvement_percentage": improvement_percentage,
	}
