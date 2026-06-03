from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.badges.service import get_all_badges, get_user_badges


router = APIRouter(prefix="/badges", tags=["Badges"])


@router.get("")
async def list_badges() -> dict[str, object]:
    badges = get_all_badges()
    return {
        "success": True,
        "message": "Badges fetched successfully",
        "data": badges,
    }


@router.get("/me")
async def my_badges(current_user: dict = Depends(get_current_user)) -> dict[str, object]:
    badges = get_user_badges(current_user["id"])
    return {
        "success": True,
        "message": "Earned badges fetched successfully",
        "data": badges,
    }