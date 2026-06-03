"""FastAPI dependencies for auth and database access."""

from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.db.supabase_client import get_supabase_admin_client, get_supabase_public_client
from app.middleware.auth import _verify_bearer_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_supabase() -> Client:
	return get_supabase_admin_client()


async def get_current_user(
	request: Request,
	credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
	user_id = getattr(request.state, "user_id", None)
	if user_id:
		return {
			"id": user_id,
			"email": getattr(request.state, "user_email", None),
		}

	if credentials is None or not credentials.credentials:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid or expired authentication token",
		)

	user = _verify_bearer_token(credentials.credentials)
	if user is None:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid or expired authentication token",
		)

	request.state.user_id = user["id"]
	request.state.user_email = user.get("email")
	return user


def get_supabase_public() -> Client:
	return get_supabase_public_client()
