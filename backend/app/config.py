"""Application configuration helpers."""

from __future__ import annotations

import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
	"""Lightweight application settings loaded from environment variables."""

	def __init__(self) -> None:
		self.supabase_url = os.getenv("SUPABASE_URL")
		self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
		self.supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

		self._validate_required_values()

	def _validate_required_values(self) -> None:
		missing_values = [
			name
			for name, value in (
				("SUPABASE_URL", self.supabase_url),
				("SUPABASE_ANON_KEY", self.supabase_anon_key),
				("SUPABASE_SERVICE_ROLE_KEY", self.supabase_service_role_key),
			)
			if not value
		]

		if missing_values:
			missing = ", ".join(missing_values)
			raise RuntimeError(f"Missing required environment variables: {missing}")


settings = Settings()
