from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Recall"
    api_prefix: str = "/api"
    debug: bool = False
    database_url: str | None = None
    cors_origins: list[str] = ["http://localhost:5173"]
    jwt_secret_key: str | None = None
    jwt_issuer: str = "recall"
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    refresh_cookie_name: str = "recall_refresh_token"
    cookie_secure: bool = True
    cookie_samesite: str = "lax"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("debug", mode="before")
    @classmethod
    def normalize_debug(cls, value: bool | str) -> bool | str:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"development", "dev"}:
                return True
            if normalized in {"production", "prod", "release"}:
                return False
        return value

    def async_database_url(self) -> str:
        if not self.database_url:
            raise RuntimeError("DATABASE_URL must be configured before database access.")

        url = urlsplit(self.database_url)
        scheme = url.scheme if "+" in url.scheme else f"{url.scheme}+asyncpg"
        query = dict(parse_qsl(url.query, keep_blank_values=True))
        if "sslmode" in query:
            query["ssl"] = query.pop("sslmode")
        query.pop("channel_binding", None)
        return urlunsplit((scheme, url.netloc, url.path, urlencode(query), url.fragment))

    def require_jwt_secret(self) -> str:
        if not self.jwt_secret_key:
            raise RuntimeError("JWT_SECRET_KEY must be configured before authentication can be used.")
        return self.jwt_secret_key


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
