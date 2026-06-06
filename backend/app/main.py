from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.analytics.router import router as analytics_router
from app.badges.router import router as badges_router
from app.challenges.router import router as challenges_router
from app.leaderboards.router import router as leaderboards_router
from app.dependencies import get_current_user
from app.health.router import router as health_router
from app.health.schemas import HealthSyncRequest
from app.middleware.auth import JWTAuthMiddleware
from app.middleware.cors import configure_cors
from app.routers.health import router as uptime_router
from app.routers.v1 import api_v1_router
from app.settings import settings
from app.streaks.router import router as streaks_router
from app.rate_limit import limiter
from app.services.scheduler import start_scheduler, stop_scheduler
from app.wellness.service import calculate_wellness_score


@asynccontextmanager
async def lifespan(app: FastAPI):
	start_scheduler()
	yield
	stop_scheduler()


app = FastAPI(title="BIRTU Backend", version="1.2.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

configure_cors(app)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(JWTAuthMiddleware)

app.include_router(uptime_router)
app.include_router(api_v1_router)

# Legacy routes (data & gamification  unchanged for mobile integration)
app.include_router(health_router)
app.include_router(analytics_router)
app.include_router(streaks_router)
app.include_router(badges_router)
app.include_router(challenges_router)
app.include_router(leaderboards_router)


@app.get("/")
async def root() -> dict[str, str]:
	return {"message": "BIRTU Backend is running"}


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
		"gemini_configured": bool(settings.gemini_api_key),
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
		"message": "BIRTU score calculated successfully",
		"data": score,
	}
