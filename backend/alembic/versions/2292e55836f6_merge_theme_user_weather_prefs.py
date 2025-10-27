"""merge theme + user_weather_prefs

Revision ID: 2292e55836f6
Revises: 74aef68f10d1, 82eacc582986
Create Date: 2025-10-26 20:40:10.160441

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2292e55836f6'
down_revision: Union[str, Sequence[str], None] = ('74aef68f10d1', '82eacc582986')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
