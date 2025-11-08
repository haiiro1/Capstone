# aqui va SQLAlchemy models (User, RefreshToken)
import sqlalchemy as sa
from sqlalchemy import (
    DOUBLE_PRECISION,
    Column,
    Index,
    String,
    DateTime,
    Boolean,
    Integer,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(254), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    # Preferencia de tema: 'light' | 'dark' | 'system'
    theme = Column(String(10), nullable=False, server_default="system")
    company = Column(String(120), nullable=True)
    location = Column(String(120), nullable=True)
    crops = Column(JSONB, nullable=True)
    avatar_path = Column(String(255), nullable=True)
    weather_prefs = relationship(
        "UserWeatherPrefs",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
        passive_deletes=True,
    )


class UserWeatherPrefs(Base):
    __tablename__ = "user_weather_prefs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
    )
    dangerous_frost_threshold = Column(Integer, nullable=False, default=1)
    dangerous_temp_threshold = Column(Integer, nullable=False, default=32)
    rain_mm_threshold = Column(Integer, nullable=False, default=2)
    wind_kph_threshold = Column(Integer, nullable=False, default=40)
    user = relationship(
        "User",
        back_populates="weather_prefs",
        passive_deletes=True,
        uselist=False,
    )


class PredictionRecord(Base):
    __tablename__ = "prediction_record"
    __table_args__ = (
        Index("ix_pr_user_created_desc", "user_id", "date_created"),
    )
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # note this, they arent used currently, since we only display top-1, but they could be used,
    # with another table that would store these records, this isn't needed for now, but its future proofing.
    rank = Column(Integer, nullable=False, default=1)
    session_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    date_created = Column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=True)
    advice = Column(JSONB, nullable=False, default=list)
    probability = Column(DOUBLE_PRECISION, nullable=False)
    model_version = Column(String, nullable=True)
    user = relationship("User", backref="prediction_records")
