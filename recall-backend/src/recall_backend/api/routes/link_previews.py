from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, status
from pydantic import ValidationError

from recall_backend.api.dependencies import get_current_user
from recall_backend.core.config import settings
from recall_backend.core.logging import logger
from recall_backend.models.user import User
from recall_backend.schemas.link_previews import LinkPreviewRequest, LinkPreviewResponse

router = APIRouter()

@router.post(
    "/link-previews",
    response_model=LinkPreviewResponse,
    status_code=status.HTTP_200_OK,
)
async def obtain_preview(
    payload: LinkPreviewRequest,
    user: Annotated[User, Depends(get_current_user)],
) -> LinkPreviewResponse:

    url = str(payload.url)
    endpoint = settings.worker_url.rstrip("/")

    headers = {
        "X-Recall-Worker-Secret": settings.recall_worker_secret
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                endpoint,
                json={"url": url},
                headers=headers,
            )

            response.raise_for_status()

            return LinkPreviewResponse.model_validate(response.json())

    except (httpx.HTTPError, ValueError, ValidationError):
        logger.warning(
            "Link preview request failed for user %s",
            user.id,
            exc_info=True,
        )

        return LinkPreviewResponse(final_url=url)
        