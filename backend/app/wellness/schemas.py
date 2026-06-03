from pydantic import BaseModel


class WellnessScoreResponse(BaseModel):
	activity_score: int
	sleep_score: int
	recovery_score: int
	consistency_score: int
	total_score: int
