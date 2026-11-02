from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from recall_backend.db.base import Base
from recall_backend.models.common import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from recall_backend.models.collection import Collection
    from recall_backend.models.refresh_token import RefreshToken
    from recall_backend.models.resource import Resource
    from recall_backend.models.tag import Tag


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    collections: Mapped[list["Collection"]] = relationship(back_populates="user")
    resources: Mapped[list["Resource"]] = relationship(back_populates="user")
    tags: Mapped[list["Tag"]] = relationship(back_populates="user")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(back_populates="user")
