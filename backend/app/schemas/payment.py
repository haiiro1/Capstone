from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from typing import Optional, Any


class PurchaseInitResponse(BaseModel):
    payment_url: str
    token: str


class PurchaseCreateResponse(BaseModel):
    id: int
    user_id: UUID
    amount: Decimal
    payment_url: str
    token: str
    token_ts: datetime
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    tbk_metadata: Optional[dict[str, Any]] = None


class SubscriptionStatusResponse(BaseModel):
    plan_name: str
    is_active: bool
    expiry_date: Optional[str] = None
