from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from recall_backend.db.base import Base
from recall_backend.models.common import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from recall_backend.models.collection import Collection
    from recall_backend.models.tag import Tag
    from recall_backend.models.user import User


class ResourceType(StrEnum):
    LINK = "link"
    NOTE = "note"
    SNIPPET = "snippet"


resource_tags = Table(
    "resource_tags",
    Base.metadata,
    Column("resource_id", ForeignKey("resources.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Resource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "resources"
    __table_args__ = (
        CheckConstraint(
            "(type = 'link' AND url IS NOT NULL) OR "
            "(type IN ('note', 'snippet') AND content IS NOT NULL)",
            name="ck_resources_type_payload",
        ),
        UniqueConstraint("id", "user_id", name="uq_resources_id_user_id"),
    )

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    collection_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("collections.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[ResourceType] = mapped_column(
        Enum(
            ResourceType,
            name="resource_type",
            native_enum=False,
            values_callable=lambda resource_types: [resource_type.value for resource_type in resource_types],
        ),
        nullable=False,
    )
    url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="resources")
    collection: Mapped["Collection | None"] = relationship(back_populates="resources")
    tags: Mapped[list["Tag"]] = relationship(secondary=resource_tags, back_populates="resources")
