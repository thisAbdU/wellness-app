from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.challenges.service import get_available_challenges, get_my_challenges, join_challenge


router = APIRouter(prefix="/challenges", tags=["Challenges"])


@router.get("")
async def list_challenges() -> dict[str, object]:
    challenges = get_available_challenges()
    return {
        "success": True,
        "message": "Challenges fetched successfully",
        "data": challenges,
    }


@router.post("/{challenge_id}/join")
async def join_my_challenge(challenge_id: str, current_user: dict = Depends(get_current_user)) -> dict[str, object]:
    challenge = join_challenge(current_user["id"], challenge_id)
    return {
        "success": True,
        "message": "Challenge joined successfully",
        "data": challenge,
    }


@router.get("/me")
async def my_challenges(current_user: dict = Depends(get_current_user)) -> dict[str, object]:
    challenges = get_my_challenges(current_user["id"])
    return {
        "success": True,
        "message": "User challenges fetched successfully",
        "data": challenges,
    }
