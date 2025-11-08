"""change default for date_created, oops

Revision ID: d8b2e9345f31
Revises: 94711edb4ff5
Create Date: 2025-10-27 23:02:19.489186

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8b2e9345f31'
down_revision: Union[str, Sequence[str], None] = '94711edb4ff5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column(
        "prediction_record",
        "date_created",
        server_default=sa.text("now()"),
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
    )

def downgrade():
    op.alter_column(
        "prediction_record",
        "date_created",
        server_default=None,
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
