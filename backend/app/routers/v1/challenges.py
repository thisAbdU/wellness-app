"""API v1 personal challenge tracking."""

from pydantic import BaseModel

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.services.challenge_engine import (
	get_active_challenges,
	get_challenge_progress,
	start_challenge,
)

router = APIRouter(prefix="/challenges", tags=["Challenges v1"])


class StartChallengeRequest(BaseModel):
	template_id: str


@router.get("/active")
async def active_challenges(
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	challenges = get_active_challenges(current_user["id"])
	return {
		"success": True,
		"message": "Active challenges fetched successfully",
		"data": challenges,
	}


@router.post("/start")
async def start_challenge_route(
	payload: StartChallengeRequest,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	challenge = start_challenge(current_user["id"], payload.template_id)
	return {
		"success": True,
		"message": "Challenge started successfully",
		"data": challenge,
	}


@router.get("/{challenge_id}/progress")
async def challenge_progress(
	challenge_id: str,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	progress = get_challenge_progress(current_user["id"], challenge_id)
	return {
		"success": True,
		"message": "Challenge progress fetched successfully",
		"data": progress,
	}
