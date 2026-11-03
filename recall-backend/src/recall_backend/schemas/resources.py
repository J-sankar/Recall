from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator

from recall_backend.models.resource import ResourceType


class ResourceCreationRequest(BaseModel):
    """Validated payload for creating a user-owned resource."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    type: ResourceType
    title: str = Field(min_length=1, max_length=300)
    description: str | None = None
    content: str | None = None
    url: HttpUrl | None = None
    collection_id: UUID | None = None

    @model_validator(mode="after")
    def validate_type_payload(self) -> "ResourceCreationRequest":
        if self.type is ResourceType.LINK and self.url is None:
            raise ValueError("A link resource requires a URL.")

        if self.type in {ResourceType.NOTE, ResourceType.SNIPPET} and not self.content:
            raise ValueError(f"A {self.type.value} resource requires content.")

        return self


class ResourceCreationResponse(BaseModel):
    """Response after creating a resource."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: ResourceType
    title: str = Field(min_length=1, max_length=300)
    description: str | None = None
    content: str | None = None
    url: HttpUrl | None = None
    collection_id: UUID | None = None
    is_favorite: bool = False
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    last_accessed_at: datetime | None

class ResourceSummary(BaseModel):
    """Compact representation of a resource for list views."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: ResourceType
    title: str = Field(min_length=1, max_length=300)
    description: str | None = None
    url: HttpUrl | None = None
    created_at: datetime


class ResourceRequest(BaseModel):
    """Request for a particular resource"""
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    id: UUID

class ResourceResponse(ResourceCreationResponse):
    pass


class ResourceGroup(BaseModel):
    resources: list[ResourceSummary]