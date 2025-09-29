import httpx
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from collections import defaultdict, Counter
from datetime import datetime, date, timedelta

from app.utils.utils import get_weather

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
OPENWEATHER_URL = os.getenv("OPENWEATHER_URL")
OPENWEATHER_URL_FORECAST = os.getenv("OPENWEATHER_URL_FORECAST")

# We use these placeholder alert rules for now, as they will eventually be obtained from,
# the user_weather_prefs table, instead of setting them like they are at the time.
FROST_THRESHOLD_C = 1
HEATWAVE_THRESHOLD_C = 32
RAIN_MM_THRESHOLD = 2
WIND_KPH_THRESHOLD = 40


async def get_current_weather(lat: float, lon: float):
    if not OPENWEATHER_API_KEY:
        # Control de seguridad
        return {"error": "Weather API key not configured"}

    # Parámetros que le enviaremos a la API de OpenWeatherMap
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",  # Para que la temperatura venga en Celsius
        "lang": "es",  # Para que la descripción venga en español
    }

    # Hacemos la llamada a la API externa
    async with httpx.AsyncClient() as client:
        response = await client.get(OPENWEATHER_URL, params=params)

    if response.status_code != 200:
        # Si algo salió mal en la llamada externa
        return {"error": "Failed to fetch weather data"}

    data = response.json()

    # Procesamos la respuesta
    processed_data = {
        "temp": data["main"]["temp"],
        "condition": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"] * 3.6,  # Convertir de m/s a km/h
    }

    return processed_data


async def get_forecast(lat: float, lon: float, for_alerts: bool = True):
    grouped = defaultdict(list)
    forecast = []
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "es",
    }

    if not OPENWEATHER_API_KEY:
        return {"error": "Weather API key not configured"}

    data = await get_weather(OPENWEATHER_URL_FORECAST, params)

    if "list" not in data:
        return {"error": "Unexpected response format", "raw": data}

    # Since we need to display the forecast, we have to parse 'dt' from the API as well,
    # Problem is, it's useless for display if raw, so we convert it into standard time.
    for entry in data["list"]:
        day = datetime.utcfromtimestamp(entry["dt"]).date()
        grouped[day].append(entry)

    # We set the fetched forecast data so we only display the min-max temperature data for an entire day.
    # This is not something the API provides, so we have to manually set the max-min temperature,
    # and get the appropiate icon, condition and description of the day.
    for day, entries in sorted(grouped.items())[:5]:
        temps = [e["main"]["temp"] for e in entries]
        conditions = [e["weather"][0]["main"] for e in entries]
        icons = [e["weather"][0]["icon"] for e in entries]
        descriptions = [e["weather"][0]["description"] for e in entries]
        day = {
            "date": day.isoformat(),
            "min_temp": round(min(temps)),
            "max_temp": round(max(temps)),
            "condition": Counter(conditions).most_common(1)[0][0],
            "description": Counter(descriptions).most_common(1)[0][0],
            "icon": Counter(icons).most_common(1)[0][0],
            # necessary to avoid getting entries into the /forecast, that way only get_alerts get this item.
            **({"entries": entries} if for_alerts else {}),
        }
        forecast.append(day)

    return forecast


async def get_alerts(lat: float, lon: float):
    forecast = await get_forecast(lat, lon, for_alerts=True)
    today = date.today()
    events = []

    for f in forecast:
        entries = f.get("entries", [])
        alerts = []
        day = datetime.fromisoformat(f["date"]).date()

        if f["min_temp"] <= FROST_THRESHOLD_C:
            alerts.append("Helada")

        if f["max_temp"] >= HEATWAVE_THRESHOLD_C:
            alerts.append("Ola de calor")

        if any("rain" in e and e["rain"].get("3h", 0) >= RAIN_MM_THRESHOLD for e in entries):
            alerts.append("Posibilidad de lluvias intensas")

        if any(e["wind"]["speed"] * 3.6 >= WIND_KPH_THRESHOLD for e in entries):
            alerts.append("Vientos de alta intensidad")

        if alerts:
            events.append({"date": f["date"], "alerts": alerts})
    if not events:
        return []

    return events
