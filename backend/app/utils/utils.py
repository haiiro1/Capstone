from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.models import User, UserWeatherPrefs, Subscription, PurchaseOrder
from app.api.routers.auth import get_current_user, get_db

import httpx

DEFAULTS = {
    "frost": 1,
    "heat": 32,
    "rain": 2,
    "wind": 40,
}
SUBSCRIPTION_DURATION_DAYS = 30


def activate_subscription(
    user_id: int,
    purchase_order: PurchaseOrder,
    db: Session = Depends(get_db)
):
    subscription = (
        db.execute(select(Subscription).where(Subscription.user_id == user_id))
        .scalars()
        .first()
    )
    now = datetime.now(timezone.utc)
    new_expiry = now + timedelta(days=SUBSCRIPTION_DURATION_DAYS)

    if subscription:
        if subscription.is_active and subscription.expiry_date > now:
            subscription.expiry_date += timedelta(days=SUBSCRIPTION_DURATION_DAYS)
        else:
            subscription.expiry_date = new_expiry
            subscription.is_active = True
        subscription.updated_at = now
    else:
        subscription = Subscription(
            user_id=user_id,
            is_active=True,
            expiry_date=new_expiry,
            date_created=now,
        )
        db.add(subscription)
    purchase_order.status = "paid"
    purchase_order.tbk_metadata = purchase_order.tbk_metadata or {}

    db.commit()
    db.refresh(subscription)

    return subscription


async def fetch_json(url: str, params: dict):
    '''
    Method to simplify the fetch of weather data from the Openweathermap API.
    '''
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            return {"error": f"Failed to fetch weather data: {response.text}"}
        return response.json()


def resolve_thresholds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    '''Returns user weather preferences or in case they're null, returns default.'''
    prefs = db.query(UserWeatherPrefs).filter_by(user_id=current_user.id).one_or_none()

    return {
        "FROST": (
            prefs.dangerous_frost_threshold
            if prefs and prefs.dangerous_frost_threshold is not None
            else DEFAULTS["frost"]
        ),
        "HEAT": (
            prefs.dangerous_temp_threshold
            if prefs and prefs.dangerous_temp_threshold is not None
            else DEFAULTS["heat"]
        ),
        "RAIN": (
            prefs.rain_mm_threshold
            if prefs and prefs.rain_mm_threshold is not None
            else DEFAULTS["rain"]
        ),
        "WIND": (
            prefs.wind_kph_threshold
            if prefs and prefs.wind_kph_threshold is not None
            else DEFAULTS["wind"]
        ),
    }
