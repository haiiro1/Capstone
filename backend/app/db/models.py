# aqui va SQLAlchemy models (User, RefreshToken)
import uuid
import sqlalchemy as sa
from datetime import timedelta, timezone, datetime
from sqlalchemy import (
    DOUBLE_PRECISION,
    Column,
    Index,
    Numeric,
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
    subscription_status = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    purchase_orders = relationship(
        "PurchaseOrder", back_populates="user", cascade="all, delete-orphan"
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
    __table_args__ = (Index("ix_pr_user_created_desc", "user_id", "date_created"),)
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
    date_created = Column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    title = Column(String, nullable=False)
    severity = Column(String, nullable=True)
    advice = Column(JSONB, nullable=False, default=list)
    probability = Column(DOUBLE_PRECISION, nullable=False)
    model_version = Column(String, nullable=True)
    user = relationship("User", backref="prediction_records")


class Subscription(Base):
    __tablename__ = "subscription"
    __table_args__ = (sa.Index("ix_subscription_user_active", "user_id", "is_active"),)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_active = Column(Boolean, nullable=False, default=True)
    date_created = Column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sa.func.now())
    expiry_date = Column(DateTime(timezone=True), nullable=False)
    user = relationship(
        "User",
        back_populates="subscription_status",
        passive_deletes=True,
        uselist=False,
    )


class PurchaseOrder(Base):
    __tablename__ = "purchase_order"
    __table_args__ = (sa.Index("ix_purchase_order_user_status", "user_id", "status"),)
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount = Column(Numeric(10, 2), nullable=False)
    payment_url = Column(String(255), nullable=True)
    token = Column(String(128), unique=True, nullable=True, index=True)
    token_ts = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="pending", nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sa.func.now())
    tbk_metadata = Column(JSONB, nullable=True)
    user = relationship("User", back_populates="purchase_orders")

    def is_token_expired(self, ttl_minutes: int = 30) -> bool:
        if not self.token_ts:
            return True
        expiry_time = self.token_ts + timedelta(minutes=ttl_minutes)
        return datetime.now(timezone.utc) > expiry_time

    def can_update_payment(self, days_valid: int = 7) -> bool:
        if not self.token_ts:
            return False
        return datetime.now(timezone.utc) <= self.token_ts + timedelta(days=days_valid)

    def mark_expired_if_needed(self):
        if self.status == "pending" and self.is_token_expired():
            self.status = "expired"

    def update_status(self, token: str, as_get: bool = False):
        from app.api.services.tbk import get_status, update_status

        if self.paid:
            return self.tbk_metadata

        result = get_status(token) if as_get else update_status(token)
        if not result:
            return None

        if token:
            self.token = token

        if result.get('response_code') == 0 and result.get('status') == 'AUTHORIZED':
            self.tbk_metadata = result
            self.paid = True
            self.save()

        else:
            self.tbk_metadata = result
            self.save()

        return result
