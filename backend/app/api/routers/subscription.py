from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.schemas.payment import SubscriptionStatusResponse
from app.db.models import User, Subscription
from app.api.routers.auth import get_current_user, get_db

router = APIRouter(prefix="/subscription", tags=["subscription"])


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = (
        db.execute(select(Subscription).where(Subscription.user_id == user.id))
        .scalars()
        .first()
    )

    response = {"plan_name": "Free", "is_active": False, "expiry_date": None}

    if sub and sub.is_active:
        response["plan_name"] = "PlantGuard Premium"
        response["is_active"] = True
        if sub.expiry_date:
            response["expiry_date"] = sub.expiry_date.strftime("%Y-%m-%d")

    return response
