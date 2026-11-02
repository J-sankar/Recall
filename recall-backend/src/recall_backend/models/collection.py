from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from recall_backend.db.base import Base
from recall_backend.models.common import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from recall_backend.models.resource import Resource
    from recall_backend.models.user import User


class Collection(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "collections"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    user: Mapped["User"] = relationship(back_populates="collections")
    resources: Mapped[list["Resource"]] = relationship(back_populates="collection")
