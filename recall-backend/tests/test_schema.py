import recall_backend.models  # noqa: F401
from recall_backend.core.config import Settings
from recall_backend.db.base import Base


def test_core_tables_are_registered() -> None:
    assert set(Base.metadata.tables) == {
        "collections",
        "refresh_tokens",
        "resource_tags",
        "resources",
        "tags",
        "users",
    }


def test_resource_payload_constraint_is_present() -> None:
    constraints = {constraint.name for constraint in Base.metadata.tables["resources"].constraints}

    assert "ck_resources_type_payload" in constraints


def test_plain_postgres_url_is_converted_for_asyncpg() -> None:
    settings = Settings(
        database_url="postgresql://user:password@db.example/recall?sslmode=require&channel_binding=require"
    )

    assert settings.async_database_url() == "postgresql+asyncpg://user:password@db.example/recall?ssl=require"


def test_release_debug_value_is_disabled() -> None:
    assert Settings(debug="release").debug is False
