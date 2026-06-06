"""Voice coach: Whisper → Gemini → Google TTS."""

from __future__ import annotations

import logging
import tempfile
import uuid
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile, status

from app.db.supabase_client import get_supabase_admin_client
from app.services.gemini_service import HealthCoachClient, InsightType
from app.services.insight_engine import compute_trend_context
from app.settings import settings

logger = logging.getLogger(__name__)
VOICE_GEMINI_TIMEOUT = 10.0
MAX_AUDIO_SECONDS = 120


def _transcribe(audio_path: Path, language: str | None) -> str:
	if not settings.openai_api_key:
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="OpenAI API key not configured for Whisper",
		)
	from openai import OpenAI

	client = OpenAI(api_key=settings.openai_api_key)
	with audio_path.open("rb") as audio_file:
		kwargs: dict[str, Any] = {"model": "whisper-1", "file": audio_file}
		if language in ("am", "en"):
			kwargs["language"] = language
		result = client.audio.transcriptions.create(**kwargs)
	return result.text.strip()


def _synthesize_tts(text: str, language: str) -> bytes | None:
	if not settings.google_tts_credentials_json:
		return None
	try:
		from google.cloud import texttospeech
		import json

		client = texttospeech.TextToSpeechClient.from_service_account_info(
			json.loads(settings.google_tts_credentials_json)
		)
		if language.startswith("am"):
			voice = texttospeech.VoiceSelectionParams(
				language_code="am-ET",
				name="am-ET-Standard-A",
			)
		else:
			voice = texttospeech.VoiceSelectionParams(
				language_code="en-US",
				name="en-US-Neural2-F",
			)
		synthesis_input = texttospeech.SynthesisInput(text=text)
		audio_config = texttospeech.AudioConfig(
			audio_encoding=texttospeech.AudioEncoding.MP3
		)
		response = client.synthesize_speech(
			input=synthesis_input, voice=voice, audio_config=audio_config
		)
		return response.audio_content
	except Exception as exc:
		logger.warning("TTS failed: %s", exc)
		return None


def _upload_audio_mp3(user_id: str, audio_bytes: bytes) -> str | None:
	try:
		client = get_supabase_admin_client()
		path = f"{user_id}/{uuid.uuid4().hex}.mp3"
		bucket = settings.supabase_storage_bucket
		client.storage.from_(bucket).upload(
			path,
			audio_bytes,
			file_options={"content-type": "audio/mpeg"},
		)
		signed = client.storage.from_(bucket).create_signed_url(path, 3600)
		if isinstance(signed, dict):
			return signed.get("signedURL") or signed.get("signed_url")
		return str(signed)
	except Exception as exc:
		logger.warning("Storage upload failed: %s", exc)
		return None


def process_voice_message(
	user_id: str,
	audio: UploadFile,
	language: str | None = None,
) -> dict[str, Any]:
	suffix = Path(audio.filename or "audio.m4a").suffix or ".m4a"
	with tempfile.NamedTemporaryFile(delete=True, suffix=suffix) as tmp:
		content = audio.file.read()
		if len(content) > 5_000_000:
			raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Audio too large")
		tmp.write(content)
		tmp.flush()
		transcript = _transcribe(Path(tmp.name), language)

	detected_lang = language or ("am" if any("\u1200" <= c <= "\u137f" for c in transcript) else "en")
	context = compute_trend_context(user_id)
	context["voice"] = {"transcript": transcript, "language": detected_lang}

	coach = HealthCoachClient()
	fallback = False
	try:
		response_text = coach.generate_with_context(
			user_id=user_id,
			insight_type=InsightType.DAILY_NUDGE,
			context_block=context,
			use_cache=False,
			timeout_seconds=VOICE_GEMINI_TIMEOUT,
		)
	except HTTPException as exc:
		if exc.status_code not in (status.HTTP_504_GATEWAY_TIMEOUT, status.HTTP_502_BAD_GATEWAY):
			raise
		fallback = True
		response_text = (
			"እባክዎ ትንሽ ይጠብቁ  አጭር ጤና ምክር፡ ቀን በቀን እንቅልፍ እና እርምጃዎን ይከታተሉ።"
			if detected_lang == "am"
			else "Please keep tracking sleep and steps  I'll share a fuller tip when the coach is ready."
		)

	audio_url = None
	if not fallback:
		mp3 = _synthesize_tts(response_text, detected_lang)
		if mp3:
			audio_url = _upload_audio_mp3(user_id, mp3)

	return {
		"transcript": transcript,
		"response_text": response_text,
		"audio_url": audio_url,
		"language": detected_lang,
		"tts_available": audio_url is not None,
	}
