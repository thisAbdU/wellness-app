"""Emergency notification endpoint."""

from pydantic import BaseModel

from fastapi import APIRouter, BackgroundTasks, Depends, Request

from app.dependencies import get_current_user
from app.rate_limit import limiter
from app.services.emergency_service import (
	_fetch_contacts,
	_fetch_user_name,
	notify_contact,
)

router = APIRouter(prefix="/emergency", tags=["Emergency v1"])


class EmergencyNotifyRequest(BaseModel):
	gps_lat: float | None = None
	gps_lng: float | None = None


@router.post("/notify")
@limiter.limit("3/hour")
async def emergency_notify(
	request: Request,
	payload: EmergencyNotifyRequest,
	background_tasks: BackgroundTasks,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	user_id = current_user["id"]
	contacts = _fetch_contacts(user_id)
	if not contacts:
		return {
			"success": True,
			"message": "No emergency contacts on file",
			"data": {"queued": 0},
		}

	user_name = _fetch_user_name(user_id)
	for contact in contacts:
		background_tasks.add_task(
			notify_contact,
			user_id,
			user_name,
			contact,
			payload.gps_lat,
			payload.gps_lng,
		)

	return {
		"success": True,
		"message": "Emergency notifications queued",
		"data": {"queued": len(contacts)},
	}
