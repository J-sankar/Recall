from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from recall_backend.api.dependencies import get_current_user
from recall_backend.core.logging import logger
from recall_backend.db.session import get_db_session
from recall_backend.models import Collection, Resource, User
from recall_backend.schemas.resources import (
    ResourceCreationRequest,
    ResourceCreationResponse,
    ResourceGroup,
    ResourceResponse,
    ResourceSummary,
)

router = APIRouter(prefix="/resources")
SessionDependency = Annotated[AsyncSession, Depends(get_db_session)]

@router.post("/", response_model=ResourceCreationResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    payload: ResourceCreationRequest,
    session: SessionDependency,
    user: Annotated[User, Depends(get_current_user)],
) -> Resource:
    if payload.collection_id is not None:
        collection = await session.scalar(
            select(Collection).where(
                Collection.id == payload.collection_id,
                Collection.user_id == user.id,
            )
        )

        if collection is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collection not found.",
            )
    resource = Resource(
        type=payload.type,
        title=payload.title,
        description=payload.description,
        content=payload.content,
        collection_id=payload.collection_id,
        url=str(payload.url) if payload.url else None,
        user_id=user.id,
    )
    session.add(resource)
    await session.commit()
    await session.refresh(resource)
    logger.info("Resource created: id=%s type=%s user_id=%s", resource.id, resource.type, user.id)

    return resource


@router.get("/", response_model=ResourceGroup)
async def get_resources(
    session: SessionDependency,
    user: Annotated[User, Depends(get_current_user)],
    collection_id: UUID | None = None,
    inbox: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
) -> ResourceGroup:
    if collection_id is not None and inbox:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="collection_id and inbox filters are mutually exclusive.",
        )

    filters = [Resource.user_id == user.id]

    if collection_id is not None:
        collection = await session.scalar(
                    select(Collection).where(
                        Collection.id == collection_id,
                        Collection.user_id == user.id,
                    )
                )
        
        if collection is None:
            raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Collection not found.",
                    )
        filters.append(Resource.collection_id == collection_id)
    if inbox:
        filters.append(Resource.collection_id.is_(None))
    resources = await session.scalars(
        select(Resource)
        .where(*filters)
        .order_by(Resource.created_at.desc())
        .limit(limit)
        .offset(skip)
    )

    return ResourceGroup(resources=[ResourceSummary.model_validate(resource) for resource in resources])


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: UUID,
    session: SessionDependency,
    user: Annotated[User, Depends(get_current_user)],
) -> Resource:
    resource = await session.scalar(
        select(Resource).where(Resource.id == resource_id, Resource.user_id == user.id)
    )
    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found.",
        )
    return resource