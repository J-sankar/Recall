import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from recall_backend.core.config import settings
from recall_backend.models.refresh_token import RefreshToken
from recall_backend.models.user import User

password_hash = PasswordHash.recommended()


class InvalidAccessTokenError(ValueError):
    """Raised when an access token cannot authenticate a request."""


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, password_hash_value: str) -> bool:
    return password_hash.verify(password, password_hash_value)


def create_access_token(user_id: UUID) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "iss": settings.jwt_issuer,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_minutes),
        "type": "access",
    }
    return jwt.encode(payload, settings.require_jwt_secret(), algorithm="HS256")


def get_access_token_subject(token: str) -> UUID:
    try:
        payload = jwt.decode(
            token,
            settings.require_jwt_secret(),
            algorithms=["HS256"],
            issuer=settings.jwt_issuer,
        )
        if payload.get("type") != "access":
            raise InvalidAccessTokenError
        return UUID(payload["sub"])
    except (KeyError, ValueError, jwt.InvalidTokenError) as error:
        raise InvalidAccessTokenError from error


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def create_refresh_token(session: AsyncSession, user: User) -> str:
    raw_token = secrets.token_urlsafe(48)
    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_token),
            expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_days),
        )
    )
    await session.flush()
    return raw_token



async def rotate_refresh_token(
    session: AsyncSession,
    raw_token: str,
) -> tuple[User, str] | None:
    now = datetime.now(UTC)

    token = await session.scalar(
        select(RefreshToken)
        .options(joinedload(RefreshToken.user))
        .where(
            RefreshToken.token_hash == hash_refresh_token(raw_token),
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
        )
        .with_for_update()
    )

    if token is None:
        return None

    token.revoked_at = now

    replacement = await create_refresh_token(session, token.user)

    return token.user, replacement



async def revoke_refresh_token(session: AsyncSession, raw_token: str) -> None:
    token = await session.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(raw_token),
            RefreshToken.revoked_at.is_(None),
        )
    )
    if token is not None:
        token.revoked_at = datetime.now(UTC)
