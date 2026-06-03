"""API v1 health record ingestion and summaries."""

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.health_records import HealthRecordsSyncRequest
from app.services.health_ingestion_service import get_health_summaries, sync_health_records

router = APIRouter(prefix="/health", tags=["Health v1"])


@router.post("/sync")
async def sync_records(
	payload: HealthRecordsSyncRequest,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	result = sync_health_records(user_id=current_user["id"], records=payload.records)
	return {
		"success": True,
		"message": "Health records synced successfully",
		"data": result,
	}


@router.get("/summary")
async def health_summary(
	from_date: str,
	to_date: str,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	summaries = get_health_summaries(
		user_id=current_user["id"],
		from_date=from_date,
		to_date=to_date,
	)
	return {
		"success": True,
		"message": "Health summaries fetched successfully",
		"data": summaries,
	}
