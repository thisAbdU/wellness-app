"""API v1 router aggregation."""

from fastapi import APIRouter

from app.routers.v1 import challenges, coach, emergency, health, nutrition, sync

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(health.router)
api_v1_router.include_router(sync.router)
api_v1_router.include_router(coach.router)
api_v1_router.include_router(nutrition.router)
api_v1_router.include_router(challenges.router)
api_v1_router.include_router(emergency.router)
