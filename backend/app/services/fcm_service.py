"""Firebase Cloud Messaging helpers (optional  no-op when not configured)."""

from __future__ import annotations

import json
import logging
from typing import Any

from app.db.helpers import first_record
from app.db.supabase_client import get_supabase_admin_client
from app.settings import settings

logger = logging.getLogger(__name__)
_firebase_initialized = False


def _ensure_firebase() -> bool:
	global _firebase_initialized
	if _firebase_initialized:
		return True
	if not settings.firebase_credentials_json:
		return False
	try:
		import firebase_admin
		from firebase_admin import credentials

		cred_data = json.loads(settings.firebase_credentials_json)
		cred = credentials.Certificate(cred_data)
		firebase_admin.initialize_app(cred)
		_firebase_initialized = True
		return True
	except Exception as exc:
		logger.warning("FCM init failed: %s", exc)
		return False


def send_push(token: str, title: str, body: str, data: dict[str, str] | None = None) -> bool:
	if not token or not _ensure_firebase():
		logger.info("FCM skip (no token or config): %s", title)
		return False
	try:
		from firebase_admin import messaging

		message = messaging.Message(
			notification=messaging.Notification(title=title, body=body),
			data=data or {},
			token=token,
		)
		messaging.send(message)
		return True
	except Exception as exc:
		logger.warning("FCM send failed: %s", exc)
		return False


def send_push_to_user(
	user_id: str,
	title: str,
	body: str,
	data: dict[str, str] | None = None,
) -> bool:
	client = get_supabase_admin_client()
	response = (
		client.table("profiles").select("fcm_token, preferred_language").eq("user_id", user_id).limit(1).execute()
	)
	profile = first_record(response) or {}
	token = profile.get("fcm_token")
	return send_push(token, title, body, data)
