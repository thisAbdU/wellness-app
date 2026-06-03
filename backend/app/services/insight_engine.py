"""Pre-compute health trends; pass structured JSON to Gemini (no math in LLM)."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from statistics import mean
from typing import Any

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.services.gemini_service import HealthCoachClient, InsightType

SLEEP_GOAL_HRS = 7.0
STEPS_GOAL = 10_000


def _parse_date(value: str) -> date:
	return date.fromisoformat(str(value)[:10])


def _pct_change(current: float, previous: float) -> float | None:
	if previous == 0:
		return None if current == 0 else 100.0
	return round(((current - previous) / previous) * 100, 1)


def _avg(values: list[float]) -> float:
	return round(mean(values), 2) if values else 0.0


def _fetch_summaries(user_id: str, days: int = 14) -> list[dict]:
	end = datetime.now(timezone.utc).date()
	start = end - timedelta(days=days - 1)
	client = get_supabase_admin_client()
	response = (
		client.table("health_daily_summaries")
		.select("*")
		.eq("user_id", user_id)
		.gte("summary_date", start.isoformat())
		.lte("summary_date", end.isoformat())
		.order("summary_date")
		.execute()
	)
	return extract_records(response)


def _fetch_profile(user_id: str) -> dict[str, Any]:
	client = get_supabase_admin_client()
	response = (
		client.table("profiles").select("*").eq("user_id", user_id).limit(1).execute()
	)
	return first_record(response) or {}


def compute_trend_context(user_id: str) -> dict[str, Any]:
	rows = _fetch_summaries(user_id, days=14)
	profile = _fetch_profile(user_id)

	by_date = {_parse_date(r["summary_date"]): r for r in rows if r.get("summary_date")}
	dates_sorted = sorted(by_date.keys())
	if len(dates_sorted) < 7:
		recent_dates = dates_sorted
		prior_dates: list[date] = []
	else:
		recent_dates = dates_sorted[-7:]
		prior_dates = dates_sorted[-14:-7]

	def slice_metrics(dates: list[date]) -> dict[str, list[float]]:
		sleep_hrs: list[float] = []
		steps: list[float] = []
		resting_hr: list[float] = []
		workouts: list[float] = []
		for d in dates:
			row = by_date.get(d, {})
			sleep_hrs.append((row.get("sleep_minutes") or 0) / 60)
			steps.append(float(row.get("steps") or 0))
			hr = row.get("resting_heart_rate")
			if hr:
				resting_hr.append(float(hr))
			workouts.append(float(row.get("workout_count") or 0))
		return {
			"sleep_hrs": sleep_hrs,
			"steps": steps,
			"resting_hr": resting_hr,
			"workouts": workouts,
		}

	recent = slice_metrics(recent_dates)
	prior = slice_metrics(prior_dates)

	avg_sleep_7 = _avg(recent["sleep_hrs"])
	avg_sleep_prev = _avg(prior["sleep_hrs"])
	avg_steps_7 = _avg(recent["steps"])
	avg_steps_prev = _avg(prior["steps"])
	avg_hr_7 = _avg(recent["resting_hr"])
	avg_hr_prev = _avg(prior["resting_hr"])
	workout_count_7 = int(sum(recent["workouts"]))
	workout_count_prev = int(sum(prior["workouts"]))

	hr_trend = "stable"
	if avg_hr_7 and avg_hr_prev:
		if avg_hr_7 > avg_hr_prev * 1.05:
			hr_trend = "rising"
		elif avg_hr_7 < avg_hr_prev * 0.95:
			hr_trend = "falling"

	days_under_7hrs = sum(1 for h in recent["sleep_hrs"] if 0 < h < SLEEP_GOAL_HRS)
	goal_hit_days = sum(1 for s in recent["steps"] if s >= STEPS_GOAL)

	best_day = max(recent_dates, key=lambda d: by_date.get(d, {}).get("steps", 0), default=None)
	worst_day = min(recent_dates, key=lambda d: by_date.get(d, {}).get("steps", 0) or 999999, default=None)

	return {
		"user": {
			"age": profile.get("age"),
			"goal": profile.get("fitness_goal") or profile.get("weight_goal") or "general_wellness",
			"city": profile.get("city") or "Addis Ababa",
		},
		"sleep": {
			"avg_7d_hrs": avg_sleep_7,
			"avg_prev_7d_hrs": avg_sleep_prev,
			"delta_pct": _pct_change(avg_sleep_7, avg_sleep_prev),
			"days_under_7hrs": days_under_7hrs,
		},
		"steps": {
			"avg_7d": int(avg_steps_7),
			"avg_prev_7d": int(avg_steps_prev),
			"delta_pct": _pct_change(avg_steps_7, avg_steps_prev),
			"goal": STEPS_GOAL,
			"goal_hit_days": goal_hit_days,
		},
		"resting_hr": {
			"avg_7d_bpm": int(avg_hr_7) if avg_hr_7 else None,
			"avg_prev_7d_bpm": int(avg_hr_prev) if avg_hr_prev else None,
			"trend": hr_trend,
		},
		"workouts": {
			"count_7d": workout_count_7,
			"count_prev_7d": workout_count_prev,
		},
		"best_day": best_day.isoformat() if best_day else None,
		"worst_day": worst_day.isoformat() if worst_day else None,
	}


def generate_weekly_summary(user_id: str) -> dict[str, Any]:
	context = compute_trend_context(user_id)
	client = HealthCoachClient()
	insight = client.generate_with_context(
		user_id=user_id,
		insight_type=InsightType.WEEKLY_SUMMARY,
		context_block=context,
		use_cache=True,
	)
	return {"context": context, "insight": insight}
