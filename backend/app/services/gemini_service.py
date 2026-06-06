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
from groq import Groq

from app.db.supabase_client import get_supabase_admin_client
from app.settings import settings

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
CACHE_TTL_HOURS = 6
MAX_CONTEXT_TOKENS = 1000
# Rough chars-per-token estimate for local truncation (avoids count_tokens API).
_CHARS_PER_TOKEN = 4


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

_FALLBACK_INSIGHTS = {
	InsightType.DAILY_NUDGE: (
		"Start with a short walk today  even 10 minutes of movement helps your wellness score. "
		"Stay hydrated and aim for a consistent sleep schedule tonight."
	),
	InsightType.WEEKLY_SUMMARY: "Your week is off to a steady start. Keep logging activity and sleep to unlock personalized trends.",
	InsightType.BURNOUT_WARNING: "Take a rest day if you feel run down. Recovery is part of progress.",
	InsightType.BEHAVIORAL_PATTERN: "We are learning your rhythms. Sync health data for sharper pattern detection.",
	InsightType.RECOVERY_ADVICE: "Prioritize 7+ hours of sleep and light stretching after workouts.",
}


def _fallback_nutrition_plan(context: dict[str, Any]) -> str:
	targets = context.get("targets") or {}
	by_meal = context.get("eligible_foods") or {}
	lines = [
		f"Daily target: {targets.get('calories_min', 1800)}–{targets.get('calories_max', 2200)} kcal "
		f"(TDEE ~{targets.get('tdee', 2000)}).",
		"",
	]
	for meal in ("breakfast", "lunch", "dinner", "snack"):
		options = by_meal.get(meal) or []
		if not options:
			continue
		names = [str(item.get("name_am") or item.get("name") or "meal") for item in options[:3]]
		lines.append(f"{meal.title()}: {', '.join(names)}")
	if len(lines) <= 2:
		lines.append("Add Ethiopian foods via migrations, then refresh for meal suggestions.")
	return "\n".join(lines)


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
		self._api_configured = bool(settings.gemini_api_key)
		self._model_name = settings.gemini_model
		if self._api_configured:
			genai.configure(api_key=settings.gemini_api_key)
		self._system_prompt = _load_prompt("system_base.txt")

	def _fallback_for_type(self, insight_type: InsightType) -> str:
		return _FALLBACK_INSIGHTS.get(
			insight_type,
			"Personalized coaching will appear once Gemini is configured.",
		)

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

		if not self._api_configured:
			return self._fallback_for_type(parsed_type)

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

		if not self._api_configured:
			if isinstance(context_block, dict) and parsed_type == InsightType.NUTRITION_PLAN:
				return _fallback_nutrition_plan(context_block)
			return self._fallback_for_type(parsed_type)

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
		max_chars = MAX_CONTEXT_TOKENS * _CHARS_PER_TOKEN
		if len(content) <= max_chars:
			return content
		return content[:max_chars] + "\n...[truncated]"

	def _generate_insight(
		self,
		insight_type: InsightType,
		context_block: str,
		timeout_seconds: float | None = None,
	) -> str:
		type_prompt = _load_prompt(INSIGHT_PROMPT_FILES[insight_type])
		user_message = f"{type_prompt}\n\nUser health context:\n{context_block}"
		return self._call_groq(user_message, timeout_seconds=timeout_seconds)

	@retry(
		retry=retry_if_exception_type(google_exceptions.ResourceExhausted),
		wait=wait_exponential(multiplier=1, min=2, max=30),
		stop=stop_after_attempt(4),
		reraise=True,
	)

	def _call_gemini(
		self,
		user_message: str,
		timeout_seconds: float | None = None,
	) -> str:
		print(
			"CALL_GEMINI start:",
			"model=",
			self._model_name,
			"timeout=",
			timeout_seconds,
		)
		print(
			"SYSTEM_PROMPT (truncated 500):",
			(self._system_prompt or "")[:500],
		)
		print(
			"USER_MESSAGE (truncated 1000):",
			(user_message or "")[:1000],
		)

		model = genai.GenerativeModel(
			model_name=self._model_name,
			system_instruction=self._system_prompt,
		)

		try:
			kwargs: dict[str, Any] = {}

			if timeout_seconds is not None:
				kwargs["request_options"] = {"timeout": timeout_seconds}

			print("generate_content kwargs:", kwargs)

			response = model.generate_content(user_message, **kwargs)

			print("Raw response type:", type(response))

			try:
				r = repr(response)
				print("response repr (truncated 1000):", r[:1000])
			except Exception as e:
				print("Failed to repr(response):", e)

			text = getattr(response, "text", None)

			try:
				candidates = getattr(response, "candidates", None)
				print("response.candidates present?", bool(candidates))
			except Exception as e:
				print("Failed to read response.candidates:", e)

			if not text:
				print("Empty response.text from Gemini — introspecting response attributes")

				try:
					attrs = [a for a in dir(response) if not a.startswith("_")]
					print("response attrs keys (first 50):", attrs[:50])
				except Exception as e:
					print("Failed to introspect response:", e)

				raise HTTPException(
					status_code=status.HTTP_502_BAD_GATEWAY,
					detail="Empty response from Gemini",
				)

			print("Gemini returned text length=", len(text))
			print("Gemini text (truncated 1000):", text[:1000])

			return text.strip()

		except google_exceptions.ResourceExhausted as exc:
			print("Gemini ResourceExhausted (rate limit):", exc)

			import traceback
			traceback.print_exc()

			raise HTTPException(
				status_code=status.HTTP_429_TOO_MANY_REQUESTS,
				detail="Gemini rate limit exceeded",
			) from exc

		except HTTPException:
			print("Reraising HTTPException")
			raise

		except Exception as exc:
			print("Gemini request failed:", exc)

			import traceback
			traceback.print_exc()

			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Gemini request failed: {exc}",
			) from exc
	
	def _call_groq(
		self,
		user_message: str,
		timeout_seconds: float | None = None,
	) -> str:
		try:
			client = Groq(
				api_key=settings.groq_api_key,
			)

			response = client.chat.completions.create(
				model=settings.groq_model,
				messages=[
					{
						"role": "system",
						"content": self._system_prompt,
					},
					{
						"role": "user",
						"content": user_message,
					},
				],
				temperature=0.7,
				max_tokens=800,
			)

			text = response.choices[0].message.content

			if not text:
				raise HTTPException(
					status_code=status.HTTP_502_BAD_GATEWAY,
					detail="Empty response from Groq",
				)

			return text.strip()

		except HTTPException:
			raise

		except Exception as exc:
			import traceback

			print("Groq request failed:", exc)
			traceback.print_exc()

			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Groq request failed: {exc}",
			) from exc