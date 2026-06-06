"""Typed application settings (pydantic-settings)."""

from __future__ import annotations
import os

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_supabase_url(url: str) -> str:
	"""Supabase Python client expects the project root URL, not /rest/v1."""
	normalized = url.strip().rstrip("/")
	if normalized.endswith("/rest/v1"):
		normalized = normalized[: -len("/rest/v1")]
	return normalized


class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8",
		extra="ignore",
	)

	supabase_url: str
	supabase_anon_key: str

	@field_validator("supabase_url", mode="before")
	@classmethod
	def normalize_supabase_url(cls, value: str) -> str:
		return _normalize_supabase_url(value)
	supabase_service_role_key: str = Field(validation_alias="SUPABASE_SERVICE_ROLE_KEY")
	gemini_api_key: str | None = None
	gemini_model: str = "gemini-2.0-flash"
	openai_api_key: str | None = None
	firebase_credentials_json: str | None = None
	google_tts_credentials_json: str | None = None
	africastalking_api_key: str | None = None
	africastalking_username: str | None = None
	africastalking_shortcode: str = "BIRTU"
	supabase_storage_bucket: str = "voice-responses"
	enable_scheduler: bool = True
	cors_origins: str = (
		"http://localhost:8081,http://localhost:19006,"
		"http://127.0.0.1:8081,http://127.0.0.1:19006"
	)
	groq_api_key: str | None = os.getenv("GROQ_API_KEY")
	groq_model: str = os.getenv(
		"GROQ_MODEL",
		"llama-3.3-70b-versatile",
	)

	@property
	def cors_origin_list(self) -> list[str]:
		return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
