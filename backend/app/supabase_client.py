"""Supabase client helpers."""

from supabase import Client, create_client

from app.config import settings


def get_supabase_admin_client() -> Client:
	"""Return the backend-only Supabase client for trusted operations."""

	# The service role key must never be exposed to frontend or mobile clients.
	return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_public_client() -> Client:
	"""Return the public Supabase client for anon-key based access."""

	# The public client uses the anon key for non-privileged requests.
	return create_client(settings.supabase_url, settings.supabase_anon_key)
