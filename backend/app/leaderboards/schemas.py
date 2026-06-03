from pydantic import BaseModel


class LeaderboardRow(BaseModel):
    rank: int
    user_id: str
    full_name: str | None = None
    avatar_url: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    university: str | None = None
    company: str | None = None
    neighborhood: str | None = None
    metric: str
    value: float | int
