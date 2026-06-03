"""Emergency notify: FCM + SMS fire-and-forget."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.services.fcm_service import send_push
from app.settings import settings

logger = logging.getLogger(__name__)


def _fetch_contacts(user_id: str) -> list[dict]:
	client = get_supabase_admin_client()
	response = (
		client.table("emergency_contacts")
		.select("*")
		.eq("user_id", user_id)
		.execute()
	)
	return extract_records(response)


def _fetch_user_name(user_id: str) -> str:
	client = get_supabase_admin_client()
	profile = first_record(
		client.table("profiles").select("full_name, display_name").eq("user_id", user_id).limit(1).execute()
	) or {}
	return profile.get("full_name") or profile.get("display_name") or "Your contact"


def _send_sms(phone: str, message: str) -> bool:
	if not settings.africastalking_api_key or not settings.africastalking_username:
		logger.info("SMS skipped (Africa's Talking not configured)")
		return False
	try:
		import africastalking

		africastalking.initialize(settings.africastalking_username, settings.africastalking_api_key)
		sms = africastalking.SMS
		response = sms.send(message, [phone], settings.africastalking_shortcode)
		return bool(response)
	except Exception as exc:
		logger.warning("SMS failed: %s", exc)
		return False


def _log_emergency(
	user_id: str,
	contact: dict,
	fcm_sent: bool,
	sms_sent: bool,
	gps_lat: float | None,
	gps_lng: float | None,
) -> None:
	client = get_supabase_admin_client()
	client.table("emergency_log").insert(
		{
			"user_id": user_id,
			"contact_name": contact.get("name"),
			"contact_phone": contact.get("phone"),
			"fcm_sent": fcm_sent,
			"sms_sent": sms_sent,
			"gps_lat": gps_lat,
			"gps_lng": gps_lng,
			"created_at": datetime.now(timezone.utc).isoformat(),
		}
	).execute()


def notify_contact(
	user_id: str,
	user_name: str,
	contact: dict,
	gps_lat: float | None,
	gps_lng: float | None,
) -> None:
	body = (
		f"{user_name} has triggered an emergency alert. "
		"Please check on them immediately."
	)
	if gps_lat is not None and gps_lng is not None:
		body += f" Last location: {gps_lat:.5f}, {gps_lng:.5f}"

	fcm_sent = False
	token = contact.get("fcm_token")
	if token:
		fcm_sent = send_push(token, "Emergency Alert", body, data={"type": "emergency", "user_id": user_id})

	sms_sent = False
	phone = contact.get("phone")
	if phone:
		sms_sent = _send_sms(phone, body)

	_log_emergency(user_id, contact, fcm_sent, sms_sent, gps_lat, gps_lng)

