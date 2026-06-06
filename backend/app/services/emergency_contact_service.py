"""CRUD operations for user-owned emergency contacts."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.schemas.emergency_contacts import EmergencyContactWrite


def _api_contact(row: dict) -> dict:
	return {
		"id": str(row["id"]),
		"user_id": str(row["user_id"]),
		"name": row.get("name") or "",
		"phone_number": row.get("phone") or "",
		"relationship": row.get("relationship") or "Family",
		"is_primary": bool(row.get("is_primary")),
		"created_at": row.get("created_at"),
		"updated_at": row.get("updated_at"),
	}


def _contact_row(user_id: str, payload: EmergencyContactWrite) -> dict:
	return {
		"user_id": user_id,
		"name": payload.name,
		"phone": payload.phone_number,
		"relationship": payload.relationship,
		"is_primary": payload.is_primary,
		"updated_at": datetime.now(timezone.utc).isoformat(),
	}


def _clear_primary(user_id: str, exclude_id: str | None = None) -> None:
	client = get_supabase_admin_client()
	query = (
		client.table("emergency_contacts")
		.update({"is_primary": False, "updated_at": datetime.now(timezone.utc).isoformat()})
		.eq("user_id", user_id)
		.eq("is_primary", True)
	)
	if exclude_id:
		query = query.neq("id", exclude_id)
	query.execute()


def list_emergency_contacts(user_id: str) -> list[dict]:
	client = get_supabase_admin_client()
	try:
		response = (
			client.table("emergency_contacts")
			.select("*")
			.eq("user_id", user_id)
			.order("is_primary", desc=True)
			.order("created_at")
			.execute()
		)
		return [_api_contact(row) for row in extract_records(response)]
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch emergency contacts: {exc}",
		) from exc


def create_emergency_contact(user_id: str, payload: EmergencyContactWrite) -> dict:
	client = get_supabase_admin_client()
	try:
		existing = list_emergency_contacts(user_id)
		record = _contact_row(user_id, payload)
		if not existing:
			record["is_primary"] = True
		if record["is_primary"]:
			_clear_primary(user_id)
		record["created_at"] = datetime.now(timezone.utc).isoformat()
		response = client.table("emergency_contacts").insert(record).select("*").execute()
		saved = first_record(response)
		if saved is None:
			raise RuntimeError("Database did not return the created contact")
		return _api_contact(saved)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to create emergency contact: {exc}",
		) from exc


def update_emergency_contact(user_id: str, contact_id: str, payload: EmergencyContactWrite) -> dict:
	client = get_supabase_admin_client()
	try:
		existing = first_record(
			client.table("emergency_contacts")
			.select("*")
			.eq("id", contact_id)
			.eq("user_id", user_id)
			.limit(1)
			.execute()
		)
		if existing is None:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency contact not found")

		if payload.is_primary:
			_clear_primary(user_id, exclude_id=contact_id)
		response = (
			client.table("emergency_contacts")
			.update(_contact_row(user_id, payload))
			.eq("id", contact_id)
			.eq("user_id", user_id)
			.select("*")
			.execute()
		)
		saved = first_record(response)
		if saved is None:
			raise RuntimeError("Database did not return the updated contact")
		return _api_contact(saved)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to update emergency contact: {exc}",
		) from exc


def delete_emergency_contact(user_id: str, contact_id: str) -> None:
	client = get_supabase_admin_client()
	try:
		existing = first_record(
			client.table("emergency_contacts")
			.select("*")
			.eq("id", contact_id)
			.eq("user_id", user_id)
			.limit(1)
			.execute()
		)
		if existing is None:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency contact not found")

		client.table("emergency_contacts").delete().eq("id", contact_id).eq("user_id", user_id).execute()
		if existing.get("is_primary"):
			remaining = list_emergency_contacts(user_id)
			if remaining:
				next_primary = EmergencyContactWrite(
					name=remaining[0]["name"],
					phone_number=remaining[0]["phone_number"],
					relationship=remaining[0]["relationship"],
					is_primary=True,
				)
				update_emergency_contact(user_id, remaining[0]["id"], next_primary)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to delete emergency contact: {exc}",
		) from exc
