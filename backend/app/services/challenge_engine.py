"""Challenge template progress evaluation and completion."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from app.badges.service import check_and_award_badges
from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client


def _metric_value(row: dict, metric: str) -> float:
	if metric == "steps":
		return float(row.get("steps") or 0)
	if metric == "sleep_hrs":
		return (row.get("sleep_minutes") or 0) / 60
	if metric == "workout_days":
		return 1.0 if int(row.get("workout_count") or 0) > 0 or int(row.get("active_minutes") or 0) >= 20 else 0.0
	return 0.0


def _fetch_template_challenge(
	client: object,
	user_id: str,
	template_id: str,
	*,
	active_only: bool = False,
) -> dict | None:
	query = (
		client.table("user_challenges")
		.select("*")
		.eq("user_id", user_id)
		.eq("template_id", template_id)
	)
	if active_only:
		query = query.eq("status", "active")
	return first_record(query.limit(1).execute())


def get_active_challenges(user_id: str) -> list[dict]:
	client = get_supabase_admin_client()
	try:
		response = (
			client.table("user_challenges")
			.select("*")
			.eq("user_id", user_id)
			.eq("status", "active")
			.not_.is_("template_id", "null")
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch active challenges: {exc}",
		) from exc

	rows = extract_records(response)
	templates = _templates_by_id()
	return [_enrich(row, templates) for row in rows]


def _templates_by_id() -> dict[str, dict]:
	client = get_supabase_admin_client()
	try:
		response = client.table("challenge_templates").select("*").eq("is_active", True).execute()
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch challenge templates: {exc}",
		) from exc
	return {str(template["id"]): template for template in extract_records(response)}


def _enrich(user_challenge: dict, templates: dict[str, dict]) -> dict:
	merged = dict(user_challenge)
	template_id = str(user_challenge.get("template_id") or "")
	template = templates.get(template_id)
	if template:
		# Keep challenge_id in the API response for the unchanged frontend route contract.
		merged.update(
			{
				"challenge_id": template_id,
				"title": template.get("title"),
				"title_am": template.get("title_am"),
				"metric": template.get("metric"),
				"target_value": template.get("target_value"),
				"duration_days": template.get("duration_days"),
				"description": template.get("description"),
			}
		)
	return merged


def start_challenge(user_id: str, template_id: str) -> dict:
	client = get_supabase_admin_client()

	try:
		template = first_record(
			client.table("challenge_templates")
			.select("*")
			.eq("id", template_id)
			.eq("is_active", True)
			.limit(1)
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to load challenge template: {exc}",
		) from exc

	if template is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge template not found")

	try:
		existing = _fetch_template_challenge(client, user_id, template_id, active_only=True)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to check existing challenge: {exc}",
		) from exc

	if existing is not None:
		return _enrich(existing, {template_id: template})

	now = datetime.now(timezone.utc)
	record = {
		"user_id": user_id,
		"template_id": template_id,
		"challenge_id": None,
		"status": "active",
		"progress": 0,
		"start_date": now.date().isoformat(),
		"started_at": now.isoformat(),
		"completed_at": None,
		"progress_json": {
			"qualifying_days": 0,
			"required_days": int(template["duration_days"]),
			"log": {},
		},
	}

	try:
		# This Supabase client does not support .select("*") after upsert().
		client.table("user_challenges").upsert(
			record,
			on_conflict="user_id,template_id",
		).execute()
		saved = _fetch_template_challenge(client, user_id, template_id)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to start challenge: {exc}",
		) from exc

	if saved is None:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Challenge write completed but the saved challenge could not be fetched",
		)

	return _enrich(saved, {template_id: template})


def get_challenge_progress(user_id: str, challenge_id: str) -> dict:
	client = get_supabase_admin_client()
	try:
		row = _fetch_template_challenge(client, user_id, challenge_id)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch challenge progress: {exc}",
		) from exc

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

	templates = _templates_by_id()
	template = templates.get(challenge_id)
	if template and row.get("status") == "active":
		return evaluate_challenge(user_id, row, template)
	return _enrich(row, templates)


def evaluate_challenge(user_id: str, user_challenge: dict, template: dict) -> dict:
	client = get_supabase_admin_client()
	start_date = user_challenge.get("start_date") or user_challenge.get("started_at", "")[:10]
	if not start_date:
		return user_challenge

	today = datetime.now(timezone.utc).date()
	start = date.fromisoformat(str(start_date)[:10])
	duration = int(template.get("duration_days") or 7)
	window_end = min(today, start + timedelta(days=duration))
	metric = template.get("metric", "steps")
	target = float(template.get("target_value") or 0)

	try:
		response = (
			client.table("health_daily_summaries")
			.select("*")
			.eq("user_id", user_id)
			.gte("summary_date", start.isoformat())
			.lte("summary_date", window_end.isoformat())
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to fetch challenge health data: {exc}",
		) from exc

	rows = extract_records(response)
	qualifying_days = 0
	log: dict[str, bool] = {}
	for row in rows:
		summary_date = str(row.get("summary_date"))[:10]
		ok = _metric_value(row, metric) >= target
		log[summary_date] = ok
		if ok:
			qualifying_days += 1

	progress_json = {
		"qualifying_days": qualifying_days,
		"required_days": duration,
		"log": log,
		"metric": metric,
		"target_value": target,
	}
	new_status = user_challenge.get("status", "active")
	completed_at = user_challenge.get("completed_at")

	if qualifying_days >= duration:
		new_status = "completed"
		completed_at = datetime.now(timezone.utc).isoformat()
	elif today > start + timedelta(days=duration):
		new_status = "failed"

	template_id = str(user_challenge.get("template_id") or template["id"])
	updated = {
		"user_id": user_id,
		"template_id": template_id,
		"challenge_id": None,
		"progress": qualifying_days,
		"status": new_status,
		"progress_json": progress_json,
		"completed_at": completed_at,
		"start_date": start_date,
		"started_at": user_challenge.get("started_at"),
	}

	try:
		client.table("user_challenges").upsert(
			updated,
			on_conflict="user_id,template_id",
		).execute()
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to update challenge progress: {exc}",
		) from exc

	if new_status == "completed":
		check_and_award_badges(user_id=user_id, summary_date=today.isoformat())

	return _enrich({**user_challenge, **updated}, {template_id: template})


def run_daily_challenge_evaluation() -> int:
	client = get_supabase_admin_client()
	try:
		response = (
			client.table("user_challenges")
			.select("*")
			.eq("status", "active")
			.not_.is_("template_id", "null")
			.execute()
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to load active challenges: {exc}",
		) from exc

	active = extract_records(response)
	templates = _templates_by_id()
	count = 0
	for user_challenge in active:
		template_id = str(user_challenge.get("template_id") or "")
		template = templates.get(template_id)
		if not template:
			continue
		evaluate_challenge(str(user_challenge["user_id"]), user_challenge, template)
		count += 1
	return count
