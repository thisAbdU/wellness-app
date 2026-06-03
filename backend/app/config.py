"""Backward-compatible settings re-export."""

from app.settings import Settings, settings

__all__ = ["Settings", "settings"]
