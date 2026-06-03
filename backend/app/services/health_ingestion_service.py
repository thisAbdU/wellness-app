"""Validate, store, and aggregate granular health records."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from app.db.supabase_client import get_supabase_admin_client
from app.schemas.health_records import HealthRecordInput


def _utc_now() -> datetime:
	return datetime.now(timezone.utc)


def _to_utc(value: datetime) -> datetime:
	if value.tzinfo is None:
		return value.replace(tzinfo=timezone.utc)
	return value.astimezone(timezone.utc)


def _record_payload(record: HealthRecordInput) -> dict[str, Any]:
	data = record.model_dump(exclude={"data_type", "source_device", "recorded_at"})
	return data


def _row_from_record(user_id: str, record: HealthRecordInput) -> dict[str, Any]:
	recorded_at = _to_utc(record.recorded_at)
	return {
		"user_id": user_id,
		"data_type": record.data_type,
		"source_device": record.source_device,
		"recorded_at": recorded_at.isoformat(),
		"payload": _record_payload(record),
		"server_updated_at": _utc_now().isoformat(),
	}


def _extract_records(response: object) -> list[dict]:
	data = getattr(response, "data", None)
	if isinstance(data, list):
		return data
	if isinstance(data, dict):
		return [data]
	return []


def sync_health_records(user_id: str, records: list[HealthRecordInput]) -> dict[str, Any]:
	client = get_supabase_admin_client()
	rows = [_row_from_record(user_id, record) for record in records]
	affected_dates: set[date] = set()

	try:
		response = (
			client.table("health_records")
			.upsert(rows, on_conflict="user_id,recorded_at,data_type")
			.select("recorded_at")
			.execute()
		)
		for row in _extract_records(response):
			recorded_at = row.get("recorded_at")
			if recorded_at:
				parsed = datetime.fromisoformat(str(recorded_at).replace("Z", "+00:00"))
				affected_dates.add(parsed.date())
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to store health records: {exc}",
		) from exc

	summaries = recompute_daily_summaries(user_id, affected_dates)
	return {
		"stored_count": len(rows),
		"affected_dates": sorted(d.isoformat() for d in affected_dates),
		"daily_summaries": summaries,
	}


def recompute_daily_summaries(user_id: str, dates: set[date]) -> list[dict]:
	if not dates:
		return []

	client = get_supabase_admin_client()
	summaries: list[dict] = []

	for summary_date in sorted(dates):
		start = datetime.combine(summary_date, datetime.min.time(), tzinfo=timezone.utc)
		end = datetime.combine(summary_date, datetime.max.time(), tzinfo=timezone.utc)

		response = (
			client.table("health_records")
			.select("*")
			.eq("user_id", user_id)
			.gte("recorded_at", start.isoformat())
			.lte("recorded_at", end.isoformat())
			.execute()
		)
		records = _extract_records(response)
		aggregated = _aggregate_day_records(records)
		if not aggregated:
			continue

		summary_row = {
			"user_id": user_id,
			"summary_date": summary_date.isoformat(),
			**aggregated,
			"synced_at": _utc_now().isoformat(),
		}
		try:
			upsert_response = (
				client.table("health_daily_summaries")
				.upsert(summary_row, on_conflict="user_id,summary_date")
				.select("*")
				.execute()
			)
			saved = _extract_records(upsert_response)
			if saved:
				summaries.append(saved[0])
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Failed to update daily summary for {summary_date}: {exc}",
			) from exc

	return summaries


def _aggregate_day_records(records: list[dict]) -> dict[str, Any]:
	steps_total = 0
	sleep_minutes = 0
	sleep_quality_scores: list[float] = []
	heart_rates: list[int] = []
	calories_burned = 0.0
	active_minutes = 0
	workout_count = 0
	data_sources: set[str] = set()

	for record in records:
		data_type = record.get("data_type")
		payload = record.get("payload") or {}
		source = record.get("source_device")
		if source:
			data_sources.add(source)

		if data_type == "steps":
			steps_total += int(payload.get("steps", 0))
		elif data_type == "sleep":
			sleep_minutes += int(payload.get("sleep_minutes", 0))
			quality = payload.get("sleep_quality_score")
			if quality is not None:
				sleep_quality_scores.append(float(quality))
		elif data_type == "heart_rate":
			if payload.get("is_resting"):
				heart_rates.append(int(payload.get("heart_rate_bpm", 0)))
		elif data_type == "workout":
			workout_count += 1
			calories_burned += float(payload.get("calories_burned", 0))
			active_minutes += int(payload.get("duration_minutes", 0))
		elif data_type == "nutrition":
			calories_burned += float(payload.get("calories", 0))

	avg_sleep_quality = (
		sum(sleep_quality_scores) / len(sleep_quality_scores) if sleep_quality_scores else 0.0
	)
	avg_hr = int(sum(heart_rates) / len(heart_rates)) if heart_rates else None

	return {
		"steps": steps_total,
		"sleep_minutes": sleep_minutes,
		"sleep_quality_score": round(avg_sleep_quality, 2),
		"resting_heart_rate": avg_hr,
		"calories_burned": round(calories_burned, 2),
		"active_minutes": active_minutes,
		"workout_count": workout_count,
		"data_source": ",".join(sorted(data_sources)) if data_sources else "health_records",
	}


def get_health_summaries(user_id: str, from_date: str, to_date: str) -> list[dict]:
	client = get_supabase_admin_client()
	try:
		response = (
			client.table("health_daily_summaries")
			.select("*")
			.eq("user_id", user_id)
			.gte("summary_date", from_date)
			.lte("summary_date", to_date)
			.order("summary_date")
			.execute()
		)
		return _extract_records(response)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch health summaries: {exc}",
		) from exc
