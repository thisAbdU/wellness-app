"""Read and update notification preferences stored on a user's profile."""

from __future__ import annotations

from fastapi import HTTPException, status

from app.db.helpers import first_record
from app.db.supabase_client import get_supabase_admin_client
from app.schemas.notifications import NotificationPreferences


DEFAULT_PREFERENCES = NotificationPreferences().model_dump()


def get_notification_preferences(user_id: str) -> dict[str, bool]:
	client = get_supabase_admin_client()

	try:
		response = (
			client.table("profiles")
			.select("notification_prefs")
			.eq("user_id", user_id)
			.limit(1)
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch notification preferences: {exc}",
		) from exc

	profile = first_record(response) or {}
	saved = profile.get("notification_prefs")
	if not isinstance(saved, dict):
		saved = {}

	return {**DEFAULT_PREFERENCES, **saved}


def update_notification_preferences(
	user_id: str,
	preferences: NotificationPreferences,
) -> dict[str, bool]:
	client = get_supabase_admin_client()
	values = preferences.model_dump()

	try:
		response = (
			client.table("profiles")
			.update({"notification_prefs": values})
			.eq("user_id", user_id)
			.select("notification_prefs")
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to update notification preferences: {exc}",
		) from exc

	if first_record(response) is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="User profile not found",
		)

	return values
