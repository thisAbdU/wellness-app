"""Supabase client singleton helpers."""

from functools import lru_cache

from supabase import Client, create_client

from app.settings import settings


@lru_cache
def get_supabase_admin_client() -> Client:
	"""Backend-only client using the service role key."""
	return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache
def get_supabase_public_client() -> Client:
	"""Public client using the anon key (token verification)."""
	return create_client(settings.supabase_url, settings.supabase_anon_key)
