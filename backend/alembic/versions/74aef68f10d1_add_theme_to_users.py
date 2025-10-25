"""add theme to users

Revision ID: 74aef68f10d1
Revises: 2de6a49c0e6d
Create Date: 2025-10-25 17:12:22.198708

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74aef68f10d1'
down_revision: Union[str, Sequence[str], None] = '2de6a49c0e6d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("theme", sa.String(length=10), nullable=False, server_default="system"),
    )

def downgrade():
    op.drop_column("users", "theme")
