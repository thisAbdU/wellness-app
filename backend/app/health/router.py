from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.health.schemas import HealthSyncRequest
from app.health.service import get_daily_health_data, sync_health_data


router = APIRouter(prefix="/health", tags=["Health"])


@router.post("/sync")
async def sync_health(
	payload: HealthSyncRequest,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	result = sync_health_data(user_id=current_user["id"], payload=payload)
	return {
		"success": True,
		"message": "Health data synced successfully",
		"data": result,
	}


@router.get("/daily")
async def daily_health(
	summary_date: str,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	result = get_daily_health_data(user_id=current_user["id"], summary_date=summary_date)
	return {
		"success": True,
		"message": "Daily health data fetched successfully",
		"data": result,
	}
