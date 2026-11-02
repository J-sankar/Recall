from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from recall_backend.db.base import Base
from recall_backend.models.common import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from recall_backend.models.resource import Resource
    from recall_backend.models.user import User


class Tag(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tags"
    __table_args__ = (Index("uq_tags_user_id_lower_name", "user_id", func.lower("name"), unique=True),)

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(80), nullable=False)

    user: Mapped["User"] = relationship(back_populates="tags")
    resources: Mapped[list["Resource"]] = relationship(secondary="resource_tags", back_populates="tags")
