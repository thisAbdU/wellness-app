"""Health alert evaluation and FCM delivery (template-based, no Gemini)."""

from __future__ import annotations

import enum
from datetime import datetime, timedelta, timezone
from statistics import mean
from typing import Any

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.services.burnout_detector import BURNOUT_THRESHOLD, compute_signals
from app.services.fcm_service import send_push_to_user

ALERT_COOLDOWN_HOURS = 48


class AlertType(str, enum.Enum):
	POOR_SLEEP_TREND = "POOR_SLEEP_TREND"
	LOW_ACTIVITY_TREND = "LOW_ACTIVITY_TREND"
	BURNOUT_WARNING = "BURNOUT_WARNING"


TEMPLATES = {
	AlertType.POOR_SLEEP_TREND: {
		"en": {
			"title": "Sleep needs attention",
			"body": "Your 3-day sleep average is below 5.5 hours. Try an earlier bedtime tonight.",
		},
		"am": {
			"title": "የእንቅልፍ ጊዜ ይፈልጋል",
			"body": "በ3 ቀናት ውስጥ አማካይ እንቅልፍዎ ከ5.5 ሰዓት ያነሰ ነው። ዛሬ ማታ ቀይር ለመኝት ይሞክሩ።",
		},
	},
	AlertType.LOW_ACTIVITY_TREND: {
		"en": {
			"title": "Let's move today",
			"body": "No steps logged for 2 days. A short walk around your neighborhood helps.",
		},
		"am": {
			"title": "ዛሬ እንንቀሳቀስ",
			"body": "ለ2 ቀናት እርምጃ አልተመዘገበም። በሰፈር ውስጥ አጭር ጉዞ ይረዳል።",
		},
	},
	AlertType.BURNOUT_WARNING: {
		"en": {
			"title": "Recovery recommended",
			"body": "Sleep, activity, and heart rate patterns suggest you may need rest. Take it easier today.",
		},
		"am": {
			"title": "መከላከል ያስፈልጋል",
			"body": "እንቅልፍ እና እንቀሳቀስ መስመርዎ እረፍት እንደሚያስፈልግ ይመስላል። ዛሬ ቀላል ቀን ያድርጉ።",
		},
	},
}


def _recent_alert_sent(user_id: str, alert_type: AlertType) -> bool:
	client = get_supabase_admin_client()
	cutoff = (datetime.now(timezone.utc) - timedelta(hours=ALERT_COOLDOWN_HOURS)).isoformat()
	response = (
		client.table("alert_log")
		.select("id")
		.eq("user_id", user_id)
		.eq("alert_type", alert_type.value)
		.gte("sent_at", cutoff)
		.limit(1)
		.execute()
	)
	return bool(extract_records(response))


def _log_alert(user_id: str, alert_type: AlertType, title: str, body: str, delivered: bool) -> None:
	client = get_supabase_admin_client()
	client.table("alert_log").insert(
		{
			"user_id": user_id,
			"alert_type": alert_type.value,
			"title": title,
			"body": body,
			"delivered": delivered,
			"sent_at": datetime.now(timezone.utc).isoformat(),
		}
	).execute()


def _send_alert(user_id: str, alert_type: AlertType, lang: str) -> bool:
	if _recent_alert_sent(user_id, alert_type):
		return False
	templates = TEMPLATES[alert_type]
	msg = templates.get(lang) or templates["en"]
	delivered = send_push_to_user(user_id, msg["title"], msg["body"], data={"alert_type": alert_type.value})
	_log_alert(user_id, alert_type, msg["title"], msg["body"], delivered)
	return delivered


def evaluate_user_alerts(user_id: str, lang: str = "en") -> list[str]:
	client = get_supabase_admin_client()
	end = datetime.now(timezone.utc).date()
	start = end - timedelta(days=5)
	response = (
		client.table("health_daily_summaries")
		.select("*")
		.eq("user_id", user_id)
		.gte("summary_date", start.isoformat())
		.order("summary_date")
		.execute()
	)
	rows = extract_records(response)
	sent: list[str] = []

	if len(rows) >= 3:
		recent = rows[-3:]
		sleep_hrs = [(r.get("sleep_minutes") or 0) / 60 for r in recent]
		if mean(sleep_hrs) < 5.5 and _send_alert(user_id, AlertType.POOR_SLEEP_TREND, lang):
			sent.append(AlertType.POOR_SLEEP_TREND.value)

	if len(rows) >= 2:
		last_two = rows[-2:]
		zero_steps_days = [r for r in last_two if int(r.get("steps") or 0) == 0]
		# Sunday rest exception: skip if latest day is Sunday
		latest_date = date.fromisoformat(str(rows[-1]["summary_date"])[:10])
		if len(zero_steps_days) >= 2 and latest_date.weekday() != 6:
			if _send_alert(user_id, AlertType.LOW_ACTIVITY_TREND, lang):
				sent.append(AlertType.LOW_ACTIVITY_TREND.value)

	if compute_signals(user_id).score() >= BURNOUT_THRESHOLD:
		if _send_alert(user_id, AlertType.BURNOUT_WARNING, lang):
			sent.append(AlertType.BURNOUT_WARNING.value)

	return sent


def run_nightly_alerts() -> int:
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
	total = 0
	for user_id in user_ids:
		profile = first_record(
			client.table("profiles").select("preferred_language").eq("user_id", user_id).limit(1).execute()
		) or {}
		lang = profile.get("preferred_language") or "en"
		total += len(evaluate_user_alerts(user_id, lang))
	return total
