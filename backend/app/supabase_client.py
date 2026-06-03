"""Backward-compatible Supabase client re-export."""

from app.db.supabase_client import get_supabase_admin_client, get_supabase_public_client

__all__ = ["get_supabase_admin_client", "get_supabase_public_client"]
