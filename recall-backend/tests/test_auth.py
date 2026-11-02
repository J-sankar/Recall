import asyncio
from collections.abc import AsyncIterator, Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import recall_backend.models  # noqa: F401
from recall_backend.core.config import settings
from recall_backend.db.base import Base
from recall_backend.db.session import get_db_session
from recall_backend.main import app


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setattr(settings, "jwt_secret_key", "test-secret-that-is-at-least-thirty-two-bytes")
    monkeypatch.setattr(settings, "cookie_secure", False)
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def prepare_database() -> None:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)

    async def override_session() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    asyncio.run(prepare_database())
    app.dependency_overrides[get_db_session] = override_session
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        asyncio.run(engine.dispose())


def test_registration_login_refresh_logout_and_current_user(client: TestClient) -> None:
    credentials = {"email": "person@example.com", "password": "correct horse battery staple"}
    registered = client.post("/api/auth/register", json=credentials)

    assert registered.status_code == 201
    access_token = registered.json()["access_token"]
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {access_token}"}).status_code == 200

    first_refresh_token = registered.cookies.get(settings.refresh_cookie_name)
    refreshed = client.post("/api/auth/refresh")
    assert refreshed.status_code == 200
    second_refresh_token = refreshed.cookies.get(settings.refresh_cookie_name)

    client.cookies.set(settings.refresh_cookie_name, first_refresh_token)
    reused_refresh = client.post("/api/auth/refresh")
    assert reused_refresh.status_code == 401

    client.cookies.set(settings.refresh_cookie_name, second_refresh_token)
    assert client.post("/api/auth/logout").status_code == 204
    assert client.post("/api/auth/refresh").status_code == 401


def test_duplicate_registration_and_invalid_login_are_rejected(client: TestClient) -> None:
    credentials = {"email": "person@example.com", "password": "correct horse battery staple"}

    assert client.post("/api/auth/register", json=credentials).status_code == 201
    assert client.post("/api/auth/register", json=credentials).status_code == 409
    assert client.post(
        "/api/auth/login", json={**credentials, "password": "an incorrect password"}
    ).status_code == 401


def test_current_user_rejects_missing_or_invalid_access_token(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer invalid"}).status_code == 401
