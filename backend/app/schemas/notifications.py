"""Schemas for user notification preferences."""

from pydantic import BaseModel


class NotificationPreferences(BaseModel):
	challenge_updates: bool = True
	badge_alerts: bool = True
	coach_insights: bool = True
	emergency_alerts: bool = True
	leaderboard_updates: bool = False
	daily_reminders: bool = True
