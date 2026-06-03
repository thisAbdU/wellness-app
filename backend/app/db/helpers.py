"""Shared Supabase response helpers."""

from __future__ import annotations


def extract_records(response: object) -> list[dict]:
	data = getattr(response, "data", None)
	if isinstance(data, list):
		return data
	if isinstance(data, dict):
		return [data]
	return []


def first_record(response: object) -> dict | None:
	records = extract_records(response)
	return records[0] if records else None
