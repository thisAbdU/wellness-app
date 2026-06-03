from fastapi import Depends, FastAPI

from app.analytics.router import router as analytics_router
from app.badges.router import router as badges_router
from app.challenges.router import router as challenges_router
from app.leaderboards.router import router as leaderboards_router
from app.config import settings
from app.auth import get_current_user
from app.health.router import router as health_router
from app.health.schemas import HealthSyncRequest
from app.streaks.router import router as streaks_router
from app.wellness.service import calculate_wellness_score


app = FastAPI(title="Wellness Tracker Backend")
app.include_router(health_router)
app.include_router(analytics_router)
app.include_router(streaks_router)
app.include_router(badges_router)
app.include_router(challenges_router)
app.include_router(leaderboards_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Wellness Tracker Backend is running"}


@app.get("/health-check")
async def health_check() -> dict[str, str]:
    return {"message": "Health check successful"}


@app.get("/config-check")
async def config_check() -> dict[str, bool | str]:
    return {
        "success": True,
        "message": "Configuration loaded successfully",
        "supabase_url_configured": bool(settings.supabase_url),
        "anon_key_configured": bool(settings.supabase_anon_key),
        "service_role_key_configured": bool(settings.supabase_service_role_key),
    }


@app.get("/auth/me")
async def auth_me(current_user: dict = Depends(get_current_user)) -> dict[str, object]:
    return {
        "success": True,
        "message": "Authenticated user fetched successfully",
        "data": current_user,
    }


@app.post("/wellness/test-score")
async def wellness_test_score(payload: HealthSyncRequest) -> dict[str, object]:
    score = calculate_wellness_score(
        steps=payload.steps,
        sleep_minutes=payload.sleep_minutes,
        active_minutes=payload.active_minutes,
        resting_heart_rate=payload.resting_heart_rate,
        workout_count=payload.workout_count,
    )

    return {
        "success": True,
        "message": "Wellness score calculated successfully",
        "data": score,
    }