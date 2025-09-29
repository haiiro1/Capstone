from fastapi import APIRouter, HTTPException

# Importando la función del servicio de clima~
from app.api.services.weather_service import (
    get_current_weather,
    get_forecast,
    get_alerts,
)

router = APIRouter()


@router.get("/alerts/weather/now")
async def read_current_weather(lat: float, lon: float):
    weather_data = await get_current_weather(lat, lon)

    if "error" in weather_data:
        raise HTTPException(status_code=500, detail=weather_data["error"])

    return weather_data


@router.get("/alerts/weather/forecast")
async def read_forecast(lat: float, lon: float):
    forecast = await get_forecast(lat, lon, for_alerts=False)

    if "error" in forecast:
        raise HTTPException(status_code=400, detail=forecast["error"])

    return forecast


@router.get("/alerts/weather/events")
async def read_alerts(lat: float, lon: float):
    alerts = await get_alerts(lat, lon)

    if "error" in alerts:
        return []

    return alerts
