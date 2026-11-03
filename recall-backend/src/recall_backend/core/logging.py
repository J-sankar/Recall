import logging
from logging.config import dictConfig


def configure_logging(level: str) -> None:
    """Configure concise, safe application logs for the Recall API."""
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                },
            },
            "loggers": {
                "recall_backend": {"handlers": ["console"], "level": level, "propagate": False},
            },
        }
    )


logger = logging.getLogger("recall_backend")
