"""API v1 nutritionist endpoints."""

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user
from app.services.nutritionist_service import generate_daily_plan

router = APIRouter(prefix="/nutrition", tags=["Nutrition v1"])


@router.get("/daily-plan")
async def daily_plan(
	language: str | None = Query(default=None),
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	plan = generate_daily_plan(current_user["id"], language=language)
	return {
		"success": True,
		"message": "Daily nutrition plan generated successfully",
		"data": plan,
	}
