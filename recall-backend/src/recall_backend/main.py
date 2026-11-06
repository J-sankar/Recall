from time import perf_counter

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from recall_backend.api.router import api_router
from recall_backend.core.config import settings
from recall_backend.core.logging import configure_logging, logger


def create_app() -> FastAPI:
    configure_logging(settings.log_level)
    app = FastAPI(title=settings.app_name, debug=settings.debug)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"], 
    )

    @app.middleware("http")
    async def log_request(request, call_next):
        start = perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("Unhandled request error: %s %s", request.method, request.url.path)
            raise

        logger.info(
            "%s %s -> %s in %.1f ms",
            request.method,
            request.url.path,
            response.status_code,
            (perf_counter() - start) * 1000,
        )
        return response

    app.include_router(api_router, prefix=settings.api_prefix)
    return app


app = create_app()
