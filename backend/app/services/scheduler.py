"""APScheduler background jobs for coach, challenges, and alerts."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from app.db.helpers import extract_records
from app.db.supabase_client import get_supabase_admin_client
from app.services.alert_service import run_nightly_alerts
from app.services.burnout_detector import run_daily_burnout_scan
from app.services.challenge_engine import run_daily_challenge_evaluation
from app.services.pattern_detector import run_weekly_detection
from app.settings import settings

logger = logging.getLogger(__name__)
_scheduler = None


def _active_user_ids() -> list[str]:
	client = get_supabase_admin_client()
	end = datetime.now(timezone.utc).date()
	start = end - timedelta(days=60)
	response = (
		client.table("health_daily_summaries")
		.select("user_id")
		.gte("summary_date", (end - timedelta(days=60)).isoformat())
		.execute()
	)
	return list({str(r["user_id"]) for r in extract_records(response) if r.get("user_id")})


def _weekly_pattern_job() -> None:
	for user_id in _active_user_ids():
		try:
			run_weekly_detection(user_id)
		except Exception as exc:
			logger.warning("Pattern detection failed for %s: %s", user_id, exc)


def start_scheduler():
	global _scheduler
	if not settings.enable_scheduler:
		return None
	if _scheduler is not None:
		return _scheduler

	try:
		from apscheduler.schedulers.background import BackgroundScheduler
		from apscheduler.triggers.cron import CronTrigger
	except ImportError:
		logger.warning("APScheduler not installed — background jobs disabled. pip install APScheduler")
		return None

	_scheduler = BackgroundScheduler(timezone="UTC")
	_scheduler.add_job(run_daily_burnout_scan, CronTrigger(hour=6, minute=0), id="burnout_daily")
	_scheduler.add_job(run_daily_challenge_evaluation, CronTrigger(hour=5, minute=30), id="challenges_daily")
	_scheduler.add_job(_weekly_pattern_job, CronTrigger(day_of_week="mon", hour=7, minute=0), id="patterns_weekly")
	# 11pm Addis Ababa (UTC+3) = 20:00 UTC
	_scheduler.add_job(run_nightly_alerts, CronTrigger(hour=20, minute=0), id="alerts_nightly")
	_scheduler.start()
	logger.info("Background scheduler started")
	return _scheduler


def stop_scheduler() -> None:
	global _scheduler
	if _scheduler is not None:
		_scheduler.shutdown(wait=False)
		_scheduler = None
