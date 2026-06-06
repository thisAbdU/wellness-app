"""API v1 notification preference endpoints."""

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.notifications import NotificationPreferences
from app.services.notification_preference_service import (
	get_notification_preferences,
	update_notification_preferences,
)

router = APIRouter(prefix="/notifications", tags=["Notifications v1"])


@router.get("/preferences")
async def notification_preferences(
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	preferences = get_notification_preferences(current_user["id"])
	return {
		"success": True,
		"message": "Notification preferences fetched successfully",
		"data": preferences,
	}


@router.put("/preferences")
async def save_notification_preferences(
	payload: NotificationPreferences,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	preferences = update_notification_preferences(current_user["id"], payload)
	return {
		"success": True,
		"message": "Notification preferences updated successfully",
		"data": preferences,
	}
