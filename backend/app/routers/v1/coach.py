"""API v1 AI health coach endpoints."""

from pydantic import BaseModel

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.dependencies import get_current_user
from app.services.gemini_service import HealthCoachClient
from app.services.insight_engine import generate_weekly_summary
from app.services.pattern_detector import get_user_patterns
from app.services.voice_service import process_voice_message

router = APIRouter(prefix="/coach", tags=["Coach v1"])


class InsightRequest(BaseModel):
	insight_type: str


@router.post("/insight")
async def coach_insight(
	payload: InsightRequest,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	client = HealthCoachClient()
	insight = client.get_insight(user_id=current_user["id"], insight_type=payload.insight_type)
	return {
		"success": True,
		"message": "Coach insight generated successfully",
		"data": {
			"insight_type": payload.insight_type,
			"insight": insight,
		},
	}


@router.get("/weekly-summary")
async def weekly_summary(
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	result = generate_weekly_summary(current_user["id"])
	return {
		"success": True,
		"message": "Weekly summary generated successfully",
		"data": result,
	}


@router.get("/patterns")
async def behavioral_patterns(
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	patterns = get_user_patterns(current_user["id"])
	return {
		"success": True,
		"message": "Behavioral patterns fetched successfully",
		"data": patterns,
	}


@router.post("/voice")
async def coach_voice(
	current_user: dict = Depends(get_current_user),
	audio: UploadFile = File(...),
	language: str | None = Form(default=None),
) -> dict[str, object]:
	result = process_voice_message(current_user["id"], audio, language)
	return {
		"success": True,
		"message": "Voice coach response generated",
		"data": result,
	}
