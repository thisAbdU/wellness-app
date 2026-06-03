"""Schemas for offline bidirectional sync."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SyncRecord(BaseModel):
	local_id: str
	data_type: str
	source_device: str | None = None
	recorded_at: datetime
	payload: dict[str, Any] = Field(default_factory=dict)
	client_updated_at: datetime | None = None


class SyncPushRequest(BaseModel):
	records: list[SyncRecord] = Field(default_factory=list)
	client_last_sync: datetime | None = None
	device_id: str | None = None


class SyncPushResult(BaseModel):
	inserted: int = 0
	updated: int = 0
	skipped: int = 0


class SyncPullResponse(BaseModel):
	records: list[dict[str, Any]]
	server_time: datetime
