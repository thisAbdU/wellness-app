"""Backward-compatible auth re-export."""

from app.dependencies import bearer_scheme, get_current_user

__all__ = ["bearer_scheme", "get_current_user"]
