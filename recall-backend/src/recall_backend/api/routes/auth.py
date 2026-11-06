from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from recall_backend.api.dependencies import get_current_user
from recall_backend.core.config import settings
from recall_backend.core.security import validate_request_origin
from recall_backend.db.session import get_db_session
from recall_backend.models.user import User
from recall_backend.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from recall_backend.services.auth import (
    create_access_token,
    create_refresh_token,
    hash_password,
    normalize_email,
    revoke_refresh_token,
    rotate_refresh_token,
    verify_password,
)

router = APIRouter(prefix="/auth")
SessionDependency = Annotated[AsyncSession, Depends(get_db_session)]


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        max_age=settings.refresh_token_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path=f"{settings.api_prefix}/auth",
    )


def credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request:Request, payload: RegisterRequest, response: Response, session: SessionDependency) -> TokenResponse:
    validate_request_origin(request)
    email = normalize_email(str(payload.email))
    existing_user = await session.scalar(select(User.id).where(User.email == email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered.")

    user = User(email=email, password_hash=hash_password(payload.password))
    session.add(user)
    await session.flush()
    access_token = create_access_token(user.id)
    refresh_token = await create_refresh_token(session, user)
    await session.commit()
    set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(request:Request,payload: LoginRequest, response: Response, session: SessionDependency) -> TokenResponse:
    validate_request_origin(request)
    email = normalize_email(str(payload.email))
    user = await session.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise credentials_error()

    access_token = create_access_token(user.id)
    refresh_token = await create_refresh_token(session, user)
    await session.commit()
    set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    session: SessionDependency,
    refresh_token: Annotated[str | None, Cookie(alias=settings.refresh_cookie_name)] = None,
) -> TokenResponse:
    validate_request_origin(request)
    if refresh_token is None:
        raise credentials_error()

    refreshed = await rotate_refresh_token(session, refresh_token)
    if refreshed is None:
        raise credentials_error()

    user, replacement_token = refreshed
    access_token = create_access_token(user.id)
    await session.commit()
    set_refresh_cookie(response, replacement_token)
    return TokenResponse(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request:Request,
    response: Response,
    session: SessionDependency,
    refresh_token: Annotated[str | None, Cookie(alias=settings.refresh_cookie_name)] = None,
) -> Response:
    validate_request_origin(request)
    if refresh_token is not None:
        await revoke_refresh_token(session, refresh_token)
        await session.commit()
    response.delete_cookie(key=settings.refresh_cookie_name, path=f"{settings.api_prefix}/auth")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user
