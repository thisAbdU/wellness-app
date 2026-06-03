"""Typed application settings (pydantic-settings)."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8",
		extra="ignore",
	)

	supabase_url: str
	supabase_anon_key: str
	supabase_service_role_key: str = Field(validation_alias="SUPABASE_SERVICE_ROLE_KEY")
	gemini_api_key: str | None = None
	openai_api_key: str | None = None
	firebase_credentials_json: str | None = None
	google_tts_credentials_json: str | None = None
	africastalking_api_key: str | None = None
	africastalking_username: str | None = None
	africastalking_shortcode: str = "WELLNESS"
	supabase_storage_bucket: str = "voice-responses"
	enable_scheduler: bool = True
	cors_origins: str = (
		"http://localhost:8081,http://localhost:19006,"
		"http://127.0.0.1:8081,http://127.0.0.1:19006"
	)

	@property
	def cors_origin_list(self) -> list[str]:
		return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
