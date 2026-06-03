"""Pydantic models for batched health record ingestion."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator


def _to_utc(value: datetime) -> datetime:
	if value.tzinfo is None:
		return value.replace(tzinfo=timezone.utc)
	return value.astimezone(timezone.utc)


class RecordBase(BaseModel):
	source_device: str
	recorded_at: datetime

	@field_validator("recorded_at")
	@classmethod
	def recorded_at_must_not_be_future(cls, value: datetime) -> datetime:
		recorded = _to_utc(value)
		if recorded > datetime.now(timezone.utc):
			raise ValueError("recorded_at cannot be in the future")
		return value


class StepRecord(RecordBase):
	data_type: Literal["steps"] = "steps"
	steps: int = Field(ge=0)


class SleepRecord(RecordBase):
	data_type: Literal["sleep"] = "sleep"
	sleep_minutes: int = Field(ge=0)
	sleep_quality_score: float | None = Field(default=None, ge=0, le=100)


class HeartRateRecord(RecordBase):
	data_type: Literal["heart_rate"] = "heart_rate"
	heart_rate_bpm: int = Field(ge=20, le=250)
	is_resting: bool = False


class WorkoutRecord(RecordBase):
	data_type: Literal["workout"] = "workout"
	workout_type: str
	duration_minutes: int = Field(ge=0)
	calories_burned: float = Field(default=0, ge=0)


class NutritionRecord(RecordBase):
	data_type: Literal["nutrition"] = "nutrition"
	calories: float = Field(ge=0)
	protein_g: float | None = Field(default=None, ge=0)
	carbs_g: float | None = Field(default=None, ge=0)
	fat_g: float | None = Field(default=None, ge=0)


HealthRecordInput = Annotated[
	StepRecord | SleepRecord | HeartRateRecord | WorkoutRecord | NutritionRecord,
	Field(discriminator="data_type"),
]


class HealthRecordsSyncRequest(BaseModel):
	records: list[HealthRecordInput] = Field(min_length=1)
