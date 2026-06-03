"""Challenge template progress evaluation and completion."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from app.db.helpers import extract_records, first_record
from app.db.supabase_client import get_supabase_admin_client
from app.badges.service import check_and_award_badges


def _metric_value(row: dict, metric: str) -> float:
	if metric == "steps":
		return float(row.get("steps") or 0)
	if metric == "sleep_hrs":
		return (row.get("sleep_minutes") or 0) / 60
	if metric == "workout_days":
		return 1.0 if int(row.get("workout_count") or 0) > 0 or int(row.get("active_minutes") or 0) >= 20 else 0.0
	return 0.0


def get_active_challenges(user_id: str) -> list[dict]:
	client = get_supabase_admin_client()
	response = (
		client.table("user_challenges")
		.select("*")
		.eq("user_id", user_id)
		.eq("status", "active")
		.execute()
	)
	rows = extract_records(response)
	templates = _templates_by_id()
	return [_enrich(row, templates) for row in rows]


def _templates_by_id() -> dict[str, dict]:
	client = get_supabase_admin_client()
	response = client.table("challenge_templates").select("*").eq("is_active", True).execute()
	return {str(t["id"]): t for t in extract_records(response)}


def _enrich(user_challenge: dict, templates: dict[str, dict]) -> dict:
	merged = dict(user_challenge)
	tid = str(user_challenge.get("challenge_id") or user_challenge.get("template_id") or "")
	template = templates.get(tid)
	if template:
		merged.update(
			{
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
	template = first_record(
		client.table("challenge_templates").select("*").eq("id", template_id).eq("is_active", True).execute()
	)
	if template is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge template not found")

	today = datetime.now(timezone.utc).date().isoformat()
	record = {
		"user_id": user_id,
		"challenge_id": template_id,
		"status": "active",
		"progress": 0,
		"start_date": today,
		"started_at": datetime.now(timezone.utc).isoformat(),
		"progress_json": {"qualifying_days": 0, "required_days": template["duration_days"], "log": {}},
	}
	response = (
		client.table("user_challenges")
		.upsert(record, on_conflict="user_id,challenge_id")
		.select("*")
		.execute()
	)
	saved = first_record(response)
	if saved is None:
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to start challenge")
	return _enrich(saved, {template_id: template})


def get_challenge_progress(user_id: str, challenge_id: str) -> dict:
	client = get_supabase_admin_client()
	response = (
		client.table("user_challenges")
		.select("*")
		.eq("user_id", user_id)
		.eq("challenge_id", challenge_id)
		.limit(1)
		.execute()
	)
	row = first_record(response)
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

	response = (
		client.table("health_daily_summaries")
		.select("*")
		.eq("user_id", user_id)
		.gte("summary_date", start.isoformat())
		.lte("summary_date", window_end.isoformat())
		.execute()
	)
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

	updated = {
		"user_id": user_id,
		"challenge_id": user_challenge.get("challenge_id"),
		"progress": qualifying_days,
		"status": new_status,
		"progress_json": progress_json,
		"completed_at": completed_at,
		"start_date": start_date,
		"started_at": user_challenge.get("started_at"),
	}
	client.table("user_challenges").upsert(updated, on_conflict="user_id,challenge_id").execute()

	if new_status == "completed":
		check_and_award_badges(user_id=user_id, summary_date=today.isoformat())

	return _enrich({**user_challenge, **updated}, {str(template["id"]): template})


def run_daily_challenge_evaluation() -> int:
	client = get_supabase_admin_client()
	response = client.table("user_challenges").select("*").eq("status", "active").execute()
	active = extract_records(response)
	templates = _templates_by_id()
	count = 0
	for uc in active:
		tid = str(uc.get("challenge_id") or "")
		template = templates.get(tid)
		if not template:
			continue
		evaluate_challenge(str(uc["user_id"]), uc, template)
		count += 1
	return count
