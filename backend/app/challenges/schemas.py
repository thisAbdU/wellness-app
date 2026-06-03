from pydantic import BaseModel


class ChallengeResponse(BaseModel):
    id: str | int
    title: str
    description: str | None = None
    challenge_type: str
    target_value: int
    duration_days: int
    is_active: bool


class UserChallengeResponse(BaseModel):
    id: str | int | None = None
    user_id: str | int
    challenge_id: str | int
    title: str | None = None
    description: str | None = None
    challenge_type: str | None = None
    target_value: int | None = None
    duration_days: int | None = None
    progress: int
    status: str
    started_at: str | None = None
    completed_at: str | None = None
