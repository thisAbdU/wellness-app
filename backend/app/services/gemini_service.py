"""Gemini API wrapper for health coach insights."""

from __future__ import annotations

import enum
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import google.generativeai as genai
from fastapi import HTTPException, status
from google.api_core import exceptions as google_exceptions
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.db.supabase_client import get_supabase_admin_client
from app.settings import settings

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
CACHE_TTL_HOURS = 6
MAX_CONTEXT_TOKENS = 2000
MODEL_NAME = "gemini-1.5-flash"


class InsightType(str, enum.Enum):
	WEEKLY_SUMMARY = "WEEKLY_SUMMARY"
	BURNOUT_WARNING = "BURNOUT_WARNING"
	BEHAVIORAL_PATTERN = "BEHAVIORAL_PATTERN"
	RECOVERY_ADVICE = "RECOVERY_ADVICE"
	DAILY_NUDGE = "DAILY_NUDGE"
	NUTRITION_PLAN = "NUTRITION_PLAN"


INSIGHT_PROMPT_FILES = {
	InsightType.WEEKLY_SUMMARY: "weekly_summary.txt",
	InsightType.BURNOUT_WARNING: "burnout_warning.txt",
	InsightType.BEHAVIORAL_PATTERN: "behavioral_pattern.txt",
	InsightType.RECOVERY_ADVICE: "recovery_advice.txt",
	InsightType.DAILY_NUDGE: "daily_nudge.txt",
	InsightType.NUTRITION_PLAN: "nutrition_daily.txt",
}


def _load_prompt(filename: str) -> str:
	return (PROMPTS_DIR / filename).read_text(encoding="utf-8").strip()


def _extract_records(response: object) -> list[dict]:
	data = getattr(response, "data", None)
	if isinstance(data, list):
		return data
	if isinstance(data, dict):
		return [data]
	return []


def _first_record(response: object) -> dict | None:
	records = _extract_records(response)
	return records[0] if records else None


class HealthCoachClient:
	def __init__(self) -> None:
		if not settings.gemini_api_key:
			raise HTTPException(
				status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
				detail="Gemini API is not configured",
			)
		genai.configure(api_key=settings.gemini_api_key)
		self._system_prompt = _load_prompt("system_base.txt")

	def get_insight(self, user_id: str, insight_type: str) -> str:
		try:
			parsed_type = InsightType(insight_type)
		except ValueError as exc:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail=f"Invalid insight_type: {insight_type}",
			) from exc

		cached = self._get_cached_insight(user_id, parsed_type)
		if cached:
			return cached

		context_block = self._build_context_block(user_id)
		return self.generate_with_context(
			user_id=user_id,
			insight_type=parsed_type,
			context_block=context_block,
			use_cache=True,
		)

	def generate_with_context(
		self,
		user_id: str,
		insight_type: InsightType | str,
		context_block: dict[str, Any] | str,
		*,
		use_cache: bool = True,
		timeout_seconds: float | None = None,
	) -> str:
		if isinstance(insight_type, str):
			parsed_type = InsightType(insight_type)
		else:
			parsed_type = insight_type

		if use_cache:
			cached = self._get_cached_insight(user_id, parsed_type)
			if cached:
				return cached

		if isinstance(context_block, dict):
			context_text = json.dumps(context_block, ensure_ascii=False)
		else:
			context_text = context_block

		insight = self._generate_insight(
			parsed_type,
			context_text,
			timeout_seconds=timeout_seconds,
		)
		if use_cache:
			self._cache_insight(user_id, parsed_type, insight)
		return insight

	def _get_cached_insight(self, user_id: str, insight_type: InsightType) -> str | None:
		client = get_supabase_admin_client()
		now = datetime.now(timezone.utc).isoformat()
		try:
			response = (
				client.table("ai_insights")
				.select("content, expires_at")
				.eq("user_id", user_id)
				.eq("insight_type", insight_type.value)
				.gt("expires_at", now)
				.limit(1)
				.execute()
			)
			row = _first_record(response)
			return row.get("content") if row else None
		except Exception:
			return None

	def _cache_insight(self, user_id: str, insight_type: InsightType, content: str) -> None:
		client = get_supabase_admin_client()
		now = datetime.now(timezone.utc)
		expires_at = now + timedelta(hours=CACHE_TTL_HOURS)
		try:
			client.table("ai_insights").upsert(
				{
					"user_id": user_id,
					"insight_type": insight_type.value,
					"content": content,
					"created_at": now.isoformat(),
					"expires_at": expires_at.isoformat(),
				},
				on_conflict="user_id,insight_type",
			).execute()
		except Exception:
			pass

	def _build_context_block(self, user_id: str) -> str:
		client = get_supabase_admin_client()
		end_date = datetime.now(timezone.utc).date()
		start_date = end_date - timedelta(days=7)

		summaries_response = (
			client.table("health_daily_summaries")
			.select("*")
			.eq("user_id", user_id)
			.gte("summary_date", start_date.isoformat())
			.lte("summary_date", end_date.isoformat())
			.order("summary_date")
			.execute()
		)
		summaries = _extract_records(summaries_response)

		profile_response = (
			client.table("profiles").select("*").eq("user_id", user_id).limit(1).execute()
		)
		profile = _first_record(profile_response) or {}

		streaks_response = (
			client.table("streaks").select("*").eq("user_id", user_id).execute()
		)
		streaks = _extract_records(streaks_response)

		context = {
			"profile": profile,
			"last_7_days_summaries": summaries,
			"streaks": streaks,
		}
		return self._truncate_context(str(context))

	def _truncate_context(self, content: str) -> str:
		model = genai.GenerativeModel(model_name=MODEL_NAME)
		token_count = model.count_tokens(content).total_tokens
		if token_count <= MAX_CONTEXT_TOKENS:
			return content

		trimmed = content
		while len(trimmed) > 200 and model.count_tokens(trimmed).total_tokens > MAX_CONTEXT_TOKENS:
			trimmed = trimmed[: int(len(trimmed) * 0.85)]
		return trimmed + "\n...[truncated]"

	def _generate_insight(
		self,
		insight_type: InsightType,
		context_block: str,
		timeout_seconds: float | None = None,
	) -> str:
		type_prompt = _load_prompt(INSIGHT_PROMPT_FILES[insight_type])
		user_message = f"{type_prompt}\n\nUser health context:\n{context_block}"
		return self._call_gemini(user_message, timeout_seconds=timeout_seconds)

	@retry(
		retry=retry_if_exception_type(google_exceptions.ResourceExhausted),
		wait=wait_exponential(multiplier=1, min=2, max=30),
		stop=stop_after_attempt(4),
		reraise=True,
	)
	def _call_gemini(self, user_message: str, timeout_seconds: float | None = None) -> str:
		model = genai.GenerativeModel(
			model_name=MODEL_NAME,
			system_instruction=self._system_prompt,
		)
		try:
			kwargs: dict[str, Any] = {}
			if timeout_seconds is not None:
				kwargs["request_options"] = {"timeout": timeout_seconds}
			response = model.generate_content(user_message, **kwargs)
			text = getattr(response, "text", None)
			if not text:
				raise HTTPException(
					status_code=status.HTTP_502_BAD_GATEWAY,
					detail="Empty response from Gemini",
				)
			return text.strip()
		except google_exceptions.ResourceExhausted as exc:
			raise HTTPException(
				status_code=status.HTTP_429_TOO_MANY_REQUESTS,
				detail="Gemini rate limit exceeded",
			) from exc
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Gemini request failed: {exc}",
			) from exc
