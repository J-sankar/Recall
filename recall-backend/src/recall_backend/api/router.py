from fastapi import APIRouter

from recall_backend.api.routes.auth import router as auth_router
from recall_backend.api.routes.health import router as health_router
from recall_backend.api.routes.link_previews import router as link_preview_router
from recall_backend.api.routes.resources import router as resources_router

api_router = APIRouter()
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(health_router, tags=["health"])
api_router.include_router(resources_router, tags=["resources"])
api_router.include_router(link_preview_router, tags=["link-preview"])
