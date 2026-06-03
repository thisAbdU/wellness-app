from fastapi import APIRouter, Depends

from app.analytics.service import get_monthly_analytics, get_weekly_analytics
from app.auth import get_current_user


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/weekly")
async def weekly_analytics(current_user: dict = Depends(get_current_user)) -> dict[str, object]:
	result = get_weekly_analytics(current_user["id"])
	return {
		"success": True,
		"message": "Weekly analytics fetched successfully",
		"data": result,
	}


@router.get("/monthly")
async def monthly_analytics(current_user: dict = Depends(get_current_user)) -> dict[str, object]:
	result = get_monthly_analytics(current_user["id"])
	return {
		"success": True,
		"message": "Monthly analytics fetched successfully",
		"data": result,
	}
