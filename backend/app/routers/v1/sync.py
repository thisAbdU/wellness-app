"""API v1 offline sync endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.sync import SyncPullResponse, SyncPushRequest, SyncPushResult
from app.services.sync_service import pull_sync_records, push_sync_records

router = APIRouter(prefix="/sync", tags=["Sync v1"])


@router.post("/push")
async def sync_push(
	payload: SyncPushRequest,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	result: SyncPushResult = push_sync_records(user_id=current_user["id"], request=payload)
	return {
		"success": True,
		"message": "Sync push completed",
		"data": result.model_dump(),
	}


@router.get("/pull")
async def sync_pull(
	since: datetime | None = None,
	device_id: str | None = None,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	pulled = pull_sync_records(
		user_id=current_user["id"],
		since=since,
		device_id=device_id,
	)
	response = SyncPullResponse(**pulled)
	return {
		"success": True,
		"message": "Sync pull completed",
		"data": {
			"records": response.records,
			"server_time": response.server_time.isoformat(),
		},
	}
