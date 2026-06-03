from pydantic import BaseModel


class WeeklyAnalyticsResponse(BaseModel):
	days: list[str]
	steps: list[int]
	sleep_minutes: list[int]
	active_minutes: list[int]
	calories_burned: list[float]
	wellness_scores: list[int]
	average_steps: float
	average_sleep_minutes: float
	average_wellness_score: float


class MonthlyAnalyticsResponse(BaseModel):
	start_date: str
	end_date: str
	average_steps: float
	average_sleep_minutes: float
	average_active_minutes: float
	average_wellness_score: float
	total_workouts: int
	best_wellness_day: str | None
	worst_wellness_day: str | None
	improvement_percentage: float
