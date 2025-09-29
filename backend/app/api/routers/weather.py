from fastapi import APIRouter, HTTPException

# Importando la función del servicio de clima~
from app.api.services.weather_service import get_current_weather

router = APIRouter()

@router.get("/alerts/weather/now")
async def read_current_weather(lat: float, lon: float):
    weather_data = await get_current_weather(lat, lon)
    if "error" in weather_data:
        raise HTTPException(status_code=500, detail=weather_data["error"])
    return weather_data