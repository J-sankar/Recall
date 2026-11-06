
from fastapi import HTTPException, Request, status

from recall_backend.core.config import settings


def validate_request_origin(request: Request) -> None:
    origin = request.headers.get("origin")

    if origin not in settings.cors_origins:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid request origin.",
        )
