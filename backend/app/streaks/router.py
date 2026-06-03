from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.streaks.service import get_user_streaks


router = APIRouter(prefix="/streaks", tags=["Streaks"])


@router.get("/me")
async def get_my_streaks(current_user: dict = Depends(get_current_user)) -> dict[str, object]:
    streaks = get_user_streaks(current_user["id"])
    return {
        "success": True,
        "message": "Streaks fetched successfully",
        "data": streaks,
    }