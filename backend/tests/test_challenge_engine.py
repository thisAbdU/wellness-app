from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any

import pytest
from fastapi import HTTPException

from app.routers.v1.challenges import StartChallengeRequest, start_challenge_route
from app.services import challenge_engine


@dataclass
class FakeResponse:
	data: list[dict]


class FakeWriteBuilder:
	"""Write builder intentionally has no select method."""

	def __init__(self, client: "FakeSupabase", table: str, payload: dict):
		self.client = client
		self.table = table
		self.payload = payload

	def execute(self) -> FakeResponse:
		if self.client.write_error:
			raise RuntimeError(self.client.write_error)
		self.client.write_count += 1
		rows = self.client.tables.setdefault(self.table, [])
		for index, row in enumerate(rows):
			if (
				row.get("user_id") == self.payload.get("user_id")
				and row.get("template_id") == self.payload.get("template_id")
			):
				rows[index] = {**row, **self.payload}
				return FakeResponse([])
		rows.append({"id": f"saved-{self.client.write_count}", **self.payload})
		return FakeResponse([])


class FakeReadBuilder:
	def __init__(self, client: "FakeSupabase", table: str):
		self.client = client
		self.table = table
		self.filters: list[tuple[str, Any]] = []

	def select(self, _columns: str) -> "FakeReadBuilder":
		return self

	def eq(self, column: str, value: Any) -> "FakeReadBuilder":
		self.filters.append((column, value))
		return self

	def limit(self, _count: int) -> "FakeReadBuilder":
		return self

	def execute(self) -> FakeResponse:
		rows = self.client.tables.get(self.table, [])
		return FakeResponse(
			[
				row
				for row in rows
				if all(row.get(column) == value for column, value in self.filters)
			]
		)


class FakeTable:
	def __init__(self, client: "FakeSupabase", table: str):
		self.client = client
		self.table = table

	def select(self, columns: str) -> FakeReadBuilder:
		return FakeReadBuilder(self.client, self.table).select(columns)

	def upsert(self, payload: dict, on_conflict: str) -> FakeWriteBuilder:
		assert on_conflict == "user_id,template_id"
		return FakeWriteBuilder(self.client, self.table, payload)


class FakeSupabase:
	def __init__(self, tables: dict[str, list[dict]], write_error: str | None = None):
		self.tables = tables
		self.write_error = write_error
		self.write_count = 0

	def table(self, name: str) -> FakeTable:
		return FakeTable(self, name)


TEMPLATE = {
	"id": "template-1",
	"title": "Walk daily",
	"title_am": None,
	"metric": "steps",
	"target_value": 10000,
	"duration_days": 7,
	"description": "Hit the target for seven days",
	"is_active": True,
}


def test_start_challenge_executes_write_then_fetches_saved_row(monkeypatch: pytest.MonkeyPatch) -> None:
	client = FakeSupabase({"challenge_templates": [TEMPLATE], "user_challenges": []})
	monkeypatch.setattr(challenge_engine, "get_supabase_admin_client", lambda: client)

	result = challenge_engine.start_challenge("user-1", "template-1")

	assert client.write_count == 1
	assert result["challenge_id"] == "template-1"
	assert result["template_id"] == "template-1"
	assert result["status"] == "active"
	assert result["title"] == "Walk daily"


def test_start_challenge_returns_existing_active_challenge(monkeypatch: pytest.MonkeyPatch) -> None:
	existing = {
		"id": "existing-1",
		"user_id": "user-1",
		"template_id": "template-1",
		"challenge_id": None,
		"status": "active",
		"progress": 2,
	}
	client = FakeSupabase({"challenge_templates": [TEMPLATE], "user_challenges": [existing]})
	monkeypatch.setattr(challenge_engine, "get_supabase_admin_client", lambda: client)

	result = challenge_engine.start_challenge("user-1", "template-1")

	assert client.write_count == 0
	assert result["id"] == "existing-1"
	assert result["progress"] == 2


def test_start_challenge_returns_404_for_missing_template(monkeypatch: pytest.MonkeyPatch) -> None:
	client = FakeSupabase({"challenge_templates": [], "user_challenges": []})
	monkeypatch.setattr(challenge_engine, "get_supabase_admin_client", lambda: client)

	with pytest.raises(HTTPException) as exc_info:
		challenge_engine.start_challenge("user-1", "missing")

	assert exc_info.value.status_code == 404


def test_start_challenge_returns_useful_500_for_write_failure(monkeypatch: pytest.MonkeyPatch) -> None:
	client = FakeSupabase(
		{"challenge_templates": [TEMPLATE], "user_challenges": []},
		write_error="database unavailable",
	)
	monkeypatch.setattr(challenge_engine, "get_supabase_admin_client", lambda: client)

	with pytest.raises(HTTPException) as exc_info:
		challenge_engine.start_challenge("user-1", "template-1")

	assert exc_info.value.status_code == 500
	assert "Failed to start challenge" in exc_info.value.detail
	assert "database unavailable" in exc_info.value.detail


def test_start_route_response_shape(monkeypatch: pytest.MonkeyPatch) -> None:
	monkeypatch.setattr(
		"app.routers.v1.challenges.start_challenge",
		lambda user_id, template_id: {"challenge_id": template_id, "status": "active"},
	)

	response = asyncio.run(
		start_challenge_route(
			StartChallengeRequest(template_id="template-1"),
			current_user={"id": "user-1"},
		)
	)

	assert response == {
		"success": True,
		"message": "Challenge started successfully",
		"data": {"challenge_id": "template-1", "status": "active"},
	}
