"""JWT auth middleware  verifies Supabase tokens and sets request.state."""

from __future__ import annotations

import re
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.db.supabase_client import get_supabase_public_client


_PUBLIC_EXACT = {
	"/",
	"/health",
	"/health-check",
	"/config-check",
	"/openapi.json",
	"/wellness/test-score",
}
_PUBLIC_PREFIXES = ("/docs", "/redoc")


def _is_public_path(path: str) -> bool:
	if path in _PUBLIC_EXACT:
		return True
	if any(path.startswith(prefix) for prefix in _PUBLIC_PREFIXES):
		return True
	if re.match(r"^/leaderboards/?$", path):
		return True
	if re.match(r"^/badges/?$", path):
		return True
	if re.match(r"^/challenges/?$", path):
		return True
	return False


def _verify_bearer_token(token: str) -> dict[str, Any] | None:
	try:
		supabase_client = get_supabase_public_client()
		auth_response = supabase_client.auth.get_user(token)
		user = getattr(auth_response, "user", None)
		if user is None:
			return None
		return {"id": user.id, "email": user.email}
	except Exception:
		return None


class JWTAuthMiddleware(BaseHTTPMiddleware):
	"""Attach authenticated user_id to request.state for protected routes."""

	async def dispatch(self, request: Request, call_next) -> Response:
		if request.method == "OPTIONS":
			return await call_next(request)

		path = request.url.path
		if _is_public_path(path):
			return await call_next(request)

		auth_header = request.headers.get("Authorization", "")
		if not auth_header.startswith("Bearer "):
			return JSONResponse(
				status_code=401,
				content={"detail": "Invalid or expired authentication token"},
			)

		token = auth_header.removeprefix("Bearer ").strip()
		user = _verify_bearer_token(token)
		if user is None:
			return JSONResponse(
				status_code=401,
				content={"detail": "Invalid or expired authentication token"},
			)

		request.state.user_id = user["id"]
		request.state.user_email = user.get("email")
		return await call_next(request)
