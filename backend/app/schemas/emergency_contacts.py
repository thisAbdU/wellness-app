"""Schemas for emergency contact management."""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class EmergencyContactWrite(BaseModel):
	name: str = Field(min_length=1, max_length=120)
	phone_number: str = Field(min_length=7, max_length=40)
	relationship: str = Field(default="Family", max_length=80)
	is_primary: bool = False

	@field_validator("name", "phone_number", "relationship")
	@classmethod
	def strip_required_text(cls, value: str) -> str:
		cleaned = value.strip()
		if not cleaned:
			raise ValueError("Field cannot be empty")
		return cleaned


class EmergencyContactResponse(EmergencyContactWrite):
	id: str
	user_id: str
	created_at: str | None = None
	updated_at: str | None = None
