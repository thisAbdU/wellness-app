from fastapi import APIRouter

from app.leaderboards.service import get_leaderboard


router = APIRouter(prefix="/leaderboards", tags=["Leaderboards"])


@router.get("")
async def leaderboard(scope: str = "national", value: str | None = None, metric: str = "wellness_score", limit: int = 50) -> dict[str, object]:
    data = get_leaderboard(scope=scope, value=value, metric=metric, limit=limit)
    return {
        "success": True,
        "message": "Leaderboard fetched successfully",
        "data": data,
    }
