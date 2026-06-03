"""Rule-based burnout scoring from sleep, activity, and resting HR trends."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from statistics import mean
from typing import Any, Literal

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.services.gemini_service import HealthCoachClient, InsightType
from app.services.fcm_service import send_push_to_user

BURNOUT_THRESHOLD = 6
SLEEP_DEFICIT_HRS = 6.0


@dataclass
class BurnoutSignal:
	sleep_deficit_days: int
	sleep_trend: Literal["rising", "falling", "stable"]
	sleep_delta_pct: float
	step_trend_pct: float
	resting_hr_trend_pct: float
	workout_dropout: bool

	def score(self) -> int:
		total = 0
		if self.sleep_deficit_days >= 3:
			total += 2
		if self.sleep_trend == "falling" and self.sleep_delta_pct < -15:
			total += 2
		if self.step_trend_pct < -25:
			total += 2
		if self.resting_hr_trend_pct > 10:
			total += 3
		if self.workout_dropout:
			total += 1
		return total


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


def compute_signals(user_id: str) -> BurnoutSignal:
	rows = _fetch_summaries(user_id)
	recent = rows[-7:] if len(rows) >= 7 else rows
	prior = rows[-14:-7] if len(rows) >= 14 else []

	def sleep_hrs(batch: list[dict]) -> list[float]:
		return [(r.get("sleep_minutes") or 0) / 60 for r in batch]

	def steps(batch: list[dict]) -> list[float]:
		return [float(r.get("steps") or 0) for r in batch]

	def resting_hr(batch: list[dict]) -> list[float]:
		return [float(r["resting_heart_rate"]) for r in batch if r.get("resting_heart_rate")]

	def workouts(batch: list[dict]) -> list[float]:
		return [float(r.get("workout_count") or 0) for r in batch]

	recent_sleep = sleep_hrs(recent)
	prior_sleep = sleep_hrs(prior)
	sleep_deficit_days = sum(1 for h in recent_sleep if 0 < h < SLEEP_DEFICIT_HRS)

	avg_recent_sleep = mean(recent_sleep) if recent_sleep else 0
	avg_prior_sleep = mean(prior_sleep) if prior_sleep else avg_recent_sleep
	sleep_delta = 0.0
	if avg_prior_sleep > 0:
		sleep_delta = ((avg_recent_sleep - avg_prior_sleep) / avg_prior_sleep) * 100
	sleep_trend: Literal["rising", "falling", "stable"] = "stable"
	if sleep_delta < -5:
		sleep_trend = "falling"
	elif sleep_delta > 5:
		sleep_trend = "rising"

	avg_recent_steps = mean(steps(recent)) if recent else 0
	avg_prior_steps = mean(steps(prior)) if prior else avg_recent_steps
	step_trend_pct = 0.0
	if avg_prior_steps > 0:
		step_trend_pct = ((avg_recent_steps - avg_prior_steps) / avg_prior_steps) * 100

	avg_recent_hr = mean(resting_hr(recent)) if resting_hr(recent) else 0
	avg_prior_hr = mean(resting_hr(prior)) if resting_hr(prior) else avg_recent_hr
	hr_trend_pct = 0.0
	if avg_prior_hr > 0:
		hr_trend_pct = ((avg_recent_hr - avg_prior_hr) / avg_prior_hr) * 100

	recent_workouts = workouts(recent)
	prior_workouts = workouts(prior)
	workout_dropout = False
	if sum(1 for w in prior_workouts if w > 0) >= 3:
		consecutive_zero = 0
		for w in recent_workouts:
			if w == 0:
				consecutive_zero += 1
			else:
				consecutive_zero = 0
		workout_dropout = consecutive_zero >= 3

	return BurnoutSignal(
		sleep_deficit_days=sleep_deficit_days,
		sleep_trend=sleep_trend,
		sleep_delta_pct=round(sleep_delta, 1),
		step_trend_pct=round(step_trend_pct, 1),
		resting_hr_trend_pct=round(hr_trend_pct, 1),
		workout_dropout=workout_dropout,
	)


def evaluate_burnout(user_id: str, *, send_notification: bool = True) -> dict[str, Any] | None:
	signals = compute_signals(user_id)
	score = signals.score()
	if score < BURNOUT_THRESHOLD:
		return None

	context = {"burnout_score": score, "signals": asdict(signals)}
	coach = HealthCoachClient()
	insight = coach.generate_with_context(
		user_id=user_id,
		insight_type=InsightType.BURNOUT_WARNING,
		context_block=context,
		use_cache=False,
	)

	client = get_supabase_admin_client()
	client.table("burnout_events").insert(
		{
			"user_id": user_id,
			"score": score,
			"signals_json": asdict(signals),
			"insight_text": insight,
			"detected_at": datetime.now(timezone.utc).isoformat(),
		}
	).execute()

	if send_notification:
		send_push_to_user(
			user_id,
			title="Wellness check-in",
			body=insight[:180],
			data={"type": "BURNOUT_WARNING", "score": str(score)},
		)

	return {"score": score, "signals": asdict(signals), "insight": insight}


def run_daily_burnout_scan() -> int:
	client = get_supabase_admin_client()
	end = datetime.now(timezone.utc).date()
	start = end - timedelta(days=30)
	response = (
		client.table("health_daily_summaries")
		.select("user_id")
		.gte("summary_date", start.isoformat())
		.execute()
	)
	user_ids = {str(r["user_id"]) for r in extract_records(response) if r.get("user_id")}
	triggered = 0
	for user_id in user_ids:
		if evaluate_burnout(user_id):
			triggered += 1
	return triggered
