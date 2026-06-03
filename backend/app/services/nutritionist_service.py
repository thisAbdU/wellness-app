"""Ethiopian nutrition plans: Harris-Benedict targets + Gemini meal selection."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.services.gemini_service import HealthCoachClient, InsightType

FOODS_JSON = Path(__file__).resolve().parents[2] / "data" / "ethiopian_foods.json"

WeightGoal = Literal["lose", "maintain", "gain"]


def _seed_foods_if_empty() -> None:
	client = get_supabase_admin_client()
	existing = client.table("foods").select("id").limit(1).execute()
	if extract_records(existing):
		return
	foods = json.loads(FOODS_JSON.read_text(encoding="utf-8"))
	client.table("foods").insert(foods).execute()


def _harris_benedict_bmr(
	weight_kg: float,
	height_cm: float,
	age: int,
	gender: str,
) -> float:
	if gender.lower() in ("female", "f"):
		return 655.1 + (9.563 * weight_kg) + (1.850 * height_cm) - (4.676 * age)
	return 66.5 + (13.75 * weight_kg) + (5.003 * height_cm) - (6.775 * age)


def _activity_multiplier(steps: int, had_workout: bool) -> float:
	if had_workout or steps >= 10000:
		return 1.725
	if steps >= 7000:
		return 1.55
	if steps >= 4000:
		return 1.375
	return 1.2


def _goal_adjustment(goal: str, tdee: float) -> tuple[int, int]:
	if goal in ("lose", "weight_loss"):
		return int(tdee - 500), int(tdee - 300)
	if goal in ("gain", "muscle", "weight_gain"):
		return int(tdee + 200), int(tdee + 400)
	return int(tdee - 100), int(tdee + 100)


def _yesterday_activity(user_id: str) -> dict[str, Any]:
	yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
	client = get_supabase_admin_client()
	response = (
		client.table("health_daily_summaries")
		.select("steps, workout_count, active_minutes")
		.eq("user_id", user_id)
		.eq("summary_date", yesterday)
		.limit(1)
		.execute()
	)
	row = first_record(response) or {}
	steps = int(row.get("steps") or 0)
	return {
		"steps": steps,
		"had_workout": int(row.get("workout_count") or 0) > 0 or int(row.get("active_minutes") or 0) >= 20,
	}


def _fetch_profile(user_id: str) -> dict[str, Any]:
	client = get_supabase_admin_client()
	response = client.table("profiles").select("*").eq("user_id", user_id).limit(1).execute()
	return first_record(response) or {}


def _eligible_foods(conditions: list[str]) -> list[dict]:
	client = get_supabase_admin_client()
	response = client.table("foods").select("*").execute()
	foods = extract_records(response)
	# Simple filter: skip very high fat if heart condition noted
	if any("heart" in str(c).lower() for c in conditions):
		foods = [f for f in foods if float(f.get("fat_g") or 0) < 20]
	return foods


def generate_daily_plan(user_id: str, language: str | None = None) -> dict[str, Any]:
	_seed_foods_if_empty()
	profile = _fetch_profile(user_id)
	activity = _yesterday_activity(user_id)

	weight = float(profile.get("weight_kg") or 70)
	height = float(profile.get("height_cm") or 170)
	age = int(profile.get("age") or 30)
	gender = str(profile.get("gender") or "male")
	goal = str(profile.get("fitness_goal") or profile.get("weight_goal") or "maintain")
	conditions = profile.get("health_conditions") or []
	if isinstance(conditions, str):
		conditions = [conditions]

	bmr = _harris_benedict_bmr(weight, height, age, gender)
	multiplier = _activity_multiplier(activity["steps"], activity["had_workout"])
	tdee = bmr * multiplier
	cal_min, cal_max = _goal_adjustment(goal, tdee)

	foods = _eligible_foods(conditions if isinstance(conditions, list) else [])
	by_meal = {
		"breakfast": [f for f in foods if "breakfast" in (f.get("meal_type") or [])],
		"lunch": [f for f in foods if "lunch" in (f.get("meal_type") or [])],
		"dinner": [f for f in foods if "dinner" in (f.get("meal_type") or [])],
	}

	context = {
		"user": {
			"weight_kg": weight,
			"goal": goal,
			"health_conditions": conditions,
			"preferred_language": language or profile.get("preferred_language") or "en",
		},
		"targets": {"calories_min": cal_min, "calories_max": cal_max, "tdee": int(tdee)},
		"yesterday_activity": activity,
		"eligible_foods": by_meal,
	}

	coach = HealthCoachClient()
	plan_text = coach.generate_with_context(
		user_id=user_id,
		insight_type=InsightType.NUTRITION_PLAN,
		context_block=context,
		use_cache=True,
	)

	return {
		"targets": context["targets"],
		"plan": plan_text,
		"food_pool_size": len(foods),
	}
