from fastapi import APIRouter
from app.api.routers import weather

router = APIRouter()

@router.get("/ping")
def ping():
    return {"pong": True}

router.include_router(weather.router, tags=["Weather"])
