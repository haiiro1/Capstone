from fastapi import APIRouter, HTTPException, Query

# Importando la función del servicio de clima~
from app.api.services.weather_service import (
    get_current_weather,
    get_forecast,
    get_alerts,
    get_lat_lon,
)

router = APIRouter()


@router.get("/alerts/weather/now")
async def read_current_weather(
    address: str = Query(..., description="Full address or location name")
):
    # get_lat_lon will give us the lat/lot data based off the address the user inputs in front
    # which then is passed to the geolocation api, which returns lat/lot, compleating the cycle.
    coords = await get_lat_lon(address)
    if "error" in coords:
        raise HTTPException(status_code=400, detail=coords["error"])

    lat, lon = coords["lat"], coords["lon"]
    weather_data = await get_current_weather(lat, lon)

    if "error" in weather_data:
        raise HTTPException(status_code=400, detail=weather_data["error"])

    resolved_address = {
        "city": coords.get("city", "unknown_city"),
        "country": coords.get("country", "unknown_country"),
    }

    return {"address": resolved_address, "weather": weather_data}


@router.get("/alerts/weather/forecast")
async def read_forecast(
    address: str = Query(..., description="Full address or location name")
):
    coords = await get_lat_lon(address)
    if "error" in coords:
        raise HTTPException(status_code=400, detail=coords["error"])

    lat, lon = coords["lat"], coords["lon"]
    forecast = await get_forecast(lat, lon, for_alerts=False)

    if "error" in forecast:
        raise HTTPException(status_code=400, detail=forecast["error"])

    return forecast


@router.get("/alerts/weather/events")
async def read_alerts(
    address: str = Query(..., description="Full address or location name")
):
    coords = await get_lat_lon(address)
    if "error" in coords:
        raise HTTPException(status_code=400, detail=coords["error"])

    lat, lon = coords["lat"], coords["lon"]
    alerts = await get_alerts(lat, lon)

    if "error" in alerts:
        return []

    return alerts
