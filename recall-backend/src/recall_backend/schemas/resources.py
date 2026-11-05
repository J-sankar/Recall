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



class ResourceUpdateRequest(BaseModel):
    """Partial update: only the fields sent are changed."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = None
    content: str | None = None
    url: HttpUrl | None = None
    collection_id: UUID | None = None
    is_favorite: bool | None = None
    is_archived: bool | None = None

    @model_validator(mode="after")
    def validate_update(self) -> "ResourceUpdateRequest":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided.")

        # These columns are NOT NULL, so an explicit null makes no sense.
        for field in ("title", "is_favorite", "is_archived"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null.")

        return self