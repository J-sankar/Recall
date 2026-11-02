"""Create the initial Recall schema.

Revision ID: 20261102_0001
Revises:
Create Date: 2026-11-02 00:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261102_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    resource_type = sa.Enum("link", "note", "snippet", name="resource_type", native_enum=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=False)

    op.create_table(
        "collections",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_collections_user_id", "collections", ["user_id"], unique=False)

    op.create_table(
        "tags",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tags_user_id", "tags", ["user_id"], unique=False)
    op.create_index("uq_tags_user_id_lower_name", "tags", ["user_id", sa.text("lower(name)")], unique=True)

    op.create_table(
        "resources",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("collection_id", sa.Uuid(), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type", resource_type, nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("is_favorite", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_archived", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("last_accessed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint(
            "(type = 'link' AND url IS NOT NULL) OR "
            "(type IN ('note', 'snippet') AND content IS NOT NULL)",
            name="ck_resources_type_payload",
        ),
        sa.ForeignKeyConstraint(["collection_id"], ["collections.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("id", "user_id", name="uq_resources_id_user_id"),
    )
    op.create_index("ix_resources_user_id", "resources", ["user_id"], unique=False)
    op.create_index("ix_resources_collection_id", "resources", ["collection_id"], unique=False)

    op.create_table(
        "resource_tags",
        sa.Column("resource_id", sa.Uuid(), nullable=False),
        sa.Column("tag_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["resource_id"], ["resources.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("resource_id", "tag_id"),
    )


def downgrade() -> None:
    op.drop_table("resource_tags")
    op.drop_index("ix_resources_collection_id", table_name="resources")
    op.drop_index("ix_resources_user_id", table_name="resources")
    op.drop_table("resources")
    op.drop_index("uq_tags_user_id_lower_name", table_name="tags")
    op.drop_index("ix_tags_user_id", table_name="tags")
    op.drop_table("tags")
    op.drop_index("ix_collections_user_id", table_name="collections")
    op.drop_table("collections")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
