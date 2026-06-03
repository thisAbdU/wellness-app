"""Rule-based behavioral pattern detection (Python only until confirmed)."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from statistics import mean
from typing import Any

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.services.gemini_service import HealthCoachClient, InsightType

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _fetch_summaries(user_id: str, weeks: int = 8) -> list[dict]:
	end = datetime.now(timezone.utc).date()
	start = end - timedelta(days=weeks * 7)
	client = get_supabase_admin_client()
	response = (
		client.table("health_daily_summaries")
		.select("*")
		.eq("user_id", user_id)
		.gte("summary_date", start.isoformat())
		.lte("summary_date", end.isoformat())
		.execute()
	)
	return extract_records(response)


def detect_patterns(user_id: str) -> list[dict[str, Any]]:
	rows = _fetch_summaries(user_id)
	if len(rows) < 14:
		return []

	all_steps = [float(r.get("steps") or 0) for r in rows if r.get("steps")]
	all_sleep_hrs = [(r.get("sleep_minutes") or 0) / 60 for r in rows]
	overall_avg_steps = mean(all_steps) if all_steps else 0
	overall_avg_sleep = mean(all_sleep_hrs) if all_sleep_hrs else 0

	by_weekday_steps: dict[int, list[float]] = defaultdict(list)
	by_weekday_sleep: dict[int, list[float]] = defaultdict(list)
	by_date_steps: dict[date, float] = {}

	for row in rows:
		summary_date = date.fromisoformat(str(row["summary_date"])[:10])
		weekday = summary_date.weekday()
		steps = float(row.get("steps") or 0)
		sleep_hrs = (row.get("sleep_minutes") or 0) / 60
		by_weekday_steps[weekday].append(steps)
		by_weekday_sleep[weekday].append(sleep_hrs)
		by_date_steps[summary_date] = steps

	patterns: list[dict[str, Any]] = []

	for weekday, values in by_weekday_steps.items():
		day_avg = mean(values)
		if overall_avg_steps > 0 and day_avg < overall_avg_steps * 0.7:
			deficit_pct = round((1 - day_avg / overall_avg_steps) * 100)
			day_key = f"{WEEKDAY_NAMES[weekday].lower()}_avg_steps"
			patterns.append(
				{
					"type": "LOW_ACTIVITY_DAY",
					"day": WEEKDAY_NAMES[weekday],
					"user_avg_steps": int(overall_avg_steps),
					day_key: int(day_avg),
					"deficit_pct": deficit_pct,
				}
			)

	for weekday, sleep_vals in by_weekday_sleep.items():
		day_sleep = mean(sleep_vals)
		if overall_avg_sleep > 0 and day_sleep < min(6.0, overall_avg_sleep * 0.85):
			patterns.append(
				{
					"type": "LATE_SLEEP_NIGHT",
					"day": WEEKDAY_NAMES[weekday],
					"avg_sleep_hrs": round(day_sleep, 1),
					"user_avg_sleep_hrs": round(overall_avg_sleep, 1),
					"note": "Inferred from shorter sleep duration on this weekday",
				}
			)

	friday_steps = by_weekday_steps.get(4, [])
	saturday_steps = by_weekday_steps.get(5, [])
	sunday_steps = by_weekday_steps.get(6, [])
	if friday_steps and saturday_steps and sunday_steps:
		weekend_peak = mean(friday_steps + saturday_steps)
		sunday_avg = mean(sunday_steps)
		if overall_avg_steps > 0 and weekend_peak > overall_avg_steps * 1.3 and sunday_avg < overall_avg_steps * 0.5:
			patterns.append(
				{
					"type": "WEEKEND_CRASH",
					"friday_saturday_avg_steps": int(weekend_peak),
					"sunday_avg_steps": int(sunday_avg),
					"user_avg_steps": int(overall_avg_steps),
				}
			)

	return patterns


def _pattern_exists(user_id: str, pattern_type: str, day: str | None) -> bool:
	client = get_supabase_admin_client()
	response = (
		client.table("behavioral_patterns")
		.select("detail_json")
		.eq("user_id", user_id)
		.eq("pattern_type", pattern_type)
		.eq("dismissed", False)
		.execute()
	)
	for row in extract_records(response):
		detail = row.get("detail_json") or {}
		if day is None or detail.get("day") == day:
			return True
	return False


def run_weekly_detection(user_id: str) -> list[dict[str, Any]]:
	client = get_supabase_admin_client()
	coach = HealthCoachClient()
	stored: list[dict[str, Any]] = []

	for pattern in detect_patterns(user_id):
		pattern_type = pattern["type"]
		day = pattern.get("day")
		if _pattern_exists(user_id, pattern_type, day):
			continue

		insight = coach.generate_with_context(
			user_id=user_id,
			insight_type=InsightType.BEHAVIORAL_PATTERN,
			context_block={"pattern": pattern},
			use_cache=False,
		)
		row = {
			"user_id": user_id,
			"pattern_type": pattern_type,
			"detail_json": {**pattern, "coach_insight": insight},
			"detected_at": datetime.now(timezone.utc).isoformat(),
			"dismissed": False,
		}
		response = client.table("behavioral_patterns").insert(row).select("*").execute()
		saved = first_record(response)
		if saved:
			stored.append(saved)

	return stored


def get_user_patterns(user_id: str, include_dismissed: bool = False) -> list[dict]:
	client = get_supabase_admin_client()
	query = client.table("behavioral_patterns").select("*").eq("user_id", user_id)
	if not include_dismissed:
		query = query.eq("dismissed", False)
	response = query.order("detected_at", desc=True).execute()
	return extract_records(response)
