from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field, model_validator


class HealthSyncRequest(BaseModel):
	summary_date: date
	steps: int = Field(default=0, ge=0)
	calories_burned: float = Field(default=0, ge=0)
	active_minutes: int = Field(default=0, ge=0)
	sleep_minutes: int = Field(default=0, ge=0)
	sleep_quality_score: float = Field(default=0, ge=0, le=100)
	resting_heart_rate: int | None = Field(default=None, ge=20, le=220)
	workout_count: int = Field(default=0, ge=0)
	data_source: str = "health_connect"


class HealthSyncResponse(BaseModel):
	success: bool
	message: str
	data: dict
