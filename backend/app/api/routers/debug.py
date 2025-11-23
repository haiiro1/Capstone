from fastapi import APIRouter

from app.tasks.cron import check_expired_subscriptions


router = APIRouter(prefix="/debug", tags=["payment"])


@router.post("/trigger-expiry-check")
async def trigger_expiry_check_manual():
    """
    DEV: Checks if any subscription is expired and sets it's 'is_active' field to False.
    """
    print("--- MANUAL TRIGGER: Starting expired_sub check ---")
    await check_expired_subscriptions()
    return {"message": "Job executed."}
