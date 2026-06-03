"""Offline sync: delta push/pull with conflict resolution."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.db.supabase_client import get_supabase_admin_client
from app.schemas.sync import SyncPushRequest, SyncPushResult, SyncRecord
from app.services.health_ingestion_service import recompute_daily_summaries


CUMULATIVE_TYPES = frozenset({"steps", "nutrition"})
STATE_TYPES = frozenset({"sleep", "heart_rate", "workout", "weight"})
CONFLICT_WINDOW_SECONDS = 60


def _utc_now() -> datetime:
	return datetime.now(timezone.utc)


def _to_utc(value: datetime) -> datetime:
	if value.tzinfo is None:
		return value.replace(tzinfo=timezone.utc)
	return value.astimezone(timezone.utc)


def _parse_ts(value: str | datetime | None) -> datetime | None:
	if value is None:
		return None
	if isinstance(value, datetime):
		return _to_utc(value)
	return _to_utc(datetime.fromisoformat(str(value).replace("Z", "+00:00")))


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


def _seconds_apart(a: datetime, b: datetime) -> float:
	return abs((a - b).total_seconds())


def _merge_payload(
	data_type: str,
	server_payload: dict[str, Any],
	client_payload: dict[str, Any],
) -> dict[str, Any]:
	if data_type in CUMULATIVE_TYPES:
		merged = dict(server_payload)
		for key, client_value in client_payload.items():
			if isinstance(client_value, (int, float)):
				server_value = merged.get(key)
				if isinstance(server_value, (int, float)):
					merged[key] = max(server_value, client_value)
				else:
					merged[key] = client_value
			else:
				merged[key] = client_value
		return merged
	return client_payload


def _should_apply_client(
	data_type: str,
	server_updated_at: datetime,
	client_updated_at: datetime,
	server_payload: dict[str, Any],
	client_payload: dict[str, Any],
) -> bool:
	if _seconds_apart(server_updated_at, client_updated_at) <= CONFLICT_WINDOW_SECONDS:
		return False
	if client_updated_at > server_updated_at:
		return True
	if data_type in CUMULATIVE_TYPES:
		for key, client_value in client_payload.items():
			if isinstance(client_value, (int, float)):
				server_value = server_payload.get(key)
				if isinstance(server_value, (int, float)) and client_value > server_value:
					return True
	return False


def push_sync_records(user_id: str, request: SyncPushRequest) -> SyncPushResult:
	client = get_supabase_admin_client()
	result = SyncPushResult()
	affected_dates: set = set()

	for record in request.records:
		outcome = _process_push_record(client, user_id, record)
		if outcome == "inserted":
			result.inserted += 1
		elif outcome == "updated":
			result.updated += 1
		else:
			result.skipped += 1

		recorded = _to_utc(record.recorded_at)
		affected_dates.add(recorded.date())

	if affected_dates:
		recompute_daily_summaries(user_id, affected_dates)

	try:
		client.table("sync_log").insert(
			{
				"user_id": user_id,
				"device_id": request.device_id,
				"pushed_count": result.inserted + result.updated,
				"pulled_count": 0,
				"synced_at": _utc_now().isoformat(),
			}
		).execute()
	except Exception:
		pass

	return result


def _find_server_row(client: object, user_id: str, record: SyncRecord) -> dict | None:
	by_local = (
		client.table("health_records")
		.select("*")
		.eq("user_id", user_id)
		.eq("local_id", record.local_id)
		.limit(1)
		.execute()
	)
	server_row = _first_record(by_local)
	if server_row is not None:
		return server_row

	recorded_at = _to_utc(record.recorded_at)
	by_key = (
		client.table("health_records")
		.select("*")
		.eq("user_id", user_id)
		.eq("recorded_at", recorded_at.isoformat())
		.eq("data_type", record.data_type)
		.limit(1)
		.execute()
	)
	return _first_record(by_key)


def _process_push_record(client: object, user_id: str, record: SyncRecord) -> str:
	server_row = _find_server_row(client, user_id, record)

	recorded_at = _to_utc(record.recorded_at)
	client_updated_at = _to_utc(record.client_updated_at or record.recorded_at)
	row_base = {
		"user_id": user_id,
		"local_id": record.local_id,
		"data_type": record.data_type,
		"source_device": record.source_device,
		"recorded_at": recorded_at.isoformat(),
		"payload": record.payload,
		"client_updated_at": client_updated_at.isoformat(),
		"server_updated_at": _utc_now().isoformat(),
	}

	if server_row is None:
		try:
			client.table("health_records").insert(row_base).execute()
			return "inserted"
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Failed to insert sync record: {exc}",
			) from exc

	server_updated_at = _parse_ts(server_row.get("server_updated_at")) or _utc_now()
	if not _should_apply_client(
		record.data_type,
		server_updated_at,
		client_updated_at,
		server_row.get("payload") or {},
		record.payload,
	):
		return "skipped"

	merged_payload = _merge_payload(
		record.data_type,
		server_row.get("payload") or {},
		record.payload,
	)
	row_base["payload"] = merged_payload
	try:
		client.table("health_records").update(row_base).eq("id", server_row["id"]).execute()
		return "updated"
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to update sync record: {exc}",
		) from exc


def pull_sync_records(user_id: str, since: datetime | None, device_id: str | None = None) -> dict[str, Any]:
	client = get_supabase_admin_client()
	server_time = _utc_now()

	query = client.table("health_records").select("*").eq("user_id", user_id)
	if since is not None:
		query = query.gt("server_updated_at", _to_utc(since).isoformat())

	try:
		response = query.order("server_updated_at").execute()
		records = _extract_records(response)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to pull sync records: {exc}",
		) from exc

	try:
		client.table("sync_log").insert(
			{
				"user_id": user_id,
				"device_id": device_id,
				"pushed_count": 0,
				"pulled_count": len(records),
				"synced_at": server_time.isoformat(),
			}
		).execute()
	except Exception:
		pass

	return {"records": records, "server_time": server_time}
