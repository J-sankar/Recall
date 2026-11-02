from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from recall_backend.db.session import get_db_session
from recall_backend.models.user import User
from recall_backend.services.auth import InvalidAccessTokenError, get_access_token_subject

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise credentials_error

    try:
        user_id = get_access_token_subject(credentials.credentials)
    except InvalidAccessTokenError as error:
        raise credentials_error from error

    user = await session.get(User, user_id)
    if user is None:
        raise credentials_error
    return user
